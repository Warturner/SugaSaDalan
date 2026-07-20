<?php
// Set up CORS (Cross-Origin Resource Sharing) NOTE this please jip
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Database credentials
$host = "localhost";
$db_name = "guiding_light_db";
$username = "root"; // Default XAMPP username
$password = ""; // Default XAMPP password is blank

try {
    // Create a new PDO connection
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    
    // Set the PDO error mode to exception so we can see any problems
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // remove comment the line below if to test the connection later jip
    // echo "Connected successfully to the Guiding Light database!";
} 
catch(PDOException $e) {
    // If the connection fails e luwa ang error in JSON format
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    die();
}
?>