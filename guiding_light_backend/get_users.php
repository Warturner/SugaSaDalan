<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireAdmin();

header("Content-Type: application/json; charset=UTF-8");

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