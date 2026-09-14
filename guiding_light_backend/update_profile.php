<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

try {
    $data = json_decode(file_get_contents("php://input"));
    $user_id = $data->user_id ?? null;
    $current_password = $data->current_password ?? '';
    $new_username = $data->new_username ?? '';
    $new_password = $data->new_password ?? '';

    if (!$user_id || empty($current_password) || empty($new_username)) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
        exit;
    }

    // 1. Verify the user's CURRENT password before allowing changes
    $stmt = $conn->prepare("SELECT password_hash FROM users WHERE user_id = :id");
    $stmt->execute([':id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($current_password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'error' => 'Authorization Denied: Incorrect current password.']);
        exit;
    }

    // 2. Check if the new username is already taken by someone else
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username AND user_id != :id");
    $checkStmt->execute([':username' => $new_username, ':id' => $user_id]);
    if ($checkStmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'error' => 'That username is already taken.']);
        exit;
    }

    // 3. Update the profile
    if (!empty($new_password)) {
        // Update both username AND password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $updateStmt = $conn->prepare("UPDATE users SET username = :username, password_hash = :password_hash WHERE user_id = :id");
        $updateStmt->execute([':username' => $new_username, ':password_hash' => $hashed_password, ':id' => $user_id]);
    } else {
        // Update username ONLY
        $updateStmt = $conn->prepare("UPDATE users SET username = :username WHERE user_id = :id");
        $updateStmt->execute([':username' => $new_username, ':id' => $user_id]);
    }

    echo json_encode(['success' => true, 'new_username' => $new_username]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>