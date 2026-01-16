<?php
/**
 * Email Sequences API
 * Manages email automation sequences
 * Upload to: public_html/api/email-sequences.php
 */

require_once 'config.php';

// Create tables if not exist
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_sequences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            trigger_type VARCHAR(50) NOT NULL,
            status ENUM('active', 'paused') DEFAULT 'paused',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_sequence_emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sequence_id INT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            delay_hours INT DEFAULT 0,
            position INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE
        )
    ");
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS email_sequence_subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sequence_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            current_position INT DEFAULT 0,
            status ENUM('active', 'completed', 'unsubscribed') DEFAULT 'active',
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_email_sent DATETIME,
            FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE
        )
    ");
} catch (PDOException $e) {
    error_log("Email sequences table creation error: " . $e->getMessage());
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getSequences();
        break;
    case 'POST':
        createSequence();
        break;
    case 'PUT':
        updateSequence();
        break;
    case 'DELETE':
        deleteSequence();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function getSequences() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("
            SELECT 
                es.*,
                COUNT(DISTINCT ese.id) as email_count,
                COUNT(DISTINCT ess.id) as subscriber_count,
                COALESCE(AVG(CASE WHEN el.status = 'opened' THEN 1 ELSE 0 END) * 100, 0) as open_rate
            FROM email_sequences es
            LEFT JOIN email_sequence_emails ese ON es.id = ese.sequence_id
            LEFT JOIN email_sequence_subscribers ess ON es.id = ess.sequence_id
            LEFT JOIN email_logs el ON ess.email = el.recipient
            GROUP BY es.id
            ORDER BY es.created_at DESC
        ");
        
        $sequences = $stmt->fetchAll();
        json_response($sequences);
        
    } catch (PDOException $e) {
        error_log("Get sequences error: " . $e->getMessage());
        json_response(['error' => 'Failed to fetch sequences'], 500);
    }
}

function createSequence() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['name']) || empty($input['trigger_type'])) {
        json_response(['error' => 'Name and trigger type required'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO email_sequences (name, trigger_type, status) 
            VALUES (:name, :trigger_type, :status)
        ");
        
        $stmt->execute([
            ':name' => sanitize_input($input['name']),
            ':trigger_type' => sanitize_input($input['trigger_type']),
            ':status' => isset($input['status']) ? $input['status'] : 'paused'
        ]);
        
        $sequenceId = $pdo->lastInsertId();
        
        // Add emails if provided
        if (isset($input['emails']) && is_array($input['emails'])) {
            $emailStmt = $pdo->prepare("
                INSERT INTO email_sequence_emails (sequence_id, subject, body, delay_hours, position) 
                VALUES (:sequence_id, :subject, :body, :delay_hours, :position)
            ");
            
            foreach ($input['emails'] as $position => $email) {
                $emailStmt->execute([
                    ':sequence_id' => $sequenceId,
                    ':subject' => sanitize_input($email['subject']),
                    ':body' => $email['body'],
                    ':delay_hours' => (int)($email['delay_hours'] ?? 0),
                    ':position' => $position
                ]);
            }
        }
        
        json_response([
            'success' => true,
            'message' => 'Sequence created successfully',
            'sequence_id' => $sequenceId
        ], 201);
        
    } catch (PDOException $e) {
        error_log("Create sequence error: " . $e->getMessage());
        json_response(['error' => 'Failed to create sequence'], 500);
    }
}

function updateSequence() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['id'])) {
        json_response(['error' => 'Sequence ID required'], 400);
    }
    
    $id = (int)$input['id'];
    $updates = [];
    $params = [':id' => $id];
    
    if (isset($input['name'])) {
        $updates[] = "name = :name";
        $params[':name'] = sanitize_input($input['name']);
    }
    if (isset($input['status'])) {
        $updates[] = "status = :status";
        $params[':status'] = $input['status'] === 'active' ? 'active' : 'paused';
    }
    if (isset($input['trigger_type'])) {
        $updates[] = "trigger_type = :trigger_type";
        $params[':trigger_type'] = sanitize_input($input['trigger_type']);
    }
    
    if (empty($updates)) {
        json_response(['error' => 'No valid fields to update'], 400);
    }
    
    try {
        $sql = "UPDATE email_sequences SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        json_response(['success' => true, 'message' => 'Sequence updated successfully']);
        
    } catch (PDOException $e) {
        error_log("Update sequence error: " . $e->getMessage());
        json_response(['error' => 'Failed to update sequence'], 500);
    }
}

function deleteSequence() {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$id) {
        json_response(['error' => 'Sequence ID required'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM email_sequences WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        json_response(['success' => true, 'message' => 'Sequence deleted successfully']);
        
    } catch (PDOException $e) {
        error_log("Delete sequence error: " . $e->getMessage());
        json_response(['error' => 'Failed to delete sequence'], 500);
    }
}
