<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendancePermit;
use App\Models\AttendancePermitComment;
use App\Models\AttendanceSession;
use App\Models\StudentActivityScore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PermitController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $dosen = auth('dosen')->user();
        $status = $request->get('status', 'all'); // Default all to show board
        $sessionId = $request->get('session_id');

        // Get sessions for this dosen's courses
        $mySessions = AttendanceSession::with('course')
            ->whereHas('course', fn($q) => $q->where('dosen_id', $dosen->id))
            ->orderBy('start_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'mata_kuliah' => $s->course?->nama ?? '-',
                'tanggal' => $s->start_at->format('Y-m-d'),
                'tanggal_display' => $s->start_at->translatedFormat('l, d F Y'),
            ]);

        $sessionIds = $mySessions->pluck('id');

        // Get permits for my sessions
        $query = AttendancePermit::with([
            'mahasiswa',
            'session.course',
            'comments' => fn($q) => $q->orderBy('created_at', 'desc'),
        ])
            ->withCount('comments')
            ->whereIn('attendance_session_id', $sessionIds)
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($sessionId) {
            $query->where('attendance_session_id', $sessionId);
        }

        $allPermits = $query->get();

        $permits = $allPermits->map(function ($p) {
            // Mock AI Analysis
            $confidence = rand(75, 99);
            $docScore = rand(70, 98);
            $isUrgent = $p->type === 'sakit' || rand(0, 10) > 8;
            
            // AI Recommendation logic
            $recommendation = 'review';
            if ($confidence > 85 && $docScore > 80) $recommendation = 'approve';
            if ($confidence < 60 || $docScore < 60) $recommendation = 'reject';
            if ($p->status !== 'pending') $recommendation = $p->status; // Match status if already decided

            return [
                'id' => $p->id,
                'mahasiswa' => [
                    'id' => $p->mahasiswa->id,
                    'nama' => $p->mahasiswa->nama,
                    'nim' => $p->mahasiswa->nim,
                    'avatar' => $p->mahasiswa->avatar_url ?? 'https://ui-avatars.com/api/?name='.urlencode($p->mahasiswa->nama),
                ],
                'type' => $p->type,
                'reason' => $p->reason,
                'attachment' => $p->attachment ? Storage::url($p->attachment) : null,
                'attachments' => $p->attachment ? [['id' => 1, 'url' => Storage::url($p->attachment), 'name' => 'Dokumen Pendukung']] : [], // Mock multiple attachments structure
                'status' => $p->status,
                'rejection_reason' => $p->rejection_reason,
                'session' => [
                    'id' => $p->session->id,
                    'mata_kuliah' => $p->session->course?->nama ?? '-',
                    'tanggal' => $p->session->start_at->format('Y-m-d'),
                    'tanggal_display' => $p->session->start_at->translatedFormat('l, d F Y'),
                ],
                'created_at' => $p->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'start_date' => $p->session->start_at->format('Y-m-d'),
                'end_date' => $p->session->start_at->format('Y-m-d'), // Assuming 1 day for now
                'duration' => 1,
                'is_urgent' => $isUrgent,
                'ai_confidence' => $confidence,
                'ai_recommendation' => $recommendation,
                'document_score' => $docScore,
                'reviewed_at' => $p->reviewed_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'comments_count' => $p->comments_count,
                'latest_comment' => $p->comments->first()
                    ? [
                        'sender_type' => $p->comments->first()->sender_type,
                        'sender_name' => $p->comments->first()->sender_name,
                        'message' => $p->comments->first()->message,
                        'created_at' => $p->comments->first()->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                    ]
                    : null,
            ];
        });

        // Advanced Stats for 10 Cards
        $total = $allPermits->count();
        $stats = [
            'total' => $total,
            'pending' => $allPermits->where('status', 'pending')->count(),
            'approved_today' => $allPermits->where('status', 'approved')->where('approved_at', '>=', now()->startOfDay())->count(),
            'rejected' => $allPermits->where('status', 'rejected')->count(),
            'auto_approved' => $allPermits->where('status', 'approved')->count() > 0 ? rand(0, $allPermits->where('status', 'approved')->count()) : 0, // Mock
            'sick_leave' => $allPermits->where('type', 'sakit')->count(),
            'family_emergency' => $allPermits->where('type', 'izin')->filter(fn($p) => str_contains(strtolower($p->reason), 'keluarga'))->count(),
            'official_event' => $allPermits->where('type', 'izin')->filter(fn($p) => str_contains(strtolower($p->reason), 'lomba') || str_contains(strtolower($p->reason), 'seminar'))->count(),
            'suspicious' => $permits->where('ai_confidence', '<', 60)->count(),
            'avg_response_time' => 4.2, // Mock hours
        ];

        return Inertia::render('dosen/permit', [
            'permits' => $permits,
            'sessions' => $mySessions,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'session_id' => $sessionId,
            ],
        ]);
    }

    public function show(AttendancePermit $permit): InertiaResponse
    {
        $dosen = auth('dosen')->user();

        // Verify this permit belongs to dosen's course
        $permit->load(['mahasiswa', 'session.course']);
        if ($permit->session?->course?->dosen_id !== $dosen->id) {
            abort(403);
        }

        if (! $permit->reviewed_at) {
            $permit->update(['reviewed_at' => now()]);
            $permit->refresh();
        }

        $permit->load(['comments' => fn($q) => $q->orderBy('created_at', 'asc')]);

        // Mock AI Analysis (same as index)
        $confidence = rand(75, 99);
        $docScore = rand(70, 98);
        $isUrgent = $permit->type === 'sakit' || rand(0, 10) > 8;

        $recommendation = 'review';
        if ($confidence > 85 && $docScore > 80) $recommendation = 'approve';
        if ($confidence < 60 || $docScore < 60) $recommendation = 'reject';
        if ($permit->status !== 'pending') $recommendation = $permit->status;

        $permitData = [
            'id' => $permit->id,
            'mahasiswa' => [
                'id' => $permit->mahasiswa->id,
                'nama' => $permit->mahasiswa->nama,
                'nim' => $permit->mahasiswa->nim,
                'avatar' => $permit->mahasiswa->avatar_url ?? 'https://ui-avatars.com/api/?name='.urlencode($permit->mahasiswa->nama),
                'email' => $permit->mahasiswa->email ?? null,
                'phone' => $permit->mahasiswa->phone ?? null,
            ],
            'type' => $permit->type,
            'reason' => $permit->reason,
            'attachment' => $permit->attachment ? Storage::url($permit->attachment) : null,
            'attachments' => $permit->attachment ? [['id' => 1, 'url' => Storage::url($permit->attachment), 'name' => 'Dokumen Pendukung']] : [],
            'status' => $permit->status,
            'rejection_reason' => $permit->rejection_reason,
            'session' => [
                'id' => $permit->session->id,
                'mata_kuliah' => $permit->session->course?->nama ?? '-',
                'tanggal' => $permit->session->start_at->format('Y-m-d'),
                'tanggal_display' => $permit->session->start_at->translatedFormat('l, d F Y'),
            ],
            'created_at' => $permit->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'start_date' => $permit->session->start_at->format('Y-m-d'),
            'end_date' => $permit->session->start_at->format('Y-m-d'),
            'duration' => 1,
            'is_urgent' => $isUrgent,
            'ai_confidence' => $confidence,
            'ai_recommendation' => $recommendation,
            'document_score' => $docScore,
            'approved_at' => $permit->approved_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'reviewed_at' => $permit->reviewed_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'comments' => $permit->comments->map(fn(AttendancePermitComment $comment) => [
                'id' => $comment->id,
                'sender_type' => $comment->sender_type,
                'sender_name' => $comment->sender_name,
                'message' => $comment->message,
                'created_at' => $comment->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'is_mine' => $comment->sender_type === 'dosen' && $comment->sender_id === $dosen->id,
            ])->values(),
        ];

        return Inertia::render('dosen/permit-detail', [
            'permit' => $permitData,
        ]);
    }

    public function approve(Request $request, AttendancePermit $permit): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        // Verify this permit belongs to dosen's course
        $session = $permit->session;
        if ($session?->course?->dosen_id !== $dosen->id) {
            abort(403);
        }

        $validated = $request->validate([
            'comment' => 'nullable|string|max:1000',
        ]);

        $permit->update([
            'status' => 'approved',
            'approved_by' => $dosen->id,
            'approved_at' => now(),
            'reviewed_at' => $permit->reviewed_at ?? now(),
        ]);

        if (! empty($validated['comment'])) {
            $permit->comments()->create([
                'sender_type' => 'dosen',
                'sender_id' => $dosen->id,
                'sender_name' => $dosen->nama,
                'message' => $validated['comment'],
            ]);
        }

        // Recalculate student activity score
        StudentActivityScore::recalculate($permit->mahasiswa_id, $session->course_id);

        return back()->with('success', 'Izin berhasil disetujui.');
    }

    public function reject(Request $request, AttendancePermit $permit): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        // Verify this permit belongs to dosen's course
        $session = $permit->session;
        if ($session?->course?->dosen_id !== $dosen->id) {
            abort(403);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
            'comment' => 'nullable|string|max:1000',
        ]);

        $permit->update([
            'status' => 'rejected',
            'approved_by' => $dosen->id,
            'approved_at' => now(),
            'reviewed_at' => $permit->reviewed_at ?? now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        if (! empty($validated['comment'])) {
            $permit->comments()->create([
                'sender_type' => 'dosen',
                'sender_id' => $dosen->id,
                'sender_name' => $dosen->nama,
                'message' => $validated['comment'],
            ]);
        }

        // Recalculate student activity score
        StudentActivityScore::recalculate($permit->mahasiswa_id, $session->course_id);

        return back()->with('success', 'Izin berhasil ditolak.');
    }

    public function bulkApprove(Request $request): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        $request->validate([
            'permit_ids' => 'required|array',
            'permit_ids.*' => 'exists:attendance_permits,id',
        ]);

        $permits = AttendancePermit::with('session.course')
            ->whereIn('id', $request->permit_ids)
            ->where('status', 'pending')
            ->get();

        $approved = 0;
        foreach ($permits as $permit) {
            // Verify ownership
            if ($permit->session?->course?->dosen_id !== $dosen->id) {
                continue;
            }

            $permit->update([
                'status' => 'approved',
                'approved_by' => $dosen->id,
                'approved_at' => now(),
                'reviewed_at' => $permit->reviewed_at ?? now(),
            ]);

            StudentActivityScore::recalculate($permit->mahasiswa_id, $permit->session->course_id);
            $approved++;
        }

        return back()->with('success', "{$approved} izin berhasil disetujui.");
    }

    public function addComment(Request $request, AttendancePermit $permit): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        $session = $permit->session;
        if ($session?->course?->dosen_id !== $dosen->id) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $permit->comments()->create([
            'sender_type' => 'dosen',
            'sender_id' => $dosen->id,
            'sender_name' => $dosen->nama,
            'message' => $validated['message'],
        ]);

        if (! $permit->reviewed_at) {
            $permit->update(['reviewed_at' => now()]);
        }

        return back()->with('success', 'Komentar berhasil dikirim ke mahasiswa.');
    }
}
