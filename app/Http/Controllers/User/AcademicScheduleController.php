<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AcademicNote;
use App\Models\AcademicTask;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Services\ScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicScheduleController extends Controller
{
    public function __construct(
        private ScheduleService $scheduleService
    ) {}

    public function dashboard(): Response|RedirectResponse
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
                'mode' => $course->effective_mode,
            ]);

        // Recent notes
        $recentNotes = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->with('course')
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn($note) => [
                'id' => $note->id,
                'title' => $note->title,
                'course_name' => $note->course?->name ?? 'Unknown',
                'course_mode' => $note->course?->effective_mode ?? 'online',
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

        // Auto-sync courses if needed
        $this->syncCoursesFromMataKuliah($mahasiswa->id);

        $weeklySchedule = $this->scheduleService->getWeeklySchedule($mahasiswa->id);

        // Get current day in english lowercase
        $currentDayEn = strtolower(now()->format('l'));

        // Day names mapping
        $dayNames = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
        ];

        // Get all courses for stats
        $allCourses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)->get();

        // Enrich schedule with sks and fetch real dosen data
        $colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo', 'teal', 'cyan', 'amber', 'rose'];
        
        $enrichedSchedule = [];
        foreach ($weeklySchedule as $day => $items) {
            $enrichedSchedule[$day] = collect($items)->map(function ($item) use ($allCourses, $colors) {
                $course = $allCourses->firstWhere('id', $item['id']);
                // Try to match with original Mata Kuliah to get dosen info
                $mataKuliah = \App\Models\MataKuliah::where('nama', $course?->name)->with('dosen')->first();
                
                $item['sks'] = $course?->sks ?? 3;
                
                $startTime = $course?->schedule_time;
                $endTime = $startTime ? $startTime->copy()->addMinutes($item['sks'] * 50) : null;
                
                $item['schedule_time_end'] = $endTime ? $endTime->format('H:i') : null;
                
                // Fields required by the frontend schedule UI
                $item['course_code'] = $mataKuliah?->kode ?? ('MK-' . str_pad($item['id'] ?? 1, 3, '0', STR_PAD_LEFT));
                $item['dosen_name'] = $mataKuliah?->dosen?->nama ?? 'Dosen Belum Ditentukan';
                $item['ruangan'] = $item['mode'] === 'online' ? 'Online/Zoom' : ($mataKuliah?->ruang ?? 'Ruang Kelas');
                $item['jam_mulai'] = $item['time'] ?? '00:00';
                $item['jam_selesai'] = $item['schedule_time_end'] ?? '00:00';
                $item['time_range'] = $item['jam_mulai'] . ' - ' . $item['jam_selesai'];
                $item['duration'] = ($item['sks'] * 50) . ' menit';
                $item['color'] = $colors[($item['id'] ?? 1) % count($colors)];
                $item['notes'] = 'SKS: ' . $item['sks'] . ' | Mode: ' . ucfirst($item['mode'] ?? 'offline');
                
                return $item;
            })->toArray();
        }

        // Stats
        $totalClasses = collect($weeklySchedule)->flatten(1)->count();
        $todayClasses = count($enrichedSchedule[$currentDayEn] ?? []);
        $totalSks = $allCourses->sum('sks');

        // Busiest day
        $busiestDay = 'monday';
        $busiestCount = 0;
        foreach ($dayNames as $en => $id) {
            $count = count($enrichedSchedule[$en] ?? []);
            if ($count > $busiestCount) {
                $busiestCount = $count;
                $busiestDay = $id;
            }
        }

        // Next class calculation
        $currentTime = now()->format('H:i');
        $nextClass = null;
        $daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $currentDayIndex = array_search($currentDayEn, $daysOrder);

        // Check today's remaining classes first
        if ($currentDayIndex !== false) {
            $todayItems = $enrichedSchedule[$currentDayEn] ?? [];
            foreach ($todayItems as $item) {
                if ($item['time'] && $item['time'] > $currentTime) {
                    $nextClass = array_merge($item, [
                        'day' => $dayNames[$currentDayEn],
                        'is_today' => true,
                    ]);
                    break;
                }
            }
        }

        // If no class today, check next days
        if (!$nextClass) {
            $daysCount = count($daysOrder);
            for ($i = 1; $i <= $daysCount; $i++) {
                $checkIndex = (($currentDayIndex !== false ? $currentDayIndex : 0) + $i) % $daysCount;
                $checkDay = $daysOrder[$checkIndex];
                $dayItems = $enrichedSchedule[$checkDay] ?? [];
                if (!empty($dayItems)) {
                    $nextClass = array_merge($dayItems[0], [
                        'day' => $dayNames[$checkDay],
                        'is_today' => false,
                    ]);
                    break;
                }
            }
        }

        return Inertia::render('user/akademik/jadwal', [
            'weeklySchedule' => $enrichedSchedule,
            'currentDay' => $currentDayEn,
            'dayNames' => $dayNames,
            'today' => [
                'day' => now()->translatedFormat('l'),
                'date' => now()->translatedFormat('d F Y'),
            ],
            'stats' => [
                'total_courses' => $allCourses->count(),
                'total_classes_per_week' => $totalClasses,
                'classes_today' => $todayClasses,
                'total_sks' => $totalSks,
                'busiest_day' => $busiestDay,
            ],
            'nextClass' => $nextClass,
        ]);
    }

    public function exams(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        return Inertia::render('user/akademik/ujian', $this->buildExamPayload($mahasiswa->id));
    }

    public function examDetail(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $payload = $this->buildExamPayload($mahasiswa->id);

        $payload['selectedCourseId'] = $request->integer('course_id');
        $payload['selectedExamId'] = $request->integer('exam_id');

        return Inertia::render('user/akademik/ujian-detail', $payload);
    }

    private function buildExamPayload(int $mahasiswaId): array
    {
        $upcomingExams = $this->scheduleService->getUpcomingExams($mahasiswaId);

        $examsByMonth = $upcomingExams->groupBy(function ($exam) {
            return \Carbon\Carbon::parse($exam['date'])->format('Y-m');
        })->map(function ($exams, $month) {
            $date = \Carbon\Carbon::parse($month . '-01');
            return [
                'month' => $date->translatedFormat('F Y'),
                'exams' => $exams->values(),
            ];
        })->values();

        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswaId)
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

        $preparationChecklist = [
            ['id' => 1, 'text' => 'Review semua catatan pertemuan'],
            ['id' => 2, 'text' => 'Kerjakan latihan soal'],
            ['id' => 3, 'text' => 'Buat ringkasan materi'],
            ['id' => 4, 'text' => 'Diskusi dengan teman'],
            ['id' => 5, 'text' => 'Tanya dosen jika ada yang kurang jelas'],
            ['id' => 6, 'text' => 'Istirahat cukup sebelum ujian'],
        ];

        return [
            'upcomingExams' => $upcomingExams,
            'examsByMonth' => $examsByMonth,
            'courses' => $courses,
            'preparationChecklist' => $preparationChecklist,
        ];
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
        $mataKuliahs = MataKuliah::with('dosen')->orderBy('id')->get()->values();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $times = ['07:40', '09:20', '11:00', '13:50', '16:00'];
        $periodOneLimit = (int) ceil($mataKuliahs->count() / 2);

        foreach ($mataKuliahs as $index => $mk) {
            $periodGroup = $index < $periodOneLimit ? 1 : 2;

            MahasiswaCourse::create([
                'mahasiswa_id' => $mahasiswaId,
                'name' => $mk->nama,
                'sks' => $mk->sks ?? 3,
                'total_meetings' => 16, // Default 16 pertemuan
                'current_meeting' => 1,
                'uts_meeting' => 8,
                'uas_meeting' => 16,
                'schedule_day' => $days[$index % count($days)],
                'schedule_time' => $times[$index % count($times)],
                'mode' => $periodGroup === 1 ? 'offline' : 'online',
                'period_group' => $periodGroup,
                'start_date' => now()->startOfMonth(),
            ]);
        }
    }

    /**
     * Reschedule a course to a different day/time
     */
    public function reschedule(Request $request, $courseId)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'schedule_day'  => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'schedule_time' => 'required|date_format:H:i',
        ]);

        $course = MahasiswaCourse::where('id', $courseId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        $course->update([
            'schedule_day'  => $validated['schedule_day'],
            'schedule_time' => $validated['schedule_time'],
        ]);

        return back()->with('success', 'Jadwal berhasil dipindahkan!');
    }
}
