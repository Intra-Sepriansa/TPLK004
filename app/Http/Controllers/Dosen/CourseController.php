<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        $courses = $dosen->courses()->get()->map(function ($course) {
            $totalSessions = AttendanceSession::where('course_id', $course->id)->count();
            $totalLogs = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))->count();
            $presentLogs = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))
                ->whereIn('status', ['present', 'late'])->count();
            
            $students = Mahasiswa::whereHas('attendanceLogs', function ($q) use ($course) {
                $q->whereHas('session', fn($s) => $s->where('course_id', $course->id));
            })->count();

            return [
                'id' => $course->id,
                'nama' => $course->nama,
                'kode' => $course->kode ?? '-',
                'sks' => $course->sks,
                'role' => $course->pivot->role,
                'totalSessions' => $totalSessions,
                'totalStudents' => $students,
                'attendanceRate' => $totalLogs > 0 ? round(($presentLogs / $totalLogs) * 100) : 0,
            ];
        });

        return Inertia::render('dosen/courses', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
            ],
            'courses' => $courses,
        ]);
    }

    public function show(MataKuliah $course): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Verify dosen has access to this course
        if (!$dosen->courses()->where('mata_kuliah.id', $course->id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke mata kuliah ini.');
        }

        // Sessions
        $sessions = AttendanceSession::where('course_id', $course->id)
            ->orderByDesc('start_at')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'meeting_number' => $s->meeting_number,
                'start_at' => $s->start_at?->format('d M Y H:i'),
                'end_at' => $s->end_at?->format('H:i'),
                'is_active' => $s->is_active,
                'attendance_count' => $s->logs()->count(),
                'present_count' => $s->logs()->where('status', 'present')->count(),
                'late_count' => $s->logs()->where('status', 'late')->count(),
            ]);

        // Students with attendance
        $students = Mahasiswa::whereHas('attendanceLogs', function ($q) use ($course) {
            $q->whereHas('session', fn($s) => $s->where('course_id', $course->id));
        })->get()->map(function ($m) use ($course) {
            $logs = AttendanceLog::where('mahasiswa_id', $m->id)
                ->whereHas('session', fn($q) => $q->where('course_id', $course->id));
            $total = $logs->count();
            $present = (clone $logs)->whereIn('status', ['present', 'late'])->count();
            
            return [
                'id' => $m->id,
                'nama' => $m->nama,
                'nim' => $m->nim,
                'total' => $total,
                'present' => $present,
                'rate' => $total > 0 ? round(($present / $total) * 100) : 0,
            ];
        });

        // Stats
        $totalSessions = $sessions->count();
        $totalLogs = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))->count();
        $presentLogs = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))
            ->whereIn('status', ['present', 'late'])->count();
        $lateLogs = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))
            ->where('status', 'late')->count();

        // Distribution
        $distribution = [
            ['name' => 'Hadir', 'value' => AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))->where('status', 'present')->count(), 'color' => '#10b981'],
            ['name' => 'Terlambat', 'value' => $lateLogs, 'color' => '#f59e0b'],
            ['name' => 'Ditolak', 'value' => AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $course->id))->where('status', 'rejected')->count(), 'color' => '#f43f5e'],
        ];

        return Inertia::render('dosen/courses/show', [
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
                'totalStudents' => $students->count(),
                'attendanceRate' => $totalLogs > 0 ? round(($presentLogs / $totalLogs) * 100) : 0,
                'lateRate' => $totalLogs > 0 ? round(($lateLogs / $totalLogs) * 100) : 0,
            ],
            'distribution' => $distribution,
        ]);
    }

    public function students(MataKuliah $course): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen->courses()->where('mata_kuliah.id', $course->id)->exists()) {
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
        
        if (!$dosen->courses()->where('mata_kuliah.id', $course->id)->exists()) {
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
