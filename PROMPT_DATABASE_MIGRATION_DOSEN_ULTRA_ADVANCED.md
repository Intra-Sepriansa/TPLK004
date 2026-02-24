# 🔄 PROMPT ULTRA ADVANCED: DATABASE MIGRATION DOSEN
## Perpindahan Database Dosen dengan Data Baru dan Penghapusan Data Lama

---

## 📋 OVERVIEW MIGRASI

### Tujuan Migrasi
Melakukan perpindahan database dosen dengan:
- **HAPUS SEMUA** data dosen lama yang ada di database
- **INSERT** 8 data dosen baru sesuai data resmi UNPAM
- **UPDATE** relasi mata kuliah dengan dosen baru
- **MAINTAIN** integritas referential dengan tabel terkait
- **PRESERVE** struktur tabel tanpa perubahan schema

### Scope Migrasi
```
Tables Affected:
├── dosen (PRIMARY - DELETE ALL + INSERT NEW)
├── mata_kuliah (UPDATE dosen_id references)
├── attendance_sessions (UPDATE created_by_dosen)
├── courses (NO CHANGE - structure only)
└── mahasiswa (NO CHANGE - kelas reference only)
```

---

## 📊 DATA DOSEN BARU (8 DOSEN)

### Dosen 1: Intan Kumalasari
```php
[
    'nama' => 'Intan Kumalasari, S.Kom., M.Kom.',
    'nidn' => '0401028605',
    'email' => 'dosen02368@unpam.ac.id',
    'jenis_kelamin' => 'Perempuan',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 2: Muhammad Yasser Arafat
```php
[
    'nama' => 'Muhammad Yasser Arafat, S.Kom., M.Kom.',
    'nidn' => '0410038801',
    'email' => 'dosen00680@unpam.ac.id',
    'jenis_kelamin' => 'Laki-laki',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 3: Kecitaan Harefa
```php
[
    'nama' => 'Kecitaan Harefa, S.Kom., M.Kom.',
    'nidn' => '0421049102',
    'email' => 'dosen00842@unpam.ac.id',
    'jenis_kelamin' => 'Laki-laki',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 4: Muhammad Rosyid Ridlo
```php
[
    'nama' => 'Drs. Muhammad Rosyid Ridlo, M.Eng.',
    'nidn' => '8804410016',
    'email' => 'dosen01873@unpam.ac.id',
    'jenis_kelamin' => 'Laki-laki',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 5: Farida Nurlaila
```php
[
    'nama' => 'Farida Nurlaila, S.Kom., M.Kom.',
    'nidn' => '0409078802',
    'email' => 'dosen00676@unpam.ac.id',
    'jenis_kelamin' => 'Perempuan',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 6: Sopiyan Apandi
```php
[
    'nama' => 'Sopiyan Apandi, S.Kom., M.Kom.',
    'nidn' => '0429069401',
    'email' => 'dosen02601@unpam.ac.id',
    'jenis_kelamin' => 'Laki-laki',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 7: Nurhalimah
```php
[
    'nama' => 'Nurhalimah, S.Kom., M.Kom.',
    'nidn' => '0404059206',
    'email' => 'dosen02956@unpam.ac.id',
    'jenis_kelamin' => 'Perempuan',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

### Dosen 8: Farizi Ilham
```php
[
    'nama' => 'Farizi Ilham, S.Kom., M.Kom.',
    'nidn' => '0416038709',
    'email' => 'dosen02954@unpam.ac.id',
    'jenis_kelamin' => 'Laki-laki',
    'fakultas' => 'Ilmu Komputer',
    'program_studi' => 'Teknik Informatika',
    'phone' => null,
    'password' => Hash::make('dosen123'),
    'avatar_url' => null,
]
```

---

## 📚 DATA MATA KULIAH & MAPPING DOSEN

### Mapping Mata Kuliah ke Dosen (Berdasarkan Gambar)
```php
$mataKuliahMapping = [
    // Intan Kumalasari
    [
        'kode_mk' => '22TIF0323',
        'nama_mk' => 'REKAYASA PERANGKAT LUNAK',
        'dosen_nama' => 'INTAN KUMALASARI',
        'kelas' => '06TPLK004',
    ],
    
    // Muhammad Yasser Arafat
    [
        'kode_mk' => '22TIF0353',
        'nama_mk' => 'PEMROGRAMAN II',
        'dosen_nama' => 'MUHAMMAD YASSER ARAFAT',
        'kelas' => '06TPLK004',
    ],
    
    // Kecitaan Harefa
    [
        'kode_mk' => '22TIF2012',
        'nama_mk' => 'SISTEM PENDUKUNG KEPUTUSAN',
        'dosen_nama' => 'KECITAAN HAREFA',
        'kelas' => '06TPLK004',
    ],
    
    // Muhammad Rosyid Ridlo
    [
        'kode_mk' => '22TIF3012',
        'nama_mk' => 'TEKNIK KOMPILASI',
        'dosen_nama' => 'MUHAMMAD ROSYID RIDLO',
        'kelas' => '06TPLK004',
    ],
    
    // Farida Nurlaila
    [
        'kode_mk' => '22TIF0443',
        'nama_mk' => 'MOBILE PROGRAMMING',
        'dosen_nama' => 'FARIDA NURLAILA',
        'kelas' => '06TPLK004',
    ],
    
    // Sopiyan Apandi
    [
        'kode_mk' => '22TIF0363',
        'nama_mk' => 'BASIS DATA II',
        'dosen_nama' => 'SOPIYAN APANDI',
        'kelas' => '06TPLK004',
    ],
    
    // Nurhalimah
    [
        'kode_mk' => '22TIF0342',
        'nama_mk' => 'TEKNOLOGI INTERNET OF THINGS',
        'dosen_nama' => 'NURHALIMAH',
        'kelas' => '06TPLK004',
    ],
    
    // Farizi Ilham
    [
        'kode_mk' => '22TIF0332',
        'nama_mk' => 'KERJA PRAKTEK',
        'dosen_nama' => 'FARIZI ILHAM',
        'kelas' => '06TPLK004',
    ],
];
```

---

## 🔧 PERUBAHAN STRUKTUR TABEL

### Tabel `dosen` - Tambah Field Baru
```php
Schema::table('dosen', function (Blueprint $table) {
    // Field baru yang perlu ditambahkan
    $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])->after('nama');
    $table->string('fakultas')->nullable()->after('jenis_kelamin');
    $table->string('program_studi')->nullable()->after('fakultas');
});
```

### Tabel `mata_kuliah` - Pastikan Field Ada
```php
Schema::table('mata_kuliah', function (Blueprint $table) {
    // Pastikan field ini ada
    if (!Schema::hasColumn('mata_kuliah', 'kode')) {
        $table->string('kode')->unique()->after('nama');
    }
    if (!Schema::hasColumn('mata_kuliah', 'kelas')) {
        $table->string('kelas')->nullable()->after('sks');
    }
});
```

---

## 💻 IMPLEMENTATION CODE

### 1. Migration File: Add Fields to Dosen Table
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->enum('jenis_kelamin', ['Laki-laki', 'Perempuan'])
                ->after('nama')
                ->nullable();
            $table->string('fakultas')->nullable()->after('jenis_kelamin');
            $table->string('program_studi')->nullable()->after('fakultas');
        });
        
        Schema::table('mata_kuliah', function (Blueprint $table) {
            if (!Schema::hasColumn('mata_kuliah', 'kelas')) {
                $table->string('kelas')->nullable()->after('sks');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->dropColumn(['jenis_kelamin', 'fakultas', 'program_studi']);
        });
        
        Schema::table('mata_kuliah', function (Blueprint $table) {
            if (Schema::hasColumn('mata_kuliah', 'kelas')) {
                $table->dropColumn('kelas');
            }
        });
    }
};
```

### 2. Seeder File: DosenSeeder (REPLACE COMPLETELY)
```php
<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\MataKuliah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DosenSeeder extends Seeder
{
    public function run(): void
    {
        // STEP 1: BACKUP data lama (optional - untuk safety)
        $this->command->info('📦 Backing up old dosen data...');
        $oldDosens = Dosen::all()->toArray();
        // Simpan ke file JSON jika diperlukan
        file_put_contents(
            storage_path('app/backup_dosen_' . date('Y-m-d_His') . '.json'),
            json_encode($oldDosens, JSON_PRETTY_PRINT)
        );
        
        // STEP 2: DELETE ALL existing dosen
        $this->command->warn('🗑️  Deleting all existing dosen data...');
        DB::table('dosen')->delete();
        
        // STEP 3: INSERT new dosen data
        $this->command->info('✨ Inserting new dosen data...');
        
        $dosens = [
            [
                'nama' => 'Intan Kumalasari, S.Kom., M.Kom.',
                'nidn' => '0401028605',
                'email' => 'dosen02368@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Muhammad Yasser Arafat, S.Kom., M.Kom.',
                'nidn' => '0410038801',
                'email' => 'dosen00680@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Kecitaan Harefa, S.Kom., M.Kom.',
                'nidn' => '0421049102',
                'email' => 'dosen00842@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Drs. Muhammad Rosyid Ridlo, M.Eng.',
                'nidn' => '8804410016',
                'email' => 'dosen01873@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Farida Nurlaila, S.Kom., M.Kom.',
                'nidn' => '0409078802',
                'email' => 'dosen00676@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Sopiyan Apandi, S.Kom., M.Kom.',
                'nidn' => '0429069401',
                'email' => 'dosen02601@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Nurhalimah, S.Kom., M.Kom.',
                'nidn' => '0404059206',
                'email' => 'dosen02956@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Farizi Ilham, S.Kom., M.Kom.',
                'nidn' => '0416038709',
                'email' => 'dosen02954@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
        ];

        foreach ($dosens as $dosen) {
            Dosen::create($dosen);
            $this->command->info("✅ Created: {$dosen['nama']} ({$dosen['nidn']})");
        }
        
        // STEP 4: CREATE/UPDATE Mata Kuliah
        $this->command->info('📚 Creating/Updating mata kuliah...');
        $this->createMataKuliah();
        
        $this->command->info('🎉 Dosen migration completed successfully!');
        $this->command->info('📊 Total dosen: ' . Dosen::count());
    }
    
    private function createMataKuliah(): void
    {
        $mataKuliahData = [
            [
                'kode' => '22TIF0323',
                'nama' => 'REKAYASA PERANGKAT LUNAK',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0401028605', // Intan Kumalasari
            ],
            [
                'kode' => '22TIF0353',
                'nama' => 'PEMROGRAMAN II',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0410038801', // Muhammad Yasser Arafat
            ],
            [
                'kode' => '22TIF2012',
                'nama' => 'SISTEM PENDUKUNG KEPUTUSAN',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0421049102', // Kecitaan Harefa
            ],
            [
                'kode' => '22TIF3012',
                'nama' => 'TEKNIK KOMPILASI',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '8804410016', // Muhammad Rosyid Ridlo
            ],
            [
                'kode' => '22TIF0443',
                'nama' => 'MOBILE PROGRAMMING',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0409078802', // Farida Nurlaila
            ],
            [
                'kode' => '22TIF0363',
                'nama' => 'BASIS DATA II',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0429069401', // Sopiyan Apandi
            ],
            [
                'kode' => '22TIF0342',
                'nama' => 'TEKNOLOGI INTERNET OF THINGS',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0404059206', // Nurhalimah
            ],
            [
                'kode' => '22TIF0332',
                'nama' => 'KERJA PRAKTEK',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0416038709', // Farizi Ilham
            ],
        ];
        
        foreach ($mataKuliahData as $mk) {
            $dosen = Dosen::where('nidn', $mk['dosen_nidn'])->first();
            
            if ($dosen) {
                MataKuliah::updateOrCreate(
                    ['kode' => $mk['kode']],
                    [
                        'nama' => $mk['nama'],
                        'sks' => $mk['sks'],
                        'kelas' => $mk['kelas'],
                        'dosen_id' => $dosen->id,
                    ]
                );
                
                $this->command->info("  ✅ {$mk['kode']} - {$mk['nama']} → {$dosen->nama}");
            }
        }
    }
}
```


### 3. Artisan Command untuk Migrasi (Optional - Safer Approach)
```php
<?php

namespace App\Console\Commands;

use App\Models\Dosen;
use App\Models\MataKuliah;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MigrateDosenData extends Command
{
    protected $signature = 'migrate:dosen {--force : Force migration without confirmation}';
    protected $description = 'Migrate dosen data - DELETE old and INSERT new dosen';

    public function handle()
    {
        $this->info('🔄 DOSEN DATA MIGRATION');
        $this->info('========================');
        $this->newLine();
        
        // Show current data
        $currentCount = Dosen::count();
        $this->warn("⚠️  Current dosen count: {$currentCount}");
        $this->warn("⚠️  This will DELETE ALL existing dosen data!");
        $this->newLine();
        
        // Confirmation
        if (!$this->option('force')) {
            if (!$this->confirm('Are you sure you want to proceed?')) {
                $this->error('❌ Migration cancelled');
                return 1;
            }
        }
        
        DB::beginTransaction();
        
        try {
            // Step 1: Backup
            $this->info('📦 Step 1: Backing up old data...');
            $this->backupOldData();
            
            // Step 2: Delete
            $this->info('🗑️  Step 2: Deleting old dosen data...');
            $this->deleteOldData();
            
            // Step 3: Insert new
            $this->info('✨ Step 3: Inserting new dosen data...');
            $newDosens = $this->insertNewDosens();
            
            // Step 4: Create mata kuliah
            $this->info('📚 Step 4: Creating mata kuliah...');
            $this->createMataKuliah($newDosens);
            
            DB::commit();
            
            $this->newLine();
            $this->info('🎉 Migration completed successfully!');
            $this->info('📊 Total dosen: ' . Dosen::count());
            $this->info('📚 Total mata kuliah: ' . MataKuliah::count());
            
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Migration failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
    
    private function backupOldData(): void
    {
        $oldDosens = Dosen::all()->toArray();
        $backupPath = storage_path('app/backup_dosen_' . date('Y-m-d_His') . '.json');
        file_put_contents($backupPath, json_encode($oldDosens, JSON_PRETTY_PRINT));
        $this->info("  ✅ Backup saved to: {$backupPath}");
    }
    
    private function deleteOldData(): void
    {
        $count = Dosen::count();
        DB::table('dosen')->delete();
        $this->info("  ✅ Deleted {$count} old dosen records");
    }
    
    private function insertNewDosens(): array
    {
        $dosens = [
            [
                'nama' => 'Intan Kumalasari, S.Kom., M.Kom.',
                'nidn' => '0401028605',
                'email' => 'dosen02368@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Muhammad Yasser Arafat, S.Kom., M.Kom.',
                'nidn' => '0410038801',
                'email' => 'dosen00680@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Kecitaan Harefa, S.Kom., M.Kom.',
                'nidn' => '0421049102',
                'email' => 'dosen00842@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Drs. Muhammad Rosyid Ridlo, M.Eng.',
                'nidn' => '8804410016',
                'email' => 'dosen01873@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Farida Nurlaila, S.Kom., M.Kom.',
                'nidn' => '0409078802',
                'email' => 'dosen00676@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Sopiyan Apandi, S.Kom., M.Kom.',
                'nidn' => '0429069401',
                'email' => 'dosen02601@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Nurhalimah, S.Kom., M.Kom.',
                'nidn' => '0404059206',
                'email' => 'dosen02956@unpam.ac.id',
                'jenis_kelamin' => 'Perempuan',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
            [
                'nama' => 'Farizi Ilham, S.Kom., M.Kom.',
                'nidn' => '0416038709',
                'email' => 'dosen02954@unpam.ac.id',
                'jenis_kelamin' => 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make('dosen123'),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ],
        ];
        
        $createdDosens = [];
        foreach ($dosens as $dosen) {
            $created = Dosen::create($dosen);
            $createdDosens[$dosen['nidn']] = $created;
            $this->info("  ✅ {$dosen['nama']} ({$dosen['nidn']})");
        }
        
        return $createdDosens;
    }
    
    private function createMataKuliah(array $dosens): void
    {
        $mataKuliahData = [
            [
                'kode' => '22TIF0323',
                'nama' => 'REKAYASA PERANGKAT LUNAK',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0401028605',
            ],
            [
                'kode' => '22TIF0353',
                'nama' => 'PEMROGRAMAN II',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0410038801',
            ],
            [
                'kode' => '22TIF2012',
                'nama' => 'SISTEM PENDUKUNG KEPUTUSAN',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0421049102',
            ],
            [
                'kode' => '22TIF3012',
                'nama' => 'TEKNIK KOMPILASI',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '8804410016',
            ],
            [
                'kode' => '22TIF0443',
                'nama' => 'MOBILE PROGRAMMING',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0409078802',
            ],
            [
                'kode' => '22TIF0363',
                'nama' => 'BASIS DATA II',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0429069401',
            ],
            [
                'kode' => '22TIF0342',
                'nama' => 'TEKNOLOGI INTERNET OF THINGS',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0404059206',
            ],
            [
                'kode' => '22TIF0332',
                'nama' => 'KERJA PRAKTEK',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0416038709',
            ],
        ];
        
        foreach ($mataKuliahData as $mk) {
            if (isset($dosens[$mk['dosen_nidn']])) {
                $dosen = $dosens[$mk['dosen_nidn']];
                
                MataKuliah::updateOrCreate(
                    ['kode' => $mk['kode']],
                    [
                        'nama' => $mk['nama'],
                        'sks' => $mk['sks'],
                        'kelas' => $mk['kelas'],
                        'dosen_id' => $dosen->id,
                    ]
                );
                
                $this->info("  ✅ {$mk['kode']} - {$mk['nama']}");
            }
        }
    }
}
```

---

## 🔍 VERIFIKASI & TESTING

### 1. Verifikasi Data Dosen
```php
// Test di Tinker atau Controller
use App\Models\Dosen;

// Check total dosen
$count = Dosen::count();
echo "Total Dosen: {$count}\n"; // Should be 8

// Check all dosen
$dosens = Dosen::all();
foreach ($dosens as $dosen) {
    echo "{$dosen->nidn} - {$dosen->nama} - {$dosen->email}\n";
}

// Check specific dosen
$intan = Dosen::where('nidn', '0401028605')->first();
echo "Intan: {$intan->nama} - {$intan->jenis_kelamin}\n";
```

### 2. Verifikasi Mata Kuliah
```php
use App\Models\MataKuliah;

// Check total mata kuliah
$count = MataKuliah::count();
echo "Total Mata Kuliah: {$count}\n"; // Should be 8

// Check mata kuliah with dosen
$mataKuliah = MataKuliah::with('dosen')->get();
foreach ($mataKuliah as $mk) {
    echo "{$mk->kode} - {$mk->nama} - Dosen: {$mk->dosen->nama} - Kelas: {$mk->kelas}\n";
}

// Check specific mata kuliah
$rpl = MataKuliah::where('kode', '22TIF0323')->with('dosen')->first();
echo "RPL: {$rpl->nama} - Dosen: {$rpl->dosen->nama}\n";
```

### 3. Test Login Dosen
```php
// Test login dengan NIDN dan password
use Illuminate\Support\Facades\Hash;
use App\Models\Dosen;

$nidn = '0401028605';
$password = 'dosen123';

$dosen = Dosen::where('nidn', $nidn)->first();

if ($dosen && Hash::check($password, $dosen->password)) {
    echo "✅ Login successful: {$dosen->nama}\n";
} else {
    echo "❌ Login failed\n";
}
```

---

## 📝 EXECUTION STEPS

### Step 1: Create Migration File
```bash
php artisan make:migration add_fields_to_dosen_table
```

Edit file migration sesuai dengan code di atas (section 1).

### Step 2: Run Migration
```bash
php artisan migrate
```

### Step 3: Update DosenSeeder
Replace file `database/seeders/DosenSeeder.php` dengan code di atas (section 2).

### Step 4: Run Seeder
```bash
# Fresh migration (HATI-HATI: akan reset semua data)
php artisan migrate:fresh --seed

# Atau hanya run DosenSeeder
php artisan db:seed --class=DosenSeeder
```

### Step 5 (Alternative): Use Artisan Command
```bash
# Create command
php artisan make:command MigrateDosenData

# Run command
php artisan migrate:dosen

# Or with force flag (skip confirmation)
php artisan migrate:dosen --force
```

### Step 6: Verify Data
```bash
php artisan tinker

# Run verification code
Dosen::count();
Dosen::all();
MataKuliah::with('dosen')->get();
```

---

## ⚠️ IMPORTANT NOTES

### Data Integrity
1. **Backup First**: Selalu backup database sebelum migrasi
   ```bash
   php artisan db:backup
   # atau manual export dari phpMyAdmin/MySQL
   ```

2. **Foreign Key Constraints**: Pastikan tidak ada constraint yang akan break
   - `mata_kuliah.dosen_id` → `dosen.id`
   - `attendance_sessions.created_by_dosen` → `dosen.id`

3. **Cascade Delete**: Jika ada ON DELETE CASCADE, data terkait akan terhapus

### Password Default
- Semua dosen menggunakan password: `dosen123`
- Hash menggunakan bcrypt
- Bisa login dengan NIDN sebagai username

### Kelas Reference
- Semua mata kuliah menggunakan kelas: `06TPLK004`
- Kelas ini harus ada di tabel `mahasiswa`
- Mahasiswa dengan kelas `06TPLK004` akan bisa akses mata kuliah ini

### NIDN Format
- NIDN adalah unique identifier untuk dosen
- Format: 10 digit angka
- Contoh: `0401028605`, `0410038801`

---

## 🔄 ROLLBACK PROCEDURE

### Jika Terjadi Error
```php
// Restore dari backup
$backupFile = storage_path('app/backup_dosen_2026-02-23_120000.json');
$oldDosens = json_decode(file_get_contents($backupFile), true);

DB::table('dosen')->delete();

foreach ($oldDosens as $dosen) {
    Dosen::create($dosen);
}
```

### Rollback Migration
```bash
# Rollback last migration
php artisan migrate:rollback

# Rollback specific migration
php artisan migrate:rollback --step=1
```

---

## 📊 DATA SUMMARY

### Total Records
- **Dosen**: 8 records
- **Mata Kuliah**: 8 records
- **Kelas**: 1 kelas (06TPLK004)

### Gender Distribution
- **Laki-laki**: 5 dosen
- **Perempuan**: 3 dosen

### Fakultas & Program Studi
- **Fakultas**: Ilmu Komputer (semua)
- **Program Studi**: Teknik Informatika (semua)

### Email Pattern
- Format: `dosen[5-digit]@unpam.ac.id`
- Domain: `unpam.ac.id`

---

## ✅ CHECKLIST MIGRASI

### Pre-Migration
- [ ] Backup database lengkap
- [ ] Backup file `DosenSeeder.php` lama
- [ ] Check foreign key constraints
- [ ] Verify mahasiswa kelas `06TPLK004` exists
- [ ] Test di local environment dulu

### Migration
- [ ] Create migration file untuk add fields
- [ ] Run migration
- [ ] Update DosenSeeder.php
- [ ] Run seeder
- [ ] Verify dosen count (should be 8)
- [ ] Verify mata kuliah count (should be 8)

### Post-Migration
- [ ] Test login untuk setiap dosen
- [ ] Verify mata kuliah relationships
- [ ] Check attendance sessions (jika ada)
- [ ] Test dosen dashboard
- [ ] Test mata kuliah list
- [ ] Verify kelas filtering

### Testing
- [ ] Login test untuk semua 8 dosen
- [ ] Mata kuliah list di dosen dashboard
- [ ] Mahasiswa list per mata kuliah
- [ ] Create attendance session
- [ ] View attendance logs

---

## 🎯 FINAL RESULT

Setelah migrasi selesai, sistem akan memiliki:

✅ **8 Dosen Baru** dengan data lengkap dari UNPAM
✅ **8 Mata Kuliah** dengan mapping dosen yang benar
✅ **Kelas 06TPLK004** sebagai kelas aktif
✅ **Password Uniform** (`dosen123`) untuk semua dosen
✅ **Data Integrity** terjaga dengan foreign keys
✅ **Backup Data Lama** tersimpan di storage

**Login Credentials:**
- Username: NIDN (contoh: `0401028605`)
- Password: `dosen123`

**Mata Kuliah per Dosen:**
1. Intan Kumalasari → Rekayasa Perangkat Lunak
2. Muhammad Yasser Arafat → Pemrograman II
3. Kecitaan Harefa → Sistem Pendukung Keputusan
4. Muhammad Rosyid Ridlo → Teknik Kompilasi
5. Farida Nurlaila → Mobile Programming
6. Sopiyan Apandi → BASIS DATA II
7. Nurhalimah → Teknologi Internet of Things
8. Farizi Ilham → Kerja Praktek

Semua mata kuliah untuk kelas: **06TPLK004**

