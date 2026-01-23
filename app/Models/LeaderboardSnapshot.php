<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderboardSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_id',
        'rank',
        'points',
        'streak',
        'attendance_rate',
        'badges_count',
        'period',
        'snapshot_date',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'attendance_rate' => 'decimal:2',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function scopeForPeriod($query, string $period)
    {
        return $query->where('period', $period);
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('snapshot_date', 'desc');
    }
}
