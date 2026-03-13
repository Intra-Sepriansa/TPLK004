<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaGroupMember extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'group_id', 'student_id', 'is_leader', 'joined_at',
        'is_forced', 'forced_by', 'forced_by_type', 'forced_reason', 'forced_at',
    ];
    protected $casts = [
        'is_leader' => 'boolean',
        'is_forced' => 'boolean',
        'joined_at' => 'datetime',
        'forced_at' => 'datetime',
    ];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'student_id'); }
}
