<?php
require_once 'cors.php';
$host = "sql112.infinityfree.com";
$db_name = "if0_42909551_guiding_light_db";
$username = "if0_42909551"; 
$password = "guidingL1ght26"; //

try {
    // Create a new PDO connection
    $conn = new PDO(
    "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
    $username,
    $password,
    [
        PDO::ATTR_ERRMODE =>
            PDO::ERRMODE_EXCEPTION,

        PDO::ATTR_DEFAULT_FETCH_MODE =>
            PDO::FETCH_ASSOC,

        PDO::ATTR_EMULATE_PREPARES =>
            false
    ]
);
    

} 
catch(PDOException $e) {
    // If the connection fails, return the error in JSON format
    http_response_code(500);

    echo json_encode([
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    die();
}
?>