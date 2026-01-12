<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KasVoting extends Model
{
    protected $fillable = [
        'title',
        'description',
        'amount',
        'category',
        'status',
        'created_by',
        'voting_deadline',
        'min_votes',
        'approval_threshold',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approval_threshold' => 'decimal:2',
        'voting_deadline' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'created_by');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(KasVote::class);
    }

    /**
     * Get vote statistics
     */
    public function getVoteStats(): array
    {
        $approveCount = $this->votes()->where('vote', 'approve')->count();
        $rejectCount = $this->votes()->where('vote', 'reject')->count();
        $totalVotes = $approveCount + $rejectCount;
        
        return [
            'approve' => $approveCount,
            'reject' => $rejectCount,
            'total' => $totalVotes,
            'approval_percentage' => $totalVotes > 0 ? round(($approveCount / $totalVotes) * 100, 1) : 0,
            'is_valid' => $totalVotes >= $this->min_votes,
        ];
    }

    /**
     * Check and finalize voting
     */
    public function checkAndFinalize(): void
    {
        if ($this->status !== 'open') return;
        if (now()->lt($this->voting_deadline)) return;

        $stats = $this->getVoteStats();

        if (!$stats['is_valid']) {
            $this->update(['status' => 'closed']);
            return;
        }

        if ($stats['approval_percentage'] >= $this->approval_threshold) {
            $this->update(['status' => 'approved']);
            
            // Create expense record
            Kas::create([
                'mahasiswa_id' => null,
                'type' => 'expense',
                'amount' => $this->amount,
                'description' => "[Voting] {$this->title}",
                'category' => $this->category,
                'period_date' => now(),
                'status' => 'paid',
                'created_by' => $this->created_by,
            ]);

            KasSummary::recalculate();
        } else {
            $this->update(['status' => 'rejected']);
        }
    }
}
