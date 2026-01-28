<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\MahasiswaCourse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $mahasiswa = $request->user('mahasiswa');
        
        // Get enrolled courses
        $enrolledCourseIds = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->pluck('course_id')
            ->toArray();

        // Get schedules for enrolled courses
        $schedules = Schedule::with(['course', 'dosen'])
            ->whereIn('course_id', $enrolledCourseIds)
            ->active()
            ->orderBy('hari')
            ->orderBy('jam_mulai')
            ->get()
            ->groupBy('hari');

        // Days of week in order
        $daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        
        // Organize schedules by day
        $organizedSchedules = collect($daysOrder)->mapWithKeys(function ($day) use ($schedules) {
            return [$day => $schedules->get($day, collect())->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'course_name' => $schedule->course->nama,
                    'course_code' => $schedule->course->kode,
                    'dosen_name' => $schedule->dosen->nama,
                    'ruangan' => $schedule->ruangan,
                    'time_range' => $schedule->time_range,
                    'jam_mulai' => $schedule->jam_mulai->format('H:i'),
                    'jam_selesai' => $schedule->jam_selesai->format('H:i'),
                    'duration' => $schedule->duration,
                    'notes' => $schedule->notes,
                    'color' => $this->getColorForCourse($schedule->course_id),
                ];
            })];
        });

        // Get today's schedule
        $today = Carbon::now()->locale('id')->dayName;
        $todaySchedule = $organizedSchedules->get($today, collect());

        // Get next class
        $nextClass = $this->getNextClass($organizedSchedules);

        // Statistics
        $stats = [
            'total_courses' => count($enrolledCourseIds),
            'total_classes_per_week' => Schedule::whereIn('course_id', $enrolledCourseIds)
                ->active()
                ->count(),
            'classes_today' => $todaySchedule->count(),
            'busiest_day' => $organizedSchedules->map->count()->sortDesc()->keys()->first(),
        ];

        return Inertia::render('student/schedule', [
            'schedules' => $organizedSchedules,
            'todaySchedule' => $todaySchedule,
            'nextClass' => $nextClass,
            'stats' => $stats,
            'currentDay' => $today,
        ]);
    }

    private function getNextClass($schedules)
    {
        $now = Carbon::now();
        $currentDay = $now->locale('id')->dayName;
        $currentTime = $now->format('H:i');

        // Days of week in order
        $daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        $currentDayIndex = array_search($currentDay, $daysOrder);

        // Check today's remaining classes
        $todayClasses = $schedules->get($currentDay, collect())
            ->filter(function ($class) use ($currentTime) {
                return $class['jam_mulai'] > $currentTime;
            })
            ->sortBy('jam_mulai');

        if ($todayClasses->isNotEmpty()) {
            $nextClass = $todayClasses->first();
            $nextClass['day'] = $currentDay;
            $nextClass['is_today'] = true;
            return $nextClass;
        }

        // Check next days
        for ($i = 1; $i <= 7; $i++) {
            $nextDayIndex = ($currentDayIndex + $i) % 7;
            $nextDay = $daysOrder[$nextDayIndex];
            $nextDayClasses = $schedules->get($nextDay, collect())->sortBy('jam_mulai');

            if ($nextDayClasses->isNotEmpty()) {
                $nextClass = $nextDayClasses->first();
                $nextClass['day'] = $nextDay;
                $nextClass['is_today'] = false;
                return $nextClass;
            }
        }

        return null;
    }

    private function getColorForCourse($courseId): string
    {
        $colors = [
            'blue', 'green', 'purple', 'orange', 'pink', 
            'indigo', 'teal', 'cyan', 'amber', 'rose'
        ];
        
        return $colors[$courseId % count($colors)];
    }
}
