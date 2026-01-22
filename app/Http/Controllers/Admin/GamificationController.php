<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use App\Models\Challenge;
use App\Models\Reward;
use App\Models\RewardRedemption;
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

        return Inertia::render('Admin/Gamification/Leaderboard', [
            'leaderboard' => $leaderboard,
            'period' => $period,
        ]);
    }

    public function challenges()
    {
        $challenges = Challenge::with('progress')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Gamification/Challenges', [
            'challenges' => $challenges,
        ]);
    }

    public function storeChallenge(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:daily,weekly,monthly,special',
            'category' => 'required|in:attendance,streak,social,academic',
            'target_value' => 'required|integer|min:1',
            'reward_points' => 'required|integer|min:0',
            'reward_badge_id' => 'nullable|exists:badges,id',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'requirements' => 'nullable|array',
        ]);

        $challenge = Challenge::create($validated);

        return redirect()->back()->with('success', 'Challenge created successfully');
    }

    public function updateChallenge(Request $request, Challenge $challenge)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'is_active' => 'boolean',
            'reward_points' => 'integer|min:0',
        ]);

        $challenge->update($validated);

        return redirect()->back()->with('success', 'Challenge updated successfully');
    }

    public function rewards()
    {
        $rewards = Reward::withCount('redemptions')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Gamification/Rewards', [
            'rewards' => $rewards,
        ]);
    }

    public function storeReward(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:badge,privilege,physical,digital',
            'cost_points' => 'required|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'image_url' => 'nullable|url',
            'metadata' => 'nullable|array',
        ]);

        $reward = Reward::create($validated);

        return redirect()->back()->with('success', 'Reward created successfully');
    }

    public function redemptions()
    {
        $redemptions = RewardRedemption::with(['reward', 'mahasiswa'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Gamification/Redemptions', [
            'redemptions' => $redemptions,
        ]);
    }

    public function approveRedemption(RewardRedemption $redemption)
    {
        $redemption->approve();

        return redirect()->back()->with('success', 'Redemption approved');
    }

    public function deliverRedemption(RewardRedemption $redemption)
    {
        $redemption->deliver();

        return redirect()->back()->with('success', 'Redemption marked as delivered');
    }

    public function cancelRedemption(RewardRedemption $redemption)
    {
        $redemption->cancel();

        return redirect()->back()->with('success', 'Redemption cancelled and points refunded');
    }
}
