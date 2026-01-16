<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserOnlineEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public string $userType;
    public string $userName;
    public bool $isOnline;
    public ?string $lastSeen;

    public function __construct(int $userId, string $userType, string $userName, bool $isOnline, ?string $lastSeen = null)
    {
        $this->userId = $userId;
        $this->userType = $userType;
        $this->userName = $userName;
        $this->isOnline = $isOnline;
        $this->lastSeen = $lastSeen;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('online'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.status';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'user_type' => $this->userType,
            'user_name' => $this->userName,
            'is_online' => $this->isOnline,
            'last_seen' => $this->lastSeen,
        ];
    }
}
