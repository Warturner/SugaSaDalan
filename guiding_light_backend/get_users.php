<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireAdmin();

header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {

    $stmt = $conn->prepare("
        SELECT
            user_id,
            username,
            role
        FROM users
        ORDER BY username ASC
    ");

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'users' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Unable to load users.'
    ]);
}
?>