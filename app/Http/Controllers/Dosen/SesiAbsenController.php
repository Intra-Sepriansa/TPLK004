<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SesiAbsenController extends Controller
{
    public function index(): Response
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Get courses taught by this dosen
        $courses = $dosen->courses()->select('mata_kuliah.id', 'mata_kuliah.nama', 'mata_kuliah.sks')->get();
        $courseIds = $courses->pluck('id')->toArray();
        
        // If dosen has no assigned courses, show all courses (for flexibility)
        if (empty($courseIds)) {
            $courses = MataKuliah::select('id', 'nama', 'sks')->get();
            $courseIds = $courses->pluck('id')->toArray();
        }
        
        // Get sessions for these courses
        $sessions = AttendanceSession::whereIn('course_id', $courseIds)
            ->with(['course', 'logs'])
            ->orderByDesc('start_at')
            ->get()
            ->map(fn($session) => [
                'id' => $session->id,
                'course_id' => $session->course_id,
                'course_name' => $session->course->nama ?? '-',
                'meeting_number' => $session->meeting_number,
                'title' => $session->title,
                'start_at' => $session->start_at?->format('d M Y H:i'),
                'end_at' => $session->end_at?->format('H:i'),
                'is_active' => $session->is_active,
                'logs_count' => $session->logs->count(),
                'present_count' => $session->logs->where('status', 'present')->count(),
                'late_count' => $session->logs->where('status', 'late')->count(),
                'rejected_count' => $session->logs->where('status', 'rejected')->count(),
            ]);

        return Inertia::render('dosen/sesi-absen', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'sessions' => $sessions,
            'courses' => $courses,
        ]);
    }
}
