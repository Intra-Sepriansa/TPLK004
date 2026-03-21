<?php

namespace Database\Seeders;

use App\Support\CredentialDefaults;
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
        $defaultDosenPassword = CredentialDefaults::dosenSeedPassword();
        
        $dosens = [];
        for ($i = 1; $i <= 8; $i++) {
            $dosens[] = [
                'nama' => sprintf('Dosen Akademik %02d', $i),
                'nidn' => sprintf('049800%04d', $i),
                'email' => sprintf('dosen%02d@example.test', $i),
                'jenis_kelamin' => $i % 2 === 0 ? 'Perempuan' : 'Laki-laki',
                'fakultas' => 'Ilmu Komputer',
                'program_studi' => 'Teknik Informatika',
                'phone' => null,
                'password' => Hash::make($defaultDosenPassword),
                'avatar_url' => null,
                'settings' => json_encode([]),
                'theme_preference' => 'system',
            ];
        }

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
                'dosen_nidn' => '0498000001',
            ],
            [
                'kode' => '22TIF0353',
                'nama' => 'PEMROGRAMAN II',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000002',
            ],
            [
                'kode' => '22TIF2012',
                'nama' => 'SISTEM PENDUKUNG KEPUTUSAN',
                'sks' => 2,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000003',
            ],
            [
                'kode' => '22TIF3012',
                'nama' => 'TEKNIK KOMPILASI',
                'sks' => 2,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000004',
            ],
            [
                'kode' => '22TIF0443',
                'nama' => 'MOBILE PROGRAMMING',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000005',
            ],
            [
                'kode' => '22TIF0363',
                'nama' => 'BASIS DATA II',
                'sks' => 3,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000006',
            ],
            [
                'kode' => '22TIF0342',
                'nama' => 'TEKNOLOGI INTERNET OF THINGS',
                'sks' => 2,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000007',
            ],
            [
                'kode' => '22TIF0332',
                'nama' => 'KERJA PRAKTEK',
                'sks' => 2,
                'kelas' => '06TPLK004',
                'dosen_nidn' => '0498000008',
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
