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
        $selfieVerification->update([
            'status' => 'approved',
            'verified_by' => $request->user()->id,
            'note' => $request->input('note'),
        ]);

        return back()->with('success', 'Selfie disetujui.');
    }

    public function reject(SelfieVerification $selfieVerification, Request $request): RedirectResponse
    {
        $selfieVerification->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'note' => $request->input('note'),
        ]);

        return back()->with('success', 'Selfie ditolak.');
    }
}
