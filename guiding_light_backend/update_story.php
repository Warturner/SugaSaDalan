<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $post_id = $_POST['post_id'] ?? null;
    $title = $_POST['title'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $content = $_POST['content'] ?? '';
    $author_id = $_POST['author_id'] ?? 1;
    $remove_image = $_POST['remove_image'] ?? 'false';

    if (!$post_id || empty($title) || empty($content)) {
        echo json_encode(['error' => 'Post ID, title, and content are required.']);
        exit;
    }

    // Fetch current image path to handle deletions
    $stmt = $conn->prepare("SELECT image_path FROM stories WHERE post_id = :post_id");
    $stmt->execute([':post_id' => $post_id]);
    $current_story = $stmt->fetch(PDO::FETCH_ASSOC);
    $image_path = $current_story['image_path'];

    $image_updated = false;

    // Handle Image Removal or Replacement
    if ($remove_image === 'true') {
        if ($image_path && file_exists($image_path)) {
            unlink($image_path); // Delete old file from server
        }
        $image_path = null;
        $image_updated = true;
    } elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/stories/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid('story_') . '.' . $file_extension;
        $target_file = $upload_dir . $new_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            if ($image_path && file_exists($image_path)) {
                unlink($image_path); // Delete old file before saving new one
            }
            $image_path = $target_file;
            $image_updated = true;
        }
    }

    // Update the story record
    $sql = "UPDATE stories SET title = :title, excerpt = :excerpt, content = :content, image_path = :image_path WHERE post_id = :post_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':title' => $title,
        ':excerpt' => $excerpt,
        ':content' => $content,
        ':image_path' => $image_path,
        ':post_id' => $post_id
    ]);

    // Insert an audit log into story_edit_history
    $changes = "Updated story content and text.";
    if ($image_updated) {
        $changes .= " (Cover image was modified or removed).";
    }
    
    $history_sql = "INSERT INTO story_edit_history (post_id, user_id, changes_made) VALUES (:post_id, :user_id, :changes)";
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->execute([
        ':post_id' => $post_id,
        ':user_id' => $author_id,
        ':changes' => $changes
    ]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>