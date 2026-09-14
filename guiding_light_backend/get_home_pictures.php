<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Navigate UP from backend, into frontend's public folder
$dir = '../guiding_light_frontend/public/media/Home_Pictures';
$images = [];

// Safety check: Create the folder if the admin hasn't made it yet
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

// Scan the directory for files
$files = scandir($dir);
foreach ($files as $file) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    // Only grab actual image files
    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
        $images[] = $file;
    }
}

// Shuffle the images so it's a random order every time
shuffle($images);

echo json_encode(['success' => true, 'images' => $images]);
?>