<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentationOfflineDownload extends Model
{
    protected $fillable = [
        'reader_id',
        'reader_type',
        'guide_id',
        'title',
        'version',
        'size_kb',
        'downloaded_at',
    ];

    protected $casts = [
        'size_kb' => 'integer',
        'downloaded_at' => 'datetime',
    ];

    public function reader(): MorphTo
    {
        return $this->morphTo();
    }
}
