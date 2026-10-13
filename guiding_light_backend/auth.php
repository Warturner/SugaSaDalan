<?php

require_once __DIR__ . '/db_connect.php';

ini_set('session.cookie_lifetime', '0');
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');

    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', '1');
    }

    session_start();
}

const AUTH_IDLE_TIMEOUT = 3 * 60;
const AUTH_ABSOLUTE_TIMEOUT = 8 * 60 * 60;

/**
 * Browser-level request origin guard for authenticated write requests.
 * No frontend changes are required for existing browser fetch() POST calls.
 * This supplements (but does not replace) session authentication and RBAC.
 * Allowed cross-origin frontend origins are defined in cors.php.
 */
function requireTrustedWriteOrigin(): void
{
    global $allowedOrigins;

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        return;
    }

    $trusted = is_array($allowedOrigins ?? null) ? $allowedOrigins : [];

    // Also accept the exact same origin used to reach this PHP backend.
    // Validate the Host header's shape before constructing that origin.
    $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
    if ($host !== '' && preg_match('/^[a-z0-9.\-:\[\]]+$/i', $host)) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            ? 'https://'
            : 'http://';
        $trusted[] = $scheme . $host;
    }

    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));

    // Some privacy-aware browsers omit Origin but provide Referer.
    if ($origin === '') {
        $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
        if ($referer !== '') {
            $parts = parse_url($referer);
            if (is_array($parts) &&
                isset($parts['scheme'], $parts['host']) &&
                in_array($parts['scheme'], ['http', 'https'], true)) {
                $origin = $parts['scheme'] . '://' . $parts['host'];
                if (isset($parts['port'])) {
                    $origin .= ':' . $parts['port'];
                }
            }
        }
    }

    if ($origin === '' || !in_array($origin, $trusted, true)) {
        http_response_code(403);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'error' => 'Request origin is not permitted.'
        ]);
        exit;
    }
}

/** Revoke only the currently authorized token, never a newer login. */
function revokeOwnActiveSession(): void
{
    global $conn;

    if (!($conn instanceof PDO)) {
        return;
    }

    $userId = (int) ($_SESSION['user_id'] ?? 0);
    $token = $_SESSION['auth_token'] ?? null;

    if ($userId <= 0 || !is_string($token) || $token === '') {
        return;
    }

    try {
        $stmt = $conn->prepare(
            'UPDATE users
             SET active_session_hash = NULL
             WHERE user_id = :user_id
               AND active_session_hash = :active_hash'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':active_hash' => hash('sha256', $token)
        ]);
    } catch (PDOException $e) {
        error_log('Could not clear active session token.');
    }
}

/** Destroy this browser's session; optionally revoke its DB token. */
function destroyAuthSession(bool $revokeActive = false): void
{
    if ($revokeActive) {
        revokeOwnActiveSession();
    }

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        if (PHP_VERSION_ID >= 70300) {
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax'
            ]);
        } else {
            // Compatible with older PHP 7.2 hosting.
            setcookie(
                session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
    }

    session_destroy();
}

/** Validate timeouts, account status, roles, and single-device token. */
function getCurrentUser(bool $refreshActivity = true): ?array
{
    global $conn;

    $userId = (int) ($_SESSION['user_id'] ?? 0);
    $token = $_SESSION['auth_token'] ?? null;

    if ($userId <= 0) {
        return null;
    }

    if (!is_string($token) || $token === '') {
        $GLOBALS['auth_failure_reason'] = 'session_expired';
        destroyAuthSession();
        return null;
    }

    $now = time();
    $loggedInAt = (int) ($_SESSION['logged_in_at'] ?? 0);
    $lastActivity = (int) ($_SESSION['last_activity'] ?? $loggedInAt);

    if ($loggedInAt <= 0 || $lastActivity <= 0 ||
        ($now - $lastActivity) > AUTH_IDLE_TIMEOUT ||
        ($now - $loggedInAt) > AUTH_ABSOLUTE_TIMEOUT) {
        $GLOBALS['auth_failure_reason'] = 'session_expired';
        destroyAuthSession(true);
        return null;
    }

    try {
        $stmt = $conn->prepare(
            'SELECT username, role, active_session_hash
             FROM users
             WHERE user_id = :user_id
             LIMIT 1'
        );
        $stmt->execute([':user_id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        http_response_code(503);
        echo json_encode([
            'success' => false,
            'error' => 'Authentication service is temporarily unavailable.'
        ]);
        exit;
    }

    if (!$user) {
        $GLOBALS['auth_failure_reason'] = 'account_deleted';
        destroyAuthSession();
        return null;
    }

    $storedHash = (string) ($user['active_session_hash'] ?? '');
    $presentedHash = hash('sha256', $token);

    if ($storedHash === '' || !hash_equals($storedHash, $presentedHash)) {
        $GLOBALS['auth_failure_reason'] = 'session_replaced';
        destroyAuthSession();
        return null;
    }

    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];

    if ($refreshActivity) {
        $_SESSION['last_activity'] = $now;
    }

    unset($GLOBALS['auth_failure_reason']);

    return [
        'id' => $userId,
        'username' => $user['username'],
        'role' => $user['role']
    ];
}

function requireAuth(): array
{
    $user = getCurrentUser();

    if (!$user) {
        $reason = $GLOBALS['auth_failure_reason'] ?? 'authentication_required';
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'reason' => $reason,
            'error' => $reason === 'session_replaced'
                ? 'Your account was signed in on another device.'
                : 'Authentication required. Please sign in again.'
        ]);
        exit;
    }

    // All existing protected POST endpoints call requireAuth/Role/Admin.
    requireTrustedWriteOrigin();
    return $user;
}

function requireAdmin(): array
{
    $user = requireAuth();

    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Administrator privileges required.'
        ]);
        exit;
    }

    return $user;
}

function requireRole(array $allowedRoles): array
{
    $user = requireAuth();

    if (!in_array($user['role'], $allowedRoles, true)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'You do not have permission to perform this action.'
        ]);
        exit;
    }

    return $user;
}
