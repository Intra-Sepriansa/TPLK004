<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Level;
use Illuminate\Database\Seeder;

class GamificationSeeder extends Seeder
{
    public function run(): void
    {
        // Create Levels (untuk user level, bukan badge level)
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

        // Create 12 Badges dengan Level 1-3 (EASY REQUIREMENTS - PROGRESSIVE VALUES)
        $badges = [
            // ============================================
            // BADGE 1: STREAK MASTER (Hadir berturut-turut)
            // ============================================
            [
                'code' => 'streak_master_1',
                'name' => 'Streak Master I',
                'description' => 'Hadir 3 hari berturut-turut',
                'icon' => 'streak_master.png',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'streak_days',
                'requirement_value' => 3,
            ],
            [
                'code' => 'streak_master_2',
                'name' => 'Streak Master II',
                'description' => 'Hadir 5 hari berturut-turut',
                'icon' => 'streak_master_2.png',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'streak_days',
                'requirement_value' => 5,
            ],
            [
                'code' => 'streak_master_3',
                'name' => 'Streak Master III',
                'description' => 'Hadir 10 hari berturut-turut',
                'icon' => 'streak_master_3.png',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'streak_days',
                'requirement_value' => 10,
            ],

            // ============================================
            // BADGE 2: PERFECT ATTENDANCE (Kehadiran sempurna)
            // ============================================
            [
                'code' => 'perfect_attendance_1',
                'name' => 'Perfect Attendance I',
                'description' => 'Kehadiran 100% dalam 3 sesi',
                'icon' => 'perfect_attendance.png',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'perfect_sessions',
                'requirement_value' => 3,
            ],
            [
                'code' => 'perfect_attendance_2',
                'name' => 'Perfect Attendance II',
                'description' => 'Kehadiran 100% dalam 7 sesi',
                'icon' => 'perfect_attendance_2.png',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'perfect_sessions',
                'requirement_value' => 7,
            ],
            [
                'code' => 'perfect_attendance_3',
                'name' => 'Perfect Attendance III',
                'description' => 'Kehadiran 100% dalam 14 sesi',
                'icon' => 'perfect_attendance_3.png',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'perfect_sessions',
                'requirement_value' => 14,
            ],

            // ============================================
            // BADGE 3: EARLY BIRD (Selalu hadir tepat waktu)
            // ============================================
            [
                'code' => 'early_bird_1',
                'name' => 'Early Bird I',
                'description' => 'Tidak terlambat dalam 3 sesi',
                'icon' => 'early_bird.png',
                'color' => 'sky',
                'category' => 'punctuality',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'on_time_sessions',
                'requirement_value' => 3,
            ],
            [
                'code' => 'early_bird_2',
                'name' => 'Early Bird II',
                'description' => 'Tidak terlambat dalam 7 sesi',
                'icon' => 'early_bird_2.png',
                'color' => 'sky',
                'category' => 'punctuality',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'on_time_sessions',
                'requirement_value' => 7,
            ],
            [
                'code' => 'early_bird_3',
                'name' => 'Early Bird III',
                'description' => 'Tidak terlambat dalam 15 sesi',
                'icon' => 'early_bird_3.png',
                'color' => 'sky',
                'category' => 'punctuality',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'on_time_sessions',
                'requirement_value' => 15,
            ],

            // ============================================
            // BADGE 4: CONSISTENT (Kehadiran konsisten)
            // ============================================
            [
                'code' => 'consistent_1',
                'name' => 'Consistent I',
                'description' => 'Total kehadiran 5 kali',
                'icon' => 'consistent.png',
                'color' => 'green',
                'category' => 'attendance',
                'points' => 75,
                'badge_level' => 1,
                'requirement_type' => 'total_present',
                'requirement_value' => 5,
            ],
            [
                'code' => 'consistent_2',
                'name' => 'Consistent II',
                'description' => 'Total kehadiran 10 kali',
                'icon' => 'consistent_2.png',
                'color' => 'green',
                'category' => 'attendance',
                'points' => 150,
                'badge_level' => 2,
                'requirement_type' => 'total_present',
                'requirement_value' => 10,
            ],
            [
                'code' => 'consistent_3',
                'name' => 'Consistent III',
                'description' => 'Total kehadiran 20 kali',
                'icon' => 'consistent_3.png',
                'color' => 'green',
                'category' => 'attendance',
                'points' => 300,
                'badge_level' => 3,
                'requirement_type' => 'total_present',
                'requirement_value' => 20,
            ],

            // ============================================
            // BADGE 5: CHAMPION (Top kehadiran di kelas)
            // ============================================
            [
                'code' => 'champion_1',
                'name' => 'Champion I',
                'description' => 'Masuk top 20 kehadiran di kelas',
                'icon' => 'champion.png',
                'color' => 'amber',
                'category' => 'leaderboard',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'leaderboard_rank',
                'requirement_value' => 20,
            ],
            [
                'code' => 'champion_2',
                'name' => 'Champion II',
                'description' => 'Masuk top 10 kehadiran di kelas',
                'icon' => 'champion_2.png',
                'color' => 'amber',
                'category' => 'leaderboard',
                'points' => 200,
                'badge_level' => 2,
                'requirement_type' => 'leaderboard_rank',
                'requirement_value' => 10,
            ],
            [
                'code' => 'champion_3',
                'name' => 'Champion III',
                'description' => 'Masuk top 3 kehadiran di kelas',
                'icon' => 'champion_3.png',
                'color' => 'amber',
                'category' => 'leaderboard',
                'points' => 400,
                'badge_level' => 3,
                'requirement_type' => 'leaderboard_rank',
                'requirement_value' => 3,
            ],

            // ============================================
            // BADGE 6: LEGEND (Pencapaian tertinggi)
            // ============================================
            [
                'code' => 'legend_1',
                'name' => 'Legend I',
                'description' => 'Unlock 2 badge lainnya',
                'icon' => 'legend.png',
                'color' => 'purple',
                'category' => 'special',
                'points' => 150,
                'badge_level' => 1,
                'requirement_type' => 'total_badges',
                'requirement_value' => 2,
            ],
            [
                'code' => 'legend_2',
                'name' => 'Legend II',
                'description' => 'Unlock 5 badge lainnya',
                'icon' => 'legend_2.png',
                'color' => 'purple',
                'category' => 'special',
                'points' => 300,
                'badge_level' => 2,
                'requirement_type' => 'total_badges',
                'requirement_value' => 5,
            ],
            [
                'code' => 'legend_3',
                'name' => 'Legend III',
                'description' => 'Unlock 10 badge lainnya',
                'icon' => 'legend_3.png',
                'color' => 'purple',
                'category' => 'special',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'total_badges',
                'requirement_value' => 10,
            ],

            // ============================================
            // BADGE 7: FIRST STEP (Langkah Pertama)
            // ============================================
            [
                'code' => 'first_step_1',
                'name' => 'First Step I',
                'description' => 'Berhasil absensi pertama kali',
                'icon' => 'first_step.png',
                'color' => 'teal',
                'category' => 'milestone',
                'points' => 25,
                'badge_level' => 1,
                'requirement_type' => 'total_attendance',
                'requirement_value' => 1,
            ],
            [
                'code' => 'first_step_2',
                'name' => 'First Step II',
                'description' => 'Berhasil absensi 5 kali',
                'icon' => 'first_step_2.png',
                'color' => 'teal',
                'category' => 'milestone',
                'points' => 75,
                'badge_level' => 2,
                'requirement_type' => 'total_attendance',
                'requirement_value' => 5,
            ],
            [
                'code' => 'first_step_3',
                'name' => 'First Step III',
                'description' => 'Berhasil absensi 15 kali',
                'icon' => 'first_step_3.png',
                'color' => 'teal',
                'category' => 'milestone',
                'points' => 150,
                'badge_level' => 3,
                'requirement_type' => 'total_attendance',
                'requirement_value' => 15,
            ],

            // ============================================
            // BADGE 8: AI VERIFIED (Verifikasi Wajah AI)
            // ============================================
            [
                'code' => 'ai_verified_1',
                'name' => 'AI Verified I',
                'description' => 'Lolos verifikasi wajah AI 3 kali',
                'icon' => 'ai_verified.png',
                'color' => 'cyan',
                'category' => 'technology',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'ai_verification',
                'requirement_value' => 3,
            ],
            [
                'code' => 'ai_verified_2',
                'name' => 'AI Verified II',
                'description' => 'Lolos verifikasi wajah AI 10 kali',
                'icon' => 'ai_verified_2.png',
                'color' => 'cyan',
                'category' => 'technology',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'ai_verification',
                'requirement_value' => 10,
            ],
            [
                'code' => 'ai_verified_3',
                'name' => 'AI Verified III',
                'description' => 'Lolos verifikasi wajah AI 25 kali',
                'icon' => 'ai_verified_3.png',
                'color' => 'cyan',
                'category' => 'technology',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'ai_verification',
                'requirement_value' => 25,
            ],

            // ============================================
            // BADGE 9: KAS HERO (Pembayaran Kas)
            // ============================================
            [
                'code' => 'kas_hero_1',
                'name' => 'Kas Hero I',
                'description' => 'Bayar kas tepat waktu 2 kali',
                'icon' => 'kas_hero.png',
                'color' => 'green',
                'category' => 'financial',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'kas_on_time',
                'requirement_value' => 2,
            ],
            [
                'code' => 'kas_hero_2',
                'name' => 'Kas Hero II',
                'description' => 'Bayar kas tepat waktu 5 kali',
                'icon' => 'kas_hero_2.png',
                'color' => 'green',
                'category' => 'financial',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'kas_on_time',
                'requirement_value' => 5,
            ],
            [
                'code' => 'kas_hero_3',
                'name' => 'Kas Hero III',
                'description' => 'Bayar kas tepat waktu 10 kali',
                'icon' => 'kas_hero_3.png',
                'color' => 'green',
                'category' => 'financial',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'kas_on_time',
                'requirement_value' => 10,
            ],

            // ============================================
            // BADGE 10: TASK MASTER (Pengumpulan Tugas)
            // ============================================
            [
                'code' => 'task_master_1',
                'name' => 'Task Master I',
                'description' => 'Kumpulkan 2 tugas tepat waktu',
                'icon' => 'task_master.png',
                'color' => 'blue',
                'category' => 'academic',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'task_on_time',
                'requirement_value' => 2,
            ],
            [
                'code' => 'task_master_2',
                'name' => 'Task Master II',
                'description' => 'Kumpulkan 5 tugas tepat waktu',
                'icon' => 'task_master_2.png',
                'color' => 'blue',
                'category' => 'academic',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'task_on_time',
                'requirement_value' => 5,
            ],
            [
                'code' => 'task_master_3',
                'name' => 'Task Master III',
                'description' => 'Kumpulkan 10 tugas tepat waktu',
                'icon' => 'task_master_3.png',
                'color' => 'blue',
                'category' => 'academic',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'task_on_time',
                'requirement_value' => 10,
            ],

            // ============================================
            // BADGE 11: SOCIAL STAR (Aktif di Komunitas)
            // ============================================
            [
                'code' => 'social_star_1',
                'name' => 'Social Star I',
                'description' => 'Ikut voting kas 2 kali',
                'icon' => 'social_star.png',
                'color' => 'pink',
                'category' => 'social',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'voting_participation',
                'requirement_value' => 2,
            ],
            [
                'code' => 'social_star_2',
                'name' => 'Social Star II',
                'description' => 'Ikut voting kas 5 kali',
                'icon' => 'social_star_2.png',
                'color' => 'pink',
                'category' => 'social',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'voting_participation',
                'requirement_value' => 5,
            ],
            [
                'code' => 'social_star_3',
                'name' => 'Social Star III',
                'description' => 'Ikut voting kas 10 kali',
                'icon' => 'social_star_3.png',
                'color' => 'pink',
                'category' => 'social',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'voting_participation',
                'requirement_value' => 10,
            ],

            // ============================================
            // BADGE 12: SPEED DEMON (Absen Tercepat)
            // ============================================
            [
                'code' => 'speed_demon_1',
                'name' => 'Speed Demon I',
                'description' => 'Absen dalam 1 menit pertama (2x)',
                'icon' => 'speed_demon.png',
                'color' => 'red',
                'category' => 'speed',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'fast_attendance',
                'requirement_value' => 2,
            ],
            [
                'code' => 'speed_demon_2',
                'name' => 'Speed Demon II',
                'description' => 'Absen dalam 1 menit pertama (5x)',
                'icon' => 'speed_demon_2.png',
                'color' => 'red',
                'category' => 'speed',
                'points' => 100,
                'badge_level' => 2,
                'requirement_type' => 'fast_attendance',
                'requirement_value' => 5,
            ],
            [
                'code' => 'speed_demon_3',
                'name' => 'Speed Demon III',
                'description' => 'Absen dalam 1 menit pertama (10x)',
                'icon' => 'speed_demon_3.png',
                'color' => 'red',
                'category' => 'speed',
                'points' => 200,
                'badge_level' => 3,
                'requirement_type' => 'fast_attendance',
                'requirement_value' => 10,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['code' => $badge['code']], $badge);
        }
    }
}
