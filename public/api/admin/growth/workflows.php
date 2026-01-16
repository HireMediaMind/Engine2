<?php
/**
 * Workflow Manager API
 * GET: List workflows
 * POST: Create workflow
 * PUT: Update status
 * DELETE: Remove workflow
 */

require_once '../../config.php';
require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $category = $_GET['category'] ?? null;

    $sql = "SELECT * FROM workflow_registry";
    $params = [];

    if ($category) {
        $sql .= " WHERE category = ?";
        $params[] = $category;
    }

    $sql .= " ORDER BY created_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $workflows = $stmt->fetchAll();
        json_response($workflows);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['name']) || empty($data['webhook_path'])) {
        json_response(['error' => 'Name and Webhook Path are required'], 400);
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO workflow_registry (name, category, webhook_path, description, is_active) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            sanitize_input($data['name']),
            $data['category'] ?? 'Custom',
            sanitize_input($data['webhook_path']),
            sanitize_input($data['description'] ?? ''),
            1
        ]);
        json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        json_response(['error' => 'ID required'], 400);
    }

    try {
        if (isset($data['is_active'])) {
            $stmt = $pdo->prepare("UPDATE workflow_registry SET is_active = ? WHERE id = ?");
            $stmt->execute([(int) $data['is_active'], (int) $data['id']]);
        }
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id)
        json_response(['error' => 'ID required'], 400);

    try {
        $stmt = $pdo->prepare("DELETE FROM workflow_registry WHERE id = ?");
        $stmt->execute([$id]);
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}
