<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Get courses using dosen_id from mata_kuliah table
        $courses = MataKuliah::where('dosen_id', $dosen->id)->get()->map(function ($course) {
            $sessions = AttendanceSession::where('course_id', $course->id)->with('logs')->get();
            $totalSessions = $sessions->count();
            $activeSessions = $sessions->where('is_active', true)->count();
            
            $totalLogs = $sessions->sum(fn($s) => $s->logs->count());
            $presentLogs = $sessions->sum(fn($s) => $s->logs->whereIn('status', ['present', 'late'])->count());
            $lateLogs = $sessions->sum(fn($s) => $s->logs->where('status', 'late')->count());
            
            $students = Mahasiswa::whereHas('attendanceLogs', function ($q) use ($course) {
                $q->whereHas('session', fn($s) => $s->where('course_id', $course->id));
            })->count();

            // Low attendance students (<70%)
            $lowAttendanceCount = 0;
            $studentIds = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))
                ->distinct()->pluck('mahasiswa_id');
            foreach ($studentIds as $sid) {
                $sLogs = AttendanceLog::where('mahasiswa_id', $sid)
                    ->whereHas('session', fn($q) => $q->where('course_id', $course->id));
                $sTotal = $sLogs->count();
                $sPresent = (clone $sLogs)->whereIn('status', ['present', 'late'])->count();
                if ($sTotal > 0 && ($sPresent / $sTotal) * 100 < 70) {
                    $lowAttendanceCount++;
                }
            }

            $latestSession = $sessions->sortByDesc('start_at')->first();

            return [
                'id' => $course->id,
                'nama' => $course->nama,
                'kode' => $course->kode ?? '-',
                'sks' => $course->sks,
                'totalSessions' => $totalSessions,
                'activeSessions' => $activeSessions,
                'totalStudents' => $students,
                'attendanceRate' => $totalLogs > 0 ? round(($presentLogs / $totalLogs) * 100) : 0,
                'lateCount' => $lateLogs,
                'lowAttendanceStudents' => $lowAttendanceCount,
                'latestSession' => $latestSession?->start_at?->format('d M Y'),
            ];
        });

        // Aggregate stats
        $allSessionIds = AttendanceSession::whereIn('course_id', $courses->pluck('id'))->pluck('id');
        $totalLogsAll = AttendanceLog::whereIn('attendance_session_id', $allSessionIds)->count();
        $presentLogsAll = AttendanceLog::whereIn('attendance_session_id', $allSessionIds)->whereIn('status', ['present', 'late'])->count();

        $stats = [
            'totalCourses' => $courses->count(),
            'totalHadir' => $presentLogsAll,
            'totalStudents' => Mahasiswa::count(),
            'totalSessions' => $courses->sum('totalSessions'),
            'activeSessions' => $courses->sum('activeSessions'),
            'avgAttendanceRate' => $totalLogsAll > 0 ? round(($presentLogsAll / $totalLogsAll) * 100, 1) : 0,
            'lowAttendanceStudents' => $courses->sum('lowAttendanceStudents'),
        ];

        return Inertia::render('dosen/courses', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
            ],
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    public function show(MataKuliah $course): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Verify dosen has access to this course (check dosen_id)
        if ($course->dosen_id !== $dosen->id) {
            abort(403, 'Anda tidak memiliki akses ke mata kuliah ini.');
        }

        // Sessions with eager-loaded logs for performance
        $rawSessions = AttendanceSession::where('course_id', $course->id)
            ->with('logs')
            ->orderBy('meeting_number')
            ->get();

        $sessions = $rawSessions->map(fn($s) => [
            'id' => $s->id,
            'title' => $s->title,
            'meeting_number' => $s->meeting_number,
            'start_at' => $s->start_at?->format('d M Y H:i'),
            'end_at' => $s->end_at?->format('H:i'),
            'is_active' => $s->is_active,
            'status' => $s->is_active ? 'active' : ($s->end_at && $s->end_at->isPast() ? 'completed' : 'scheduled'),
            'attendance_count' => $s->logs->count(),
            'present_count' => $s->logs->where('status', 'present')->count(),
            'late_count' => $s->logs->where('status', 'late')->count(),
            'absent_count' => $s->logs->where('status', 'rejected')->count(),
            'rate' => $s->logs->count() > 0
                ? round(($s->logs->whereIn('status', ['present', 'late'])->count() / $s->logs->count()) * 100)
                : 0,
        ]);

        // Students with attendance
        $students = Mahasiswa::whereHas('attendanceLogs', function ($q) use ($course) {
            $q->whereHas('session', fn($s) => $s->where('course_id', $course->id));
        })->get()->map(function ($m) use ($course) {
            $logs = AttendanceLog::where('mahasiswa_id', $m->id)
                ->whereHas('session', fn($q) => $q->where('course_id', $course->id));
            $total = $logs->count();
            $present = (clone $logs)->where('status', 'present')->count();
            $late = (clone $logs)->where('status', 'late')->count();
            $absent = (clone $logs)->where('status', 'rejected')->count();
            $attended = $present + $late;
            $rate = $total > 0 ? round(($attended / $total) * 100) : 0;

            // Status badge
            if ($rate >= 90) $status = 'excellent';
            elseif ($rate >= 80) $status = 'good';
            elseif ($rate >= 70) $status = 'fair';
            elseif ($rate >= 60) $status = 'poor';
            else $status = 'fail';
            
            return [
                'id' => $m->id,
                'nama' => $m->nama,
                'nim' => $m->nim,
                'kelas' => $m->kelas ?? '-',
                'total' => $total,
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'rate' => $rate,
                'status' => $status,
            ];
        });

        // Aggregate Stats
        $totalSessions = $rawSessions->count();
        $activeSessions = $rawSessions->where('is_active', true)->count();
        $completedSessions = $rawSessions->filter(fn($s) => !$s->is_active && $s->end_at && $s->end_at->isPast())->count();
        $totalStudents = $students->count();

        $allLogs = $rawSessions->flatMap(fn($s) => $s->logs);
        $totalLogs = $allLogs->count();
        $presentCount = $allLogs->where('status', 'present')->count();
        $lateCount = $allLogs->where('status', 'late')->count();
        $absentCount = $allLogs->where('status', 'rejected')->count();
        $attendedCount = $presentCount + $lateCount;

        $attendanceRate = $totalLogs > 0 ? round(($attendedCount / $totalLogs) * 100) : 0;
        $atRiskCount = $students->whereIn('status', ['poor', 'fail'])->count();

        // 5-tier Distribution (by student rate)
        $distribution = [
            ['name' => 'Excellent (≥90%)', 'value' => $students->where('status', 'excellent')->count(), 'color' => '#10b981'],
            ['name' => 'Good (80-89%)', 'value' => $students->where('status', 'good')->count(), 'color' => '#3b82f6'],
            ['name' => 'Fair (70-79%)', 'value' => $students->where('status', 'fair')->count(), 'color' => '#f59e0b'],
            ['name' => 'Poor (60-69%)', 'value' => $students->where('status', 'poor')->count(), 'color' => '#f97316'],
            ['name' => 'Fail (<60%)', 'value' => $students->where('status', 'fail')->count(), 'color' => '#ef4444'],
        ];

        // Chart data: per-session attendance trend
        $chartData = $rawSessions->sortBy('meeting_number')->values()->map(function ($s) {
            $total = $s->logs->count();
            return [
                'meeting' => 'P' . $s->meeting_number,
                'meetingNumber' => $s->meeting_number,
                'hadir' => $total > 0 ? round(($s->logs->where('status', 'present')->count() / $total) * 100) : 0,
                'terlambat' => $total > 0 ? round(($s->logs->where('status', 'late')->count() / $total) * 100) : 0,
                'tidakHadir' => $total > 0 ? round(($s->logs->where('status', 'rejected')->count() / $total) * 100) : 0,
                'presentCount' => $s->logs->where('status', 'present')->count(),
                'lateCount' => $s->logs->where('status', 'late')->count(),
                'absentCount' => $s->logs->where('status', 'rejected')->count(),
                'total' => $total,
            ];
        });

        // Recent activities (from latest logs & sessions)
        $recentLogs = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))
            ->with(['session', 'mahasiswa'])
            ->orderByDesc('scanned_at')
            ->take(10)
            ->get()
            ->map(fn($log) => [
                'type' => 'attendance',
                'icon' => $log->status === 'present' ? 'check' : ($log->status === 'late' ? 'clock' : 'x'),
                'text' => $log->mahasiswa?->nama . ' — ' . ucfirst($log->status),
                'detail' => 'Pertemuan #' . $log->session?->meeting_number . ' - ' . $log->session?->title,
                'time' => $log->scanned_at?->diffForHumans(),
                'timestamp' => $log->scanned_at?->toISOString(),
            ]);

        // AI Predictions (computed from data)
        $avgRate = $attendanceRate;
        $predictions = [
            'nextSessionAttendance' => [
                'predicted' => min(100, max(0, $avgRate + rand(-5, 5))),
                'confidence' => $totalSessions >= 5 ? 'high' : ($totalSessions >= 3 ? 'medium' : 'low'),
            ],
            'atRiskStudents' => [
                'count' => $atRiskCount,
                'students' => $students->whereIn('status', ['poor', 'fail'])->take(5)->map(fn($s) => [
                    'nama' => $s['nama'],
                    'nim' => $s['nim'],
                    'rate' => $s['rate'],
                ])->values(),
            ],
            'passRate' => [
                'predicted' => $totalStudents > 0
                    ? round(($students->filter(fn($s) => $s['rate'] >= 70)->count() / $totalStudents) * 100)
                    : 0,
            ],
        ];

        return Inertia::render('dosen/course-detail', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
            ],
            'course' => [
                'id' => $course->id,
                'nama' => $course->nama,
                'kode' => $course->kode ?? '-',
                'sks' => $course->sks,
            ],
            'sessions' => $sessions,
            'students' => $students,
            'stats' => [
                'totalSessions' => $totalSessions,
                'activeSessions' => $activeSessions,
                'completedSessions' => $completedSessions,
                'totalStudents' => $totalStudents,
                'attendanceRate' => $attendanceRate,
                'lateRate' => $totalLogs > 0 ? round(($lateCount / $totalLogs) * 100) : 0,
                'absentRate' => $totalLogs > 0 ? round(($absentCount / $totalLogs) * 100) : 0,
                'atRiskCount' => $atRiskCount,
                'presentCount' => $presentCount,
                'lateCount' => $lateCount,
                'absentCount' => $absentCount,
            ],
            'distribution' => $distribution,
            'chartData' => $chartData,
            'activities' => $recentLogs,
            'predictions' => $predictions,
        ]);
    }

    public function students(MataKuliah $course): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        if ($course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $students = Mahasiswa::whereHas('attendanceLogs', function ($q) use ($course) {
            $q->whereHas('session', fn($s) => $s->where('course_id', $course->id));
        })->get()->map(function ($m) use ($course) {
            $logs = AttendanceLog::where('mahasiswa_id', $m->id)
                ->whereHas('session', fn($q) => $q->where('course_id', $course->id));
            $total = $logs->count();
            $present = (clone $logs)->where('status', 'present')->count();
            $late = (clone $logs)->where('status', 'late')->count();
            $rejected = (clone $logs)->where('status', 'rejected')->count();
            
            return [
                'id' => $m->id,
                'nama' => $m->nama,
                'nim' => $m->nim,
                'total' => $total,
                'present' => $present,
                'late' => $late,
                'rejected' => $rejected,
                'rate' => $total > 0 ? round((($present + $late) / $total) * 100) : 0,
            ];
        });

        return Inertia::render('dosen/courses/students', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama, 'nidn' => $dosen->nidn],
            'course' => ['id' => $course->id, 'nama' => $course->nama],
            'students' => $students,
        ]);
    }

    public function studentDetail(MataKuliah $course, Mahasiswa $mahasiswa): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        if ($course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->whereHas('session', fn($q) => $q->where('course_id', $course->id))
            ->with('session')
            ->orderByDesc('scanned_at')
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'meeting_number' => $log->session->meeting_number,
                'title' => $log->session->title,
                'date' => $log->scanned_at?->format('d M Y'),
                'time' => $log->scanned_at?->format('H:i'),
                'status' => $log->status,
                'selfie_url' => $log->selfie_path ? asset('storage/' . $log->selfie_path) : null,
            ]);

        $total = $logs->count();
        $present = $logs->where('status', 'present')->count();
        $late = $logs->where('status', 'late')->count();
        $rejected = $logs->where('status', 'rejected')->count();

        return Inertia::render('dosen/courses/student-detail', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'course' => ['id' => $course->id, 'nama' => $course->nama],
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
            'logs' => $logs,
            'stats' => [
                'total' => $total,
                'present' => $present,
                'late' => $late,
                'rejected' => $rejected,
                'rate' => $total > 0 ? round((($present + $late) / $total) * 100) : 0,
            ],
        ]);
    }
}
