<?php
// Mock POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
// Mock Input
$input = json_encode([
    'name' => 'Debug User',
    'email' => 'debug_' . time() . '@test.com',
    'password' => 'password123'
]);

// Helper to mock file_get_contents for input stream (doesn't work easily with php://input in CLI)
// Instead, let's modify the register.php temporarily or just copy the logic here to test.
// Actually, let's just write a script that connects to DB and tries the INSERT manually using the same includes
// provided in register.php to see if DB connection or Table is the issue.

require_once 'config/db.php';

echo "Database connected.\n";

$name = 'Debug User';
$email = 'debug_' . time() . '@test.com';
$password = password_hash('123456', PASSWORD_BCRYPT);
$role = 'user';

// 1. Check Table Exists
$check_table = mysqli_query($conn, "SHOW TABLES LIKE 'users'");
if (mysqli_num_rows($check_table) == 0) {
    die("ERROR: Table 'users' does not exist.\n");
}
echo "Table 'users' exists.\n";

// 2. Try Insert
$sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    die("Prepare failed: " . mysqli_error($conn) . "\n");
}
mysqli_stmt_bind_param($stmt, 'ssss', $name, $email, $password, $role);
if (mysqli_stmt_execute($stmt)) {
    echo "Insert SUCCESS.\n";
} else {
    echo "Insert FAILED: " . mysqli_stmt_error($stmt) . "\n";
}
mysqli_close($conn);
?>
