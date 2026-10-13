<?php

require 'db_connect.php';
require 'auth.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$currentUser = requireAdmin();

/**
 * Never delete arbitrary paths from stored DB text.
 * Only remove an image from the dedicated team upload directory.
 */
function removeOldTeamImage(string $storedPath): void
{
    if ($storedPath === '' || strpos($storedPath, 'uploads/team/') !== 0) {
        return;
    }

    $filename = basename($storedPath);
    if (!preg_match('/^team_[a-zA-Z0-9._-]+\.(?:jpe?g|jfif|png|webp|gif)$/i', $filename)) {
        return;
    }

    $file = __DIR__ . '/uploads/team/' . $filename;
    if (is_file($file) && !@unlink($file)) {
        error_log('Could not remove superseded team photo.');
    }
}

$newImageAbsolute = null;

try {
    $id = isset($_POST['id']) && $_POST['id'] !== ''
        ? filter_var($_POST['id'], FILTER_VALIDATE_INT)
        : null;

    if ($id === false || ($id !== null && $id <= 0)) {
        throw new InvalidArgumentException('Invalid team member ID.');
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $role = trim((string) ($_POST['role'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $displayOrder = isset($_POST['display_order'])
        ? filter_var($_POST['display_order'], FILTER_VALIDATE_INT)
        : 999;

    if ($name === '' || $role === '' ||
        mb_strlen($name) > 255 || mb_strlen($role) > 255 ||
        mb_strlen($email) > 255) {
        throw new InvalidArgumentException('Invalid team member details.');
    }
    if ($displayOrder === false || $displayOrder < 1) {
        throw new InvalidArgumentException('Display order must be at least 1.');
    }

    $existingImage = null;
    if ($id !== null) {
        $stmt = $conn->prepare(
            'SELECT image_path FROM team_members WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Team member not found.']);
            exit;
        }
        $existingImage = $existing['image_path'];
    }

    $imagePath = $existingImage;
    if (isset($_FILES['image'])) {
        $file = $_FILES['image'];
        $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

        if ($error !== UPLOAD_ERR_NO_FILE) {
            if ($error !== UPLOAD_ERR_OK) {
                throw new InvalidArgumentException('Team photo upload failed.');
            }

            $size = (int) ($file['size'] ?? 0);
            if ($size < 1 || $size > 5 * 1024 * 1024) {
                throw new InvalidArgumentException('Team photo must not exceed 5 MB.');
            }

            $tmp = (string) ($file['tmp_name'] ?? '');
            if ($tmp === '' || !is_uploaded_file($tmp)) {
                throw new InvalidArgumentException('Invalid uploaded image.');
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($tmp);
            $allowed = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif'
            ];

            // MIME sniffing plus image decoder header validation.
            if (!is_string($mime) || !isset($allowed[$mime]) ||
                @getimagesize($tmp) === false) {
                throw new InvalidArgumentException(
                    'Only valid JPG, PNG, WEBP, and GIF images are allowed.'
                );
            }

            $dir = __DIR__ . '/uploads/team/';
            if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
                throw new RuntimeException('Unable to create team upload directory.');
            }

            $filename = 'team_' . bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
            $newImageAbsolute = $dir . $filename;
            if (!move_uploaded_file($tmp, $newImageAbsolute)) {
                throw new RuntimeException('Failed to save team photo.');
            }
            $imagePath = 'uploads/team/' . $filename;
        }
    }

    if ($id !== null) {
        $stmt = $conn->prepare(
            'UPDATE team_members
             SET name = ?, role = ?, email = ?, image_path = ?, display_order = ?
             WHERE id = ?'
        );
        $stmt->execute([$name, $role, $email, $imagePath, $displayOrder, $id]);
    } else {
        $stmt = $conn->prepare(
            'INSERT INTO team_members (name, role, email, image_path, display_order)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$name, $role, $email, $imagePath, $displayOrder]);
    }

    // Delete the previous image only AFTER the database write succeeded.
    if ($newImageAbsolute !== null && is_string($existingImage)) {
        removeOldTeamImage($existingImage);
    }

    echo json_encode([
        'success' => true,
        'message' => $id !== null
            ? 'Team member updated successfully.'
            : 'Team member created successfully.'
    ]);
} catch (InvalidArgumentException $e) {
    if ($newImageAbsolute !== null && is_file($newImageAbsolute)) {
        @unlink($newImageAbsolute);
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    if ($newImageAbsolute !== null && is_file($newImageAbsolute)) {
        @unlink($newImageAbsolute);
    }
    error_log('Failed to save team member.');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to save team member.']);
}
