<?php

namespace App\Jobs;

use App\Models\Tugas;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PublishTugasJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly int $tugasId)
    {
    }

    public function handle(): void
    {
        $tugas = Tugas::find($this->tugasId);
        if (!$tugas) {
            return;
        }

        if ($tugas->status === 'closed') {
            return;
        }

        if ($tugas->publish_at && now()->lt($tugas->publish_at)) {
            $this->release(now()->diffInSeconds($tugas->publish_at));
            return;
        }

        $tugas->update([
            'status' => 'published',
        ]);

        Log::info('Scheduled tugas published.', [
            'tugas_id' => $tugas->id,
            'course_id' => $tugas->course_id,
            'judul' => $tugas->judul,
        ]);
    }
}
