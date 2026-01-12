<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        // Get attendance stats
        $stats = [
            'totalAttendance' => $mahasiswa->attendanceLogs()->count(),
            'attendanceRate' => $this->calculateAttendanceRate($mahasiswa),
            'currentStreak' => $this->calculateStreak($mahasiswa),
        ];

        return Inertia::render('user/profile', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
                'avatar_url' => $mahasiswa?->avatar_url,
            ],
            'stats' => $stats,
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

    public function updateAvatar(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        // Delete old avatar if exists
        if ($mahasiswa->avatar_url && Storage::disk('public')->exists($mahasiswa->avatar_url)) {
            Storage::disk('public')->delete($mahasiswa->avatar_url);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars/mahasiswa', 'public');

        $mahasiswa->forceFill([
            'avatar_url' => '/storage/' . $path,
        ])->save();

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    private function calculateAttendanceRate($mahasiswa): int
    {
        $totalLogs = $mahasiswa->attendanceLogs()->count();
        if ($totalLogs === 0) return 0;

        $presentLogs = $mahasiswa->attendanceLogs()->where('status', 'hadir')->count();
        return (int) round(($presentLogs / $totalLogs) * 100);
    }

    private function calculateStreak($mahasiswa): int
    {
        $logs = $mahasiswa->attendanceLogs()
            ->where('status', 'hadir')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($logs->isEmpty()) return 0;

        $streak = 0;
        $lastDate = null;

        foreach ($logs as $log) {
            $logDate = $log->created_at->format('Y-m-d');

            if ($lastDate === null) {
                $streak = 1;
                $lastDate = $logDate;
                continue;
            }

            $diff = (new \DateTime($lastDate))->diff(new \DateTime($logDate))->days;

            if ($diff === 1) {
                $streak++;
                $lastDate = $logDate;
            } else {
                break;
            }
        }

        return $streak;
    }
}
