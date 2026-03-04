<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\AttendanceWarning;

class RekapKehadiranController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all');
        
        // Get all courses
        $courses = MataKuliah::with('dosen')->orderBy('nama')->get();
        
        // Build attendance query
        $attendanceQuery = AttendanceLog::with(['mahasiswa', 'session.course.dosen', 'selfieVerification'])
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            });
        
        if ($courseId !== 'all') {
            $attendanceQuery->whereHas('session', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }
        
        if ($status !== 'all') {
            $attendanceQuery->where('status', $status);
        }
        
        $attendanceLogs = $attendanceQuery->latest('scanned_at')
            ->paginate(20)
            ->withQueryString();
        
        // Statistics
        $stats = $this->getAttendanceStats($dateFrom, $dateTo, $courseId);
        
        // Daily Attendance Trend
        $dailyTrend = $this->getDailyAttendanceTrend($dateFrom, $dateTo, $courseId);
        
        // Course Attendance Summary
        $courseSummary = $this->getCourseAttendanceSummary($dateFrom, $dateTo);
        
        // Top Attendees
        $topAttendees = $this->getTopAttendees($dateFrom, $dateTo);
        
        // Low Attendance Students
        $lowAttendance = $this->getLowAttendanceStudents($dateFrom, $dateTo);
        
        // Hourly Distribution
        $hourlyDistribution = $this->getHourlyDistribution($dateFrom, $dateTo);
        
        return Inertia::render('admin/rekap-kehadiran', [
            'attendanceLogs' => $attendanceLogs,
            'stats' => $stats,
            'dailyTrend' => $dailyTrend,
            'courseSummary' => $courseSummary,
            'topAttendees' => $topAttendees,
            'lowAttendance' => $lowAttendance,
            'hourlyDistribution' => $hourlyDistribution,
            'courses' => $courses,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'course_id' => $courseId,
                'status' => $status,
            ],
        ]);
    }
    
    public function show($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);
        
        // --- Basic attendance stats ---
        $allLogs = AttendanceLog::where('mahasiswa_id', $id)
            ->with(['session.course.dosen', 'selfieVerification'])
            ->orderByDesc('scanned_at')
            ->get();
        
        $totalSessions = AttendanceSession::count();
        $presentCount = $allLogs->where('status', 'present')->count();
        $lateCount = $allLogs->where('status', 'late')->count();
        $rejectedCount = $allLogs->where('status', 'rejected')->count();
        $totalAttendance = $presentCount + $lateCount;
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100, 1) : 0;
        
        // --- Status determination ---
        $status = 'at_risk';
        if ($attendanceRate >= 90) $status = 'excellent';
        elseif ($attendanceRate >= 75) $status = 'good';
        elseif ($attendanceRate >= 60) $status = 'warning';
        
        // --- Rank in class ---
        $classStudents = Mahasiswa::where('kelas', $mahasiswa->kelas)->pluck('id');
        $rankData = [];
        foreach ($classStudents as $sid) {
            $sAttendance = AttendanceLog::where('mahasiswa_id', $sid)
                ->whereIn('status', ['present', 'late'])
                ->count();
            $rankData[$sid] = $sAttendance;
        }
        arsort($rankData);
        $rank = array_search($id, array_keys($rankData)) + 1;
        
        // --- Punctuality score ---
        $onTimeLogs = $allLogs->whereIn('status', ['present', 'late']);
        $punctualityScore = $onTimeLogs->count() > 0
            ? round(($presentCount / $onTimeLogs->count()) * 100)
            : 0;
        
        // --- Streaks ---
        $sessions = AttendanceSession::orderBy('start_at')->get();
        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;
        foreach ($sessions as $session) {
            $hasAttendance = AttendanceLog::where('mahasiswa_id', $id)
                ->where('attendance_session_id', $session->id)
                ->whereIn('status', ['present', 'late'])
                ->exists();
            if ($hasAttendance) {
                $tempStreak++;
                $longestStreak = max($longestStreak, $tempStreak);
            } else {
                $tempStreak = 0;
            }
        }
        $currentStreak = $tempStreak;
        
        // --- Daily trend (last 30 days) ---
        $thirtyDaysAgo = now()->subDays(30)->toDateString();
        $today = now()->toDateString();
        $dailyCounts = AttendanceLog::where('mahasiswa_id', $id)
            ->selectRaw('DATE(scanned_at) as date, status, COUNT(*) as total')
            ->whereBetween(DB::raw('DATE(scanned_at)'), [$thirtyDaysAgo, $today])
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get();
        
        $trendLabels = [];
        $trendPresent = [];
        $trendLate = [];
        $trendRejected = [];
        $start = \Carbon\Carbon::parse($thirtyDaysAgo);
        $end = \Carbon\Carbon::parse($today);
        while ($start <= $end) {
            $dateKey = $start->toDateString();
            $trendLabels[] = $start->format('d/m');
            $dayData = $dailyCounts->where('date', $dateKey);
            $trendPresent[] = (int) ($dayData->where('status', 'present')->first()?->total ?? 0);
            $trendLate[] = (int) ($dayData->where('status', 'late')->first()?->total ?? 0);
            $trendRejected[] = (int) ($dayData->where('status', 'rejected')->first()?->total ?? 0);
            $start->addDay();
        }
        
        $dailyTrend = [
            'labels' => $trendLabels,
            'datasets' => [
                ['label' => 'Hadir', 'data' => $trendPresent, 'color' => '#10b981'],
                ['label' => 'Terlambat', 'data' => $trendLate, 'color' => '#f59e0b'],
                ['label' => 'Ditolak', 'data' => $trendRejected, 'color' => '#ef4444'],
            ],
        ];
        
        // --- Per-course breakdown ---
        $courses = MataKuliah::with('dosen')->get();
        $courseBreakdown = [];
        foreach ($courses as $course) {
            $courseSessions = AttendanceSession::where('course_id', $course->id)->count();
            if ($courseSessions === 0) continue;
            
            $coursePresent = AttendanceLog::where('mahasiswa_id', $id)
                ->whereHas('session', fn($q) => $q->where('course_id', $course->id))
                ->where('status', 'present')->count();
            $courseLate = AttendanceLog::where('mahasiswa_id', $id)
                ->whereHas('session', fn($q) => $q->where('course_id', $course->id))
                ->where('status', 'late')->count();
            $courseRejected = AttendanceLog::where('mahasiswa_id', $id)
                ->whereHas('session', fn($q) => $q->where('course_id', $course->id))
                ->where('status', 'rejected')->count();
            $courseTotal = $coursePresent + $courseLate;
            
            $courseBreakdown[] = [
                'id' => $course->id,
                'nama' => $course->nama,
                'dosen' => $course->dosen?->nama ?? '-',
                'total_sessions' => $courseSessions,
                'present' => $coursePresent,
                'late' => $courseLate,
                'rejected' => $courseRejected,
                'rate' => $courseSessions > 0 ? round(($courseTotal / $courseSessions) * 100, 1) : 0,
            ];
        }
        
        // --- Hourly distribution ---
        $hourlyCounts = AttendanceLog::where('mahasiswa_id', $id)
            ->selectRaw('HOUR(scanned_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('total', 'hour');
        
        $hourlyLabels = [];
        $hourlyValues = [];
        for ($h = 6; $h <= 22; $h++) {
            $hourlyLabels[] = sprintf('%02d:00', $h);
            $hourlyValues[] = (int) ($hourlyCounts[$h] ?? 0);
        }
        
        // --- Day of week distribution ---
        $dayOfWeekCounts = AttendanceLog::where('mahasiswa_id', $id)
            ->whereIn('status', ['present', 'late'])
            ->selectRaw('DAYOFWEEK(scanned_at) as dow, COUNT(*) as total')
            ->groupBy('dow')
            ->pluck('total', 'dow');
        
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $dayOfWeekData = [];
        for ($d = 1; $d <= 7; $d++) {
            $dayOfWeekData[] = [
                'day' => $dayNames[$d - 1],
                'count' => (int) ($dayOfWeekCounts[$d] ?? 0),
            ];
        }
        
        // --- Calendar heatmap data (last 3 months) ---
        $threeMonthsAgo = now()->subMonths(3)->startOfMonth()->toDateString();
        $calendarLogs = AttendanceLog::where('mahasiswa_id', $id)
            ->whereBetween(DB::raw('DATE(scanned_at)'), [$threeMonthsAgo, $today])
            ->selectRaw('DATE(scanned_at) as date, status')
            ->get()
            ->groupBy('date')
            ->map(function ($logs) {
                if ($logs->where('status', 'present')->count() > 0) return 'present';
                if ($logs->where('status', 'late')->count() > 0) return 'late';
                if ($logs->where('status', 'rejected')->count() > 0) return 'rejected';
                return 'absent';
            });
        
        // --- Warning & appreciation history ---
        $warnings = AttendanceWarning::where('mahasiswa_id', $id)
            ->orderByDesc('created_at')
            ->get();
        
        // --- Paginated attendance logs ---
        $attendanceLogs = AttendanceLog::where('mahasiswa_id', $id)
            ->with(['session.course.dosen', 'selfieVerification'])
            ->latest('scanned_at')
            ->paginate(15)
            ->withQueryString();
        
        // --- Class average for comparison ---
        $classAvgRate = 0;
        if ($classStudents->count() > 0 && $totalSessions > 0) {
            $classTotalAttendance = AttendanceLog::whereIn('mahasiswa_id', $classStudents)
                ->whereIn('status', ['present', 'late'])
                ->count();
            $classAvgRate = round(($classTotalAttendance / ($classStudents->count() * $totalSessions)) * 100, 1);
        }
        
        // --- Average arrival offset (minutes early/late based on session start) ---
        $avgArrivalMinutes = 0;
        $arrivalOffsets = [];
        foreach ($onTimeLogs as $log) {
            if ($log->session && $log->session->start_at && $log->scanned_at) {
                $offset = $log->session->start_at->diffInMinutes($log->scanned_at, false);
                $arrivalOffsets[] = $offset;
            }
        }
        if (count($arrivalOffsets) > 0) {
            $avgArrivalMinutes = round(array_sum($arrivalOffsets) / count($arrivalOffsets), 1);
        }
        
        return Inertia::render('admin/rekap-kehadiran-detail', [
            'student' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'kelas' => $mahasiswa->kelas ?? '-',
                'email' => $mahasiswa->email ?? '-',
                'phone' => $mahasiswa->phone,
                'avatar' => $mahasiswa->avatar_url,
                'prodi' => $mahasiswa->prodi ?? 'Teknik Informatika',
                'semester' => $mahasiswa->semester ?? 1,
                'total_attendance' => $totalAttendance,
                'attendance_rate' => $attendanceRate,
                'rank_in_class' => $rank,
                'total_students_in_class' => $classStudents->count(),
                'status' => $status,
            ],
            'stats' => [
                'total_sessions' => $totalSessions,
                'present' => $presentCount,
                'late' => $lateCount,
                'rejected' => $rejectedCount,
                'attendance_rate' => $attendanceRate,
                'punctuality_score' => $punctualityScore,
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'avg_arrival_minutes' => $avgArrivalMinutes,
                'class_avg_rate' => $classAvgRate,
            ],
            'dailyTrend' => $dailyTrend,
            'courseBreakdown' => $courseBreakdown,
            'hourlyDistribution' => [
                'labels' => $hourlyLabels,
                'values' => $hourlyValues,
            ],
            'dayOfWeekData' => $dayOfWeekData,
            'calendarHeatmap' => $calendarLogs,
            'warnings' => $warnings,
            'attendanceLogs' => $attendanceLogs,
        ]);
    }
    
    public function exportPdf(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $courseId = $request->get('course_id', 'all');
        
        // If specific course selected, use detailed per-course PDF
        if ($courseId !== 'all') {
            return $this->exportPdfPerCourse($courseId, $dateFrom, $dateTo);
        }
        
        $attendanceQuery = AttendanceLog::with(['mahasiswa', 'session.course.dosen'])
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            });
        
        $attendanceLogs = $attendanceQuery->latest('scanned_at')->get();
        $stats = $this->getAttendanceStats($dateFrom, $dateTo, $courseId);
        $courseSummary = $this->getCourseAttendanceSummary($dateFrom, $dateTo);
        
        $selectedCourse = null;
        
        $data = [
            'attendanceLogs' => $attendanceLogs,
            'stats' => $stats,
            'courseSummary' => $courseSummary,
            'selectedCourse' => $selectedCourse,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.rekap-kehadiran-admin', $data);
        $pdf->setPaper('A4', 'landscape');
        
        $filename = 'Rekap_Kehadiran_Admin_' . $dateFrom . '_' . $dateTo . '.pdf';
        
        return $pdf->download($filename);
    }
    
    /**
     * Export PDF per mata kuliah dengan detail kehadiran per pertemuan
     */
    private function exportPdfPerCourse($courseId, $dateFrom, $dateTo)
    {
        $course = MataKuliah::with('dosen')->findOrFail($courseId);
        
        // Get all sessions for this course
        $sessions = AttendanceSession::where('course_id', $courseId)
            ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('meeting_number')
            ->get();
        
        // Get all students who have attendance in this course
        $studentIds = AttendanceLog::whereHas('session', function ($q) use ($courseId, $dateFrom, $dateTo) {
            $q->where('course_id', $courseId)
                ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        })->distinct()->pluck('mahasiswa_id');
        
        $mahasiswaList = Mahasiswa::whereIn('id', $studentIds)->orderBy('nama')->get();
        
        // Build student attendance data
        $students = [];
        $totalPresent = 0;
        $totalLate = 0;
        $totalAbsent = 0;
        
        foreach ($mahasiswaList as $mahasiswa) {
            $attendances = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
                ->whereHas('session', function ($q) use ($courseId, $dateFrom, $dateTo) {
                    $q->where('course_id', $courseId)
                        ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                })
                ->get()
                ->keyBy('attendance_session_id');
            
            $presentCount = $attendances->where('status', 'present')->count();
            $lateCount = $attendances->where('status', 'late')->count();
            $absentCount = $sessions->count() - $presentCount - $lateCount;
            
            $totalPresent += $presentCount;
            $totalLate += $lateCount;
            $totalAbsent += $absentCount;
            
            $rate = $sessions->count() > 0 
                ? round((($presentCount + $lateCount) / $sessions->count()) * 100, 1) 
                : 0;
            
            $students[] = [
                'id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
                'attendances' => $attendances,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'absent_count' => $absentCount,
                'rate' => $rate,
            ];
        }
        
        // Session summary
        $sessionSummary = [];
        foreach ($sessions as $session) {
            $logs = AttendanceLog::where('attendance_session_id', $session->id)->get();
            $sessionSummary[$session->id] = [
                'present' => $logs->where('status', 'present')->count(),
                'late' => $logs->where('status', 'late')->count(),
                'absent' => count($mahasiswaList) - $logs->whereIn('status', ['present', 'late'])->count(),
            ];
        }
        
        // Overall stats
        $totalAttendances = $totalPresent + $totalLate;
        $totalPossible = count($mahasiswaList) * $sessions->count();
        $attendanceRate = $totalPossible > 0 ? round(($totalAttendances / $totalPossible) * 100, 1) : 0;
        
        $stats = [
            'total_sessions' => $sessions->count(),
            'total_students' => count($mahasiswaList),
            'present' => $totalPresent,
            'late' => $totalLate,
            'absent' => $totalAbsent,
            'attendance_rate' => $attendanceRate,
        ];
        
        $data = [
            'course' => $course,
            'sessions' => $sessions,
            'students' => $students,
            'sessionSummary' => $sessionSummary,
            'stats' => $stats,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'semester' => 'Ganjil 2024/2025',
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.rekap-kehadiran-matkul', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = 'Rekap_Kehadiran_' . str_replace(' ', '_', $course->nama) . '_' . $dateFrom . '_' . $dateTo . '.pdf';
        
        return $pdf->download($filename);
    }

    private function getAttendanceStats($dateFrom, $dateTo, $courseId)
    {
        $baseQuery = fn() => AttendanceLog::whereHas('session', function ($q) use ($dateFrom, $dateTo, $courseId) {
            $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            if ($courseId !== 'all') {
                $q->where('course_id', $courseId);
            }
        });
        
        $total = $baseQuery()->count();
        $present = $baseQuery()->where('status', 'present')->count();
        $late = $baseQuery()->where('status', 'late')->count();
        $rejected = $baseQuery()->where('status', 'rejected')->count();
        
        $totalSessions = AttendanceSession::whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->when($courseId !== 'all', fn($q) => $q->where('course_id', $courseId))
            ->count();
        
        $uniqueStudents = $baseQuery()->distinct('mahasiswa_id')->count('mahasiswa_id');
        
        $avgPerSession = $totalSessions > 0 ? round($total / $totalSessions, 1) : 0;
        $attendanceRate = $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0;
        
        return [
            'total' => $total,
            'present' => $present,
            'late' => $late,
            'rejected' => $rejected,
            'total_sessions' => $totalSessions,
            'unique_students' => $uniqueStudents,
            'avg_per_session' => $avgPerSession,
            'attendance_rate' => $attendanceRate,
        ];
    }
    
    private function getDailyAttendanceTrend($dateFrom, $dateTo, $courseId)
    {
        $counts = AttendanceLog::selectRaw('DATE(scanned_at) as date, status, COUNT(*) as total')
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo, $courseId) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                if ($courseId !== 'all') {
                    $q->where('course_id', $courseId);
                }
            })
            ->groupBy('date', 'status')
            ->orderBy('date')
            ->get();
        
        $labels = [];
        $presentData = [];
        $lateData = [];
        $rejectedData = [];
        
        $start = \Carbon\Carbon::parse($dateFrom);
        $end = \Carbon\Carbon::parse($dateTo);
        
        while ($start <= $end) {
            $dateKey = $start->toDateString();
            $labels[] = $start->format('d/m');
            
            $dayData = $counts->where('date', $dateKey);
            $presentData[] = (int) $dayData->where('status', 'present')->first()?->total ?? 0;
            $lateData[] = (int) $dayData->where('status', 'late')->first()?->total ?? 0;
            $rejectedData[] = (int) $dayData->where('status', 'rejected')->first()?->total ?? 0;
            
            $start->addDay();
        }
        
        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Hadir', 'data' => $presentData, 'color' => '#10b981'],
                ['label' => 'Terlambat', 'data' => $lateData, 'color' => '#f59e0b'],
                ['label' => 'Ditolak', 'data' => $rejectedData, 'color' => '#ef4444'],
            ],
        ];
    }
    
    private function getCourseAttendanceSummary($dateFrom, $dateTo)
    {
        return MataKuliah::with('dosen')
            ->withCount([
                'sessions as total_sessions' => function ($q) use ($dateFrom, $dateTo) {
                    $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                },
            ])
            ->get()
            ->map(function ($course) use ($dateFrom, $dateTo) {
                $logs = AttendanceLog::whereHas('session', function ($q) use ($course, $dateFrom, $dateTo) {
                    $q->where('course_id', $course->id)
                        ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                });
                
                $total = $logs->count();
                $present = (clone $logs)->where('status', 'present')->count();
                $late = (clone $logs)->where('status', 'late')->count();
                
                return [
                    'id' => $course->id,
                    'nama' => $course->nama,
                    'dosen' => $course->dosen?->nama ?? '-',
                    'total_sessions' => $course->total_sessions,
                    'total_attendance' => $total,
                    'present' => $present,
                    'late' => $late,
                    'rate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
                ];
            })
            ->filter(fn($c) => $c['total_sessions'] > 0)
            ->values();
    }
    
    private function getTopAttendees($dateFrom, $dateTo)
    {
        return AttendanceLog::select('mahasiswa_id', DB::raw('count(*) as total_attendance'))
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            })
            ->whereIn('status', ['present', 'late'])
            ->groupBy('mahasiswa_id')
            ->orderByDesc('total_attendance')
            ->take(5)
            ->get()
            ->map(function ($row) {
                $mahasiswa = Mahasiswa::find($row->mahasiswa_id);
                return [
                    'id' => $row->mahasiswa_id,
                    'nama' => $mahasiswa?->nama ?? '-',
                    'nim' => $mahasiswa?->nim ?? '-',
                    'total_attendance' => $row->total_attendance,
                ];
            });
    }
    
    private function getLowAttendanceStudents($dateFrom, $dateTo)
    {
        $totalSessions = AttendanceSession::whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])->count();
        
        if ($totalSessions === 0) return collect();
        
        return Mahasiswa::withCount([
            'attendanceLogs as attendance_count' => function ($q) use ($dateFrom, $dateTo) {
                $q->whereHas('session', function ($sq) use ($dateFrom, $dateTo) {
                    $sq->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                })->whereIn('status', ['present', 'late']);
            }
        ])
            ->having('attendance_count', '<', $totalSessions * 0.5)
            ->orderBy('attendance_count')
            ->take(5)
            ->get()
            ->map(function ($m) use ($totalSessions) {
                return [
                    'id' => $m->id,
                    'nama' => $m->nama,
                    'nim' => $m->nim,
                    'attendance_count' => $m->attendance_count,
                    'rate' => round(($m->attendance_count / $totalSessions) * 100, 1),
                ];
            });
    }
    
    private function getHourlyDistribution($dateFrom, $dateTo)
    {
        $counts = AttendanceLog::selectRaw('HOUR(scanned_at) as hour, COUNT(*) as total')
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            })
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('total', 'hour');
        
        $labels = [];
        $values = [];
        
        for ($h = 6; $h <= 22; $h++) {
            $labels[] = sprintf('%02d:00', $h);
            $values[] = (int) ($counts[$h] ?? 0);
        }
        
        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }
    
    public function storeWarning(Request $request) 
    {
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|string|in:warning,notice,danger,info,appreciation',
        ]);
        
        AttendanceWarning::create([
            'mahasiswa_id' => $validated['mahasiswa_id'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'warning',
            'is_read' => false,
        ]);
        
        return back()->with('success', 'Peringatan berhasil dikirim kepada mahasiswa.');
    }
}
