<?php

namespace App\Events\Chat;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message->load(['sender', 'attachments', 'replyTo']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.new';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_type' => $this->message->sender_type,
                'sender_id' => $this->message->sender_id,
                'sender_name' => $this->message->getSenderName(),
                'sender_avatar' => $this->message->getSenderAvatar(),
                'content' => $this->message->content,
                'type' => $this->message->type,
                'reply_to_id' => $this->message->reply_to_id,
                'reply_to' => $this->message->replyTo ? [
                    'id' => $this->message->replyTo->id,
                    'content' => $this->message->replyTo->getDisplayContent(),
                    'sender_name' => $this->message->replyTo->getSenderName(),
                ] : null,
                'attachments' => $this->message->attachments->map(fn($a) => [
                    'id' => $a->id,
                    'file_name' => $a->file_name,
                    'file_type' => $a->file_type,
                    'file_size' => $a->file_size,
                    'mime_type' => $a->mime_type,
                    'url' => $a->url,
                    'is_image' => $a->is_image,
                ]),
                'created_at' => $this->message->created_at->toISOString(),
            ],
        ];
    }
}
