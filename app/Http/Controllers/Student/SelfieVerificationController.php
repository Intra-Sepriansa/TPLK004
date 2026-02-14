<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SelfieViewRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SelfieVerificationController extends Controller
{
    public function index()
    {
        $mahasiswaId = auth()->user()->mahasiswa->id;
        
        $requests = SelfieViewRequest::with([
            'selfieVerification.attendanceLog',
            'requestedBy'
        ])
        ->where('mahasiswa_id', $mahasiswaId)
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        $stats = [
            'total' => SelfieViewRequest::where('mahasiswa_id', $mahasiswaId)->count(),
            'pending' => SelfieViewRequest::where('mahasiswa_id', $mahasiswaId)->where('status', 'pending')->count(),
            'approved' => SelfieViewRequest::where('mahasiswa_id', $mahasiswaId)->where('status', 'approved')->count(),
            'rejected' => SelfieViewRequest::where('mahasiswa_id', $mahasiswaId)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('student/selfie-verification', [
            'requests' => $requests,
            'stats' => $stats,
        ]);
    }

    public function approve(Request $request, SelfieViewRequest $viewRequest)
    {
        $mahasiswaId = auth()->user()->mahasiswa->id;
        
        if ($viewRequest->mahasiswa_id !== $mahasiswaId) {
            abort(403);
        }

        $validated = $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $viewRequest->update([
            'status' => 'approved',
            'responded_at' => now(),
            'response_note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', 'Permintaan akses disetujui');
    }

    public function reject(Request $request, SelfieViewRequest $viewRequest)
    {
        $mahasiswaId = auth()->user()->mahasiswa->id;
        
        if ($viewRequest->mahasiswa_id !== $mahasiswaId) {
            abort(403);
        }

        $validated = $request->validate([
            'note' => 'required|string|min:10|max:500',
        ]);

        $viewRequest->update([
            'status' => 'rejected',
            'responded_at' => now(),
            'response_note' => $validated['note'],
        ]);

        return back()->with('success', 'Permintaan akses ditolak');
    }
}
