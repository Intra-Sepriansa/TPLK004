<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\SelfieVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = $dosen->courses()->pluck('mata_kuliah.id');

        $pendingVerifications = SelfieVerification::where('status', 'pending')
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->latest()
            ->paginate(20)
            ->through(fn($v) => [
                'id' => $v->id,
                'mahasiswa' => $v->attendanceLog->mahasiswa->nama ?? '-',
                'nim' => $v->attendanceLog->mahasiswa->nim ?? '-',
                'course' => $v->attendanceLog->session->course->nama ?? '-',
                'meeting_number' => $v->attendanceLog->session->meeting_number,
                'selfie_url' => $v->attendanceLog->selfie_path ? asset('storage/' . $v->attendanceLog->selfie_path) : null,
                'scanned_at' => $v->attendanceLog->scanned_at?->format('d M Y H:i'),
                'distance' => $v->attendanceLog->distance,
            ]);

        $recentVerifications = SelfieVerification::whereIn('status', ['approved', 'rejected'])
            ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))
            ->with(['attendanceLog.mahasiswa', 'attendanceLog.session.course'])
            ->latest('verified_at')
            ->take(10)
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'mahasiswa' => $v->attendanceLog->mahasiswa->nama ?? '-',
                'nim' => $v->attendanceLog->mahasiswa->nim ?? '-',
                'course' => $v->attendanceLog->session->course->nama ?? '-',
                'status' => $v->status,
                'verified_by' => $v->verified_by_name,
                'verified_by_type' => $v->verified_by_type,
                'verified_at' => $v->verified_at?->format('d M Y H:i'),
            ]);

        $stats = [
            'pending' => SelfieVerification::where('status', 'pending')
                ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))->count(),
            'approvedToday' => SelfieVerification::where('status', 'approved')
                ->whereDate('verified_at', today())
                ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))->count(),
            'rejectedToday' => SelfieVerification::where('status', 'rejected')
                ->whereDate('verified_at', today())
                ->whereHas('attendanceLog.session', fn($q) => $q->whereIn('course_id', $courseIds))->count(),
        ];

        return Inertia::render('dosen/verify', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama, 'nidn' => $dosen->nidn],
            'pendingVerifications' => $pendingVerifications,
            'recentVerifications' => $recentVerifications,
            'stats' => $stats,
        ]);
    }

    public function approve(SelfieVerification $verification): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = $dosen->courses()->pluck('mata_kuliah.id');

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

        return back()->with('success', 'Selfie disetujui.');
    }

    public function reject(SelfieVerification $verification, Request $request): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = $dosen->courses()->pluck('mata_kuliah.id');

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

        return back()->with('success', 'Selfie ditolak.');
    }
}
