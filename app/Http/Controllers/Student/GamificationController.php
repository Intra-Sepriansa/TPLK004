<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GamificationController extends Controller
{
    public function __construct(
        private GamificationService $gamificationService
    ) {}

    public function leaderboard(Request $request)
    {
        $period = $request->get('period', 'all');
        $leaderboard = $this->gamificationService->getLeaderboard($period);
        
        $mahasiswa = Mahasiswa::find(auth()->user()->mahasiswa_id);
        $myStats = $this->gamificationService->getStudentStats($mahasiswa);

        return Inertia::render('Student/Leaderboard', [
            'leaderboard' => $leaderboard,
            'period' => $period,
            'myStats' => $myStats,
        ]);
    }

    public function challenges()
    {
        $mahasiswa = Mahasiswa::find(auth()->user()->mahasiswa_id);
        $challenges = $this->gamificationService->getActiveChallenges($mahasiswa);

        return Inertia::render('Student/Challenges', [
            'challenges' => $challenges,
        ]);
    }

    public function rewards()
    {
        $mahasiswa = Mahasiswa::find(auth()->user()->mahasiswa_id);
        $rewards = $this->gamificationService->getAvailableRewards();
        $myRedemptions = $mahasiswa->rewardRedemptions()
            ->with('reward')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Student/Rewards', [
            'rewards' => $rewards,
            'myRedemptions' => $myRedemptions,
            'myPoints' => $mahasiswa->points ?? 0,
        ]);
    }

    public function redeemReward(Request $request)
    {
        $validated = $request->validate([
            'reward_id' => 'required|exists:rewards,id',
        ]);

        $mahasiswa = Mahasiswa::find(auth()->user()->mahasiswa_id);

        try {
            $redemption = $this->gamificationService->redeemReward(
                $mahasiswa,
                $validated['reward_id']
            );

            return redirect()->back()->with('success', 'Reward redeemed successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function profile()
    {
        $mahasiswa = Mahasiswa::find(auth()->user()->mahasiswa_id);
        $stats = $this->gamificationService->getStudentStats($mahasiswa);
        $challenges = $this->gamificationService->getActiveChallenges($mahasiswa);

        return Inertia::render('Student/GamificationProfile', [
            'stats' => $stats,
            'challenges' => $challenges->take(5),
            'badges' => $mahasiswa->badges,
            'recentPoints' => $mahasiswa->pointHistories()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ]);
    }
}
