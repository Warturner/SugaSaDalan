<?php
require 'db_connect.php';

// Webhooks don't need CORS because they are called server-to-server by PayMongo
header("Content-Type: application/json");

// ⚠️ PLACEHOLDER: You get this secret from the PayMongo Webhook Dashboard
$webhook_secret = 'whsec_test_YOUR_WEBHOOK_SECRET';

// 1. Get the raw payload sent by PayMongo
$payload = file_get_contents('php://input');
$signature_header = $_SERVER['HTTP_PAYMONGO_SIGNATURE'] ?? '';

// 2. Security Check: Verify the signature so hackers can't fake successful payments
// (Commented out for now, you will activate this when you get the real webhook secret)
/*
$te = '';
$li = '';
$parts = explode(',', $signature_header);
foreach ($parts as $part) {
    list($key, $value) = explode('=', $part, 2);
    if ($key === 't') $te = $value;
    if ($key === 'te') $li = $value;
}
$signature = hash_hmac('sha256', $te . '.' . $payload, $webhook_secret);
if (!hash_equals($signature, $li)) {
    http_response_code(400);
    exit('Invalid signature');
}
*/

$event = json_decode($payload, true);

// 3. Process the successful payment event
if (isset($event['data']['type']) && $event['data']['type'] === 'event') {
    $event_type = $event['data']['attributes']['type'];

    if ($event_type === 'checkout_session.payment.paid') {
        
        // Grab the reference number we generated in the checkout script
        $reference_number = $event['data']['attributes']['data']['attributes']['reference_number'];

        // 4. AUTOMATED VERIFICATION: Update the database to Status = 2 (Verified)
        $sql = "UPDATE donations SET status = 2 WHERE reference_number = :ref";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':ref' => $reference_number]);
        
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Donation verified automatically']);
        exit;
    }
}

// Return 200 even for unhandled events so PayMongo knows we received it
http_response_code(200);
echo json_encode(['status' => 'ignored']);
?>