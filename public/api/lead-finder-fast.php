<?php
/**
 * FAST Lead Finder - Optimized for Speed
 * Returns results in under 30 seconds
 * Strategy: Get quick results first, enrich later
 */

// Set maximum execution time
set_time_limit(60);
ini_set('max_execution_time', 60);

ob_start();
require_once 'config.php';

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_COMPILE_ERROR])) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Server Error', 'message' => 'Please try again']);
    }
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

/**
 * Quick email/phone validation
 */
function validateContact($type, $value)
{
    if (empty($value))
        return false;

    if ($type === 'email') {
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    if ($type === 'phone') {
        $cleaned = preg_replace('/\D/', '', $value);
        return strlen($cleaned) >= 7 && strlen($cleaned) <= 15;
    }

    return false;
}

/**
 * Extract contact info from any text
 */
function extractContactsFromText($text)
{
    $result = ['emails' => [], 'phones' => []];

    // Extract emails
    preg_match_all('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $emailMatches);
    foreach ($emailMatches[0] as $email) {
        if (validateContact('email', $email)) {
            $result['emails'][] = strtolower($email);
        }
    }

    // Extract phones
    preg_match_all('/[\+\(]?\d{1,4}[\)\-\s]?\d{3,4}[\-\s]?\d{3,4}[\-\s]?\d{3,4}/', $text, $phoneMatches);
    foreach ($phoneMatches[0] as $phone) {
        if (validateContact('phone', $phone)) {
            $result['phones'][] = trim($phone);
        }
    }

    return $result;
}

/**
 * FAST scrape - single source, optimized settings
 */
function quickScrape($url, $industry, $location, $apiKey)
{
    $payload = [
        'url' => $url,
        'formats' => ['extract', 'markdown'],
        'onlyMainContent' => false,
        'waitFor' => 3000, // Reduced from 10000
        'timeout' => 25000, // 25 seconds max
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
            'systemPrompt' => 'Extract business directory listings quickly. Focus on name, phone, email, and website.',
            'prompt' => "Extract business listings. For each: name (required), phone number, email address, full address, rating, website URL. Get as many as visible (target 20-30)."
        ]
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $apiKey",
            "Content-Type: application/json"
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("CURL Error: $curlError");
        return null;
    }

    if ($httpCode !== 200) {
        error_log("Scrape failed: HTTP $httpCode - " . substr($response, 0, 200));
        return null;
    }

    $result = json_decode($response, true);

    if (!$result || !isset($result['success'])) {
        error_log("Invalid response structure");
        return null;
    }

    // Extract businesses
    $businesses = [];
    if (isset($result['data']['extract']['businesses'])) {
        $businesses = $result['data']['extract']['businesses'];
    }

    // Fallback: Try to extract from markdown if available
    if (empty($businesses) && isset($result['data']['markdown'])) {
        $markdown = $result['data']['markdown'];
        $contacts = extractContactsFromText($markdown);

        // Create basic business entries from extracted contacts
        $namePattern = '/(?:^|\n)([A-Z][A-Za-z\s&\'-]{3,50})(?:\n|$)/m';
        preg_match_all($namePattern, $markdown, $nameMatches);

        foreach ($nameMatches[1] as $i => $name) {
            if (count($businesses) >= 20)
                break;

            $businesses[] = [
                'name' => trim($name),
                'phone' => $contacts['phones'][$i] ?? '',
                'email' => $contacts['emails'][$i] ?? '',
                'address' => '',
                'rating' => '',
                'website' => ''
            ];
        }
    }

    return $businesses;
}

/**
 * Choose best source based on location
 */
function getBestSource($industry, $location)
{
    $country = '';

    // Detect country from location
    if (preg_match('/\b(India|IN|Delhi|Mumbai|Bangalore|Chennai|Kolkata)\b/i', $location)) {
        $country = 'India';
    } elseif (preg_match('/\b(USA|US|America|New York|California|Texas)\b/i', $location)) {
        $country = 'USA';
    } elseif (preg_match('/\b(UK|United Kingdom|London|Manchester)\b/i', $location)) {
        $country = 'UK';
    }

    // For India, use JustDial (better Indian business directory)
    if ($country === 'India') {
        $city = preg_replace('/,?\s*(India|IN)$/i', '', $location);
        $city = strtolower(trim($city));
        return [
            'name' => 'JustDial',
            'url' => "https://www.justdial.com/$city/" . rawurlencode($industry)
        ];
    }

    // For USA, use Yelp
    if ($country === 'USA') {
        return [
            'name' => 'Yelp',
            'url' => "https://www.yelp.com/search?find_desc=" . rawurlencode($industry) . "&find_loc=" . rawurlencode($location)
        ];
    }

    // Default: Google Maps (works globally)
    return [
        'name' => 'Google Maps',
        'url' => "https://www.google.com/maps/search/" . rawurlencode("$industry in $location")
    ];
}

/**
 * Generate common business emails from website domain
 */
function generateBusinessEmails($websiteUrl, $businessName = '')
{
    if (empty($websiteUrl))
        return [];

    $domain = parse_url($websiteUrl, PHP_URL_HOST);
    if (!$domain)
        return [];

    $domain = preg_replace('/^www\./', '', $domain);

    $emails = [
        "info@$domain",
        "contact@$domain",
        "hello@$domain",
        "sales@$domain"
    ];

    // Add name-based if we have business name
    if (!empty($businessName)) {
        $cleanName = strtolower(preg_replace('/[^a-z0-9]/i', '', $businessName));
        if (strlen($cleanName) > 2 && strlen($cleanName) < 20) {
            array_unshift($emails, "$cleanName@$domain");
        }
    }

    return $emails;
}

try {
    $startTime = microtime(true);

    if (!isset($FIRECRAWL_API_KEY) || empty($FIRECRAWL_API_KEY)) {
        throw new Exception('API configuration error');
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!$input) {
        throw new Exception('Invalid request format');
    }

    $industry = sanitize_input($input['industry'] ?? '');
    $location = sanitize_input($input['location'] ?? '');
    $limit = isset($input['limit']) ? min((int) $input['limit'], 50) : 30;

    if (empty($industry) || empty($location)) {
        throw new Exception('Industry and Location are required');
    }

    error_log("=== FAST Lead Finder START ===");
    error_log("Query: $industry in $location (limit: $limit)");

    // Step 1: Choose best source (0.1 seconds)
    $source = getBestSource($industry, $location);
    error_log("Using source: {$source['name']}");

    // Step 2: Quick scrape (20-25 seconds)
    $businesses = quickScrape($source['url'], $industry, $location, $FIRECRAWL_API_KEY);

    if (empty($businesses)) {
        // Fallback to Google Maps if primary source fails
        if ($source['name'] !== 'Google Maps') {
            error_log("Primary source failed, trying Google Maps fallback...");
            $fallbackSource = [
                'name' => 'Google Maps',
                'url' => "https://www.google.com/maps/search/" . rawurlencode("$industry in $location")
            ];
            $businesses = quickScrape($fallbackSource['url'], $industry, $location, $FIRECRAWL_API_KEY);
            $source = $fallbackSource;
        }

        if (empty($businesses)) {
            throw new Exception('No businesses found. Please try different search terms or location.');
        }
    }

    error_log("Found " . count($businesses) . " raw businesses");

    // Step 3: Process and clean (2-3 seconds)
    $processed = [];
    $seen = [];

    foreach ($businesses as $biz) {
        if (empty($biz['name']) || strlen($biz['name']) < 3)
            continue;

        // Deduplicate
        $key = strtolower(trim($biz['name']));
        if (isset($seen[$key]))
            continue;
        $seen[$key] = true;

        $phone = trim($biz['phone'] ?? '');
        $email = trim($biz['email'] ?? '');
        $website = trim($biz['website'] ?? '');

        // If we have a website but no email, generate likely emails
        $suggestedEmails = [];
        if (!empty($website) && empty($email)) {
            $suggestedEmails = generateBusinessEmails($website, $biz['name']);
        }

        // Must have at least phone OR website
        if (empty($phone) && empty($website)) {
            continue;
        }

        $processed[] = [
            'name' => sanitize_input($biz['name']),
            'phone' => sanitize_input($phone),
            'email' => sanitize_input($email),
            'suggestedEmails' => $suggestedEmails, // Likely email patterns
            'address' => sanitize_input($biz['address'] ?? ''),
            'rating' => sanitize_input($biz['rating'] ?? ''),
            'website' => sanitize_input($website),
            'category' => $industry,
            'location' => $location,
            'source' => $source['name'],
            'hasEmail' => validateContact('email', $email),
            'hasPhone' => validateContact('phone', $phone),
            'hasSuggestedEmails' => !empty($suggestedEmails)
        ];

        if (count($processed) >= $limit)
            break;
    }

    // Sort: prioritize those with contact info
    usort($processed, function ($a, $b) {
        $scoreA = ($a['hasEmail'] ? 5 : 0) +
            ($a['hasPhone'] ? 4 : 0) +
            ($a['hasSuggestedEmails'] ? 2 : 0) +
            (!empty($a['website']) ? 1 : 0);
        $scoreB = ($b['hasEmail'] ? 5 : 0) +
            ($b['hasPhone'] ? 4 : 0) +
            ($b['hasSuggestedEmails'] ? 2 : 0) +
            (!empty($b['website']) ? 1 : 0);
        return $scoreB - $scoreA;
    });

    $endTime = microtime(true);
    $executionTime = round($endTime - $startTime, 2);

    // Statistics
    $withEmail = count(array_filter($processed, fn($l) => $l['hasEmail']));
    $withPhone = count(array_filter($processed, fn($l) => $l['hasPhone']));
    $withSuggested = count(array_filter($processed, fn($l) => $l['hasSuggestedEmails']));

    error_log("=== RESULTS ===");
    error_log("Total: " . count($processed));
    error_log("With Email: $withEmail");
    error_log("With Phone: $withPhone");
    error_log("With Suggested Emails: $withSuggested");
    error_log("Execution Time: {$executionTime}s");

    ob_clean();
    json_response([
        'success' => true,
        'count' => count($processed),
        'data' => $processed,
        'statistics' => [
            'total' => count($processed),
            'withEmail' => $withEmail,
            'withPhone' => $withPhone,
            'withSuggestedEmails' => $withSuggested,
            'executionTime' => $executionTime . 's'
        ],
        'source' => $source['name'],
        'query' => [
            'industry' => $industry,
            'location' => $location
        ],
        'message' => count($processed) > 0
            ? "Found " . count($processed) . " businesses in {$executionTime}s"
            : "No results found. Try different search terms."
    ]);

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    ob_clean();
    json_response([
        'success' => false,
        'error' => $e->getMessage(),
        'suggestion' => 'Try different search terms or check your internet connection'
    ], 500);
}
