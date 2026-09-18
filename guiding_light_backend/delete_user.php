<?php

require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

$currentUser = requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

try {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $userId = (int) ($data['user_id'] ?? 0);

    if (!$userId) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'User ID is required.'
        ]);

        exit;
    }

    // Prevent deleting your own logged-in account
    if ($userId === $currentUser['id']) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'You cannot delete your own active account.'
        ]);

        exit;
    }

    // Make sure target account exists
    $checkStmt = $conn->prepare("
        SELECT user_id
        FROM users
        WHERE user_id = :id
        LIMIT 1
    ");

    $checkStmt->execute([
        ':id' => $userId
    ]);

    if (!$checkStmt->fetch()) {

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' => 'User account not found.'
        ]);

        exit;
    }

    $stmt = $conn->prepare("
        DELETE FROM users
        WHERE user_id = :id
    ");

    $stmt->execute([
        ':id' => $userId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'User deleted successfully.'
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to delete user.'
    ]);
}