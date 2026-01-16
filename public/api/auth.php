<?php
/**
 * Admin Authentication API
 * POST /api/auth.php - Login
 * GET /api/auth.php - Check session
 * DELETE /api/auth.php - Logout
 * Upload to: public_html/api/auth.php
 */

require_once 'config.php';

// Start session for authentication
session_start();

// Admin credentials - CHANGE THESE!
// Recommended: Store in environment variables or separate config file
$ADMIN_EMAIL = getenv('HMM_ADMIN_EMAIL') ?: 'admin@hiremediamind.com';
$ADMIN_PASSWORD_HASH = getenv('HMM_ADMIN_PASS_HASH') ?: password_hash('HMM@Admin2024!', PASSWORD_DEFAULT);

// Handle different request methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        handleLogin();
        break;
    case 'GET':
        checkSession();
        break;
    case 'DELETE':
        handleLogout();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function handleLogin() {
    global $ADMIN_EMAIL, $ADMIN_PASSWORD_HASH;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['email']) || empty($input['password'])) {
        json_response(['error' => 'Email and password required'], 400);
    }
    
    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    $password = $input['password'];
    
    // Validate credentials
    if ($email === $ADMIN_EMAIL && password_verify($password, $ADMIN_PASSWORD_HASH)) {
        // Create session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_email'] = $email;
        $_SESSION['login_time'] = time();
        
        // Generate session token
        $token = bin2hex(random_bytes(32));
        $_SESSION['auth_token'] = $token;
        
        json_response([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'email' => $email
        ]);
    } else {
        // Log failed attempt
        error_log("Failed login attempt for: " . $email . " from IP: " . get_client_ip());
        json_response(['error' => 'Invalid credentials'], 401);
    }
}

function checkSession() {
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        // Check session timeout (8 hours)
        if (time() - $_SESSION['login_time'] > 28800) {
            session_destroy();
            json_response(['authenticated' => false, 'reason' => 'Session expired'], 401);
        }
        
        json_response([
            'authenticated' => true,
            'email' => $_SESSION['admin_email']
        ]);
    } else {
        json_response(['authenticated' => false], 401);
    }
}

function handleLogout() {
    session_destroy();
    json_response(['success' => true, 'message' => 'Logged out successfully']);
}
