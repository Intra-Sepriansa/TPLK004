<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\AttendanceToken;
use App\Models\MataKuliah;
use App\Models\Mahasiswa;
use App\Models\SelfieVerification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SesiAbsenController extends Controller
{
    public function index(Request $request): Response
    {
        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all');
        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 10);

        // Build query
        $query = AttendanceSession::with(['course.dosen'])
            ->withCount(['logs', 'tokens']);

        if ($courseId !== 'all') {
            $query->where('course_id', $courseId);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'completed') {
            $query->where('is_active', false)->where('end_at', '<', now());
        } elseif ($status === 'scheduled') {
            $query->where('is_active', false)->where('start_at', '>', now());
        } elseif ($status === 'ongoing') {
            $query->where('start_at', '<=', now())->where('end_at', '>=', now());
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('course', fn($c) => $c->where('nama', 'like', "%{$search}%"));
            });
        }

        $sessions = $query->orderBy('start_at', 'desc')->paginate($perPage)->withQueryString();

        // Transform sessions with additional data
        $sessions->through(function ($session) {
            $presentCount = AttendanceLog::where('attendance_session_id', $session->id)
                ->where('status', 'present')->count();
            $lateCount = AttendanceLog::where('attendance_session_id', $session->id)
                ->where('status', 'late')->count();
            $rejectedCount = AttendanceLog::where('attendance_session_id', $session->id)
                ->where('status', 'rejected')->count();

            return [
                'id' => $session->id,
                'course_id' => $session->course_id,
                'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
                'dosen_name' => $session->course?->dosen?->nama ?? '-',
                'meeting_number' => $session->meeting_number,
                'title' => $session->title,
                'start_at' => $session->start_at?->format('Y-m-d H:i'),
                'end_at' => $session->end_at?->format('Y-m-d H:i'),
                'is_active' => $session->is_active,
                'logs_count' => $session->logs_count,
                'tokens_count' => $session->tokens_count,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'rejected_count' => $rejectedCount,
                'status' => $this->getSessionStatus($session),
                'duration_minutes' => $session->start_at && $session->end_at
                    ? $session->start_at->diffInMinutes($session->end_at)
                    : 0,
            ];
        });

        // Get courses for filter
        $courses = MataKuliah::with('dosen')->orderBy('nama')->get()->map(fn($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
            'sks' => $c->sks,
            'dosen' => $c->dosen?->nama ?? '-',
        ]);

        // Statistics
        $stats = $this->getStats();

        // Active session detail
        $activeSession = AttendanceSession::with(['course.dosen'])
            ->where('is_active', true)
            ->first();

        $activeSessionDetail = null;
        if ($activeSession) {
            $activeSessionDetail = $this->getSessionDetail($activeSession);
        }

        // Today's sessions
        $todaySessions = AttendanceSession::with(['course'])
            ->whereDate('start_at', today())
            ->orderBy('start_at')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'course' => $s->course?->nama ?? '-',
                'meeting' => $s->meeting_number,
                'time' => $s->start_at?->format('H:i') . ' - ' . $s->end_at?->format('H:i'),
                'is_active' => $s->is_active,
                'status' => $this->getSessionStatus($s),
            ]);

        // Hourly distribution for today
        $hourlyDistribution = $this->getHourlyDistribution();

        // Weekly trend
        $weeklyTrend = $this->getWeeklyTrend();

        // Course performance
        $coursePerformance = $this->getCoursePerformance();

        return Inertia::render('admin/sesi-absen', [
            'sessions' => $sessions,
            'courses' => $courses,
            'stats' => $stats,
            'activeSessionDetail' => $activeSessionDetail,
            'todaySessions' => $todaySessions,
            'hourlyDistribution' => $hourlyDistribution,
            'weeklyTrend' => $weeklyTrend,
            'coursePerformance' => $coursePerformance,
            'filters' => [
                'course_id' => $courseId,
                'status' => $status,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(AttendanceSession $session): Response
    {
        $session->load(['course.dosen', 'logs.mahasiswa', 'logs.selfieVerification', 'tokens']);

        $detail = $this->getSessionDetail($session);

        // Attendance list
        $attendanceList = $session->logs->map(fn($log) => [
            'id' => $log->id,
            'mahasiswa_id' => $log->mahasiswa_id,
            'nama' => $log->mahasiswa?->nama ?? 'Unknown',
            'nim' => $log->mahasiswa?->nim ?? '-',
            'status' => $log->status,
            'scanned_at' => $log->scanned_at?->format('H:i:s'),
            'distance_m' => $log->distance_m,
            'selfie_status' => $log->selfieVerification?->status,
            'device_info' => $log->device_os . ' ' . $log->device_model,
        ]);

        // Token history
        $tokenHistory = $session->tokens->map(fn($t) => [
            'id' => $t->id,
            'token' => $t->token,
            'created_at' => $t->created_at?->format('H:i:s'),
            'expires_at' => $t->expires_at?->format('H:i:s'),
            'is_expired' => $t->expires_at ? $t->expires_at->isPast() : true,
        ]);

        // Timeline
        $timeline = $this->getSessionTimeline($session);

        return Inertia::render('admin/sesi-absen-detail', [
            'session' => $detail,
            'attendanceList' => $attendanceList,
            'tokenHistory' => $tokenHistory,
            'timeline' => $timeline,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'meeting_number' => 'required|integer|min:1|max:21',
            'title' => 'nullable|string|max:255',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'auto_activate' => 'boolean',
        ]);

        // Deactivate other sessions if auto_activate
        if ($request->boolean('auto_activate')) {
            AttendanceSession::where('is_active', true)->update(['is_active' => false]);
        }

        AttendanceSession::create([
            'course_id' => $request->course_id,
            'meeting_number' => $request->meeting_number,
            'title' => $request->title,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'is_active' => $request->boolean('auto_activate'),
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Sesi absen berhasil dibuat.');
    }

    public function update(Request $request, AttendanceSession $session): RedirectResponse
    {
        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'meeting_number' => 'required|integer|min:1|max:21',
            'title' => 'nullable|string|max:255',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);

        $session->update($request->only(['course_id', 'meeting_number', 'title', 'start_at', 'end_at']));

        return back()->with('success', 'Sesi absen berhasil diperbarui.');
    }

    public function destroy(AttendanceSession $session): RedirectResponse
    {
        if ($session->logs()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus sesi yang sudah memiliki data kehadiran.');
        }

        $session->delete();
        return back()->with('success', 'Sesi absen berhasil dihapus.');
    }

    public function activate(AttendanceSession $session): RedirectResponse
    {
        AttendanceSession::where('is_active', true)->update(['is_active' => false]);
        $session->update(['is_active' => true]);

        return back()->with('success', 'Sesi berhasil diaktifkan.');
    }

    public function deactivate(AttendanceSession $session): RedirectResponse
    {
        $session->update(['is_active' => false]);
        return back()->with('success', 'Sesi berhasil dinonaktifkan.');
    }

    public function duplicate(AttendanceSession $session): RedirectResponse
    {
        $nextMeeting = AttendanceSession::where('course_id', $session->course_id)
            ->max('meeting_number') + 1;

        AttendanceSession::create([
            'course_id' => $session->course_id,
            'meeting_number' => $nextMeeting,
            'title' => $session->title,
            'start_at' => now()->addWeek()->setTimeFrom($session->start_at),
            'end_at' => now()->addWeek()->setTimeFrom($session->end_at),
            'is_active' => false,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Sesi berhasil diduplikasi untuk pertemuan berikutnya.');
    }

    public function exportPdf(Request $request)
    {
        $sessionId = $request->get('session_id');

        if ($sessionId) {
            $session = AttendanceSession::with(['course.dosen', 'logs.mahasiswa'])->findOrFail($sessionId);
            $sessions = collect([$session]);
        } else {
            $sessions = AttendanceSession::with(['course.dosen'])
                ->withCount('logs')
                ->whereDate('start_at', '>=', now()->subMonth())
                ->orderBy('start_at', 'desc')
                ->get();
        }

        $data = [
            'sessions' => $sessions,
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
        ];

        $pdf = Pdf::loadView('pdf.sesi-absen', $data);
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('Sesi_Absen_' . now()->format('Y-m-d') . '.pdf');
    }

    private function getSessionStatus(AttendanceSession $session): string
    {
        if ($session->is_active) return 'active';
        if ($session->start_at > now()) return 'scheduled';
        if ($session->end_at < now()) return 'completed';
        return 'ongoing';
    }

    private function getSessionDetail(AttendanceSession $session): array
    {
        $presentCount = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('status', 'present')->count();
        $lateCount = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('status', 'late')->count();
        $rejectedCount = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('status', 'rejected')->count();
        $pendingSelfie = AttendanceLog::where('attendance_session_id', $session->id)
            ->whereHas('selfieVerification', fn($q) => $q->where('status', 'pending'))
            ->count();

        $totalTokens = AttendanceToken::where('attendance_session_id', $session->id)->count();
        $activeTokens = AttendanceToken::where('attendance_session_id', $session->id)
            ->where('expires_at', '>', now())->count();

        return [
            'id' => $session->id,
            'course_id' => $session->course_id,
            'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
            'dosen_name' => $session->course?->dosen?->nama ?? '-',
            'meeting_number' => $session->meeting_number,
            'title' => $session->title,
            'start_at' => $session->start_at?->format('Y-m-d H:i'),
            'end_at' => $session->end_at?->format('Y-m-d H:i'),
            'is_active' => $session->is_active,
            'status' => $this->getSessionStatus($session),
            'total_attendance' => $presentCount + $lateCount,
            'present_count' => $presentCount,
            'late_count' => $lateCount,
            'rejected_count' => $rejectedCount,
            'pending_selfie' => $pendingSelfie,
            'total_tokens' => $totalTokens,
            'active_tokens' => $activeTokens,
            'duration_minutes' => $session->start_at && $session->end_at
                ? $session->start_at->diffInMinutes($session->end_at)
                : 0,
            'time_remaining' => $session->end_at && $session->end_at > now()
                ? now()->diffInMinutes($session->end_at)
                : 0,
        ];
    }

    private function getStats(): array
    {
        $today = today();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return [
            'total_sessions' => AttendanceSession::count(),
            'active_sessions' => AttendanceSession::where('is_active', true)->count(),
            'today_sessions' => AttendanceSession::whereDate('start_at', $today)->count(),
            'today_attendance' => AttendanceLog::whereDate('scanned_at', $today)->count(),
            'week_sessions' => AttendanceSession::where('start_at', '>=', $thisWeek)->count(),
            'week_attendance' => AttendanceLog::where('scanned_at', '>=', $thisWeek)->count(),
            'month_sessions' => AttendanceSession::where('start_at', '>=', $thisMonth)->count(),
            'month_attendance' => AttendanceLog::where('scanned_at', '>=', $thisMonth)->count(),
            'avg_attendance_per_session' => round(
                AttendanceSession::where('start_at', '>=', $thisMonth)->count() > 0
                    ? AttendanceLog::where('scanned_at', '>=', $thisMonth)->count() /
                      AttendanceSession::where('start_at', '>=', $thisMonth)->count()
                    : 0,
                1
            ),
            'completion_rate' => AttendanceSession::count() > 0
                ? round(
                    AttendanceSession::where('end_at', '<', now())->count() /
                    AttendanceSession::count() * 100,
                    1
                )
                : 0,
        ];
    }

    private function getHourlyDistribution(): array
    {
        $hourlyData = AttendanceLog::whereDate('scanned_at', today())
            ->selectRaw('HOUR(scanned_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('total', 'hour')
            ->toArray();

        $result = [];
        for ($i = 6; $i <= 22; $i++) {
            $result[] = [
                'hour' => sprintf('%02d:00', $i),
                'count' => $hourlyData[$i] ?? 0,
            ];
        }

        return $result;
    }

    private function getWeeklyTrend(): array
    {
        $result = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $sessions = AttendanceSession::whereDate('start_at', $date)->count();
            $attendance = AttendanceLog::whereDate('scanned_at', $date)->count();

            $result[] = [
                'date' => $date->format('d M'),
                'day' => $date->translatedFormat('D'),
                'sessions' => $sessions,
                'attendance' => $attendance,
            ];
        }

        return $result;
    }

    private function getCoursePerformance(): array
    {
        return MataKuliah::withCount([
            'sessions as total_sessions',
            'sessions as completed_sessions' => fn($q) => $q->where('end_at', '<', now()),
        ])
        ->having('total_sessions', '>', 0)
        ->orderByDesc('total_sessions')
        ->take(10)
        ->get()
        ->map(function ($c) {
            $totalAttendance = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $c->id))->count();
            return [
                'id' => $c->id,
                'name' => $c->nama,
                'total_sessions' => $c->total_sessions,
                'completed_sessions' => $c->completed_sessions,
                'avg_attendance' => $c->total_sessions > 0
                    ? round($totalAttendance / $c->total_sessions, 1)
                    : 0,
            ];
        })
        ->toArray();
    }

    private function getSessionTimeline(AttendanceSession $session): array
    {
        $timeline = [];

        // Session created
        $timeline[] = [
            'type' => 'created',
            'time' => $session->created_at?->format('H:i:s'),
            'description' => 'Sesi dibuat',
        ];

        // First token generated
        $firstToken = $session->tokens()->orderBy('created_at')->first();
        if ($firstToken) {
            $timeline[] = [
                'type' => 'token',
                'time' => $firstToken->created_at?->format('H:i:s'),
                'description' => 'Token pertama digenerate',
            ];
        }

        // First attendance
        $firstLog = $session->logs()->orderBy('scanned_at')->first();
        if ($firstLog) {
            $timeline[] = [
                'type' => 'attendance',
                'time' => $firstLog->scanned_at?->format('H:i:s'),
                'description' => 'Kehadiran pertama: ' . ($firstLog->mahasiswa?->nama ?? 'Unknown'),
            ];
        }

        // Last attendance
        $lastLog = $session->logs()->orderBy('scanned_at', 'desc')->first();
        if ($lastLog && $lastLog->id !== $firstLog?->id) {
            $timeline[] = [
                'type' => 'attendance',
                'time' => $lastLog->scanned_at?->format('H:i:s'),
                'description' => 'Kehadiran terakhir: ' . ($lastLog->mahasiswa?->nama ?? 'Unknown'),
            ];
        }

        // Session ended
        if ($session->end_at && $session->end_at < now()) {
            $timeline[] = [
                'type' => 'ended',
                'time' => $session->end_at?->format('H:i:s'),
                'description' => 'Sesi berakhir',
            ];
        }

        return $timeline;
    }
}
