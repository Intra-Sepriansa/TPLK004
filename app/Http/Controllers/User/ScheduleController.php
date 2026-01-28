<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
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
        
        // Get enrolled courses from mahasiswa_courses table
        $enrolledCourses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)->get();

        // Map schedule day to Indonesian
        $dayMapping = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
            'sunday' => 'Minggu',
        ];

        // Transform mahasiswa_courses to schedule format
        $schedules = $enrolledCourses->map(function ($course) use ($dayMapping) {
            $startTime = \Carbon\Carbon::parse($course->schedule_time);
            $endTime = $startTime->copy()->addMinutes($course->sks * 50); // Assume 50 min per SKS
            
            return [
                'id' => $course->id,
                'course_name' => $course->name,
                'course_code' => 'MK-' . str_pad($course->id, 3, '0', STR_PAD_LEFT),
                'dosen_name' => 'Dosen', // Default since we don't have dosen relation
                'ruangan' => $course->mode === 'online' ? 'Online' : 'Ruang Kelas',
                'time_range' => $startTime->format('H:i') . ' - ' . $endTime->format('H:i'),
                'jam_mulai' => $startTime->format('H:i'),
                'jam_selesai' => $endTime->format('H:i'),
                'duration' => ($course->sks * 50) . ' menit',
                'notes' => 'SKS: ' . $course->sks . ' | Mode: ' . ucfirst($course->mode),
                'color' => $this->getColorForCourse($course->id),
                'hari' => $dayMapping[$course->schedule_day] ?? 'Senin',
            ];
        })->groupBy('hari');

        // Days of week in order
        $daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        
        // Organize schedules by day
        $organizedSchedules = collect($daysOrder)->mapWithKeys(function ($day) use ($schedules) {
            return [$day => $schedules->get($day, collect())];
        });

        // Get today's schedule
        $today = Carbon::now()->locale('id')->dayName;
        $todaySchedule = $organizedSchedules->get($today, collect());

        // Get next class
        $nextClass = $this->getNextClass($organizedSchedules);

        // Statistics
        $stats = [
            'total_courses' => $enrolledCourses->count(),
            'total_classes_per_week' => $enrolledCourses->count(),
            'classes_today' => $todaySchedule->count(),
            'busiest_day' => $organizedSchedules->map->count()->sortDesc()->keys()->first() ?? 'Senin',
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
