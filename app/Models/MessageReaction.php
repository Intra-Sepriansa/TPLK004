<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MessageReaction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'message_id',
        'reactor_type',
        'reactor_id',
        'emoji',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function reactor(): MorphTo
    {
        return $this->morphTo();
    }

    // Methods
    public function getReactorName(): string
    {
        $reactor = $this->reactor;
        
        if ($reactor instanceof Mahasiswa) {
            return $reactor->nama;
        }
        
        if ($reactor instanceof Dosen) {
            return $reactor->nama;
        }
        
        return $reactor->name ?? 'Unknown';
    }
}
