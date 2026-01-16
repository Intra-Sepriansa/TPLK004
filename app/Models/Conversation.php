<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;

class Conversation extends Model
{
    protected $fillable = [
        'type',
        'name',
        'description',
        'avatar_url',
        'course_id',
        'created_by_type',
        'created_by_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get user type class
     */
    private function getUserType($user): string
    {
        if ($user instanceof Mahasiswa) {
            return Mahasiswa::class;
        }
        if ($user instanceof Dosen) {
            return Dosen::class;
        }
        return User::class;
    }

    // Relationships
    public function participants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function creator(): MorphTo
    {
        return $this->morphTo('created_by');
    }

    // Scopes
    public function scopePersonal(Builder $query): Builder
    {
        return $query->where('type', 'personal');
    }

    public function scopeGroup(Builder $query): Builder
    {
        return $query->where('type', 'group');
    }

    public function scopeForUser(Builder $query, $user): Builder
    {
        $userType = $this->getUserType($user);
        
        return $query->whereHas('participants', function ($q) use ($userType, $user) {
            $q->where('participant_type', $userType)
              ->where('participant_id', $user->id);
        });
    }

    // Methods
    public function getOtherParticipant($currentUser): ?ConversationParticipant
    {
        if ($this->type !== 'personal') {
            return null;
        }

        $currentType = $this->getUserType($currentUser);
        
        return $this->participants()
            ->where(function ($q) use ($currentType, $currentUser) {
                $q->where('participant_type', '!=', $currentType)
                  ->orWhere('participant_id', '!=', $currentUser->id);
            })
            ->first();
    }

    public function getUnreadCount($user): int
    {
        $userType = $this->getUserType($user);
        
        $participant = $this->participants()
            ->where('participant_type', $userType)
            ->where('participant_id', $user->id)
            ->first();

        if (!$participant || !$participant->last_read_at) {
            return $this->messages()->count();
        }

        return $this->messages()
            ->where('created_at', '>', $participant->last_read_at)
            ->where(function ($q) use ($userType, $user) {
                $q->where('sender_type', '!=', $userType)
                  ->orWhere('sender_id', '!=', $user->id);
            })
            ->count();
    }

    public function isParticipant($user): bool
    {
        $userType = $this->getUserType($user);
        
        return $this->participants()
            ->where('participant_type', $userType)
            ->where('participant_id', $user->id)
            ->exists();
    }

    public function isAdmin($user): bool
    {
        $userType = $this->getUserType($user);
        
        return $this->participants()
            ->where('participant_type', $userType)
            ->where('participant_id', $user->id)
            ->where('role', 'admin')
            ->exists();
    }
}
