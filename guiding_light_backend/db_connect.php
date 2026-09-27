<?php
require_once 'cors.php';
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