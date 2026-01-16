<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Events\Chat\MessageReadEvent;
use App\Events\Chat\TypingEvent;
use App\Models\Conversation;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\AttachmentService;
use App\Services\Chat\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function __construct(
        private MessageService $messageService,
        private AttachmentService $attachmentService
    ) {
    }

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
     * Get user name
     */
    private function getUserName($user): string
    {
        if ($user instanceof Mahasiswa) {
            return $user->nama;
        }
        if ($user instanceof Dosen) {
            return $user->nama;
        }
        return $user->name;
    }

    /**
     * Send a new message
     */
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate([
            'content' => 'required_without:attachments|nullable|string|max:5000',
            'type' => 'nullable|in:text,image,file',
            'reply_to_id' => 'nullable|exists:messages,id',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|max:10240', // 10MB
        ]);

        $user = $this->getCurrentUser($request);

        if (!$conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $type = $request->type ?? 'text';
        if ($request->hasFile('attachments')) {
            $type = 'file';
        }

        $message = $this->messageService->sendMessage(
            $conversation,
            $user,
            $request->content ?? '',
            $type,
            $request->reply_to_id
        );

        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $this->attachmentService->uploadAttachment($message, $file);
            }
            $message->load('attachments');
        }

        return response()->json([
            'message' => $this->formatMessage($message, $user),
        ]);
    }

    /**
     * Update/edit a message
     */
    public function update(Request $request, Message $message)
    {
        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);

        // Check ownership
        if ($message->sender_type !== $userType || $message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $success = $this->messageService->editMessage($message, $request->content);

        if (!$success) {
            return response()->json([
                'error' => 'Pesan hanya dapat diedit dalam 15 menit setelah dikirim.',
            ], 422);
        }

        return response()->json([
            'message' => $this->formatMessage($message->fresh(), $user),
        ]);
    }

    /**
     * Delete a message
     */
    public function destroy(Request $request, Message $message)
    {
        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);

        // Check ownership
        if ($message->sender_type !== $userType || $message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->messageService->deleteMessage($message, $user);

        return response()->json(['success' => true]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);

        $participant = $conversation->participants()
            ->where('participant_type', $userType)
            ->where('participant_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $participant->markAsRead();

        // Broadcast read event (graceful fail if Reverb not running)
        try {
            $userName = $this->getUserName($user);
            broadcast(new MessageReadEvent(
                $conversation->id,
                $user->id,
                $userType,
                $userName,
                now()->toISOString()
            ))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast read event: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }

    /**
     * Forward message to another conversation
     */
    public function forward(Request $request, Message $message)
    {
        $request->validate([
            'conversation_ids' => 'required|array|min:1',
            'conversation_ids.*' => 'exists:conversations,id',
        ]);

        $user = $this->getCurrentUser($request);

        // Check if user can access original message
        if (!$message->conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $forwarded = [];
        foreach ($request->conversation_ids as $conversationId) {
            $targetConversation = Conversation::find($conversationId);
            
            if ($targetConversation && $targetConversation->isParticipant($user)) {
                $newMessage = $this->messageService->forwardMessage($message, $targetConversation, $user);
                $forwarded[] = $newMessage->id;
            }
        }

        return response()->json([
            'success' => true,
            'forwarded_count' => count($forwarded),
        ]);
    }

    /**
     * Send typing indicator
     */
    public function typing(Request $request, Conversation $conversation)
    {
        $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);
        $userName = $this->getUserName($user);

        if (!$conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Broadcast typing event (graceful fail if Reverb not running)
        try {
            broadcast(new TypingEvent(
                $conversation->id,
                $user->id,
                $userType,
                $userName,
                $request->is_typing
            ))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast typing event: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }

    /**
     * Load more messages (pagination)
     */
    public function loadMore(Request $request, Conversation $conversation)
    {
        $request->validate([
            'before_id' => 'required|integer',
        ]);

        $user = $this->getCurrentUser($request);

        if (!$conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $this->messageService->getMessages($conversation, 50, $request->before_id);

        return response()->json([
            'messages' => $messages->map(fn($m) => $this->formatMessage($m, $user)),
            'has_more' => $messages->hasMorePages(),
        ]);
    }

    private function getCurrentUser(Request $request)
    {
        if (auth('mahasiswa')->check()) {
            return auth('mahasiswa')->user();
        }
        if (auth('dosen')->check()) {
            return auth('dosen')->user();
        }
        return auth()->user();
    }

    private function formatMessage(Message $message, $currentUser): array
    {
        $currentType = $this->getUserType($currentUser);

        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_type' => $message->sender_type,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->getSenderName(),
            'sender_avatar' => $message->getSenderAvatar(),
            'content' => $message->getDisplayContent(),
            'type' => $message->type,
            'is_own' => $message->sender_type === $currentType && $message->sender_id === $currentUser->id,
            'is_edited' => $message->isEdited(),
            'is_deleted' => $message->isDeleted(),
            'can_edit' => $message->canEdit() && $message->sender_type === $currentType && $message->sender_id === $currentUser->id,
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'content' => $message->replyTo->getDisplayContent(),
                'sender_name' => $message->replyTo->getSenderName(),
            ] : null,
            'attachments' => $message->attachments->map(fn($a) => [
                'id' => $a->id,
                'file_name' => $a->file_name,
                'file_type' => $a->file_type,
                'file_size' => $a->formatted_size,
                'url' => $a->url,
                'is_image' => $a->is_image,
            ]),
            'reactions' => $message->reactions->groupBy('emoji')->map(fn($group, $emoji) => [
                'emoji' => $emoji,
                'count' => $group->count(),
                'users' => $group->map(fn($r) => $r->getReactorName()),
            ])->values(),
            'created_at' => $message->created_at->toISOString(),
        ];
    }
}
