<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ConversationParticipant extends Model
{
    protected $fillable = [
        'conversation_id',
        'participant_type',
        'participant_id',
        'role',
        'joined_at',
        'last_read_at',
        'is_muted',
        'is_blocked',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'last_read_at' => 'datetime',
        'is_muted' => 'boolean',
        'is_blocked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function participant(): MorphTo
    {
        return $this->morphTo();
    }

    // Methods
    public function markAsRead(): void
    {
        $this->update(['last_read_at' => now()]);
    }

    public function mute(): void
    {
        $this->update(['is_muted' => true]);
    }

    public function unmute(): void
    {
        $this->update(['is_muted' => false]);
    }

    public function block(): void
    {
        $this->update(['is_blocked' => true]);
    }

    public function unblock(): void
    {
        $this->update(['is_blocked' => false]);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getParticipantName(): string
    {
        $participant = $this->participant;
        
        if ($participant instanceof Mahasiswa) {
            return $participant->nama;
        }
        
        if ($participant instanceof Dosen) {
            return $participant->nama;
        }
        
        return $participant->name ?? 'Unknown';
    }

    public function getParticipantAvatar(): ?string
    {
        return $this->participant?->avatar_url;
    }
}
