<?php
/**
 * Email Finder Utility
 * Separate endpoint to enrich existing leads with emails
 * Call this after getting initial results
 */

ob_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

/**
 * Generate possible email patterns
 */
function generateEmailPatterns($firstName, $lastName, $domain)
{
    $patterns = [
        strtolower($firstName . '@' . $domain),
        strtolower($lastName . '@' . $domain),
        strtolower($firstName . '.' . $lastName . '@' . $domain),
        strtolower($firstName . $lastName . '@' . $domain),
        strtolower(substr($firstName, 0, 1) . $lastName . '@' . $domain),
        strtolower($firstName . substr($lastName, 0, 1) . '@' . $domain),
        'info@' . $domain,
        'contact@' . $domain,
        'hello@' . $domain,
        'sales@' . $domain,
        'support@' . $domain
    ];

    return array_unique($patterns);
}

/**
 * Extract domain from website URL
 */
function extractDomain($url)
{
    $parsed = parse_url($url);
    if (isset($parsed['host'])) {
        $host = $parsed['host'];
        // Remove www.
        return preg_replace('/^www\./', '', $host);
    }
    return null;
}

/**
 * Scrape website for email addresses
 */
function findEmailsOnWebsite($websiteUrl, $apiKey)
{
    if (empty($websiteUrl))
        return [];

    // Clean URL
    if (!preg_match('/^https?:\/\//', $websiteUrl)) {
        $websiteUrl = 'https://' . $websiteUrl;
    }

    $payload = [
        'url' => $websiteUrl,
        'formats' => ['markdown'],
        'onlyMainContent' => false,
        'waitFor' => 5000,
        'timeout' => 45000,
        'includeTags' => ['a', 'footer', 'header', 'contact']
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.firecrawl.dev/v1/scrape",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 50,
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
        return [];
    }

    $result = json_decode($response, true);
    $content = $result['data']['markdown'] ?? '';

    if (empty($content)) {
        return [];
    }

    // Extract all emails using regex
    $emailPattern = '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/';
    preg_match_all($emailPattern, $content, $matches);

    $emails = array_unique($matches[0]);

    // Filter out common false positives
    $filtered = array_filter($emails, function ($email) {
        $blocked = ['example.com', 'test.com', 'domain.com', 'email.com', 'gmail.com', 'yahoo.com', 'hotmail.com'];
        foreach ($blocked as $domain) {
            if (strpos($email, $domain) !== false) {
                return false;
            }
        }
        return true;
    });

    return array_values($filtered);
}

/**
 * Try to find contact page URL
 */
function findContactPage($websiteUrl, $apiKey)
{
    if (empty($websiteUrl))
        return null;

    if (!preg_match('/^https?:\/\//', $websiteUrl)) {
        $websiteUrl = 'https://' . $websiteUrl;
    }

    $domain = parse_url($websiteUrl, PHP_URL_HOST);
    $scheme = parse_url($websiteUrl, PHP_URL_SCHEME);

    // Common contact page URLs
    $possibleUrls = [
        $scheme . '://' . $domain . '/contact',
        $scheme . '://' . $domain . '/contact-us',
        $scheme . '://' . $domain . '/contact.html',
        $scheme . '://' . $domain . '/about',
        $scheme . '://' . $domain . '/about-us'
    ];

    // Quick check - try to scrape one contact page
    foreach (array_slice($possibleUrls, 0, 2) as $url) {
        $emails = findEmailsOnWebsite($url, $apiKey);
        if (!empty($emails)) {
            return ['url' => $url, 'emails' => $emails];
        }
        sleep(1);
    }

    return null;
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

    // Can accept single business or array of businesses
    $businesses = isset($input['businesses']) ? $input['businesses'] : [$input];

    $enriched = [];
    $emailsFound = 0;

    foreach ($businesses as $business) {
        $website = $business['website'] ?? '';
        $name = $business['name'] ?? '';

        if (empty($website)) {
            $business['enrichment_status'] = 'no_website';
            $enriched[] = $business;
            continue;
        }

        error_log("Finding emails for: $name");

        // Strategy 1: Scrape main website
        $emails = findEmailsOnWebsite($website, $FIRECRAWL_API_KEY);

        // Strategy 2: Try contact page if main didn't work
        if (empty($emails)) {
            $contactPage = findContactPage($website, $FIRECRAWL_API_KEY);
            if ($contactPage) {
                $emails = $contactPage['emails'];
            }
        }

        // Strategy 3: Generate common patterns if we have domain
        if (empty($emails)) {
            $domain = extractDomain($website);
            if ($domain) {
                $emails = ['info@' . $domain, 'contact@' . $domain];
            }
        }

        if (!empty($emails)) {
            $business['email'] = $emails[0]; // Use first email
            $business['additional_emails'] = array_slice($emails, 1, 3); // Store up to 3 more
            $business['enrichment_status'] = 'email_found';
            $emailsFound++;
        } else {
            $business['enrichment_status'] = 'email_not_found';
        }

        $enriched[] = $business;

        // Rate limiting
        sleep(1);
    }

    error_log("Enrichment complete: $emailsFound emails found for " . count($businesses) . " businesses");

    ob_clean();
    json_response([
        'success' => true,
        'count' => count($enriched),
        'emailsFound' => $emailsFound,
        'data' => $enriched
    ]);

} catch (Exception $e) {
    error_log("Email Finder Error: " . $e->getMessage());
    ob_clean();
    json_response(['error' => $e->getMessage(), 'success' => false], 500);
}
