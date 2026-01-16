<?php
/**
 * WhatsApp Webhook API
 * Handles WhatsApp Business API integration
 * Upload to: public_html/api/whatsapp-webhook.php
 */

require_once 'config.php';

// WhatsApp Business API Configuration
// Get these from Meta Business Suite > WhatsApp > API Setup
$WHATSAPP_TOKEN = getenv('HMM_WHATSAPP_TOKEN') ?: '';
$WHATSAPP_PHONE_ID = getenv('HMM_WHATSAPP_PHONE_ID') ?: '';
$VERIFY_TOKEN = getenv('HMM_WHATSAPP_VERIFY') ?: 'hmm_webhook_verify_2024';

// Handle webhook verification (GET request from Meta)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mode = $_GET['hub_mode'] ?? '';
    $token = $_GET['hub_verify_token'] ?? '';
    $challenge = $_GET['hub_challenge'] ?? '';
    
    if ($mode === 'subscribe' && $token === $VERIFY_TOKEN) {
        echo $challenge;
        exit();
    } else {
        http_response_code(403);
        exit();
    }
}

// Handle incoming messages (POST request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        json_response(['error' => 'Invalid input'], 400);
    }
    
    // Log incoming webhook
    error_log("WhatsApp webhook received: " . json_encode($input));
    
    // Process incoming message
    if (isset($input['entry'][0]['changes'][0]['value']['messages'])) {
        $message = $input['entry'][0]['changes'][0]['value']['messages'][0];
        $from = $message['from'];
        $text = $message['text']['body'] ?? '';
        
        // Store message in database
        storeWhatsAppMessage($from, $text, 'incoming');
        
        // Send auto-reply
        sendWhatsAppMessage($from, "Thanks for reaching out to HireMediaMind! We'll get back to you shortly. For immediate assistance, visit hiremediamind.com");
    }
    
    json_response(['success' => true]);
}

// Send WhatsApp message
function sendWhatsAppMessage($to, $message) {
    global $WHATSAPP_TOKEN, $WHATSAPP_PHONE_ID;
    
    if (empty($WHATSAPP_TOKEN) || empty($WHATSAPP_PHONE_ID)) {
        error_log("WhatsApp API not configured");
        return false;
    }
    
    $url = "https://graph.facebook.com/v18.0/{$WHATSAPP_PHONE_ID}/messages";
    
    $data = [
        'messaging_product' => 'whatsapp',
        'to' => $to,
        'type' => 'text',
        'text' => ['body' => $message]
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $WHATSAPP_TOKEN,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Log outgoing message
    storeWhatsAppMessage($to, $message, 'outgoing');
    
    return $httpCode === 200;
}

function storeWhatsAppMessage($phone, $message, $direction) {
    global $pdo;
    
    try {
        // Create whatsapp_messages table if not exists
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS whatsapp_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(50) NOT NULL,
                message TEXT,
                direction ENUM('incoming', 'outgoing') NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $stmt = $pdo->prepare("INSERT INTO whatsapp_messages (phone, message, direction) VALUES (:phone, :message, :direction)");
        $stmt->execute([':phone' => $phone, ':message' => $message, ':direction' => $direction]);
    } catch (PDOException $e) {
        error_log("WhatsApp message log error: " . $e->getMessage());
    }
}

// API endpoint to send message from admin panel
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['phone']) || empty($input['message'])) {
        json_response(['error' => 'Phone and message required'], 400);
    }
    
    $phone = preg_replace('/[^0-9]/', '', $input['phone']);
    $message = sanitize_input($input['message']);
    
    if (sendWhatsAppMessage($phone, $message)) {
        json_response(['success' => true, 'message' => 'WhatsApp message sent']);
    } else {
        json_response(['error' => 'Failed to send WhatsApp message'], 500);
    }
}
