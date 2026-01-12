<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->get('period', 'all');
        $kelas = $request->get('kelas', 'all');

        $leaderboard = $this->buildLeaderboard($period, $kelas);

        // Top 3 for podium
        $podium = array_slice($leaderboard, 0, 3);

        // Stats
        $totalStudents = Mahasiswa::count();
        $avgAttendanceRate = count($leaderboard) > 0 
            ? round(collect($leaderboard)->avg('attendance_rate'), 1) 
            : 0;
        $avgPoints = count($leaderboard) > 0 
            ? round(collect($leaderboard)->avg('points'), 0) 
            : 0;

        // Get unique kelas
        $kelasList = Mahasiswa::distinct()->pluck('kelas')->filter()->values();

        return Inertia::render('admin/leaderboard', [
            'leaderboard' => $leaderboard,
            'podium' => $podium,
            'stats' => [
                'total_students' => $totalStudents,
                'avg_attendance_rate' => $avgAttendanceRate,
                'avg_points' => $avgPoints,
            ],
            'kelasList' => $kelasList,
            'filters' => [
                'period' => $period,
                'kelas' => $kelas,
            ],
        ]);
    }

    private function buildLeaderboard(string $period, string $kelas): array
    {
        $query = AttendanceLog::query();

        if ($period === 'week') {
            $query->where('scanned_at', '>=', now()->startOfWeek());
        } elseif ($period === 'month') {
            $query->where('scanned_at', '>=', now()->startOfMonth());
        }

        $stats = $query->select('mahasiswa_id')
            ->selectRaw('COUNT(*) as total_sessions')
            ->selectRaw('SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as total_attendance')
            ->selectRaw('SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_count')
            ->selectRaw('SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late_count')
            ->groupBy('mahasiswa_id')
            ->get()
            ->keyBy('mahasiswa_id');

        $mahasiswaQuery = Mahasiswa::query();
        if ($kelas !== 'all') {
            $mahasiswaQuery->where('kelas', $kelas);
        }

        $mahasiswaList = $mahasiswaQuery->get()->map(function ($mhs) use ($stats) {
            $stat = $stats->get($mhs->id);
            
            $totalSessions = $stat?->total_sessions ?? 0;
            $totalAttendance = $stat?->total_attendance ?? 0;
            $presentCount = $stat?->present_count ?? 0;
            $lateCount = $stat?->late_count ?? 0;

            $attendanceRate = $totalSessions > 0 
                ? round(($totalAttendance / $totalSessions) * 100, 1) 
                : 0;

            $onTimeRate = $totalAttendance > 0 
                ? round(($presentCount / $totalAttendance) * 100, 1) 
                : 0;

            $streak = $this->calculateStreak($mhs->id);
            $points = ($totalAttendance * 10) + ($presentCount * 5) + ($streak * 3);
            $level = (int) floor($points / 100) + 1;

            return [
                'id' => $mhs->id,
                'nama' => $mhs->nama,
                'nim' => $mhs->nim,
                'kelas' => $mhs->kelas,
                'avatar_url' => $mhs->avatar_url,
                'total_sessions' => $totalSessions,
                'total_attendance' => $totalAttendance,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'attendance_rate' => $attendanceRate,
                'on_time_rate' => $onTimeRate,
                'streak' => $streak,
                'points' => $points,
                'level' => $level,
            ];
        });

        return $mahasiswaList
            ->sortByDesc(function ($item) {
                return $item['points'] * 10000 + $item['attendance_rate'] * 100 + $item['on_time_rate'];
            })
            ->values()
            ->toArray();
    }

    private function calculateStreak(int $mahasiswaId): int
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->orderBy('scanned_at', 'desc')
            ->get();

        $streak = 0;
        $lastDate = null;

        foreach ($logs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $logDate = $log->scanned_at?->format('Y-m-d');
                
                if ($lastDate === null) {
                    $streak = 1;
                    $lastDate = $logDate;
                } elseif ($lastDate === $logDate) {
                    continue;
                } elseif (\Carbon\Carbon::parse($lastDate)->subDay()->format('Y-m-d') === $logDate) {
                    $streak++;
                    $lastDate = $logDate;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return $streak;
    }
}
