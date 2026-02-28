<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendancePermit;
use App\Models\AttendancePermitComment;
use App\Models\AttendanceSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PermitController extends Controller
{
    public function create(): InertiaResponse
    {
        return Inertia::render('user/permit-create', [
            'availableSessions' => $this->getAvailableSessions(),
        ]);
    }

    public function index(Request $request): InertiaResponse
    {
        $mahasiswa = auth('mahasiswa')->user();
        $status = $request->get('status', 'all');
        $tz = 'Asia/Jakarta';

        $availableSessions = $this->getAvailableSessions();

        // Get my permits
        $query = AttendancePermit::with([
            'session.course',
            'approver',
            'comments' => fn($q) => $q->orderBy('created_at', 'asc'),
        ])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $avgApprovalMinutes = AttendancePermit::whereNotNull('approved_at')
            ->get(['created_at', 'approved_at'])
            ->avg(function (AttendancePermit $permit) {
                if (! $permit->created_at || ! $permit->approved_at) {
                    return null;
                }

                return $permit->created_at->diffInMinutes($permit->approved_at);
            });

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
            'approved_at' => $p->approved_at?->timezone($tz)->format('d M Y H:i'),
            'reviewed_at' => $p->reviewed_at?->timezone($tz)->format('d M Y H:i'),
            'estimated_approval_at' => ($p->status === 'pending' && $avgApprovalMinutes)
                ? $p->created_at->copy()->addMinutes((int) round($avgApprovalMinutes))->timezone($tz)->format('d M Y H:i')
                : null,
            'created_at' => $p->created_at->timezone($tz)->format('d M Y H:i'),
            'comments' => $p->comments->map(fn(AttendancePermitComment $comment) => [
                'id' => $comment->id,
                'sender_type' => $comment->sender_type,
                'sender_name' => $comment->sender_name,
                'message' => $comment->message,
                'created_at' => $comment->created_at->timezone($tz)->format('d M Y H:i'),
                'is_mine' => $comment->sender_type === 'mahasiswa' && $comment->sender_id === $mahasiswa->id,
            ])->values(),
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

    public function attachment(AttendancePermit $permit): InertiaResponse|RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        if ($permit->mahasiswa_id !== $mahasiswa->id) {
            abort(403);
        }

        if (! $permit->attachment) {
            return redirect()->route('user.permit')
                ->withErrors(['attachment' => 'Surat keterangan tidak tersedia untuk pengajuan ini.']);
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($permit->attachment)) {
            return redirect()->route('user.permit')
                ->withErrors(['attachment' => 'File surat keterangan tidak ditemukan di penyimpanan.']);
        }

        $permit->loadMissing('session.course');

        $filename = basename($permit->attachment);
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimeType = $disk->mimeType($permit->attachment);
        $sizeBytes = $disk->size($permit->attachment);

        return Inertia::render('user/permit-attachment', [
            'permit' => [
                'id' => $permit->id,
                'type' => $permit->type,
                'status' => $permit->status,
                'reason' => $permit->reason,
                'created_at' => $permit->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'session' => [
                    'mata_kuliah' => $permit->session?->course?->nama ?? '-',
                    'tanggal_display' => $permit->session?->start_at?->translatedFormat('l, d F Y') ?? '-',
                ],
            ],
            'attachment' => [
                'url' => Storage::url($permit->attachment),
                'name' => $filename,
                'extension' => $extension,
                'mime' => $mimeType,
                'size_bytes' => $sizeBytes,
            ],
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

    public function addComment(Request $request, AttendancePermit $permit): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        if ($permit->mahasiswa_id !== $mahasiswa->id) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $permit->comments()->create([
            'sender_type' => 'mahasiswa',
            'sender_id' => $mahasiswa->id,
            'sender_name' => $mahasiswa->nama,
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Pesan berhasil dikirim ke dosen.');
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

    private function getAvailableSessions()
    {
        return AttendanceSession::with(['course.dosen', 'dosen'])
            ->where(function ($query) {
                $query->where('is_active', true)
                    ->orWhere('start_at', '>=', now()->subDays(7));
            })
            ->orderBy('start_at', 'desc')
            ->get()
            ->map(function (AttendanceSession $session) {
                $dosenName = $session->course?->dosen?->nama
                    ?? $session->dosen?->nama
                    ?? '-';

                return [
                    'id' => $session->id,
                    'mata_kuliah' => $session->course?->nama ?? '-',
                    'tanggal' => $session->start_at->format('Y-m-d'),
                    'tanggal_display' => $session->start_at->translatedFormat('l, d F Y'),
                    'waktu' => $session->start_at->format('H:i') . ' - ' . ($session->end_at ? $session->end_at->format('H:i') : 'Selesai'),
                    'dosen' => $dosenName,
                ];
            })
            ->values();
    }
}
