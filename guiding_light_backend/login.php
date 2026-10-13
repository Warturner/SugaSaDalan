<?php

require 'db_connect.php';
require 'auth.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid login request.']);
        exit;
    }

    $username = trim((string) ($data['username'] ?? ''));
    $password = (string) ($data['password'] ?? '');

    if ($username === '' || $password === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Username and password are required.'
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        'SELECT user_id, username, password_hash, role
         FROM users WHERE username = :username LIMIT 1'
    );
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid username or password.'
        ]);
        exit;
    }

    // Regenerate the browser's session ID on every successful login.
    if (!session_regenerate_id(true)) {
        throw new RuntimeException('Could not regenerate the PHP session ID.');
    }

    // A new random token atomically replaces the previous device's token.
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);

    $update = $conn->prepare(
        'UPDATE users
         SET active_session_hash = :active_hash
         WHERE user_id = :user_id'
    );
    $update->execute([
        ':active_hash' => $tokenHash,
        ':user_id' => (int) $user['user_id']
    ]);

    if ($update->rowCount() !== 1) {
        throw new RuntimeException('Could not register the new session.');
    }

    $_SESSION = [
        'user_id' => (int) $user['user_id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'auth_token' => $token,
        'logged_in_at' => time(),
        'last_activity' => time()
    ];

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => (int) $user['user_id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Unable to process login.'
    ]);
}
