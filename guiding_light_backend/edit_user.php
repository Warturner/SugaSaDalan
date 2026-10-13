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

$currentUser = requireAdmin();

try {
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 16384) {
        throw new InvalidArgumentException('Account request is too large.');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new InvalidArgumentException('Invalid account request.');
    }

    $userId = filter_var($data['user_id'] ?? null, FILTER_VALIDATE_INT);
    $username = $data['username'] ?? null;
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'media';
    $adminPassword = $data['admin_password'] ?? null;

    if (!$userId || $userId <= 0 || !is_string($username) ||
        !is_string($password) || !is_string($role) ||
        !is_string($adminPassword) || $adminPassword === '') {
        throw new InvalidArgumentException('Missing or invalid account fields or admin authorization.');
    }

    $username = trim($username);
    if ($username === '' || mb_strlen($username) > 50) {
        throw new InvalidArgumentException('Username is required and must not exceed 50 characters.');
    }
    if (!in_array($role, ['admin', 'media'], true)) {
        throw new InvalidArgumentException('Invalid account role.');
    }
    if ($password !== '' && (strlen($password) < 8 || strlen($password) > 256)) {
        throw new InvalidArgumentException('New password must be 8–256 characters.');
    }

    // Verify the CURRENT logged-in admin, never an admin ID supplied by the browser.
    $adminStmt = $conn->prepare(
        'SELECT password_hash FROM users WHERE user_id = :id AND role = :role LIMIT 1'
    );
    $adminStmt->execute([':id' => $currentUser['id'], ':role' => 'admin']);
    $adminData = $adminStmt->fetch(PDO::FETCH_ASSOC);

    if (!$adminData || !password_verify($adminPassword, $adminData['password_hash'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Authorization denied: incorrect admin password.']);
        exit;
    }

    $conn->beginTransaction();
    $targetStmt = $conn->prepare(
        'SELECT username, role FROM users WHERE user_id = :id LIMIT 1 FOR UPDATE'
    );
    $targetStmt->execute([':id' => $userId]);
    $old = $targetStmt->fetch(PDO::FETCH_ASSOC);

    if (!$old) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User account not found.']);
        exit;
    }

    if ($password !== '') {
        $stmt = $conn->prepare(
            'UPDATE users SET username = :name, role = :role, password_hash = :hash
             WHERE user_id = :id'
        );
        $stmt->execute([
            ':name' => $username, ':role' => $role,
            ':hash' => password_hash($password, PASSWORD_DEFAULT), ':id' => $userId
        ]);
    } else {
        $stmt = $conn->prepare(
            'UPDATE users SET username = :name, role = :role WHERE user_id = :id'
        );
        $stmt->execute([':name' => $username, ':role' => $role, ':id' => $userId]);
    }

    if ($old['username'] !== $username) {
        recordAccountActivity(
            $conn, (int) $currentUser['id'], $currentUser['username'],
            $userId, $username, 'username_changed',
            'Username changed from ' . $old['username'] . ' to ' . $username . '.'
        );
    }
    if ($old['role'] !== $role) {
        recordAccountActivity(
            $conn, (int) $currentUser['id'], $currentUser['username'],
            $userId, $username, 'role_changed',
            'Role changed from ' . $old['role'] . ' to ' . $role . '.'
        );
    }
    if ($password !== '') {
        recordAccountActivity(
            $conn, (int) $currentUser['id'], $currentUser['username'],
            $userId, $username, 'password_changed', 'Password reset by administrator.'
        );
    }

    $conn->commit();
    if ((int) $currentUser['id'] === $userId) {
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $role;
    }
    echo json_encode(['success' => true, 'message' => 'Account updated successfully.']);
} catch (InvalidArgumentException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code($e->getCode() === '23000' ? 409 : 500);
    echo json_encode([
        'success' => false,
        'error' => $e->getCode() === '23000' ? 'Username already taken by another account.' : 'Unable to update user.'
    ]);
} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to update user.']);
}
