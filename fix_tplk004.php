<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

DB::unprepared("SET @@SESSION.sql_mode = '';");
DB::unprepared("SET FOREIGN_KEY_CHECKS=0;");

$sql = file_get_contents('database/tplk004_data.sql');

// Fix `order` keyword globally, because this won't break value counts
$sql = preg_replace('/(\,\s*)order(\s*\,)/i', '$1`order`$2', $sql);

// Fix attendance_sessions columns and values properly
$sql = preg_replace('/INSERT IGNORE INTO attendance_sessions \((.*?),\s*zona_id,\s*metode_id\)\s*VALUES\s*\((.*?),\s*NULL,\s*NULL\);/si', 'INSERT IGNORE INTO attendance_sessions ($1) VALUES ($2);', $sql);

// Split all statements
$statements = explode("INSERT IGNORE INTO ", $sql);
$success = 0;
$failed = 0;

foreach ($statements as $stmt) {
    if (trim($stmt) === '') continue;
    $fullStmt = "INSERT IGNORE INTO " . $stmt;
    try {
        DB::unprepared($fullStmt);
        $success++;
    } catch (\Exception $e) {
        $failed++;
        // echo "FAILED: " . substr($e->getMessage(), 0, 100) . "\n";
    }
}

DB::unprepared("SET FOREIGN_KEY_CHECKS=1;");
echo "SUCCESS RESTORING TPLK004 DATA! Inserted: $success, Failed: $failed\n";
