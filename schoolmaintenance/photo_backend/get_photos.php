<?php
/**
 * Get All Photos Endpoint
 * 
 * Retrieves all uploaded photos from database
 * Optional: filter by username
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json_response(false, 'Invalid request method. Only GET is allowed.');
}

$sql = "SELECT id, username, photo, created_at FROM user_photos WHERE 1=1";
$params = [];
$types = '';

// Filter by username if provided
if (isset($_GET['username']) && !empty($_GET['username'])) {
    $username = sanitize_input($conn, $_GET['username']);
    $sql .= " AND username = ?";
    $params[] = $username;
    $types .= 's';
}

$sql .= " ORDER BY created_at DESC";

$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    send_json_response(false, 'Database error: ' . mysqli_error($conn));
}

if (!empty($params)) {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$photos = [];

while ($row = mysqli_fetch_assoc($result)) {
    $row['photo_url'] = 'http://localhost/photo_backend/' . $row['photo'];
    $photos[] = $row;
}

send_json_response(true, 'Photos retrieved successfully.', [
    'photos' => $photos,
    'count' => count($photos)
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
