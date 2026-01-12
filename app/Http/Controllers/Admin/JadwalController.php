<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $courseId = $request->get('course_id', 'all');
        $status = $request->get('status', 'all');
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->endOfMonth()->toDateString());
        
        $query = AttendanceSession::with(['course.dosen'])
            ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        
        if ($courseId !== 'all') {
            $query->where('course_id', $courseId);
        }
        
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'completed') {
            $query->where('is_active', false)->where('end_at', '<', now());
        } elseif ($status === 'scheduled') {
            $query->where('is_active', false)->where('start_at', '>', now());
        }
        
        $sessions = $query->orderBy('start_at', 'desc')->paginate(15)->withQueryString();
        
        // Get all courses
        $courses = MataKuliah::with('dosen')->orderBy('nama')->get();
        
        // Statistics
        $stats = $this->getStats($dateFrom, $dateTo);
        
        // Weekly schedule
        $weeklySchedule = $this->getWeeklySchedule();
        
        // Session distribution by course
        $courseDistribution = $this->getCourseDistribution($dateFrom, $dateTo);
        
        // Upcoming sessions
        $upcomingSessions = AttendanceSession::with(['course.dosen'])
            ->where('start_at', '>', now())
            ->orderBy('start_at')
            ->take(5)
            ->get();
        
        // Recent sessions
        $recentSessions = AttendanceSession::with(['course.dosen'])
            ->withCount('logs')
            ->where('end_at', '<', now())
            ->orderBy('end_at', 'desc')
            ->take(5)
            ->get();
        
        return Inertia::render('admin/jadwal', [
            'sessions' => $sessions,
            'courses' => $courses,
            'stats' => $stats,
            'weeklySchedule' => $weeklySchedule,
            'courseDistribution' => $courseDistribution,
            'upcomingSessions' => $upcomingSessions,
            'recentSessions' => $recentSessions,
            'filters' => [
                'course_id' => $courseId,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'meeting_number' => 'required|integer|min:1|max:21',
            'title' => 'nullable|string|max:255',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);
        
        AttendanceSession::create([
            'course_id' => $request->course_id,
            'meeting_number' => $request->meeting_number,
            'title' => $request->title,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'is_active' => false,
            'created_by' => auth()->id(),
        ]);
        
        return back()->with('success', 'Jadwal berhasil ditambahkan.');
    }
    
    public function update(Request $request, AttendanceSession $session)
    {
        $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'meeting_number' => 'required|integer|min:1|max:21',
            'title' => 'nullable|string|max:255',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);
        
        $session->update($request->only(['course_id', 'meeting_number', 'title', 'start_at', 'end_at']));
        
        return back()->with('success', 'Jadwal berhasil diperbarui.');
    }
    
    public function destroy(AttendanceSession $session)
    {
        $session->delete();
        return back()->with('success', 'Jadwal berhasil dihapus.');
    }
    
    public function activate(AttendanceSession $session)
    {
        // Deactivate all other sessions
        AttendanceSession::where('is_active', true)->update(['is_active' => false]);
        
        $session->update(['is_active' => true]);
        
        return back()->with('success', 'Sesi berhasil diaktifkan.');
    }
    
    public function deactivate(AttendanceSession $session)
    {
        $session->update(['is_active' => false]);
        
        return back()->with('success', 'Sesi berhasil dinonaktifkan.');
    }
    
    public function exportPdf(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->endOfMonth()->toDateString());
        
        $sessions = AttendanceSession::with(['course.dosen'])
            ->withCount('logs')
            ->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('start_at')
            ->get();
        
        $stats = $this->getStats($dateFrom, $dateTo);
        
        $data = [
            'sessions' => $sessions,
            'stats' => $stats,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'tanggal' => now()->format('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.jadwal', $data);
        $pdf->setPaper('A4', 'landscape');
        
        return $pdf->download('Jadwal_Sesi_' . $dateFrom . '_' . $dateTo . '.pdf');
    }
    
    private function getStats($dateFrom, $dateTo)
    {
        $baseQuery = fn() => AttendanceSession::whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        
        $total = $baseQuery()->count();
        $active = AttendanceSession::where('is_active', true)->count();
        $completed = $baseQuery()->where('is_active', false)->where('end_at', '<', now())->count();
        $scheduled = $baseQuery()->where('start_at', '>', now())->count();
        
        $totalAttendance = AttendanceLog::whereHas('session', function ($q) use ($dateFrom, $dateTo) {
            $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        })->count();
        
        $avgPerSession = $total > 0 ? round($totalAttendance / $total, 1) : 0;
        
        $uniqueCourses = $baseQuery()->distinct('course_id')->count('course_id');
        
        return [
            'total' => $total,
            'active' => $active,
            'completed' => $completed,
            'scheduled' => $scheduled,
            'total_attendance' => $totalAttendance,
            'avg_per_session' => $avgPerSession,
            'unique_courses' => $uniqueCourses,
        ];
    }
    
    private function getWeeklySchedule()
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        
        $sessions = AttendanceSession::with(['course'])
            ->whereBetween('start_at', [$startOfWeek, $endOfWeek])
            ->orderBy('start_at')
            ->get()
            ->groupBy(fn($s) => \Carbon\Carbon::parse($s->start_at)->format('l'));
        
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        
        $schedule = [];
        foreach ($days as $i => $day) {
            $schedule[] = [
                'day' => $dayNames[$i],
                'sessions' => ($sessions[$day] ?? collect())->map(fn($s) => [
                    'id' => $s->id,
                    'course' => $s->course?->nama ?? '-',
                    'meeting' => $s->meeting_number,
                    'time' => \Carbon\Carbon::parse($s->start_at)->format('H:i'),
                    'is_active' => $s->is_active,
                ])->values(),
            ];
        }
        
        return $schedule;
    }
    
    private function getCourseDistribution($dateFrom, $dateTo)
    {
        return MataKuliah::withCount([
            'sessions as session_count' => fn($q) => $q->whereBetween('start_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
        ])
        ->having('session_count', '>', 0)
        ->orderByDesc('session_count')
        ->get()
        ->map(fn($c) => [
            'name' => $c->nama,
            'count' => $c->session_count,
        ]);
    }
}
