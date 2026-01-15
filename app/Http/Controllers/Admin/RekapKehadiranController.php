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
                ->keyBy('session_id');
            
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
            $logs = AttendanceLog::where('session_id', $session->id)->get();
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
        $pdf->setPaper('A4', 'landscape');
        
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
}
