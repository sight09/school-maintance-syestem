<?php
/**
 * Photo Upload Endpoint
 * 
 * Handles POST requests with photo uploads
 * Stores files in uploads/ folder and saves filename in database
 * 
 * Expected POST data:
 * - username: string (required)
 * - photo: file (required, jpg/png/jpeg/webp, max 3MB)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(false, 'Invalid request method. Only POST is allowed.');
}

// Validate username field
if (!isset($_POST['username']) || empty(trim($_POST['username']))) {
    send_json_response(false, 'Username is required.');
}

// Validate photo file
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
    send_json_response(false, 'Photo file is required.');
}

// Sanitize username
$username = sanitize_input($conn, $_POST['username']);

// Handle file upload
$file = $_FILES['photo'];
$file_name = $file['name'];
$file_tmp = $file['tmp_name'];
$file_size = $file['size'];
$file_error = $file['error'];

// Check for upload errors
if ($file_error !== UPLOAD_ERR_OK) {
    send_json_response(false, 'File upload error occurred.');
}

// Get file extension
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

// Allowed file extensions
$allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];

// Validate file extension
if (!in_array($file_ext, $allowed_extensions)) {
    send_json_response(false, 'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.');
}

// Validate file size (max 3MB = 3145728 bytes)
if ($file_size > 3145728) {
    send_json_response(false, 'File size exceeds 3MB limit.');
}

// Validate that file is actually an image
$image_info = getimagesize($file_tmp);
if ($image_info === false) {
    send_json_response(false, 'Uploaded file is not a valid image.');
}

// Generate unique filename with timestamp prefix
$new_filename = time() . '_' . uniqid() . '.' . $file_ext;

// Define upload directory (relative path)
$upload_dir = 'uploads/';

// Create uploads directory if it doesn't exist
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Full path for uploaded file
$upload_path = $upload_dir . $new_filename;

// Move uploaded file to destination
if (!move_uploaded_file($file_tmp, $upload_path)) {
    send_json_response(false, 'Failed to save uploaded file.');
}

// Store relative path for database (filename only or relative path)
$photo_filename = $upload_path;

// Prepare SQL statement to prevent SQL injection
$stmt = mysqli_prepare($conn, 
    "INSERT INTO user_photos (username, photo) VALUES (?, ?)"
);

if (!$stmt) {
    // Delete uploaded file if database insert fails
    unlink($upload_path);
    send_json_response(false, 'Database error: ' . mysqli_error($conn));
}

// Bind parameters
mysqli_stmt_bind_param($stmt, 'ss', $username, $photo_filename);

// Execute statement
if (mysqli_stmt_execute($stmt)) {
    $photo_id = mysqli_insert_id($conn);
    
    send_json_response(true, 'Photo uploaded successfully.', [
        'id' => $photo_id,
        'username' => $username,
        'photo' => $photo_filename,
        'photo_url' => 'http://localhost/photo_backend/' . $photo_filename,
        'created_at' => date('Y-m-d H:i:s')
    ]);
} else {
    // Delete uploaded file if database insert fails
    unlink($upload_path);
    send_json_response(false, 'Failed to save photo record: ' . mysqli_stmt_error($stmt));
}

// Close statement and connection
mysqli_stmt_close($stmt);
mysqli_close($conn);

/**
 * USAGE EXAMPLE:
 * 
 * HTML Form:
 * <form id="uploadForm" enctype="multipart/form-data">
 *     <input type="text" name="username" placeholder="Username" required>
 *     <input type="file" name="photo" accept="image/*" required>
 *     <button type="submit">Upload</button>
 * </form>
 * 
 * JavaScript:
 * document.getElementById('uploadForm').addEventListener('submit', async (e) => {
 *     e.preventDefault();
 *     
 *     const formData = new FormData(e.target);
 *     
 *     try {
 *         const response = await fetch('http://localhost/photo_backend/upload.php', {
 *             method: 'POST',
 *             body: formData
 *         });
 *         
 *         const data = await response.json();
 *         
 *         if (data.success) {
 *             console.log('Photo uploaded:', data.data);
 *             alert('Photo uploaded successfully!');
 *         } else {
 *             alert('Error: ' + data.message);
 *         }
 *     } catch (error) {
 *         console.error('Error:', error);
 *         alert('Network error occurred');
 *     }
 * });
 */
