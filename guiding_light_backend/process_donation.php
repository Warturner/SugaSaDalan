<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

$data = json_decode(file_get_contents("php://input"));
$amount = (float)($data->amount ?? 0);
$method_label = $data->payment_method ?? 'E-wallet';

if ($amount <= 0) {
    echo json_encode(['error' => 'Invalid amount.']);
    exit;
}

$secret_key = 'sk_test_WHtx1vpQYbWw1Emap4qAzFrC';
$encoded_key = base64_encode($secret_key . ':');
$amount_centavos = $amount * 100;
$base_url = strtok($_SERVER['HTTP_REFERER'] ?? 'http://yourdomain.com', '?');

$payload = [
    'data' => [
        'attributes' => [
            'billing' => [
                'name' => 'Anonymous',
                'email' => 'finance@streetlight.org' // TO-DO: Change for client later
            ],
            'send_email_receipt' => true,
            'show_description' => true,
            'show_line_items' => true,
            'payment_method_types' => ['gcash', 'paymaya', 'card'],
            'line_items' => [
                [
                    'currency' => 'PHP',
                    'amount' => $amount_centavos,
                    'description' => 'Donation via ' . $method_label,
                    'name' => 'Guiding Light Donation',
                    'quantity' => 1
                ]
            ],
            // 💡 FIXED: We removed the {CHECKOUT_SESSION_ID} trap!
            'success_url' => $base_url . '?payment=success', 
            'cancel_url' => $base_url . '?payment=cancelled'
        ]
    ]
];

$ch = curl_init('https://api.paymongo.com/v1/checkout_sessions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // InfinityFree SSL bypass
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
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
        'checkout_url' => $result['data']['attributes']['checkout_url'],
        'session_id' => $result['data']['id'] // 💡 EXPORT THE REAL ID DIRECTLY TO REACT!
    ]);
} else {
    echo json_encode(['error' => 'Failed to connect to PayMongo.']);
}
?>