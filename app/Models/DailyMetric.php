<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'metric_type',
        'dimension',
        'dimension_value',
        'value',
        'metadata',
    ];

    protected $casts = [
        'date' => 'date',
        'value' => 'decimal:2',
        'metadata' => 'array',
    ];

    public static function record(string $metricType, float $value, ?string $dimension = null, ?string $dimensionValue = null, array $metadata = []): void
    {
        static::updateOrCreate(
            [
                'date' => now()->toDateString(),
                'metric_type' => $metricType,
                'dimension' => $dimension,
                'dimension_value' => $dimensionValue,
            ],
            [
                'value' => $value,
                'metadata' => $metadata,
            ]
        );
    }

    public static function getMetric(string $metricType, $date = null, ?string $dimension = null, ?string $dimensionValue = null)
    {
        $query = static::where('metric_type', $metricType);

        if ($date) {
            $query->where('date', $date);
        }

        if ($dimension) {
            $query->where('dimension', $dimension);
        }

        if ($dimensionValue) {
            $query->where('dimension_value', $dimensionValue);
        }

        return $query->first();
    }

    public static function getTrend(string $metricType, int $days = 7): array
    {
        return static::where('metric_type', $metricType)
            ->where('date', '>=', now()->subDays($days))
            ->orderBy('date')
            ->pluck('value', 'date')
            ->toArray();
    }
}
