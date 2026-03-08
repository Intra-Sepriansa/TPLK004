<?php

namespace App\Jobs;

use App\Events\BatchExportCompleted;
use App\Models\User;
use App\Services\PdfReportService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessBatchPdfExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $digestIds;
    public $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(array $digestIds, int $userId)
    {
        $this->digestIds = $digestIds;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(PdfReportService $pdfService): void
    {
        try {
            $user = User::find($this->userId);
            if (!$user) {
                return;
            }

            // Generate the batch zip
            $zipRelativePath = $pdfService->generateBatchZip($this->digestIds, $user);

            // Generate public URL to download
            $downloadUrl = asset('storage/' . $zipRelativePath);

            // Broadcast completion
            event(new BatchExportCompleted($this->userId, $downloadUrl, basename($zipRelativePath)));
        } catch (Exception $e) {
            Log::error('ProcessBatchPdfExport Failed: ' . $e->getMessage());
        }
    }
}
