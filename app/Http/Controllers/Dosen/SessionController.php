<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use App\Models\SelfieVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function show(AttendanceSession $session): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen->courses()->where('mata_kuliah.id', $session->course_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke sesi ini.');
        }

        $logs = AttendanceLog::where('session_id', $session->id)
            ->with(['mahasiswa', 'selfieVerification'])
            ->orderByDesc('scanned_at')
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'mahasiswa' => $log->mahasiswa->nama ?? '-',
                'nim' => $log->mahasiswa->nim ?? '-',
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
                'course' => $session->course->nama ?? '-',
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

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        $validated = $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'title' => 'nullable|string|max:255',
            'meeting_number' => 'required|integer|min:1',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'auto_activate' => 'nullable|boolean',
        ]);

        // Check if dosen has access to this course
        if (!$dosen->courses()->where('mata_kuliah.id', $validated['course_id'])->exists()) {
            // If dosen doesn't have explicit course assignment, allow anyway for now
            // This can be restricted later if needed
        }

        $session = AttendanceSession::create([
            'course_id' => $validated['course_id'],
            'meeting_number' => $validated['meeting_number'],
            'title' => $validated['title'] ?? null,
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'],
            'qr_token' => Str::random(32),
            'is_active' => $validated['auto_activate'] ?? false,
            'created_by_dosen_id' => $dosen->id,
        ]);

        return back()->with('success', 'Sesi berhasil dibuat.');
    }

    public function activate(AttendanceSession $session): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen->courses()->where('mata_kuliah.id', $session->course_id)->exists()) {
            abort(403);
        }

        $session->update(['is_active' => true]);
        return back()->with('success', 'Sesi diaktifkan.');
    }

    public function close(AttendanceSession $session): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen->courses()->where('mata_kuliah.id', $session->course_id)->exists()) {
            abort(403);
        }

        $session->update(['is_active' => false]);
        return back()->with('success', 'Sesi ditutup.');
    }

    public function regenerateQr(AttendanceSession $session): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        if (!$dosen->courses()->where('mata_kuliah.id', $session->course_id)->exists()) {
            abort(403);
        }

        $session->update(['qr_token' => Str::random(32)]);
        return back()->with('success', 'QR Code diperbarui.');
    }
}
