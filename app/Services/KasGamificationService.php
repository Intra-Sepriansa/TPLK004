<?php

namespace App\Services;

use App\Models\Kas;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class KasGamificationService
{
    public function getGamificationData(Mahasiswa $mahasiswa, array $financialIntelligence): array
    {
        $paidCount = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->count();

        $lateCount = $this->lateCount($mahasiswa->id);
        $earlyCount = $this->earlyCount($mahasiswa->id);

        $streak = (int) ($financialIntelligence['paymentStreak'] ?? 0);
        $longestStreak = (int) ($financialIntelligence['longestStreak'] ?? 0);
        $healthScore = (int) ($financialIntelligence['healthScore'] ?? 0);

        $classLeaderboard = $this->buildPaidAmountRanking();
        $rankIndex = $classLeaderboard->search(fn ($row) => (int) $row->mahasiswa_id === (int) $mahasiswa->id);
        $rank = $rankIndex === false ? ($classLeaderboard->count() + 1) : ($rankIndex + 1);

        $achievements = [
            [
                'id' => 'early_bird',
                'name' => 'Early Bird',
                'description' => 'Bayar sebelum deadline sebanyak 5 kali.',
                'icon' => 'sunrise',
                'progress' => $earlyCount,
                'target' => 5,
            ],
            [
                'id' => 'punctual_pro',
                'name' => 'Punctual Pro',
                'description' => 'Bayar tepat waktu 10 kali.',
                'icon' => 'clock',
                'progress' => max(0, $paidCount - $lateCount),
                'target' => 10,
            ],
            [
                'id' => 'streak_master',
                'name' => 'Streak Master',
                'description' => 'Capai streak pembayaran 20 kali.',
                'icon' => 'flame',
                'progress' => $longestStreak,
                'target' => 20,
            ],
            [
                'id' => 'financial_guru',
                'name' => 'Financial Guru',
                'description' => 'Pertahankan health score >= 90.',
                'icon' => 'brain',
                'progress' => $healthScore >= 90 ? 3 : ($healthScore >= 80 ? 2 : ($healthScore >= 70 ? 1 : 0)),
                'target' => 3,
            ],
            [
                'id' => 'class_hero',
                'name' => 'Class Hero',
                'description' => 'Jadi kontributor kas terbesar di kelas.',
                'icon' => 'crown',
                'progress' => $rank === 1 ? 1 : 0,
                'target' => 1,
            ],
        ];

        $achievements = array_map(function (array $achievement) {
            $unlocked = $achievement['progress'] >= $achievement['target'];

            return [
                ...$achievement,
                'unlocked' => $unlocked,
                'unlockedAt' => $unlocked ? now()->toDateString() : null,
            ];
        }, $achievements);

        $this->syncAchievements($mahasiswa->id, $achievements);

        $multiplier = match (true) {
            $streak >= 20 => 5,
            $streak >= 10 => 3,
            $streak >= 5 => 2,
            default => 1,
        };

        $derivedPoints = ($paidCount * 10) + ($earlyCount * 5) + ($streak * 2);
        $pointsSummary = $this->resolvePoints($mahasiswa->id, $derivedPoints, $multiplier);

        $monthlyChallengeTarget = max(1, Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count());

        $monthlyPaid = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        $classPaymentRate = $this->classPaymentRate();

        $challenges = [
            [
                'id' => 'weekly_ontime',
                'title' => 'Bayar Sebelum Rabu',
                'description' => 'Selesaikan pembayaran minggu ini sebelum hari Rabu.',
                'type' => 'weekly',
                'progress' => min(1, $streak > 0 ? 1 : 0),
                'target' => 1,
                'reward' => 20,
                'deadline' => now()->endOfWeek()->toDateString(),
                'completed' => $streak > 0,
            ],
            [
                'id' => 'monthly_zero_late',
                'title' => 'Zero Late Payment',
                'description' => 'Tidak ada keterlambatan pembayaran selama bulan berjalan.',
                'type' => 'monthly',
                'progress' => $monthlyPaid,
                'target' => $monthlyChallengeTarget,
                'reward' => 60,
                'deadline' => now()->endOfMonth()->toDateString(),
                'completed' => $lateCount === 0 && $monthlyPaid >= $monthlyChallengeTarget,
            ],
            [
                'id' => 'class_target',
                'title' => 'Target Kelas 95%',
                'description' => 'Bantu kelas mencapai 95% pembayaran tepat waktu.',
                'type' => 'class',
                'progress' => $classPaymentRate,
                'target' => 95,
                'reward' => 100,
                'deadline' => now()->endOfMonth()->toDateString(),
                'completed' => $classPaymentRate >= 95,
            ],
        ];

        $leaderboard = [
            'rank' => $rank,
            'totalParticipants' => max(1, $classLeaderboard->count()),
            'category' => 'Top Payers',
            'score' => (int) $pointsSummary['total'],
        ];

        return [
            'achievements' => $achievements,
            'leaderboard' => $leaderboard,
            'rewardPoints' => $pointsSummary,
            'challenges' => $challenges,
        ];
    }

    public function getLeaderboard(Mahasiswa $mahasiswa): array
    {
        $ranking = $this->buildPaidAmountRanking();
        $rankIndex = $ranking->search(fn ($row) => (int) $row->mahasiswa_id === (int) $mahasiswa->id);

        return [
            'rank' => $rankIndex === false ? ($ranking->count() + 1) : ($rankIndex + 1),
            'totalParticipants' => max(1, $ranking->count()),
            'category' => 'Top Payers',
            'score' => (int) ($ranking[$rankIndex]->total_paid ?? 0),
        ];
    }

    public function getAchievements(Mahasiswa $mahasiswa, array $financialIntelligence): array
    {
        return $this->getGamificationData($mahasiswa, $financialIntelligence)['achievements'];
    }

    public function getChallenges(Mahasiswa $mahasiswa, array $financialIntelligence): array
    {
        return $this->getGamificationData($mahasiswa, $financialIntelligence)['challenges'];
    }

    public function awardPoints(Mahasiswa $mahasiswa, int $points, string $action, array $metadata = []): int
    {
        if (! Schema::hasTable('kas_reward_points')) {
            return 0;
        }

        DB::table('kas_reward_points')->insert([
            'mahasiswa_id' => $mahasiswa->id,
            'points' => $points,
            'action' => $action,
            'metadata' => json_encode($metadata),
            'earned_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return (int) DB::table('kas_reward_points')
            ->where('mahasiswa_id', $mahasiswa->id)
            ->sum('points');
    }

    private function resolvePoints(int $mahasiswaId, int $derivedPoints, int $multiplier): array
    {
        if (! Schema::hasTable('kas_reward_points')) {
            return [
                'total' => $derivedPoints,
                'earned' => $derivedPoints,
                'spent' => 0,
                'multiplier' => $multiplier,
            ];
        }

        $total = (int) DB::table('kas_reward_points')
            ->where('mahasiswa_id', $mahasiswaId)
            ->sum('points');

        if ($total === 0 && $derivedPoints > 0) {
            DB::table('kas_reward_points')->insert([
                'mahasiswa_id' => $mahasiswaId,
                'points' => $derivedPoints,
                'action' => 'initial_sync',
                'metadata' => json_encode(['source' => 'calculated']),
                'earned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $total = $derivedPoints;
        }

        return [
            'total' => $total,
            'earned' => $total,
            'spent' => 0,
            'multiplier' => $multiplier,
        ];
    }

    private function syncAchievements(int $mahasiswaId, array $achievements): void
    {
        if (! Schema::hasTable('kas_achievements')) {
            return;
        }

        foreach ($achievements as $achievement) {
            DB::table('kas_achievements')->updateOrInsert(
                [
                    'mahasiswa_id' => $mahasiswaId,
                    'achievement_key' => $achievement['id'],
                ],
                [
                    'name' => $achievement['name'],
                    'description' => $achievement['description'],
                    'progress' => $achievement['progress'],
                    'target' => $achievement['target'],
                    'unlocked' => $achievement['unlocked'],
                    'unlocked_at' => $achievement['unlocked'] ? now() : null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }
    }

    private function lateCount(int $mahasiswaId): int
    {
        $records = Kas::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->get();

        return $records->filter(function ($record) {
            $deadline = (clone $record->period_date)->endOfDay();
            $paidAt = $record->updated_at ?? $record->created_at;

            return $paidAt && $paidAt->gt($deadline);
        })->count();
    }

    private function earlyCount(int $mahasiswaId): int
    {
        $records = Kas::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('type', 'income')
            ->where('status', 'paid')
            ->get();

        return $records->filter(function ($record) {
            $deadline = (clone $record->period_date)->endOfDay()->subDay();
            $paidAt = $record->updated_at ?? $record->created_at;

            return $paidAt && $paidAt->lt($deadline);
        })->count();
    }

    private function buildPaidAmountRanking()
    {
        return DB::table('kas')
            ->selectRaw('mahasiswa_id, SUM(amount) as total_paid')
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereNotNull('mahasiswa_id')
            ->groupBy('mahasiswa_id')
            ->orderByDesc('total_paid')
            ->get();
    }

    private function classPaymentRate(): int
    {
        $totalStudents = Mahasiswa::query()->count();
        if ($totalStudents === 0) {
            return 0;
        }

        $paidStudents = (int) Kas::query()
            ->where('type', 'income')
            ->where('status', 'paid')
            ->whereBetween('period_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->distinct('mahasiswa_id')
            ->count('mahasiswa_id');

        return (int) round(($paidStudents / $totalStudents) * 100);
    }
}
