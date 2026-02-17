<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'week'); // day, week, month, year
        
        // Define date range based on filter
        $dates = $this->getDateRange($period);
        $startDate = $dates['start'];
        $endDate = $dates['end'];

        return Inertia::render('admin/analytics', [
            'stats' => $this->getOverviewStats($startDate, $endDate),
            'attendanceTrend' => $this->getAttendanceTrend($startDate, $endDate, $period),
            'deviceDistribution' => $this->getDeviceDistribution($startDate, $endDate),
            'topPerformers' => $this->getTopPerformers($startDate, $endDate),
            'aiInsights' => $this->getAiInsights($startDate, $endDate),
            'filters' => [
                'period' => $period,
            ]
        ]);
    }
    
    public function export(Request $request)
    {
        // Simple CSV export logic for now, can be expanded to PDF
        $period = $request->get('period', 'week');
        $dates = $this->getDateRange($period);
        
        $filename = "analytics-report-{$period}-" . now()->format('Y-m-d') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($dates) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date', 'Total Attendance', 'Total Sessions', 'Attendance Rate']);

            $trend = $this->getAttendanceTrend($dates['start'], $dates['end'], 'export'); // Reuse logic
            
            foreach ($trend as $row) {
                fputcsv($file, [$row['date'], $row['hadir'], 0, 0]); // adjust as needed
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getDateRange(string $period): array
    {
        $now = now();
        return match($period) {
            'day' => ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()],
            'week' => ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()],
            'month' => ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()],
            'year' => ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()],
            default => ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()],
        };
    }

    private function getOverviewStats($startDate, $endDate): array
    {
        $totalSessions = AttendanceSession::whereBetween('start_at', [$startDate, $endDate])->count();
        $totalAttendance = AttendanceLog::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalStudents = Mahasiswa::count();
        
        $possibleAttendance = $totalSessions * $totalStudents;
        $attendanceRate = $possibleAttendance > 0 
            ? round(($totalAttendance / $possibleAttendance) * 100, 2)
            : 0;

        // Rate change vs previous period equivalent
        $durationInDays = $startDate->diffInDays($endDate) + 1;
        $prevStart = $startDate->copy()->subDays($durationInDays);
        $prevEnd = $startDate->copy()->subSeconds(1);
        
        $prevAttendance = AttendanceLog::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $prevSessions = AttendanceSession::whereBetween('start_at', [$prevStart, $prevEnd])->count();
        $prevPossible = $prevSessions * $totalStudents;
        $prevRate = $prevPossible > 0 ? round(($prevAttendance / $prevPossible) * 100, 2) : 0;
        
        $rateChange = $attendanceRate - $prevRate;

        // Late count (mock logic: logs > 15 mins after session start) - simplified for overview
        // In real app, join aggregation is better.
        $lateCount = 0; // Placeholder for now to avoid complex join query overhead on overview

        // Fraud Detection (Multiple students on same device)
        // Check if any (device_model, device_type) pair is used by > 1 student
        $fraudAttempts = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate])
            ->select('device_model', 'device_type', DB::raw('COUNT(DISTINCT mahasiswa_id) as users_count'))
            ->groupBy('device_model', 'device_type')
            ->having('users_count', '>', 1)
            ->get()
            ->sum('users_count'); // Count total suspicious check-ins involved 

        return [
            'total_attendance' => $totalAttendance,
            'attendance_rate' => $attendanceRate,
            'rate_change' => round($rateChange, 2),
            'late_count' => $lateCount,
            'fraud_attempts' => $fraudAttempts,
        ];
    }

    private function getAttendanceTrend($startDate, $endDate, $period): array
    {
        $data = [];

        if ($period === 'day') {
            // Hourly breakdown for 'day' view
            for ($i = 0; $i < 24; $i++) {
                $startHour = $startDate->copy()->addHours($i);
                $endHour = $startHour->copy()->addHour();
                
                $logs = AttendanceLog::whereBetween('scanned_at', [$startHour, $endHour])->get();
                
                $data[] = [
                    'name' => $startHour->format('H:00'),
                    'date' => $startHour->format('Y-m-d H:i'),
                    'hadir' => $logs->where('status', 'present')->count(),
                    'telat' => $logs->where('status', 'late')->count(),
                    'audit' => 0
                ];
            }
        } else {
            // Daily breakdown for week/month
            $days = $startDate->diffInDays($endDate) + 1;
            for ($i = 0; $i < $days; $i++) {
                $date = $startDate->copy()->addDays($i);
                $start = $date->copy()->startOfDay();
                $end = $date->copy()->endOfDay();

                $logs = AttendanceLog::whereBetween('scanned_at', [$start, $end])->get();
                
                $data[] = [
                    'name' => $date->format('D, d'), 
                    'date' => $date->format('Y-m-d'),
                    'hadir' => $logs->where('status', 'present')->count(),
                    'telat' => $logs->where('status', 'late')->count(),
                    'audit' => 0
                ];
            }
        }
        return $data;
    }

    private function getDeviceDistribution($startDate, $endDate): array
    {
        // Mock distribution based on total count if no device_type column
        // If we had a device_type column:
        // return AttendanceLog::whereBetween(...)-->select('device_type', DB::raw('count(*) as value'))->groupBy('device_type')->get();
        
        $total = AttendanceLog::whereBetween('created_at', [$startDate, $endDate])->count();
        if ($total == 0) return [];

        // Distribute mathematically for demo visual
        return [
            ['name' => 'Mobile App', 'value' => (int)($total * 0.7), 'color' => '#6366f1'],
            ['name' => 'Web Portal', 'value' => (int)($total * 0.2), 'color' => '#ec4899'],
            ['name' => 'Tablet', 'value' => (int)($total * 0.1), 'color' => '#8b5cf6'],
        ];
    }

    private function getTopPerformers($startDate, $endDate): array
    {
        return Mahasiswa::withCount(['attendanceLogs' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->orderByDesc('attendance_logs_count')
            ->limit(5)
            ->get()
            ->map(function ($student) {
                $status = 'Good'; 
                if ($student->attendance_logs_count > 5) $status = 'Excellent';
                if ($student->attendance_logs_count == 0) $status = 'Low';

                return [
                    'id' => $student->id,
                    'name' => $student->nama,
                    'nim' => $student->nim,
                    'department' => $student->prodi ?? 'Umum',
                    'attendance' => $student->attendance_logs_count . ' Sesi',
                    'status' => $status
                ];
            })
            ->toArray();
    }

    private function getAiInsights($startDate, $endDate): array
    {
        $insights = [];
        $today = now();
        $logs = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate])->get();
        $totalAttendance = $logs->count();
        
        // 1. Activity Check
        if ($totalAttendance == 0) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'No Activity Detected',
                'description' => 'No attendance records found for this period. Ensure sessions are created and devices are online.',
                'icon' => 'AlertTriangle'
            ];
            return $insights; // Return early if no data
        }

        // 2. Trend Analysis (Compared to previous period of same length)
        $duration = $startDate->diffInDays($endDate) + 1;
        $prevStart = $startDate->copy()->subDays($duration);
        $prevEnd = $startDate->copy()->subSeconds(1);
        $prevAttendance = AttendanceLog::whereBetween('scanned_at', [$prevStart, $prevEnd])->count();

        if ($prevAttendance > 0) {
            $growth = (($totalAttendance - $prevAttendance) / $prevAttendance) * 100;
            if ($growth >= 20) {
                $insights[] = [
                    'type' => 'success',
                    'title' => 'Significant Growth',
                    'description' => "Attendance increased by " . round($growth) . "% compared to previous period.",
                    'icon' => 'TrendingUp'
                ];
            } elseif ($growth <= -20) {
                 $insights[] = [
                    'type' => 'warning',
                    'title' => 'Attendance Drop',
                    'description' => "Attendance decreased by " . abs(round($growth)) . "% compared to previous period.",
                    'icon' => 'TrendingDown'
                ];
            }
        }

        // 3. Punctuality Analysis
        $lateCount = $logs->where('status', 'late')->count();
        $lateRate = ($totalAttendance > 0) ? ($lateCount / $totalAttendance) * 100 : 0;

        if ($lateRate > 15) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'High Lateness Rate',
                'description' => round($lateRate) . "% of check-ins were late. Consider adjusting schedule or grace period.",
                'icon' => 'Clock'
            ];
        } elseif ($lateRate == 0 && $totalAttendance > 10) {
            $insights[] = [
                'type' => 'success',
                'title' => 'Perfect Punctuality',
                'description' => "Great job! 0% late arrivals recorded in this period.",
                'icon' => 'Award'
            ];
        }

        // 4. Geolocation Anomalies (Distance > 50m)
        // Assuming 'distance_m' is stored in logs
        $farCheckIns = $logs->where('distance_m', '>', 50)->count();
        if ($farCheckIns > 0) {
            $insights[] = [
                'type' => 'info',
                'title' => 'Location Outliers',
                'description' => "$farCheckIns check-ins detected > 50m from center. Verify geofence settings.",
                'icon' => 'MapPin'
            ];
        }

        // 5. Perfect Attendance Days
        // Count days with 100% attendance (complex query, simplified here)
        // Check if today has 100% attendance? (Need total students count)
        $totalStudents = Mahasiswa::count();
        if ($totalStudents > 0 && $totalAttendance >= ($totalStudents * ($duration))) {
             // Very rough approximation for now due to complexity of "sessions per day"
             // Better: Check if *any single session* had 100% attendance
             $perfectSessions = AttendanceSession::whereBetween('start_at', [$startDate, $endDate])
                ->withCount(['attendanceLogs' => function($q) {
                    $q->where('status', 'present');
                }])
                ->get()
                ->filter(function($session) use ($totalStudents) {
                    return $session->attendance_logs_count >= $totalStudents;
                })
                ->count();

             if ($perfectSessions > 0) {
                $insights[] = [
                    'type' => 'success',
                    'title' => 'Perfect Sessions',
                    'description' => "$perfectSessions sessions achieved 100% student attendance!",
                    'icon' => 'Star'
                ];
             }
        }
        
        return $insights;
    }

    public function getStudentDetail($id)
    {
        $student = Mahasiswa::withCount(['attendanceLogs' => function($query) {
             $query->whereIn('status', ['present', 'late', 'On Time']);
        }])->findOrFail($id);
        
        $totalSessions = AttendanceSession::count();
        $attendanceRate = $totalSessions > 0 
            ? round(($student->attendance_logs_count / $totalSessions) * 100) 
            : 0;

        // Calculate Average Check-in Time
        $logs = AttendanceLog::where('mahasiswa_id', $id)
            ->whereNotNull('scanned_at')
            ->get();
            
        $avgCheckIn = 'N/A';
        if ($logs->count() > 0) {
            $totalSeconds = 0;
            $count = 0;
            foreach ($logs as $log) {
                // Parse time part only
                $time = \Carbon\Carbon::parse($log->scanned_at->format('H:i:s'));
                $totalSeconds += $time->secondsSinceMidnight();
                $count++;
            }
            if ($count > 0) {
                $avgSeconds = $totalSeconds / $count;
                $avgCheckIn = gmdate("H:i", (int)$avgSeconds);
            }
        }

        // Detailed History (last 30 logs)
        $historyLogs = AttendanceLog::where('mahasiswa_id', $id)
            ->whereNotNull('scanned_at')
            ->orderBy('scanned_at', 'desc')
            ->limit(30)
            ->get()
            ->map(function($log) {
                $time = $log->scanned_at;
                // Use stored status if available, fallback to simple logic
                $status = $log->status ? ucfirst($log->status) : ($time->hour < 8 ? 'On Time' : 'Late');
                
                // Map 'Present' to 'On Time' for clearer UI
                if (strtolower($status) === 'present') $status = 'On Time';

                return [
                    'id' => $log->id,
                    'date' => $time->translatedFormat('d F Y'), // More readable date
                    'time' => $time->format('H:i'),
                    'status' => $status,
                    'device' => $log->device_model ?? 'Unknown Device', 
                    'location' => 'Kampus Pusat' 
                ];
            });

        // Calendar Data (All logs for visual heatmap)
        $calendarData = AttendanceLog::where('mahasiswa_id', $id)
            ->whereNotNull('scanned_at')
            ->select('scanned_at', 'status')
            ->get()
            ->map(function($log) {
                return [
                    'date' => $log->scanned_at->format('Y-m-d'),
                    'count' => 1,
                    'status' => $log->status
                ];
            });

        // Weekly Activity for mini-chart
        $weeklyActivity = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = AttendanceLog::where('mahasiswa_id', $id)
                ->whereDate('scanned_at', $date)
                ->count();
            $weeklyActivity[] = ['day' => $date->format('D'), 'count' => $count];
        }
        
        // Late Count
        $lateCount = AttendanceLog::where('mahasiswa_id', $id)
             ->where('status', 'late')
             ->count();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->nama,
                'nim' => $student->nim,
                'department' => $student->prodi ?? 'Umum',
                'avatar_letter' => substr($student->nama, 0, 1),
                'total_attendance' => $student->attendance_logs_count,
                'attendance_rate' => $attendanceRate,
                'avg_check_in' => $avgCheckIn,
                'status' => $attendanceRate > 80 ? 'Excellent' : ($attendanceRate > 50 ? 'Good' : 'Low'),
                'late_count' => $lateCount,
            ],
            'recent_logs' => $historyLogs, 
            'calendar_data' => $calendarData,
            'weekly_activity' => $weeklyActivity
        ]);
    }
}
