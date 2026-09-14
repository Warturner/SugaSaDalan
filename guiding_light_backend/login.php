<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents("php://input"));
    $username = $data->username ?? '';
    $password = $data->password ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['error' => 'Username and password are required.']);
        exit;
    }

    // Fetch the user from the database
    $stmt = $conn->prepare("SELECT user_id, username, password_hash, role FROM users WHERE username = :username");
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify the password hash
    if ($user && password_verify($password, $user['password_hash'])) {
        // In a real app, you'd generate a JWT token here. For this capstone, we will return success.
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['user_id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    } else {
        echo json_encode(['error' => 'Invalid username or password.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>