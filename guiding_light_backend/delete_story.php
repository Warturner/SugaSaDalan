<?php
require 'db_connect.php';
reuire 'auth.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$currentUser = requireRole(['admin', 'media']);

try {
    $post_id = $_POST['post_id'] ?? null;
    
    if (!$post_id) {
        $data = json_decode(file_get_contents("php://input"));
        $post_id = $data->post_id ?? null;
    }

    if (!$post_id) {
        echo json_encode(['error' => 'Post ID is required for deletion.']);
        exit;
    }

    // --- A. FETCH STORY DATA ---
    $stmt = $conn->prepare("SELECT image_path, content FROM stories WHERE post_id = :post_id");
    $stmt->execute([':post_id' => $post_id]);
    $story = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($story) {
        // 1. DELETE BANNER IMAGE
        if (!empty($story['image_path'])) {
            $banner_filename = basename($story['image_path']);
            $banner_filepath = __DIR__ . "/uploads/stories/" . $banner_filename; 
            
            if (file_exists($banner_filepath) && is_file($banner_filepath)) {
                unlink($banner_filepath); 
            }
        }

        // 2. DELETE RICH TEXT IMAGES (JSON PARSING)
        if (!empty($story['content'])) {
            // Regex to find "src":"URL" inside the JSON string
            preg_match_all('/"src"\s*:\s*"([^"]+)"/i', $story['content'], $matches);
            
            if (!empty($matches[1])) {
                foreach ($matches[1] as $img_url) {
                    // Extract just the filename (e.g., inline_6a97a073b0b55_1788321907.jpeg)
                    $filename = basename(parse_url($img_url, PHP_URL_PATH));
                    $filepath = __DIR__ . "/uploads/stories/" . $filename;
                    
                    if (file_exists($filepath) && is_file($filepath)) {
                        unlink($filepath);
                    }
                }
            }
        }
    }

    // --- B. DELETE ATTACHMENTS (e.g. PDFs) ---
    // We must fetch these BEFORE deleting the story, because ON DELETE CASCADE will erase the DB rows immediately
    $attach_stmt = $conn->prepare("SELECT file_path FROM story_attachments WHERE post_id = :post_id");
    $attach_stmt->execute([':post_id' => $post_id]);
    $attachments = $attach_stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($attachments as $attach) {
        if (!empty($attach['file_path'])) {
            $attach_filename = basename($attach['file_path']);
            $attach_filepath = __DIR__ . "/uploads/stories/attachments/" . $attach_filename;
            
            if (file_exists($attach_filepath) && is_file($attach_filepath)) {
                unlink($attach_filepath);
            }
        }
    }

    // --- C. DELETE DATABASE ROW ---
    $sql = "DELETE FROM stories WHERE post_id = :post_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':post_id' => $post_id]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>