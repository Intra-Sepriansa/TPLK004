<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\StarredMessage;
use App\Models\PinnedMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageActionsController extends Controller
{
    /**
     * Toggle star message
     */
    public function toggleStar(Request $request, Message $message): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        $userType = get_class($user);
        $userId = $user->id;

        $existing = StarredMessage::where('message_id', $message->id)
            ->where('user_type', $userType)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'is_starred' => false,
                'message' => 'Bintang dihapus',
            ]);
        }

        StarredMessage::create([
            'message_id' => $message->id,
            'user_type' => $userType,
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'is_starred' => true,
            'message' => 'Pesan diberi bintang',
        ]);
    }

    /**
     * Toggle pin message in conversation
     */
    public function togglePin(Request $request, Message $message): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        $userType = get_class($user);
        $userId = $user->id;

        $existing = PinnedMessage::where('conversation_id', $message->conversation_id)
            ->where('message_id', $message->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'is_pinned' => false,
                'message' => 'Sematan dilepas',
            ]);
        }

        PinnedMessage::create([
            'conversation_id' => $message->conversation_id,
            'message_id' => $message->id,
            'pinned_by_type' => $userType,
            'pinned_by_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'is_pinned' => true,
            'message' => 'Pesan disematkan',
        ]);
    }

    /**
     * Get starred messages
     */
    public function starredMessages(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        $userType = get_class($user);
        $userId = $user->id;

        $starred = StarredMessage::with(['message.sender', 'message.conversation'])
            ->where('user_type', $userType)
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $messages = $starred->map(function ($s) {
            $msg = $s->message;
            return [
                'id' => $msg->id,
                'content' => $msg->content,
                'type' => $msg->type,
                'sender_name' => $msg->getSenderName(),
                'conversation_id' => $msg->conversation_id,
                'conversation_name' => $msg->conversation->getDisplayName($msg->sender_type, $msg->sender_id),
                'created_at' => $msg->created_at->toISOString(),
                'starred_at' => $s->created_at->toISOString(),
            ];
        });

        return response()->json([
            'messages' => $messages,
            'total' => $starred->total(),
        ]);
    }

    /**
     * Get pinned messages in conversation
     */
    public function pinnedMessages(Request $request, int $conversationId): JsonResponse
    {
        $pinned = PinnedMessage::with(['message.sender'])
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->get();

        $messages = $pinned->map(function ($p) {
            $msg = $p->message;
            return [
                'id' => $msg->id,
                'content' => $msg->content,
                'type' => $msg->type,
                'sender_name' => $msg->getSenderName(),
                'created_at' => $msg->created_at->toISOString(),
                'pinned_at' => $p->created_at->toISOString(),
            ];
        });

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Get message info
     */
    public function info(Request $request, Message $message): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        $userType = get_class($user);
        $userId = $user->id;

        $message->load(['sender', 'attachments', 'reactions', 'replyTo']);

        $isStarred = StarredMessage::where('message_id', $message->id)
            ->where('user_type', $userType)
            ->where('user_id', $userId)
            ->exists();

        $isPinned = PinnedMessage::where('message_id', $message->id)
            ->where('conversation_id', $message->conversation_id)
            ->exists();

        return response()->json([
            'id' => $message->id,
            'content' => $message->content,
            'type' => $message->type,
            'sender_name' => $message->getSenderName(),
            'sender_avatar' => $message->getSenderAvatar(),
            'created_at' => $message->created_at->toISOString(),
            'edited_at' => $message->edited_at?->toISOString(),
            'is_edited' => $message->isEdited(),
            'is_deleted' => $message->isDeleted(),
            'is_starred' => $isStarred,
            'is_pinned' => $isPinned,
            'attachments_count' => $message->attachments->count(),
            'reactions_count' => $message->reactions->count(),
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'content' => $message->replyTo->content,
                'sender_name' => $message->replyTo->getSenderName(),
            ] : null,
        ]);
    }

    /**
     * Forward message to another conversation
     */
    public function forward(Request $request, Message $message): JsonResponse
    {
        $request->validate([
            'conversation_ids' => 'required|array|min:1',
            'conversation_ids.*' => 'exists:conversations,id',
        ]);

        $user = $this->getCurrentUser($request);
        $userType = get_class($user);
        $userId = $user->id;

        $forwardedMessages = [];

        foreach ($request->conversation_ids as $conversationId) {
            $newMessage = Message::create([
                'conversation_id' => $conversationId,
                'sender_type' => $userType,
                'sender_id' => $userId,
                'content' => $message->content,
                'type' => $message->type,
                'forwarded_from_id' => $message->id,
            ]);

            $forwardedMessages[] = $newMessage->id;
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesan diteruskan ke ' . count($forwardedMessages) . ' chat',
            'forwarded_message_ids' => $forwardedMessages,
        ]);
    }

    private function getCurrentUser(Request $request)
    {
        if (auth('dosen')->check()) {
            return auth('dosen')->user();
        }
        
        if (auth('mahasiswa')->check()) {
            return auth('mahasiswa')->user();
        }
        
        return auth()->user();
    }
}
