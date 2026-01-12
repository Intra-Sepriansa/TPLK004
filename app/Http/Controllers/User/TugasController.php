<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\Tugas;
use App\Models\TugasDiskusi;
use App\Models\TugasRead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TugasController extends Controller
{
    public function index(Request $request): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $search = $request->get('search', '');
        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all'); // upcoming, overdue, all

        $query = Tugas::with(['course.dosen'])
            ->where('status', 'published')
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

        if ($status === 'upcoming') {
            $query->where('deadline', '>=', now());
        } elseif ($status === 'overdue') {
            $query->where('deadline', '<', now());
        }

        $tugasList = $query->get()->map(function ($tugas) use ($mahasiswa) {
            $isRead = TugasRead::where('tugas_id', $tugas->id)
                ->where('mahasiswa_id', $mahasiswa->id)
                ->exists();

            return [
                'id' => $tugas->id,
                'judul' => $tugas->judul,
                'deskripsi' => $tugas->deskripsi,
                'jenis' => $tugas->jenis,
                'deadline' => $tugas->deadline->format('Y-m-d H:i'),
                'deadline_display' => $tugas->deadline->translatedFormat('l, d F Y H:i'),
                'prioritas' => $tugas->prioritas,
                'course' => [
                    'id' => $tugas->course->id,
                    'nama' => $tugas->course->nama,
                    'dosen' => $tugas->course->dosen?->nama,
                ],
                'created_by' => $tugas->creator_name,
                'is_overdue' => $tugas->isOverdue(),
                'days_until_deadline' => $tugas->days_until_deadline,
                'is_read' => $isRead,
                'diskusi_count' => $tugas->diskusi()->where('visibility', 'public')->count(),
            ];
        });

        $courses = MataKuliah::with('dosen')->orderBy('nama')->get()->map(fn($c) => [
            'id' => $c->id,
            'nama' => $c->nama,
            'dosen' => $c->dosen?->nama,
        ]);

        // Stats
        $allTugas = Tugas::where('status', 'published');
        $stats = [
            'total' => (clone $allTugas)->count(),
            'upcoming' => (clone $allTugas)->where('deadline', '>=', now())->count(),
            'overdue' => (clone $allTugas)->where('deadline', '<', now())->count(),
            'unread' => (clone $allTugas)->whereDoesntHave('reads', function ($q) use ($mahasiswa) {
                $q->where('mahasiswa_id', $mahasiswa->id);
            })->count(),
        ];

        return Inertia::render('user/tugas', [
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
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

    public function show(Tugas $tuga): Response
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();
        $tugas = $tuga->load(['course.dosen']);

        // Only show published tugas
        if ($tugas->status !== 'published') {
            abort(404);
        }

        // Mark as read
        TugasRead::firstOrCreate([
            'tugas_id' => $tugas->id,
            'mahasiswa_id' => $mahasiswa->id,
        ], [
            'read_at' => now(),
        ]);

        // Get diskusi - public messages or private messages involving this mahasiswa
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
            ->map(fn($d) => [
                'id' => $d->id,
                'sender_type' => $d->sender_type,
                'sender_name' => $d->sender_name,
                'sender_avatar' => $d->sender_avatar,
                'pesan' => $d->pesan,
                'visibility' => $d->visibility,
                'recipient_name' => $d->recipient_name,
                'is_pinned' => $d->is_pinned,
                'is_mine' => $d->sender_type === 'mahasiswa' && $d->sender_id === $mahasiswa->id,
                'reply_to_id' => $d->reply_to_id,
                'reply_to' => $d->replyTo ? [
                    'sender_name' => $d->replyTo->sender_name,
                    'pesan' => $d->replyTo->pesan,
                ] : null,
                'created_at' => $d->created_at->format('d M Y H:i'),
                'time_ago' => $d->created_at->diffForHumans(),
            ]);

        return Inertia::render('user/tugas-detail', [
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
            'tugas' => [
                'id' => $tugas->id,
                'judul' => $tugas->judul,
                'deskripsi' => $tugas->deskripsi,
                'instruksi' => $tugas->instruksi,
                'jenis' => $tugas->jenis,
                'deadline' => $tugas->deadline->format('Y-m-d H:i'),
                'deadline_display' => $tugas->deadline->translatedFormat('l, d F Y H:i'),
                'prioritas' => $tugas->prioritas,
                'course' => [
                    'id' => $tugas->course->id,
                    'nama' => $tugas->course->nama,
                    'dosen' => $tugas->course->dosen?->nama,
                    'dosen_id' => $tugas->course->dosen_id,
                ],
                'created_by' => $tugas->creator_name,
                'is_overdue' => $tugas->isOverdue(),
                'days_until_deadline' => $tugas->days_until_deadline,
                'created_at' => $tugas->created_at->format('d M Y H:i'),
            ],
            'diskusi' => $diskusi,
        ]);
    }

    public function sendMessage(Request $request, Tugas $tuga): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $request->validate([
            'pesan' => 'required|string|max:2000',
            'visibility' => 'required|in:public,private',
            'recipient_type' => 'nullable|in:dosen,admin',
            'recipient_id' => 'nullable|integer',
            'reply_to_id' => 'nullable|exists:tugas_diskusi,id',
        ]);

        TugasDiskusi::create([
            'tugas_id' => $tuga->id,
            'sender_type' => 'mahasiswa',
            'sender_id' => $mahasiswa->id,
            'pesan' => $request->pesan,
            'visibility' => $request->visibility,
            'recipient_type' => $request->recipient_type,
            'recipient_id' => $request->recipient_id,
            'reply_to_id' => $request->reply_to_id,
        ]);

        return back()->with('success', 'Pesan berhasil dikirim.');
    }
}
