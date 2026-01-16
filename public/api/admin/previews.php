<?php
/**
 * Admin API: Manage Client Previews
 * List, Create, Delete previews
 * Upload to: public_html/api/admin/previews.php
 */

require_once '../config.php';
// require_once '../auth.php'; // REMOVED: prevents hijacking request flow

// Handle Ping (Connectivity Check) - No Auth Required
if (isset($_GET['ping'])) {
    json_response(['status' => 'ok', 'message' => 'Admin Previews API is reachable']);
}

// Authentication Check
// Manually check session to match auth.php behavior
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Debug: Return session status to help diagnose
    json_response(['error' => 'Unauthorized', 'debug' => 'Session not active', 's' => $_SESSION], 401);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // List all previews
            $stmt = $pdo->query("SELECT * FROM client_previews ORDER BY created_at DESC");
            $previews = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON fields for frontend
            foreach ($previews as &$p) {
                if ($p['chatbot_config'])
                    $p['chatbot_config'] = json_decode($p['chatbot_config']);
                if ($p['workflow_config'])
                    $p['workflow_config'] = json_decode($p['workflow_config']);
            }

            json_response($previews);
        } catch (PDOException $e) {
            json_response(['error' => 'DB Error: ' . $e->getMessage()], 500);
        }
        break;

    case 'POST':
        // Create new preview
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            json_response(['error' => 'Invalid JSON'], 400);
        }

        // Generate a random secure token
        $token = bin2hex(random_bytes(32));

        try {
            $stmt = $pdo->prepare("
                INSERT INTO client_previews (
                    token, client_name, client_email, title, description, 
                    preview_type, chatbot_config, workflow_config, expires_at
                ) VALUES (
                    :token, :client_name, :client_email, :title, :description, 
                    :preview_type, :chatbot_config, :workflow_config, :expires_at
                )
            ");

            $stmt->execute([
                ':token' => $token,
                ':client_name' => sanitize_input($input['client_name'] ?? ''),
                ':client_email' => sanitize_input($input['client_email'] ?? null),
                ':title' => sanitize_input($input['title'] ?? 'Untitled'),
                ':description' => sanitize_input($input['description'] ?? null),
                ':preview_type' => sanitize_input($input['preview_type'] ?? 'chatbot'),
                ':chatbot_config' => isset($input['chatbot_config']) ? json_encode($input['chatbot_config']) : null,
                ':workflow_config' => isset($input['workflow_config']) ? json_encode($input['workflow_config']) : null,
                ':expires_at' => isset($input['expires_at']) ? date('Y-m-d H:i:s', strtotime($input['expires_at'])) : null
            ]);

            $id = $pdo->lastInsertId();

            // Return the newly created record
            $stmt = $pdo->prepare("SELECT * FROM client_previews WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $newRecord = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($newRecord['chatbot_config'])
                $newRecord['chatbot_config'] = json_decode($newRecord['chatbot_config']);

            json_response($newRecord, 201);

        } catch (PDOException $e) {
            json_response(['error' => 'Creation Failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if (!$id)
            json_response(['error' => 'ID required'], 400);

        try {
            $stmt = $pdo->prepare("DELETE FROM client_previews WHERE id = :id");
            $stmt->execute([':id' => $id]);
            json_response(['success' => true]);
        } catch (PDOException $e) {
            json_response(['error' => 'Delete Failed'], 500);
        }
        break;

    default:
        json_response(['error' => 'Method not allowed'], 405);
}
