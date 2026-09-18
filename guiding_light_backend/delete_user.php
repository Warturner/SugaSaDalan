<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireAdmin();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$targetUserId = (int) ($data['user_id'] ?? 0);

if ($targetUserId === $currentUser['id']) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'You cannot delete your own active account.'
    ]);

    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

try {
    $data = json_decode(file_get_contents("php://input"));
    $user_id = $data->user_id ?? null;

    if (!$user_id) {
        echo json_encode(['success' => false, 'error' => 'User ID is required.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $user_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>