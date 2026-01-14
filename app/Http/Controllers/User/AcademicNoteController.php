<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AcademicNote;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AcademicNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        // Auto-sync courses from mata_kuliah if mahasiswa has no courses yet
        $this->syncCoursesFromMataKuliah($mahasiswa->id);

        $query = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->with('course:id,name,mode');

        // Filter by course
        if ($request->filled('course_id')) {
            $query->where('mahasiswa_course_id', $request->course_id);
        }

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $notes = $query->orderBy('mahasiswa_course_id')
            ->orderBy('meeting_number')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'content' => $note->content,
                    'course_id' => $note->mahasiswa_course_id,
                    'course_name' => $note->course?->name ?? 'Unknown',
                    'course_mode' => $note->course?->mode ?? 'online',
                    'meeting_number' => $note->meeting_number,
                    'links' => $note->links ?? [],
                    'created_at' => $note->created_at->format('Y-m-d H:i'),
                    'updated_at' => $note->updated_at->format('Y-m-d H:i'),
                ];
            });

        // Group notes by course
        $notesByCourse = $notes->groupBy('course_id')->map(function ($courseNotes, $courseId) {
            $firstNote = $courseNotes->first();
            return [
                'course_id' => $courseId,
                'course_name' => $firstNote['course_name'],
                'course_mode' => $firstNote['course_mode'],
                'notes' => $courseNotes->values(),
            ];
        })->values();

        // Get courses for filter dropdown
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->select('id', 'name', 'mode', 'total_meetings')
            ->orderBy('name')
            ->get();

        return Inertia::render('user/akademik/catatan', [
            'notes' => $notes,
            'notesByCourse' => $notesByCourse,
            'courses' => $courses,
            'filters' => [
                'course_id' => $request->course_id,
                'search' => $request->search,
            ],
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

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'mahasiswa_course_id' => 'required|exists:mahasiswa_courses,id',
            'meeting_number' => 'required|integer|min:1',
            'links' => 'nullable|string',
        ]);

        // Verify course belongs to mahasiswa
        $course = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($validated['mahasiswa_course_id']);

        // Validate meeting number doesn't exceed total
        if ($validated['meeting_number'] > $course->total_meetings) {
            return back()->withErrors([
                'meeting_number' => "Pertemuan tidak boleh melebihi {$course->total_meetings}.",
            ]);
        }

        // Parse links from newline-separated string
        $links = [];
        if (!empty($validated['links'])) {
            $links = array_filter(
                array_map('trim', explode("\n", $validated['links'])),
                fn($link) => !empty($link) && filter_var($link, FILTER_VALIDATE_URL)
            );
        }

        AcademicNote::create([
            'mahasiswa_id' => $mahasiswa->id,
            'mahasiswa_course_id' => $validated['mahasiswa_course_id'],
            'meeting_number' => $validated['meeting_number'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'links' => !empty($links) ? array_values($links) : null,
        ]);

        return back()->with('success', 'Catatan berhasil ditambahkan!');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $note = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'meeting_number' => 'required|integer|min:1',
            'links' => 'nullable|string',
        ]);

        // Validate meeting number doesn't exceed total
        if ($validated['meeting_number'] > $note->course->total_meetings) {
            return back()->withErrors([
                'meeting_number' => "Pertemuan tidak boleh melebihi {$note->course->total_meetings}.",
            ]);
        }

        // Parse links from newline-separated string
        $links = [];
        if (!empty($validated['links'])) {
            $links = array_filter(
                array_map('trim', explode("\n", $validated['links'])),
                fn($link) => !empty($link) && filter_var($link, FILTER_VALIDATE_URL)
            );
        }

        $note->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'meeting_number' => $validated['meeting_number'],
            'links' => !empty($links) ? array_values($links) : null,
        ]);

        return back()->with('success', 'Catatan berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $note = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $note->delete();

        return back()->with('success', 'Catatan berhasil dihapus!');
    }

    public function search(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $keyword = $request->get('q', '');

        $notes = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->with('course:id,name,mode')
            ->search($keyword)
            ->orderByMeeting()
            ->limit(20)
            ->get()
            ->map(function ($note) use ($keyword) {
                // Highlight search term in content preview
                $preview = strip_tags($note->content);
                $preview = \Str::limit($preview, 150);
                
                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'preview' => $preview,
                    'course_name' => $note->course?->name ?? 'Unknown',
                    'meeting_number' => $note->meeting_number,
                ];
            });

        return Inertia::render('user/akademik/search', [
            'notes' => $notes,
            'keyword' => $keyword,
        ]);
    }
}
