<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceToken;
use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Models\SelfieVerification;
use App\Models\Setting;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Response as HttpResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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

    public function historyExportPdf()
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get();

        $records = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'date' => $log->scanned_at?->toIso8601String(),
                'course' => $log->session?->course?->nama ?? 'Unknown',
                'courseId' => $log->session?->course?->id ?? 0,
                'meetingNumber' => $log->session?->meeting_number ?? 1,
                'status' => $log->status,
                'checkInTime' => $log->scanned_at?->format('H:i'),
                'distance' => $log->distance_m,
            ];
        })->values()->toArray();

        // Calculate stats
        $present = $logs->where('status', 'present')->count();
        $absent = $logs->where('status', 'rejected')->count();
        $late = $logs->where('status', 'late')->count();
        $pending = $logs->where('status', 'pending')->count();
        $total = $logs->count();

        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
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

        $periodStart = $sortedLogs->last()?->scanned_at?->format('d/m/Y') ?? '-';
        $periodEnd = $sortedLogs->first()?->scanned_at?->format('d/m/Y') ?? '-';

        $logoUnpam = public_path('logo-unpam.png');
        $logoSasmita = public_path('sasmita.png');

        $data = [
            'mahasiswa' => $mahasiswa,
            'records' => $records,
            'stats' => [
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'pending' => $pending,
                'total' => $total,
                'longestStreak' => $longestStreak,
            ],
            'periodStart' => $periodStart,
            'periodEnd' => $periodEnd,
            'logoUnpam' => $logoUnpam,
            'logoSasmita' => $logoSasmita,
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.riwayat-kehadiran', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('Riwayat-Kehadiran-' . ($mahasiswa?->nim ?? 'unknown') . '.pdf');
    }

    public function historyDetail($id): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $log = AttendanceLog::with([
            'session.course.dosen',
            'mahasiswa',
            'selfieVerification',
        ])->where('mahasiswa_id', $mahasiswa?->id)->findOrFail($id);

        $selfieUrl = null;
        if ($log->selfie_path) {
            $selfieUrl = asset('storage/' . ltrim($log->selfie_path, '/'));
        }

        // Get related records (same day, same student)
        $relatedRecords = AttendanceLog::where('mahasiswa_id', $log->mahasiswa_id)
            ->where('id', '!=', $id)
            ->whereDate('scanned_at', $log->scanned_at?->toDateString())
            ->with('session.course')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'course' => $r->session?->course?->nama ?? 'Unknown',
                'status' => $r->status,
                'scanned_at' => $r->scanned_at?->toIso8601String(),
                'checkInTime' => $r->scanned_at?->format('H:i'),
            ]);

        // Get previous and next record IDs for navigation
        $prevId = AttendanceLog::where('mahasiswa_id', $mahasiswa?->id)
            ->where('scanned_at', '<', $log->scanned_at)
            ->orderByDesc('scanned_at')
            ->value('id');

        $nextId = AttendanceLog::where('mahasiswa_id', $mahasiswa?->id)
            ->where('scanned_at', '>', $log->scanned_at)
            ->orderBy('scanned_at')
            ->value('id');

        // Class average stats for this session
        $classStats = [
            'total' => 0,
            'present_count' => 0,
            'avg_distance' => 0,
        ];
        if ($log->attendance_session_id) {
            $sessionLogs = AttendanceLog::where('attendance_session_id', $log->attendance_session_id)->get();
            $classStats['total'] = $sessionLogs->count();
            $classStats['present_count'] = $sessionLogs->whereIn('status', ['present', 'late'])->count();
            $classStats['avg_distance'] = $sessionLogs->avg('distance_m') ?? 0;
        }

        // Verification timeline
        $timeline = [];
        $timeline[] = [
            'type' => 'scan',
            'time' => $log->scanned_at?->toIso8601String(),
            'status' => 'completed',
            'description' => 'QR Code di-scan',
        ];
        if ($log->selfie_path) {
            $timeline[] = [
                'type' => 'selfie',
                'time' => $log->scanned_at?->toIso8601String(),
                'status' => 'completed',
                'description' => 'Selfie diupload',
            ];
        }
        if ($log->selfieVerification) {
            $sv = $log->selfieVerification;
            $timeline[] = [
                'type' => 'verification',
                'time' => $sv->verified_at?->toIso8601String(),
                'status' => $sv->status === 'approved' ? 'completed' : ($sv->status === 'pending' ? 'pending' : 'rejected'),
                'description' => match($sv->status) {
                    'approved' => 'Selfie diverifikasi ✓',
                    'rejected' => 'Selfie ditolak',
                    default => 'Menunggu verifikasi',
                },
            ];
        }

        $record = [
            'id' => $log->id,
            'status' => $log->status,
            'scanned_at' => $log->scanned_at?->toIso8601String(),
            'distance' => $log->distance_m ?? 0,
            'lat' => $log->latitude ? (float) $log->latitude : null,
            'long' => $log->longitude ? (float) $log->longitude : null,
            'selfie_url' => $selfieUrl,
            'note' => $log->note,
            'device_info' => [
                'model' => $log->device_model ?? 'Unknown',
                'os' => $log->device_os ?? 'Unknown',
                'browser' => $log->browser ?? 'Unknown',
                'type' => $log->device_type ?? 'Unknown',
            ],
            'selfie_verification' => $log->selfieVerification ? [
                'status' => $log->selfieVerification->status,
                'verified_at' => $log->selfieVerification->verified_at?->toIso8601String(),
                'verified_by' => $log->selfieVerification->verified_by_name ?? 'System',
                'notes' => $log->selfieVerification->note ?? $log->selfieVerification->rejection_reason,
            ] : [
                'status' => 'pending',
                'verified_at' => null,
                'verified_by' => null,
                'notes' => null,
            ],
            'session' => [
                'id' => $log->session?->id,
                'meeting_number' => $log->session?->meeting_number ?? 1,
                'title' => $log->session?->title ?? 'Pertemuan',
                'start_at' => $log->session?->start_at?->toIso8601String(),
                'end_at' => $log->session?->end_at?->toIso8601String(),
                'course' => [
                    'nama' => $log->session?->course?->nama ?? 'Unknown',
                    'sks' => $log->session?->course?->sks ?? 0,
                    'dosen' => [
                        'nama' => $log->session?->course?->dosen?->nama ?? 'Unknown',
                    ],
                ],
            ],
            'ai_info' => [
                'face_detected' => $log->face_detected,
                'face_match_score' => $log->face_match_score,
                'is_live_photo' => $log->is_live_photo,
                'ai_confidence' => $log->ai_confidence,
                'image_quality' => $log->image_quality_score,
            ],
        ];

        return Inertia::render('user/history-detail', [
            'record' => $record,
            'relatedRecords' => $relatedRecords,
            'classAverage' => $classStats,
            'timeline' => $timeline,
            'prevId' => $prevId,
            'nextId' => $nextId,
        ]);
    }

    public function achievements(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $courseScope = $this->resolveLatestCourseScope($mahasiswa?->id);
        $logs = $this->getScopedAchievementLogs($mahasiswa?->id, $courseScope);
        $metrics = $this->buildAchievementMetrics($mahasiswa?->id, $logs, $mahasiswa?->total_points, $courseScope);

        // Get user's earned badges from database (permanent, won't be removed)
        $earnedBadges = DB::table('mahasiswa_badges')
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

        // Build achievements array - show only the current level for each badge type
        $achievements = [];
        foreach ($badgeGroups as $baseCode => $badges) {
            // Show next badge level to pursue (or highest level if all claimed)
            $currentBadge = $badges->first(function ($badge) use ($earnedBadges) {
                return !isset($earnedBadges[$badge->id]);
            });

            if (!$currentBadge) {
                $currentBadge = $badges->last();
            }

            $isUnlocked = isset($earnedBadges[$currentBadge->id]);
            $unlockedAt = $isUnlocked ? $earnedBadges[$currentBadge->id]->earned_at : null;

            // Real progress is resolved per requirement_type & requirement_value
            $currentValue = $this->resolveRequirementProgress(
                $currentBadge->requirement_type,
                (int) $currentBadge->requirement_value,
                $metrics,
            );
            $targetValue = $currentBadge->requirement_value;
            $isCompleted = $currentValue >= $targetValue;
            $isClaimable = $isCompleted && !$isUnlocked;

            $achievements[] = [
                'id' => $currentBadge->id,
                'type' => $baseCode,
                'name' => $currentBadge->name,
                'description' => $currentBadge->description,
                'requirement' => $this->formatRequirement($currentBadge),
                'progress' => $currentValue,
                'target' => $targetValue,
                'unlocked' => $isUnlocked,
                'completed' => $isCompleted,
                'claimable' => $isClaimable,
                'unlockedAt' => $unlockedAt,
                'points' => $currentBadge->points,
                'level' => $currentBadge->badge_level,
                'maxLevel' => $badges->count(),
                'icon' => $currentBadge->icon,
                'color' => $currentBadge->color,
            ];
        }

        // Real points from scoped point history (fallback to mahasiswa.total_points when no scope)
        $points = $metrics['points'];
        $level = $mahasiswa?->current_level ?? ((int) floor($points / 100) + 1);
        $nextLevelPoints = 100;

        $rank = $metrics['leaderboard_rank'];
        $totalStudents = $metrics['total_students'];

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

    public function claimAchievement(int $badgeId): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $badge = \App\Models\Badge::where('id', $badgeId)
            ->where('is_active', true)
            ->first();

        if (!$mahasiswa || !$badge) {
            return back()->with('error', 'Badge tidak ditemukan.');
        }

        $alreadyClaimed = DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('badge_id', $badge->id)
            ->exists();

        if ($alreadyClaimed) {
            return back()->with('error', 'Badge ini sudah diklaim.');
        }

        $baseCode = preg_replace('/_[0-9]+$/', '', $badge->code);

        $badgeLevels = \App\Models\Badge::where('code', 'like', $baseCode . '%')
            ->where('is_active', true)
            ->orderBy('badge_level')
            ->get();

        $earnedBadgeIds = DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa->id)
            ->pluck('badge_id')
            ->toArray();

        $nextBadge = $badgeLevels->first(function ($levelBadge) use ($earnedBadgeIds) {
            return !in_array($levelBadge->id, $earnedBadgeIds, true);
        });

        if (!$nextBadge || $nextBadge->id !== $badge->id) {
            return back()->with('error', 'Badge ini belum bisa diklaim sekarang. Selesaikan level sebelumnya terlebih dahulu.');
        }

        $courseScope = $this->resolveLatestCourseScope($mahasiswa->id);
        $logs = $this->getScopedAchievementLogs($mahasiswa->id, $courseScope);
        $metrics = $this->buildAchievementMetrics($mahasiswa->id, $logs, $mahasiswa->total_points, $courseScope);
        $currentProgress = $this->resolveRequirementProgress(
            $badge->requirement_type,
            (int) $badge->requirement_value,
            $metrics,
        );
        if ($currentProgress < $badge->requirement_value) {
            return back()->with('error', 'Misi belum selesai. Selesaikan progres terlebih dahulu sebelum klaim badge.');
        }

        $claimed = \App\Models\Badge::award(
            $mahasiswa->id,
            $badge->code,
            'Claim manual dari halaman pencapaian'
        );

        if (!$claimed) {
            return back()->with('error', 'Badge gagal diklaim.');
        }

        return back()->with('success', "Badge {$badge->name} berhasil diklaim.");
    }

    /**
     * Calculate progress for each badge type
     * Returns current value for each badge type (target comes from badge requirement_value)
     */
    private function calculateBadgeProgress($mahasiswa, $logs, $currentStreak, $attendanceRate, $presentCount, $totalAttendance): array
    {
        $courseScope = $this->resolveLatestCourseScope($mahasiswa?->id);
        $metrics = $this->buildAchievementMetrics($mahasiswa?->id, $logs, $mahasiswa?->total_points ?? null, $courseScope);

        // Keep backward-compatible keys for callers that expect base badge code
        return [
            'streak_master' => ['current' => $metrics['longest_streak']],
            'perfect_attendance' => ['current' => $metrics['present_count']],
            'early_bird' => ['current' => $metrics['present_count']],
            'consistent' => ['current' => $metrics['total_attendance']],
            'champion' => ['current' => max(0, $metrics['total_students'] - $metrics['leaderboard_rank'] + 1)],
            'legend' => ['current' => $metrics['earned_badges_count']],
            'first_step' => ['current' => $metrics['total_attendance']],
            'ai_verified' => ['current' => $metrics['ai_verified_count']],
            'kas_hero' => ['current' => $metrics['kas_on_time_count']],
            'task_master' => ['current' => $metrics['task_on_time_count']],
            'social_star' => ['current' => $metrics['voting_count']],
            'speed_demon' => ['current' => $metrics['fast_attendance_count']],
        ];
    }

    private function normalizeCourseName(string $name): string
    {
        $normalized = mb_strtolower(trim($name));
        $normalized = preg_replace('/\s+/u', ' ', $normalized) ?? $normalized;

        return preg_replace('/[^\pL\pN\s]/u', '', $normalized) ?? $normalized;
    }

    private function resolveLatestCourseScope(?int $mahasiswaId): array
    {
        if (!$mahasiswaId) {
            return [
                'course_ids' => collect(),
                'start_at' => null,
            ];
        }

        $courses = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->select(['name', 'start_date', 'created_at'])
            ->orderByDesc('start_date')
            ->orderByDesc('created_at')
            ->get();

        if ($courses->isEmpty()) {
            return [
                'course_ids' => collect(),
                'start_at' => null,
            ];
        }

        $firstCourse = $courses->first();
        $latestStartAt = $firstCourse?->start_date
            ? Carbon::parse($firstCourse->start_date)->startOfDay()
            : $firstCourse?->created_at?->copy()->startOfDay();

        $latestCourses = $latestStartAt
            ? $courses->filter(function (MahasiswaCourse $course) use ($latestStartAt) {
                if ($course->start_date) {
                    return Carbon::parse($course->start_date)->isSameDay($latestStartAt);
                }

                return $course->created_at && $course->created_at->isSameDay($latestStartAt);
            })
            : $courses;

        if ($latestCourses->isEmpty()) {
            $latestCourses = collect([$firstCourse])->filter();
        }

        $normalizedNames = $latestCourses
            ->pluck('name')
            ->map(fn (?string $name) => $this->normalizeCourseName((string) $name))
            ->filter()
            ->unique()
            ->values();

        $courseIds = collect();
        if ($normalizedNames->isNotEmpty()) {
            $mataKuliahMap = MataKuliah::query()
                ->select(['id', 'nama'])
                ->get()
                ->keyBy(fn (MataKuliah $mk) => $this->normalizeCourseName((string) $mk->nama));

            $courseIds = $normalizedNames
                ->map(fn (string $name) => $mataKuliahMap->get($name)?->id)
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values();
        }

        return [
            'course_ids' => $courseIds,
            'start_at' => $latestStartAt,
        ];
    }

    private function getScopedAchievementLogs(?int $mahasiswaId, ?array $courseScope = null)
    {
        if (!$mahasiswaId) {
            return new \Illuminate\Database\Eloquent\Collection();
        }

        $courseScope ??= $this->resolveLatestCourseScope($mahasiswaId);
        $courseIds = collect($courseScope['course_ids'] ?? [])->filter()->values();
        $startAt = $courseScope['start_at'] ?? null;

        if ($startAt && !($startAt instanceof Carbon)) {
            $startAt = Carbon::parse($startAt)->startOfDay();
        }

        $query = AttendanceLog::query()
            ->with(['session'])
            ->where('mahasiswa_id', $mahasiswaId);

        if ($courseIds->isNotEmpty()) {
            $query->whereHas('session', function ($sessionQuery) use ($courseIds) {
                $sessionQuery->whereIn('course_id', $courseIds->all());
            });
        }

        if ($startAt) {
            $query->where(function ($dateQuery) use ($startAt) {
                $dateQuery
                    ->where('scanned_at', '>=', $startAt)
                    ->orWhereHas('session', function ($sessionQuery) use ($startAt) {
                        $sessionQuery->where('start_at', '>=', $startAt);
                    });
            });
        }

        return $query
            ->orderByDesc('scanned_at')
            ->get();
    }

    private function buildAchievementMetrics(?int $mahasiswaId, $logs, ?int $storedPoints = null, ?array $courseScope = null): array
    {
        if (!$mahasiswaId) {
            return [
                'total_sessions' => 0,
                'total_attendance' => 0,
                'present_count' => 0,
                'attendance_rate' => 0,
                'on_time_rate' => 0,
                'current_streak' => 0,
                'longest_streak' => 0,
                'earned_badges_count' => 0,
                'ai_verified_count' => 0,
                'kas_on_time_count' => 0,
                'task_on_time_count' => 0,
                'voting_count' => 0,
                'fast_attendance_count' => 0,
                'points' => 0,
                'leaderboard_rank' => 0,
                'total_students' => 0,
            ];
        }

        $courseScope ??= $this->resolveLatestCourseScope($mahasiswaId);
        $courseIds = collect($courseScope['course_ids'] ?? [])->filter()->values();
        $startAt = $courseScope['start_at'] ?? null;
        if ($startAt && !($startAt instanceof Carbon)) {
            $startAt = Carbon::parse($startAt)->startOfDay();
        }

        $logCollection = $logs instanceof \Illuminate\Database\Eloquent\Collection
            ? $logs
            : new \Illuminate\Database\Eloquent\Collection(collect($logs)->all());
        $logCollection->loadMissing(['session', 'selfieVerification']);

        $normalizedLogs = $this->normalizeAttendanceLogs($logCollection);
        $totalSessions = $normalizedLogs->count();
        $totalAttendance = $normalizedLogs->whereIn('status', ['present', 'late'])->count();
        $presentCount = $normalizedLogs->where('status', 'present')->count();
        $attendanceRate = $totalSessions > 0 ? (int) round(($totalAttendance / $totalSessions) * 100) : 0;
        $onTimeRate = $totalAttendance > 0 ? (int) round(($presentCount / $totalAttendance) * 100) : 0;

        $streaks = $this->calculateDailyStreaks($normalizedLogs);

        $earnedBadgesCount = (int) DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswaId)
            ->count();

        $aiVerifiedCount = (int) $normalizedLogs
            ->filter(fn ($log) => $log->selfieVerification?->status === 'approved')
            ->count();

        $kasOnTimeCount = 0;
        try {
            $kasQuery = DB::table('kas')
                ->where('mahasiswa_id', $mahasiswaId)
                ->where('type', 'income')
                ->where('status', 'paid');
            if ($startAt) {
                $kasQuery->whereDate('period_date', '>=', $startAt->toDateString());
            }
            $kasOnTimeCount = (int) $kasQuery->count();
        } catch (\Throwable $e) {
            $kasOnTimeCount = 0;
        }

        $taskOnTimeCount = 0;
        try {
            $taskQuery = DB::table('tugas_submissions as ts')
                ->join('tugas as t', 't.id', '=', 'ts.tugas_id')
                ->where('ts.mahasiswa_id', $mahasiswaId)
                ->whereNotNull('t.deadline')
                ->whereRaw('ts.submitted_at <= t.deadline');
            if ($courseIds->isNotEmpty()) {
                $taskQuery->whereIn('t.course_id', $courseIds->all());
            }
            if ($startAt) {
                $taskQuery->where('ts.submitted_at', '>=', $startAt);
            }
            $taskOnTimeCount = (int) $taskQuery->count();
        } catch (\Throwable $e) {
            $taskOnTimeCount = 0;
        }

        $votingCount = 0;
        try {
            $votingQuery = DB::table('kas_votes')
                ->where('mahasiswa_id', $mahasiswaId);
            if ($startAt) {
                $votingQuery->where('created_at', '>=', $startAt);
            }
            $votingCount = (int) $votingQuery->count();
        } catch (\Throwable $e) {
            $votingCount = 0;
        }

        $fastAttendanceCount = $normalizedLogs->filter(function ($log) {
            if (!in_array($log->status, ['present', 'late'], true)) {
                return false;
            }
            if (!$log->scanned_at || !$log->session?->start_at) {
                return false;
            }

            return $log->scanned_at->between(
                $log->session->start_at,
                $log->session->start_at->copy()->addMinute(),
            );
        })->count();

        $pointsQuery = DB::table('point_histories')
            ->where('mahasiswa_id', $mahasiswaId);
        if ($startAt) {
            $pointsQuery->where('created_at', '>=', $startAt);
        }
        $points = (int) $pointsQuery->sum('points');
        if (!$startAt && $storedPoints !== null) {
            $points = (int) $storedPoints;
        }

        $rank = (int) \App\Models\Mahasiswa::whereRaw('COALESCE(total_points, 0) > ?', [$points])->count() + 1;
        $totalStudents = (int) \App\Models\Mahasiswa::count();

        return [
            'total_sessions' => $totalSessions,
            'total_attendance' => $totalAttendance,
            'present_count' => $presentCount,
            'attendance_rate' => $attendanceRate,
            'on_time_rate' => $onTimeRate,
            'current_streak' => $streaks['current'],
            'longest_streak' => $streaks['longest'],
            'earned_badges_count' => $earnedBadgesCount,
            'ai_verified_count' => $aiVerifiedCount,
            'kas_on_time_count' => $kasOnTimeCount,
            'task_on_time_count' => $taskOnTimeCount,
            'voting_count' => $votingCount,
            'fast_attendance_count' => $fastAttendanceCount,
            'points' => $points,
            'leaderboard_rank' => $rank,
            'total_students' => $totalStudents,
        ];
    }

    private function normalizeAttendanceLogs($logs)
    {
        return collect($logs)
            ->sortByDesc('scanned_at')
            ->unique(function ($log) {
                return $log->attendance_session_id
                    ? 'session_' . $log->attendance_session_id
                    : 'log_' . $log->id;
            })
            ->values();
    }

    private function calculateDailyStreaks($logs): array
    {
        $dates = collect($logs)
            ->filter(fn ($log) => in_array($log->status, ['present', 'late'], true) && $log->scanned_at)
            ->map(fn ($log) => $log->scanned_at->toDateString())
            ->unique()
            ->sort()
            ->values();

        if ($dates->isEmpty()) {
            return ['current' => 0, 'longest' => 0];
        }

        $longest = 1;
        $running = 1;
        for ($i = 1; $i < $dates->count(); $i++) {
            $prev = Carbon::parse($dates[$i - 1]);
            $curr = Carbon::parse($dates[$i]);
            if ($prev->copy()->addDay()->isSameDay($curr)) {
                $running++;
            } else {
                $running = 1;
            }
            $longest = max($longest, $running);
        }

        $desc = $dates->sortDesc()->values();
        $current = 1;
        for ($i = 1; $i < $desc->count(); $i++) {
            $prev = Carbon::parse($desc[$i - 1]);
            $curr = Carbon::parse($desc[$i]);
            if ($prev->copy()->subDay()->isSameDay($curr)) {
                $current++;
            } else {
                break;
            }
        }

        return ['current' => $current, 'longest' => $longest];
    }

    private function resolveRequirementProgress(?string $requirementType, int $requirementValue, array $metrics): int
    {
        return match ($requirementType) {
            'streak_days' => (int) $metrics['longest_streak'],
            'perfect_sessions', 'on_time_sessions' => (int) $metrics['present_count'],
            'total_present', 'total_attendance' => (int) $metrics['total_attendance'],
            'ai_verification' => (int) $metrics['ai_verified_count'],
            'kas_on_time' => (int) $metrics['kas_on_time_count'],
            'task_on_time' => (int) $metrics['task_on_time_count'],
            'voting_participation' => (int) $metrics['voting_count'],
            'fast_attendance' => (int) $metrics['fast_attendance_count'],
            'total_badges' => (int) $metrics['earned_badges_count'],
            'leaderboard_rank' => max(0, $requirementValue - (int) $metrics['leaderboard_rank'] + 1),
            'attendance_percentage', 'attendance_percentage_month', 'attendance_percentage_semester',
            'consistent_month', 'consistent_quarter', 'consistent_semester' => (int) $metrics['attendance_rate'],
            default => 0,
        };
    }

    /**
     * Format requirement text for display
     */
    private function formatRequirement(\App\Models\Badge $badge): string
    {
        $value = $badge->requirement_value;
        
        return match($badge->requirement_type) {
            'streak_days' => "Hadir {$value} hari berturut-turut",
            'perfect_sessions' => "Hadir tepat waktu {$value} sesi",
            'attendance_percentage' => "Kehadiran {$value}% dalam 1 minggu",
            'attendance_percentage_month' => "Kehadiran {$value}% dalam 1 bulan",
            'attendance_percentage_semester' => "Kehadiran {$value}% dalam 1 semester",
            'on_time_sessions' => "Tidak terlambat dalam {$value} sesi",
            'total_present' => "Hadir sebanyak {$value} sesi",
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
        $earnedBadgeIds = DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->pluck('badge_id')
            ->toArray();
        
        // Get scoped attendance logs/metrics from latest course batch only
        $courseScope = $this->resolveLatestCourseScope($mahasiswa?->id);
        $logs = $this->getScopedAchievementLogs($mahasiswa?->id, $courseScope);
        $metrics = $this->buildAchievementMetrics($mahasiswa?->id, $logs, $mahasiswa?->total_points, $courseScope);
        
        // Build badge levels data - check EACH level independently based on its requirement_value
        $badgeLevels = $allBadges->map(function ($b) use ($earnedBadgeIds) {
            // Badge hanya terbuka jika sudah diklaim (ada di database)
            $isUnlocked = in_array($b->id, $earnedBadgeIds);
            
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
        
        // Get current/next level badge - check EACH level independently
        $currentBadge = null;
        $nextBadge = null;
        foreach ($allBadges as $b) {
            // Badge hanya terbuka jika sudah diklaim (ada di database)
            $isUnlocked = in_array($b->id, $earnedBadgeIds);
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
            ->map(function ($b) use ($earnedBadgeIds) {
                $isUnlocked = in_array($b->id, $earnedBadgeIds);
                return [
                    'type' => preg_replace('/_[0-9]+$/', '', $b->code),
                    'name' => preg_replace('/ I$/', '', $b->name),
                    'icon' => $b->icon,
                    'color' => $b->color,
                    'unlocked' => $isUnlocked,
                ];
            })->toArray();
        
        $progressBadge = $nextBadge ?: $currentBadge;
        $currentProgress = $this->resolveRequirementProgress(
            $progressBadge->requirement_type,
            (int) $progressBadge->requirement_value,
            $metrics,
        );
        $progressTarget = (int) $progressBadge->requirement_value;

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
                'current' => $currentProgress,
                'target' => $progressTarget,
                'percentage' => $progressTarget > 0
                    ? min(100, round(($currentProgress / $progressTarget) * 100))
                    : 0,
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

        // === REAL GAMIFICATION DATA ===
        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get();

        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $presentCount = $logs->where('status', 'present')->count();

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

        // XP / Points
        $points = $mahasiswa?->total_points ?? (($totalAttendance * 10) + ($currentStreak * 5) + ($presentCount * 2));
        $comboMultiplier = $currentStreak >= 7 ? 3 : ($currentStreak >= 3 ? 2 : 1);
        $baseXP = $totalAttendance > 0 ? 25 : 0;
        $xpGained = $baseXP * $comboMultiplier;

        // Rank
        $rank = \App\Models\Mahasiswa::where('total_points', '>', $mahasiswa?->total_points ?? 0)->count() + 1;
        $totalStudents = \App\Models\Mahasiswa::count();

        // === REAL ACHIEVEMENTS ===
        $earnedBadges = DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get()
            ->keyBy('badge_id');

        $allBadges = \App\Models\Badge::where('is_active', true)
            ->orderBy('badge_level')
            ->get();

        $badgeGroups = $allBadges->groupBy(function ($badge) {
            return preg_replace('/_[0-9]+$/', '', $badge->code);
        });

        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $progressData = $this->calculateBadgeProgress($mahasiswa, $logs, $currentStreak, $attendanceRate, $presentCount, $totalAttendance);

        $achievements = [];
        foreach ($badgeGroups as $baseCode => $badges) {
            $currentBadge = $badges->first(function ($badge) use ($earnedBadges) {
                return !isset($earnedBadges[$badge->id]);
            });
            if (!$currentBadge) {
                $currentBadge = $badges->last();
            }
            $isUnlocked = isset($earnedBadges[$currentBadge->id]);
            $progress = $progressData[$baseCode] ?? ['current' => 0];
            $achievements[] = [
                'id' => (string) $currentBadge->id,
                'name' => $currentBadge->name,
                'description' => $currentBadge->description,
                'icon' => $currentBadge->icon ?? '🏅',
                'unlocked' => $isUnlocked,
                'progress' => $progress['current'],
                'total' => $currentBadge->requirement_value,
            ];
        }

        // === REAL SOCIAL PROOF DATA ===
        // Find active sessions today
        $today = now()->toDateString();
        $activeSessionModels = \App\Models\AttendanceSession::with('course')
            ->whereDate('start_at', $today)
            ->where('is_active', true)
            ->get();
        $activeSessions = $activeSessionModels->pluck('id');

        $todayLogs = AttendanceLog::whereIn('attendance_session_id', $activeSessions)
            ->whereIn('status', ['present', 'late'])
            ->with('mahasiswa')
            ->latest('scanned_at')
            ->get();

        $attendedCount = $todayLogs->count();
        $isFirstAttendee = $attendedCount > 0 && $todayLogs->last()?->mahasiswa_id === $mahasiswa?->id;

        $recentAttendees = $todayLogs->take(5)->map(function ($log) {
            return $log->mahasiswa?->nama ?? 'Unknown';
        })->values()->toArray();

        // Leaderboard - top 5 by points
        $leaderboard = \App\Models\Mahasiswa::orderByDesc('total_points')
            ->limit(5)
            ->get()
            ->map(function ($m, $index) {
                // Calculate streak for each student
                $studentLogs = AttendanceLog::where('mahasiswa_id', $m->id)
                    ->whereIn('status', ['present', 'late'])
                    ->orderByDesc('scanned_at')
                    ->get();
                $streak = 0;
                $lastDate = null;
                foreach ($studentLogs as $sl) {
                    $d = $sl->scanned_at?->format('Y-m-d');
                    if ($lastDate === null || $lastDate === $d) {
                        $streak++;
                    } elseif ($lastDate && Carbon::parse($lastDate)->subDay()->format('Y-m-d') === $d) {
                        $streak++;
                    } else {
                        break;
                    }
                    $lastDate = $d;
                }
                return [
                    'rank' => $index + 1,
                    'name' => $m->nama,
                    'streak' => $streak,
                    'points' => $m->total_points ?? 0,
                ];
            })->toArray();

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
            // Active session info
            'activeSession' => $activeSessionModels->first() ? [
                'courseName' => $activeSessionModels->first()->course?->nama ?? 'Mata Kuliah',
                'meetingNumber' => $activeSessionModels->first()->meeting_number,
                'title' => $activeSessionModels->first()->title,
                'startAt' => $activeSessionModels->first()->start_at?->format('H:i'),
                'endAt' => $activeSessionModels->first()->end_at?->format('H:i'),
            ] : null,
            // Gamification data
            'gamification' => [
                'xpGained' => $xpGained,
                'currentStreak' => $currentStreak,
                'longestStreak' => $longestStreak,
                'totalPoints' => $points,
                'comboMultiplier' => $comboMultiplier,
                'leaderboardPosition' => $rank,
                'achievements' => $achievements,
            ],
            // Social proof data
            'socialProof' => [
                'totalStudents' => $totalStudents,
                'attendedCount' => $attendedCount,
                'isFirstAttendee' => $isFirstAttendee,
                'recentAttendees' => $recentAttendees,
                'leaderboard' => $leaderboard,
            ],
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
            $log = AttendanceLog::create([
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

            event(new \App\Events\LiveMonitorActivityEvent($log));

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

        // Parse device info JSON
        $deviceInfoRaw = $validated['device_info'] ?? '';
        $deviceData = [];
        if ($deviceInfoRaw && str_starts_with(trim($deviceInfoRaw), '{')) {
            $deviceData = json_decode($deviceInfoRaw, true) ?? [];
        }

        $deviceOs = $deviceData['os'] ?? $this->detectOs($deviceInfoRaw);
        $deviceType = $deviceData['device_type'] ?? 'mobile';
        $deviceModel = $deviceData['device_model'] ?? Str::limit($deviceInfoRaw, 120, '');
        $browser = $deviceData['browser'] ?? null;
        $userAgent = $deviceData['user_agent'] ?? $deviceInfoRaw;
        $platform = $deviceData['platform'] ?? null;
        $screenResolution = $deviceData['screen_resolution'] ?? null;
        $timezone = $deviceData['timezone'] ?? null;
        $ipAddress = $request->ip();

        // Generate device fingerprint
        $fingerprintData = json_encode([
            'ua' => $userAgent,
            'screen' => $screenResolution,
            'tz' => $timezone,
            'platform' => $platform,
        ]);
        $deviceFingerprint = hash('sha256', $fingerprintData);

        // Check if device is trusted (used before by this student)
        $isDeviceTrusted = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->where('device_fingerprint', $deviceFingerprint)
            ->exists();

        // Reverse geocode address (best-effort, non-blocking)
        $address = null;
        try {
            $geoResponse = Http::timeout(3)->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $latitude,
                'lon' => $longitude,
                'format' => 'json',
            ]);
            if ($geoResponse instanceof HttpResponse && $geoResponse->successful()) {
                $address = $geoResponse->json('display_name');
            }
        } catch (\Exception $e) {
            // Silently fail — address is optional
        }

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
            // Enhanced device info
            'device_os' => $deviceOs,
            'device_model' => $deviceModel,
            'device_type' => $deviceType,
            'browser' => $browser,
            'user_agent' => Str::limit($userAgent, 500, ''),
            'platform' => $platform,
            'screen_resolution' => $screenResolution,
            'timezone' => $timezone,
            'ip_address' => $ipAddress,
            'device_fingerprint' => $deviceFingerprint,
            'is_device_trusted' => $isDeviceTrusted,
            // Location
            'accuracy' => $accuracy,
            'address' => $address ? Str::limit($address, 500, '') : null,
        ]);

        event(new \App\Events\LiveMonitorActivityEvent($log));

        if ($path) {
            SelfieVerification::create([
                'attendance_log_id' => $log->id,
                'status' => 'pending',
            ]);

            // Dispatch AI verification job
            \App\Jobs\ProcessSelfieVerification::dispatch($log->id);
        }

        $statusLabel = $status === 'late' ? 'Terlambat' : 'Hadir';

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
            'warnings' => collect()
                // AttendanceWarning records
                ->merge(
                    $mahasiswa->attendanceWarnings()
                        ->latest()
                        ->get()
                        ->map(fn($w) => [
                            'id' => 'aw-' . $w->id,
                            'title' => $w->title,
                            'message' => $w->message,
                            'type' => $w->type,
                            'created_at' => $w->created_at->translatedFormat('d F Y, H:i'),
                            'is_read' => $w->is_read,
                            'sort_date' => $w->created_at,
                        ])
                )
                // AppNotification records (admin-sent warnings)
                ->merge(
                    AppNotification::where('notifiable_type', 'mahasiswa')
                        ->where('notifiable_id', $mahasiswa?->id)
                        ->whereIn('type', ['warning', 'alert', 'reminder'])
                        ->latest()
                        ->get()
                        ->map(fn($n) => [
                            'id' => 'an-' . $n->id,
                            'title' => $n->title,
                            'message' => $n->message,
                            'type' => $n->type === 'alert' ? 'warning' : $n->type,
                            'created_at' => $n->created_at->translatedFormat('d F Y, H:i'),
                            'is_read' => $n->read_at !== null,
                            'sort_date' => $n->created_at,
                        ])
                )
                ->sortByDesc('sort_date')
                ->map(fn($w) => collect($w)->except('sort_date')->toArray())
                ->values(),
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
