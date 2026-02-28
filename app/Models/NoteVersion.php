<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NoteVersion extends Model
{
    protected $fillable = [
        'academic_note_id',
        'content',
        'created_by',
    ];

    public function note()
    {
        return $this->belongsTo(AcademicNote::class, 'academic_note_id');
    }

    public function creator()
    {
        return $this->belongsTo(Mahasiswa::class, 'created_by');
    }
}
