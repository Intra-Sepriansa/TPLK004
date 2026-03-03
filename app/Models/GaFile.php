<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaFile extends Model
{
    public $timestamps = false;
    protected $fillable = ['group_id', 'uploaded_by', 'filename', 'original_name', 'file_path', 'file_type', 'file_size', 'mime_type', 'thumbnail_path', 'uploaded_at'];
    protected $casts = ['uploaded_at' => 'datetime'];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function uploader(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'uploaded_by'); }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
        if ($bytes >= 1024) return round($bytes / 1024, 1) . ' KB';
        return $bytes . ' B';
    }
}
