<?php
/**
 * Database Configuration File
 * 
 * This file contains database connection settings for the School Maintenance System.
 * Uses mysqli for database operations.
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'school_maintenance');

// Create database connection
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if (!$conn) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error()
    ]));
}

// Set charset to UTF-8
mysqli_set_charset($conn, 'utf8mb4');

/**
 * Helper function to sanitize input data
 * 
 * @param mysqli $conn Database connection
 * @param string $data Input data to sanitize
 * @return string Sanitized data
 */
function sanitize_input($conn, $data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return mysqli_real_escape_string($conn, $data);
}

/**
 * Helper function to send JSON response
 * 
 * @param bool $success Success status
 * @param string $message Response message
 * @param mixed $data Additional data (optional)
 */
function send_json_response($success, $message, $data = null) {
    header('Content-Type: application/json');
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}
