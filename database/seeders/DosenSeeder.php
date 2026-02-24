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
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('dosen')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
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
