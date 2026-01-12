<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = [
        'level_number',
        'name',
        'min_points',
        'max_points',
        'icon',
        'color',
    ];

    /**
     * Get level for points
     */
    public static function getForPoints(int $points): ?self
    {
        return self::where('min_points', '<=', $points)
            ->where('max_points', '>=', $points)
            ->first();
    }
}
