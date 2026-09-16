<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // FIXED: Added payment_method to the SELECT query!
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
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>