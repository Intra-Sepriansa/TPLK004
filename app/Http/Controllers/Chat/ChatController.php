<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Course;
use App\Models\Mahasiswa;
use App\Models\PinnedMessage;
use App\Models\StarredMessage;
use App\Models\User;
use App\Services\Chat\ChatService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __construct(private ChatService $chatService)
    {
    }

    /**
     * Display chat page with conversation list
     */
    public function index(Request $request): Response
    {
        $user = $this->getCurrentUser($request);
        $conversations = $this->chatService->getConversationsForUser($user);

        return Inertia::render('chat/index', [
            'conversations' => $conversations->map(fn($c) => $this->formatConversation($c, $user)),
            'currentUser' => $this->formatUser($user),
        ]);
    }

    /**
     * Show specific conversation
     */
    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $this->getCurrentUser($request);

        // Check if user is participant
        if (!$conversation->isParticipant($user)) {
            abort(403, 'Anda tidak memiliki akses ke percakapan ini.');
        }

        $conversations = $this->chatService->getConversationsForUser($user);
        
        $conversation->load(['participants.participant', 'messages' => function ($q) {
            $q->with(['sender', 'attachments', 'reactions.reactor', 'replyTo.sender'])
              ->orderBy('created_at', 'asc')
              ->limit(50);
        }]);

        // Mark as read
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
        $conversation->participants()
            ->where('participant_type', $userType)
            ->where('participant_id', $user->id)
            ->update(['last_read_at' => now()]);

        return Inertia::render('chat/index', [
            'conversations' => $conversations->map(fn($c) => $this->formatConversation($c, $user)),
            'activeConversation' => $this->formatConversationDetail($conversation, $user),
            'currentUser' => $this->formatUser($user),
        ]);
    }

    /**
     * Create new conversation
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:personal,group',
            'participant_id' => 'required_if:type,personal|integer',
            'participant_type' => 'required_if:type,personal|string',
            'name' => 'required_if:type,group|string|max:255',
            'description' => 'nullable|string|max:1000',
            'participants' => 'required_if:type,group|array',
        ]);

        $user = $this->getCurrentUser($request);

        if ($request->type === 'personal') {
            $otherUser = $request->participant_type === Mahasiswa::class
                ? Mahasiswa::findOrFail($request->participant_id)
                : User::findOrFail($request->participant_id);

            $conversation = $this->chatService->getOrCreatePersonalConversation($user, $otherUser);
        } else {
            $conversation = $this->chatService->createGroupConversation(
                $user,
                $request->name,
                $request->description,
                $request->course_id,
                $request->participants ?? []
            );
        }

        return redirect("/chat/{$conversation->id}");
    }

    /**
     * Create group for course
     */
    public function createGroupForCourse(Request $request, Course $course)
    {
        $user = $this->getCurrentUser($request);
        $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;

        // Check if group already exists
        $existing = Conversation::where('course_id', $course->id)->first();
        if ($existing) {
            return redirect("/chat/{$existing->id}");
        }

        // Get enrolled students
        $participants = [];
        // Add course dosen if exists
        if ($course->dosen_id) {
            $participants[] = ['type' => User::class, 'id' => $course->dosen_id];
        }

        $conversation = $this->chatService->createGroupConversation(
            $user,
            "Grup {$course->nama}",
            "Grup diskusi untuk mata kuliah {$course->nama}",
            $course->id,
            $participants
        );

        return redirect("/chat/{$conversation->id}");
    }

    /**
     * Search contacts
     */
    public function searchContacts(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);
        
        $user = $this->getCurrentUser($request);
        $contacts = $this->chatService->searchContacts($request->q, $user);

        return response()->json(['contacts' => $contacts]);
    }

    /**
     * Get current authenticated user (User, Mahasiswa, or Dosen)
     */
    private function getCurrentUser(Request $request)
    {
        // Check mahasiswa guard first
        if (auth('mahasiswa')->check()) {
            return auth('mahasiswa')->user();
        }
        
        // Check dosen guard
        if (auth('dosen')->check()) {
            return auth('dosen')->user();
        }
        
        // Default to web guard (admin)
        return auth()->user();
    }

    /**
     * Format conversation for list
     */
    private function formatConversation(Conversation $conversation, $currentUser): array
    {
        $currentType = $this->getUserType($currentUser);
        $otherParticipant = $conversation->type === 'personal' 
            ? $conversation->getOtherParticipant($currentUser)
            : null;

        // Get participant settings (pinned, archived, muted)
        $participantSettings = $conversation->participants
            ->where('participant_type', $currentType)
            ->where('participant_id', $currentUser->id)
            ->first();

        // Get online status for personal chats
        $isOnline = false;
        $lastSeen = null;
        if ($conversation->type === 'personal' && $otherParticipant) {
            $otherUser = $otherParticipant->participant;
            if ($otherUser) {
                $isOnline = $this->isUserOnline($otherUser);
                $lastSeen = $otherUser->last_activity_at ?? $otherUser->updated_at;
            }
        }

        // Check if last message is from current user
        $lastMessageIsOwn = false;
        $lastMessageStatus = 'sent';
        if ($conversation->latestMessage) {
            $lastMessageIsOwn = $conversation->latestMessage->sender_type === $currentType 
                && $conversation->latestMessage->sender_id === $currentUser->id;
            
            // Calculate status for own messages
            if ($lastMessageIsOwn) {
                $messageCreatedAt = $conversation->latestMessage->created_at;
                
                // Get last_read_at for other participants
                $otherParticipantsLastRead = $conversation->participants
                    ->filter(fn($p) => !($p->participant_type === $currentType && $p->participant_id === $currentUser->id))
                    ->map(fn($p) => $p->last_read_at)
                    ->filter()
                    ->toArray();
                
                $hasBeenRead = false;
                $hasBeenDelivered = false;
                
                foreach ($otherParticipantsLastRead as $lastRead) {
                    if ($lastRead && $lastRead >= $messageCreatedAt) {
                        $hasBeenRead = true;
                        break;
                    }
                    if ($lastRead) {
                        $hasBeenDelivered = true;
                    }
                }
                
                if ($hasBeenRead) {
                    $lastMessageStatus = 'read';
                } elseif ($hasBeenDelivered || $isOnline) {
                    $lastMessageStatus = 'delivered';
                }
            }
        }

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversation->type === 'personal' 
                ? $otherParticipant?->getParticipantName() ?? 'Unknown'
                : $conversation->name,
            'avatar' => $conversation->type === 'personal'
                ? $otherParticipant?->getParticipantAvatar()
                : $conversation->avatar_url,
            'last_message' => $conversation->latestMessage ? [
                'content' => $conversation->latestMessage->getDisplayContent(),
                'sender_name' => $conversation->latestMessage->getSenderName(),
                'created_at' => $conversation->latestMessage->created_at->toISOString(),
                'is_own' => $lastMessageIsOwn,
                'status' => $lastMessageStatus,
            ] : null,
            'unread_count' => $conversation->unread_count ?? 0,
            'updated_at' => $conversation->updated_at->toISOString(),
            'is_pinned' => $participantSettings?->is_pinned ?? false,
            'is_archived' => $participantSettings?->is_archived ?? false,
            'is_muted' => $participantSettings?->is_muted ?? false,
            'is_online' => $isOnline,
            'last_seen' => $lastSeen?->toISOString(),
        ];
    }

    /**
     * Check if user is online (active within last 5 minutes)
     */
    private function isUserOnline($user): bool
    {
        if (!$user) return false;
        
        $lastActivity = $user->last_activity_at ?? $user->updated_at;
        if (!$lastActivity) return false;
        
        // Convert to Carbon if it's a string
        if (is_string($lastActivity)) {
            $lastActivity = \Carbon\Carbon::parse($lastActivity);
        }
        
        return $lastActivity->diffInMinutes(now()) < 5;
    }

    /**
     * Format conversation with messages
     */
    private function formatConversationDetail(Conversation $conversation, $currentUser): array
    {
        $currentType = $this->getUserType($currentUser);

        // Get starred message IDs for current user
        $starredMessageIds = StarredMessage::where('user_type', $currentType)
            ->where('user_id', $currentUser->id)
            ->whereIn('message_id', $conversation->messages->pluck('id'))
            ->pluck('message_id')
            ->toArray();

        // Get pinned message IDs in this conversation
        $pinnedMessageIds = PinnedMessage::where('conversation_id', $conversation->id)
            ->pluck('message_id')
            ->toArray();

        // Get online status for personal chats
        $isOnline = false;
        $lastSeen = null;
        if ($conversation->type === 'personal') {
            $otherParticipant = $conversation->getOtherParticipant($currentUser);
            if ($otherParticipant) {
                $otherUser = $otherParticipant->participant;
                if ($otherUser) {
                    $isOnline = $this->isUserOnline($otherUser);
                    $lastSeen = $otherUser->last_activity_at ?? $otherUser->updated_at;
                }
            }
        }

        // Get last_read_at for all other participants to determine message status
        $otherParticipantsLastRead = $conversation->participants
            ->filter(fn($p) => !($p->participant_type === $currentType && $p->participant_id === $currentUser->id))
            ->map(fn($p) => $p->last_read_at)
            ->filter()
            ->toArray();

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversation->type === 'personal'
                ? $conversation->getOtherParticipant($currentUser)?->getParticipantName() ?? 'Unknown'
                : $conversation->name,
            'description' => $conversation->description,
            'avatar' => $conversation->avatar_url,
            'is_online' => $isOnline,
            'last_seen' => $lastSeen?->toISOString(),
            'participants' => $conversation->participants->map(fn($p) => [
                'id' => $p->id,
                'participant_id' => $p->participant_id,
                'participant_type' => $p->participant_type,
                'name' => $p->getParticipantName(),
                'avatar' => $p->getParticipantAvatar(),
                'role' => $p->role,
                'is_current' => $p->participant_type === $currentType && $p->participant_id === $currentUser->id,
                'is_online' => $this->isUserOnline($p->participant),
                'last_seen' => ($p->participant->last_activity_at ?? $p->participant->updated_at)?->toISOString(),
            ]),
            'messages' => $conversation->messages->values()->map(function($m) use ($currentType, $currentUser, $starredMessageIds, $pinnedMessageIds, $otherParticipantsLastRead, $isOnline) {
                $isOwn = $m->sender_type === $currentType && $m->sender_id === $currentUser->id;
                
                // Determine message status for own messages
                // sent = terkirim ke server (default)
                // delivered = terkirim ke penerima (penerima online atau pernah buka chat setelah pesan dikirim)
                // read = sudah dibaca (last_read_at penerima >= created_at pesan)
                $status = 'sent';
                if ($isOwn) {
                    // Check if any other participant has read this message
                    $messageCreatedAt = $m->created_at;
                    $hasBeenRead = false;
                    $hasBeenDelivered = false;
                    
                    foreach ($otherParticipantsLastRead as $lastRead) {
                        if ($lastRead && $lastRead >= $messageCreatedAt) {
                            $hasBeenRead = true;
                            break;
                        }
                        if ($lastRead) {
                            $hasBeenDelivered = true;
                        }
                    }
                    
                    if ($hasBeenRead) {
                        $status = 'read';
                    } elseif ($hasBeenDelivered || $isOnline) {
                        // If other participant is online or has opened chat before, mark as delivered
                        $status = 'delivered';
                    }
                }
                
                return [
                    'id' => $m->id,
                    'sender_type' => $m->sender_type,
                    'sender_id' => $m->sender_id,
                    'sender_name' => $m->getSenderName(),
                    'sender_avatar' => $m->getSenderAvatar(),
                    'content' => $m->getDisplayContent(),
                    'type' => $m->type,
                    'is_own' => $isOwn,
                    'is_edited' => $m->isEdited(),
                    'is_deleted' => $m->isDeleted(),
                    'can_edit' => $m->canEdit() && $isOwn,
                    'is_starred' => in_array($m->id, $starredMessageIds),
                    'is_pinned' => in_array($m->id, $pinnedMessageIds),
                    'status' => $status,
                    'reply_to' => $m->replyTo ? [
                        'id' => $m->replyTo->id,
                        'content' => $m->replyTo->getDisplayContent(),
                        'sender_name' => $m->replyTo->getSenderName(),
                    ] : null,
                    'attachments' => $m->attachments->map(fn($a) => [
                        'id' => $a->id,
                        'file_name' => $a->file_name,
                        'file_type' => $a->file_type,
                        'file_size' => $a->formatted_size,
                        'url' => $a->url,
                        'is_image' => $a->is_image,
                    ]),
                    'reactions' => $m->reactions->groupBy('emoji')->map(fn($group, $emoji) => [
                        'emoji' => $emoji,
                        'count' => $group->count(),
                        'users' => $group->map(fn($r) => $r->getReactorName()),
                    ])->values(),
                    'created_at' => $m->created_at->toISOString(),
                ];
            }),
            'is_admin' => $conversation->isAdmin($currentUser),
        ];
    }

    /**
     * Format user data
     */
    private function formatUser($user): array
    {
        if ($user instanceof Mahasiswa) {
            return [
                'id' => $user->id,
                'type' => Mahasiswa::class,
                'name' => $user->nama,
                'identifier' => $user->nim,
                'avatar' => $user->avatar_url,
            ];
        }

        if ($user instanceof \App\Models\Dosen) {
            return [
                'id' => $user->id,
                'type' => \App\Models\Dosen::class,
                'name' => $user->nama,
                'identifier' => $user->nidn,
                'avatar' => $user->avatar_url,
            ];
        }

        return [
            'id' => $user->id,
            'type' => User::class,
            'name' => $user->name,
            'identifier' => $user->email,
            'avatar' => $user->avatar_url,
        ];
    }

    /**
     * Get user type class
     */
    private function getUserType($user): string
    {
        if ($user instanceof Mahasiswa) {
            return Mahasiswa::class;
        }
        if ($user instanceof \App\Models\Dosen) {
            return \App\Models\Dosen::class;
        }
        return User::class;
    }
}
