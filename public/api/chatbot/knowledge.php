<?php
/**
 * Chatbot Knowledge Base API
 * Manages Q&A pairs, training data, and knowledge categories
 */

require_once __DIR__ . '/../config.php';

// Create knowledge table if not exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chatbot_knowledge (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(100) NOT NULL DEFAULT 'general',
            question TEXT NOT NULL,
            keywords TEXT,
            answer TEXT NOT NULL,
            priority INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_active (is_active)
        )
    ");
    
    // Try to add fulltext index if not exists
    $pdo->exec("ALTER TABLE chatbot_knowledge ADD FULLTEXT INDEX idx_search (question, keywords, answer)");
} catch (PDOException $e) {
    // Table or index might already exist, ignore
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['search'])) {
            searchKnowledge($_GET['search']);
        } else {
            getKnowledge();
        }
        break;
    case 'POST':
        require_admin_auth();
        addKnowledge();
        break;
    case 'PUT':
        require_admin_auth();
        updateKnowledge();
        break;
    case 'DELETE':
        require_admin_auth();
        deleteKnowledge();
        break;
    default:
        json_response(['error' => 'Method not allowed'], 405);
}

function getKnowledge() {
    global $pdo;
    
    try {
        $category = isset($_GET['category']) ? sanitize_input($_GET['category']) : null;
        
        if ($category && $category !== 'all') {
            $stmt = $pdo->prepare("SELECT * FROM chatbot_knowledge WHERE category = ? ORDER BY priority DESC, created_at DESC");
            $stmt->execute([$category]);
        } else {
            $stmt = $pdo->query("SELECT * FROM chatbot_knowledge ORDER BY category, priority DESC, created_at DESC");
        }
        
        $knowledge = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get categories
        $catStmt = $pdo->query("SELECT DISTINCT category FROM chatbot_knowledge ORDER BY category");
        $categories = $catStmt->fetchAll(PDO::FETCH_COLUMN);
        
        json_response([
            'success' => true, 
            'knowledge' => $knowledge,
            'categories' => $categories
        ]);
    } catch (PDOException $e) {
        error_log("Knowledge fetch error: " . $e->getMessage());
        json_response(['error' => 'Failed to fetch knowledge'], 500);
    }
}

function searchKnowledge($query) {
    global $pdo;
    
    try {
        $query = sanitize_input($query);
        
        // Try LIKE search first (more reliable)
        $likeQuery = '%' . $query . '%';
        $stmt = $pdo->prepare("
            SELECT * FROM chatbot_knowledge 
            WHERE is_active = TRUE 
              AND (question LIKE ? OR keywords LIKE ? OR answer LIKE ?)
            ORDER BY priority DESC
            LIMIT 5
        ");
        $stmt->execute([$likeQuery, $likeQuery, $likeQuery]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        json_response(['success' => true, 'results' => $results]);
    } catch (PDOException $e) {
        error_log("Knowledge search error: " . $e->getMessage());
        json_response(['error' => 'Search failed'], 500);
    }
}

function addKnowledge() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['question']) || !isset($data['answer'])) {
        json_response(['error' => 'Question and answer are required'], 400);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO chatbot_knowledge (category, question, keywords, answer, priority, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            sanitize_input($data['category'] ?? 'general'),
            sanitize_input($data['question']),
            sanitize_input($data['keywords'] ?? ''),
            $data['answer'], // Don't sanitize answer to preserve formatting
            intval($data['priority'] ?? 0),
            isset($data['is_active']) ? (bool)$data['is_active'] : true
        ]);
        
        $id = $pdo->lastInsertId();
        
        json_response(['success' => true, 'id' => $id, 'message' => 'Knowledge added successfully']);
    } catch (PDOException $e) {
        error_log("Knowledge add error: " . $e->getMessage());
        json_response(['error' => 'Failed to add knowledge: ' . $e->getMessage()], 500);
    }
}

function updateKnowledge() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['id'])) {
        json_response(['error' => 'Knowledge ID is required'], 400);
        return;
    }
    
    $allowedFields = ['category', 'question', 'keywords', 'answer', 'priority', 'is_active'];
    $updates = [];
    $params = [];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $field === 'is_active' ? (bool)$data[$field] : 
                       ($field === 'priority' ? intval($data[$field]) : 
                       ($field === 'answer' ? $data[$field] : sanitize_input($data[$field])));
        }
    }
    
    if (empty($updates)) {
        json_response(['error' => 'No valid fields to update'], 400);
        return;
    }
    
    $params[] = intval($data['id']);
    
    try {
        $sql = "UPDATE chatbot_knowledge SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        json_response(['success' => true, 'message' => 'Knowledge updated successfully']);
    } catch (PDOException $e) {
        error_log("Knowledge update error: " . $e->getMessage());
        json_response(['error' => 'Failed to update knowledge'], 500);
    }
}

function deleteKnowledge() {
    global $pdo;
    
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if (!$id) {
        json_response(['error' => 'Knowledge ID is required'], 400);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM chatbot_knowledge WHERE id = ?");
        $stmt->execute([$id]);
        
        json_response(['success' => true, 'message' => 'Knowledge deleted successfully']);
    } catch (PDOException $e) {
        error_log("Knowledge delete error: " . $e->getMessage());
        json_response(['error' => 'Failed to delete knowledge'], 500);
    }
}
