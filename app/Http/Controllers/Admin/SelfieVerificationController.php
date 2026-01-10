<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SelfieVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SelfieVerificationController extends Controller
{
    public function approve(SelfieVerification $selfieVerification, Request $request): RedirectResponse
    {
        $user = $request->user();
        
        $selfieVerification->update([
            'status' => 'approved',
            'verified_by' => $user->id,
            'verified_by_type' => 'admin',
            'verified_by_name' => $user->name,
            'verified_at' => now(),
            'note' => $request->input('note'),
        ]);

        $selfieVerification->attendanceLog?->update(['status' => 'present']);

        return back()->with('success', 'Selfie disetujui.');
    }

    public function reject(SelfieVerification $selfieVerification, Request $request): RedirectResponse
    {
        $user = $request->user();
        
        $selfieVerification->update([
            'status' => 'rejected',
            'verified_by' => $user->id,
            'verified_by_type' => 'admin',
            'verified_by_name' => $user->name,
            'verified_at' => now(),
            'rejection_reason' => $request->input('reason'),
            'note' => $request->input('note'),
        ]);

        $selfieVerification->attendanceLog?->update(['status' => 'rejected']);

        return back()->with('success', 'Selfie ditolak.');
    }
}
