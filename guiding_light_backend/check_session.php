<?php

require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$user = getCurrentUser();

if (!$user) {

    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'user' => null
    ]);

    exit;
}

// VERIFY THAT USER STILL EXISTS

try {

    $stmt = $conn->prepare("
        SELECT
            user_id,
            username,
            role
        FROM users
        WHERE user_id = :user_id
        LIMIT 1
    ");

    $stmt->execute([
        ':user_id' => $user['id']
    ]);

    $dbUser =
        $stmt->fetch(PDO::FETCH_ASSOC);


    // Account may have been deleted
if (!$dbUser) {

    session_unset();
    session_destroy();

    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'user' => null
    ]);

    exit;
}


    // Keep role information synchronized
    $_SESSION['username'] =
        $dbUser['username'];

    $_SESSION['role'] =
        $dbUser['role'];


    echo json_encode([
        'success' => true,
        'authenticated' => true,

        'user' => [
            'id' =>
                (int) $dbUser['user_id'],

            'username' =>
                $dbUser['username'],

            'role' =>
                $dbUser['role']
        ]
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' =>
            'Unable to verify authentication.'
    ]);
}