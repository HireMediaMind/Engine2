<?php
/**
 * Leads API
 * GET: Fetch all leads with optional filtering
 * Upload to: public_html/api/leads.php
 */

require_once 'config.php';

// Only accept GET requests for now
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Get filter parameters
$status = isset($_GET['status']) ? sanitize_input($_GET['status']) : null;
$search = isset($_GET['search']) ? sanitize_input($_GET['search']) : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

// Build query
$sql = "SELECT id, name, email, phone, business, message, service_type, page_source, 
               country, city, created_at, 'new' as status 
        FROM leads WHERE 1=1";
$params = [];

if ($search) {
    $sql .= " AND (name LIKE :search OR email LIKE :search OR business LIKE :search)";
    $params[':search'] = "%$search%";
}

$sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

try {
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $leads = $stmt->fetchAll();
    
    json_response($leads);
    
} catch (PDOException $e) {
    error_log("Leads fetch error: " . $e->getMessage());
    json_response(['error' => 'Failed to fetch leads'], 500);
}
