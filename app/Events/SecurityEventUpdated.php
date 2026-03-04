<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SecurityEventUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $auditLogId;
    public $newScore;
    public $newThreatLevel;

    /**
     * Create a new event instance.
     */
    public function __construct($auditLogId, $newScore, $newThreatLevel)
    {
        $this->auditLogId = $auditLogId;
        $this->newScore = $newScore;
        $this->newThreatLevel = $newThreatLevel;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('security-audit.' . $this->auditLogId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'SecurityEventUpdated';
    }
}
