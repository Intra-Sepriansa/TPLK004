<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\KasVote;
use App\Models\KasVoting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KasVotingController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $mahasiswa = auth('mahasiswa')->user();
        $status = $request->get('status', 'open');

        $query = KasVoting::with('creator')
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $votings = $query->get()->map(fn (KasVoting $voting) => $this->transformVoting($voting, (int) $mahasiswa->id));

        // Stats
        $stats = [
            'open' => KasVoting::where('status', 'open')->count(),
            'approved' => KasVoting::where('status', 'approved')->count(),
            'rejected' => KasVoting::where('status', 'rejected')->count(),
        ];

        return Inertia::render('user/kas-voting', [
            'votings' => $votings,
            'stats' => $stats,
            'filters' => ['status' => $status],
        ]);
    }

    public function create(): InertiaResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        return Inertia::render('user/kas-voting-create', [
            'mahasiswa' => [
                'id' => (int) $mahasiswa->id,
                'nama' => (string) $mahasiswa->nama,
                'nim' => (string) $mahasiswa->nim,
            ],
            'stats' => [
                'open' => KasVoting::where('status', 'open')->count(),
                'approved' => KasVoting::where('status', 'approved')->count(),
                'rejected' => KasVoting::where('status', 'rejected')->count(),
            ],
            'defaults' => [
                'min_votes' => 10,
                'approval_threshold' => 60,
                'voting_duration_days' => 3,
            ],
        ]);
    }

    public function show(KasVoting $voting): InertiaResponse
    {
        $mahasiswa = auth('mahasiswa')->user();
        $voting->load([
            'creator:id,nama,nim',
            'votes.mahasiswa:id,nama,nim',
        ]);

        $stats = $voting->getVoteStats();
        $myVote = $voting->votes->firstWhere('mahasiswa_id', $mahasiswa->id);

        $relatedVotings = KasVoting::query()
            ->where('id', '!=', $voting->id)
            ->where('status', 'open')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function (KasVoting $item) {
                $itemStats = $item->getVoteStats();

                return [
                    'id' => (int) $item->id,
                    'title' => (string) $item->title,
                    'status' => (string) $item->status,
                    'approval_percentage' => (float) $itemStats['approval_percentage'],
                    'total_votes' => (int) $itemStats['total'],
                    'amount' => (float) $item->amount,
                ];
            })
            ->values();

        return Inertia::render('user/kas-voting-detail', [
            'voting' => [
                'id' => (int) $voting->id,
                'title' => (string) $voting->title,
                'description' => (string) $voting->description,
                'amount' => (float) $voting->amount,
                'category' => (string) $voting->category,
                'status' => (string) $voting->status,
                'creator' => [
                    'id' => $voting->creator?->id,
                    'nama' => (string) ($voting->creator?->nama ?? '-'),
                    'nim' => $voting->creator?->nim,
                ],
                'voting_deadline' => $voting->voting_deadline->toIso8601String(),
                'voting_deadline_human' => $voting->voting_deadline->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'is_expired' => now()->gt($voting->voting_deadline),
                'min_votes' => (int) $voting->min_votes,
                'approval_threshold' => (float) $voting->approval_threshold,
                'stats' => $stats,
                'my_vote' => $myVote?->vote,
                'my_comment' => $myVote?->comment,
                'created_at' => $voting->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'votes' => $voting->votes
                    ->sortByDesc('created_at')
                    ->values()
                    ->map(function (KasVote $vote) {
                        return [
                            'id' => (int) $vote->id,
                            'mahasiswa' => [
                                'id' => $vote->mahasiswa?->id,
                                'nama' => (string) ($vote->mahasiswa?->nama ?? '-'),
                                'nim' => $vote->mahasiswa?->nim,
                            ],
                            'vote' => (string) $vote->vote,
                            'comment' => $vote->comment,
                            'created_at' => $vote->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                        ];
                    }),
            ],
            'relatedVotings' => $relatedVotings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'amount' => 'required|numeric|min:1000',
            'category' => 'required|string',
        ]);

        $voting = KasVoting::create([
            'title' => $request->title,
            'description' => $request->description,
            'amount' => $request->amount,
            'category' => $request->category,
            'status' => 'open',
            'created_by' => $mahasiswa->id,
            'voting_deadline' => now()->addDays(3), // 3 hari untuk voting
            'min_votes' => 10,
            'approval_threshold' => 60,
        ]);

        return redirect()
            ->route('user.kas-voting.detail', $voting)
            ->with('success', 'Usulan pengeluaran berhasil dibuat. Voting akan berlangsung selama 3 hari.');
    }

    public function vote(Request $request, KasVoting $voting): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        if ($voting->status !== 'open') {
            return back()->withErrors(['error' => 'Voting sudah ditutup.']);
        }

        if (now()->gt($voting->voting_deadline)) {
            return back()->withErrors(['error' => 'Waktu voting sudah berakhir.']);
        }

        $request->validate([
            'vote' => 'required|in:approve,reject',
            'comment' => 'nullable|string|max:500',
        ]);

        KasVote::updateOrCreate(
            [
                'kas_voting_id' => $voting->id,
                'mahasiswa_id' => $mahasiswa->id,
            ],
            [
                'vote' => $request->vote,
                'comment' => $request->comment,
            ]
        );

        return back()->with('success', 'Vote berhasil dicatat.');
    }

    private function transformVoting(KasVoting $voting, int $mahasiswaId): array
    {
        $stats = $voting->getVoteStats();
        $myVote = KasVote::query()
            ->where('kas_voting_id', $voting->id)
            ->where('mahasiswa_id', $mahasiswaId)
            ->first();

        return [
            'id' => (int) $voting->id,
            'title' => (string) $voting->title,
            'description' => (string) $voting->description,
            'amount' => (float) $voting->amount,
            'category' => (string) $voting->category,
            'status' => (string) $voting->status,
            'creator' => (string) ($voting->creator?->nama ?? '-'),
            'voting_deadline' => $voting->voting_deadline->toIso8601String(),
            'is_expired' => now()->gt($voting->voting_deadline),
            'min_votes' => (int) $voting->min_votes,
            'approval_threshold' => (float) $voting->approval_threshold,
            'stats' => $stats,
            'my_vote' => $myVote?->vote,
            'created_at' => $voting->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
        ];
    }
}
