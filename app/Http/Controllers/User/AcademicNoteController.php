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
    protected $aiService;

    public function __construct(\App\Services\AINotesService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        
        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        // Auto-sync courses from mata_kuliah if mahasiswa has no courses yet
        $this->syncCoursesFromMataKuliah($mahasiswa->id);

        $query = AcademicNote::where('mahasiswa_id', $mahasiswa->id)
            ->with(['course:id,name,mode', 'collaborators', 'versions']);

        // Filter by course
        if ($request->filled('course_id')) {
            $query->where('mahasiswa_course_id', $request->course_id);
        }

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply filters & sorts based on the request (simulating fuzzy search/advanced viewing)
        $notes = $query->orderBy('is_pinned', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'content' => $note->content,
                    'blocks' => $note->blocks ?? [],
                    'tags' => $note->tags ?? [],
                    'is_pinned' => $note->is_pinned,
                    'is_favorite' => $note->is_favorite,
                    'word_count' => $note->word_count,
                    'reading_time' => $note->reading_time,
                    'ai_summary' => $note->ai_summary,
                    'ai_keywords' => $note->ai_keywords ?? [],
                    'course_id' => $note->mahasiswa_course_id,
                    'course_name' => $note->course?->name ?? 'Unknown',
                    'course_mode' => $note->course?->mode ?? 'online',
                    'meeting_number' => $note->meeting_number,
                    'links' => $note->links ?? [],
                    'collaborators' => $note->collaborators ?? [],
                    'versions' => $note->versions ?? [],
                    'created_at' => $note->created_at->format('Y-m-d H:i'),
                    'updated_at' => $note->updated_at->format('Y-m-d H:i'),
                ];
            });

        // Get courses for filter dropdown
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->select('id', 'name', 'mode', 'total_meetings')
            ->orderBy('name')
            ->get();

        $stats = [
            'total_notes' => $notes->count(),
            'total_words' => $notes->sum('word_count'),
            'this_week' => AcademicNote::where('mahasiswa_id', $mahasiswa->id)
                                ->where('created_at', '>=', now()->subWeek())->count(),
            'favorite_count' => $notes->where('is_favorite', true)->count(),
        ];

        return Inertia::render('user/akademik/catatan', [
            'notes' => $notes->values(),
            'courses' => $courses,
            'stats' => $stats,
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

    public function create()
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)->get();
        
        $templates = [
            [
                'id' => 'lecture',
                'name' => 'Lecture Notes',
                'description' => 'Template untuk catatan kuliah terstruktur',
                'icon' => 'BookOpen',
                'content' => '<h1>Lecture Notes</h1><h2>Dosen: </h2><h2>Topik Bahasan:</h2><p></p><h2>Poin-Poin Penting:</h2><ul><li></li></ul><h2>Ringkasan:</h2><p></p>',
            ],
            [
                'id' => 'meeting',
                'name' => 'Meeting Notes',
                'description' => 'Template untuk catatan rapat/diskusi kelompok',
                'icon' => 'Users',
                'content' => '<h1>Meeting Notes</h1><h2>Agenda: </h2><ul><li></li></ul><h2>Catatan Diskusi:</h2><p></p><h2>Action Items:</h2><ul data-type="taskList"><li data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p></p></div></li></ul>',
            ],
        ];

        return Inertia::render('user/akademik/catatan-form', [
            'courses' => $courses,
            'templates' => $templates,
        ]);
    }

    public function edit(int $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $note = AcademicNote::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)->get();
        
        return Inertia::render('user/akademik/catatan-form', [
            'note' => $note,
            'courses' => $courses,
            'templates' => [],
        ]);
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
            'tags' => 'nullable|array',
            'blocks' => 'nullable|array',
        ]);

        // Verify course belongs to mahasiswa
        $course = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($validated['mahasiswa_course_id']);

        // Parse links
        $links = [];
        if (!empty($validated['links'])) {
            $links = array_filter(
                array_map('trim', explode("\n", $validated['links'])),
                fn($link) => !empty($link) && filter_var($link, FILTER_VALIDATE_URL)
            );
        }

        // Words & Read time calculus
        $wordCount = str_word_count(strip_tags($validated['content']));
        $readingTime = ceil($wordCount / 200);

        $note = AcademicNote::create([
            'mahasiswa_id' => $mahasiswa->id,
            'mahasiswa_course_id' => $validated['mahasiswa_course_id'],
            'meeting_number' => $validated['meeting_number'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'links' => !empty($links) ? array_values($links) : null,
            'tags' => $validated['tags'] ?? [],
            'blocks' => $validated['blocks'] ?? [],
            'word_count' => $wordCount,
            'reading_time' => $readingTime,
        ]);

        // Save first version
        $note->versions()->create([
            'content' => $note->content,
            'created_by' => $mahasiswa->id,
        ]);

        // Generate AI Summary in background (simulated via DB job or sync)
        $summary = $this->aiService->generateSummary($note->content);
        $keywords = $this->aiService->extractKeywords($note->content);
        
        $note->update([
            'ai_summary' => $summary,
            'ai_keywords' => $keywords,
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
            'tags' => 'nullable|array',
            'blocks' => 'nullable|array',
            'is_pinned' => 'nullable|boolean',
            'is_favorite' => 'nullable|boolean',
        ]);

        $links = [];
        if (!empty($validated['links'])) {
            $links = array_filter(
                array_map('trim', explode("\n", $validated['links'])),
                fn($link) => !empty($link) && filter_var($link, FILTER_VALIDATE_URL)
            );
        }

        $wordCount = str_word_count(strip_tags($validated['content']));
        $readingTime = ceil($wordCount / 200);

        $note->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'meeting_number' => $validated['meeting_number'],
            'links' => !empty($links) ? array_values($links) : null,
            'tags' => $validated['tags'] ?? $note->tags,
            'blocks' => $validated['blocks'] ?? $note->blocks,
            'is_pinned' => $request->has('is_pinned') ? $validated['is_pinned'] : $note->is_pinned,
            'is_favorite' => $request->has('is_favorite') ? $validated['is_favorite'] : $note->is_favorite,
            'word_count' => $wordCount,
            'reading_time' => $readingTime,
        ]);

        // Save version history if content changed
        if ($note->wasChanged('content')) {
            $note->versions()->create([
                'content' => $note->content,
                'created_by' => $mahasiswa->id,
            ]);
        }

        return back()->with('success', 'Catatan berhasil diperbarui!');
    }

    public function generateAISummary(int $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $note = AcademicNote::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        $summary = $this->aiService->generateSummary($note->content);
        $keywords = $this->aiService->extractKeywords($note->content);

        $note->update([
            'ai_summary' => $summary,
            'ai_keywords' => $keywords,
        ]);

        return response()->json([
            'summary' => $summary,
            'keywords' => $keywords,
        ]);
    }

    public function generateFlashcards(int $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $note = AcademicNote::where('mahasiswa_id', $mahasiswa->id)->findOrFail($id);

        $flashcards = $this->aiService->generateFlashcards($note->content);

        return response()->json([
            'flashcards' => $flashcards,
        ]);
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
        // ... handled in index with smart filters on frontend for now ...
        return $this->index($request);
    }

    /**
     * Handle generic text processing from the editor AI Assist button
     */
    public function processAI(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'action' => 'required|string|in:improve,summarize,expand,simplify',
        ]);

        try {
            $result = $this->aiService->processText($request->text, $request->action);

            return response()->json([
                'success' => true,
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI Process Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Gagal memproses teks dengan AI.',
            ], 500);
        }
    }
}
