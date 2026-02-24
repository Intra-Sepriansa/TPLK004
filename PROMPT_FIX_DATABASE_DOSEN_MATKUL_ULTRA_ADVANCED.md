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

