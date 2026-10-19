<?php
/** Early release of ONE username-based restriction, Admin only, fully audited. */
require 'db_connect.php';
require 'auth.php';
require_once __DIR__ . '/login_security.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}
$admin = requireAdmin();
$heldLocks = [];
try {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || strlen($raw) > 2048) {
        throw new InvalidArgumentException('Invalid unlock request.');
    }
    $input = json_decode($raw, true);
    if (!is_array($input) || !isset($input['user_id'], $input['reason']) ||
        !is_int($input['user_id']) || !is_string($input['reason'])) {
        throw new InvalidArgumentException('Invalid unlock request.');
    }
    $userId = $input['user_id'];
    $reason = trim($input['reason']);
    if ($userId <= 0 || mb_strlen($reason, 'UTF-8') < 5 || mb_strlen($reason, 'UTF-8') > 100) {
        throw new InvalidArgumentException('Provide a 5–100 character unlock reason.');
    }

    $stmt = $conn->prepare('SELECT user_id, username FROM users WHERE user_id = :user_id LIMIT 1');
    $stmt->execute([':user_id' => $userId]);
    $target = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$target) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Account not found.']);
        exit;
    }
    $usernameHash = loginSecurityUsernameHash($target['username']);
    $heldLocks = acquireUsernameLoginLock($conn, $usernameHash);
    if (getActiveUsernameRestriction($conn, $usernameHash) === null) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'Restriction has already expired or been lifted.']);
        return;
    }
    // The Admin's IP hash is for audit provenance only and is NOT counted as a failure.
    $remoteIp = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if ($remoteIp === '') {
        throw new RuntimeException('Remote address unavailable.');
    }
    $conn->beginTransaction();
    recordLoginSecurityEvent(
        $conn, $userId, $target['username'], $usernameHash, hash('sha256', $remoteIp),
        'admin_unlocked', $reason, $admin['username']
    );
    $conn->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Username restriction lifted. The network/IP limit remains in effect.',
        'username' => $target['username']
    ], JSON_INVALID_UTF8_SUBSTITUTE);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    if ($conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    error_log('Unable to unlock account login restriction.');
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Unlock temporarily unavailable.']);
} finally {
    if ($conn instanceof PDO && $heldLocks) releaseLoginLocks($conn, $heldLocks);
}
