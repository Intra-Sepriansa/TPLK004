<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
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

    public function show(Request $request, Mahasiswa $mahasiswa)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $courseId = (string) $request->get('course_id', 'all');
        $status = (string) $request->get('status', 'all');

        $analyticsLogsQuery = AttendanceLog::query()
            ->with(['session.course.dosen', 'selfieVerification'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo, $courseId) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                if ($courseId !== 'all') {
                    $q->where('course_id', $courseId);
                }
            });

        $attendanceLogsQuery = clone $analyticsLogsQuery;
        if ($status !== 'all') {
            $attendanceLogsQuery->where('status', $status);
        }

        $attendanceLogs = $attendanceLogsQuery
            ->latest('scanned_at')
            ->paginate(20)
            ->withQueryString();

        $allLogs = (clone $analyticsLogsQuery)
            ->latest('scanned_at')
            ->get();

        $present = $allLogs->where('status', 'present')->count();
        $late = $allLogs->where('status', 'late')->count();
        $rejected = $allLogs->where('status', 'rejected')->count();
        $totalSessions = $allLogs->count();
        $totalAttendance = $present + $late;

        $attendanceRate = $totalSessions > 0
            ? round(($totalAttendance / $totalSessions) * 100, 1)
            : 0;
        $punctualityScore = $totalAttendance > 0
            ? round(($present / $totalAttendance) * 100, 1)
            : 0;

        [$currentStreak, $longestStreak] = $this->calculateAttendanceStreaks($allLogs);
        $avgArrivalMinutes = $this->calculateAverageArrivalMinutes($allLogs);
        [$rankInClass, $totalStudentsInClass, $classAvgRate] = $this->getClassRankAndAverage(
            (string) ($mahasiswa->kelas ?? ''),
            $dateFrom,
            $dateTo,
            (int) $mahasiswa->id
        );

        $statusKey = $attendanceRate >= 90
            ? 'excellent'
            : ($attendanceRate >= 75 ? 'good' : ($attendanceRate >= 60 ? 'warning' : 'at_risk'));

        $courseBreakdown = $this->buildStudentCourseBreakdown($allLogs);
        $dailyTrend = $this->buildStudentDailyTrend($allLogs, $dateFrom, $dateTo);
        $hourlyDistribution = $this->buildStudentHourlyDistribution($allLogs);
        $dayOfWeekData = $this->buildDayOfWeekData($allLogs);
        $calendarHeatmap = $this->buildStudentCalendarHeatmap($allLogs);
        $monthlySummary = $this->buildMonthlySummary($allLogs, $dateTo);
        $predictedRate = $this->predictAttendanceRate($monthlySummary, $attendanceRate);
        $timeline = $this->buildStudentTimeline($allLogs);
        $upcomingSessions = $this->getUpcomingSessionsForStudent($allLogs);

        $warnings = AttendanceWarning::where('mahasiswa_id', $mahasiswa->id)
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($warning) {
                return [
                    'id' => $warning->id,
                    'type' => $warning->type,
                    'title' => $warning->title,
                    'message' => $warning->message,
                    'is_read' => (bool) $warning->is_read,
                    'created_at' => optional($warning->created_at)->timezone('Asia/Jakarta')->format('d M Y H:i'),
                ];
            })
            ->values();

        return Inertia::render('admin/rekap-kehadiran-detail', [
            'student' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'kelas' => $mahasiswa->kelas ?? '-',
                'email' => $mahasiswa->email ?? '-',
                'phone' => $mahasiswa->phone,
                'avatar' => $mahasiswa->avatar_url,
                'prodi' => $mahasiswa->prodi,
                'semester' => $mahasiswa->semester,
                'total_attendance' => $totalAttendance,
                'attendance_rate' => $attendanceRate,
                'rank_in_class' => $rankInClass,
                'total_students_in_class' => $totalStudentsInClass,
                'status' => $statusKey,
            ],
            'stats' => [
                'total_sessions' => $totalSessions,
                'present' => $present,
                'late' => $late,
                'rejected' => $rejected,
                'attendance_rate' => $attendanceRate,
                'punctuality_score' => $punctualityScore,
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'avg_arrival_minutes' => $avgArrivalMinutes,
                'class_avg_rate' => $classAvgRate,
                'predicted_rate' => $predictedRate,
            ],
            'dailyTrend' => $dailyTrend,
            'courseBreakdown' => $courseBreakdown,
            'hourlyDistribution' => $hourlyDistribution,
            'dayOfWeekData' => $dayOfWeekData,
            'calendarHeatmap' => $calendarHeatmap,
            'monthlySummary' => $monthlySummary,
            'timeline' => $timeline,
            'upcomingSessions' => $upcomingSessions,
            'warnings' => $warnings,
            'attendanceLogs' => $attendanceLogs,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'course_id' => $courseId,
                'status' => $status,
            ],
            'courseOptions' => $courseBreakdown->map(function ($course) {
                return [
                    'id' => (string) $course['id'],
                    'nama' => $course['nama'],
                ];
            })->values(),
        ]);
    }
    
    public function exportPdf(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $courseId = $request->get('course_id', 'all');
        $mahasiswaId = $request->get('mahasiswa_id');

        // Student detail export (prioritas untuk halaman detail mahasiswa)
        if ($mahasiswaId) {
            return $this->exportPdfPerStudent((int) $mahasiswaId, $dateFrom, $dateTo, $courseId);
        }
        
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

    private function exportPdfPerStudent(int $mahasiswaId, string $dateFrom, string $dateTo, string $courseId)
    {
        $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);

        $attendanceQuery = AttendanceLog::with(['mahasiswa', 'session.course.dosen'])
            ->where('mahasiswa_id', $mahasiswaId)
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo, $courseId) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                if ($courseId !== 'all') {
                    $q->where('course_id', $courseId);
                }
            });

        $attendanceLogs = $attendanceQuery->latest('scanned_at')->get();
        $stats = $this->getAttendanceStats($dateFrom, $dateTo, $courseId, $mahasiswaId);
        $courseSummary = $this->getCourseAttendanceSummary($dateFrom, $dateTo, $mahasiswaId);
        $selectedCourse = $courseId !== 'all' ? MataKuliah::find($courseId) : null;

        $data = [
            'attendanceLogs' => $attendanceLogs,
            'stats' => $stats,
            'courseSummary' => $courseSummary,
            'selectedCourse' => $selectedCourse,
            'student' => [
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'kelas' => $mahasiswa->kelas,
            ],
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];

        $pdf = Pdf::loadView('pdf.rekap-kehadiran-admin', $data);
        $pdf->setPaper('A4', 'landscape');

        $safeName = preg_replace('/[^A-Za-z0-9\-]/', '_', (string) $mahasiswa->nama);
        $filename = 'Rekap_Kehadiran_' . $safeName . '_' . $dateFrom . '_' . $dateTo . '.pdf';

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

    private function getAttendanceStats($dateFrom, $dateTo, $courseId, $mahasiswaId = null)
    {
        $baseQuery = fn() => AttendanceLog::whereHas('session', function ($q) use ($dateFrom, $dateTo, $courseId) {
            $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            if ($courseId !== 'all') {
                $q->where('course_id', $courseId);
            }
        })->when($mahasiswaId, function ($q) use ($mahasiswaId) {
            $q->where('mahasiswa_id', $mahasiswaId);
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

    private function calculateAverageArrivalMinutes($logs): int
    {
        $minutes = $logs
            ->filter(fn($log) => $log->session && $log->scanned_at)
            ->map(function ($log) {
                $start = Carbon::parse($log->session->start_at);
                $scanned = Carbon::parse($log->scanned_at);
                return $scanned->diffInMinutes($start, false);
            });

        if ($minutes->isEmpty()) {
            return 0;
        }

        return (int) round($minutes->avg());
    }

    private function calculateAttendanceStreaks($logs): array
    {
        $dates = $logs
            ->filter(fn($log) => in_array($log->status, ['present', 'late'], true))
            ->map(fn($log) => Carbon::parse($log->scanned_at)->toDateString())
            ->unique()
            ->sort()
            ->values();

        if ($dates->isEmpty()) {
            return [0, 0];
        }

        $longest = 0;
        $running = 0;
        $prev = null;

        foreach ($dates as $date) {
            if ($prev === null || Carbon::parse($prev)->addDay()->toDateString() === $date) {
                $running++;
            } else {
                $running = 1;
            }

            $longest = max($longest, $running);
            $prev = $date;
        }

        $current = 0;
        $reverseDates = $dates->reverse()->values();
        $prevDate = null;

        foreach ($reverseDates as $date) {
            if ($prevDate === null) {
                $current = 1;
                $prevDate = $date;
                continue;
            }

            if (Carbon::parse($date)->addDay()->toDateString() === $prevDate) {
                $current++;
                $prevDate = $date;
            } else {
                break;
            }
        }

        return [$current, $longest];
    }

    private function getClassRankAndAverage(string $kelas, string $dateFrom, string $dateTo, int $mahasiswaId): array
    {
        if (trim($kelas) === '') {
            return [1, 1, 0];
        }

        $rates = AttendanceLog::selectRaw("
                mahasiswa_id,
                SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) as attended,
                COUNT(*) as total_logs
            ")
            ->whereHas('mahasiswa', function ($q) use ($kelas) {
                $q->where('kelas', $kelas);
            })
            ->whereHas('session', function ($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            })
            ->groupBy('mahasiswa_id')
            ->get()
            ->map(function ($row) {
                $total = (int) ($row->total_logs ?? 0);
                $attended = (int) ($row->attended ?? 0);
                return [
                    'mahasiswa_id' => (int) $row->mahasiswa_id,
                    'rate' => $total > 0 ? round(($attended / $total) * 100, 2) : 0,
                ];
            })
            ->sortByDesc('rate')
            ->values();

        if ($rates->isEmpty()) {
            return [1, 1, 0];
        }

        $classAvgRate = round($rates->avg('rate') ?? 0, 1);
        $rankIndex = $rates->search(fn($item) => $item['mahasiswa_id'] === $mahasiswaId);
        $rank = $rankIndex === false ? $rates->count() : ((int) $rankIndex + 1);

        return [$rank, $rates->count(), $classAvgRate];
    }

    private function buildStudentDailyTrend($logs, string $dateFrom, string $dateTo): array
    {
        $start = Carbon::parse($dateFrom)->startOfDay();
        $end = Carbon::parse($dateTo)->endOfDay();

        if ($start->diffInDays($end) > 29) {
            $start = $end->copy()->subDays(29)->startOfDay();
        }

        $counts = $logs
            ->groupBy(fn($log) => Carbon::parse($log->scanned_at)->toDateString() . '|' . $log->status)
            ->map(fn($items) => $items->count());

        $labels = [];
        $present = [];
        $late = [];
        $rejected = [];

        $cursor = $start->copy();
        while ($cursor <= $end) {
            $dateKey = $cursor->toDateString();
            $labels[] = $cursor->format('d/m');
            $present[] = (int) ($counts[$dateKey . '|present'] ?? 0);
            $late[] = (int) ($counts[$dateKey . '|late'] ?? 0);
            $rejected[] = (int) ($counts[$dateKey . '|rejected'] ?? 0);
            $cursor->addDay();
        }

        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Hadir', 'data' => $present, 'color' => '#10b981'],
                ['label' => 'Terlambat', 'data' => $late, 'color' => '#f59e0b'],
                ['label' => 'Ditolak', 'data' => $rejected, 'color' => '#ef4444'],
            ],
        ];
    }

    private function buildStudentCourseBreakdown($logs)
    {
        return $logs
            ->filter(fn($log) => $log->session && $log->session->course)
            ->groupBy(fn($log) => $log->session->course->id)
            ->map(function ($courseLogs) {
                $first = $courseLogs->first();
                $present = $courseLogs->where('status', 'present')->count();
                $late = $courseLogs->where('status', 'late')->count();
                $rejected = $courseLogs->where('status', 'rejected')->count();
                $total = $courseLogs->count();

                return [
                    'id' => $first->session->course->id,
                    'nama' => $first->session->course->nama,
                    'dosen' => $first->session->course->dosen?->nama ?? '-',
                    'total_sessions' => $courseLogs->pluck('attendance_session_id')->unique()->count(),
                    'present' => $present,
                    'late' => $late,
                    'rejected' => $rejected,
                    'rate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
                ];
            })
            ->sortByDesc('rate')
            ->values();
    }

    private function buildStudentHourlyDistribution($logs): array
    {
        $hourCounts = $logs
            ->groupBy(fn($log) => (int) Carbon::parse($log->scanned_at)->format('H'))
            ->map(fn($items) => $items->count());

        $labels = [];
        $values = [];
        for ($hour = 6; $hour <= 22; $hour++) {
            $labels[] = sprintf('%02d:00', $hour);
            $values[] = (int) ($hourCounts[$hour] ?? 0);
        }

        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }

    private function buildDayOfWeekData($logs): array
    {
        $dayLabels = [
            1 => 'Sen',
            2 => 'Sel',
            3 => 'Rab',
            4 => 'Kam',
            5 => 'Jum',
            6 => 'Sab',
            0 => 'Min',
        ];

        $counts = [
            1 => 0,
            2 => 0,
            3 => 0,
            4 => 0,
            5 => 0,
            6 => 0,
            0 => 0,
        ];

        foreach ($logs as $log) {
            $day = (int) Carbon::parse($log->scanned_at)->dayOfWeek;
            $counts[$day] = ($counts[$day] ?? 0) + 1;
        }

        $result = [];
        foreach ([1, 2, 3, 4, 5, 6, 0] as $dayIndex) {
            $result[] = [
                'day' => $dayLabels[$dayIndex],
                'count' => (int) ($counts[$dayIndex] ?? 0),
            ];
        }

        return $result;
    }

    private function buildStudentCalendarHeatmap($logs): array
    {
        return $logs
            ->groupBy(fn($log) => Carbon::parse($log->scanned_at)->toDateString())
            ->map(function ($items) {
                $count = $items->count();
                if ($count >= 3) {
                    return 'high';
                }
                if ($count === 2) {
                    return 'medium';
                }
                if ($count === 1) {
                    return 'low';
                }
                return 'none';
            })
            ->toArray();
    }

    private function buildMonthlySummary($logs, string $dateTo, int $monthCount = 6): array
    {
        $end = Carbon::parse($dateTo)->startOfMonth();
        $start = $end->copy()->subMonths($monthCount - 1);

        $grouped = $logs->groupBy(fn($log) => Carbon::parse($log->scanned_at)->format('Y-m'));
        $summary = [];

        $cursor = $start->copy();
        while ($cursor <= $end) {
            $key = $cursor->format('Y-m');
            $monthLogs = $grouped->get($key, collect());

            $present = $monthLogs->where('status', 'present')->count();
            $late = $monthLogs->where('status', 'late')->count();
            $rejected = $monthLogs->where('status', 'rejected')->count();
            $total = $monthLogs->count();

            $summary[] = [
                'month' => $key,
                'label' => $cursor->translatedFormat('M Y'),
                'present' => $present,
                'late' => $late,
                'rejected' => $rejected,
                'total' => $total,
                'rate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
            ];

            $cursor->addMonth();
        }

        return $summary;
    }

    private function predictAttendanceRate(array $monthlySummary, float $currentRate): float
    {
        $active = collect($monthlySummary)->filter(fn($month) => ($month['total'] ?? 0) > 0)->values();
        if ($active->count() < 2) {
            return round($currentRate, 1);
        }

        $firstRate = (float) ($active->first()['rate'] ?? $currentRate);
        $lastRate = (float) ($active->last()['rate'] ?? $currentRate);
        $deltaPerMonth = ($lastRate - $firstRate) / max(1, ($active->count() - 1));
        $predicted = $lastRate + ($deltaPerMonth * 2);

        return round(max(0, min(100, $predicted)), 1);
    }

    private function buildStudentTimeline($logs): array
    {
        return $logs
            ->take(30)
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'time' => Carbon::parse($log->scanned_at)->timezone('Asia/Jakarta')->format('d M Y H:i'),
                    'course' => $log->session?->course?->nama ?? '-',
                    'meeting_number' => $log->session?->meeting_number,
                    'distance_m' => $log->distance_m,
                    'device' => trim(($log->device_model ?? '') . ' ' . ($log->device_os ?? '')),
                    'selfie_status' => $log->selfieVerification?->status,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getUpcomingSessionsForStudent($logs): array
    {
        $courseIds = $logs
            ->map(fn($log) => $log->session?->course?->id)
            ->filter()
            ->unique()
            ->values();

        if ($courseIds->isEmpty()) {
            return [];
        }

        return AttendanceSession::with('course.dosen')
            ->whereIn('course_id', $courseIds)
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->take(6)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'course' => $session->course?->nama ?? '-',
                    'dosen' => $session->course?->dosen?->nama ?? '-',
                    'meeting_number' => $session->meeting_number,
                    'start_at' => optional($session->start_at)->timezone('Asia/Jakarta')->format('d M Y H:i'),
                    'end_at' => optional($session->end_at)->timezone('Asia/Jakarta')->format('H:i'),
                ];
            })
            ->values()
            ->toArray();
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
    
    private function getCourseAttendanceSummary($dateFrom, $dateTo, $mahasiswaId = null)
    {
        return MataKuliah::with('dosen')
            ->withCount([
                'sessions as total_sessions' => function ($q) use ($dateFrom, $dateTo) {
                    $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                },
            ])
            ->get()
            ->map(function ($course) use ($dateFrom, $dateTo, $mahasiswaId) {
                $logs = AttendanceLog::whereHas('session', function ($q) use ($course, $dateFrom, $dateTo) {
                    $q->where('course_id', $course->id)
                        ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
                })->when($mahasiswaId, function ($q) use ($mahasiswaId) {
                    $q->where('mahasiswa_id', $mahasiswaId);
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
