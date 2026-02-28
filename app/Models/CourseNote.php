<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseNote extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'course_id',
        'content',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function course()
    {
        return $this->belongsTo(MahasiswaCourse::class, 'course_id');
    }
}
