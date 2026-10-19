<?php
/** AES-256-GCM authenticated encryption for donor PII (PHP 7.2+).
 * Never store or commit the key in source code or within the webroot.
 */
require_once __DIR__ . '/donor_private_config.php';

function glDonorEncryptionKey(): string
{
    static $key = null;
    if ($key !== null) return $key;
    $b64 = glRequiredSecret('GL_DONOR_AES256_KEY_B64', 'donor_aes256_key_b64');
    $decoded = base64_decode($b64, true);
    if ($decoded === false || strlen($decoded) !== 32 || base64_encode($decoded) !== $b64) {
        throw new RuntimeException('Donor encryption key must be base64 of exactly 32 random bytes.');
    }
    $key = $decoded;
    return $key;
}

function glDonorAad(string $field, string $reference): string
{
    if (!in_array($field, ['donor_name', 'contact_email'], true) || $reference === '') {
        throw new InvalidArgumentException('Invalid donor encryption context.');
    }
    return 'GuidingLight|donations|' . $field . '|v1|' . $reference;
}

function glEncryptDonor(string $plaintext, string $field, string $reference): string
{
    $nonce = random_bytes(12); // fresh nonce for every field on every row
    $tag = '';
    $ciphertext = openssl_encrypt(
        $plaintext, 'aes-256-gcm', glDonorEncryptionKey(), OPENSSL_RAW_DATA,
        $nonce, $tag, glDonorAad($field, $reference), 16
    );
    if ($ciphertext === false || strlen($tag) !== 16) {
        throw new RuntimeException('Unable to encrypt donor data.');
    }
    return 'v1:' . base64_encode($nonce . $tag . $ciphertext);
}

function glDecryptDonor(string $encoded, string $field, string $reference): string
{
    if (substr($encoded, 0, 3) !== 'v1:') {
        throw new RuntimeException('Unknown donor encryption format.');
    }
    $body = base64_decode(substr($encoded, 3), true);
    if ($body === false || strlen($body) < 28) {
        throw new RuntimeException('Invalid donor ciphertext.');
    }
    $nonce = substr($body, 0, 12);
    $tag = substr($body, 12, 16);
    $ciphertext = substr($body, 28);
    $plaintext = openssl_decrypt(
        $ciphertext, 'aes-256-gcm', glDonorEncryptionKey(), OPENSSL_RAW_DATA,
        $nonce, $tag, glDonorAad($field, $reference)
    );
    if ($plaintext === false) {
        throw new RuntimeException('Donor ciphertext authentication failed.');
    }
    return $plaintext;
}
