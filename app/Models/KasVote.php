<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KasVote extends Model
{
    protected $fillable = [
        'kas_voting_id',
        'mahasiswa_id',
        'vote',
        'comment',
    ];

    public function voting(): BelongsTo
    {
        return $this->belongsTo(KasVoting::class, 'kas_voting_id');
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
