<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireRole(['admin', 'media']);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

try {
    // Look up the file path first so we can physically delete the PDF from the server
    $stmt = $conn->prepare("SELECT file_path FROM story_attachments WHERE id = ?");
    $stmt->execute([$id]);
    $att = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($att) {
        if (file_exists($att['file_path'])) {
            unlink($att['file_path']); // Permanently delete the file
        }
        
        $del = $conn->prepare("DELETE FROM story_attachments WHERE id = ?");
        $del->execute([$id]);
    }
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>