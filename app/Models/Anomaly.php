<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Anomaly extends Model
{
    use HasFactory;

    protected $fillable = [
        'anomaly_type',
        'subject_type',
        'subject_id',
        'severity',
        'description',
        'evidence',
        'status',
        'resolved_by',
        'resolution_notes',
        'resolved_at',
    ];

    protected $casts = [
        'evidence' => 'array',
        'resolved_at' => 'datetime',
    ];

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function resolve(User $user, string $notes): void
    {
        $this->status = 'resolved';
        $this->resolved_by = $user->id;
        $this->resolution_notes = $notes;
        $this->resolved_at = now();
        $this->save();
    }

    public function markAsFalsePositive(User $user, string $notes): void
    {
        $this->status = 'false_positive';
        $this->resolved_by = $user->id;
        $this->resolution_notes = $notes;
        $this->resolved_at = now();
        $this->save();
    }

    public function investigate(): void
    {
        $this->status = 'investigating';
        $this->save();
    }

    public function scopeUnresolved($query)
    {
        return $query->whereIn('status', ['detected', 'investigating']);
    }

    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }
}
