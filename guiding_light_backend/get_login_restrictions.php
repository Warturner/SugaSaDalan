<?php
/** List currently restricted, existing staff accounts only. */
require 'db_connect.php';
require 'auth.php';
require_once __DIR__ . '/login_security.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}
requireAdmin();

try {
    // Candidate usernames must be associated with an existing user account.
    // Prevent invented usernames (also rate limited) from appearing as real staff.
    $stmt = $conn->query(
        "SELECT DISTINCT u.user_id, u.username, e.username_hash
           FROM login_security_events e
           JOIN users u ON u.user_id = e.user_id
          WHERE e.event_type = 'login_failed'
            AND e.occurred_at >= (NOW() - INTERVAL 15 MINUTE)
          ORDER BY u.username ASC
          LIMIT 1000"
    );
    $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $restrictions = [];
    $seen = [];
    foreach ($candidates as $candidate) {
        $userId = (int) $candidate['user_id'];
        $hash = loginSecurityUsernameHash($candidate['username']);
        if (isset($seen[$userId]) || !hash_equals($hash, $candidate['username_hash'])) {
            continue;
        }
        $seen[$userId] = true;
        $active = getActiveUsernameRestriction($conn, $hash);
        if ($active === null) {
            continue;
        }
        $restrictions[] = [
            'user_id' => $userId,
            'username' => $candidate['username'],
            'failed_attempts' => $active['failed_attempts'],
            'remaining_seconds' => $active['remaining_seconds']
        ];
    }
    echo json_encode(['success' => true, 'restrictions' => $restrictions], JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    error_log('Unable to load active login restrictions.');
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Unable to load active restrictions.']);
}
