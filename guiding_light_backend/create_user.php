<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireRAdmin();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"));
    $username = $data->username ?? '';
    $password = $data->password ?? '';
    $role = $data->role ?? 'media'; // Default to media for safety

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Username and password are required.']);
        exit;
    }

    // Check if username already exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
    $checkStmt->execute([':username' => $username]);
    if ($checkStmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'error' => 'Username already exists.']);
        exit;
    }

    // Hash the password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user
    $stmt = $conn->prepare("INSERT INTO users (username, password_hash, role) VALUES (:username, :password_hash, :role)");
    $stmt->execute([
        ':username' => $username,
        ':password_hash' => $hashed_password,
        ':role' => $role
    ]);

    echo json_encode(['success' => true, 'message' => 'User created successfully!']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>