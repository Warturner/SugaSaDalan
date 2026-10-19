<?php
require 'db_connect.php';
require 'auth.php';
require_once __DIR__ . '/login_security.php';

header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    return;
}

$heldLocks = [];
try {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || strlen($raw) > 16384) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid login request.']);
        return;
    }
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['username'], $data['password']) ||
        !is_string($data['username']) || !is_string($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid login request.']);
        return;
    }

    $username = trim($data['username']);
    $password = $data['password'];
    if ($username === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username and password are required.']);
        return;
    }
    if (mb_strlen($username, 'UTF-8') > 50 || strlen($password) > 256) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid login request.']);
        return;
    }

    [$usernameHash, $ipHash] = loginSecurityKeys($username);
    $heldLocks = acquireLoginLocks($conn, $usernameHash, $ipHash);

    // Check the IP even when the username does not exist: do not leak account existence.
    $accountFailures = recentLoginFailures($conn, 'username_hash', $usernameHash);
    $ipFailures = recentLoginFailures($conn, 'ip_hash', $ipHash);
    if ($accountFailures >= LOGIN_ACCOUNT_FAILURE_LIMIT ||
        $ipFailures >= LOGIN_IP_FAILURE_LIMIT) {
        refuseRateLimitedLogin();
        return;
    }

    $stmt = $conn->prepare(
        'SELECT user_id, username, password_hash, role
         FROM users WHERE username = :username LIMIT 1'
    );
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $valid = $user && password_verify($password, $user['password_hash']);

    if (!$valid) {
        $userId = $user ? (int) $user['user_id'] : null;
        $conn->beginTransaction();
        recordLoginSecurityEvent($conn, $userId, $username, $usernameHash, $ipHash, 'login_failed');

        // GET_LOCK has serialized requests against the same username or source IP.
        $accountFailures++;
        $ipFailures++;
        if ($accountFailures >= LOGIN_ACCOUNT_FAILURE_LIMIT ||
            $ipFailures >= LOGIN_IP_FAILURE_LIMIT) {
            $detail = $accountFailures >= LOGIN_ACCOUNT_FAILURE_LIMIT
                ? 'Temporary account-attempt limit reached'
                : 'Temporary network-attempt limit reached';
            recordLoginSecurityEvent(
                $conn, $userId, $username, $usernameHash, $ipHash,
                'login_restricted', $detail
            );
        }
        $conn->commit();

        if ($accountFailures >= LOGIN_ACCOUNT_FAILURE_LIMIT ||
            $ipFailures >= LOGIN_IP_FAILURE_LIMIT) {
            refuseRateLimitedLogin();
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
        }
        return;
    }

    if (!session_regenerate_id(true)) {
        throw new RuntimeException('Could not regenerate PHP session ID.');
    }

    // Preserve single-active-session enforcement from the existing system.
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $conn->beginTransaction();
    $update = $conn->prepare(
        'UPDATE users SET active_session_hash = :hash WHERE user_id = :user_id'
    );
    $update->execute([
        ':hash' => $tokenHash,
        ':user_id' => (int) $user['user_id']
    ]);
    if ($update->rowCount() !== 1) {
        throw new RuntimeException('Could not register the new session.');
    }
    recordLoginSecurityEvent(
        $conn, (int) $user['user_id'], $username,
        $usernameHash, $ipHash, 'login_success'
    );
    $conn->commit();

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
    if ($conn instanceof PDO && $conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log('Login security request could not be completed.');
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error' => 'Login service is temporarily unavailable. Please try again later.'
    ]);
} finally {
    if ($conn instanceof PDO && !empty($heldLocks)) {
        releaseLoginLocks($conn, $heldLocks);
    }
}
