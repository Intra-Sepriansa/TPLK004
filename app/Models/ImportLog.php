<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportLog extends Model
{
    protected $fillable = [
        'type',
        'filename',
        'total_rows',
        'success_count',
        'error_count',
        'skip_count',
        'errors',
        'status',
        'imported_by',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'errors' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function getSuccessRateAttribute(): float
    {
        if ($this->total_rows === 0) return 0;
        return round(($this->success_count / $this->total_rows) * 100, 1);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu',
            'processing' => 'Memproses',
            'completed' => 'Selesai',
            'failed' => 'Gagal',
            default => $this->status,
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'mahasiswa' => 'Data Mahasiswa',
            'mata_kuliah' => 'Mata Kuliah',
            'jadwal' => 'Jadwal',
            'dosen' => 'Data Dosen',
            default => $this->type,
        };
    }
}
