<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class DosenAuthController extends Controller
{
    public function store(Request $request): Response
    {
        $credentials = $request->validate([
            'nidn' => 'required|string',
            'password' => 'required|string',
        ]);
        $credentials['nidn'] = trim($credentials['nidn']);

        $dosen = Dosen::where('nidn', $credentials['nidn'])->first();

        if (!$dosen || !Hash::check($credentials['password'], $dosen->password)) {
            return back()->withErrors([
                'nidn' => 'NIDN atau password salah.',
            ])->onlyInput('nidn');
        }

        Auth::guard('dosen')->login($dosen, $request->boolean('remember'));

        $request->session()->regenerate();

        return $this->redirectAfterLogin($request);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('dosen')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function redirectAfterLogin(Request $request): Response
    {
        if ($request->header('X-Inertia')) {
            return Inertia::location('/dosen');
        }

        return redirect()->intended('/dosen');
    }
}
