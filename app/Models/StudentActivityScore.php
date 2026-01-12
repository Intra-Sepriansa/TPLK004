<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentActivityScore extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'mata_kuliah_id',
        'total_sessions',
        'present_count',
        'late_count',
        'permit_count',
        'absent_count',
        'attendance_percentage',
        'activity_score',
        'risk_status',
    ];

    protected $casts = [
        'attendance_percentage' => 'decimal:2',
        'activity_score' => 'decimal:2',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class);
    }

    /**
     * Recalculate activity score for a student in a course
     */
    public static function recalculate(int $mahasiswaId, int $mataKuliahId): self
    {
        $score = self::firstOrCreate([
            'mahasiswa_id' => $mahasiswaId,
            'mata_kuliah_id' => $mataKuliahId,
        ]);

        // Get all sessions for this course (attendance_sessions uses course_id)
        $sessions = AttendanceSession::where('course_id', $mataKuliahId)->get();
        $totalSessions = $sessions->count();

        if ($totalSessions === 0) {
            return $score;
        }

        // Count attendance
        $presentCount = 0;
        $lateCount = 0;
        $permitCount = 0;
        $absentCount = 0;

        foreach ($sessions as $session) {
            $log = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
                ->where('attendance_session_id', $session->id)
                ->first();

            if ($log) {
                if ($log->status === 'present') {
                    $presentCount++;
                } elseif ($log->status === 'late') {
                    $lateCount++;
                }
            } else {
                // Check if has approved permit
                $permit = AttendancePermit::where('mahasiswa_id', $mahasiswaId)
                    ->where('attendance_session_id', $session->id)
                    ->where('status', 'approved')
                    ->first();

                if ($permit) {
                    $permitCount++;
                } else {
                    $absentCount++;
                }
            }
        }

        // Calculate percentage (hadir + terlambat + izin disetujui)
        $attendedSessions = $presentCount + $lateCount + $permitCount;
        $attendancePercentage = ($attendedSessions / $totalSessions) * 100;

        // Calculate activity score
        // Hadir = 100%, Terlambat = 80%, Izin = 60%, Tidak hadir = 0%
        $activityScore = 0;
        if ($totalSessions > 0) {
            $activityScore = (
                ($presentCount * 100) +
                ($lateCount * 80) +
                ($permitCount * 60) +
                ($absentCount * 0)
            ) / $totalSessions;
        }

        // Determine risk status based on UNPAM rules (3x absent = danger)
        $riskStatus = 'safe';
        if ($absentCount >= 3) {
            $riskStatus = 'danger'; // Tidak bisa ikut UAS
        } elseif ($absentCount >= 2) {
            $riskStatus = 'warning'; // Peringatan
        }

        $score->update([
            'total_sessions' => $totalSessions,
            'present_count' => $presentCount,
            'late_count' => $lateCount,
            'permit_count' => $permitCount,
            'absent_count' => $absentCount,
            'attendance_percentage' => $attendancePercentage,
            'activity_score' => $activityScore,
            'risk_status' => $riskStatus,
        ]);

        return $score;
    }

    /**
     * Recalculate all students for a course
     */
    public static function recalculateForCourse(int $mataKuliahId): void
    {
        $mahasiswaIds = Mahasiswa::pluck('id');
        
        foreach ($mahasiswaIds as $mahasiswaId) {
            self::recalculate($mahasiswaId, $mataKuliahId);
        }
    }
}
