<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendancePermit;
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
        $status = $request->get('status', 'pending');
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
        $query = AttendancePermit::with(['mahasiswa', 'session.course'])
            ->whereIn('attendance_session_id', $sessionIds)
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($sessionId) {
            $query->where('attendance_session_id', $sessionId);
        }

        $permits = $query->get()->map(fn($p) => [
            'id' => $p->id,
            'mahasiswa' => [
                'id' => $p->mahasiswa->id,
                'nama' => $p->mahasiswa->nama,
                'nim' => $p->mahasiswa->nim,
            ],
            'type' => $p->type,
            'reason' => $p->reason,
            'attachment' => $p->attachment ? Storage::url($p->attachment) : null,
            'status' => $p->status,
            'rejection_reason' => $p->rejection_reason,
            'session' => [
                'id' => $p->session->id,
                'mata_kuliah' => $p->session->course?->nama ?? '-',
                'tanggal' => $p->session->start_at->format('Y-m-d'),
                'tanggal_display' => $p->session->start_at->translatedFormat('l, d F Y'),
            ],
            'created_at' => $p->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
        ]);

        // Stats
        $stats = [
            'total' => AttendancePermit::whereIn('attendance_session_id', $sessionIds)->count(),
            'pending' => AttendancePermit::whereIn('attendance_session_id', $sessionIds)->where('status', 'pending')->count(),
            'approved' => AttendancePermit::whereIn('attendance_session_id', $sessionIds)->where('status', 'approved')->count(),
            'rejected' => AttendancePermit::whereIn('attendance_session_id', $sessionIds)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('dosen/permits', [
            'permits' => $permits,
            'sessions' => $mySessions,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'session_id' => $sessionId,
            ],
        ]);
    }

    public function approve(Request $request, AttendancePermit $permit): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        // Verify this permit belongs to dosen's course
        $session = $permit->session;
        if ($session->course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $permit->update([
            'status' => 'approved',
            'approved_by' => $dosen->id,
            'approved_at' => now(),
        ]);

        // Recalculate student activity score
        StudentActivityScore::recalculate($permit->mahasiswa_id, $session->course_id);

        return back()->with('success', 'Izin berhasil disetujui.');
    }

    public function reject(Request $request, AttendancePermit $permit): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        // Verify this permit belongs to dosen's course
        $session = $permit->session;
        if ($session->course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $permit->update([
            'status' => 'rejected',
            'approved_by' => $dosen->id,
            'approved_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

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
            if ($permit->session->course->dosen_id !== $dosen->id) {
                continue;
            }

            $permit->update([
                'status' => 'approved',
                'approved_by' => $dosen->id,
                'approved_at' => now(),
            ]);

            StudentActivityScore::recalculate($permit->mahasiswa_id, $permit->session->course_id);
            $approved++;
        }

        return back()->with('success', "{$approved} izin berhasil disetujui.");
    }
}
