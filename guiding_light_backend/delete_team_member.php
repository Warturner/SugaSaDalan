<?php

require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$currentUser = requireRole([
    'admin',
    'media'
]);

try {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $id = (int) ($data['id'] ?? 0);

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' =>
                'Team member ID is required.'
        ]);

        exit;
    }

    $stmt = $conn->prepare("
        SELECT image_path
        FROM team_members
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

    $member =
        $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' =>
                'Team member not found.'
        ]);

        exit;
    }

    // Delete associated image
    if (!empty($member['image_path'])) {

        $filename =
            basename(
                $member['image_path']
            );

        $filepath =
            __DIR__ .
            '/uploads/team/' .
            $filename;

        if (
            file_exists($filepath) &&
            is_file($filepath)
        ) {
            unlink($filepath);
        }
    }

    $stmt = $conn->prepare("
        DELETE FROM team_members
        WHERE id = ?
    ");

    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' =>
            'Team member deleted successfully.'
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' =>
            'Unable to delete team member.'
    ]);
}