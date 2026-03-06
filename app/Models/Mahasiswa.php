<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Mahasiswa extends Authenticatable
{
    use Notifiable;

    protected $table = 'mahasiswa';

    protected $fillable = [
        'nama',
        'nim',
        'email',
        'phone',
        'fakultas',
        'prodi',
        'kelas',
        'jenis_reguler',
        'semester',
        'jenis_kelamin',
        'password',
        'avatar_url',
        'remember_token',
        'last_activity_at',
        'theme_preference',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
    ];

    public $timestamps = false;

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'mahasiswa_id');
    }

    public function attendanceWarnings(): HasMany
    {
        return $this->hasMany(AttendanceWarning::class, 'mahasiswa_id');
    }

    public function courses(): HasMany
    {
        return $this->hasMany(MahasiswaCourse::class, 'mahasiswa_id');
    }

    public function studyGroupMemberships(): HasMany
    {
        return $this->hasMany(StudyGroupMember::class, 'mahasiswa_id');
    }
}
