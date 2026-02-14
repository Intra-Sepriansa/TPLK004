<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SelfieViewRequest extends Model
{
    protected $fillable = [
        'selfie_verification_id',
        'requested_by',
        'mahasiswa_id',
        'reason',
        'status',
        'responded_at',
        'response_note',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    public function selfieVerification(): BelongsTo
    {
        return $this->belongsTo(SelfieVerification::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
