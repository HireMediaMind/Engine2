# 🚀 Complete Hostinger Deployment Guide for HireMediaMind

## Table of Contents
1. [Database Setup](#1-database-setup)
2. [GitHub Setup](#2-github-setup)
3. [Build the Project](#3-build-the-project)
4. [Upload to Hostinger](#4-upload-to-hostinger)
5. [Configure PHP Files](#5-configure-php-files)
6. [Test Everything](#6-test-everything)
7. [SEO Checklist](#7-seo-checklist)

---

## 1. Database Setup

### You have 2 databases:
- `u205847150_chatbot` - For chatbot data
- `u205847150_leadinfo_db` - For leads and admin

### Create Admin Auth Tables in `u205847150_leadinfo_db`

1. Go to Hostinger → Databases → Click "Enter phpMyAdmin" for `u205847150_leadinfo_db`
2. Click on "SQL" tab at the top
3. Paste this SQL and click "Go":

```sql
-- Create admin_users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create admin_sessions table for login sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    announcement_type ENUM('info', 'warning', 'success', 'promo') DEFAULT 'info',
    icon VARCHAR(50),
    cta_text VARCHAR(100),
    cta_link VARCHAR(500),
    enabled TINYINT(1) DEFAULT 1,
    priority INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    target_pages TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed', 'free_addon') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) DEFAULT 0,
    badge_text VARCHAR(50) DEFAULT 'OFFER',
    enabled TINYINT(1) DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    target_pages TEXT,
    target_plans TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create client_previews table
CREATE TABLE IF NOT EXISTS client_previews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    preview_type ENUM('chatbot', 'workflow', 'whatsapp') DEFAULT 'chatbot',
    chatbot_config JSON,
    workflow_config JSON,
    status ENUM('pending', 'viewed', 'approved', 'changes_requested', 'expired') DEFAULT 'pending',
    feedback TEXT,
    expires_at DATETIME,
    viewed_at DATETIME,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

4. You should see "Query OK" message

---

## 2. GitHub Setup

### Step 2.1: Connect Lovable to GitHub
1. In Lovable, click the **GitHub** button (top right)
2. Click **Connect to GitHub**
3. Authorize the Lovable GitHub App
4. Select your GitHub account
5. Click **Create Repository**
6. Name it: `hiremediamind-website`

### Step 2.2: Clone to Your Computer
Open Terminal (Mac/Linux) or Command Prompt (Windows):

```bash
# Navigate to where you want the project
cd ~/Desktop

# Clone the repository
git clone https://github.com/YOUR_USERNAME/hiremediamind-website.git

# Enter the folder
cd hiremediamind-website
```

---

## 3. Build the Project

### Step 3.1: Install Node.js (if not installed)
- Download from: https://nodejs.org/
- Install the LTS version (20.x or later)
- Verify installation:
```bash
node --version
npm --version
```

### Step 3.2: Install Dependencies
```bash
# Inside your project folder
npm install
```

### Step 3.3: Build for Production
```bash
npm run build
```

This creates a `dist` folder with all your files.

---

## 4. Upload to Hostinger

### Step 4.1: Access File Manager
1. Go to https://hpanel.hostinger.com
2. Click on your website (hiremediamind.com)
3. Click **Files** → **File Manager**
4. Navigate to `public_html`

### Step 4.2: Backup Current Files (IMPORTANT!)
1. Select all files in public_html
2. Right-click → **Compress**
3. Name it `backup_YYYYMMDD.zip`
4. Download the backup

### Step 4.3: Clean public_html (Keep API folder!)
1. **DO NOT DELETE** the `/api` folder (your PHP files are there)
2. Delete everything else EXCEPT:
   - `/api` folder
   - Any other folders you want to keep

### Step 4.4: Upload Your Build Files
1. Open the `dist` folder on your computer
2. Select ALL files and folders inside `dist`:
   - `index.html`
   - `assets/` folder
   - `.htaccess`
   - `robots.txt`
   - `sitemap.xml`
   - `favicon.png`
   - etc.

3. **Method A: File Manager Upload**
   - Click "Upload Files" in Hostinger File Manager
   - Select all files from your `dist` folder
   - Wait for upload to complete

4. **Method B: FTP Upload (Recommended for large files)**
   - Use FileZilla (free FTP client)
   - Connect with your Hostinger FTP credentials
   - Upload entire `dist` folder contents to `public_html`

### Step 4.5: Upload PHP API Files
The PHP files should go into the `/api` folder. Structure:

```
public_html/
├── index.html          ← From dist/
├── assets/             ← From dist/
├── .htaccess           ← From dist/
├── robots.txt          ← From dist/
├── sitemap.xml         ← From dist/
├── favicon.png         ← From dist/
└── api/                ← Your PHP Backend
    ├── config.php
    ├── admin/
    │   └── auth.php
    ├── chatbot/
    │   ├── chat.php
    │   ├── config.php
    │   ├── knowledge.php
    │   ├── seed-knowledge.php
    │   └── sessions.php
    ├── analytics.php
    ├── auth.php
    ├── dashboard-stats.php
    ├── email-sequences.php
    ├── lead-actions.php
    ├── leads.php
    ├── pipeline.php
    ├── send-email.php
    ├── submit-lead.php
    └── whatsapp-webhook.php
```

---

## 5. Configure PHP Files

### Step 5.1: Update Database Credentials

Edit `public_html/api/config.php`:

```php
<?php
// Database Configuration for Hostinger
define('DB_HOST', 'localhost');
define('DB_NAME', 'u205847150_leadinfo_db');
define('DB_USER', 'u205847150_leadinfo');  // Your MySQL username
define('DB_PASS', 'YOUR_PASSWORD_HERE');   // Your MySQL password

// Chatbot Database (if separate)
define('CHATBOT_DB_NAME', 'u205847150_chatbot');
define('CHATBOT_DB_USER', 'u205847150_chatbot');
define('CHATBOT_DB_PASS', 'YOUR_CHATBOT_DB_PASSWORD');

// Site URL
define('SITE_URL', 'https://hiremediamind.com');

// API URL
define('API_URL', 'https://hiremediamind.com/api');
?>
```

### Step 5.2: Update Admin Auth PHP

Edit `public_html/api/admin/auth.php` (lines 20-23):

```php
function getDbConnection() {
    $host = 'localhost';
    $dbname = 'u205847150_leadinfo_db';
    $username = 'u205847150_leadinfo';
    $password = 'YOUR_PASSWORD_HERE';
    // ... rest of the code
}
```

---

## 6. Test Everything

### Step 6.1: Test Main Website
1. Visit https://hiremediamind.com
2. Check all pages load correctly:
   - Homepage
   - /ai-automation
   - /ai-lead-engine
   - /performance-marketing
   - /pricing
   - /contact
   - /about

### Step 6.2: Test Admin Login
1. Visit https://hiremediamind.com/admin/login
2. Click "Create admin account"
3. Enter:
   - Email: admin@hiremediamind.com
   - Password: HMM@Admin2026!
4. Click "Create Account"
5. You should be redirected to the admin dashboard

### Step 6.3: Test API Endpoints
Visit these URLs to check:
- https://hiremediamind.com/api/admin/auth.php?action=setup (should say "tables created" or "tables exist")

### Step 6.4: Test Contact Form
1. Go to /contact
2. Fill the form and submit
3. Check if leads appear in the admin dashboard

---

## 7. SEO Checklist

### Already Configured:
- ✅ sitemap.xml - All pages listed
- ✅ robots.txt - Configured to allow indexing
- ✅ .htaccess - HTTPS, compression, caching
- ✅ Meta tags on all pages (via react-helmet-async)
- ✅ Semantic HTML structure

### Submit to Google:
1. Go to https://search.google.com/search-console
2. Add property: hiremediamind.com
3. Verify ownership (use HTML file method or DNS)
4. Submit sitemap: https://hiremediamind.com/sitemap.xml

### Google Analytics:
1. Go to https://analytics.google.com
2. Create a new property
3. Get your Measurement ID (G-XXXXXXXX)
4. Add to your site's index.html before </head>:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

---

## Troubleshooting

### "Page not found" on refresh
- Make sure .htaccess is uploaded correctly
- Check if mod_rewrite is enabled in Hostinger

### Admin login not working
- Check database credentials in auth.php
- Make sure admin_users table was created
- Check browser console for errors

### API calls failing
- Verify the API URL in src/lib/hostinger-auth.ts matches your domain
- Check CORS headers in PHP files

### Styles not loading
- Clear browser cache (Ctrl+Shift+R)
- Check if assets folder was uploaded completely

---

## Quick Reference

| What | URL |
|------|-----|
| Website | https://hiremediamind.com |
| Admin Panel | https://hiremediamind.com/admin |
| Admin Login | https://hiremediamind.com/admin/login |
| API Base | https://hiremediamind.com/api |
| Sitemap | https://hiremediamind.com/sitemap.xml |
| Robots | https://hiremediamind.com/robots.txt |

---

## Need Help?

If something doesn't work:
1. Check browser console (F12 → Console)
2. Check Network tab for failed requests
3. Check Hostinger error logs (File Manager → logs/)

Good luck! 🎉
