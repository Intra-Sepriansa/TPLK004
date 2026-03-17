<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileMahasiswaProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'name' => $mahasiswa->nama ?? $mahasiswa->name ?? 'Mahasiswa',
                'email' => $mahasiswa->email,
                'phone' => $mahasiswa->phone,
                'prodi' => $mahasiswa->prodi,
                'kelas' => $mahasiswa->kelas,
                'jenis_reguler' => $mahasiswa->jenis_reguler,
                'semester' => $mahasiswa->semester,
                'avatar' => $mahasiswa->avatar_url,
                'last_activity_at' => $mahasiswa->last_activity_at ? $mahasiswa->last_activity_at->toISOString() : null,
                'created_at' => null, // Mahasiswa table doesn't have timestamps by default
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $mahasiswa->nama = $request->name;
        $mahasiswa->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => $mahasiswa
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = time() . '_' . $mahasiswa->nim . '.' . $file->getClientOriginalExtension();
            
            // Store in public visibility so it's accessible
            $path = $file->storeAs('avatars', $filename, 'public');
            
            // Update database
            $mahasiswa->avatar_url = asset('storage/' . $path);
            $mahasiswa->save();

            return response()->json([
                'success' => true,
                'message' => 'Foto profil berhasil diperbarui',
                'avatar_url' => $mahasiswa->avatar_url
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal mengunggah foto'
        ], 400);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8',
            'confirm_password' => 'required|same:new_password',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $mahasiswa->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi saat ini tidak valid'
            ], 422);
        }

        $mahasiswa->password = \Illuminate\Support\Facades\Hash::make($request->new_password);
        $mahasiswa->save();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui'
        ]);
    }
}
