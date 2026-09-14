<?php

$allowed_origin = '*'; // <-- Replace with your frontend URL in production

// Set up CORS (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: " . $allowed_origin);
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Database credentials
$host = "sql112.infinityfree.com";
$db_name = "if0_42909551_guiding_light_db";
$username = "if0_42909551"; 
$password = "guidingL1ght26"; //

try {
    // Create a new PDO connection
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    
    // Set the PDO error mode to exception so we can see any problems
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} 
catch(PDOException $e) {
    // If the connection fails, return the error in JSON format
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    die();
}
?>