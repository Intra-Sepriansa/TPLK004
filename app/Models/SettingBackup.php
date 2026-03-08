<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettingBackup extends Model
{
    protected $fillable = [
        'backup_name',
        'backup_description',
        'settings_data',
        'created_by',
        'file_size',
        'settings_count',
        'is_auto_backup',
        'can_restore',
    ];

    protected $casts = [
        'settings_data' => 'array',
        'is_auto_backup' => 'boolean',
        'can_restore' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
