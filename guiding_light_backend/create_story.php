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
    $title = $_POST['title'] ?? '';
    $excerpt = $_POST['excerpt'] ?? '';
    $content = $_POST['content'] ?? '';
    $author_id = $_POST['author_id'] ?? 1;

    $category_id = !empty($_POST['category_id']) ? $_POST['category_id'] : null;
    $is_pinned = ($_POST['is_pinned'] ?? 'false') === 'true' ? 1 : 0;
    $pin_until = !empty($_POST['pin_until']) ? $_POST['pin_until'] : null;

    if (empty($title) || empty($content)) {
        echo json_encode(['error' => 'Title and content are required.']);
        exit;
    }

    $image_path = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = 'uploads/stories/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        
        $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid('story_') . '.' . $file_extension;
        $target_file = $upload_dir . $new_filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $image_path = $target_file;
        }
    }

    $sql = "INSERT INTO stories (title, excerpt, content, author_id, image_path, category_id, is_pinned, pin_until) 
            VALUES (:title, :excerpt, :content, :author_id, :image_path, :category_id, :is_pinned, :pin_until)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':title' => $title,
        ':excerpt' => $excerpt,
        ':content' => $content,
        ':author_id' => $author_id,
        ':image_path' => $image_path,
        ':category_id' => $category_id,
        ':is_pinned' => $is_pinned,
        ':pin_until' => $pin_until
    ]);
    
    $post_id = $conn->lastInsertId();

    // ==========================================
    // NEW: Handle PDF/DOCX Attachments
    // ==========================================
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
                
                // Security: Only allow safe document types
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

    echo json_encode(['success' => true, 'post_id' => $post_id]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>