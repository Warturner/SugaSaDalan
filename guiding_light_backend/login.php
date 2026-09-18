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

try {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $password === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Username and password are required.'
        ]);

        exit;
    }

    // LOOK UP USER

    $stmt = $conn->prepare("
        SELECT
            user_id,
            username,
            password_hash,
            role
        FROM users
        WHERE username = :username
        LIMIT 1
    ");

    $stmt->execute([
        ':username' => $username
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // VERIFY PASSWORD

    if (
        !$user ||
        !password_verify(
            $password,
            $user['password_hash']
        )
    ) {

        http_response_code(401);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid username or password.'
        ]);

        exit;
    }

    // PREVENT SESSION FIXATION

    session_regenerate_id(true);

    // CREATE AUTHENTICATED SESSION

    $_SESSION['user_id'] =
        (int) $user['user_id'];

    $_SESSION['username'] =
        $user['username'];

    $_SESSION['role'] =
        $user['role'];

    $_SESSION['logged_in_at'] =
        time();

    // RETURN SAFE USER INFORMATION

    echo json_encode([
        'success' => true,

        'user' => [
            'id' => (int) $user['user_id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to process login.'
    ]);
}