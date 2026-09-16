<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"));
$amount = (float)($data->amount ?? 0);
$method_label = $data->payment_method ?? 'E-wallet';

if ($amount <= 0) {
    echo json_encode(['error' => 'Invalid amount.']);
    exit;
}

// ⚠️ REPLACE THIS WITH YOUR PAYMONGO SECRET KEY (starts with sk_...)
$secret_key = 'sk_test_YOUR_PAYMONGO_SECRET_KEY';
$encoded_key = base64_encode($secret_key . ':');

// PayMongo requires amounts in centavos (e.g. PHP 500 = 50000)
$amount_centavos = $amount * 100;

// Grab the exact URL the user is currently on, so we can send them back there
$base_url = strtok($_SERVER['HTTP_REFERER'] ?? 'http://yourdomain.com', '?');

// Determine payment method types for PayMongo
$payment_methods = ['gcash', 'paymaya', 'card']; // Allow all by default

$payload = [
    'data' => [
        'attributes' => [
            'billing' => [
                'name' => 'Streetlight Donor',
                'email' => 'finance@streetlight.org'
            ],
            'send_email_receipt' => false,
            'show_description' => true,
            'show_line_items' => true,
            'payment_method_types' => $payment_methods,
            'line_items' => [
                [
                    'currency' => 'PHP',
                    'amount' => $amount_centavos,
                    'description' => 'Donation via ' . $method_label,
                    'name' => 'Guiding Light Donation',
                    'quantity' => 1
                ]
            ],
            // PayMongo will automatically append "?session_id=cs_xxx" to this URL
            'success_url' => $base_url . '?payment=success', 
            'cancel_url' => $base_url . '?payment=cancelled'
        ]
    ]
];

$ch = curl_init('https://api.paymongo.com/v1/checkout_sessions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . $encoded_key
]);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($http_status === 200 && isset($result['data']['attributes']['checkout_url'])) {
    echo json_encode([
        'success' => true, 
        'checkout_url' => $result['data']['attributes']['checkout_url']
    ]);
} else {
    echo json_encode(['error' => 'Failed to connect to PayMongo.']);
}
?>