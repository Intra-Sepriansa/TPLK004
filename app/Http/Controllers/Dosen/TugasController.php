<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\Tugas;
use App\Models\TugasDiskusi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TugasController extends Controller
{
    public function index(Request $request): Response
    {
        $dosen = Auth::guard('dosen')->user();
        $search = $request->get('search', '');
        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all');

        // Get courses taught by this dosen
        $dosenCourseIds = MataKuliah::where('dosen_id', $dosen->id)->pluck('id');

        $query = Tugas::with(['course.dosen'])
            ->whereIn('course_id', $dosenCourseIds)
            ->orderBy('deadline', 'asc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if ($courseId !== 'all') {
            $query->where('course_id', $courseId);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $tugasList = $query->get()->map(function ($tugas) {
            return [
                'id' => $tugas->id,
                'judul' => $tugas->judul,
                'deskripsi' => $tugas->deskripsi,
                'jenis' => $tugas->jenis,
                'deadline' => $tugas->deadline->format('Y-m-d H:i'),
                'deadline_display' => $tugas->deadline->translatedFormat('l, d F Y H:i'),
                'prioritas' => $tugas->prioritas,
                'status' => $tugas->status,
                'course' => [
                    'id' => $tugas->course->id,
                    'nama' => $tugas->course->nama,
                ],
                'created_by' => $tugas->creator_name,
                'created_by_type' => $tugas->created_by_type,
                'is_overdue' => $tugas->isOverdue(),
                'days_until_deadline' => $tugas->days_until_deadline,
                'diskusi_count' => $tugas->diskusi()->count(),
                'created_at' => $tugas->created_at->format('d M Y'),
            ];
        });

        $courses = MataKuliah::where('dosen_id', $dosen->id)->orderBy('nama')->get()->map(fn($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
        ]);

        // Stats
        $stats = [
            'total' => Tugas::whereIn('course_id', $dosenCourseIds)->count(),
            'published' => Tugas::whereIn('course_id', $dosenCourseIds)->where('status', 'published')->count(),
            'draft' => Tugas::whereIn('course_id', $dosenCourseIds)->where('status', 'draft')->count(),
            'overdue' => Tugas::whereIn('course_id', $dosenCourseIds)->where('status', 'published')->where('deadline', '<', now())->count(),
        ];

        return Inertia::render('dosen/tugas', [
            'tugasList' => $tugasList,
            'courses' => $courses,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'course_id' => $courseId,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();
        
        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'instruksi' => 'nullable|string',
            'jenis' => 'required|in:tugas,quiz,project,presentasi,lainnya',
            'deadline' => 'required|date|after:now',
            'prioritas' => 'required|in:rendah,sedang,tinggi',
            'status' => 'required|in:draft,published',
        ]);

        // Verify dosen owns this course
        $course = MataKuliah::where('id', $request->course_id)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        Tugas::create([
            'course_id' => $request->course_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'instruksi' => $request->instruksi,
            'jenis' => $request->jenis,
            'deadline' => $request->deadline,
            'prioritas' => $request->prioritas,
            'status' => $request->status,
            'created_by_type' => 'dosen',
            'created_by_id' => $dosen->id,
        ]);

        return back()->with('success', 'Tugas berhasil ditambahkan.');
    }

    public function show(Tugas $tuga): Response
    {
        $dosen = Auth::guard('dosen')->user();
        $tugas = $tuga->load(['course.dosen']);

        // Verify dosen owns this course
        if ($tugas->course->dosen_id !== $dosen->id) {
            abort(403);
        }

        // Get diskusi
        $diskusi = TugasDiskusi::where('tugas_id', $tugas->id)
            ->where(function ($q) use ($dosen) {
                $q->where('visibility', 'public')
                  ->orWhere(function ($q2) use ($dosen) {
                      $q2->where('sender_type', 'dosen')
                         ->where('sender_id', $dosen->id);
                  })
                  ->orWhere(function ($q2) use ($dosen) {
                      $q2->where('recipient_type', 'dosen')
                         ->where('recipient_id', $dosen->id);
                  });
            })
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'sender_type' => $d->sender_type,
                'sender_name' => $d->sender_name,
                'sender_avatar' => $d->sender_avatar,
                'pesan' => $d->pesan,
                'visibility' => $d->visibility,
                'recipient_name' => $d->recipient_name,
                'is_pinned' => $d->is_pinned,
                'reply_to_id' => $d->reply_to_id,
                'created_at' => $d->created_at->format('d M Y H:i'),
                'time_ago' => $d->created_at->diffForHumans(),
            ]);

        return Inertia::render('dosen/tugas-detail', [
            'tugas' => [
                'id' => $tugas->id,
                'judul' => $tugas->judul,
                'deskripsi' => $tugas->deskripsi,
                'instruksi' => $tugas->instruksi,
                'jenis' => $tugas->jenis,
                'deadline' => $tugas->deadline->format('Y-m-d\TH:i'),
                'deadline_display' => $tugas->deadline->translatedFormat('l, d F Y H:i'),
                'prioritas' => $tugas->prioritas,
                'status' => $tugas->status,
                'course' => [
                    'id' => $tugas->course->id,
                    'nama' => $tugas->course->nama,
                ],
                'created_by' => $tugas->creator_name,
                'created_by_type' => $tugas->created_by_type,
                'edited_by' => $tugas->editor_name,
                'edited_at' => $tugas->edited_at?->format('d M Y H:i'),
                'is_overdue' => $tugas->isOverdue(),
                'days_until_deadline' => $tugas->days_until_deadline,
                'created_at' => $tugas->created_at->format('d M Y H:i'),
            ],
            'diskusi' => $diskusi,
        ]);
    }

    public function update(Request $request, Tugas $tuga): RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();

        // Verify dosen owns this course
        if ($tuga->course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'instruksi' => 'nullable|string',
            'jenis' => 'required|in:tugas,quiz,project,presentasi,lainnya',
            'deadline' => 'required|date',
            'prioritas' => 'required|in:rendah,sedang,tinggi',
            'status' => 'required|in:draft,published,closed',
        ]);

        $tuga->update([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'instruksi' => $request->instruksi,
            'jenis' => $request->jenis,
            'deadline' => $request->deadline,
            'prioritas' => $request->prioritas,
            'status' => $request->status,
            'edited_by_type' => 'dosen',
            'edited_by_id' => $dosen->id,
            'edited_at' => now(),
        ]);

        return back()->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Tugas $tuga): RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();

        if ($tuga->course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $tuga->delete();
        return redirect()->route('dosen.tugas')->with('success', 'Tugas berhasil dihapus.');
    }

    public function sendMessage(Request $request, Tugas $tuga): RedirectResponse
    {
        $dosen = Auth::guard('dosen')->user();

        $request->validate([
            'pesan' => 'required|string|max:2000',
            'visibility' => 'required|in:public,private',
            'recipient_type' => 'nullable|in:mahasiswa,admin',
            'recipient_id' => 'nullable|integer',
            'reply_to_id' => 'nullable|exists:tugas_diskusi,id',
        ]);

        TugasDiskusi::create([
            'tugas_id' => $tuga->id,
            'sender_type' => 'dosen',
            'sender_id' => $dosen->id,
            'pesan' => $request->pesan,
            'visibility' => $request->visibility,
            'recipient_type' => $request->recipient_type,
            'recipient_id' => $request->recipient_id,
            'reply_to_id' => $request->reply_to_id,
        ]);

        return back()->with('success', 'Pesan berhasil dikirim.');
    }
}
