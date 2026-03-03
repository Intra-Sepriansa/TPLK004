<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TugasAttachment extends Model
{
    protected $fillable = [
        'tugas_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by_type',
        'uploaded_by_id',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }
}
