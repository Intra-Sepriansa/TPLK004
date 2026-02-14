<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SelfieViewRequest;
use App\Models\SelfieVerification;
use Illuminate\Http\Request;

class SelfieViewRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'selfie_verification_id' => 'required|exists:selfie_verifications,id',
            'reason' => 'required|string|min:10',
        ]);

        $selfieVerification = SelfieVerification::with('attendanceLog.mahasiswa')->findOrFail($validated['selfie_verification_id']);
        
        $viewRequest = SelfieViewRequest::create([
            'selfie_verification_id' => $validated['selfie_verification_id'],
            'requested_by' => auth()->id(),
            'mahasiswa_id' => $selfieVerification->attendanceLog->mahasiswa->id,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Permintaan akses berhasil dikirim ke mahasiswa');
    }
}
