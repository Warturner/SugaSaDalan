<?php
require 'db_connect.php';
require 'auth.php';
require_once 'account_activity.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$currentUser = requireAdmin();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new InvalidArgumentException('Invalid request data.');
    }

    $userId = filter_var($data['user_id'] ?? null, FILTER_VALIDATE_INT);
    if (!$userId || $userId <= 0) {
        throw new InvalidArgumentException('User ID is required.');
    }

    if ($userId === (int) $currentUser['id']) {
        throw new InvalidArgumentException('You cannot delete your own active account.');
    }

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

    // Target FK becomes NULL on deletion; the snapshot name remains readable.
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
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to delete user.']);
}
