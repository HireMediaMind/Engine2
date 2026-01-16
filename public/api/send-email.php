<?php
/**
 * Email Sending API
 * Handles transactional and automated emails
 * Upload to: public_html/api/send-email.php
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

// SMTP Configuration - Using Hostinger email
$SMTP_HOST = 'smtp.hostinger.com';
$SMTP_PORT = 465;
$SMTP_USER = 'team@hiremediamind.com';
$SMTP_PASS = 'Himjeet@3812';
$FROM_NAME = 'HireMediaMind Team';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    json_response(['error' => 'Invalid JSON input'], 400);
}

// Validate required fields
$required = ['to', 'subject', 'body'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        json_response(['error' => "Missing required field: $field"], 400);
    }
}

$to = filter_var($input['to'], FILTER_SANITIZE_EMAIL);
$subject = sanitize_input($input['subject']);
$body = $input['body']; // HTML allowed
$isHtml = isset($input['html']) ? (bool)$input['html'] : true;

// Validate email
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Invalid email address'], 400);
}

try {
    // Use PHP mail() or integrate with PHPMailer
    // For production, recommend using PHPMailer library
    
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = $isHtml ? 'Content-type: text/html; charset=UTF-8' : 'Content-type: text/plain; charset=UTF-8';
    $headers[] = "From: $FROM_NAME <$SMTP_USER>";
    $headers[] = "Reply-To: $SMTP_USER";
    $headers[] = 'X-Mailer: PHP/' . phpversion();
    
    $success = mail($to, $subject, $body, implode("\r\n", $headers));
    
    if ($success) {
        // Log email sent
        logEmail($to, $subject, 'sent');
        json_response(['success' => true, 'message' => 'Email sent successfully']);
    } else {
        logEmail($to, $subject, 'failed');
        json_response(['error' => 'Failed to send email'], 500);
    }
    
} catch (Exception $e) {
    error_log("Email send error: " . $e->getMessage());
    json_response(['error' => 'Email service error'], 500);
}

function logEmail($to, $subject, $status) {
    global $pdo;
    
    try {
        // Create email_logs table if not exists
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS email_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recipient VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                status VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $stmt = $pdo->prepare("INSERT INTO email_logs (recipient, subject, status) VALUES (:to, :subject, :status)");
        $stmt->execute([':to' => $to, ':subject' => $subject, ':status' => $status]);
    } catch (PDOException $e) {
        error_log("Email log error: " . $e->getMessage());
    }
}
