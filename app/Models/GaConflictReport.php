<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaConflictReport extends Model
{
    protected $fillable = [
        'group_id', 'reporter_id', 'description', 'involved_members',
        'status', 'resolution_notes', 'resolved_by', 'resolved_at',
    ];
    protected $casts = ['involved_members' => 'array', 'resolved_at' => 'datetime'];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function reporter(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'reporter_id'); }
    public function resolver(): BelongsTo { return $this->belongsTo(Dosen::class, 'resolved_by'); }
}
