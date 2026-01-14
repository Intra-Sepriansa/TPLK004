<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AcademicNote;
use App\Models\AcademicTask;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Services\ScheduleService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AcademicScheduleController extends Controller
{
    public function __construct(
        private ScheduleService $scheduleService
    ) {}

    public function dashboard(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        // Auto-sync courses from mata_kuliah if mahasiswa has no courses yet
        $this->syncCoursesFromMataKuliah($mahasiswa->id);

        // Today's schedule
        $todaySchedule = $this->scheduleService->getTodaySchedule($mahasiswa->id);

        // Pending tasks (urgent first)
        $pendingTasks = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', '!=', 'completed')
            ->with('course:id,name')
            ->orderByRaw("CASE WHEN deadline IS NULL THEN 1 ELSE 0 END")
            ->orderBy('deadline')
            ->limit(5)
            ->get()
            ->map(fn($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'course_name' => $task->course?->name ?? 'Unknown',
                'deadline' => $task->deadline?->format('Y-m-d'),
                'deadline_formatted' => $task->deadline?->translatedFormat('d M'),
                'days_remaining' => $task->days_remaining,
                'is_overdue' => $task->is_overdue,
                'status' => $task->status,
            ]);

        // Upcoming exams
        $upcomingExams = $this->scheduleService->getUpcomingExams($mahasiswa->id)->take(4);

        // Course progress
        $courseProgress = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->get()
            ->map(fn($course) => [
                'id' => $course->id,
                'name' => $course->name,
                'progress' => $course->progress,
                'current_meeting' => $course->current_meeting,
                'total_meetings' => $course->total_meetings,
                'mode' => $course->mode,
            ]);

        // Recent notes
        $recentNotes = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->with('course:id,name,mode')
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn($note) => [
                'id' => $note->id,
                'title' => $note->title,
                'course_name' => $note->course?->name ?? 'Unknown',
                'course_mode' => $note->course?->mode ?? 'online',
                'meeting_number' => $note->meeting_number,
                'created_at' => $note->created_at->diffForHumans(),
            ]);

        // Stats
        $totalCourses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)->count();
        $allTasks = AcademicTask::where('mahasiswa_id', $mahasiswa->id);
        $completedTasks = (clone $allTasks)->where('status', 'completed')->count();
        $pendingTasksCount = (clone $allTasks)->where('status', '!=', 'completed')->count();
        $overdueTasks = (clone $allTasks)->overdue()->count();

        // Weekly progress (tasks completed this week)
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        $tasksThisWeek = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->whereBetween('created_at', [$weekStart, $weekEnd])
            ->count();
        $completedThisWeek = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$weekStart, $weekEnd])
            ->count();
        $weeklyProgress = $tasksThisWeek > 0 
            ? round(($completedThisWeek / $tasksThisWeek) * 100) 
            : 100;

        return Inertia::render('user/akademik/index', [
            'todaySchedule' => $todaySchedule,
            'pendingTasks' => $pendingTasks,
            'upcomingExams' => $upcomingExams,
            'courseProgress' => $courseProgress,
            'recentNotes' => $recentNotes,
            'stats' => [
                'totalCourses' => $totalCourses,
                'completedTasks' => $completedTasks,
                'pendingTasks' => $pendingTasksCount,
                'overdueTasks' => $overdueTasks,
                'weeklyProgress' => $weeklyProgress,
            ],
            'today' => [
                'day' => now()->translatedFormat('l'),
                'date' => now()->translatedFormat('d F Y'),
            ],
        ]);
    }

    public function schedule(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $weeklySchedule = $this->scheduleService->getWeeklySchedule($mahasiswa->id);

        // Get current day
        $currentDay = strtolower(now()->format('l'));

        // Day names in Indonesian
        $dayNames = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
        ];

        return Inertia::render('user/akademik/jadwal', [
            'weeklySchedule' => $weeklySchedule,
            'currentDay' => $currentDay,
            'dayNames' => $dayNames,
            'today' => [
                'day' => now()->translatedFormat('l'),
                'date' => now()->translatedFormat('d F Y'),
            ],
        ]);
    }

    public function exams(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $upcomingExams = $this->scheduleService->getUpcomingExams($mahasiswa->id);

        // Group by month for calendar view
        $examsByMonth = $upcomingExams->groupBy(function ($exam) {
            return \Carbon\Carbon::parse($exam['date'])->format('Y-m');
        })->map(function ($exams, $month) {
            $date = \Carbon\Carbon::parse($month . '-01');
            return [
                'month' => $date->translatedFormat('F Y'),
                'exams' => $exams->values(),
            ];
        })->values();

        // Get courses for reference
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->select('id', 'name', 'sks', 'uts_meeting', 'uas_meeting', 'current_meeting', 'total_meetings')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'sks' => $c->sks,
                'uts_meeting' => $c->uts_meeting,
                'uas_meeting' => $c->uas_meeting,
                'current_meeting' => $c->current_meeting,
                'total_meetings' => $c->total_meetings,
                'uts_passed' => $c->current_meeting >= $c->uts_meeting,
                'uas_passed' => $c->current_meeting >= $c->uas_meeting,
            ]);

        // Preparation checklist template
        $preparationChecklist = [
            ['id' => 1, 'text' => 'Review semua catatan pertemuan'],
            ['id' => 2, 'text' => 'Kerjakan latihan soal'],
            ['id' => 3, 'text' => 'Buat ringkasan materi'],
            ['id' => 4, 'text' => 'Diskusi dengan teman'],
            ['id' => 5, 'text' => 'Tanya dosen jika ada yang kurang jelas'],
            ['id' => 6, 'text' => 'Istirahat cukup sebelum ujian'],
        ];

        return Inertia::render('user/akademik/ujian', [
            'upcomingExams' => $upcomingExams,
            'examsByMonth' => $examsByMonth,
            'courses' => $courses,
            'preparationChecklist' => $preparationChecklist,
        ]);
    }

    /**
     * Sync courses from mata_kuliah table to mahasiswa_courses for a student
     */
    private function syncCoursesFromMataKuliah(int $mahasiswaId): void
    {
        // Check if mahasiswa already has courses
        $existingCount = MahasiswaCourse::where('mahasiswa_id', $mahasiswaId)->count();
        
        if ($existingCount > 0) {
            return; // Already has courses, no need to sync
        }

        // Get all mata kuliah with dosen info
        $mataKuliahs = MataKuliah::with('dosen')->get();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $times = ['08:00', '10:00', '13:00', '15:00'];
        $dayIndex = 0;
        $timeIndex = 0;

        foreach ($mataKuliahs as $mk) {
            MahasiswaCourse::create([
                'mahasiswa_id' => $mahasiswaId,
                'name' => $mk->nama,
                'sks' => $mk->sks ?? 3,
                'total_meetings' => 16, // Default 16 pertemuan
                'current_meeting' => 1,
                'uts_meeting' => 8,
                'uas_meeting' => 16,
                'schedule_day' => $days[$dayIndex % count($days)],
                'schedule_time' => $times[$timeIndex % count($times)],
                'mode' => 'offline',
                'start_date' => now()->startOfMonth(),
            ]);

            $timeIndex++;
            if ($timeIndex % count($times) === 0) {
                $dayIndex++;
            }
        }
    }
}
