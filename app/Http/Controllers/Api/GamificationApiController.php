<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GamificationApiController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/gamification/profile",
     *     tags={"Gamification"},
     *     summary="Get gamification profile",
     *     description="Mendapatkan profil gamifikasi user (points, level, badges)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Profile retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="points", type="integer", example=1250),
     *                 @OA\Property(property="level", type="integer", example=5),
     *                 @OA\Property(property="level_name", type="string", example="Advanced Student"),
     *                 @OA\Property(property="progress_to_next_level", type="number", format="float", example=65.5),
     *                 @OA\Property(property="points_to_next_level", type="integer", example=250),
     *                 @OA\Property(property="rank", type="integer", example=12, description="Ranking in leaderboard"),
     *                 @OA\Property(property="total_badges", type="integer", example=8),
     *                 @OA\Property(property="streak_days", type="integer", example=15),
     *                 @OA\Property(property="achievements", type="object",
     *                     @OA\Property(property="attendance_rate", type="number", format="float", example=95.5),
     *                     @OA\Property(property="tasks_completed", type="integer", example=24),
     *                     @OA\Property(property="perfect_attendance_weeks", type="integer", example=3)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getProfile(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/gamification/badges",
     *     tags={"Gamification"},
     *     summary="Get user badges",
     *     description="Mendapatkan daftar badge yang dimiliki dan available",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Badges retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="earned", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string", example="Perfect Attendance"),
     *                         @OA\Property(property="description", type="string"),
     *                         @OA\Property(property="icon", type="string", example="/images/badges/perfect_attendance.png"),
     *                         @OA\Property(property="category", type="string", example="attendance"),
     *                         @OA\Property(property="rarity", type="string", enum={"common", "rare", "epic", "legendary"}),
     *                         @OA\Property(property="earned_at", type="string", format="datetime")
     *                     )
     *                 ),
     *                 @OA\Property(property="available", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string"),
     *                         @OA\Property(property="description", type="string"),
     *                         @OA\Property(property="icon", type="string"),
     *                         @OA\Property(property="category", type="string"),
     *                         @OA\Property(property="rarity", type="string"),
     *                         @OA\Property(property="requirements", type="object",
     *                             @OA\Property(property="description", type="string"),
     *                             @OA\Property(property="progress", type="number", format="float", example=75.0),
     *                             @OA\Property(property="current", type="integer", example=15),
     *                             @OA\Property(property="target", type="integer", example=20)
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getBadges(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/gamification/leaderboard",
     *     tags={"Gamification"},
     *     summary="Get leaderboard",
     *     description="Mendapatkan leaderboard dengan filter",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Leaderboard type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"global", "course", "class"}, default="global")
     *     ),
     *     @OA\Parameter(
     *         name="period",
     *         in="query",
     *         description="Time period",
     *         required=false,
     *         @OA\Schema(type="string", enum={"all_time", "monthly", "weekly"}, default="all_time")
     *     ),
     *     @OA\Parameter(
     *         name="course_id",
     *         in="query",
     *         description="Course ID (required if type=course)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Number of top users to return",
     *         required=false,
     *         @OA\Schema(type="integer", default=50)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Leaderboard retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="my_rank", type="object",
     *                     @OA\Property(property="rank", type="integer", example=12),
     *                     @OA\Property(property="points", type="integer", example=1250),
     *                     @OA\Property(property="level", type="integer", example=5)
     *                 ),
     *                 @OA\Property(property="leaderboard", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="rank", type="integer"),
     *                         @OA\Property(property="user_id", type="integer"),
     *                         @OA\Property(property="name", type="string"),
     *                         @OA\Property(property="avatar_url", type="string"),
     *                         @OA\Property(property="points", type="integer"),
     *                         @OA\Property(property="level", type="integer"),
     *                         @OA\Property(property="badges_count", type="integer"),
     *                         @OA\Property(property="streak_days", type="integer")
     *                     )
     *                 ),
     *                 @OA\Property(property="metadata", type="object",
     *                     @OA\Property(property="type", type="string"),
     *                     @OA\Property(property="period", type="string"),
     *                     @OA\Property(property="total_participants", type="integer"),
     *                     @OA\Property(property="updated_at", type="string", format="datetime")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getLeaderboard(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/gamification/points/history",
     *     tags={"Gamification"},
     *     summary="Get points history",
     *     description="Mendapatkan riwayat perolehan poin",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date filter",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date filter",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Points history retrieved",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="summary", type="object",
     *                     @OA\Property(property="total_earned", type="integer", example=1250),
     *                     @OA\Property(property="total_spent", type="integer", example=200),
     *                     @OA\Property(property="current_balance", type="integer", example=1050)
     *                 ),
     *                 @OA\Property(property="history", type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="type", type="string", enum={"earned", "spent"}),
     *                         @OA\Property(property="points", type="integer"),
     *                         @OA\Property(property="reason", type="string", example="Attendance - Pertemuan 5"),
     *                         @OA\Property(property="source", type="string", example="attendance"),
     *                         @OA\Property(property="created_at", type="string", format="datetime")
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getPointsHistory(Request $request)
    {
        // Implementation
    }

    /**
     * @OA\Get(
     *     path="/api/gamification/challenges",
     *     tags={"Gamification"},
     *     summary="Get active challenges",
     *     description="Mendapatkan daftar challenge yang aktif",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Challenges retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="title", type="string", example="Perfect Week"),
     *                     @OA\Property(property="description", type="string"),
     *                     @OA\Property(property="type", type="string", enum={"daily", "weekly", "monthly", "special"}),
     *                     @OA\Property(property="reward_points", type="integer", example=100),
     *                     @OA\Property(property="reward_badge", type="string"),
     *                     @OA\Property(property="progress", type="object",
     *                         @OA\Property(property="current", type="integer", example=4),
     *                         @OA\Property(property="target", type="integer", example=7),
     *                         @OA\Property(property="percentage", type="number", format="float", example=57.14)
     *                     ),
     *                     @OA\Property(property="expires_at", type="string", format="datetime"),
     *                     @OA\Property(property="is_completed", type="boolean", example=false)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function getChallenges(Request $request)
    {
        // Implementation
    }
}
