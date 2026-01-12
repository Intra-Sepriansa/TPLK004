<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\StudentActivityScore;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AnalyticsController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $mataKuliahId = $request->get('mata_kuliah_id');
        
        // Get all mata kuliah for filter
        $mataKuliahList = MataKuliah::with('dosen')->get()->map(fn($mk) => [
            'id' => $mk->id,
            'nama' => $mk->nama,
            'dosen' => $mk->dosen?->nama ?? '-',
        ])->toArray();

        // Recalculate scores for all students
        $this->recalculateAllScores($mataKuliahId);

        // Get risk statistics
        $riskStats = $this->getRiskStatistics($mataKuliahId);
        
        // Get students at risk (danger status)
        $studentsAtRisk = $this->getStudentsAtRisk($mataKuliahId);
        
        // Get course comparison data
        $courseComparison = $this->getCourseComparison();
        
        // Get attendance trends (last 8 sessions)
        $attendanceTrends = $this->getAttendanceTrends($mataKuliahId);
        
        // Get overall statistics
        $overallStats = $this->getOverallStats();

        return Inertia::render('admin/analytics', [
            'mataKuliahList' => $mataKuliahList,
            'riskStats' => $riskStats,
            'studentsAtRisk' => $studentsAtRisk,
            'courseComparison' => $courseComparison,
            'attendanceTrends' => $attendanceTrends,
            'overallStats' => $overallStats,
            'filters' => [
                'mata_kuliah_id' => $mataKuliahId,
            ],
        ]);
    }

    private function recalculateAllScores(?int $mataKuliahId = null): void
    {
        $mahasiswaIds = Mahasiswa::pluck('id');
        
        if ($mataKuliahId) {
            foreach ($mahasiswaIds as $id) {
                StudentActivityScore::recalculate($id, $mataKuliahId);
            }
        } else {
            $mataKuliahIds = MataKuliah::pluck('id');
            foreach ($mahasiswaIds as $mhsId) {
                foreach ($mataKuliahIds as $mkId) {
                    StudentActivityScore::recalculate($mhsId, $mkId);
                }
            }
        }
    }

    private function getRiskStatistics(?int $mataKuliahId = null): array
    {
        $query = StudentActivityScore::query();
        
        if ($mataKuliahId) {
            $query->where('mata_kuliah_id', $mataKuliahId);
        }

        $safe = (clone $query)->where('risk_status', 'safe')->count();
        $warning = (clone $query)->where('risk_status', 'warning')->count();
        $danger = (clone $query)->where('risk_status', 'danger')->count();
        $total = $safe + $warning + $danger;

        return [
            'safe' => $safe,
            'warning' => $warning,
            'danger' => $danger,
            'total' => $total,
            'safe_percentage' => $total > 0 ? round(($safe / $total) * 100, 1) : 0,
            'warning_percentage' => $total > 0 ? round(($warning / $total) * 100, 1) : 0,
            'danger_percentage' => $total > 0 ? round(($danger / $total) * 100, 1) : 0,
        ];
    }

    private function getStudentsAtRisk(?int $mataKuliahId = null): array
    {
        $query = StudentActivityScore::with(['mahasiswa', 'mataKuliah'])
            ->whereIn('risk_status', ['warning', 'danger'])
            ->orderByRaw("FIELD(risk_status, 'danger', 'warning')")
            ->orderBy('absent_count', 'desc');

        if ($mataKuliahId) {
            $query->where('mata_kuliah_id', $mataKuliahId);
        }

        return $query->limit(20)->get()->map(fn($score) => [
            'id' => $score->id,
            'mahasiswa_id' => $score->mahasiswa_id,
            'nama' => $score->mahasiswa?->nama ?? '-',
            'nim' => $score->mahasiswa?->nim ?? '-',
            'mata_kuliah' => $score->mataKuliah?->nama ?? '-',
            'total_sessions' => $score->total_sessions,
            'present_count' => $score->present_count,
            'late_count' => $score->late_count,
            'permit_count' => $score->permit_count,
            'absent_count' => $score->absent_count,
            'attendance_percentage' => $score->attendance_percentage,
            'activity_score' => $score->activity_score,
            'risk_status' => $score->risk_status,
        ])->toArray();
    }

    private function getCourseComparison(): array
    {
        return MataKuliah::with('dosen')->get()->map(function ($mk) {
            $scores = StudentActivityScore::where('mata_kuliah_id', $mk->id)->get();
            
            $avgAttendance = $scores->avg('attendance_percentage') ?? 0;
            $avgActivityScore = $scores->avg('activity_score') ?? 0;
            $dangerCount = $scores->where('risk_status', 'danger')->count();
            $totalStudents = $scores->count();

            return [
                'id' => $mk->id,
                'nama' => $mk->nama,
                'dosen' => $mk->dosen?->nama ?? '-',
                'avg_attendance' => round($avgAttendance, 1),
                'avg_activity_score' => round($avgActivityScore, 1),
                'danger_count' => $dangerCount,
                'total_students' => $totalStudents,
            ];
        })->toArray();
    }

    private function getAttendanceTrends(?int $mataKuliahId = null): array
    {
        $query = AttendanceSession::query()
            ->orderBy('start_at', 'desc')
            ->limit(8);

        if ($mataKuliahId) {
            $query->where('course_id', $mataKuliahId);
        }

        return $query->get()->reverse()->values()->map(function ($session) {
            $logs = AttendanceLog::where('attendance_session_id', $session->id)->get();
            $totalMahasiswa = Mahasiswa::count();
            
            $present = $logs->where('status', 'present')->count();
            $late = $logs->where('status', 'late')->count();
            $absent = $totalMahasiswa - $present - $late;

            return [
                'date' => $session->start_at->format('d/m'),
                'full_date' => $session->start_at->format('Y-m-d'),
                'present' => $present,
                'late' => $late,
                'absent' => max(0, $absent),
                'total' => $totalMahasiswa,
                'attendance_rate' => $totalMahasiswa > 0 ? round((($present + $late) / $totalMahasiswa) * 100, 1) : 0,
            ];
        })->toArray();
    }

    private function getOverallStats(): array
    {
        $totalMahasiswa = Mahasiswa::count();
        $totalSessions = AttendanceSession::count();
        $totalLogs = AttendanceLog::count();
        
        $presentLogs = AttendanceLog::where('status', 'present')->count();
        $lateLogs = AttendanceLog::where('status', 'late')->count();
        
        $avgAttendanceRate = $totalLogs > 0 
            ? round((($presentLogs + $lateLogs) / $totalLogs) * 100, 1) 
            : 0;

        $dangerStudents = StudentActivityScore::where('risk_status', 'danger')
            ->distinct('mahasiswa_id')
            ->count('mahasiswa_id');

        return [
            'total_mahasiswa' => $totalMahasiswa,
            'total_sessions' => $totalSessions,
            'avg_attendance_rate' => $avgAttendanceRate,
            'danger_students' => $dangerStudents,
        ];
    }
}
