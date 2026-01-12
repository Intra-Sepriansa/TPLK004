<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tugas extends Model
{
    protected $table = 'tugas';

    protected $fillable = [
        'course_id',
        'judul',
        'deskripsi',
        'instruksi',
        'jenis',
        'deadline',
        'prioritas',
        'status',
        'lampiran_url',
        'lampiran_nama',
        'created_by_type',
        'created_by_id',
        'edited_by_type',
        'edited_by_id',
        'edited_at',
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'edited_at' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'course_id');
    }

    public function diskusi(): HasMany
    {
        return $this->hasMany(TugasDiskusi::class, 'tugas_id');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(TugasRead::class, 'tugas_id');
    }

    public function creator()
    {
        if ($this->created_by_type === 'dosen') {
            return $this->belongsTo(Dosen::class, 'created_by_id');
        }
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function editor()
    {
        if ($this->edited_by_type === 'dosen') {
            return $this->belongsTo(Dosen::class, 'edited_by_id');
        }
        return $this->belongsTo(User::class, 'edited_by_id');
    }

    public function getCreatorNameAttribute(): string
    {
        if ($this->created_by_type === 'dosen') {
            return Dosen::find($this->created_by_id)?->nama ?? 'Dosen';
        }
        return User::find($this->created_by_id)?->name ?? 'Admin';
    }

    public function getEditorNameAttribute(): ?string
    {
        if (!$this->edited_by_id) return null;
        
        if ($this->edited_by_type === 'dosen') {
            return Dosen::find($this->edited_by_id)?->nama ?? 'Dosen';
        }
        return User::find($this->edited_by_id)?->name ?? 'Admin';
    }

    public function isOverdue(): bool
    {
        return $this->deadline->isPast() && $this->status === 'published';
    }

    public function getDaysUntilDeadlineAttribute(): int
    {
        return (int) now()->diffInDays($this->deadline, false);
    }
}
