<?php

namespace Database\Seeders;

use App\Support\CredentialDefaults;
use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🔄 Starting complete data restoration...');

        // 1. Create Admin User
        $this->command->info('1️⃣ Creating admin user...');
        $adminEmail = CredentialDefaults::adminSeedEmail();
        $adminPassword = CredentialDefaults::adminSeedPassword();
        User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin TPLK004',
                'password' => Hash::make($adminPassword),
                'email_verified_at' => now(),
            ]
        );
        $this->command->info('✅ Admin user created');

        // 2. Seed Settings
        $this->command->info('2️⃣ Seeding settings...');
        $this->call([
            SettingsSeeder::class,
        ]);
        $this->command->info('✅ Settings seeded');

        // 3. Seed Dosen
        $this->command->info('3️⃣ Seeding dosen...');
        $this->seedDosen();
        $this->command->info('✅ Dosen seeded');

        // 4. Seed Mata Kuliah
        $this->command->info('4️⃣ Seeding mata kuliah...');
        $this->seedMataKuliah();
        $this->command->info('✅ Mata kuliah seeded');

        // 5. Seed Mahasiswa
        $this->command->info('5️⃣ Seeding mahasiswa...');
        $this->seedMahasiswa();
        $this->command->info('✅ Mahasiswa seeded');

        // 6. Seed Pertemuan
        $this->command->info('6️⃣ Seeding pertemuan...');
        $this->seedPertemuan();
        $this->command->info('✅ Pertemuan seeded');

        // 7. Seed Help Data
        $this->command->info('7️⃣ Seeding help data...');
        $this->call([
            HelpDataSeeder::class,
        ]);
        $this->command->info('✅ Help data seeded');

        // 8. Seed Gamification Data
        $this->command->info('8️⃣ Seeding gamification data...');
        $this->call([
            GamificationSeeder::class,
        ]);
        $this->command->info('✅ Gamification data seeded');

        $this->command->info('🎉 Complete data restoration finished!');
    }

    private function seedDosen(): void
    {
        $defaultDosenPassword = CredentialDefaults::dosenSeedPassword();
        $dosen = [];
        for ($id = 1; $id <= 8; $id++) {
            $dosen[] = [
                'id' => $id,
                'nama' => sprintf('DOSEN AKADEMIK %02d', $id),
                'nidn' => sprintf('049800%04d', $id),
                'email' => sprintf('dosen%02d@example.test', $id),
                'password' => Hash::make($defaultDosenPassword),
            ];
        }

        foreach ($dosen as $d) {
            DB::table('dosen')->updateOrInsert(
                ['id' => $d['id']],
                $d
            );
        }
    }

    private function seedMataKuliah(): void
    {
        $mataKuliah = [
            ['id' => 1, 'nama' => 'KECERDASAN BUATAN', 'sks' => 3, 'dosen_id' => 1],
            ['id' => 2, 'nama' => 'SISTEM INFORMASI MANAJEMEN', 'sks' => 2, 'dosen_id' => 2],
            ['id' => 3, 'nama' => 'PENGOLAHAN CITRA DIGITAL', 'sks' => 2, 'dosen_id' => 3],
            ['id' => 4, 'nama' => 'TEKNIK RISET OPERASIONAL', 'sks' => 2, 'dosen_id' => 4],
            ['id' => 5, 'nama' => 'PEMROGRAMAN WEB I', 'sks' => 3, 'dosen_id' => 5],
            ['id' => 6, 'nama' => 'METODE PENELITIAN', 'sks' => 3, 'dosen_id' => 6],
            ['id' => 7, 'nama' => 'DIGITAL ENTREPRENEURSHIP', 'sks' => 2, 'dosen_id' => 7],
            ['id' => 8, 'nama' => 'MACHINE LEARNING', 'sks' => 3, 'dosen_id' => 8],
        ];

        foreach ($mataKuliah as $mk) {
            DB::table('mata_kuliah')->updateOrInsert(
                ['id' => $mk['id']],
                $mk
            );
        }
    }

    private function seedMahasiswa(): void
    {
        $mahasiswa = [];
        for ($id = 2; $id <= 32; $id++) {
            $mahasiswa[] = [
                'id' => $id,
                'nama' => sprintf('MAHASISWA %02d', $id),
                'nim' => sprintf('2399004%05d', $id),
                'fakultas' => 'Teknik',
                'kelas' => '06TPLK004',
            ];
        }

        foreach ($mahasiswa as $mhs) {
            $password = CredentialDefaults::mahasiswaDefaultPassword($mhs['nim']);

            DB::table('mahasiswa')->updateOrInsert(
                ['id' => $mhs['id']],
                [
                    'nama' => $mhs['nama'],
                    'nim' => $mhs['nim'],
                    'fakultas' => $mhs['fakultas'],
                    'kelas' => $mhs['kelas'],
                    'jenis_kelamin' => (rand(0, 1) == 1) ? 'L' : 'P',
                    'password' => Hash::make($password),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    private function seedPertemuan(): void
    {
        // Pertemuan untuk setiap mata kuliah
        $pertemuanData = [
            1 => 21, // KECERDASAN BUATAN - 21 pertemuan (3 SKS)
            2 => 14, // SISTEM INFORMASI MANAJEMEN - 14 pertemuan (2 SKS)
            3 => 14, // PENGOLAHAN CITRA DIGITAL - 14 pertemuan (2 SKS)
            4 => 14, // TEKNIK RISET OPERASIONAL - 14 pertemuan (2 SKS)
            5 => 21, // PEMROGRAMAN WEB I - 21 pertemuan (3 SKS)
            6 => 21, // METODE PENELITIAN - 21 pertemuan (3 SKS)
            7 => 14, // DIGITAL ENTREPRENEURSHIP - 14 pertemuan (2 SKS)
            8 => 21, // MACHINE LEARNING - 21 pertemuan (3 SKS)
        ];

        foreach ($pertemuanData as $mataKuliahId => $jumlahPertemuan) {
            for ($i = 1; $i <= $jumlahPertemuan; $i++) {
                DB::table('pertemuan')->updateOrInsert(
                    ['mata_kuliah_id' => $mataKuliahId, 'pertemuan_ke' => $i],
                    [
                        'tanggal' => null,
                        'topik' => null,
                        'status' => 'BELUM',
                    ]
                );
            }
        }
    }
}
