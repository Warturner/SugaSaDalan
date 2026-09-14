<?php
require 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Changed $pdo to $conn
    $stmt = $conn->query("SELECT id, name FROM story_categories ORDER BY name ASC");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($categories);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>