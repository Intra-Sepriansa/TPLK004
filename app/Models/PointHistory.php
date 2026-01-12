<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointHistory extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'points',
        'type',
        'source',
        'description',
        'reference_id',
        'reference_type',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    /**
     * Add points to mahasiswa
     */
    public static function addPoints(int $mahasiswaId, int $points, string $source, string $description, ?int $referenceId = null, ?string $referenceType = null): self
    {
        $history = self::create([
            'mahasiswa_id' => $mahasiswaId,
            'points' => $points,
            'type' => 'earned',
            'source' => $source,
            'description' => $description,
            'reference_id' => $referenceId,
            'reference_type' => $referenceType,
        ]);

        // Update mahasiswa total points
        $mahasiswa = Mahasiswa::find($mahasiswaId);
        if ($mahasiswa) {
            $mahasiswa->increment('total_points', $points);
            
            // Check level up
            self::checkLevelUp($mahasiswa);
        }

        return $history;
    }

    /**
     * Check and update level
     */
    public static function checkLevelUp(Mahasiswa $mahasiswa): void
    {
        $level = Level::where('min_points', '<=', $mahasiswa->total_points)
            ->where('max_points', '>=', $mahasiswa->total_points)
            ->first();

        if ($level && $mahasiswa->current_level !== $level->level_number) {
            $mahasiswa->update(['current_level' => $level->level_number]);
        }
    }
}
