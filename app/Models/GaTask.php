<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GaTask extends Model
{
    protected $fillable = ['group_id', 'title', 'description', 'created_by', 'status', 'deadline', 'completed_at', 'completed_by'];
    protected $casts = ['deadline' => 'datetime', 'completed_at' => 'datetime'];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function creator(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'created_by'); }
    public function completedByUser(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'completed_by'); }
    public function assignees(): BelongsToMany { return $this->belongsToMany(Mahasiswa::class, 'ga_task_assignments', 'task_id', 'student_id')->withPivot('assigned_at'); }
}
