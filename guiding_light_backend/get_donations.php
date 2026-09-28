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
    $stmt = $conn->query("
        SELECT donation_id, donor_name, contact_email, amount, reference_number, transaction_date, payment_method, status 
        FROM donations 
        ORDER BY transaction_date DESC
    ");
    
    $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $donations
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' =>
            'Failed to load donations.'
    ]);
}
?>