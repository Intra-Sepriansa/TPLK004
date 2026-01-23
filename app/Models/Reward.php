<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reward extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'cost_points',
        'stock',
        'image_url',
        'is_available',
        'metadata',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'metadata' => 'array',
    ];

    public function redemptions(): HasMany
    {
        return $this->hasMany(RewardRedemption::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
            ->where(function ($q) {
                $q->whereNull('stock')
                  ->orWhere('stock', '>', 0);
            });
    }

    public function canBeRedeemed(): bool
    {
        if (!$this->is_available) {
            return false;
        }

        if ($this->stock !== null && $this->stock <= 0) {
            return false;
        }

        return true;
    }

    public function decrementStock(): void
    {
        if ($this->stock !== null) {
            $this->decrement('stock');
        }
    }
}
