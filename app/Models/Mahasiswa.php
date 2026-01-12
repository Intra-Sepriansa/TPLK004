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
        'fakultas',
        'prodi',
        'kelas',
        'jenis_reguler',
        'semester',
        'password',
        'avatar_url',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public $timestamps = false;

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'mahasiswa_id');
    }
}
