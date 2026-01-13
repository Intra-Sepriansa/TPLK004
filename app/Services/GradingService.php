<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Support\Collection;

class GradingService
{
    // Grade points configuration
    private const GRADE_POINTS = [
        'present' => 100,
        'late' => 75,
        'permit' => 50,
        'sick' => 50,
        'rejected' => 0,
        'absent' => 0,
    ];

    // Attendance weight in final grade (typically 10-20%)
    private const ATTENDANCE_WEIGHT = 0.10; // 10%

    public function calculateStudentGrade(int $mahasiswaId, int $courseId): array
    {
        $sessions = AttendanceSession::where('course_id', $courseId)
            ->orderBy('meeting_number')
            ->get();

        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereIn('attendance_session_id', $sessions->pluck('id'))
            ->get()
            ->keyBy('attendance_session_id');

        $totalSessions = $sessions->count();
        $attendedSessions = 0;
        $totalPoints = 0;
        $details = [];

        foreach ($sessions as $session) {
            $log = $logs->get($session->id);
            $status = $log?->status ?? 'absent';
            $points = self::GRADE_POINTS[$status] ?? 0;

            if (in_array($status, ['present', 'late', 'permit', 'sick'])) {
                $attendedSessions++;
            }

            $totalPoints += $points;

            $details[] = [
                'meeting' => $session->meeting_number,
                'title' => $session->title,
                'date' => $session->start_at?->format('d M Y'),
                'status' => $status,
                'points' => $points,
            ];
        }

        $averagePoints = $totalSessions > 0 ? round($totalPoints / $totalSessions, 2) : 0;
        $attendanceRate = $totalSessions > 0 ? round(($attendedSessions / $totalSessions) * 100, 1) : 0;
        $attendanceGrade = $this->pointsToGrade($averagePoints);

        return [
            'mahasiswa_id' => $mahasiswaId,
            'course_id' => $courseId,
            'total_sessions' => $totalSessions,
            'attended_sessions' => $attendedSessions,
            'attendance_rate' => $attendanceRate,
            'total_points' => $totalPoints,
            'average_points' => $averagePoints,
            'attendance_grade' => $attendanceGrade,
            'grade_letter' => $this->pointsToLetter($averagePoints),
            'weighted_contribution' => round($averagePoints * self::ATTENDANCE_WEIGHT, 2),
            'details' => $details,
            'can_take_uas' => $this->canTakeUas($details),
        ];
    }

    public function calculateClassGrades(int $courseId): array
    {
        $course = MataKuliah::find($courseId);
        $sessions = AttendanceSession::where('course_id', $courseId)->get();
        
        // Get all students who have attended at least one session
        $studentIds = AttendanceLog::whereIn('attendance_session_id', $sessions->pluck('id'))
            ->distinct('mahasiswa_id')
            ->pluck('mahasiswa_id');

        $grades = [];
        $summary = [
            'total_students' => $studentIds->count(),
            'total_sessions' => $sessions->count(),
            'grade_distribution' => ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0],
            'average_attendance_rate' => 0,
            'students_at_risk' => 0,
        ];

        $totalRate = 0;

        foreach ($studentIds as $studentId) {
            $grade = $this->calculateStudentGrade($studentId, $courseId);
            $student = Mahasiswa::find($studentId);
            
            $grade['nama'] = $student?->nama;
            $grade['nim'] = $student?->nim;
            
            $grades[] = $grade;

            $totalRate += $grade['attendance_rate'];
            $summary['grade_distribution'][$grade['grade_letter']]++;
            
            if (!$grade['can_take_uas']) {
                $summary['students_at_risk']++;
            }
        }

        $summary['average_attendance_rate'] = $studentIds->count() > 0 
            ? round($totalRate / $studentIds->count(), 1) 
            : 0;

        // Sort by average points descending
        usort($grades, fn($a, $b) => $b['average_points'] <=> $a['average_points']);

        return [
            'course' => [
                'id' => $course?->id,
                'nama' => $course?->nama,
                'sks' => $course?->sks,
            ],
            'summary' => $summary,
            'grades' => $grades,
        ];
    }

    public function exportGrades(int $courseId, string $format = 'array'): array|string
    {
        $data = $this->calculateClassGrades($courseId);
        
        if ($format === 'csv') {
            return $this->toCsv($data);
        }

        return $data;
    }

    public function getStudentReport(int $mahasiswaId): array
    {
        $student = Mahasiswa::find($mahasiswaId);
        
        // Get all courses the student has attended
        $courseIds = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->join('attendance_sessions', 'attendance_logs.attendance_session_id', '=', 'attendance_sessions.id')
            ->distinct('attendance_sessions.course_id')
            ->pluck('attendance_sessions.course_id');

        $courses = [];
        $overallStats = [
            'total_sessions' => 0,
            'attended_sessions' => 0,
            'total_points' => 0,
            'courses_at_risk' => 0,
        ];

        foreach ($courseIds as $courseId) {
            $grade = $this->calculateStudentGrade($mahasiswaId, $courseId);
            $course = MataKuliah::find($courseId);
            
            $grade['course_name'] = $course?->nama;
            $grade['course_sks'] = $course?->sks;
            
            $courses[] = $grade;

            $overallStats['total_sessions'] += $grade['total_sessions'];
            $overallStats['attended_sessions'] += $grade['attended_sessions'];
            $overallStats['total_points'] += $grade['total_points'];
            
            if (!$grade['can_take_uas']) {
                $overallStats['courses_at_risk']++;
            }
        }

        $overallStats['overall_rate'] = $overallStats['total_sessions'] > 0
            ? round(($overallStats['attended_sessions'] / $overallStats['total_sessions']) * 100, 1)
            : 0;

        return [
            'student' => [
                'id' => $student?->id,
                'nama' => $student?->nama,
                'nim' => $student?->nim,
            ],
            'overall_stats' => $overallStats,
            'courses' => $courses,
            'generated_at' => now()->toDateTimeString(),
        ];
    }

    public function overrideAttendance(int $logId, string $newStatus, int $overrideBy, string $reason): AttendanceLog
    {
        $log = AttendanceLog::findOrFail($logId);
        
        // Store original status if not already overridden
        if (!$log->original_status) {
            $log->original_status = $log->status;
        }

        $log->status = $newStatus;
        $log->grade_points = self::GRADE_POINTS[$newStatus] ?? 0;
        $log->override_by = $overrideBy;
        $log->override_reason = $reason;
        $log->save();

        return $log;
    }

    private function pointsToGrade(float $points): float
    {
        // Convert 0-100 scale to 0-4 GPA scale
        if ($points >= 85) return 4.0;
        if ($points >= 75) return 3.5;
        if ($points >= 65) return 3.0;
        if ($points >= 55) return 2.5;
        if ($points >= 45) return 2.0;
        if ($points >= 35) return 1.5;
        return 0.0;
    }

    private function pointsToLetter(float $points): string
    {
        if ($points >= 85) return 'A';
        if ($points >= 70) return 'B';
        if ($points >= 55) return 'C';
        if ($points >= 40) return 'D';
        return 'E';
    }

    private function canTakeUas(array $details): bool
    {
        // UNPAM rule: 3x absent = cannot take UAS
        $absentCount = collect($details)
            ->filter(fn($d) => in_array($d['status'], ['rejected', 'absent']))
            ->count();

        return $absentCount < 3;
    }

    private function toCsv(array $data): string
    {
        $lines = [];
        
        // Header
        $lines[] = implode(',', [
            'NIM', 'Nama', 'Total Sesi', 'Hadir', 'Rate (%)', 
            'Poin', 'Nilai', 'Grade', 'Status UAS'
        ]);

        // Data rows
        foreach ($data['grades'] as $grade) {
            $lines[] = implode(',', [
                $grade['nim'],
                '"' . $grade['nama'] . '"',
                $grade['total_sessions'],
                $grade['attended_sessions'],
                $grade['attendance_rate'],
                $grade['average_points'],
                $grade['attendance_grade'],
                $grade['grade_letter'],
                $grade['can_take_uas'] ? 'Boleh' : 'Tidak Boleh',
            ]);
        }

        return implode("\n", $lines);
    }
}
