<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Prediction extends Model
{
    use HasFactory;

    protected $fillable = [
        'prediction_type',
        'subject_type',
        'subject_id',
        'prediction_date',
        'predicted_value',
        'confidence_score',
        'factors',
        'actual_value',
        'verified_at',
    ];

    protected $casts = [
        'prediction_date' => 'date',
        'predicted_value' => 'decimal:2',
        'confidence_score' => 'decimal:2',
        'actual_value' => 'decimal:2',
        'factors' => 'array',
        'verified_at' => 'datetime',
    ];

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function verify(float $actualValue): void
    {
        $this->actual_value = $actualValue;
        $this->verified_at = now();
        $this->save();
    }

    public function getAccuracy(): ?float
    {
        if ($this->actual_value === null) {
            return null;
        }

        $error = abs($this->predicted_value - $this->actual_value);
        $accuracy = 100 - (($error / $this->actual_value) * 100);
        
        return max(0, min(100, $accuracy));
    }
}
