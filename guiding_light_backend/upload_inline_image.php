<?php
require 'db_connect.php';
require 'auth.php';

$currentUser = requireRole(['admin', 'media']);

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

try {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['error' => 'No image uploaded or upload error.']);
        exit;
    }

    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.']);
        exit;
    }

    // Ensure the uploads directory exists
    $uploadDir = 'uploads/stories/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate a safe, unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'inline_' . uniqid() . '_' . time() . '.' . $extension;
    $destination = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Return the full public URL so Tiptap can display it
        $baseUrl = "/guiding_light_backend/";
        echo json_encode([
            'success' => true,
            'url' => $baseUrl . $destination
        ]);
    } else {
        echo json_encode(['error' => 'Failed to move uploaded file.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
?>