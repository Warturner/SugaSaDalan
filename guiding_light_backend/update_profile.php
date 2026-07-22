<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? '';
    $user_id = $data->user_id ?? null;

    if (!$user_id || !$action) {
        echo json_encode(['error' => 'Missing required parameters.']);
        exit;
    }

    // Fetch current user hash to verify their identity
    $stmt = $conn->prepare("SELECT password_hash FROM users WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['error' => 'User not found.']);
        exit;
    }

    if ($action === 'update_username') {
        $new_username = $data->new_username ?? '';
        $current_password = $data->current_password ?? '';

        if (empty($new_username) || empty($current_password)) {
            echo json_encode(['error' => 'New username and current password are required.']);
            exit;
        }

        if (!password_verify($current_password, $user['password_hash'])) {
            echo json_encode(['error' => 'Incorrect current password.']);
            exit;
        }

        // Ensure the new username isn't already taken by another admin
        $check_stmt = $conn->prepare("SELECT user_id FROM users WHERE username = :username AND user_id != :user_id");
        $check_stmt->execute([':username' => $new_username, ':user_id' => $user_id]);
        if ($check_stmt->fetch()) {
            echo json_encode(['error' => 'Username already taken.']);
            exit;
        }

        $update_stmt = $conn->prepare("UPDATE users SET username = :username WHERE user_id = :user_id");
        $update_stmt->execute([':username' => $new_username, ':user_id' => $user_id]);

        echo json_encode(['success' => true, 'new_username' => $new_username]);

    } elseif ($action === 'update_password') {
        $old_password = $data->old_password ?? '';
        $new_password = $data->new_password ?? '';

        if (empty($old_password) || empty($new_password)) {
            echo json_encode(['error' => 'Old and new passwords are required.']);
            exit;
        }

        if (!password_verify($old_password, $user['password_hash'])) {
            echo json_encode(['error' => 'Incorrect old password.']);
            exit;
        }

        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $update_stmt = $conn->prepare("UPDATE users SET password_hash = :hash WHERE user_id = :user_id");
        $update_stmt->execute([':hash' => $new_hash, ':user_id' => $user_id]);

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Invalid action.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>