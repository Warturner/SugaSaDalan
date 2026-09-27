<?php

require 'db_connect.php';
require 'auth.php';

header(
    "Content-Type: application/json; charset=UTF-8"
);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$currentUser = requireRole([
    'admin',
    'media'
]);

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$name =
    trim(
        $data['name'] ?? ''
    );

if ($name === '') {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'Category name is required.'
    ]);

    exit;
}

if (mb_strlen($name) > 255) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'Category name must not exceed 255 characters.'
    ]);

    exit;
}

try {

    $check = $conn->prepare(
        "SELECT id
         FROM story_categories
         WHERE name = ?
         LIMIT 1"
    );

    $check->execute([
        $name
    ]);

    if ($check->fetch()) {

        http_response_code(409);

        echo json_encode([
            'error' =>
                'Category already exists.'
        ]);

        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO story_categories (name)
         VALUES (?)"
    );

    $stmt->execute([
        $name
    ]);

    echo json_encode([
        'success' => true,
        'id' =>
            (int) $conn->lastInsertId(),
        'name' =>
            $name
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to create category.'
    ]);
}