<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Dosen extends Authenticatable
{
    use Notifiable;

    protected $table = 'dosen';

    protected $fillable = [
        'user_id',
        'nama',
        'nidn',
        'email',
        'phone',
        'avatar_url',
        'password',
        'is_active',
        'settings',
        'last_activity_at',
        'theme_preference',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'password' => 'hashed',
        'settings' => 'array',
        'last_activity_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(MataKuliah::class, 'dosen_course', 'dosen_id', 'course_id')
            ->withPivot('role', 'assigned_at')
            ->withTimestamps();
    }

    public function sessions()
    {
        return $this->hasMany(AttendanceSession::class, 'created_by_dosen_id');
    }

    public function selfieVerifications()
    {
        return $this->hasMany(SelfieVerification::class, 'verified_by')
            ->where('verified_by_type', 'dosen');
    }

    public function getInitialsAttribute(): string
    {
        $words = explode(' ', $this->nama);
        $initials = '';
        foreach (array_slice($words, 0, 2) as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }
        return $initials;
    }

    /**
     * Get participant name for chat
     */
    public function getParticipantName(): string
    {
        return $this->nama;
    }

    /**
     * Get participant avatar for chat
     */
    public function getParticipantAvatar(): ?string
    {
        return $this->avatar_url;
    }

    /**
     * Get conversations for this dosen
     */
    public function conversations()
    {
        return $this->morphToMany(
            \App\Models\Conversation::class,
            'participant',
            'conversation_participants'
        )->withPivot(['role', 'joined_at', 'last_read_at', 'is_muted', 'is_blocked']);
    }

    /**
     * Get messages sent by this dosen
     */
    public function messages()
    {
        return $this->morphMany(\App\Models\Message::class, 'sender');
    }

    /**
     * Get online status
     */
    public function onlineStatus()
    {
        return $this->morphOne(\App\Models\UserOnlineStatus::class, 'user');
    }
}
