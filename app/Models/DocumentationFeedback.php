<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentationFeedback extends Model
{
    protected $fillable = [
        'reader_id',
        'reader_type',
        'guide_id',
        'helpful',
        'rating',
        'comment',
    ];

    protected $casts = [
        'helpful' => 'boolean',
        'rating' => 'integer',
    ];

    public function reader(): MorphTo
    {
        return $this->morphTo();
    }
}
