<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditAction extends Model
{
    protected $fillable = [
        'audit_log_id',
        'action_type',
        'description',
        'actor_id',
    ];

    public function auditLog(): BelongsTo
    {
        return $this->belongsTo(AuditLog::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
