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

        // Create 12 Badges dengan Level 1-3
        $badges = [
            // ============================================
            // BADGE 1: STREAK MASTER (Hadir berturut-turut)
            // ============================================
            [
                'code' => 'streak_master_1',
                'name' => 'Streak Master I',
                'description' => 'Hadir 7 hari berturut-turut tanpa absen',
                'icon' => 'streak_master.png',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'streak_days',
                'requirement_value' => 7,
            ],
            [
                'code' => 'streak_master_2',
                'name' => 'Streak Master II',
                'description' => 'Hadir 14 hari berturut-turut tanpa absen',
                'icon' => 'streak_master.png',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 200,
                'badge_level' => 2,
                'requirement_type' => 'streak_days',
                'requirement_value' => 14,
            ],
            [
                'code' => 'streak_master_3',
                'name' => 'Streak Master III',
                'description' => 'Hadir 30 hari berturut-turut tanpa absen',
                'icon' => 'streak_master.png',
                'color' => 'orange',
                'category' => 'streak',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'streak_days',
                'requirement_value' => 30,
            ],

            // ============================================
            // BADGE 2: PERFECT ATTENDANCE (Kehadiran sempurna)
            // ============================================
            [
                'code' => 'perfect_attendance_1',
                'name' => 'Perfect Attendance I',
                'description' => 'Kehadiran sempurna dalam 1 minggu (100%)',
                'icon' => 'perfect_attendance.png',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'attendance_percentage',
                'requirement_value' => 100,
            ],
            [
                'code' => 'perfect_attendance_2',
                'name' => 'Perfect Attendance II',
                'description' => 'Kehadiran sempurna dalam 1 bulan (100%)',
                'icon' => 'perfect_attendance.png',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 200,
                'badge_level' => 2,
                'requirement_type' => 'attendance_percentage_month',
                'requirement_value' => 100,
            ],
            [
                'code' => 'perfect_attendance_3',
                'name' => 'Perfect Attendance III',
                'description' => 'Kehadiran sempurna dalam 1 semester (100%)',
                'icon' => 'perfect_attendance.png',
                'color' => 'emerald',
                'category' => 'attendance',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'attendance_percentage_semester',
                'requirement_value' => 100,
            ],

            // ============================================
            // BADGE 3: EARLY BIRD (Selalu hadir tepat waktu)
            // ============================================
            [
                'code' => 'early_bird_1',
                'name' => 'Early Bird I',
                'description' => 'Tidak pernah terlambat dalam 10 sesi',
                'icon' => 'early_bird.png',
                'color' => 'sky',
                'category' => 'punctuality',
                'points' => 150,
                'badge_level' => 1,
                'requirement_type' => 'on_time_sessions',
                'requirement_value' => 10,
            ],
            [
                'code' => 'early_bird_2',
                'name' => 'Early Bird II',
                'description' => 'Tidak pernah terlambat dalam 30 sesi',
                'icon' => 'early_bird.png',
                'color' => 'sky',
                'category' => 'punctuality',
                'points' => 300,
                'badge_level' => 2,
                'requirement_type' => 'on_time_sessions',
                'requirement_value' => 30,
            ],
            [
                'code' => 'early_bird_3',
                'name' => 'Early Bird III',
                'description' => 'Tidak pernah terlambat dalam 100 sesi',
                'icon' => 'early_bird.png',
                'color' => 'sky',
                'category' => 'punctuality',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'on_time_sessions',
                'requirement_value' => 100,
            ],

            // ============================================
            // BADGE 4: CONSISTENT (Kehadiran konsisten >80%)
            // ============================================
            [
                'code' => 'consistent_1',
                'name' => 'Consistent I',
                'description' => 'Pertahankan kehadiran >80% selama 1 bulan',
                'icon' => 'consistent.png',
                'color' => 'green',
                'category' => 'attendance',
                'points' => 250,
                'badge_level' => 1,
                'requirement_type' => 'consistent_month',
                'requirement_value' => 80,
            ],
            [
                'code' => 'consistent_2',
                'name' => 'Consistent II',
                'description' => 'Pertahankan kehadiran >80% selama 3 bulan',
                'icon' => 'consistent.png',
                'color' => 'green',
                'category' => 'attendance',
                'points' => 400,
                'badge_level' => 2,
                'requirement_type' => 'consistent_quarter',
                'requirement_value' => 80,
            ],
            [
                'code' => 'consistent_3',
                'name' => 'Consistent III',
                'description' => 'Pertahankan kehadiran >80% selama 1 semester',
                'icon' => 'consistent.png',
                'color' => 'green',
                'category' => 'attendance',
                'points' => 600,
                'badge_level' => 3,
                'requirement_type' => 'consistent_semester',
                'requirement_value' => 80,
            ],

            // ============================================
            // BADGE 5: CHAMPION (Top 10 kehadiran di kelas)
            // ============================================
            [
                'code' => 'champion_1',
                'name' => 'Champion I',
                'description' => 'Masuk top 10 kehadiran di kelas',
                'icon' => 'champion.png',
                'color' => 'amber',
                'category' => 'leaderboard',
                'points' => 300,
                'badge_level' => 1,
                'requirement_type' => 'leaderboard_rank',
                'requirement_value' => 10,
            ],
            [
                'code' => 'champion_2',
                'name' => 'Champion II',
                'description' => 'Masuk top 5 kehadiran di kelas',
                'icon' => 'champion.png',
                'color' => 'amber',
                'category' => 'leaderboard',
                'points' => 450,
                'badge_level' => 2,
                'requirement_type' => 'leaderboard_rank',
                'requirement_value' => 5,
            ],
            [
                'code' => 'champion_3',
                'name' => 'Champion III',
                'description' => 'Peringkat #1 kehadiran di kelas',
                'icon' => 'champion.png',
                'color' => 'amber',
                'category' => 'leaderboard',
                'points' => 700,
                'badge_level' => 3,
                'requirement_type' => 'leaderboard_rank',
                'requirement_value' => 1,
            ],

            // ============================================
            // BADGE 6: LEGEND (Pencapaian tertinggi)
            // ============================================
            [
                'code' => 'legend_1',
                'name' => 'Legend I',
                'description' => 'Unlock 3 achievement lainnya',
                'icon' => 'legend.png',
                'color' => 'purple',
                'category' => 'special',
                'points' => 500,
                'badge_level' => 1,
                'requirement_type' => 'total_badges',
                'requirement_value' => 3,
            ],
            [
                'code' => 'legend_2',
                'name' => 'Legend II',
                'description' => 'Unlock 6 achievement lainnya',
                'icon' => 'legend.png',
                'color' => 'purple',
                'category' => 'special',
                'points' => 750,
                'badge_level' => 2,
                'requirement_type' => 'total_badges',
                'requirement_value' => 6,
            ],
            [
                'code' => 'legend_3',
                'name' => 'Legend III',
                'description' => 'Unlock semua achievement (Master of All)',
                'icon' => 'legend.png',
                'color' => 'purple',
                'category' => 'special',
                'points' => 1000,
                'badge_level' => 3,
                'requirement_type' => 'total_badges',
                'requirement_value' => 12,
            ],

            // ============================================
            // BADGE 7: FIRST STEP (Langkah Pertama) - NEW!
            // ============================================
            [
                'code' => 'first_step_1',
                'name' => 'First Step I',
                'description' => 'Berhasil melakukan absensi pertama kali',
                'icon' => 'first_step.png',
                'color' => 'teal',
                'category' => 'milestone',
                'points' => 50,
                'badge_level' => 1,
                'requirement_type' => 'total_attendance',
                'requirement_value' => 1,
            ],
            [
                'code' => 'first_step_2',
                'name' => 'First Step II',
                'description' => 'Berhasil melakukan 25 kali absensi',
                'icon' => 'first_step.png',
                'color' => 'teal',
                'category' => 'milestone',
                'points' => 150,
                'badge_level' => 2,
                'requirement_type' => 'total_attendance',
                'requirement_value' => 25,
            ],
            [
                'code' => 'first_step_3',
                'name' => 'First Step III',
                'description' => 'Berhasil melakukan 100 kali absensi',
                'icon' => 'first_step.png',
                'color' => 'teal',
                'category' => 'milestone',
                'points' => 400,
                'badge_level' => 3,
                'requirement_type' => 'total_attendance',
                'requirement_value' => 100,
            ],

            // ============================================
            // BADGE 8: AI VERIFIED (Verifikasi Wajah AI) - NEW!
            // ============================================
            [
                'code' => 'ai_verified_1',
                'name' => 'AI Verified I',
                'description' => 'Lolos verifikasi wajah AI 10 kali',
                'icon' => 'ai_verified.png',
                'color' => 'cyan',
                'category' => 'technology',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'ai_verification',
                'requirement_value' => 10,
            ],
            [
                'code' => 'ai_verified_2',
                'name' => 'AI Verified II',
                'description' => 'Lolos verifikasi wajah AI 50 kali',
                'icon' => 'ai_verified.png',
                'color' => 'cyan',
                'category' => 'technology',
                'points' => 250,
                'badge_level' => 2,
                'requirement_type' => 'ai_verification',
                'requirement_value' => 50,
            ],
            [
                'code' => 'ai_verified_3',
                'name' => 'AI Verified III',
                'description' => 'Lolos verifikasi wajah AI 100 kali',
                'icon' => 'ai_verified.png',
                'color' => 'cyan',
                'category' => 'technology',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'ai_verification',
                'requirement_value' => 100,
            ],

            // ============================================
            // BADGE 9: KAS HERO (Pembayaran Kas) - NEW!
            // ============================================
            [
                'code' => 'kas_hero_1',
                'name' => 'Kas Hero I',
                'description' => 'Bayar kas tepat waktu 4 minggu berturut-turut',
                'icon' => 'kas_hero.png',
                'color' => 'green',
                'category' => 'financial',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'kas_on_time',
                'requirement_value' => 4,
            ],
            [
                'code' => 'kas_hero_2',
                'name' => 'Kas Hero II',
                'description' => 'Bayar kas tepat waktu 12 minggu berturut-turut',
                'icon' => 'kas_hero.png',
                'color' => 'green',
                'category' => 'financial',
                'points' => 250,
                'badge_level' => 2,
                'requirement_type' => 'kas_on_time',
                'requirement_value' => 12,
            ],
            [
                'code' => 'kas_hero_3',
                'name' => 'Kas Hero III',
                'description' => 'Tidak pernah nunggak kas selama 1 semester',
                'icon' => 'kas_hero.png',
                'color' => 'green',
                'category' => 'financial',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'kas_on_time',
                'requirement_value' => 24,
            ],

            // ============================================
            // BADGE 10: TASK MASTER (Pengumpulan Tugas) - NEW!
            // ============================================
            [
                'code' => 'task_master_1',
                'name' => 'Task Master I',
                'description' => 'Kumpulkan 5 tugas tepat waktu',
                'icon' => 'task_master.png',
                'color' => 'blue',
                'category' => 'academic',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'task_on_time',
                'requirement_value' => 5,
            ],
            [
                'code' => 'task_master_2',
                'name' => 'Task Master II',
                'description' => 'Kumpulkan 15 tugas tepat waktu',
                'icon' => 'task_master.png',
                'color' => 'blue',
                'category' => 'academic',
                'points' => 250,
                'badge_level' => 2,
                'requirement_type' => 'task_on_time',
                'requirement_value' => 15,
            ],
            [
                'code' => 'task_master_3',
                'name' => 'Task Master III',
                'description' => 'Kumpulkan semua tugas tepat waktu dalam 1 semester',
                'icon' => 'task_master.png',
                'color' => 'blue',
                'category' => 'academic',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'task_on_time',
                'requirement_value' => 30,
            ],

            // ============================================
            // BADGE 11: SOCIAL STAR (Aktif di Komunitas) - NEW!
            // ============================================
            [
                'code' => 'social_star_1',
                'name' => 'Social Star I',
                'description' => 'Ikut voting kas 5 kali',
                'icon' => 'social_star.png',
                'color' => 'pink',
                'category' => 'social',
                'points' => 75,
                'badge_level' => 1,
                'requirement_type' => 'voting_participation',
                'requirement_value' => 5,
            ],
            [
                'code' => 'social_star_2',
                'name' => 'Social Star II',
                'description' => 'Ikut voting kas 15 kali & aktif di diskusi',
                'icon' => 'social_star.png',
                'color' => 'pink',
                'category' => 'social',
                'points' => 200,
                'badge_level' => 2,
                'requirement_type' => 'voting_participation',
                'requirement_value' => 15,
            ],
            [
                'code' => 'social_star_3',
                'name' => 'Social Star III',
                'description' => 'Kontributor aktif komunitas kelas',
                'icon' => 'social_star.png',
                'color' => 'pink',
                'category' => 'social',
                'points' => 400,
                'badge_level' => 3,
                'requirement_type' => 'voting_participation',
                'requirement_value' => 30,
            ],

            // ============================================
            // BADGE 12: SPEED DEMON (Absen Tercepat) - NEW!
            // ============================================
            [
                'code' => 'speed_demon_1',
                'name' => 'Speed Demon I',
                'description' => 'Absen dalam 1 menit pertama sesi dibuka (5x)',
                'icon' => 'speed_demon.png',
                'color' => 'red',
                'category' => 'speed',
                'points' => 100,
                'badge_level' => 1,
                'requirement_type' => 'fast_attendance',
                'requirement_value' => 5,
            ],
            [
                'code' => 'speed_demon_2',
                'name' => 'Speed Demon II',
                'description' => 'Absen dalam 1 menit pertama sesi dibuka (15x)',
                'icon' => 'speed_demon.png',
                'color' => 'red',
                'category' => 'speed',
                'points' => 250,
                'badge_level' => 2,
                'requirement_type' => 'fast_attendance',
                'requirement_value' => 15,
            ],
            [
                'code' => 'speed_demon_3',
                'name' => 'Speed Demon III',
                'description' => 'Absen dalam 1 menit pertama sesi dibuka (30x)',
                'icon' => 'speed_demon.png',
                'color' => 'red',
                'category' => 'speed',
                'points' => 500,
                'badge_level' => 3,
                'requirement_type' => 'fast_attendance',
                'requirement_value' => 30,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['code' => $badge['code']], $badge);
        }
    }
}
