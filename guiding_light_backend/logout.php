<?php

require_once 'cors.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed.'
    ]);

    exit;
}

// CLEAR SESSION DATA

destroyAuthSession();


echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully.'
]);