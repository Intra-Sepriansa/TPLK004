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

        $votings = $query->get()->map(function ($voting) use ($mahasiswa) {
            $stats = $voting->getVoteStats();
            $myVote = KasVote::where('kas_voting_id', $voting->id)
                ->where('mahasiswa_id', $mahasiswa->id)
                ->first();

            return [
                'id' => $voting->id,
                'title' => $voting->title,
                'description' => $voting->description,
                'amount' => $voting->amount,
                'category' => $voting->category,
                'status' => $voting->status,
                'creator' => $voting->creator?->nama ?? '-',
                'voting_deadline' => $voting->voting_deadline->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'is_expired' => now()->gt($voting->voting_deadline),
                'min_votes' => $voting->min_votes,
                'approval_threshold' => $voting->approval_threshold,
                'stats' => $stats,
                'my_vote' => $myVote?->vote,
                'created_at' => $voting->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
            ];
        });

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

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'amount' => 'required|numeric|min:1000',
            'category' => 'required|string',
        ]);

        KasVoting::create([
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

        return back()->with('success', 'Usulan pengeluaran berhasil dibuat. Voting akan berlangsung selama 3 hari.');
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
}
