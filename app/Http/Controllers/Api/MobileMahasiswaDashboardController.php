<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileMahasiswaDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();
        $now = Carbon::now();

        // ── Profile ──
        $profile = [
            'id' => $mahasiswa->id,
            'nim' => $mahasiswa->nim,
            'name' => $mahasiswa->nama ?? $mahasiswa->name ?? '',
            'email' => $mahasiswa->email,
            'prodi' => $mahasiswa->prodi,
            'semester' => $mahasiswa->semester,
            'avatar' => $mahasiswa->avatar_url ?? null,
        ];

        // ── Logs for this student ──
        $allLogs = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)->get();
        $totalSessions = AttendanceSession::where('end_at', '<', $now)->count();
        $totalSessions = max($totalSessions, 1);

        $presentCount = $allLogs->whereIn('status', ['present', 'hadir'])->count();
        $lateCount = $allLogs->whereIn('status', ['late', 'terlambat'])->count();
        $totalAttendance = $presentCount + $lateCount;
        $attendanceRate = round(($totalAttendance / $totalSessions) * 100, 1);
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100, 1) : 0;

        // ── Streak ──
        $currentStreak = $this->calculateCurrentStreak($mahasiswa->id);
        $longestStreak = $this->calculateLongestStreak($mahasiswa->id);

        // ── This week ──
        $startOfWeek = $now->copy()->startOfWeek();
        $endOfWeek = $now->copy()->endOfWeek();
        $thisWeekLogs = $allLogs->filter(function ($log) use ($startOfWeek, $endOfWeek) {
            $scanned = Carbon::parse($log->scanned_at);
            return $scanned->between($startOfWeek, $endOfWeek);
        });
        $thisWeekAttendance = $thisWeekLogs->whereIn('status', ['present', 'hadir', 'late', 'terlambat'])->count();
        $thisWeekTotal = AttendanceSession::whereBetween('start_at', [$startOfWeek, $endOfWeek])->count();

        $stats = [
            'totalAttendance' => $totalAttendance,
            'totalSessions' => $totalSessions,
            'attendanceRate' => min($attendanceRate, 100),
            'currentStreak' => $currentStreak,
            'longestStreak' => $longestStreak,
            'onTimeRate' => min($onTimeRate, 100),
            'thisWeekAttendance' => $thisWeekAttendance,
            'thisWeekTotal' => max($thisWeekTotal, 0),
        ];

        // ── Today attendance ──
        $todayLog = AttendanceLog::with(['session.course', 'session.dosen'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->whereDate('scanned_at', $now->toDateString())
            ->latest('scanned_at')
            ->first();

        $todayAttendance = null;
        if ($todayLog) {
            $session = $todayLog->session;
            $course = $session?->course;
            $dosen = $session?->dosen;
            $todayAttendance = [
                'status' => $todayLog->status ?? 'present',
                'check_in' => optional($todayLog->scanned_at)->format('H:i:s'),
                'check_out' => null,
                'session' => [
                    'mata_kuliah' => $course?->nama ?? $session?->title,
                    'dosen' => $dosen?->name,
                    'room' => $session?->zona,
                ],
            ];
        }

        // ── Upcoming sessions ──
        $upcoming = AttendanceSession::with('course')
            ->where('start_at', '>', $now)
            ->orderBy('start_at')
            ->limit(3)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'title' => $s->title ?? "Pertemuan {$s->meeting_number}",
                'course_name' => $s->course?->nama ?? $s->title ?? '-',
                'meeting_number' => $s->meeting_number,
                'start_at' => $s->start_at->toIso8601String(),
                'end_at' => $s->end_at->toIso8601String(),
            ]);

        // ── Recent activity ──
        $recentLogs = AttendanceLog::with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->orderByDesc('scanned_at')
            ->limit(5)
            ->get();

        $recentActivity = $recentLogs->map(function ($log) use ($now) {
            $session = $log->session;
            $courseName = $session?->course?->nama ?? $session?->title ?? '-';
            $meeting = $session?->meeting_number ?? '?';
            $status = match ($log->status) {
                'present', 'hadir' => 'success',
                'late', 'terlambat' => 'warning',
                default => 'error',
            };
            $statusLabel = match ($log->status) {
                'present', 'hadir' => 'Hadir',
                'late', 'terlambat' => 'Terlambat',
                default => 'Tidak Hadir',
            };
            $scanned = Carbon::parse($log->scanned_at);

            return [
                'id' => $log->id,
                'type' => 'attendance',
                'message' => "{$statusLabel} di {$courseName} - Pertemuan {$meeting}",
                'time' => $scanned->diffForHumans($now),
                'status' => $status,
            ];
        });

        // ── Achievements ──
        $achievements = [
            [
                'type' => 'streak',
                'value' => $currentStreak,
                'unlocked' => $currentStreak >= 3,
                'title' => 'Streak Master',
                'description' => '3 hari berturut-turut hadir',
                'icon' => '🔥',
            ],
            [
                'type' => 'perfect',
                'value' => null,
                'unlocked' => $attendanceRate >= 100,
                'title' => 'Perfect Score',
                'description' => 'Kehadiran 100%',
                'icon' => '⭐',
            ],
            [
                'type' => 'early',
                'value' => null,
                'unlocked' => $onTimeRate >= 90,
                'title' => 'Early Bird',
                'description' => 'Tepat waktu 90%+',
                'icon' => '⚡',
            ],
            [
                'type' => 'consistent',
                'value' => null,
                'unlocked' => $attendanceRate >= 80,
                'title' => 'Konsisten',
                'description' => 'Kehadiran 80%+',
                'icon' => '🎯',
            ],
            [
                'type' => 'champion',
                'value' => null,
                'unlocked' => $longestStreak >= 10,
                'title' => 'Champion',
                'description' => 'Streak 10+ hari',
                'icon' => '🏆',
            ],
            [
                'type' => 'legend',
                'value' => null,
                'unlocked' => $totalAttendance >= 50,
                'title' => 'Legend',
                'description' => '50+ kehadiran',
                'icon' => '👑',
            ],
        ];

        // ── Chart data: weekly ──
        $weekly = [];
        $dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dayIndex = ($date->dayOfWeekIso - 1) % 7;
            $dayLogs = $allLogs->filter(fn ($l) => Carbon::parse($l->scanned_at)->toDateString() === $date->toDateString());
            $weekly[] = [
                'label' => $dayNames[$dayIndex],
                'present' => $dayLogs->whereIn('status', ['present', 'hadir'])->count(),
                'late' => $dayLogs->whereIn('status', ['late', 'terlambat'])->count(),
                'absent' => 0,
            ];
        }

        // ── Chart data: distribution ──
        $absentCount = max(0, $totalSessions - $totalAttendance);
        $distribution = [
            ['label' => 'Hadir', 'value' => $presentCount, 'color' => '#10b981'],
            ['label' => 'Terlambat', 'value' => $lateCount, 'color' => '#f59e0b'],
            ['label' => 'Tidak Hadir', 'value' => $absentCount, 'color' => '#f43f5e'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => $profile,
                'stats' => $stats,
                'todayAttendance' => $todayAttendance,
                'upcomingSessions' => $upcoming,
                'recentActivity' => $recentActivity,
                'achievements' => $achievements,
                'unreadNotifications' => 0,
                'chartData' => [
                    'weekly' => $weekly,
                    'monthly' => [],
                    'daily' => [],
                    'distribution' => $distribution,
                ],
            ],
        ]);
    }

    private function calculateCurrentStreak(int $mahasiswaId): int
    {
        $streak = 0;
        $date = Carbon::today();

        for ($i = 0; $i < 365; $i++) {
            $hasAttendance = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
                ->whereDate('scanned_at', $date->toDateString())
                ->whereIn('status', ['present', 'hadir', 'late', 'terlambat'])
                ->exists();

            $hasSession = AttendanceSession::whereDate('start_at', $date->toDateString())
                ->where('end_at', '<', Carbon::now())
                ->exists();

            if (! $hasSession) {
                $date->subDay();
                continue;
            }

            if ($hasAttendance) {
                $streak++;
                $date->subDay();
            } else {
                break;
            }
        }

        return $streak;
    }

    private function calculateLongestStreak(int $mahasiswaId): int
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereIn('status', ['present', 'hadir', 'late', 'terlambat'])
            ->orderBy('scanned_at')
            ->pluck('scanned_at')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        if ($logs->isEmpty()) {
            return 0;
        }

        $longest = 1;
        $current = 1;

        for ($i = 1; $i < $logs->count(); $i++) {
            $prev = Carbon::parse($logs[$i - 1]);
            $curr = Carbon::parse($logs[$i]);
            if ($curr->diffInDays($prev) === 1) {
                $current++;
                $longest = max($longest, $current);
            } else {
                $current = 1;
            }
        }

        return $longest;
    }
}
