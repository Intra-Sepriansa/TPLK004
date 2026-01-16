<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeletedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $messageId;
    public int $conversationId;
    public int $deletedById;
    public string $deletedByType;

    public function __construct(int $messageId, int $conversationId, int $deletedById, string $deletedByType)
    {
        $this->messageId = $messageId;
        $this->conversationId = $conversationId;
        $this->deletedById = $deletedById;
        $this->deletedByType = $deletedByType;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->messageId,
            'conversation_id' => $this->conversationId,
            'deleted_by_id' => $this->deletedById,
            'deleted_by_type' => $this->deletedByType,
        ];
    }
}
