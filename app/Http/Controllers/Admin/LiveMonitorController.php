<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AktivitasTerbaruExport;
use App\Exports\LiveMonitorAdvancedExport;
use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class LiveMonitorController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/live-monitor', $this->getLiveMonitorData($request));
    }

    public function refresh(Request $request)
    {
        return response()->json($this->getLiveMonitorData($request));
    }

    public function exportToday(Request $request)
    {
        $logs = AttendanceLog::with(['mahasiswa', 'session.course'])
            ->whereDate('scanned_at', today())
            ->orderBy('scanned_at', 'desc')
            ->get();

        return Excel::download(
            new AktivitasTerbaruExport($logs),
            'Live_Monitor_Export_' . now()->format('Y_m_d_His') . '.xlsx'
        );
    }

    private function getLiveMonitorData(Request $request): array
    {
        $filters = $this->normalizeFilters($request);

        $sessionOptions = AttendanceSession::with(['course', 'dosen'])
            ->orderByDesc('is_active')
            ->orderByDesc('start_at')
            ->limit(100)
            ->get();

        if ($filters['session_id']) {
            $selectedSession = $sessionOptions->firstWhere('id', $filters['session_id']);
        } else {
            $selectedSession = $sessionOptions->first(function (AttendanceSession $session) use ($filters) {
                if ($filters['course_id'] && (int) $session->course_id !== $filters['course_id']) {
                    return false;
                }

                if ($filters['meeting_number'] && (int) $session->meeting_number !== $filters['meeting_number']) {
                    return false;
                }

                return $session->is_active;
            });
        }

        if (!$selectedSession && $filters['course_id'] && $filters['meeting_number']) {
            $selectedSession = $sessionOptions->first(function (AttendanceSession $session) use ($filters) {
                return (int) $session->course_id === $filters['course_id']
                    && (int) $session->meeting_number === $filters['meeting_number'];
            });
        }

        $recentActivitiesQuery = $this->buildLogsQuery($filters);
        $recentLogs = (clone $recentActivitiesQuery)
            ->take(50)
            ->get();

        $recentActivities = $recentLogs->map(fn (AttendanceLog $log) => $this->mapActivity($log));

        $anomalies = $recentLogs
            ->filter(fn (AttendanceLog $log) => in_array($log->status, ['rejected', 'absent'], true))
            ->take(10)
            ->map(fn (AttendanceLog $log) => [
                'id' => $log->id,
                'type' => 'Anomali Kehadiran',
                'message' => sprintf(
                    '%s terdeteksi bermasalah pada %s.',
                    $log->mahasiswa?->nama ?? 'Mahasiswa',
                    $log->session?->course?->nama
                        ? $log->session->course->nama . ' pertemuan ' . $log->session->meeting_number
                        : 'sesi absensi'
                ),
            ])
            ->values();

        $statsSource = $selectedSession
            ? AttendanceLog::query()->where('attendance_session_id', $selectedSession->id)
            : $this->buildLogsQuery($filters);

        $hadir = (clone $statsSource)->where('status', 'present')->count();
        $terlambat = (clone $statsSource)->where('status', 'late')->count();
        $izin = (clone $statsSource)->where('status', 'excused')->count();
        $anomali = (clone $statsSource)->whereIn('status', ['rejected', 'absent'])->count();
        $totalScans = $hadir + $terlambat + $izin + $anomali;
        $activeStudentCount = (clone $statsSource)->distinct('mahasiswa_id')->count('mahasiswa_id');

        $todaySource = $selectedSession
            ? AttendanceLog::query()->where('attendance_session_id', $selectedSession->id)
            : $this->buildLogsQuery($filters)->whereDate('scanned_at', today());

        $todayStats = [
            'hadir' => (clone $todaySource)->where('status', 'present')->count(),
            'terlambat' => (clone $todaySource)->where('status', 'late')->count(),
            'izin' => (clone $todaySource)->where('status', 'excused')->count(),
            'anomali' => (clone $todaySource)->whereIn('status', ['rejected', 'absent'])->count(),
        ];

        $chartSource = $selectedSession
            ? AttendanceLog::query()->where('attendance_session_id', $selectedSession->id)
            : $this->buildLogsQuery($filters)->whereDate('scanned_at', today());

        $hourlyScans = (clone $chartSource)
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

        $activeSessions = $sessionOptions
            ->where('is_active', true)
            ->values()
            ->map(function (AttendanceSession $session) {
                $totalAttendance = AttendanceLog::where('attendance_session_id', $session->id)->count();
                $present = AttendanceLog::where('attendance_session_id', $session->id)
                    ->whereIn('status', ['present', 'late'])
                    ->count();

                return [
                    'id' => $session->id,
                    'course' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
                    'course_id' => $session->course_id,
                    'meeting_number' => $session->meeting_number,
                    'lecturer' => $session->dosen?->nama ?? 'Dosen Pengampu',
                    'present' => $present,
                    'total' => $totalAttendance,
                    'timeLeft' => $session->end_at?->isFuture()
                        ? $session->end_at->diffForHumans(null, true)
                        : 'Sedang berjalan',
                    'is_active' => (bool) $session->is_active,
                ];
            });

        $courses = MataKuliah::select('id', 'nama', 'kode')
            ->whereHas('sessions')
            ->orderBy('nama')
            ->get()
            ->map(fn (MataKuliah $course) => [
                'value' => (string) $course->id,
                'label' => $course->nama . ' (' . ($course->kode ?? '-') . ')',
            ])
            ->values();

        $meetingOptions = $sessionOptions
            ->filter(fn (AttendanceSession $session) => !$filters['course_id'] || (int) $session->course_id === $filters['course_id'])
            ->pluck('meeting_number')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->map(fn ($meetingNumber) => [
                'value' => (string) $meetingNumber,
                'label' => 'Pertemuan ' . $meetingNumber,
            ]);

        $sessionFilterOptions = $sessionOptions
            ->filter(function (AttendanceSession $session) use ($filters) {
                if ($filters['course_id'] && (int) $session->course_id !== $filters['course_id']) {
                    return false;
                }

                if ($filters['meeting_number'] && (int) $session->meeting_number !== $filters['meeting_number']) {
                    return false;
                }

                return true;
            })
            ->values()
            ->map(fn (AttendanceSession $session) => [
                'value' => (string) $session->id,
                'label' => ($session->course?->nama ?? 'Tanpa Mata Kuliah') . ' - Pertemuan ' . $session->meeting_number,
            ]);

        return [
            'filters' => [
                'course_id' => $filters['course_id'] ? (string) $filters['course_id'] : 'all',
                'meeting_number' => $filters['meeting_number'] ? (string) $filters['meeting_number'] : 'all',
                'session_id' => $filters['session_id'] ? (string) $filters['session_id'] : 'all',
                'status' => $filters['status'],
            ],
            'selectedSession' => $selectedSession ? [
                'id' => $selectedSession->id,
                'course_name' => $selectedSession->course?->nama ?? 'Tanpa Mata Kuliah',
                'course_id' => $selectedSession->course_id,
                'meeting_number' => $selectedSession->meeting_number,
                'lecturer' => $selectedSession->dosen?->nama ?? 'Dosen Pengampu',
                'start_at' => $selectedSession->start_at?->translatedFormat('d M Y H:i'),
                'end_at' => $selectedSession->end_at?->translatedFormat('d M Y H:i'),
                'is_active' => (bool) $selectedSession->is_active,
            ] : null,
            'initialStats' => [
                'activeSessions' => $activeSessions->count(),
                'totalScans' => $totalScans,
                'activeStudents' => $activeStudentCount,
                'present' => $hadir,
                'late' => $terlambat,
                'anomaly' => $anomali,
                'scanRate' => $totalScans > 0 ? round((($hadir + $terlambat) / $totalScans) * 100) : 0,
                'presentRate' => $totalScans > 0 ? round(($hadir / $totalScans) * 100) : 0,
                'lateRate' => $totalScans > 0 ? round(($terlambat / $totalScans) * 100) : 0,
            ],
            'initialRecentActivities' => $recentActivities,
            'initialActiveSessions' => $activeSessions,
            'initialTodayStats' => $todayStats,
            'initialAnomalies' => $anomalies,
            'initialChartData' => $chartData,
            'filterOptions' => [
                'courses' => $courses,
                'meetings' => $meetingOptions,
                'sessions' => $sessionFilterOptions,
                'statuses' => [
                    ['value' => 'all', 'label' => 'Semua Status'],
                    ['value' => 'present', 'label' => 'Hadir'],
                    ['value' => 'late', 'label' => 'Terlambat'],
                    ['value' => 'excused', 'label' => 'Izin'],
                    ['value' => 'anomali', 'label' => 'Anomali'],
                ],
                'riskLevels' => [
                    ['value' => 'all', 'label' => 'Semua Level'],
                    ['value' => 'low', 'label' => 'Rendah (0-29)'],
                    ['value' => 'medium', 'label' => 'Sedang (30-69)'],
                    ['value' => 'high', 'label' => 'Tinggi (70-100)'],
                ],
            ],
        ];
    }

    public function logs(Request $request)
    {
        $filters = $this->normalizeFilters($request);

        $logs = $this->buildLogsQuery($filters)
            ->take(50)
            ->get()
            ->map(fn (AttendanceLog $log) => [
                'id' => $log->id,
                'name' => $log->mahasiswa?->nama ?? 'Unknown',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'time' => $log->scanned_at?->format('H:i:s'),
                'status' => $log->status,
                'distance_m' => $log->distance_m,
                'selfie_status' => $log->selfieVerification?->status,
                'course' => $log->session?->course?->nama ?? '-',
                'meeting_number' => $log->session?->meeting_number,
            ]);

        return response()->json(['logs' => $logs]);
    }

    public function aktivitasTerbaru(Request $request): Response
    {
        $filters = $this->normalizeFilters($request);

        $logs = $this->buildLogsQuery($filters)
            ->take(100)
            ->get();

        $activities = $logs->map(function (AttendanceLog $log) {
            return [
                'id' => $log->id,
                'student_name' => $log->mahasiswa?->nama ?? 'Unknown',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'session_name' => $log->session?->course?->nama
                    ? $log->session->course->nama . ' - Pertemuan ' . $log->session->meeting_number
                    : '-',
                'session_id' => $log->attendance_session_id,
                'time' => $log->scanned_at?->format('H:i:s'),
                'status' => $this->mapFrontendStatus($log->status),
                'distance' => $log->distance_m,
                'method' => 'GPS/QR Code',
                'location' => $log->address ?? 'Universitas',
                'device' => $log->device_model ?? $log->user_agent ?? 'Unknown Device',
                'gps_accuracy' => $log->accuracy,
                'ip_address' => $log->ip_address,
                'os' => $log->device_os ?? 'Unknown OS',
                'browser' => $log->browser ?? 'Unknown Browser',
                'user_agent' => $log->user_agent,
                'coordinates' => $log->latitude && $log->longitude
                    ? $log->latitude . ', ' . $log->longitude
                    : '-',
                'selfie' => $log->selfie_path,
                'face_match' => $log->face_match_score ?? 0,
                'isNew' => false,
                'student' => [
                    'name' => $log->mahasiswa?->nama ?? 'Unknown',
                    'nim' => $log->mahasiswa?->nim ?? '-',
                    'initials' => mb_substr($log->mahasiswa?->nama ?? 'U', 0, 2),
                    'photo' => null,
                    'major' => $log->mahasiswa?->prodi ?? 'Program Studi',
                    'semester' => (string) ($log->mahasiswa?->semester ?? '-'),
                    'email' => $log->mahasiswa?->email ?? '-',
                    'phone' => $log->mahasiswa?->phone ?? '-',
                    'recentAttendance' => [],
                ],
            ];
        });

        $activeSessionsData = AttendanceSession::with(['course', 'dosen'])
            ->where('is_active', true)
            ->get()
            ->map(fn (AttendanceSession $session) => [
                'id' => $session->id,
                'course' => $session->course?->nama ?? 'Custom Course',
                'class' => 'Kelas',
                'lecturer' => $session->dosen?->nama ?? 'Dosen Pengampu',
                'location' => 'Kampus',
                'present' => AttendanceLog::where('attendance_session_id', $session->id)
                    ->whereIn('status', ['present', 'late'])
                    ->count(),
                'total' => AttendanceLog::where('attendance_session_id', $session->id)->count(),
                'timeLeft' => $session->end_at?->isFuture()
                    ? $session->end_at->diffForHumans(null, true)
                    : 'Sedang berjalan',
                'progress' => 0,
            ]);

        $todayStats = [
            'hadir' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'present')->count(),
            'terlambat' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'late')->count(),
            'izin' => AttendanceLog::whereDate('scanned_at', today())->where('status', 'excused')->count(),
            'anomali' => AttendanceLog::whereDate('scanned_at', today())->whereIn('status', ['rejected', 'absent'])->count(),
        ];

        return Inertia::render('admin/aktivitas-terbaru', [
            'initialActivities' => $activities,
            'initialActiveSessions' => $activeSessionsData,
            'initialTodayStats' => $todayStats,
            'initialStats' => [
                'activeSessions' => $activeSessionsData->count(),
                'totalScans' => AttendanceLog::whereDate('scanned_at', today())->count(),
                'activeStudents' => $activities->pluck('nim')->unique()->count(),
                'anomalyCount' => AttendanceLog::whereDate('scanned_at', today())
                    ->whereIn('status', ['rejected', 'absent'])
                    ->count(),
                'scanRate' => 85,
            ],
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

        return Excel::download(
            new AktivitasTerbaruExport($logs),
            'Laporan_Aktivitas_Terbaru_' . now()->format('Y_m_d_His') . '.xlsx'
        );
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

    public function advancedExport(Request $request)
    {
        $format = $request->query('format', 'excel');
        $startDate = $request->query('start_date', today()->toDateString());
        $endDate = $request->query('end_date', today()->toDateString());
        $statusFilter = $request->query('status', 'all');
        $courseFilter = $request->query('course', 'all');
        $riskFilter = $request->query('risk', 'all');

        $query = AttendanceLog::with(['mahasiswa', 'session.course', 'session.dosen', 'selfieVerification'])
            ->whereDate('scanned_at', '>=', $startDate)
            ->whereDate('scanned_at', '<=', $endDate)
            ->orderBy('scanned_at', 'desc');

        if ($statusFilter !== 'all') {
            if ($statusFilter === 'anomali') {
                $query->whereIn('status', ['rejected', 'absent']);
            } else {
                $query->where('status', $statusFilter);
            }
        }

        if ($courseFilter !== 'all') {
            $query->whereHas('session', fn (Builder $q) => $q->where('course_id', $courseFilter));
        }

        if ($riskFilter !== 'all') {
            match ($riskFilter) {
                'high' => $query->where('risk_score', '>=', 70),
                'medium' => $query->whereBetween('risk_score', [30, 69]),
                'low' => $query->where('risk_score', '<', 30),
                default => null,
            };
        }

        $logs = $query->take(1000)->get();

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $statusFilter,
            'course' => $courseFilter,
            'risk' => $riskFilter,
        ];

        $stats = $this->computeExportStats($logs);

        if ($format === 'pdf') {
            $logoUnpam = public_path('images/logo_unpam.png');
            $logoSasmita = public_path('images/logo_sasmita.png');

            $pdf = Pdf::loadView('pdf.live-monitor-report', [
                'logs' => $logs,
                'stats' => $stats,
                'filters' => $filters,
                'logoUnpam' => $logoUnpam,
                'logoSasmita' => $logoSasmita,
                'reportPeriod' => $startDate . ' s/d ' . $endDate,
                'filterStatus' => $statusFilter === 'all' ? 'Semua Status' : ucfirst($statusFilter),
                'filterClass' => 'Semua Kelas',
            ]);
            $pdf->setPaper('a4', 'portrait');

            return $pdf->download('Laporan_Live_Monitor_' . now()->format('Y_m_d_His') . '.pdf');
        }

        return Excel::download(
            new LiveMonitorAdvancedExport($logs, $stats, $filters),
            'Laporan_Live_Monitor_Advanced_' . now()->format('Y_m_d_His') . '.xlsx'
        );
    }

    public function getFilterOptions()
    {
        return response()->json($this->getLiveMonitorData(request())['filterOptions']);
    }

    private function computeExportStats($logs): array
    {
        $total = $logs->count();
        $hadir = $logs->where('status', 'present')->count();
        $terlambat = $logs->where('status', 'late')->count();
        $izin = $logs->where('status', 'excused')->count();
        $anomali = $logs->whereIn('status', ['rejected', 'absent'])->count();

        return [
            'total' => $total,
            'hadir' => $hadir,
            'terlambat' => $terlambat,
            'izin' => $izin,
            'anomali' => $anomali,
            'attendanceRate' => $total > 0 ? round(($hadir / $total) * 100, 1) : 0,
            'riskHigh' => $logs->where('risk_score', '>=', 70)->count(),
            'riskMedium' => $logs->whereBetween('risk_score', [30, 69])->count(),
            'riskLow' => $logs->where('risk_score', '<', 30)->count(),
            'suspicious' => $logs->where('is_suspicious', true)->count(),
        ];
    }

    private function normalizeFilters(Request $request): array
    {
        return [
            'course_id' => $request->filled('course_id') && $request->query('course_id') !== 'all'
                ? (int) $request->query('course_id')
                : null,
            'meeting_number' => $request->filled('meeting_number') && $request->query('meeting_number') !== 'all'
                ? (int) $request->query('meeting_number')
                : null,
            'session_id' => $request->filled('session_id') && $request->query('session_id') !== 'all'
                ? (int) $request->query('session_id')
                : null,
            'status' => $request->query('status', 'all'),
        ];
    }

    private function buildLogsQuery(array $filters): Builder
    {
        $query = AttendanceLog::with(['mahasiswa', 'session.course', 'session.dosen', 'selfieVerification'])
            ->orderBy('scanned_at', 'desc');

        if ($filters['session_id']) {
            $query->where('attendance_session_id', $filters['session_id']);
        } else {
            $query->whereHas('session', function (Builder $sessionQuery) use ($filters) {
                if ($filters['course_id']) {
                    $sessionQuery->where('course_id', $filters['course_id']);
                }

                if ($filters['meeting_number']) {
                    $sessionQuery->where('meeting_number', $filters['meeting_number']);
                }
            });
        }

        if ($filters['status'] !== 'all') {
            if ($filters['status'] === 'anomali') {
                $query->whereIn('status', ['rejected', 'absent']);
            } else {
                $query->where('status', $filters['status']);
            }
        }

        return $query;
    }

    private function mapActivity(AttendanceLog $log): array
    {
        return [
            'id' => $log->id,
            'student_name' => $log->mahasiswa?->nama ?? 'Unknown',
            'nim' => $log->mahasiswa?->nim ?? '-',
            'session_name' => $log->session?->course?->nama
                ? $log->session->course->nama . ' - Pertemuan ' . $log->session->meeting_number
                : '-',
            'course' => $log->session?->course?->nama ?? '-',
            'meeting_number' => $log->session?->meeting_number,
            'session_id' => $log->attendance_session_id,
            'time' => $log->scanned_at?->format('H:i:s'),
            'status' => $this->mapFrontendStatus($log->status),
            'distance' => $log->distance_m,
            'device' => $log->device_model ?? $log->user_agent ?? 'Unknown Device',
            'anomaly_reason' => in_array($log->status, ['rejected', 'absent'], true)
                ? 'Terdeteksi anomali pada proses absensi.'
                : null,
            'isNew' => false,
            'risk_score' => $log->risk_score ?? 0,
            'face_match' => $log->face_match_score ?? null,
            'is_suspicious' => $log->is_suspicious ?? false,
        ];
    }

    private function mapFrontendStatus(string $status): string
    {
        return match ($status) {
            'present' => 'hadir',
            'late' => 'terlambat',
            'excused' => 'izin',
            default => 'anomali',
        };
    }
}
