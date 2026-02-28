<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NoteCollaborator extends Model
{
    protected $fillable = [
        'academic_note_id',
        'mahasiswa_id',
        'role',
    ];

    public function note()
    {
        return $this->belongsTo(AcademicNote::class, 'academic_note_id');
    }

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }
}
