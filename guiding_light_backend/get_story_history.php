<?php
require 'db_connect.php';

// Set headers for CORS and content type
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$postId = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;

if ($postId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'A valid post ID is required.']);
    exit;
}

try {
    $sql = "SELECT h.edit_timestamp, u.username, h.changes_made
            FROM story_edit_history h
            JOIN users u ON h.user_id = u.user_id
            WHERE h.post_id = :post_id
            ORDER BY h.edit_timestamp DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute(['post_id' => $postId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}