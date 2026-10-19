<?php
require 'db_connect.php';
require 'auth.php';
require_once 'account_activity.php';

header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Checks the logged-in session, current role, and trusted POST origin.
$currentUser = requireAdmin();

try {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || strlen($raw) > 2048) {
        throw new InvalidArgumentException('Invalid delete request.');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new InvalidArgumentException('Invalid delete request.');
    }

    $userId = filter_var($data['user_id'] ?? null, FILTER_VALIDATE_INT);
    $adminPassword = $data['admin_password'] ?? null;
    if (!$userId || $userId <= 0) {
        throw new InvalidArgumentException('User ID is required.');
    }
    if (!is_string($adminPassword) || $adminPassword === '' || strlen($adminPassword) > 256) {
        throw new InvalidArgumentException('Your admin password is required.');
    }
    if ($userId === (int) $currentUser['id']) {
        throw new InvalidArgumentException('You cannot delete your own active account.');
    }

    // Verify the PASSWORD of the logged-in admin, NOT the account being deleted
    // and NOT any admin ID provided by the client. Same approach as edit_user.php.
    $adminStmt = $conn->prepare(
        'SELECT password_hash FROM users WHERE user_id = :id AND role = :role LIMIT 1'
    );
    $adminStmt->execute([':id' => (int) $currentUser['id'], ':role' => 'admin']);
    $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);
    if (!$admin || !password_verify($adminPassword, $admin['password_hash'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Authorization denied: incorrect admin password.'
        ]);
        exit;
    }

    // Preserve existing atomic audit + delete behavior.
    $conn->beginTransaction();
    $targetStmt = $conn->prepare(
        'SELECT username, role FROM users WHERE user_id = :id LIMIT 1 FOR UPDATE'
    );
    $targetStmt->execute([':id' => $userId]);
    $target = $targetStmt->fetch(PDO::FETCH_ASSOC);

    if (!$target) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User account not found.']);
        exit;
    }

    // Target FK becomes NULL on deletion; snapshot username remains in audit history.
    // No plaintext password, hash, or password metadata is written to the log.
    recordAccountActivity(
        $conn, (int) $currentUser['id'], $currentUser['username'],
        $userId, $target['username'], 'account_deleted',
        'Deleted ' . $target['role'] . ' account.'
    );

    $deleteStmt = $conn->prepare('DELETE FROM users WHERE user_id = :id');
    $deleteStmt->execute([':id' => $userId]);
    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
} catch (InvalidArgumentException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    error_log('Unable to complete account deletion.');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to delete user.']);
}
