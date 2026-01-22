<?php

namespace App\Services;

use App\Models\NotificationTemplate;
use App\Models\NotificationCampaign;
use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Models\User;
use Illuminate\Support\Collection;

class SmartNotificationService
{
    public function sendNotification($recipient, string $templateSlug, array $data = [], ?string $type = 'in_app'): ?NotificationLog
    {
        $template = NotificationTemplate::where('slug', $templateSlug)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            return null;
        }

        // Check user preferences
        $preference = NotificationPreference::where('user_type', get_class($recipient))
            ->where('user_id', $recipient->id)
            ->first();

        if ($preference && !$preference->canReceive($type ?? $template->type)) {
            return null;
        }

        // Render template
        $rendered = $template->render($data);

        // Create log
        $log = NotificationLog::create([
            'recipient_type' => get_class($recipient),
            'recipient_id' => $recipient->id,
            'type' => $type ?? $template->type,
            'subject' => $rendered['subject'],
            'body' => $rendered['body'],
            'status' => 'pending',
        ]);

        // Send notification based on type
        try {
            match($log->type) {
                'email' => $this->sendEmail($log),
                'push' => $this->sendPush($log),
                'sms' => $this->sendSMS($log),
                'in_app' => $this->sendInApp($log),
                default => null,
            };

            $log->markAsSent();
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
        }

        return $log;
    }

    public function createCampaign(array $data): NotificationCampaign
    {
        $campaign = NotificationCampaign::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'template_id' => $data['template_id'] ?? null,
            'target_type' => $data['target_type'],
            'target_filters' => $data['target_filters'] ?? null,
            'status' => 'draft',
            'scheduled_at' => $data['scheduled_at'] ?? null,
        ]);

        // Calculate recipients
        $recipients = $this->getRecipients($campaign);
        $campaign->total_recipients = $recipients->count();
        $campaign->save();

        return $campaign;
    }

    public function sendCampaign(NotificationCampaign $campaign): void
    {
        $campaign->status = 'sending';
        $campaign->save();

        $recipients = $this->getRecipients($campaign);
        $template = $campaign->template;

        foreach ($recipients as $recipient) {
            $rendered = $template->render([
                'name' => $recipient->nama ?? $recipient->name,
                'email' => $recipient->email,
            ]);

            $log = NotificationLog::create([
                'campaign_id' => $campaign->id,
                'recipient_type' => get_class($recipient),
                'recipient_id' => $recipient->id,
                'type' => $template->type,
                'subject' => $rendered['subject'],
                'body' => $rendered['body'],
                'status' => 'pending',
            ]);

            try {
                match($log->type) {
                    'email' => $this->sendEmail($log),
                    'push' => $this->sendPush($log),
                    'sms' => $this->sendSMS($log),
                    'in_app' => $this->sendInApp($log),
                    default => null,
                };

                $log->markAsSent();
                $campaign->increment('sent_count');
            } catch (\Exception $e) {
                $log->markAsFailed($e->getMessage());
            }
        }

        $campaign->status = 'sent';
        $campaign->sent_at = now();
        $campaign->save();
    }

    private function getRecipients(NotificationCampaign $campaign): Collection
    {
        return match($campaign->target_type) {
            'all' => $this->getAllUsers(),
            'role' => $this->getUsersByRole($campaign->target_filters['role'] ?? 'mahasiswa'),
            'class' => $this->getUsersByClass($campaign->target_filters['class'] ?? null),
            'custom' => $this->getUsersByCustomFilters($campaign->target_filters),
            default => collect([]),
        };
    }

    private function getAllUsers(): Collection
    {
        return collect()
            ->merge(Mahasiswa::all())
            ->merge(Dosen::all())
            ->merge(User::all());
    }

    private function getUsersByRole(string $role): Collection
    {
        return match($role) {
            'mahasiswa' => Mahasiswa::all(),
            'dosen' => Dosen::all(),
            'admin' => User::where('role', 'admin')->get(),
            default => collect([]),
        };
    }

    private function getUsersByClass(?string $class): Collection
    {
        if (!$class) {
            return collect([]);
        }

        return Mahasiswa::where('kelas', $class)->get();
    }

    private function getUsersByCustomFilters(array $filters): Collection
    {
        // Implement custom filtering logic
        return collect([]);
    }

    private function sendEmail(NotificationLog $log): void
    {
        // Implement email sending logic
        // Using Laravel Mail or external service
    }

    private function sendPush(NotificationLog $log): void
    {
        // Implement push notification logic
        // Using Firebase Cloud Messaging or similar
    }

    private function sendSMS(NotificationLog $log): void
    {
        // Implement SMS sending logic
        // Using Twilio or similar service
    }

    private function sendInApp(NotificationLog $log): void
    {
        // Create in-app notification
        \App\Models\AppNotification::create([
            'user_type' => $log->recipient_type,
            'user_id' => $log->recipient_id,
            'title' => $log->subject,
            'message' => $log->body,
            'type' => 'info',
            'is_read' => false,
        ]);
    }

    public function getNotificationStats(NotificationCampaign $campaign): array
    {
        return [
            'total_recipients' => $campaign->total_recipients,
            'sent_count' => $campaign->sent_count,
            'opened_count' => $campaign->opened_count,
            'clicked_count' => $campaign->clicked_count,
            'open_rate' => $campaign->getOpenRate(),
            'click_rate' => $campaign->getClickRate(),
            'failed_count' => $campaign->logs()->where('status', 'failed')->count(),
        ];
    }

    public function scheduleReminders(): void
    {
        // Schedule attendance reminders
        $upcomingSessions = \App\Models\AttendanceSession::where('starts_at', '>', now())
            ->where('starts_at', '<=', now()->addHours(1))
            ->get();

        foreach ($upcomingSessions as $session) {
            $students = $session->course->mahasiswa;
            foreach ($students as $student) {
                $this->sendNotification(
                    $student,
                    'attendance_reminder',
                    [
                        'course_name' => $session->course->nama_matkul,
                        'time' => $session->starts_at->format('H:i'),
                    ]
                );
            }
        }
    }
}
