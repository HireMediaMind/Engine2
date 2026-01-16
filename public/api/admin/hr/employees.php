<?php
require_once '../../config.php';

// Ensure admin is logged in
require_admin_auth();

$method = $_SERVER['REQUEST_METHOD'];

// GET: List Employees
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM hr_employees ORDER BY created_at DESC");
        $employees = $stmt->fetchAll();
        json_response($employees);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error'], 500);
    }
}

// POST: Add New Employee
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validation
    if (empty($data['name']) || empty($data['designation'])) {
        json_response(['error' => 'Name and Designation are required'], 400);
    }

    try {
        $pdo->beginTransaction();

        // 1. Insert Employee
        $stmt = $pdo->prepare("
            INSERT INTO hr_employees (name, designation, department, type, salary, joining_date, probation_period, reporting_manager, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Draft')
        ");

        $stmt->execute([
            sanitize_input($data['name']),
            sanitize_input($data['designation']),
            sanitize_input($data['department'] ?? ''),
            sanitize_input($data['type'] ?? 'Full-Time'),
            sanitize_input($data['salary'] ?? ''),
            sanitize_input($data['joining_date'] ?? date('Y-m-d')),
            sanitize_input($data['probation_period'] ?? ''),
            sanitize_input($data['reporting_manager'] ?? ''),
        ]);

        $empId = $pdo->lastInsertId();

        // 2. Generate Document ID (HMM-E-XXXX)
        $docId = 'HMM-E-' . str_pad($empId, 3, '0', STR_PAD_LEFT);

        // Update employee with Doc ID
        $updateStmt = $pdo->prepare("UPDATE hr_employees SET document_id = ? WHERE id = ?");
        $updateStmt->execute([$docId, $empId]);

        $pdo->commit();

        json_response([
            'message' => 'Employee created successfully',
            'id' => $empId,
            'document_id' => $docId
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Add Employee Error: " . $e->getMessage());
        json_response(['error' => 'Failed to create employee'], 500);
    }
}

// PUT: Update Status (Active/Terminated)
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id']) || empty($data['status'])) {
        json_response(['error' => 'ID and Status are required'], 400);
    }

    try {
        $stmt = $pdo->prepare("UPDATE hr_employees SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);

        // If activating, log to documents registry
        if ($data['status'] === 'Active') {
            // Check if already in registry
            $check = $pdo->prepare("SELECT id FROM hr_documents WHERE doc_id = (SELECT document_id FROM hr_employees WHERE id = ?)");
            $check->execute([$data['id']]);

            if (!$check->fetch()) {
                // Fetch employee details
                $eStmt = $pdo->prepare("SELECT name, document_id FROM hr_employees WHERE id = ?");
                $eStmt->execute([$data['id']]);
                $emp = $eStmt->fetch();

                if ($emp) {
                    $regStmt = $pdo->prepare("
                        INSERT INTO hr_documents (doc_id, entity_type, entity_name, status)
                        VALUES (?, 'Employee', ?, 'Active')
                    ");
                    $regStmt->execute([$emp['document_id'], $emp['name']]);
                }
            }
        }

        json_response(['message' => 'Employee status updated']);

    } catch (PDOException $e) {
        json_response(['error' => 'Update failed'], 500);
    }
}
