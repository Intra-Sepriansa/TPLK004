<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentationBookmark extends Model
{
    protected $fillable = [
        'reader_id',
        'reader_type',
        'guide_id',
        'notes',
    ];

    public function reader(): MorphTo
    {
        return $this->morphTo();
    }
}
