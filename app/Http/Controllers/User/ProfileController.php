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

        // Get badges data for profile display
        $badges = $this->getBadgesForProfile($mahasiswa);

        return Inertia::render('user/profile', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
                'avatar_url' => $mahasiswa?->avatar_url,
            ],
            'stats' => $stats,
            'badges' => $badges,
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

    private function getBadgesForProfile($mahasiswa): array
    {
        $logs = $mahasiswa->attendanceLogs()->get();
        $totalAttendance = $logs->whereIn('status', ['present', 'late'])->count();
        $totalSessions = $logs->count();
        $attendanceRate = $totalSessions > 0 ? round(($totalAttendance / $totalSessions) * 100) : 0;
        $presentCount = $logs->where('status', 'present')->count();
        $currentStreak = $this->calculateStreak($mahasiswa);

        // Get earned badges
        $earnedBadges = \DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswa?->id)
            ->pluck('badge_id')
            ->toArray();

        // Get all badges grouped by base code
        $allBadges = \App\Models\Badge::where('is_active', true)
            ->orderBy('badge_level')
            ->get();

        $badgeGroups = $allBadges->groupBy(function ($badge) {
            return preg_replace('/_[0-9]+$/', '', $badge->code);
        });

        // Calculate progress for each badge type
        $earnedBadgesCount = count($earnedBadges);
        $progressData = [
            'streak_master' => ['current' => $currentStreak, 'target' => 7],
            'perfect_attendance' => ['current' => $attendanceRate, 'target' => 100],
            'early_bird' => ['current' => $presentCount, 'target' => 10],
            'consistent' => ['current' => $attendanceRate, 'target' => 80],
            'champion' => ['current' => 0, 'target' => 10],
            'legend' => ['current' => $earnedBadgesCount, 'target' => 3],
            'first_step' => ['current' => $totalAttendance, 'target' => 1],
            'ai_verified' => ['current' => $logs->where('selfie_path', '!=', null)->count(), 'target' => 10],
            'kas_hero' => ['current' => 0, 'target' => 4],
            'task_master' => ['current' => 0, 'target' => 5],
            'social_star' => ['current' => 0, 'target' => 5],
            'speed_demon' => ['current' => 0, 'target' => 5],
        ];

        $badges = [];
        foreach ($badgeGroups as $baseCode => $badgeGroup) {
            $currentBadge = null;
            $isUnlocked = false;

            foreach ($badgeGroup as $badge) {
                if (in_array($badge->id, $earnedBadges)) {
                    $currentBadge = $badge;
                    $isUnlocked = true;
                } elseif (!$isUnlocked && !$currentBadge) {
                    $currentBadge = $badge;
                }
            }

            if (!$currentBadge) {
                $currentBadge = $badgeGroup->last();
                $isUnlocked = true;
            }

            $progress = $progressData[$baseCode] ?? ['current' => 0, 'target' => $currentBadge->requirement_value];
            $isCompleted = $progress['current'] >= $currentBadge->requirement_value;

            $badges[] = [
                'id' => $currentBadge->id,
                'type' => $baseCode,
                'name' => $currentBadge->name,
                'level' => $currentBadge->badge_level,
                'maxLevel' => $badgeGroup->count(),
                'icon' => $currentBadge->icon,
                'unlocked' => $isUnlocked || $isCompleted,
                'progress' => $progress['current'],
                'target' => $currentBadge->requirement_value,
            ];
        }

        return $badges;
    }
}
