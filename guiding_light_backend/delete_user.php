<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

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