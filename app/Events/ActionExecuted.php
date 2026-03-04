<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActionExecuted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $auditLogId;
    public $action;
    public $newStatus;

    /**
     * Create a new event instance.
     */
    public function __construct($auditLogId, $action, $newStatus = null)
    {
        $this->auditLogId = $auditLogId;
        $this->action = $action;
        $this->newStatus = $newStatus;
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
        return 'ActionExecuted';
    }
}
