<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\WeeklyLearningDigest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class WeeklyDigestController extends Controller
{
    private const DEFAULT_CLASS_LABEL = '06TPLK004';
    private const PLATFORM_NAME = 'Mentari';
    private const PLATFORM_URL = 'https://mentari.unpam.ac.id';
    private const DEFAULT_FORUM_POSTS_REQUIRED = 2;

    public function index(Request $request)
    {
        $this->ensureAdminAccess();

        $search = trim((string) $request->string('search'));
        $semester = trim((string) $request->string('semester'));
        $status = trim((string) $request->string('status', 'all')) ?: 'all';
        $week = $request->integer('week') ?: null;

        $digests = WeeklyLearningDigest::query()
            ->with(['mataKuliah', 'creator'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhereHas('mataKuliah', function ($courseQuery) use ($search) {
                            $courseQuery->where('nama', 'like', "%{$search}%")
                                ->orWhere('kode', 'like', "%{$search}%");
                        });
                });
            })
            ->when($semester !== '', fn ($query) => $query->where('semester', $semester))
            ->when($status === 'published', fn ($query) => $query->where('is_published', true))
            ->when($status === 'draft', fn ($query) => $query->where('is_published', false))
            ->when($week, fn ($query) => $query->where('week_number', $week))
            ->orderByDesc('week_number')
            ->orderBy('meeting_number')
            ->orderBy('mata_kuliah_id')
            ->paginate(12)
            ->withQueryString()
            ->through(function (WeeklyLearningDigest $digest) {
                return [
                    'id' => $digest->id,
                    'title' => $digest->title,
                    'display_title' => $this->displayTitle($digest),
                    'course_name' => $digest->mataKuliah?->nama,
                    'course_code' => $digest->mataKuliah?->kode,
                    'meeting_number' => $digest->meeting_number,
                    'week_number' => $digest->week_number,
                    'semester' => $digest->semester,
                    'week_range' => $digest->week_range,
                    'class_label' => self::DEFAULT_CLASS_LABEL,
                    'has_structured_task' => (bool) $digest->has_structured_task,
                    'forum_posts_required' => (int) $digest->forum_posts_required,
                    'mentari_course_url' => $digest->mentari_course_url,
                    'mentari_course_id' => $digest->mentari_course_id,
                    'is_published' => $digest->is_published,
                    'published_at' => $digest->published_at?->format('d M Y H:i'),
                    'updated_at' => $digest->updated_at?->format('d M Y H:i'),
                ];
            });

        return Inertia::render('admin/weekly-digest/index', [
            'digests' => $digests,
            'courses' => $this->courseOptions(),
            'semesters' => $this->availableSemesters(),
            'weeks' => range(1, 53),
            'stats' => [
                'total' => WeeklyLearningDigest::count(),
                'published' => WeeklyLearningDigest::published()->count(),
                'draft' => WeeklyLearningDigest::where('is_published', false)->count(),
                'current_week' => WeeklyLearningDigest::currentWeek()->count(),
            ],
            'filters' => [
                'search' => $search,
                'semester' => $semester,
                'status' => $status,
                'week' => $week,
            ],
            'constants' => $this->constantsPayload(),
        ]);
    }

    public function create()
    {
        $this->ensureAdminAccess();

        return Inertia::render('admin/weekly-digest/form', [
            'mode' => 'create',
            'digest' => null,
            'courses' => $this->courseOptions(),
            'constants' => $this->constantsPayload(),
        ]);
    }

    public function store(Request $request)
    {
        $adminId = $this->ensureAdminAccess();
        $validated = $this->validatePayload($request);
        $validated['created_by'] = $adminId;
        $validated['published_at'] = $validated['is_published'] ? now() : null;

        WeeklyLearningDigest::create($validated);

        return redirect()
            ->route('admin.weekly-digest.index')
            ->with('success', 'Info Pekanan Mentari berhasil dibuat.');
    }

    public function show(int $id)
    {
        $this->ensureAdminAccess();

        return Inertia::render('admin/weekly-digest/show', [
            'digest' => $this->detailPayload($this->findDigest($id)),
            'constants' => $this->constantsPayload(),
        ]);
    }

    public function edit(int $id)
    {
        $this->ensureAdminAccess();

        return Inertia::render('admin/weekly-digest/form', [
            'mode' => 'edit',
            'digest' => $this->detailPayload($this->findDigest($id)),
            'courses' => $this->courseOptions(),
            'constants' => $this->constantsPayload(),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $this->ensureAdminAccess();

        $digest = WeeklyLearningDigest::findOrFail($id);
        $validated = $this->validatePayload($request, $digest);
        $validated['published_at'] = $validated['is_published']
            ? ($digest->published_at ?? now())
            : null;

        $digest->update($validated);

        return redirect()
            ->route('admin.weekly-digest.show', $digest->id)
            ->with('success', 'Info Pekanan Mentari berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->ensureAdminAccess();

        WeeklyLearningDigest::findOrFail($id)->delete();

        return back()->with('success', 'Info Pekanan Mentari berhasil dihapus.');
    }

    public function publish(int $id)
    {
        $this->ensureAdminAccess();

        $digest = WeeklyLearningDigest::findOrFail($id);
        $nextStatus = ! $digest->is_published;

        $digest->update([
            'is_published' => $nextStatus,
            'published_at' => $nextStatus ? ($digest->published_at ?? now()) : null,
        ]);

        return back()->with('success', $nextStatus
            ? 'Info Pekanan Mentari berhasil dipublikasikan.'
            : 'Info Pekanan Mentari dikembalikan ke draft.');
    }

    public function exportPdf(int $id)
    {
        $this->ensureAdminAccess();

        $digest = $this->findDigest($id);
        $pdf = Pdf::loadView('pdf.weekly-learning-digest', [
            'digest' => $digest,
            'displayTitle' => $this->displayTitle($digest),
            'constants' => $this->constantsPayload(),
            'generatedAt' => now(),
            'generatedBy' => auth()->guard('web')->user()?->name ?? 'System',
            'logoUnpam' => public_path('assets/logos/unpam-logo.png'),
            'logoSasmita' => public_path('assets/logos/sasmita-logo.png'),
        ]);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('info-pekanan-mentari-' . $digest->week_number . '-' . $digest->id . '.pdf');
    }

    private function validatePayload(Request $request, ?WeeklyLearningDigest $digest = null): array
    {
        $payload = $this->normalizePayload($request->all(), $digest);

        return Validator::make($payload, [
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'class_label' => 'required|string|max:50',
            'week_number' => 'required|integer|min:1|max:53',
            'semester' => 'required|string|max:20',
            'week_start_date' => 'required|date',
            'week_end_date' => 'required|date|after_or_equal:week_start_date',
            'meeting_number' => 'required|integer|min:1|max:32',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'has_structured_task' => 'boolean',
            'forum_posts_required' => 'required|integer|min:1|max:10',
            'mentari_course_url' => 'nullable|url|max:500',
            'mentari_course_id' => 'nullable|string|max:100',
            'is_published' => 'boolean',
        ])->after(function ($validator) use ($payload, $digest) {
            $exists = WeeklyLearningDigest::query()
                ->where('mata_kuliah_id', $payload['mata_kuliah_id'])
                ->where('week_number', $payload['week_number'])
                ->where('semester', $payload['semester'])
                ->where('meeting_number', $payload['meeting_number'])
                ->when($digest, fn ($query) => $query->where('id', '!=', $digest->id))
                ->exists();

            if ($exists) {
                $validator->errors()->add('meeting_number', 'Matkul dan pertemuan ini sudah tercatat pada minggu yang sama.');
            }
        })->validate();
    }

    private function normalizePayload(array $payload, ?WeeklyLearningDigest $digest = null): array
    {
        $defaults = $this->defaultWeekData();

        return [
            'mata_kuliah_id' => isset($payload['mata_kuliah_id']) ? (int) $payload['mata_kuliah_id'] : null,
            'class_label' => self::DEFAULT_CLASS_LABEL,
            'week_number' => $digest?->week_number ?? $defaults['week_number'],
            'semester' => $digest?->semester ?? $defaults['semester'],
            'week_start_date' => $digest?->week_start_date?->toDateString() ?? $defaults['week_start_date'],
            'week_end_date' => $digest?->week_end_date?->toDateString() ?? $defaults['week_end_date'],
            'meeting_number' => (int) ($payload['meeting_number'] ?? 1),
            'title' => $this->nullableText($payload['title'] ?? null, 255),
            'description' => null,
            'has_structured_task' => filter_var($payload['has_structured_task'] ?? false, FILTER_VALIDATE_BOOL),
            'forum_posts_required' => self::DEFAULT_FORUM_POSTS_REQUIRED,
            'mentari_course_url' => self::PLATFORM_URL,
            'mentari_course_id' => self::DEFAULT_CLASS_LABEL,
            'is_published' => filter_var($payload['is_published'] ?? false, FILTER_VALIDATE_BOOL),
        ];
    }

    private function findDigest(int $id): WeeklyLearningDigest
    {
        return WeeklyLearningDigest::with(['mataKuliah.dosen', 'creator'])->findOrFail($id);
    }

    private function detailPayload(WeeklyLearningDigest $digest): array
    {
        return [
            'id' => $digest->id,
            'mata_kuliah_id' => $digest->mata_kuliah_id,
            'course_name' => $digest->mataKuliah?->nama,
            'course_code' => $digest->mataKuliah?->kode,
            'dosen_name' => $digest->mataKuliah?->dosen?->nama,
            'class_label' => self::DEFAULT_CLASS_LABEL,
            'week_number' => $digest->week_number,
            'semester' => $digest->semester,
            'week_range' => $digest->week_range,
            'meeting_number' => $digest->meeting_number,
            'title' => $digest->title,
            'display_title' => $this->displayTitle($digest),
            'has_structured_task' => (bool) $digest->has_structured_task,
            'forum_posts_required' => (int) $digest->forum_posts_required,
            'mentari_course_url' => $digest->mentari_course_url,
            'mentari_course_id' => $digest->mentari_course_id,
            'is_published' => $digest->is_published,
            'published_at' => $digest->published_at?->format('d M Y H:i'),
            'created_at' => $digest->created_at?->format('d M Y H:i'),
            'updated_at' => $digest->updated_at?->format('d M Y H:i'),
            'creator' => $digest->creator?->name,
        ];
    }

    private function displayTitle(WeeklyLearningDigest $digest): string
    {
        if ($digest->title) {
            return $digest->title;
        }

        return 'Materi Pertemuan ' . $digest->meeting_number;
    }

    private function availableSemesters(): array
    {
        $year = now()->year;

        return [
            'Ganjil ' . $year . '/' . ($year + 1),
            'Genap ' . $year . '/' . ($year + 1),
            'Ganjil ' . ($year - 1) . '/' . $year,
            'Genap ' . ($year - 1) . '/' . $year,
        ];
    }

    private function courseOptions()
    {
        return MataKuliah::with('dosen')->orderBy('nama')->get()->map(function (MataKuliah $course) {
            return [
                'id' => $course->id,
                'nama' => $course->nama,
                'kode' => $course->kode,
                'kelas' => $course->kelas,
                'sks' => $course->sks,
                'dosen_nama' => $course->dosen?->nama,
            ];
        });
    }

    private function ensureAdminAccess(): int
    {
        abort_unless(auth()->guard('web')->check(), 403);

        return (int) auth()->guard('web')->id();
    }

    private function constantsPayload(): array
    {
        return [
            'class_label' => self::DEFAULT_CLASS_LABEL,
            'platform_name' => self::PLATFORM_NAME,
            'platform_url' => self::PLATFORM_URL,
            'forum_posts_required' => self::DEFAULT_FORUM_POSTS_REQUIRED,
        ];
    }

    private function defaultWeekData(): array
    {
        $now = now();

        return [
            'week_number' => (int) $now->weekOfYear,
            'semester' => $this->currentSemester(),
            'week_start_date' => $now->copy()->startOfWeek()->toDateString(),
            'week_end_date' => $now->copy()->endOfWeek()->toDateString(),
        ];
    }

    private function currentSemester(): string
    {
        $month = now()->month;
        $year = now()->year;

        if ($month >= 8) {
            return 'Ganjil ' . $year . '/' . ($year + 1);
        }

        if ($month === 1) {
            return 'Ganjil ' . ($year - 1) . '/' . $year;
        }

        return 'Genap ' . ($year - 1) . '/' . $year;
    }

    private function nullableText(mixed $value, int $limit = 5000): ?string
    {
        $text = trim(strip_tags((string) ($value ?? '')));

        if ($text === '') {
            return null;
        }

        return mb_substr($text, 0, $limit);
    }

    private function nullableUrl(mixed $value): ?string
    {
        $url = trim((string) ($value ?? ''));

        return $url !== '' ? filter_var($url, FILTER_SANITIZE_URL) : null;
    }
}
