<?php
require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

$currentUser = requireRole([
    'admin',
    'media'
]);

try {

    $post_id =
        $_POST['post_id'] ?? null;

    if (!$post_id) {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $post_id =
            $data['post_id'] ?? null;
    }

    $post_id = (int) $post_id;

    if ($post_id <= 0) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'A valid post ID is required for deletion.'
        ]);

        exit;
    }

    // Fetch story first
    $stmt = $conn->prepare(
        "SELECT image_path, content
         FROM stories
         WHERE post_id = :post_id"
    );

    $stmt->execute([
        ':post_id' => $post_id
    ]);

    $story =
        $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$story) {

        http_response_code(404);

        echo json_encode([
            'error' => 'Story not found.'
        ]);

        exit;
    }

    // Fetch attachments BEFORE deleting the story,
    // because the DB uses ON DELETE CASCADE.
    $attachStmt = $conn->prepare(
        "SELECT file_path
         FROM story_attachments
         WHERE post_id = :post_id"
    );

    $attachStmt->execute([
        ':post_id' => $post_id
    ]);

    $attachments =
        $attachStmt->fetchAll(PDO::FETCH_ASSOC);

    // Delete cover image
    if (!empty($story['image_path'])) {

        $filename =
            basename($story['image_path']);

        $filepath =
            __DIR__ .
            '/uploads/stories/' .
            $filename;

        if (
            file_exists($filepath) &&
            is_file($filepath)
        ) {
            unlink($filepath);
        }
    }

    // Delete inline TipTap images
    if (!empty($story['content'])) {

        preg_match_all(
            '/"src"\s*:\s*"([^"]+)"/i',
            $story['content'],
            $matches
        );

        foreach (
            $matches[1] ?? []
            as $imageUrl
        ) {

            $path =
                parse_url(
                    $imageUrl,
                    PHP_URL_PATH
                );

            if (!$path) {
                continue;
            }

            $filename =
                basename($path);

            $filepath =
                __DIR__ .
                '/uploads/stories/' .
                $filename;

            if (
                file_exists($filepath) &&
                is_file($filepath)
            ) {
                unlink($filepath);
            }
        }
    }

    // Delete physical PDF attachments
    foreach ($attachments as $attachment) {

        if (
            empty(
                $attachment['file_path']
            )
        ) {
            continue;
        }

        $filename =
            basename(
                $attachment['file_path']
            );

        $filepath =
            __DIR__ .
            '/uploads/stories/attachments/' .
            $filename;

        if (
            file_exists($filepath) &&
            is_file($filepath)
        ) {
            unlink($filepath);
        }
    }

    // Delete database record.
    // Related attachment/history rows cascade.
    $deleteStmt = $conn->prepare(
        "DELETE FROM stories
         WHERE post_id = :post_id"
    );

    $deleteStmt->execute([
        ':post_id' => $post_id
    ]);

    echo json_encode([
        'success' => true
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to delete story.'
    ]);
}
?>