<?php
/**
 * Workflow Trigger API (Proxy)
 * POST: Execute a workflow securely
 */

require_once '../../config.php';
require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$workflowId = $data['workflowId'] ?? null;
$payload = $data['payload'] ?? [];

if (!$workflowId) {
    json_response(['error' => 'Workflow ID is required'], 400);
}

try {
    // 1. Get Workflow Details
    $stmt = $pdo->prepare("SELECT * FROM workflow_registry WHERE id = ?");
    $stmt->execute([$workflowId]);
    $workflow = $stmt->fetch();

    if (!$workflow || !$workflow['is_active']) {
        json_response(['error' => 'Workflow not found or inactive'], 404);
    }

    // 2. Get System Settings
    $settingsStmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('n8n_base_url', 'n8n_secret_key')");
    $settings = $settingsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $baseUrl = $settings['n8n_base_url'] ?? '';
    $secretKey = $settings['n8n_secret_key'] ?? '';

    if (empty($baseUrl)) {
        json_response(['error' => 'System error: n8n Base URL not configured'], 500);
    }

    // 3. Prepare Webhook Request
    $url = rtrim($baseUrl, '/') . '/' . $workflow['webhook_path'];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-internal-key: ' . $secretKey
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 30s timeout for workflows

    // 4. Execute
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    // 5. Log Execution
    $logStatus = ($httpCode >= 200 && $httpCode < 300) ? 'success' : 'error';
    $logPayload = json_encode($payload);
    $logResponse = $response ? $response : json_encode(['error' => $error ?: 'Unknown error', 'http_code' => $httpCode]);

    $logStmt = $pdo->prepare("INSERT INTO workflow_execution_logs (workflow_id, status, payload, response) VALUES (?, ?, ?, ?)");
    $logStmt->execute([$workflowId, $logStatus, $logPayload, $logResponse]);

    // 6. Return Response
    if ($logStatus === 'success') {
        json_response(json_decode($response, true) ?: ['status' => 'success', 'raw' => $response]);
    } else {
        json_response(['error' => 'Workflow execution failed', 'details' => $logResponse], 500);
    }

} catch (PDOException $e) {
    error_log("Workflow trigger error: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
