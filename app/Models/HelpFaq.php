<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpFaq extends Model
{
    protected $table = 'help_faqs';

    protected $fillable = [
        'category',
        'question',
        'answer',
        'order',
        'is_active',
        'helpful_count',
        'not_helpful_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
        'order' => 'integer',
    ];
}
