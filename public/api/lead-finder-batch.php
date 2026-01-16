<?php
/**
 * Batch Lead Finder - Gets 50+ results by scraping multiple pages
 * This version uses crawling to get more results
 */

ob_start();
require_once 'config.php';

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_COMPILE_ERROR])) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Server Error']);
    }
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

function isValidEmail($email)
{
    return !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL);
}

function isValidPhone($phone)
{
    if (empty($phone))
        return false;
    $cleaned = preg_replace('/[\s\-\(\)\.\+]/', '', $phone);
    return preg_match('/^\d{7,15}$/', $cleaned);
}

/**
 * Use Firecrawl CRAWL endpoint to get multiple pages
 */
function crawlBusinessDirectory($baseUrl, $industry, $location, $apiKey, $maxPages = 3)
{
    $payload = [
        'url' => $baseUrl,
        'limit' => $maxPages,
        'scrapeOptions' => [
            'formats' => ['extract'],
            'onlyMainContent' => false,
            'waitFor' => 8000,
            'extract' => [
                'schema' => [
                    'type' => 'object',
                    'properties' => [
                        'businesses' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'name' => ['type' => 'string'],
                                    'phone' => ['type' => 'string'],
                                    'email' => ['type' => 'string'],
                                    'address' => ['type' => 'string'],
                                    'rating' => ['type' => 'string'],
                                    'website' => ['type' => 'string'],
                                    'category' => ['type' => 'string']
                                ]
                            ]
                        ]
                    ]
                ],
                'prompt' => "Extract ALL business listings from this page. Include name, phone, email, address, rating, website, and category for each business."
            ]
        ]
    ];

    // Start crawl job
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.firecrawl.dev/v1/crawl",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
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

    if ($httpCode !== 200) {
        error_log("Crawl start failed: $response");
        return null;
    }

    $result = json_decode($response, true);
    $jobId = $result['id'] ?? null;

    if (!$jobId) {
        error_log("No job ID returned from crawl");
        return null;
    }

    error_log("Crawl job started: $jobId");

    // Poll for results (max 3 minutes)
    $maxAttempts = 36; // 36 * 5 seconds = 3 minutes
    $attempt = 0;

    while ($attempt < $maxAttempts) {
        sleep(5);
        $attempt++;

        // Check status
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://api.firecrawl.dev/v1/crawl/$jobId",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer $apiKey"
            ],
        ]);

        $statusResponse = curl_exec($ch);
        curl_close($ch);

        $status = json_decode($statusResponse, true);

        if (isset($status['status'])) {
            error_log("Crawl status: {$status['status']} (attempt $attempt)");

            if ($status['status'] === 'completed') {
                return $status['data'] ?? [];
            }

            if ($status['status'] === 'failed') {
                error_log("Crawl failed");
                return null;
            }
        }
    }

    error_log("Crawl timeout");
    return null;
}

/**
 * Multi-source scraping strategy
 */
function getBusinessLeads($industry, $location, $apiKey, $targetCount = 50)
{
    $allLeads = [];

    // Source 1: Yelp (usually best for contact info)
    error_log("=== Source 1: Yelp ===");
    $yelpUrl = "https://www.yelp.com/search?find_desc=" . rawurlencode($industry) . "&find_loc=" . rawurlencode($location);
    $yelpResults = crawlBusinessDirectory($yelpUrl, $industry, $location, $apiKey, 2);

    if ($yelpResults) {
        foreach ($yelpResults as $page) {
            if (isset($page['extract']['businesses'])) {
                foreach ($page['extract']['businesses'] as $biz) {
                    $biz['source'] = 'Yelp';
                    $allLeads[] = $biz;
                }
            }
        }
    }
    error_log("Yelp results: " . count($allLeads));

    // If we need more results, try other sources
    if (count($allLeads) < $targetCount) {
        error_log("=== Source 2: Yellow Pages ===");
        $ypUrl = "https://www.yellowpages.com/search?search_terms=" . rawurlencode($industry) . "&geo_location_terms=" . rawurlencode($location);
        $ypResults = crawlBusinessDirectory($ypUrl, $industry, $location, $apiKey, 2);

        if ($ypResults) {
            foreach ($ypResults as $page) {
                if (isset($page['extract']['businesses'])) {
                    foreach ($page['extract']['businesses'] as $biz) {
                        $biz['source'] = 'Yellow Pages';
                        $allLeads[] = $biz;
                    }
                }
            }
        }
        error_log("Total with Yellow Pages: " . count($allLeads));
    }

    // Fallback: Single page scrapes from multiple sources
    if (count($allLeads) < 20) {
        error_log("=== Fallback: Quick scrapes ===");

        $quickSources = [
            [
                'name' => 'Google Maps',
                'url' => "https://www.google.com/maps/search/" . rawurlencode("$industry in $location")
            ],
            [
                'name' => 'Foursquare',
                'url' => "https://foursquare.com/explore?mode=url&near=" . rawurlencode($location) . "&q=" . rawurlencode($industry)
            ]
        ];

        foreach ($quickSources as $source) {
            $payload = [
                'url' => $source['url'],
                'formats' => ['extract'],
                'waitFor' => 8000,
                'extract' => [
                    'schema' => [
                        'type' => 'object',
                        'properties' => [
                            'businesses' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'name' => ['type' => 'string'],
                                        'phone' => ['type' => 'string'],
                                        'email' => ['type' => 'string'],
                                        'address' => ['type' => 'string'],
                                        'website' => ['type' => 'string']
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'prompt' => "Extract all business listings with contact information."
                ]
            ];

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 90,
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
                if (isset($result['data']['extract']['businesses'])) {
                    foreach ($result['data']['extract']['businesses'] as $biz) {
                        $biz['source'] = $source['name'];
                        $allLeads[] = $biz;
                    }
                }
            }

            sleep(2);
        }
    }

    return $allLeads;
}

try {
    if (!isset($FIRECRAWL_API_KEY) || empty($FIRECRAWL_API_KEY)) {
        throw new Exception('Missing API Key');
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $industry = sanitize_input($input['industry'] ?? '');
    $location = sanitize_input($input['location'] ?? '');
    $targetCount = isset($input['limit']) ? min((int) $input['limit'], 100) : 50;

    if (empty($industry) || empty($location)) {
        throw new Exception('Industry and Location are required');
    }

    error_log("=== BATCH LEAD FINDER START ===");
    error_log("Target: $targetCount leads for '$industry' in '$location'");

    // Get leads from multiple sources
    $rawLeads = getBusinessLeads($industry, $location, $FIRECRAWL_API_KEY, $targetCount);

    error_log("Raw leads collected: " . count($rawLeads));

    // Process and deduplicate
    $processedLeads = [];
    $seen = [];

    foreach ($rawLeads as $lead) {
        if (empty($lead['name']))
            continue;

        // Create unique key
        $key = strtolower(trim($lead['name']));
        if (isset($seen[$key]))
            continue;
        $seen[$key] = true;

        $phone = trim($lead['phone'] ?? '');
        $email = trim($lead['email'] ?? '');
        $website = trim($lead['website'] ?? '');

        // Require at least one contact method
        if (empty($phone) && empty($email) && empty($website)) {
            continue;
        }

        $processedLeads[] = [
            'name' => sanitize_input($lead['name']),
            'phone' => sanitize_input($phone),
            'email' => sanitize_input($email),
            'address' => sanitize_input($lead['address'] ?? ''),
            'rating' => sanitize_input($lead['rating'] ?? ''),
            'website' => sanitize_input($website),
            'category' => sanitize_input($lead['category'] ?? $industry),
            'location' => $location,
            'source' => $lead['source'] ?? 'Unknown',
            'hasEmail' => isValidEmail($email),
            'hasPhone' => isValidPhone($phone)
        ];

        if (count($processedLeads) >= $targetCount) {
            break;
        }
    }

    // Sort by contact completeness
    usort($processedLeads, function ($a, $b) {
        $scoreA = ($a['hasEmail'] ? 3 : 0) + ($a['hasPhone'] ? 3 : 0) + (!empty($a['website']) ? 1 : 0);
        $scoreB = ($b['hasEmail'] ? 3 : 0) + ($b['hasPhone'] ? 3 : 0) + (!empty($b['website']) ? 1 : 0);
        return $scoreB - $scoreA;
    });

    $withEmail = count(array_filter($processedLeads, fn($l) => $l['hasEmail']));
    $withPhone = count(array_filter($processedLeads, fn($l) => $l['hasPhone']));
    $withBoth = count(array_filter($processedLeads, fn($l) => $l['hasEmail'] && $l['hasPhone']));

    error_log("=== FINAL RESULTS ===");
    error_log("Total: " . count($processedLeads));
    error_log("With Email: $withEmail");
    error_log("With Phone: $withPhone");
    error_log("With Both: $withBoth");

    ob_clean();
    json_response([
        'success' => true,
        'count' => count($processedLeads),
        'data' => $processedLeads,
        'statistics' => [
            'total' => count($processedLeads),
            'withEmail' => $withEmail,
            'withPhone' => $withPhone,
            'withBoth' => $withBoth
        ],
        'query' => [
            'industry' => $industry,
            'location' => $location,
            'requested' => $targetCount
        ]
    ]);

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    ob_clean();
    json_response(['error' => $e->getMessage(), 'success' => false], 500);
}
