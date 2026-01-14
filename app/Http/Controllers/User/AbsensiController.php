<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceToken;
use App\Models\AuditLog;
use App\Models\SelfieVerification;
use App\Models\Setting;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Response as HttpResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;
use App\Services\BadgeService;

class AbsensiController extends Controller
{
    public function dashboard(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        // Get attendance logs
        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get();

        // Calculate stats
        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;

        // Calculate streak
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

        // On-time rate
        $presentCount = $logs->where('status', 'present')->count();
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

        // This week stats
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        $thisWeekLogs = $logs->filter(function ($log) use ($startOfWeek, $endOfWeek) {
            return $log->scanned_at && $log->scanned_at->between($startOfWeek, $endOfWeek);
        });
        $thisWeekAttendance = $thisWeekLogs->whereIn('status', ['present', 'late'])->count();
        $thisWeekTotal = $thisWeekLogs->count();

        // Recent activity
        $recentActivity = $logs->take(5)->map(function ($log) {
            $status = match ($log->status) {
                'present' => 'success',
                'late' => 'warning',
                default => 'error',
            };
            $message = match ($log->status) {
                'present' => 'Hadir di ' . ($log->session?->course?->nama ?? 'Sesi'),
                'late' => 'Terlambat di ' . ($log->session?->course?->nama ?? 'Sesi'),
                'rejected' => 'Ditolak: ' . ($log->note ?? 'Tidak valid'),
                default => 'Absen di ' . ($log->session?->course?->nama ?? 'Sesi'),
            };

            return [
                'id' => $log->id,
                'type' => 'attendance',
                'message' => $message,
                'time' => $log->scanned_at?->diffForHumans(),
                'status' => $status,
            ];
        })->values()->toArray();

        // Upcoming sessions (placeholder - would need actual session scheduling)
        $upcomingSessions = [];

        // Achievements
        $achievements = [
            ['type' => 'streak', 'value' => $currentStreak, 'unlocked' => $currentStreak >= 3],
            ['type' => 'perfect', 'unlocked' => $attendanceRate === 100],
            ['type' => 'early', 'unlocked' => $onTimeRate >= 90],
            ['type' => 'consistent', 'unlocked' => $attendanceRate >= 80],
            ['type' => 'champion', 'unlocked' => false],
            ['type' => 'legend', 'unlocked' => false],
        ];

        // Weekly chart data (last 4 weeks)
        $weeklyChartData = [];
        for ($i = 3; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();
            $weekLabel = 'Minggu ' . (4 - $i);

            $weekLogs = $logs->filter(function ($log) use ($weekStart, $weekEnd) {
                return $log->scanned_at && $log->scanned_at->between($weekStart, $weekEnd);
            });

            $weeklyChartData[] = [
                'label' => $weekLabel,
                'present' => $weekLogs->where('status', 'present')->count(),
                'late' => $weekLogs->where('status', 'late')->count(),
                'absent' => $weekLogs->whereNotIn('status', ['present', 'late'])->count(),
            ];
        }

        // Monthly chart data (last 6 months)
        $monthlyChartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->translatedFormat('M');

            $monthLogs = $logs->filter(function ($log) use ($monthStart, $monthEnd) {
                return $log->scanned_at && $log->scanned_at->between($monthStart, $monthEnd);
            });

            $monthlyChartData[] = [
                'label' => $monthLabel,
                'present' => $monthLogs->where('status', 'present')->count(),
                'late' => $monthLogs->where('status', 'late')->count(),
                'absent' => $monthLogs->whereNotIn('status', ['present', 'late'])->count(),
                'total' => $monthLogs->count(),
            ];
        }

        // Daily attendance for current week
        $dailyChartData = [];
        $dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        for ($i = 0; $i < 7; $i++) {
            $day = now()->startOfWeek()->addDays($i);
            $dayLogs = $logs->filter(function ($log) use ($day) {
                return $log->scanned_at && $log->scanned_at->isSameDay($day);
            });

            $dailyChartData[] = [
                'label' => $dayNames[$i],
                'present' => $dayLogs->where('status', 'present')->count(),
                'late' => $dayLogs->where('status', 'late')->count(),
                'absent' => $dayLogs->whereNotIn('status', ['present', 'late'])->count(),
            ];
        }

        // Attendance distribution for pie chart
        $distributionData = [
            ['label' => 'Hadir', 'value' => $logs->where('status', 'present')->count()],
            ['label' => 'Terlambat', 'value' => $logs->where('status', 'late')->count()],
            ['label' => 'Tidak Hadir', 'value' => $logs->whereNotIn('status', ['present', 'late'])->count()],
        ];

        return Inertia::render('user/dashboard', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'stats' => [
                'totalAttendance' => $totalAttendance,
                'totalSessions' => $totalSessions,
                'attendanceRate' => $attendanceRate,
                'currentStreak' => $currentStreak,
                'longestStreak' => $longestStreak,
                'onTimeRate' => $onTimeRate,
                'thisWeekAttendance' => $thisWeekAttendance,
                'thisWeekTotal' => $thisWeekTotal,
            ],
            'upcomingSessions' => $upcomingSessions,
            'recentActivity' => $recentActivity,
            'achievements' => $achievements,
            'notifications' => ['unread' => 0],
            'chartData' => [
                'weekly' => $weeklyChartData,
                'monthly' => $monthlyChartData,
                'daily' => $dailyChartData,
                'distribution' => $distributionData,
            ],
        ]);
    }

    public function history(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get();

        $records = $logs->map(function ($log) {
            $selfieUrl = null;
            if ($log->selfie_path) {
                $selfieUrl = asset('storage/' . ltrim($log->selfie_path, '/'));
            }

            return [
                'id' => $log->id,
                'date' => $log->scanned_at?->toIso8601String(),
                'course' => $log->session?->course?->nama ?? 'Unknown',
                'courseId' => $log->session?->course?->id ?? 0,
                'meetingNumber' => $log->session?->meeting_number ?? 1,
                'status' => $log->status,
                'checkInTime' => $log->scanned_at?->format('H:i'),
                'distance' => $log->distance_m,
                'selfieUrl' => $selfieUrl,
                'note' => $log->note,
                'location' => $log->latitude && $log->longitude ? [
                    'lat' => (float) $log->latitude,
                    'lng' => (float) $log->longitude,
                ] : null,
            ];
        })->values()->toArray();

        // Get unique courses
        $courses = $logs->map(function ($log) {
            return [
                'id' => $log->session?->course?->id,
                'name' => $log->session?->course?->nama,
            ];
        })->filter(fn($c) => $c['id'] !== null)->unique('id')->values()->toArray();

        // Calculate stats
        $present = $logs->where('status', 'present')->count();
        $absent = $logs->where('status', 'rejected')->count();
        $late = $logs->where('status', 'late')->count();
        $pending = $logs->where('status', 'pending')->count();
        $total = $logs->count();

        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $streak = 0;
        $longestStreak = 0;
        $tempStreak = 0;

        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $tempStreak++;
            } else {
                $longestStreak = max($longestStreak, $tempStreak);
                $tempStreak = 0;
            }
        }
        $longestStreak = max($longestStreak, $tempStreak);
        $streak = $tempStreak;

        return Inertia::render('user/history', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'records' => $records,
            'courses' => $courses,
            'stats' => [
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'pending' => $pending,
                'total' => $total,
                'streak' => $streak,
                'longestStreak' => $longestStreak,
            ],
        ]);
    }

    public function achievements(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get();

        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $presentCount = $logs->where('status', 'present')->count();
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;

        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $tempStreak++;
            } else {
                $longestStreak = max($longestStreak, $tempStreak);
                $tempStreak = 0;
            }
        }
        $longestStreak = max($longestStreak, $tempStreak);
        $currentStreak = $tempStreak;

        // Check and award any new badges (this won't remove existing badges)
        BadgeService::checkAndAwardBadges($mahasiswa?->id);

        // Get user's earned badges from database (permanent, won't be removed)
        $earnedBadges = \DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get()
            ->keyBy('badge_id');

        // Get all badges from database grouped by base name (without level suffix)
        $allBadges = \App\Models\Badge::where('is_active', true)
            ->orderBy('badge_level')
            ->get();

        // Group badges by their base code (e.g., streak_master_1, streak_master_2 -> streak_master)
        $badgeGroups = $allBadges->groupBy(function ($badge) {
            return preg_replace('/_[0-9]+$/', '', $badge->code);
        });

        // Calculate progress for each badge type
        $progressData = $this->calculateBadgeProgress($mahasiswa, $logs, $currentStreak, $attendanceRate, $presentCount, $totalAttendance);

        // Build achievements array - show only the current level for each badge type
        $achievements = [];
        foreach ($badgeGroups as $baseCode => $badges) {
            // Find the highest unlocked level (from database) or the next level to unlock
            $currentBadge = null;
            $isUnlocked = false;
            $unlockedAt = null;
            
            foreach ($badges as $badge) {
                // Check if badge is earned (stored in database - permanent)
                if (isset($earnedBadges[$badge->id])) {
                    $currentBadge = $badge;
                    $isUnlocked = true;
                    $unlockedAt = $earnedBadges[$badge->id]->earned_at;
                } elseif (!$isUnlocked && !$currentBadge) {
                    // First badge not yet earned - show as next target
                    $currentBadge = $badge;
                }
            }

            // If all levels unlocked, show the highest level
            if (!$currentBadge) {
                $currentBadge = $badges->last();
                $isUnlocked = isset($earnedBadges[$currentBadge->id]);
                $unlockedAt = $isUnlocked ? $earnedBadges[$currentBadge->id]->earned_at : null;
            }

            // Get progress for this badge type
            $progress = $progressData[$baseCode] ?? ['current' => 0, 'target' => $currentBadge->requirement_value];

            $achievements[] = [
                'id' => $currentBadge->id,
                'type' => $baseCode,
                'name' => $currentBadge->name,
                'description' => $currentBadge->description,
                'requirement' => $this->formatRequirement($currentBadge),
                'progress' => $progress['current'],
                'target' => $currentBadge->requirement_value,
                'unlocked' => $isUnlocked,
                'unlockedAt' => $unlockedAt,
                'points' => $currentBadge->points,
                'level' => $currentBadge->badge_level,
                'maxLevel' => $badges->count(),
                'icon' => $currentBadge->icon,
                'color' => $currentBadge->color,
            ];
        }

        // Calculate points
        $points = $mahasiswa?->total_points ?? (($totalAttendance * 10) + ($currentStreak * 5) + ($presentCount * 2));
        $level = $mahasiswa?->current_level ?? ((int) floor($points / 100) + 1);
        $nextLevelPoints = 100;

        // Get rank
        $rank = \App\Models\Mahasiswa::where('total_points', '>', $mahasiswa?->total_points ?? 0)->count() + 1;
        $totalStudents = \App\Models\Mahasiswa::count();

        return Inertia::render('user/achievements', [
            'mahasiswa' => [
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'achievements' => $achievements,
            'totalPoints' => $points,
            'level' => $level,
            'nextLevelPoints' => $nextLevelPoints,
            'rank' => $rank,
            'totalStudents' => $totalStudents,
        ]);
    }

    /**
     * Calculate progress for each badge type
     */
    private function calculateBadgeProgress($mahasiswa, $logs, $currentStreak, $attendanceRate, $presentCount, $totalAttendance): array
    {
        $earnedBadgesCount = \DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->count();

        return [
            'streak_master' => ['current' => $currentStreak, 'target' => 7],
            'perfect_attendance' => ['current' => $attendanceRate, 'target' => 100],
            'early_bird' => ['current' => $presentCount, 'target' => 10],
            'consistent' => ['current' => $attendanceRate, 'target' => 80],
            'champion' => ['current' => 0, 'target' => 10], // Placeholder - needs leaderboard calculation
            'legend' => ['current' => $earnedBadgesCount, 'target' => 3],
            'first_step' => ['current' => $totalAttendance, 'target' => 1],
            'ai_verified' => ['current' => $logs->where('selfie_path', '!=', null)->count(), 'target' => 10],
            'kas_hero' => ['current' => 0, 'target' => 4], // Placeholder - needs kas calculation
            'task_master' => ['current' => 0, 'target' => 5], // Placeholder - needs task calculation
            'social_star' => ['current' => 0, 'target' => 5], // Placeholder - needs voting calculation
            'speed_demon' => ['current' => 0, 'target' => 5], // Placeholder - needs fast attendance calculation
        ];
    }

    /**
     * Format requirement text for display
     */
    private function formatRequirement(\App\Models\Badge $badge): string
    {
        $value = $badge->requirement_value;
        
        return match($badge->requirement_type) {
            'streak_days' => "Hadir {$value} hari berturut-turut",
            'attendance_percentage' => "Kehadiran {$value}% dalam 1 minggu",
            'attendance_percentage_month' => "Kehadiran {$value}% dalam 1 bulan",
            'attendance_percentage_semester' => "Kehadiran {$value}% dalam 1 semester",
            'on_time_sessions' => "Tidak terlambat dalam {$value} sesi",
            'consistent_month' => "Kehadiran >{$value}% selama 1 bulan",
            'consistent_quarter' => "Kehadiran >{$value}% selama 3 bulan",
            'consistent_semester' => "Kehadiran >{$value}% selama 1 semester",
            'leaderboard_rank' => $value == 1 ? "Peringkat #1 di kelas" : "Masuk top {$value} di kelas",
            'total_badges' => "Unlock {$value} achievement lainnya",
            'total_attendance' => "Absen sebanyak {$value} kali",
            'ai_verification' => "Lolos verifikasi AI {$value} kali",
            'kas_on_time' => "Bayar kas tepat waktu {$value} minggu",
            'task_on_time' => "Kumpulkan {$value} tugas tepat waktu",
            'voting_participation' => "Ikut voting kas {$value} kali",
            'fast_attendance' => "Absen dalam 1 menit pertama {$value} kali",
            default => $badge->description,
        };
    }

    /**
     * Show badge detail page
     */
    public function badgeDetail(string $badge): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        // Get base badge type (remove level suffix like _1, _2, _3)
        $baseType = preg_replace('/_[0-9]+$/', '', $badge);
        
        // Get all badges of this type (all levels)
        $allBadges = \App\Models\Badge::where('code', 'like', $baseType . '%')
            ->where('is_active', true)
            ->orderBy('badge_level')
            ->get();
        
        if ($allBadges->isEmpty()) {
            abort(404, 'Badge tidak ditemukan');
        }
        
        // Get user's earned badges from database (permanent)
        $earnedBadgeIds = \DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->pluck('badge_id')
            ->toArray();
        
        // Get attendance logs for progress calculation
        $logs = AttendanceLog::query()
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get();
        
        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $presentCount = $logs->where('status', 'present')->count();
        
        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $currentStreak = 0;
        $tempStreak = 0;
        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $tempStreak++;
            } else {
                break;
            }
        }
        $currentStreak = $tempStreak;
        
        // Get progress data
        $progressData = $this->calculateBadgeProgress($mahasiswa, $logs, $currentStreak, $attendanceRate, $presentCount, $totalAttendance);
        $progress = $progressData[$baseType] ?? ['current' => 0, 'target' => 1];
        
        // Build badge levels data - check both database AND progress
        $badgeLevels = $allBadges->map(function ($b) use ($earnedBadgeIds, $progress) {
            // Check database for earned status OR if progress meets requirement
            $isUnlocked = in_array($b->id, $earnedBadgeIds) || ($progress['current'] >= $b->requirement_value);
            
            return [
                'id' => $b->id,
                'level' => $b->badge_level,
                'name' => $b->name,
                'description' => $b->description,
                'requirement' => $this->formatRequirement($b),
                'requirementValue' => $b->requirement_value,
                'points' => $b->points,
                'unlocked' => $isUnlocked,
                'icon' => $b->icon,
                'color' => $b->color,
            ];
        })->toArray();
        
        // Get current/next level badge - check both database AND progress
        $currentBadge = null;
        $nextBadge = null;
        foreach ($allBadges as $b) {
            // Check database OR progress for unlocked status
            $isUnlocked = in_array($b->id, $earnedBadgeIds) || ($progress['current'] >= $b->requirement_value);
            if ($isUnlocked) {
                $currentBadge = $b;
            } elseif (!$nextBadge) {
                $nextBadge = $b;
            }
        }
        
        // If no current badge, use first level
        if (!$currentBadge) {
            $currentBadge = $allBadges->first();
        }
        
        // Get tips for this badge type
        $tips = $this->getBadgeTips($baseType);
        
        // Get how to earn steps
        $howToEarn = $this->getHowToEarn($baseType);
        
        // Get related badges (other badge types)
        $relatedBadges = \App\Models\Badge::where('badge_level', 1)
            ->where('is_active', true)
            ->where('code', 'not like', $baseType . '%')
            ->inRandomOrder()
            ->limit(4)
            ->get()
            ->map(function ($b) use ($earnedBadgeIds, $progressData) {
                $baseCode = preg_replace('/_[0-9]+$/', '', $b->code);
                $relatedProgress = $progressData[$baseCode] ?? ['current' => 0, 'target' => 1];
                $isUnlocked = in_array($b->id, $earnedBadgeIds) || ($relatedProgress['current'] >= $b->requirement_value);
                return [
                    'type' => $baseCode,
                    'name' => preg_replace('/ I$/', '', $b->name),
                    'icon' => $b->icon,
                    'color' => $b->color,
                    'unlocked' => $isUnlocked,
                ];
            })->toArray();
        
        return Inertia::render('user/badge-detail', [
            'mahasiswa' => [
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'badge' => [
                'type' => $baseType,
                'name' => preg_replace('/ I+$/', '', $currentBadge->name),
                'description' => $currentBadge->description,
                'icon' => $currentBadge->icon,
                'color' => $currentBadge->color,
                'category' => $currentBadge->category,
                'currentLevel' => $currentBadge->badge_level,
                'maxLevel' => $allBadges->count(),
            ],
            'levels' => $badgeLevels,
            'progress' => [
                'current' => $progress['current'],
                'target' => $nextBadge ? $nextBadge->requirement_value : $currentBadge->requirement_value,
                'percentage' => $nextBadge 
                    ? min(100, round(($progress['current'] / $nextBadge->requirement_value) * 100))
                    : 100,
            ],
            'tips' => $tips,
            'howToEarn' => $howToEarn,
            'relatedBadges' => $relatedBadges,
        ]);
    }
    
    /**
     * Get tips for badge type
     */
    private function getBadgeTips(string $type): array
    {
        return match($type) {
            'streak_master' => [
                'Hadir setiap hari tanpa bolos untuk membangun streak',
                'Set alarm reminder 30 menit sebelum kelas dimulai',
                'Jika sakit, ajukan izin agar streak tidak terputus',
                'Cek jadwal kuliah setiap malam sebelum tidur',
            ],
            'perfect_attendance' => [
                'Pastikan hadir di semua sesi kuliah tanpa terkecuali',
                'Datang lebih awal untuk menghindari keterlambatan',
                'Siapkan perangkat dan koneksi internet yang stabil',
                'Koordinasi dengan teman untuk saling mengingatkan',
            ],
            'early_bird' => [
                'Datang 10-15 menit sebelum sesi dimulai',
                'Siapkan semua keperluan kuliah malam sebelumnya',
                'Hindari begadang agar bisa bangun pagi dengan segar',
                'Gunakan alarm dengan nada yang membangunkan',
            ],
            'consistent' => [
                'Buat jadwal belajar yang konsisten setiap minggu',
                'Prioritaskan kehadiran di atas kegiatan lain',
                'Jaga kesehatan agar tidak sering sakit',
                'Komunikasikan dengan dosen jika ada kendala',
            ],
            'champion' => [
                'Tingkatkan kehadiran dan ketepatan waktu',
                'Kumpulkan poin sebanyak mungkin dari berbagai aktivitas',
                'Pantau posisi di leaderboard secara berkala',
                'Ajak teman berkompetisi secara sehat',
            ],
            'legend' => [
                'Fokus unlock badge lain terlebih dahulu',
                'Seimbangkan antara kehadiran, tugas, dan aktivitas lain',
                'Konsisten dalam jangka panjang',
                'Jadilah role model bagi teman sekelas',
            ],
            'first_step' => [
                'Mulai dengan langkah kecil - hadir di sesi pertama',
                'Biasakan diri dengan sistem absensi',
                'Jangan takut untuk mencoba fitur-fitur baru',
                'Setiap perjalanan dimulai dari langkah pertama',
            ],
            'ai_verified' => [
                'Pastikan wajah terlihat jelas saat foto selfie',
                'Gunakan pencahayaan yang cukup',
                'Hindari menggunakan masker atau kacamata hitam',
                'Posisikan wajah di tengah frame kamera',
            ],
            'kas_hero' => [
                'Set reminder untuk pembayaran kas mingguan',
                'Siapkan uang kas di awal minggu',
                'Bayar tepat waktu untuk menghindari denda',
                'Gunakan fitur pembayaran digital jika tersedia',
            ],
            'task_master' => [
                'Catat semua deadline tugas di kalender',
                'Kerjakan tugas jauh sebelum deadline',
                'Bagi tugas besar menjadi bagian-bagian kecil',
                'Minta bantuan teman atau dosen jika kesulitan',
            ],
            'social_star' => [
                'Aktif berpartisipasi dalam voting kas',
                'Berikan pendapat yang konstruktif',
                'Bantu teman yang kesulitan',
                'Jadilah anggota kelas yang aktif dan positif',
            ],
            'speed_demon' => [
                'Buka aplikasi absensi sebelum sesi dimulai',
                'Pastikan GPS dan kamera sudah siap',
                'Posisikan diri di lokasi dengan sinyal bagus',
                'Latih kecepatan dalam proses absensi',
            ],
            default => [
                'Konsisten dalam kehadiran',
                'Ikuti semua aturan yang berlaku',
                'Jaga semangat belajar',
                'Bantu sesama teman',
            ],
        };
    }
    
    /**
     * Get how to earn steps for badge type
     */
    private function getHowToEarn(string $type): array
    {
        return match($type) {
            'streak_master' => [
                ['step' => 1, 'title' => 'Hadir Setiap Hari', 'description' => 'Pastikan kamu hadir di setiap sesi kuliah yang dijadwalkan'],
                ['step' => 2, 'title' => 'Jangan Putus Streak', 'description' => 'Hindari absen tanpa izin yang akan memutus streak kamu'],
                ['step' => 3, 'title' => 'Ajukan Izin Jika Perlu', 'description' => 'Jika tidak bisa hadir, ajukan izin agar streak tetap terjaga'],
                ['step' => 4, 'title' => 'Capai Target Hari', 'description' => 'Level 1: 7 hari, Level 2: 14 hari, Level 3: 30 hari berturut-turut'],
            ],
            'perfect_attendance' => [
                ['step' => 1, 'title' => 'Hadir 100%', 'description' => 'Tidak boleh ada absen sama sekali dalam periode tertentu'],
                ['step' => 2, 'title' => 'Tepat Waktu', 'description' => 'Datang sebelum sesi dimulai untuk menghindari status terlambat'],
                ['step' => 3, 'title' => 'Verifikasi Berhasil', 'description' => 'Pastikan selfie dan lokasi terverifikasi dengan benar'],
                ['step' => 4, 'title' => 'Pertahankan Periode', 'description' => 'Level 1: 1 minggu, Level 2: 1 bulan, Level 3: 1 semester'],
            ],
            'early_bird' => [
                ['step' => 1, 'title' => 'Datang Lebih Awal', 'description' => 'Hadir sebelum waktu toleransi keterlambatan'],
                ['step' => 2, 'title' => 'Absen Tepat Waktu', 'description' => 'Lakukan absensi segera setelah sesi dibuka'],
                ['step' => 3, 'title' => 'Konsisten', 'description' => 'Pertahankan kebiasaan datang tepat waktu'],
                ['step' => 4, 'title' => 'Capai Target Sesi', 'description' => 'Level 1: 10 sesi, Level 2: 30 sesi, Level 3: 100 sesi tanpa terlambat'],
            ],
            'consistent' => [
                ['step' => 1, 'title' => 'Jaga Kehadiran >80%', 'description' => 'Minimal hadir di 80% dari total sesi'],
                ['step' => 2, 'title' => 'Pertahankan Konsistensi', 'description' => 'Jangan biarkan kehadiran turun di bawah target'],
                ['step' => 3, 'title' => 'Monitor Progress', 'description' => 'Cek statistik kehadiran secara berkala'],
                ['step' => 4, 'title' => 'Capai Durasi', 'description' => 'Level 1: 1 bulan, Level 2: 3 bulan, Level 3: 1 semester'],
            ],
            'champion' => [
                ['step' => 1, 'title' => 'Kumpulkan Poin', 'description' => 'Hadir, tepat waktu, dan selesaikan tugas untuk mendapat poin'],
                ['step' => 2, 'title' => 'Naik Peringkat', 'description' => 'Bersaing dengan teman sekelas untuk posisi teratas'],
                ['step' => 3, 'title' => 'Pertahankan Posisi', 'description' => 'Jaga konsistensi agar tidak turun peringkat'],
                ['step' => 4, 'title' => 'Capai Target Rank', 'description' => 'Level 1: Top 10, Level 2: Top 5, Level 3: Peringkat #1'],
            ],
            'legend' => [
                ['step' => 1, 'title' => 'Unlock Badge Lain', 'description' => 'Fokus mendapatkan badge dari berbagai kategori'],
                ['step' => 2, 'title' => 'Diversifikasi', 'description' => 'Jangan hanya fokus pada satu jenis achievement'],
                ['step' => 3, 'title' => 'Konsisten Jangka Panjang', 'description' => 'Badge ini membutuhkan dedikasi tinggi'],
                ['step' => 4, 'title' => 'Capai Target Badge', 'description' => 'Level 1: 3 badge, Level 2: 6 badge, Level 3: Semua badge'],
            ],
            'first_step' => [
                ['step' => 1, 'title' => 'Buka Aplikasi', 'description' => 'Login ke sistem absensi dengan akun mahasiswa'],
                ['step' => 2, 'title' => 'Scan QR Code', 'description' => 'Scan QR code yang ditampilkan di kelas'],
                ['step' => 3, 'title' => 'Ambil Selfie', 'description' => 'Foto selfie untuk verifikasi kehadiran'],
                ['step' => 4, 'title' => 'Selesai!', 'description' => 'Absensi pertama kamu berhasil tercatat'],
            ],
            'ai_verified' => [
                ['step' => 1, 'title' => 'Foto Selfie', 'description' => 'Ambil foto selfie saat proses absensi'],
                ['step' => 2, 'title' => 'Verifikasi AI', 'description' => 'Sistem AI akan memverifikasi wajah kamu'],
                ['step' => 3, 'title' => 'Lolos Verifikasi', 'description' => 'Pastikan foto jelas dan wajah terlihat'],
                ['step' => 4, 'title' => 'Capai Target', 'description' => 'Level 1: 10x, Level 2: 50x, Level 3: 100x lolos verifikasi'],
            ],
            'kas_hero' => [
                ['step' => 1, 'title' => 'Cek Tagihan Kas', 'description' => 'Lihat tagihan kas mingguan di menu Uang Kas'],
                ['step' => 2, 'title' => 'Bayar Tepat Waktu', 'description' => 'Lakukan pembayaran sebelum deadline'],
                ['step' => 3, 'title' => 'Konfirmasi Pembayaran', 'description' => 'Pastikan pembayaran tercatat di sistem'],
                ['step' => 4, 'title' => 'Pertahankan Streak', 'description' => 'Level 1: 4 minggu, Level 2: 12 minggu, Level 3: 24 minggu'],
            ],
            'task_master' => [
                ['step' => 1, 'title' => 'Lihat Tugas', 'description' => 'Cek daftar tugas di menu Informasi Tugas'],
                ['step' => 2, 'title' => 'Kerjakan Tugas', 'description' => 'Selesaikan tugas sesuai instruksi'],
                ['step' => 3, 'title' => 'Submit Sebelum Deadline', 'description' => 'Kumpulkan tugas tepat waktu'],
                ['step' => 4, 'title' => 'Capai Target', 'description' => 'Level 1: 5 tugas, Level 2: 15 tugas, Level 3: 30 tugas tepat waktu'],
            ],
            'social_star' => [
                ['step' => 1, 'title' => 'Buka Voting Kas', 'description' => 'Akses menu Voting Kas untuk melihat voting aktif'],
                ['step' => 2, 'title' => 'Berikan Suara', 'description' => 'Vote untuk proposal yang kamu setujui'],
                ['step' => 3, 'title' => 'Aktif Berpartisipasi', 'description' => 'Ikuti setiap voting yang diadakan'],
                ['step' => 4, 'title' => 'Capai Target', 'description' => 'Level 1: 5x, Level 2: 15x, Level 3: 30x voting'],
            ],
            'speed_demon' => [
                ['step' => 1, 'title' => 'Siap Sebelum Sesi', 'description' => 'Buka aplikasi sebelum sesi dimulai'],
                ['step' => 2, 'title' => 'Absen Secepat Mungkin', 'description' => 'Lakukan absensi dalam 1 menit pertama'],
                ['step' => 3, 'title' => 'Pastikan Sukses', 'description' => 'Verifikasi bahwa absensi berhasil tercatat'],
                ['step' => 4, 'title' => 'Capai Target', 'description' => 'Level 1: 5x, Level 2: 15x, Level 3: 30x absen cepat'],
            ],
            default => [
                ['step' => 1, 'title' => 'Mulai', 'description' => 'Ikuti instruksi untuk mendapatkan badge ini'],
                ['step' => 2, 'title' => 'Progress', 'description' => 'Lakukan aktivitas yang diperlukan'],
                ['step' => 3, 'title' => 'Konsisten', 'description' => 'Pertahankan progress kamu'],
                ['step' => 4, 'title' => 'Selesai', 'description' => 'Badge akan otomatis terbuka saat target tercapai'],
            ],
        };
    }

    public function create(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $selfieRequired = Setting::getValue('selfie_required', '1') === '1';
        $geofence = [
            'lat' => (float) Setting::getValue('geofence_lat', '-6.3460957'),
            'lng' => (float) Setting::getValue('geofence_lng', '106.6915144'),
            'radius_m' => (int) Setting::getValue('geofence_radius_m', '100'),
        ];
        $locationSampleCount = (int) config('attendance.location.sample_count', 3);
        $locationSampleWindowSeconds = (int) config('attendance.location.sample_window_seconds', 20);

        return Inertia::render('user/absen', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'geofence' => $geofence,
            'selfieRequired' => $selfieRequired,
            'locationSampleCount' => $locationSampleCount,
            'locationSampleWindowSeconds' => $locationSampleWindowSeconds,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $selfieRequired = Setting::getValue('selfie_required', '1') === '1';
        $locationSampleCount = (int) config('attendance.location.sample_count', 3);

        $validated = $request->validate([
            'token' => ['required', 'string'],
            'selfie' => [
                $selfieRequired ? 'required' : 'nullable',
                'image',
                'max:5120',
            ],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'location_accuracy_m' => ['required', 'numeric'],
            'location_captured_at' => ['required', 'date'],
            'location_samples' => ['required', 'array', 'min:' . $locationSampleCount],
            'location_samples.*.latitude' => ['required', 'numeric'],
            'location_samples.*.longitude' => ['required', 'numeric'],
            'location_samples.*.accuracy_m' => ['required', 'numeric'],
            'location_samples.*.captured_at' => ['required', 'date'],
            'device_info' => ['nullable', 'string'],
        ]);

        $token = AttendanceToken::query()
            ->where('token', $validated['token'])
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $token) {
            $this->logAudit('token_expired', 'Token tidak valid atau sudah kadaluarsa.', $mahasiswa?->id, null);

            return back()->withErrors([
                'token' => 'Token tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $session = $token->session;
        if (! $session || ! $session->is_active) {
            $this->logAudit('session_inactive', 'Sesi tidak aktif.', $mahasiswa?->id, $session?->id);

            return back()->withErrors([
                'token' => 'Sesi tidak aktif.',
            ]);
        }

        if ($session->end_at && now()->greaterThan($session->end_at)) {
            $this->logAudit('session_closed', 'Sesi sudah berakhir.', $mahasiswa?->id, $session->id);

            return back()->withErrors([
                'token' => 'Sesi sudah berakhir.',
            ]);
        }

        $already = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->exists();

        if ($already) {
            $this->logAudit('token_duplicate', 'Mahasiswa sudah absen pada sesi ini.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'token' => 'Kamu sudah absen pada sesi ini.',
            ]);
        }

        $geofenceLat = (float) Setting::getValue('geofence_lat', '-6.3460957');
        $geofenceLng = (float) Setting::getValue('geofence_lng', '106.6915144');
        $radius = (int) Setting::getValue('geofence_radius_m', '100');
        $accuracyLimit = min(50, $radius);
        $samples = $this->normalizeLocationSamples($validated['location_samples']);
        $sampleWindowSeconds = (int) config('attendance.location.sample_window_seconds', 20);
        $maxSampleAgeSeconds = (int) config('attendance.location.sample_max_age_seconds', 60);
        $maxSpeedMps = (float) config('attendance.location.max_speed_mps', 35);
        $maxJumpMeters = (float) config('attendance.location.max_jump_m', 150);
        $maxSpreadMeters = (float) config('attendance.location.max_spread_m', 100);
        $requiredAccurateSamples = (int) ceil($locationSampleCount / 2);

        $oldestSampleAt = $samples[0]['captured_at'];
        $newestSampleAt = $samples[count($samples) - 1]['captured_at'];

        if ($newestSampleAt->diffInSeconds($oldestSampleAt) > $sampleWindowSeconds) {
            $this->logAudit('location_samples_span', 'Sampel lokasi tersebar terlalu lama.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_samples' => 'Sampel lokasi terlalu lama. Ambil ulang GPS.',
            ]);
        }

        if ($oldestSampleAt->lt(now()->subSeconds($maxSampleAgeSeconds))) {
            $this->logAudit('location_stale', 'Lokasi terlalu lama, minta ulang GPS.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'latitude' => 'Lokasi terlalu lama. Ambil ulang GPS sebelum absen.',
            ]);
        }

        $accurateSamples = array_filter($samples, static fn (array $sample) => $sample['accuracy_m'] <= $accuracyLimit);
        if (count($accurateSamples) < $requiredAccurateSamples) {
            $this->logAudit('location_accuracy_low', 'Akurasi GPS tidak konsisten.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_accuracy_m' => "Akurasi GPS belum cukup konsisten (maks {$accuracyLimit}m).",
            ]);
        }

        $jumpViolation = $this->detectJumpViolation($samples, $maxSpeedMps, $maxJumpMeters);
        if ($jumpViolation) {
            $details = sprintf(
                'Loncat lokasi %.2fm dalam %.2fs (%.2fm/s).',
                $jumpViolation['distance'],
                $jumpViolation['seconds'],
                $jumpViolation['speed_mps'],
            );
            $this->logAudit('location_jump', $details, $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_samples' => 'Pergerakan lokasi terlalu cepat. Ambil ulang GPS.',
            ]);
        }

        $bestSample = $this->selectBestSample($samples);
        $accuracy = $bestSample['accuracy_m'];
        $latitude = $bestSample['latitude'];
        $longitude = $bestSample['longitude'];

        $spreadMeters = $this->maxSampleSpread($samples, $bestSample);
        if ($spreadMeters > $maxSpreadMeters) {
            $this->logAudit('location_spread', 'Sampel lokasi tidak konsisten.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_samples' => 'Sampel lokasi tidak konsisten. Ambil ulang GPS.',
            ]);
        }

        if ($accuracy > $accuracyLimit) {
            $this->logAudit('location_accuracy_low', 'Akurasi GPS terlalu rendah.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_accuracy_m' => "Akurasi GPS terlalu rendah (maks {$accuracyLimit}m).",
            ]);
        }

        $distance = $this->distanceMeters(
            $latitude,
            $longitude,
            $geofenceLat,
            $geofenceLng,
        );

        if ($distance > $radius) {
            AttendanceLog::create([
                'attendance_session_id' => $session->id,
                'mahasiswa_id' => $mahasiswa->id,
                'attendance_token_id' => $token->id,
                'scanned_at' => now(),
                'status' => 'rejected',
                'distance_m' => $distance,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'note' => 'Di luar radius geofence.',
            ]);

            $this->logAudit('outside_radius', 'Scan di luar radius geofence.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'token' => 'Lokasi kamu di luar radius absen.',
            ]);
        }

        $ipCheckEnabled = (bool) config('attendance.ip_geolocation.enabled', true);
        $ipDistanceLimit = (float) config('attendance.ip_geolocation.max_distance_m', 50000);
        if ($ipCheckEnabled) {
            $ip = $request->ip();
            if ($this->isPublicIp($ip)) {
                $ipLocation = $this->lookupIpLocation($ip);
                if ($ipLocation) {
                    $ipDistance = $this->distanceMeters(
                        $ipLocation['lat'],
                        $ipLocation['lng'],
                        $geofenceLat,
                        $geofenceLng,
                    );
                    if ($ipDistance > $ipDistanceLimit) {
                        $this->logAudit(
                            'ip_location_far',
                            'Lokasi IP terlalu jauh dari geofence.',
                            $mahasiswa->id,
                            $session->id,
                        );

                        return back()->withErrors([
                            'location_samples' => 'Lokasi IP terlalu jauh dari area absen. Matikan VPN dan coba lagi.',
                        ]);
                    }
                } else {
                    $this->logAudit('ip_location_unavailable', 'Gagal memetakan lokasi IP.', $mahasiswa->id, $session->id);
                }
            }
        }

        $path = null;
        if ($request->hasFile('selfie')) {
            $path = $request->file('selfie')->store('selfies', 'public');
        }
        $lateMinutes = (int) Setting::getValue('late_minutes', '10');
        $status = now()->greaterThan($session->start_at->copy()->addMinutes($lateMinutes))
            ? 'late'
            : 'present';

        $deviceInfo = $validated['device_info'] ?? '';
        $deviceOs = $this->detectOs($deviceInfo);

        $log = AttendanceLog::create([
            'attendance_session_id' => $session->id,
            'mahasiswa_id' => $mahasiswa->id,
            'attendance_token_id' => $token->id,
            'scanned_at' => now(),
            'status' => $status,
            'distance_m' => $distance,
            'selfie_path' => $path,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'device_os' => $deviceOs,
            'device_model' => Str::limit($deviceInfo, 120, ''),
            'device_type' => 'mobile',
        ]);

        if ($path) {
            SelfieVerification::create([
                'attendance_log_id' => $log->id,
                'status' => 'pending',
            ]);
        }

        $statusLabel = $status === 'late' ? 'Terlambat' : 'Hadir';

        // Check and award badges after successful attendance
        BadgeService::checkAndAwardBadges($mahasiswa->id);

        return back()->with(
            'success',
            "Absensi berhasil terkirim. Status: {$statusLabel}.",
        );
    }

    public function rekapan(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get();

        // Overall stats
        $totalSessions = $logs->count();
        $presentCount = $logs->where('status', 'present')->count();
        $lateCount = $logs->where('status', 'late')->count();
        $rejectedCount = $logs->where('status', 'rejected')->count();
        $totalAttendance = $presentCount + $lateCount;
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

        // This month stats
        $thisMonthLogs = $logs->filter(fn($log) => $log->scanned_at && $log->scanned_at->isCurrentMonth());
        $thisMonthTotal = $thisMonthLogs->count();
        $thisMonthPresent = $thisMonthLogs->whereIn('status', ['present', 'late'])->count();

        // Course summary (agregat per mata kuliah)
        $courseSummary = $logs->groupBy(fn($log) => $log->session?->course?->id ?? 0)
            ->map(function ($courseLogs, $courseId) {
                $first = $courseLogs->first();
                $courseName = $first->session?->course?->nama ?? 'Unknown';
                $total = $courseLogs->count();
                $present = $courseLogs->where('status', 'present')->count();
                $late = $courseLogs->where('status', 'late')->count();
                $rejected = $courseLogs->whereNotIn('status', ['present', 'late'])->count();
                $attended = $present + $late;
                $rate = $total > 0 ? round(($attended / $total) * 100) : 0;

                return [
                    'courseId' => $courseId,
                    'courseName' => $courseName,
                    'total' => $total,
                    'present' => $present,
                    'late' => $late,
                    'rejected' => $rejected,
                    'attended' => $attended,
                    'rate' => $rate,
                ];
            })
            ->filter(fn($item) => $item['courseId'] !== 0)
            ->values()
            ->toArray();

        // Monthly trend (last 6 months)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->translatedFormat('M Y');

            $monthLogs = $logs->filter(fn($log) => $log->scanned_at && $log->scanned_at->between($monthStart, $monthEnd));
            $monthTotal = $monthLogs->count();
            $monthAttended = $monthLogs->whereIn('status', ['present', 'late'])->count();

            $monthlyTrend[] = [
                'month' => $monthLabel,
                'total' => $monthTotal,
                'attended' => $monthAttended,
                'rate' => $monthTotal > 0 ? round(($monthAttended / $monthTotal) * 100) : 0,
            ];
        }

        // Distribution for pie chart
        $distribution = [
            ['name' => 'Hadir', 'value' => $presentCount, 'color' => '#10b981'],
            ['name' => 'Terlambat', 'value' => $lateCount, 'color' => '#f59e0b'],
            ['name' => 'Ditolak', 'value' => $rejectedCount, 'color' => '#f43f5e'],
        ];

        // Recent logs (last 5)
        $recentLogs = $logs->take(5)->map(fn($log) => [
            'id' => $log->id,
            'status' => $log->status,
            'courseName' => $log->session?->course?->nama ?? 'Unknown',
            'meetingNumber' => $log->session?->meeting_number ?? 1,
            'scannedAt' => $log->scanned_at?->toIso8601String(),
            'scannedAtFormatted' => $log->scanned_at?->translatedFormat('d M Y, H:i'),
        ])->values()->toArray();

        return Inertia::render('user/rekapan', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'stats' => [
                'totalSessions' => $totalSessions,
                'presentCount' => $presentCount,
                'lateCount' => $lateCount,
                'rejectedCount' => $rejectedCount,
                'totalAttendance' => $totalAttendance,
                'attendanceRate' => $attendanceRate,
                'onTimeRate' => $onTimeRate,
                'thisMonthTotal' => $thisMonthTotal,
                'thisMonthPresent' => $thisMonthPresent,
            ],
            'courseSummary' => $courseSummary,
            'monthlyTrend' => $monthlyTrend,
            'distribution' => $distribution,
            'recentLogs' => $recentLogs,
        ]);
    }

    public function buktiMasuk(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course', 'selfieVerification'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get()
            ->map(static function (AttendanceLog $log) {
                $selfieUrl = null;
                if ($log->selfie_path) {
                    $selfieUrl = asset('storage/' . ltrim($log->selfie_path, '/'));
                }

                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'note' => $log->note,
                    'scanned_at' => $log->scanned_at?->toIso8601String(),
                    'selfie_url' => $selfieUrl,
                    'selfie_status' => $log->selfieVerification?->status,
                    'session' => [
                        'title' => $log->session?->title,
                        'meeting_number' => $log->session?->meeting_number,
                        'start_at' => $log->session?->start_at?->toIso8601String(),
                        'course' => [
                            'name' => $log->session?->course?->nama,
                        ],
                    ],
                ];
            });

        return Inertia::render('user/bukti-masuk', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'logs' => $logs,
        ]);
    }

    private function normalizeLocationSamples(array $samples): array
    {
        $normalized = [];
        foreach ($samples as $sample) {
            $normalized[] = [
                'latitude' => (float) $sample['latitude'],
                'longitude' => (float) $sample['longitude'],
                'accuracy_m' => (float) $sample['accuracy_m'],
                'captured_at' => Carbon::parse($sample['captured_at']),
            ];
        }

        usort(
            $normalized,
            static fn (array $a, array $b) => $a['captured_at']->valueOf() <=> $b['captured_at']->valueOf(),
        );

        return $normalized;
    }

    private function selectBestSample(array $samples): array
    {
        usort($samples, static function (array $a, array $b) {
            $accuracyComparison = $a['accuracy_m'] <=> $b['accuracy_m'];
            if ($accuracyComparison !== 0) {
                return $accuracyComparison;
            }

            return $b['captured_at']->valueOf() <=> $a['captured_at']->valueOf();
        });

        return $samples[0];
    }

    private function detectJumpViolation(array $samples, float $maxSpeedMps, float $maxJumpMeters): ?array
    {
        for ($index = 1; $index < count($samples); $index++) {
            $previous = $samples[$index - 1];
            $current = $samples[$index];
            $distance = $this->distanceMeters(
                $previous['latitude'],
                $previous['longitude'],
                $current['latitude'],
                $current['longitude'],
            );
            $seconds = max($current['captured_at']->diffInMilliseconds($previous['captured_at']) / 1000, 0.2);
            $speedMps = $distance / $seconds;

            if ($distance > $maxJumpMeters || $speedMps > $maxSpeedMps) {
                return [
                    'distance' => $distance,
                    'seconds' => $seconds,
                    'speed_mps' => $speedMps,
                ];
            }
        }

        return null;
    }

    private function maxSampleSpread(array $samples, array $anchor): float
    {
        $maxDistance = 0.0;
        foreach ($samples as $sample) {
            $distance = $this->distanceMeters(
                $sample['latitude'],
                $sample['longitude'],
                $anchor['latitude'],
                $anchor['longitude'],
            );
            $maxDistance = max($maxDistance, $distance);
        }

        return $maxDistance;
    }

    private function isPublicIp(?string $ip): bool
    {
        if (! $ip) {
            return false;
        }

        return (bool) filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        );
    }

    private function lookupIpLocation(string $ip): ?array
    {
        $endpoint = (string) config(
            'attendance.ip_geolocation.url',
            'https://ipapi.co/{ip}/json/',
        );
        if ($endpoint === '') {
            return null;
        }

        $url = str_replace('{ip}', $ip, $endpoint);

        $response = $this->fetchIpLocationResponse($url);
        if (! $response) {
            return null;
        }

        if ($response instanceof PromiseInterface) {
            $response = $response->wait();
        }

        if (! $response instanceof HttpResponse) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            return null;
        }

        if (isset($payload['status']) && $payload['status'] !== 'success') {
            return null;
        }

        if (isset($payload['latitude'], $payload['longitude'])) {
            return [
                'lat' => (float) $payload['latitude'],
                'lng' => (float) $payload['longitude'],
            ];
        }

        if (isset($payload['lat'], $payload['lon'])) {
            return [
                'lat' => (float) $payload['lat'],
                'lng' => (float) $payload['lon'],
            ];
        }

        if (isset($payload['loc'])) {
            $parts = explode(',', $payload['loc']);
            if (count($parts) === 2) {
                return [
                    'lat' => (float) $parts[0],
                    'lng' => (float) $parts[1],
                ];
            }
        }

        return null;
    }

    private function fetchIpLocationResponse(string $url): HttpResponse|PromiseInterface|null
    {
        try {
            return Http::timeout(4)->retry(1, 150)->get($url);
        } catch (Throwable $error) {
            return null;
        }
    }

    private function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $latFrom = deg2rad($lat1);
        $latTo = deg2rad($lat2);
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lngDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    private function detectOs(string $deviceInfo): string
    {
        $info = strtolower($deviceInfo);

        if (str_contains($info, 'android')) {
            return 'Android';
        }
        if (str_contains($info, 'iphone') || str_contains($info, 'ios')) {
            return 'iOS';
        }
        if (str_contains($info, 'mac')) {
            return 'macOS';
        }
        if (str_contains($info, 'windows')) {
            return 'Windows';
        }
        if (str_contains($info, 'linux')) {
            return 'Linux';
        }

        return 'Lainnya';
    }

    private function logAudit(string $event, string $message, ?int $mahasiswaId, ?int $sessionId): void
    {
        AuditLog::create([
            'event_type' => $event,
            'message' => $message,
            'mahasiswa_id' => $mahasiswaId,
            'attendance_session_id' => $sessionId,
        ]);
    }
}
