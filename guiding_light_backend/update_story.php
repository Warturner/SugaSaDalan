<?php
require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$currentUser = requireRole(['admin', 'media']);

try {
    $post_id = $_POST['post_id'] ?? null;
    $title = $_POST['title'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $content = $_POST['content'] ?? '';
    $content_type =
    $_POST['content_type'] ?? 'article';

if (
    !in_array(
        $content_type,
        ['article', 'publication'],
        true
    )
) {
    $content_type = 'article';
}
    $author_id = $currentUser['id'];
    $remove_image = $_POST['remove_image'] ?? 'false';

    $category_id = !empty($_POST['category_id']) ? $_POST['category_id'] : null;
    $is_pinned = ($_POST['is_pinned'] ?? 'false') === 'true' ? 1 : 0;
    $pin_until = !empty($_POST['pin_until']) ? $_POST['pin_until'] : null;

    if (!$post_id || empty($title) || empty($content)) {
        echo json_encode(['error' => 'Post ID, title, and content are required.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT image_path FROM stories WHERE post_id = :post_id");
    $stmt->execute([':post_id' => $post_id]);
    $current_story = $stmt->fetch(PDO::FETCH_ASSOC);
    $image_path = $current_story['image_path'];

    $image_updated = false;

    if ($remove_image === 'true') {
        if ($image_path && file_exists($image_path)) unlink($image_path);
        $image_path = null;
        $image_updated = true;
    } elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/stories/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid('story_') . '.' . $file_extension;
        $target_file = $upload_dir . $new_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            if ($image_path && file_exists($image_path)) unlink($image_path);
            $image_path = $target_file;
            $image_updated = true;
        }
    }

    $sql = "UPDATE stories SET 
            title = :title,
            content_type = :content_type,
            excerpt = :excerpt,
            content = :content,
            image_path = :image_path,
            category_id = :category_id,
            is_pinned = :is_pinned,
            pin_until = :pin_until
            WHERE post_id = :post_id";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':title' => $title,
        ':content_type' => $content_type,
        ':excerpt' => $excerpt,
        ':content' => $content, 
        ':image_path' => $image_path,
        ':category_id' => $category_id,
        ':is_pinned' => $is_pinned,
        ':pin_until' => $pin_until,
        ':post_id' => $post_id
    ]);

    // NEW: Handle PDF/DOCX Attachments

    if (isset($_FILES['attachments'])) {
        $att_upload_dir = 'uploads/stories/attachments/';
        if (!is_dir($att_upload_dir)) mkdir($att_upload_dir, 0777, true);

        $total_files = count($_FILES['attachments']['name']);
        for ($i = 0; $i < $total_files; $i++) {
            if ($_FILES['attachments']['error'][$i] === UPLOAD_ERR_OK) {
                $file_name = $_FILES['attachments']['name'][$i];
                $tmp_name = $_FILES['attachments']['tmp_name'][$i];
                $file_size = $_FILES['attachments']['size'][$i];
                $file_type = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                
                $allowed = ['pdf', 'doc', 'docx'];
                if (in_array($file_type, $allowed)) {
                    $new_filename = uniqid('doc_') . '_' . time() . '.' . $file_type;
                    $target_path = $att_upload_dir . $new_filename;
                    
                    if (move_uploaded_file($tmp_name, $target_path)) {
                        $att_sql = "INSERT INTO story_attachments (post_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)";
                        $att_stmt = $conn->prepare($att_sql);
                        $att_stmt->execute([$post_id, $file_name, $target_path, $file_type, $file_size]);
                    }
                }
            }
        }
    }

    $changes = "Updated story content, text, category, or pin status.";
    if ($image_updated) $changes .= " (Cover image was modified or removed).";
    
    $history_sql = "INSERT INTO story_edit_history (post_id, user_id, changes_made) VALUES (:post_id, :user_id, :changes)";
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->execute([':post_id' => $post_id, ':user_id' => $author_id, ':changes' => $changes]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>