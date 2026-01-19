<?php

namespace Database\Seeders;

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
        User::firstOrCreate(
            ['email' => 'intrasepriansaa@gmail.com'],
            [
                'name' => 'Admin TPLK004',
                'password' => Hash::make('intra12345'),
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
        $dosen = [
            ['id' => 1, 'nama' => 'SANTI RAHAYU S.KOM., M.KOM.', 'nidn' => '0401018901', 'email' => 'santi.rahayu@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 2, 'nama' => 'INES HEIDIANI IKASARI S.SI., M.KOM.', 'nidn' => '0402018902', 'email' => 'ines.heidiani@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 3, 'nama' => 'OKTA IRAWATI S.KOM., M.KOM.', 'nidn' => '0403018903', 'email' => 'okta.irawati@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 4, 'nama' => 'ANDIN EKA SAFITRI S.KOM., M.KOM.', 'nidn' => '0404018904', 'email' => 'andin.eka@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 5, 'nama' => 'GALUH SAPUTRI S.KOM., M.KOM.', 'nidn' => '0405018905', 'email' => 'galuh.saputri@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 6, 'nama' => 'HADI ZAKARIA S.KOM., M.KOM., M.M.', 'nidn' => '0406018906', 'email' => 'hadi.zakaria@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 7, 'nama' => 'YULIANA S.KOM., M.KOM.', 'nidn' => '0407018907', 'email' => 'yuliana@unpam.ac.id', 'password' => Hash::make('dosen123')],
            ['id' => 8, 'nama' => 'IR. TRI PRASETYO S.KOM., S.T., M.KOM.', 'nidn' => '0408018908', 'email' => 'tri.prasetyo@unpam.ac.id', 'password' => Hash::make('dosen123')],
        ];

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
        $mahasiswa = [
            ['id' => 1, 'nama' => 'ABDUL FATTAH KHOLD', 'nim' => '221011401476', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 2, 'nama' => 'ABDUR ROSYID AMRULLAH', 'nim' => '231011401412', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 3, 'nama' => 'ABU BAKAR RIZIQ', 'nim' => '231011402235', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 4, 'nama' => 'ACHMAD ILLYYIN ABDULLAH', 'nim' => '231011402363', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 5, 'nama' => 'ADRIAN POSMAN IMANUEL', 'nim' => '231011402036', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 6, 'nama' => 'AHMAD DANI FADHLIANSYAH', 'nim' => '231011401524', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 7, 'nama' => 'AHMAD FADILLAH', 'nim' => '231011400490', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 8, 'nama' => 'ALIF AZHAR', 'nim' => '231011402879', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 9, 'nama' => 'ANDRIANTO', 'nim' => '231011401396', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 10, 'nama' => 'DANANG ARDIANSYAH', 'nim' => '231011401410', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 11, 'nama' => 'DEFRY SULAEMAN', 'nim' => '231011400477', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 12, 'nama' => 'EDELTRUDIS KUE', 'nim' => '231011401624', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 13, 'nama' => 'FAHMMI FRMANSYAH', 'nim' => '231011401250', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 14, 'nama' => 'GUMILANG ALI PRAYOGI', 'nim' => '231011401944', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 15, 'nama' => 'HARIS USMAN', 'nim' => '231011401637', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 16, 'nama' => 'MANZIS ILHAM MAULANA', 'nim' => '231011400553', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 17, 'nama' => 'MUHAMAD HARRI FADILAH', 'nim' => '231011401636', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 18, 'nama' => 'MUHAMMAD ADAM FADILAH', 'nim' => '231011401768', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 19, 'nama' => 'MUHAMMAD REZA PRASETYA', 'nim' => '231011400533', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 20, 'nama' => 'NABILA PUTRI CANDRA', 'nim' => '231011400526', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 21, 'nama' => 'NADIRA MATONDANG', 'nim' => '231011400809', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 22, 'nama' => 'RANGGA PRIMADILLAH', 'nim' => '231011401595', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 23, 'nama' => 'RIVALDI PRATAMA KURNIA', 'nim' => '231011401394', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 24, 'nama' => 'SALM MAULA AMRULLAH', 'nim' => '231011401365', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 25, 'nama' => 'SELVIANTI', 'nim' => '231011401422', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 26, 'nama' => 'SERINA ADIMI YULIANA', 'nim' => '231011400434', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 27, 'nama' => 'WILDAN HAMDI ALI', 'nim' => '231011400729', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 28, 'nama' => 'WILLY ALUA RAHMAN', 'nim' => '231011400484', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 29, 'nama' => 'YAN INDAH SURYA LAOWO', 'nim' => '231011402976', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 30, 'nama' => 'ZAHRA CHOIRUNNISA', 'nim' => '231011400067', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 31, 'nama' => 'INTRA SEPRIANSA', 'nim' => '231011400463', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
            ['id' => 32, 'nama' => 'SALSA NABILA', 'nim' => '231011400432', 'fakultas' => 'Teknik', 'kelas' => 'TI-6A'],
        ];

        foreach ($mahasiswa as $mhs) {
            // Generate password: tplk004# + last 2 digits of NIM
            $lastTwoDigits = substr($mhs['nim'], -2);
            $password = 'tplk004#' . $lastTwoDigits;

            DB::table('mahasiswa')->updateOrInsert(
                ['id' => $mhs['id']],
                [
                    'nama' => $mhs['nama'],
                    'nim' => $mhs['nim'],
                    'fakultas' => $mhs['fakultas'],
                    'kelas' => $mhs['kelas'],
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
