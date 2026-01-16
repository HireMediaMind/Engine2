<?php
require_once '../../config.php';

// Ensure admin is logged in
require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

// GET: List Documents
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM hr_documents ORDER BY generated_date DESC");
        $documents = $stmt->fetchAll();
        json_response($documents);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error'], 500);
    }
}
