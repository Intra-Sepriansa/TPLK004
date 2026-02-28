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
            'onTimeRate' => $this->calculateOnTimeRate($mahasiswa),
        ];

        // Get badges data for profile display
        $badges = $this->getBadgesForProfile($mahasiswa);
        $recentActivities = $this->getRecentActivities($mahasiswa);

        return Inertia::render('user/profile', [
            'mahasiswa' => [
                'id' => $mahasiswa?->id,
                'nama' => $mahasiswa?->nama,
                'nim' => $mahasiswa?->nim,
                'email' => $mahasiswa?->email,
                'phone' => $mahasiswa?->phone,
                'fakultas' => $mahasiswa?->fakultas,
                'prodi' => $mahasiswa?->prodi,
                'kelas' => $mahasiswa?->kelas,
                'semester' => $mahasiswa?->semester,
                'jenis_reguler' => $mahasiswa?->jenis_reguler,
                'avatar_url' => $mahasiswa?->avatar_url,
                'last_activity_at' => $mahasiswa?->last_activity_at,
                'created_at' => $mahasiswa?->created_at,
            ],
            'stats' => $stats,
            'badges' => $badges,
            'recentActivities' => $recentActivities,
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
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp,heic,heif', 'max:2048'],
        ]);

        // Delete old avatar if exists
        if ($mahasiswa->avatar_url && Storage::disk('public')->exists(str_replace('/storage/', '', $mahasiswa->avatar_url))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $mahasiswa->avatar_url));
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars/mahasiswa', 'public');
        $avatarUrl = '/storage/' . $path;

        $mahasiswa->avatar_url = $avatarUrl;
        $mahasiswa->save();

        \Log::info('Mahasiswa avatar updated', [
            'mahasiswa_id' => $mahasiswa->id,
            'avatar_url' => $mahasiswa->avatar_url,
            'path' => $path,
        ]);

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    private function calculateAttendanceRate($mahasiswa): int
    {
        $totalLogs = $mahasiswa->attendanceLogs()->count();
        if ($totalLogs === 0) {
            return 0;
        }

        $attendedLogs = $mahasiswa->attendanceLogs()
            ->whereIn('status', ['present', 'late', 'hadir'])
            ->count();

        return (int) round(($attendedLogs / $totalLogs) * 100);
    }

    private function calculateOnTimeRate($mahasiswa): int
    {
        $attendedLogs = $mahasiswa->attendanceLogs()
            ->whereIn('status', ['present', 'late', 'hadir'])
            ->count();

        if ($attendedLogs === 0) {
            return 0;
        }

        $onTimeLogs = $mahasiswa->attendanceLogs()
            ->whereIn('status', ['present', 'hadir'])
            ->count();

        return (int) round(($onTimeLogs / $attendedLogs) * 100);
    }

    private function calculateStreak($mahasiswa): int
    {
        $logs = $mahasiswa->attendanceLogs()
            ->whereIn('status', ['present', 'hadir'])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($logs->isEmpty()) {
            return 0;
        }

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

        // Keep badge awarding flow in sync before displaying profile badges.
        \App\Services\BadgeService::checkAndAwardBadges($mahasiswa->id);

        // Get earned badges from database (permanent)
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

        // Calculate progress for each badge type (for display only)
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
                // Only check database for unlocked status - badges are permanent
                if (in_array($badge->id, $earnedBadges)) {
                    $currentBadge = $badge;
                    $isUnlocked = true;
                } elseif (!$isUnlocked && !$currentBadge) {
                    $currentBadge = $badge;
                }
            }

            if (!$currentBadge) {
                $currentBadge = $badgeGroup->last();
                $isUnlocked = in_array($currentBadge->id, $earnedBadges);
            }

            $progress = $progressData[$baseCode] ?? ['current' => 0, 'target' => $currentBadge->requirement_value];

            $badges[] = [
                'id' => $currentBadge->id,
                'type' => $baseCode,
                'name' => $currentBadge->name,
                'level' => $currentBadge->badge_level,
                'maxLevel' => $badgeGroup->count(),
                'icon' => $currentBadge->icon,
                'unlocked' => $isUnlocked, // Only from database, not calculated
                'progress' => $progress['current'],
                'target' => $currentBadge->requirement_value,
            ];
        }

        return $badges;
    }

    private function getRecentActivities($mahasiswa): array
    {
        if (!$mahasiswa) {
            return [];
        }

        $logs = $mahasiswa->attendanceLogs()
            ->with(['session.course'])
            ->orderByDesc('scanned_at')
            ->orderByDesc('created_at')
            ->limit(7)
            ->get();

        return $logs->map(function ($log) {
            $occurredAt = $log->scanned_at ?? $log->created_at;
            $status = (string) ($log->status ?? '');

            return [
                'id' => $log->id,
                'title' => $this->buildActivityTitle($status),
                'description' => $this->buildActivityDescription($log),
                'status' => $status,
                'occurred_at' => $occurredAt?->toIso8601String(),
            ];
        })->values()->all();
    }

    private function buildActivityTitle(string $status): string
    {
        return match (strtolower($status)) {
            'present', 'hadir' => 'Kehadiran berhasil diverifikasi',
            'late' => 'Kehadiran tercatat terlambat',
            'pending' => 'Kehadiran sedang menunggu verifikasi',
            'rejected' => 'Kehadiran ditolak oleh sistem',
            'absent', 'alpha' => 'Tidak ada kehadiran yang tercatat',
            'izin', 'sick', 'permit' => 'Kehadiran tercatat sebagai izin',
            default => 'Aktivitas kehadiran tercatat',
        };
    }

    private function buildActivityDescription($log): string
    {
        $status = strtolower((string) ($log->status ?? ''));
        $courseName = $log->session?->course?->nama;
        $sessionTitle = $log->session?->title;
        $meetingNumber = $log->session?->meeting_number;

        $sessionLabel = $sessionTitle ?: ($meetingNumber ? "Pertemuan {$meetingNumber}" : 'Sesi perkuliahan');
        $context = $courseName ? "{$courseName} • {$sessionLabel}" : $sessionLabel;

        return match ($status) {
            'present', 'hadir' => "{$context} • Kamu tercatat hadir pada sesi ini.",
            'late' => "{$context} • Kehadiran tercatat terlambat, tetap masuk rekap.",
            'pending' => "{$context} • Data absensi masih diproses verifikasi.",
            'rejected' => "{$context} • Verifikasi absensi belum disetujui.",
            'absent', 'alpha' => "{$context} • Tidak ada check-in pada sesi ini.",
            'izin', 'sick', 'permit' => "{$context} • Status kehadiran tercatat sebagai izin/sakit.",
            default => "{$context} • Status absensi: " . strtoupper($status ?: 'UNKNOWN'),
        };
    }
}
