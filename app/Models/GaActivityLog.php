<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaActivityLog extends Model
{
    public $timestamps = false;
    protected $fillable = ['group_id', 'user_id', 'activity_type', 'activity_metadata', 'points', 'created_at'];
    protected $casts = ['activity_metadata' => 'array', 'created_at' => 'datetime'];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function user(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'user_id'); }
}
