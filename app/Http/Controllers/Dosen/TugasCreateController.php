<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\Tugas;
use App\Services\TugasAIService;
use App\Services\TugasAutomationService;
use App\Services\TugasTemplateService;
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
        private readonly TugasAutomationService $automationService,
        private readonly TugasTemplateService $templateService,
        private readonly TugasAIService $aiService,
    ) {
    }

    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        $courseIds = MataKuliah::query()
            ->where('dosen_id', $dosen->id)
            ->pluck('id');

        $courses = MataKuliah::query()
            ->whereIn('id', $courseIds)
            ->orderBy('nama')
            ->get(['id', 'nama'])
            ->map(fn($course) => [
                'id' => $course->id,
                'name' => $course->nama,
            ])
            ->values();

        $templates = $this->templateService->getUserTemplates('dosen', $dosen->id);

        $availableTasks = Tugas::query()
            ->with('course:id,nama')
            ->whereIn('course_id', $courseIds)
            ->latest('id')
            ->limit(60)
            ->get()
            ->map(fn($task) => [
                'id' => $task->id,
                'title' => $task->judul,
                'subtitle' => sprintf('%s • %s', $task->course?->nama ?? '-', $task->deadline?->format('d M Y H:i') ?? '-'),
                'priority' => $this->humanizePriority($task->prioritas),
            ])
            ->values();

        return Inertia::render('dosen/tugas-create', [
            'courses' => $courses,
            'templates' => $templates,
            'availableTasks' => $availableTasks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        $templateRule = Schema::hasTable('tugas_templates') ? 'nullable|integer|exists:tugas_templates,id' : 'nullable';

        $validated = $request->validate([
            'course_id' => 'required|integer|exists:mata_kuliah,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kategori' => 'required|in:Tugas,Quiz,Ujian,Project,Presentasi',
            'prioritas' => 'required|in:Rendah,Sedang,Tinggi,Urgent',
            'deadline' => 'required|date|after:now',
            'estimated_hours' => 'nullable|integer|min:1|max:300',
            'bobot_nilai' => 'nullable|numeric|min:0|max:100',
            'schedule_type' => 'required|in:immediate,scheduled,recurring',
            'publish_at' => 'nullable|date',
            'recurring_pattern' => 'nullable|array',
            'collaboration_type' => 'nullable|in:individual,group,peer_review',
            'collaboration_settings' => 'nullable|array',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'integer|exists:tugas,id',
            'reminders' => 'nullable|array',
            'attachments' => 'nullable|array',
            'template_id' => $templateRule,
            'ai_generated' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $course = MataKuliah::query()
            ->where('id', $validated['course_id'])
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        $status = $validated['schedule_type'] === 'immediate' ? 'published' : 'draft';

        $tugas = Tugas::create([
            'course_id' => $course->id,
            'template_id' => $validated['template_id'] ?? null,
            'judul' => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? '',
            'instruksi' => null,
            'jenis' => $this->mapKategoriToJenis($validated['kategori']),
            'deadline' => $validated['deadline'],
            'prioritas' => $this->mapPrioritas($validated['prioritas']),
            'status' => $status,
            'schedule_type' => $validated['schedule_type'],
            'publish_at' => $validated['publish_at'] ?? null,
            'recurring_pattern' => $validated['recurring_pattern'] ?? null,
            'collaboration_type' => $validated['collaboration_type'] ?? 'individual',
            'collaboration_settings' => $validated['collaboration_settings'] ?? null,
            'estimated_hours' => $validated['estimated_hours'] ?? null,
            'bobot_nilai' => $validated['bobot_nilai'] ?? null,
            'ai_generated' => (bool) ($validated['ai_generated'] ?? false),
            'learning_objectives' => $validated['tags'] ?? [],
            'created_by_type' => 'dosen',
            'created_by_id' => $dosen->id,
        ]);

        $this->automationService->attachDependencies($tugas->id, $validated['dependencies'] ?? []);
        $this->automationService->createReminders($tugas->id, $validated['reminders'] ?? []);

        $attachments = $this->extractAttachments($request, $validated['attachments'] ?? []);
        $this->automationService->attachFiles($tugas->id, $attachments, 'dosen', $dosen->id);

        if ($validated['schedule_type'] !== 'immediate') {
            $this->automationService->schedulePublication($tugas);
        }

        return redirect('/dosen/tugas')->with('success', 'Tugas berhasil dibuat.');
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'tasks' => 'required|array|min:1|max:200',
            'tasks.*.course_id' => 'required|integer|exists:mata_kuliah,id',
            'tasks.*.judul' => 'required|string|max:255',
            'tasks.*.deskripsi' => 'nullable|string',
            'tasks.*.kategori' => 'nullable|string',
            'tasks.*.prioritas' => 'nullable|string',
            'tasks.*.deadline' => 'required|date',
        ]);

        $created = [];

        foreach ($validated['tasks'] as $taskData) {
            $course = MataKuliah::query()
                ->where('id', $taskData['course_id'])
                ->where('dosen_id', $dosen->id)
                ->first();

            if (!$course) {
                continue;
            }

            $created[] = Tugas::create([
                'course_id' => $course->id,
                'judul' => $taskData['judul'],
                'deskripsi' => $taskData['deskripsi'] ?? '',
                'jenis' => $this->mapKategoriToJenis($taskData['kategori'] ?? 'Tugas'),
                'deadline' => $taskData['deadline'],
                'prioritas' => $this->mapPrioritas($taskData['prioritas'] ?? 'Sedang'),
                'status' => 'published',
                'schedule_type' => 'immediate',
                'created_by_type' => 'dosen',
                'created_by_id' => $dosen->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => sprintf('%d tugas berhasil dibuat.', count($created)),
            'count' => count($created),
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
                'course_id' => (int) ($mapped['course_id'] ?? 0),
                'judul' => trim((string) ($mapped['judul'] ?? $mapped['title'] ?? '')),
                'kategori' => trim((string) ($mapped['kategori'] ?? $mapped['category'] ?? 'Tugas')),
                'prioritas' => trim((string) ($mapped['prioritas'] ?? $mapped['priority'] ?? 'Sedang')),
                'deadline' => trim((string) ($mapped['deadline'] ?? now()->addDays(7)->toDateTimeString())),
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
        $header = ['course_id', 'judul', 'kategori', 'prioritas', 'deadline', 'deskripsi'];
        $sample = [
            '1',
            'Tugas Minggu 1',
            'Tugas',
            'Sedang',
            now()->addDays(7)->format('Y-m-d H:i:s'),
            'Kerjakan sesuai instruksi.',
        ];

        $content = implode(',', $header) . "\n" . implode(',', array_map([$this, 'escapeCsvValue'], $sample)) . "\n";

        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template-tugas.csv"',
        ]);
    }

    public function suggestTitle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'partial_title' => 'required|string|max:255',
            'course_id' => 'nullable|integer|exists:mata_kuliah,id',
        ]);

        $suggestions = $this->aiService->suggestTitle(
            $validated['partial_title'],
            $validated['course_id'] ?? null,
        );

        return response()->json(['suggestions' => $suggestions]);
    }

    public function generateDescription(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'course_id' => 'nullable|integer|exists:mata_kuliah,id',
        ]);

        $description = $this->aiService->generateDescription(
            $validated['title'],
            $validated['category'],
            $validated['course_id'] ?? null,
        );

        return response()->json(['description' => $description]);
    }

    public function predictDeadline(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'estimated_hours' => 'nullable|integer|min:1|max:300',
        ]);

        $predictions = $this->aiService->predictDeadline(
            $validated['title'],
            $validated['category'],
            $validated['estimated_hours'] ?? null,
        );

        return response()->json(['predictions' => $predictions]);
    }

    public function templates(): JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();

        return response()->json([
            'templates' => $this->templateService->getUserTemplates('dosen', $dosen->id),
        ]);
    }

    public function saveTemplate(Request $request): JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();

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

        $template = $this->templateService->saveAsTemplate('dosen', $dosen->id, $validated);

        return response()->json([
            'template' => $template,
            'message' => 'Template berhasil disimpan.',
        ]);
    }

    public function applyTemplate(int $id): JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();

        return response()->json([
            'template' => $this->templateService->applyTemplate('dosen', $dosen->id, $id),
        ]);
    }

    public function toggleTemplateFavorite(int $id): JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();

        $isFavorite = $this->templateService->toggleFavorite('dosen', $dosen->id, $id);

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }

    public function deleteTemplate(int $id): JsonResponse
    {
        $dosen = Auth::guard('dosen')->user();

        $this->templateService->deleteTemplate('dosen', $dosen->id, $id);

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
        $path = $file->store('tugas-temp', 'public');

        return response()->json([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);
    }

    /**
     * @param array<int, array<string, mixed>> $attachmentPayload
     * @return array<int, UploadedFile|array<string, mixed>>
     */
    private function extractAttachments(Request $request, array $attachmentPayload): array
    {
        $files = [];

        if ($request->hasFile('attachments')) {
            foreach ((array) $request->file('attachments') as $file) {
                if ($file instanceof UploadedFile) {
                    $files[] = $file;
                }
            }
        }

        foreach ($attachmentPayload as $item) {
            if (!is_array($item)) {
                continue;
            }
            $files[] = $item;
        }

        return $files;
    }

    private function mapKategoriToJenis(string $kategori): string
    {
        return match (Str::lower($kategori)) {
            'quiz' => 'quiz',
            'ujian' => 'quiz',
            'project' => 'project',
            'presentasi' => 'presentasi',
            default => 'tugas',
        };
    }

    private function mapPrioritas(string $prioritas): string
    {
        return match (Str::lower($prioritas)) {
            'rendah' => 'rendah',
            'tinggi', 'urgent' => 'tinggi',
            default => 'sedang',
        };
    }

    private function humanizePriority(string $prioritas): string
    {
        return match ($prioritas) {
            'rendah' => 'Rendah',
            'tinggi' => 'Tinggi',
            default => 'Sedang',
        };
    }

    private function escapeCsvValue(string $value): string
    {
        $escaped = str_replace('"', '""', $value);
        return '"' . $escaped . '"';
    }
}
