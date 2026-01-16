<?php
require_once '../../config.php';

// Ensure admin is logged in
require_admin_auth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 1. Total Partners
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM hr_partners WHERE status = 'Active'");
        $activePartners = $stmt->fetch()['count'];

        // 2. Total Employees
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM hr_employees WHERE status = 'Active'");
        $activeEmployees = $stmt->fetch()['count'];

        // 3. Documents Generated
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM hr_documents");
        $docsGenerated = $stmt->fetch()['count'];

        // 4. Revoked/Terminated
        $stmt = $pdo->query("
            SELECT 
                (SELECT COUNT(*) FROM hr_partners WHERE status = 'Revoked') +
                (SELECT COUNT(*) FROM hr_employees WHERE status = 'Terminated') as count
        ");
        $revokedCount = $stmt->fetch()['count'];

        // 5. Recent Activity (Last 5 Document Generations)
        $stmt = $pdo->query("
            SELECT entity_name, type, generated_date 
            FROM hr_documents 
            ORDER BY generated_date DESC 
            LIMIT 5
        ");
        $recentActivity = $stmt->fetchAll();

        json_response([
            'stats' => [
                'activePartners' => $activePartners,
                'activeEmployees' => $activeEmployees,
                'docsGenerated' => $docsGenerated,
                'revokedCount' => $revokedCount
            ],
            'recentActivity' => $recentActivity
        ]);

    } catch (PDOException $e) {
        error_log("HR Stats Error: " . $e->getMessage());
        json_response(['error' => 'Failed to fetch HR stats'], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
