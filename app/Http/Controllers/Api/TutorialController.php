<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TutorialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TutorialController extends Controller
{
    public function __construct(
        protected TutorialService $tutorialService
    ) {}

    /**
     * Get all tutorials for the user's role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tutorials = $this->tutorialService->getTutorialsWithStatus($user, $role);
        $stats = $this->tutorialService->getStats($user, $role);

        return response()->json([
            'success' => true,
            'data' => [
                'tutorials' => $tutorials,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Get a specific tutorial by ID.
     */
    public function show(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tutorial = $this->tutorialService->getTutorial($tutorialId, $role);

        if (!$tutorial) {
            return response()->json([
                'success' => false,
                'error' => 'Tutorial not found',
            ], 404);
        }

        // Get completion status
        $completion = $this->tutorialService->getCompletion($user, $tutorialId);

        return response()->json([
            'success' => true,
            'data' => array_merge($tutorial, [
                'status' => [
                    'completed' => $completion?->completed ?? false,
                    'skipped' => $completion?->skipped ?? false,
                    'in_progress' => $completion?->isInProgress() ?? false,
                    'current_step' => $completion?->current_step ?? 0,
                    'started_at' => $completion?->started_at?->toIso8601String(),
                    'completed_at' => $completion?->completed_at?->toIso8601String(),
                ],
            ]),
        ]);
    }

    /**
     * Start a tutorial.
     */
    public function start(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $completion = $this->tutorialService->startTutorial($user, $tutorialId);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial started',
            'data' => [
                'tutorial_id' => $tutorialId,
                'current_step' => $completion->current_step,
                'started_at' => $completion->started_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Advance to next step in a tutorial.
     */
    public function advance(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $completion = $this->tutorialService->advanceStep($user, $tutorialId);

        return response()->json([
            'success' => true,
            'message' => 'Advanced to next step',
            'data' => [
                'tutorial_id' => $tutorialId,
                'current_step' => $completion->current_step,
            ],
        ]);
    }

    /**
     * Set current step in a tutorial.
     */
    public function setStep(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'step' => 'required|integer|min:0',
        ]);

        $completion = $this->tutorialService->setStep($user, $tutorialId, $validated['step']);

        return response()->json([
            'success' => true,
            'message' => 'Step updated',
            'data' => [
                'tutorial_id' => $tutorialId,
                'current_step' => $completion->current_step,
            ],
        ]);
    }

    /**
     * Complete a tutorial.
     */
    public function complete(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $completion = $this->tutorialService->completeTutorial($user, $tutorialId);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial completed',
            'data' => [
                'tutorial_id' => $tutorialId,
                'completed' => true,
                'completed_at' => $completion->completed_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Skip a tutorial.
     */
    public function skip(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $completion = $this->tutorialService->skipTutorial($user, $tutorialId);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial skipped',
            'data' => [
                'tutorial_id' => $tutorialId,
                'skipped' => true,
            ],
        ]);
    }

    /**
     * Reset a tutorial.
     */
    public function reset(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $completion = $this->tutorialService->resetTutorial($user, $tutorialId);

        return response()->json([
            'success' => true,
            'message' => 'Tutorial reset',
            'data' => [
                'tutorial_id' => $tutorialId,
                'current_step' => 0,
                'completed' => false,
                'skipped' => false,
            ],
        ]);
    }

    /**
     * Get tutorial completion status for all tutorials.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $status = $this->tutorialService->getStatus($user);
        $stats = $this->tutorialService->getStats($user, $role);

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $status,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Check if a tutorial should be shown.
     */
    public function shouldShow(Request $request, string $tutorialId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $shouldShow = $this->tutorialService->shouldShowTutorial($user, $tutorialId);

        return response()->json([
            'success' => true,
            'data' => [
                'tutorial_id' => $tutorialId,
                'should_show' => $shouldShow,
            ],
        ]);
    }

    /**
     * Get the authenticated user from various auth guards.
     */
    protected function getAuthenticatedUser(Request $request)
    {
        if ($user = auth('mahasiswa')->user()) {
            return $user;
        }
        
        if ($user = auth('dosen')->user()) {
            return $user;
        }
        
        if ($user = auth('web')->user()) {
            return $user;
        }

        return null;
    }

    /**
     * Get the user's role.
     */
    protected function getUserRole(Request $request): string
    {
        if (auth('dosen')->check()) {
            return 'dosen';
        }
        
        return 'mahasiswa';
    }
}
