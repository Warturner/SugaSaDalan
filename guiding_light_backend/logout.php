<?php

require_once 'cors.php';
require 'auth.php';

header("Content-Type: application/json; charset=UTF-8");

// CLEAR SESSION DATA

$_SESSION = [];

// DELETE SESSION COOKIE

if (ini_get("session.use_cookies")) {

    $params =
        session_get_cookie_params();

    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// DESTROY SERVER SESSION JUST TO BE SAFE HEHE

session_destroy();


echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully.'
]);