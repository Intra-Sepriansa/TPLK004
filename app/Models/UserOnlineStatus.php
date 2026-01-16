<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserOnlineStatus extends Model
{
    public $timestamps = false;

    protected $table = 'user_online_status';

    protected $fillable = [
        'user_type',
        'user_id',
        'is_online',
        'last_seen_at',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'last_seen_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user(): MorphTo
    {
        return $this->morphTo();
    }

    // Static Methods
    public static function setOnline($user): void
    {
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
        
        static::updateOrCreate(
            ['user_type' => $userType, 'user_id' => $user->id],
            ['is_online' => true, 'last_seen_at' => now(), 'updated_at' => now()]
        );
    }

    public static function setOffline($user): void
    {
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
        
        static::updateOrCreate(
            ['user_type' => $userType, 'user_id' => $user->id],
            ['is_online' => false, 'last_seen_at' => now(), 'updated_at' => now()]
        );
    }

    public static function updateLastSeen($user): void
    {
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
        
        static::updateOrCreate(
            ['user_type' => $userType, 'user_id' => $user->id],
            ['last_seen_at' => now(), 'updated_at' => now()]
        );
    }

    public static function isUserOnline($user): bool
    {
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
        
        $status = static::where('user_type', $userType)
            ->where('user_id', $user->id)
            ->first();
        
        return $status?->is_online ?? false;
    }

    public static function getLastSeen($user): ?string
    {
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
        
        $status = static::where('user_type', $userType)
            ->where('user_id', $user->id)
            ->first();
        
        if (!$status || !$status->last_seen_at) {
            return null;
        }

        return $status->last_seen_at->diffForHumans();
    }
}
