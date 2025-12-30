<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiAttendanceController extends Controller
{
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mahasiswa_id' => ['required', 'integer', 'exists:mahasiswa,id'],
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $activeSession = AttendanceSession::where('is_active', true)
            ->latest('start_at')
            ->first();

        if (! $activeSession) {
            return response()->json([
                'status' => 'no_session',
                'message' => 'Tidak ada sesi aktif.',
            ], 422);
        }

        if ($activeSession->end_at && now()->greaterThan($activeSession->end_at)) {
            return response()->json([
                'status' => 'session_closed',
                'message' => 'Sesi sudah berakhir.',
            ], 422);
        }

        $mahasiswa = Mahasiswa::find($validated['mahasiswa_id']);
        if (! $mahasiswa) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Mahasiswa tidak ditemukan.',
            ], 404);
        }

        $already = AttendanceLog::where('attendance_session_id', $activeSession->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->exists();

        if ($already) {
            return response()->json([
                'status' => 'duplicate',
                'message' => 'Mahasiswa sudah absen pada sesi ini.',
            ]);
        }

        $serviceUrl = rtrim((string) config('attendance.ai.service_url'), '/');
        if ($serviceUrl === '') {
            return response()->json([
                'status' => 'service_missing',
                'message' => 'YOLO service belum dikonfigurasi.',
            ], 500);
        }

        $minConf = (float) config('attendance.ai.min_conf', 0.6);
        $targetLabel = trim((string) config('attendance.ai.target_label', ''));

        $headers = [];
        $apiKey = config('attendance.ai.api_key');
        if ($apiKey) {
            $headers['x-api-key'] = $apiKey;
        }

        $image = $request->file('image');
        $filename = $image?->getClientOriginalName() ?: 'frame.jpg';

        $response = Http::timeout(15)
            ->withHeaders($headers)
            ->attach('file', file_get_contents($image->getRealPath()), $filename)
            ->post($serviceUrl . '/infer?conf=' . $minConf);

        if (! $response->ok()) {
            return response()->json([
                'status' => 'service_error',
                'message' => 'Gagal memproses deteksi dari YOLO.',
                'details' => $response->json(),
            ], 502);
        }

        $payload = $response->json();
        $detections = $payload['detections'] ?? [];

        if ($targetLabel !== '') {
            $detections = array_values(array_filter($detections, function (array $det) use ($targetLabel) {
                $label = (string) ($det['class_name'] ?? '');
                return Str::lower($label) === Str::lower($targetLabel);
            }));
        }

        if (! $detections) {
            return response()->json([
                'status' => 'no_detection',
                'message' => 'Objek belum terdeteksi.',
                'model' => $payload['model'] ?? null,
            ]);
        }

        usort($detections, static fn (array $a, array $b) => ($b['confidence'] ?? 0) <=> ($a['confidence'] ?? 0));
        $best = $detections[0];

        $confidence = (float) ($best['confidence'] ?? 0);
        if ($confidence < $minConf) {
            return response()->json([
                'status' => 'no_detection',
                'message' => 'Confidence belum cukup.',
                'model' => $payload['model'] ?? null,
            ]);
        }

        $lateMinutes = (int) Setting::getValue('late_minutes', '10');
        $status = now()->greaterThan($activeSession->start_at->copy()->addMinutes($lateMinutes))
            ? 'late'
            : 'present';

        $log = AttendanceLog::create([
            'attendance_session_id' => $activeSession->id,
            'mahasiswa_id' => $mahasiswa->id,
            'attendance_token_id' => null,
            'scanned_at' => now(),
            'status' => $status,
            'distance_m' => null,
            'selfie_path' => null,
            'latitude' => null,
            'longitude' => null,
            'device_os' => 'admin',
            'device_model' => 'absen_ai',
            'device_type' => 'kiosk',
            'note' => sprintf('absen_ai:%.2f', $confidence),
        ]);

        return response()->json([
            'status' => 'recorded',
            'message' => 'Absensi tercatat.',
            'model' => $payload['model'] ?? null,
            'detection' => [
                'class_id' => $best['class_id'] ?? null,
                'class_name' => $best['class_name'] ?? null,
                'confidence' => $confidence,
                'box' => $best['box'] ?? null,
            ],
            'log' => [
                'id' => $log->id,
                'status' => $log->status,
                'time' => $this->formatDisplayTime($log->scanned_at, 'H:i'),
                'mahasiswa' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
        ]);
    }
}
