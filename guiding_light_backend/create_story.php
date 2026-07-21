<?php
require 'db_connect.php';

// Set headers for CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $title = $_POST['title'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $content = $_POST['content'] ?? '';
    $author_id = $_POST['author_id'] ?? 1; // Defaulting to 1 (admin) for now

    if (empty($title) || empty($content)) {
        echo json_encode(['error' => 'Title and content are required.']);
        exit;
    }

    $image_path = null;

    // Handle Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/stories/';
        
        // Create the folder if it doesn't exist yet
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid('story_') . '.' . $file_extension;
        $target_file = $upload_dir . $new_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $image_path = $target_file;
        }
    }

    // Insert into database
    $sql = "INSERT INTO stories (title, excerpt, content, author_id, image_path) 
            VALUES (:title, :excerpt, :content, :author_id, :image_path)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':title' => $title,
        ':excerpt' => $excerpt,
        ':content' => $content,
        ':author_id' => $author_id,
        ':image_path' => $image_path
    ]);

    echo json_encode(['success' => true, 'post_id' => $conn->lastInsertId()]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>