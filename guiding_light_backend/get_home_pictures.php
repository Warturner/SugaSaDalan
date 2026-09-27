<?php
require_once 'cors.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed.'
    ]);

    exit;
}

// Point directly to the media folder inside htdocs
$dir = $_SERVER['DOCUMENT_ROOT'] . '/media/Home_Pictures';
$images = [];

// Safety check: Create the folder if it doesn't exist
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

// Scan the directory for files
if ($handle = opendir($dir)) {
    while (false !== ($file = readdir($handle))) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
            $images[] = $file;
        }
    }
    closedir($handle);
}

// Shuffle the images
shuffle($images);

echo json_encode(['success' => true, 'images' => $images]);
?>