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

try {

    $stmt = $conn->prepare(
        "SELECT
            s.post_id,
            s.title,
            s.content_type,
            s.content,
            s.excerpt,
            s.image_path,
            s.published_date,
            s.category_id,
            s.is_pinned,
            s.pin_until,
            c.name AS category_name,
            u.username AS author,

            CASE
                WHEN
                    s.is_pinned = 1
                    AND (
                        s.pin_until IS NULL
                        OR s.pin_until > NOW()
                    )
                THEN 1
                ELSE 0
            END AS active_pin

         FROM stories s

         LEFT JOIN users u
            ON s.author_id = u.user_id

         LEFT JOIN story_categories c
            ON s.category_id = c.id

         ORDER BY
            active_pin DESC,
            s.published_date DESC"
    );

    $stmt->execute();

    $stories =
        $stmt->fetchAll();

    foreach (
        $stories
        as &$story
    ) {

        if (
            !empty(
                $story['image_path']
            )
        ) {

            $story['image'] =
                '/guiding_light_backend/' .
                $story['image_path'];

        } else {

            $story['image'] = null;
        }
    }

    unset($story);

    echo json_encode(
        $stories,
        JSON_INVALID_UTF8_SUBSTITUTE
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to load stories.'
    ]);
}