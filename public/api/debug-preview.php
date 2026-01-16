<?php
/**
 * Debug Script for Client Previews
 * Upload to: public_html/api/debug-preview.php
 * Usage: Visit https://hiremediamind.com/api/debug-preview.php?token=YOUR_TOKEN
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

header('Content-Type: application/json');

$token = isset($_GET['token']) ? $_GET['token'] : null;

$response = [
    'status' => 'debug_start',
    'php_version' => phpversion(),
    'db_connection' => 'pending',
    'table_exists' => 'pending',
    'token_provided' => $token,
    'record_found' => 'pending',
    'db_content_dump' => [],
    'error' => null
];

try {
    // Check DB Connection
    if ($pdo) {
        $response['db_connection'] = 'success';
    } else {
        throw new Exception("PDO object is null");
    }

    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'client_previews'");
    if ($stmt->rowCount() > 0) {
        $response['table_exists'] = 'yes';
    } else {
        $response['table_exists'] = 'no';
        throw new Exception("Table 'client_previews' does not exist.");
    }

    // Attempt to fetch record if token provided
    if ($token) {
        $stmt = $pdo->prepare("SELECT * FROM client_previews WHERE token = :token");
        $stmt->execute([':token' => $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $response['record_found'] = 'yes';
            $response['record_details'] = $result;
        } else {
            $response['record_found'] = 'no';

            // Debug: Show all tokens in table to compare
            $allTokens = $pdo->query("SELECT id, token, client_name FROM client_previews LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
            $response['available_records'] = $allTokens;
        }
    } else {
        // Debug: Show all tokens in table
        $allTokens = $pdo->query("SELECT id, token, client_name FROM client_previews LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        $response['available_records'] = $allTokens;
    }

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
