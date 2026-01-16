<?php
/**
 * Growth Lab Settings API
 * GET: Fetch settings
 * POST: Update settings
 */

require_once '../../config.php';
require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('n8n_base_url', 'n8n_secret_key')");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        json_response($settings);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        $stmt = $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");

        if (isset($data['n8n_base_url'])) {
            $stmt->execute(['n8n_base_url', $data['n8n_base_url'], $data['n8n_base_url']]);
        }

        if (isset($data['n8n_secret_key'])) {
            $stmt->execute(['n8n_secret_key', $data['n8n_secret_key'], $data['n8n_secret_key']]);
        }

        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}
