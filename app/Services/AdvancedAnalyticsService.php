<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\DailyMetric;
use App\Models\Prediction;
use App\Models\Anomaly;
use App\Models\Mahasiswa;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AdvancedAnalyticsService
{
    public function trackEvent(string $eventType, $user, array $properties = []): void
    {
        AnalyticsEvent::track($eventType, $user, $properties);
    }

    public function generateDailyMetrics(): void
    {
        $date = now()->toDateString();

        // Attendance Rate
        $this->calculateAttendanceRate($date);

        // Active Users
        $this->calculateActiveUsers($date);

        // Engagement Score
        $this->calculateEngagementScore($date);

        // Course Performance
        $this->calculateCoursePerformance($date);
    }

    private function calculateAttendanceRate(string $date): void
    {
        $totalLogs = AttendanceLog::whereDate('created_at', $date)->count();
        $presentLogs = AttendanceLog::whereDate('created_at', $date)
            ->whereIn('status', ['present', 'late'])
            ->count();

        $rate = $totalLogs > 0 ? ($presentLogs / $totalLogs) * 100 : 0;

        DailyMetric::record('attendance_rate', $rate);
    }

    private function calculateActiveUsers(string $date): void
    {
        $activeStudents = Mahasiswa::whereDate('last_activity_at', $date)->count();
        DailyMetric::record('active_students', $activeStudents);
    }

    private function calculateEngagementScore(string $date): void
    {
        $events = AnalyticsEvent::whereDate('created_at', $date)->count();
        $users = AnalyticsEvent::whereDate('created_at', $date)
            ->distinct('user_id')
            ->count();

        $score = $users > 0 ? $events / $users : 0;
        DailyMetric::record('engagement_score', $score);
    }

    private function calculateCoursePerformance(string $date): void
    {
        $courses = \App\Models\Course::all();

        foreach ($courses as $course) {
            $sessions = AttendanceSession::where('course_id', $course->id)
                ->whereDate('created_at', '<=', $date)
                ->count();

            $attendance = AttendanceLog::whereHas('session', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
            ->whereDate('created_at', $date)
            ->whereIn('status', ['present', 'late'])
            ->count();

            $rate = $sessions > 0 ? ($attendance / $sessions) * 100 : 0;

            DailyMetric::record(
                'course_attendance_rate',
                $rate,
                'course',
                (string) $course->id
            );
        }
    }

    public function predictAttendance(Mahasiswa $mahasiswa, $date): Prediction
    {
        // Get historical data
        $historicalRate = $this->getHistoricalAttendanceRate($mahasiswa);
        $recentTrend = $this->getRecentTrend($mahasiswa);
        $dayOfWeek = date('N', strtotime($date));

        // Simple prediction algorithm
        $baseRate = $historicalRate;
        $trendAdjustment = $recentTrend * 0.3;
        $dayAdjustment = $this->getDayOfWeekAdjustment($mahasiswa, $dayOfWeek);

        $predictedValue = min(100, max(0, $baseRate + $trendAdjustment + $dayAdjustment));
        $confidence = $this->calculateConfidence($mahasiswa);

        return Prediction::create([
            'prediction_type' => 'attendance',
            'subject_type' => Mahasiswa::class,
            'subject_id' => $mahasiswa->id,
            'prediction_date' => $date,
            'predicted_value' => $predictedValue,
            'confidence_score' => $confidence,
            'factors' => [
                'historical_rate' => $historicalRate,
                'recent_trend' => $recentTrend,
                'day_of_week' => $dayOfWeek,
            ],
        ]);
    }

    private function getHistoricalAttendanceRate(Mahasiswa $mahasiswa): float
    {
        $total = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)->count();
        $present = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('status', ['present', 'late'])
            ->count();

        return $total > 0 ? ($present / $total) * 100 : 0;
    }

    private function getRecentTrend(Mahasiswa $mahasiswa): float
    {
        $recent = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->whereIn('status', ['present', 'late'])
            ->count();

        $older = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])
            ->whereIn('status', ['present', 'late'])
            ->count();

        return $recent - $older;
    }

    private function getDayOfWeekAdjustment(Mahasiswa $mahasiswa, int $dayOfWeek): float
    {
        // Calculate attendance rate for specific day of week
        $rate = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->whereRaw('DAYOFWEEK(created_at) = ?', [$dayOfWeek])
            ->whereIn('status', ['present', 'late'])
            ->count();

        $total = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->whereRaw('DAYOFWEEK(created_at) = ?', [$dayOfWeek])
            ->count();

        $dayRate = $total > 0 ? ($rate / $total) * 100 : 0;
        $overallRate = $this->getHistoricalAttendanceRate($mahasiswa);

        return $dayRate - $overallRate;
    }

    private function calculateConfidence(Mahasiswa $mahasiswa): float
    {
        $dataPoints = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)->count();
        
        // More data = higher confidence
        return min(100, ($dataPoints / 50) * 100);
    }

    public function detectAnomalies(): void
    {
        $this->detectUnusualAttendancePatterns();
        $this->detectFraudAttempts();
        $this->detectPerformanceAnomalies();
    }

    private function detectUnusualAttendancePatterns(): void
    {
        $students = Mahasiswa::all();

        foreach ($students as $student) {
            $recentRate = $this->getRecentAttendanceRate($student, 7);
            $historicalRate = $this->getHistoricalAttendanceRate($student);

            $deviation = abs($recentRate - $historicalRate);

            if ($deviation > 30) {
                Anomaly::create([
                    'anomaly_type' => 'unusual_attendance_pattern',
                    'subject_type' => Mahasiswa::class,
                    'subject_id' => $student->id,
                    'severity' => $deviation > 50 ? 'high' : 'medium',
                    'description' => "Attendance rate changed by {$deviation}% from historical average",
                    'evidence' => [
                        'recent_rate' => $recentRate,
                        'historical_rate' => $historicalRate,
                        'deviation' => $deviation,
                    ],
                ]);
            }
        }
    }

    private function detectFraudAttempts(): void
    {
        // Detect multiple scans in short time
        $suspiciousLogs = AttendanceLog::select('mahasiswa_id', DB::raw('COUNT(*) as scan_count'))
            ->where('created_at', '>=', now()->subMinutes(5))
            ->groupBy('mahasiswa_id')
            ->having('scan_count', '>', 1)
            ->get();

        foreach ($suspiciousLogs as $log) {
            Anomaly::create([
                'anomaly_type' => 'fraud_attempt',
                'subject_type' => Mahasiswa::class,
                'subject_id' => $log->mahasiswa_id,
                'severity' => 'critical',
                'description' => 'Multiple attendance scans detected within 5 minutes',
                'evidence' => [
                    'scan_count' => $log->scan_count,
                    'time_window' => '5 minutes',
                ],
            ]);
        }
    }

    private function detectPerformanceAnomalies(): void
    {
        // Detect sudden drops in engagement
        $students = Mahasiswa::all();

        foreach ($students as $student) {
            $recentEvents = AnalyticsEvent::where('user_type', Mahasiswa::class)
                ->where('user_id', $student->id)
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            $previousEvents = AnalyticsEvent::where('user_type', Mahasiswa::class)
                ->where('user_id', $student->id)
                ->whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])
                ->count();

            if ($previousEvents > 10 && $recentEvents < $previousEvents * 0.3) {
                Anomaly::create([
                    'anomaly_type' => 'engagement_drop',
                    'subject_type' => Mahasiswa::class,
                    'subject_id' => $student->id,
                    'severity' => 'medium',
                    'description' => 'Significant drop in student engagement detected',
                    'evidence' => [
                        'recent_events' => $recentEvents,
                        'previous_events' => $previousEvents,
                        'drop_percentage' => (($previousEvents - $recentEvents) / $previousEvents) * 100,
                    ],
                ]);
            }
        }
    }

    private function getRecentAttendanceRate(Mahasiswa $mahasiswa, int $days): float
    {
        $total = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->where('created_at', '>=', now()->subDays($days))
            ->count();

        $present = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
            ->where('created_at', '>=', now()->subDays($days))
            ->whereIn('status', ['present', 'late'])
            ->count();

        return $total > 0 ? ($present / $total) * 100 : 0;
    }

    public function getDashboardStats(): array
    {
        return [
            'today' => [
                'attendance_rate' => DailyMetric::getMetric('attendance_rate', now()->toDateString())?->value ?? 0,
                'active_students' => DailyMetric::getMetric('active_students', now()->toDateString())?->value ?? 0,
                'engagement_score' => DailyMetric::getMetric('engagement_score', now()->toDateString())?->value ?? 0,
            ],
            'trends' => [
                'attendance' => DailyMetric::getTrend('attendance_rate', 7),
                'engagement' => DailyMetric::getTrend('engagement_score', 7),
            ],
            'anomalies' => [
                'critical' => Anomaly::unresolved()->critical()->count(),
                'total' => Anomaly::unresolved()->count(),
            ],
        ];
    }
}
