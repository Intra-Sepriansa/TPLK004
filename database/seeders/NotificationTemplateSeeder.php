<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Reminder Absensi',
                'slug' => 'reminder_absensi',
                'type' => 'email',
                'subject' => '⏰ Jangan Lupa Absen!',
                'body' => "Halo {{name}},\n\nKelas {{course_name}} akan segera dimulai. Pastikan kamu sudah siap untuk absen.\n\nSalam,\nAdmin",
                'variables' => ['name' => 'Nama Mahasiswa', 'course_name' => 'Mata Kuliah'],
                'is_active' => true,
            ],
            [
                'name' => 'Peringatan Kehadiran',
                'slug' => 'peringatan_kehadiran',
                'type' => 'email',
                'subject' => '⚠️ Peringatan Kehadiran',
                'body' => "Halo {{name}},\n\nKehadiran kamu untuk mata kuliah {{course_name}} sudah mendekati batas minimum. Harap tingkatkan kehadiran.\n\nSalam,\nAdmin",
                'variables' => ['name' => 'Nama Mahasiswa', 'course_name' => 'Mata Kuliah'],
                'is_active' => true,
            ],
            [
                'name' => 'Maintenance Sistem',
                'slug' => 'maintenance_sistem',
                'type' => 'email',
                'subject' => '🔧 Maintenance Sistem',
                'body' => "Halo {{name}},\n\nSistem akan mengalami maintenance pada {{date}}. Mohon maaf atas ketidaknyamanannya.\n\nSalam,\nAdmin",
                'variables' => ['name' => 'Nama Mahasiswa', 'date' => 'Tanggal Maintenance'],
                'is_active' => true,
            ],
            [
                'name' => 'Daily Report',
                'slug' => 'daily_report',
                'type' => 'email',
                'subject' => '📊 Laporan Harian Absensi',
                'body' => "Halo Admin,\n\nBerikut laporan harian absensi tanggal {{date}}.\nTotal Hadir: {{total_hadir}}\nTotal Terlambat: {{total_terlambat}}\nTotal Alpa: {{total_alpa}}\n\nSalam,\nSistem",
                'variables' => ['date' => 'Tanggal', 'total_hadir' => 'Total Hadir', 'total_terlambat' => 'Total Terlambat', 'total_alpa' => 'Total Alpa'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            NotificationTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}
