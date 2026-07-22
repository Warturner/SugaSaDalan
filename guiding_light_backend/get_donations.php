<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");

try {
    // JOIN donations with donors and services to get names instead of just IDs
    $sql = "SELECT d.donation_id, d.transaction_date, d.amount, d.reference_number, 
                   d.status, d.payment_method, 
                   s.service_name, do.donor_name 
            FROM donations d
            LEFT JOIN donors do ON d.donor_id = do.donor_id
            LEFT JOIN services s ON d.service_id = s.service_id
            ORDER BY d.transaction_date DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $donations = [];
    foreach ($results as $row) {
        // Map Status (1 = Pending, 2 = Verified)
        $statusStr = ($row['status'] == 2) ? 'Verified' : 'Pending';

        // Map Payment Method (1 = Bank Card, 2 = Bank Transfer, 3 = E-wallet based on your DB dump)
        $gatewayStr = 'Bank Card';
        if ($row['payment_method'] == 2) $gatewayStr = 'Manual Bank Transfer';
        if ($row['payment_method'] == 3) $gatewayStr = 'E-wallet';

        $donations[] = [
            'id' => $row['donation_id'],
            'date' => $row['transaction_date'],
            'amount' => (float)$row['amount'],
            'category' => $row['service_name'] ?? 'General Fund', // If NULL, it's a general donation
            'donorName' => $row['donor_name'] ?? 'Anonymous Donor', // If NULL, they donated anonymously
            'status' => $statusStr,
            'gateway' => $gatewayStr,
            'reference_number' => $row['reference_number']
        ];
    }

    echo json_encode($donations);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>