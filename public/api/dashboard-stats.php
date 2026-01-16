<?php
/**
 * Dashboard Stats API
 * GET: Fetch aggregated stats for admin dashboard
 * Upload to: public_html/api/dashboard-stats.php
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    // Get total leads
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM leads");
    $totalLeads = $stmt->fetch()['total'];
    
    // Get leads from last month for trend calculation
    $stmt = $pdo->query("
        SELECT COUNT(*) as total FROM leads 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $leadsThisMonth = $stmt->fetch()['total'];
    
    $stmt = $pdo->query("
        SELECT COUNT(*) as total FROM leads 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
        AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $leadsLastMonth = $stmt->fetch()['total'];
    
    $leadsTrend = $leadsLastMonth > 0 
        ? round((($leadsThisMonth - $leadsLastMonth) / $leadsLastMonth) * 100, 1) 
        : 0;
    
    // Get total revenue from payments table
    $totalRevenue = 0;
    $revenueTrend = 0;
    
    try {
        $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'");
        $totalRevenue = $stmt->fetch()['total'];
        
        $stmt = $pdo->query("
            SELECT COALESCE(SUM(amount), 0) as total FROM payments 
            WHERE status = 'completed' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");
        $revenueThisMonth = $stmt->fetch()['total'];
        
        $stmt = $pdo->query("
            SELECT COALESCE(SUM(amount), 0) as total FROM payments 
            WHERE status = 'completed'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");
        $revenueLastMonth = $stmt->fetch()['total'];
        
        $revenueTrend = $revenueLastMonth > 0 
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1) 
            : 0;
    } catch (PDOException $e) {
        // Payments table might not exist yet
    }
    
    // Placeholder values for metrics we don't have yet
    $stats = [
        'totalLeads' => (int)$totalLeads,
        'totalRevenue' => (float)$totalRevenue,
        'pageViews' => 0, // Implement with analytics tracking
        'conversions' => (int)$leadsThisMonth,
        'bookedCalls' => 0, // Implement with Calendly webhook
        'leadsTrend' => $leadsTrend,
        'revenueTrend' => $revenueTrend,
    ];
    
    json_response($stats);
    
} catch (PDOException $e) {
    error_log("Dashboard stats error: " . $e->getMessage());
    json_response(['error' => 'Failed to fetch dashboard stats'], 500);
}
