<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\AttendanceToken;
use App\Models\Setting;
use App\Services\AttendanceSessionAutomationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MobileMahasiswaAttendanceController extends Controller
{
    public function today(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();

        $log = AttendanceLog::with(['session.course', 'session.dosen'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->whereDate('scanned_at', now()->toDateString())
            ->latest('scanned_at')
            ->first();

        if (! $log) {
            return response()->json([
                'success' => true,
                'message' => 'Belum ada absensi hari ini',
                'data' => null,
            ]);
        }

        $session = $log->session;
        $course = $session?->course;
        $dosen = $session?->dosen;

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $log->status ?? 'present',
                'check_in' => optional($log->scanned_at)->toDateTimeString(),
                'check_out' => null,
                'session' => [
                    'id' => $session?->id,
                    'mata_kuliah' => $course?->nama ?? $session?->title,
                    'dosen' => $dosen?->name,
                    'room' => $session?->zona,
                ],
                'meeting_number' => $session?->meeting_number,
                'distance' => (float) $log->distance_m,
                'latitude' => (float) $log->latitude,
                'longitude' => (float) $log->longitude,
                'selfie_url' => $log->selfie_path ? asset('storage/' . $log->selfie_path) : null,
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 20);
        $search = $request->get('search');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = AttendanceLog::with(['session.course'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->orderByDesc('scanned_at');

        if ($startDate) {
            $query->whereDate('scanned_at', '>=', Carbon::parse($startDate));
        }
        if ($endDate) {
            $query->whereDate('scanned_at', '<=', Carbon::parse($endDate));
        }
        if ($search) {
            $query->whereHas('session.course', function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%');
            });
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $items = $paginator->getCollection()->map(function ($log) {
            $session = $log->session;
            $course = $session?->course;
            return [
                'id' => $log->id,
                'date' => optional($log->scanned_at)->toDateString(),
                'mata_kuliah' => $course?->nama ?? $session?->title ?? '-',
                'status' => $log->status ?? 'present',
                'check_in' => optional($log->scanned_at)->format('H:i:s'),
                'check_out' => null,
                'session_id' => $session?->id,
                'notes' => $log->note,
                'meeting_number' => $session?->meeting_number,
                'distance' => (float) $log->distance_m,
                'latitude' => (float) $log->latitude,
                'longitude' => (float) $log->longitude,
                'selfie_url' => $log->selfie_path ? asset('storage/' . $log->selfie_path) : null,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }

    public function activeSessions(Request $request): JsonResponse
    {
        // Sync states first
        app(AttendanceSessionAutomationService::class)->syncActiveStates();

        $mahasiswa = $request->user();

        $activeSessionModels = AttendanceSession::with('course.dosen')
            ->where('is_active', true)
            ->where('metode', 'offline')
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%online%'])
            ->orderBy('start_at')
            ->get();

        $activeSessions = $activeSessionModels->pluck('id');
        
        $studentActiveLogs = AttendanceLog::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('attendance_session_id', $activeSessions)
            ->latest('scanned_at')
            ->get()
            ->keyBy('attendance_session_id');

        $activeSessionPayloads = $activeSessionModels
            ->map(fn (AttendanceSession $session) => $this->transformActiveSession(
                $session,
                $studentActiveLogs->get($session->id),
            ))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $activeSessionPayloads,
        ]);
    }

    private function transformActiveSession(AttendanceSession $session, ?AttendanceLog $studentLog = null): array
    {
        return [
            'id' => $session->id,
            'courseName' => $session->course?->nama ?? 'Mata Kuliah',
            'meetingNumber' => (int) $session->meeting_number,
            'title' => $session->title,
            'startAt' => $session->start_at?->format('H:i'),
            'endAt' => $session->end_at?->format('H:i'),
            'dosenName' => $session->course?->dosen?->nama,
            'attendanceStatus' => $studentLog?->status,
            'attendanceLabel' => $studentLog
                ? $this->formatAttendanceStatusLabel($studentLog->status)
                : null,
            'alreadySubmitted' => (bool) $studentLog,
        ];
    }

    private function formatAttendanceStatusLabel(?string $status): ?string
    {
        return match ($status) {
            'present' => 'Sudah hadir',
            'late' => 'Sudah hadir terlambat',
            'pending' => 'Menunggu verifikasi',
            'rejected' => 'Ditolak',
            default => null,
        };
    }

    public function submitQr(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'qr_data' => ['required', 'string'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'accuracy_m' => ['required', 'numeric'],
            'location_samples' => ['required', 'array', 'min:3'],
            'location_samples.*.latitude' => ['required', 'numeric'],
            'location_samples.*.longitude' => ['required', 'numeric'],
            'location_samples.*.accuracy_m' => ['required', 'numeric'],
            'location_samples.*.captured_at' => ['required', 'date'],
            'timestamp' => ['nullable', 'date'],
        ]);

        $mahasiswa = $request->user();
        $tokenValue = $payload['qr_data'];

        $token = AttendanceToken::with(['session.course', 'session.dosen'])
            ->where('token', $tokenValue)
            ->where('expires_at', '>', now())
            ->first();

        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'QR code tidak valid atau sudah kadaluarsa',
                'errors' => ['Invalid QR code'],
            ], 400);
        }

        $existing = AttendanceLog::query()
            ->where('attendance_session_id', $token->attendance_session_id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu sudah absen pada sesi ini',
                'errors' => ['Already attended'],
            ], 409);
        }

        $session = $token->session;
        $geofenceLat = (float) Setting::getValue('geofence_lat', '-6.3460957');
        $geofenceLng = (float) Setting::getValue('geofence_lng', '106.6915144');
        $radius = (int) Setting::getValue('geofence_radius_m', '100');
        $accuracyLimit = min(50, $radius);

        $samples = $this->normalizeLocationSamples($payload['location_samples']);
        $validation = $this->validateLocationSamples($samples, $accuracyLimit);
        if ($validation !== null) {
            return response()->json([
                'success' => false,
                'message' => $validation,
                'errors' => [$validation],
            ], 400);
        }

        $bestSample = $this->selectBestSample($samples);
        if ($bestSample['accuracy_m'] > $accuracyLimit) {
            return response()->json([
                'success' => false,
                'message' => "Akurasi GPS terlalu rendah (maks {$accuracyLimit}m).",
                'errors' => ['Low accuracy'],
            ], 400);
        }

        $distance = $this->distanceMeters(
            $bestSample['latitude'],
            $bestSample['longitude'],
            $geofenceLat,
            $geofenceLng,
        );

        if ($distance > $radius) {
            return response()->json([
                'success' => false,
                'message' => 'Anda berada di luar radius kelas',
                'errors' => ['Location out of range'],
                'data' => [
                    'distance' => $distance,
                    'max_radius' => $radius,
                    'class_location' => [
                        'latitude' => $geofenceLat,
                        'longitude' => $geofenceLng,
                    ],
                ],
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $session?->id ?? $token->attendance_session_id,
                'requires_selfie' => true,
                'session' => [
                    'id' => $session?->id ?? $token->attendance_session_id,
                    'mata_kuliah' => $session?->course?->nama ?? $session?->title,
                    'dosen' => $session?->dosen?->name,
                    'room' => $session?->zona,
                ],
                'message' => 'QR valid. Silakan ambil foto selfie.',
            ],
        ]);
    }

    public function submitSelfie(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'selfie' => ['required', 'image', 'max:4096'],
            'session_id' => ['required', 'integer'],
            'qr_data' => ['required', 'string'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'accuracy_m' => ['required', 'numeric'],
            'location_samples' => ['required', 'array', 'min:3'],
            'location_samples.*.latitude' => ['required', 'numeric'],
            'location_samples.*.longitude' => ['required', 'numeric'],
            'location_samples.*.accuracy_m' => ['required', 'numeric'],
            'location_samples.*.captured_at' => ['required', 'date'],
            'timestamp' => ['nullable', 'date'],
        ]);

        $mahasiswa = $request->user();
        $token = AttendanceToken::with('session')
            ->where('token', $payload['qr_data'])
            ->where('expires_at', '>', now())
            ->first();

        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'QR code tidak valid atau sudah kadaluarsa',
                'errors' => ['Invalid QR code'],
            ], 400);
        }

        $providedSessionId = (int) ($payload['session_id'] ?? 0);
        
        if ($providedSessionId !== 0 && $providedSessionId !== (int) $token->attendance_session_id) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak sesuai',
                'errors' => ['Session mismatch'],
            ], 400);
        }

        $existing = AttendanceLog::query()
            ->where('attendance_session_id', $token->attendance_session_id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu sudah absen pada sesi ini',
                'errors' => ['Already attended'],
            ], 409);
        }

        $geofenceLat = (float) Setting::getValue('geofence_lat', '-6.3460957');
        $geofenceLng = (float) Setting::getValue('geofence_lng', '106.6915144');
        $radius = (int) Setting::getValue('geofence_radius_m', '100');
        $accuracyLimit = min(50, $radius);

        $samples = $this->normalizeLocationSamples($payload['location_samples']);
        $validation = $this->validateLocationSamples($samples, $accuracyLimit);
        if ($validation !== null) {
            return response()->json([
                'success' => false,
                'message' => $validation,
                'errors' => [$validation],
            ], 400);
        }

        $bestSample = $this->selectBestSample($samples);
        if ($bestSample['accuracy_m'] > $accuracyLimit) {
            return response()->json([
                'success' => false,
                'message' => "Akurasi GPS terlalu rendah (maks {$accuracyLimit}m).",
                'errors' => ['Low accuracy'],
            ], 400);
        }

        $distance = $this->distanceMeters(
            $bestSample['latitude'],
            $bestSample['longitude'],
            $geofenceLat,
            $geofenceLng,
        );

        if ($distance > $radius) {
            return response()->json([
                'success' => false,
                'message' => 'Anda berada di luar radius kelas',
                'errors' => ['Location out of range'],
                'data' => [
                    'distance' => $distance,
                    'max_radius' => $radius,
                    'class_location' => [
                        'latitude' => $geofenceLat,
                        'longitude' => $geofenceLng,
                    ],
                ],
            ], 400);
        }

        $path = $request->file('selfie')->store('selfies', 'public');

        $log = AttendanceLog::create([
            'attendance_session_id' => $token->attendance_session_id,
            'mahasiswa_id' => $mahasiswa->id,
            'attendance_token_id' => $token->id,
            'scanned_at' => $payload['timestamp'] ?? now(),
            'status' => 'present',
            'selfie_path' => $path,
            'latitude' => $bestSample['latitude'],
            'longitude' => $bestSample['longitude'],
            'distance_m' => $distance,
            'accuracy' => $bestSample['accuracy_m'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil dicatat',
            'data' => [
                'attendance_id' => $log->id,
                'status' => $log->status,
                'check_in' => optional($log->scanned_at)->toDateTimeString(),
                'selfie_path' => Storage::disk('public')->url($path),
            ],
        ]);
    }

    private function normalizeLocationSamples(array $samples): array
    {
        $normalized = array_map(function (array $sample) {
            return [
                'latitude' => (float) $sample['latitude'],
                'longitude' => (float) $sample['longitude'],
                'accuracy_m' => (float) $sample['accuracy_m'],
                'captured_at' => Carbon::parse($sample['captured_at']),
            ];
        }, $samples);

        usort($normalized, fn ($a, $b) => $a['captured_at'] <=> $b['captured_at']);

        return $normalized;
    }

    private function validateLocationSamples(array $samples, float $accuracyLimit): ?string
    {
        if (count($samples) < 3) {
            return 'Sampel lokasi tidak cukup.';
        }

        $oldest = $samples[0]['captured_at'];
        $newest = $samples[count($samples) - 1]['captured_at'];
        if ($newest->diffInSeconds($oldest) > 20) {
            return 'Sampel lokasi terlalu lama. Ambil ulang GPS.';
        }

        if ($oldest->lt(now()->subSeconds(60))) {
            return 'Lokasi terlalu lama. Ambil ulang GPS sebelum absen.';
        }

        $accurate = array_filter($samples, static fn (array $sample) => $sample['accuracy_m'] <= $accuracyLimit);
        if (count($accurate) < ceil(count($samples) / 2)) {
            return "Akurasi GPS belum cukup konsisten (maks {$accuracyLimit}m).";
        }

        $jump = $this->detectJumpViolation($samples, 35, 150);
        if ($jump !== null) {
            return 'Pergerakan lokasi terlalu cepat. Ambil ulang GPS.';
        }

        $best = $this->selectBestSample($samples);
        $spread = $this->maxSampleSpread($samples, $best);
        if ($spread > 100) {
            return 'Sampel lokasi tidak konsisten. Ambil ulang GPS.';
        }

        return null;
    }

    private function selectBestSample(array $samples): array
    {
        return array_reduce($samples, function ($carry, $sample) {
            if ($carry === null) return $sample;
            return $sample['accuracy_m'] <= $carry['accuracy_m'] ? $sample : $carry;
        });
    }

    private function maxSampleSpread(array $samples, array $anchor): float
    {
        $max = 0.0;
        foreach ($samples as $sample) {
            $distance = $this->distanceMeters(
                $sample['latitude'],
                $sample['longitude'],
                $anchor['latitude'],
                $anchor['longitude'],
            );
            if ($distance > $max) {
                $max = $distance;
            }
        }
        return $max;
    }

    private function detectJumpViolation(array $samples, float $maxSpeedMps, float $maxJumpMeters): ?array
    {
        for ($i = 1; $i < count($samples); $i++) {
            $prev = $samples[$i - 1];
            $curr = $samples[$i];
            $seconds = max(1, $curr['captured_at']->diffInSeconds($prev['captured_at']));
            $distance = $this->distanceMeters(
                $prev['latitude'],
                $prev['longitude'],
                $curr['latitude'],
                $curr['longitude'],
            );
            $speed = $distance / $seconds;
            if ($speed > $maxSpeedMps || ($distance > $maxJumpMeters && $seconds < 5)) {
                return [
                    'distance' => $distance,
                    'seconds' => $seconds,
                    'speed_mps' => $speed,
                ];
            }
        }

        return null;
    }

    private function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $latFrom = deg2rad($lat1);
        $lngFrom = deg2rad($lng1);
        $latTo = deg2rad($lat2);
        $lngTo = deg2rad($lng2);
        $latDelta = $latTo - $latFrom;
        $lngDelta = $lngTo - $lngFrom;
        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lngDelta / 2), 2)));

        return $angle * $earthRadius;
    }
}
