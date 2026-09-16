<?php
require 'db_connect.php';

ini_set('display_errors', 0);
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

$data = json_decode(file_get_contents("php://input"));
$session_id = $data->session_id ?? '';

if (empty($session_id) || $session_id === '{CHECKOUT_SESSION_ID}') {
    echo json_encode(['error' => 'Missing or invalid session ID.']);
    exit;
}

$secret_key = 'sk_test_WHtx1vpQYbWw1Emap4qAzFrC';
$encoded_key = base64_encode($secret_key . ':');

$ch = curl_init('https://api.paymongo.com/v1/checkout_sessions/' . $session_id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Basic ' . $encoded_key
]);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    echo json_encode(['error' => 'Server Connection Error.']);
    exit;
}

$result = json_decode($response, true);

if ($http_status !== 200 || !isset($result['data'])) {
    echo json_encode(['error' => 'PayMongo Error.']);
    exit;
}

$payments = $result['data']['attributes']['payments'] ?? [];
$is_paid = false;
$payment_data = null;

foreach ($payments as $payment) {
    if (isset($payment['attributes']['status']) && $payment['attributes']['status'] === 'paid') {
        $is_paid = true;
        $payment_data = $payment;
        break;
    }
}

if (!$is_paid || !$payment_data) {
    echo json_encode(['error' => 'Payment not completed or failed.']);
    exit;
}

try {
    $conn->beginTransaction();
    
    $stmt = $conn->prepare("SELECT donation_id FROM donations WHERE reference_number = ?");
    $stmt->execute([$session_id]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]); 
        exit;
    }

    $billing = $payment_data['attributes']['billing'] ?? [];
    $donor_name = $billing['name'] ?? 'Anonymous Donor';
    $donor_email = $billing['email'] ?? 'anonymous@example.com';

    $amount = ($result['data']['attributes']['line_items'][0]['amount'] ?? 0) / 100;
    
    // Abstracted as E-Wallet/Card (3)
    // 💡 NEW: Single streamlined INSERT statement for the merged table
    $stmt = $conn->prepare("INSERT INTO donations (donor_name, contact_email, amount, reference_number, payment_method, status) VALUES (?, ?, ?, ?, 3, 2)");
    $stmt->execute([$donor_name, $donor_email, $amount, $session_id]);

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>