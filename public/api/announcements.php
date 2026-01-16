<?php
/**
 * Announcements API (PHP-based for Hostinger)
 * Manages announcements stored in MySQL instead of Supabase
 * This works with the Hostinger admin login
 */

require_once __DIR__ . '/config.php';

// Set timezone to India Standard Time (IST) to match user input
date_default_timezone_set('Asia/Kolkata');

// Create announcements table if not exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            enabled BOOLEAN DEFAULT TRUE,
            announcement_type VARCHAR(50) DEFAULT 'info',
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            cta_text VARCHAR(255) DEFAULT NULL,
            cta_link VARCHAR(500) DEFAULT NULL,
            icon VARCHAR(10) DEFAULT NULL,
            start_date DATETIME DEFAULT NULL,
            end_date DATETIME DEFAULT NULL,
            target_pages JSON DEFAULT NULL,
            priority INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
} catch (PDOException $e) {
    // Table might already exist
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAnnouncements();
        break;
    case 'POST':
        require_admin_auth();
        createAnnouncement();
        break;
    case 'PUT':
        require_admin_auth();
        updateAnnouncement();
        break;
    case 'DELETE':
        require_admin_auth();
        deleteAnnouncement();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function getAnnouncements()
{
    global $pdo;

    $all = isset($_GET['all']) && $_GET['all'] === 'true';

    try {
        if ($all) {
            // Admin view - return all
            $stmt = $pdo->query("SELECT * FROM announcements ORDER BY priority DESC, created_at DESC");
        } else {
            // Public view - only enabled and within date range
            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("
                SELECT * FROM announcements 
                WHERE enabled = TRUE 
                AND (start_date IS NULL OR start_date <= ?)
                AND (end_date IS NULL OR end_date >= ?)
                ORDER BY priority DESC
            ");
            $stmt->execute([$now, $now]);
        }

        $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON fields
        foreach ($announcements as &$ann) {
            $ann['target_pages'] = json_decode($ann['target_pages'] ?? '["all"]', true) ?: ['all'];
            $ann['enabled'] = (bool) $ann['enabled'];
        }

        json_response(['success' => true, 'announcements' => $announcements]);

    } catch (PDOException $e) {
        error_log("Announcements fetch error: " . $e->getMessage());
        json_response(['error' => 'Failed to fetch announcements'], 500);
    }
}

function createAnnouncement()
{
    global $pdo;

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['title']) || empty($data['message'])) {
        json_response(['error' => 'Title and message are required'], 400);
        return;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO announcements (enabled, announcement_type, title, message, cta_text, cta_link, icon, start_date, end_date, target_pages, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $targetPages = isset($data['target_pages']) ? json_encode($data['target_pages']) : '["all"]';

        $stmt->execute([
            $data['enabled'] ?? true,
            $data['announcement_type'] ?? 'info',
            $data['title'],
            $data['message'],
            $data['cta_text'] ?? null,
            $data['cta_link'] ?? null,
            $data['icon'] ?? null,
            $data['start_date'] ?? null,
            $data['end_date'] ?? null,
            $targetPages,
            $data['priority'] ?? 0
        ]);

        $id = $pdo->lastInsertId();

        json_response(['success' => true, 'id' => $id, 'message' => 'Announcement created']);

    } catch (PDOException $e) {
        error_log("Announcement create error: " . $e->getMessage());
        json_response(['error' => 'Failed to create announcement'], 500);
    }
}

function updateAnnouncement()
{
    global $pdo;

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['id'])) {
        json_response(['error' => 'Announcement ID is required'], 400);
        return;
    }

    $id = (int) $data['id'];
    $updates = [];
    $params = [];

    $allowedFields = [
        'enabled',
        'announcement_type',
        'title',
        'message',
        'cta_text',
        'cta_link',
        'icon',
        'start_date',
        'end_date',
        'priority'
    ];

    foreach ($allowedFields as $field) {
        if (array_key_exists($field, $data)) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }

    // Handle target_pages JSON
    if (array_key_exists('target_pages', $data)) {
        $updates[] = "target_pages = ?";
        $params[] = json_encode($data['target_pages'] ?? ['all']);
    }

    if (empty($updates)) {
        json_response(['error' => 'No valid fields to update'], 400);
        return;
    }

    try {
        // Ensure record exists first (so we can treat "no changes" as success)
        $check = $pdo->prepare("SELECT id FROM announcements WHERE id = ?");
        $check->execute([$id]);
        $exists = $check->fetchColumn();

        if (!$exists) {
            json_response(['error' => 'Announcement not found'], 404);
            return;
        }

        $params[] = $id;
        $sql = "UPDATE announcements SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // MySQL returns rowCount=0 if values are identical; treat that as success.
        json_response(['success' => true, 'message' => 'Announcement updated']);

    } catch (PDOException $e) {
        error_log("Announcement update error: " . $e->getMessage());
        json_response(['error' => 'Failed to update announcement'], 500);
    }
}


function deleteAnnouncement()
{
    global $pdo;

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if (!$id) {
        json_response(['error' => 'Announcement ID is required'], 400);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            json_response(['success' => true, 'message' => 'Announcement deleted']);
        } else {
            json_response(['error' => 'Announcement not found'], 404);
        }

    } catch (PDOException $e) {
        error_log("Announcement delete error: " . $e->getMessage());
        json_response(['error' => 'Failed to delete announcement'], 500);
    }
}
