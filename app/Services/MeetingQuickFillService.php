<?php

namespace App\Services;

use App\Models\MataKuliah;
use Illuminate\Support\Collection;

class MeetingQuickFillService
{
    public function buildCoursePayload(MataKuliah $course): array
    {
        $meetingTemplates = $this->getMeetingTemplates($course);

        return [
            'offline_meetings' => $meetingTemplates
                ->filter(fn (array $meeting) => $meeting['is_offline'])
                ->pluck('meeting_number')
                ->values()
                ->all(),
            'quick_ready_meetings' => $meetingTemplates
                ->filter(fn (array $meeting) => $meeting['quick_ready'])
                ->pluck('meeting_number')
                ->values()
                ->all(),
            'meeting_templates' => $meetingTemplates->all(),
        ];
    }

    public function getMeetingTemplates(MataKuliah $course): Collection
    {
        $meetings = $course->relationLoaded('meetingPlans')
            ? $course->meetingPlans
            : $course->meetingPlans()->orderBy('pertemuan_ke')->get();

        return $meetings
            ->map(function ($meeting) {
                $meetingNumber = (int) $meeting->pertemuan_ke;
                $topic = trim((string) ($meeting->topik ?? ''));
                $description = trim((string) ($meeting->deskripsi ?? ''));
                $mode = $meeting->mode ?: null;
                $isOffline = $mode === 'offline';
                $quickReady = $isOffline && ($topic !== '' || $description !== '');
                $suggestedTitle = $topic !== ''
                    ? "Pertemuan {$meetingNumber} - {$topic}"
                    : "Pertemuan {$meetingNumber}";
                $suggestedDescription = $description !== ''
                    ? $description
                    : ($topic !== ''
                        ? "Pembahasan utama pertemuan {$meetingNumber}: {$topic}."
                        : '');

                return [
                    'meeting_number' => $meetingNumber,
                    'topic' => $topic !== '' ? $topic : null,
                    'description' => $description !== '' ? $description : null,
                    'mode' => $mode,
                    'is_offline' => $isOffline,
                    'quick_ready' => $quickReady,
                    'suggested_title' => $suggestedTitle,
                    'suggested_description' => $suggestedDescription,
                ];
            })
            ->values();
    }

    public function findMeetingTemplate(MataKuliah $course, int $meetingNumber): ?array
    {
        return $this->getMeetingTemplates($course)
            ->firstWhere('meeting_number', $meetingNumber);
    }

    public function validateOfflineMeetingSelection(MataKuliah $course, int $meetingNumber): ?string
    {
        $meetingTemplates = $this->getMeetingTemplates($course);
        if ($meetingTemplates->isEmpty()) {
            return null;
        }

        $meetingTemplate = $meetingTemplates->firstWhere('meeting_number', $meetingNumber);
        if (! $meetingTemplate) {
            return 'Pertemuan ini belum terdaftar di data RPS/pertemuan mata kuliah.';
        }

        if (! $meetingTemplate['is_offline']) {
            return 'Hanya pertemuan offline yang bisa dibuat sebagai sesi absen QR, selfie, dan lokasi.';
        }

        return null;
    }

    public function resolveSessionContent(
        MataKuliah $course,
        int $meetingNumber,
        ?string $title = null,
        ?string $description = null,
    ): array {
        $meetingTemplate = $this->findMeetingTemplate($course, $meetingNumber);
        $resolvedTitle = trim((string) $title);
        $resolvedDescription = trim((string) $description);

        if ($resolvedTitle === '') {
            $resolvedTitle = $meetingTemplate['suggested_title'] ?? "Pertemuan {$meetingNumber}";
        }

        if ($resolvedDescription === '') {
            $resolvedDescription = $meetingTemplate['suggested_description'] ?? '';
        }

        return [
            'title' => $resolvedTitle,
            'description' => $resolvedDescription !== '' ? $resolvedDescription : null,
            'template' => $meetingTemplate,
        ];
    }
}
