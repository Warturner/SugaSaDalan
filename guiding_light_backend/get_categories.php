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

    $stmt = $conn->query(
        "SELECT id, name
         FROM story_categories
         ORDER BY name ASC"
    );

    echo json_encode(
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        ),
        JSON_INVALID_UTF8_SUBSTITUTE
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to load categories.'
    ]);
}