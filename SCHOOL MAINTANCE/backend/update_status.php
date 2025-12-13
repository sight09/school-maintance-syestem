<?php
/**
 * Update Request Status Endpoint
 * 
 * Handles POST requests from admin-dashboard.html
 * Updates the status of a maintenance request
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once '../config/db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json_response(false, 'Invalid request method. Only POST is allowed.');
}

// Check if request is JSON or form data
$content_type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

if (strpos($content_type, 'application/json') !== false) {
    $json_input = file_get_contents('php://input');
    $input_data = json_decode($json_input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        send_json_response(false, 'Invalid JSON data.');
    }
    
    $request_id = isset($input_data['request_id']) ? $input_data['request_id'] : null;
    $status = isset($input_data['status']) ? $input_data['status'] : null;
} else {
    $request_id = isset($_POST['request_id']) ? $_POST['request_id'] : null;
    $status = isset($_POST['status']) ? $_POST['status'] : null;
}

// Validate required fields
if (empty($request_id)) {
    send_json_response(false, 'Missing required field: request_id');
}

if (empty($status)) {
    send_json_response(false, 'Missing required field: status');
}

// Validate request_id is numeric
if (!is_numeric($request_id)) {
    send_json_response(false, 'Invalid request_id. Must be a number.');
}

$request_id = intval($request_id);

// Validate status value
$valid_statuses = ['Pending', 'In Progress', 'Completed'];
if (!in_array($status, $valid_statuses)) {
    send_json_response(false, 'Invalid status. Must be: Pending, In Progress, or Completed.');
}

// Check if request exists
$check_stmt = mysqli_prepare($conn, "SELECT id, status FROM requests WHERE id = ?");
mysqli_stmt_bind_param($check_stmt, 'i', $request_id);
mysqli_stmt_execute($check_stmt);
$check_result = mysqli_stmt_get_result($check_stmt);

if (mysqli_num_rows($check_result) === 0) {
    send_json_response(false, "Request with ID $request_id not found.");
}

$current_request = mysqli_fetch_assoc($check_result);
$old_status = $current_request['status'];
mysqli_stmt_close($check_stmt);

// Update status
$update_stmt = mysqli_prepare($conn, "UPDATE requests SET status = ? WHERE id = ?");

if (!$update_stmt) {
    send_json_response(false, 'Database error: ' . mysqli_error($conn));
}

mysqli_stmt_bind_param($update_stmt, 'si', $status, $request_id);

if (mysqli_stmt_execute($update_stmt)) {
    send_json_response(true, 'Request status updated successfully.', [
        'request_id' => $request_id,
        'old_status' => $old_status,
        'new_status' => $status
    ]);
} else {
    send_json_response(false, 'Failed to update status: ' . mysqli_stmt_error($update_stmt));
}

mysqli_stmt_close($update_stmt);
mysqli_close($conn);
