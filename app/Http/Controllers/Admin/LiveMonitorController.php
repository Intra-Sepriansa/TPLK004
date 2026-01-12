<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LiveMonitorController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AttendanceSession::with('course')
            ->where('is_active', true)
            ->first();

        // Get recent logs
        $logsQuery = AttendanceLog::with(['mahasiswa', 'session.course', 'selfieVerification'])
            ->orderBy('scanned_at', 'desc');

        if ($activeSession) {
            $logsQuery->where('attendance_session_id', $activeSession->id);
        }

        $recentLogs = $logsQuery->take(50)->get()->map(fn($log) => [
            'id' => $log->id,
            'name' => $log->mahasiswa?->nama ?? 'Unknown',
            'nim' => $log->mahasiswa?->nim ?? '-',
            'time' => $log->scanned_at?->format('H:i:s'),
            'status' => $log->status,
            'distance_m' => $log->distance_m,
            'selfie_status' => $log->selfieVerification?->status,
            'device_info' => $log->device_info,
            'course' => $log->session?->course?->nama ?? '-',
        ]);

        // Live stats
        $todayStats = [
            'total_scans' => AttendanceLog::whereDate('scanned_at', today())->count(),
            'present' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'present')->count(),
            'late' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'late')->count(),
            'rejected' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'rejected')->count(),
        ];

        // Session stats if active
        $sessionStats = null;
        if ($activeSession) {
            $sessionStats = [
                'total' => AttendanceLog::where('attendance_session_id', $activeSession->id)->count(),
                'present' => AttendanceLog::where('attendance_session_id', $activeSession->id)->where('status', 'present')->count(),
                'late' => AttendanceLog::where('attendance_session_id', $activeSession->id)->where('status', 'late')->count(),
                'rejected' => AttendanceLog::where('attendance_session_id', $activeSession->id)->where('status', 'rejected')->count(),
                'pending_selfie' => AttendanceLog::where('attendance_session_id', $activeSession->id)
                    ->whereHas('selfieVerification', fn($q) => $q->where('status', 'pending'))
                    ->count(),
            ];
        }

        // Hourly scan distribution
        $hourlyScans = AttendanceLog::whereDate('scanned_at', today())
            ->selectRaw('HOUR(scanned_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('total', 'hour')
            ->toArray();

        $hourlyData = [];
        for ($i = 6; $i <= 22; $i++) {
            $hourlyData[] = [
                'hour' => sprintf('%02d:00', $i),
                'scans' => $hourlyScans[$i] ?? 0,
            ];
        }

        // Status distribution for pie chart
        $statusDistribution = AttendanceLog::whereDate('scanned_at', today())
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'status' => $item->status,
                'total' => $item->total,
            ]);

        // Recent sessions
        $recentSessions = AttendanceSession::with('course')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($session) => [
                'id' => $session->id,
                'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
                'meeting_number' => $session->meeting_number,
                'is_active' => $session->is_active,
                'total_attendance' => AttendanceLog::where('attendance_session_id', $session->id)->count(),
            ]);

        return Inertia::render('admin/live-monitor', [
            'activeSession' => $activeSession ? [
                'id' => $activeSession->id,
                'title' => $activeSession->title,
                'meeting_number' => $activeSession->meeting_number,
                'course' => $activeSession->course ? [
                    'nama' => $activeSession->course->nama,
                ] : null,
                'start_at' => $activeSession->start_at?->format('H:i'),
                'end_at' => $activeSession->end_at?->format('H:i'),
            ] : null,
            'recentLogs' => $recentLogs,
            'todayStats' => $todayStats,
            'sessionStats' => $sessionStats,
            'hourlyData' => $hourlyData,
            'statusDistribution' => $statusDistribution,
            'recentSessions' => $recentSessions,
        ]);
    }

    public function logs(Request $request)
    {
        $sessionId = $request->query('session_id');

        $logsQuery = AttendanceLog::with(['mahasiswa', 'session.course', 'selfieVerification'])
            ->orderBy('scanned_at', 'desc');

        if ($sessionId) {
            $logsQuery->where('attendance_session_id', $sessionId);
        }

        $logs = $logsQuery->take(50)->get()->map(fn($log) => [
            'id' => $log->id,
            'name' => $log->mahasiswa?->nama ?? 'Unknown',
            'nim' => $log->mahasiswa?->nim ?? '-',
            'time' => $log->scanned_at?->format('H:i:s'),
            'status' => $log->status,
            'distance_m' => $log->distance_m,
            'selfie_status' => $log->selfieVerification?->status,
        ]);

        return response()->json(['logs' => $logs]);
    }
}
