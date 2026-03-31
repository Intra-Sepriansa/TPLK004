<?php

namespace App\Services;

use App\Models\MataKuliah;
use App\Models\MahasiswaCourse;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class MeetingQuickFillService
{
    private const CLASS_SCHEDULE_TEMPLATES = [
        '06TPLK004' => [
            '22TIF0323' => ['day' => 'Kamis', 'start' => '07:40', 'end' => '09:20'],
            '22TIF0353' => ['day' => 'Kamis', 'start' => '09:20', 'end' => '11:00'],
            '22TIF2012' => ['day' => 'Kamis', 'start' => '11:00', 'end' => '13:50'],
            '22TIF3012' => ['day' => 'Kamis', 'start' => '16:00', 'end' => '17:40'],
        ],
    ];

    private const FIXED_OFFLINE_TIME_SLOTS = [
        ['start' => '07:40', 'end' => '09:20'],
        ['start' => '09:20', 'end' => '11:00'],
        ['start' => '11:00', 'end' => '13:50'],
        ['start' => '13:50', 'end' => '15:30'],
        ['start' => '16:00', 'end' => '17:40'],
    ];

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
            'schedule_template' => $this->resolveScheduleTemplate($course),
            'meeting_templates' => $meetingTemplates->all(),
        ];
    }

    public function resolveScheduleTemplate(MataKuliah $course): ?array
    {
        $classCode = trim((string) ($course->kelas ?? ''));
        $courseCode = trim((string) ($course->kode ?? ''));
        $classTemplate = self::CLASS_SCHEDULE_TEMPLATES[$classCode][$courseCode] ?? null;

        if ($classTemplate) {
            return $this->formatScheduleTemplate(
                $classTemplate['day'],
                $classTemplate['start'],
                $classTemplate['end'],
                null,
            );
        }

        $classCourses = MataKuliah::query()
            ->where('kelas', $course->kelas)
            ->orderBy('id')
            ->get(['id']);

        $courseIndex = $classCourses->search(fn (MataKuliah $item) => (int) $item->id === (int) $course->id);

        if ($courseIndex !== false) {
            $slot = self::FIXED_OFFLINE_TIME_SLOTS[$courseIndex % count(self::FIXED_OFFLINE_TIME_SLOTS)] ?? null;

            if ($slot) {
                return $this->formatScheduleTemplate('Kamis', $slot['start'], $slot['end'], null);
            }
        }

        $courseSchedule = MahasiswaCourse::query()
            ->where('name', $course->nama)
            ->orderBy('id')
            ->first();

        if (! $courseSchedule?->schedule_time) {
            return null;
        }

        $startTime = Carbon::parse($courseSchedule->schedule_time)->format('H:i');
        $fallbackSlot = collect(self::FIXED_OFFLINE_TIME_SLOTS)->firstWhere('start', $startTime);

        if ($fallbackSlot) {
            return $this->formatScheduleTemplate(
                $courseSchedule->effective_schedule_day_name,
                $fallbackSlot['start'],
                $fallbackSlot['end'],
                $courseSchedule->ruangan ?: null,
            );
        }

        $durationMinutes = max((int) ($courseSchedule->sks ?: $course->sks), 1) * 50;
        $endTime = Carbon::parse($courseSchedule->schedule_time)
            ->copy()
            ->addMinutes($durationMinutes)
            ->format('H:i');

        return $this->formatScheduleTemplate(
            $courseSchedule->effective_schedule_day_name,
            $startTime,
            $endTime,
            $courseSchedule->ruangan ?: null,
        );
    }

    private function formatScheduleTemplate(
        string $dayName,
        string $startTime,
        string $endTime,
        ?string $room,
    ): array {
        $durationMinutes = Carbon::createFromFormat('H:i', $startTime)
            ->diffInMinutes(Carbon::createFromFormat('H:i', $endTime));

        return [
            'day_name' => $dayName,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'scan_start_time' => $startTime,
            'scan_end_time' => $endTime,
            'duration_minutes' => $durationMinutes,
            'room' => $room,
            'label' => sprintf('%s, %s - %s', $dayName, $startTime, $endTime),
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
                $mode = $meeting->mode ?: 'offline';
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
        $templatePayload = $meetingTemplate ?? [];
        $resolvedTitle = trim((string) $title);
        $resolvedDescription = trim((string) $description);

        if ($resolvedTitle === '') {
            $resolvedTitle = $templatePayload['suggested_title'] ?? "Pertemuan {$meetingNumber}";
        }

        if ($resolvedDescription === '') {
            $resolvedDescription = $templatePayload['suggested_description'] ?? '';
        }

        return [
            'title' => $resolvedTitle,
            'description' => $resolvedDescription !== '' ? $resolvedDescription : null,
            'template' => $templatePayload,
        ];
    }
}
