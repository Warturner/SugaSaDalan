<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

// Get the JSON data sent from React
$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

// Basic validation
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode(['error' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['error' => 'Invalid email address format.']);
    exit;
}

// =========================================================
// EMAIL CONFIGURATION
// =========================================================
$to_email = "your_ngo_email@example.com"; // <--- CHANGE THIS TO THE REAL NGO EMAIL
$email_subject = "New Website Contact: " . $subject;

// Construct the email body
$email_body = "You have received a new message from the Guiding Light website contact form.\n\n";
$email_body .= "Name: {$name}\n";
$email_body .= "Email Address: {$email}\n";
$email_body .= "Subject: {$subject}\n\n";
$email_body .= "Message:\n-----------------------------------\n";
$email_body .= "{$message}\n";
$email_body .= "-----------------------------------\n";

// Headers
$headers = "From: noreply@guidinglight.org\r\n"; // Make this look official
$headers .= "Reply-To: {$email}\r\n"; // This allows the NGO to hit "Reply" and email the user directly
$headers .= "X-Mailer: PHP/" . phpversion();

// Send the email
if (mail($to_email, $email_subject, $email_body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully.']);
} else {
    echo json_encode(['error' => 'Failed to send email. Please check server configuration.']);
}
?>