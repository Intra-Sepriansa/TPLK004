<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceStreak extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'current_streak',
        'longest_streak',
        'last_attendance_date',
        'streak_start_date',
    ];

    protected $casts = [
        'last_attendance_date' => 'date',
        'streak_start_date' => 'date',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    /**
     * Record attendance and update streak
     */
    public static function recordAttendance(int $mahasiswaId): self
    {
        $streak = self::firstOrCreate(['mahasiswa_id' => $mahasiswaId]);
        $today = now()->toDateString();

        // If already recorded today, skip
        if ($streak->last_attendance_date && $streak->last_attendance_date->toDateString() === $today) {
            return $streak;
        }

        // Check if streak continues (yesterday or same day)
        $yesterday = now()->subDay()->toDateString();
        
        if ($streak->last_attendance_date && $streak->last_attendance_date->toDateString() === $yesterday) {
            // Continue streak
            $streak->current_streak++;
        } else {
            // Reset streak
            $streak->current_streak = 1;
            $streak->streak_start_date = $today;
        }

        // Update longest streak
        if ($streak->current_streak > $streak->longest_streak) {
            $streak->longest_streak = $streak->current_streak;
        }

        $streak->last_attendance_date = $today;
        $streak->save();

        // Award streak badges
        self::checkStreakBadges($mahasiswaId, $streak->current_streak);

        // Award streak bonus points
        self::awardStreakBonus($mahasiswaId, $streak->current_streak);

        return $streak;
    }

    /**
     * Check and award streak badges
     */
    private static function checkStreakBadges(int $mahasiswaId, int $streak): void
    {
        $streakBadges = [
            3 => 'streak_3',
            7 => 'streak_7',
            14 => 'streak_14',
            30 => 'streak_30',
        ];

        foreach ($streakBadges as $requiredStreak => $badgeCode) {
            if ($streak >= $requiredStreak) {
                Badge::award($mahasiswaId, $badgeCode, "Streak {$requiredStreak} hari berturut-turut");
            }
        }
    }

    /**
     * Award streak bonus points
     */
    private static function awardStreakBonus(int $mahasiswaId, int $streak): void
    {
        // Bonus points for milestones
        $bonuses = [
            7 => 50,   // 7 hari = 50 bonus
            14 => 100, // 14 hari = 100 bonus
            30 => 250, // 30 hari = 250 bonus
        ];

        if (isset($bonuses[$streak])) {
            PointHistory::addPoints(
                $mahasiswaId,
                $bonuses[$streak],
                'streak_bonus',
                "Bonus streak {$streak} hari"
            );
        }
    }
}
