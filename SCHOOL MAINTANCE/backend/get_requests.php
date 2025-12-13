<?php
/**
 * Get Maintenance Requests Endpoint
 * 
 * Handles GET requests from view-requests.html
 * Retrieves all maintenance requests or filters by status
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Include database configuration
require_once '../config/db.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json_response(false, 'Invalid request method. Only GET is allowed.');
}

// Build SQL query
$sql = "SELECT id, issue_name, description, location, reporter_name, photo, status, date_submitted 
        FROM requests WHERE 1=1";

$params = [];
$types = '';

// Filter by status if provided
if (isset($_GET['status']) && !empty($_GET['status'])) {
    $status = sanitize_input($conn, $_GET['status']);
    $valid_statuses = ['Pending', 'In Progress', 'Completed'];
    if (in_array($status, $valid_statuses)) {
        $sql .= " AND status = ?";
        $params[] = $status;
        $types .= 's';
    }
}

// Search functionality
if (isset($_GET['search']) && !empty(trim($_GET['search']))) {
    $search = sanitize_input($conn, $_GET['search']);
    $search_term = "%$search%";
    $sql .= " AND (issue_name LIKE ? OR description LIKE ? OR location LIKE ? OR reporter_name LIKE ?)";
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $types .= 'ssss';
}

$sql .= " ORDER BY date_submitted DESC";

// Prepare statement
$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    send_json_response(false, 'Database error: ' . mysqli_error($conn));
}

// Bind parameters if any exist
if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

// Execute query
if (!mysqli_stmt_execute($stmt)) {
    send_json_response(false, 'Query execution failed: ' . mysqli_stmt_error($stmt));
}

// Get results
$result = mysqli_stmt_get_result($stmt);
$requests = [];

while ($row = mysqli_fetch_assoc($result)) {
    $row['date_submitted'] = date('Y-m-d H:i:s', strtotime($row['date_submitted']));
    if ($row['photo']) {
        $row['photo_url'] = 'http://localhost/schoolmaintenance/' . $row['photo'];
    } else {
        $row['photo_url'] = null;
    }
    $requests[] = $row;
}

send_json_response(true, 'Requests retrieved successfully.', [
    'requests' => $requests,
    'total' => count($requests),
    'count' => count($requests)
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
