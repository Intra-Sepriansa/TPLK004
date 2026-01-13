<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClassInsightsController extends Controller
{
    public function index(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        $courseId = $request->get('course_id');

        $courses = $dosen->courses()->get(['mata_kuliah.id', 'mata_kuliah.nama', 'mata_kuliah.sks']);

        $insights = null;
        if ($courseId && $dosen->courses()->where('mata_kuliah.id', $courseId)->exists()) {
            $insights = $this->getClassInsights($courseId);
        }

        // Course comparison
        $comparison = $this->getCourseComparison($dosen->id);

        return Inertia::render('dosen/class-insights', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'courses' => $courses,
            'selectedCourseId' => $courseId,
            'insights' => $insights,
            'comparison' => $comparison,
        ]);
    }

    private function getClassInsights(int $courseId): array
    {
        $course = MataKuliah::find($courseId);
        $sessions = AttendanceSession::where('course_id', $courseId)
            ->orderBy('meeting_number')
            ->get();

        $sessionIds = $sessions->pluck('id');

        // Attendance by meeting
        $byMeeting = $sessions->map(function ($session) {
            $logs = AttendanceLog::where('attendance_session_id', $session->id)->get();
            $total = $logs->count();
            $present = $logs->where('status', 'present')->count();
            $late = $logs->where('status', 'late')->count();

            return [
                'meeting' => $session->meeting_number,
                'title' => $session->title ?? "Pertemuan {$session->meeting_number}",
                'date' => $session->start_at?->format('d M'),
                'total' => $total,
                'present' => $present,
                'late' => $late,
                'absent' => $total > 0 ? $total - $present - $late : 0,
                'rate' => $total > 0 ? round((($present + $late) / $total) * 100, 1) : 0,
            ];
        })->toArray();

        // Students who are frequently late
        $frequentlyLate = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
            ->where('status', 'late')
            ->select('mahasiswa_id', DB::raw('COUNT(*) as late_count'))
            ->groupBy('mahasiswa_id')
            ->having('late_count', '>=', 2)
            ->orderByDesc('late_count')
            ->take(10)
            ->get()
            ->map(function ($row) use ($sessionIds) {
                $student = Mahasiswa::find($row->mahasiswa_id);
                $totalAttended = AttendanceLog::where('mahasiswa_id', $row->mahasiswa_id)
                    ->whereIn('attendance_session_id', $sessionIds)
                    ->count();

                return [
                    'id' => $row->mahasiswa_id,
                    'nama' => $student?->nama,
                    'nim' => $student?->nim,
                    'late_count' => $row->late_count,
                    'total_attended' => $totalAttended,
                    'late_percentage' => $totalAttended > 0 
                        ? round(($row->late_count / $totalAttended) * 100, 1) 
                        : 0,
                ];
            });

        // Students at risk (2+ absences)
        $atRisk = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
            ->where('status', 'rejected')
            ->select('mahasiswa_id', DB::raw('COUNT(*) as absent_count'))
            ->groupBy('mahasiswa_id')
            ->having('absent_count', '>=', 2)
            ->orderByDesc('absent_count')
            ->get()
            ->map(function ($row) {
                $student = Mahasiswa::find($row->mahasiswa_id);
                return [
                    'id' => $row->mahasiswa_id,
                    'nama' => $student?->nama,
                    'nim' => $student?->nim,
                    'absent_count' => $row->absent_count,
                    'can_take_uas' => $row->absent_count < 3,
                ];
            });

        // Top performers
        $topPerformers = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
            ->whereIn('status', ['present', 'late'])
            ->select('mahasiswa_id', DB::raw('COUNT(*) as attended'))
            ->groupBy('mahasiswa_id')
            ->orderByDesc('attended')
            ->take(5)
            ->get()
            ->map(function ($row) use ($sessions) {
                $student = Mahasiswa::find($row->mahasiswa_id);
                $presentCount = AttendanceLog::where('mahasiswa_id', $row->mahasiswa_id)
                    ->where('status', 'present')
                    ->count();

                return [
                    'id' => $row->mahasiswa_id,
                    'nama' => $student?->nama,
                    'nim' => $student?->nim,
                    'attended' => $row->attended,
                    'total_sessions' => $sessions->count(),
                    'rate' => $sessions->count() > 0 
                        ? round(($row->attended / $sessions->count()) * 100, 1) 
                        : 0,
                    'on_time_rate' => $row->attended > 0 
                        ? round(($presentCount / $row->attended) * 100, 1) 
                        : 0,
                ];
            });

        // Hourly distribution
        $hourlyDistribution = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
            ->selectRaw('HOUR(scanned_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();

        // Overall stats
        $totalLogs = AttendanceLog::whereIn('attendance_session_id', $sessionIds)->count();
        $presentLogs = AttendanceLog::whereIn('attendance_session_id', $sessionIds)
            ->whereIn('status', ['present', 'late'])->count();

        return [
            'course' => [
                'id' => $course->id,
                'nama' => $course->nama,
                'sks' => $course->sks,
            ],
            'summary' => [
                'total_sessions' => $sessions->count(),
                'total_students' => AttendanceLog::whereIn('attendance_session_id', $sessionIds)
                    ->distinct('mahasiswa_id')->count('mahasiswa_id'),
                'average_attendance' => $totalLogs > 0 
                    ? round(($presentLogs / $totalLogs) * 100, 1) 
                    : 0,
                'students_at_risk' => $atRisk->count(),
            ],
            'byMeeting' => $byMeeting,
            'frequentlyLate' => $frequentlyLate,
            'atRisk' => $atRisk,
            'topPerformers' => $topPerformers,
            'hourlyDistribution' => $hourlyDistribution,
        ];
    }

    private function getCourseComparison(int $dosenId): array
    {
        $dosen = \App\Models\Dosen::find($dosenId);
        $courses = $dosen->courses;

        return $courses->map(function ($course) {
            $sessions = AttendanceSession::where('course_id', $course->id)->pluck('id');
            $totalLogs = AttendanceLog::whereIn('attendance_session_id', $sessions)->count();
            $presentLogs = AttendanceLog::whereIn('attendance_session_id', $sessions)
                ->whereIn('status', ['present', 'late'])->count();

            return [
                'id' => $course->id,
                'nama' => $course->nama,
                'sks' => $course->sks,
                'total_sessions' => $sessions->count(),
                'attendance_rate' => $totalLogs > 0 
                    ? round(($presentLogs / $totalLogs) * 100, 1) 
                    : 0,
            ];
        })->sortByDesc('attendance_rate')->values()->toArray();
    }
}
