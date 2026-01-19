<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpTroubleshooting extends Model
{
    protected $table = 'help_troubleshooting';

    protected $fillable = [
        'title',
        'description',
        'category',
        'steps',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
