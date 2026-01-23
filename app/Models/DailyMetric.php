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

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForMetricType($query, string $type)
    {
        return $query->where('metric_type', $type);
    }

    public function scopeForDimension($query, string $dimension, string $value = null)
    {
        $query->where('dimension', $dimension);
        
        if ($value !== null) {
            $query->where('dimension_value', $value);
        }
        
        return $query;
    }
}
