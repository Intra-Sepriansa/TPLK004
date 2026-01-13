<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'icon',
        'color',
        'category',
        'points',
        'criteria',
        'is_active',
        'badge_level',
        'requirement_type',
        'requirement_value',
    ];

    protected $casts = [
        'criteria' => 'array',
        'is_active' => 'boolean',
    ];

    public function mahasiswas(): BelongsToMany
    {
        return $this->belongsToMany(Mahasiswa::class, 'mahasiswa_badges')
            ->withPivot(['earned_at', 'earned_reason'])
            ->withTimestamps();
    }

    /**
     * Award badge to mahasiswa
     */
    public static function award(int $mahasiswaId, string $badgeCode, ?string $reason = null): bool
    {
        $badge = self::where('code', $badgeCode)->where('is_active', true)->first();
        if (!$badge) return false;

        // Check if already has badge
        $exists = \DB::table('mahasiswa_badges')
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('badge_id', $badge->id)
            ->exists();

        if ($exists) return false;

        // Award badge
        \DB::table('mahasiswa_badges')->insert([
            'mahasiswa_id' => $mahasiswaId,
            'badge_id' => $badge->id,
            'earned_at' => now(),
            'earned_reason' => $reason,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Add points
        if ($badge->points > 0) {
            PointHistory::addPoints($mahasiswaId, $badge->points, 'badge', "Badge: {$badge->name}");
        }

        return true;
    }
}
