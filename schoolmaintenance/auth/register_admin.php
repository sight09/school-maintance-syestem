<?php
require_once '../config/db.php';
header('Content-Type: application/json');

$SECRET_KEY = "super_secret_admin_key_123"; // Simple protection

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST only']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['secret']) || $data['secret'] !== $SECRET_KEY) {
    echo json_encode(['success' => false, 'message' => 'Invalid Secret Key! Access Denied.']);
    exit;
}

if (!isset($data['name'], $data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$name = sanitize_input($conn, $data['name']);
$email = sanitize_input($conn, $data['email']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$role = 'admin'; // Hardcoded admin

// Check exists
$stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");
mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
if (mysqli_stmt_fetch($stmt)) {
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit;
}
mysqli_stmt_close($stmt);

// Insert
$stmt = mysqli_prepare($conn, "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
mysqli_stmt_bind_param($stmt, 'ssss', $name, $email, $password, $role);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Admin created']);
} else {
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . mysqli_error($conn)]);
}
?>
