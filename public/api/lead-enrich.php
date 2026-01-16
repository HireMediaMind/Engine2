<?php
/**
 * Lead Enrichment Service - Background Email Finding
 * Call this AFTER showing initial results to user
 * This runs in background to find real emails from websites
 */

set_time_limit(120);
ob_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

/**
 * Quick website scrape for emails only
 */
function findEmailsQuick($websiteUrl, $apiKey)
{
    if (empty($websiteUrl))
        return [];

    // Ensure URL has protocol
    if (!preg_match('/^https?:\/\//', $websiteUrl)) {
        $websiteUrl = 'https://' . $websiteUrl;
    }

    // Try common contact pages first
    $domain = parse_url($websiteUrl, PHP_URL_HOST);
    $scheme = parse_url($websiteUrl, PHP_URL_SCHEME) ?: 'https';

    $pagesCheck = [
        $websiteUrl,
        "$scheme://$domain/contact",
        "$scheme://$domain/contact-us",
        "$scheme://$domain/about"
    ];

    foreach ($pagesCheck as $pageUrl) {
        $payload = [
            'url' => $pageUrl,
            'formats' => ['markdown'],
            'onlyMainContent' => false,
            'waitFor' => 2000,
            'timeout' => 15000
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $apiKey",
                "Content-Type: application/json"
            ],
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $result = json_decode($response, true);
            $content = $result['data']['markdown'] ?? '';

            if (!empty($content)) {
                // Extract emails
                preg_match_all('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $content, $matches);

                $emails = array_filter($matches[0], function ($email) {
                    // Filter valid business emails
                    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
                        return false;

                    // Skip generic free emails and common false positives
                    $invalid = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com', 'test.com'];
                    foreach ($invalid as $domain) {
                        if (strpos(strtolower($email), $domain) !== false) {
                            return false;
                        }
                    }

                    return true;
                });

                if (!empty($emails)) {
                    return array_unique(array_values($emails));
                }
            }
        }

        // Small delay between tries
        usleep(500000); // 0.5 second
    }

    return [];
}

try {
    if (!isset($FIRECRAWL_API_KEY) || empty($FIRECRAWL_API_KEY)) {
        throw new Exception('API configuration error');
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!$input) {
        throw new Exception('Invalid request');
    }

    // Accept single business or array
    $businesses = isset($input['businesses']) ? $input['businesses'] : [$input];
    $maxEnrich = isset($input['maxEnrich']) ? min((int) $input['maxEnrich'], 10) : 5;

    $enriched = [];
    $enrichCount = 0;
    $emailsFound = 0;

    foreach ($businesses as $business) {
        // Skip if already has email
        if (!empty($business['email']) && filter_var($business['email'], FILTER_VALIDATE_EMAIL)) {
            $enriched[] = $business;
            continue;
        }

        // Skip if no website
        if (empty($business['website'])) {
            $business['enriched'] = false;
            $business['enrichStatus'] = 'no_website';
            $enriched[] = $business;
            continue;
        }

        // Only enrich first N businesses to save time
        if ($enrichCount >= $maxEnrich) {
            $business['enriched'] = false;
            $business['enrichStatus'] = 'skipped';
            $enriched[] = $business;
            continue;
        }

        error_log("Enriching: {$business['name']}");

        $foundEmails = findEmailsQuick($business['website'], $FIRECRAWL_API_KEY);

        if (!empty($foundEmails)) {
            $business['email'] = $foundEmails[0]; // Best email
            $business['alternativeEmails'] = array_slice($foundEmails, 1, 2); // Up to 2 more
            $business['hasEmail'] = true;
            $business['enriched'] = true;
            $business['enrichStatus'] = 'email_found';
            $emailsFound++;
        } else {
            $business['enriched'] = true;
            $business['enrichStatus'] = 'no_email_found';
        }

        $enriched[] = $business;
        $enrichCount++;
    }

    error_log("Enrichment Complete: $emailsFound emails found (enriched $enrichCount businesses)");

    ob_clean();
    json_response([
        'success' => true,
        'count' => count($enriched),
        'enriched' => $enrichCount,
        'emailsFound' => $emailsFound,
        'data' => $enriched
    ]);

} catch (Exception $e) {
    error_log("Enrichment Error: " . $e->getMessage());
    ob_clean();
    json_response([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}
