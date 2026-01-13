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
     * Check and award streak badges
     */
    private static function checkStreakBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $streak = $stats['longestStreak']; // Use longest streak, not current
        
        // Streak Master Level 1: 7 days
        if ($streak >= 7) {
            if (Badge::award($mahasiswaId, 'streak_master_1', "Streak {$streak} hari")) {
                $awarded[] = 'streak_master_1';
            }
        }
        
        // Streak Master Level 2: 14 days
        if ($streak >= 14) {
            if (Badge::award($mahasiswaId, 'streak_master_2', "Streak {$streak} hari")) {
                $awarded[] = 'streak_master_2';
            }
        }
        
        // Streak Master Level 3: 30 days
        if ($streak >= 30) {
            if (Badge::award($mahasiswaId, 'streak_master_3', "Streak {$streak} hari")) {
                $awarded[] = 'streak_master_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award perfect attendance badges
     * Uses historical best, not current rate
     */
    private static function checkPerfectAttendanceBadges(int $mahasiswaId, array $stats, $logs): array
    {
        $awarded = [];
        
        // Check weekly perfect attendance (last 7 days with sessions)
        $weeklyPerfect = self::checkPeriodPerfectAttendance($logs, 7);
        if ($weeklyPerfect) {
            if (Badge::award($mahasiswaId, 'perfect_attendance_1', 'Kehadiran sempurna 1 minggu')) {
                $awarded[] = 'perfect_attendance_1';
            }
        }
        
        // Check monthly perfect attendance (last 30 days with sessions)
        $monthlyPerfect = self::checkPeriodPerfectAttendance($logs, 30);
        if ($monthlyPerfect) {
            if (Badge::award($mahasiswaId, 'perfect_attendance_2', 'Kehadiran sempurna 1 bulan')) {
                $awarded[] = 'perfect_attendance_2';
            }
        }
        
        // Check semester perfect attendance (last 120 days with sessions)
        $semesterPerfect = self::checkPeriodPerfectAttendance($logs, 120);
        if ($semesterPerfect) {
            if (Badge::award($mahasiswaId, 'perfect_attendance_3', 'Kehadiran sempurna 1 semester')) {
                $awarded[] = 'perfect_attendance_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check if there's a period with perfect attendance
     */
    private static function checkPeriodPerfectAttendance($logs, int $days): bool
    {
        // Get logs from the period
        $startDate = now()->subDays($days);
        $periodLogs = $logs->filter(function ($log) use ($startDate) {
            return $log->scanned_at && $log->scanned_at->gte($startDate);
        });
        
        if ($periodLogs->isEmpty()) {
            return false;
        }
        
        // Check if all logs in period are present or late (not rejected/absent)
        $validCount = $periodLogs->whereIn('status', ['present', 'late'])->count();
        $totalCount = $periodLogs->count();
        
        // Need at least some sessions and 100% attendance
        return $totalCount >= 3 && $validCount === $totalCount;
    }
    
    /**
     * Check and award early bird badges
     */
    private static function checkEarlyBirdBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $presentCount = $stats['presentCount'];
        
        // Early Bird Level 1: 10 on-time sessions
        if ($presentCount >= 10) {
            if (Badge::award($mahasiswaId, 'early_bird_1', "Tepat waktu {$presentCount} kali")) {
                $awarded[] = 'early_bird_1';
            }
        }
        
        // Early Bird Level 2: 25 on-time sessions
        if ($presentCount >= 25) {
            if (Badge::award($mahasiswaId, 'early_bird_2', "Tepat waktu {$presentCount} kali")) {
                $awarded[] = 'early_bird_2';
            }
        }
        
        // Early Bird Level 3: 50 on-time sessions
        if ($presentCount >= 50) {
            if (Badge::award($mahasiswaId, 'early_bird_3', "Tepat waktu {$presentCount} kali")) {
                $awarded[] = 'early_bird_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award consistent badges
     */
    private static function checkConsistentBadges(int $mahasiswaId, array $stats): array
    {
        $awarded = [];
        $rate = $stats['attendanceRate'];
        
        // Consistent Level 1: 80% attendance
        if ($rate >= 80 && $stats['totalSessions'] >= 5) {
            if (Badge::award($mahasiswaId, 'consistent_1', "Kehadiran {$rate}%")) {
                $awarded[] = 'consistent_1';
            }
        }
        
        // Consistent Level 2: 90% attendance
        if ($rate >= 90 && $stats['totalSessions'] >= 10) {
            if (Badge::award($mahasiswaId, 'consistent_2', "Kehadiran {$rate}%")) {
                $awarded[] = 'consistent_2';
            }
        }
        
        // Consistent Level 3: 95% attendance
        if ($rate >= 95 && $stats['totalSessions'] >= 20) {
            if (Badge::award($mahasiswaId, 'consistent_3', "Kehadiran {$rate}%")) {
                $awarded[] = 'consistent_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award first step badges
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
        
        // First Step Level 2: 10 attendances
        if ($total >= 10) {
            if (Badge::award($mahasiswaId, 'first_step_2', "Total {$total} absen")) {
                $awarded[] = 'first_step_2';
            }
        }
        
        // First Step Level 3: 50 attendances
        if ($total >= 50) {
            if (Badge::award($mahasiswaId, 'first_step_3', "Total {$total} absen")) {
                $awarded[] = 'first_step_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award AI verified badges
     */
    private static function checkAiVerifiedBadges(int $mahasiswaId, $logs): array
    {
        $awarded = [];
        $verifiedCount = $logs->whereNotNull('selfie_path')->count();
        
        // AI Verified Level 1: 10 verifications
        if ($verifiedCount >= 10) {
            if (Badge::award($mahasiswaId, 'ai_verified_1', "Verifikasi AI {$verifiedCount} kali")) {
                $awarded[] = 'ai_verified_1';
            }
        }
        
        // AI Verified Level 2: 25 verifications
        if ($verifiedCount >= 25) {
            if (Badge::award($mahasiswaId, 'ai_verified_2', "Verifikasi AI {$verifiedCount} kali")) {
                $awarded[] = 'ai_verified_2';
            }
        }
        
        // AI Verified Level 3: 50 verifications
        if ($verifiedCount >= 50) {
            if (Badge::award($mahasiswaId, 'ai_verified_3', "Verifikasi AI {$verifiedCount} kali")) {
                $awarded[] = 'ai_verified_3';
            }
        }
        
        return $awarded;
    }
    
    /**
     * Check and award legend badges (based on total badges earned)
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
        
        // Legend Level 1: 3 badges
        if ($earnedCount >= 3) {
            if (Badge::award($mahasiswaId, 'legend_1', "Unlock {$earnedCount} badge")) {
                $awarded[] = 'legend_1';
            }
        }
        
        // Legend Level 2: 6 badges
        if ($earnedCount >= 6) {
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
