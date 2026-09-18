<?php
require 'db_connect.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

try {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'Story ID is required.']);
        exit;
    }

    // Fixed: The primary key in `stories` is `post_id`
    $stmt = $conn->prepare("SELECT * FROM stories WHERE post_id = :id");
    $stmt->execute([':id' => $id]);
    $story = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($story) {
        $baseUrl = "/guiding_light_backend/";
        $imagePath = $story['image_path'] ? $baseUrl . $story['image_path'] : '';

        $authorName = 'Admin';
        if ($story['author_id']) {
            $authorStmt = $conn->prepare("SELECT username FROM users WHERE user_id = :author_id");
            $authorStmt->execute([':author_id' => $story['author_id']]);
            $authorResult = $authorStmt->fetch(PDO::FETCH_ASSOC);
            if ($authorResult) {
                $authorName = $authorResult['username'];
            }
        }

        echo json_encode([
            'success' => true,
            'story' => [
                'title' => $story['title'],
                'content_type' => $story['content_type'],
                'content' => $story['content'],
                'image' => $imagePath, 
                'author' => $authorName,
                'date' => date('F j, Y', strtotime($story['published_date'])) 
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Story not found.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>