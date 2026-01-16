<?php
/**
 * CACHED Lead Finder - Instant Results for Repeat Searches
 * First search: 20-30 seconds
 * Repeat searches: < 1 second!
 */

set_time_limit(60);
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

/**
 * Generate cache key for search
 */
function generateCacheKey($industry, $location)
{
    return md5(strtolower(trim($industry)) . '|' . strtolower(trim($location)));
}

/**
 * Check if we have cached results
 */
function getCachedResults($pdo, $industry, $location)
{
    $cacheKey = generateCacheKey($industry, $location);

    try {
        $stmt = $pdo->prepare("
            SELECT results_json, result_count, source, created_at, hit_count
            FROM lead_search_cache 
            WHERE search_key = ? AND expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([$cacheKey]);
        $cache = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cache) {
            // Update hit count
            $updateStmt = $pdo->prepare("
                UPDATE lead_search_cache 
                SET hit_count = hit_count + 1, last_accessed = NOW()
                WHERE search_key = ?
            ");
            $updateStmt->execute([$cacheKey]);

            error_log("CACHE HIT: {$cache['result_count']} results (hits: {$cache['hit_count']})");

            return [
                'data' => json_decode($cache['results_json'], true),
                'cached' => true,
                'cache_age' => time() - strtotime($cache['created_at']),
                'source' => $cache['source']
            ];
        }

        return null;

    } catch (PDOException $e) {
        error_log("Cache read error: " . $e->getMessage());
        return null;
    }
}

/**
 * Save results to cache
 */
function saveCachedResults($pdo, $industry, $location, $results, $source)
{
    $cacheKey = generateCacheKey($industry, $location);
    $cacheHours = 24; // Cache for 24 hours

    try {
        $stmt = $pdo->prepare("
            INSERT INTO lead_search_cache 
            (search_key, industry, location, source, result_count, results_json, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))
            ON DUPLICATE KEY UPDATE
                results_json = VALUES(results_json),
                result_count = VALUES(result_count),
                source = VALUES(source),
                expires_at = VALUES(expires_at),
                created_at = NOW()
        ");

        $stmt->execute([
            $cacheKey,
            $industry,
            $location,
            $source,
            count($results),
            json_encode($results),
            $cacheHours
        ]);

        error_log("CACHE SAVED: " . count($results) . " results");

    } catch (PDOException $e) {
        error_log("Cache save error: " . $e->getMessage());
    }
}

/**
 * Log failed search to avoid immediate retries
 */
function logFailedSearch($pdo, $industry, $location, $error)
{
    $cacheKey = generateCacheKey($industry, $location);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO failed_searches (search_key, industry, location, error_message)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                attempt_count = attempt_count + 1,
                error_message = VALUES(error_message),
                last_attempt = NOW()
        ");
        $stmt->execute([$cacheKey, $industry, $location, $error]);
    } catch (PDOException $e) {
        error_log("Failed search log error: " . $e->getMessage());
    }
}

/**
 * Check if search recently failed
 */
function hasRecentFailure($pdo, $industry, $location)
{
    $cacheKey = generateCacheKey($industry, $location);

    try {
        $stmt = $pdo->prepare("
            SELECT error_message, attempt_count, last_attempt
            FROM failed_searches 
            WHERE search_key = ? 
            AND last_attempt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            LIMIT 1
        ");
        $stmt->execute([$cacheKey]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return null;
    }
}

/**
 * Log API usage for cost tracking
 */
function logAPIUsage($pdo, $endpoint, $industry, $location, $source, $resultCount, $executionTime, $success = true, $error = null)
{
    try {
        $stmt = $pdo->prepare("
            INSERT INTO api_usage_log 
            (endpoint, industry, location, source, result_count, execution_time, success, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$endpoint, $industry, $location, $source, $resultCount, $executionTime, $success, $error]);
    } catch (PDOException $e) {
        error_log("API usage log error: " . $e->getMessage());
    }
}

/**
 * Perform actual scraping (same as fast version)
 */
function performScrape($industry, $location, $apiKey)
{
    // Choose best source based on location
    $source = ['name' => 'Google Maps'];

    if (preg_match('/India|Delhi|Mumbai|Bangalore/i', $location)) {
        $city = preg_replace('/,?\s*(India|IN)$/i', '', $location);
        $source = [
            'name' => 'JustDial',
            'url' => "https://www.justdial.com/" . strtolower(trim($city)) . "/" . rawurlencode($industry)
        ];
    } else {
        $source['url'] = "https://www.google.com/maps/search/" . rawurlencode("$industry in $location");
    }

    $payload = [
        'url' => $source['url'],
        'formats' => ['extract'],
        'waitFor' => 3000,
        'timeout' => 25000,
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
                                'website' => ['type' => 'string']
                            ]
                        ]
                    ]
                ]
            ],
            'prompt' => "Extract all business listings with name, phone, email, address, rating, and website."
        ]
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
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
        return ['success' => false, 'source' => $source['name']];
    }

    $result = json_decode($response, true);
    $businesses = $result['data']['extract']['businesses'] ?? [];

    return [
        'success' => true,
        'businesses' => $businesses,
        'source' => $source['name']
    ];
}

try {
    $startTime = microtime(true);

    if (!isset($FIRECRAWL_API_KEY) || empty($FIRECRAWL_API_KEY)) {
        throw new Exception('API configuration error');
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!$input) {
        throw new Exception('Invalid request');
    }

    $industry = sanitize_input($input['industry'] ?? '');
    $location = sanitize_input($input['location'] ?? '');
    $forceRefresh = $input['refresh'] ?? false; // Allow users to force refresh

    if (empty($industry) || empty($location)) {
        throw new Exception('Industry and Location are required');
    }

    error_log("=== CACHED LEAD FINDER ===");
    error_log("Query: $industry in $location");

    // Step 1: Check cache (< 0.1 second)
    $cached = null;
    if (!$forceRefresh) {
        $cached = getCachedResults($pdo, $industry, $location);
    }

    if ($cached) {
        // Return cached results immediately
        $executionTime = round(microtime(true) - $startTime, 2);

        ob_clean();
        json_response([
            'success' => true,
            'cached' => true,
            'cacheAge' => $cached['cache_age'],
            'count' => count($cached['data']),
            'data' => $cached['data'],
            'source' => $cached['source'],
            'executionTime' => $executionTime . 's',
            'message' => 'Results loaded from cache (instant!)'
        ]);
    }

    // Step 2: Check if this search recently failed
    $recentFailure = hasRecentFailure($pdo, $industry, $location);
    if ($recentFailure && $recentFailure['attempt_count'] >= 3) {
        throw new Exception("This search has failed {$recentFailure['attempt_count']} times recently. Please try different terms.");
    }

    // Step 3: Perform fresh scrape
    error_log("CACHE MISS - Performing fresh scrape");
    $scrapeResult = performScrape($industry, $location, $FIRECRAWL_API_KEY);

    if (!$scrapeResult['success'] || empty($scrapeResult['businesses'])) {
        $errorMsg = 'No businesses found. Try different search terms.';
        logFailedSearch($pdo, $industry, $location, $errorMsg);
        logAPIUsage($pdo, 'scrape', $industry, $location, $scrapeResult['source'], 0, 0, false, $errorMsg);
        throw new Exception($errorMsg);
    }

    // Step 4: Process results
    $processed = [];
    $seen = [];

    foreach ($scrapeResult['businesses'] as $biz) {
        if (empty($biz['name']))
            continue;

        $key = strtolower(trim($biz['name']));
        if (isset($seen[$key]))
            continue;
        $seen[$key] = true;

        $phone = trim($biz['phone'] ?? '');
        $email = trim($biz['email'] ?? '');
        $website = trim($biz['website'] ?? '');

        // Suggested emails if no email but has website
        $suggestedEmails = [];
        if (empty($email) && !empty($website)) {
            $domain = preg_replace('/^www\./', '', parse_url($website, PHP_URL_HOST));
            if ($domain) {
                $suggestedEmails = ["info@$domain", "contact@$domain"];
            }
        }

        if (empty($phone) && empty($website))
            continue;

        $processed[] = [
            'name' => sanitize_input($biz['name']),
            'phone' => sanitize_input($phone),
            'email' => sanitize_input($email),
            'suggestedEmails' => $suggestedEmails,
            'address' => sanitize_input($biz['address'] ?? ''),
            'rating' => sanitize_input($biz['rating'] ?? ''),
            'website' => sanitize_input($website),
            'category' => $industry,
            'location' => $location,
            'source' => $scrapeResult['source']
        ];
    }

    $executionTime = round(microtime(true) - $startTime, 2);

    // Step 5: Save to cache
    saveCachedResults($pdo, $industry, $location, $processed, $scrapeResult['source']);

    // Log successful API usage
    logAPIUsage($pdo, 'scrape', $industry, $location, $scrapeResult['source'], count($processed), $executionTime);

    error_log("SUCCESS: " . count($processed) . " results in {$executionTime}s");

    ob_clean();
    json_response([
        'success' => true,
        'cached' => false,
        'count' => count($processed),
        'data' => $processed,
        'source' => $scrapeResult['source'],
        'executionTime' => $executionTime . 's',
        'message' => "Found " . count($processed) . " businesses"
    ]);

} catch (Exception $e) {
    $executionTime = round(microtime(true) - $startTime, 2);
    error_log("Error: " . $e->getMessage());

    ob_clean();
    json_response([
        'success' => false,
        'error' => $e->getMessage(),
        'executionTime' => $executionTime . 's'
    ], 500);
}
