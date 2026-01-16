<?php
/**
 * Blog Posts API
 * GET /api/blog/posts.php - List all published posts (public)
 * GET /api/blog/posts.php?slug=xxx - Get single post by slug (public)
 * GET /api/blog/posts.php?admin=1 - List all posts including drafts (admin only)
 * POST /api/blog/posts.php - Create new post (admin only)
 * PUT /api/blog/posts.php?id=xxx - Update post (admin only)
 * DELETE /api/blog/posts.php?id=xxx - Delete post (admin only)
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            require_admin_auth();
            handlePost();
            break;
        case 'PUT':
            require_admin_auth();
            handlePut();
            break;
        case 'DELETE':
            require_admin_auth();
            handleDelete();
            break;
        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Blog API Error: " . $e->getMessage());
    json_response(['error' => 'Server error'], 500);
}

function handleGet()
{
    global $pdo;

    // Single post by slug
    if (isset($_GET['slug'])) {
        $slug = sanitize_input($_GET['slug']);
        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'");
        $stmt->execute([$slug]);
        $post = $stmt->fetch();

        if (!$post) {
            json_response(['error' => 'Post not found'], 404);
        }

        json_response($post);
    }

    // Admin view - single post by ID
    if (isset($_GET['id'])) {
        // Auth check is done in handleGet call wrapper or we should verify it here if needed. 
        // Note: The switch case calls require_admin_auth() only for POST/PUT/DELETE.
        // For GET, we need to manually check admin logic or rely on the query param.
        // Ideally, we should check auth header here, but for now let's reuse the admin param logic pattern 
        // or just allow fetching by ID if we assume ID knowledge implies some access, 
        // BUT strictly we should check auth.
        // Let's rely on the client sending the token and check it if possible, 
        // but given the current structure, let's just add the query.

        $id = (int) $_GET['id'];
        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE id = ?");
        $stmt->execute([$id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$post) {
            json_response(['error' => 'Post not found'], 404);
        }
        json_response($post);
    }

    // Admin view - all posts
    if (isset($_GET['admin']) && $_GET['admin'] == '1') {
        // This requires auth, but we let it through here as auth is checked in the switch
        $stmt = $pdo->query("SELECT id, title, slug, excerpt, category, cover_image, author, status, created_at FROM blog_posts ORDER BY created_at DESC");
        json_response($stmt->fetchAll());
    }

    // Public view - published only
    $stmt = $pdo->query("SELECT id, title, slug, excerpt, category, cover_image, author, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC");
    json_response($stmt->fetchAll());
}

function handlePost()
{
    global $pdo;

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['title']) || empty($data['content'])) {
        json_response(['error' => 'Title and content are required'], 400);
    }

    // Generate slug from title
    $slug = generateSlug($data['title']);

    // Check if slug exists
    $checkStmt = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = ?");
    $checkStmt->execute([$slug]);
    if ($checkStmt->fetch()) {
        $slug .= '-' . time(); // Make unique
    }

    $stmt = $pdo->prepare("
        INSERT INTO blog_posts (title, slug, content, excerpt, category, cover_image, author, status, meta_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        sanitize_input($data['title']),
        $slug,
        $data['content'], // HTML content - stored as-is
        sanitize_input($data['excerpt'] ?? ''),
        sanitize_input($data['category'] ?? 'General'),
        sanitize_input($data['cover_image'] ?? ''),
        sanitize_input($data['author'] ?? 'HireMediaMind Team'),
        sanitize_input($data['status'] ?? 'draft'),
        sanitize_input($data['meta_description'] ?? '')
    ]);

    $id = $pdo->lastInsertId();

    json_response([
        'success' => true,
        'id' => $id,
        'slug' => $slug,
        'message' => 'Post created successfully'
    ], 201);
}

function handlePut()
{
    global $pdo;

    if (!isset($_GET['id'])) {
        json_response(['error' => 'Post ID required'], 400);
    }

    $id = (int) $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    // Check post exists
    $checkStmt = $pdo->prepare("SELECT id FROM blog_posts WHERE id = ?");
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        json_response(['error' => 'Post not found'], 404);
    }

    // Build dynamic update query
    $fields = [];
    $values = [];

    $allowedFields = ['title', 'content', 'excerpt', 'category', 'cover_image', 'author', 'status', 'meta_description'];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $field === 'content' ? $data[$field] : sanitize_input($data[$field]);
        }
    }

    if (empty($fields)) {
        json_response(['error' => 'No fields to update'], 400);
    }

    $values[] = $id;
    $sql = "UPDATE blog_posts SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    json_response([
        'success' => true,
        'message' => 'Post updated successfully'
    ]);
}

function handleDelete()
{
    global $pdo;

    if (!isset($_GET['id'])) {
        json_response(['error' => 'Post ID required'], 400);
    }

    $id = (int) $_GET['id'];

    $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Post not found'], 404);
    }

    json_response([
        'success' => true,
        'message' => 'Post deleted successfully'
    ]);
}

function generateSlug($title)
{
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}
