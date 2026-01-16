<?php
/**
 * Pipeline API
 * GET: Fetch leads for CRM pipeline view with actual values
 * Upload to: public_html/api/pipeline.php
 */

require_once 'config.php';

// Add value and stage columns if not exist
try {
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'new'");
    $pdo->exec("ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2) DEFAULT NULL");
} catch (PDOException $e) {
    // Columns might already exist
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $stmt = $pdo->query("
        SELECT id, name, email, phone, business, 
               COALESCE(service_type, 'General Inquiry') as service_type,
               created_at,
               COALESCE(stage, 'new') as stage,
               deal_value,
               country, city, message
        FROM leads 
        ORDER BY created_at DESC 
        LIMIT 100
    ");
    
    $leads = $stmt->fetchAll();
    
    // Calculate values based on service type if deal_value is not set
    foreach ($leads as &$lead) {
        if ($lead['deal_value'] === null) {
            switch (strtolower($lead['service_type'] ?? '')) {
                case 'facebook ads':
                case 'instagram ads':
                case 'performance marketing':
                    $lead['value'] = 2500;
                    break;
                case 'ai automation':
                case 'custom ai automation':
                    $lead['value'] = 3500;
                    break;
                case 'website chatbot':
                case 'whatsapp automation':
                    $lead['value'] = 1500;
                    break;
                case 'lead generation':
                    $lead['value'] = 2000;
                    break;
                case 'crm setup':
                    $lead['value'] = 1000;
                    break;
                case 'youtube ads':
                case 'google ads':
                    $lead['value'] = 3000;
                    break;
                default:
                    $lead['value'] = 0; // No value until qualified
            }
        } else {
            $lead['value'] = (float)$lead['deal_value'];
        }
        unset($lead['deal_value']); // Clean up response
    }
    
    json_response($leads);
    
} catch (PDOException $e) {
    error_log("Pipeline fetch error: " . $e->getMessage());
    json_response(['error' => 'Failed to fetch pipeline data'], 500);
}
