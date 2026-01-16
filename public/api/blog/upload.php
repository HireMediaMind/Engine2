<?php
/**
 * Cloudinary Image Upload API
 * POST /api/blog/upload.php - Upload image to Cloudinary
 * 
 * Expects: multipart/form-data with 'image' file
 * Returns: { success: true, url: "https://..." }
 */

require_once __DIR__ . '/../config.php';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

// Require admin auth
require_admin_auth();

// Cloudinary Configuration
$CLOUDINARY_CLOUD_NAME = 'dainbglex';
$CLOUDINARY_API_KEY = '138693587162381';
$CLOUDINARY_API_SECRET = getenv('CLOUDINARY_API_SECRET') ?: 'uSvnuh5CI2JP9DuG-E_ukoMCDAQ';

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No image uploaded or upload error'], 400);
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Validate file type
if (!in_array($file['type'], $allowedTypes)) {
    json_response(['error' => 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'], 400);
}

// Max size: 10MB
$maxSize = 10 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    json_response(['error' => 'File too large. Maximum: 10MB'], 400);
}

// Generate unique public_id
$timestamp = time();
$publicId = 'blog/' . $timestamp . '_' . pathinfo($file['name'], PATHINFO_FILENAME);

// Prepare upload to Cloudinary
$uploadUrl = "https://api.cloudinary.com/v1_1/{$CLOUDINARY_CLOUD_NAME}/image/upload";

// Generate signature
$params = [
    'timestamp' => $timestamp,
    'public_id' => $publicId,
    'folder' => 'hiremediamind'
];

ksort($params);
$signatureString = http_build_query($params) . $CLOUDINARY_API_SECRET;
$signature = sha1($signatureString);

// Prepare POST data
$postData = [
    'file' => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
    'api_key' => $CLOUDINARY_API_KEY,
    'timestamp' => $timestamp,
    'public_id' => $publicId,
    'folder' => 'hiremediamind',
    'signature' => $signature
];

// Upload via cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $uploadUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    error_log("Cloudinary upload error: " . $curlError);
    json_response(['error' => 'Upload failed: ' . $curlError], 500);
}

$result = json_decode($response, true);

if ($httpCode !== 200 || !isset($result['secure_url'])) {
    error_log("Cloudinary response: " . $response);
    $errorMessage = $result['error']['message'] ?? 'Unknown error';
    json_response(['error' => 'Cloudinary error: ' . $errorMessage], 500);
}

// Success!
json_response([
    'success' => true,
    'url' => $result['secure_url'],
    'public_id' => $result['public_id'],
    'width' => $result['width'] ?? null,
    'height' => $result['height'] ?? null
]);
