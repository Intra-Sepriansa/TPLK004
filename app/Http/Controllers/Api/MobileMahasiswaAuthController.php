<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Support\CredentialDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MobileMahasiswaAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'nim' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string'],
        ]);

        $nim = trim($credentials['nim']);
        $inputPassword = $credentials['password'];

        $mahasiswa = Mahasiswa::where('nim', $nim)->first();
        if (! $mahasiswa) {
            return response()->json([
                'success' => false,
                'message' => 'NIM atau password salah.',
            ], 401);
        }

        $storedPassword = $mahasiswa->password;
        $defaultPassword = null;
        try {
            $defaultPassword = CredentialDefaults::mahasiswaDefaultPassword($mahasiswa->nim);
        } catch (\Throwable) {
            // Skip default password fallback if config not present.
        }

        $isHash = is_string($storedPassword) && str_starts_with($storedPassword, '$2');
        $matchesHash = $storedPassword && $isHash
            ? Hash::check($inputPassword, $storedPassword)
            : false;
        $matchesPlain = $storedPassword && ! $isHash && $inputPassword === $storedPassword;
        $matchesDefault = is_string($defaultPassword) && $defaultPassword !== '' && $inputPassword === $defaultPassword;

        if (! ($matchesHash || $matchesPlain || $matchesDefault)) {
            return response()->json([
                'success' => false,
                'message' => 'NIM atau password salah.',
            ], 401);
        }

        if ($matchesDefault && (! $storedPassword || ! Hash::check($defaultPassword, $storedPassword))) {
            $mahasiswa->forceFill([
                'password' => Hash::make($defaultPassword),
            ])->save();
        } elseif ($matchesPlain) {
            $mahasiswa->forceFill([
                'password' => Hash::make($storedPassword),
            ])->save();
        }

        $token = Str::random(60);
        $mahasiswa->forceFill([
            'remember_token' => hash('sha256', $token),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $mahasiswa->id,
                'name' => $mahasiswa->name ?? $mahasiswa->nama ?? 'Mahasiswa',
                'nim' => $mahasiswa->nim,
            ],
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'nim' => ['required', 'string', 'max:20'],
        ]);

        $nim = trim($request->nim);
        $mahasiswa = Mahasiswa::where('nim', $nim)->first();

        if (! $mahasiswa) {
            return response()->json([
                'success' => false,
                'message' => 'NIM tidak ditemukan. Pastikan NIM yang dimasukkan benar.',
            ], 404);
        }

        try {
            $defaultPassword = CredentialDefaults::mahasiswaDefaultPassword($nim);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset password. Hubungi admin.',
            ], 500);
        }

        $mahasiswa->forceFill([
            'password' => Hash::make($defaultPassword),
        ])->save();

        // Build a masked hint of the default password (show first 2 and last 2 chars)
        $hint = strlen($defaultPassword) > 4
            ? substr($defaultPassword, 0, 2) . str_repeat('*', strlen($defaultPassword) - 4) . substr($defaultPassword, -2)
            : str_repeat('*', strlen($defaultPassword));

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset ke default.',
            'data' => [
                'hint' => $hint,
                'nama' => $mahasiswa->nama,
            ],
        ]);
    }
}
