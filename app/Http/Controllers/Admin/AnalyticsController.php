<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use App\Models\AttendanceSession;
use App\Models\AnalyticsEvent;
use App\Models\DailyMetric;
use App\Models\Prediction;
use App\Models\Anomaly;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'week'); // day, week, month, year
        $startDate = $this->getStartDate($period);
        $endDate = now();

        return Inertia::render('admin/analytics', [
            'stats' => $this->getOverviewStats($startDate, $endDate),
            'attendanceTrend' => $this->getAttendanceTrend($startDate, $endDate),
            'heatmapData' => $this->getHeatmapData($startDate, $endDate),
            'courseComparison' => $this->getCourseComparison($startDate, $endDate),
            'deviceDistribution' => $this->getDeviceDistribution($startDate, $endDate),
            'hourlyPattern' => $this->getHourlyPattern($startDate, $endDate),
            'predictions' => $this->getPredictions(),
            'anomalies' => $this->getRecentAnomalies(),
            'topPerformers' => $this->getTopPerformers($startDate, $endDate),
            'atRiskStudents' => $this->getAtRiskStudents(),
            'period' => $period,
        ]);
    }

    private function getStartDate(string $period): Carbon
    {
        return match($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfWeek(),
        };
    }

    private function getOverviewStats($startDate, $endDate): array
    {
        $totalSessions = AttendanceSession::whereBetween('start_at', [$startDate, $endDate])->count();
        $totalAttendance = AttendanceLog::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalStudents = Mahasiswa::count();
        
        $attendanceRate = $totalSessions > 0 
            ? round(($totalAttendance / ($totalSessions * $totalStudents)) * 100, 2)
            : 0;

        $previousPeriod = $startDate->copy()->sub($endDate->diffInDays($startDate), 'days');
        $previousAttendance = AttendanceLog::whereBetween('created_at', [$previousPeriod, $startDate])->count();
        $previousSessions = AttendanceSession::whereBetween('start_at', [$previousPeriod, $startDate])->count();
        $previousRate = $previousSessions > 0 
            ? round(($previousAttendance / ($previousSessions * $totalStudents)) * 100, 2)
            : 0;

        $rateChange = $previousRate > 0 ? round((($attendanceRate - $previousRate) / $previousRate) * 100, 2) : 0;

        return [
            'total_sessions' => $totalSessions,
            'total_attendance' => $totalAttendance,
            'attendance_rate' => $attendanceRate,
            'rate_change' => $rateChange,
            'total_students' => $totalStudents,
            'active_students' => AttendanceLog::whereBetween('created_at', [$startDate, $endDate])
                ->distinct('mahasiswa_id')
                ->count('mahasiswa_id'),
        ];
    }

    private function getAttendanceTrend($startDate, $endDate): array
    {
        $days = $endDate->diffInDays($startDate) + 1;
        $data = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $attendance = AttendanceLog::whereDate('created_at', $date)->count();
            $sessions = AttendanceSession::whereDate('start_at', $date)->count();
            
            $data[] = [
                'date' => $date->format('Y-m-d'),
                'attendance' => $attendance,
                'sessions' => $sessions,
                'rate' => $sessions > 0 ? round(($attendance / ($sessions * Mahasiswa::count())) * 100, 2) : 0,
            ];
        }

        return $data;
    }

    private function getHeatmapData($startDate, $endDate): array
    {
        $heatmap = AttendanceLog::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DAYOFWEEK(created_at) as day_of_week'),
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('day_of_week', 'hour')
            ->get()
            ->map(function ($item) {
                return [
                    'day' => $item->day_of_week,
                    'hour' => $item->hour,
                    'value' => $item->count,
                ];
            });

        return $heatmap->toArray();
    }

    private function getCourseComparison($startDate, $endDate): array
    {
        return AttendanceSession::with('course')
            ->whereBetween('start_at', [$startDate, $endDate])
            ->get()
            ->groupBy('course_id')
            ->map(function ($sessions, $courseId) {
                $course = $sessions->first()->course;
                $totalSessions = $sessions->count();
                $totalAttendance = AttendanceLog::whereIn(
                    'attendance_session_id',
                    $sessions->pluck('id')
                )->count();

                return [
                    'course_name' => $course->nama ?? 'Unknown',
                    'sessions' => $totalSessions,
                    'attendance' => $totalAttendance,
                    'rate' => $totalSessions > 0 
                        ? round(($totalAttendance / ($totalSessions * Mahasiswa::count())) * 100, 2)
                        : 0,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getDeviceDistribution($startDate, $endDate): array
    {
        return AnalyticsEvent::whereBetween('created_at', [$startDate, $endDate])
            ->where('event_type', 'attendance_scan')
            ->select('device_type', DB::raw('COUNT(*) as count'))
            ->groupBy('device_type')
            ->get()
            ->map(function ($item) {
                return [
                    'device' => $item->device_type ?? 'Unknown',
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    private function getHourlyPattern($startDate, $endDate): array
    {
        return AttendanceLog::whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    private function getPredictions(): array
    {
        return Prediction::where('prediction_date', '>=', now())
            ->where('prediction_type', 'attendance')
            ->orderBy('prediction_date')
            ->limit(7)
            ->get()
            ->map(function ($prediction) {
                return [
                    'date' => $prediction->prediction_date->format('Y-m-d'),
                    'predicted_rate' => $prediction->predicted_value,
                    'confidence' => $prediction->confidence_score,
                ];
            })
            ->toArray();
    }

    private function getRecentAnomalies(): array
    {
        return Anomaly::with(['subject'])
            ->where('status', '!=', 'resolved')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($anomaly) {
                return [
                    'id' => $anomaly->id,
                    'type' => $anomaly->anomaly_type,
                    'severity' => $anomaly->severity,
                    'description' => $anomaly->description,
                    'created_at' => $anomaly->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    private function getTopPerformers($startDate, $endDate): array
    {
        return Mahasiswa::withCount([
            'attendanceLogs as attendance_count' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
        ])
        ->orderBy('attendance_count', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->nama,
                'nim' => $student->nim,
                'attendance_count' => $student->attendance_count,
            ];
        })
        ->toArray();
    }

    private function getAtRiskStudents(): array
    {
        $threshold = 75; // Below 75% attendance is at risk
        
        return Mahasiswa::select('mahasiswa.*')
            ->selectRaw('
                (SELECT COUNT(*) FROM attendance_logs WHERE mahasiswa_id = mahasiswa.id) as total_attendance,
                (SELECT COUNT(*) FROM attendance_sessions) as total_sessions
            ')
            ->havingRaw('(total_attendance / GREATEST(total_sessions, 1) * 100) < ?', [$threshold])
            ->orderByRaw('(total_attendance / GREATEST(total_sessions, 1) * 100) ASC')
            ->limit(10)
            ->get()
            ->map(function ($student) {
                $rate = $student->total_sessions > 0 
                    ? round(($student->total_attendance / $student->total_sessions) * 100, 2)
                    : 0;
                
                return [
                    'id' => $student->id,
                    'name' => $student->nama,
                    'nim' => $student->nim,
                    'attendance_rate' => $rate,
                    'risk_level' => $rate < 50 ? 'high' : ($rate < 65 ? 'medium' : 'low'),
                ];
            })
            ->toArray();
    }
}
