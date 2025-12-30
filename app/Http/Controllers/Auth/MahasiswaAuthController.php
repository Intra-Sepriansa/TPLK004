<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class MahasiswaAuthController extends Controller
{
    public function store(Request $request): Response
    {
        $credentials = $request->validate([
            'nim' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string'],
        ]);
        $credentials['nim'] = trim($credentials['nim']);

        if (Auth::guard('mahasiswa')->attempt($credentials)) {
            $request->session()->regenerate();

            return $this->redirectAfterLogin($request);
        }

        $mahasiswa = Mahasiswa::where('nim', $credentials['nim'])->first();
        if ($mahasiswa) {
            $inputPassword = $credentials['password'];
            $storedPassword = $mahasiswa->password;
            $defaultPassword = 'tplk004#' . substr($mahasiswa->nim, -2);
            $isHash = is_string($storedPassword) && str_starts_with($storedPassword, '$2');
            $matchesHash = $storedPassword && $isHash
                ? Hash::check($inputPassword, $storedPassword)
                : false;
            $matchesPlain = $storedPassword && ! $isHash && $inputPassword === $storedPassword;
            $matchesDefault = $inputPassword === $defaultPassword;

            if ($matchesHash || $matchesPlain || $matchesDefault) {
                if ($matchesDefault && (! $storedPassword || ! Hash::check($defaultPassword, $storedPassword))) {
                    $mahasiswa->forceFill([
                        'password' => Hash::make($defaultPassword),
                    ])->save();
                } elseif ($matchesPlain) {
                    $mahasiswa->forceFill([
                        'password' => Hash::make($storedPassword),
                    ])->save();
                }

                Auth::guard('mahasiswa')->login($mahasiswa);
                $request->session()->regenerate();

                return $this->redirectAfterLogin($request);
            }
        }

        return back()->withErrors([
            'nim' => 'NIM atau password salah.',
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('mahasiswa')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    private function redirectAfterLogin(Request $request): Response
    {
        if ($request->header('X-Inertia')) {
            return Inertia::location('/user/absen');
        }

        return redirect()->intended('/user/absen');
    }
}
