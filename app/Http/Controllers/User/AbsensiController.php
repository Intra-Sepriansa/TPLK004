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
            ->get()
            ->map(static function (AttendanceLog $log) {
                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'note' => $log->note,
                    'distance_m' => $log->distance_m !== null
                        ? (float) $log->distance_m
                        : null,
                    'scanned_at' => $log->scanned_at?->toIso8601String(),
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

        return Inertia::render('user/rekapan', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
            'logs' => $logs,
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
