<?php
/**
 * Enhanced Lead Finder with Contact Enrichment
 * Finds phone numbers and emails for businesses
 */

ob_start();
require_once 'config.php';

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_COMPILE_ERROR])) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['error' => 'Server Error', 'details' => $error['message']]);
    }
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

/**
 * Validate email format
 */
function isValidEmail($email)
{
    return !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Validate phone format (flexible for international)
 */
function isValidPhone($phone)
{
    if (empty($phone))
        return false;
    // Remove common separators
    $cleaned = preg_replace('/[\s\-\(\)\.\+]/', '', $phone);
    // Check if it has 7-15 digits (international range)
    return preg_match('/^\d{7,15}$/', $cleaned);
}

/**
 * Extract email from text using regex
 */
function extractEmailFromText($text)
{
    $pattern = '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/';
    if (preg_match($pattern, $text, $matches)) {
        return $matches[0];
    }
    return null;
}

/**
 * Extract phone from text
 */
function extractPhoneFromText($text)
{
    // Pattern for various phone formats
    $patterns = [
        '/(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/',  // US format
        '/(\+?\d{1,3}[\s.-]?)?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{4}/',    // International
        '/\d{10,}/',                                                    // Simple 10+ digits
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $text, $matches)) {
            return $matches[0];
        }
    }
    return null;
}

/**
 * Scrape a business website to find contact info
 */
function enrichBusinessFromWebsite($websiteUrl, $apiKey)
{
    if (empty($websiteUrl) || !filter_var($websiteUrl, FILTER_VALIDATE_URL)) {
        return null;
    }

    $payload = [
        'url' => $websiteUrl,
        'formats' => ['extract', 'markdown'],
        'onlyMainContent' => false,
        'waitFor' => 5000,
        'timeout' => 60000,
        'extract' => [
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'contactInfo' => [
                        'type' => 'object',
                        'properties' => [
                            'emails' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                                'description' => 'All email addresses found'
                            ],
                            'phones' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                                'description' => 'All phone numbers found'
                            ],
                            'address' => ['type' => 'string'],
                            'socialMedia' => [
                                'type' => 'object',
                                'properties' => [
                                    'facebook' => ['type' => 'string'],
                                    'linkedin' => ['type' => 'string'],
                                    'twitter' => ['type' => 'string'],
                                    'instagram' => ['type' => 'string']
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            'prompt' => 'Extract all contact information from this website including: all email addresses, all phone numbers, physical address, and social media links. Look in the contact page, footer, header, and about page.'
        ]
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
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
        if (isset($result['data']['extract']['contactInfo'])) {
            return $result['data']['extract']['contactInfo'];
        }
        // Fallback: extract from markdown
        if (isset($result['data']['markdown'])) {
            $markdown = $result['data']['markdown'];
            return [
                'emails' => [extractEmailFromText($markdown)],
                'phones' => [extractPhoneFromText($markdown)]
            ];
        }
    }

    return null;
}

/**
 * Search for businesses with enhanced scraping
 */
function searchBusinesses($industry, $location, $apiKey, $resultsNeeded = 50)
{
    $allBusinesses = [];
    $strategies = [
        [
            'name' => 'Google Maps',
            'url' => "https://www.google.com/maps/search/" . rawurlencode("$industry in $location")
        ],
        [
            'name' => 'Yelp',
            'url' => "https://www.yelp.com/search?find_desc=" . rawurlencode($industry) . "&find_loc=" . rawurlencode($location)
        ],
        [
            'name' => 'Yellow Pages',
            'url' => "https://www.yellowpages.com/search?search_terms=" . rawurlencode($industry) . "&geo_location_terms=" . rawurlencode($location)
        ]
    ];

    foreach ($strategies as $strategy) {
        if (count($allBusinesses) >= $resultsNeeded)
            break;

        error_log("Trying {$strategy['name']}...");

        $payload = [
            'url' => $strategy['url'],
            'formats' => ['extract'],
            'onlyMainContent' => false,
            'waitFor' => 10000,
            'timeout' => 120000,
            'extract' => [
                'schema' => [
                    'type' => 'object',
                    'properties' => [
                        'businesses' => [
                            'type' => 'array',
                            'description' => 'List of ALL business listings on the page',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'name' => ['type' => 'string', 'description' => 'Business name'],
                                    'phone' => ['type' => 'string', 'description' => 'Phone number'],
                                    'email' => ['type' => 'string', 'description' => 'Email address'],
                                    'address' => ['type' => 'string', 'description' => 'Full address'],
                                    'rating' => ['type' => 'string', 'description' => 'Star rating'],
                                    'website' => ['type' => 'string', 'description' => 'Website URL'],
                                    'category' => ['type' => 'string', 'description' => 'Business type']
                                ],
                                'required' => ['name']
                            ]
                        ]
                    ]
                ],
                'systemPrompt' => 'You are extracting business directory listings. Extract EVERY business shown, not just a few.',
                'prompt' => "Extract ALL business listings from this page (aim for at least 20-50 businesses). For each business include: name, phone number, email (if visible), full address, rating, website URL, and category. Extract every single listing visible on the page."
            ]
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 150,
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
                $businesses = $result['data']['extract']['businesses'];
                error_log("{$strategy['name']}: Found " . count($businesses) . " businesses");

                foreach ($businesses as $business) {
                    if (!empty($business['name'])) {
                        $business['source'] = $strategy['name'];
                        $allBusinesses[] = $business;
                    }
                }
            }
        }

        // Small delay between strategies
        sleep(2);
    }

    return $allBusinesses;
}

try {
    if (!isset($FIRECRAWL_API_KEY) || empty($FIRECRAWL_API_KEY)) {
        throw new Exception('Server configuration error: Missing Firecrawl API Key');
    }

    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $industry = sanitize_input($input['industry'] ?? '');
    $location = sanitize_input($input['location'] ?? '');
    $enrichContacts = $input['enrichContacts'] ?? true; // Whether to scrape websites
    $limit = isset($input['limit']) ? min((int) $input['limit'], 100) : 50;

    if (empty($industry) || empty($location)) {
        throw new Exception('Industry and Location are required');
    }

    error_log("=== Lead Finder Request ===");
    error_log("Industry: $industry, Location: $location, Limit: $limit");

    // Step 1: Get businesses from multiple sources
    $rawBusinesses = searchBusinesses($industry, $location, $FIRECRAWL_API_KEY, $limit);

    error_log("Total raw businesses found: " . count($rawBusinesses));

    // Step 2: Process and enrich businesses
    $processedBusinesses = [];
    $enrichmentCount = 0;
    $maxEnrichments = 10; // Limit website scraping to avoid timeout

    foreach ($rawBusinesses as $business) {
        if (empty($business['name']))
            continue;

        $phone = $business['phone'] ?? '';
        $email = $business['email'] ?? '';
        $website = $business['website'] ?? '';

        // If we have a website but missing contact info, try to enrich
        if (
            $enrichContacts &&
            !empty($website) &&
            (empty($phone) || empty($email)) &&
            $enrichmentCount < $maxEnrichments
        ) {

            error_log("Enriching: {$business['name']} from $website");
            $contactInfo = enrichBusinessFromWebsite($website, $FIRECRAWL_API_KEY);

            if ($contactInfo) {
                // Use first valid email
                if (empty($email) && !empty($contactInfo['emails'])) {
                    foreach ($contactInfo['emails'] as $foundEmail) {
                        if (isValidEmail($foundEmail)) {
                            $email = $foundEmail;
                            break;
                        }
                    }
                }

                // Use first valid phone
                if (empty($phone) && !empty($contactInfo['phones'])) {
                    foreach ($contactInfo['phones'] as $foundPhone) {
                        if (isValidPhone($foundPhone)) {
                            $phone = $foundPhone;
                            break;
                        }
                    }
                }

                // Update address if we found better one
                if (empty($business['address']) && !empty($contactInfo['address'])) {
                    $business['address'] = $contactInfo['address'];
                }
            }

            $enrichmentCount++;
            sleep(1); // Rate limiting
        }

        // Only add if we have at least one contact method
        $hasValidContact = isValidPhone($phone) || isValidEmail($email) || !empty($website);

        if ($hasValidContact) {
            $processedBusinesses[] = [
                'name' => sanitize_input($business['name']),
                'phone' => sanitize_input($phone),
                'email' => sanitize_input($email),
                'address' => sanitize_input($business['address'] ?? ''),
                'rating' => sanitize_input($business['rating'] ?? ''),
                'website' => sanitize_input($website),
                'category' => sanitize_input($business['category'] ?? $industry),
                'location' => $location,
                'source' => $business['source'] ?? 'Unknown',
                'hasEmail' => isValidEmail($email),
                'hasPhone' => isValidPhone($phone),
                'found_date' => date('Y-m-d H:i:s')
            ];
        }

        // Stop if we have enough results
        if (count($processedBusinesses) >= $limit) {
            break;
        }
    }

    // Remove duplicates based on name + location
    $uniqueBusinesses = [];
    $seen = [];
    foreach ($processedBusinesses as $business) {
        $key = strtolower($business['name'] . $business['location']);
        if (!isset($seen[$key])) {
            $uniqueBusinesses[] = $business;
            $seen[$key] = true;
        }
    }

    // Sort: prioritize businesses with both email and phone
    usort($uniqueBusinesses, function ($a, $b) {
        $scoreA = ($a['hasEmail'] ? 2 : 0) + ($a['hasPhone'] ? 2 : 0) + (!empty($a['website']) ? 1 : 0);
        $scoreB = ($b['hasEmail'] ? 2 : 0) + ($b['hasPhone'] ? 2 : 0) + (!empty($b['website']) ? 1 : 0);
        return $scoreB - $scoreA;
    });

    // Calculate statistics
    $withEmail = count(array_filter($uniqueBusinesses, fn($b) => $b['hasEmail']));
    $withPhone = count(array_filter($uniqueBusinesses, fn($b) => $b['hasPhone']));
    $withBoth = count(array_filter($uniqueBusinesses, fn($b) => $b['hasEmail'] && $b['hasPhone']));

    error_log("=== Results ===");
    error_log("Total: " . count($uniqueBusinesses));
    error_log("With Email: $withEmail");
    error_log("With Phone: $withPhone");
    error_log("With Both: $withBoth");

    ob_clean();
    json_response([
        'success' => true,
        'count' => count($uniqueBusinesses),
        'data' => $uniqueBusinesses,
        'statistics' => [
            'total' => count($uniqueBusinesses),
            'withEmail' => $withEmail,
            'withPhone' => $withPhone,
            'withBoth' => $withBoth,
            'enriched' => $enrichmentCount
        ],
        'query' => [
            'industry' => $industry,
            'location' => $location
        ],
        'message' => count($uniqueBusinesses) > 0
            ? "Found " . count($uniqueBusinesses) . " businesses ($withBoth have both email and phone)"
            : "No businesses found. Try different search terms."
    ]);

} catch (Exception $e) {
    error_log("Lead Finder Error: " . $e->getMessage());
    ob_clean();
    json_response([
        'error' => $e->getMessage(),
        'success' => false
    ], 500);
}
