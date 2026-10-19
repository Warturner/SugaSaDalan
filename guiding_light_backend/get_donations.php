<?php
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/donor_crypto.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}
requireAdmin();

try {
    glDonorEncryptionKey();
    $stmt = $conn->query(
        'SELECT donation_id, donor_name, contact_email, donor_name_enc, contact_email_enc,
                amount, reference_number, transaction_date, payment_method, status
           FROM donations ORDER BY transaction_date DESC'
    );
    $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($donations as &$donation) {
        $reference = (string) $donation['reference_number'];
        // During the one-time migration only, legacy entries remain readable to
        // Admins. Complete the migration promptly, then all rows use ciphertext.
        $donation['donor_name'] = $donation['donor_name_enc'] !== null
            ? glDecryptDonor((string) $donation['donor_name_enc'], 'donor_name', $reference)
            : $donation['donor_name'];
        $donation['contact_email'] = $donation['contact_email_enc'] !== null
            ? glDecryptDonor((string) $donation['contact_email_enc'], 'contact_email', $reference)
            : $donation['contact_email'];
        unset($donation['donor_name_enc'], $donation['contact_email_enc']);
    }
    unset($donation);
    echo json_encode(['success' => true, 'data' => $donations], JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    error_log('Unable to display donation ledger.');
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Donation ledger temporarily unavailable.']);
}
