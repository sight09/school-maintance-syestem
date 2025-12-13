<?php
require_once 'config/db.php';

$email = 'verify_login@test.com';
$raw_pass = 'password123';
$hash_pass = password_hash($raw_pass, PASSWORD_BCRYPT);

// 1. Cleanup
mysqli_query($conn, "DELETE FROM users WHERE email='$email'");

// 2. Insert
$stmt = mysqli_prepare($conn, "INSERT INTO users (name, email, password, role) VALUES ('Verifier', ?, ?, 'user')");
mysqli_stmt_bind_param($stmt, 'ss', $email, $hash_pass);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

echo "User inserted.\n";

// 3. Verify
$sql = "SELECT password FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);

if (password_verify($raw_pass, $row['password'])) {
    echo "LOGIN VERIFICATION: SUCCESS (Password matched)\n";
} else {
    echo "LOGIN VERIFICATION: FAILED (Password mismatch)\n";
}
?>
