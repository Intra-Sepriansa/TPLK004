<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AcademicTask;
use App\Models\MahasiswaCourse;
use App\Services\TugasAIService;
use App\Services\TugasTemplateService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TugasCreateController extends Controller
{
    public function __construct(
        private readonly TugasTemplateService $templateService,
        private readonly TugasAIService $aiService,
    ) {
    }

    public function index(): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $courses = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($course) => [
                'id' => $course->id,
                'name' => $course->name,
            ])
            ->values();

        $templates = $this->templateService->getUserTemplates('mahasiswa', $mahasiswa->id);

        $availableTasks = AcademicTask::query()
            ->with('course:id,name')
            ->where('mahasiswa_id', $mahasiswa->id)
            ->latest('id')
            ->limit(80)
            ->get()
            ->map(fn($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'subtitle' => sprintf('%s • %s', $task->course?->name ?? '-', $task->deadline?->format('d M Y') ?? '-'),
                'priority' => $task->priority ?? 'Sedang',
            ])
            ->values();

        return Inertia::render('user/akademik/tugas-create', [
            'courses' => $courses,
            'templates' => $templates,
            'availableTasks' => $availableTasks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $templateRule = Schema::hasTable('tugas_templates') ? 'nullable|integer|exists:tugas_templates,id' : 'nullable';

        $validated = $request->validate([
            'mahasiswa_course_id' => 'required|integer|exists:mahasiswa_courses,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kategori' => 'required|in:Tugas,Quiz,Ujian,Project,Presentasi',
            'prioritas' => 'required|in:Rendah,Sedang,Tinggi,Urgent',
            'deadline' => 'nullable|date',
            'estimated_hours' => 'nullable|integer|min:1|max:300',
            'schedule_type' => 'required|in:immediate,scheduled,recurring',
            'publish_at' => 'nullable|date',
            'recurring_pattern' => 'nullable|array',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'integer',
            'reminders' => 'nullable|array',
            'attachments' => 'nullable|array',
            'template_id' => $templateRule,
            'ai_generated' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'metadata' => 'nullable|array',
        ]);

        $course = MahasiswaCourse::query()
            ->where('id', $validated['mahasiswa_course_id'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        AcademicTask::create([
            'mahasiswa_id' => $mahasiswa->id,
            'mahasiswa_course_id' => $course->id,
            'meeting_number' => null,
            'title' => $validated['judul'],
            'description' => $validated['deskripsi'] ?? null,
            'category' => $validated['kategori'],
            'priority' => $validated['prioritas'],
            'deadline' => $validated['deadline'] ? Carbon::parse($validated['deadline'])->toDateString() : null,
            'status' => 'pending',
            'schedule_type' => $validated['schedule_type'],
            'publish_at' => $validated['publish_at'] ?? null,
            'recurring_pattern' => $validated['recurring_pattern'] ?? null,
            'reminders' => $validated['reminders'] ?? null,
            'dependencies' => $validated['dependencies'] ?? null,
            'attachments' => $validated['attachments'] ?? null,
            'estimated_hours' => $validated['estimated_hours'] ?? null,
            'ai_generated' => (bool) ($validated['ai_generated'] ?? false),
            'template_id' => $validated['template_id'] ?? null,
            'metadata' => array_merge($validated['metadata'] ?? [], [
                'tags' => $validated['tags'] ?? [],
            ]),
        ]);

        return redirect('/user/akademik/tugas')->with('success', 'Tugas pribadi berhasil dibuat.');
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'tasks' => 'required|array|min:1|max:200',
            'tasks.*.mahasiswa_course_id' => 'required|integer|exists:mahasiswa_courses,id',
            'tasks.*.judul' => 'required|string|max:255',
            'tasks.*.deskripsi' => 'nullable|string',
            'tasks.*.kategori' => 'nullable|string',
            'tasks.*.prioritas' => 'nullable|string',
            'tasks.*.deadline' => 'nullable|date',
        ]);

        $count = 0;

        foreach ($validated['tasks'] as $taskData) {
            $course = MahasiswaCourse::query()
                ->where('id', $taskData['mahasiswa_course_id'])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->first();

            if (!$course) {
                continue;
            }

            AcademicTask::create([
                'mahasiswa_id' => $mahasiswa->id,
                'mahasiswa_course_id' => $course->id,
                'title' => $taskData['judul'],
                'description' => $taskData['deskripsi'] ?? null,
                'category' => $taskData['kategori'] ?? 'Tugas',
                'priority' => $this->normalizePriority($taskData['prioritas'] ?? 'Sedang'),
                'deadline' => isset($taskData['deadline']) && $taskData['deadline']
                    ? Carbon::parse($taskData['deadline'])->toDateString()
                    : null,
                'status' => 'pending',
                'schedule_type' => 'immediate',
            ]);

            $count++;
        }

        return response()->json([
            'success' => true,
            'message' => sprintf('%d tugas berhasil dibuat.', $count),
            'count' => $count,
        ]);
    }

    public function bulkPreview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');
        $rows = array_map('str_getcsv', file($file->getRealPath()));
        $header = array_map(static fn($item) => Str::lower(trim((string) $item)), array_shift($rows) ?? []);

        $tasks = [];
        foreach ($rows as $row) {
            if (empty(array_filter($row))) {
                continue;
            }

            $mapped = array_combine($header, $row);
            if (!$mapped) {
                continue;
            }

            $tasks[] = [
                'mahasiswa_course_id' => (int) ($mapped['mahasiswa_course_id'] ?? $mapped['course_id'] ?? 0),
                'judul' => trim((string) ($mapped['judul'] ?? $mapped['title'] ?? '')),
                'kategori' => trim((string) ($mapped['kategori'] ?? $mapped['category'] ?? 'Tugas')),
                'prioritas' => trim((string) ($mapped['prioritas'] ?? $mapped['priority'] ?? 'Sedang')),
                'deadline' => trim((string) ($mapped['deadline'] ?? now()->addDays(7)->toDateString())),
                'deskripsi' => trim((string) ($mapped['deskripsi'] ?? $mapped['description'] ?? '')),
            ];
        }

        return response()->json([
            'tasks' => $tasks,
        ]);
    }

    public function bulkImport(Request $request): JsonResponse
    {
        return $this->bulkStore($request);
    }

    public function downloadTemplate()
    {
        $header = ['mahasiswa_course_id', 'judul', 'kategori', 'prioritas', 'deadline', 'deskripsi'];
        $sample = ['1', 'Tugas Pribadi Minggu Ini', 'Tugas', 'Sedang', now()->addDays(5)->format('Y-m-d'), 'Kerjakan secara mandiri.'];

        $content = implode(',', $header) . "\n" . implode(',', array_map([$this, 'escapeCsvValue'], $sample)) . "\n";

        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template-tugas-pribadi.csv"',
        ]);
    }

    public function suggestTitle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'partial_title' => 'required|string|max:255',
        ]);

        return response()->json([
            'suggestions' => $this->aiService->suggestTitle($validated['partial_title'], null),
        ]);
    }

    public function generateDescription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
        ]);

        return response()->json([
            'description' => $this->aiService->generateDescription($validated['title'], $validated['category'], null),
        ]);
    }

    public function predictDeadline(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'estimated_hours' => 'nullable|integer|min:1|max:300',
        ]);

        return response()->json([
            'predictions' => $this->aiService->predictDeadline(
                $validated['title'],
                $validated['category'],
                $validated['estimated_hours'] ?? null,
            ),
        ]);
    }

    public function templates(): JsonResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        return response()->json([
            'templates' => $this->templateService->getUserTemplates('mahasiswa', $mahasiswa->id),
        ]);
    }

    public function saveTemplate(Request $request): JsonResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'title_pattern' => 'nullable|string|max:255',
            'description_template' => 'nullable|string',
            'default_duration' => 'nullable|integer|min:1|max:300',
            'default_priority' => 'nullable|string|max:20',
            'attachments' => 'nullable|array',
            'schedule_type' => 'nullable|string|max:20',
        ]);

        $template = $this->templateService->saveAsTemplate('mahasiswa', $mahasiswa->id, $validated);

        return response()->json([
            'template' => $template,
            'message' => 'Template berhasil disimpan.',
        ]);
    }

    public function applyTemplate(int $id): JsonResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        return response()->json([
            'template' => $this->templateService->applyTemplate('mahasiswa', $mahasiswa->id, $id),
        ]);
    }

    public function toggleTemplateFavorite(int $id): JsonResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $isFavorite = $this->templateService->toggleFavorite('mahasiswa', $mahasiswa->id, $id);

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }

    public function deleteTemplate(int $id): JsonResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $this->templateService->deleteTemplate('mahasiswa', $mahasiswa->id, $id);

        return response()->json([
            'success' => true,
        ]);
    }

    public function uploadAttachment(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');
        $path = $file->store('academic-task-temp', 'public');

        return response()->json([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);
    }

    private function normalizePriority(string $priority): string
    {
        return match (Str::lower($priority)) {
            'rendah' => 'Rendah',
            'tinggi' => 'Tinggi',
            'urgent' => 'Urgent',
            default => 'Sedang',
        };
    }

    private function escapeCsvValue(string $value): string
    {
        $escaped = str_replace('"', '""', $value);
        return '"' . $escaped . '"';
    }
}
