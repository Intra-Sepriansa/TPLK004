<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kas;
use App\Models\KasSummary;
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

    /**
     * Approve voting manually by admin
     */
    public function approve(KasVoting $voting): RedirectResponse
    {
        if ($voting->status !== 'open') {
            return back()->withErrors(['error' => 'Voting sudah tidak aktif.']);
        }

        $voting->update(['status' => 'approved']);

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

        $voting->update([
            'status' => 'rejected',
        ]);

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

        $voting->update(['status' => 'closed']);

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

        $voting->checkAndFinalize();

        $message = match($voting->fresh()->status) {
            'approved' => 'Voting disetujui berdasarkan hasil suara.',
            'rejected' => 'Voting ditolak berdasarkan hasil suara.',
            'closed' => 'Voting ditutup karena tidak memenuhi kuorum.',
            default => 'Status voting telah diperbarui.',
        };

        return back()->with('success', $message);
    }
}
