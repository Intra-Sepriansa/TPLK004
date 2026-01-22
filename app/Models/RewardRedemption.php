<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'reward_id',
        'mahasiswa_id',
        'points_spent',
        'status',
        'notes',
        'approved_at',
        'delivered_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function approve(): void
    {
        $this->status = 'approved';
        $this->approved_at = now();
        $this->save();
    }

    public function deliver(): void
    {
        $this->status = 'delivered';
        $this->delivered_at = now();
        $this->save();
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
        
        // Refund points
        $this->mahasiswa->increment('points', $this->points_spent);
    }
}
