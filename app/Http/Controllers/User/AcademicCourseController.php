<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CourseMeeting;
use App\Models\MahasiswaCourse;
use App\Services\ScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AcademicCourseController extends Controller
{
    public function __construct(
        private ScheduleService $scheduleService
    ) {}

    public function index(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->withCount(['tasks as pending_tasks_count' => function ($query) {
                $query->where('status', '!=', 'completed');
            }])
            ->withCount(['notes as notes_count'])
            ->orderBy('schedule_day')
            ->orderBy('schedule_time')
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'sks' => $course->sks,
                    'total_meetings' => $course->total_meetings,
                    'current_meeting' => $course->current_meeting,
                    'uts_meeting' => $course->uts_meeting,
                    'uas_meeting' => $course->uas_meeting,
                    'schedule_day' => $course->schedule_day,
                    'schedule_day_name' => $course->schedule_day_name,
                    'schedule_time' => $course->schedule_time?->format('H:i'),
                    'mode' => $course->mode,
                    'mode_name' => $course->mode_name,
                    'start_date' => $course->start_date?->format('Y-m-d'),
                    'progress' => $course->progress,
                    'uts_date' => $course->uts_date,
                    'uas_date' => $course->uas_date,
                    'uts_days_remaining' => $course->uts_days_remaining,
                    'uas_days_remaining' => $course->uas_days_remaining,
                    'is_uts_warning' => $course->is_uts_warning,
                    'is_uas_warning' => $course->is_uas_warning,
                    'is_uts_critical' => $course->is_uts_critical,
                    'is_uas_critical' => $course->is_uas_critical,
                    'pending_tasks_count' => $course->pending_tasks_count,
                    'notes_count' => $course->notes_count,
                ];
            });

        return Inertia::render('user/akademik/matkul', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sks' => 'required|integer|in:2,3',
            'schedule_day' => 'required|in:monday,tuesday,wednesday,thursday,friday',
            'schedule_time' => 'required|date_format:H:i',
            'mode' => 'required|in:online,offline',
            'start_date' => 'nullable|date',
        ], [
            'sks.in' => 'SKS harus 2 atau 3.',
            'schedule_day.in' => 'Hari harus Senin-Jumat.',
            'mode.in' => 'Mode harus online atau offline.',
        ]);

        DB::transaction(function () use ($validated, $mahasiswa) {
            $sks = (int) $validated['sks'];
            
            $course = MahasiswaCourse::create([
                'mahasiswa_id' => $mahasiswa->id,
                'name' => $validated['name'],
                'sks' => $sks,
                'total_meetings' => $this->scheduleService->calculateTotalMeetings($sks),
                'current_meeting' => 0,
                'uts_meeting' => $this->scheduleService->calculateUtsMeeting($sks),
                'uas_meeting' => $this->scheduleService->calculateUasMeeting($sks),
                'schedule_day' => $validated['schedule_day'],
                'schedule_time' => $validated['schedule_time'],
                'mode' => $validated['mode'],
                'start_date' => $validated['start_date'] ?? null,
            ]);

            // Generate meeting schedule
            $meetings = $this->scheduleService->generateMeetingSchedule($course);
            CourseMeeting::insert($meetings);
        });

        return back()->with('success', 'Mata kuliah berhasil ditambahkan!');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $course = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'schedule_day' => 'required|in:monday,tuesday,wednesday,thursday,friday',
            'schedule_time' => 'required|date_format:H:i',
            'mode' => 'required|in:online,offline',
            'start_date' => 'nullable|date',
        ]);

        // Note: SKS cannot be changed after creation if meetings exist
        $course->update($validated);

        return back()->with('success', 'Mata kuliah berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $course = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        // Check for pending tasks
        $pendingTasks = $course->tasks()->where('status', '!=', 'completed')->count();
        if ($pendingTasks > 0) {
            return back()->withErrors([
                'course' => "Tidak bisa menghapus mata kuliah dengan {$pendingTasks} tugas yang belum selesai.",
            ]);
        }

        $course->delete();

        return back()->with('success', 'Mata kuliah berhasil dihapus!');
    }

    public function markMeetingComplete(int $courseId, int $meetingNumber): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $course = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($courseId);

        $meeting = CourseMeeting::where('mahasiswa_course_id', $course->id)
            ->where('meeting_number', $meetingNumber)
            ->firstOrFail();

        $meeting->markAsCompleted();

        return back()->with('success', "Pertemuan {$meetingNumber} ditandai selesai!");
    }
}
