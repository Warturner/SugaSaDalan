<?php

ini_set(
    'session.cookie_lifetime',
    '0'
);

ini_set(
    'session.use_only_cookies',
    '1'
);

ini_set(
    'session.use_strict_mode',
    '1'
);

if (session_status() === PHP_SESSION_NONE) {

    ini_set(
        'session.cookie_httponly',
        '1'
    );

    ini_set(
        'session.cookie_samesite',
        'Lax'
    );

    if (
        isset($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    ) {

        ini_set(
            'session.cookie_secure',
            '1'
        );
    }

    session_start();
}


/*
 * Server-side authentication limits.
 *
 * The frontend already logs inactive admins out
 * after 3 minutes. This server timeout protects
 * sessions when the browser/page is closed.
 */
const AUTH_IDLE_TIMEOUT =
    3 * 60;

const AUTH_ABSOLUTE_TIMEOUT =
    8 * 60 * 60;


/*
 * Completely destroy the authenticated session.
 */
function destroyAuthSession(): void
{
    $_SESSION = [];

    if (
        ini_get(
            'session.use_cookies'
        )
    ) {

        $params =
            session_get_cookie_params();

        setcookie(
            session_name(),
            '',
            [
                'expires' =>
                    time() - 42000,

                'path' =>
                    $params['path'],

                'domain' =>
                    $params['domain'],

                'secure' =>
                    $params['secure'],

                'httponly' =>
                    $params['httponly'],

                'samesite' =>
                    $params['samesite']
                    ?? 'Lax'
            ]
        );
    }

    session_destroy();
}


/*
 * Return the current authenticated user.
 *
 * Also enforces idle and absolute session
 * expiration on the server.
 */
function getCurrentUser(): ?array
{
    if (
        !isset(
            $_SESSION['user_id']
        ) ||
        !isset(
            $_SESSION['username']
        ) ||
        !isset(
            $_SESSION['role']
        )
    ) {

        return null;
    }

    $now =
        time();

    $loggedInAt =
        isset(
            $_SESSION['logged_in_at']
        )
            ? (int)
                $_SESSION[
                    'logged_in_at'
                ]
            : 0;

    $lastActivity =
        isset(
            $_SESSION['last_activity']
        )
            ? (int)
                $_SESSION[
                    'last_activity'
                ]
            : $loggedInAt;


    /*
     * Sessions created before this security
     * update are treated as expired.
     */
    if (
        $loggedInAt <= 0 ||
        $lastActivity <= 0
    ) {

        destroyAuthSession();

        return null;
    }


    $idleTime =
        $now -
        $lastActivity;

    $sessionAge =
        $now -
        $loggedInAt;


    /*
     * Expire after inactivity.
     */
    if (
        $idleTime >
        AUTH_IDLE_TIMEOUT
    ) {

        destroyAuthSession();

        return null;
    }


    /*
     * Require a fresh login after the
     * absolute session lifetime.
     */
    if (
        $sessionAge >
        AUTH_ABSOLUTE_TIMEOUT
    ) {

        destroyAuthSession();

        return null;
    }


    /*
     * The request is authenticated,
     * so refresh activity time.
     */
    $_SESSION['last_activity'] =
        $now;


    return [
        'id' =>
            (int)
            $_SESSION['user_id'],

        'username' =>
            $_SESSION['username'],

        'role' =>
            $_SESSION['role']
    ];
}


/*
 * Require any authenticated account.
 */
function requireAuth(): array
{
    $user =
        getCurrentUser();

    if (!$user) {

        http_response_code(
            401
        );

        echo json_encode([
            'success' => false,
            'error' =>
                'Authentication required.'
        ]);

        exit;
    }

    return $user;
}


/*
 * Require administrator access.
 */
function requireAdmin(): array
{
    $user =
        requireAuth();

    if (
        $user['role'] !==
        'admin'
    ) {

        http_response_code(
            403
        );

        echo json_encode([
            'success' => false,
            'error' =>
                'Administrator privileges required.'
        ]);

        exit;
    }

    return $user;
}


/*
 * Require one of the supplied roles.
 */
function requireRole(
    array $allowedRoles
): array
{
    $user =
        requireAuth();

    if (
        !in_array(
            $user['role'],
            $allowedRoles,
            true
        )
    ) {

        http_response_code(
            403
        );

        echo json_encode([
            'success' => false,
            'error' =>
                'You do not have permission to perform this action.'
        ]);

        exit;
    }

    return $user;
}