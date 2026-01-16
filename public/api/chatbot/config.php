<?php
/**
 * Chatbot Configuration API
 * Manages chatbot settings like name, greeting, colors, etc.
 */

require_once __DIR__ . '/../config.php';

// Create config table if not exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chatbot_config (
            id INT PRIMARY KEY DEFAULT 1,
            bot_name VARCHAR(100) DEFAULT 'Maya',
            greeting_message TEXT DEFAULT 'Hi! I\\'m Maya, your AI assistant at HireMediaMind. How can I help you today?',
            primary_color VARCHAR(20) DEFAULT '#0ea5e9',
            secondary_color VARCHAR(20) DEFAULT '#10b981',
            avatar_url VARCHAR(500) DEFAULT '',
            timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
            business_hours_start TIME DEFAULT '09:00:00',
            business_hours_end TIME DEFAULT '18:00:00',
            auto_collect_lead BOOLEAN DEFAULT TRUE,
            google_sheet_webhook VARCHAR(500) DEFAULT '',
            custom_prompt TEXT DEFAULT '',
            fallback_message TEXT DEFAULT 'I appreciate your question! While I don\\'t have the exact answer right now, our team would love to help. Would you like to book a call with us?',
            enable_booking BOOLEAN DEFAULT TRUE,
            booking_link VARCHAR(500) DEFAULT 'https://calendly.com/team-hiremediamind/30min',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");

    // If the table already existed (older versions), ensure newer columns exist.
    // (CREATE TABLE IF NOT EXISTS does not add missing columns.)
    $ensureColumns = [
        "google_sheet_webhook VARCHAR(500) DEFAULT ''",
        "custom_prompt TEXT DEFAULT ''",
        "fallback_message TEXT DEFAULT 'I appreciate your question! While I don\\'t have the exact answer right now, our team would love to help. Would you like to book a call with us?'",
        "enable_booking BOOLEAN DEFAULT TRUE",
        "booking_link VARCHAR(500) DEFAULT 'https://calendly.com/team-hiremediamind/30min'",
        "auto_collect_lead BOOLEAN DEFAULT TRUE",
    ];

    foreach ($ensureColumns as $colDef) {
        try {
            $pdo->exec("ALTER TABLE chatbot_config ADD COLUMN $colDef");
        } catch (PDOException $e) {
            // Ignore (column already exists)
        }
    }

    // Insert default config if not exists
    $stmt = $pdo->query("SELECT COUNT(*) FROM chatbot_config");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO chatbot_config (id, bot_name, booking_link) VALUES (1, 'Maya', 'https://calendly.com/team-hiremediamind/30min')");
    }
} catch (PDOException $e) {
    // Table might already exist
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getConfig();
        break;
    case 'PUT':
        require_admin_auth();
        updateConfig();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function getConfig() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM chatbot_config WHERE id = 1");
        $config = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$config) {
            // Return default config
            $config = [
                'id' => 1,
                'bot_name' => 'Maya',
                'greeting_message' => 'Hi! I\'m Maya, your AI assistant at HireMediaMind. How can I help you today?',
                'primary_color' => '#0ea5e9',
                'secondary_color' => '#10b981',
                'avatar_url' => '',
                'timezone' => 'Asia/Kolkata',
                'business_hours_start' => '09:00:00',
                'business_hours_end' => '18:00:00',
                'auto_collect_lead' => true,
                'fallback_message' => 'I appreciate your question! While I don\'t have the exact answer right now, our team would love to help. Would you like to book a call with us?',
                'enable_booking' => true,
                'booking_link' => 'https://calendly.com/team-hiremediamind/30min'
            ];
        }
        
        // Don't expose sensitive keys to public (check if admin auth exists)
        // NOTE: google_sheet_webhook is required by the public widget to submit leads.
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        json_response(['success' => true, 'config' => $config]);
    } catch (PDOException $e) {
        error_log("Config fetch error: " . $e->getMessage());
        json_response(['error' => 'Failed to fetch config'], 500);
    }
}

function updateConfig() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        json_response(['error' => 'Invalid JSON data'], 400);
        return;
    }
    
    $allowedFields = [
        'bot_name', 'greeting_message', 'primary_color', 'secondary_color',
        'avatar_url', 'timezone', 'business_hours_start', 'business_hours_end',
        'auto_collect_lead', 'google_sheet_webhook', 'custom_prompt',
        'fallback_message', 'enable_booking', 'booking_link'
    ];
    
    $updates = [];
    $params = [];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($updates)) {
        json_response(['error' => 'No valid fields to update'], 400);
        return;
    }
    
    try {
        // First check if row exists
        $stmt = $pdo->query("SELECT COUNT(*) FROM chatbot_config WHERE id = 1");
        if ($stmt->fetchColumn() == 0) {
            // Insert first
            $pdo->exec("INSERT INTO chatbot_config (id) VALUES (1)");
        }
        
        $sql = "UPDATE chatbot_config SET " . implode(', ', $updates) . " WHERE id = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        json_response(['success' => true, 'message' => 'Config updated successfully']);
    } catch (PDOException $e) {
        error_log("Config update error: " . $e->getMessage());
        json_response(['error' => 'Failed to update config: ' . $e->getMessage()], 500);
    }
}
