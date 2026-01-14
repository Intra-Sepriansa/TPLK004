<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AcademicTask;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AcademicTaskController extends Controller
{
    public function index(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        // Auto-sync courses from mata_kuliah if mahasiswa has no courses yet
        $this->syncCoursesFromMataKuliah($mahasiswa->id);

        $query = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->with('course:id,name,mode');

        // Filter by course
        if ($request->filled('course_id')) {
            $query->where('mahasiswa_course_id', $request->course_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'overdue') {
                $query->overdue();
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by deadline
        if ($request->filled('deadline')) {
            match ($request->deadline) {
                'today' => $query->whereDate('deadline', today()),
                'week' => $query->whereBetween('deadline', [today(), today()->addDays(7)]),
                'month' => $query->whereBetween('deadline', [today(), today()->addMonth()]),
                default => null,
            };
        }

        $tasks = $query->orderByRaw("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")
            ->orderByRaw("CASE WHEN deadline IS NULL THEN 1 ELSE 0 END")
            ->orderBy('deadline')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'course_id' => $task->mahasiswa_course_id,
                    'course_name' => $task->course?->name ?? 'Unknown',
                    'course_mode' => $task->course?->mode ?? 'online',
                    'meeting_number' => $task->meeting_number,
                    'deadline' => $task->deadline?->format('Y-m-d'),
                    'deadline_formatted' => $task->deadline?->translatedFormat('d M Y'),
                    'days_remaining' => $task->days_remaining,
                    'status' => $task->status,
                    'completed_at' => $task->completed_at?->format('Y-m-d H:i'),
                    'is_overdue' => $task->is_overdue,
                    'created_at' => $task->created_at->format('Y-m-d H:i'),
                ];
            });

        // Get courses for filter dropdown
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Calculate stats
        $allTasks = AcademicTask::where('mahasiswa_id', $mahasiswa->id);
        $stats = [
            'total' => $allTasks->count(),
            'pending' => (clone $allTasks)->where('status', 'pending')->count(),
            'in_progress' => (clone $allTasks)->where('status', 'in_progress')->count(),
            'completed' => (clone $allTasks)->where('status', 'completed')->count(),
            'overdue' => (clone $allTasks)->overdue()->count(),
        ];

        // Stats per course
        $courseStats = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'total' => $c->tasks_count,
                'completed' => $c->completed_tasks_count,
                'percentage' => $c->tasks_count > 0 
                    ? round(($c->completed_tasks_count / $c->tasks_count) * 100) 
                    : 0,
            ]);

        return Inertia::render('user/akademik/tugas', [
            'tasks' => $tasks,
            'courses' => $courses,
            'stats' => $stats,
            'courseStats' => $courseStats,
            'filters' => [
                'course_id' => $request->course_id,
                'status' => $request->status,
                'deadline' => $request->deadline,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'mahasiswa_course_id' => 'required|exists:mahasiswa_courses,id',
            'meeting_number' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
        ]);

        // Verify course belongs to mahasiswa
        $course = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($validated['mahasiswa_course_id']);

        // Validate meeting number doesn't exceed total
        if (isset($validated['meeting_number']) && $validated['meeting_number'] > $course->total_meetings) {
            return back()->withErrors([
                'meeting_number' => "Pertemuan tidak boleh melebihi {$course->total_meetings}.",
            ]);
        }

        AcademicTask::create([
            'mahasiswa_id' => $mahasiswa->id,
            'mahasiswa_course_id' => $validated['mahasiswa_course_id'],
            'meeting_number' => $validated['meeting_number'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Tugas berhasil ditambahkan!');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $task = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'meeting_number' => 'nullable|integer|min:1',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed',
        ]);

        $task->update($validated);

        // If status changed to completed, set completed_at
        if (isset($validated['status']) && $validated['status'] === 'completed' && !$task->completed_at) {
            $task->update(['completed_at' => now()]);
        } elseif (isset($validated['status']) && $validated['status'] !== 'completed') {
            $task->update(['completed_at' => null]);
        }

        return back()->with('success', 'Tugas berhasil diperbarui!');
    }

    public function toggleStatus(int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $task = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $task->toggleStatus();

        $message = $task->status === 'completed' 
            ? 'Tugas ditandai selesai!' 
            : 'Tugas dikembalikan ke pending.';

        return back()->with('success', $message);
    }

    public function destroy(int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $task = AcademicTask::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $task->delete();

        return back()->with('success', 'Tugas berhasil dihapus!');
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

        foreach ($mataKuliahs as $mk) {
            MahasiswaCourse::create([
                'mahasiswa_id' => $mahasiswaId,
                'name' => $mk->nama,
                'sks' => $mk->sks ?? 3,
                'total_meetings' => 16, // Default 16 pertemuan
                'current_meeting' => 1,
                'uts_meeting' => 8,
                'uas_meeting' => 16,
                'schedule_day' => 'monday', // Default
                'schedule_time' => '08:00',
                'mode' => 'offline',
                'start_date' => now()->startOfMonth(),
            ]);
        }
    }
}
