<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\FraudAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AdvancedAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $courseId = $request->get('course_id');
        
        $startDate = now()->subDays((int) $period)->startOfDay();
        $endDate = now()->endOfDay();

        return Inertia::render('admin/advanced-analytics', [
            'heatmapData' => $this->getHeatmapData($startDate, $endDate, $courseId),
            'trendAnalysis' => $this->getTrendAnalysis($startDate, $endDate, $courseId),
            'riskPrediction' => $this->getRiskPrediction($courseId),
            'hourlyDistribution' => $this->getHourlyDistribution($startDate, $endDate),
            'weekdayDistribution' => $this->getWeekdayDistribution($startDate, $endDate),
            'courseComparison' => $this->getCourseComparison(),
            'attendanceByMeeting' => $this->getAttendanceByMeeting($courseId),
            'studentPerformanceMatrix' => $this->getStudentPerformanceMatrix($courseId),
            'courses' => MataKuliah::orderBy('nama')->get(['id', 'nama']),
            'filters' => [
                'period' => $period,
                'course_id' => $courseId,
            ],
            'summary' => $this->getSummaryStats($startDate, $endDate),
        ]);
    }

    private function getHeatmapData($startDate, $endDate, $courseId = null)
    {
        $query = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate]);
        
        if ($courseId) {
            $sessionIds = AttendanceSession::where('course_id', $courseId)->pluck('id');
            $query->whereIn('attendance_session_id', $sessionIds);
        }

        $data = $query->selectRaw('
            DAYOFWEEK(scanned_at) as day_of_week,
            HOUR(scanned_at) as hour,
            COUNT(*) as total,
            SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late,
            SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
        ')
        ->groupBy('day_of_week', 'hour')
        ->get();

        $heatmap = [];
        $days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        foreach ($data as $row) {
            $heatmap[] = [
                'day' => $days[$row->day_of_week - 1],
                'dayIndex' => $row->day_of_week - 1,
                'hour' => sprintf('%02d:00', $row->hour),
                'hourIndex' => $row->hour,
                'total' => $row->total,
                'present' => $row->present,
                'late' => $row->late,
                'rejected' => $row->rejected,
                'rate' => $row->total > 0 ? round((($row->present + $row->late) / $row->total) * 100, 1) : 0,
            ];
        }

        return $heatmap;
    }

    private function getTrendAnalysis($startDate, $endDate, $courseId = null)
    {
        $query = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate]);
        
        if ($courseId) {
            $sessionIds = AttendanceSession::where('course_id', $courseId)->pluck('id');
            $query->whereIn('attendance_session_id', $sessionIds);
        }

        $dailyData = $query->selectRaw('
            DATE(scanned_at) as date,
            COUNT(*) as total,
            SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late,
            SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
        ')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        $trends = [];
        $movingAvg = [];
        
        foreach ($dailyData as $index => $row) {
            $rate = $row->total > 0 ? round((($row->present + $row->late) / $row->total) * 100, 1) : 0;
            $movingAvg[] = $rate;
            
            // Calculate 7-day moving average
            $ma7 = count($movingAvg) >= 7 
                ? round(array_sum(array_slice($movingAvg, -7)) / 7, 1)
                : round(array_sum($movingAvg) / count($movingAvg), 1);

            $trends[] = [
                'date' => Carbon::parse($row->date)->format('d M'),
                'fullDate' => $row->date,
                'total' => $row->total,
                'present' => $row->present,
                'late' => $row->late,
                'rejected' => $row->rejected,
                'rate' => $rate,
                'movingAverage' => $ma7,
            ];
        }

        // Calculate trend direction
        $trendDirection = 'stable';
        if (count($trends) >= 7) {
            $recent = array_slice($trends, -7);
            $firstHalf = array_sum(array_column(array_slice($recent, 0, 3), 'rate')) / 3;
            $secondHalf = array_sum(array_column(array_slice($recent, -3), 'rate')) / 3;
            
            if ($secondHalf > $firstHalf + 5) {
                $trendDirection = 'up';
            } elseif ($secondHalf < $firstHalf - 5) {
                $trendDirection = 'down';
            }
        }

        return [
            'data' => $trends,
            'direction' => $trendDirection,
            'avgRate' => count($trends) > 0 ? round(array_sum(array_column($trends, 'rate')) / count($trends), 1) : 0,
        ];
    }

    private function getRiskPrediction($courseId = null)
    {
        $query = Mahasiswa::query();
        
        $students = $query->withCount([
            'attendanceLogs as total_logs',
            'attendanceLogs as present_count' => fn($q) => $q->where('status', 'present'),
            'attendanceLogs as late_count' => fn($q) => $q->where('status', 'late'),
            'attendanceLogs as rejected_count' => fn($q) => $q->where('status', 'rejected'),
        ])->get();

        $riskStudents = [];
        $riskDistribution = ['safe' => 0, 'warning' => 0, 'danger' => 0, 'critical' => 0];

        foreach ($students as $student) {
            if ($student->total_logs == 0) continue;

            $attendanceRate = round((($student->present_count + $student->late_count) / $student->total_logs) * 100, 1);
            $absentCount = $student->rejected_count;
            
            // Risk calculation based on UNPAM rules (3x absent = can't take UAS)
            $riskScore = 0;
            $riskLevel = 'safe';
            
            if ($absentCount >= 3) {
                $riskScore = 100;
                $riskLevel = 'critical';
            } elseif ($absentCount == 2) {
                $riskScore = 75;
                $riskLevel = 'danger';
            } elseif ($absentCount == 1 || $attendanceRate < 75) {
                $riskScore = 50;
                $riskLevel = 'warning';
            } elseif ($attendanceRate < 85) {
                $riskScore = 25;
                $riskLevel = 'safe';
            }

            // Predict future risk based on trend
            $recentLogs = AttendanceLog::where('mahasiswa_id', $student->id)
                ->orderByDesc('scanned_at')
                ->take(5)
                ->pluck('status')
                ->toArray();
            
            $recentAbsent = count(array_filter($recentLogs, fn($s) => $s === 'rejected'));
            $predictedRisk = $riskScore;
            
            if ($recentAbsent >= 2) {
                $predictedRisk = min(100, $riskScore + 25);
            }

            $riskDistribution[$riskLevel]++;

            if ($riskLevel !== 'safe') {
                $riskStudents[] = [
                    'id' => $student->id,
                    'nama' => $student->nama,
                    'nim' => $student->nim,
                    'attendanceRate' => $attendanceRate,
                    'absentCount' => $absentCount,
                    'totalSessions' => $student->total_logs,
                    'riskScore' => $riskScore,
                    'predictedRisk' => $predictedRisk,
                    'riskLevel' => $riskLevel,
                    'recentTrend' => $recentAbsent > 0 ? 'declining' : 'stable',
                ];
            }
        }

        // Sort by risk score descending
        usort($riskStudents, fn($a, $b) => $b['riskScore'] <=> $a['riskScore']);

        return [
            'students' => array_slice($riskStudents, 0, 20),
            'distribution' => $riskDistribution,
            'totalAtRisk' => $riskDistribution['warning'] + $riskDistribution['danger'] + $riskDistribution['critical'],
        ];
    }

    private function getHourlyDistribution($startDate, $endDate)
    {
        $data = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate])
            ->selectRaw('
                HOUR(scanned_at) as hour,
                COUNT(*) as total,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late
            ')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $result = [];
        for ($h = 7; $h <= 21; $h++) {
            $row = $data->firstWhere('hour', $h);
            $result[] = [
                'hour' => sprintf('%02d:00', $h),
                'total' => $row->total ?? 0,
                'present' => $row->present ?? 0,
                'late' => $row->late ?? 0,
            ];
        }

        return $result;
    }

    private function getWeekdayDistribution($startDate, $endDate)
    {
        $data = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate])
            ->selectRaw('
                DAYOFWEEK(scanned_at) as day,
                COUNT(*) as total,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late
            ')
            ->groupBy('day')
            ->get();

        $days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $result = [];

        for ($d = 1; $d <= 7; $d++) {
            $row = $data->firstWhere('day', $d);
            $total = $row->total ?? 0;
            $present = ($row->present ?? 0) + ($row->late ?? 0);
            
            $result[] = [
                'day' => $days[$d - 1],
                'total' => $total,
                'present' => $row->present ?? 0,
                'late' => $row->late ?? 0,
                'rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
            ];
        }

        return $result;
    }

    private function getCourseComparison()
    {
        $courses = MataKuliah::with(['attendanceSessions.logs'])->get();
        
        $comparison = [];
        foreach ($courses as $course) {
            $totalLogs = 0;
            $presentLogs = 0;
            $lateLogs = 0;
            
            foreach ($course->attendanceSessions as $session) {
                foreach ($session->logs as $log) {
                    $totalLogs++;
                    if ($log->status === 'present') $presentLogs++;
                    if ($log->status === 'late') $lateLogs++;
                }
            }

            if ($totalLogs > 0) {
                $comparison[] = [
                    'id' => $course->id,
                    'nama' => $course->nama,
                    'totalSessions' => $course->attendanceSessions->count(),
                    'totalLogs' => $totalLogs,
                    'presentRate' => round(($presentLogs / $totalLogs) * 100, 1),
                    'lateRate' => round(($lateLogs / $totalLogs) * 100, 1),
                    'overallRate' => round((($presentLogs + $lateLogs) / $totalLogs) * 100, 1),
                ];
            }
        }

        usort($comparison, fn($a, $b) => $b['overallRate'] <=> $a['overallRate']);
        
        return $comparison;
    }

    private function getAttendanceByMeeting($courseId = null)
    {
        if (!$courseId) return [];

        $sessions = AttendanceSession::where('course_id', $courseId)
            ->withCount([
                'logs as total',
                'logs as present' => fn($q) => $q->where('status', 'present'),
                'logs as late' => fn($q) => $q->where('status', 'late'),
            ])
            ->orderBy('meeting_number')
            ->get();

        return $sessions->map(fn($s) => [
            'meeting' => $s->meeting_number,
            'title' => $s->title ?? "Pertemuan {$s->meeting_number}",
            'date' => $s->start_at?->format('d M'),
            'total' => $s->total,
            'present' => $s->present,
            'late' => $s->late,
            'rate' => $s->total > 0 ? round((($s->present + $s->late) / $s->total) * 100, 1) : 0,
        ])->toArray();
    }

    private function getStudentPerformanceMatrix($courseId = null)
    {
        $query = Mahasiswa::query();
        
        if ($courseId) {
            $sessionIds = AttendanceSession::where('course_id', $courseId)->pluck('id');
            $query->whereHas('attendanceLogs', fn($q) => $q->whereIn('attendance_session_id', $sessionIds));
        }

        $students = $query->withCount([
            'attendanceLogs as total',
            'attendanceLogs as present' => fn($q) => $q->where('status', 'present'),
            'attendanceLogs as late' => fn($q) => $q->where('status', 'late'),
        ])
        ->having('total', '>', 0)
        ->orderByDesc('present')
        ->take(50)
        ->get();

        return $students->map(fn($s) => [
            'id' => $s->id,
            'nama' => $s->nama,
            'nim' => $s->nim,
            'total' => $s->total,
            'present' => $s->present,
            'late' => $s->late,
            'absent' => $s->total - $s->present - $s->late,
            'rate' => round((($s->present + $s->late) / $s->total) * 100, 1),
        ])->toArray();
    }

    private function getSummaryStats($startDate, $endDate)
    {
        $logs = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate]);
        
        $total = $logs->count();
        $present = (clone $logs)->where('status', 'present')->count();
        $late = (clone $logs)->where('status', 'late')->count();
        
        return [
            'totalScans' => $total,
            'presentCount' => $present,
            'lateCount' => $late,
            'rejectedCount' => $total - $present - $late,
            'overallRate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
            'activeSessions' => AttendanceSession::where('is_active', true)->count(),
            'totalStudents' => Mahasiswa::count(),
        ];
    }
}
