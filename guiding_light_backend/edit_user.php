<?php

require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

$currentUser = requireAdmin();

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

    $userId = (int) ($data['user_id'] ?? 0);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'media';
    $adminPassword = $data['admin_password'] ?? '';

    if (
        !$userId ||
        $username === '' ||
        $adminPassword === ''
    ) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields or Admin Authorization.'
        ]);

        exit;
    }

    // Only allow known roles
    if (!in_array($role, ['admin', 'media'], true)) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'Invalid account role.'
        ]);

        exit;
    }

    // Verify the password of the ACTUAL logged-in admin
    $adminStmt = $conn->prepare("
        SELECT password_hash
        FROM users
        WHERE user_id = :id
        AND role = 'admin'
        LIMIT 1
    ");

    $adminStmt->execute([
        ':id' => $currentUser['id']
    ]);

    $adminData = $adminStmt->fetch(PDO::FETCH_ASSOC);

    if (
        !$adminData ||
        !password_verify(
            $adminPassword,
            $adminData['password_hash']
        )
    ) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'error' => 'Authorization denied: incorrect admin password.'
        ]);

        exit;
    }

    // Make sure another account doesn't already use username
    $checkStmt = $conn->prepare("
        SELECT COUNT(*)
        FROM users
        WHERE username = :username
        AND user_id != :id
    ");

    $checkStmt->execute([
        ':username' => $username,
        ':id' => $userId
    ]);

    if ($checkStmt->fetchColumn() > 0) {

        http_response_code(409);

        echo json_encode([
            'success' => false,
            'error' => 'Username already taken by another account.'
        ]);

        exit;
    }

    if ($password !== '') {

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $stmt = $conn->prepare("
            UPDATE users
            SET
                username = :username,
                role = :role,
                password_hash = :password_hash
            WHERE user_id = :id
        ");

        $stmt->execute([
            ':username' => $username,
            ':role' => $role,
            ':password_hash' => $passwordHash,
            ':id' => $userId
        ]);

    } else {

        $stmt = $conn->prepare("
            UPDATE users
            SET
                username = :username,
                role = :role
            WHERE user_id = :id
        ");

        $stmt->execute([
            ':username' => $username,
            ':role' => $role,
            ':id' => $userId
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Account updated successfully.'
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to update user.'
    ]);
}