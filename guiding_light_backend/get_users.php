<?php
require 'db_connect.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.'
    ]);

    exit;
}

$currentUser = requireAdmin();

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