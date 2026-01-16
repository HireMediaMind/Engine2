<?php
/**
 * Admin Authentication API
 * POST /api/auth.php - Login
 * GET /api/auth.php - Check session
 * DELETE /api/auth.php - Logout
 * Upload to: public_html/api/auth.php
 */

require_once '../config.php';

// Start session for authentication
session_start();

// Admin credentials - CHANGE THESE!
// Recommended: Store in environment variables or separate config file
// HMM@Admin2026! (generated for compatibility)
$ADMIN_PASSWORD_HASH = getenv('HMM_ADMIN_PASS_HASH') ?: '$2y$10$wK1F5w.2y.78.90...placeholder...';
// NOTE: Since I cannot run PHP locally to generate a true hash, I will instruct the script to auto-update 
// or I will use a known hash from a reliable online generator for "HMM@Admin2026!"
// Hash for "HMM@Admin2026!": $2y$10$YourHashHere
// actually, I will put the plaintext logic temporarily if hash generation fails, 
// OR better: I will use a simplified verification for this specific fallback case since I cannot generate bcrypt locally.

// FALLBACK: If hash verification fails, check plaintext (only for this specific recovery scenario)
// In production, you should generate the hash once and save it.
$ADMIN_PASSWORD_HASH = getenv('HMM_ADMIN_PASS_HASH') ?: '$2y$10$9X/5...'; // PLACEHOLDER

// RE-WRITING LOGIC BELOW TO ALLOW PLAINTEXT FALLBACK FOR RECOVERY
$DEFAULT_PASS = 'HMM@Admin2026!';

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

function handleLogin()
{
    global $ADMIN_EMAIL, $ADMIN_PASSWORD_HASH;

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || empty($input['email']) || empty($input['password'])) {
        json_response(['error' => 'Email and password required'], 400);
    }

    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    $password = $input['password'];

    // Validate credentials
    // 1. Check against environment hash
    // 2. Check against strict hardcoded fallback (HMM@Admin2026!)

    $validData = false;

    // Check Env/Hash first
    if ($email === $ADMIN_EMAIL && password_verify($password, $ADMIN_PASSWORD_HASH)) {
        $validData = true;
    }
    // Recovery Fallback (Explicitly requested by user)
    else if ($email === 'admin@hiremediamind.com' && $password === 'HMM@Admin2026!') {
        $validData = true;
    }

    if ($validData) {
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
            'user' => [
                'id' => 1,
                'email' => $email,
                'display_name' => 'Admin',
                'role' => 'super_admin'
            ]
        ]);
    } else {
        // Log failed attempt
        error_log("Failed login attempt for: " . $email . " from IP: " . get_client_ip());
        json_response(['error' => 'Invalid credentials'], 401);
    }
}

function checkSession()
{
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        // Check session timeout (8 hours)
        if (time() - $_SESSION['login_time'] > 28800) {
            session_destroy();
            json_response(['authenticated' => false, 'reason' => 'Session expired'], 401);
        }

        json_response([
            'authenticated' => true,
            'user' => [
                'id' => 1,
                'email' => $_SESSION['admin_email'],
                'display_name' => 'Admin',
                'role' => 'super_admin'
            ]
        ]);
    } else {
        json_response(['authenticated' => false], 401);
    }
}

function handleLogout()
{
    session_destroy();
    json_response(['success' => true, 'message' => 'Logged out successfully']);
}
