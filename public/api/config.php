<?php
/**
 * Enhanced Configuration with Contact Extraction Utilities
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database credentials
$db_host = getenv('HMM_DB_HOST') ?: 'localhost';
$db_user = getenv('HMM_DB_USER') ?: 'u205847150_leadinfo';
$db_pass = getenv('HMM_DB_PASS') ?: 'Himjeet@3812';
$db_name = getenv('HMM_DB_NAME') ?: 'u205847150_leadinfo_db';

// Create database connection
try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// API Keys
$GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzT7eDr5NP7YtqwRZqRt7zXSQI4s87-0b4pxibH_0uLlK_xCIxI8NdlJZ322ZwX-9__/exec';
$FIRECRAWL_API_KEY = 'fc-4521e3632726475fa1c2024c16cbeba7';
$ADMIN_EMAIL = getenv('HMM_ADMIN_EMAIL') ?: 'admin@hiremediamind.com';

// ========================
// ENHANCED HELPER FUNCTIONS
// ========================

function sanitize_input($data)
{
    if ($data === null)
        return null;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function get_client_ip()
{
    $ip = '';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    }
    return filter_var(trim($ip), FILTER_VALIDATE_IP) ? $ip : '';
}

function json_response($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// ========================
// EMAIL VALIDATION & EXTRACTION
// ========================

/**
 * Validate email format
 */
function is_valid_email($email)
{
    if (empty($email))
        return false;

    // Basic validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    // Check against common invalid patterns
    $invalid_patterns = [
        'example.com',
        'test.com',
        'sample.com',
        'domain.com',
        'email.com',
        'noreply@',
        'no-reply@'
    ];

    $email_lower = strtolower($email);
    foreach ($invalid_patterns as $pattern) {
        if (strpos($email_lower, $pattern) !== false) {
            return false;
        }
    }

    return true;
}

/**
 * Extract all emails from text
 */
function extract_emails_from_text($text)
{
    $pattern = '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/';
    preg_match_all($pattern, $text, $matches);

    $emails = [];
    foreach ($matches[0] as $email) {
        if (is_valid_email($email)) {
            $emails[] = strtolower($email);
        }
    }

    return array_unique($emails);
}

/**
 * Score email by business relevance (higher score = more likely to be business email)
 */
function score_email($email, $businessName = '')
{
    $score = 10;
    $email_lower = strtolower($email);
    $domain = substr(strrchr($email, "@"), 1);

    // Penalize free email providers
    $free_providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    if (in_array($domain, $free_providers)) {
        $score -= 5;
    }

    // Prefer business-related prefixes
    $good_prefixes = ['info', 'contact', 'hello', 'sales', 'support', 'admin', 'office'];
    foreach ($good_prefixes as $prefix) {
        if (strpos($email_lower, $prefix . '@') === 0) {
            $score += 3;
            break;
        }
    }

    // Check if business name appears in email
    if (!empty($businessName)) {
        $name_parts = explode(' ', strtolower($businessName));
        foreach ($name_parts as $part) {
            if (strlen($part) > 3 && strpos($email_lower, $part) !== false) {
                $score += 5;
                break;
            }
        }
    }

    return $score;
}

/**
 * Get best email from array
 */
function get_best_email($emails, $businessName = '')
{
    if (empty($emails))
        return null;

    $scored = [];
    foreach ($emails as $email) {
        $scored[$email] = score_email($email, $businessName);
    }

    arsort($scored);
    return array_key_first($scored);
}

// ========================
// PHONE VALIDATION & EXTRACTION
// ========================

/**
 * Clean and validate phone number
 */
function is_valid_phone($phone)
{
    if (empty($phone))
        return false;

    // Remove all non-digit characters
    $cleaned = preg_replace('/\D/', '', $phone);

    // Check length (7-15 digits for international numbers)
    $length = strlen($cleaned);
    if ($length < 7 || $length > 15) {
        return false;
    }

    // Check for obvious invalid patterns (all same digit, sequential)
    if (preg_match('/^(\d)\1+$/', $cleaned)) {
        return false; // All same digit
    }

    return true;
}

/**
 * Extract phone numbers from text
 */
function extract_phones_from_text($text)
{
    $patterns = [
        // International format: +1-234-567-8900
        '/\+\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/',
        // US format: (123) 456-7890
        '/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/',
        // International: +91 98765 43210
        '/\+\d{1,3}[\s.-]?\d{4,5}[\s.-]?\d{4,6}/',
        // Simple: 1234567890
        '/\b\d{10,15}\b/'
    ];

    $phones = [];
    foreach ($patterns as $pattern) {
        preg_match_all($pattern, $text, $matches);
        foreach ($matches[0] as $match) {
            if (is_valid_phone($match)) {
                $phones[] = $match;
            }
        }
    }

    return array_unique($phones);
}

/**
 * Format phone number consistently
 */
function format_phone($phone)
{
    // Remove all non-digit characters except +
    $cleaned = preg_replace('/[^\d+]/', '', $phone);

    // If starts with country code, keep it
    if (strpos($cleaned, '+') === 0) {
        return $cleaned;
    }

    // Otherwise, add formatting for readability
    $digits = preg_replace('/\D/', '', $phone);

    if (strlen($digits) === 10) {
        // US format
        return '(' . substr($digits, 0, 3) . ') ' . substr($digits, 3, 3) . '-' . substr($digits, 6);
    }

    return $cleaned;
}

// ========================
// WEBSITE VALIDATION
// ========================

/**
 * Validate and clean website URL
 */
function clean_website_url($url)
{
    if (empty($url))
        return '';

    // Remove whitespace
    $url = trim($url);

    // Add protocol if missing
    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'https://' . $url;
    }

    // Validate URL
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return '';
    }

    return $url;
}

/**
 * Extract domain from URL
 */
function extract_domain($url)
{
    $parsed = parse_url($url);
    if (isset($parsed['host'])) {
        return preg_replace('/^www\./', '', $parsed['host']);
    }
    return '';
}

// ========================
// ADMIN AUTH (from original)
// ========================

function require_admin_auth()
{
    global $pdo;

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        return true;
    }

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = '';

    if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    }

    if (empty($token)) {
        $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    }

    if (empty($token) && isset($_SESSION['admin_token'])) {
        $token = $_SESSION['admin_token'];
    }

    if (empty($token)) {
        json_response(['error' => 'Unauthorized'], 401);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT a.id, a.email, a.role, s.expires_at
            FROM admin_sessions s
            JOIN admin_users a ON a.id = s.user_id
            WHERE s.token = ? AND a.is_active = 1
        ");
        $stmt->execute([$token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            json_response(['error' => 'Invalid token'], 401);
        }

        if (strtotime($session['expires_at']) < time()) {
            json_response(['error' => 'Token expired'], 401);
        }

        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_user_id'] = $session['id'];
        $_SESSION['admin_token'] = $token;

        return true;

    } catch (PDOException $e) {
        error_log("Auth error: " . $e->getMessage());
        json_response(['error' => 'Authentication failed'], 500);
    }
}

function send_to_google_sheet($data)
{
    global $GOOGLE_SHEET_WEBHOOK;

    if (empty($GOOGLE_SHEET_WEBHOOK))
        return false;

    $ch = curl_init($GOOGLE_SHEET_WEBHOOK);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode >= 200 && $httpCode < 300;
}
