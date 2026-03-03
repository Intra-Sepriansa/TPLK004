<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaMessageReaction extends Model
{
    public $timestamps = false;
    protected $fillable = ['message_id', 'user_id', 'emoji', 'created_at'];
    protected $casts = ['created_at' => 'datetime'];

    public function message(): BelongsTo { return $this->belongsTo(GaMessage::class, 'message_id'); }
    public function user(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'user_id'); }
}
