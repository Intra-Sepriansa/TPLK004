<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendancePermit;
use App\Models\AttendanceSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PermitController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $mahasiswa = auth('mahasiswa')->user();
        $status = $request->get('status', 'all');

        // Get available sessions (active or recent)
        $availableSessions = AttendanceSession::with('course')
            ->where('is_active', true)
            ->orWhere('start_at', '>=', now()->subDays(7))
            ->orderBy('start_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'mata_kuliah' => $s->course?->nama ?? '-',
                'tanggal' => $s->start_at->format('Y-m-d'),
                'tanggal_display' => $s->start_at->translatedFormat('l, d F Y'),
                'waktu' => $s->start_at->format('H:i') . ' - ' . ($s->end_at ? $s->end_at->format('H:i') : 'Selesai'),
            ]);

        // Get my permits
        $query = AttendancePermit::with(['session.course', 'approver'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $permits = $query->get()->map(fn($p) => [
            'id' => $p->id,
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
            'approver' => $p->approver?->nama,
            'approved_at' => $p->approved_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'created_at' => $p->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
        ]);

        // Stats
        $stats = [
            'total' => AttendancePermit::where('mahasiswa_id', $mahasiswa->id)->count(),
            'pending' => AttendancePermit::where('mahasiswa_id', $mahasiswa->id)->where('status', 'pending')->count(),
            'approved' => AttendancePermit::where('mahasiswa_id', $mahasiswa->id)->where('status', 'approved')->count(),
            'rejected' => AttendancePermit::where('mahasiswa_id', $mahasiswa->id)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('user/permit', [
            'permits' => $permits,
            'availableSessions' => $availableSessions,
            'stats' => $stats,
            'filters' => ['status' => $status],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        $request->validate([
            'attendance_session_id' => 'required|exists:attendance_sessions,id',
            'type' => 'required|in:izin,sakit',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
        ]);

        // Check if already submitted for this session
        $exists = AttendancePermit::where('mahasiswa_id', $mahasiswa->id)
            ->where('attendance_session_id', $request->attendance_session_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['attendance_session_id' => 'Anda sudah mengajukan izin untuk sesi ini.']);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('permits', 'public');
        }

        AttendancePermit::create([
            'mahasiswa_id' => $mahasiswa->id,
            'attendance_session_id' => $request->attendance_session_id,
            'type' => $request->type,
            'reason' => $request->reason,
            'attachment' => $attachmentPath,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Pengajuan izin berhasil dikirim. Menunggu persetujuan dosen.');
    }

    public function destroy(AttendancePermit $permit): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        if ($permit->mahasiswa_id !== $mahasiswa->id) {
            abort(403);
        }

        if ($permit->status !== 'pending') {
            return back()->withErrors(['error' => 'Hanya pengajuan dengan status pending yang dapat dibatalkan.']);
        }

        // Delete attachment if exists
        if ($permit->attachment) {
            Storage::disk('public')->delete($permit->attachment);
        }

        $permit->delete();

        return back()->with('success', 'Pengajuan izin berhasil dibatalkan.');
    }
}
