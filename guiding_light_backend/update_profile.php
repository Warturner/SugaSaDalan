<?php

require 'db_connect.php';
require 'auth.php';

header(
    "Content-Type: application/json; charset=UTF-8"
);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$currentUser = requireAuth();

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'Invalid request data.'
    ]);

    exit;
}

$userId =
    (int) $currentUser['id'];

$currentPassword =
    $data['current_password'] ?? '';

$newUsername =
    trim(
        $data['new_username'] ?? ''
    );

$newPassword =
    $data['new_password'] ?? '';

if (
    $currentPassword === '' ||
    $newUsername === ''
) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' =>
            'Current password and username are required.'
    ]);

    exit;
}

if (mb_strlen($newUsername) > 50) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' =>
            'Username must not exceed 50 characters.'
    ]);

    exit;
}

try {

    // Verify the CURRENT logged-in user's password.
    $stmt = $conn->prepare(
        "SELECT password_hash
         FROM users
         WHERE user_id = :id
         LIMIT 1"
    );

    $stmt->execute([
        ':id' => $userId
    ]);

    $user = $stmt->fetch();

    if (!$user) {

        http_response_code(401);

        echo json_encode([
            'success' => false,
            'error' =>
                'Account could not be verified.'
        ]);

        exit;
    }

    if (
        !password_verify(
            $currentPassword,
            $user['password_hash']
        )
    ) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'error' =>
                'Current password is incorrect.'
        ]);

        exit;
    }

    // Prevent duplicate usernames.
    $checkStmt = $conn->prepare(
        "SELECT user_id
         FROM users
         WHERE username = :username
           AND user_id != :id
         LIMIT 1"
    );

    $checkStmt->execute([
        ':username' =>
            $newUsername,

        ':id' =>
            $userId
    ]);

    if ($checkStmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            'success' => false,
            'error' =>
                'That username is already taken.'
        ]);

        exit;
    }

    if ($newPassword !== '') {

        $hashedPassword =
            password_hash(
                $newPassword,
                PASSWORD_DEFAULT
            );

        $updateStmt = $conn->prepare(
            "UPDATE users
             SET
                username = :username,
                password_hash = :password_hash
             WHERE user_id = :id"
        );

        $updateStmt->execute([
            ':username' =>
                $newUsername,

            ':password_hash' =>
                $hashedPassword,

            ':id' =>
                $userId
        ]);

    } else {

        $updateStmt = $conn->prepare(
            "UPDATE users
             SET username = :username
             WHERE user_id = :id"
        );

        $updateStmt->execute([
            ':username' =>
                $newUsername,

            ':id' =>
                $userId
        ]);
    }

    // Keep the active session synchronized.
    $_SESSION['username'] =
        $newUsername;

    echo json_encode([
        'success' => true,
        'new_username' =>
            $newUsername
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' =>
            'Failed to update profile.'
    ]);
}