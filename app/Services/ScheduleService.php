<?php

namespace App\Services;

use App\Models\MahasiswaCourse;
use App\Models\CourseMeeting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ScheduleService
{
    /**
     * Calculate total meetings based on SKS
     * SKS 2 = 14 meetings, SKS 3 = 21 meetings
     */
    public function calculateTotalMeetings(int $sks): int
    {
        return match ($sks) {
            2 => 14,
            3 => 21,
            default => throw new \InvalidArgumentException("SKS must be 2 or 3, got: {$sks}"),
        };
    }

    /**
     * Calculate UTS meeting number based on SKS
     * SKS 2 = after meeting 7, SKS 3 = after meeting 14
     */
    public function calculateUtsMeeting(int $sks): int
    {
        return match ($sks) {
            2 => 7,
            3 => 14,
            default => throw new \InvalidArgumentException("SKS must be 2 or 3, got: {$sks}"),
        };
    }

    /**
     * Calculate UAS meeting number based on SKS
     * SKS 2 = after meeting 14, SKS 3 = after meeting 21
     */
    public function calculateUasMeeting(int $sks): int
    {
        return match ($sks) {
            2 => 14,
            3 => 21,
            default => throw new \InvalidArgumentException("SKS must be 2 or 3, got: {$sks}"),
        };
    }

    /**
     * Calculate exam date based on course start date and meeting number
     */
    public function calculateExamDate(MahasiswaCourse $course, string $examType): ?Carbon
    {
        if (!$course->start_date) {
            return null;
        }

        $meetingNumber = $examType === 'uts' ? $course->uts_meeting : $course->uas_meeting;
        $weeksToAdd = $meetingNumber - 1;

        return Carbon::parse($course->start_date)->addWeeks($weeksToAdd);
    }

    /**
     * Get countdown days to a target date
     */
    public function getCountdownDays(Carbon $targetDate): int
    {
        return (int) now()->startOfDay()->diffInDays($targetDate, false);
    }

    /**
     * Get alert level based on days remaining
     * Returns: ['isWarning' => bool, 'isCritical' => bool]
     */
    public function getAlertLevel(int $daysRemaining): array
    {
        return [
            'isWarning' => $daysRemaining <= 7 && $daysRemaining >= 0,
            'isCritical' => $daysRemaining <= 3 && $daysRemaining >= 0,
        ];
    }

    /**
     * Generate meeting schedule for a course
     */
    public function generateMeetingSchedule(MahasiswaCourse $course): array
    {
        $meetings = [];
        $startDate = $course->start_date ? Carbon::parse($course->start_date) : now();

        for ($i = 1; $i <= $course->total_meetings; $i++) {
            $scheduledDate = $startDate->copy()->addWeeks($i - 1);
            
            $meetings[] = [
                'mahasiswa_course_id' => $course->id,
                'meeting_number' => $i,
                'scheduled_date' => $scheduledDate->format('Y-m-d'),
                'is_completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        return $meetings;
    }

    /**
     * Get today's schedule for a mahasiswa
     */
    public function getTodaySchedule(int $mahasiswaId): Collection
    {
        $today = strtolower(now()->format('l')); // monday, tuesday, etc.

        return MahasiswaCourse::where('mahasiswa_id', $mahasiswaId)
            ->where('schedule_day', $today)
            ->with(['meetings' => function ($query) {
                $query->where('is_completed', false)->orderBy('meeting_number')->limit(1);
            }])
            ->get()
            ->map(function ($course) {
                $nextMeeting = $course->meetings->first();
                return [
                    'id' => $course->id,
                    'course_name' => $course->name,
                    'time' => $course->schedule_time?->format('H:i'),
                    'mode' => $course->mode,
                    'mode_name' => $course->mode_name,
                    'meeting_number' => $nextMeeting?->meeting_number ?? ($course->current_meeting + 1),
                    'total_meetings' => $course->total_meetings,
                    'progress' => $course->progress,
                    'is_completed' => $course->current_meeting >= $course->total_meetings,
                ];
            });
    }

    /**
     * Get weekly schedule for a mahasiswa
     */
    public function getWeeklySchedule(int $mahasiswaId): array
    {
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswaId)
            ->with(['meetings' => function ($query) {
                $query->orderBy('meeting_number');
            }])
            ->get();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $schedule = [];

        foreach ($days as $day) {
            $schedule[$day] = $courses
                ->where('schedule_day', $day)
                ->map(function ($course) {
                    $nextMeeting = $course->meetings->where('is_completed', false)->first();
                    return [
                        'id' => $course->id,
                        'course_name' => $course->name,
                        'time' => $course->schedule_time?->format('H:i'),
                        'mode' => $course->mode,
                        'mode_name' => $course->mode_name,
                        'meeting_number' => $nextMeeting?->meeting_number ?? ($course->current_meeting + 1),
                        'total_meetings' => $course->total_meetings,
                        'progress' => $course->progress,
                        'is_completed' => $course->current_meeting >= $course->total_meetings,
                    ];
                })
                ->sortBy('time')
                ->values()
                ->toArray();
        }

        return $schedule;
    }

    /**
     * Get upcoming exams for a mahasiswa
     */
    public function getUpcomingExams(int $mahasiswaId): Collection
    {
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswaId)->get();
        $exams = collect();

        foreach ($courses as $course) {
            // UTS
            if ($course->current_meeting < $course->uts_meeting) {
                $utsDate = $this->calculateExamDate($course, 'uts');
                if ($utsDate && $utsDate->isFuture()) {
                    $daysRemaining = $this->getCountdownDays($utsDate);
                    $alertLevel = $this->getAlertLevel($daysRemaining);
                    
                    $exams->push([
                        'id' => $course->id . '_uts',
                        'course_id' => $course->id,
                        'course_name' => $course->name,
                        'type' => 'UTS',
                        'date' => $utsDate->format('Y-m-d'),
                        'date_formatted' => $utsDate->translatedFormat('d F Y'),
                        'days_remaining' => $daysRemaining,
                        'meeting_number' => $course->uts_meeting,
                        'is_warning' => $alertLevel['isWarning'],
                        'is_critical' => $alertLevel['isCritical'],
                    ]);
                }
            }

            // UAS
            if ($course->current_meeting < $course->uas_meeting) {
                $uasDate = $this->calculateExamDate($course, 'uas');
                if ($uasDate && $uasDate->isFuture()) {
                    $daysRemaining = $this->getCountdownDays($uasDate);
                    $alertLevel = $this->getAlertLevel($daysRemaining);
                    
                    $exams->push([
                        'id' => $course->id . '_uas',
                        'course_id' => $course->id,
                        'course_name' => $course->name,
                        'type' => 'UAS',
                        'date' => $uasDate->format('Y-m-d'),
                        'date_formatted' => $uasDate->translatedFormat('d F Y'),
                        'days_remaining' => $daysRemaining,
                        'meeting_number' => $course->uas_meeting,
                        'is_warning' => $alertLevel['isWarning'],
                        'is_critical' => $alertLevel['isCritical'],
                    ]);
                }
            }
        }

        return $exams->sortBy('days_remaining')->values();
    }
}
