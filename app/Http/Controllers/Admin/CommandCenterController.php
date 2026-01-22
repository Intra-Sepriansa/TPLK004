<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdvancedAnalyticsService;
use App\Services\GamificationService;
use App\Services\SmartNotificationService;
use App\Models\Mahasiswa;
use App\Models\AttendanceSession;
use App\Models\Anomaly;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CommandCenterController extends Controller
{
    public function __construct(
        private AdvancedAnalyticsService $analyticsService,
        private GamificationService $gamificationService,
        private SmartNotificationService $notificationService
    ) {}

    public function index()
    {
        $stats = $this->getRealtimeStats();
        $alerts = $this->getActiveAlerts();
        $recentActivity = $this->getRecentActivity();

        return Inertia::render('Admin/CommandCenter/Dashboard', [
            'stats' => $stats,
            'alerts' => $alerts,
            'recentActivity' => $recentActivity,
        ]);
    }

    private function getRealtimeStats(): array
    {
        return [
            'students' => [
                'total' => Mahasiswa::count(),
                'active_today' => Mahasiswa::whereDate('last_activity_at', today())->count(),
                'online_now' => Mahasiswa::where('last_activity_at', '>=', now()->subMinutes(5))->count(),
            ],
            'attendance' => [
                'sessions_today' => AttendanceSession::whereDate('created_at', today())->count(),
                'active_sessions' => AttendanceSession::where('is_active', true)->count(),
                'attendance_rate' => $this->getTodayAttendanceRate(),
            ],
            'gamification' => [
                'challenges_active' => \App\Models\Challenge::active()->count(),
                'rewards_redeemed_today' => \App\Models\RewardRedemption::whereDate('created_at', today())->count(),
                'points_awarded_today' => \App\Models\PointHistory::whereDate('created_at', today())->sum('points'),
            ],
            'notifications' => [
                'sent_today' => \App\Models\NotificationLog::whereDate('created_at', today())->count(),
                'campaigns_active' => \App\Models\NotificationCampaign::where('status', 'sending')->count(),
            ],
            'anomalies' => [
                'critical' => Anomaly::unresolved()->critical()->count(),
                'total_unresolved' => Anomaly::unresolved()->count(),
            ],
        ];
    }

    private function getActiveAlerts(): array
    {
        $alerts = [];

        // Critical anomalies
        $criticalAnomalies = Anomaly::unresolved()
            ->critical()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($criticalAnomalies as $anomaly) {
            $alerts[] = [
                'type' => 'critical',
                'title' => 'Critical Anomaly Detected',
                'message' => $anomaly->description,
                'timestamp' => $anomaly->created_at,
                'action_url' => route('admin.analytics.anomalies'),
            ];
        }

        // Low attendance rate
        $attendanceRate = $this->getTodayAttendanceRate();
        if ($attendanceRate < 70) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Low Attendance Rate',
                'message' => "Today's attendance rate is {$attendanceRate}%",
                'timestamp' => now(),
                'action_url' => route('admin.analytics.dashboard'),
            ];
        }

        // Failed notifications
        $failedNotifications = \App\Models\NotificationLog::where('status', 'failed')
            ->whereDate('created_at', today())
            ->count();

        if ($failedNotifications > 10) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Notification Failures',
                'message' => "{$failedNotifications} notifications failed today",
                'timestamp' => now(),
                'action_url' => route('admin.notifications.logs'),
            ];
        }

        return $alerts;
    }

    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent attendance scans
        $recentScans = \App\Models\AttendanceLog::with(['mahasiswa', 'session'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($recentScans as $scan) {
            $activities[] = [
                'type' => 'attendance',
                'icon' => 'user-check',
                'title' => 'Attendance Scan',
                'description' => "{$scan->mahasiswa->nama} scanned for {$scan->session->course->nama_matkul}",
                'timestamp' => $scan->created_at,
            ];
        }

        // Recent challenge completions
        $recentCompletions = \App\Models\ChallengeProgress::with(['mahasiswa', 'challenge'])
            ->where('is_completed', true)
            ->orderBy('completed_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentCompletions as $completion) {
            $activities[] = [
                'type' => 'challenge',
                'icon' => 'trophy',
                'title' => 'Challenge Completed',
                'description' => "{$completion->mahasiswa->nama} completed {$completion->challenge->title}",
                'timestamp' => $completion->completed_at,
            ];
        }

        // Sort by timestamp
        usort($activities, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return array_slice($activities, 0, 15);
    }

    private function getTodayAttendanceRate(): float
    {
        $total = \App\Models\AttendanceLog::whereDate('created_at', today())->count();
        if ($total === 0) {
            return 0;
        }

        $present = \App\Models\AttendanceLog::whereDate('created_at', today())
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($present / $total) * 100, 2);
    }

    public function systemHealth()
    {
        return response()->json([
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
        ]);
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'healthy', 'message' => 'Database connection OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkCache(): array
    {
        try {
            cache()->put('health_check', true, 10);
            $result = cache()->get('health_check');
            return ['status' => $result ? 'healthy' : 'error', 'message' => 'Cache OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkQueue(): array
    {
        try {
            $failedJobs = DB::table('failed_jobs')->count();
            return [
                'status' => $failedJobs < 10 ? 'healthy' : 'warning',
                'message' => "Failed jobs: {$failedJobs}",
            ];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkStorage(): array
    {
        try {
            $diskSpace = disk_free_space(storage_path());
            $diskTotal = disk_total_space(storage_path());
            $percentage = ($diskSpace / $diskTotal) * 100;

            return [
                'status' => $percentage > 10 ? 'healthy' : 'warning',
                'message' => round($percentage, 2) . '% free',
            ];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
