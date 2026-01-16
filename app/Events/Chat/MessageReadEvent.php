<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReadEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $conversationId;
    public int $userId;
    public string $userType;
    public string $userName;
    public string $readAt;

    public function __construct(int $conversationId, int $userId, string $userType, string $userName, string $readAt)
    {
        $this->conversationId = $conversationId;
        $this->userId = $userId;
        $this->userType = $userType;
        $this->userName = $userName;
        $this->readAt = $readAt;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.read';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'user_id' => $this->userId,
            'user_type' => $this->userType,
            'user_name' => $this->userName,
            'read_at' => $this->readAt,
        ];
    }
}
