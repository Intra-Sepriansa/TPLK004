<?php

namespace App\Services\Chat;

use App\Events\Chat\MessageDeletedEvent;
use App\Events\Chat\NewMessageEvent;
use App\Models\Conversation;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MessageService
{
    /**
     * Get user type class
     */
    private function getUserType($user): string
    {
        if ($user instanceof Mahasiswa) {
            return Mahasiswa::class;
        }
        if ($user instanceof Dosen) {
            return Dosen::class;
        }
        return User::class;
    }

    /**
     * Send a new message
     */
    public function sendMessage(
        Conversation $conversation,
        $sender,
        string $content,
        string $type = 'text',
        ?int $replyToId = null,
        ?int $forwardedFromId = null
    ): Message {
        $senderType = $this->getUserType($sender);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => $senderType,
            'sender_id' => $sender->id,
            'content' => $content,
            'type' => $type,
            'reply_to_id' => $replyToId,
            'forwarded_from_id' => $forwardedFromId,
        ]);

        // Update conversation timestamp
        $conversation->touch();

        // Broadcast new message event (graceful fail if Reverb not running)
        try {
            broadcast(new NewMessageEvent($message))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast new message: ' . $e->getMessage());
        }

        return $message;
    }

    /**
     * Edit a message (within 15 minutes)
     */
    public function editMessage(Message $message, string $newContent): bool
    {
        if (!$message->canEdit()) {
            return false;
        }

        $message->update([
            'content' => $newContent,
            'edited_at' => now(),
        ]);

        return true;
    }

    /**
     * Delete a message (soft delete)
     */
    public function deleteMessage(Message $message, $deletedBy): bool
    {
        $deletedByType = $this->getUserType($deletedBy);

        $message->delete();

        // Broadcast deletion event (graceful fail if Reverb not running)
        try {
            broadcast(new MessageDeletedEvent(
                $message->id,
                $message->conversation_id,
                $deletedBy->id,
                $deletedByType
            ))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast message deletion: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Forward a message to another conversation
     */
    public function forwardMessage(Message $originalMessage, Conversation $targetConversation, $sender): Message
    {
        return $this->sendMessage(
            $targetConversation,
            $sender,
            $originalMessage->content,
            $originalMessage->type,
            null,
            $originalMessage->id
        );
    }

    /**
     * Get messages for a conversation with pagination
     */
    public function getMessages(Conversation $conversation, int $perPage = 50, ?int $beforeId = null)
    {
        $query = $conversation->messages()
            ->with(['sender', 'attachments', 'reactions.reactor', 'replyTo.sender'])
            ->orderBy('created_at', 'desc');

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        return $query->paginate($perPage);
    }

    /**
     * Send system message
     */
    public function sendSystemMessage(Conversation $conversation, string $content): Message
    {
        return Message::create([
            'conversation_id' => $conversation->id,
            'sender_type' => User::class,
            'sender_id' => 0, // System
            'content' => $content,
            'type' => 'system',
        ]);
    }
}
