<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TugasDiskusi extends Model
{
    protected $table = 'tugas_diskusi';

    protected $fillable = [
        'tugas_id',
        'sender_type',
        'sender_id',
        'pesan',
        'lampiran_url',
        'lampiran_nama',
        'visibility',
        'recipient_type',
        'recipient_id',
        'reply_to_id',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];

    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(TugasDiskusi::class, 'reply_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TugasDiskusi::class, 'reply_to_id');
    }

    public function getSenderNameAttribute(): string
    {
        return match ($this->sender_type) {
            'mahasiswa' => Mahasiswa::find($this->sender_id)?->nama ?? 'Mahasiswa',
            'dosen' => Dosen::find($this->sender_id)?->nama ?? 'Dosen',
            'admin' => User::find($this->sender_id)?->name ?? 'Admin',
            default => 'Unknown',
        };
    }

    public function getSenderAvatarAttribute(): ?string
    {
        return match ($this->sender_type) {
            'mahasiswa' => Mahasiswa::find($this->sender_id)?->avatar_url,
            'dosen' => Dosen::find($this->sender_id)?->avatar_url,
            'admin' => User::find($this->sender_id)?->avatar_url,
            default => null,
        };
    }

    public function getRecipientNameAttribute(): ?string
    {
        if (!$this->recipient_id) return null;
        
        return match ($this->recipient_type) {
            'mahasiswa' => Mahasiswa::find($this->recipient_id)?->nama ?? 'Mahasiswa',
            'dosen' => Dosen::find($this->recipient_id)?->nama ?? 'Dosen',
            'admin' => User::find($this->recipient_id)?->name ?? 'Admin',
            default => null,
        };
    }
}
