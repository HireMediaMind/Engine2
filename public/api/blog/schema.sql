-- Blog CMS Schema for leadinfo_db
-- Run this SQL in Hostinger phpMyAdmin

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `content` longtext NOT NULL,
  `excerpt` text,
  `category` varchar(100) DEFAULT 'General',
  `cover_image` varchar(500),
  `author` varchar(100) DEFAULT 'HireMediaMind Team',
  `status` enum('draft','published') DEFAULT 'draft',
  `meta_description` varchar(300),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
