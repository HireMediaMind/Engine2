<?php
/**
 * Client Preview API
 * Handles fetching preview data for the client preview page
 * Upload to: public_html/api/client-preview.php
 */

require_once 'config.php';

// Allow GET requests to fetch preview by token
// Allow POST requests to update status/feedback

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $token = isset($_GET['token']) ? sanitize_input($_GET['token']) : null;

    if (!$token) {
        json_response(['error' => 'Token required'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT * FROM client_previews 
            WHERE token = :token 
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $preview = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$preview) {
            json_response(['error' => 'Preview not found'], 404);
        }

        // Update viewed_at if not set
        if (!$preview['viewed_at']) {
            $updateStmt = $pdo->prepare("UPDATE client_previews SET viewed_at = NOW() WHERE id = :id");
            $updateStmt->execute([':id' => $preview['id']]);
        }

        // Decode JSON fields
        if (isset($preview['chatbot_config'])) {
            $config = json_decode($preview['chatbot_config'], true);
            // Check for webhook but don't expose it
            $config['use_custom_agent'] = !empty($config['webhook_url']);
            unset($config['webhook_url']); // Security: Don't expose n8n URL
            $preview['chatbot_config'] = $config;
        }
        if (isset($preview['workflow_config'])) {
            $preview['workflow_config'] = json_decode($preview['workflow_config']);
        }

        json_response($preview);

    } catch (PDOException $e) {
        error_log("Client preview fetch error: " . $e->getMessage());
        json_response(['error' => 'Database error'], 500);
    }
} elseif ($method === 'POST') {
    // Handle approval or feedback
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['token']) || !isset($input['action'])) {
        json_response(['error' => 'Invalid input'], 400);
    }

    $token = sanitize_input($input['token']);
    $action = sanitize_input($input['action']); // 'approve' or 'request_changes'
    $feedback = isset($input['feedback']) ? sanitize_input($input['feedback']) : null;

    try {
        // First verify token exists
        $stmt = $pdo->prepare("SELECT id FROM client_previews WHERE token = :token LIMIT 1");
        $stmt->execute([':token' => $token]);
        $preview = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$preview) {
            json_response(['error' => 'Preview not found'], 404);
        }

        if ($action === 'approve') {
            $update = $pdo->prepare("
                UPDATE client_previews 
                SET status = 'approved', 
                    approved_at = NOW(), 
                    feedback = :feedback 
                WHERE id = :id
            ");
            $update->execute([
                ':feedback' => $feedback,
                ':id' => $preview['id']
            ]);
            json_response(['success' => true, 'message' => 'Approved successfully']);
        } elseif ($action === 'request_changes') {
            $update = $pdo->prepare("
                UPDATE client_previews 
                SET status = 'changes_requested', 
                    feedback = :feedback 
                WHERE id = :id
            ");
            $update->execute([
                ':feedback' => $feedback,
                ':id' => $preview['id']
            ]);
            json_response(['success' => true, 'message' => 'Feedback submitted']);
        } else {
            json_response(['error' => 'Invalid action'], 400);
        }

    } catch (PDOException $e) {
        error_log("Client preview update error: " . $e->getMessage());
        json_response(['error' => 'Database update error'], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
