<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpFeedback extends Model
{
    protected $table = 'help_feedback';

    protected $fillable = [
        'user_type',
        'user_id',
        'user_name',
        'user_email',
        'category',
        'subject',
        'message',
        'status',
        'admin_response',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];
}
