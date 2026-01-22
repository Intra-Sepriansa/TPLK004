<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceScanned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $attendance;
    public $sessionId;

    /**
     * Create a new event instance.
     */
    public function __construct($attendance, $sessionId)
    {
        $this->attendance = $attendance;
        $this->sessionId = $sessionId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('session.' . $this->sessionId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'attendance.scanned';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->attendance->id,
            'mahasiswa' => [
                'nim' => $this->attendance->mahasiswa->nim,
                'nama' => $this->attendance->mahasiswa->nama,
            ],
            'status' => $this->attendance->status,
            'check_in_at' => $this->attendance->check_in_at,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
