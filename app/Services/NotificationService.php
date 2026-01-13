<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use Carbon\Carbon;

class NotificationService
{
    public function sendToMahasiswa(int $mahasiswaId, string $title, string $message, array $options = []): AppNotification
    {
        return AppNotification::create([
            'notifiable_type' => 'mahasiswa',
            'notifiable_id' => $mahasiswaId,
            'title' => $title,
            'message' => $message,
            'type' => $options['type'] ?? 'info',
            'priority' => $options['priority'] ?? 'normal',
            'data' => $options['data'] ?? null,
            'action_url' => $options['action_url'] ?? null,
            'scheduled_at' => $options['scheduled_at'] ?? null,
            'created_by' => $options['created_by'] ?? null,
        ]);
    }

    public function sendToDosen(int $dosenId, string $title, string $message, array $options = []): AppNotification
    {
        return AppNotification::create([
            'notifiable_type' => 'dosen',
            'notifiable_id' => $dosenId,
            'title' => $title,
            'message' => $message,
            'type' => $options['type'] ?? 'info',
            'priority' => $options['priority'] ?? 'normal',
            'data' => $options['data'] ?? null,
            'action_url' => $options['action_url'] ?? null,
            'scheduled_at' => $options['scheduled_at'] ?? null,
            'created_by' => $options['created_by'] ?? null,
        ]);
    }

    public function sendToAll(string $title, string $message, array $options = []): AppNotification
    {
        return AppNotification::create([
            'notifiable_type' => 'all',
            'notifiable_id' => null,
            'title' => $title,
            'message' => $message,
            'type' => $options['type'] ?? 'announcement',
            'priority' => $options['priority'] ?? 'normal',
            'data' => $options['data'] ?? null,
            'action_url' => $options['action_url'] ?? null,
            'scheduled_at' => $options['scheduled_at'] ?? null,
            'created_by' => $options['created_by'] ?? null,
        ]);
    }

    public function sendBulkToMahasiswa(array $mahasiswaIds, string $title, string $message, array $options = []): int
    {
        $count = 0;
        foreach ($mahasiswaIds as $id) {
            $this->sendToMahasiswa($id, $title, $message, $options);
            $count++;
        }
        return $count;
    }

    public function sendSessionReminder(AttendanceSession $session, int $minutesBefore = 15): int
    {
        $scheduledAt = $session->start_at->subMinutes($minutesBefore);
        
        if ($scheduledAt->isPast()) {
            return 0;
        }

        // Get all mahasiswa (in real app, filter by enrolled students)
        $mahasiswaIds = Mahasiswa::pluck('id')->toArray();

        $title = '⏰ Reminder Absensi';
        $message = sprintf(
            'Kelas %s akan dimulai dalam %d menit. Jangan lupa absen!',
            $session->course?->nama ?? $session->title,
            $minutesBefore
        );

        return $this->sendBulkToMahasiswa($mahasiswaIds, $title, $message, [
            'type' => 'reminder',
            'priority' => 'high',
            'scheduled_at' => $scheduledAt,
            'action_url' => '/absen',
            'data' => [
                'session_id' => $session->id,
                'course_name' => $session->course?->nama,
                'start_at' => $session->start_at->toDateTimeString(),
            ],
        ]);
    }

    public function sendAchievementNotification(int $mahasiswaId, string $badgeName, string $badgeDescription): AppNotification
    {
        return $this->sendToMahasiswa($mahasiswaId, '🏆 Achievement Unlocked!', "Selamat! Kamu mendapatkan badge: {$badgeName}. {$badgeDescription}", [
            'type' => 'achievement',
            'priority' => 'normal',
            'action_url' => '/profile',
            'data' => [
                'badge_name' => $badgeName,
                'badge_description' => $badgeDescription,
            ],
        ]);
    }

    public function sendStreakNotification(int $mahasiswaId, int $streakDays): AppNotification
    {
        $messages = [
            3 => '🔥 3 hari berturut-turut hadir! Pertahankan!',
            7 => '🔥🔥 Seminggu penuh hadir! Luar biasa!',
            14 => '🔥🔥🔥 2 minggu streak! Kamu hebat!',
            30 => '🏆 1 bulan penuh hadir! Legendaris!',
        ];

        $message = $messages[$streakDays] ?? "🔥 {$streakDays} hari streak! Terus pertahankan!";

        return $this->sendToMahasiswa($mahasiswaId, '🔥 Streak Update', $message, [
            'type' => 'achievement',
            'data' => ['streak_days' => $streakDays],
        ]);
    }

    public function sendFraudAlert(int $mahasiswaId, string $alertType, string $description): AppNotification
    {
        // Notify admin
        return AppNotification::create([
            'notifiable_type' => 'admin',
            'notifiable_id' => null,
            'title' => '⚠️ Fraud Alert',
            'message' => $description,
            'type' => 'alert',
            'priority' => 'urgent',
            'action_url' => '/admin/fraud-detection',
            'data' => [
                'mahasiswa_id' => $mahasiswaId,
                'alert_type' => $alertType,
            ],
        ]);
    }

    public function sendWarningToStudent(int $mahasiswaId, int $absentCount): AppNotification
    {
        $remaining = 3 - $absentCount;
        
        if ($absentCount >= 3) {
            $message = '⛔ Kamu sudah 3x tidak hadir. Sesuai aturan UNPAM, kamu tidak dapat mengikuti UAS untuk mata kuliah ini.';
            $priority = 'urgent';
        } elseif ($absentCount == 2) {
            $message = "⚠️ Peringatan! Kamu sudah 2x tidak hadir. Sisa kesempatan: {$remaining}x lagi sebelum tidak bisa ikut UAS.";
            $priority = 'high';
        } else {
            $message = "📢 Kamu sudah 1x tidak hadir. Sisa kesempatan: {$remaining}x lagi.";
            $priority = 'normal';
        }

        return $this->sendToMahasiswa($mahasiswaId, '📋 Status Kehadiran', $message, [
            'type' => 'warning',
            'priority' => $priority,
            'data' => [
                'absent_count' => $absentCount,
                'remaining' => $remaining,
            ],
        ]);
    }

    public function getUnreadCount(string $type, int $id): int
    {
        return AppNotification::forUser($type, $id)->unread()->count();
    }

    public function getNotifications(string $type, int $id, int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return AppNotification::forUser($type, $id)
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();
    }

    public function markAllAsRead(string $type, int $id): int
    {
        return AppNotification::forUser($type, $id)
            ->unread()
            ->update(['read_at' => now()]);
    }
}
