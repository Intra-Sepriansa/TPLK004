<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaGroupMember extends Model
{
    public $timestamps = false;
    protected $fillable = ['group_id', 'student_id', 'is_leader', 'joined_at'];
    protected $casts = ['is_leader' => 'boolean', 'joined_at' => 'datetime'];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'student_id'); }
}
