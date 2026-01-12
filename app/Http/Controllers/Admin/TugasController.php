<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\Tugas;
use App\Models\TugasDiskusi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TugasController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search', '');
        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all');

        $query = Tugas::with(['course.dosen'])
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
                    'dosen' => $tugas->course->dosen?->nama,
                ],
                'created_by' => $tugas->creator_name,
                'created_by_type' => $tugas->created_by_type,
                'is_overdue' => $tugas->isOverdue(),
                'days_until_deadline' => $tugas->days_until_deadline,
                'diskusi_count' => $tugas->diskusi()->count(),
                'created_at' => $tugas->created_at->format('d M Y'),
            ];
        });

        $courses = MataKuliah::with('dosen')->orderBy('nama')->get()->map(fn($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
            'dosen' => $c->dosen?->nama,
        ]);

        // Stats
        $stats = [
            'total' => Tugas::count(),
            'published' => Tugas::where('status', 'published')->count(),
            'draft' => Tugas::where('status', 'draft')->count(),
            'overdue' => Tugas::where('status', 'published')->where('deadline', '<', now())->count(),
        ];

        return Inertia::render('admin/tugas', [
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

        Tugas::create([
            'course_id' => $request->course_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'instruksi' => $request->instruksi,
            'jenis' => $request->jenis,
            'deadline' => $request->deadline,
            'prioritas' => $request->prioritas,
            'status' => $request->status,
            'created_by_type' => 'admin',
            'created_by_id' => auth()->id(),
        ]);

        return back()->with('success', 'Tugas berhasil ditambahkan.');
    }

    public function show(Tugas $tuga): Response
    {
        $tugas = $tuga->load(['course.dosen']);

        // Get diskusi with public visibility or where admin is involved
        $diskusi = TugasDiskusi::where('tugas_id', $tugas->id)
            ->where(function ($q) {
                $q->where('visibility', 'public')
                  ->orWhere(function ($q2) {
                      $q2->where('sender_type', 'admin')
                         ->where('sender_id', auth()->id());
                  })
                  ->orWhere(function ($q2) {
                      $q2->where('recipient_type', 'admin')
                         ->where('recipient_id', auth()->id());
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

        return Inertia::render('admin/tugas-detail', [
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
                    'dosen' => $tugas->course->dosen?->nama,
                    'dosen_id' => $tugas->course->dosen_id,
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
            'edited_by_type' => 'admin',
            'edited_by_id' => auth()->id(),
            'edited_at' => now(),
        ]);

        return back()->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Tugas $tuga): RedirectResponse
    {
        $tuga->delete();
        return redirect()->route('admin.tugas')->with('success', 'Tugas berhasil dihapus.');
    }

    public function sendMessage(Request $request, Tugas $tuga): RedirectResponse
    {
        $request->validate([
            'pesan' => 'required|string|max:2000',
            'visibility' => 'required|in:public,private',
            'recipient_type' => 'nullable|in:mahasiswa,dosen',
            'recipient_id' => 'nullable|integer',
            'reply_to_id' => 'nullable|exists:tugas_diskusi,id',
        ]);

        TugasDiskusi::create([
            'tugas_id' => $tuga->id,
            'sender_type' => 'admin',
            'sender_id' => auth()->id(),
            'pesan' => $request->pesan,
            'visibility' => $request->visibility,
            'recipient_type' => $request->recipient_type,
            'recipient_id' => $request->recipient_id,
            'reply_to_id' => $request->reply_to_id,
        ]);

        return back()->with('success', 'Pesan berhasil dikirim.');
    }

    public function togglePin(TugasDiskusi $diskusi): RedirectResponse
    {
        $diskusi->update(['is_pinned' => !$diskusi->is_pinned]);
        return back();
    }

    public function deleteMessage(TugasDiskusi $diskusi): RedirectResponse
    {
        $diskusi->delete();
        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
