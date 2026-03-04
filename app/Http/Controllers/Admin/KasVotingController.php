<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\KasVote;
use App\Models\KasVoting;
use App\Models\Mahasiswa;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KasVotingController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $status = $request->get('status', 'all');

        $query = KasVoting::with(['creator', 'votes.mahasiswa'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $votings = $query->get()->map(function ($voting) {
            $stats = $voting->getVoteStats();
            
            return [
                'id' => $voting->id,
                'title' => $voting->title,
                'description' => $voting->description,
                'amount' => $voting->amount,
                'category' => $voting->category,
                'status' => $voting->status,
                'creator' => $voting->creator ? [
                    'id' => $voting->creator->id,
                    'nama' => $voting->creator->nama,
                    'nim' => $voting->creator->nim,
                ] : null,
                'voting_deadline' => $voting->voting_deadline->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'is_expired' => now()->gt($voting->voting_deadline),
                'min_votes' => $voting->min_votes,
                'approval_threshold' => $voting->approval_threshold,
                'stats' => $stats,
                'votes' => $voting->votes->map(fn($vote) => [
                    'id' => $vote->id,
                    'mahasiswa' => $vote->mahasiswa ? [
                        'id' => $vote->mahasiswa->id,
                        'nama' => $vote->mahasiswa->nama,
                        'nim' => $vote->mahasiswa->nim,
                    ] : null,
                    'vote' => $vote->vote,
                    'comment' => $vote->comment,
                    'created_at' => $vote->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                ]),
                'created_at' => $voting->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
            ];
        });

        // Stats
        $stats = [
            'total' => KasVoting::count(),
            'open' => KasVoting::where('status', 'open')->count(),
            'approved' => KasVoting::where('status', 'approved')->count(),
            'rejected' => KasVoting::where('status', 'rejected')->count(),
            'closed' => KasVoting::where('status', 'closed')->count(),
        ];

        return Inertia::render('admin/kas-voting', [
            'votings' => $votings,
            'stats' => $stats,
            'filters' => ['status' => $status],
        ]);
    }

    public function show(KasVoting $voting): InertiaResponse
    {
        $voting->load(['creator', 'votes.mahasiswa']);

        $stats = $voting->getVoteStats();
        $totalEligibleVoters = (int) Mahasiswa::count();
        $participationRate = $totalEligibleVoters > 0
            ? round(($stats['total'] / $totalEligibleVoters) * 100, 1)
            : 0.0;

        $votes = $voting->votes
            ->sortByDesc('created_at')
            ->values()
            ->map(function (KasVote $vote) {
                return [
                    'id' => (int) $vote->id,
                    'mahasiswa' => $vote->mahasiswa ? [
                        'id' => (int) $vote->mahasiswa->id,
                        'nama' => (string) $vote->mahasiswa->nama,
                        'nim' => (string) ($vote->mahasiswa->nim ?? '-'),
                        'kelas' => (string) ($vote->mahasiswa->kelas ?? '-'),
                    ] : [
                        'id' => null,
                        'nama' => 'Tidak diketahui',
                        'nim' => '-',
                        'kelas' => '-',
                    ],
                    'vote' => (string) $vote->vote,
                    'comment' => $vote->comment,
                    'created_at' => $vote->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
                    'created_at_iso' => $vote->created_at?->toIso8601String(),
                ];
            });

        $timelineSource = $voting->votes->sortBy('created_at')->values();
        $cumulativeApprove = 0;
        $cumulativeReject = 0;
        $voteTimeline = $timelineSource->map(function (KasVote $vote) use (&$cumulativeApprove, &$cumulativeReject) {
            if ($vote->vote === 'approve') {
                $cumulativeApprove++;
            } else {
                $cumulativeReject++;
            }

            return [
                'at' => $vote->created_at?->timezone('Asia/Jakarta')->format('d M H:i') ?? '-',
                'approve' => $cumulativeApprove,
                'reject' => $cumulativeReject,
                'total' => $cumulativeApprove + $cumulativeReject,
            ];
        })->values();

        $hourlyPattern = collect(range(0, 23))
            ->map(function (int $hour) use ($voting) {
                $approve = $voting->votes
                    ->filter(fn(KasVote $vote) => $vote->created_at && (int) $vote->created_at->hour === $hour && $vote->vote === 'approve')
                    ->count();
                $reject = $voting->votes
                    ->filter(fn(KasVote $vote) => $vote->created_at && (int) $vote->created_at->hour === $hour && $vote->vote === 'reject')
                    ->count();

                return [
                    'hour' => sprintf('%02d:00', $hour),
                    'approve' => $approve,
                    'reject' => $reject,
                    'total' => $approve + $reject,
                ];
            })
            ->values();

        $demographicBreakdown = $voting->votes
            ->groupBy(fn(KasVote $vote) => (string) ($vote->mahasiswa?->kelas ?: 'Tidak diketahui'))
            ->map(function ($group, string $kelas) {
                $approve = $group->where('vote', 'approve')->count();
                $reject = $group->where('vote', 'reject')->count();

                return [
                    'label' => $kelas,
                    'approve' => $approve,
                    'reject' => $reject,
                    'total' => $approve + $reject,
                ];
            })
            ->sortByDesc('total')
            ->values();

        $commentThreads = $voting->votes
            ->filter(fn(KasVote $vote) => filled($vote->comment))
            ->sortByDesc('created_at')
            ->values()
            ->map(function (KasVote $vote) {
                return [
                    'id' => (int) $vote->id,
                    'nama' => (string) ($vote->mahasiswa?->nama ?? 'Tidak diketahui'),
                    'nim' => (string) ($vote->mahasiswa?->nim ?? '-'),
                    'vote' => (string) $vote->vote,
                    'comment' => (string) $vote->comment,
                    'created_at' => $vote->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
                ];
            });

        $similarVotings = KasVoting::query()
            ->where('id', '!=', $voting->id)
            ->where('category', $voting->category)
            ->with('creator')
            ->latest()
            ->limit(8)
            ->get()
            ->map(function (KasVoting $item) {
                $itemStats = $item->getVoteStats();

                return [
                    'id' => (int) $item->id,
                    'title' => (string) $item->title,
                    'status' => (string) $item->status,
                    'amount' => (float) $item->amount,
                    'approval_percentage' => (float) $itemStats['approval_percentage'],
                    'total_votes' => (int) $itemStats['total'],
                    'created_at' => $item->created_at?->timezone('Asia/Jakarta')->format('d M Y') ?? '-',
                    'creator' => (string) ($item->creator?->nama ?? '-'),
                ];
            });

        $summary = KasSummary::getSummary();
        $currentBalance = (float) $summary->total_balance;
        $projectedBalance = $currentBalance - (float) $voting->amount;
        $budgetImpactPercent = $currentBalance > 0
            ? round(((float) $voting->amount / $currentBalance) * 100, 1)
            : 0.0;

        $categoryExpenseTotal = (float) Kas::query()
            ->where('type', 'expense')
            ->where('category', $voting->category)
            ->sum('amount');

        $monthlyCategorySpending = Kas::query()
            ->selectRaw("DATE_FORMAT(period_date, '%Y-%m') as month, SUM(amount) as total")
            ->where('type', 'expense')
            ->where('category', $voting->category)
            ->whereDate('period_date', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($row) {
                $monthLabel = (string) $row->month;
                $formattedLabel = Carbon::createFromFormat('Y-m', $monthLabel)
                    ->locale('id')
                    ->translatedFormat('M y');

                return [
                    'month' => $monthLabel,
                    'label' => $formattedLabel,
                    'total' => round((float) $row->total, 2),
                ];
            })
            ->values();

        $relatedTransactions = Kas::query()
            ->where('type', 'expense')
            ->where(function (Builder $query) use ($voting) {
                $query
                    ->where('category', $voting->category)
                    ->orWhere('description', 'like', '%' . $voting->title . '%');
            })
            ->latest('period_date')
            ->limit(15)
            ->get()
            ->map(function (Kas $expense) {
                return [
                    'id' => (int) $expense->id,
                    'description' => (string) $expense->description,
                    'category' => (string) $expense->category,
                    'amount' => (float) $expense->amount,
                    'status' => (string) $expense->status,
                    'period_date' => $expense->period_date?->timezone('Asia/Jakarta')->format('d M Y') ?? '-',
                ];
            });

        $approvedCategoryAverage = (float) (KasVoting::query()
            ->where('id', '!=', $voting->id)
            ->where('category', $voting->category)
            ->where('status', 'approved')
            ->avg('amount') ?? 0);

        $activityEvents = collect();

        $activityEvents->push([
            'type' => 'create',
            'title' => 'Usulan voting dibuat',
            'description' => 'Usulan dibuat oleh ' . ($voting->creator?->nama ?? 'Mahasiswa'),
            'by' => $voting->creator?->nama ?? 'Sistem',
            'at' => $voting->created_at?->toIso8601String(),
            'at_human' => $voting->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
        ]);

        foreach ($timelineSource as $vote) {
            $activityEvents->push([
                'type' => 'vote',
                'title' => $vote->vote === 'approve' ? 'Vote setuju masuk' : 'Vote tolak masuk',
                'description' => 'Suara dari ' . ($vote->mahasiswa?->nama ?? 'Mahasiswa'),
                'by' => $vote->mahasiswa?->nama ?? 'Mahasiswa',
                'at' => $vote->created_at?->toIso8601String(),
                'at_human' => $vote->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
            ]);
        }

        if ($voting->status !== 'open' && $voting->updated_at?->notEqualTo($voting->created_at)) {
            $activityEvents->push([
                'type' => 'status',
                'title' => 'Status voting diperbarui',
                'description' => 'Status saat ini: ' . strtoupper($voting->status),
                'by' => 'Admin/Sistem',
                'at' => $voting->updated_at?->toIso8601String(),
                'at_human' => $voting->updated_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
            ]);
        }

        $adminLogs = AdminActivityLog::query()
            ->where('model_type', KasVoting::class)
            ->where('model_id', $voting->id)
            ->latest()
            ->limit(25)
            ->get();

        foreach ($adminLogs as $log) {
            $activityEvents->push([
                'type' => 'admin',
                'title' => 'Aksi admin: ' . strtoupper((string) $log->action),
                'description' => (string) ($log->description ?: 'Perubahan data voting'),
                'by' => 'Admin',
                'at' => $log->created_at?->toIso8601String(),
                'at_human' => $log->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
            ]);
        }

        $activityEvents = $activityEvents
            ->filter(fn(array $event) => filled($event['at']))
            ->sortByDesc(fn(array $event) => Carbon::parse((string) $event['at'])->timestamp)
            ->values()
            ->take(120);

        $voteVelocity = $voting->votes
            ->filter(fn(KasVote $vote) => $vote->created_at && $vote->created_at->gte(now()->subHour()))
            ->count();

        $consensusScore = $stats['total'] > 0
            ? round((max($stats['approve'], $stats['reject']) / $stats['total']) * 100, 1)
            : 0.0;

        return Inertia::render('admin/kas-voting-detail', [
            'voting' => [
                'id' => (int) $voting->id,
                'title' => (string) $voting->title,
                'description' => (string) $voting->description,
                'amount' => (float) $voting->amount,
                'category' => (string) $voting->category,
                'status' => (string) $voting->status,
                'creator' => $voting->creator ? [
                    'id' => (int) $voting->creator->id,
                    'nama' => (string) $voting->creator->nama,
                    'nim' => (string) ($voting->creator->nim ?? '-'),
                ] : null,
                'voting_deadline' => $voting->voting_deadline?->toIso8601String(),
                'voting_deadline_human' => $voting->voting_deadline?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
                'is_expired' => now()->gt($voting->voting_deadline),
                'min_votes' => (int) $voting->min_votes,
                'approval_threshold' => (float) $voting->approval_threshold,
                'stats' => [
                    'approve' => (int) $stats['approve'],
                    'reject' => (int) $stats['reject'],
                    'total' => (int) $stats['total'],
                    'approval_percentage' => (float) $stats['approval_percentage'],
                    'is_valid' => (bool) $stats['is_valid'],
                ],
                'participation_rate' => $participationRate,
                'vote_velocity' => $voteVelocity,
                'created_at' => $voting->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
                'updated_at' => $voting->updated_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '-',
                'votes' => $votes,
            ],
            'totalEligibleVoters' => $totalEligibleVoters,
            'analytics' => [
                'timeline' => $voteTimeline,
                'hourly_pattern' => $hourlyPattern,
                'demographic_breakdown' => $demographicBreakdown,
                'comment_threads' => $commentThreads,
                'consensus_score' => $consensusScore,
            ],
            'financial' => [
                'current_balance' => round($currentBalance, 2),
                'projected_balance' => round($projectedBalance, 2),
                'budget_impact_percent' => $budgetImpactPercent,
                'category_expense_total' => round($categoryExpenseTotal, 2),
                'summary' => [
                    'total_income' => (float) $summary->total_income,
                    'total_expense' => (float) $summary->total_expense,
                    'total_balance' => (float) $summary->total_balance,
                ],
                'monthly_category_spending' => $monthlyCategorySpending,
                'related_transactions' => $relatedTransactions,
            ],
            'comparison' => [
                'similar_votings' => $similarVotings,
                'category_approved_average' => round($approvedCategoryAverage, 2),
            ],
            'activityLog' => $activityEvents,
            'discussionCount' => $commentThreads->count(),
            'refreshedAt' => now()->toIso8601String(),
        ]);
    }

    /**
     * Approve voting manually by admin
     */
    public function approve(KasVoting $voting): RedirectResponse
    {
        if ($voting->status !== 'open') {
            return back()->withErrors(['error' => 'Voting sudah tidak aktif.']);
        }

        $oldStatus = $voting->status;
        $voting->update(['status' => 'approved']);

        AdminActivityLog::log(
            action: 'update',
            description: "Admin menyetujui voting kas #{$voting->id}",
            modelType: KasVoting::class,
            modelId: (int) $voting->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'approved']
        );

        // Create expense record
        Kas::create([
            'mahasiswa_id' => null,
            'type' => 'expense',
            'amount' => $voting->amount,
            'description' => "[Voting Disetujui Admin] {$voting->title}",
            'category' => $voting->category,
            'period_date' => now(),
            'status' => 'paid',
            'created_by' => $voting->created_by,
        ]);

        KasSummary::recalculate();

        return back()->with('success', 'Voting berhasil disetujui dan pengeluaran kas telah dicatat.');
    }

    /**
     * Reject voting manually by admin
     */
    public function reject(Request $request, KasVoting $voting): RedirectResponse
    {
        if ($voting->status !== 'open') {
            return back()->withErrors(['error' => 'Voting sudah tidak aktif.']);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus = $voting->status;
        $voting->update(['status' => 'rejected']);

        AdminActivityLog::log(
            action: 'update',
            description: "Admin menolak voting kas #{$voting->id}" . ($request->filled('reason') ? ' dengan alasan.' : '.'),
            modelType: KasVoting::class,
            modelId: (int) $voting->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'rejected', 'reason' => $request->input('reason')]
        );

        return back()->with('success', 'Voting berhasil ditolak.');
    }

    /**
     * Close voting without decision
     */
    public function close(KasVoting $voting): RedirectResponse
    {
        if ($voting->status !== 'open') {
            return back()->withErrors(['error' => 'Voting sudah tidak aktif.']);
        }

        $oldStatus = $voting->status;
        $voting->update(['status' => 'closed']);

        AdminActivityLog::log(
            action: 'update',
            description: "Admin menutup voting kas #{$voting->id} tanpa keputusan",
            modelType: KasVoting::class,
            modelId: (int) $voting->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'closed']
        );

        return back()->with('success', 'Voting berhasil ditutup.');
    }

    /**
     * Finalize voting based on votes
     */
    public function finalize(KasVoting $voting): RedirectResponse
    {
        if ($voting->status !== 'open') {
            return back()->withErrors(['error' => 'Voting sudah tidak aktif.']);
        }

        $oldStatus = $voting->status;
        $voting->checkAndFinalize();
        $newStatus = (string) $voting->fresh()->status;

        AdminActivityLog::log(
            action: 'update',
            description: "Admin memfinalisasi voting kas #{$voting->id} dengan status akhir {$newStatus}",
            modelType: KasVoting::class,
            modelId: (int) $voting->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $newStatus]
        );

        $message = match($newStatus) {
            'approved' => 'Voting disetujui berdasarkan hasil suara.',
            'rejected' => 'Voting ditolak berdasarkan hasil suara.',
            'closed' => 'Voting ditutup karena tidak memenuhi kuorum.',
            default => 'Status voting telah diperbarui.',
        };

        return back()->with('success', $message);
    }
}
