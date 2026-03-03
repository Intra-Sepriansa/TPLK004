<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TugasTemplate extends Model
{
    protected $fillable = [
        'owner_type',
        'owner_id',
        'name',
        'description',
        'category',
        'fields',
        'usage_count',
        'is_favorite',
        'last_used_at',
    ];

    protected $casts = [
        'fields' => 'array',
        'is_favorite' => 'boolean',
        'usage_count' => 'integer',
        'last_used_at' => 'datetime',
    ];
}
