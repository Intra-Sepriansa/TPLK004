<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_course_id',
        'name',
        'description',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(MahasiswaCourse::class, 'mahasiswa_course_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(StudyGroupMember::class);
    }
}
