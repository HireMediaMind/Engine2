<?php
/**
 * Lead Submission API
 * Handles form submissions from Contact, Lead Magnet, and other forms
 * Also sends data to Google Sheet
 * Upload to: public_html/api/submit-lead.php
 */

require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    json_response(['error' => 'Invalid JSON input'], 400);
}

// Validate required fields
$required = ['name', 'email'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        json_response(['error' => "Missing required field: $field"], 400);
    }
}

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Invalid email format'], 400);
}

// Sanitize input
$name = sanitize_input($input['name']);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$phone = isset($input['phone']) ? sanitize_input($input['phone']) : null;
$business = isset($input['business']) ? sanitize_input($input['business']) : null;
$message = isset($input['message']) ? sanitize_input($input['message']) : null;
$service_type = isset($input['service_type']) ? sanitize_input($input['service_type']) : null;
$page_source = isset($input['page_source']) ? sanitize_input($input['page_source']) : null;
$country = isset($input['country']) ? sanitize_input($input['country']) : null;
$city = isset($input['city']) ? sanitize_input($input['city']) : null;

// Get client info
$ip_address = get_client_ip();
$user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 255) : null;

// Get location from IP if not provided
$region = null;
if (empty($country) && $ip_address && $ip_address !== '127.0.0.1') {
    $geo_url = "http://ip-api.com/json/{$ip_address}?fields=country,city,regionName";
    $geo_response = @file_get_contents($geo_url);
    if ($geo_response) {
        $geo_data = json_decode($geo_response, true);
        if ($geo_data) {
            $country = $country ?: ($geo_data['country'] ?? null);
            $city = $city ?: ($geo_data['city'] ?? null);
            $region = $geo_data['regionName'] ?? null;
        }
    }
}

$timestamp = date('Y-m-d H:i:s');

try {
    $stmt = $pdo->prepare("
        INSERT INTO leads (name, email, phone, business, message, service_type, page_source, ip_address, country, city, region, user_agent)
        VALUES (:name, :email, :phone, :business, :message, :service_type, :page_source, :ip_address, :country, :city, :region, :user_agent)
    ");
    
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':business' => $business,
        ':message' => $message,
        ':service_type' => $service_type,
        ':page_source' => $page_source,
        ':ip_address' => $ip_address,
        ':country' => $country,
        ':city' => $city,
        ':region' => $region,
        ':user_agent' => $user_agent,
    ]);
    
    $lead_id = $pdo->lastInsertId();
    
    // Send to Google Sheet
    $sheetData = [
        'name' => $name,
        'email' => $email,
        'phone' => $phone ?: '',
        'service' => $service_type ?: '',
        'business' => $business ?: '',
        'country' => $country ?: '',
        'city' => $city ?: '',
        'message' => $message ?: '',
        'timestamp' => $timestamp,
        'lead_id' => $lead_id,
        'page_source' => $page_source ?: '',
        'ip' => $ip_address ?: '',
        'region' => $region ?: ''
    ];
    
    // Send to Google Sheet in background (non-blocking)
    send_to_google_sheet($sheetData);
    
    json_response([
        'success' => true,
        'message' => 'Lead submitted successfully',
        'lead_id' => $lead_id
    ], 201);
    
} catch (PDOException $e) {
    error_log("Lead submission error: " . $e->getMessage());
    json_response(['error' => 'Failed to save lead'], 500);
}
