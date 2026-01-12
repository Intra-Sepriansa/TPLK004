<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KasReminder extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'amount_due',
        'weeks_overdue',
        'status',
        'sent_at',
        'acknowledged_at',
    ];

    protected $casts = [
        'amount_due' => 'decimal:2',
        'sent_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    /**
     * Generate reminders for all mahasiswa with unpaid kas
     */
    public static function generateReminders(): int
    {
        $count = 0;
        $mahasiswaList = Mahasiswa::all();

        foreach ($mahasiswaList as $mhs) {
            $unpaidAmount = Kas::where('mahasiswa_id', $mhs->id)
                ->where('type', 'income')
                ->where('status', 'unpaid')
                ->sum('amount');

            if ($unpaidAmount > 0) {
                $weeksOverdue = Kas::where('mahasiswa_id', $mhs->id)
                    ->where('type', 'income')
                    ->where('status', 'unpaid')
                    ->count();

                // Check if reminder already exists for this amount
                $existing = self::where('mahasiswa_id', $mhs->id)
                    ->where('status', 'pending')
                    ->first();

                if ($existing) {
                    $existing->update([
                        'amount_due' => $unpaidAmount,
                        'weeks_overdue' => $weeksOverdue,
                    ]);
                } else {
                    self::create([
                        'mahasiswa_id' => $mhs->id,
                        'amount_due' => $unpaidAmount,
                        'weeks_overdue' => $weeksOverdue,
                        'status' => 'pending',
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }
}
