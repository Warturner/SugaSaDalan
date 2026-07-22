<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// ⚠️ PLACEHOLDER: You will replace this with the client's actual Secret Key later
$paymongo_secret_key = 'sk_test_YOUR_PAYMONGO_SECRET_KEY'; 

try {
    $data = json_decode(file_get_contents("php://input"));
    
    $amount = $data->amount ?? 0;
    $donor_name = $data->donorName ?? 'Anonymous Donor';
    $service_id = $data->service_id ?? null; // NULL for general fund
    $email = $data->email ?? 'no-email@provided.com';

    if ($amount < 100) {
        echo json_encode(['error' => 'Minimum donation amount is PHP 100.00']);
        exit;
    }

    // 1. Convert amount to cents (PayMongo requires amounts in cents. PHP 500 = 50000)
    $amount_in_cents = $amount * 100;

    // 2. Generate a unique reference number for your database
    $reference_number = 'PM-' . strtoupper(uniqid());

    // 3. Prepare the PayMongo API Payload
    $payload = [
        'data' => [
            'attributes' => [
                'billing' => [
                    'name' => $donor_name,
                    'email' => $email
                ],
                'send_email_receipt' => true,
                'show_description' => true,
                'show_line_items' => true,
                'description' => 'Donation to Streetlight: Suga sa Dalan',
                'line_items' => [
                    [
                        'currency' => 'PHP',
                        'amount' => $amount_in_cents,
                        'name' => 'Charitable Donation',
                        'quantity' => 1
                    ]
                ],
                'payment_method_types' => ['gcash', 'paymaya', 'card'],
                'reference_number' => $reference_number,
                'success_url' => 'http://localhost:3000/?status=success', // Redirect after payment
                'cancel_url' => 'http://localhost:3000/?status=cancelled'
            ]
        ]
    ];

    // 4. cURL Request to PayMongo
    $ch = curl_init('https://api.paymongo.com/v1/checkout_sessions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Basic ' . base64_encode($paymongo_secret_key . ':')
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($http_code === 200 && isset($result['data']['attributes']['checkout_url'])) {
        
        // 5. Save the PENDING donation to your database so the Webhook can find it later
        // Note: payment_method is 1 (Online/PayMongo), status is 1 (Pending)
        $sql = "INSERT INTO donations (amount, reference_number, payment_method, status, service_id) 
                VALUES (:amount, :ref, 1, 1, :service_id)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':amount' => $amount,
            ':ref' => $reference_number,
            ':service_id' => $service_id
        ]);

        // 6. Send the URL back to React so it can redirect the user
        echo json_encode([
            'success' => true, 
            'checkout_url' => $result['data']['attributes']['checkout_url']
        ]);
    } else {
        echo json_encode(['error' => 'PayMongo API Error', 'details' => $result]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
?>