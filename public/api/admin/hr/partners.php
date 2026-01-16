<?php
require_once '../../config.php';

// Ensure admin is logged in
require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

// GET: List Partners
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM hr_partners ORDER BY created_at DESC");
        $partners = $stmt->fetchAll();
        json_response($partners);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error'], 500);
    }
}

// POST: Add New Partner
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validation
    if (empty($data['name']) || empty($data['role'])) {
        json_response(['error' => 'Name and Role are required'], 400);
    }

    try {
        $pdo->beginTransaction();

        // 1. Insert Partner
        $stmt = $pdo->prepare("
            INSERT INTO hr_partners (name, role, email, joining_date, scope_of_work, revenue_model, validity_period, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft')
        ");

        $stmt->execute([
            sanitize_input($data['name']),
            sanitize_input($data['role']),
            sanitize_input($data['email'] ?? ''),
            sanitize_input($data['joining_date'] ?? date('Y-m-d')),
            sanitize_input($data['scope_of_work'] ?? ''),
            sanitize_input($data['revenue_model'] ?? ''),
            sanitize_input($data['validity_period'] ?? ''),
        ]);

        $partnerId = $pdo->lastInsertId();

        // 2. Generate Document ID (HMM-P-XXXX)
        $docId = 'HMM-P-' . str_pad($partnerId, 3, '0', STR_PAD_LEFT);

        // Update partner with Doc ID
        $updateStmt = $pdo->prepare("UPDATE hr_partners SET document_id = ? WHERE id = ?");
        $updateStmt->execute([$docId, $partnerId]);

        $pdo->commit();

        json_response([
            'message' => 'Partner created successfully',
            'id' => $partnerId,
            'document_id' => $docId
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Add Partner Error: " . $e->getMessage());
        json_response(['error' => 'Failed to create partner'], 500);
    }
}

// PUT: Update Status (Active/Revoked)
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id']) || empty($data['status'])) {
        json_response(['error' => 'ID and Status are required'], 400);
    }

    try {
        $stmt = $pdo->prepare("UPDATE hr_partners SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);

        // If activating, log to documents registry
        if ($data['status'] === 'Active') {
            // Check if already in registry
            $check = $pdo->prepare("SELECT id FROM hr_documents WHERE doc_id = (SELECT document_id FROM hr_partners WHERE id = ?)");
            $check->execute([$data['id']]);

            if (!$check->fetch()) {
                // Fetch partner details
                $pStmt = $pdo->prepare("SELECT name, document_id FROM hr_partners WHERE id = ?");
                $pStmt->execute([$data['id']]);
                $partner = $pStmt->fetch();

                if ($partner) {
                    $regStmt = $pdo->prepare("
                        INSERT INTO hr_documents (doc_id, entity_type, entity_name, status)
                        VALUES (?, 'Partner', ?, 'Active')
                    ");
                    $regStmt->execute([$partner['document_id'], $partner['name']]);
                }
            }
        }

        json_response(['message' => 'Partner status updated']);

    } catch (PDOException $e) {
        json_response(['error' => 'Update failed'], 500);
    }
}
