<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $post_id = $_POST['post_id'] ?? null;
    
    // Fallback if data is sent as raw JSON
    if (!$post_id) {
        $data = json_decode(file_get_contents("php://input"));
        $post_id = $data->post_id ?? null;
    }

    if (!$post_id) {
        echo json_encode(['error' => 'Post ID is required for deletion.']);
        exit;
    }

    // Step 1: Fetch the image path
    $stmt = $conn->prepare("SELECT image_path FROM stories WHERE post_id = :post_id");
    $stmt->execute([':post_id' => $post_id]);
    $story = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($story && !empty($story['image_path'])) {
        $filename = basename($story['image_path']);
        // Targets guiding_light_backend/uploads/stories/
        $filepath = __DIR__ . "/uploads/stories/" . $filename; 
        
        if (file_exists($filepath)) {
            unlink($filepath); 
        }
    }

    // Step 2: Delete the record from the database. 
    $sql = "DELETE FROM stories WHERE post_id = :post_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':post_id' => $post_id]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>