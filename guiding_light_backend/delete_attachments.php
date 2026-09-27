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

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$id = filter_var(
    $data['id'] ?? null,
    FILTER_VALIDATE_INT
);

if (!$id || $id <= 0) {

    http_response_code(400);

    echo json_encode([
        'error' =>
            'A valid attachment ID is required.'
    ]);

    exit;
}

try {

    $stmt = $conn->prepare(
        "SELECT file_path
         FROM story_attachments
         WHERE id = ?
         LIMIT 1"
    );

    $stmt->execute([$id]);

    $attachment =
        $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attachment) {

        http_response_code(404);

        echo json_encode([
            'error' =>
                'Attachment not found.'
        ]);

        exit;
    }

    /*
     * Use only the stored filename.
     * This avoids trusting an arbitrary path.
     */
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

        if (!unlink($filepath)) {

            throw new RuntimeException(
                'Unable to delete attachment file.'
            );
        }
    }

    $deleteStmt = $conn->prepare(
        "DELETE FROM story_attachments
         WHERE id = ?"
    );

    $deleteStmt->execute([$id]);

    echo json_encode([
        'success' => true
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'error' =>
            'Failed to delete attachment.'
    ]);
}