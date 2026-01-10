<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DosenAuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/dosen-login');
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $credentials = $request->validate([
            'nidn' => 'required|string',
            'password' => 'required|string',
        ]);

        $dosen = Dosen::where('nidn', $credentials['nidn'])->first();

        if (!$dosen || !Hash::check($credentials['password'], $dosen->password)) {
            return back()->withErrors([
                'nidn' => 'NIDN atau password salah.',
            ])->onlyInput('nidn');
        }

        if (!$dosen->is_active) {
            return back()->withErrors([
                'nidn' => 'Akun tidak aktif. Hubungi administrator.',
            ])->onlyInput('nidn');
        }

        Auth::guard('dosen')->login($dosen, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('dosen.dashboard'));
    }

    public function destroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        Auth::guard('dosen')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('dosen.login');
    }
}
