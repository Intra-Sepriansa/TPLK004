<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\AuditLog;
use App\Models\MataKuliah;
use App\Models\Mahasiswa;
use App\Models\SelfieVerification;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $section = $request->query('section', 'overview');
        $settings = $this->buildSettings();
        $activeSession = AttendanceSession::with('course.dosen')
            ->where('is_active', true)
            ->latest('start_at')
            ->first();

        $data = [
            'section' => $section,
            'settings' => $settings,
            'activeSession' => $activeSession
                ? [
                    'id' => $activeSession->id,
                    'title' => $activeSession->title,
                    'meeting_number' => $activeSession->meeting_number,
                    'course' => [
                        'nama' => $activeSession->course?->nama,
                        'sks' => $activeSession->course?->sks,
                        'dosen' => $activeSession->course?->dosen?->nama,
                    ],
                    'start_at' => $activeSession->start_at?->toDateTimeString(),
                    'end_at' => $activeSession->end_at?->toDateTimeString(),
                    'is_active' => $activeSession->is_active,
                ]
                : null,
        ];

        if ($section === 'overview') {
            $data = array_merge($data, $this->overviewData($activeSession));
        }

        if ($section === 'students') {
            $data['mahasiswa'] = Mahasiswa::orderByDesc('created_at')
                ->paginate(10)
                ->withQueryString();
        }

        if ($section === 'sessions' || $section === 'schedule') {
            $data['courses'] = MataKuliah::with('dosen')
                ->orderBy('nama')
                ->get()
                ->map(function (MataKuliah $mataKuliah) {
                    return [
                        'id' => $mataKuliah->id,
                        'nama' => $mataKuliah->nama,
                        'sks' => $mataKuliah->sks,
                        'dosen' => $mataKuliah->dosen?->nama,
                    ];
                })
                ->values();
            $data['sessions'] = AttendanceSession::with('course.dosen')
                ->orderByDesc('start_at')
                ->get();
        }

        if ($section === 'qr') {
            $data['tokenTtlSeconds'] = (int) $settings['token_ttl_seconds'];
        }

        if ($section === 'monitor') {
            $data['monitorLogs'] = $this->recentLogs($activeSession?->id);
        }

        if ($section === 'selfie') {
            $data['selfieQueue'] = SelfieVerification::with([
                'attendanceLog.mahasiswa',
                'attendanceLog.session.course',
            ])
                ->where('status', 'pending')
                ->latest()
                ->take(20)
                ->get();
        }

        if ($section === 'geofence') {
            $data['geofence'] = $settings['geofence'];
        }

        if ($section === 'devices') {
            $data['deviceDistribution'] = $this->deviceDistribution();
        }

        if ($section === 'settings') {
            $data['settingsForm'] = [
                'token_ttl_seconds' => (int) $settings['token_ttl_seconds'],
                'late_minutes' => (int) $settings['late_minutes'],
                'selfie_required' => (bool) $settings['selfie_required'],
                'notify_rejected' => Setting::getValue('notify_rejected', '1') === '1',
                'notify_selfie_blur' => Setting::getValue('notify_selfie_blur', '1') === '1',
            ];
        }

        if ($section === 'reports') {
            $data['reportSessions'] = AttendanceSession::with('course.dosen')
                ->withCount([
                    'logs as present_count' => function ($query) {
                        $query->where('status', 'present');
                    },
                    'logs as late_count' => function ($query) {
                        $query->where('status', 'late');
                    },
                    'logs as rejected_count' => function ($query) {
                        $query->where('status', 'rejected');
                    },
                ])
                ->orderByDesc('start_at')
                ->get();
        }

        if ($section === 'audit') {
            $data['auditLogs'] = AuditLog::with(['mahasiswa', 'session.course'])
                ->latest()
                ->take(30)
                ->get()
                ->map(function (AuditLog $log) {
                    return [
                        'id' => $log->id,
                        'event_type' => $log->event_type,
                        'message' => $log->message,
                        'created_at' => $this->formatDisplayTime($log->created_at),
                    ];
                })
                ->values();
        }

        if ($section === 'absen-ai') {
            $data['aiStudents'] = Mahasiswa::orderBy('nama')
                ->get()
                ->map(function (Mahasiswa $row) {
                    return [
                        'id' => $row->id,
                        'nama' => $row->nama,
                        'nim' => $row->nim,
                    ];
                })
                ->values();
            $data['aiConfig'] = [
                'min_conf' => (float) config('attendance.ai.min_conf', 0.6),
                'target_label' => (string) config('attendance.ai.target_label', ''),
                'maintenance' => (bool) config('attendance.ai.maintenance', false),
            ];
        }

        return Inertia::render('dashboard', $data);
    }

    private function overviewData(?AttendanceSession $activeSession): array
    {
        $today = now()->toDateString();
        $logsToday = AttendanceLog::whereDate('scanned_at', $today);

        $presentCount = (clone $logsToday)
            ->whereIn('status', ['present', 'late'])
            ->count();
        $lateCount = (clone $logsToday)
            ->where('status', 'late')
            ->count();
        $selfieRejected = SelfieVerification::whereDate('created_at', $today)
            ->where('status', 'rejected')
            ->count();
        $totalMahasiswa = Mahasiswa::count();

        $activity = AttendanceLog::with(['mahasiswa', 'selfieVerification'])
            ->latest('scanned_at')
            ->take(6)
            ->get()
            ->map(function (AttendanceLog $log) {
                return [
                    'id' => $log->id,
                    'name' => $log->mahasiswa?->nama ?? 'Mahasiswa',
                    'time' => $this->formatDisplayTime($log->scanned_at, 'H:i') ?? '-',
                    'status' => $log->status,
                    'distance_m' => $log->distance_m,
                    'selfie_status' => $log->selfieVerification?->status,
                    'note' => $log->note,
                ];
            });

        $weekly = $this->weeklyAttendance();
        $upcomingSessions = AttendanceSession::with('course.dosen')
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->take(3)
            ->get();

        $deviceDistribution = $this->deviceDistribution();

        $activeStats = null;
        if ($activeSession) {
            $logQuery = AttendanceLog::where('attendance_session_id', $activeSession->id);
            $activeStats = [
                'total' => $logQuery->count(),
                'rejected' => (clone $logQuery)->where('status', 'rejected')->count(),
                'selfie_pending' => SelfieVerification::whereHas('attendanceLog', function ($query) use ($activeSession) {
                    $query->where('attendance_session_id', $activeSession->id);
                })->where('status', 'pending')->count(),
            ];
        }

        $auditExpired = AuditLog::where('event_type', 'token_expired')->count();
        $auditDuplicate = AuditLog::where('event_type', 'token_duplicate')->count();
        $totalSelfie = SelfieVerification::count();
        $approvedSelfie = SelfieVerification::where('status', 'approved')->count();
        $selfieRate = $totalSelfie > 0
            ? round(($approvedSelfie / $totalSelfie) * 100)
            : 0;

        return [
            'stats' => [
                [
                    'title' => 'Hadir hari ini',
                    'value' => $presentCount,
                    'change' => null,
                    'note' => 'dari total mahasiswa terdaftar',
                    'tone' => 'emerald',
                    'trend' => $presentCount > 0 ? 'up' : 'down',
                ],
                [
                    'title' => 'Terlambat',
                    'value' => $lateCount,
                    'change' => null,
                    'note' => 'scan melewati batas waktu',
                    'tone' => 'amber',
                    'trend' => $lateCount > 0 ? 'down' : 'up',
                ],
                [
                    'title' => 'Selfie ditolak',
                    'value' => $selfieRejected,
                    'change' => null,
                    'note' => 'butuh verifikasi admin',
                    'tone' => 'rose',
                    'trend' => $selfieRejected > 0 ? 'down' : 'up',
                ],
                [
                    'title' => 'Total mahasiswa',
                    'value' => $totalMahasiswa,
                    'change' => null,
                    'note' => 'terdaftar di database',
                    'tone' => 'sky',
                    'trend' => 'up',
                ],
            ],
            'activity' => $activity,
            'weekly' => $weekly,
            'weeklyDetailed' => $this->getWeeklyDetailedData(),
            'hourlyData' => $this->getHourlyData(),
            'topStudents' => $this->getTopStudents(),
            'courseStats' => $this->getCourseStats(),
            'attendanceRate' => $this->getAttendanceRate(),
            'upcomingSessions' => $upcomingSessions,
            'deviceDistribution' => $deviceDistribution,
            'activeStats' => $activeStats,
            'securitySummary' => [
                'duplicate_tokens' => $auditDuplicate,
                'expired_tokens' => $auditExpired,
                'selfie_rate' => $selfieRate,
            ],
        ];
    }

    private function getWeeklyDetailedData(): array
    {
        $start = now()->subDays(6)->startOfDay();
        $dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $result = [];

        for ($i = 0; $i < 7; $i++) {
            $date = $start->copy()->addDays($i);
            $dateStr = $date->toDateString();
            
            $hadir = AttendanceLog::whereDate('scanned_at', $dateStr)
                ->where('status', 'present')->count();
            $terlambat = AttendanceLog::whereDate('scanned_at', $dateStr)
                ->where('status', 'late')->count();
            $tidakHadir = AttendanceLog::whereDate('scanned_at', $dateStr)
                ->where('status', 'rejected')->count();

            $result[] = [
                'day' => $dayLabels[$date->dayOfWeek],
                'hadir' => $hadir,
                'terlambat' => $terlambat,
                'tidakHadir' => $tidakHadir,
            ];
        }

        return $result;
    }

    private function getHourlyData(): array
    {
        $today = now()->toDateString();
        $result = [];

        for ($hour = 7; $hour <= 17; $hour++) {
            $count = AttendanceLog::whereDate('scanned_at', $today)
                ->whereRaw('HOUR(scanned_at) = ?', [$hour])
                ->count();

            $result[] = [
                'hour' => sprintf('%02d:00', $hour),
                'count' => $count,
            ];
        }

        return $result;
    }

    private function getTopStudents(): array
    {
        $students = Mahasiswa::withCount([
            'attendanceLogs as total_attendance' => function ($query) {
                $query->whereIn('status', ['present', 'late']);
            },
            'attendanceLogs as total_logs',
        ])
        ->having('total_logs', '>', 0)
        ->orderByDesc('total_attendance')
        ->take(5)
        ->get();

        return $students->map(function ($student) {
            $rate = $student->total_logs > 0 
                ? round(($student->total_attendance / $student->total_logs) * 100, 1) 
                : 0;
            
            $streak = $this->calculateStreak($student->id);

            return [
                'id' => $student->id,
                'name' => $student->nama,
                'nim' => $student->nim,
                'attendance' => $rate,
                'streak' => $streak,
            ];
        })->toArray();
    }

    private function calculateStreak(int $mahasiswaId): int
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereIn('status', ['present', 'late'])
            ->orderByDesc('scanned_at')
            ->pluck('scanned_at')
            ->map(fn($date) => $date->toDateString())
            ->unique()
            ->values();

        if ($logs->isEmpty()) {
            return 0;
        }

        $streak = 1;
        $prevDate = $logs->first();

        foreach ($logs->skip(1) as $date) {
            $diff = now()->parse($prevDate)->diffInDays(now()->parse($date));
            if ($diff === 1) {
                $streak++;
                $prevDate = $date;
            } else {
                break;
            }
        }

        return $streak;
    }

    private function getCourseStats(): array
    {
        $courses = MataKuliah::take(5)->get();

        return $courses->map(function ($course) {
            $sessionIds = AttendanceSession::where('course_id', $course->id)->pluck('id');
            
            $hadir = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
                ->where('status', 'present')->count();
            $terlambat = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
                ->where('status', 'late')->count();
            $tidakHadir = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
                ->where('status', 'rejected')->count();

            return [
                'name' => strlen($course->nama) > 20 
                    ? substr($course->nama, 0, 17) . '...' 
                    : $course->nama,
                'hadir' => $hadir,
                'terlambat' => $terlambat,
                'tidakHadir' => $tidakHadir,
            ];
        })->toArray();
    }

    private function getAttendanceRate(): float
    {
        $totalLogs = AttendanceLog::count();
        $totalHadir = AttendanceLog::whereIn('status', ['present', 'late'])->count();
        return $totalLogs > 0 ? round(($totalHadir / $totalLogs) * 100, 1) : 0;
    }

    private function weeklyAttendance(): array
    {
        $start = now()->subDays(6)->startOfDay();
        $end = now()->endOfDay();

        $counts = AttendanceLog::selectRaw('DATE(scanned_at) as date, COUNT(*) as total')
            ->whereBetween('scanned_at', [$start, $end])
            ->whereIn('status', ['present', 'late'])
            ->groupBy('date')
            ->pluck('total', 'date');

        $labels = [];
        $values = [];
        $labelMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for ($i = 0; $i < 7; $i++) {
            $date = $start->copy()->addDays($i);
            $dateKey = $date->toDateString();
            $labels[] = $labelMap[$date->dayOfWeek];
            $values[] = (int) ($counts[$dateKey] ?? 0);
        }

        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }

    private function deviceDistribution(): array
    {
        $deviceTotals = AttendanceLog::select('device_os', DB::raw('count(*) as total'))
            ->whereNotNull('device_os')
            ->groupBy('device_os')
            ->orderByDesc('total')
            ->get();

        return $deviceTotals->map(function ($row) {
            return [
                'label' => $row->device_os,
                'total' => (int) $row->total,
            ];
        })->values()->all();
    }

    private function buildSettings(): array
    {
        return [
            'token_ttl_seconds' => (int) Setting::getValue('token_ttl_seconds', '180'),
            'geofence' => [
                'lat' => (float) Setting::getValue('geofence_lat', '-6.3460957'),
                'lng' => (float) Setting::getValue('geofence_lng', '106.6915144'),
                'radius_m' => (int) Setting::getValue('geofence_radius_m', '100'),
            ],
            'late_minutes' => (int) Setting::getValue('late_minutes', '10'),
            'selfie_required' => Setting::getValue('selfie_required', '1') === '1',
        ];
    }

    private function recentLogs(?int $sessionId): array
    {
        $query = AttendanceLog::with(['mahasiswa', 'selfieVerification'])
            ->latest('scanned_at')
            ->take(20);

        if ($sessionId) {
            $query->where('attendance_session_id', $sessionId);
        }

        return $query->get()->map(function (AttendanceLog $log) {
            return [
                'id' => $log->id,
                'name' => $log->mahasiswa?->nama ?? 'Mahasiswa',
                'time' => $this->formatDisplayTime($log->scanned_at, 'H:i') ?? '-',
                'status' => $log->status,
                'distance_m' => $log->distance_m,
                'selfie_status' => $log->selfieVerification?->status,
            ];
        })->all();
    }
}
