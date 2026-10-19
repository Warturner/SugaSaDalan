<?php
/**
 * Runtime secrets. No secret value belongs in this file or in GitHub.
 * Either configure environment variables or store a PHP array in a private
 * directory OUTSIDE the web server's DOCUMENT_ROOT.
 * PHP 7.2-compatible.
 */
function glPrivateConfig(): array
{
    static $config = null;
    if ($config !== null) return $config;

    $config = [];
    $root = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($root !== false) {
        $file = $root . DIRECTORY_SEPARATOR . 'guiding_light_private' . DIRECTORY_SEPARATOR . 'config.php';
        if (is_file($file)) {
            $loaded = require $file;
            if (!is_array($loaded)) {
                throw new RuntimeException('Invalid server-only configuration.');
            }
            $config = $loaded;
        }
    }
    return $config;
}

function glRequiredSecret(string $variable, string $configName): string
{
    $environment = getenv($variable);
    if (is_string($environment) && $environment !== '') return trim($environment);
    $config = glPrivateConfig();
    $value = $config[$configName] ?? null;
    if (!is_string($value) || trim($value) === '') {
        throw new RuntimeException('Required private configuration is missing.');
    }
    return trim($value);
}

function glPublicBaseUrl(): string
{
    $url = rtrim(glRequiredSecret('GL_PUBLIC_BASE_URL', 'public_base_url'), '/');
    $parts = parse_url($url);
    if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) || isset($parts['query']) || isset($parts['fragment'])) {
        throw new RuntimeException('Public site URL is not configured as a valid HTTPS URL.');
    }
    return $url;
}
