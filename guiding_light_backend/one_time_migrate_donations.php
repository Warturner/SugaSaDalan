<?php
/**
 * TEMPORARY ADMIN-ONLY migration of historical donation PII.
 * Delete this file from production once all rows are migrated and verified.
 */
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/donor_crypto.php';
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    http_response_code(405);
    exit('Method not allowed.');
}
$admin = requireAdmin();
if (!isset($_SESSION['gl_donor_migration_csrf'])) {
    $_SESSION['gl_donor_migration_csrf'] = bin2hex(random_bytes(32));
}
$message = '';
$error = '';

try {
    glDonorEncryptionKey();
    if ($method === 'POST') {
        $rawToken = $_POST['csrf'] ?? null;
        $password = $_POST['admin_password'] ?? null;
        if (!is_string($rawToken) || !hash_equals($_SESSION['gl_donor_migration_csrf'], $rawToken) ||
            !is_string($password) || $password === '' || strlen($password) > 256) {
            throw new InvalidArgumentException('Missing or invalid authorization.');
        }
        $authStmt = $conn->prepare('SELECT password_hash FROM users WHERE user_id = :id AND role = :role LIMIT 1');
        $authStmt->execute([':id' => (int) $admin['id'], ':role' => 'admin']);
        $adminRecord = $authStmt->fetch(PDO::FETCH_ASSOC);
        if (!$adminRecord || !password_verify($password, (string) $adminRecord['password_hash'])) {
            throw new InvalidArgumentException('Incorrect Admin password. No records were changed.');
        }

        $conn->beginTransaction();
        $stmt = $conn->query(
            'SELECT donation_id, reference_number, donor_name, contact_email,
                    donor_name_enc, contact_email_enc
               FROM donations
              WHERE donor_name_enc IS NULL OR contact_email_enc IS NULL
              ORDER BY donation_id ASC LIMIT 50 FOR UPDATE'
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $update = $conn->prepare(
            "UPDATE donations SET donor_name = '[Encrypted]', contact_email = '[Encrypted]',
                                 donor_name_enc = :name_enc, contact_email_enc = :email_enc
              WHERE donation_id = :id"
        );
        foreach ($rows as $row) {
            $reference = (string) $row['reference_number'];
            if ($reference === '') throw new RuntimeException('A donation has an invalid reference.');
            $nameEnc = $row['donor_name_enc'];
            $emailEnc = $row['contact_email_enc'];
            if ($nameEnc === null) {
                if ($row['donor_name'] === '[Encrypted]') {
                    throw new RuntimeException('Historical donor name is missing before encryption.');
                }
                $nameEnc = glEncryptDonor((string) ($row['donor_name'] ?? ''), 'donor_name', $reference);
            } else {
                glDecryptDonor((string) $nameEnc, 'donor_name', $reference);
            }
            if ($emailEnc === null) {
                if ($row['contact_email'] === '[Encrypted]') {
                    throw new RuntimeException('Historical donor email is missing before encryption.');
                }
                $emailEnc = glEncryptDonor((string) ($row['contact_email'] ?? ''), 'contact_email', $reference);
            } else {
                glDecryptDonor((string) $emailEnc, 'contact_email', $reference);
            }
            // Verify the exact values decrypt successfully before touching plaintext.
            glDecryptDonor((string) $nameEnc, 'donor_name', $reference);
            glDecryptDonor((string) $emailEnc, 'contact_email', $reference);
            $update->execute([':name_enc' => $nameEnc, ':email_enc' => $emailEnc,
                              ':id' => (int) $row['donation_id']]);
        }
        $conn->commit();
        $message = count($rows) . ' existing donation(s) encrypted and legacy columns masked.';
        // New token for the next operation; password is never saved.
        $_SESSION['gl_donor_migration_csrf'] = bin2hex(random_bytes(32));
    }
    $remaining = (int) $conn->query(
        'SELECT COUNT(*) FROM donations WHERE donor_name_enc IS NULL OR contact_email_enc IS NULL'
    )->fetchColumn();
    $total = (int) $conn->query('SELECT COUNT(*) FROM donations')->fetchColumn();
} catch (InvalidArgumentException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(403);
    $error = $e->getMessage();
} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    error_log('Unable to migrate historical donor data.');
    $error = 'Migration did not complete. No records in the current batch were changed. Check server setup and logs.';
}
$escape = function ($value) { return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); };
?>
<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>One-time Donor Encryption Migration</title></head>
<body style="max-width:720px;margin:40px auto;padding:24px;font:16px/1.6 system-ui,Arial,sans-serif">
<h1>One-time Donor Encryption Migration</h1>
<p>Admin-only utility. Back up the database before using this page. Each submission converts at most 50 historical donations in a single database transaction, then masks the old plaintext columns.</p>
<?php if ($message !== ''): ?><p style="color:green" role="status"><?php echo $escape($message); ?></p><?php endif; ?>
<?php if ($error !== ''): ?><p style="color:darkred" role="alert"><?php echo $escape($error); ?></p><?php endif; ?>
<?php if (isset($remaining)): ?>
<p><strong>Pending:</strong> <?php echo $remaining; ?> of <?php echo $total; ?> donation(s).</p>
<?php if ($remaining > 0): ?>
<form method="post" autocomplete="off">
<input type="hidden" name="csrf" value="<?php echo $escape($_SESSION['gl_donor_migration_csrf']); ?>" />
<p><label>Current Admin password<br/><input type="password" name="admin_password" required autocomplete="current-password" maxlength="256" style="padding:10px;min-width:260px" /></label></p>
<p><button type="submit" style="padding:12px 24px">Encrypt next 50 donation records</button></p>
</form>
<?php else: ?>
<p style="color:green"><strong>All historical donation rows have encrypted fields.</strong> Run the verification SQL, test the ledger, and DELETE this PHP file from the server.</p>
<?php endif; ?>
<?php endif; ?>
</body></html>
