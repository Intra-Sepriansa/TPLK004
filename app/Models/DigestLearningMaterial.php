<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestLearningMaterial extends Model
{
    protected $table = 'digest_learning_materials';

    protected $fillable = [
        'digest_id',
        'material_title',
        'material_description',
        'material_type',
        'mentari_material_url',
        'file_name',
        'file_size',
        'duration',
        'topics_covered',
        'learning_objectives',
        'is_downloadable',
        'requires_password',
        'access_notes',
        'upload_date',
        'display_order',
    ];

    protected $casts = [
        'upload_date' => 'date',
        'is_downloadable' => 'boolean',
        'requires_password' => 'boolean',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}
