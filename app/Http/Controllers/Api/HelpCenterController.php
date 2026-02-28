<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HelpFaq;
use App\Models\HelpFeedback;
use App\Models\HelpTroubleshooting;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class HelpCenterController extends Controller
{
    protected const CACHE_TTL = 3600;

    /**
     * Get all FAQs organized by category.
     */
    public function faqs(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->getAllFaqs(),
        ]);
    }

    /**
     * Get FAQs for a specific category.
     */
    public function faqsByCategory(Request $request, string $category): JsonResponse
    {
        $faqs = collect($this->getAllFaqs());
        $normalizedCategory = Str::slug($category);

        $categoryFaqs = $faqs->first(function (array $item) use ($normalizedCategory) {
            return Str::slug((string) ($item['id'] ?? '')) === $normalizedCategory
                || Str::slug((string) ($item['name'] ?? '')) === $normalizedCategory;
        });

        if (!$categoryFaqs) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $categoryFaqs,
        ]);
    }

    /**
     * Persist FAQ vote (helpful / not helpful).
     */
    public function rateFaq(Request $request, string $faqId): JsonResponse
    {
        $validated = $request->validate([
            'helpful' => 'required|boolean',
        ]);

        if (!Schema::hasTable('help_faqs') || !Schema::hasTable('help_faq_votes')) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ voting storage is not ready',
            ], 503);
        }

        $resolvedId = $this->extractFaqPrimaryKey($faqId);
        $faq = $resolvedId ? HelpFaq::query()->find($resolvedId) : null;

        if (!$faq) {
            return response()->json([
                'success' => false,
                'message' => 'FAQ not found',
            ], 404);
        }

        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $userType = $this->getUserRole();
        $voteType = $validated['helpful'] ? 'helpful' : 'not_helpful';

        $existingVote = DB::table('help_faq_votes')
            ->where('faq_id', $faq->id)
            ->where('user_type', $userType)
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            $counts = $this->resolveFaqVoteCounts($faq->id, $faq);

            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memberikan vote untuk pertanyaan ini.',
                'data' => [
                    'faq_id' => "faq-{$faq->id}",
                    'helpful' => $counts['helpful'],
                    'notHelpful' => $counts['notHelpful'],
                    'userVote' => $existingVote->vote_type === 'helpful' ? 'helpful' : 'notHelpful',
                    'alreadyVoted' => true,
                ],
            ], 409);
        }

        try {
            DB::transaction(function () use ($faq, $userType, $user, $voteType) {
                DB::table('help_faq_votes')->insert([
                    'faq_id' => $faq->id,
                    'user_type' => $userType,
                    'user_id' => $user->id,
                    'vote_type' => $voteType,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $column = $voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';
                $faq->increment($column);
            });
        } catch (QueryException $exception) {
            // Unique constraint: user already voted in parallel request.
            if ((string) $exception->getCode() === '23000') {
                $faq->refresh();
                $counts = $this->resolveFaqVoteCounts($faq->id, $faq);

                $voteRow = DB::table('help_faq_votes')
                    ->where('faq_id', $faq->id)
                    ->where('user_type', $userType)
                    ->where('user_id', $user->id)
                    ->first();

                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah memberikan vote untuk pertanyaan ini.',
                    'data' => [
                        'faq_id' => "faq-{$faq->id}",
                        'helpful' => $counts['helpful'],
                        'notHelpful' => $counts['notHelpful'],
                        'userVote' => ($voteRow?->vote_type ?? '') === 'helpful' ? 'helpful' : 'notHelpful',
                        'alreadyVoted' => true,
                    ],
                ], 409);
            }

            throw $exception;
        }

        $faq->refresh();
        $counts = $this->resolveFaqVoteCounts($faq->id, $faq);

        Cache::forget('help_center_faqs');

        return response()->json([
            'success' => true,
            'message' => 'FAQ vote recorded',
            'data' => [
                'faq_id' => "faq-{$faq->id}",
                'helpful' => $counts['helpful'],
                'notHelpful' => $counts['notHelpful'],
                'userVote' => $voteType === 'helpful' ? 'helpful' : 'notHelpful',
                'alreadyVoted' => false,
            ],
        ]);
    }

    /**
     * Search FAQs and troubleshooting guides.
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));

        if ($query === '') {
            return response()->json([
                'success' => true,
                'data' => [
                    'faqs' => [],
                    'troubleshooting' => [],
                    'query' => '',
                    'count' => 0,
                ],
            ]);
        }

        $queryLower = Str::lower($query);

        $faqResults = collect($this->getAllFaqs())
            ->flatMap(function (array $category) {
                $faqs = is_array($category['faqs'] ?? null) ? $category['faqs'] : [];

                return collect($faqs)->map(function (array $faq) use ($category) {
                    return [
                        ...$faq,
                        'category' => $category['name'] ?? 'Umum',
                        'category_id' => $category['id'] ?? 'umum',
                    ];
                });
            })
            ->filter(function (array $faq) use ($queryLower) {
                return Str::contains(Str::lower((string) ($faq['question'] ?? '')), $queryLower)
                    || Str::contains(Str::lower((string) ($faq['answer'] ?? '')), $queryLower);
            })
            ->values();

        $troubleshootingResults = collect($this->getTroubleshootingGuides())
            ->filter(function (array $guide) use ($queryLower) {
                $searchable = implode(' ', [
                    (string) ($guide['title'] ?? ''),
                    (string) ($guide['problem'] ?? ''),
                    (string) ($guide['category'] ?? ''),
                ]);

                return Str::contains(Str::lower($searchable), $queryLower);
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'faqs' => $faqResults,
                'troubleshooting' => $troubleshootingResults,
                'query' => $query,
                'count' => $faqResults->count() + $troubleshootingResults->count(),
            ],
        ]);
    }

    /**
     * Get troubleshooting guides.
     */
    public function troubleshooting(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->getTroubleshootingGuides(),
        ]);
    }

    /**
     * Get video tutorials from backend source.
     */
    public function videos(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->getVideoTutorials(),
        ]);
    }

    /**
     * Track page view analytics event.
     */
    public function trackPageView(Request $request): JsonResponse
    {
        $this->storeAnalyticsEvent($request, 'page_view');

        return response()->json([
            'success' => true,
            'data' => [
                'tracked' => true,
            ],
        ]);
    }

    /**
     * Track search query analytics event.
     */
    public function trackSearch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2|max:255',
            'result_count' => 'nullable|integer|min:0',
        ]);

        $normalizedQuery = Str::lower(trim($validated['query']));

        $this->storeAnalyticsEvent(
            $request,
            'search_query',
            contentType: null,
            contentKey: null,
            query: $normalizedQuery,
            resultCount: (int) ($validated['result_count'] ?? 0),
        );

        return response()->json([
            'success' => true,
            'data' => [
                'tracked' => true,
            ],
        ]);
    }

    /**
     * Track article/video view and persist real-time counters.
     */
    public function trackView(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content_type' => 'required|string|in:faq,troubleshooting,video',
            'content_id' => 'required|string|max:120',
        ]);

        $contentType = $validated['content_type'];
        $contentId = trim($validated['content_id']);
        $viewCount = 0;

        if ($contentType === 'faq') {
            if (!Schema::hasTable('help_faqs')) {
                return response()->json([
                    'success' => false,
                    'message' => 'FAQ storage is not ready',
                ], 503);
            }

            $faqPrimaryKey = $this->extractFaqPrimaryKey($contentId);
            $faq = $faqPrimaryKey ? HelpFaq::query()->find($faqPrimaryKey) : null;

            if (!$faq) {
                return response()->json([
                    'success' => false,
                    'message' => 'FAQ not found',
                ], 404);
            }

            if (Schema::hasColumn('help_faqs', 'view_count')) {
                $faq->increment('view_count');
                $faq->refresh();
                $viewCount = (int) $faq->view_count;
            }

            Cache::forget('help_center_faqs');
            $contentId = "faq-{$faq->id}";

            $this->storeAnalyticsEvent(
                $request,
                'article_view',
                contentType: 'faq',
                contentKey: $contentId,
            );
        }

        if ($contentType === 'troubleshooting') {
            if (!Schema::hasTable('help_troubleshooting')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Troubleshooting storage is not ready',
                ], 503);
            }

            $guidePrimaryKey = $this->extractTroubleshootingPrimaryKey($contentId);
            $guide = $guidePrimaryKey ? HelpTroubleshooting::query()->find($guidePrimaryKey) : null;

            if (!$guide) {
                return response()->json([
                    'success' => false,
                    'message' => 'Troubleshooting guide not found',
                ], 404);
            }

            if (Schema::hasColumn('help_troubleshooting', 'view_count')) {
                $guide->increment('view_count');
                $guide->refresh();
                $viewCount = (int) $guide->view_count;
            }

            Cache::forget('help_center_troubleshooting');
            $contentId = "ts-{$guide->id}";

            $this->storeAnalyticsEvent(
                $request,
                'article_view',
                contentType: 'troubleshooting',
                contentKey: $contentId,
            );
        }

        if ($contentType === 'video') {
            if (Schema::hasTable('help_video_metrics')) {
                $existing = DB::table('help_video_metrics')
                    ->where('video_id', $contentId)
                    ->first();

                if ($existing) {
                    DB::table('help_video_metrics')
                        ->where('video_id', $contentId)
                        ->update([
                            'view_count' => DB::raw('view_count + 1'),
                            'last_viewed_at' => now(),
                            'updated_at' => now(),
                        ]);
                } else {
                    DB::table('help_video_metrics')->insert([
                        'video_id' => $contentId,
                        'view_count' => 1,
                        'last_viewed_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $viewCount = (int) DB::table('help_video_metrics')
                    ->where('video_id', $contentId)
                    ->value('view_count');
            }

            Cache::forget('help_center_videos');

            $this->storeAnalyticsEvent(
                $request,
                'video_view',
                contentType: 'video',
                contentKey: $contentId,
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'View tracked',
            'data' => [
                'content_type' => $contentType,
                'content_id' => $contentId,
                'view_count' => $viewCount,
            ],
        ]);
    }

    /**
     * Get mini analytics summary for Help page.
     */
    public function analyticsSummary(Request $request): JsonResponse
    {
        $topQueries = [];
        $topFaqs = [];
        $topVideos = [];

        $pageViews = 0;
        $searchCount = 0;
        $articleViews = 0;
        $videoViews = 0;

        if (Schema::hasTable('help_analytics_events')) {
            $events = DB::table('help_analytics_events');

            $pageViews = (int) (clone $events)->where('event_type', 'page_view')->count();
            $searchCount = (int) (clone $events)->where('event_type', 'search_query')->count();
            $articleViews = (int) (clone $events)->where('event_type', 'article_view')->count();
            $videoViews = (int) (clone $events)->where('event_type', 'video_view')->count();

            $topQueries = (clone $events)
                ->selectRaw('query, COUNT(*) as total, AVG(COALESCE(result_count, 0)) as avg_result_count')
                ->where('event_type', 'search_query')
                ->whereNotNull('query')
                ->where('query', '!=', '')
                ->groupBy('query')
                ->orderByDesc('total')
                ->limit(5)
                ->get()
                ->map(fn ($row) => [
                    'query' => (string) $row->query,
                    'count' => (int) $row->total,
                    'avg_result_count' => round((float) $row->avg_result_count, 2),
                ])
                ->all();
        }

        if (Schema::hasTable('help_faqs')) {
            if (Schema::hasTable('help_faq_votes')) {
                $topFaqs = DB::table('help_faqs as f')
                    ->leftJoin(
                        DB::raw('(
                            SELECT faq_id,
                                SUM(CASE WHEN vote_type = "helpful" THEN 1 ELSE 0 END) as helpful_count,
                                SUM(CASE WHEN vote_type = "not_helpful" THEN 1 ELSE 0 END) as not_helpful_count
                            FROM help_faq_votes
                            GROUP BY faq_id
                        ) as v'),
                        'v.faq_id',
                        '=',
                        'f.id',
                    )
                    ->where('f.is_active', true)
                    ->selectRaw('
                        f.id,
                        f.question,
                        COALESCE(v.helpful_count, 0) as helpful,
                        COALESCE(v.not_helpful_count, 0) as not_helpful,
                        (COALESCE(v.helpful_count, 0) - COALESCE(v.not_helpful_count, 0)) as score
                    ')
                    ->orderByDesc('score')
                    ->orderByDesc('helpful')
                    ->orderBy('not_helpful')
                    ->limit(5)
                    ->get()
                    ->map(fn ($faq) => [
                        'id' => "faq-{$faq->id}",
                        'question' => (string) $faq->question,
                        'helpful' => (int) $faq->helpful,
                        'notHelpful' => (int) $faq->not_helpful,
                        'score' => (int) $faq->score,
                    ])
                    ->all();
            } else {
                $topFaqs = HelpFaq::query()
                    ->where('is_active', true)
                    ->orderByDesc('helpful_count')
                    ->orderBy('not_helpful_count')
                    ->limit(5)
                    ->get()
                    ->map(fn (HelpFaq $faq) => [
                        'id' => "faq-{$faq->id}",
                        'question' => $faq->question,
                        'helpful' => (int) $faq->helpful_count,
                        'notHelpful' => (int) $faq->not_helpful_count,
                        'score' => (int) $faq->helpful_count - (int) $faq->not_helpful_count,
                    ])
                    ->all();
            }
        }

        if (Schema::hasTable('help_video_metrics')) {
            $videoMap = collect($this->getVideoTutorials())->keyBy('id');

            $topVideos = DB::table('help_video_metrics')
                ->select(['video_id', 'view_count'])
                ->orderByDesc('view_count')
                ->limit(5)
                ->get()
                ->map(function ($row) use ($videoMap) {
                    $videoId = (string) $row->video_id;
                    $video = $videoMap->get($videoId);

                    return [
                        'id' => $videoId,
                        'title' => (string) ($video['title'] ?? $videoId),
                        'views' => (int) $row->view_count,
                    ];
                })
                ->all();
        }

        $ctr = $pageViews > 0 ? round(($videoViews / $pageViews) * 100, 2) : 0.0;

        return response()->json([
            'success' => true,
            'data' => [
                'totals' => [
                    'page_views' => $pageViews,
                    'searches' => $searchCount,
                    'article_views' => $articleViews,
                    'video_views' => $videoViews,
                ],
                'video_ctr' => [
                    'clicks' => $videoViews,
                    'page_views' => $pageViews,
                    'ctr_percent' => $ctr,
                ],
                'top_queries' => $topQueries,
                'top_faqs' => $topFaqs,
                'top_videos' => $topVideos,
            ],
        ]);
    }

    /**
     * Submit feedback or support ticket.
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:question,bug,suggestion,feature,other',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'email' => 'sometimes|email',
        ]);

        if (!Schema::hasTable('help_feedback')) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback storage is not ready',
            ], 503);
        }

        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $userType = $this->getUserRole();
        $userName = (string) ($user->nama ?? $user->name ?? 'Pengguna');
        $userEmail = (string) ($validated['email'] ?? $user->email ?? '');
        $category = $validated['category'] === 'feature' ? 'suggestion' : $validated['category'];

        $ticket = HelpFeedback::query()->create([
            'user_type' => $userType,
            'user_id' => $user->id,
            'user_name' => $userName,
            'user_email' => $userEmail,
            'category' => $category,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully. We will respond within 24 hours.',
            'data' => [
                'ticket_id' => 'HLP-' . str_pad((string) $ticket->id, 6, '0', STR_PAD_LEFT),
                'submitted_at' => $ticket->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get contact information.
     */
    public function contact(): JsonResponse
    {
        $activeTickets = 0;

        if (Schema::hasTable('help_feedback')) {
            $user = $this->getAuthenticatedUser();

            if ($user) {
                $activeTickets = HelpFeedback::query()
                    ->where('user_type', $this->getUserRole())
                    ->where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'replied'])
                    ->count();
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'email' => 'support@absensi.unpam.ac.id',
                'phone' => '+62 21 7412566',
                'whatsapp' => '+62 812-3456-7890',
                'support_hours' => 'Senin - Jumat, 08:00 - 17:00 WIB',
                'response_time' => '1-2 hari kerja',
                'active_tickets' => $activeTickets,
            ],
        ]);
    }

    /**
     * Build FAQs from database with cache.
     */
    protected function getAllFaqs(): array
    {
        $faqs = Cache::remember('help_center_faqs', self::CACHE_TTL, function () {
            if (!Schema::hasTable('help_faqs')) {
                return $this->getDefaultFaqs();
            }

            $hasViewCount = Schema::hasColumn('help_faqs', 'view_count');

            $faqs = HelpFaq::query()
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('order')
                ->orderBy('id')
                ->get();

            if ($faqs->isEmpty()) {
                return $this->getDefaultFaqs();
            }

            return $faqs
                ->groupBy('category')
                ->map(function ($items, string $category) use ($hasViewCount) {
                    $slug = Str::slug($category);

                    return [
                        'id' => $slug,
                        'name' => $category,
                        'description' => $this->resolveCategoryDescription($category),
                        'icon' => $this->resolveCategoryIcon($category),
                        'faqs' => $items
                            ->map(function (HelpFaq $faq) use ($slug, $hasViewCount) {
                                return [
                                    'id' => "faq-{$faq->id}",
                                    'question' => $faq->question,
                                    'answer' => $faq->answer,
                                    'category' => $slug,
                                    'helpful' => (int) $faq->helpful_count,
                                    'notHelpful' => (int) $faq->not_helpful_count,
                                    'views' => $hasViewCount ? (int) $faq->view_count : 0,
                                    'lastUpdated' => $faq->updated_at?->toIso8601String(),
                                ];
                            })
                            ->values()
                            ->all(),
                    ];
                })
                ->values()
                ->all();
        });

        if (!Schema::hasTable('help_faq_votes')) {
            return $faqs;
        }

        $voteCountMap = DB::table('help_faq_votes')
            ->selectRaw('
                faq_id,
                SUM(CASE WHEN vote_type = "helpful" THEN 1 ELSE 0 END) as helpful_count,
                SUM(CASE WHEN vote_type = "not_helpful" THEN 1 ELSE 0 END) as not_helpful_count
            ')
            ->groupBy('faq_id')
            ->get()
            ->keyBy('faq_id');

        $user = $this->getAuthenticatedUser();
        $votesMap = $user
            ? DB::table('help_faq_votes')
                ->where('user_type', $this->getUserRole())
                ->where('user_id', $user->id)
                ->pluck('vote_type', 'faq_id')
            : collect();

        return collect($faqs)
            ->map(function (array $category) use ($votesMap, $voteCountMap) {
                $faqRows = is_array($category['faqs'] ?? null) ? $category['faqs'] : [];

                $category['faqs'] = collect($faqRows)
                    ->map(function (array $faq) use ($votesMap, $voteCountMap) {
                        $primaryKey = $this->extractFaqPrimaryKey((string) ($faq['id'] ?? ''));
                        $voteType = $primaryKey ? $votesMap->get($primaryKey) : null;
                        $countRow = $primaryKey ? $voteCountMap->get($primaryKey) : null;

                        return [
                            ...$faq,
                            'helpful' => $countRow
                                ? (int) ($countRow->helpful_count ?? 0)
                                : (int) ($faq['helpful'] ?? 0),
                            'notHelpful' => $countRow
                                ? (int) ($countRow->not_helpful_count ?? 0)
                                : (int) ($faq['notHelpful'] ?? 0),
                            'userVote' => match ($voteType) {
                                'helpful' => 'helpful',
                                'not_helpful' => 'notHelpful',
                                default => null,
                            },
                        ];
                    })
                    ->values()
                    ->all();

                return $category;
            })
            ->values()
            ->all();
    }

    protected function resolveFaqVoteCounts(int $faqId, ?HelpFaq $faq = null): array
    {
        if (Schema::hasTable('help_faq_votes')) {
            $row = DB::table('help_faq_votes')
                ->where('faq_id', $faqId)
                ->selectRaw('
                    SUM(CASE WHEN vote_type = "helpful" THEN 1 ELSE 0 END) as helpful_count,
                    SUM(CASE WHEN vote_type = "not_helpful" THEN 1 ELSE 0 END) as not_helpful_count
                ')
                ->first();

            return [
                'helpful' => (int) ($row->helpful_count ?? 0),
                'notHelpful' => (int) ($row->not_helpful_count ?? 0),
            ];
        }

        return [
            'helpful' => (int) ($faq?->helpful_count ?? 0),
            'notHelpful' => (int) ($faq?->not_helpful_count ?? 0),
        ];
    }

    /**
     * Build troubleshooting data from database with cache.
     */
    protected function getTroubleshootingGuides(): array
    {
        return Cache::remember('help_center_troubleshooting', self::CACHE_TTL, function () {
            if (!Schema::hasTable('help_troubleshooting')) {
                return $this->getDefaultTroubleshootingGuides();
            }

            $hasViewCount = Schema::hasColumn('help_troubleshooting', 'view_count');

            $guides = HelpTroubleshooting::query()
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('order')
                ->orderBy('id')
                ->get();

            if ($guides->isEmpty()) {
                return $this->getDefaultTroubleshootingGuides();
            }

            return $guides
                ->map(function (HelpTroubleshooting $guide) use ($hasViewCount) {
                    $steps = $this->decodeTroubleshootingSteps($guide->steps);

                    return [
                        'id' => "ts-{$guide->id}",
                        'title' => $guide->title,
                        'problem' => $guide->description,
                        'symptoms' => [],
                        'solutions' => collect($steps)
                            ->values()
                            ->map(fn (string $step, int $index) => [
                                'step' => $index + 1,
                                'title' => 'Langkah ' . ($index + 1),
                                'description' => $step,
                            ])
                            ->all(),
                        'category' => Str::slug($guide->category),
                        'severity' => $this->resolveTroubleshootingSeverity($guide->category),
                        'estimatedTime' => $this->resolveTroubleshootingTime($steps),
                        'views' => $hasViewCount ? (int) $guide->view_count : 0,
                        'lastUpdated' => $guide->updated_at?->toIso8601String(),
                    ];
                })
                ->values()
                ->all();
        });
    }

    /**
     * Build video tutorials from backend JSON source with cache.
     */
    protected function getVideoTutorials(): array
    {
        return Cache::remember('help_center_videos', self::CACHE_TTL, function () {
            $filePath = resource_path('docs/help-videos-mahasiswa.json');

            if (File::exists($filePath)) {
                $decoded = json_decode((string) File::get($filePath), true);
                if (is_array($decoded)) {
                    $videos = $this->normalizeVideoPayload($decoded);
                    if (!empty($videos)) {
                        return $videos;
                    }
                }
            }

            return [
                [
                    'id' => 'video-default-onboarding',
                    'title' => 'Onboarding Sistem untuk Mahasiswa Baru',
                    'description' => 'Pengenalan menu inti dan alur belajar awal pada aplikasi mahasiswa.',
                    'duration' => '09:40',
                    'category' => 'Onboarding',
                    'url' => 'https://www.youtube.com/embed/aqz-KE-bpKQ',
                    'thumbnail' => 'https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
                    'views' => 0,
                ],
            ];
        });
    }

    protected function normalizeVideoPayload(array $rows): array
    {
        $metrics = collect();

        if (Schema::hasTable('help_video_metrics')) {
            $metrics = DB::table('help_video_metrics')
                ->select(['video_id', 'view_count'])
                ->get()
                ->keyBy('video_id');
        }

        return collect($rows)
            ->map(function ($row) use ($metrics) {
                if (!is_array($row)) {
                    return null;
                }

                $id = trim((string) ($row['id'] ?? ''));
                $title = trim((string) ($row['title'] ?? ''));
                $url = trim((string) ($row['url'] ?? ''));

                if ($id === '' || $title === '' || $url === '') {
                    return null;
                }

                $persistedViews = (int) ($metrics->get($id)->view_count ?? 0);
                $defaultViews = (int) ($row['views'] ?? 0);

                return [
                    'id' => $id,
                    'title' => $title,
                    'description' => trim((string) ($row['description'] ?? '')),
                    'duration' => trim((string) ($row['duration'] ?? '0:00')),
                    'category' => trim((string) ($row['category'] ?? 'Tutorial')),
                    'url' => $url,
                    'thumbnail' => trim((string) ($row['thumbnail'] ?? '')),
                    'views' => max($persistedViews, $defaultViews),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    protected function decodeTroubleshootingSteps(mixed $steps): array
    {
        if (is_string($steps)) {
            $decoded = json_decode($steps, true);
            if (is_array($decoded)) {
                return collect($decoded)
                    ->map(fn ($step) => trim((string) $step))
                    ->filter()
                    ->values()
                    ->all();
            }

            return array_values(array_filter(array_map('trim', preg_split('/\R+/', $steps) ?: [])));
        }

        if (is_array($steps)) {
            return collect($steps)
                ->map(fn ($step) => trim((string) $step))
                ->filter()
                ->values()
                ->all();
        }

        return [];
    }

    protected function resolveCategoryIcon(string $category): string
    {
        $normalized = Str::lower($category);

        return match (true) {
            Str::contains($normalized, 'absensi') => 'QrCode',
            Str::contains($normalized, 'tugas') => 'ClipboardList',
            Str::contains($normalized, 'izin') => 'FileCheck',
            Str::contains($normalized, 'akun'), Str::contains($normalized, 'profil') => 'UserCircle',
            Str::contains($normalized, 'teknis') => 'Wrench',
            default => 'HelpCircle',
        };
    }

    protected function resolveCategoryDescription(string $category): string
    {
        $normalized = Str::lower($category);

        return match (true) {
            Str::contains($normalized, 'absensi') => 'Panduan absensi QR, verifikasi lokasi, dan validasi kehadiran mahasiswa.',
            Str::contains($normalized, 'tugas') => 'Alur pengumpulan tugas, batas waktu, revisi, dan pemantauan nilai.',
            Str::contains($normalized, 'izin') => 'Panduan pengajuan izin/sakit beserta dokumen pendukung dan status verifikasi.',
            Str::contains($normalized, 'akun'), Str::contains($normalized, 'profil') => 'Pengaturan akun, keamanan password, dan manajemen profil pengguna.',
            Str::contains($normalized, 'teknis') => 'Solusi kendala teknis aplikasi dan troubleshooting masalah umum.',
            default => 'Informasi bantuan terkait penggunaan fitur mahasiswa.',
        };
    }

    protected function resolveTroubleshootingSeverity(string $category): string
    {
        $normalized = Str::lower($category);

        return match (true) {
            Str::contains($normalized, 'teknis') => 'high',
            Str::contains($normalized, 'absensi') => 'medium',
            default => 'low',
        };
    }

    protected function resolveTroubleshootingTime(array $steps): string
    {
        $count = count($steps);

        if ($count <= 2) {
            return '5 menit';
        }

        if ($count <= 4) {
            return '10 menit';
        }

        return '15 menit';
    }

    protected function extractFaqPrimaryKey(string $faqId): ?int
    {
        if (ctype_digit($faqId)) {
            return (int) $faqId;
        }

        if (preg_match('/faq-?(\d+)/i', $faqId, $matches) === 1) {
            return (int) $matches[1];
        }

        return null;
    }

    protected function extractTroubleshootingPrimaryKey(string $guideId): ?int
    {
        if (ctype_digit($guideId)) {
            return (int) $guideId;
        }

        if (preg_match('/ts-?(\d+)/i', $guideId, $matches) === 1) {
            return (int) $matches[1];
        }

        return null;
    }

    protected function storeAnalyticsEvent(
        Request $request,
        string $eventType,
        ?string $contentType = null,
        ?string $contentKey = null,
        ?string $query = null,
        ?int $resultCount = null,
        array $meta = [],
    ): void {
        if (!Schema::hasTable('help_analytics_events')) {
            return;
        }

        $user = $this->getAuthenticatedUser();

        DB::table('help_analytics_events')->insert([
            'user_type' => $user ? $this->getUserRole() : null,
            'user_id' => $user?->id,
            'event_type' => $eventType,
            'content_type' => $contentType,
            'content_key' => $contentKey,
            'query' => $query,
            'result_count' => $resultCount,
            'meta' => empty($meta) ? null : json_encode($meta),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function getAuthenticatedUser(): mixed
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

    protected function getUserRole(): string
    {
        if (auth('dosen')->check()) {
            return 'dosen';
        }

        if (auth('web')->check()) {
            return 'admin';
        }

        return 'mahasiswa';
    }

    /**
     * Default fallback FAQs.
     */
    protected function getDefaultFaqs(): array
    {
        return [
            [
                'id' => 'umum',
                'name' => 'Umum',
                'description' => 'Informasi dasar penggunaan sistem bantuan mahasiswa.',
                'icon' => 'HelpCircle',
                'faqs' => [
                    [
                        'id' => 'faq-1',
                        'question' => 'Bagaimana cara menggunakan pusat bantuan?',
                        'answer' => 'Gunakan pencarian di bagian header atau buka kategori FAQ untuk menemukan jawaban paling relevan.',
                        'category' => 'umum',
                        'helpful' => 0,
                        'notHelpful' => 0,
                        'views' => 0,
                        'lastUpdated' => now()->toIso8601String(),
                    ],
                ],
            ],
        ];
    }

    /**
     * Default fallback troubleshooting guides.
     */
    protected function getDefaultTroubleshootingGuides(): array
    {
        return [
            [
                'id' => 'ts-1',
                'title' => 'Koneksi Internet Bermasalah',
                'problem' => 'Aplikasi lambat atau data tidak bisa dimuat.',
                'symptoms' => [],
                'solutions' => [
                    [
                        'step' => 1,
                        'title' => 'Periksa koneksi internet',
                        'description' => 'Pastikan jaringan stabil sebelum memuat ulang halaman.',
                    ],
                ],
                'category' => 'teknis',
                'severity' => 'medium',
                'estimatedTime' => '5 menit',
                'views' => 0,
                'lastUpdated' => now()->toIso8601String(),
            ],
        ];
    }
}
