<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TugasReminder extends Model
{
    protected $fillable = [
        'tugas_id',
        'type',
        'value',
        'unit',
        'enabled',
        'sent_at',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'value' => 'integer',
        'sent_at' => 'datetime',
    ];

    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }
}
