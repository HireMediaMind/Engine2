<?php
/**
 * Chat Proxy for n8n Integration
 * Forwards requests from Client Preview to n8n Webhooks securely.
 * Upload to: public_html/api/chat-proxy.php
 */

require_once 'config.php';

header('Content-Type: application/json');

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['token']) || !isset($input['message'])) {
    json_response(['error' => 'Missing token or message'], 400);
}

$token = sanitize_input($input['token']);
$message = sanitize_input($input['message']);
// Optional: Pass history if n8n supports it
$history = isset($input['history']) ? $input['history'] : [];

try {
    // 1. Verify Token and Get Webhook URL from DB
    $stmt = $pdo->prepare("SELECT chatbot_config FROM client_previews WHERE token = :token");
    $stmt->execute([':token' => $token]);
    $preview = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$preview) {
        json_response(['error' => 'Invalid token'], 404);
    }

    $config = json_decode($preview['chatbot_config'], true);
    $webhookUrl = isset($config['webhook_url']) ? $config['webhook_url'] : null;

    if (!$webhookUrl) {
        // Fallback to mock response if no webhook configured
        json_response([
            'role' => 'assistant',
            'content' => "Mock Response: I received your message: '$message'. (Configure n8n Webhook URL in Admin Panel for real AI responses)"
        ]);
    }

    // 2. Forward to n8n
    // Prepare payload for n8n
    $n8nPayload = json_encode([
        'message' => $message,
        'chatId' => $token, // Use token as a session ID/Chat ID
        'history' => $history,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $n8nPayload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Wait up to 30s for AI response

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300 && $response) {
        // n8n should return JSON like { "output": "AI response text" } or simply the text
        // Adjust parsing based on your n8n workflow output

        $jsonResponse = json_decode($response, true);
        $aiContent = '';

        if (is_array($jsonResponse)) {
            // Flexible handling for different n8n output formats
            if (isset($jsonResponse['output']))
                $aiContent = $jsonResponse['output'];
            elseif (isset($jsonResponse['text']))
                $aiContent = $jsonResponse['text'];
            elseif (isset($jsonResponse['message']))
                $aiContent = $jsonResponse['message'];
            elseif (isset($jsonResponse['content']))
                $aiContent = $jsonResponse['content'];
            else
                $aiContent = json_encode($jsonResponse); // Fallback
        } else {
            $aiContent = $response; // Plain text response
        }

        json_response(['role' => 'assistant', 'content' => $aiContent]);

    } else {
        error_log("n8n Proxy Error: $curlError (HTTP $httpCode)");
        json_response(['error' => 'Failed to connect to AI agent', 'details' => $curlError], 502);
    }

} catch (PDOException $e) {
    error_log("Proxy DB Error: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
