<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DocumentationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentationController extends Controller
{
    public function __construct(
        protected DocumentationService $documentationService
    ) {}

    /**
     * Get all guides for the user's role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $request->input('role', $this->getUserRole($request));

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $guides = $this->documentationService->getGuidesWithProgress($user, $role);

        return response()->json([
            'success' => true,
            'data' => [
                'guides' => $guides,
                'total' => $guides->count(),
            ],
        ]);
    }

    /**
     * Get a specific guide by ID.
     */
    public function show(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $guide = $this->documentationService->getGuide($guideId, $role);

        if (!$guide) {
            return response()->json([
                'success' => false,
                'error' => 'Guide not found',
            ], 404);
        }

        // Get progress for this guide
        $progress = $this->documentationService->getGuideProgress($user, $guideId);

        return response()->json([
            'success' => true,
            'data' => array_merge($guide, [
                'progress' => [
                    'completed_sections' => $progress?->completed_sections ?? [],
                    'is_completed' => $progress?->is_completed ?? false,
                    'completion_percentage' => $progress?->getCompletionPercentage() ?? 0,
                    'last_read_at' => $progress?->last_read_at?->toIso8601String(),
                ],
            ]),
        ]);
    }

    /**
     * Search guides.
     */
    public function search(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $query = $request->input('q', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $results = $this->documentationService->searchGuides($query, $role);

        return response()->json([
            'success' => true,
            'data' => $results,
            'meta' => [
                'query' => $query,
                'count' => $results->count(),
            ],
        ]);
    }

    /**
     * Get reading progress for the user.
     */
    public function progress(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $progress = $this->documentationService->getProgress($user);
        $stats = $this->documentationService->getStats($user, $role);

        return response()->json([
            'success' => true,
            'data' => [
                'progress' => $progress,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Update reading progress for a guide.
     */
    public function updateProgress(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'completed_sections' => 'required|array',
            'completed_sections.*' => 'string',
        ]);

        $progress = $this->documentationService->trackProgress(
            $user,
            $guideId,
            $validated['completed_sections']
        );

        return response()->json([
            'success' => true,
            'message' => 'Progress updated successfully',
            'data' => [
                'guide_id' => $guideId,
                'completed_sections' => $progress->completed_sections,
                'is_completed' => $progress->is_completed,
                'completion_percentage' => $progress->getCompletionPercentage(),
            ],
        ]);
    }

    /**
     * Get bookmarks for authenticated user.
     */
    public function bookmarks(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $bookmarks = $this->documentationService
            ->getBookmarks($user)
            ->map(fn ($item) => [
                'guide_id' => $item->guide_id,
                'notes' => $item->notes,
                'updated_at' => $item->updated_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $bookmarks,
        ]);
    }

    /**
     * Toggle bookmark state for a guide.
     */
    public function toggleBookmark(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $guide = $this->documentationService->getGuide($guideId, $role);
        if (!$guide) {
            return response()->json([
                'success' => false,
                'error' => 'Guide not found',
            ], 404);
        }

        $bookmarked = $this->documentationService->toggleBookmark($user, $guideId);

        return response()->json([
            'success' => true,
            'data' => [
                'guide_id' => $guideId,
                'bookmarked' => $bookmarked,
            ],
        ]);
    }

    /**
     * Get feedback (my feedback + aggregate stats) for a guide.
     */
    public function feedback(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $guide = $this->documentationService->getGuide($guideId, $role);
        if (!$guide) {
            return response()->json([
                'success' => false,
                'error' => 'Guide not found',
            ], 404);
        }

        $myFeedback = $this->documentationService->getMyFeedback($user, $guideId);
        $stats = $this->documentationService->getFeedbackStats($guideId);

        return response()->json([
            'success' => true,
            'data' => [
                'my_feedback' => [
                    'helpful' => $myFeedback?->helpful,
                    'rating' => $myFeedback?->rating,
                    'comment' => $myFeedback?->comment,
                    'updated_at' => $myFeedback?->updated_at?->toIso8601String(),
                ],
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Upsert feedback for a guide.
     */
    public function upsertFeedback(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $guide = $this->documentationService->getGuide($guideId, $role);
        if (!$guide) {
            return response()->json([
                'success' => false,
                'error' => 'Guide not found',
            ], 404);
        }

        $validated = $request->validate([
            'helpful' => 'nullable|boolean',
            'rating' => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $feedback = $this->documentationService->upsertFeedback($user, $guideId, $validated);
        $stats = $this->documentationService->getFeedbackStats($guideId);

        return response()->json([
            'success' => true,
            'message' => 'Feedback updated successfully',
            'data' => [
                'my_feedback' => [
                    'helpful' => $feedback->helpful,
                    'rating' => $feedback->rating,
                    'comment' => $feedback->comment,
                    'updated_at' => $feedback->updated_at?->toIso8601String(),
                ],
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Get offline downloads metadata for authenticated user.
     */
    public function offlineDownloads(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $downloads = $this->documentationService
            ->getOfflineDownloads($user)
            ->map(fn ($item) => [
                'guide_id' => $item->guide_id,
                'title' => $item->title,
                'version' => $item->version,
                'size_kb' => $item->size_kb,
                'downloaded_at' => $item->downloaded_at?->toIso8601String(),
                'updated_at' => $item->updated_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $downloads,
        ]);
    }

    /**
     * Upsert offline download metadata for a guide.
     */
    public function upsertOfflineDownload(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $this->getUserRole($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $guide = $this->documentationService->getGuide($guideId, $role);
        if (!$guide) {
            return response()->json([
                'success' => false,
                'error' => 'Guide not found',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'version' => 'nullable|string|max:100',
            'size_kb' => 'nullable|integer|min:0',
        ]);

        $download = $this->documentationService->upsertOfflineDownload($user, $guideId, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Offline download metadata saved',
            'data' => [
                'guide_id' => $download->guide_id,
                'title' => $download->title,
                'version' => $download->version,
                'size_kb' => $download->size_kb,
                'downloaded_at' => $download->downloaded_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Remove offline download metadata for a guide.
     */
    public function removeOfflineDownload(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $this->documentationService->removeOfflineDownload($user, $guideId);

        return response()->json([
            'success' => true,
            'message' => 'Offline download metadata removed',
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

    /**
     * Get progress for a specific guide.
     */
    public function guideProgress(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $progress = $this->documentationService->getGuideProgress($user, $guideId);

        if (!$progress) {
            // Return default progress
            return response()->json([
                'success' => true,
                'data' => [
                    'guideId' => $guideId,
                    'completedSections' => [],
                    'isCompleted' => false,
                    'completionPercentage' => 0,
                    'lastReadAt' => null,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'guideId' => $guideId,
                'completedSections' => $progress->completed_sections ?? [],
                'isCompleted' => $progress->is_completed ?? false,
                'completionPercentage' => $progress->getCompletionPercentage() ?? 0,
                'lastReadAt' => $progress->last_read_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update reading progress for a guide (PUT handler).
     */
    public function updateProgressPut(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Accept both formats: { sectionId, completed } and { completed_sections: [] }
        $sectionId = $request->input('sectionId');
        $completed = $request->input('completed', true);

        if ($sectionId) {
            $existingProgress = $this->documentationService->getGuideProgress($user, $guideId);
            $currentSections = $existingProgress?->completed_sections ?? [];

            $nextSections = $completed
                ? array_values(array_unique([...$currentSections, $sectionId]))
                : array_values(array_filter($currentSections, fn ($id) => $id !== $sectionId));

            $progress = $this->documentationService->trackProgress(
                $user,
                $guideId,
                $nextSections
            );
        } else {
            $completedSections = $request->input('completed_sections', []);
            $progress = $this->documentationService->trackProgress(
                $user,
                $guideId,
                $completedSections
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Progress updated successfully',
            'data' => [
                'guideId' => $guideId,
                'completedSections' => $progress->completed_sections ?? [],
                'isCompleted' => $progress->is_completed ?? false,
                'completionPercentage' => $progress->getCompletionPercentage() ?? 0,
            ],
        ]);
    }

    /**
     * Mark a guide as completed.
     */
    public function markComplete(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $progress = $this->documentationService->markGuideComplete($user, $guideId);

        return response()->json([
            'success' => true,
            'message' => 'Guide marked as completed',
            'data' => [
                'guideId' => $guideId,
                'completedSections' => $progress->completed_sections ?? [],
                'isCompleted' => true,
                'completionPercentage' => 100,
            ],
        ]);
    }

    /**
     * Reset progress for a guide.
     */
    public function resetProgress(Request $request, string $guideId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $this->documentationService->resetGuideProgress($user, $guideId);

        return response()->json([
            'success' => true,
            'message' => 'Progress reset successfully',
        ]);
    }

    /**
     * Get documentation stats.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $role = $request->input('role', $this->getUserRole($request));

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $stats = $this->documentationService->getStats($user, $role);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
