<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\AttendanceLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class BadgeService
{
    /**
     * Check and award badges for a mahasiswa
     * This should be called after successful attendance
     */
    public static function checkAndAwardBadges(int $mahasiswaId): array
    {
        $awardedBadges = [];
        
        // Get attendance logs
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)->get();
        
        // Calculate stats
        $stats = self::calculateStats($logs);
        
        // Check each badge type
        $awardedBadges = array_merge($awardedBadges, self::checkStreakBadges($mahasiswaId, $stats));
        $awardedBadges = array_merge($awardedBadges, self::checkPerfectAttendanceBadges($mahasiswaId, $stats, $logs));
        $awardedBadges = array_merge($awardedBadges, self::checkEarlyBirdBadges($mahasiswaId, $stats));
        $awardedBadges = array_merge($awardedBadges, self::checkConsistentBadges($mahasiswaId, $stats));
        $awardedBadges = array_merge($awardedBadges, self::checkFirstStepBadges($mahasiswaId, $stats));
        $awardedBadges = array_merge($awardedBadges, self::checkAiVerifiedBadges($mahasiswaId, $logs));
        $awardedBadges = array_merge($awardedBadges, self::checkLegendBadges($mahasiswaId));
        
        return $awardedBadges;
    }
    
    /**
     * Calculate attendance statistics
     */
    private static function calculateStats($logs): array
    {
        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $presentCount = $logs->where('status', 'present')->count();
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;
        
        // Calculate current streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;
        $lastDate = null;
        
        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $logDate = $log->scanned_at?->format('Y-m-d');
                if ($lastDate === null || $lastDate === $logDate) {
                    $tempStreak++;
                } elseif ($lastDate && Carbon::parse($lastDate)->subDay()->format('Y-m-d') === $logDate) {
                    $tempStreak++;
                } else {
                    $longestStreak = max($longestStreak, $tempStreak);
                    $tempStreak = 1;
                }
                $lastDate = $logDate;
            } else {
                $longestStreak = max($longestStreak, $tempStreak);
                $tempStreak = 0;
                $lastDate = null;
            }
        }
        $longestStreak = max($longestStreak, $tempStreak);
        $currentStreak = $tempStreak;
        
        return [
            'totalAttendance' => $totalAttendance,
            'totalSessions' => $totalSessions,
            'attendanceRate' => $attendanceRate,
            'presentCount' => $presentCount,
            'onTimeRate' => $onTimeRate,
            'currentStreak' => $currentStreak,
            'longestStreak' => $longestStreak,
        ];
    }
    
    /**
     * Check and award streak badges (EASY: 3, 5, 10 days)
     */
    private static function checkStreakBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $streak = $stats['longestStreak'];
        
        // Streak Master Level 1: 3 days
        if ($streak >= 3) {
            if (Badge::award($mahasiswaId, 'streak_master_1', "Streak {$streak} hari")) {
                $awarded[] = 'streak_master_1';
            }
        }
        
        // Streak Master Level 2: 5 days
        if ($streak >= 5) {
            if (Badge::award($mahasiswaId, 'streak_master_2', "Streak {$streak} hari")) {
                $awarded[] = 'streak_master_2';
            }
        }
        
        // Streak Master Level 3: 10 days
        if ($streak >= 10) {
            if (Badge::award($mahasiswaId, 'streak_master_3', "Streak {$streak} hari")) {
                $awarded[] = 'streak_master_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award perfect attendance badges (EASY: 3, 7, 14 sessions)
     */
    private static function checkPerfectAttendanceBadges(int $mahasiswaId, array $stats, $logs): array
    {
        $awarded = [];
        
        // Count perfect sessions (present, not late)
        $perfectSessions = $logs->where('status', 'present')->count();
        
        // Perfect Attendance Level 1: 3 perfect sessions
        if ($perfectSessions >= 3) {
            if (Badge::award($mahasiswaId, 'perfect_attendance_1', "Kehadiran sempurna {$perfectSessions} sesi")) {
                $awarded[] = 'perfect_attendance_1';
            }
        }
        
        // Perfect Attendance Level 2: 7 perfect sessions
        if ($perfectSessions >= 7) {
            if (Badge::award($mahasiswaId, 'perfect_attendance_2', "Kehadiran sempurna {$perfectSessions} sesi")) {
                $awarded[] = 'perfect_attendance_2';
            }
        }
        
        // Perfect Attendance Level 3: 14 perfect sessions
        if ($perfectSessions >= 14) {
            if (Badge::award($mahasiswaId, 'perfect_attendance_3', "Kehadiran sempurna {$perfectSessions} sesi")) {
                $awarded[] = 'perfect_attendance_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award early bird badges (EASY: 3, 7, 15 on-time sessions)
     */
    private static function checkEarlyBirdBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $presentCount = $stats['presentCount'];
        
        // Early Bird Level 1: 3 on-time sessions
        if ($presentCount >= 3) {
            if (Badge::award($mahasiswaId, 'early_bird_1', "Tepat waktu {$presentCount} kali")) {
                $awarded[] = 'early_bird_1';
            }
        }
        
        // Early Bird Level 2: 7 on-time sessions
        if ($presentCount >= 7) {
            if (Badge::award($mahasiswaId, 'early_bird_2', "Tepat waktu {$presentCount} kali")) {
                $awarded[] = 'early_bird_2';
            }
        }
        
        // Early Bird Level 3: 15 on-time sessions
        if ($presentCount >= 15) {
            if (Badge::award($mahasiswaId, 'early_bird_3', "Tepat waktu {$presentCount} kali")) {
                $awarded[] = 'early_bird_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award consistent badges (EASY: 5, 10, 20 total attendance)
     */
    private static function checkConsistentBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $total = $stats['totalAttendance'];
        
        // Consistent Level 1: 5 total attendance
        if ($total >= 5) {
            if (Badge::award($mahasiswaId, 'consistent_1', "Total kehadiran {$total} kali")) {
                $awarded[] = 'consistent_1';
            }
        }
        
        // Consistent Level 2: 10 total attendance
        if ($total >= 10) {
            if (Badge::award($mahasiswaId, 'consistent_2', "Total kehadiran {$total} kali")) {
                $awarded[] = 'consistent_2';
            }
        }
        
        // Consistent Level 3: 20 total attendance
        if ($total >= 20) {
            if (Badge::award($mahasiswaId, 'consistent_3', "Total kehadiran {$total} kali")) {
                $awarded[] = 'consistent_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award first step badges (EASY: 1, 5, 15 attendance)
     */
    private static function checkFirstStepBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $total = $stats['totalAttendance'];
        
        // First Step Level 1: 1 attendance
        if ($total >= 1) {
            if (Badge::award($mahasiswaId, 'first_step_1', 'Absen pertama')) {
                $awarded[] = 'first_step_1';
            }
        }
        
        // First Step Level 2: 5 attendances
        if ($total >= 5) {
            if (Badge::award($mahasiswaId, 'first_step_2', "Total {$total} absen")) {
                $awarded[] = 'first_step_2';
            }
        }
        
        // First Step Level 3: 15 attendances
        if ($total >= 15) {
            if (Badge::award($mahasiswaId, 'first_step_3', "Total {$total} absen")) {
                $awarded[] = 'first_step_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award AI verified badges (EASY: 3, 10, 25 verifications)
     */
    private static function checkAiVerifiedBadges(int $mahasiswaId, $logs): array
    {
        $awarded = [];
        $verifiedCount = $logs->whereNotNull('selfie_path')->count();
        
        // AI Verified Level 1: 3 verifications
        if ($verifiedCount >= 3) {
            if (Badge::award($mahasiswaId, 'ai_verified_1', "Verifikasi AI {$verifiedCount} kali")) {
                $awarded[] = 'ai_verified_1';
            }
        }
        
        // AI Verified Level 2: 10 verifications
        if ($verifiedCount >= 10) {
            if (Badge::award($mahasiswaId, 'ai_verified_2', "Verifikasi AI {$verifiedCount} kali")) {
                $awarded[] = 'ai_verified_2';
            }
        }
        
        // AI Verified Level 3: 25 verifications
        if ($verifiedCount >= 25) {
            if (Badge::award($mahasiswaId, 'ai_verified_3', "Verifikasi AI {$verifiedCount} kali")) {
                $awarded[] = 'ai_verified_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award legend badges (EASY: 2, 5, 10 badges)
     */
    private static function checkLegendBadges(int $mahasiswaId): array
    {
        $awarded = [];
        
        // Count earned badges (excluding legend badges)
        $earnedCount = DB::table('mahasiswa_badges')
            ->join('badges', 'badges.id', '=', 'mahasiswa_badges.badge_id')
            ->where('mahasiswa_badges.mahasiswa_id', $mahasiswaId)
            ->where('badges.code', 'not like', 'legend_%')
            ->count();
        
        // Legend Level 1: 2 badges
        if ($earnedCount >= 2) {
            if (Badge::award($mahasiswaId, 'legend_1', "Unlock {$earnedCount} badge")) {
                $awarded[] = 'legend_1';
            }
        }
        
        // Legend Level 2: 5 badges
        if ($earnedCount >= 5) {
            if (Badge::award($mahasiswaId, 'legend_2', "Unlock {$earnedCount} badge")) {
                $awarded[] = 'legend_2';
            }
        }
        
        // Legend Level 3: 10 badges
        if ($earnedCount >= 10) {
            if (Badge::award($mahasiswaId, 'legend_3', "Unlock {$earnedCount} badge")) {
                $awarded[] = 'legend_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Get all earned badges for a mahasiswa
     */
    public static function getEarnedBadges(int $mahasiswaId): array
    {
        return DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswaId)
            ->pluck('badge_id')
            ->toArray();
    }
    
    /**
     * Check if mahasiswa has a specific badge
     */
    public static function hasBadge(int $mahasiswaId, string $badgeCode): bool
    {
        return DB::table('mahasiswa_badges')
            ->join('badges', 'badges.id', '=', 'mahasiswa_badges.badge_id')
            ->where('mahasiswa_badges.mahasiswa_id', $mahasiswaId)
            ->where('badges.code', $badgeCode)
            ->exists();
    }
}
