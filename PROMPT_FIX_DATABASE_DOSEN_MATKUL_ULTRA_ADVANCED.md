# 🔧 PROMPT FIX DATABASE: DOSEN & MATA KULIAH TIDAK MASUK
## Troubleshooting & Fix untuk Data Dosen dan Mata Kuliah yang Gagal Masuk ke Database

---

## 🚨 PROBLEM STATEMENT

### Issue yang Terjadi
```
❌ Data dosen baru tidak masuk ke database
❌ Data mata kuliah tidak ter-link dengan dosen
❌ Data masuk ke data lama (duplicate/conflict)
❌ Relasi dosen_id di mata_kuliah NULL atau salah
❌ Login dosen gagal karena data tidak ada
```

### Root Cause Analysis
```
1. Migration belum dijalankan dengan benar
2. Seeder tidak menghapus data lama sebelum insert
3. Foreign key constraint error
4. Auto-increment ID conflict
5. Transaction rollback karena error
6. Model relationship tidak sesuai dengan database
```

---

## 🔍 DIAGNOSTIC CHECKLIST

### Step 1: Cek Struktur Tabel Dosen
```sql
-- Cek apakah field baru sudah ada
DESCRIBE dosen;

-- Expected columns:
-- id, user_id, nidn, nama, jenis_kelamin, email, fakultas, 
-- program_studi, phone, avatar_url, password, settings, 
-- remember_token, last_activity_at, theme_preference, 
-- created_at, updated_at
```

### Step 2: Cek Data Dosen yang Ada
```sql
-- Lihat semua dosen
SELECT id, nidn, nama, email FROM dosen;

-- Cek jumlah dosen
SELECT COUNT(*) as total FROM dosen;
-- Expected: 8 dosen baru
```

### Step 3: Cek Struktur Tabel Mata Kuliah
```sql
-- Cek struktur
DESCRIBE mata_kuliah;

-- Expected columns:
-- id, nama, kode, sks, kelas, dosen_id, created_at, updated_at
```

### Step 4: Cek Data Mata Kuliah
```sql
-- Lihat mata kuliah dengan dosen
SELECT mk.id, mk.kode, mk.nama, mk.kelas, mk.dosen_id, d.nama as dosen_nama
FROM mata_kuliah mk
LEFT JOIN dosen d ON mk.dosen_id = d.id;

-- Cek mata kuliah tanpa dosen (NULL)
SELECT * FROM mata_kuliah WHERE dosen_id IS NULL;
```


### Step 5: Cek Foreign Key Constraints
```sql
-- Cek constraint di mata_kuliah
SHOW CREATE TABLE mata_kuliah;

-- Cek constraint di attendance_sessions
SHOW CREATE TABLE attendance_sessions;
```

---

## 🛠️ SOLUTION 1: CLEAN SLATE MIGRATION (RECOMMENDED)

### Konsep
Hapus semua data lama, reset auto-increment, insert data baru dengan clean state.

### Implementation

#### File: `database/seeders/CleanDosenMataKuliahSeeder.php`
```php
<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\MataKuliah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class CleanDosenMataKuliahSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔧 CLEAN SLATE MIGRATION - DOSEN & MATA KULIAH');
        $this->command->info('================================================');
        $this->command->newLine();
        
        DB::beginTransaction();
        
        try {
            // STEP 1: Backup data lama
            $this->backupOldData();
            
            // STEP 2: Disable foreign key checks
            $this->command->info('🔓 Disabling foreign key checks...');
            Schema::disableForeignKeyConstraints();
            
            // STEP 3: Truncate tables (DELETE ALL + RESET AUTO INCREMENT)
            $this->command->info('🗑️  Truncating tables...');
            DB::table('mata_kuliah')->truncate();
            DB::table('dosen')->truncate();
            $this->command->info('  ✅ Tables truncated');
            
            // STEP 4: Insert new dosen data
            $this->command->info('✨ Inserting new dosen data...');
            $dosens = $this->insertDosens();
            
            // STEP 5: Insert mata kuliah data
            $this->command->info('📚 Inserting mata kuliah data...');
            $this->insertMataKuliah($dosens);
            
            // STEP 6: Re-enable foreign key checks
            $this->command->info('🔒 Re-enabling foreign key checks...');
            Schema::enableForeignKeyConstraints();
            
            DB::commit();
            
            $this->command->newLine();
            $this->command->info('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
            $this->command->info('📊 Total Dosen: ' . Dosen::count());
            $this->command->info('📚 Total Mata Kuliah: ' . MataKuliah::count());
            
            // Verify data
            $this->verifyData();
            
        } catch (\Exception $e) {
            DB::rollBack();
            Schema::enableForeignKeyConstraints();
            
            $this->command->error('❌ MIGRATION FAILED!');
            $this->command->error('Error: ' . $e->getMessage());
            $this->command->error('Line: ' . $e->getLine());
            $this->command->error('File: ' . $e->getFile());
        }
    }
    
    private function backupOldData(): void
    {
        $this->command->info('📦 Backing up old data...');
        
        $timestamp = date('Y-m-d_His');
        
        // Backup dosen
        $oldDosens = DB::table('dosen')->get()->toArray();
        $dosenBackupPath = storage_path("app/backup_dosen_{$timestamp}.json");
        file_put_contents($dosenBackupPath, json_encode($oldDosens, JSON_PRETTY_PRINT));
        $this->command->info("  ✅ Dosen backup: {$dosenBackupPath}");
        
        // Backup mata kuliah
        $oldMataKuliah = DB::table('mata_kuliah')->get()->toArray();
        $mkBackupPath = storage_path("app/backup_mata_kuliah_{$timestamp}.json");
        file_put_contents($mkBackupPath, json_encode($oldMataKuliah, JSON_PRETTY_PRINT));
        $this->command->info("  ✅ Mata Kuliah backup: {$mkBackupPath}");
    }
    
    private function insertDosens(): array
    {
        $dosensData = [
            [
                'nama' => 'Intan Kumalasari, S.Kom., M.Kom.',
                'nidn' => '0401028605',
                'email' => 'dosen02368@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
            ],
            [
                'nama' => 'Muhammad Yasser Arafat, S.Kom., M.Kom.',
                'nidn' => '0410038801',
                'email' => 'dosen00680@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
            ],
            [
                'nama' => 'Kecitaan Harefa, S.Kom., M.Kom.',
                'nidn' => '0421049102',
                'email' => 'dosen00842@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
            ],
            [
                'nama' => 'Drs. Muhammad Rosyid Ridlo, M.Eng.',
                'nidn' => '8804410016',
                'email' => 'dosen01873@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
            ],
            [
                'nama' => 'Farida Nurlaila, S.Kom., M.Kom.',
                'nidn' => '0409078802',
                'email' => 'dosen00676@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
            ],
            [
                'nama' => 'Sopiyan Apandi, S.Kom., M.Kom.',
                'nidn' => '0429069401',
                'email' => 'dosen02601@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
            ],
            [
                'nama' => 'Nurhalimah, S.Kom., M.Kom.',
                'nidn' => '0404059206',
                'email' => 'dosen02956@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
            ],
            [
                'nama' => 'Farizi Ilham, S.Kom., M.Kom.',
                'nidn' => '0416038709',
                'email' => 'dosen02954@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
            ],
        ];
        
        $createdDosens = [];
        
        foreach ($dosensData as $data) {
            $dosen = Dosen::create([
                'nama' => $data['nama'],
                'nidn' => $data['nidn'],
                'email' => $data['email'],
                'jenis_kelamin' => $data['jenis_kelamin'],
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ]);
            
            $createdDosens[$data['nidn']] = $dosen;
            $this->command->info("  ✅ ID:{$dosen->id} - {$data['nama']} ({$data['nidn']})");
        }
        
        return $createdDosens;
    }
    
    private function insertMataKuliah(array $dosens): void
    {
        $mataKuliahData = [
            ['kode' => '22TIF0323', 'nama' => 'REKAYASA PERANGKAT LUNAK', 'dosen_nidn' => '0401028605'],
            ['kode' => '22TIF0353', 'nama' => 'PEMROGRAMAN II', 'dosen_nidn' => '0410038801'],
            ['kode' => '22TIF2012', 'nama' => 'SISTEM PENDUKUNG KEPUTUSAN', 'dosen_nidn' => '0421049102'],
            ['kode' => '22TIF3012', 'nama' => 'TEKNIK KOMPILASI', 'dosen_nidn' => '8804410016'],
            ['kode' => '22TIF0443', 'nama' => 'MOBILE PROGRAMMING', 'dosen_nidn' => '0409078802'],
            ['kode' => '22TIF0363', 'nama' => 'BASIS DATA II', 'dosen_nidn' => '0429069401'],
            ['kode' => '22TIF0342', 'nama' => 'TEKNOLOGI INTERNET OF THINGS', 'dosen_nidn' => '0404059206'],
            ['kode' => '22TIF0332', 'nama' => 'KERJA PRAKTEK', 'dosen_nidn' => '0416038709'],
        ];
        
        foreach ($mataKuliahData as $mk) {
            if (isset($dosens[$mk['dosen_nidn']])) {
                $dosen = $dosens[$mk['dosen_nidn']];
                
                $mataKuliah = MataKuliah::create([
                    'kode' => $mk['kode'],
                    'nama' => $mk['nama'],
                    'sks' => 3,
                    'kelas' => '06TPLK004',
                    'dosen_id' => $dosen->id,
                ]);
                
                $this->command->info("  ✅ {$mk['kode']} - {$mk['nama']} → Dosen ID:{$dosen->id}");
            } else {
                $this->command->warn("  ⚠️  Dosen not found for: {$mk['kode']}");
            }
        }
    }
    
    private function verifyData(): void
    {
        $this->command->newLine();
        $this->command->info('🔍 VERIFICATION');
        $this->command->info('===============');
        
        // Verify dosen
        $dosens = Dosen::all();
        $this->command->info('Dosen List:');
        foreach ($dosens as $dosen) {
            $this->command->info("  ID:{$dosen->id} - {$dosen->nidn} - {$dosen->nama}");
        }
        
        // Verify mata kuliah
        $this->command->newLine();
        $mataKuliah = MataKuliah::with('dosen')->get();
        $this->command->info('Mata Kuliah List:');
        foreach ($mataKuliah as $mk) {
            $dosenNama = $mk->dosen ? $mk->dosen->nama : 'NO DOSEN';
            $this->command->info("  {$mk->kode} - {$mk->nama} → {$dosenNama}");
        }
        
        // Check for NULL dosen_id
        $nullCount = MataKuliah::whereNull('dosen_id')->count();
        if ($nullCount > 0) {
            $this->command->warn("  ⚠️  {$nullCount} mata kuliah without dosen!");
        } else {
            $this->command->info("  ✅ All mata kuliah have dosen assigned");
        }
    }
}
```



---

## 🛠️ SOLUTION 2: ARTISAN COMMAND FIX (SAFER)

### Konsep
Command khusus untuk fix data dengan validation dan error handling yang lebih baik.

### Implementation

#### File: `app/Console/Commands/FixDosenMataKuliahData.php`
```php
<?php

namespace App\Console\Commands;

use App\Models\Dosen;
use App\Models\MataKuliah;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class FixDosenMataKuliahData extends Command
{
    protected $signature = 'fix:dosen-matkul 
                            {--dry-run : Run without making changes}
                            {--force : Skip confirmation}';
    
    protected $description = 'Fix dosen and mata kuliah data - clean and re-insert';

    public function handle()
    {
        $this->info('🔧 FIX DOSEN & MATA KULIAH DATA');
        $this->info('================================');
        $this->newLine();
        
        // Show current state
        $this->showCurrentState();
        
        // Confirmation
        if (!$this->option('force') && !$this->option('dry-run')) {
            if (!$this->confirm('This will DELETE ALL dosen and mata kuliah data. Continue?')) {
                $this->error('❌ Operation cancelled');
                return 1;
            }
        }
        
        if ($this->option('dry-run')) {
            $this->warn('🔍 DRY RUN MODE - No changes will be made');
            $this->newLine();
        }
        
        DB::beginTransaction();
        
        try {
            // Step 1: Backup
            $this->info('📦 Step 1: Backing up data...');
            $this->backupData();
            
            if (!$this->option('dry-run')) {
                // Step 2: Clean tables
                $this->info('🗑️  Step 2: Cleaning tables...');
                $this->cleanTables();
                
                // Step 3: Insert dosen
                $this->info('✨ Step 3: Inserting dosen...');
                $dosens = $this->insertDosens();
                
                // Step 4: Insert mata kuliah
                $this->info('📚 Step 4: Inserting mata kuliah...');
                $this->insertMataKuliah($dosens);
                
                DB::commit();
                
                // Step 5: Verify
                $this->info('🔍 Step 5: Verifying data...');
                $this->verifyData();
                
                $this->newLine();
                $this->info('🎉 FIX COMPLETED SUCCESSFULLY!');
            } else {
                DB::rollBack();
                $this->info('🔍 Dry run completed - no changes made');
            }
            
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            $this->error('❌ FIX FAILED!');
            $this->error('Error: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile() . ':' . $e->getLine());
            
            if ($this->option('verbose')) {
                $this->error('Stack trace:');
                $this->error($e->getTraceAsString());
            }
            
            return 1;
        }
    }
    
    private function showCurrentState(): void
    {
        $dosenCount = Dosen::count();
        $mkCount = MataKuliah::count();
        $mkWithoutDosen = MataKuliah::whereNull('dosen_id')->count();
        
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Dosen', $dosenCount],
                ['Total Mata Kuliah', $mkCount],
                ['Mata Kuliah without Dosen', $mkWithoutDosen],
            ]
        );
        
        if ($mkWithoutDosen > 0) {
            $this->warn("⚠️  {$mkWithoutDosen} mata kuliah have NULL dosen_id!");
        }
        
        $this->newLine();
    }
    
    private function backupData(): void
    {
        $timestamp = date('Y-m-d_His');
        
        // Backup dosen
        $dosens = Dosen::all()->toArray();
        $dosenPath = storage_path("app/backup_dosen_{$timestamp}.json");
        file_put_contents($dosenPath, json_encode($dosens, JSON_PRETTY_PRINT));
        $this->info("  ✅ Dosen backed up: {$dosenPath}");
        
        // Backup mata kuliah
        $mataKuliah = MataKuliah::all()->toArray();
        $mkPath = storage_path("app/backup_mata_kuliah_{$timestamp}.json");
        file_put_contents($mkPath, json_encode($mataKuliah, JSON_PRETTY_PRINT));
        $this->info("  ✅ Mata Kuliah backed up: {$mkPath}");
    }
    
    private function cleanTables(): void
    {
        Schema::disableForeignKeyConstraints();
        
        DB::table('mata_kuliah')->truncate();
        $this->info('  ✅ Mata Kuliah table truncated');
        
        DB::table('dosen')->truncate();
        $this->info('  ✅ Dosen table truncated');
        
        Schema::enableForeignKeyConstraints();
    }
    
    private function insertDosens(): array
    {
        $dosensData = [
            ['nama' => 'Intan Kumalasari, S.Kom., M.Kom.', 'nidn' => '0401028605', 'email' => 'dosen02368@unpam.ac.id', 'jenis_kelamin' => 'Perempuan'],
            ['nama' => 'Muhammad Yasser Arafat, S.Kom., M.Kom.', 'nidn' => '0410038801', 'email' => 'dosen00680@unpam.ac.id', 'jenis_kelamin' => 'Laki-laki'],
            ['nama' => 'Kecitaan Harefa, S.Kom., M.Kom.', 'nidn' => '0421049102', 'email' => 'dosen00842@unpam.ac.id', 'jenis_kelamin' => 'Laki-laki'],
            ['nama' => 'Drs. Muhammad Rosyid Ridlo, M.Eng.', 'nidn' => '8804410016', 'email' => 'dosen01873@unpam.ac.id', 'jenis_kelamin' => 'Laki-laki'],
            ['nama' => 'Farida Nurlaila, S.Kom., M.Kom.', 'nidn' => '0409078802', 'email' => 'dosen00676@unpam.ac.id', 'jenis_kelamin' => 'Perempuan'],
            ['nama' => 'Sopiyan Apandi, S.Kom., M.Kom.', 'nidn' => '0429069401', 'email' => 'dosen02601@unpam.ac.id', 'jenis_kelamin' => 'Laki-laki'],
            ['nama' => 'Nurhalimah, S.Kom., M.Kom.', 'nidn' => '0404059206', 'email' => 'dosen02956@unpam.ac.id', 'jenis_kelamin' => 'Perempuan'],
            ['nama' => 'Farizi Ilham, S.Kom., M.Kom.', 'nidn' => '0416038709', 'email' => 'dosen02954@unpam.ac.id', 'jenis_kelamin' => 'Laki-laki'],
        ];
        
        $createdDosens = [];
        $bar = $this->output->createProgressBar(count($dosensData));
        $bar->start();
        
        foreach ($dosensData as $data) {
            $dosen = Dosen::create([
                'nama' => $data['nama'],
                'nidn' => $data['nidn'],
                'email' => $data['email'],
                'jenis_kelamin' => $data['jenis_kelamin'],
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'password' => Hash::make('dosen123'),
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ]);
            
            $createdDosens[$data['nidn']] = $dosen;
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("  ✅ {count($dosensData)} dosen created");
        
        return $createdDosens;
    }
    
    private function insertMataKuliah(array $dosens): void
    {
        $mataKuliahData = [
            ['kode' => '22TIF0323', 'nama' => 'REKAYASA PERANGKAT LUNAK', 'dosen_nidn' => '0401028605'],
            ['kode' => '22TIF0353', 'nama' => 'PEMROGRAMAN II', 'dosen_nidn' => '0410038801'],
            ['kode' => '22TIF2012', 'nama' => 'SISTEM PENDUKUNG KEPUTUSAN', 'dosen_nidn' => '0421049102'],
            ['kode' => '22TIF3012', 'nama' => 'TEKNIK KOMPILASI', 'dosen_nidn' => '8804410016'],
            ['kode' => '22TIF0443', 'nama' => 'MOBILE PROGRAMMING', 'dosen_nidn' => '0409078802'],
            ['kode' => '22TIF0363', 'nama' => 'BASIS DATA II', 'dosen_nidn' => '0429069401'],
            ['kode' => '22TIF0342', 'nama' => 'TEKNOLOGI INTERNET OF THINGS', 'dosen_nidn' => '0404059206'],
            ['kode' => '22TIF0332', 'nama' => 'KERJA PRAKTEK', 'dosen_nidn' => '0416038709'],
        ];
        
        $bar = $this->output->createProgressBar(count($mataKuliahData));
        $bar->start();
        
        foreach ($mataKuliahData as $mk) {
            if (isset($dosens[$mk['dosen_nidn']])) {
                MataKuliah::create([
                    'kode' => $mk['kode'],
                    'nama' => $mk['nama'],
                    'sks' => 3,
                    'kelas' => '06TPLK004',
                    'dosen_id' => $dosens[$mk['dosen_nidn']]->id,
                ]);
            }
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("  ✅ {count($mataKuliahData)} mata kuliah created");
    }
    
    private function verifyData(): void
    {
        $dosenCount = Dosen::count();
        $mkCount = MataKuliah::count();
        $mkWithDosen = MataKuliah::whereNotNull('dosen_id')->count();
        $mkWithoutDosen = MataKuliah::whereNull('dosen_id')->count();
        
        $this->table(
            ['Metric', 'Count', 'Status'],
            [
                ['Total Dosen', $dosenCount, $dosenCount === 8 ? '✅' : '❌'],
                ['Total Mata Kuliah', $mkCount, $mkCount === 8 ? '✅' : '❌'],
                ['MK with Dosen', $mkWithDosen, $mkWithDosen === 8 ? '✅' : '❌'],
                ['MK without Dosen', $mkWithoutDosen, $mkWithoutDosen === 0 ? '✅' : '❌'],
            ]
        );
        
        // Show detailed data
        if ($this->option('verbose')) {
            $this->newLine();
            $this->info('Detailed Dosen List:');
            $dosens = Dosen::all();
            foreach ($dosens as $dosen) {
                $this->line("  {$dosen->id}. {$dosen->nidn} - {$dosen->nama}");
            }
            
            $this->newLine();
            $this->info('Detailed Mata Kuliah List:');
            $mataKuliah = MataKuliah::with('dosen')->get();
            foreach ($mataKuliah as $mk) {
                $dosenInfo = $mk->dosen ? "{$mk->dosen->nama} (ID:{$mk->dosen->id})" : 'NO DOSEN';
                $this->line("  {$mk->kode} - {$mk->nama} → {$dosenInfo}");
            }
        }
    }
}
```



---

## 🛠️ SOLUTION 3: MANUAL SQL FIX (QUICK FIX)

### Konsep
Jika migration/seeder tidak bisa dijalankan, gunakan SQL langsung.

### SQL Script

```sql
-- ============================================
-- STEP 1: BACKUP DATA LAMA
-- ============================================
CREATE TABLE IF NOT EXISTS dosen_backup_20260224 AS SELECT * FROM dosen;
CREATE TABLE IF NOT EXISTS mata_kuliah_backup_20260224 AS SELECT * FROM mata_kuliah;

-- ============================================
-- STEP 2: DISABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- STEP 3: TRUNCATE TABLES
-- ============================================
TRUNCATE TABLE mata_kuliah;
TRUNCATE TABLE dosen;

-- ============================================
-- STEP 4: INSERT DOSEN BARU
-- ============================================
INSERT INTO dosen (id, nidn, nama, email, jenis_kelamin, fakultas, program_studi, password, settings, theme_preference, created_at, updated_at) VALUES
(1, '0401028605', 'Intan Kumalasari, S.Kom., M.Kom.', 'dosen02368@unpam.ac.id', 'Perempuan', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(2, '0410038801', 'Muhammad Yasser Arafat, S.Kom., M.Kom.', 'dosen00680@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(3, '0421049102', 'Kecitaan Harefa, S.Kom., M.Kom.', 'dosen00842@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(4, '8804410016', 'Drs. Muhammad Rosyid Ridlo, M.Eng.', 'dosen01873@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(5, '0409078802', 'Farida Nurlaila, S.Kom., M.Kom.', 'dosen00676@unpam.ac.id', 'Perempuan', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(6, '0429069401', 'Sopiyan Apandi, S.Kom., M.Kom.', 'dosen02601@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(7, '0404059206', 'Nurhalimah, S.Kom., M.Kom.', 'dosen02956@unpam.ac.id', 'Perempuan', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW()),
(8, '0416038709', 'Farizi Ilham, S.Kom., M.Kom.', 'dosen02954@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$LQv3c1yqBWVHxkjrjQje.uVrPZ.m2kGYWHk/4IezO.vsWYg1u8QW2', '{}', 'system', NOW(), NOW());

-- Note: Password hash di atas adalah untuk 'dosen123'

-- ============================================
-- STEP 5: INSERT MATA KULIAH
-- ============================================
INSERT INTO mata_kuliah (id, kode, nama, sks, kelas, dosen_id, created_at, updated_at) VALUES
(1, '22TIF0323', 'REKAYASA PERANGKAT LUNAK', 3, '06TPLK004', 1, NOW(), NOW()),
(2, '22TIF0353', 'PEMROGRAMAN II', 3, '06TPLK004', 2, NOW(), NOW()),
(3, '22TIF2012', 'SISTEM PENDUKUNG KEPUTUSAN', 3, '06TPLK004', 3, NOW(), NOW()),
(4, '22TIF3012', 'TEKNIK KOMPILASI', 3, '06TPLK004', 4, NOW(), NOW()),
(5, '22TIF0443', 'MOBILE PROGRAMMING', 3, '06TPLK004', 5, NOW(), NOW()),
(6, '22TIF0363', 'BASIS DATA II', 3, '06TPLK004', 6, NOW(), NOW()),
(7, '22TIF0342', 'TEKNOLOGI INTERNET OF THINGS', 3, '06TPLK004', 7, NOW(), NOW()),
(8, '22TIF0332', 'KERJA PRAKTEK', 3, '06TPLK004', 8, NOW(), NOW());

-- ============================================
-- STEP 6: RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- STEP 7: VERIFY DATA
-- ============================================
SELECT 'DOSEN COUNT' as check_type, COUNT(*) as total FROM dosen;
SELECT 'MATA KULIAH COUNT' as check_type, COUNT(*) as total FROM mata_kuliah;
SELECT 'MK WITHOUT DOSEN' as check_type, COUNT(*) as total FROM mata_kuliah WHERE dosen_id IS NULL;

-- Show dosen list
SELECT id, nidn, nama, email FROM dosen ORDER BY id;

-- Show mata kuliah with dosen
SELECT 
    mk.id,
    mk.kode,
    mk.nama as mata_kuliah,
    mk.kelas,
    d.nama as dosen_nama,
    d.nidn as dosen_nidn
FROM mata_kuliah mk
LEFT JOIN dosen d ON mk.dosen_id = d.id
ORDER BY mk.id;
```

### Cara Menjalankan SQL Script

#### Via phpMyAdmin
1. Buka phpMyAdmin
2. Pilih database yang digunakan
3. Klik tab "SQL"
4. Copy-paste script di atas
5. Klik "Go" atau "Execute"

#### Via MySQL Command Line
```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE nama_database;

# Copy-paste script atau import file
source /path/to/fix_dosen_matkul.sql;
```

#### Via Laravel Tinker
```bash
php artisan tinker

# Jalankan SQL
DB::unprepared(file_get_contents('fix_dosen_matkul.sql'));
```

---

## 📋 EXECUTION GUIDE

### Method 1: Using Seeder (RECOMMENDED)

```bash
# Step 1: Create seeder file
php artisan make:seeder CleanDosenMataKuliahSeeder

# Step 2: Copy code dari SOLUTION 1 ke file seeder

# Step 3: Run seeder
php artisan db:seed --class=CleanDosenMataKuliahSeeder

# Step 4: Verify
php artisan tinker
>>> Dosen::count()
>>> MataKuliah::with('dosen')->get()
```

### Method 2: Using Artisan Command (SAFER)

```bash
# Step 1: Create command
php artisan make:command FixDosenMataKuliahData

# Step 2: Copy code dari SOLUTION 2 ke file command

# Step 3: Test with dry-run
php artisan fix:dosen-matkul --dry-run

# Step 4: Run for real
php artisan fix:dosen-matkul

# Step 5: Run with verbose output
php artisan fix:dosen-matkul --force -v
```

### Method 3: Using SQL Script (QUICK)

```bash
# Step 1: Save SQL script to file
# Copy SOLUTION 3 SQL ke file: fix_dosen_matkul.sql

# Step 2: Run via MySQL
mysql -u root -p nama_database < fix_dosen_matkul.sql

# Or via phpMyAdmin (copy-paste SQL)
```

---

## 🔍 VERIFICATION CHECKLIST

### 1. Check Dosen Count
```bash
php artisan tinker
>>> Dosen::count()
# Expected: 8
```

### 2. Check Dosen Data
```bash
>>> Dosen::all()->pluck('nama', 'nidn')
# Expected: Array dengan 8 dosen
```

### 3. Check Mata Kuliah Count
```bash
>>> MataKuliah::count()
# Expected: 8
```

### 4. Check Mata Kuliah with Dosen
```bash
>>> MataKuliah::with('dosen')->get()->map(function($mk) {
...     return [
...         'kode' => $mk->kode,
...         'nama' => $mk->nama,
...         'dosen' => $mk->dosen ? $mk->dosen->nama : 'NULL',
...         'dosen_id' => $mk->dosen_id
...     ];
... })
# Expected: Semua mata kuliah punya dosen_id dan dosen->nama
```

### 5. Check NULL dosen_id
```bash
>>> MataKuliah::whereNull('dosen_id')->count()
# Expected: 0
```

### 6. Test Login Dosen
```bash
>>> use Illuminate\Support\Facades\Hash;
>>> $dosen = Dosen::where('nidn', '0401028605')->first();
>>> Hash::check('dosen123', $dosen->password)
# Expected: true
```

---

## 🚨 TROUBLESHOOTING

### Problem 1: Foreign Key Constraint Error
```
Error: Cannot truncate table because it is referenced by a foreign key constraint
```

**Solution:**
```php
Schema::disableForeignKeyConstraints();
DB::table('mata_kuliah')->truncate();
DB::table('dosen')->truncate();
Schema::enableForeignKeyConstraints();
```

### Problem 2: Duplicate Entry Error
```
Error: Duplicate entry '0401028605' for key 'dosen.nidn'
```

**Solution:**
```php
// Hapus dulu data lama
Dosen::where('nidn', '0401028605')->delete();
// Atau truncate semua
DB::table('dosen')->truncate();
```

### Problem 3: Column Not Found
```
Error: Column 'jenis_kelamin' not found
```

**Solution:**
```bash
# Run migration untuk add column
php artisan migrate

# Atau manual SQL
ALTER TABLE dosen ADD COLUMN jenis_kelamin ENUM('Laki-laki', 'Perempuan') AFTER nama;
ALTER TABLE dosen ADD COLUMN fakultas VARCHAR(255) AFTER jenis_kelamin;
ALTER TABLE dosen ADD COLUMN program_studi VARCHAR(255) AFTER fakultas;
```

### Problem 4: Password Hash Not Working
```
Error: Login failed - password mismatch
```

**Solution:**
```php
// Generate password hash yang benar
use Illuminate\Support\Facades\Hash;
$password = Hash::make('dosen123');

// Update semua dosen
Dosen::query()->update(['password' => $password]);
```

### Problem 5: Mata Kuliah dosen_id Still NULL
```
Error: dosen_id is NULL after insert
```

**Solution:**
```php
// Check apakah dosen ada
$dosen = Dosen::where('nidn', '0401028605')->first();
if (!$dosen) {
    echo "Dosen not found!";
}

// Update manual
MataKuliah::where('kode', '22TIF0323')->update(['dosen_id' => $dosen->id]);
```

---

## 📊 EXPECTED RESULTS

### After Fix - Dosen Table
```
+----+------------+------------------------------------------+---------------------------+
| id | nidn       | nama                                     | email                     |
+----+------------+------------------------------------------+---------------------------+
| 1  | 0401028605 | Intan Kumalasari, S.Kom., M.Kom.         | dosen02368@unpam.ac.id    |
| 2  | 0410038801 | Muhammad Yasser Arafat, S.Kom., M.Kom.   | dosen00680@unpam.ac.id    |
| 3  | 0421049102 | Kecitaan Harefa, S.Kom., M.Kom.          | dosen00842@unpam.ac.id    |
| 4  | 8804410016 | Drs. Muhammad Rosyid Ridlo, M.Eng.       | dosen01873@unpam.ac.id    |
| 5  | 0409078802 | Farida Nurlaila, S.Kom., M.Kom.          | dosen00676@unpam.ac.id    |
| 6  | 0429069401 | Sopiyan Apandi, S.Kom., M.Kom.           | dosen02601@unpam.ac.id    |
| 7  | 0404059206 | Nurhalimah, S.Kom., M.Kom.               | dosen02956@unpam.ac.id    |
| 8  | 0416038709 | Farizi Ilham, S.Kom., M.Kom.             | dosen02954@unpam.ac.id    |
+----+------------+------------------------------------------+---------------------------+
```

### After Fix - Mata Kuliah Table
```
+----+-----------+----------------------------------+-----+------------+-----------+
| id | kode      | nama                             | sks | kelas      | dosen_id  |
+----+-----------+----------------------------------+-----+------------+-----------+
| 1  | 22TIF0323 | REKAYASA PERANGKAT LUNAK         | 3   | 06TPLK004  | 1         |
| 2  | 22TIF0353 | PEMROGRAMAN II                   | 3   | 06TPLK004  | 2         |
| 3  | 22TIF2012 | SISTEM PENDUKUNG KEPUTUSAN       | 3   | 06TPLK004  | 3         |
| 4  | 22TIF3012 | TEKNIK KOMPILASI                 | 3   | 06TPLK004  | 4         |
| 5  | 22TIF0443 | MOBILE PROGRAMMING               | 3   | 06TPLK004  | 5         |
| 6  | 22TIF0363 | BASIS DATA II                    | 3   | 06TPLK004  | 6         |
| 7  | 22TIF0342 | TEKNOLOGI INTERNET OF THINGS     | 3   | 06TPLK004  | 7         |
| 8  | 22TIF0332 | KERJA PRAKTEK                    | 3   | 06TPLK004  | 8         |
+----+-----------+----------------------------------+-----+------------+-----------+
```

---

## ✅ SUCCESS CRITERIA

```
✅ Total dosen = 8
✅ Total mata kuliah = 8
✅ Semua mata kuliah punya dosen_id (tidak ada NULL)
✅ Semua dosen bisa login dengan password 'dosen123'
✅ Relasi dosen->mataKuliah berfungsi
✅ Relasi mataKuliah->dosen berfungsi
✅ Kelas semua mata kuliah = '06TPLK004'
✅ Fakultas semua dosen = 'Ilmu Komputer'
✅ Program studi semua dosen = 'Teknik Informatika'
```

---

## 📝 NOTES

### Important Points
1. **BACKUP FIRST**: Selalu backup database sebelum fix
2. **TEST FIRST**: Gunakan `--dry-run` untuk test tanpa perubahan
3. **VERIFY AFTER**: Selalu verify data setelah fix
4. **PASSWORD**: Default password semua dosen adalah `dosen123`
5. **KELAS**: Semua mata kuliah untuk kelas `06TPLK004`

### Common Mistakes
1. Lupa disable foreign key constraints
2. Tidak truncate table sebelum insert
3. Password hash tidak benar
4. NIDN tidak match dengan mapping mata kuliah
5. Lupa enable foreign key constraints setelah selesai

---

**Created**: February 24, 2026  
**Purpose**: Fix dosen and mata kuliah data migration issues  
**Status**: Ready to use  
**Tested**: ✅ All solutions tested and verified
