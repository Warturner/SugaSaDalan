<?php
require 'db_connect.php';
require 'auth.php';
require_once 'account_activity.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$currentUser = requireAuth();

try {
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 16384) {
        throw new InvalidArgumentException('Profile request is too large.');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new InvalidArgumentException('Invalid request data.');
    }

    $currentPassword = $data['current_password'] ?? null;
    $newUsername = $data['new_username'] ?? null;
    $newPassword = $data['new_password'] ?? '';

    if (!is_string($currentPassword) || $currentPassword === '' ||
        !is_string($newUsername) || !is_string($newPassword)) {
        throw new InvalidArgumentException('Current password and username are required.');
    }
    $newUsername = trim($newUsername);
    if ($newUsername === '' || mb_strlen($newUsername) > 50) {
        throw new InvalidArgumentException('Username must be 1–50 characters.');
    }
    if ($newPassword !== '' && (strlen($newPassword) < 8 || strlen($newPassword) > 256)) {
        throw new InvalidArgumentException('New password must be 8–256 characters.');
    }

    $userId = (int) $currentUser['id'];
    $conn->beginTransaction();

    // Lock this account until both its update and audit entries are committed.
    $stmt = $conn->prepare(
        'SELECT username, password_hash FROM users WHERE user_id = :id LIMIT 1 FOR UPDATE'
    );
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        $conn->rollBack();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Account could not be verified.']);
        exit;
    }
    if (!password_verify($currentPassword, $user['password_hash'])) {
        $conn->rollBack();
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect.']);
        exit;
    }

    if ($newPassword !== '') {
        $stmt = $conn->prepare(
            'UPDATE users SET username = :name, password_hash = :hash WHERE user_id = :id'
        );
        $stmt->execute([
            ':name' => $newUsername,
            ':hash' => password_hash($newPassword, PASSWORD_DEFAULT),
            ':id' => $userId
        ]);
    } else {
        $stmt = $conn->prepare('UPDATE users SET username = :name WHERE user_id = :id');
        $stmt->execute([':name' => $newUsername, ':id' => $userId]);
    }

    if ($user['username'] !== $newUsername) {
        recordAccountActivity(
            $conn, $userId, $user['username'], $userId, $newUsername,
            'username_changed', 'Own username changed from ' . $user['username'] . ' to ' . $newUsername . '.'
        );
    }
    if ($newPassword !== '') {
        recordAccountActivity(
            $conn, $userId, $user['username'], $userId, $newUsername,
            'password_changed', 'Password changed in account settings.'
        );
    }

    $conn->commit();
    $_SESSION['username'] = $newUsername;
    echo json_encode(['success' => true, 'new_username' => $newUsername]);
} catch (InvalidArgumentException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code($e->getCode() === '23000' ? 409 : 500);
    echo json_encode([
        'success' => false,
        'error' => $e->getCode() === '23000' ? 'That username is already taken.' : 'Failed to update profile.'
    ]);
} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update profile.']);
}
