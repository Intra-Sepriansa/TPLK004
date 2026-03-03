<?php

namespace App\Jobs;

use App\Models\TugasReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendTugasReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly int $reminderId)
    {
    }

    public function handle(): void
    {
        $reminder = TugasReminder::with('tugas.course')->find($this->reminderId);
        if (!$reminder || !$reminder->enabled) {
            return;
        }

        $tugas = $reminder->tugas;
        if (!$tugas) {
            return;
        }

        Log::info('Tugas reminder triggered.', [
            'reminder_id' => $reminder->id,
            'tugas_id' => $tugas->id,
            'course_id' => $tugas->course_id,
            'value' => $reminder->value,
            'unit' => $reminder->unit,
            'deadline' => $tugas->deadline?->toDateTimeString(),
        ]);
    }
}
