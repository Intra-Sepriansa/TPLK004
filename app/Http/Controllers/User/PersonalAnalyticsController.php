<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MahasiswaBadge;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class PersonalAnalyticsController extends Controller
{
    public function index()
    {
        $mahasiswa = Auth::guard('web')->user();

        return Inertia::render('user/personal-analytics', [
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
            'overview' => $this->getOverview($mahasiswa->id),
            'streakData' => $this->getStreakData($mahasiswa->id),
            'courseBreakdown' => $this->getCourseBreakdown($mahasiswa->id),
            'weeklyTrend' => $this->getWeeklyTrend($mahasiswa->id),
            'monthlyCalendar' => $this->getMonthlyCalendar($mahasiswa->id),
            'comparison' => $this->getClassComparison($mahasiswa->id),
            'badges' => $this->getBadges($mahasiswa->id),
            'tips' => $this->getImprovementTips($mahasiswa->id),
        ]);
    }

    private function getOverview(int $mahasiswaId): array
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)->get();
        
        $total = $logs->count();
        $present = $logs->where('status', 'present')->count();
        $late = $logs->where('status', 'late')->count();
        $absent = $logs->whereIn('status', ['rejected', 'absent'])->count();

        // This month
        $thisMonth = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereMonth('scanned_at', now()->month)
            ->whereYear('scanned_at', now()->year)
            ->get();

        $monthTotal = $thisMonth->count();
        $monthPresent = $thisMonth->whereIn('status', ['present', 'late'])->count();

        // Last month for comparison
        $lastMonth = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereMonth('scanned_at', now()->subMonth()->month)
            ->whereYear('scanned_at', now()->subMonth()->year)
            ->get();

        $lastMonthTotal = $lastMonth->count();
        $lastMonthPresent = $lastMonth->whereIn('status', ['present', 'late'])->count();

        $currentRate = $monthTotal > 0 ? round(($monthPresent / $monthTotal) * 100, 1) : 0;
        $lastRate = $lastMonthTotal > 0 ? round(($lastMonthPresent / $lastMonthTotal) * 100, 1) : 0;
        $trend = $currentRate - $lastRate;

        return [
            'total_sessions' => $total,
            'present' => $present,
            'late' => $late,
            'absent' => $absent,
            'overall_rate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
            'on_time_rate' => ($present + $late) > 0 ? round(($present / ($present + $late)) * 100, 1) : 0,
            'this_month_rate' => $currentRate,
            'trend' => $trend,
            'trend_direction' => $trend > 0 ? 'up' : ($trend < 0 ? 'down' : 'stable'),
        ];
    }

    private function getStreakData(int $mahasiswaId): array
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereIn('status', ['present', 'late'])
            ->orderByDesc('scanned_at')
            ->pluck('scanned_at')
            ->map(fn($date) => $date->toDateString())
            ->unique()
            ->values();

        if ($logs->isEmpty()) {
            return [
                'current_streak' => 0,
                'longest_streak' => 0,
                'last_attendance' => null,
            ];
        }

        // Calculate current streak
        $currentStreak = 0;
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        // Check if attended today or yesterday
        if ($logs->first() === $today || $logs->first() === $yesterday) {
            $currentStreak = 1;
            $prevDate = $logs->first();

            foreach ($logs->skip(1) as $date) {
                $diff = Carbon::parse($prevDate)->diffInDays(Carbon::parse($date));
                if ($diff === 1) {
                    $currentStreak++;
                    $prevDate = $date;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        $longestStreak = 1;
        $tempStreak = 1;
        $prevDate = $logs->first();

        foreach ($logs->skip(1) as $date) {
            $diff = Carbon::parse($prevDate)->diffInDays(Carbon::parse($date));
            if ($diff === 1) {
                $tempStreak++;
                $longestStreak = max($longestStreak, $tempStreak);
            } else {
                $tempStreak = 1;
            }
            $prevDate = $date;
        }

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $longestStreak,
            'last_attendance' => $logs->first(),
            'streak_history' => $logs->take(30)->toArray(),
        ];
    }

    private function getCourseBreakdown(int $mahasiswaId): array
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->with('session.course')
            ->get();

        $byCourse = $logs->groupBy(fn($log) => $log->session?->course_id);

        return $byCourse->map(function ($courseLogs, $courseId) {
            $course = $courseLogs->first()?->session?->course;
            $total = $courseLogs->count();
            $present = $courseLogs->where('status', 'present')->count();
            $late = $courseLogs->where('status', 'late')->count();
            $absent = $courseLogs->whereIn('status', ['rejected', 'absent'])->count();

            return [
                'course_id' => $courseId,
                'course_name' => $course?->nama ?? 'Unknown',
                'total' => $total,
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'rate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
                'can_take_uas' => $absent < 3,
            ];
        })->values()->toArray();
    }

    private function getWeeklyTrend(int $mahasiswaId): array
    {
        $result = [];
        
        for ($i = 7; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $log = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
                ->whereDate('scanned_at', $date->toDateString())
                ->first();

            $result[] = [
                'date' => $date->format('d M'),
                'day' => $date->format('D'),
                'status' => $log?->status ?? 'none',
                'time' => $log?->scanned_at?->format('H:i'),
            ];
        }

        return $result;
    }

    private function getMonthlyCalendar(int $mahasiswaId): array
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereBetween('scanned_at', [$startOfMonth, $endOfMonth])
            ->get()
            ->keyBy(fn($log) => $log->scanned_at->toDateString());

        $calendar = [];
        $current = $startOfMonth->copy();

        while ($current <= $endOfMonth) {
            $dateStr = $current->toDateString();
            $log = $logs->get($dateStr);

            $calendar[] = [
                'date' => $dateStr,
                'day' => $current->day,
                'dayOfWeek' => $current->dayOfWeek,
                'status' => $log?->status ?? null,
                'isToday' => $current->isToday(),
                'isPast' => $current->isPast() && !$current->isToday(),
            ];

            $current->addDay();
        }

        return $calendar;
    }

    private function getClassComparison(int $mahasiswaId): array
    {
        // Get student's rate
        $myLogs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)->get();
        $myTotal = $myLogs->count();
        $myPresent = $myLogs->whereIn('status', ['present', 'late'])->count();
        $myRate = $myTotal > 0 ? round(($myPresent / $myTotal) * 100, 1) : 0;

        // Get class average
        $allLogs = AttendanceLog::selectRaw('
            mahasiswa_id,
            COUNT(*) as total,
            SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as present
        ')
        ->groupBy('mahasiswa_id')
        ->get();

        $rates = $allLogs->map(fn($row) => $row->total > 0 ? ($row->present / $row->total) * 100 : 0);
        $classAverage = $rates->count() > 0 ? round($rates->avg(), 1) : 0;

        // Calculate rank
        $rank = $rates->filter(fn($rate) => $rate > $myRate)->count() + 1;
        $totalStudents = $rates->count();

        // Percentile
        $percentile = $totalStudents > 0 ? round((($totalStudents - $rank + 1) / $totalStudents) * 100) : 0;

        return [
            'my_rate' => $myRate,
            'class_average' => $classAverage,
            'difference' => round($myRate - $classAverage, 1),
            'rank' => $rank,
            'total_students' => $totalStudents,
            'percentile' => $percentile,
            'status' => $myRate >= $classAverage ? 'above' : 'below',
        ];
    }

    private function getBadges(int $mahasiswaId): array
    {
        return MahasiswaBadge::where('mahasiswa_id', $mahasiswaId)
            ->orderByDesc('earned_at')
            ->get()
            ->map(fn($badge) => [
                'id' => $badge->id,
                'name' => $badge->badge_name,
                'description' => $badge->badge_description,
                'image' => $badge->badge_image,
                'earned_at' => $badge->earned_at?->format('d M Y'),
            ])
            ->toArray();
    }

    private function getImprovementTips(int $mahasiswaId): array
    {
        $tips = [];
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)->get();

        $total = $logs->count();
        $present = $logs->where('status', 'present')->count();
        $late = $logs->where('status', 'late')->count();
        $absent = $logs->whereIn('status', ['rejected', 'absent'])->count();

        $rate = $total > 0 ? ($present + $late) / $total * 100 : 0;
        $onTimeRate = ($present + $late) > 0 ? $present / ($present + $late) * 100 : 0;

        if ($rate < 75) {
            $tips[] = [
                'type' => 'warning',
                'title' => 'Tingkatkan Kehadiran',
                'message' => 'Kehadiran kamu di bawah 75%. Usahakan untuk hadir di setiap pertemuan.',
            ];
        }

        if ($onTimeRate < 80 && $late > 2) {
            $tips[] = [
                'type' => 'info',
                'title' => 'Datang Lebih Awal',
                'message' => "Kamu sudah {$late}x terlambat. Coba datang 10-15 menit lebih awal.",
            ];
        }

        if ($absent >= 2) {
            $remaining = 3 - $absent;
            $tips[] = [
                'type' => $absent >= 3 ? 'danger' : 'warning',
                'title' => 'Perhatian Kehadiran',
                'message' => $absent >= 3 
                    ? 'Kamu sudah 3x tidak hadir dan tidak dapat mengikuti UAS.'
                    : "Sisa kesempatan tidak hadir: {$remaining}x sebelum tidak bisa ikut UAS.",
            ];
        }

        if ($rate >= 90 && $onTimeRate >= 90) {
            $tips[] = [
                'type' => 'success',
                'title' => 'Pertahankan!',
                'message' => 'Kehadiran kamu sangat baik! Terus pertahankan konsistensi ini.',
            ];
        }

        if (empty($tips)) {
            $tips[] = [
                'type' => 'info',
                'title' => 'Tips Umum',
                'message' => 'Pastikan selalu absen tepat waktu dan jaga streak kehadiran kamu!',
            ];
        }

        return $tips;
    }
}
