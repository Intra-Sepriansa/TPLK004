<?php

namespace App\Events;

use App\Models\AttendanceLog;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveMonitorActivityEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $log;

    /**
     * Create a new event instance.
     */
    public function __construct(AttendanceLog $log)
    {
        // Load relationships just to be safe
        $this->log = $log->loadMissing(['mahasiswa', 'session.course']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('live-monitor'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'new-activity';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $statusMap = [
            'present' => 'hadir',
            'late' => 'terlambat',
            'excused' => 'izin',
            'rejected' => 'anomali',
            'absent' => 'anomali',
        ];

        return [
            'id' => $this->log->id,
            'student_name' => $this->log->mahasiswa->nama ?? 'Unknown',
            'nim' => $this->log->mahasiswa->nim ?? '-',
            'session_name' => $this->log->session ? ($this->log->session->course->nama ?? '') . ' - Pertemuan ' . $this->log->session->meeting_number : '-',
            'course' => $this->log->session->course->nama ?? '-',
            'time' => $this->log->scanned_at ? $this->log->scanned_at->format('H:i:s') : now()->format('H:i:s'),
            'status' => $statusMap[$this->log->status] ?? 'anomali',
            'distance' => (float) $this->log->distance_m,
            'device' => $this->log->device_info,
            'anomaly_reason' => $this->log->status === 'rejected' ? 'Jarak terlalu jauh atau verifikasi gagal' : null,
        ];
    }
}
