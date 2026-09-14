<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Load the PHPMailer files
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get the React form data
$data = json_decode(file_get_contents("php://input"));

// Capture all 4 fields from ContactUs.tsx
$name = htmlspecialchars($data->name ?? '');
$email = filter_var($data->email ?? '', FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars($data->subject ?? 'New Contact Form Inquiry');
$message = htmlspecialchars($data->message ?? '');

if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode(['error' => 'All fields are required.']);
    exit;
}

$mail = new PHPMailer(true);

try {
    // --- 1. SERVER SETTINGS ---
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    
    // THE GMAIL ACCOUNT SENDING THE EMAIL:
    $mail->Username   = 'jcsucaldito17762@liceo.edu.ph'; 
    $mail->Password   = 'lokbzqhaqgudiohp'; // No spaces!
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // --- 2. EMAIL ADDRESSES ---
    // The "From" email MUST match the Username above
    $mail->setFrom('jcsucaldito17762@liceo.edu.ph', 'Guiding Light Website'); 
    
    // The email address where the client actually WANTS to receive the messages
    $mail->addAddress('jcsucaldito17762@liceo.edu.ph', 'Guiding Light Admin'); 
    
    // If the client hits "Reply", it goes straight to the person who filled out the form
    $mail->addReplyTo($email, $name); 

    // --- 3. THE EMAIL CONTENT ---
    $mail->isHTML(true);
    
    // Use the Subject from the React form!
    $mail->Subject = 'Guiding Light Website: ' . $subject;
    
    $mail->Body    = "
        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
            <h2 style='color: #4b5e52;'>New Message from Website</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Subject:</strong> {$subject}</p>
            <hr>
            <p><strong>Message:</strong><br/>" . nl2br($message) . "</p>
        </div>
    ";
    
    $mail->AltBody = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\nMessage:\n{$message}";

    $mail->send();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
?>