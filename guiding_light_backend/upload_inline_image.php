<?php

require 'db_connect.php';
require 'auth.php';

header(
    "Content-Type: application/json; charset=UTF-8"
);

$currentUser = requireRole([
    'admin',
    'media'
]);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.'
    ]);

    exit;
}

try {

    if (
        !isset($_FILES['image']) ||
        $_FILES['image']['error'] !== UPLOAD_ERR_OK
    ) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'No image uploaded or upload error.'
        ]);

        exit;
    }

    $file = $_FILES['image'];

    // Maximum 5 MB
    if ($file['size'] > 5 * 1024 * 1024) {

        http_response_code(413);

        echo json_encode([
            'error' =>
                'Image must not exceed 5 MB.'
        ]);

        exit;
    }

    // Detect the REAL file type from its contents.
    $finfo =
        new finfo(FILEINFO_MIME_TYPE);

    $mimeType =
        $finfo->file(
            $file['tmp_name']
        );

    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif'
    ];

    if (
        !$mimeType ||
        !isset($allowedTypes[$mimeType])
    ) {

        http_response_code(400);

        echo json_encode([
            'error' =>
                'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'
        ]);

        exit;
    }

    $uploadDir =
        __DIR__ .
        '/uploads/stories/';

    if (
        !is_dir($uploadDir) &&
        !mkdir(
            $uploadDir,
            0777,
            true
        )
    ) {

        throw new RuntimeException(
            'Unable to create upload directory.'
        );
    }

    // Do not trust the original filename extension.
    $extension =
        $allowedTypes[$mimeType];

    $filename =
        'inline_' .
        bin2hex(random_bytes(12)) .
        '.' .
        $extension;

    $destination =
        $uploadDir .
        $filename;

    if (
        !move_uploaded_file(
            $file['tmp_name'],
            $destination
        )
    ) {

        throw new RuntimeException(
            'Failed to move uploaded file.'
        );
    }

    echo json_encode([
        'success' => true,
        'url' =>
            '/guiding_light_backend/uploads/stories/' .
            $filename
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to upload image.'
    ]);
}