<?php

require 'db_connect.php';

header(
    "Content-Type: application/json; charset=UTF-8"
);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$postId = filter_var(
    $_GET['post_id'] ?? null,
    FILTER_VALIDATE_INT
);

if (!$postId || $postId <= 0) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'A valid post ID is required.'
    ]);

    exit;
}

try {

    $stmt = $conn->prepare(
        "SELECT
            id,
            post_id,
            file_name,
            file_path,
            file_type,
            file_size,
            uploaded_at
         FROM story_attachments
         WHERE post_id = ?
         ORDER BY uploaded_at ASC"
    );

    $stmt->execute([
        $postId
    ]);

    $attachments =
        $stmt->fetchAll();

    foreach (
        $attachments
        as &$attachment
    ) {

        $attachment['file_url'] =
            '/guiding_light_backend/' .
            $attachment['file_path'];
    }

    unset($attachment);

    echo json_encode(
        $attachments,
        JSON_INVALID_UTF8_SUBSTITUTE
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to load story attachments.'
    ]);
}