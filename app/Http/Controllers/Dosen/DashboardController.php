<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\SelfieVerification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Get courses taught by this dosen (using dosen_id in mata_kuliah table)
        $courses = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->get();
        $courseIds = $courses->pluck('id');

        // Stats
        $totalCourses = $courses->count();
        
        // Get unique students who have attended any session of this dosen's courses
        $totalStudents = Mahasiswa::whereHas('attendanceLogs', function ($q) use ($courseIds) {
            $q->whereHas('session', fn($s) => $s->whereIn('course_id', $courseIds));
        })->distinct()->count();
        
        // If no attendance logs, count all students (assuming all students take all courses)
        if ($totalStudents === 0) {
            $totalStudents = Mahasiswa::count();
        }

        $totalSessions = AttendanceSession::whereIn('course_id', $courseIds)->count();
        $thisMonthSessions = AttendanceSession::whereIn('course_id', $courseIds)
            ->whereMonth('start_at', now()->month)
            ->whereYear('start_at', now()->year)
            ->count();

        // Attendance rate: (jumlah mahasiswa yang absen / total mahasiswa) × 100
        // Count unique students who have attended (present or late)
        $attendedStudents = AttendanceLog::whereHas('session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->whereIn('status', ['present', 'late'])
            ->distinct('mahasiswa_id')
            ->count('mahasiswa_id');
        
        $attendanceRate = $totalStudents > 0 ? (int) round(($attendedStudents / $totalStudents) * 100) : 0;

        // Pending verifications
        $pendingVerifications = SelfieVerification::where('status', 'pending')
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'mahasiswa' => $v->attendanceLog->mahasiswa->nama ?? '-',
                'nim' => $v->attendanceLog->mahasiswa->nim ?? '-',
                'course' => $v->attendanceLog->session->course->nama ?? '-',
                'selfie_url' => $v->attendanceLog->selfie_path ? asset('storage/' . $v->attendanceLog->selfie_path) : null,
                'scanned_at' => $v->attendanceLog->scanned_at?->format('d M Y H:i'),
            ]);

        $pendingCount = SelfieVerification::where('status', 'pending')
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->count();

        // Active sessions
        $activeSessions = AttendanceSession::whereIn('course_id', $courseIds)
            ->where('is_active', true)
            ->with('course')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'title' => $s->title,
                'meeting_number' => $s->meeting_number,
                'course' => $s->course->nama ?? '-',
                'start_at' => $s->start_at?->format('H:i'),
                'end_at' => $s->end_at?->format('H:i'),
                'attendance_count' => $s->logs()->count(),
            ]);

        // Monthly trend (6 months)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('M Y');
            
            // Count unique students who attended in this month
            $attendedInMonth = AttendanceLog::whereHas('session', fn($q) => $q->whereIn('course_id', $courseIds))
                ->whereMonth('scanned_at', $date->month)
                ->whereYear('scanned_at', $date->year)
                ->whereIn('status', ['present', 'late'])
                ->distinct('mahasiswa_id')
                ->count('mahasiswa_id');
            
            $totalLogs = AttendanceLog::whereHas('session', fn($q) => $q->whereIn('course_id', $courseIds))
                ->whereMonth('scanned_at', $date->month)
                ->whereYear('scanned_at', $date->year)
                ->count();
            
            $monthlyTrend[] = [
                'month' => $month,
                'total' => $totalLogs,
                'present' => $attendedInMonth,
                'rate' => $totalStudents > 0 ? (int) round(($attendedInMonth / $totalStudents) * 100) : 0,
            ];
        }

        // Course stats
        $courseStats = $courses->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->nama,
            'sks' => $c->sks,
            'sessions' => AttendanceSession::where('course_id', $c->id)->count(),
            'present' => AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $c->id))
                ->where('status', 'present')->count(),
            'late' => AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $c->id))
                ->where('status', 'late')->count(),
            'absent' => AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $c->id))
                ->where('status', 'rejected')->count(),
        ]);

        // Recent activity
        $recentActivity = AttendanceLog::whereHas('session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->with(['mahasiswa', 'session.course'])
            ->latest('scanned_at')
            ->take(10)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'mahasiswa' => $log->mahasiswa->nama ?? '-',
                'nim' => $log->mahasiswa->nim ?? '-',
                'course' => $log->session->course->nama ?? '-',
                'status' => $log->status,
                'time' => $log->scanned_at?->diffForHumans(),
            ]);

        // Today's schedule
        $todaySchedule = AttendanceSession::whereIn('course_id', $courseIds)
            ->whereDate('start_at', today())
            ->with('course')
            ->orderBy('start_at')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'course_name' => $s->course->nama ?? '-',
                'meeting_number' => $s->meeting_number,
                'time' => $s->start_at?->format('H:i') . ' - ' . $s->end_at?->format('H:i'),
                'room' => $s->room ?? 'TBA',
                'student_count' => Mahasiswa::whereHas('attendanceLogs', fn($q) => $q->where('attendance_session_id', $s->id))->count(),
            ]);

        return Inertia::render('dosen/dashboard', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
                'avatar_url' => $dosen->avatar_url,
                'initials' => $dosen->initials,
            ],
            'stats' => [
                'totalCourses' => $totalCourses,
                'totalStudents' => $totalStudents,
                'totalSessions' => $totalSessions,
                'thisMonthSessions' => $thisMonthSessions,
                'attendanceRate' => $attendanceRate,
                'pendingCount' => $pendingCount,
                'todaySessionsCount' => $activeSessions->count(),
                'averageAttendanceRate' => $attendanceRate,
            ],
            'pendingVerifications' => $pendingVerifications,
            'activeSessions' => $activeSessions,
            'monthlyTrend' => $monthlyTrend,
            'courseStats' => $courseStats,
            'recentActivity' => $recentActivity,
            'todaySchedule' => $todaySchedule,
        ]);
    }
}
