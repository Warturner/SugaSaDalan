<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireAdmin();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$targetUserId = (int) ($data['user_id'] ?? 0);

<?php

require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

$currentUser = requireAdmin();

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

    // Prevent administrator from deleting their own account
    if ($userId === $currentUser['id']) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'You cannot delete your own active account.'
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
        'success' => true
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to delete user.'
    ]);
}