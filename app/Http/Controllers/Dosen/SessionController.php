<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use App\Models\SelfieVerification;
use App\Models\MahasiswaCourse;
use App\Models\NotificationLog;
use App\Services\AttendanceSessionAutomationService;
use App\Services\MeetingQuickFillService;
use App\Services\SmartNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function show(AttendanceSession $session, AttendanceSessionAutomationService $automationService): Response
    {
        $automationService->syncActiveStates();

        $dosen = Auth::guard('dosen')->user();
        
        // Check if dosen teaches this course
        $course = MataKuliah::find($session->course_id);
        if (!$course || $course->dosen_id !== $dosen->id) {
            abort(403, 'Anda tidak memiliki akses ke sesi ini.');
        }

        $logs = AttendanceLog::where('attendance_session_id', $session->id)
            ->with(['mahasiswa', 'selfieVerification'])
            ->orderByDesc('scanned_at')
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'mahasiswa' => $log->mahasiswa?->nama ?? '-',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'status' => $log->status,
                'scanned_at' => $log->scanned_at?->format('H:i'),
                'selfie_url' => $log->selfie_path ? asset('storage/' . $log->selfie_path) : null,
                'selfie_status' => $log->selfieVerification?->status ?? 'pending',
                'verified_by' => $log->selfieVerification?->verified_by_name,
                'verified_by_type' => $log->selfieVerification?->verified_by_type,
                'distance' => $log->distance,
            ]);

        $stats = [
            'total' => $logs->count(),
            'present' => $logs->where('status', 'present')->count(),
            'late' => $logs->where('status', 'late')->count(),
            'rejected' => $logs->where('status', 'rejected')->count(),
            'pendingVerification' => $logs->where('selfie_status', 'pending')->count(),
        ];

        return Inertia::render('dosen/sessions/show', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'meeting_number' => $session->meeting_number,
                'course' => $session->course?->nama ?? '-',
                'course_id' => $session->course_id,
                'start_at' => $session->start_at?->format('d M Y H:i'),
                'end_at' => $session->end_at?->format('H:i'),
                'is_active' => $session->is_active,
                'qr_token' => $session->qr_token,
            ],
            'logs' => $logs,
            'stats' => $stats,
        ]);
    }

    public function store(
        Request $request,
        MeetingQuickFillService $meetingQuickFillService,
        AttendanceSessionAutomationService $automationService,
    ): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        $validated = $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'meeting_number' => 'required|integer|min:1',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'broadcast_notification' => 'nullable|boolean',
        ]);

        // Check if dosen teaches this course
        $course = MataKuliah::with('meetingPlans')->find($validated['course_id']);
        if (!$course || $course->dosen_id !== $dosen->id) {
            abort(403, 'Anda tidak memiliki akses ke mata kuliah ini.');
        }

        $meetingNumber = $validated['meeting_number'];
        $isDuplicate = AttendanceSession::where('course_id', $validated['course_id'])
            ->where('meeting_number', $meetingNumber)
            ->exists();

        if ($isDuplicate) {
            return back()->withErrors([
                'meeting_number' => "Pertemuan {$meetingNumber} sudah ada untuk mata kuliah ini.",
            ])->withInput();
        }

        $message = 'Sesi berhasil dibuat.';

        $offlineValidationMessage = $meetingQuickFillService->validateOfflineMeetingSelection(
            $course,
            $meetingNumber,
        );
        if ($offlineValidationMessage) {
            return back()->withErrors([
                'meeting_number' => $offlineValidationMessage,
            ])->withInput();
        }

        $resolvedContent = $meetingQuickFillService->resolveSessionContent(
            $course,
            $meetingNumber,
            $validated['title'] ?? null,
            $validated['description'] ?? null,
        );

        $session = AttendanceSession::create([
            'course_id' => $validated['course_id'],
            'meeting_number' => $meetingNumber,
            'title' => $resolvedContent['title'],
            'description' => $resolvedContent['description'],
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'qr_token' => Str::random(32),
            'metode' => $resolvedContent['template']['mode'] ?? 'offline',
            'is_active' => false,
            'created_by_dosen_id' => $dosen->id,
        ]);

        $automationService->syncActiveStates();

        if ($request->boolean('broadcast_notification')) {
            $notificationService = app(SmartNotificationService::class);
            $enrollmentsQuery = MahasiswaCourse::query();
            if (Schema::hasColumn('mahasiswa_courses', 'course_id')) {
                $enrollmentsQuery->where('course_id', $session->course_id);
            } else {
                $enrollmentsQuery->where('name', $course->nama);
            }
            $enrollments = $enrollmentsQuery->with('mahasiswa')->get();
                
            foreach ($enrollments as $enrollment) {
                if ($enrollment->mahasiswa && $enrollment->mahasiswa->fcm_token) {
                    $log = NotificationLog::create([
                        'recipient_type' => get_class($enrollment->mahasiswa),
                        'recipient_id' => $enrollment->mahasiswa->id,
                        'type' => 'push',
                        'subject' => "Absen Dibuka: {$course->nama}",
                        'body' => "Sesi absensi untuk pertemuan {$session->meeting_number} telah dibuka oleh Dosen pengampu. Buka aplikasi dan segera check-in kehadiran Anda sekarang!",
                        'target_type' => 'specific_users',
                        'status' => 'pending'
                    ]);
                    
                    try {
                        $notificationService->sendPush($log);
                        $log->update(['status' => 'sent', 'sent_at' => now()]);
                    } catch (\Exception $e) {
                         $log->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                    }
                }
            }
            $message .= ' Serta notifikasi telah disiarkan ke mahasiswa.';
        }

        return redirect()->route('dosen.sesi-absen')->with('success', $message);
    }

    public function activate(AttendanceSession $session): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        $course = MataKuliah::find($session->course_id);
        if (!$course || $course->dosen_id !== $dosen->id) {
            abort(403);
        }

        // Safety check: Only offline sessions can be activated
        $isOnlineByTitle = stripos($session->title ?? '', 'Online') !== false;
        if ($session->metode !== 'offline' || $isOnlineByTitle) {
            return back()->with('error', 'Sesi online tidak dapat diaktifkan untuk pemindaian QR.');
        }

        $session->update(['is_active' => true]);
        return back()->with('success', 'Sesi diaktifkan.');
    }

    public function close(AttendanceSession $session): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        $course = MataKuliah::find($session->course_id);
        if (!$course || $course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $payload = ['is_active' => false];
        if ($session->end_at && $session->end_at->isFuture()) {
            $payload['end_at'] = now();
        }

        $session->update($payload);
        return back()->with('success', 'Sesi ditutup.');
    }

    public function regenerateQr(AttendanceSession $session): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        $course = MataKuliah::find($session->course_id);
        if (!$course || $course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $session->update(['qr_token' => Str::random(32)]);
        return back()->with('success', 'QR Code diperbarui.');
    }
}
