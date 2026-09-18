<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireAdmin();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

try {
    $data = json_decode(file_get_contents("php://input"));
    $user_id = $data->user_id ?? null;
    $username = $data->username ?? '';
    $role = $data->role ?? 'media';
    $password = $data->password ?? ''; 
    $admin_id = $data->admin_id ?? null;
    $admin_password = $data->admin_password ?? '';

    if (!$user_id || empty($username) || !$admin_id || empty($admin_password)) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields or Admin Authorization.']);
        exit;
    }

    // 1. VERIFY THE ADMIN'S PASSWORD FIRST
    $adminStmt = $conn->prepare("SELECT password_hash FROM users WHERE user_id = :admin_id AND role = 'admin'");
    $adminStmt->execute([':admin_id' => $admin_id]);
    $adminData = $adminStmt->fetch(PDO::FETCH_ASSOC);

    if (!$adminData || !password_verify($admin_password, $adminData['password_hash'])) {
        echo json_encode(['success' => false, 'error' => 'Authorization Denied: Incorrect Admin Password.']);
        exit;
    }

    // 2. Check if another user already has the new username
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username AND user_id != :id");
    $checkStmt->execute([':username' => $username, ':id' => $user_id]);
    if ($checkStmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'error' => 'Username already taken by another account.']);
        exit;
    }

    // 3. Update the user
    if (!empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET username = :username, role = :role, password_hash = :password_hash WHERE user_id = :id");
        $stmt->execute([':username' => $username, ':role' => $role, ':password_hash' => $hashed_password, ':id' => $user_id]);
    } else {
        $stmt = $conn->prepare("UPDATE users SET username = :username, role = :role WHERE user_id = :id");
        $stmt->execute([':username' => $username, ':role' => $role, ':id' => $user_id]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?> 