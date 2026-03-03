<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TugasDependency extends Model
{
    protected $fillable = [
        'tugas_id',
        'depends_on_tugas_id',
    ];

    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }

    public function dependency(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'depends_on_tugas_id');
    }
}
