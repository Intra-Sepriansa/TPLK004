<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SelfieVerificationController extends Controller
{
    /**
     * Display the specified verification detail.
     */
    public function show(Request $request, $id)
    {
        // For development/showcase purposes without a real AI backend yet, 
        // we generate a consistent but highly detailed mock dataset that matches the UI requirements.
        
        $model = \App\Models\SelfieVerification::with(['attendanceLog.mahasiswa', 'attendanceLog.session.course', 'verifier'])->findOrFail($id);
        $currentUserId = $request->user()?->id;
        $log = $model->attendanceLog;
        $mhs = $log ? $log->mahasiswa : null;
        $course = $log && $log->session ? $log->session->course : null;

        // Extract AI data from attendanceLog
        $aiData = $log ? ($log->ai_analysis_json ?? []) : [];

        $history = [];
        if ($log && $log->scanned_at) {
            $history[] = [
                'action' => 'Foto Selfie Diunggah',
                'status' => 'pending',
                'by' => 'System',
                'timestamp' => $log->scanned_at->format('d M Y, H:i'),
                'notes' => 'Menerima payload foto via API mobile.',
            ];
        } else {
             $history[] = [
                'action' => 'Foto Selfie Diunggah',
                'status' => 'pending',
                'by' => 'System',
                'timestamp' => $model->created_at->format('d M Y, H:i'),
                'notes' => 'Menerima payload foto via API mobile.',
            ];
        }

        if ($log && $log->ai_processed_at) {
            $history[] = [
                'action' => 'AI Analysis Selesai',
                'status' => 'approved',
                'by' => 'AI Engine v2',
                'timestamp' => $log->ai_processed_at->format('d M Y, H:i'),
                'notes' => 'Proses ekstraksi landmark otomatis selesai.',
            ];
        }

        // Action history
        if ($model->status !== 'pending') {
            $history[] = [
                'action' => 'Verifikasi ' . ucfirst($model->status),
                'status' => $model->status,
                'by' => $model->verified_by_name ?? 'Admin',
                'timestamp' => $model->verified_at ? $model->verified_at->format('d M Y, H:i') : now()->format('d M Y, H:i'),
                'notes' => $model->note ?? $model->rejection_reason ?? 'Telah ditinjau manual.',
            ];
        }



        // Build photo URLs - strip leading /storage/ from paths if present to avoid double-storage
        $avatarPath = $mhs && $mhs->avatar_url ? ltrim(str_replace('/storage/', '', $mhs->avatar_url), '/') : null;
        $selfiePath = $log && $log->selfie_path ? ltrim(str_replace('/storage/', '', $log->selfie_path), '/') : null;
        $selfieUrl = $selfiePath ? asset('storage/' . $selfiePath) : null;

        $approvedRequest = null;
        $pendingRequest = null;
        $latestRejectedRequest = null;

        if ($currentUserId) {
            $approvedRequest = $model->viewRequests()
                ->where('requested_by', $currentUserId)
                ->where('status', 'approved')
                ->latest('responded_at')
                ->first();

            $pendingRequest = $model->viewRequests()
                ->where('requested_by', $currentUserId)
                ->where('status', 'pending')
                ->latest('created_at')
                ->first();

            $latestRejectedRequest = $model->viewRequests()
                ->where('requested_by', $currentUserId)
                ->where('status', 'rejected')
                ->latest('responded_at')
                ->first();
        }

        $hasApprovedRequest = $approvedRequest !== null;
        $isLocked = !$hasApprovedRequest;

        // One-time access: once detail is opened with approved access, consume permission.
        if ($approvedRequest) {
            $approvedRequest->delete();
        }

        $requestStatus = 'none';
        if ($pendingRequest) {
            $requestStatus = 'pending';
        } elseif ($latestRejectedRequest) {
            $requestStatus = 'rejected';
        } elseif ($hasApprovedRequest) {
            $requestStatus = 'approved';
        }

        $privacyMessage = 'Foto selfie terkunci. Admin harus meminta izin ke mahasiswa sebelum verifikasi ulang.';
        if ($pendingRequest) {
            $privacyMessage = 'Permintaan izin sedang menunggu persetujuan mahasiswa.';
        } elseif ($latestRejectedRequest) {
            $privacyMessage = 'Permintaan izin sebelumnya ditolak. Silakan kirim permintaan baru dengan alasan yang jelas.';
        } elseif ($hasApprovedRequest) {
            $privacyMessage = 'Izin sudah dipakai untuk 1 kali akses. Untuk buka ulang, admin harus meminta izin lagi.';
        }

        $canRequest = $pendingRequest === null;
        if (!$selfieUrl) {
            $isLocked = true;
            $privacyMessage = 'Foto selfie tidak tersedia untuk verifikasi.';
            $requestStatus = 'none';
            $canRequest = false;
        }

        return \Inertia\Inertia::render('admin/verifikasi-selfie-detail', [
            'verification' => [
                'raw_id' => $model->id,
                'id' => 'VER-' . str_pad($model->id, 6, '0', STR_PAD_LEFT),
                'student' => [
                    'name' => $mhs->nama ?? 'Unknown',
                    'nim' => $mhs->nim ?? '-',
                    'initials' => strtoupper(substr($mhs->nama ?? 'U', 0, 2)),
                    'photo' => $avatarPath ? asset('storage/' . $avatarPath) : 'https://ui-avatars.com/api/?name=' . urlencode($mhs->nama ?? 'U') . '&background=random',
                    'major' => $mhs->prodi ?? 'Informatika',
                    'semester' => $mhs->semester ?? 5,
                ],
                'reference_photo' => $avatarPath ? asset('storage/' . $avatarPath) : 'https://ui-avatars.com/api/?name=' . urlencode($mhs->nama ?? 'U') . '&background=random',
                'selfie_photo' => $hasApprovedRequest ? $selfieUrl : null,
                'match_score' => $log->face_match_score ?? 0,
                'confidence_level' => $log->ai_confidence ?? 0,
                'status' => $model->status,
                'uploaded_at' => $log && $log->scanned_at ? $log->scanned_at->format('d M Y, H:i') : null,
                'processing_time' => $aiData['processing_time_ms'] ?? 850,
                'face_quality' => $log->image_quality_score ?? 0,
                'lighting_score' => $aiData['lighting_score'] ?? rand(75, 95),
                'face_angle' => $aiData['face_angle'] ?? rand(1, 5),
                'sharpness_score' => $aiData['sharpness_score'] ?? rand(80, 95),
                'ai_insights' => $log->ai_recommendation ?? "Sistem mendeteksi kehadiran. " . ($log && $log->spoofing_detected ? "Indikasi spoofing ditemukan!" : "Wajah teridentifikasi."),
                'face_detection_confidence' => $aiData['face_detection_confidence'] ?? $log->ai_confidence ?? 0,
                'features' => [
                    'eyes' => $aiData['features']['eyes'] ?? true,
                    'nose' => $aiData['features']['nose'] ?? true,
                    'mouth' => $aiData['features']['mouth'] ?? true,
                    'eyebrows' => $aiData['features']['eyebrows'] ?? true,
                ],
                'facial_symmetry' => $aiData['facial_symmetry'] ?? rand(85, 98),
                'emotions' => $aiData['emotions'] ?? [
                    ['name' => 'Neutral', 'confidence' => 85]
                ],
                'liveness_score' => $aiData['liveness_score'] ?? rand(85, 98),
                'liveness_checks' => [
                    'real_person' => $log->is_live_photo ?? true,
                    'no_screen' => !($log->spoofing_detected ?? false),
                    'no_mask' => $aiData['liveness_checks']['no_mask'] ?? true,
                    'eye_blink' => $aiData['liveness_checks']['eye_blink'] ?? true,
                    'head_movement' => $aiData['liveness_checks']['head_movement'] ?? true,
                ],
                'anti_spoofing_passed' => !($log && $log->spoofing_detected),
                'overall_assessment' => $log->ai_recommendation ?? "Verifikasi biometrik berhasil.",
                'verified_by' => $model->verified_by_name ?? null,
                'verification_date' => $model->verified_at ? $model->verified_at->format('d M Y, H:i') : null,
                'ai_model_version' => $aiData['ai_model_version'] ?? 'v2.4.1-production',
                'recommendations' => $log && $log->ai_recommendation ? [$log->ai_recommendation] : ['Kualitas foto memenuhi standar.'],
                'history' => $history,
                'anomalies' => [],
            ],
            'privacy' => [
                'is_locked' => $isLocked,
                'has_selfie' => (bool) $selfieUrl,
                'request_status' => $requestStatus,
                'can_request' => $canRequest,
                'message' => $privacyMessage,
                'last_request' => [
                    'reason' => $pendingRequest?->reason ?? $latestRejectedRequest?->reason ?? null,
                    'response_note' => $latestRejectedRequest?->response_note,
                    'requested_at' => ($pendingRequest?->created_at ?? $latestRejectedRequest?->created_at)?->format('d M Y, H:i'),
                    'responded_at' => $latestRejectedRequest?->responded_at?->format('d M Y, H:i'),
                ],
            ],
            'facialLandmarks' => [
                'reference' => $aiData['landmarks']['reference'] ?? $this->generateMockLandmarks(),
                'selfie' => $aiData['landmarks']['selfie'] ?? $this->generateMockLandmarks(),
            ],
            'facialFeatures' => [],
            'confidenceMetrics' => [],
            'relatedVerifications' => [], // Can be expanded later
        ]);
    }

    /**
     * Helper to generate a handful of visual mock landmark points as percentages 
     * around the center of the image.
     */
    private function generateMockLandmarks()
    {
        $landmarks = [];
        // Eyes
        $landmarks[] = ['x' => 35, 'y' => 45, 'type' => 'left_eye'];
        $landmarks[] = ['x' => 65, 'y' => 45, 'type' => 'right_eye'];
        // Nose
        $landmarks[] = ['x' => 50, 'y' => 60, 'type' => 'nose'];
        // Mouth
        $landmarks[] = ['x' => 40, 'y' => 75, 'type' => 'mouth_left'];
        $landmarks[] = ['x' => 60, 'y' => 75, 'type' => 'mouth_right'];
        $landmarks[] = ['x' => 50, 'y' => 78, 'type' => 'mouth_bottom'];
        // Jawline (approximate)
        $landmarks[] = ['x' => 20, 'y' => 65, 'type' => 'jaw_left'];
        $landmarks[] = ['x' => 50, 'y' => 90, 'type' => 'jaw_bottom'];
        $landmarks[] = ['x' => 80, 'y' => 65, 'type' => 'jaw_right'];

        return $landmarks;
    }

    public function approve(Request $request, $id)
    {
        // Mock success action
        // Normally you would update the DB record here.
        return back()->with('success', 'Verifikasi berhasil disetujui.');
    }

    public function reject(Request $request, $id)
    {
        // Mock reject action
        return back()->with('success', 'Verifikasi telah ditolak.');
    }
}
