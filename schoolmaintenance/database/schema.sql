-- School Maintenance & Repair Request System Database Schema
-- Import this file in phpMyAdmin to create the database and table

-- Create database
CREATE DATABASE IF NOT EXISTS school_maintenance;
USE school_maintenance;

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    reporter_name VARCHAR(255) NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_date (date_submitted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO requests (issue_name, description, location, reporter_name, status) VALUES
('Broken Window', 'Window in classroom is cracked and needs replacement', 'Room 101, Building A', 'John Doe', 'Pending'),
('Leaking Faucet', 'Water faucet in restroom continuously drips', 'Restroom 2F, Building B', 'Jane Smith', 'In Progress'),
('Damaged Desk', 'Student desk has broken leg and is unstable', 'Room 205, Building A', 'Mike Johnson', 'Completed'),
('Flickering Lights', 'Ceiling lights flicker intermittently', 'Hallway 3F, Building C', 'Sarah Williams', 'Pending');
