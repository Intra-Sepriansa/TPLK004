<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GaMessage extends Model
{
    protected $fillable = ['group_id', 'sender_id', 'content', 'type', 'reply_to_id', 'attachment_id', 'is_edited', 'is_deleted'];
    protected $casts = ['is_edited' => 'boolean', 'is_deleted' => 'boolean'];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function sender(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'sender_id'); }
    public function replyTo(): BelongsTo { return $this->belongsTo(self::class, 'reply_to_id'); }
    public function attachment(): BelongsTo { return $this->belongsTo(GaFile::class, 'attachment_id'); }
    public function reads(): HasMany { return $this->hasMany(GaMessageRead::class, 'message_id'); }
    public function reactions(): HasMany { return $this->hasMany(GaMessageReaction::class, 'message_id'); }
}
