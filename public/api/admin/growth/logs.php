<?php
/**
 * Workflow Logs API
 * GET: Fetch execution logs
 * DELETE: Clear logs
 */

require_once '../../config.php';
require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT l.*, w.name as workflow_name 
            FROM workflow_execution_logs l 
            LEFT JOIN workflow_registry w ON l.workflow_id = w.id 
            ORDER BY l.executed_at DESC 
            LIMIT 100
        ");
        $logs = $stmt->fetchAll();

        // Parse JSON fields for the frontend
        foreach ($logs as &$log) {
            $log['payload'] = json_decode($log['payload']);
            $log['response'] = json_decode($log['response']);
        }

        json_response($logs);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $pdo->exec("TRUNCATE TABLE workflow_execution_logs");
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}
