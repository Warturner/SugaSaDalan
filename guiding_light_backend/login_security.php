<?php
/**
 * Login-security helpers. This file is only included by login.php.
 *
 * Policy: 5 failures against a username OR 20 failures from an IP within
 * a rolling 15-minute window. The 5th/20th failure starts a temporary block.
 * Both checks and writes are serialized with short MariaDB named locks.
 *
 * Privacy: IP addresses are NEVER saved or returned, only SHA-256 fingerprints.
 * Those fingerprints are pseudonymous, NOT anonymous; treat the table as sensitive.
 */

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_ACCOUNT_FAILURE_LIMIT = 5;
const LOGIN_IP_FAILURE_LIMIT = 20;

function loginSecurityUsernameHash(string $username): string
{
    return hash('sha256', mb_strtolower(trim($username), 'UTF-8'));
}

function loginSecurityKeys(string $username): array
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if ($ip === '') {
        // Do not silently place every unknown client into one shared bucket.
        throw new RuntimeException('Remote address unavailable.');
    }
    return [loginSecurityUsernameHash($username), hash('sha256', $ip)];
}

/**
 * Acquire both locks in deterministic lexical order to prevent deadlocks.
 * Names fit the MariaDB/MySQL 64-character limit.
 * Named locks are released in login.php's finally block.
 */
function acquireLoginLocks(PDO $conn, string $usernameHash, string $ipHash): array
{
    $names = [
        'gl_sec_ip_' . substr($ipHash, 0, 52),
        'gl_sec_user_' . substr($usernameHash, 0, 50)
    ];
    sort($names, SORT_STRING);
    $held = [];
    $stmt = $conn->prepare('SELECT GET_LOCK(:lock_name, 3)');

    try {
        foreach ($names as $name) {
            $stmt->execute([':lock_name' => $name]);
            if ((int) $stmt->fetchColumn() !== 1) {
                throw new RuntimeException('Could not acquire login security lock.');
            }
            $held[] = $name;
        }
        return $held;
    } catch (Throwable $e) {
        releaseLoginLocks($conn, $held);
        throw $e;
    }
}

function releaseLoginLocks(PDO $conn, array $names): void
{
    try {
        $stmt = $conn->prepare('SELECT RELEASE_LOCK(:lock_name)');
        foreach (array_reverse($names) as $name) {
            $stmt->execute([':lock_name' => $name]);
        }
    } catch (Throwable $e) {
        error_log('Could not release login security lock.');
    }
}

function recentLoginFailures(PDO $conn, string $column, string $hash): int
{
    if (!in_array($column, ['username_hash', 'ip_hash'], true)) {
        throw new InvalidArgumentException('Unsupported login counter.');
    }
    // Column name is from a hardcoded allowlist, not user input.
    $sql = "SELECT COUNT(*) FROM login_security_events
            WHERE {$column} = :hash AND event_type = 'login_failed'
              AND occurred_at >= (NOW() - INTERVAL 15 MINUTE)";
    $params = [':hash' => $hash];
    if ($column === 'username_hash') {
        // An admin unlock begins a new account-failure counting period.
        // Old login events remain intact for audit/history. IP failures are NOT reset.
        $sql .= " AND event_id > COALESCE((
            SELECT MAX(event_id) FROM login_security_events
            WHERE username_hash = :unlock_hash AND event_type = 'admin_unlocked'
        ), 0)";
        $params[':unlock_hash'] = $hash;
    }
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    return (int) $stmt->fetchColumn();
}

/**
 * Active USERNAME restriction details and its real rolling-window countdown.
 * If N >= 5, access becomes available when the (N-4)th oldest active failure
 * expires. Database NOW() is used so browser/server clock skew has no effect.
 */
function getActiveUsernameRestriction(PDO $conn, string $usernameHash): ?array
{
    $stmt = $conn->prepare(
        "SELECT TIMESTAMPDIFF(SECOND, NOW(),
                    DATE_ADD(occurred_at, INTERVAL 15 MINUTE)) AS remaining_seconds
           FROM login_security_events
          WHERE username_hash = :hash AND event_type = 'login_failed'
            AND occurred_at >= (NOW() - INTERVAL 15 MINUTE)
            AND event_id > COALESCE((
                SELECT MAX(event_id) FROM login_security_events
                WHERE username_hash = :unlock_hash AND event_type = 'admin_unlocked'
            ), 0)
          ORDER BY occurred_at ASC, event_id ASC"
    );
    $stmt->execute([':hash' => $usernameHash, ':unlock_hash' => $usernameHash]);
    $seconds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $count = count($seconds);
    if ($count < LOGIN_ACCOUNT_FAILURE_LIMIT) {
        return null;
    }
    return [
        'failed_attempts' => $count,
        'remaining_seconds' => max(1, (int) $seconds[$count - LOGIN_ACCOUNT_FAILURE_LIMIT])
    ];
}

/** Use the SAME username named lock as normal login, preventing unlock/login races. */
function acquireUsernameLoginLock(PDO $conn, string $usernameHash): array
{
    $name = 'gl_sec_user_' . substr($usernameHash, 0, 50);
    $stmt = $conn->prepare('SELECT GET_LOCK(:lock_name, 3)');
    $stmt->execute([':lock_name' => $name]);
    if ((int) $stmt->fetchColumn() !== 1) {
        throw new RuntimeException('Could not acquire account security lock.');
    }
    return [$name];
}

function recordLoginSecurityEvent(
    PDO $conn,
    ?int $userId,
    string $username,
    string $usernameHash,
    string $ipHash,
    string $type,
    string $details = '',
    ?string $adminActor = null
): void {
    if (!in_array($type, ['login_failed', 'login_success', 'login_restricted', 'admin_unlocked'], true)) {
        throw new InvalidArgumentException('Invalid security event type.');
    }
    $stmt = $conn->prepare(
        'INSERT INTO login_security_events
          (user_id, attempted_username, username_hash, ip_hash, event_type, details, admin_actor)
         VALUES (:user_id, :username, :username_hash, :ip_hash, :event_type, :details, :admin_actor)'
    );
    $stmt->bindValue(':user_id', $userId, $userId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindValue(':username', $username, PDO::PARAM_STR);
    $stmt->bindValue(':username_hash', $usernameHash, PDO::PARAM_STR);
    $stmt->bindValue(':ip_hash', $ipHash, PDO::PARAM_STR);
    $stmt->bindValue(':event_type', $type, PDO::PARAM_STR);
    $stmt->bindValue(':details', $details, PDO::PARAM_STR);
    $stmt->bindValue(':admin_actor', $adminActor, $adminActor === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->execute();
}

function refuseRateLimitedLogin(): void
{
    http_response_code(429);
    header('Retry-After: 900');
    echo json_encode([
        'success' => false,
        'error' => 'Too many login attempts. Please try again later.',
        'reason' => 'login_rate_limited'
    ]);
}
