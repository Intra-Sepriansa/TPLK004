<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        return Inertia::render('user/profile', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
        ]);

        $mahasiswa->forceFill([
            'nama' => $validated['nama'],
        ])->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
