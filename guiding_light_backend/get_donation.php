<?php
require 'db_connect.php';

try {
    // 1. Prepare our SQL query. We only want 'Verified' donations (status = 2)
    // We use a LEFT JOIN to grab the donor's name and the service name
    $sql = "SELECT d.amount, d.transaction_date, 
                   dn.donor_name, 
                   s.service_name 
            FROM DONATIONS d
            LEFT JOIN DONORS dn ON d.donor_id = dn.donor_id
            LEFT JOIN SERVICES s ON d.service_id = s.service_id
            WHERE d.status = 2
            ORDER BY d.transaction_date DESC";
    
    // 2. Execute the prepared statement
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    // 3. Fetch all the results as an associative array
    $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    //  Anonymous Donor Rule
    foreach ($donations as $key => $donation) {
        // If the name is null or empty, replace it
        if (empty($donation['donor_name'])) {
            $donations[$key]['donor_name'] = 'Anonymous Donor';
        }
    }
    
    // 5. Send the final JSON data to the frontend
    echo json_encode($donations);

} catch(PDOException $e) {
    // If something goes wrong, send the error securely
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>