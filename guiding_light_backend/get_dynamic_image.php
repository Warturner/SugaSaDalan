<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$requested_folder = $_GET['folder'] ?? 'About_Pictures';

// Getting the absolute root path and formatting slashes for Windows
$project_root = str_replace('\\', '/', dirname(__DIR__)); 
$dir = $project_root . '/guiding_light_frontend/public/media/' . $requested_folder;

// Output exactly what PHP sees
echo json_encode([
    '1_Looking_In_This_Exact_Folder' => $dir,
    '2_Does_Folder_Exist' => is_dir($dir) ? "Yes" : "No",
    '3_Files_Found' => is_dir($dir) ? scandir($dir) : "Folder not found"
], JSON_PRETTY_PRINT);
?>