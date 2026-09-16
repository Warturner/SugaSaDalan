s<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

$data = json_decode(file_get_contents("php://input"));
$session_id = $data->session_id ?? '';

if (empty($session_id)) {
    echo json_encode(['error' => 'Missing session ID.']);
    exit;
}

// ⚠️ MUST MATCH THE SECRET KEY FROM ABOVE
$secret_key = 'sk_test_YOUR_PAYMONGO_SECRET_KEY';
$encoded_key = base64_encode($secret_key . ':');

// 1. Ask PayMongo about this session ID
$ch = curl_init('https://api.paymongo.com/v1/checkout_sessions/' . $session_id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Basic ' . $encoded_key
]);
$response = curl_exec($ch);
curl_close($ch);
$result = json_decode($response, true);

// 2. Check if the payment was actually successful
$payments = $result['data']['attributes']['payments'] ?? [];
$is_paid = false;
foreach ($payments as $payment) {
    if ($payment['attributes']['status'] === 'paid') {
        $is_paid = true;
        break;
    }
}

if (!$is_paid) {
    echo json_encode(['error' => 'Payment not completed or failed.']);
    exit;
}

// 3. Save to database for auditing
try {
    $conn->beginTransaction();
    
    // Check if this transaction already exists (prevent duplicate refresh inserts)
    $stmt = $conn->prepare("SELECT donation_id FROM donations WHERE reference_number = ?");
    $stmt->execute([$session_id]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]); // Already saved
        exit;
    }

    // Insert generic anonymous donor
    $stmt = $conn->prepare("INSERT INTO donors (donor_name, donor_type, contact_email) VALUES ('Website Donor', 3, 'anonymous@example.com')");
    $stmt->execute();
    $donor_id = $conn->lastInsertId();

    // Map payment method (1 = Card, 3 = E-Wallet)
    // For simplicity, PayMongo checkout API abstracts this, so we'll log it as E-Wallet (3)
    $payment_method_code = 3; 
    
    // Amount is in centavos, convert back to PHP
    $amount = ($result['data']['attributes']['line_items'][0]['amount']) / 100;

    // Insert donation (Status 2 = Success)
    $stmt = $conn->prepare("INSERT INTO donations (donor_id, amount, reference_number, payment_method, status) VALUES (?, ?, ?, ?, 2)");
    $stmt->execute([$donor_id, $amount, $session_id, $payment_method_code]);

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>