<?php
$hash = password_hash('password', PASSWORD_BCRYPT);
$pdo = new PDO('mysql:host=127.0.0.1;dbname=tplk004', 'tplk004_user', 'Tplk004Secure2026!');
$pdo->exec("UPDATE users SET password = '$hash' WHERE id = 1");
echo "DONE! Hash: $hash\n";
echo "Login with: intrasepriansaa@gmail.com / password\n";
