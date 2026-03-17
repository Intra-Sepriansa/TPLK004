<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\Tugas;
use App\Models\TugasDiskusi;
use App\Models\TugasRead;
use App\Models\TugasSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class MobileTugasController extends Controller
{
    /**
     * POST /api/mobile/mahasiswa/tugas
     * Returns tugas list, courses, and stats for the authenticated mahasiswa.
     */
    public function index(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();

        $courseScope = MataKuliah::query()
            ->with('dosen')
            ->orderBy('nama');

        if (!empty($mahasiswa->kelas) && Schema::hasColumn('mata_kuliah', 'kelas')) {
            $courseScope->where('kelas', $mahasiswa->kelas);
        }

        $coursesCollection = $courseScope->get();
        $allowedCourseIds = $coursesCollection->pluck('id');

        $tugasCollection = Tugas::query()
            ->with(['course.dosen'])
            ->withCount([
                'diskusi as diskusi_count' => fn ($q) => $q->where('visibility', 'public'),
            ])
            ->where('status', 'published')
            ->when(
                $allowedCourseIds->isNotEmpty(),
                fn ($q) => $q->whereIn('course_id', $allowedCourseIds),
                fn ($q) => $q->whereRaw('1 = 0')
            )
            ->orderBy('deadline', 'asc')
            ->get();

        $readTaskIds = TugasRead::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('tugas_id', $tugasCollection->pluck('id'))
            ->pluck('tugas_id')
            ->flip();

        $tugasList = $tugasCollection->map(function ($tugas) use ($readTaskIds) {
            return [
                'id' => $tugas->id,
                'judul' => $tugas->judul,
                'deskripsi' => $tugas->deskripsi,
                'jenis' => $tugas->jenis,
                'deadline' => $tugas->deadline?->format('Y-m-d H:i') ?? '',
                'deadline_display' => $tugas->deadline?->translatedFormat('l, d F Y H:i') ?? '',
                'prioritas' => $tugas->prioritas,
                'course' => $tugas->course ? [
                    'id' => $tugas->course->id,
                    'nama' => $tugas->course->nama,
                    'dosen' => $tugas->course->dosen?->nama,
                ] : ['id' => 0, 'nama' => '', 'dosen' => null],
                'created_by' => $tugas->creator_name ?? '',
                'is_overdue' => $tugas->isOverdue(),
                'days_until_deadline' => $tugas->days_until_deadline ?? 0,
                'is_read' => $readTaskIds->has($tugas->id),
                'diskusi_count' => $tugas->diskusi_count ?? 0,
            ];
        })->values();

        $courses = $coursesCollection->map(fn ($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
            'dosen' => $c->dosen?->nama,
        ])->values();

        $allTugas = Tugas::query()
            ->where('status', 'published')
            ->when(
                $allowedCourseIds->isNotEmpty(),
                fn ($q) => $q->whereIn('course_id', $allowedCourseIds),
                fn ($q) => $q->whereRaw('1 = 0')
            );

        $stats = [
            'total' => (clone $allTugas)->count(),
            'upcoming' => (clone $allTugas)->where('deadline', '>=', now())->count(),
            'overdue' => (clone $allTugas)->where('deadline', '<', now())->count(),
            'unread' => (clone $allTugas)->whereDoesntHave('reads', function ($q) use ($mahasiswa) {
                $q->where('mahasiswa_id', $mahasiswa->id);
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'tugasList' => $tugasList,
                'courses' => $courses,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * GET /api/mobile/mahasiswa/tugas/{id}
     * Returns detail of a specific tugas with diskusi and submission.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();

        $tugas = Tugas::with(['course.dosen'])->findOrFail($id);

        if ($tugas->status !== 'published') {
            return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
        }

        // Mark as read
        TugasRead::firstOrCreate([
            'tugas_id' => $tugas->id,
            'mahasiswa_id' => $mahasiswa->id,
        ], [
            'read_at' => now(),
        ]);

        // Submission
        $submission = TugasSubmission::where('tugas_id', $tugas->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        // Diskusi
        $diskusi = TugasDiskusi::with('replyTo')
            ->where('tugas_id', $tugas->id)
            ->where(function ($q) use ($mahasiswa) {
                $q->where('visibility', 'public')
                  ->orWhere(function ($q2) use ($mahasiswa) {
                      $q2->where('sender_type', 'mahasiswa')
                         ->where('sender_id', $mahasiswa->id);
                  })
                  ->orWhere(function ($q2) use ($mahasiswa) {
                      $q2->where('recipient_type', 'mahasiswa')
                         ->where('recipient_id', $mahasiswa->id);
                  });
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'sender_type' => $d->sender_type,
                'sender_name' => $d->sender_name,
                'sender_avatar' => $d->sender_avatar,
                'pesan' => $d->pesan,
                'visibility' => $d->visibility,
                'recipient_name' => $d->recipient_name,
                'is_pinned' => (bool) $d->is_pinned,
                'is_mine' => $d->sender_type === 'mahasiswa' && $d->sender_id === $mahasiswa->id,
                'reply_to_id' => $d->reply_to_id,
                'reply_to' => $d->replyTo ? [
                    'sender_name' => $d->replyTo->sender_name,
                    'pesan' => $d->replyTo->pesan,
                ] : null,
                'created_at' => $d->created_at?->format('d M Y H:i') ?? '',
                'time_ago' => $d->created_at?->diffForHumans() ?? '',
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'tugas' => [
                    'id' => $tugas->id,
                    'judul' => $tugas->judul,
                    'deskripsi' => $tugas->deskripsi,
                    'instruksi' => $tugas->instruksi,
                    'jenis' => $tugas->jenis,
                    'deadline' => $tugas->deadline?->format('Y-m-d H:i') ?? '',
                    'deadline_display' => $tugas->deadline?->translatedFormat('l, d F Y H:i') ?? '',
                    'prioritas' => $tugas->prioritas,
                    'allow_late_submission' => $tugas->allow_late_submission ?? true,
                    'late_penalty_percent' => $tugas->late_penalty_percent ?? 0,
                    'max_grade' => $tugas->max_grade ?? 100,
                    'course' => $tugas->course ? [
                        'id' => $tugas->course->id,
                        'nama' => $tugas->course->nama,
                        'dosen' => $tugas->course->dosen?->nama,
                        'dosen_id' => $tugas->course->dosen_id,
                    ] : ['id' => 0, 'nama' => '', 'dosen' => null, 'dosen_id' => null],
                    'created_by' => $tugas->creator_name ?? '',
                    'is_overdue' => $tugas->isOverdue(),
                    'days_until_deadline' => $tugas->days_until_deadline ?? 0,
                    'is_read' => true,
                    'diskusi_count' => $tugas->diskusi()->where('visibility', 'public')->count(),
                    'created_at' => $tugas->created_at?->format('d M Y H:i') ?? '',
                ],
                'submission' => $submission ? [
                    'id' => $submission->id,
                    'content' => $submission->content,
                    'file_path' => $submission->file_path ? Storage::url($submission->file_path) : null,
                    'file_name' => $submission->file_name,
                    'status' => $submission->status,
                    'grade' => $submission->grade,
                    'grade_letter' => $submission->grade_letter,
                    'feedback' => $submission->feedback,
                    'submitted_at' => $submission->submitted_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
                    'graded_at' => $submission->graded_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
                ] : null,
                'diskusi' => $diskusi,
            ],
        ]);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas/{id}/submit
     * Submit or update a tugas submission.
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $tugas = Tugas::findOrFail($id);

        $data = ['tugas_id' => $tugas->id, 'mahasiswa_id' => $mahasiswa->id];

        $submission = TugasSubmission::firstOrNew($data);
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('tugas-submissions', 'public');
            $submission->file_path = $path;
            $submission->file_name = $file->getClientOriginalName();
        }
        if ($request->has('content')) {
            $submission->content = $request->input('content');
        }
        $submission->status = 'submitted';
        $submission->submitted_at = now();
        $submission->save();

        return response()->json(['success' => true, 'message' => 'Tugas berhasil disubmit']);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas/{id}/message
     * Send a discussion message for a tugas.
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $tugas = Tugas::findOrFail($id);

        $request->validate([
            'pesan' => 'required|string|max:2000',
            'visibility' => 'required|in:public,private',
            'reply_to_id' => 'nullable|exists:tugas_diskusi,id',
        ]);

        TugasDiskusi::create([
            'tugas_id' => $tugas->id,
            'sender_type' => 'mahasiswa',
            'sender_id' => $mahasiswa->id,
            'pesan' => $request->pesan,
            'visibility' => $request->visibility,
            'reply_to_id' => $request->reply_to_id,
        ]);

        return response()->json(['success' => true, 'message' => 'Pesan berhasil dikirim']);
    }
}
