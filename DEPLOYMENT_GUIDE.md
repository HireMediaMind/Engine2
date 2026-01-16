# 🚀 Complete Hostinger Deployment Guide - Step by Step (Spoon Feeding Edition)

## 📋 PREREQUISITES - What You Need Before Starting

1. **GitHub account** - Already done ✅ (your repo: https://github.com/HireMediaMind/code-tune-pro)
2. **Hostinger hosting account** - With MySQL database access
3. **Node.js installed on your computer** - Download from: https://nodejs.org/ (get the LTS version)
4. **A code editor** - VS Code recommended (https://code.visualstudio.com/)

---

## 🎯 STEP 1: Download ZIP from GitHub

1. Go to: https://github.com/HireMediaMind/code-tune-pro
2. Click the green **"Code"** button (top right area)
3. Click **"Download ZIP"** at the bottom of the dropdown
4. Save the file to your **Downloads** folder
5. **Extract/Unzip** the file:
   - **Windows**: Right-click the ZIP → "Extract All" → Click "Extract"
   - **Mac**: Double-click the ZIP file
6. You'll get a folder named: `code-tune-pro-main`
7. **Move this folder** to your Desktop for easy access

---

## 🛠️ STEP 2: Open Terminal/Command Prompt in the Project Folder

### On Windows:
1. Open File Explorer
2. Navigate to the `code-tune-pro-main` folder on your Desktop
3. Click in the address bar at the top (where it shows the path)
4. Type `cmd` and press **Enter**
5. A black command window will open

### On Mac:
1. Open **Terminal** (search for it in Spotlight: Cmd + Space, type "Terminal")
2. Type `cd ` (with a space after cd)
3. Open Finder, drag the `code-tune-pro-main` folder into Terminal
4. Press **Enter**

---

## 📦 STEP 3: Install Dependencies & Build the Project

In your Terminal/Command Prompt, run these commands **one by one**:

### Command 1: Install all project dependencies
```bash
npm install
```
⏳ **Wait** for this to complete (may take 2-5 minutes)
✅ You'll see "added XXX packages" when done

### Command 2: Build the production version
```bash
npm run build
```
⏳ **Wait** for this to complete (usually 30-60 seconds)
✅ When done, you'll see a message like "built in X seconds"

### What just happened?
- A new folder called **`dist`** was created inside your project
- This contains the compiled, optimized website ready for upload

---

## 📁 STEP 4: Understand What Files Go Where

After building, open your `code-tune-pro-main` folder. You'll see:

```
code-tune-pro-main/
│
├── dist/                     ← 🔴 UPLOAD CONTENTS (compiled React app)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxxxx.js
│   │   └── index-xxxxx.css
│   └── ...
│
├── public/                   ← 🔴 UPLOAD SPECIFIC FILES FROM HERE
│   ├── api/                  ← PHP backend (upload entire folder)
│   ├── .htaccess             ← Routing rules (upload this file)
│   ├── robots.txt            ← SEO file (upload this file)
│   └── sitemap.xml           ← SEO file (upload this file)
│
├── src/                      ← ❌ DON'T UPLOAD (source code - not needed)
├── node_modules/             ← ❌ DON'T UPLOAD (huge folder - not needed)
└── other files...            ← ❌ DON'T UPLOAD (config files - not needed)
```

---

## 🗄️ DATABASE TABLES REQUIRED

Run these SQL queries in **Hostinger phpMyAdmin**:

### Table 1: leads (Main leads table)
```sql
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `business` VARCHAR(255) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `service_type` VARCHAR(100) DEFAULT 'General',
  `page_source` VARCHAR(255) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `region` VARCHAR(100) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `stage` VARCHAR(50) DEFAULT 'new',
  `status` VARCHAR(50) DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `assigned_to` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_stage (stage),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 2: payments (For Stripe/Razorpay transactions)
```sql
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` VARCHAR(255) UNIQUE NOT NULL,
  `payment_gateway` ENUM('stripe', 'razorpay', 'paypal') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `plan_name` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transaction (transaction_id),
  INDEX idx_email (customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 3: lead_activity_log (Activity tracking)
```sql
CREATE TABLE IF NOT EXISTS `lead_activity_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lead_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_by` VARCHAR(255) DEFAULT 'system',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 4: email_sequences (Email automation)
```sql
CREATE TABLE IF NOT EXISTS `email_sequences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `trigger_event` VARCHAR(100) NOT NULL,
  `status` ENUM('active', 'paused', 'draft') DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 5: email_sequence_emails (Individual emails in sequences)
```sql
CREATE TABLE IF NOT EXISTS `email_sequence_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sequence_id` INT NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `delay_hours` INT DEFAULT 0,
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 6: email_sequence_subscribers (People in sequences)
```sql
CREATE TABLE IF NOT EXISTS `email_sequence_subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sequence_id` INT NOT NULL,
  `lead_id` INT NOT NULL,
  `current_step` INT DEFAULT 0,
  `status` ENUM('active', 'completed', 'unsubscribed') DEFAULT 'active',
  `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_email_at` TIMESTAMP DEFAULT NULL,
  FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 7: page_views (Analytics)
```sql
CREATE TABLE IF NOT EXISTS `page_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `page_url` VARCHAR(500) NOT NULL,
  `page_title` VARCHAR(255) DEFAULT NULL,
  `referrer` VARCHAR(500) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `session_id` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_page (page_url(191)),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔄 COMPLETE SYSTEM FLOW

### Flow 1: Lead Capture Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LEAD CAPTURE FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Visitor lands on hiremediamind.com                                     │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Contact Form OR │                                                    │
│  │ Lead Magnet     │                                                    │
│  │ Popup           │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  Frontend sends POST request to:                                        │
│  https://hiremediamind.com/api/submit-lead.php                         │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────┐                           │
│  │ submit-lead.php:                         │                           │
│  │ 1. Validates input                       │                           │
│  │ 2. Sanitizes data                        │                           │
│  │ 3. Gets IP geolocation                   │                           │
│  │ 4. Inserts into MySQL `leads` table      │                           │
│  │ 5. Returns success/error JSON            │                           │
│  └────────┬────────────────────────────────┘                           │
│           │                                                             │
│           ▼                                                             │
│  Lead appears in Admin Panel:                                           │
│  - Dashboard (stats updated)                                            │
│  - Leads page (full list)                                               │
│  - Pipeline (in "New Lead" stage)                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Admin Dashboard Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMIN DASHBOARD FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Admin visits: hiremediamind.com/admin/login                           │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────┐                               │
│  │ Login Form                          │                               │
│  │ Email: admin@hiremediamind.com      │                               │
│  │ Password: HMM@Admin2024!            │                               │
│  └────────┬────────────────────────────┘                               │
│           │                                                             │
│           ▼                                                             │
│  POST to /api/auth.php → Creates PHP Session                           │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     ADMIN SIDEBAR MENU                           │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  MAIN                                                            │   │
│  │  ├── Dashboard      → /admin          (Stats overview)           │   │
│  │  ├── Leads          → /admin/leads    (All leads table)          │   │
│  │  ├── Pipeline       → /admin/pipeline (Kanban CRM)               │   │
│  │  └── Analytics      → /admin/analytics (Charts & metrics)        │   │
│  │                                                                   │   │
│  │  AUTOMATION                                                       │   │
│  │  ├── Email Automation → /admin/email  (Email sequences)          │   │
│  │  └── WhatsApp         → /admin/whatsapp (Message automation)     │   │
│  │                                                                   │   │
│  │  SYSTEM                                                           │   │
│  │  └── Settings         → /admin/settings (Configuration)          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: CRM Pipeline Drag & Drop Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CRM PIPELINE FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Pipeline Stages (Left to Right):                                       │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ New Lead │→ │ Booked   │→ │ Showed   │→ │ Proposal │→ │ Closed   │  │
│  │ (Blue)   │  │ Call     │  │ Up       │  │ Sent     │  │ Won      │  │
│  │          │  │ (Purple) │  │ (Amber)  │  │ (Orange) │  │ (Green)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       │                                                        │        │
│       └────────────────────────────────────────────────────────┘        │
│                              Nurture                                    │
│                             (Grey - for leads not ready)                │
│                                                                         │
│  HOW TO USE:                                                            │
│  1. Click and hold any lead card                                        │
│  2. Drag it to a different stage column                                 │
│  3. Drop it - the stage updates automatically                           │
│  4. API call to lead-actions.php saves the change                       │
│                                                                         │
│  Example:                                                               │
│  ┌─────────────┐     Drag      ┌─────────────┐                         │
│  │ John Smith  │ ───────────→  │ John Smith  │                         │
│  │ $2,500      │               │ $2,500      │                         │
│  │ New Lead    │               │ Booked Call │                         │
│  └─────────────┘               └─────────────┘                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow 4: Email Automation Flow
```
┌─────────────────────────────────────────────────────────────────────────┐
│                       EMAIL AUTOMATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. CREATE SEQUENCE                                                     │
│     └── Go to /admin/email                                              │
│     └── Click "Create Sequence"                                         │
│     └── Set trigger: "New Lead" or "Lead Magnet Download"               │
│                                                                         │
│  2. ADD EMAILS TO SEQUENCE                                              │
│     ┌──────────────────────────────────────────────────────────┐       │
│     │ Email 1: Welcome Email          │ Delay: 0 hours         │       │
│     │ Email 2: Value Email            │ Delay: 24 hours        │       │
│     │ Email 3: Case Study             │ Delay: 48 hours        │       │
│     │ Email 4: Offer/CTA              │ Delay: 72 hours        │       │
│     └──────────────────────────────────────────────────────────┘       │
│                                                                         │
│  3. AUTOMATIC TRIGGER                                                   │
│     When lead submits form:                                             │
│     └── Lead added to sequence                                          │
│     └── Emails sent at scheduled intervals                              │
│     └── Uses SMTP: team@hiremediamind.com                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ STEP 5: Create Database on Hostinger (VERY IMPORTANT!)

### 5.1: Login to Hostinger hPanel
1. Go to: https://hpanel.hostinger.com/
2. Login with your Hostinger email and password
3. Click on your website/domain name

### 5.2: Create MySQL Database
1. In the left sidebar, find **"Databases"** section
2. Click **"MySQL Databases"**
3. Create a new database:
   - **Database Name**: Enter a name (e.g., `hiremediamind`)
   - Hostinger will add your prefix, so it becomes: `u123456789_hiremediamind`
   - **WRITE THIS DOWN!**
4. Click **"Create"**

### 5.3: Create Database User
1. Still on the same page, scroll to **"Create New MySQL User"**
2. Fill in:
   - **Username**: `admin` (becomes `u123456789_admin`)
   - **Password**: Create a strong password and **SAVE IT SOMEWHERE SAFE!**
3. Click **"Create"**

### 5.4: Link User to Database
1. Scroll to **"Add User to Database"**
2. Select the user you just created
3. Select the database you just created
4. Check **"All Privileges"**
5. Click **"Add"**

### 5.5: Open phpMyAdmin and Run SQL
1. Next to your database, click **"Enter phpMyAdmin"**
2. In the left sidebar, click on your database name
3. Click the **"SQL"** tab at the top
4. **Copy and paste this ENTIRE SQL block** and click **"Go"**:

```sql
-- Admin Users Table (for login)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin Sessions Table (for staying logged in)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Leads Table (main contact form submissions)
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    business VARCHAR(255) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    service_type VARCHAR(100) DEFAULT 'General',
    page_source VARCHAR(255) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    country VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    region VARCHAR(100) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    stage VARCHAR(50) DEFAULT 'new',
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT DEFAULT NULL,
    assigned_to VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_stage (stage),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Page Views Table (for analytics)
CREATE TABLE IF NOT EXISTS page_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255) DEFAULT NULL,
    referrer VARCHAR(500) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    session_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_page (page_url(191)),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Email Sequences Table
CREATE TABLE IF NOT EXISTS email_sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    status ENUM('active', 'paused', 'draft') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chatbot Sessions Table
CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    messages JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chatbot Knowledge Table
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    priority INT DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

You should see "Query executed successfully" message!

---

## ⚙️ STEP 6: Update Database Credentials in PHP Files (CRITICAL!)

Before uploading, you MUST update your database credentials in the PHP files.

### 6.1: Open `public/api/config.php` in a text editor

Find this section and update with YOUR credentials:

```php
// Database Configuration - UPDATE THESE!
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_hiremediamind');  // ← Your database name from Step 5
define('DB_USER', 'u123456789_admin');          // ← Your database username from Step 5
define('DB_PASS', 'YourPasswordHere');          // ← Your database password from Step 5

// Your domain (update this!)
define('SITE_URL', 'https://hiremediamind.com');
```

### 6.2: Open `public/api/admin/auth.php` in a text editor

Find this section near the top (around line 10-15):

```php
// Database credentials - UPDATE THESE!
$host = 'localhost';
$dbname = 'u123456789_hiremediamind';   // ← Your database name
$username = 'u123456789_admin';          // ← Your database username
$password = 'YourPasswordHere';          // ← Your database password
```

**SAVE BOTH FILES after editing!**

---

## 📤 STEP 7: Upload Files to Hostinger (The Main Event!)

### 7.1: Access Hostinger File Manager
1. In Hostinger hPanel, click **"Files"** in the left sidebar
2. Click **"File Manager"**
3. Click on the **`public_html`** folder
4. **Delete everything inside** (if there's anything there)

### 7.2: Upload Step-by-Step

#### 📁 UPLOAD #1: The compiled React app (from `dist` folder)

1. On your computer, open the `code-tune-pro-main` folder
2. Open the **`dist`** folder (created when you ran `npm run build`)
3. You'll see files like:
   - `index.html`
   - `assets/` folder
   - Maybe `favicon.png`, etc.
4. In Hostinger File Manager, click **"Upload"** button (top left)
5. Upload `index.html` first
6. Then upload the entire `assets` folder (drag and drop works!)

After this, your `public_html` should look like:
```
public_html/
├── index.html
└── assets/
    ├── index-xxxxxx.js
    └── index-xxxxxx.css
```

#### 📁 UPLOAD #2: The PHP backend (from `public/api` folder)

1. Go back to your computer
2. Open `code-tune-pro-main` → `public` folder
3. You'll see the `api` folder
4. In Hostinger File Manager:
   - Make sure you're in `public_html`
   - Click **"New Folder"** → name it `api`
   - Click into the `api` folder
   - Upload **ALL files** from your computer's `public/api` folder

After this, your structure should be:
```
public_html/
├── index.html
├── assets/
└── api/
    ├── admin/
    │   └── auth.php
    ├── config.php
    ├── leads.php
    ├── submit-lead.php
    ├── dashboard-stats.php
    ├── analytics.php
    ├── pipeline.php
    ├── lead-actions.php
    ├── chatbot/
    │   ├── chat.php
    │   ├── config.php
    │   ├── knowledge.php
    │   └── sessions.php
    └── ... (other PHP files)
```

#### 📁 UPLOAD #3: SEO & Configuration Files

From your `public` folder, upload these files directly to `public_html`:

1. **`.htaccess`** - VERY IMPORTANT! (might be hidden)
2. **`robots.txt`** - For search engines
3. **`sitemap.xml`** - For Google indexing
4. **`favicon.png`** - Site icon (if you have one)

**To see hidden files (.htaccess):**
- **Windows**: Open File Explorer → View tab → Check "Hidden items"
- **Mac**: In Finder, press `Cmd + Shift + .` (period)

Final structure:
```
public_html/
├── .htaccess           ← SEO & routing rules
├── index.html          ← Main website entry
├── robots.txt          ← Search engine rules
├── sitemap.xml         ← Page list for Google
├── favicon.png         ← Browser tab icon
├── assets/             ← Compiled JS/CSS
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── api/                ← PHP backend
    ├── admin/
    │   └── auth.php
    ├── config.php
    ├── submit-lead.php
    └── ... (other files)
```

---

## 🔐 STEP 8: Create Your Admin Account

1. Open your browser
2. Go to: `https://yourdomain.com/admin/login`
3. You'll see the login page
4. Click **"Need an account? Sign up"** at the bottom
5. Enter:
   - **Your email**: admin@yourdomain.com
   - **Your password**: Make it strong! (e.g., `Admin@2024Secure!`)
6. Click **"Create Account"**
7. You'll be logged in and redirected to the Admin Dashboard!

---

## 🌐 STEP 9: Understanding SEO Files

### 📄 What is `robots.txt`?

This file tells search engines (Google, Bing) what to index:

```
User-agent: Googlebot
Allow: /                    ← Google can index your public pages

User-agent: *
Allow: /                    ← All search engines can index

Disallow: /admin            ← DON'T index admin pages (private!)
Disallow: /admin/
Disallow: /api/             ← DON'T index API endpoints
Disallow: /preview/

Sitemap: https://hiremediamind.com/sitemap.xml  ← Where to find all pages
```

**To verify it works:** Visit `https://yourdomain.com/robots.txt`

### 📄 What is `sitemap.xml`?

This file lists ALL your public pages for Google:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://hiremediamind.com/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>          ← Homepage is most important
    </url>
    <url>
        <loc>https://hiremediamind.com/about</loc>
        <priority>0.8</priority>
    </url>
    <!-- More pages... -->
</urlset>
```

**To verify it works:** Visit `https://yourdomain.com/sitemap.xml`

### 📄 What is `.htaccess`?

This file controls:
1. **React routing** - Makes pages like `/about` work
2. **HTTPS redirect** - Forces secure connection
3. **Caching** - Makes site load faster
4. **API routing** - Lets `/api/` calls work with PHP

```apache
# Enable URL rewriting
RewriteEngine On

# Force HTTPS (secure)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API requests go to PHP files
RewriteRule ^api/(.*)$ api/$1 [L]

# React routing (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 🔍 STEP 10: Submit to Google Search Console

1. Go to: https://search.google.com/search-console/
2. Click **"Add Property"**
3. Choose **"URL prefix"**
4. Enter: `https://yourdomain.com`
5. Choose verification method:
   - **Recommended**: HTML file upload
   - Download the verification file
   - Upload to `public_html` via Hostinger
6. Click **"Verify"**
7. Once verified:
   - Go to **Sitemaps** in left sidebar
   - Add: `https://yourdomain.com/sitemap.xml`
   - Click **"Submit"**

Google will start indexing your site within 24-48 hours!

---

## ✅ STEP 11: Test Everything!

### Checklist:
- [ ] Homepage loads: `https://yourdomain.com`
- [ ] All navigation links work
- [ ] Contact form submits (check if lead appears in admin)
- [ ] Admin login: `https://yourdomain.com/admin/login`
- [ ] Dashboard loads with stats
- [ ] Leads page shows your test submission
- [ ] robots.txt accessible: `https://yourdomain.com/robots.txt`
- [ ] sitemap.xml accessible: `https://yourdomain.com/sitemap.xml`

---

## 🔧 TROUBLESHOOTING

### ❌ "Page not found" when clicking links?
1. Make sure `.htaccess` is uploaded to `public_html`
2. In Hostinger: Go to **Advanced** → **PHP Configuration** → Enable `mod_rewrite`

### ❌ Admin login not working?
1. Verify database credentials in `auth.php` match what you created
2. Check that `admin_users` and `admin_sessions` tables exist
3. Try creating a new account (signup mode)

### ❌ Contact form not saving leads?
1. Check `config.php` has correct database credentials
2. Verify `leads` table exists in phpMyAdmin
3. Open browser console (F12) → Network tab → Submit form → Check for errors

### ❌ Can't see .htaccess file?
1. In Hostinger File Manager: Click the 3 dots (⋮) → **Settings**
2. Check **"Show Hidden Files"**

### ❌ Site loads but looks broken (no CSS)?
1. Make sure the entire `assets` folder was uploaded
2. Check that files like `index-xxxxx.js` and `index-xxxxx.css` exist

---

## 🎉 CONGRATULATIONS!

Your website is now:
- ✅ **LIVE** on Hostinger
- ✅ **SEO optimized** with sitemap and robots.txt
- ✅ **Secure** with HTTPS redirect
- ✅ **Has working admin dashboard**
- ✅ **Capturing leads** through contact forms
- ✅ **Ready for Google** to index

**Your Admin Panel URLs:**
| Page | URL |
|------|-----|
| Login | `https://yourdomain.com/admin/login` |
| Dashboard | `https://yourdomain.com/admin` |
| Leads | `https://yourdomain.com/admin/leads` |
| Pipeline | `https://yourdomain.com/admin/pipeline` |
| Analytics | `https://yourdomain.com/admin/analytics` |

---

## 📞 Need Help?

If stuck, tell me:
1. Which step number
2. What error you're seeing
3. Screenshot if possible

I'll help you fix it!
