<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\ChallengeProgress;
use App\Models\Mahasiswa;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\LeaderboardSnapshot;
use Illuminate\Support\Collection;

class GamificationService
{
    public function getLeaderboard(string $period = 'all', int $limit = 100): Collection
    {
        $query = Mahasiswa::with(['badges', 'level'])
            ->select('mahasiswa.*')
            ->selectRaw('COALESCE(SUM(point_histories.points), 0) as total_points')
            ->leftJoin('point_histories', 'mahasiswa.id', '=', 'point_histories.mahasiswa_id');

        if ($period !== 'all') {
            $date = match($period) {
                'daily' => now()->startOfDay(),
                'weekly' => now()->startOfWeek(),
                'monthly' => now()->startOfMonth(),
                default => now()->startOfDay(),
            };
            $query->where('point_histories.created_at', '>=', $date);
        }

        return $query->groupBy('mahasiswa.id')
            ->orderByDesc('total_points')
            ->limit($limit)
            ->get()
            ->map(function ($mahasiswa, $index) {
                return [
                    'rank' => $index + 1,
                    'mahasiswa' => $mahasiswa,
                    'points' => $mahasiswa->total_points ?? 0,
                    'streak' => $mahasiswa->current_streak ?? 0,
                    'badges_count' => $mahasiswa->badges->count(),
                    'attendance_rate' => $this->calculateAttendanceRate($mahasiswa),
                    'trend' => $this->getRankTrend($mahasiswa),
                ];
            });
    }

    public function createLeaderboardSnapshot(string $period): void
    {
        $leaderboard = $this->getLeaderboard($period);
        $date = now()->toDateString();

        foreach ($leaderboard as $entry) {
            LeaderboardSnapshot::create([
                'mahasiswa_id' => $entry['mahasiswa']->id,
                'rank' => $entry['rank'],
                'points' => $entry['points'],
                'streak' => $entry['streak'],
                'attendance_rate' => $entry['attendance_rate'],
                'badges_count' => $entry['badges_count'],
                'period' => $period,
                'snapshot_date' => $date,
            ]);
        }
    }

    public function getActiveChallenges(Mahasiswa $mahasiswa): Collection
    {
        return Challenge::active()
            ->with(['progress' => function ($query) use ($mahasiswa) {
                $query->where('mahasiswa_id', $mahasiswa->id);
            }])
            ->get()
            ->map(function ($challenge) use ($mahasiswa) {
                $progress = $challenge->progress->first();
                return [
                    'challenge' => $challenge,
                    'progress' => $progress,
                    'percentage' => $challenge->getProgressPercentage($mahasiswa),
                    'is_completed' => $challenge->isCompleted($mahasiswa),
                ];
            });
    }

    public function updateChallengeProgress(Mahasiswa $mahasiswa, string $eventType, array $data = []): void
    {
        $challenges = Challenge::active()
            ->where('category', $eventType)
            ->get();

        foreach ($challenges as $challenge) {
            $progress = ChallengeProgress::firstOrCreate(
                [
                    'challenge_id' => $challenge->id,
                    'mahasiswa_id' => $mahasiswa->id,
                ],
                ['current_value' => 0]
            );

            if (!$progress->is_completed) {
                $increment = $data['increment'] ?? 1;
                $progress->incrementProgress($increment);

                if ($progress->is_completed) {
                    $this->rewardChallengeCompletion($mahasiswa, $challenge);
                }
            }
        }
    }

    private function rewardChallengeCompletion(Mahasiswa $mahasiswa, Challenge $challenge): void
    {
        // Award points
        $mahasiswa->increment('points', $challenge->reward_points);

        // Award badge if specified
        if ($challenge->reward_badge_id) {
            $mahasiswa->badges()->syncWithoutDetaching([$challenge->reward_badge_id]);
        }

        // Create notification
        app(NotificationService::class)->sendNotification(
            $mahasiswa,
            'challenge_completed',
            [
                'challenge_title' => $challenge->title,
                'reward_points' => $challenge->reward_points,
            ]
        );
    }

    public function getAvailableRewards(): Collection
    {
        return Reward::available()
            ->orderBy('cost_points')
            ->get();
    }

    public function redeemReward(Mahasiswa $mahasiswa, int $rewardId): RewardRedemption
    {
        $reward = Reward::findOrFail($rewardId);

        if (!$reward->canRedeem($mahasiswa)) {
            throw new \Exception('Cannot redeem this reward');
        }

        // Deduct points
        $mahasiswa->decrement('points', $reward->cost_points);

        // Decrement stock
        $reward->decrementStock();

        // Create redemption
        $redemption = RewardRedemption::create([
            'reward_id' => $reward->id,
            'mahasiswa_id' => $mahasiswa->id,
            'points_spent' => $reward->cost_points,
            'status' => 'pending',
        ]);

        // Send notification
        app(NotificationService::class)->sendNotification(
            $mahasiswa,
            'reward_redeemed',
            [
                'reward_name' => $reward->name,
                'points_spent' => $reward->cost_points,
            ]
        );

        return $redemption;
    }

    private function calculateAttendanceRate(Mahasiswa $mahasiswa): float
    {
        $totalSessions = $mahasiswa->attendanceLogs()->count();
        if ($totalSessions === 0) {
            return 0;
        }

        $attendedSessions = $mahasiswa->attendanceLogs()
            ->whereIn('status', ['present', 'late'])
            ->count();

        return ($attendedSessions / $totalSessions) * 100;
    }

    private function getRankTrend(Mahasiswa $mahasiswa): ?string
    {
        $latestSnapshot = LeaderboardSnapshot::where('mahasiswa_id', $mahasiswa->id)
            ->where('period', 'daily')
            ->orderBy('snapshot_date', 'desc')
            ->first();

        if (!$latestSnapshot) {
            return null;
        }

        $change = $latestSnapshot->getRankChange();
        
        if ($change === null) {
            return null;
        }

        return $change > 0 ? 'up' : ($change < 0 ? 'down' : 'same');
    }

    public function getStudentStats(Mahasiswa $mahasiswa): array
    {
        return [
            'total_points' => $mahasiswa->points ?? 0,
            'current_streak' => $mahasiswa->current_streak ?? 0,
            'longest_streak' => $mahasiswa->longest_streak ?? 0,
            'badges_count' => $mahasiswa->badges()->count(),
            'challenges_completed' => ChallengeProgress::where('mahasiswa_id', $mahasiswa->id)
                ->where('is_completed', true)
                ->count(),
            'attendance_rate' => $this->calculateAttendanceRate($mahasiswa),
            'level' => $mahasiswa->level,
            'rank' => $this->getStudentRank($mahasiswa),
        ];
    }

    private function getStudentRank(Mahasiswa $mahasiswa): int
    {
        return Mahasiswa::where('points', '>', $mahasiswa->points ?? 0)->count() + 1;
    }
}
