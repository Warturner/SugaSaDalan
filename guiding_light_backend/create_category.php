<?php
require 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name'] ?? '');

if (!$name) {
    echo json_encode(['error' => 'Category name is required.']);
    exit;
}

try {
    // Changed $pdo to $conn
    $check = $conn->prepare("SELECT id FROM story_categories WHERE name = ?");
    $check->execute([$name]);
    if ($check->rowCount() > 0) {
        echo json_encode(['error' => 'Category already exists.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO story_categories (name) VALUES (?)");
    $stmt->execute([$name]);
    
    echo json_encode(['success' => true, 'id' => $conn->lastInsertId(), 'name' => $name]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>