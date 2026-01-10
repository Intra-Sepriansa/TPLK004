<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceToken;
use App\Models\AuditLog;
use App\Models\SelfieVerification;
use App\Models\Setting;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Http\Client\Response as HttpResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AbsensiController extends Controller
{
    public function dashboard(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        // Get attendance logs
        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get();

        // Calculate stats
        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;

        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;
        $lastDate = null;

        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $logDate = $log->scanned_at?->format('Y-m-d');
                if ($lastDate === null || $lastDate === $logDate) {
                    $tempStreak++;
                } elseif ($lastDate && Carbon::parse($lastDate)->subDay()->format('Y-m-d') === $logDate) {
                    $tempStreak++;
                } else {
                    $longestStreak = max($longestStreak, $tempStreak);
                    $tempStreak = 1;
                }
                $lastDate = $logDate;
            } else {
                $longestStreak = max($longestStreak, $tempStreak);
                $tempStreak = 0;
                $lastDate = null;
            }
        }
        $longestStreak = max($longestStreak, $tempStreak);
        $currentStreak = $tempStreak;

        // On-time rate
        $presentCount = $logs->where('status', 'present')->count();
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

        // This week stats
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        $thisWeekLogs = $logs->filter(function ($log) use ($startOfWeek, $endOfWeek) {
            return $log->scanned_at && $log->scanned_at->between($startOfWeek, $endOfWeek);
        });
        $thisWeekAttendance = $thisWeekLogs->whereIn('status', ['present', 'late'])->count();
        $thisWeekTotal = $thisWeekLogs->count();

        // Recent activity
        $recentActivity = $logs->take(5)->map(function ($log) {
            $status = match ($log->status) {
                'present' => 'success',
                'late' => 'warning',
                default => 'error',
            };
            $message = match ($log->status) {
                'present' => 'Hadir di ' . ($log->session?->course?->nama ?? 'Sesi'),
                'late' => 'Terlambat di ' . ($log->session?->course?->nama ?? 'Sesi'),
                'rejected' => 'Ditolak: ' . ($log->note ?? 'Tidak valid'),
                default => 'Absen di ' . ($log->session?->course?->nama ?? 'Sesi'),
            };

            return [
                'id' => $log->id,
                'type' => 'attendance',
                'message' => $message,
                'time' => $log->scanned_at?->diffForHumans(),
                'status' => $status,
            ];
        })->values()->toArray();

        // Upcoming sessions (placeholder - would need actual session scheduling)
        $upcomingSessions = [];

        // Achievements
        $achievements = [
            ['type' => 'streak', 'value' => $currentStreak, 'unlocked' => $currentStreak >= 3],
            ['type' => 'perfect', 'unlocked' => $attendanceRate === 100],
            ['type' => 'early', 'unlocked' => $onTimeRate >= 90],
            ['type' => 'consistent', 'unlocked' => $attendanceRate >= 80],
            ['type' => 'champion', 'unlocked' => false],
            ['type' => 'legend', 'unlocked' => false],
        ];

        // Weekly chart data (last 4 weeks)
        $weeklyChartData = [];
        for ($i = 3; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();
            $weekLabel = 'Minggu ' . (4 - $i);

            $weekLogs = $logs->filter(function ($log) use ($weekStart, $weekEnd) {
                return $log->scanned_at && $log->scanned_at->between($weekStart, $weekEnd);
            });

            $weeklyChartData[] = [
                'label' => $weekLabel,
                'present' => $weekLogs->where('status', 'present')->count(),
                'late' => $weekLogs->where('status', 'late')->count(),
                'absent' => $weekLogs->whereNotIn('status', ['present', 'late'])->count(),
            ];
        }

        // Monthly chart data (last 6 months)
        $monthlyChartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->translatedFormat('M');

            $monthLogs = $logs->filter(function ($log) use ($monthStart, $monthEnd) {
                return $log->scanned_at && $log->scanned_at->between($monthStart, $monthEnd);
            });

            $monthlyChartData[] = [
                'label' => $monthLabel,
                'present' => $monthLogs->where('status', 'present')->count(),
                'late' => $monthLogs->where('status', 'late')->count(),
                'absent' => $monthLogs->whereNotIn('status', ['present', 'late'])->count(),
                'total' => $monthLogs->count(),
            ];
        }

        // Daily attendance for current week
        $dailyChartData = [];
        $dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        for ($i = 0; $i < 7; $i++) {
            $day = now()->startOfWeek()->addDays($i);
            $dayLogs = $logs->filter(function ($log) use ($day) {
                return $log->scanned_at && $log->scanned_at->isSameDay($day);
            });

            $dailyChartData[] = [
                'label' => $dayNames[$i],
                'present' => $dayLogs->where('status', 'present')->count(),
                'late' => $dayLogs->where('status', 'late')->count(),
                'absent' => $dayLogs->whereNotIn('status', ['present', 'late'])->count(),
            ];
        }

        // Attendance distribution for pie chart
        $distributionData = [
            ['label' => 'Hadir', 'value' => $logs->where('status', 'present')->count()],
            ['label' => 'Terlambat', 'value' => $logs->where('status', 'late')->count()],
            ['label' => 'Tidak Hadir', 'value' => $logs->whereNotIn('status', ['present', 'late'])->count()],
        ];

        return Inertia::render('user/dashboard', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'stats' => [
                'totalAttendance' => $totalAttendance,
                'totalSessions' => $totalSessions,
                'attendanceRate' => $attendanceRate,
                'currentStreak' => $currentStreak,
                'longestStreak' => $longestStreak,
                'onTimeRate' => $onTimeRate,
                'thisWeekAttendance' => $thisWeekAttendance,
                'thisWeekTotal' => $thisWeekTotal,
            ],
            'upcomingSessions' => $upcomingSessions,
            'recentActivity' => $recentActivity,
            'achievements' => $achievements,
            'notifications' => ['unread' => 0],
            'chartData' => [
                'weekly' => $weeklyChartData,
                'monthly' => $monthlyChartData,
                'daily' => $dailyChartData,
                'distribution' => $distributionData,
            ],
        ]);
    }

    public function history(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get();

        $records = $logs->map(function ($log) {
            $selfieUrl = null;
            if ($log->selfie_path) {
                $selfieUrl = asset('storage/' . ltrim($log->selfie_path, '/'));
            }

            return [
                'id' => $log->id,
                'date' => $log->scanned_at?->toIso8601String(),
                'course' => $log->session?->course?->nama ?? 'Unknown',
                'courseId' => $log->session?->course?->id ?? 0,
                'meetingNumber' => $log->session?->meeting_number ?? 1,
                'status' => $log->status,
                'checkInTime' => $log->scanned_at?->format('H:i'),
                'distance' => $log->distance_m,
                'selfieUrl' => $selfieUrl,
                'note' => $log->note,
                'location' => $log->latitude && $log->longitude ? [
                    'lat' => (float) $log->latitude,
                    'lng' => (float) $log->longitude,
                ] : null,
            ];
        })->values()->toArray();

        // Get unique courses
        $courses = $logs->map(function ($log) {
            return [
                'id' => $log->session?->course?->id,
                'name' => $log->session?->course?->nama,
            ];
        })->filter(fn($c) => $c['id'] !== null)->unique('id')->values()->toArray();

        // Calculate stats
        $present = $logs->where('status', 'present')->count();
        $absent = $logs->where('status', 'rejected')->count();
        $late = $logs->where('status', 'late')->count();
        $pending = $logs->where('status', 'pending')->count();
        $total = $logs->count();

        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $streak = 0;
        $longestStreak = 0;
        $tempStreak = 0;

        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $tempStreak++;
            } else {
                $longestStreak = max($longestStreak, $tempStreak);
                $tempStreak = 0;
            }
        }
        $longestStreak = max($longestStreak, $tempStreak);
        $streak = $tempStreak;

        return Inertia::render('user/history', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'records' => $records,
            'courses' => $courses,
            'stats' => [
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'pending' => $pending,
                'total' => $total,
                'streak' => $streak,
                'longestStreak' => $longestStreak,
            ],
        ]);
    }

    public function achievements(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->get();

        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $presentCount = $logs->where('status', 'present')->count();
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

        // Calculate streak
        $sortedLogs = $logs->sortByDesc('scanned_at');
        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;

        foreach ($sortedLogs as $log) {
            if (in_array($log->status, ['present', 'late'])) {
                $tempStreak++;
            } else {
                $longestStreak = max($longestStreak, $tempStreak);
                $tempStreak = 0;
            }
        }
        $longestStreak = max($longestStreak, $tempStreak);
        $currentStreak = $tempStreak;

        // Calculate points
        $points = ($totalAttendance * 10) + ($currentStreak * 5) + ($presentCount * 2);
        $level = (int) floor($points / 100) + 1;
        $nextLevelPoints = 100;

        // Define achievements
        $achievements = [
            [
                'type' => 'streak',
                'name' => 'Streak Master',
                'description' => 'Hadir berturut-turut tanpa absen',
                'requirement' => 'Hadir 7 hari berturut-turut',
                'progress' => min($currentStreak, 7),
                'target' => 7,
                'unlocked' => $currentStreak >= 7,
                'unlockedAt' => $currentStreak >= 7 ? now()->toIso8601String() : null,
                'points' => 100,
            ],
            [
                'type' => 'perfect',
                'name' => 'Perfect Attendance',
                'description' => 'Kehadiran sempurna dalam satu bulan',
                'requirement' => '100% kehadiran selama 1 bulan',
                'progress' => $attendanceRate,
                'target' => 100,
                'unlocked' => $attendanceRate === 100 && $totalSessions >= 10,
                'unlockedAt' => null,
                'points' => 200,
            ],
            [
                'type' => 'early',
                'name' => 'Early Bird',
                'description' => 'Selalu hadir tepat waktu',
                'requirement' => 'Tidak pernah terlambat dalam 10 sesi',
                'progress' => min($presentCount, 10),
                'target' => 10,
                'unlocked' => $presentCount >= 10,
                'unlockedAt' => $presentCount >= 10 ? now()->toIso8601String() : null,
                'points' => 150,
            ],
            [
                'type' => 'consistent',
                'name' => 'Consistent',
                'description' => 'Kehadiran konsisten di atas 80%',
                'requirement' => 'Pertahankan kehadiran >80% selama semester',
                'progress' => $attendanceRate,
                'target' => 80,
                'unlocked' => $attendanceRate >= 80 && $totalSessions >= 5,
                'unlockedAt' => $attendanceRate >= 80 ? now()->toIso8601String() : null,
                'points' => 250,
            ],
            [
                'type' => 'champion',
                'name' => 'Champion',
                'description' => 'Top 10 kehadiran di kelas',
                'requirement' => 'Masuk 10 besar kehadiran tertinggi',
                'progress' => 0,
                'target' => 1,
                'unlocked' => false,
                'unlockedAt' => null,
                'points' => 300,
            ],
            [
                'type' => 'legend',
                'name' => 'Legend',
                'description' => 'Pencapaian tertinggi',
                'requirement' => 'Unlock semua achievement lainnya',
                'progress' => collect([
                    $currentStreak >= 7,
                    $attendanceRate === 100 && $totalSessions >= 10,
                    $presentCount >= 10,
                    $attendanceRate >= 80 && $totalSessions >= 5,
                    false, // champion
                ])->filter()->count(),
                'target' => 5,
                'unlocked' => false,
                'unlockedAt' => null,
                'points' => 500,
            ],
        ];

        return Inertia::render('user/achievements', [
            'mahasiswa' => [
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'achievements' => $achievements,
            'totalPoints' => $points,
            'level' => $level,
            'nextLevelPoints' => $nextLevelPoints,
            'rank' => null,
            'totalStudents' => null,
        ]);
    }

    public function create(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $selfieRequired = Setting::getValue('selfie_required', '1') === '1';
        $geofence = [
            'lat' => (float) Setting::getValue('geofence_lat', '-6.3460957'),
            'lng' => (float) Setting::getValue('geofence_lng', '106.6915144'),
            'radius_m' => (int) Setting::getValue('geofence_radius_m', '100'),
        ];
        $locationSampleCount = (int) config('attendance.location.sample_count', 3);
        $locationSampleWindowSeconds = (int) config('attendance.location.sample_window_seconds', 20);

        return Inertia::render('user/absen', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'geofence' => $geofence,
            'selfieRequired' => $selfieRequired,
            'locationSampleCount' => $locationSampleCount,
            'locationSampleWindowSeconds' => $locationSampleWindowSeconds,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $selfieRequired = Setting::getValue('selfie_required', '1') === '1';
        $locationSampleCount = (int) config('attendance.location.sample_count', 3);

        $validated = $request->validate([
            'token' => ['required', 'string'],
            'selfie' => [
                $selfieRequired ? 'required' : 'nullable',
                'image',
                'max:5120',
            ],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'location_accuracy_m' => ['required', 'numeric'],
            'location_captured_at' => ['required', 'date'],
            'location_samples' => ['required', 'array', 'min:' . $locationSampleCount],
            'location_samples.*.latitude' => ['required', 'numeric'],
            'location_samples.*.longitude' => ['required', 'numeric'],
            'location_samples.*.accuracy_m' => ['required', 'numeric'],
            'location_samples.*.captured_at' => ['required', 'date'],
            'device_info' => ['nullable', 'string'],
        ]);

        $token = AttendanceToken::query()
            ->where('token', $validated['token'])
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $token) {
            $this->logAudit('token_expired', 'Token tidak valid atau sudah kadaluarsa.', $mahasiswa?->id, null);

            return back()->withErrors([
                'token' => 'Token tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $session = $token->session;
        if (! $session || ! $session->is_active) {
            $this->logAudit('session_inactive', 'Sesi tidak aktif.', $mahasiswa?->id, $session?->id);

            return back()->withErrors([
                'token' => 'Sesi tidak aktif.',
            ]);
        }

        if ($session->end_at && now()->greaterThan($session->end_at)) {
            $this->logAudit('session_closed', 'Sesi sudah berakhir.', $mahasiswa?->id, $session->id);

            return back()->withErrors([
                'token' => 'Sesi sudah berakhir.',
            ]);
        }

        $already = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->exists();

        if ($already) {
            $this->logAudit('token_duplicate', 'Mahasiswa sudah absen pada sesi ini.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'token' => 'Kamu sudah absen pada sesi ini.',
            ]);
        }

        $geofenceLat = (float) Setting::getValue('geofence_lat', '-6.3460957');
        $geofenceLng = (float) Setting::getValue('geofence_lng', '106.6915144');
        $radius = (int) Setting::getValue('geofence_radius_m', '100');
        $accuracyLimit = min(50, $radius);
        $samples = $this->normalizeLocationSamples($validated['location_samples']);
        $sampleWindowSeconds = (int) config('attendance.location.sample_window_seconds', 20);
        $maxSampleAgeSeconds = (int) config('attendance.location.sample_max_age_seconds', 60);
        $maxSpeedMps = (float) config('attendance.location.max_speed_mps', 35);
        $maxJumpMeters = (float) config('attendance.location.max_jump_m', 150);
        $maxSpreadMeters = (float) config('attendance.location.max_spread_m', 100);
        $requiredAccurateSamples = (int) ceil($locationSampleCount / 2);

        $oldestSampleAt = $samples[0]['captured_at'];
        $newestSampleAt = $samples[count($samples) - 1]['captured_at'];

        if ($newestSampleAt->diffInSeconds($oldestSampleAt) > $sampleWindowSeconds) {
            $this->logAudit('location_samples_span', 'Sampel lokasi tersebar terlalu lama.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_samples' => 'Sampel lokasi terlalu lama. Ambil ulang GPS.',
            ]);
        }

        if ($oldestSampleAt->lt(now()->subSeconds($maxSampleAgeSeconds))) {
            $this->logAudit('location_stale', 'Lokasi terlalu lama, minta ulang GPS.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'latitude' => 'Lokasi terlalu lama. Ambil ulang GPS sebelum absen.',
            ]);
        }

        $accurateSamples = array_filter($samples, static fn (array $sample) => $sample['accuracy_m'] <= $accuracyLimit);
        if (count($accurateSamples) < $requiredAccurateSamples) {
            $this->logAudit('location_accuracy_low', 'Akurasi GPS tidak konsisten.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_accuracy_m' => "Akurasi GPS belum cukup konsisten (maks {$accuracyLimit}m).",
            ]);
        }

        $jumpViolation = $this->detectJumpViolation($samples, $maxSpeedMps, $maxJumpMeters);
        if ($jumpViolation) {
            $details = sprintf(
                'Loncat lokasi %.2fm dalam %.2fs (%.2fm/s).',
                $jumpViolation['distance'],
                $jumpViolation['seconds'],
                $jumpViolation['speed_mps'],
            );
            $this->logAudit('location_jump', $details, $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_samples' => 'Pergerakan lokasi terlalu cepat. Ambil ulang GPS.',
            ]);
        }

        $bestSample = $this->selectBestSample($samples);
        $accuracy = $bestSample['accuracy_m'];
        $latitude = $bestSample['latitude'];
        $longitude = $bestSample['longitude'];

        $spreadMeters = $this->maxSampleSpread($samples, $bestSample);
        if ($spreadMeters > $maxSpreadMeters) {
            $this->logAudit('location_spread', 'Sampel lokasi tidak konsisten.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_samples' => 'Sampel lokasi tidak konsisten. Ambil ulang GPS.',
            ]);
        }

        if ($accuracy > $accuracyLimit) {
            $this->logAudit('location_accuracy_low', 'Akurasi GPS terlalu rendah.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'location_accuracy_m' => "Akurasi GPS terlalu rendah (maks {$accuracyLimit}m).",
            ]);
        }

        $distance = $this->distanceMeters(
            $latitude,
            $longitude,
            $geofenceLat,
            $geofenceLng,
        );

        if ($distance > $radius) {
            AttendanceLog::create([
                'attendance_session_id' => $session->id,
                'mahasiswa_id' => $mahasiswa->id,
                'attendance_token_id' => $token->id,
                'scanned_at' => now(),
                'status' => 'rejected',
                'distance_m' => $distance,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'note' => 'Di luar radius geofence.',
            ]);

            $this->logAudit('outside_radius', 'Scan di luar radius geofence.', $mahasiswa->id, $session->id);

            return back()->withErrors([
                'token' => 'Lokasi kamu di luar radius absen.',
            ]);
        }

        $ipCheckEnabled = (bool) config('attendance.ip_geolocation.enabled', true);
        $ipDistanceLimit = (float) config('attendance.ip_geolocation.max_distance_m', 50000);
        if ($ipCheckEnabled) {
            $ip = $request->ip();
            if ($this->isPublicIp($ip)) {
                $ipLocation = $this->lookupIpLocation($ip);
                if ($ipLocation) {
                    $ipDistance = $this->distanceMeters(
                        $ipLocation['lat'],
                        $ipLocation['lng'],
                        $geofenceLat,
                        $geofenceLng,
                    );
                    if ($ipDistance > $ipDistanceLimit) {
                        $this->logAudit(
                            'ip_location_far',
                            'Lokasi IP terlalu jauh dari geofence.',
                            $mahasiswa->id,
                            $session->id,
                        );

                        return back()->withErrors([
                            'location_samples' => 'Lokasi IP terlalu jauh dari area absen. Matikan VPN dan coba lagi.',
                        ]);
                    }
                } else {
                    $this->logAudit('ip_location_unavailable', 'Gagal memetakan lokasi IP.', $mahasiswa->id, $session->id);
                }
            }
        }

        $path = null;
        if ($request->hasFile('selfie')) {
            $path = $request->file('selfie')->store('selfies', 'public');
        }
        $lateMinutes = (int) Setting::getValue('late_minutes', '10');
        $status = now()->greaterThan($session->start_at->copy()->addMinutes($lateMinutes))
            ? 'late'
            : 'present';

        $deviceInfo = $validated['device_info'] ?? '';
        $deviceOs = $this->detectOs($deviceInfo);

        $log = AttendanceLog::create([
            'attendance_session_id' => $session->id,
            'mahasiswa_id' => $mahasiswa->id,
            'attendance_token_id' => $token->id,
            'scanned_at' => now(),
            'status' => $status,
            'distance_m' => $distance,
            'selfie_path' => $path,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'device_os' => $deviceOs,
            'device_model' => Str::limit($deviceInfo, 120, ''),
            'device_type' => 'mobile',
        ]);

        if ($path) {
            SelfieVerification::create([
                'attendance_log_id' => $log->id,
                'status' => 'pending',
            ]);
        }

        $statusLabel = $status === 'late' ? 'Terlambat' : 'Hadir';

        return back()->with(
            'success',
            "Absensi berhasil terkirim. Status: {$statusLabel}.",
        );
    }

    public function rekapan(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get();

        // Overall stats
        $totalSessions = $logs->count();
        $presentCount = $logs->where('status', 'present')->count();
        $lateCount = $logs->where('status', 'late')->count();
        $rejectedCount = $logs->where('status', 'rejected')->count();
        $totalAttendance = $presentCount + $lateCount;
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $onTimeRate = $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100) : 0;

        // This month stats
        $thisMonthLogs = $logs->filter(fn($log) => $log->scanned_at && $log->scanned_at->isCurrentMonth());
        $thisMonthTotal = $thisMonthLogs->count();
        $thisMonthPresent = $thisMonthLogs->whereIn('status', ['present', 'late'])->count();

        // Course summary (agregat per mata kuliah)
        $courseSummary = $logs->groupBy(fn($log) => $log->session?->course?->id ?? 0)
            ->map(function ($courseLogs, $courseId) {
                $first = $courseLogs->first();
                $courseName = $first->session?->course?->nama ?? 'Unknown';
                $total = $courseLogs->count();
                $present = $courseLogs->where('status', 'present')->count();
                $late = $courseLogs->where('status', 'late')->count();
                $rejected = $courseLogs->whereNotIn('status', ['present', 'late'])->count();
                $attended = $present + $late;
                $rate = $total > 0 ? round(($attended / $total) * 100) : 0;

                return [
                    'courseId' => $courseId,
                    'courseName' => $courseName,
                    'total' => $total,
                    'present' => $present,
                    'late' => $late,
                    'rejected' => $rejected,
                    'attended' => $attended,
                    'rate' => $rate,
                ];
            })
            ->filter(fn($item) => $item['courseId'] !== 0)
            ->values()
            ->toArray();

        // Monthly trend (last 6 months)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            $monthLabel = $monthStart->translatedFormat('M Y');

            $monthLogs = $logs->filter(fn($log) => $log->scanned_at && $log->scanned_at->between($monthStart, $monthEnd));
            $monthTotal = $monthLogs->count();
            $monthAttended = $monthLogs->whereIn('status', ['present', 'late'])->count();

            $monthlyTrend[] = [
                'month' => $monthLabel,
                'total' => $monthTotal,
                'attended' => $monthAttended,
                'rate' => $monthTotal > 0 ? round(($monthAttended / $monthTotal) * 100) : 0,
            ];
        }

        // Distribution for pie chart
        $distribution = [
            ['name' => 'Hadir', 'value' => $presentCount, 'color' => '#10b981'],
            ['name' => 'Terlambat', 'value' => $lateCount, 'color' => '#f59e0b'],
            ['name' => 'Ditolak', 'value' => $rejectedCount, 'color' => '#f43f5e'],
        ];

        // Recent logs (last 5)
        $recentLogs = $logs->take(5)->map(fn($log) => [
            'id' => $log->id,
            'status' => $log->status,
            'courseName' => $log->session?->course?->nama ?? 'Unknown',
            'meetingNumber' => $log->session?->meeting_number ?? 1,
            'scannedAt' => $log->scanned_at?->toIso8601String(),
            'scannedAtFormatted' => $log->scanned_at?->translatedFormat('d M Y, H:i'),
        ])->values()->toArray();

        return Inertia::render('user/rekapan', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'stats' => [
                'totalSessions' => $totalSessions,
                'presentCount' => $presentCount,
                'lateCount' => $lateCount,
                'rejectedCount' => $rejectedCount,
                'totalAttendance' => $totalAttendance,
                'attendanceRate' => $attendanceRate,
                'onTimeRate' => $onTimeRate,
                'thisMonthTotal' => $thisMonthTotal,
                'thisMonthPresent' => $thisMonthPresent,
            ],
            'courseSummary' => $courseSummary,
            'monthlyTrend' => $monthlyTrend,
            'distribution' => $distribution,
            'recentLogs' => $recentLogs,
        ]);
    }

    public function buktiMasuk(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $logs = AttendanceLog::query()
            ->with(['session.course', 'selfieVerification'])
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->latest('scanned_at')
            ->get()
            ->map(static function (AttendanceLog $log) {
                $selfieUrl = null;
                if ($log->selfie_path) {
                    $selfieUrl = asset('storage/' . ltrim($log->selfie_path, '/'));
                }

                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'note' => $log->note,
                    'scanned_at' => $log->scanned_at?->toIso8601String(),
                    'selfie_url' => $selfieUrl,
                    'selfie_status' => $log->selfieVerification?->status,
                    'session' => [
                        'title' => $log->session?->title,
                        'meeting_number' => $log->session?->meeting_number,
                        'start_at' => $log->session?->start_at?->toIso8601String(),
                        'course' => [
                            'name' => $log->session?->course?->nama,
                        ],
                    ],
                ];
            });

        return Inertia::render('user/bukti-masuk', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'logs' => $logs,
        ]);
    }

    private function normalizeLocationSamples(array $samples): array
    {
        $normalized = [];
        foreach ($samples as $sample) {
            $normalized[] = [
                'latitude' => (float) $sample['latitude'],
                'longitude' => (float) $sample['longitude'],
                'accuracy_m' => (float) $sample['accuracy_m'],
                'captured_at' => Carbon::parse($sample['captured_at']),
            ];
        }

        usort(
            $normalized,
            static fn (array $a, array $b) => $a['captured_at']->valueOf() <=> $b['captured_at']->valueOf(),
        );

        return $normalized;
    }

    private function selectBestSample(array $samples): array
    {
        usort($samples, static function (array $a, array $b) {
            $accuracyComparison = $a['accuracy_m'] <=> $b['accuracy_m'];
            if ($accuracyComparison !== 0) {
                return $accuracyComparison;
            }

            return $b['captured_at']->valueOf() <=> $a['captured_at']->valueOf();
        });

        return $samples[0];
    }

    private function detectJumpViolation(array $samples, float $maxSpeedMps, float $maxJumpMeters): ?array
    {
        for ($index = 1; $index < count($samples); $index++) {
            $previous = $samples[$index - 1];
            $current = $samples[$index];
            $distance = $this->distanceMeters(
                $previous['latitude'],
                $previous['longitude'],
                $current['latitude'],
                $current['longitude'],
            );
            $seconds = max($current['captured_at']->diffInMilliseconds($previous['captured_at']) / 1000, 0.2);
            $speedMps = $distance / $seconds;

            if ($distance > $maxJumpMeters || $speedMps > $maxSpeedMps) {
                return [
                    'distance' => $distance,
                    'seconds' => $seconds,
                    'speed_mps' => $speedMps,
                ];
            }
        }

        return null;
    }

    private function maxSampleSpread(array $samples, array $anchor): float
    {
        $maxDistance = 0.0;
        foreach ($samples as $sample) {
            $distance = $this->distanceMeters(
                $sample['latitude'],
                $sample['longitude'],
                $anchor['latitude'],
                $anchor['longitude'],
            );
            $maxDistance = max($maxDistance, $distance);
        }

        return $maxDistance;
    }

    private function isPublicIp(?string $ip): bool
    {
        if (! $ip) {
            return false;
        }

        return (bool) filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        );
    }

    private function lookupIpLocation(string $ip): ?array
    {
        $endpoint = (string) config(
            'attendance.ip_geolocation.url',
            'https://ipapi.co/{ip}/json/',
        );
        if ($endpoint === '') {
            return null;
        }

        $url = str_replace('{ip}', $ip, $endpoint);

        $response = $this->fetchIpLocationResponse($url);
        if (! $response) {
            return null;
        }

        if ($response instanceof PromiseInterface) {
            $response = $response->wait();
        }

        if (! $response instanceof HttpResponse) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            return null;
        }

        if (isset($payload['status']) && $payload['status'] !== 'success') {
            return null;
        }

        if (isset($payload['latitude'], $payload['longitude'])) {
            return [
                'lat' => (float) $payload['latitude'],
                'lng' => (float) $payload['longitude'],
            ];
        }

        if (isset($payload['lat'], $payload['lon'])) {
            return [
                'lat' => (float) $payload['lat'],
                'lng' => (float) $payload['lon'],
            ];
        }

        if (isset($payload['loc'])) {
            $parts = explode(',', $payload['loc']);
            if (count($parts) === 2) {
                return [
                    'lat' => (float) $parts[0],
                    'lng' => (float) $parts[1],
                ];
            }
        }

        return null;
    }

    private function fetchIpLocationResponse(string $url): HttpResponse|PromiseInterface|null
    {
        try {
            return Http::timeout(4)->retry(1, 150)->get($url);
        } catch (Throwable $error) {
            return null;
        }
    }

    private function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $latFrom = deg2rad($lat1);
        $latTo = deg2rad($lat2);
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lngDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    private function detectOs(string $deviceInfo): string
    {
        $info = strtolower($deviceInfo);

        if (str_contains($info, 'android')) {
            return 'Android';
        }
        if (str_contains($info, 'iphone') || str_contains($info, 'ios')) {
            return 'iOS';
        }
        if (str_contains($info, 'mac')) {
            return 'macOS';
        }
        if (str_contains($info, 'windows')) {
            return 'Windows';
        }
        if (str_contains($info, 'linux')) {
            return 'Linux';
        }

        return 'Lainnya';
    }

    private function logAudit(string $event, string $message, ?int $mahasiswaId, ?int $sessionId): void
    {
        AuditLog::create([
            'event_type' => $event,
            'message' => $message,
            'mahasiswa_id' => $mahasiswaId,
            'attendance_session_id' => $sessionId,
        ]);
    }
}
