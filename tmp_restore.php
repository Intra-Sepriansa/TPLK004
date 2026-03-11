<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

try {
    echo "1. Mengosongkan database dan menjalankan ulang migrasi (schema terbaru)...\n";
    Artisan::call('migrate:fresh', ['--force' => true]);
    echo Artisan::output();

    DB::unprepared("SET @@SESSION.sql_mode = '';");
    DB::unprepared("SET FOREIGN_KEY_CHECKS=0;");
    DB::unprepared("ALTER TABLE dosen DROP INDEX IF EXISTS dosen_nidn_unique;");

    echo "2. Memasukkan data Murni (Real Data) dari file mahasiswa.sql...\n";
    $mahasiswa_sql = file_get_contents('database/mahasiswa.sql');

    // Kita hanya ambil bagian INSERT untuk tabel master penting yang hilang
    $tablesToRestore = ['mahasiswa', 'dosen', 'users', 'mata_kuliah', 'pertemuan'];
    
    // Cari semua blok INSERT INTO dari $mahasiswa_sql
    // menggunakan regex: match "INSERT INTO `nama_tabel` ... ;" or "INSERT INTO nama_tabel ... ;"
    preg_match_all('/INSERT\s+INTO\s+`?([a-zA-Z0-9_]+)`?.*?;/si', $mahasiswa_sql, $matches);
    
    $insertedCount = 0;
    foreach ($matches[0] as $i => $insertStmt) {
        $tableName = $matches[1][$i];
        if (in_array(strtolower($tableName), $tablesToRestore)) {
            // SAFEGUARD: The regex might accidentally include mahasiswa_mata_kuliah inside $insertStmt
            if (strpos(strtolower($insertStmt), 'mahasiswa_mata_kuliah') !== false) {
                continue;
            }

            // Fix schema drift for mata_kuliah
            if (strtolower($tableName) === 'mata_kuliah') {
                $insertStmt = str_replace('`semester`, `kelas`, ', '', $insertStmt);
                $insertStmt = str_replace('semester, kelas, ', '', $insertStmt);
                $insertStmt = preg_replace('/\,\s*\d+\s*\,\s*\'[^\']+\'\s*\,/i', ',', $insertStmt);
            }
            DB::unprepared($insertStmt);
            echo " - Restored $tableName\n";
            $insertedCount++;
        }
    }

    echo "Total $insertedCount block(s) dari mahasiswa.sql berhasil dipulihkan.\n";

    echo "3. Melanjutkan proses restore riwayat absensi, tugas, log dari file tplk004_data.sql...\n";
    if (file_exists('database/tplk004_data.sql')) {
        $tplk004_sql = file_get_contents('database/tplk004_data.sql');
        DB::unprepared($tplk004_sql);
        echo " - Log dan History dari tplk004_data.sql berhasil masuk.\n";
    }

    DB::unprepared("SET FOREIGN_KEY_CHECKS=1;");
    
    echo "\nRESTORE SELESAI! Data dummy (NIM 2399...) SUDAH TERHAPUS. Data murni (INTRA dkk) sudah kembali!\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
