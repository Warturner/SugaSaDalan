<?php

require 'db_connect.php';

header(
    "Content-Type: application/json; charset=UTF-8"
);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$postId = filter_var(
    $_GET['id'] ?? null,
    FILTER_VALIDATE_INT
);

if (!$postId || $postId <= 0) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' =>
            'A valid story ID is required.'
    ]);

    exit;
}

try {

    $stmt = $conn->prepare(
        "SELECT
            s.title,
            s.content_type,
            s.content,
            s.image_path,
            s.published_date,
            u.username AS author
         FROM stories s
         LEFT JOIN users u
            ON s.author_id = u.user_id
         WHERE s.post_id = :post_id
         LIMIT 1"
    );

    $stmt->execute([
        ':post_id' => $postId
    ]);

    $story = $stmt->fetch();

    if (!$story) {

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' => 'Story not found.'
        ]);

        exit;
    }

    $imageUrl = '';

    if (!empty($story['image_path'])) {

        $imageUrl =
            '/guiding_light_backend/' .
            $story['image_path'];
    }

    echo json_encode(
        [
            'success' => true,

            'story' => [
                'title' =>
                    $story['title'],

                'content_type' =>
                    $story['content_type'],

                'content' =>
                    $story['content'],

                'image' =>
                    $imageUrl,

                'author' =>
                    $story['author']
                    ?: 'Admin',

                'date' =>
                    date(
                        'F j, Y',
                        strtotime(
                            $story['published_date']
                        )
                    )
            ]
        ],
        JSON_INVALID_UTF8_SUBSTITUTE
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' =>
            'Failed to load story.'
    ]);
}