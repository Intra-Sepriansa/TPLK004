<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestSupportContact extends Model
{
    protected $table = 'digest_support_contacts';

    protected $fillable = [
        'digest_id',
        'contact_name',
        'contact_role',
        'contact_type',
        'contact_value',
        'available_hours',
        'response_time',
        'notes',
        'display_order',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}
