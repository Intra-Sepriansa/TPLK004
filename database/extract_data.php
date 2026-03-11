<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

DB::statement('SET FOREIGN_KEY_CHECKS=0;');

$sql = file_get_contents(__DIR__.'/tplk004_data.sql');

$tables = ['users', 'dosen', 'mahasiswa', 'jadwal', 'mata_kuliah', 'perangkat'];
foreach ($tables as $table) {
    echo "Importing table: $table\n";
    preg_match_all('/INSERT INTO `?'.$table.'`? VALUES(.*?);/is', $sql, $matches);
    if (!empty($matches[0])) {
        foreach ($matches[0] as $query) {
            try {
                DB::unprepared($query);
                echo ".";
            } catch (\Exception $e) {
                echo "\nErr $table: " . $e->getMessage() . "\n";
            }
        }
        echo "\nDone $table\n";
    } else {
        echo "No inserts found for $table\n";
    }
}

DB::statement('SET FOREIGN_KEY_CHECKS=1;');
