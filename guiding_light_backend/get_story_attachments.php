<?php
require 'db_connect.php';

header("Content-Type: application/json; charset=UTF-8");

$post_id = isset($_GET['post_id']) ? (int)$_GET['post_id'] : 0;

try {
    $stmt = $conn->prepare("SELECT * FROM story_attachments WHERE post_id = ? ORDER BY uploaded_at ASC");
    $stmt->execute([$post_id]);
    $attachments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $base_url = "/guiding_light_backend/";
    
    // Attach the full public URL so React can create download links
    foreach ($attachments as &$att) {
        $att['file_url'] = $base_url . $att['file_path'];
    }
    
    echo json_encode($attachments);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>