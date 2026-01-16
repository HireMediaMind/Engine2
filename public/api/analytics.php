<?php
/**
 * Analytics API
 * GET: Fetch analytics data
 * Upload to: public_html/api/analytics.php
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$range = isset($_GET['range']) ? sanitize_input($_GET['range']) : '7days';

// Calculate date range
switch ($range) {
    case '30days':
        $days = 30;
        break;
    case '90days':
        $days = 90;
        break;
    default:
        $days = 7;
}

try {
    // Get form submissions count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total FROM leads 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
    ");
    $stmt->execute([':days' => $days]);
    $formSubmissions = $stmt->fetch()['total'];
    
    // Get product purchases
    $productPurchases = 0;
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM payments 
            WHERE status = 'completed'
            AND created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
        ");
        $stmt->execute([':days' => $days]);
        $productPurchases = $stmt->fetch()['total'];
    } catch (PDOException $e) {
        // Payments table might not exist
    }
    
    // Calculate conversion rate
    // For now, we'll use a placeholder formula
    $conversionRate = $formSubmissions > 0 ? round(($formSubmissions / 100) * 4.2, 1) : 0;
    
    $analytics = [
        'pageViews' => 0, // Implement with client-side tracking
        'buttonClicks' => 0, // Implement with client-side tracking
        'formSubmissions' => (int)$formSubmissions,
        'calendarBookings' => 0, // Implement with Calendly webhook
        'productPurchases' => (int)$productPurchases,
        'conversionRate' => $conversionRate,
    ];
    
    json_response($analytics);
    
} catch (PDOException $e) {
    error_log("Analytics error: " . $e->getMessage());
    json_response(['error' => 'Failed to fetch analytics'], 500);
}
