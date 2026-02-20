<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ClassInsightsController extends Controller
{
    public function index(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();

        // Get all courses taught by dosen
        $courses = MataKuliah::where('dosen_id', $dosen->id)
            ->with(['attendanceSessions' => function($query) {
                $query->orderBy('start_at', 'asc');
            }, 'attendanceSessions.logs.mahasiswa'])
            ->get();

        $insights = $courses->map(function ($course) {
            return $this->calculateCourseInsights($course);
        });

        $stats = $this->calculateOverallStats($insights);

        return Inertia::render('dosen/class-insights', [
            'dosen' => $dosen,
            'courses' => $insights,
            'selectedCourse' => $request->course_id
                ? $insights->firstWhere('course_id', intval($request->course_id))
                : null,
            'stats' => $stats,
        ]);
    }

    private function calculateCourseInsights(MataKuliah $course): array
    {
        $sessions = $course->attendanceSessions;
        $totalSessions = $sessions->count();
        $completedSessions = $sessions->where('is_active', false)->count();

        // Get unique students from logs across all sessions to define total students
        // Alternatively, use a relation if available (e.g. course->students)
        // For now, let's assume students are those who have at least one log or enrolled.
        // If there's noEnrollment model, we can infer from logs or assume a fixed number if available.
        // Let's use unique mahasiswa_id from logs as a proxy for "enrolled students" if enrollment table missing.
        // Ideally, check for enrollment. Since User didn't share Enrollment model, we infer.
        // But wait, GradingDetailController used $attendanceRecords count.
        // Let's count unique students encountered in logs.
        $studentIds = $sessions->flatMap(function ($session) {
            return $session->logs->pluck('mahasiswa_id');
        })->unique();
        $totalStudents = $studentIds->count();

        // Calculate attendance rates per session
        $attendanceRates = [];
        $attendanceBySession = [];

        foreach ($sessions as $index => $session) {
            $logs = $session->logs;
            // If totalStudents is 0 (no logs yet), avoid division by zero
            // But if totalStudents determined by logs, then for a session with 0 logs, rate is 0.
            // However, we should probably use the max number of students seen in any session if enrollment is unknown.
            // Let's stick to $totalStudents calculated above.

            $present = $logs->whereIn('status', ['present', 'late'])->count();
            $late = $logs->where('status', 'late')->count();
            $absent = $logs->whereIn('status', ['absent', 'alpha'])->count();

            // Refine totalStudents: if a session has more logs than unique students found so far? Unlikely.
            // If totalStudents is 0, rate is 0.
            $rate = $totalStudents > 0 ? ($present / $totalStudents) * 100 : 0;
            
            $attendanceRates[] = $rate;

            $attendanceBySession[] = [
                'session_number' => $session->meeting_number ?? ($index + 1),
                'date' => $session->start_at ? $session->start_at->format('d M') : 'TBA',
                'attendance_rate' => round($rate, 1),
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
            ];
        }

        $avgRate = count($attendanceRates) > 0
            ? array_sum($attendanceRates) / count($attendanceRates)
            : 0;

        // Calculate trend
        $trend = $this->calculateTrend($attendanceRates);

        // Calculate Grade Distribution (based on attendance rate for each student)
        $studentPerformance = [];
        foreach ($studentIds as $sId) {
            $attended = 0;
            foreach ($sessions as $session) {
                // Check if student present in this session
                $log = $session->logs->where('mahasiswa_id', $sId)->first();
                if ($log && in_array($log->status, ['present', 'late'])) {
                    $attended++;
                }
            }
            $rate = $totalSessions > 0 ? ($attended / $totalSessions) * 100 : 0;
            // Get student name/nim from first log found
            $student = null;
            foreach ($sessions as $session) {
                $log = $session->logs->where('mahasiswa_id', $sId)->first();
                if ($log && $log->mahasiswa) {
                    $student = $log->mahasiswa;
                    break;
                }
            }
            
            if ($student) {
                $studentPerformance[] = [
                    'mahasiswa_id' => $sId,
                    'nama' => $student->nama,
                    'nim' => $student->nim,
                    'attendance_rate' => round($rate, 1),
                ];
            }
        }

        // Sort performers
        usort($studentPerformance, function ($a, $b) {
            return $b['attendance_rate'] <=> $a['attendance_rate'];
        });

        // Grade Distribution
        $gradeDist = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0];
        foreach ($studentPerformance as $p) {
            $r = $p['attendance_rate'];
            if ($r >= 85) $gradeDist['A']++;
            else if ($r >= 75) $gradeDist['B']++;
            else if ($r >= 60) $gradeDist['C']++;
            else if ($r >= 50) $gradeDist['D']++;
            else $gradeDist['E']++;
        }

        $atRiskCount = count(array_filter($studentPerformance, fn($p) => $p['attendance_rate'] < 75));
        $perfectAttendance = count(array_filter($studentPerformance, fn($p) => $p['attendance_rate'] == 100));

        // Next session
        $nextSession = $sessions->where('start_at', '>', now())->sortBy('start_at')->first();

        return [
            'course_id' => $course->id,
            'course_name' => $course->nama,
            'course_code' => $course->kode ?? 'KB-' . $course->id,
            'sks' => $course->sks,
            'total_students' => $totalStudents,
            'total_sessions' => $totalSessions,
            'completed_sessions' => $completedSessions,
            'average_attendance_rate' => round($avgRate, 1),
            'trend' => $trend['direction'],
            'trend_percentage' => $trend['percentage'],
            'grade_distribution' => $gradeDist,
            'at_risk_students' => $atRiskCount,
            'perfect_attendance' => $perfectAttendance,
            'last_session_date' => $sessions->where('start_at', '<=', now())->sortByDesc('start_at')->first()?->start_at?->format('d M Y'),
            'next_session_date' => $nextSession ? $nextSession->start_at->format('d M Y') : '-',
            'attendance_by_session' => $attendanceBySession,
            'top_performers' => array_slice($studentPerformance, 0, 5),
            'bottom_performers' => array_slice(array_reverse($studentPerformance), 0, 5),
        ];
    }

    private function calculateTrend(array $rates): array
    {
        if (count($rates) < 2) {
            return ['direction' => 'stable', 'percentage' => 0];
        }

        // Compare average of last 3 sessions vs previous 3
        // Or simple: compare last session vs average of previous
        
        $lastRate = end($rates);
        $prevRates = array_slice($rates, 0, -1);
        
        if (empty($prevRates)) {
             return ['direction' => 'stable', 'percentage' => 0];
        }

        $prevAvg = array_sum($prevRates) / count($prevRates);
        
        if ($prevAvg == 0) return ['direction' => 'up', 'percentage' => 100];

        $diff = $lastRate - $prevAvg;
        $percentage = round(($diff / $prevAvg) * 100, 1);

        $direction = 'stable';
        if ($percentage > 2) $direction = 'up';
        if ($percentage < -2) $direction = 'down';

        return ['direction' => $direction, 'percentage' => $percentage];
    }

    private function calculateOverallStats($insights)
    {
        return [
            'total_courses' => $insights->count(),
            'total_students' => $insights->sum('total_students'),
            'average_attendance' => $insights->avg('average_attendance_rate') ? round($insights->avg('average_attendance_rate'), 1) : 0,
            'total_sessions' => $insights->sum('total_sessions'),
            'courses_above_target' => $insights->where('average_attendance_rate', '>=', 75)->count(),
            'courses_below_target' => $insights->where('average_attendance_rate', '<', 75)->count(),
        ];
    }

    public function exportCsv(Request $request)
    {
        $courseId = $request->course_id;
        $course = MataKuliah::with(['attendanceSessions.logs.mahasiswa'])->findOrFail($courseId);
        $insights = $this->calculateCourseInsights($course);
        
        $filename = "class-insights-" . ($course->kode ?? 'course') . "-" . date('Y-m-d') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];
        
        $callback = function() use ($insights) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, [
                'Mata Kuliah', 'Kode', 'SKS', 'Total Mahasiswa', 'Total Sesi', 
                'Rata-rata Kehadiran', 'Trend', 'Mahasiswa At-Risk'
            ]);
            
            // Data
            fputcsv($file, [
                $insights['course_name'],
                $insights['course_code'],
                $insights['sks'],
                $insights['total_students'],
                $insights['total_sessions'],
                $insights['average_attendance_rate'] . '%',
                $insights['trend'],
                $insights['at_risk_students'],
            ]);

            fputcsv($file, []); // Empty line
            fputcsv($file, ['Sesi', 'Tanggal', 'Kehadiran (%)', 'Hadir', 'Telat', 'Absen']);

            foreach ($insights['attendance_by_session'] as $session) {
                fputcsv($file, [
                    $session['session_number'],
                    $session['date'],
                    $session['attendance_rate'],
                    $session['present'],
                    $session['late'],
                    $session['absent'],
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $courseId = $request->course_id;
        $course = MataKuliah::with(['attendanceSessions.logs.mahasiswa'])->findOrFail($courseId);
        $insights = $this->calculateCourseInsights($course);
        
        $pdf = Pdf::loadView('dosen.reports.class-insights', [
            'course' => $course,
            'insights' => $insights,
            'dosen' => Auth::guard('dosen')->user(),
            'date' => now()->format('d F Y')
        ]);
        
        return $pdf->download("class-insights-{$insights['course_code']}.pdf");
    }

    public function exportExcel(Request $request)
    {
        return $this->exportCsv($request);
    }

    public function exportJson(Request $request)
    {
        $courseId = $request->course_id;
        $course = MataKuliah::with(['attendanceSessions.logs.mahasiswa'])->findOrFail($courseId);
        $insights = $this->calculateCourseInsights($course);
        
        return response()->json($insights);
    }
}
