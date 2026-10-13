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
    $input = file_get_contents('php://input');
    if (strlen($input) > 16384) {
        throw new InvalidArgumentException('Account request is too large.');
    }

    $data = json_decode($input, true);
    if (!is_array($data)) {
        throw new InvalidArgumentException('Invalid account request.');
    }

    $username = $data['username'] ?? null;
    $password = $data['password'] ?? null;
    $role = $data['role'] ?? 'media';

    if (!is_string($username) || !is_string($password) || !is_string($role)) {
        throw new InvalidArgumentException('Invalid account fields.');
    }

    $username = trim($username);
    if ($username === '' || mb_strlen($username) > 50 ||
        strlen($password) < 8 || strlen($password) > 256) {
        throw new InvalidArgumentException(
            'Username is required (max 50 characters); password must be 8–256 characters.'
        );
    }

    if (!in_array($role, ['admin', 'media'], true)) {
        throw new InvalidArgumentException('Invalid account role.');
    }

    // The account and the audit record must succeed or fail together.
    $conn->beginTransaction();

    $stmt = $conn->prepare(
        'INSERT INTO users (username, password_hash, role)
         VALUES (:username, :password_hash, :role)'
    );
    $stmt->execute([
        ':username' => $username,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':role' => $role
    ]);

    $newUserId = (int) $conn->lastInsertId();
    recordAccountActivity(
        $conn, (int) $currentUser['id'], $currentUser['username'],
        $newUserId, $username, 'account_created', 'Created ' . $role . ' account.'
    );

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'User created successfully!']);
} catch (InvalidArgumentException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    $duplicate = $e->getCode() === '23000';
    http_response_code($duplicate ? 409 : 500);
    echo json_encode([
        'success' => false,
        'error' => $duplicate ? 'Username already exists or account could not be created.' : 'Failed to create user.'
    ]);
} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create user.']);
}
