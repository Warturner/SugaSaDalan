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

    $id = !empty($_POST['id'])
        ? (int) $_POST['id']
        : null;

    $name = trim($_POST['name'] ?? '');
    $role = trim($_POST['role'] ?? '');
    $email = trim($_POST['email'] ?? '');

    $displayOrder = isset($_POST['display_order'])
        ? (int) $_POST['display_order']
        : 999;

    if ($name === '' || $role === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Name and Role are required.'
        ]);

        exit;
    }

    if ($displayOrder < 1) {
        $displayOrder = 1;
    }

    $imagePath = null;

    // Existing member
    if ($id) {

        $stmt = $conn->prepare("
            SELECT image_path
            FROM team_members
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$id]);

        $existing =
            $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'error' => 'Team member not found.'
            ]);

            exit;
        }

        $imagePath =
            $existing['image_path'];
    }

    // New image uploaded
    if (
        isset($_FILES['image']) &&
        $_FILES['image']['error'] === UPLOAD_ERR_OK
    ) {

        $uploadDir =
            __DIR__ . '/uploads/team/';

        if (!is_dir($uploadDir)) {

            if (!mkdir(
                $uploadDir,
                0755,
                true
            )) {
                throw new Exception(
                    'Unable to create team upload directory.'
                );
            }
        }

        $extension = strtolower(
            pathinfo(
                $_FILES['image']['name'],
                PATHINFO_EXTENSION
            )
        );

        $allowedExtensions = [
            'jpg',
            'jpeg',
            'png',
            'webp',
            'gif',
            'jfif'
        ];

        if (
            !in_array(
                $extension,
                $allowedExtensions,
                true
            )
        ) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'error' => 'Invalid image type.'
            ]);

            exit;
        }

        $newFilename =
            uniqid('team_', true) .
            '.' .
            $extension;

        $absoluteTarget =
            $uploadDir . $newFilename;

        $databasePath =
            'uploads/team/' .
            $newFilename;

        if (
            !move_uploaded_file(
                $_FILES['image']['tmp_name'],
                $absoluteTarget
            )
        ) {
            throw new Exception(
                'Failed to save uploaded image.'
            );
        }

        // Delete old image
        if ($imagePath) {

            $oldFile =
                __DIR__ . '/' . $imagePath;

            if (
                file_exists($oldFile) &&
                is_file($oldFile)
            ) {
                unlink($oldFile);
            }
        }

        $imagePath = $databasePath;
    }

    if ($id) {

        $stmt = $conn->prepare("
            UPDATE team_members
            SET
                name = ?,
                role = ?,
                email = ?,
                image_path = ?,
                display_order = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $name,
            $role,
            $email,
            $imagePath,
            $displayOrder,
            $id
        ]);

    } else {

        $stmt = $conn->prepare("
            INSERT INTO team_members
            (
                name,
                role,
                email,
                image_path,
                display_order
            )
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $name,
            $role,
            $email,
            $imagePath,
            $displayOrder
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => $id
            ? 'Team member updated successfully.'
            : 'Team member created successfully.'
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to save team member.'
    ]);
}