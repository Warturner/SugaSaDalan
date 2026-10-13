<?php

require 'db_connect.php';
require 'auth.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

// Passive check: do not extend the existing 3-minute inactivity timeout.
$user = getCurrentUser(false);

if (!$user) {
    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'user' => null,
        'reason' => $GLOBALS['auth_failure_reason'] ?? null
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'authenticated' => true,
    'user' => $user,
    'reason' => null
]);
