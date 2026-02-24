# 🔄 PROMPT ULTRA ADVANCED: DATABASE MIGRATION DOSEN & MATA KULIAH
## Perpindahan Database Lengkap dengan Data Dosen Baru UNPAM

---

## 📋 OVERVIEW MIGRASI

### Tujuan Migrasi
Mengganti seluruh data dosen lama dengan data dosen baru dari Fakultas Ilmu Komputer - Program Studi Teknik Informatika UNPAM, termasuk:
- **Hapus semua data dosen lama** (8 dosen existing)
- **Insert 8 dosen baru** dengan data lengkap (NIDN, email, jenis kelamin, fakultas, prodi)
- **Update mata kuliah** dengan kode mata kuliah, nama baru, dan mapping ke dosen baru
- **Preserve relasi** dengan tabel pertemuan dan sistem lainnya
- **Update kelas mahasiswa** untuk sinkronisasi dengan mata kuliah

### Scope Perubahan
```
Tables Affected:
├── dosen (DELETE ALL + INSERT NEW)
├── mata_kuliah (UPDATE + ADD kode_mk)
├── mahasiswa (UPDATE kelas field)
└── pertemuan (CASCADE UPDATE via FK)
```

---

## 📊 DATA DOSEN BARU (8 DOSEN)

### Dosen 1: Intan Kumalasari
```sql
{
  id: 1,
  nidn: '0401028605',
  nama: 'Intan Kumalasari, S.Kom., M.Kom.',
  email: 'dosen02368@unpam.ac.id',
  jenis_kelamin: 'Perempuan',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'), // Default password
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 2: Muhammad Yasser Arafat
```sql
{
  id: 2,
  nidn: '0410038801',
  nama: 'Muhammad Yasser Arafat, S.Kom., M.Kom.',
  email: 'dosen00680@unpam.ac.id',
  jenis_kelamin: 'Laki-laki',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 3: Kecitaan Harefa
```sql
{
  id: 3,
  nidn: '0421049102',
  nama: 'Kecitaan Harefa, S.Kom., M.Kom.',
  email: 'dosen00842@unpam.ac.id',
  jenis_kelamin: 'Laki-laki',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 4: Muhammad Rosyid Ridlo
```sql
{
  id: 4,
  nidn: '8804410016',
  nama: 'Drs. Muhammad Rosyid Ridlo, M.Eng.',
  email: 'dosen01873@unpam.ac.id',
  jenis_kelamin: 'Laki-laki',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 5: Farida Nurlaila
```sql
{
  id: 5,
  nidn: '0409078802',
  nama: 'Farida Nurlaila, S.Kom., M.Kom.',
  email: 'dosen00676@unpam.ac.id',
  jenis_kelamin: 'Perempuan',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 6: Sopiyan Apandi
```sql
{
  id: 6,
  nidn: '0429069401',
  nama: 'Sopiyan Apandi, S.Kom., M.Kom.',
  email: 'dosen02601@unpam.ac.id',
  jenis_kelamin: 'Laki-laki',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 7: Nurhalimah
```sql
{
  id: 7,
  nidn: '0404059206',
  nama: 'Nurhalimah, S.Kom., M.Kom.',
  email: 'dosen02956@unpam.ac.id',
  jenis_kelamin: 'Perempuan',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

### Dosen 8: Farizi Ilham
```sql
{
  id: 8,
  nidn: '0416038709',
  nama: 'Farizi Ilham, S.Kom., M.Kom.',
  email: 'dosen02954@unpam.ac.id',
  jenis_kelamin: 'Laki-laki',
  fakultas: 'Ilmu Komputer',
  prodi: 'Teknik Informatika',
  phone: NULL,
  avatar_url: NULL,
  password: bcrypt('unpam2024'),
  settings: NULL,
  theme_preference: 'system'
}
```

---

## 📚 DATA MATA KULIAH BARU (8 MATA KULIAH)

### Mapping Mata Kuliah ke Dosen

| ID | Kode MK | Nama Mata Kuliah | Dosen | Kelas |
|----|---------|------------------|-------|-------|
| 1 | 22TIF0323 | REKAYASA PERANGKAT LUNAK | Intan Kumalasari | 06TPLK004 |
| 2 | 22TIF0353 | PEMROGRAMAN II | Muhammad Yasser Arafat | 06TPLK004 |
| 3 | 22TIF2012 | SISTEM PENDUKUNG KEPUTUSAN | Kecitaan Harefa | 06TPLK004 |
| 4 | 22TIF3012 | TEKNIK KOMPILASI | Muhammad Rosyid Ridlo | 06TPLK004 |
| 5 | 22TIF0443 | MOBILE PROGRAMMING | Farida Nurlaila | 06TPLK004 |
| 6 | 22TIF0363 | BASIS DATA II | Sopiyan Apandi | 06TPLK004 |
| 7 | 22TIF0342 | TEKNOLOGI INTERNET OF THINGS | Nurhalimah | 06TPLK004 |
| 8 | 22TIF0332 | KERJA PRAKTEK | Farizi Ilham | 06TPLK004 |

### Detail Mata Kuliah

#### Mata Kuliah 1: Rekayasa Perangkat Lunak
```sql
{
  id: 1,
  kode: '22TIF0323',
  nama: 'REKAYASA PERANGKAT LUNAK',
  sks: 3,
  dosen_id: 1, // Intan Kumalasari
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 2: Pemrograman II
```sql
{
  id: 2,
  kode: '22TIF0353',
  nama: 'PEMROGRAMAN II',
  sks: 3,
  dosen_id: 2, // Muhammad Yasser Arafat
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 3: Sistem Pendukung Keputusan
```sql
{
  id: 3,
  kode: '22TIF2012',
  nama: 'SISTEM PENDUKUNG KEPUTUSAN',
  sks: 3,
  dosen_id: 3, // Kecitaan Harefa
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 4: Teknik Kompilasi
```sql
{
  id: 4,
  kode: '22TIF3012',
  nama: 'TEKNIK KOMPILASI',
  sks: 3,
  dosen_id: 4, // Muhammad Rosyid Ridlo
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 5: Mobile Programming
```sql
{
  id: 5,
  kode: '22TIF0443',
  nama: 'MOBILE PROGRAMMING',
  sks: 3,
  dosen_id: 5, // Farida Nurlaila
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 6: Basis Data II
```sql
{
  id: 6,
  kode: '22TIF0363',
  nama: 'BASIS DATA II',
  sks: 3,
  dosen_id: 6, // Sopiyan Apandi
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 7: Teknologi Internet of Things
```sql
{
  id: 7,
  kode: '22TIF0342',
  nama: 'TEKNOLOGI INTERNET OF THINGS',
  sks: 3,
  dosen_id: 7, // Nurhalimah
  kelas: '06TPLK004'
}
```

#### Mata Kuliah 8: Kerja Praktek
```sql
{
  id: 8,
  kode: '22TIF0332',
  nama: 'KERJA PRAKTEK',
  sks: 3,
  dosen_id: 8, // Farizi Ilham
  kelas: '06TPLK004'
}
```

---

## 🔧 STRUKTUR DATABASE

### Tabel: dosen
```sql
CREATE TABLE `dosen` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NULL,
  `nidn` varchar(20) NOT NULL UNIQUE,
  `nama` varchar(150) NOT NULL,
  `email` varchar(100) NULL,
  `jenis_kelamin` enum('Laki-laki', 'Perempuan') NULL,
  `fakultas` varchar(100) NULL,
  `prodi` varchar(100) NULL,
  `phone` varchar(20) NULL,
  `avatar_url` varchar(255) NULL,
  `password` varchar(255) NOT NULL,
  `settings` json NULL,
  `remember_token` varchar(100) NULL,
  `last_activity_at` timestamp NULL,
  `theme_preference` varchar(20) DEFAULT 'system',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dosen_nidn_unique` (`nidn`),
  KEY `dosen_user_id_foreign` (`user_id`),
  CONSTRAINT `dosen_user_id_foreign` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabel: mata_kuliah
```sql
CREATE TABLE `mata_kuliah` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL UNIQUE,
  `nama` varchar(150) NOT NULL,
  `sks` tinyint(4) NOT NULL DEFAULT 3,
  `dosen_id` bigint(20) UNSIGNED NULL,
  `kelas` varchar(20) NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mata_kuliah_kode_unique` (`kode`),
  KEY `mata_kuliah_dosen_id_foreign` (`dosen_id`),
  CONSTRAINT `mata_kuliah_dosen_id_foreign` FOREIGN KEY (`dosen_id`) 
    REFERENCES `dosen` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tabel: mahasiswa (Update kelas field)
```sql
-- Existing table, hanya update kelas field
ALTER TABLE `mahasiswa` 
  MODIFY `kelas` varchar(20) NULL DEFAULT '06TPLK004';
```

---

## 💻 MIGRATION FILE

### File: database/migrations/2026_02_23_000001_migrate_dosen_mata_kuliah_data.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // STEP 1: Add new columns to dosen table if not exists
        Schema::table('dosen', function (Blueprint $table) {
            if (!Schema::hasColumn('dosen', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])
                    ->nullable()
                    ->after('email');
            }
            if (!Schema::hasColumn('dosen', 'fakultas')) {
                $table->string('fakultas', 100)
                    ->nullable()
                    ->after('jenis_kelamin');
            }
            if (!Schema::hasColumn('dosen', 'prodi')) {
                $table->string('prodi', 100)
                    ->nullable()
                    ->after('fakultas');
            }
        });

        // STEP 2: Add kelas column to mata_kuliah table if not exists
        Schema::table('mata_kuliah', function (Blueprint $table) {
            if (!Schema::hasColumn('mata_kuliah', 'kelas')) {
                $table->string('kelas', 20)
                    ->nullable()
                    ->after('dosen_id');
            }
        });

        // STEP 3: Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // STEP 4: Delete all existing dosen data
        DB::table('dosen')->truncate();

        // STEP 5: Insert new dosen data
        $dosens = [
            [
                'id' => 1,
                'nidn' => '0401028605',
                'nama' => 'Intan Kumalasari, S.Kom., M.Kom.',
                'email' => 'dosen02368@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nidn' => '0410038801',
                'nama' => 'Muhammad Yasser Arafat, S.Kom., M.Kom.',
                'email' => 'dosen00680@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'nidn' => '0421049102',
                'nama' => 'Kecitaan Harefa, S.Kom., M.Kom.',
                'email' => 'dosen00842@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'nidn' => '8804410016',
                'nama' => 'Drs. Muhammad Rosyid Ridlo, M.Eng.',
                'email' => 'dosen01873@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'nidn' => '0409078802',
                'nama' => 'Farida Nurlaila, S.Kom., M.Kom.',
                'email' => 'dosen00676@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'nidn' => '0429069401',
                'nama' => 'Sopiyan Apandi, S.Kom., M.Kom.',
                'email' => 'dosen02601@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'nidn' => '0404059206',
                'nama' => 'Nurhalimah, S.Kom., M.Kom.',
                'email' => 'dosen02956@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'nidn' => '0416038709',
                'nama' => 'Farizi Ilham, S.Kom., M.Kom.',
                'email' => 'dosen02954@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($dosens as $dosen) {
            DB::table('dosen')->insert($dosen);
        }

        // STEP 6: Delete all existing mata_kuliah data
        DB::table('mata_kuliah')->truncate();

        // STEP 7: Insert new mata_kuliah data
        $mataKuliahs = [
            [
                'id' => 1,
                'kode' => '22TIF0323',
                'nama' => 'REKAYASA PERANGKAT LUNAK',
                'sks' => 3,
                'dosen_id' => 1,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'kode' => '22TIF0353',
                'nama' => 'PEMROGRAMAN II',
                'sks' => 3,
                'dosen_id' => 2,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'kode' => '22TIF2012',
                'nama' => 'SISTEM PENDUKUNG KEPUTUSAN',
                'sks' => 3,
                'dosen_id' => 3,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'kode' => '22TIF3012',
                'nama' => 'TEKNIK KOMPILASI',
                'sks' => 3,
                'dosen_id' => 4,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'kode' => '22TIF0443',
                'nama' => 'MOBILE PROGRAMMING',
                'sks' => 3,
                'dosen_id' => 5,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'kode' => '22TIF0363',
                'nama' => 'BASIS DATA II',
                'sks' => 3,
                'dosen_id' => 6,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'kode' => '22TIF0342',
                'nama' => 'TEKNOLOGI INTERNET OF THINGS',
                'sks' => 3,
                'dosen_id' => 7,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'kode' => '22TIF0332',
                'nama' => 'KERJA PRAKTEK',
                'sks' => 3,
                'dosen_id' => 8,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($mataKuliahs as $mk) {
            DB::table('mata_kuliah')->insert($mk);
        }

        // STEP 8: Update mahasiswa kelas to 06TPLK004
        DB::table('mahasiswa')->update(['kelas' => '06TPLK004']);

        // STEP 9: Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback is not recommended for data migration
        // But we can provide basic structure
        
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        DB::table('dosen')->truncate();
        DB::table('mata_kuliah')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
```

---

## 🔄 SEEDER FILE (Alternative Approach)

### File: database/seeders/DosenMataKuliahSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DosenMataKuliahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing data
        DB::table('dosen')->truncate();
        DB::table('mata_kuliah')->truncate();

        // Insert dosen data
        $this->seedDosen();

        // Insert mata kuliah data
        $this->seedMataKuliah();

        // Update mahasiswa kelas
        $this->updateMahasiswaKelas();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('✅ Dosen and Mata Kuliah data seeded successfully!');
    }

    private function seedDosen(): void
    {
        $dosens = [
            [
                'id' => 1,
                'nidn' => '0401028605',
                'nama' => 'Intan Kumalasari, S.Kom., M.Kom.',
                'email' => 'dosen02368@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'prodi' => 'Teknik Informatika',
                'password' => Hash::make('unpam2024'),
                'theme_preference' => 'system',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // ... (rest of dosen data)
        ];

        DB::table('dosen')->insert($dosens);
        $this->command->info('✅ 8 Dosen inserted');
    }

    private function seedMataKuliah(): void
    {
        $mataKuliahs = [
            [
                'id' => 1,
                'kode' => '22TIF0323',
                'nama' => 'REKAYASA PERANGKAT LUNAK',
                'sks' => 3,
                'dosen_id' => 1,
                'kelas' => '06TPLK004',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // ... (rest of mata kuliah data)
        ];

        DB::table('mata_kuliah')->insert($mataKuliahs);
        $this->command->info('✅ 8 Mata Kuliah inserted');
    }

    private function updateMahasiswaKelas(): void
    {
        DB::table('mahasiswa')->update(['kelas' => '06TPLK004']);
        $this->command->info('✅ Mahasiswa kelas updated to 06TPLK004');
    }
}
```

---

## 📝 SQL SCRIPT (Direct Database Execution)

### File: database/scripts/migrate_dosen_mata_kuliah.sql

```sql
-- ============================================
-- MIGRATION SCRIPT: DOSEN & MATA KULIAH
-- Date: 2026-02-23
-- Purpose: Replace old dosen data with new UNPAM data
-- ============================================

-- Step 1: Add new columns if not exists
ALTER TABLE `dosen` 
  ADD COLUMN IF NOT EXISTS `jenis_kelamin` ENUM('Laki-laki', 'Perempuan') NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `fakultas` VARCHAR(100) NULL AFTER `jenis_kelamin`,
  ADD COLUMN IF NOT EXISTS `prodi` VARCHAR(100) NULL AFTER `fakultas`;

ALTER TABLE `mata_kuliah`
  ADD COLUMN IF NOT EXISTS `kelas` VARCHAR(20) NULL AFTER `dosen_id`;

-- Step 2: Disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Step 3: Clear existing data
TRUNCATE TABLE `dosen`;
TRUNCATE TABLE `mata_kuliah`;

-- Step 4: Insert new dosen data
INSERT INTO `dosen` 
  (`id`, `nidn`, `nama`, `email`, `jenis_kelamin`, `fakultas`, `prodi`, `password`, `theme_preference`, `created_at`, `updated_at`) 
VALUES
  (1, '0401028605', 'Intan Kumalasari, S.Kom., M.Kom.', 'dosen02368@unpam.ac.id', 'Perempuan', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (2, '0410038801', 'Muhammad Yasser Arafat, S.Kom., M.Kom.', 'dosen00680@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (3, '0421049102', 'Kecitaan Harefa, S.Kom., M.Kom.', 'dosen00842@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (4, '8804410016', 'Drs. Muhammad Rosyid Ridlo, M.Eng.', 'dosen01873@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (5, '0409078802', 'Farida Nurlaila, S.Kom., M.Kom.', 'dosen00676@unpam.ac.id', 'Perempuan', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (6, '0429069401', 'Sopiyan Apandi, S.Kom., M.Kom.', 'dosen02601@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (7, '0404059206', 'Nurhalimah, S.Kom., M.Kom.', 'dosen02956@unpam.ac.id', 'Perempuan', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW()),
  (8, '0416038709', 'Farizi Ilham, S.Kom., M.Kom.', 'dosen02954@unpam.ac.id', 'Laki-laki', 'Ilmu Komputer', 'Teknik Informatika', '$2y$12$KwCQ5XKZOkcjF/QxObGykuyMaQ.MdPIOvvBVksTYumLpqEX0oioWG', 'system', NOW(), NOW());

-- Step 5: Insert new mata kuliah data
INSERT INTO `mata_kuliah` 
  (`id`, `kode`, `nama`, `sks`, `dosen_id`, `kelas`, `created_at`, `updated_at`) 
VALUES
  (1, '22TIF0323', 'REKAYASA PERANGKAT LUNAK', 3, 1, '06TPLK004', NOW(), NOW()),
  (2, '22TIF0353', 'PEMROGRAMAN II', 3, 2, '06TPLK004', NOW(), NOW()),
  (3, '22TIF2012', 'SISTEM PENDUKUNG KEPUTUSAN', 3, 3, '06TPLK004', NOW(), NOW()),
  (4, '22TIF3012', 'TEKNIK KOMPILASI', 3, 4, '06TPLK004', NOW(), NOW()),
  (5, '22TIF0443', 'MOBILE PROGRAMMING', 3, 5, '06TPLK004', NOW(), NOW()),
  (6, '22TIF0363', 'BASIS DATA II', 3, 6, '06TPLK004', NOW(), NOW()),
  (7, '22TIF0342', 'TEKNOLOGI INTERNET OF THINGS', 3, 7, '06TPLK004', NOW(), NOW()),
  (8, '22TIF0332', 'KERJA PRAKTEK', 3, 8, '06TPLK004', NOW(), NOW());

-- Step 6: Update mahasiswa kelas
UPDATE `mahasiswa` SET `kelas` = '06TPLK004';

-- Step 7: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Step 8: Verify data
SELECT 'Dosen Count:' as Info, COUNT(*) as Total FROM `dosen`;
SELECT 'Mata Kuliah Count:' as Info, COUNT(*) as Total FROM `mata_kuliah`;
SELECT 'Mahasiswa with 06TPLK004:' as Info, COUNT(*) as Total FROM `mahasiswa` WHERE `kelas` = '06TPLK004';

-- Success message
SELECT '✅ Migration completed successfully!' as Status;
```

---

## 🚀 EXECUTION STEPS

### Method 1: Using Laravel Migration

```bash
# Step 1: Create migration file
php artisan make:migration migrate_dosen_mata_kuliah_data

# Step 2: Copy migration code to the file
# (Use the migration code provided above)

# Step 3: Run migration
php artisan migrate

# Step 4: Verify data
php artisan tinker
>>> DB::table('dosen')->count()
=> 8
>>> DB::table('mata_kuliah')->count()
=> 8
>>> DB::table('mahasiswa')->where('kelas', '06TPLK004')->count()
=> 32
```

### Method 2: Using Seeder

```bash
# Step 1: Create seeder
php artisan make:seeder DosenMataKuliahSeeder

# Step 2: Copy seeder code to the file
# (Use the seeder code provided above)

# Step 3: Run seeder
php artisan db:seed --class=DosenMataKuliahSeeder

# Step 4: Verify
php artisan tinker
>>> App\Models\Dosen::count()
=> 8
```

### Method 3: Direct SQL Execution

```bash
# Step 1: Connect to MySQL
mysql -u root -p mahasiswa

# Step 2: Execute SQL script
source database/scripts/migrate_dosen_mata_kuliah.sql

# Or copy-paste the SQL commands directly
```

---

## ✅ VERIFICATION CHECKLIST

### Post-Migration Checks

```sql
-- 1. Check dosen count (should be 8)
SELECT COUNT(*) as total_dosen FROM dosen;

-- 2. Check mata kuliah count (should be 8)
SELECT COUNT(*) as total_mk FROM mata_kuliah;

-- 3. Verify dosen data
SELECT id, nidn, nama, email, jenis_kelamin, fakultas, prodi 
FROM dosen 
ORDER BY id;

-- 4. Verify mata kuliah data
SELECT mk.id, mk.kode, mk.nama, mk.sks, d.nama as dosen_nama, mk.kelas
FROM mata_kuliah mk
LEFT JOIN dosen d ON mk.dosen_id = d.id
ORDER BY mk.id;

-- 5. Check mahasiswa kelas
SELECT kelas, COUNT(*) as total
FROM mahasiswa
GROUP BY kelas;

-- 6. Verify foreign key relationships
SELECT 
  mk.nama as mata_kuliah,
  d.nama as dosen,
  mk.kelas
FROM mata_kuliah mk
INNER JOIN dosen d ON mk.dosen_id = d.id;

-- 7. Check pertemuan table (should auto-update via FK)
SELECT COUNT(*) as total_pertemuan FROM pertemuan;
```

### Expected Results

```
✅ Total Dosen: 8
✅ Total Mata Kuliah: 8
✅ Total Mahasiswa: 32
✅ All Mahasiswa Kelas: 06TPLK004
✅ All FK relationships intact
✅ Pertemuan data preserved
```

---

## 🔐 SECURITY & BACKUP

### Pre-Migration Backup

```bash
# Backup entire database
mysqldump -u root -p mahasiswa > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables only
mysqldump -u root -p mahasiswa dosen mata_kuliah > backup_dosen_mk_$(date +%Y%m%d_%H%M%S).sql
```

### Rollback Plan

```sql
-- If migration fails, restore from backup
mysql -u root -p mahasiswa < backup_before_migration_20260223_120000.sql
```

### Password Security

```php
// Default password for all dosen: 'unpam2024'
// Hashed with bcrypt: Hash::make('unpam2024')

// Dosen should change password on first login
// Implement password change requirement in DosenController
```

---

## 📊 DATA MAPPING SUMMARY

### Old vs New Data

| Aspect | Old Data | New Data |
|--------|----------|----------|
| Total Dosen | 8 | 8 |
| Dosen Names | Different | UNPAM Faculty |
| NIDN | Not standardized | Official UNPAM NIDN |
| Email | Generic | Official @unpam.ac.id |
| Fakultas | Not set | Ilmu Komputer |
| Prodi | Not set | Teknik Informatika |
| Mata Kuliah | 8 | 8 (different names) |
| Kode MK | Not set | Official codes (22TIF...) |
| Kelas | Various | 06TPLK004 (unified) |

### Kelas Information

```
Kelas: 06TPLK004
├── Meaning: 
│   ├── 06: Semester 6
│   ├── TPLK: Teknik Informatika Program Lintas Kampus
│   └── 004: Class number
├── Total Students: 32
└── Total Courses: 8
```

---

## 🎯 INTEGRATION POINTS

### Files That May Need Updates

#### 1. Dosen Model
```php
// app/Models/Dosen.php
protected $fillable = [
    'nidn',
    'nama',
    'email',
    'jenis_kelamin',  // NEW
    'fakultas',       // NEW
    'prodi',          // NEW
    'phone',
    'avatar_url',
    'password',
    'settings',
    'theme_preference',
];

protected $casts = [
    'settings' => 'array',
    'last_activity_at' => 'datetime',
];
```

#### 2. MataKuliah Model
```php
// app/Models/MataKuliah.php
protected $table = 'mata_kuliah';

protected $fillable = [
    'kode',    // NEW
    'nama',
    'sks',
    'dosen_id',
    'kelas',   // NEW
];

public function dosen()
{
    return $this->belongsTo(Dosen::class);
}
```

#### 3. Mahasiswa Model
```php
// app/Models/Mahasiswa.php
protected $fillable = [
    'nim',
    'nama',
    'email',
    'fakultas',
    'kelas',  // UPDATED to 06TPLK004
    'password',
    // ...
];
```

---

## 🔄 FRONTEND UPDATES NEEDED

### 1. Dosen Profile Display

```tsx
// resources/js/pages/dosen/profile.tsx
interface DosenProfile {
  id: number;
  nidn: string;
  nama: string;
  email: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';  // NEW
  fakultas: string;                           // NEW
  prodi: string;                              // NEW
  phone?: string;
  avatar_url?: string;
}

// Display in profile card
<div className="profile-info">
  <div className="info-row">
    <span className="label">NIDN:</span>
    <span className="value">{dosen.nidn}</span>
  </div>
  <div className="info-row">
    <span className="label">Jenis Kelamin:</span>
    <span className="value">{dosen.jenis_kelamin}</span>
  </div>
  <div className="info-row">
    <span className="label">Fakultas:</span>
    <span className="value">{dosen.fakultas}</span>
  </div>
  <div className="info-row">
    <span className="label">Program Studi:</span>
    <span className="value">{dosen.prodi}</span>
  </div>
</div>
```

### 2. Mata Kuliah Display

```tsx
// resources/js/pages/dosen/courses.tsx
interface MataKuliah {
  id: number;
  kode: string;      // NEW - Display prominently
  nama: string;
  sks: number;
  kelas: string;     // NEW - Display class info
  dosen: {
    id: number;
    nama: string;
    nidn: string;
  };
}

// Display in course card
<div className="course-card">
  <div className="course-header">
    <span className="course-code">{mk.kode}</span>
    <span className="course-class">{mk.kelas}</span>
  </div>
  <h3 className="course-name">{mk.nama}</h3>
  <div className="course-meta">
    <span className="sks">{mk.sks} SKS</span>
    <span className="dosen">{mk.dosen.nama}</span>
  </div>
</div>
```

### 3. Student Dashboard

```tsx
// resources/js/pages/user/dashboard.tsx
// Update to show kelas information
<div className="student-info">
  <div className="info-item">
    <Users className="icon" />
    <div>
      <span className="label">Kelas</span>
      <span className="value">{mahasiswa.kelas}</span>
    </div>
  </div>
</div>

// Update course list to show kode
<div className="course-list">
  {courses.map(course => (
    <div key={course.id} className="course-item">
      <span className="code">{course.kode}</span>
      <span className="name">{course.nama}</span>
      <span className="dosen">{course.dosen.nama}</span>
    </div>
  ))}
</div>
```

---

## 🔧 API ENDPOINTS UPDATES

### 1. Dosen Endpoints

```php
// app/Http/Controllers/Dosen/ProfileController.php

public function show()
{
    $dosen = Auth::guard('dosen')->user();
    
    return response()->json([
        'id' => $dosen->id,
        'nidn' => $dosen->nidn,
        'nama' => $dosen->nama,
        'email' => $dosen->email,
        'jenis_kelamin' => $dosen->jenis_kelamin,  // NEW
        'fakultas' => $dosen->fakultas,            // NEW
        'prodi' => $dosen->prodi,                  // NEW
        'phone' => $dosen->phone,
        'avatar_url' => $dosen->avatar_url,
        'theme_preference' => $dosen->theme_preference,
    ]);
}

public function update(Request $request)
{
    $validated = $request->validate([
        'nama' => 'required|string|max:150',
        'email' => 'required|email|max:100',
        'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',  // NEW
        'phone' => 'nullable|string|max:20',
        'avatar_url' => 'nullable|string|max:255',
    ]);
    
    // Note: fakultas, prodi, nidn should not be editable
    
    $dosen = Auth::guard('dosen')->user();
    $dosen->update($validated);
    
    return response()->json([
        'message' => 'Profile updated successfully',
        'dosen' => $dosen
    ]);
}
```

### 2. Mata Kuliah Endpoints

```php
// app/Http/Controllers/MataKuliahController.php

public function index()
{
    $mataKuliahs = MataKuliah::with('dosen')
        ->select('id', 'kode', 'nama', 'sks', 'dosen_id', 'kelas')
        ->get();
    
    return response()->json($mataKuliahs);
}

public function show($id)
{
    $mk = MataKuliah::with('dosen:id,nidn,nama,email')
        ->findOrFail($id);
    
    return response()->json([
        'id' => $mk->id,
        'kode' => $mk->kode,
        'nama' => $mk->nama,
        'sks' => $mk->sks,
        'kelas' => $mk->kelas,
        'dosen' => $mk->dosen,
    ]);
}
```

### 3. Student Endpoints

```php
// app/Http/Controllers/User/DashboardController.php

public function index()
{
    $mahasiswa = Auth::guard('mahasiswa')->user();
    
    // Get courses for student's class
    $courses = MataKuliah::where('kelas', $mahasiswa->kelas)
        ->with('dosen:id,nama,nidn')
        ->get();
    
    return response()->json([
        'mahasiswa' => [
            'id' => $mahasiswa->id,
            'nim' => $mahasiswa->nim,
            'nama' => $mahasiswa->nama,
            'kelas' => $mahasiswa->kelas,
            'fakultas' => $mahasiswa->fakultas,
        ],
        'courses' => $courses,
        'stats' => [
            'total_courses' => $courses->count(),
            'total_sks' => $courses->sum('sks'),
        ]
    ]);
}
```

---

## 📱 AUTHENTICATION UPDATES

### Dosen Login

```php
// app/Http/Controllers/Auth/DosenLoginController.php

public function login(Request $request)
{
    $credentials = $request->validate([
        'nidn' => 'required|string',  // Login using NIDN
        'password' => 'required|string',
    ]);
    
    if (Auth::guard('dosen')->attempt($credentials)) {
        $dosen = Auth::guard('dosen')->user();
        
        // Update last activity
        $dosen->update(['last_activity_at' => now()]);
        
        return response()->json([
            'message' => 'Login successful',
            'dosen' => [
                'id' => $dosen->id,
                'nidn' => $dosen->nidn,
                'nama' => $dosen->nama,
                'email' => $dosen->email,
                'fakultas' => $dosen->fakultas,
                'prodi' => $dosen->prodi,
            ],
            'token' => $dosen->createToken('dosen-token')->plainTextToken,
        ]);
    }
    
    return response()->json([
        'message' => 'Invalid credentials'
    ], 401);
}
```

### Default Login Credentials

```
All Dosen Default Credentials:
├── NIDN: (respective NIDN from data)
├── Password: unpam2024
└── Must change password on first login
```

---

## 🎨 UI/UX CONSIDERATIONS

### 1. Kode Mata Kuliah Display

```tsx
// Prominent display of course code
<div className="course-header">
  <span className="course-code-badge">
    {mk.kode}
  </span>
  <h3 className="course-title">{mk.nama}</h3>
</div>

// CSS
.course-code-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 600;
  font-size: 12px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}
```

### 2. Kelas Information

```tsx
// Show class info in student profile
<div className="class-badge">
  <Users className="icon" />
  <span className="class-code">{mahasiswa.kelas}</span>
  <span className="class-label">Kelas</span>
</div>

// CSS
.class-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
}
```

### 3. Dosen Profile Card

```tsx
// Enhanced dosen profile with new fields
<div className="dosen-profile-card">
  <div className="profile-header">
    <img src={dosen.avatar_url || '/default-avatar.png'} alt={dosen.nama} />
    <div className="profile-info">
      <h2>{dosen.nama}</h2>
      <span className="nidn">NIDN: {dosen.nidn}</span>
    </div>
  </div>
  
  <div className="profile-details">
    <div className="detail-row">
      <Mail className="icon" />
      <span>{dosen.email}</span>
    </div>
    <div className="detail-row">
      <User className="icon" />
      <span>{dosen.jenis_kelamin}</span>
    </div>
    <div className="detail-row">
      <Building className="icon" />
      <span>{dosen.fakultas}</span>
    </div>
    <div className="detail-row">
      <GraduationCap className="icon" />
      <span>{dosen.prodi}</span>
    </div>
  </div>
</div>
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests

```php
// tests/Unit/DosenMigrationTest.php

public function test_dosen_count_is_eight()
{
    $this->assertEquals(8, Dosen::count());
}

public function test_all_dosen_have_nidn()
{
    $dosensWithoutNidn = Dosen::whereNull('nidn')->count();
    $this->assertEquals(0, $dosensWithoutNidn);
}

public function test_all_dosen_have_unpam_email()
{
    $dosens = Dosen::all();
    foreach ($dosens as $dosen) {
        $this->assertStringContainsString('@unpam.ac.id', $dosen->email);
    }
}

public function test_mata_kuliah_count_is_eight()
{
    $this->assertEquals(8, MataKuliah::count());
}

public function test_all_mata_kuliah_have_kode()
{
    $mkWithoutKode = MataKuliah::whereNull('kode')->count();
    $this->assertEquals(0, $mkWithoutKode);
}

public function test_all_mata_kuliah_have_kelas()
{
    $mkWithoutKelas = MataKuliah::whereNull('kelas')->count();
    $this->assertEquals(0, $mkWithoutKelas);
}

public function test_all_mahasiswa_have_same_kelas()
{
    $differentKelas = Mahasiswa::where('kelas', '!=', '06TPLK004')->count();
    $this->assertEquals(0, $differentKelas);
}
```

### Integration Tests

```php
// tests/Feature/DosenAuthTest.php

public function test_dosen_can_login_with_nidn()
{
    $response = $this->post('/api/dosen/login', [
        'nidn' => '0401028605',
        'password' => 'unpam2024',
    ]);
    
    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'dosen' => ['id', 'nidn', 'nama', 'email', 'fakultas', 'prodi'],
            'token'
        ]);
}

public function test_mata_kuliah_has_correct_dosen_relationship()
{
    $mk = MataKuliah::where('kode', '22TIF0323')->first();
    
    $this->assertNotNull($mk);
    $this->assertEquals('Intan Kumalasari, S.Kom., M.Kom.', $mk->dosen->nama);
    $this->assertEquals('0401028605', $mk->dosen->nidn);
}
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Backup current database
- [ ] Test migration on staging environment
- [ ] Verify all foreign key relationships
- [ ] Test dosen login with new credentials
- [ ] Verify mata kuliah display on frontend
- [ ] Test student dashboard with new kelas
- [ ] Check API endpoints return correct data
- [ ] Verify pertemuan data integrity

### Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Backup database
mysqldump -u root -p mahasiswa > backup_pre_migration.sql

# 3. Run migration
php artisan migrate

# 4. Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Restart queue workers (if any)
php artisan queue:restart

# 6. Verify deployment
php artisan tinker
>>> Dosen::count()
=> 8
>>> MataKuliah::count()
=> 8
```

### Post-Deployment

- [ ] Verify dosen can login
- [ ] Check dosen profile displays correctly
- [ ] Verify mata kuliah list shows kode
- [ ] Test student dashboard shows correct kelas
- [ ] Check attendance system still works
- [ ] Verify all API endpoints
- [ ] Monitor error logs
- [ ] Notify dosen about new credentials

---

## 🔔 NOTIFICATION TO USERS

### Email Template for Dosen

```
Subject: Pembaruan Data Dosen - Sistem Absensi UNPAM

Yth. Bapak/Ibu Dosen,

Kami informasikan bahwa telah dilakukan pembaruan data dosen pada Sistem Absensi UNPAM.

Data Login Anda:
- NIDN: [NIDN_DOSEN]
- Email: [EMAIL_DOSEN]
- Password Default: unpam2024

Silakan login menggunakan NIDN dan password default, kemudian segera ubah password Anda.

Link Login: https://absensi.unpam.ac.id/dosen/login

Terima kasih.

Tim IT UNPAM
```

### Announcement for Students

```
Subject: Informasi Kelas dan Mata Kuliah Semester 6

Kepada Mahasiswa Kelas 06TPLK004,

Berikut adalah daftar mata kuliah semester ini:

1. 22TIF0323 - REKAYASA PERANGKAT LUNAK (Intan Kumalasari, S.Kom., M.Kom.)
2. 22TIF0353 - PEMROGRAMAN II (Muhammad Yasser Arafat, S.Kom., M.Kom.)
3. 22TIF2012 - SISTEM PENDUKUNG KEPUTUSAN (Kecitaan Harefa, S.Kom., M.Kom.)
4. 22TIF3012 - TEKNIK KOMPILASI (Drs. Muhammad Rosyid Ridlo, M.Eng.)
5. 22TIF0443 - MOBILE PROGRAMMING (Farida Nurlaila, S.Kom., M.Kom.)
6. 22TIF0363 - BASIS DATA II (Sopiyan Apandi, S.Kom., M.Kom.)
7. 22TIF0342 - TEKNOLOGI INTERNET OF THINGS (Nurhalimah, S.Kom., M.Kom.)
8. 22TIF0332 - KERJA PRAKTEK (Farizi Ilham, S.Kom., M.Kom.)

Silakan cek jadwal kuliah di sistem.

Salam,
Fakultas Ilmu Komputer
```

---

## 🎯 SUCCESS CRITERIA

### Migration Success Indicators

✅ **Database Level:**
- 8 dosen records inserted
- 8 mata kuliah records inserted
- All mahasiswa kelas updated to 06TPLK004
- All foreign keys intact
- No orphaned records

✅ **Application Level:**
- Dosen can login with NIDN
- Dosen profile shows complete data
- Mata kuliah displays with kode
- Student dashboard shows correct kelas
- Attendance system works normally

✅ **User Experience:**
- No broken pages
- All data displays correctly
- No 404 or 500 errors
- Fast page load times
- Responsive on all devices

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue 1: Foreign Key Constraint Error**
```sql
-- Solution: Disable FK checks during migration
SET FOREIGN_KEY_CHECKS=0;
-- Run migration
SET FOREIGN_KEY_CHECKS=1;
```

**Issue 2: Duplicate NIDN Error**
```sql
-- Check for duplicates
SELECT nidn, COUNT(*) FROM dosen GROUP BY nidn HAVING COUNT(*) > 1;

-- Remove duplicates (keep first occurrence)
DELETE d1 FROM dosen d1
INNER JOIN dosen d2 
WHERE d1.id > d2.id AND d1.nidn = d2.nidn;
```

**Issue 3: Login Not Working**
```php
// Verify password hash
$dosen = Dosen::where('nidn', '0401028605')->first();
dd(Hash::check('unpam2024', $dosen->password));
// Should return true
```

---

## 📚 DOCUMENTATION UPDATES

### Update README.md

```markdown
## Database Structure

### Dosen Table
- NIDN: Official UNPAM NIDN
- Email: Official @unpam.ac.id email
- Fakultas: Ilmu Komputer
- Prodi: Teknik Informatika

### Mata Kuliah Table
- Kode: Official course code (22TIF...)
- Kelas: 06TPLK004 (unified class)

### Default Credentials
- All dosen: NIDN / unpam2024
- Must change password on first login
```

---

## ✨ FINAL NOTES

Migrasi database ini adalah perubahan MAJOR yang mempengaruhi:
- **8 Dosen** dengan data lengkap UNPAM
- **8 Mata Kuliah** dengan kode resmi
- **32 Mahasiswa** dengan kelas unified
- **Semua relasi** tetap terjaga

**PENTING:**
1. Selalu backup database sebelum migrasi
2. Test di staging environment dulu
3. Notify semua user tentang perubahan
4. Monitor system setelah deployment
5. Siapkan rollback plan jika ada masalah

**Contact:**
- Developer: [Your Name]
- Email: [Your Email]
- Emergency: [Emergency Contact]

---

🎉 **Migration Complete!** Database siap digunakan dengan data dosen dan mata kuliah UNPAM yang lengkap!
