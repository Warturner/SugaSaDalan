<?php

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://suga-sa-dalan.vercel.app'
];

$origin =
    $_SERVER['HTTP_ORIGIN'] ?? '';

if (
    $origin !== '' &&
    in_array(
        $origin,
        $allowedOrigins,
        true
    )
) {

    header(
        'Access-Control-Allow-Origin: ' .
        $origin
    );

    header(
        'Access-Control-Allow-Credentials: true'
    );

    header(
        'Vary: Origin'
    );
}

header(
    'Access-Control-Allow-Headers: Content-Type, Authorization'
);

header(
    'Access-Control-Allow-Methods: GET, POST, OPTIONS'
);

if (
    $_SERVER['REQUEST_METHOD'] === 'OPTIONS'
) {

    http_response_code(200);
    exit;
}