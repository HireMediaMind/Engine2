-- Lead Finder Cache Tables
-- Run this in your MySQL database to enable caching

-- 1. Cache for search results (saves API calls and speeds up repeat searches)
CREATE TABLE IF NOT EXISTS `lead_search_cache` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `search_key` VARCHAR(255) NOT NULL UNIQUE,
  `industry` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `source` VARCHAR(50) DEFAULT NULL,
  `result_count` INT DEFAULT 0,
  `results_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  `hit_count` INT DEFAULT 0,
  `last_accessed` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_search_key` (`search_key`),
  INDEX `idx_expires` (`expires_at`),
  INDEX `idx_industry_location` (`industry`, `location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Individual business leads (normalized for easier querying)
CREATE TABLE IF NOT EXISTS `cached_leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `search_cache_id` INT NOT NULL,
  `business_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(500) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `rating` VARCHAR(10) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `source` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`search_cache_id`) REFERENCES `lead_search_cache`(`id`) ON DELETE CASCADE,
  INDEX `idx_name` (`business_name`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Track failed searches to avoid retrying immediately
CREATE TABLE IF NOT EXISTS `failed_searches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `search_key` VARCHAR(255) NOT NULL,
  `industry` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `error_message` TEXT,
  `attempt_count` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_attempt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_search_key` (`search_key`),
  INDEX `idx_last_attempt` (`last_attempt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. API usage tracking (monitor Firecrawl costs)
CREATE TABLE IF NOT EXISTS `api_usage_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `endpoint` VARCHAR(100) NOT NULL,
  `industry` VARCHAR(100),
  `location` VARCHAR(100),
  `source` VARCHAR(50),
  `result_count` INT DEFAULT 0,
  `execution_time` DECIMAL(5,2) DEFAULT NULL,
  `success` BOOLEAN DEFAULT TRUE,
  `error_message` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_endpoint` (`endpoint`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
