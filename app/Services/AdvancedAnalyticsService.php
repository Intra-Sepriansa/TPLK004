<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdvancedAnalyticsService
{
    /**
     * Predictive Analytics - Predict attendance probability
     */
    public function predictAttendance($mahasiswaId, $courseId)
    {
        $history = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereHas('session', function($q) use ($courseId) {
                $q->where('mata_kuliah_id', $courseId);
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        if ($history->count() < 3) {
            return [
                'probability' => 0.5,
                'confidence' => 'low',
                'message' => 'Insufficient data for prediction',
            ];
        }

        $presentCount = $history->where('status', 'hadir')->count();
        $totalCount = $history->count();
        $probability = $presentCount / $totalCount;

        // Factor in recent trend
        $recentHistory = $history->take(5);
        $recentPresentCount = $recentHistory->where('status', 'hadir')->count();
        $recentProbability = $recentPresentCount / $recentHistory->count();

        // Weighted average (60% recent, 40% overall)
        $finalProbability = ($recentProbability * 0.6) + ($probability * 0.4);

        return [
            'probability' => round($finalProbability * 100, 2),
            'confidence' => $totalCount >= 10 ? 'high' : 'medium',
            'trend' => $recentProbability > $probability ? 'improving' : 'declining',
            'message' => $this->getPredictionMessage($finalProbability),
        ];
    }

    /**
     * Attendance Heatmap - Get attendance patterns by day and hour
     */
    public function getAttendanceHeatmap($courseId = null, $startDate = null, $endDate = null)
    {
        $query = AttendanceLog::query()
            ->where('status', 'hadir')
            ->whereBetween('created_at', [
                $startDate ?? now()->subDays(30),
                $endDate ?? now()
            ]);

        if ($courseId) {
            $query->whereHas('session', function($q) use ($courseId) {
                $q->where('mata_kuliah_id', $courseId);
            });
        }

        $data = $query->get()->groupBy(function($item) {
            return Carbon::parse($item->check_in_at)->format('w'); // Day of week (0-6)
        })->map(function($dayGroup) {
            return $dayGroup->groupBy(function($item) {
                return Carbon::parse($item->check_in_at)->format('H'); // Hour (0-23)
            })->map->count();
        });

        // Format for heatmap
        $heatmap = [];
        $days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        
        for ($day = 0; $day < 7; $day++) {
            for ($hour = 7; $hour < 18; $hour++) { // 7 AM to 6 PM
                $heatmap[] = [
                    'day' => $days[$day],
                    'hour' => $hour,
                    'count' => $data[$day][$hour] ?? 0,
                ];
            }
        }

        return $heatmap;
    }

    /**
     * Attendance Pattern Recognition
     */
    public function recognizeAttendancePatterns($mahasiswaId)
    {
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->with('session.mataKuliah')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $patterns = [
            'preferred_days' => $this->getPreferredDays($logs),
            'preferred_times' => $this->getPreferredTimes($logs),
            'attendance_streak' => $this->calculateStreak($logs),
            'punctuality_score' => $this->calculatePunctuality($logs),
            'consistency_score' => $this->calculateConsistency($logs),
        ];

        return $patterns;
    }

    /**
     * Risk Analysis - Identify at-risk students
     */
    public function getRiskAnalysis($courseId = null)
    {
        $query = Mahasiswa::with(['attendanceLogs' => function($q) use ($courseId) {
            if ($courseId) {
                $q->whereHas('session', function($sq) use ($courseId) {
                    $sq->where('mata_kuliah_id', $courseId);
                });
            }
            $q->where('created_at', '>=', now()->subDays(30));
        }]);

        $students = $query->get()->map(function($student) {
            $totalSessions = $student->attendanceLogs->count();
            $presentCount = $student->attendanceLogs->where('status', 'hadir')->count();
            $attendanceRate = $totalSessions > 0 ? ($presentCount / $totalSessions) * 100 : 0;

            $riskLevel = 'safe';
            if ($attendanceRate < 60) {
                $riskLevel = 'danger';
            } elseif ($attendanceRate < 80) {
                $riskLevel = 'warning';
            }

            return [
                'mahasiswa' => $student,
                'attendance_rate' => round($attendanceRate, 2),
                'total_sessions' => $totalSessions,
                'present_count' => $presentCount,
                'risk_level' => $riskLevel,
            ];
        });

        return [
            'safe' => $students->where('risk_level', 'safe')->values(),
            'warning' => $students->where('risk_level', 'warning')->values(),
            'danger' => $students->where('risk_level', 'danger')->values(),
        ];
    }

    /**
     * Attendance Forecast - Predict future attendance trends
     */
    public function forecastAttendance($courseId, $days = 7)
    {
        $historicalData = AttendanceLog::whereHas('session', function($q) use ($courseId) {
            $q->where('mata_kuliah_id', $courseId);
        })
        ->where('created_at', '>=', now()->subDays(30))
        ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        if ($historicalData->count() < 7) {
            return [
                'forecast' => [],
                'confidence' => 'low',
                'message' => 'Insufficient historical data',
            ];
        }

        // Simple moving average forecast
        $forecast = [];
        $avgCount = $historicalData->avg('count');
        
        for ($i = 1; $i <= $days; $i++) {
            $date = now()->addDays($i);
            $forecast[] = [
                'date' => $date->format('Y-m-d'),
                'predicted_count' => round($avgCount),
                'confidence' => 'medium',
            ];
        }

        return [
            'forecast' => $forecast,
            'confidence' => 'medium',
            'historical_average' => round($avgCount, 2),
        ];
    }

    // Helper methods
    private function getPredictionMessage($probability)
    {
        if ($probability >= 0.8) return 'Sangat mungkin hadir';
        if ($probability >= 0.6) return 'Kemungkinan hadir';
        if ($probability >= 0.4) return 'Tidak pasti';
        return 'Kemungkinan tidak hadir';
    }

    private function getPreferredDays($logs)
    {
        return $logs->groupBy(function($log) {
            return Carbon::parse($log->check_in_at)->format('l');
        })->map->count()->sortDesc()->take(3)->keys()->toArray();
    }

    private function getPreferredTimes($logs)
    {
        return $logs->groupBy(function($log) {
            $hour = Carbon::parse($log->check_in_at)->format('H');
            if ($hour < 12) return 'Pagi (07:00-12:00)';
            if ($hour < 15) return 'Siang (12:00-15:00)';
            return 'Sore (15:00-18:00)';
        })->map->count()->sortDesc()->keys()->first();
    }

    private function calculateStreak($logs)
    {
        $streak = 0;
        $currentDate = now()->startOfDay();
        
        foreach ($logs as $log) {
            $logDate = Carbon::parse($log->check_in_at)->startOfDay();
            if ($logDate->eq($currentDate) && $log->status === 'hadir') {
                $streak++;
                $currentDate->subDay();
            } else {
                break;
            }
        }
        
        return $streak;
    }

    private function calculatePunctuality($logs)
    {
        $onTimeCount = $logs->filter(function($log) {
            return $log->status === 'hadir' && !$log->is_late;
        })->count();
        
        $totalPresent = $logs->where('status', 'hadir')->count();
        
        return $totalPresent > 0 ? round(($onTimeCount / $totalPresent) * 100, 2) : 0;
    }

    private function calculateConsistency($logs)
    {
        $presentCount = $logs->where('status', 'hadir')->count();
        $totalCount = $logs->count();
        
        return $totalCount > 0 ? round(($presentCount / $totalCount) * 100, 2) : 0;
    }
}
