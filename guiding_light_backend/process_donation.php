<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/donor_private_config.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

try {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || strlen($raw) > 4096) throw new InvalidArgumentException('Invalid donation request.');
    $data = json_decode($raw, true);
    if (!is_array($data)) throw new InvalidArgumentException('Invalid donation request.');

    $value = $data['amount'] ?? null;
    if (!is_numeric($value)) {
        throw new InvalidArgumentException('Donation amount is required.');
    }
    $amount = (float) $value;
    if (!is_finite($amount) || $amount < 0.01 || $amount > 99999.99 || abs($amount - round($amount, 2)) > 0.000001) {
        throw new InvalidArgumentException('Please provide a valid donation amount (up to PHP 99,999.99).');
    }
    // Test-mode checkout defaults. PayMongo may let donors edit billing fields.
    // Any final billing returned by PayMongo is encrypted by verify_donation.php.
    $name = 'Anonymous';
    $email = 'streetlight.sugasadalan.ngo@gmail.com';

    $key = glRequiredSecret('GL_PAYMONGO_SECRET_KEY', 'paymongo_secret_key');
    $publicUrl = glPublicBaseUrl();
    $centavos = (int) round($amount * 100);
    $payload = [
        'data' => ['attributes' => [
            'billing' => ['name' => $name, 'email' => $email],
            'send_email_receipt' => true,
            'show_description' => true,
            'show_line_items' => true,
            'payment_method_types' => ['gcash', 'paymaya', 'card'],
            'line_items' => [[
                'currency' => 'PHP', 'amount' => $centavos,
                'description' => 'Donation via PayMongo',
                'name' => 'Guiding Light Donation', 'quantity' => 1
            ]],
            'success_url' => $publicUrl . '?payment=success',
            'cancel_url' => $publicUrl . '?payment=cancelled'
        ]]
    ];

    $ch = curl_init('https://api.paymongo.com/v1/checkout_sessions');
    if ($ch === false) throw new RuntimeException('Unable to initialize payment service.');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($key . ':')
        ]
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $result = is_string($response) ? json_decode($response, true) : null;
    $checkout = $result['data']['attributes']['checkout_url'] ?? null;
    $session = $result['data']['id'] ?? null;
    if ($status < 200 || $status >= 300 || !is_string($checkout) || !is_string($session) ||
        filter_var($checkout, FILTER_VALIDATE_URL) === false || substr($checkout, 0, 8) !== 'https://') {
        throw new RuntimeException('Payment checkout could not be created.');
    }
    echo json_encode(['success' => true, 'checkout_url' => $checkout, 'session_id' => $session]);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('Unable to initialize PayMongo checkout.');
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Donation checkout is temporarily unavailable.']);
}
