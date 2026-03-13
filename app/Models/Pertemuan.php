<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pertemuan extends Model
{
    protected $table = 'pertemuan';

    protected $fillable = [
        'mata_kuliah_id',
        'pertemuan_ke',
        'tanggal',
        'topik',
        'deskripsi',
        'mode',
        'status',
    ];

    protected $casts = [
        'pertemuan_ke' => 'integer',
        'tanggal' => 'date',
    ];

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }
}
