<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\WeeklyLearningDigest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Services\PdfReportService;
use App\Jobs\ProcessBatchPdfExport;

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
            ->with(['mataKuliahs', 'creator'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->whereHas('mataKuliahs', function ($courseQuery) use ($search) {
                        $courseQuery->where('nama', 'like', "%{$search}%")
                            ->orWhere('kode', 'like', "%{$search}%")
                            ->orWhere('digest_mata_kuliah.title', 'like', "%{$search}%");
                    });
                });
            })
            ->when($semester !== '', fn ($query) => $query->where('semester', $semester))
            ->when($status === 'published', fn ($query) => $query->where('is_published', true))
            ->when($status === 'draft', fn ($query) => $query->where('is_published', false))
            ->when($week, fn ($query) => $query->where('week_number', $week))
            ->orderByDesc('week_number')
            ->orderByDesc('week_number')
            ->paginate(12)
            ->withQueryString()
            ->through(function (WeeklyLearningDigest $digest) {
                $courses = $digest->mataKuliahs->map(fn($course) => [
                    'id' => $course->id,
                    'name' => $course->nama,
                    'code' => $course->kode,
                    'meeting_number' => $course->pivot->meeting_number,
                    'title' => $course->pivot->title,
                ]);

                return [
                    'id' => $digest->id,
                    'courses' => $courses,
                    'display_title' => $this->displayDigestTitle($courses),
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

        $baseData = $validated;
        $baseData['created_by'] = $adminId;
        $baseData['published_at'] = $baseData['is_published'] ? now() : null;
        unset($baseData['mata_kuliah_ids']);

        $digest = WeeklyLearningDigest::create($baseData);

        $syncData = [];
        foreach ($validated['mata_kuliah_ids'] as $courseId) {
            $meetingNumber = $validated['meetings'][$courseId] ?? 1;
            $title = $this->nullableText($validated['titles'][$courseId] ?? null, 255) 
                ?: 'Materi Pertemuan ' . $meetingNumber;
                
            $syncData[$courseId] = [
                'meeting_number' => $meetingNumber,
                'title' => $title,
            ];
        }

        $digest->mataKuliahs()->sync($syncData);

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
        $data = $validated;
        $data['published_at'] = $validated['is_published']
            ? ($digest->published_at ?? now())
            : null;
        unset($data['mata_kuliah_ids']);
        unset($data['meetings']);
        unset($data['titles']);

        $digest->update($data);

        $syncData = [];
        foreach ($validated['mata_kuliah_ids'] as $courseId) {
            $meetingNumber = $validated['meetings'][$courseId] ?? 1;
            $title = $this->nullableText($validated['titles'][$courseId] ?? null, 255) 
                ?: 'Materi Pertemuan ' . $meetingNumber;
                
            $syncData[$courseId] = [
                'meeting_number' => $meetingNumber,
                'title' => $title,
            ];
        }

        $digest->mataKuliahs()->sync($syncData);

        return redirect()
            ->route('admin.weekly-digest.show', $digest->id)
            ->with('success', 'Info Pekanan Mentari berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->ensureAdminAccess();

        WeeklyLearningDigest::findOrFail($id)->delete();

        return redirect()->route('admin.weekly-digest.index')->with('success', 'Info Pekanan Mentari berhasil dihapus.');
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

        if ($nextStatus) {
            // Cek apakah notifikasi untuk digest ini sudah pernah dikirim sebelumnya
            $notificationExists = \App\Models\AppNotification::where('type', 'announcement')
                ->where('action_url', '/user/weekly-digest/' . $digest->id)
                ->exists();

            if (!$notificationExists) {
                // Ambil daftar mata kuliah untuk judul notifikasi
                $courses = $digest->mataKuliahs->map(fn ($c) => [
                    'title' => $c->pivot->title,
                    'meeting_number' => $c->pivot->meeting_number,
                ]);
                $displayTitle = $this->displayDigestTitle($courses);

                \App\Models\AppNotification::create([
                    'notifiable_type' => 'all',
                    'notifiable_id' => 0,
                    'title' => 'Info Pekanan Mentari: ' . $displayTitle,
                    'message' => 'Ringkasan pembelajaran minggu ke-' . $digest->week_number . ' telah diterbitkan. Silakan cek materi, tugas, dan forum diskusi terbaru.',
                    'type' => 'announcement',
                    'priority' => 'normal',
                    'action_url' => '/user/weekly-digest/' . $digest->id,
                    'created_by' => auth()->guard('web')->user()?->name ?? 'System Admin',
                    'created_by_type' => 'admin',
                    'created_by_id' => auth()->guard('web')->id(),
                ]);
            }
        }

        return back()->with('success', $nextStatus
            ? 'Info Pekanan Mentari berhasil dipublikasikan dan notifikasi telah dikirim ke mahasiswa.'
            : 'Info Pekanan Mentari dikembalikan ke draft.');
    }

    public function exportPdf(int $id, PdfReportService $pdfService)
    {
        $this->ensureAdminAccess();

        $digest = $this->findDigest($id);
        $user = auth()->guard('web')->user();

        $pdfContent = $pdfService->generateWeeklyDigestPdf($digest, $user);
        
        $filename = 'Info_Pekanan_Mentari_Minggu_' . $digest->week_number . '_ID_' . $digest->id . '.pdf';

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    public function batchExport(Request $request)
    {
        $this->ensureAdminAccess();
        
        $request->validate([
            'digest_ids' => 'required|array|min:1',
            'digest_ids.*' => 'exists:weekly_learning_digests,id'
        ]);

        $userId = auth()->guard('web')->id();
        
        ProcessBatchPdfExport::dispatch($request->digest_ids, $userId);

        return back()->with('success', 'Proses ekspor PDF masal sedang berjalan di latar belakang. Anda akan menerima notifikasi saat file siap diunduh.');
    }

    private function validatePayload(Request $request, ?WeeklyLearningDigest $digest = null): array
    {
        $payload = $this->normalizePayload($request->all(), $digest);

        return Validator::make($payload, [
            'mata_kuliah_ids' => 'required|array|min:1',
            'mata_kuliah_ids.*' => 'exists:mata_kuliah,id',
            'meetings' => 'required|array',
            'meetings.*' => 'integer|min:1|max:32',
            'titles' => 'nullable|array',
            'titles.*' => 'nullable|string|max:255',
            'class_label' => 'required|string|max:50',
            'week_number' => 'required|integer|min:1|max:53',
            'semester' => 'required|string|max:20',
            'week_start_date' => 'required|date',
            'week_end_date' => 'required|date|after_or_equal:week_start_date',
            'description' => 'nullable|string|max:5000',
            'has_structured_task' => 'boolean',
            'forum_posts_required' => 'required|integer|min:1|max:10',
            'mentari_course_url' => 'nullable|url|max:500',
            'mentari_course_id' => 'nullable|string|max:100',
            'is_published' => 'boolean',
        ])->after(function ($validator) use ($payload, $digest) {
            foreach ($payload['mata_kuliah_ids'] as $courseId) {
                $meetingNum = $payload['meetings'][$courseId] ?? 1;

                $exists = WeeklyLearningDigest::query()
                    ->whereHas('mataKuliahs', function ($q) use ($courseId, $meetingNum) {
                        $q->where('mata_kuliah_id', $courseId)
                          ->where('digest_mata_kuliah.meeting_number', $meetingNum);
                    })
                    ->where('week_number', $payload['week_number'])
                    ->where('semester', $payload['semester'])
                    ->when($digest, fn ($query) => $query->where('id', '!=', $digest->id))
                    ->exists();

                if ($exists) {
                    $validator->errors()->add("meetings.{$courseId}", 'Matkul ini sudah memiliki jadwal di pertemuan ' . $meetingNum . ' pada minggu yang sama.');
                }
            }
        })->validate();
    }

    private function normalizePayload(array $payload, ?WeeklyLearningDigest $digest = null): array
    {
        $defaults = $this->defaultWeekData();

        $courseIds = $payload['mata_kuliah_ids'] ?? [];
        if (empty($courseIds) && isset($payload['mata_kuliah_id'])) {
            $courseIds = [$payload['mata_kuliah_id']];
        }

        $meetings = $payload['meetings'] ?? [];
        if (empty($meetings) && isset($payload['meeting_number']) && !empty($courseIds)) {
            foreach ((array) $courseIds as $cid) {
                $meetings[$cid] = (int) $payload['meeting_number'];
            }
        }

        $titles = $payload['titles'] ?? [];
        if (empty($titles) && isset($payload['title']) && !empty($courseIds)) {
            foreach ((array) $courseIds as $cid) {
                $titles[$cid] = $payload['title'];
            }
        }

        return [
            'mata_kuliah_ids' => array_map('intval', (array) $courseIds),
            'meetings' => $meetings,
            'titles' => $titles,
            'class_label' => self::DEFAULT_CLASS_LABEL,
            'week_number' => $digest?->week_number ?? $defaults['week_number'],
            'semester' => $digest?->semester ?? $defaults['semester'],
            'week_start_date' => $digest?->week_start_date?->toDateString() ?? $defaults['week_start_date'],
            'week_end_date' => $digest?->week_end_date?->toDateString() ?? $defaults['week_end_date'],
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
        return WeeklyLearningDigest::with(['mataKuliahs.dosen', 'creator'])->findOrFail($id);
    }

    private function detailPayload(WeeklyLearningDigest $digest): array
    {
        $courses = $digest->mataKuliahs->map(fn($course) => [
            'id' => $course->id,
            'name' => $course->nama,
            'code' => $course->kode,
            'dosen_name' => $course->dosen?->nama,
            'meeting_number' => $course->pivot->meeting_number,
            'title' => $course->pivot->title,
        ]);

        return [
            'id' => $digest->id,
            'courses' => $courses,
            'mata_kuliah_ids' => $courses->pluck('id')->toArray(),
            'meetings' => $courses->pluck('meeting_number', 'id')->toArray(),
            'titles' => $courses->pluck('title', 'id')->toArray(),
            'class_label' => self::DEFAULT_CLASS_LABEL,
            'week_number' => $digest->week_number,
            'semester' => $digest->semester,
            'week_range' => $digest->week_range,
            'display_title' => $this->displayDigestTitle($courses),
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

    private function displayDigestTitle($courses): string
    {
        if (count($courses) > 1) {
            return count($courses) . ' Mata Kuliah Terpilih';
        }

        if (count($courses) === 1) {
            $course = is_array($courses[0]) ? $courses[0] : (is_object($courses[0]) ? $courses[0] : collect($courses)->first());
            
            $title = is_array($course) ? ($course['title'] ?? null) : ($course->pivot->title ?? $course->title ?? null);
            $meetingInfo = is_array($course) ? ($course['meeting_number'] ?? 1) : ($course->pivot->meeting_number ?? $course->meeting_number ?? 1);

            return $title ?: 'Materi Pertemuan ' . $meetingInfo;
        }

        return 'Materi Informasi Pekanan';
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
        if (is_array($value)) {
            return null; // Don't allow passing arrays straight into text fields
        }

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
