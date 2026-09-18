<?php

if (session_status() === PHP_SESSION_NONE) {

    // Prevent JavaScript from reading the session cookie
    ini_set('session.cookie_httponly', '1');

    // Helps protect against cross-site request attacks
    ini_set('session.cookie_samesite', 'Lax');

    // Use secure cookies automatically when HTTPS is active
    if (
        isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    ) {
        ini_set('session.cookie_secure', '1');
    }

    session_start();
}

// GET CURRENT LOGGED-IN USER

function getCurrentUser(): ?array
{
    if (
        !isset($_SESSION['user_id']) ||
        !isset($_SESSION['username']) ||
        !isset($_SESSION['role'])
    ) {
        return null;
    }

    return [
        'id' => (int) $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role']
    ];
}

// REQUIRE LOGIN

function requireAuth(): array
{
    $user = getCurrentUser();

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'error' => 'Authentication required.'
        ]);

        exit;
    }

    return $user;
}

// REQUIRE ADMIN ROLE

function requireAdmin(): array
{
    $user = requireAuth();

    if ($user['role'] !== 'admin') {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'error' => 'Administrator privileges required.'
        ]);

        exit;
    }

    return $user;
}

// REQUIRE ONE OF MULTIPLE ROLES

function requireRole(array $allowedRoles): array
{
    $user = requireAuth();

    if (!in_array($user['role'], $allowedRoles, true)) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'error' => 'You do not have permission to perform this action.'
        ]);

        exit;
    }

    return $user;
}