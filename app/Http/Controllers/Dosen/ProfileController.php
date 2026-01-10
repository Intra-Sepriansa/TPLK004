<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        $dosen = Auth::guard('dosen')->user();

        $stats = [
            'totalCourses' => $dosen->courses()->count(),
            'totalSessions' => $dosen->sessions()->count(),
            'totalVerifications' => $dosen->selfieVerifications()->count(),
        ];

        return Inertia::render('dosen/profile', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email,
                'phone' => $dosen->phone,
                'avatar_url' => $dosen->avatar_url,
                'initials' => $dosen->initials,
            ],
            'stats' => $stats,
        ]);
    }

    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:dosen,email,' . $dosen->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $dosen->update($validated);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(Request $request): \Illuminate\Http\RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password:dosen'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $dosen->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password berhasil diubah.');
    }
}
