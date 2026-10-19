<?php
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/donor_crypto.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

try {
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || strlen($raw) > 2048) throw new InvalidArgumentException('Invalid verification request.');
    $data = json_decode($raw, true);
    $session = is_array($data) ? ($data['session_id'] ?? null) : null;
    if (!is_string($session) || !preg_match('/^[a-zA-Z0-9_-]{6,100}$/D', $session)) {
        throw new InvalidArgumentException('Missing or invalid session ID.');
    }

    // Fail before calling PayMongo if encryption isn't configured correctly.
    glDonorEncryptionKey();
    $key = glRequiredSecret('GL_PAYMONGO_SECRET_KEY', 'paymongo_secret_key');
    $ch = curl_init('https://api.paymongo.com/v1/checkout_sessions/' . rawurlencode($session));
    if ($ch === false) throw new RuntimeException('Unable to connect to payment service.');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['Authorization: Basic ' . base64_encode($key . ':')]
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $result = is_string($response) ? json_decode($response, true) : null;
    if ($status !== 200 || !is_array($result) || !isset($result['data']['attributes'])) {
        throw new RuntimeException('Payment verification failed.');
    }

    // Only confirmed PAID payments may be recorded.
    $attributes = $result['data']['attributes'];
    $payments = $attributes['payments'] ?? [];
    $paid = null;
    if (is_array($payments)) {
        foreach ($payments as $payment) {
            if (($payment['attributes']['status'] ?? '') === 'paid') {
                $paid = $payment;
                break;
            }
        }
    }
    if ($paid === null) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'Payment not completed or failed.']);
        exit;
    }
    $lineItems = $attributes['line_items'] ?? [];
    $centavos = $lineItems[0]['amount'] ?? null;
    if (!is_numeric($centavos) || (float) $centavos <= 0 || (float) $centavos > 9999999 ||
        (float) $centavos != floor((float) $centavos)) {
        throw new RuntimeException('Invalid verified payment amount.');
    }
    $amount = number_format(((float) $centavos) / 100, 2, '.', '');

    $paymentBilling = $paid['attributes']['billing'] ?? [];
    $checkoutBilling = $attributes['billing'] ?? [];
    $donorName = is_array($paymentBilling) ? ($paymentBilling['name'] ?? '') : '';
    $donorEmail = is_array($paymentBilling) ? ($paymentBilling['email'] ?? '') : '';
    if (!is_string($donorName) || trim($donorName) === '') {
        $donorName = is_array($checkoutBilling) ? ($checkoutBilling['name'] ?? '') : '';
    }
    if (!is_string($donorEmail) || trim($donorEmail) === '') {
        $donorEmail = is_array($checkoutBilling) ? ($checkoutBilling['email'] ?? '') : '';
    }
    // Never invent a name. Still record legitimately paid gifts if PayMongo
    // omits billing details in its verification response.
    $donorName = is_string($donorName) && trim($donorName) !== '' ? trim($donorName) : '[Not returned by PayMongo]';
    $donorEmail = is_string($donorEmail) && trim($donorEmail) !== '' ? trim($donorEmail) : '[Not returned by PayMongo]';
    if (strlen($donorName) > 4096 || strlen($donorEmail) > 4096) {
        throw new RuntimeException('Payment provider returned oversized billing fields.');
    }

    // The reference number is authenticated as AES-GCM associated data.
    $nameEnc = glEncryptDonor($donorName, 'donor_name', $session);
    $emailEnc = glEncryptDonor($donorEmail, 'contact_email', $session);

    $conn->beginTransaction();
    $existing = $conn->prepare('SELECT donation_id FROM donations WHERE reference_number = :reference LIMIT 1');
    $existing->execute([':reference' => $session]);
    if ($existing->fetchColumn() !== false) {
        $conn->rollBack();
        echo json_encode(['success' => true, 'already_recorded' => true]);
        exit;
    }
    // Legacy columns hold constant markers only; real PII is encrypted in
    // donor_name_enc/contact_email_enc. Unique reference prevents duplicates.
    $stmt = $conn->prepare(
        "INSERT INTO donations
            (donor_name, contact_email, donor_name_enc, contact_email_enc,
             amount, reference_number, payment_method, status)
         VALUES ('[Encrypted]', '[Encrypted]', :name_enc, :email_enc,
                 :amount, :reference, 3, 2)"
    );
    $stmt->execute([
        ':name_enc' => $nameEnc, ':email_enc' => $emailEnc,
        ':amount' => $amount, ':reference' => $session
    ]);
    $conn->commit();
    echo json_encode(['success' => true]);
} catch (InvalidArgumentException $e) {
    if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    if (isset($conn) && $conn instanceof PDO && $conn->inTransaction()) $conn->rollBack();
    error_log('Unable to verify and record PayMongo donation.');
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Donation verification is temporarily unavailable. Please contact the organization if payment was completed.']);
}
