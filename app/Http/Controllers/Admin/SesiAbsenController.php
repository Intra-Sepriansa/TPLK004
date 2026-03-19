<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\AttendanceToken;
use App\Models\MataKuliah;
use App\Models\Mahasiswa;
use App\Models\SelfieVerification;
use App\Models\MahasiswaCourse;
use App\Models\NotificationLog;
use App\Services\AttendanceSessionAutomationService;
use App\Services\MeetingQuickFillService;
use App\Services\SmartNotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SesiAbsenController extends Controller
{
    public function index(Request $request, AttendanceSessionAutomationService $automationService): Response
    {
        $automationService->syncActiveStates();

        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all');
        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 10);

        // Build query
        $query = AttendanceSession::with(['course.dosen'])
            ->withCount(['logs', 'tokens']);
        $query->where(function ($q) {
            $q->where('metode', 'offline')
                ->orWhereNull('metode');
        })->whereRaw('LOWER(title) NOT LIKE ?', ['%online%']);
        $query->whereNotExists(function ($q) {
            $q->select(DB::raw(1))
                ->from('pertemuan as p')
                ->whereColumn('p.mata_kuliah_id', 'attendance_sessions.course_id')
                ->whereColumn('p.pertemuan_ke', 'attendance_sessions.meeting_number')
                ->where('p.mode', 'online');
        });

        if ($courseId !== 'all') {
            $query->where('course_id', $courseId);
        }

        if ($status === 'active') {
            $query->where('is_active', true)
                  ->where('metode', 'offline')
                  ->whereRaw('LOWER(title) NOT LIKE ?', ['%online%']);
        } elseif ($status === 'completed') {
            $query->where('is_active', false)->where('end_at', '<', now());
        } elseif ($status === 'scheduled') {
            $query->where('is_active', false)->where('start_at', '>', now());
        } elseif ($status === 'ongoing') {
            $query->where('start_at', '<=', now())->where('end_at', '>=', now());
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('course', fn($c) => $c->where('nama', 'like', "%{$search}%"));
            });
        }

        $sessions = $query->orderBy('start_at', 'desc')->paginate($perPage)->withQueryString();

        // Transform sessions with additional data
        $sessions->through(function ($session) {
            $presentCount = AttendanceLog::where('attendance_session_id', $session->id)
                ->where('status', 'present')->count();
            $lateCount = AttendanceLog::where('attendance_session_id', $session->id)
                ->where('status', 'late')->count();
            $rejectedCount = AttendanceLog::where('attendance_session_id', $session->id)
                ->where('status', 'rejected')->count();

            return [
                'id' => $session->id,
                'course_id' => $session->course_id,
                'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
                'dosen_name' => $session->course?->dosen?->nama ?? '-',
                'meeting_number' => $session->meeting_number,
                'title' => $session->title,
                'start_at' => $session->start_at?->format('Y-m-d H:i'),
                'end_at' => $session->end_at?->format('Y-m-d H:i'),
                'is_active' => $session->is_active,
                'logs_count' => $session->logs_count,
                'tokens_count' => $session->tokens_count,
                'present_count' => $presentCount,
                'late_count' => $lateCount,
                'rejected_count' => $rejectedCount,
                'status' => $this->getSessionStatus($session),
                'duration_minutes' => $session->start_at && $session->end_at
                    ? $session->start_at->diffInMinutes($session->end_at)
                    : 0,
            ];
        });

        // Get courses for filter
        $courses = MataKuliah::with('dosen')->orderBy('nama')->get()->map(fn($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
            'sks' => $c->sks,
            'dosen' => $c->dosen?->nama ?? '-',
        ]);

        // Statistics
        $stats = $this->getStats();

        // Active session detail
        $activeSession = AttendanceSession::with(['course.dosen'])
            ->where('is_active', true)
            ->where('metode', 'offline')
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%online%'])
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('pertemuan as p')
                    ->whereColumn('p.mata_kuliah_id', 'attendance_sessions.course_id')
                    ->whereColumn('p.pertemuan_ke', 'attendance_sessions.meeting_number')
                    ->where('p.mode', 'online');
            })
            ->first();

        $activeSessionDetail = null;
        if ($activeSession) {
            $activeSessionDetail = $this->getSessionDetail($activeSession);
        }

        // Today's sessions
        $todaySessions = AttendanceSession::with(['course'])
            ->whereDate('start_at', today())
            ->where(function ($q) {
                $q->where('metode', 'offline')
                    ->orWhereNull('metode');
            })
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%online%'])
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('pertemuan as p')
                    ->whereColumn('p.mata_kuliah_id', 'attendance_sessions.course_id')
                    ->whereColumn('p.pertemuan_ke', 'attendance_sessions.meeting_number')
                    ->where('p.mode', 'online');
            })
            ->orderBy('start_at')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'course' => $s->course?->nama ?? '-',
                'meeting' => $s->meeting_number,
                'time' => $s->start_at?->format('H:i') . ' - ' . $s->end_at?->format('H:i'),
                'is_active' => $s->is_active,
                'status' => $this->getSessionStatus($s),
            ]);

        // Hourly distribution for today
        $hourlyDistribution = $this->getHourlyDistribution();

        // Weekly trend
        $weeklyTrend = $this->getWeeklyTrend();

        // Course performance
        $coursePerformance = $this->getCoursePerformance();

        return Inertia::render('admin/sesi-absen', [
            'sessions' => $sessions,
            'courses' => $courses,
            'stats' => $stats,
            'activeSessionDetail' => $activeSessionDetail,
            'todaySessions' => $todaySessions,
            'hourlyDistribution' => $hourlyDistribution,
            'weeklyTrend' => $weeklyTrend,
            'coursePerformance' => $coursePerformance,
            'filters' => [
                'course_id' => $courseId,
                'status' => $status,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(AttendanceSession $session): Response
    {
        $session->load(['course.dosen', 'logs.mahasiswa', 'logs.selfieVerification', 'tokens']);

        $detail = $this->getSessionDetail($session);

        // Attendance list
        $attendanceList = $session->logs->map(fn($log) => [
            'id' => $log->id,
            'mahasiswa_id' => $log->mahasiswa_id,
            'nama' => $log->mahasiswa?->nama ?? 'Unknown',
            'nim' => $log->mahasiswa?->nim ?? '-',
            'status' => $log->status,
            'scanned_at' => $log->scanned_at?->format('H:i:s'),
            'distance_m' => $log->distance_m,
            'selfie_status' => $log->selfieVerification?->status,
            'device_info' => $log->device_os . ' ' . $log->device_model,
        ]);

        // Token history
        $tokenHistory = $session->tokens->map(fn($t) => [
            'id' => $t->id,
            'token' => $t->token,
            'created_at' => $t->created_at?->format('H:i:s'),
            'expires_at' => $t->expires_at?->format('H:i:s'),
            'is_expired' => $t->expires_at ? $t->expires_at->isPast() : true,
        ]);

        // Timeline
        $timeline = $this->getSessionTimeline($session);

        return Inertia::render('admin/sesi-absen-detail', [
            'session' => $detail,
            'attendanceList' => $attendanceList,
            'tokenHistory' => $tokenHistory,
            'timeline' => $timeline,
        ]);
    }
    public function create(MeetingQuickFillService $meetingQuickFillService): Response
    {
        $scheduledMeetingsByCourse = AttendanceSession::query()
            ->select('course_id', 'meeting_number')
            ->get()
            ->groupBy('course_id')
            ->map(fn ($sessions) => $sessions
                ->pluck('meeting_number')
                ->map(fn ($meetingNumber) => (int) $meetingNumber)
                ->values()
                ->all());

        $courses = MataKuliah::with(['dosen', 'meetingPlans'])
            ->orderBy('nama')
            ->get()
            ->map(function ($course) use ($meetingQuickFillService, $scheduledMeetingsByCourse) {
                return [
                    'id' => $course->id,
                    'nama' => $course->nama,
                    'sks' => $course->sks,
                    'dosen' => $course->dosen?->nama ?? '-',
                    'scheduled_meetings' => $scheduledMeetingsByCourse->get($course->id, []),
                    ...$meetingQuickFillService->buildCoursePayload($course),
                ];
            });

        return Inertia::render('admin/sesi-absen/create', [
            'courses' => $courses,
        ]);
    }

    public function edit(AttendanceSession $session): Response
    {
        $session->load(['course.dosen']);

        $courses = MataKuliah::with('dosen')->orderBy('nama')->get()->map(fn($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
            'sks' => $c->sks,
            'dosen' => $c->dosen?->nama ?? '-',
        ]);

        return Inertia::render('admin/sesi-absen/edit', [
            'session' => [
                'id' => $session->id,
                'course_id' => $session->course_id,
                'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
                'dosen_name' => $session->course?->dosen?->nama ?? '-',
                'meeting_number' => $session->meeting_number,
                'title' => $session->title,
                'start_at' => $session->start_at?->format('Y-m-d\TH:i'),
                'end_at' => $session->end_at?->format('Y-m-d\TH:i'),
                'is_active' => $session->is_active,
                'status' => $this->getSessionStatus($session),
                'logs_count' => $session->logs()->count(),
                'created_at' => $session->created_at?->toIso8601String(),
                'updated_at' => $session->updated_at?->toIso8601String(),
                'can_edit_meeting' => $session->logs()->count() === 0,
                'can_edit_time' => !$session->is_active,
            ],
            'courses' => $courses,
        ]);
    }
    public function store(
        Request $request,
        MeetingQuickFillService $meetingQuickFillService,
        AttendanceSessionAutomationService $automationService,
    ): RedirectResponse
    {
        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'meeting_number' => [
                'required',
                'integer',
                'min:1',
                'max:21',
                \Illuminate\Validation\Rule::unique('attendance_sessions')->where('course_id', $request->course_id)
            ],
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'broadcast_notification' => 'boolean',
            'notification_title' => 'nullable|string|max:255',
            'notification_message' => 'nullable|string',
        ], [
            'meeting_number.unique' => 'Pertemuan ke-' . $request->meeting_number . ' untuk mata kuliah ini sudah ada.'
        ]);

        $course = MataKuliah::with('meetingPlans')->findOrFail($request->integer('course_id'));
        $offlineValidationMessage = $meetingQuickFillService->validateOfflineMeetingSelection(
            $course,
            $request->integer('meeting_number'),
        );

        if ($offlineValidationMessage) {
            return back()->withErrors([
                'meeting_number' => $offlineValidationMessage,
            ])->withInput();
        }

        $resolvedContent = $meetingQuickFillService->resolveSessionContent(
            $course,
            $request->integer('meeting_number'),
            $request->string('title')->toString(),
            $request->string('description')->toString(),
        );

        $session =        AttendanceSession::create([
            'course_id' => $request->course_id,
            'meeting_number' => $request->meeting_number,
            'title' => $resolvedContent['title'],
            'description' => $resolvedContent['description'],
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'metode' => $resolvedContent['template']['mode'] ?? 'offline',
            'is_active' => false,
            'created_by' => auth()->id(),
        ]);

        $automationService->syncActiveStates();

        Log::info('Admin Store Session:', [
            'request_broadcast' => $request->boolean('broadcast_notification'),
            'all_data' => $request->all(),
        ]);

        if ($request->boolean('broadcast_notification')) {
            $notificationService = app(SmartNotificationService::class);
            $enrollmentsQuery = MahasiswaCourse::query();
            if (Schema::hasColumn('mahasiswa_courses', 'course_id')) {
                $enrollmentsQuery->where('course_id', $session->course_id);
            } else {
                $enrollmentsQuery->where('name', $course->nama);
            }
            $enrollments = $enrollmentsQuery->with('mahasiswa')->get();
            
            $title = $request->input('notification_title') ?: "Sesi Absen: {$course->nama}";
            $body = $request->input('notification_message') ?: "Sesi absensi untuk pertemuan {$session->meeting_number} telah dibuat. Pastikan Anda siap untuk check-in!";
            Log::info("Found enrollments: " . $enrollments->count() . " ready to broadcast");
                
            foreach ($enrollments as $enrollment) {
                if ($enrollment->mahasiswa && $enrollment->mahasiswa->fcm_token) {
                    $log = NotificationLog::create([
                        'recipient_type' => get_class($enrollment->mahasiswa),
                        'recipient_id' => $enrollment->mahasiswa->id,
                        'type' => 'push',
                        'subject' => $title,
                        'body' => $body,
                        'target_type' => 'specific_users',
                        'status' => 'pending'
                    ]);
                    
                    try {
                        $notificationService->sendPush($log);
                        $log->update(['status' => 'sent', 'sent_at' => now()]);
                        Log::info("Admin broadcast push sent to: " . $enrollment->mahasiswa->id);
                    } catch (\Exception $e) {
                         $log->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                         Log::error("Admin broadcast push failed.", ['error' => $e->getMessage()]);
                    }
                }
            }
        }

        return redirect()->route('admin.sesi-absen')->with('success', 'Sesi absen berhasil dibuat.');
    }

    public function update(
        Request $request,
        AttendanceSession $session,
        MeetingQuickFillService $meetingQuickFillService,
        AttendanceSessionAutomationService $automationService,
    ): RedirectResponse
    {
        if ((int) $request->input('course_id') !== (int) $session->course_id) {
            return back()->withErrors([
                'course_id' => 'Mata kuliah tidak dapat diubah setelah sesi dibuat.',
            ]);
        }

        if ($session->logs()->count() > 0 && (int) $request->input('meeting_number') !== (int) $session->meeting_number) {
            return back()->withErrors([
                'meeting_number' => 'Tidak dapat mengubah nomor pertemuan karena sudah ada data kehadiran.',
            ]);
        }

        $submittedStart = (string) $request->input('start_at');
        $submittedEnd = (string) $request->input('end_at');
        $currentStartVariants = array_filter([
            optional($session->start_at)->format('Y-m-d\TH:i'),
            optional($session->start_at)->format('Y-m-d H:i:s'),
            optional($session->start_at)->format('Y-m-d H:i'),
        ]);
        $currentEndVariants = array_filter([
            optional($session->end_at)->format('Y-m-d\TH:i'),
            optional($session->end_at)->format('Y-m-d H:i:s'),
            optional($session->end_at)->format('Y-m-d H:i'),
        ]);

        $startChanged = !in_array($submittedStart, $currentStartVariants, true);
        $endChanged = !in_array($submittedEnd, $currentEndVariants, true);

        if ($session->is_active && ($startChanged || $endChanged)) {
            return back()->withErrors([
                'start_at' => 'Tidak dapat mengubah waktu sesi yang sedang aktif.',
                'end_at' => 'Tidak dapat mengubah waktu sesi yang sedang aktif.',
            ]);
        }

        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'meeting_number' => [
                'required',
                'integer',
                'min:1',
                'max:21',
                \Illuminate\Validation\Rule::unique('attendance_sessions')->where('course_id', $request->course_id)->ignore($session->id)
            ],
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ], [
            'meeting_number.unique' => 'Pertemuan ke-' . $request->meeting_number . ' untuk mata kuliah ini sudah ada.'
        ]);

        $course = MataKuliah::with('meetingPlans')->findOrFail($request->integer('course_id'));
        $offlineValidationMessage = $meetingQuickFillService->validateOfflineMeetingSelection(
            $course,
            $request->integer('meeting_number'),
        );

        if ($offlineValidationMessage) {
            return back()->withErrors([
                'meeting_number' => $offlineValidationMessage,
            ])->withInput();
        }

        $resolvedContent = $meetingQuickFillService->resolveSessionContent(
            $course,
            $request->integer('meeting_number'),
            $request->string('title')->toString(),
            $request->string('description')->toString(),
        );

        $session->update([
            'course_id' => $request->course_id,
            'meeting_number' => $request->meeting_number,
            'title' => $resolvedContent['title'],
            'description' => $resolvedContent['description'],
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'metode' => $resolvedContent['template']['mode'] ?? $session->metode ?? 'offline',
            'is_active' => ($resolvedContent['template']['mode'] ?? $session->metode ?? 'offline') === 'offline'
                && stripos($resolvedContent['title'] ?? '', 'online') === false,
        ]);

        $automationService->syncActiveStates();

        return back()->with('success', 'Sesi absen berhasil diperbarui.');
    }

    public function destroy(AttendanceSession $session): RedirectResponse
    {
        // Cascade delete: hapus semua data kehadiran terkait sesi ini
        $session->logs()->delete();

        $session->delete();
        return back()->with('success', 'Sesi absen dan data kehadiran berhasil dihapus.');
    }

    public function activate(AttendanceSession $session): RedirectResponse
    {
        // Safety check: Only offline sessions can be activated
        $isOnlineByTitle = stripos($session->title ?? '', 'Online') !== false;
        if ($session->metode !== 'offline' || $isOnlineByTitle) {
            return back()->with('error', 'Sesi online tidak dapat diaktifkan untuk pemindaian QR.');
        }

        $session->update(['is_active' => true]);

        return back()->with('success', 'Sesi berhasil diaktifkan.');
    }

    public function deactivate(AttendanceSession $session): RedirectResponse
    {
        $payload = ['is_active' => false];
        if ($session->end_at && $session->end_at->isFuture()) {
            $payload['end_at'] = now();
        }

        $session->update($payload);
        return back()->with('success', 'Sesi berhasil dinonaktifkan.');
    }

    public function duplicate(AttendanceSession $session): RedirectResponse
    {
        $nextMeeting = AttendanceSession::where('course_id', $session->course_id)
            ->max('meeting_number') + 1;

        AttendanceSession::create([
            'course_id' => $session->course_id,
            'meeting_number' => $nextMeeting,
            'title' => $session->title,
            'start_at' => now()->addWeek()->setTimeFrom($session->start_at),
            'end_at' => now()->addWeek()->setTimeFrom($session->end_at),
            'is_active' => false,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Sesi berhasil diduplikasi untuk pertemuan berikutnya.');
    }

    public function exportPdf(Request $request)
    {
        $sessionId = $request->get('session_id');

        if ($sessionId) {
            $session = AttendanceSession::with(['course.dosen', 'logs.mahasiswa'])->findOrFail($sessionId);
            $sessions = collect([$session]);
        } else {
            $sessions = AttendanceSession::with(['course.dosen'])
                ->withCount('logs')
                ->whereDate('start_at', '>=', now()->subMonth())
                ->orderBy('start_at', 'desc')
                ->get();
        }

        $data = [
            'sessions' => $sessions,
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
        ];

        $pdf = Pdf::loadView('pdf.sesi-absen', $data);
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('Sesi_Absen_' . now()->format('Y-m-d') . '.pdf');
    }

    private function getSessionStatus(AttendanceSession $session): string
    {
        if ($session->is_active) return 'active';
        if ($session->start_at > now()) return 'scheduled';
        if ($session->end_at < now()) return 'completed';
        return 'ongoing';
    }

    private function getSessionDetail(AttendanceSession $session): array
    {
        $presentCount = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('status', 'present')->count();
        $lateCount = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('status', 'late')->count();
        $rejectedCount = AttendanceLog::where('attendance_session_id', $session->id)
            ->where('status', 'rejected')->count();
        $pendingSelfie = AttendanceLog::where('attendance_session_id', $session->id)
            ->whereHas('selfieVerification', fn($q) => $q->where('status', 'pending'))
            ->count();

        $totalTokens = AttendanceToken::where('attendance_session_id', $session->id)->count();
        $activeTokens = AttendanceToken::where('attendance_session_id', $session->id)
            ->where('expires_at', '>', now())->count();

        return [
            'id' => $session->id,
            'course_id' => $session->course_id,
            'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
            'dosen_name' => $session->course?->dosen?->nama ?? '-',
            'meeting_number' => $session->meeting_number,
            'title' => $session->title,
            'start_at' => $session->start_at?->format('Y-m-d H:i'),
            'end_at' => $session->end_at?->format('Y-m-d H:i'),
            'is_active' => $session->is_active,
            'status' => $this->getSessionStatus($session),
            'total_attendance' => $presentCount + $lateCount,
            'present_count' => $presentCount,
            'late_count' => $lateCount,
            'rejected_count' => $rejectedCount,
            'pending_selfie' => $pendingSelfie,
            'total_tokens' => $totalTokens,
            'active_tokens' => $activeTokens,
            'duration_minutes' => $session->start_at && $session->end_at
                ? $session->start_at->diffInMinutes($session->end_at)
                : 0,
            'time_remaining' => $session->end_at && $session->end_at > now()
                ? now()->diffInMinutes($session->end_at)
                : 0,
        ];
    }

    private function getStats(): array
    {
        $today = today();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        $offlineSessions = AttendanceSession::query()
            ->where(function ($q) {
                $q->where('metode', 'offline')
                    ->orWhereNull('metode');
            })
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%online%'])
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('pertemuan as p')
                    ->whereColumn('p.mata_kuliah_id', 'attendance_sessions.course_id')
                    ->whereColumn('p.pertemuan_ke', 'attendance_sessions.meeting_number')
                    ->where('p.mode', 'online');
            });

        return [
            'total_sessions' => (clone $offlineSessions)->count(),
            'active_sessions' => (clone $offlineSessions)->where('is_active', true)->count(),
            'today_sessions' => (clone $offlineSessions)->whereDate('start_at', $today)->count(),
            'today_attendance' => AttendanceLog::whereDate('scanned_at', $today)->count(),
            'week_sessions' => (clone $offlineSessions)->where('start_at', '>=', $thisWeek)->count(),
            'week_attendance' => AttendanceLog::where('scanned_at', '>=', $thisWeek)->count(),
            'month_sessions' => (clone $offlineSessions)->where('start_at', '>=', $thisMonth)->count(),
            'month_attendance' => AttendanceLog::where('scanned_at', '>=', $thisMonth)->count(),
            'avg_attendance_per_session' => round(
                (clone $offlineSessions)->where('start_at', '>=', $thisMonth)->count() > 0
                    ? AttendanceLog::where('scanned_at', '>=', $thisMonth)->count() /
                      (clone $offlineSessions)->where('start_at', '>=', $thisMonth)->count()
                    : 0,
                1
            ),
            'completion_rate' => (clone $offlineSessions)->count() > 0
                ? round(
                    (clone $offlineSessions)->where('end_at', '<', now())->count() /
                    (clone $offlineSessions)->count() * 100,
                    1
                )
                : 0,
        ];
    }

    private function getHourlyDistribution(): array
    {
        $hourlyData = AttendanceLog::whereDate('scanned_at', today())
            ->selectRaw('HOUR(scanned_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('total', 'hour')
            ->toArray();

        $result = [];
        for ($i = 6; $i <= 22; $i++) {
            $result[] = [
                'hour' => sprintf('%02d:00', $i),
                'count' => $hourlyData[$i] ?? 0,
            ];
        }

        return $result;
    }

    private function getWeeklyTrend(): array
    {
        $result = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $sessions = AttendanceSession::whereDate('start_at', $date)->count();
            $attendance = AttendanceLog::whereDate('scanned_at', $date)->count();

            $result[] = [
                'date' => $date->format('d M'),
                'day' => $date->translatedFormat('D'),
                'sessions' => $sessions,
                'attendance' => $attendance,
            ];
        }

        return $result;
    }

    private function getCoursePerformance(): array
    {
        return MataKuliah::withCount([
            'sessions as total_sessions',
            'sessions as completed_sessions' => fn($q) => $q->where('end_at', '<', now()),
        ])
        ->having('total_sessions', '>', 0)
        ->orderByDesc('total_sessions')
        ->take(10)
        ->get()
        ->map(function ($c) {
            $totalAttendance = AttendanceLog::whereHas('session', fn($q) => $q->where('course_id', $c->id))->count();
            return [
                'id' => $c->id,
                'name' => $c->nama,
                'total_sessions' => $c->total_sessions,
                'completed_sessions' => $c->completed_sessions,
                'avg_attendance' => $c->total_sessions > 0
                    ? round($totalAttendance / $c->total_sessions, 1)
                    : 0,
            ];
        })
        ->toArray();
    }

    private function getSessionTimeline(AttendanceSession $session): array
    {
        $timeline = [];

        // Session created
        $timeline[] = [
            'type' => 'created',
            'time' => $session->created_at?->format('H:i:s'),
            'description' => 'Sesi dibuat',
        ];

        // First token generated
        $firstToken = $session->tokens()->orderBy('created_at')->first();
        if ($firstToken) {
            $timeline[] = [
                'type' => 'token',
                'time' => $firstToken->created_at?->format('H:i:s'),
                'description' => 'Token pertama digenerate',
            ];
        }

        // First attendance
        $firstLog = $session->logs()->orderBy('scanned_at')->first();
        if ($firstLog) {
            $timeline[] = [
                'type' => 'attendance',
                'time' => $firstLog->scanned_at?->format('H:i:s'),
                'description' => 'Kehadiran pertama: ' . ($firstLog->mahasiswa?->nama ?? 'Unknown'),
            ];
        }

        // Last attendance
        $lastLog = $session->logs()->orderBy('scanned_at', 'desc')->first();
        if ($lastLog && $lastLog->id !== $firstLog?->id) {
            $timeline[] = [
                'type' => 'attendance',
                'time' => $lastLog->scanned_at?->format('H:i:s'),
                'description' => 'Kehadiran terakhir: ' . ($lastLog->mahasiswa?->nama ?? 'Unknown'),
            ];
        }

        // Session ended
        if ($session->end_at && $session->end_at < now()) {
            $timeline[] = [
                'type' => 'ended',
                'time' => $session->end_at?->format('H:i:s'),
                'description' => 'Sesi berakhir',
            ];
        }

        return $timeline;
    }
}
