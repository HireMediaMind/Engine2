<?php
/**
 * Lead Actions API
 * PUT: Update lead stage/status
 * DELETE: Delete lead
 * Upload to: public_html/api/lead-actions.php
 */

require_once 'config.php';

// Add stage column to leads table if not exists
try {
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'new'");
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new'");
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT");
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255)");
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
} catch (PDOException $e) {
    // Column might already exist, that's fine
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        updateLead();
        break;
    case 'DELETE':
        deleteLead();
        break;
    case 'GET':
        getLead();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function updateLead() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['id'])) {
        json_response(['error' => 'Lead ID required'], 400);
    }
    
    $id = (int)$input['id'];
    $updates = [];
    $params = [':id' => $id];
    
    // Allowed fields to update
    $allowedFields = ['stage', 'status', 'notes', 'assigned_to', 'deal_value'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = :$field";
            $params[":$field"] = sanitize_input($input[$field]);
        }
    }
    
    if (empty($updates)) {
        json_response(['error' => 'No valid fields to update'], 400);
    }
    
    try {
        $sql = "UPDATE leads SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        if ($stmt->rowCount() > 0) {
            // Log the action
            logLeadAction($id, 'updated', json_encode($input));
            json_response(['success' => true, 'message' => 'Lead updated successfully']);
        } else {
            json_response(['error' => 'Lead not found'], 404);
        }
    } catch (PDOException $e) {
        error_log("Lead update error: " . $e->getMessage());
        json_response(['error' => 'Failed to update lead'], 500);
    }
}

function deleteLead() {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$id) {
        json_response(['error' => 'Lead ID required'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM leads WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        if ($stmt->rowCount() > 0) {
            logLeadAction($id, 'deleted', null);
            json_response(['success' => true, 'message' => 'Lead deleted successfully']);
        } else {
            json_response(['error' => 'Lead not found'], 404);
        }
    } catch (PDOException $e) {
        error_log("Lead delete error: " . $e->getMessage());
        json_response(['error' => 'Failed to delete lead'], 500);
    }
}

function getLead() {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$id) {
        json_response(['error' => 'Lead ID required'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $lead = $stmt->fetch();
        
        if ($lead) {
            json_response($lead);
        } else {
            json_response(['error' => 'Lead not found'], 404);
        }
    } catch (PDOException $e) {
        error_log("Lead fetch error: " . $e->getMessage());
        json_response(['error' => 'Failed to fetch lead'], 500);
    }
}

function logLeadAction($leadId, $action, $details) {
    global $pdo;
    
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS lead_activity_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT NOT NULL,
                action VARCHAR(50) NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $stmt = $pdo->prepare("INSERT INTO lead_activity_log (lead_id, action, details) VALUES (:lead_id, :action, :details)");
        $stmt->execute([':lead_id' => $leadId, ':action' => $action, ':details' => $details]);
    } catch (PDOException $e) {
        error_log("Lead activity log error: " . $e->getMessage());
    }
}
