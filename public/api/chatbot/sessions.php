<?php
/**
 * Chatbot Sessions API
 * View and manage chat sessions and leads
 */

require_once __DIR__ . '/../config.php';
require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getSession($_GET['id']);
        } else {
            getSessions();
        }
        break;
    case 'DELETE':
        deleteSession();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function getSessions() {
    global $pdo;
    
    try {
        $filter = isset($_GET['filter']) ? sanitize_input($_GET['filter']) : 'all';
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
        $offset = ($page - 1) * $limit;
        
        $whereClause = '';
        switch ($filter) {
            case 'qualified':
                $whereClause = 'WHERE is_qualified = TRUE';
                break;
            case 'deals':
                $whereClause = 'WHERE deal_confirmed = TRUE';
                break;
            case 'with_email':
                $whereClause = 'WHERE lead_email IS NOT NULL AND lead_email != ""';
                break;
        }
        
        // Get total count
        $countStmt = $pdo->query("SELECT COUNT(*) FROM chatbot_sessions $whereClause");
        $total = $countStmt->fetchColumn();
        
        // Get sessions
        $stmt = $pdo->query("
            SELECT 
                id, session_id, lead_name, lead_email, lead_location, lead_interest,
                lead_timezone, conversation_stage, lead_score, is_qualified,
                booking_date, booking_confirmed, deal_confirmed, deal_service, deal_price,
                created_at, updated_at,
                JSON_LENGTH(messages) as message_count
            FROM chatbot_sessions 
            $whereClause
            ORDER BY updated_at DESC
            LIMIT $limit OFFSET $offset
        ");
        
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        json_response([
            'success' => true,
            'sessions' => $sessions,
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    } catch (PDOException $e) {
        json_response(['error' => 'Failed to fetch sessions'], 500);
    }
}

function getSession($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM chatbot_sessions WHERE id = ? OR session_id = ?");
        $stmt->execute([intval($id), $id]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$session) {
            json_response(['error' => 'Session not found'], 404);
            return;
        }
        
        $session['messages'] = json_decode($session['messages'], true) ?: [];
        
        json_response(['success' => true, 'session' => $session]);
    } catch (PDOException $e) {
        json_response(['error' => 'Failed to fetch session'], 500);
    }
}

function deleteSession() {
    global $pdo;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if (!$id) {
        json_response(['error' => 'Session ID is required'], 400);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM chatbot_sessions WHERE id = ?");
        $stmt->execute([$id]);
        
        json_response(['success' => true, 'message' => 'Session deleted successfully']);
    } catch (PDOException $e) {
        json_response(['error' => 'Failed to delete session'], 500);
    }
}
