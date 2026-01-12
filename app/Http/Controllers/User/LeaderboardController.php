<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function index(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $period = $request->get('period', 'all'); // all, month, week

        // Build leaderboard
        $leaderboard = $this->buildLeaderboard($period);

        // Find current user's rank
        $myRank = null;
        $myStats = null;
        foreach ($leaderboard as $index => $entry) {
            if ($entry['id'] === $mahasiswa->id) {
                $myRank = $index + 1;
                $myStats = $entry;
                break;
            }
        }

        // Top 3 for podium
        $podium = array_slice($leaderboard, 0, 3);

        // Stats summary
        $totalStudents = Mahasiswa::count();
        $avgAttendanceRate = count($leaderboard) > 0 
            ? round(collect($leaderboard)->avg('attendance_rate'), 1) 
            : 0;

        return Inertia::render('user/leaderboard', [
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
            'leaderboard' => $leaderboard,
            'podium' => $podium,
            'myRank' => $myRank,
            'myStats' => $myStats,
            'stats' => [
                'total_students' => $totalStudents,
                'avg_attendance_rate' => $avgAttendanceRate,
            ],
            'period' => $period,
        ]);
    }

    private function buildLeaderboard(string $period): array
    {
        $query = AttendanceLog::query();

        // Filter by period
        if ($period === 'week') {
            $query->where('scanned_at', '>=', now()->startOfWeek());
        } elseif ($period === 'month') {
            $query->where('scanned_at', '>=', now()->startOfMonth());
        }

        // Get attendance stats per mahasiswa
        $stats = $query->select('mahasiswa_id')
            ->selectRaw('COUNT(*) as total_sessions')
            ->selectRaw('SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as total_attendance')
            ->selectRaw('SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_count')
            ->selectRaw('SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late_count')
            ->groupBy('mahasiswa_id')
            ->get()
            ->keyBy('mahasiswa_id');

        // Get all mahasiswa and calculate scores
        $mahasiswaList = Mahasiswa::all()->map(function ($mhs) use ($stats) {
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

            // Calculate streak
            $streak = $this->calculateStreak($mhs->id);

            // Calculate points
            // Points = (attendance * 10) + (present bonus * 5) + (streak * 3)
            $points = ($totalAttendance * 10) + ($presentCount * 5) + ($streak * 3);

            // Level based on points
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

        // Sort by points (descending), then by attendance_rate, then by on_time_rate
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
                    // Same day, continue
                    continue;
                } elseif (\Carbon\Carbon::parse($lastDate)->subDay()->format('Y-m-d') === $logDate) {
                    // Consecutive day
                    $streak++;
                    $lastDate = $logDate;
                } else {
                    // Streak broken
                    break;
                }
            } else {
                // Non-attendance breaks streak
                break;
            }
        }

        return $streak;
    }
}
