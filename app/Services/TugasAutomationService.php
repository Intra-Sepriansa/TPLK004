<?php

namespace App\Services;

use App\Jobs\PublishTugasJob;
use App\Jobs\SendTugasReminderJob;
use App\Models\Tugas;
use App\Models\TugasAttachment;
use App\Models\TugasDependency;
use App\Models\TugasReminder;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

class TugasAutomationService
{
    /**
     * @param array<int, int|string> $dependencyIds
     */
    public function attachDependencies(int $tugasId, array $dependencyIds): void
    {
        $ids = collect($dependencyIds)
            ->map(static fn($id) => (int) $id)
            ->filter(static fn($id) => $id > 0)
            ->unique()
            ->values();

        foreach ($ids as $dependencyId) {
            if ($dependencyId === $tugasId) {
                continue;
            }

            TugasDependency::firstOrCreate([
                'tugas_id' => $tugasId,
                'depends_on_tugas_id' => $dependencyId,
            ]);
        }
    }

    /**
     * @param array<int, array<string, mixed>> $reminders
     */
    public function createReminders(int $tugasId, array $reminders): void
    {
        foreach ($reminders as $reminder) {
            $value = (int) ($reminder['value'] ?? 0);
            if ($value <= 0) {
                continue;
            }

            TugasReminder::create([
                'tugas_id' => $tugasId,
                'type' => in_array(($reminder['type'] ?? ''), ['before_deadline', 'custom'], true)
                    ? $reminder['type']
                    : 'before_deadline',
                'value' => $value,
                'unit' => in_array(($reminder['unit'] ?? ''), ['minutes', 'hours', 'days', 'weeks'], true)
                    ? $reminder['unit']
                    : 'hours',
                'enabled' => (bool) ($reminder['enabled'] ?? true),
            ]);
        }
    }

    /**
     * @param array<int, UploadedFile|array<string, mixed>> $files
     */
    public function attachFiles(int $tugasId, array $files, string $ownerType, int $ownerId): void
    {
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $storedPath = $file->store('tugas-attachments', 'public');

                TugasAttachment::create([
                    'tugas_id' => $tugasId,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $storedPath,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by_type' => $ownerType,
                    'uploaded_by_id' => $ownerId,
                ]);
                continue;
            }

            $filePath = Arr::get($file, 'file_path');
            $fileName = Arr::get($file, 'file_name');
            if (!$filePath || !$fileName) {
                continue;
            }

            TugasAttachment::create([
                'tugas_id' => $tugasId,
                'file_name' => (string) $fileName,
                'file_path' => (string) $filePath,
                'file_type' => Arr::get($file, 'file_type'),
                'file_size' => Arr::get($file, 'file_size') ? (int) Arr::get($file, 'file_size') : null,
                'uploaded_by_type' => $ownerType,
                'uploaded_by_id' => $ownerId,
            ]);
        }
    }

    public function schedulePublication(Tugas $tugas): void
    {
        if ($tugas->schedule_type === 'scheduled' && $tugas->publish_at) {
            PublishTugasJob::dispatch($tugas->id)->delay($tugas->publish_at);
            return;
        }

        if ($tugas->schedule_type === 'recurring' && is_array($tugas->recurring_pattern)) {
            $this->createRecurringSchedule($tugas);
        }
    }

    public function processReminders(): void
    {
        $reminders = TugasReminder::query()
            ->where('enabled', true)
            ->whereNull('sent_at')
            ->with('tugas')
            ->get();

        foreach ($reminders as $reminder) {
            if (!$reminder->tugas?->deadline) {
                continue;
            }

            $deadline = Carbon::parse($reminder->tugas->deadline);
            $sendAt = $this->calculateReminderDate($deadline, $reminder->value, $reminder->unit);

            if (now()->lt($sendAt) || now()->gt($deadline)) {
                continue;
            }

            SendTugasReminderJob::dispatch($reminder->id);
            $reminder->update(['sent_at' => now()]);
        }
    }

    private function createRecurringSchedule(Tugas $tugas): void
    {
        $pattern = $tugas->recurring_pattern ?? [];
        $frequency = (string) ($pattern['frequency'] ?? 'weekly');
        $interval = max(1, (int) ($pattern['interval'] ?? 1));
        $endDate = isset($pattern['endDate']) && $pattern['endDate']
            ? Carbon::parse($pattern['endDate'])
            : now()->copy()->addMonths(6);

        $publishStart = $tugas->publish_at ? Carbon::parse($tugas->publish_at) : now();
        $occurrences = $this->calculateOccurrences($publishStart, $frequency, $interval, $endDate);

        foreach ($occurrences as $date) {
            $newTugas = $tugas->replicate();
            $newTugas->status = 'draft';
            $newTugas->publish_at = $date;
            $newTugas->schedule_type = 'scheduled';
            $newTugas->save();

            PublishTugasJob::dispatch($newTugas->id)->delay($date);
        }
    }

    /**
     * @return array<int, Carbon>
     */
    private function calculateOccurrences(Carbon $start, string $frequency, int $interval, Carbon $end): array
    {
        $dates = [];
        $cursor = $start->copy();

        for ($i = 0; $i < 52; $i++) {
            $cursor = match ($frequency) {
                'daily' => $cursor->copy()->addDays($interval),
                'monthly' => $cursor->copy()->addMonths($interval),
                default => $cursor->copy()->addWeeks($interval),
            };

            if ($cursor->gt($end)) {
                break;
            }

            $dates[] = $cursor->copy();
        }

        return $dates;
    }

    private function calculateReminderDate(Carbon $deadline, int $value, string $unit): Carbon
    {
        return match ($unit) {
            'minutes' => $deadline->copy()->subMinutes($value),
            'days' => $deadline->copy()->subDays($value),
            'weeks' => $deadline->copy()->subWeeks($value),
            default => $deadline->copy()->subHours($value),
        };
    }
}
