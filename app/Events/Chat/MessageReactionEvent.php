<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReactionEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $messageId;
    public int $conversationId;
    public string $action; // 'added' or 'removed'
    public string $emoji;
    public int $reactorId;
    public string $reactorType;
    public string $reactorName;

    public function __construct(
        int $messageId,
        int $conversationId,
        string $action,
        string $emoji,
        int $reactorId,
        string $reactorType,
        string $reactorName
    ) {
        $this->messageId = $messageId;
        $this->conversationId = $conversationId;
        $this->action = $action;
        $this->emoji = $emoji;
        $this->reactorId = $reactorId;
        $this->reactorType = $reactorType;
        $this->reactorName = $reactorName;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.reaction';
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->messageId,
            'conversation_id' => $this->conversationId,
            'action' => $this->action,
            'emoji' => $this->emoji,
            'reactor_id' => $this->reactorId,
            'reactor_type' => $this->reactorType,
            'reactor_name' => $this->reactorName,
        ];
    }
}
