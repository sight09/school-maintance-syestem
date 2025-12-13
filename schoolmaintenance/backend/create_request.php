<?php
/**
 * Create Maintenance Request Endpoint
 * 
 * Handles POST requests from index.html form submission
 * Processes file upload and inserts new maintenance request into database
 * 
 * Expected POST data:
 * - issue_name: string
 * - description: string
 * - location: string
 * - reporter_name: string
 * - photo: file (optional, jpg/png only, max 3MB)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once '../config/db.php';

session_start();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(false, 'Invalid request method. Only POST is allowed.');
}

// Validate required fields
$required_fields = ['issue_name', 'description', 'location', 'reporter_name'];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        send_json_response(false, "Missing required field: $field");
    }
}

// Sanitize input data
$issue_name = sanitize_input($conn, $_POST['issue_name']);
$description = sanitize_input($conn, $_POST['description']);
$location = sanitize_input($conn, $_POST['location']);
$reporter_name = sanitize_input($conn, $_POST['reporter_name']);
$photo_path = null;

// Handle file upload if photo is provided
if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
    
    // Check for upload errors
    if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        send_json_response(false, 'File upload error occurred.');
    }
    
    $file = $_FILES['photo'];
    $file_name = $file['name'];
    $file_tmp = $file['tmp_name'];
    $file_size = $file['size'];
    $file_error = $file['error'];
    
    // Get file extension
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Allowed file extensions
    $allowed_extensions = ['jpg', 'jpeg', 'png'];
    
    // Validate file extension
    if (!in_array($file_ext, $allowed_extensions)) {
        send_json_response(false, 'Invalid file type. Only JPG and PNG images are allowed.');
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
    
    // Define upload directory (absolute path)
    $upload_dir = 'C:/xampp/htdocs/schoolmaintenance/uploads/';
    
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
    
    // Store relative path for database
    $photo_path = 'uploads/' . $new_filename;
}

// Prepare SQL statement to prevent SQL injection
$stmt = mysqli_prepare($conn, 
    "INSERT INTO requests (issue_name, description, location, reporter_name, photo, status) 
     VALUES (?, ?, ?, ?, ?, 'Pending')"
);

if (!$stmt) {
    send_json_response(false, 'Database error: ' . mysqli_error($conn));
}

// Bind parameters
mysqli_stmt_bind_param($stmt, 'sssss', $issue_name, $description, $location, $reporter_name, $photo_path);

// Execute statement
if (mysqli_stmt_execute($stmt)) {
    $request_id = mysqli_insert_id($conn);
    
    // Link request to user if logged in
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        $link_sql = "INSERT INTO request_owners (request_id, user_id) VALUES (?, ?)";
        $link_stmt = mysqli_prepare($conn, $link_sql);
        if ($link_stmt) {
            mysqli_stmt_bind_param($link_stmt, 'ii', $request_id, $user_id);
            mysqli_stmt_execute($link_stmt);
            mysqli_stmt_close($link_stmt);
        }
    }

    send_json_response(true, 'Maintenance request submitted successfully.', [
        'request_id' => $request_id,
        'issue_name' => $issue_name,
        'status' => 'Pending'
    ]);
} else {
    send_json_response(false, 'Failed to submit request: ' . mysqli_stmt_error($stmt));
}

// Close statement and connection
mysqli_stmt_close($stmt);
mysqli_close($conn);

/**
 * TODO: Frontend Integration (index.html)
 * 
 * Use fetch() to submit form data:
 * 
 * const formData = new FormData();
 * formData.append('issue_name', issueNameValue);
 * formData.append('description', descriptionValue);
 * formData.append('location', locationValue);
 * formData.append('reporter_name', reporterNameValue);
 * formData.append('photo', photoFile); // File object from input[type="file"]
 * 
 * fetch('http://localhost/schoolmaintenance/backend/create_request.php', {
 *     method: 'POST',
 *     body: formData
 * })
 * .then(response => response.json())
 * .then(data => {
 *     if (data.success) {
 *         console.log('Request created:', data.data);
 *         // Show success message, reset form
 *     } else {
 *         console.error('Error:', data.message);
 *         // Show error message
 *     }
 * })
 * .catch(error => console.error('Network error:', error));
 */
