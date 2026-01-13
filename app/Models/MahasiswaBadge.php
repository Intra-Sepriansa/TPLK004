<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MahasiswaBadge extends Model
{
    protected $table = 'mahasiswa_badges';

    protected $fillable = [
        'mahasiswa_id',
        'badge_id',
        'earned_at',
        'earned_reason',
    ];

    protected $casts = [
        'earned_at' => 'datetime',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class);
    }

    // Accessor untuk badge_name dari relasi badge
    public function getBadgeNameAttribute(): string
    {
        return $this->badge?->name ?? 'Unknown Badge';
    }

    // Accessor untuk badge_description dari relasi badge
    public function getBadgeDescriptionAttribute(): string
    {
        return $this->badge?->description ?? '';
    }

    // Accessor untuk badge_image dari relasi badge
    public function getBadgeImageAttribute(): ?string
    {
        return $this->badge?->icon;
    }
}
