<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseMaterial extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'type',
        'url',
        'size',
        'description',
    ];

    public function course()
    {
        return $this->belongsTo(MahasiswaCourse::class, 'course_id');
    }
}
