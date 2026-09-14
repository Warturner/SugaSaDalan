<?php
require 'db_connect.php';

// Allow requests from your React frontend
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // 1. Grab the ID of the person making the request
    $admin_id = $_GET['admin_id'] ?? null;

    if (!$admin_id) {
        echo json_encode(['success' => false, 'error' => 'Unauthorized Access: Missing Credentials.']);
        exit;
    }

    // 2. Check the database to see if this person is actually an Admin
    $verifyStmt = $conn->prepare("SELECT role FROM users WHERE user_id = :id");
    $verifyStmt->execute([':id' => $admin_id]);
    $role = $verifyStmt->fetchColumn();

    if ($role !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Access Denied: Admin privileges required to view this data.']);
        exit;
    }

    // 3. If they pass the security check, fetch the users
    $stmt = $conn->prepare("SELECT user_id, username, role FROM users ORDER BY role ASC, username ASC");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'users' => $users
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>