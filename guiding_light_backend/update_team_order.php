<?php
require 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

$data = json_decode(file_get_contents("php://input"), true);

try {
    $conn->beginTransaction();
    $stmt = $conn->prepare("UPDATE team_members SET display_order = ? WHERE id = ?");
    
    foreach ($data as $item) {
        $stmt->execute([$item['display_order'], $item['id']]);
    }
    
    $conn->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>