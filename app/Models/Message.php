<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_type',
        'sender_id',
        'content',
        'type',
        'reply_to_id',
        'forwarded_from_id',
        'edited_at',
    ];

    protected $casts = [
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): MorphTo
    {
        return $this->morphTo();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function forwardedFrom(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'forwarded_from_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Message::class, 'reply_to_id');
    }

    // Scopes
    public function scopeNotDeleted(Builder $query): Builder
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeWithType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeSearch(Builder $query, string $keyword): Builder
    {
        return $query->whereRaw('MATCH(content) AGAINST(? IN BOOLEAN MODE)', [$keyword]);
    }

    // Methods
    public function markAsDeleted(): void
    {
        $this->delete();
    }

    public function edit(string $newContent): bool
    {
        // Check if within 15 minutes
        if ($this->created_at->diffInMinutes(now()) > 15) {
            return false;
        }

        $this->update([
            'content' => $newContent,
            'edited_at' => now(),
        ]);

        return true;
    }

    public function canEdit(): bool
    {
        return $this->created_at->diffInMinutes(now()) <= 15;
    }

    public function isEdited(): bool
    {
        return $this->edited_at !== null;
    }

    public function isDeleted(): bool
    {
        return $this->deleted_at !== null;
    }

    public function isForwarded(): bool
    {
        return $this->forwarded_from_id !== null;
    }

    public function isReply(): bool
    {
        return $this->reply_to_id !== null;
    }

    public function getSenderName(): string
    {
        $sender = $this->sender;
        
        if ($sender instanceof Mahasiswa) {
            return $sender->nama;
        }
        
        if ($sender instanceof Dosen) {
            return $sender->nama;
        }
        
        return $sender->name ?? 'Unknown';
    }

    public function getSenderAvatar(): ?string
    {
        return $this->sender?->avatar_url;
    }

    public function getDisplayContent(): string
    {
        if ($this->isDeleted()) {
            return 'Pesan telah dihapus';
        }

        return $this->content ?? '';
    }
}
