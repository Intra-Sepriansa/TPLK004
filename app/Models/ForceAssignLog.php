<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForceAssignLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'assignment_id', 'group_id', 'student_id',
        'admin_id', 'admin_type', 'action', 'reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function assignment(): BelongsTo { return $this->belongsTo(GroupAssignment::class, 'assignment_id'); }
    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'student_id'); }
}
