<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QRCodeGenerated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $session;
    public $courseId;

    /**
     * Create a new event instance.
     */
    public function __construct($session, $courseId)
    {
        $this->session = $session;
        $this->courseId = $courseId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('course.' . $this->courseId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'qrcode.generated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'course_name' => $this->session->mataKuliah->nama,
            'dosen_name' => $this->session->dosen->nama,
            'started_at' => $this->session->started_at,
            'expires_at' => $this->session->expires_at,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
