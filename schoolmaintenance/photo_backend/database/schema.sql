-- Media Storage Database Schema
-- Import this file in phpMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS media_storage_db;
USE media_storage_db;

-- Create user_photos table
CREATE TABLE IF NOT EXISTS user_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    photo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO user_photos (username, photo) VALUES
('john_doe', 'uploads/1702408800_sample1.jpg'),
('jane_smith', 'uploads/1702408801_sample2.png'),
('mike_wilson', 'uploads/1702408802_sample3.webp');
