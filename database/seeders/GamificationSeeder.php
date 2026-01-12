<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Level;
use Illuminate\Database\Seeder;

class GamificationSeeder extends Seeder
{
    public function run(): void
    {
        // Create Levels
        $levels = [
            ['level_number' => 1, 'name' => 'Pemula', 'min_points' => 0, 'max_points' => 99, 'icon' => '🌱', 'color' => 'gray'],
            ['level_number' => 2, 'name' => 'Pelajar', 'min_points' => 100, 'max_points' => 299, 'icon' => '📚', 'color' => 'green'],
            ['level_number' => 3, 'name' => 'Rajin', 'min_points' => 300, 'max_points' => 599, 'icon' => '⭐', 'color' => 'blue'],
            ['level_number' => 4, 'name' => 'Teladan', 'min_points' => 600, 'max_points' => 999, 'icon' => '🏆', 'color' => 'purple'],
            ['level_number' => 5, 'name' => 'Master', 'min_points' => 1000, 'max_points' => 1999, 'icon' => '👑', 'color' => 'yellow'],
            ['level_number' => 6, 'name' => 'Legend', 'min_points' => 2000, 'max_points' => 999999, 'icon' => '💎', 'color' => 'red'],
        ];

        foreach ($levels as $level) {
            Level::updateOrCreate(['level_number' => $level['level_number']], $level);
        }

        // Create Badges
        $badges = [
            // Attendance Badges
            [
                'code' => 'first_attendance',
                'name' => 'Langkah Pertama',
                'description' => 'Berhasil melakukan absensi pertama kali',
                'icon' => '👣',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 10,
            ],
            [
                'code' => 'perfect_week',
                'name' => 'Minggu Sempurna',
                'description' => 'Hadir penuh selama 1 minggu',
                'icon' => '🌟',
                'color' => 'yellow',
                'category' => 'attendance',
                'points' => 50,
            ],
            [
                'code' => 'perfect_month',
                'name' => 'Bulan Sempurna',
                'description' => 'Hadir penuh selama 1 bulan',
                'icon' => '🏅',
                'color' => 'amber',
                'category' => 'attendance',
                'points' => 200,
            ],
            [
                'code' => 'perfect_semester',
                'name' => 'Semester Sempurna',
                'description' => 'Hadir penuh selama 1 semester',
                'icon' => '🎖️',
                'color' => 'orange',
                'category' => 'attendance',
                'points' => 500,
            ],
            
            // Streak Badges
            [
                'code' => 'streak_3',
                'name' => 'Konsisten',
                'description' => 'Hadir 3 hari berturut-turut',
                'icon' => '🔥',
                'color' => 'red',
                'category' => 'streak',
                'points' => 15,
            ],
            [
                'code' => 'streak_7',
                'name' => 'Semangat Membara',
                'description' => 'Hadir 7 hari berturut-turut',
                'icon' => '💪',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 50,
            ],
            [
                'code' => 'streak_14',
                'name' => 'Tak Terbendung',
                'description' => 'Hadir 14 hari berturut-turut',
                'icon' => '⚡',
                'color' => 'yellow',
                'category' => 'streak',
                'points' => 100,
            ],
            [
                'code' => 'streak_30',
                'name' => 'Legenda Kehadiran',
                'description' => 'Hadir 30 hari berturut-turut',
                'icon' => '👑',
                'color' => 'purple',
                'category' => 'streak',
                'points' => 300,
            ],
            
            // Achievement Badges
            [
                'code' => 'early_bird',
                'name' => 'Early Bird',
                'description' => 'Absen pertama di kelas 10 kali',
                'icon' => '🐦',
                'color' => 'sky',
                'category' => 'achievement',
                'points' => 75,
            ],
            [
                'code' => 'kas_lunas',
                'name' => 'Warga Baik',
                'description' => 'Tidak pernah nunggak kas selama 1 bulan',
                'icon' => '💰',
                'color' => 'green',
                'category' => 'achievement',
                'points' => 50,
            ],
            [
                'code' => 'task_master',
                'name' => 'Task Master',
                'description' => 'Mengumpulkan semua tugas tepat waktu',
                'icon' => '📝',
                'color' => 'blue',
                'category' => 'achievement',
                'points' => 100,
            ],
            [
                'code' => 'top_scorer',
                'name' => 'Top Scorer',
                'description' => 'Masuk top 3 leaderboard bulanan',
                'icon' => '🥇',
                'color' => 'amber',
                'category' => 'achievement',
                'points' => 150,
            ],
            
            // Special Badges
            [
                'code' => 'founding_member',
                'name' => 'Founding Member',
                'description' => 'Pengguna pertama sistem absensi',
                'icon' => '🎯',
                'color' => 'indigo',
                'category' => 'special',
                'points' => 100,
            ],
            [
                'code' => 'helpful',
                'name' => 'Si Penolong',
                'description' => 'Aktif membantu teman di forum diskusi',
                'icon' => '🤝',
                'color' => 'pink',
                'category' => 'special',
                'points' => 50,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['code' => $badge['code']], $badge);
        }
    }
}
