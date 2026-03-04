<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaInvitation extends Model
{
    protected $fillable = ['group_id', 'inviter_id', 'invitee_id', 'status', 'responded_at'];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function inviter(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'inviter_id'); }
    public function invitee(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'invitee_id'); }
}
