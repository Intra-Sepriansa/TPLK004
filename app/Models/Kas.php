<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kas extends Model
{
    protected $table = 'kas';

    protected $fillable = [
        'mahasiswa_id',
        'type',
        'amount',
        'description',
        'category',
        'period_date',
        'status',
        'payment_method',
        'payment_reference',
        'payment_note',
        'paid_at',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'period_date' => 'date',
        'paid_at' => 'datetime',
        'mahasiswa_id' => 'integer',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
