<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\SelfieVerification;
use App\Services\SelfieVerificationAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    protected SelfieVerificationAIService $aiService;

    public function __construct(SelfieVerificationAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Main verification list page — uses stored data only, no rand()
     */
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        $allVerifications = SelfieVerification::query()
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->latest()
            ->get();

        $verifications = $allVerifications->map(function ($v) {
            $log = $v->attendanceLog;
            $m = $log?->mahasiswa;
            $session = $log?->session;

            // Use stored AI data from attendance_logs — no rand(), no AI service call
            $faceScore = $log?->face_match_score;
            $aiConf = $log?->ai_confidence;
            // Derive decision from stored data
            $decision = $log?->ai_recommendation;
            if ($decision === null && $aiConf !== null) {
                $decision = $aiConf >= 80 ? 'approve' : ($aiConf < 50 ? 'reject' : 'review');
            }

            $aiAnalysis = $log?->ai_analysis_json ?? [];

            return [
                'id' => $v->id,
                'mahasiswa' => [
                    'id' => $m?->id ?? 0,
                    'nama' => $m?->nama ?? '-',
                    'nim' => $m?->nim ?? '-',
                'avatar_url' => $m?->avatar_url,
                    'email' => $m?->email ?? '-',
                    'phone' => $m?->phone ?? '-',
                ],
                'selfie_url' => $log?->selfie_path ? \asset('storage/' . $log->selfie_path) : null,
                'course' => $session?->course?->nama ?? '-',
                'meeting_number' => $session?->meeting_number ?? 0,
                'status' => $v->status,
                'submitted_at' => $v->created_at?->toIso8601String(),
                'date_display' => $v->created_at?->format('d M Y') ?? '-',
                'time_display' => $v->created_at?->format('H:i') ?? '-',
                'distance' => $log?->distance_m,
                'device_type' => $log?->device_model ?? $log?->device_type,
                'ai_confidence' => $aiConf,
                'face_match_score' => $faceScore,
                'liveness_score' => $aiAnalysis['liveness_detection']['liveness_score'] ?? null,
                'spoofing_detected' => $aiAnalysis['liveness_detection']['moire_pattern_detected'] ?? false,
                'location_verified' => $aiAnalysis['location_verification']['is_verified'] ?? null,
                'device_trusted' => $log?->is_device_trusted,
                'total_processing_time_ms' => $aiAnalysis['total_processing_time_ms'] ?? null,
                'ai_scanned' => $log?->ai_processed_at !== null,
                'rejection_reason' => $v->rejection_reason,
                'verified_by' => $v->verified_by_name,
                'verified_at' => $v->verified_at?->format('d M Y H:i'),
                'ai_decision' => $decision,
            ];
        });

        $scanned = $verifications->where('ai_scanned', true);

        $pending = $verifications->where('status', 'pending')->count();
        $approvedToday = $allVerifications->where('status', 'approved')
            ->filter(fn($v) => $v->verified_at?->isToday())->count();
        $rejected = $verifications->where('status', 'rejected')->count();
        $suspicious = $scanned->where('spoofing_detected', true)->count();
        $scanned = $verifications->where('ai_scanned', true);
        $aiAutoApproved = $scanned->where('ai_decision', 'approve')->count();
        $validLocation = $scanned->where('location_verified', true)->count();
        $trustedDevices = $verifications->where('device_trusted', true)->count();

        $stats = [
            'total' => $verifications->count(),
            'pending' => $pending,
            'approved_today' => $approvedToday,
            'rejected' => $rejected,
            'today' => $allVerifications->filter(fn($v) => $v->created_at?->isToday())->count(),
            'ai_auto_approved' => $aiAutoApproved,
            'suspicious' => $suspicious,
            'face_match_rate' => $scanned->count() > 0 ? round($scanned->avg('face_match_score')) : 0,
            'location_valid' => $validLocation,
            'device_trusted' => $trustedDevices,
            'avg_processing_time' => $scanned->count() > 0 ? round($scanned->avg('total_processing_time_ms')) : 0,
        ];

        return Inertia::render('dosen/verify', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama, 'nidn' => $dosen->nidn],
            'verifications' => $verifications->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Detail page — reads stored data only, no AI service call on load
     */
    public function show(SelfieVerification $verification): Response
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        if (!$verification->attendanceLog?->session ||
            !$courseIds->contains($verification->attendanceLog->session->course_id)) {
            abort(403, 'Anda tidak memiliki akses untuk verifikasi ini.');
        }

        $log = $verification->attendanceLog;
        $m = $log->mahasiswa;
        $session = $log->session;
        $aiAnalysis = $log->ai_analysis_json; // null if never scanned
        $isScanned = $log->ai_processed_at !== null;

        $data = [
            'id' => $verification->id,
            'mahasiswa' => [
                'id' => $m?->id ?? 0,
                'nama' => $m?->nama ?? '-',
                'nim' => $m?->nim ?? '-',
                'avatar_url' => $m?->avatar_url,
                'email' => $m?->email ?? '-',
                'phone' => $m?->phone ?? '-',
                'kelas' => $m?->kelas ?? '-',
                'prodi' => $m?->prodi ?? '-',
                'fakultas' => $m?->fakultas ?? '-',
                'semester' => $m?->semester ?? '-',
            ],
            'selfie_url' => $log->selfie_path ? asset('storage/' . $log->selfie_path) : null,
            'reference_photo_url' => $m?->avatar_path ? asset('storage/' . $m->avatar_path) : null,
            'course' => $session?->course?->nama ?? '-',
            'meeting_number' => $session?->meeting_number ?? 0,
            'session_date' => $session?->session_date?->format('d M Y') ?? '-',
            'status' => $verification->status,
            'submitted_at' => $verification->created_at?->toIso8601String(),
            'date_display' => $verification->created_at?->format('d M Y') ?? '-',
            'time_display' => $verification->created_at?->format('H:i') ?? '-',
            'rejection_reason' => $verification->rejection_reason,
            'verified_by' => $verification->verified_by_name,
            'verified_at' => $verification->verified_at?->format('d M Y H:i'),
            'attendance_log_id' => $log->id,

            // AI scan status
            'is_scanned' => $isScanned,
            'ai_processed_at' => $log->ai_processed_at?->toIso8601String(),
            'scanned_at' => $log->scanned_at?->toIso8601String(),

            // Stored AI individual fields (null before scan)
            'face_match_score' => $log->face_match_score,
            'face_detected' => $log->face_detected,
            'is_live_photo' => $log->is_live_photo,
            'spoofing_detected' => $log->spoofing_detected,
            'image_quality_score' => $log->image_quality_score,
            'ai_confidence' => $log->ai_confidence,
            'ai_recommendation' => $log->ai_recommendation,

            // Full AI analysis object (null before scan)
            'ai_analysis' => $aiAnalysis,

            // Real device data from attendance_log
            'device_info' => [
                'type' => $log->device_type,
                'model' => $log->device_model,
                'os' => $log->device_os,
                'browser' => $log->browser,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'is_trusted' => $log->is_device_trusted,
                'device_id' => $log->device_fingerprint,
                'screen_resolution' => $log->screen_resolution,
                'timezone' => $log->timezone,
                'platform' => $log->platform,
            ],
            // Real location data
            'location_data' => [
                'latitude' => $log->latitude,
                'longitude' => $log->longitude,
                'accuracy' => $log->accuracy,
                'address' => $log->address,
                'distance_m' => $log->distance_m,
            ],
        ];

        return Inertia::render('dosen/verification-detail', [
            'verification' => $data,
        ]);
    }

    /**
     * Trigger real-time AI scan — runs SelfieVerificationAIService and saves results
     */
    public function scanAI(SelfieVerification $verification): \Illuminate\Http\JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        if (!$verification->attendanceLog?->session ||
            !$courseIds->contains($verification->attendanceLog->session->course_id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $log = $verification->attendanceLog;

        // Run AI analysis
        $ai = $this->aiService->verifyAttendance($log);

        // Save all results to attendance_logs
        $log->update([
            'face_detected' => $ai['face_recognition']['face_detected'] ?? null,
            'face_match_score' => $ai['face_recognition']['face_match_score'] ?? null,
            'is_live_photo' => $ai['liveness_detection']['is_live'] ?? null,
            'spoofing_detected' => $ai['liveness_detection']['moire_pattern_detected'] ?? false,
            'image_quality_score' => $ai['image_quality']['overall_score'] ?? null,
            'ai_confidence' => $ai['confidence_score'] ?? null,
            'ai_recommendation' => $ai['overall_decision'] ?? null,
            'ai_analysis_json' => $ai,
            'ai_processed_at' => now(),
            'ai_processing_step' => 'completed',
        ]);

        return \response()->json([
            'success' => true,
            'ai_analysis' => $ai,
            'ai_processed_at' => \now()->toIso8601String(),
        ]);
    }

    public function approve(SelfieVerification $verification): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        if (!$verification->attendanceLog?->session ||
            !$courseIds->contains($verification->attendanceLog->session->course_id)) {
            abort(403, 'Anda tidak memiliki akses untuk verifikasi ini.');
        }

        $verification->update([
            'status' => 'approved',
            'verified_by' => $dosen->id,
            'verified_by_type' => 'dosen',
            'verified_by_name' => $dosen->nama,
            'verified_at' => now(),
        ]);

        $verification->attendanceLog->update(['status' => 'present']);

        return back()->with('success', 'Selfie berhasil disetujui.');
    }

    public function reject(SelfieVerification $verification, Request $request): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        if (!$verification->attendanceLog?->session ||
            !$courseIds->contains($verification->attendanceLog->session->course_id)) {
            abort(403);
        }

        $verification->update([
            'status' => 'rejected',
            'verified_by' => $dosen->id,
            'verified_by_type' => 'dosen',
            'verified_by_name' => $dosen->nama,
            'verified_at' => now(),
            'rejection_reason' => $request->input('reason'),
        ]);

        $verification->attendanceLog->update(['status' => 'rejected']);

        return back()->with('success', 'Selfie berhasil ditolak.');
    }

    /**
     * Quick Verify selected items (Approve if AI >= 90%, else Reject)
     */
    public function quickVerify(Request $request): \Illuminate\Http\JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');
        $ids = $request->input('verification_ids', []);

        if (empty($ids)) {
            return response()->json(['error' => 'No IDs provided'], 400);
        }

        $verifications = SelfieVerification::whereIn('id', $ids)
            ->where('status', 'pending')
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->get();

        $approved = 0;
        $rejected = 0;

        foreach ($verifications as $v) {
            $aiConf = $v->attendanceLog->ai_confidence ?? 0;
            if ($aiConf >= 90) {
                $v->update([
                    'status' => 'approved',
                    'verified_by' => $dosen->id,
                    'verified_by_type' => 'dosen',
                    'verified_by_name' => $dosen->nama,
                    'verified_at' => now(),
                ]);
                $v->attendanceLog->update(['status' => 'present']);
                $approved++;
            } else {
                $v->update([
                    'status' => 'rejected',
                    'verified_by' => $dosen->id,
                    'verified_by_type' => 'dosen',
                    'verified_by_name' => $dosen->nama,
                    'verified_at' => now(),
                    'rejection_reason' => 'AI Confidence terlalu rendah untuk Quick Verify (< 90%)',
                ]);
                $v->attendanceLog->update(['status' => 'rejected']);
                $rejected++;
            }
        }

        return response()->json(['approved' => $approved, 'rejected' => $rejected]);
    }

    /**
     * AI Auto-Verify pending items
     */
    public function aiAutoVerify(): \Illuminate\Http\JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        $pending = SelfieVerification::where('status', 'pending')
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->get();

        $processed = 0;
        $approved = 0;

        foreach ($pending as $v) {
            $log = $v->attendanceLog;
            if (!$log->ai_processed_at) {
                // Ensure the AI actually scans the log
                $ai = $this->aiService->verifyAttendance($log);
                $log->update([
                    'face_detected' => $ai['face_recognition']['face_detected'] ?? null,
                    'face_match_score' => $ai['face_recognition']['face_match_score'] ?? null,
                    'is_live_photo' => $ai['liveness_detection']['is_live'] ?? null,
                    'spoofing_detected' => $ai['liveness_detection']['moire_pattern_detected'] ?? false,
                    'image_quality_score' => $ai['image_quality']['overall_score'] ?? null,
                    'ai_confidence' => $ai['confidence_score'] ?? null,
                    'ai_recommendation' => $ai['overall_decision'] ?? null,
                    'ai_analysis_json' => $ai,
                    'ai_processed_at' => now(),
                    'ai_processing_step' => 'completed',
                ]);
            }
            
            $log->refresh();

            if ($log->ai_recommendation === 'approve' && $log->ai_confidence >= 80) {
                $v->update([
                    'status' => 'approved',
                    'verified_by' => $dosen->id,
                    'verified_by_type' => 'dosen',
                    'verified_by_name' => $dosen->nama,
                    'verified_at' => now(),
                ]);
                $v->attendanceLog->update(['status' => 'present']);
                $approved++;
            }
            $processed++;
        }

        return response()->json([
            'processed' => $processed,
            'approved' => $approved
        ]);
    }

    /**
     * Export to PDF or Excel
     */
    public function export(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        $format = $request->input('format', 'pdf');
        $courseIds = \App\Models\MataKuliah::where('dosen_id', $dosen->id)->pluck('id');
        $courses = \App\Models\MataKuliah::whereIn('id', $courseIds)->get();

        if ($format === 'excel') {
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\SelfieVerificationExport($courseIds),
                'verifikasi-selfie-' . date('Y-m-d') . '.xlsx'
            );
        }

        $verifications = SelfieVerification::with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->latest()
            ->get();

        // Compute comprehensive stats
        $total = $verifications->count();
        $pending = $verifications->where('status', 'pending')->count();
        $approved = $verifications->where('status', 'approved')->count();
        $rejected = $verifications->where('status', 'rejected')->count();

        $scannedLogs = $verifications->filter(fn($v) => $v->attendanceLog?->ai_processed_at !== null);
        $avgAiConfidence = $scannedLogs->count() > 0
            ? round($scannedLogs->avg(fn($v) => $v->attendanceLog?->ai_confidence ?? 0), 1)
            : 0;
        $avgFaceMatch = $scannedLogs->count() > 0
            ? round($scannedLogs->avg(fn($v) => $v->attendanceLog?->face_match_score ?? 0), 1)
            : 0;
        $suspicious = $verifications->filter(fn($v) => $v->attendanceLog?->is_suspicious)->count();

        // Risk breakdown
        $riskLow = $total; $riskMedium = 0; $riskHigh = 0; $riskCritical = 0;

        // Per-course breakdown
        $courseBreakdown = $courses->map(function ($c) use ($verifications) {
            $cv = $verifications->filter(fn($v) => $v->attendanceLog?->session?->course_id === $c->id);
            return [
                'nama' => $c->nama,
                'sks' => $c->sks,
                'total' => $cv->count(),
                'approved' => $cv->where('status', 'approved')->count(),
                'rejected' => $cv->where('status', 'rejected')->count(),
                'pending' => $cv->where('status', 'pending')->count(),
            ];
        });

        $stats = compact('total', 'pending', 'approved', 'rejected', 'avgAiConfidence', 'avgFaceMatch', 'suspicious', 'riskLow', 'riskMedium', 'riskHigh', 'riskCritical');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.selfie-verifications', [
            'dosen' => $dosen,
            'verifications' => $verifications,
            'stats' => $stats,
            'courseBreakdown' => $courseBreakdown,
            'date' => now()->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ]);

        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('verifikasi-selfie-' . date('Y-m-d') . '.pdf');
    }
}
