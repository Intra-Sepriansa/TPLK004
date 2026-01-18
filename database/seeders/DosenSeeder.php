<?php

namespace Database\Seeders;

use App\Models\Dosen;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DosenSeeder extends Seeder
{
    public function run(): void
    {
        $dosens = [
            [
                'nama' => 'Dr. Ahmad Fauzi, M.Kom',
                'nidn' => '0412018901',
                'email' => 'ahmad.fauzi@unpam.ac.id',
                'phone' => '081234567890',
                'password' => Hash::make('password'),
                'is_active' => true,
            ],
            [
                'nama' => 'Dr. Siti Nurhaliza, M.T',
                'nidn' => '0415028902',
                'email' => 'siti.nurhaliza@unpam.ac.id',
                'phone' => '081234567891',
                'password' => Hash::make('password'),
                'is_active' => true,
            ],
            [
                'nama' => 'Prof. Budi Santoso, Ph.D',
                'nidn' => '0420038903',
                'email' => 'budi.santoso@unpam.ac.id',
                'phone' => '081234567892',
                'password' => Hash::make('password'),
                'is_active' => true,
            ],
        ];

        foreach ($dosens as $dosen) {
            Dosen::create($dosen);
        }

        $this->command->info('Dosen seeded successfully!');
    }
}
