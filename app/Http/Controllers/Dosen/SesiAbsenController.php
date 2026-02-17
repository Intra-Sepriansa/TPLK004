<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SesiAbsenController extends Controller
{
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Get courses taught by this dosen
        $courses = MataKuliah::where('dosen_id', $dosen->id)->select('id', 'nama', 'sks')->get();
        $courseIds = $courses->pluck('id')->toArray();
        
        // Get sessions for these courses
        $sessionsRaw = AttendanceSession::whereIn('course_id', $courseIds)
            ->with(['course', 'logs'])
            ->orderByDesc('start_at')
            ->get();

        $sessions = $sessionsRaw->map(fn($session) => [
            'id' => $session->id,
            'course_id' => $session->course_id,
            'course_name' => $session->course->nama ?? '-',
            'course_sks' => $session->course->sks ?? 0,
            'meeting_number' => $session->meeting_number,
            'title' => $session->title,
            'start_at' => $session->start_at?->format('d M Y H:i'),
            'end_at' => $session->end_at?->format('H:i'),
            'start_raw' => $session->start_at?->toISOString(),
            'is_active' => $session->is_active,
            'logs_count' => $session->logs->count(),
            'present_count' => $session->logs->where('status', 'present')->count(),
            'late_count' => $session->logs->where('status', 'late')->count(),
            'rejected_count' => $session->logs->where('status', 'rejected')->count(),
        ]);

        // Compute aggregate stats
        $totalPresent = $sessionsRaw->sum(fn($s) => $s->logs->where('status', 'present')->count());
        $totalLate = $sessionsRaw->sum(fn($s) => $s->logs->where('status', 'late')->count());
        $totalRejected = $sessionsRaw->sum(fn($s) => $s->logs->where('status', 'rejected')->count());
        $totalLogs = $sessionsRaw->sum(fn($s) => $s->logs->count());

        $thisMonthStart = Carbon::now()->startOfMonth();
        $thisMonthSessions = $sessionsRaw->filter(fn($s) => $s->start_at && $s->start_at->gte($thisMonthStart))->count();

        $avgAttendanceRate = $totalLogs > 0
            ? round(($totalPresent / $totalLogs) * 100, 1)
            : 0;

        $stats = [
            'totalSessions' => $sessionsRaw->count(),
            'activeSessions' => $sessionsRaw->where('is_active', true)->count(),
            'totalAttendance' => $totalPresent + $totalLate,
            'avgAttendanceRate' => $avgAttendanceRate,
            'totalLate' => $totalLate,
            'totalRejected' => $totalRejected,
            'thisMonthSessions' => $thisMonthSessions,
        ];

        return Inertia::render('dosen/sesi-absen', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'sessions' => $sessions,
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }
}
