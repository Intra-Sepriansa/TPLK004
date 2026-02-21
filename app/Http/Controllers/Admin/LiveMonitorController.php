<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AktivitasTerbaruExport;

class LiveMonitorController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/live-monitor', $this->getLiveMonitorData());
    }

    public function refresh(Request $request)
    {
        return response()->json($this->getLiveMonitorData());
    }

    public function exportToday(Request $request)
    {
        $logs = AttendanceLog::with(['mahasiswa', 'session.course'])
            ->whereDate('scanned_at', today())
            ->orderBy('scanned_at', 'desc')
            ->get();
            
        return Excel::download(new AktivitasTerbaruExport($logs), 'Live_Monitor_Export_' . now()->format('Y_m_d_His') . '.xlsx');
    }

    private function getLiveMonitorData(): array
    {
        $today = today();
        
        $activeSessionsData = AttendanceSession::with(['course', 'dosen'])
            ->where('is_active', true)
            ->get();
            
        $activeSessions = $activeSessionsData->map(function ($sess) {
            $total = 40; // Default/mock, can be dynamic
            $present = AttendanceLog::where('attendance_session_id', $sess->id)->whereIn('status', ['present', 'late'])->count();
            return [
                'id' => $sess->id,
                'course' => $sess->course?->nama ?? 'Custom Course',
                'class' => 'Kelas A',
                'lecturer' => $sess->dosen?->nama ?? 'Dosen Pengampu',
                'present' => $present,
                'total' => $total,
                'timeLeft' => 'Live',
            ];
        });

        $recentLogs = AttendanceLog::with(['mahasiswa', 'session.course'])
            ->orderBy('scanned_at', 'desc')
            ->take(50)
            ->get();

        $recentActivities = $recentLogs->map(function ($log) {
            return [
                'id' => $log->id,
                'student_name' => $log->mahasiswa?->nama ?? 'Unknown',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'session_name' => $log->session ? ($log->session->course?->nama . ' - Pertemuan ' . $log->session->meeting_number) : '-',
                'course' => $log->session?->course?->nama ?? '-',
                'time' => $log->scanned_at?->format('H:i:s'),
                'status' => $log->status === 'present' ? 'hadir' : ($log->status === 'late' ? 'terlambat' : ($log->status === 'rejected' ? 'anomali' : 'excused')),
                'distance' => $log->distance_m,
                'device' => $log->device_info,
                'anomaly_reason' => $log->status === 'rejected' ? 'Jarak terlalu jauh dari radius yang diizinkan' : null,
                'isNew' => false,
            ];
        });

        $anomalies = $recentLogs->filter(fn($log) => $log->status === 'rejected')->take(10)->map(function ($log) {
            return [
                'id' => $log->id,
                'type' => 'Lokasi Tidak Valid',
                'message' => $log->mahasiswa?->nama . ' absen di luar radius (' . $log->distance_m . 'm).',
            ];
        })->values();

        $hadir = AttendanceLog::whereDate('scanned_at', $today)->where('status', 'present')->count();
        $terlambat = AttendanceLog::whereDate('scanned_at', $today)->where('status', 'late')->count();
        $izin = AttendanceLog::whereDate('scanned_at', $today)->where('status', 'excused')->count();
        $anomali = AttendanceLog::whereDate('scanned_at', $today)->where('status', 'rejected')->count();
        $totalScans = $hadir + $terlambat + $izin + $anomali;

        $todayStats = [
            'hadir' => $hadir,
            'terlambat' => $terlambat,
            'izin' => $izin,
            'anomali' => $anomali,
        ];

        $stats = [
            'activeSessions' => $activeSessions->count(),
            'totalScans' => $totalScans,
            'activeStudents' => $todayStats['hadir'] + $todayStats['terlambat'],
            'present' => $hadir,
            'late' => $terlambat,
            'anomaly' => $anomali,
            'scanRate' => 85,
            'presentRate' => $totalScans > 0 ? round(($hadir / $totalScans) * 100) : 0,
            'lateRate' => $totalScans > 0 ? round(($terlambat / $totalScans) * 100) : 0,
        ];

        // Hourly scans
        $hourlyScans = AttendanceLog::whereDate('scanned_at', $today)
            ->selectRaw('HOUR(scanned_at) as hour, COUNT(*) as scans')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('scans', 'hour')
            ->toArray();

        $chartData = [];
        for ($i = 6; $i <= 22; $i++) {
            $chartData[] = [
                'hour' => sprintf('%02d:00', $i),
                'scans' => $hourlyScans[$i] ?? 0,
            ];
        }

        return [
            'initialStats' => $stats,
            'initialRecentActivities' => $recentActivities,
            'initialActiveSessions' => $activeSessions,
            'initialTodayStats' => $todayStats,
            'initialAnomalies' => $anomalies,
            'initialChartData' => $chartData,
        ];
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

    public function aktivitasTerbaru(Request $request): Response
    {
        $activeSession = AttendanceSession::with('course')
            ->where('is_active', true)
            ->first();

        // Get initial logs for the feed
        $logsQuery = AttendanceLog::with(['mahasiswa', 'session.course', 'selfieVerification'])
            ->orderBy('scanned_at', 'desc');

        if ($activeSession) {
            $logsQuery->where('attendance_session_id', $activeSession->id);
        }

        $activities = $logsQuery->take(100)->get()->map(fn($log) => [
            'id' => $log->id,
            'student_name' => $log->mahasiswa?->nama ?? 'Unknown',
            'nim' => $log->mahasiswa?->nim ?? '-',
            'session_name' => $log->session?->course?->nama ? $log->session->course->nama . ' - Pertemuan ' . $log->session->meeting_number : '-',
            'session_id' => $log->attendance_session_id,
            'time' => $log->scanned_at?->format('H:i:s'),
            'status' => $log->status === 'present' ? 'hadir' : ($log->status === 'late' ? 'terlambat' : ($log->status === 'rejected' ? 'anomali' : 'izin')),
            'distance' => $log->distance_m,
            'method' => 'GPS/QR Code', // Could be populated from actual method if available
            'location' => 'Universitas', // Mock or use actual location data
            'device' => $log->device_info ?? 'Unknown Device',
            'gps_accuracy' => 10,
            'ip_address' => request()->ip(), // Or from log
            'os' => 'Unknown OS',
            'browser' => 'Unknown Browser',
            'user_agent' => $log->device_info,
            'coordinates' => '-',
            'selfie' => null, // Placeholder if actual selfie url exists
            'face_match' => 0,
            'isNew' => false,
            'student' => [
                'name' => $log->mahasiswa?->nama ?? 'Unknown',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'initials' => substr($log->mahasiswa?->nama ?? 'U', 0, 2),
                'photo' => null, // Provide standard mock or real user avatar
                'major' => 'Manajemen Informatika',
                'semester' => '3',
                'email' => strtolower(str_replace(' ', '', $log->mahasiswa?->nama ?? 'unknown')) . '@unja.ac.id',
                'phone' => '081234567890',
                'recentAttendance' => [
                    ['date' => today()->subDays(1)->format('d M Y'), 'status' => 'hadir'],
                    ['date' => today()->subDays(2)->format('d M Y'), 'status' => 'hadir'],
                    ['date' => today()->subDays(3)->format('d M Y'), 'status' => 'hadir'],
                ]
            ]
        ]);

        $activeSessionsData = AttendanceSession::with(['course', 'lecturer'])
            ->where('is_active', true)
            ->get()
            ->map(fn($sess) => [
                'id' => $sess->id,
                'course' => $sess->course?->nama ?? 'Custom Course',
                'class' => 'Kelas A',
                'lecturer' => $sess->lecturer?->name ?? 'Dosen Pengampu',
                'location' => 'Ruang 101',
                'present' => AttendanceLog::where('attendance_session_id', $sess->id)->whereIn('status', ['present', 'late'])->count(),
                'total' => 40, // Mock total
                'timeLeft' => '45 menit',
                'progress' => 0
            ]);

         $todayStats = [
             'hadir' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'present')->count(),
             'terlambat' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'late')->count(),
             'izin' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'excused')->count(),
             'anomali' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'rejected')->count(),
         ];

        return Inertia::render('admin/aktivitas-terbaru', [
            'initialActivities' => $activities,
            'initialActiveSessions' => $activeSessionsData,
            'initialTodayStats' => $todayStats,
            'initialStats' => [
                'activeSessions' => $activeSessionsData->count(),
                'totalScans' => AttendanceLog::whereDate('scanned_at', today())->count(),
                'activeStudents' => $activities->count(),
                'anomalyCount' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'rejected')->count(),
                'scanRate' => 85, // Mock percentage
            ]
        ]);
    }

    public function exportAktivitasTerbaru(Request $request)
    {
        $format = $request->query('format', 'excel');
        $statusFilter = $request->query('status', 'all');
        $sessionFilter = $request->query('session', 'all');

        $query = AttendanceLog::with(['mahasiswa', 'session.course'])
            ->orderBy('scanned_at', 'desc');

        if ($statusFilter !== 'all') {
            if ($statusFilter === 'anomali') {
                $query->whereIn('status', ['rejected', 'alpha', 'absent']);
            } else {
                $query->where('status', $statusFilter);
            }
        }

        if ($sessionFilter !== 'all') {
            $query->where('attendance_session_id', $sessionFilter);
        }

        // Limit to 500 records for export performance
        $logs = $query->take(500)->get();

        if ($format === 'pdf') {
            $logoUnpam = public_path('images/logo_unpam.png');
            $logoSasmita = public_path('images/logo_sasmita.png');
            $pdf = Pdf::loadView('pdf.aktivitas-terbaru', [
                'logs' => $logs,
                'filter_status' => $statusFilter,
                'filter_session' => $sessionFilter,
                'logoUnpam' => $logoUnpam,
                'logoSasmita' => $logoSasmita,
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf->download('Laporan_Aktivitas_Terbaru_' . now()->format('Y_m_d_His') . '.pdf');
        }

        return Excel::download(new AktivitasTerbaruExport($logs), 'Laporan_Aktivitas_Terbaru_' . now()->format('Y_m_d_His') . '.xlsx');
    }

    public function exportAktivitasDetailPdf($id)
    {
        $log = AttendanceLog::with(['mahasiswa', 'session.course', 'selfieVerification'])
            ->findOrFail($id);

        $logoUnpam = public_path('images/logo_unpam.png');
        $logoSasmita = public_path('images/logo_sasmita.png');

        $pdf = Pdf::loadView('pdf.aktivitas-detail', [
            'log' => $log,
            'logoUnpam' => $logoUnpam,
            'logoSasmita' => $logoSasmita,
        ]);
        
        $pdf->setPaper('a4', 'portrait');
        
        $nim = $log->mahasiswa->nim ?? 'Unknown';
        $filename = 'Detail_Aktivitas_' . $nim . '_' . now()->format('Y_m_d_His') . '.pdf';

        return $pdf->download($filename);
    }
}
