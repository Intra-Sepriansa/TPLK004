<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Course;
use App\Models\Mahasiswa;
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
        $otherParticipant = $conversation->type === 'personal' 
            ? $conversation->getOtherParticipant($currentUser)
            : null;

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
            ] : null,
            'unread_count' => $conversation->unread_count ?? 0,
            'updated_at' => $conversation->updated_at->toISOString(),
        ];
    }

    /**
     * Format conversation with messages
     */
    private function formatConversationDetail(Conversation $conversation, $currentUser): array
    {
        $currentType = $this->getUserType($currentUser);

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversation->type === 'personal'
                ? $conversation->getOtherParticipant($currentUser)?->getParticipantName() ?? 'Unknown'
                : $conversation->name,
            'description' => $conversation->description,
            'avatar' => $conversation->avatar_url,
            'participants' => $conversation->participants->map(fn($p) => [
                'id' => $p->id,
                'participant_id' => $p->participant_id,
                'participant_type' => $p->participant_type,
                'name' => $p->getParticipantName(),
                'avatar' => $p->getParticipantAvatar(),
                'role' => $p->role,
                'is_current' => $p->participant_type === $currentType && $p->participant_id === $currentUser->id,
            ]),
            'messages' => $conversation->messages->values()->map(fn($m) => [
                'id' => $m->id,
                'sender_type' => $m->sender_type,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->getSenderName(),
                'sender_avatar' => $m->getSenderAvatar(),
                'content' => $m->getDisplayContent(),
                'type' => $m->type,
                'is_own' => $m->sender_type === $currentType && $m->sender_id === $currentUser->id,
                'is_edited' => $m->isEdited(),
                'is_deleted' => $m->isDeleted(),
                'can_edit' => $m->canEdit() && $m->sender_type === $currentType && $m->sender_id === $currentUser->id,
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
            ]),
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
