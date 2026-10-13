<?php

require 'db_connect.php';
require 'auth.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Only clear the database token if it belongs to this browser.
// A previously replaced browser cannot log out the newly signed-in browser.
destroyAuthSession(true);

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully.'
]);
