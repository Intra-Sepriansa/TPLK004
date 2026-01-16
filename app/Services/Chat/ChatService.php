<?php

namespace App\Services\Chat;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ChatService
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
     * Get or create a personal conversation between two users
     */
    public function getOrCreatePersonalConversation($user1, $user2): Conversation
    {
        $user1Type = $this->getUserType($user1);
        $user2Type = $this->getUserType($user2);

        // Find existing personal conversation
        $conversation = Conversation::personal()
            ->whereHas('participants', function ($q) use ($user1Type, $user1) {
                $q->where('participant_type', $user1Type)
                  ->where('participant_id', $user1->id);
            })
            ->whereHas('participants', function ($q) use ($user2Type, $user2) {
                $q->where('participant_type', $user2Type)
                  ->where('participant_id', $user2->id);
            })
            ->first();

        if ($conversation) {
            return $conversation;
        }

        // Create new personal conversation
        return DB::transaction(function () use ($user1, $user1Type, $user2, $user2Type) {
            $conversation = Conversation::create([
                'type' => 'personal',
                'created_by_type' => $user1Type,
                'created_by_id' => $user1->id,
            ]);

            // Add both participants
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'participant_type' => $user1Type,
                'participant_id' => $user1->id,
                'role' => 'member',
                'joined_at' => now(),
            ]);

            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'participant_type' => $user2Type,
                'participant_id' => $user2->id,
                'role' => 'member',
                'joined_at' => now(),
            ]);

            return $conversation;
        });
    }

    /**
     * Create a group conversation
     */
    public function createGroupConversation($creator, string $name, ?string $description = null, ?int $courseId = null, array $participantIds = []): Conversation
    {
        $creatorType = $this->getUserType($creator);

        return DB::transaction(function () use ($creator, $creatorType, $name, $description, $courseId, $participantIds) {
            $conversation = Conversation::create([
                'type' => 'group',
                'name' => $name,
                'description' => $description,
                'course_id' => $courseId,
                'created_by_type' => $creatorType,
                'created_by_id' => $creator->id,
            ]);

            // Add creator as admin
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'participant_type' => $creatorType,
                'participant_id' => $creator->id,
                'role' => 'admin',
                'joined_at' => now(),
            ]);

            // Add other participants
            foreach ($participantIds as $participant) {
                ConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'participant_type' => $participant['type'],
                    'participant_id' => $participant['id'],
                    'role' => 'member',
                    'joined_at' => now(),
                ]);
            }

            return $conversation;
        });
    }

    /**
     * Get all conversations for a user
     */
    public function getConversationsForUser($user): Collection
    {
        $userType = $this->getUserType($user);

        return Conversation::forUser($user)
            ->with(['participants.participant', 'latestMessage.sender'])
            ->withCount(['messages as unread_count' => function ($q) use ($userType, $user) {
                $q->whereHas('conversation.participants', function ($pq) use ($userType, $user) {
                    $pq->where('participant_type', $userType)
                       ->where('participant_id', $user->id)
                       ->whereColumn('messages.created_at', '>', 'conversation_participants.last_read_at');
                });
            }])
            ->orderByDesc(function ($q) {
                $q->select('created_at')
                  ->from('messages')
                  ->whereColumn('conversation_id', 'conversations.id')
                  ->latest()
                  ->limit(1);
            })
            ->get();
    }

    /**
     * Add participant to conversation
     */
    public function addParticipant(Conversation $conversation, $user, string $role = 'member'): ConversationParticipant
    {
        $userType = $this->getUserType($user);

        return ConversationParticipant::firstOrCreate(
            [
                'conversation_id' => $conversation->id,
                'participant_type' => $userType,
                'participant_id' => $user->id,
            ],
            [
                'role' => $role,
                'joined_at' => now(),
            ]
        );
    }

    /**
     * Remove participant from conversation
     */
    public function removeParticipant(Conversation $conversation, $user): bool
    {
        $userType = $this->getUserType($user);

        return $conversation->participants()
            ->where('participant_type', $userType)
            ->where('participant_id', $user->id)
            ->delete() > 0;
    }

    /**
     * Search contacts (users, mahasiswa, and dosen)
     */
    public function searchContacts(string $query, $currentUser, int $limit = 20): array
    {
        $currentType = $this->getUserType($currentUser);
        
        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit($limit)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'type' => User::class,
                'name' => $u->name,
                'identifier' => $u->email,
                'avatar' => $u->avatar_url,
            ])
            ->toArray();

        $mahasiswa = Mahasiswa::where('nama', 'like', "%{$query}%")
            ->orWhere('nim', 'like', "%{$query}%")
            ->limit($limit)
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'type' => Mahasiswa::class,
                'name' => $m->nama,
                'identifier' => $m->nim,
                'avatar' => $m->avatar_url,
            ])
            ->toArray();

        $dosen = Dosen::where('nama', 'like', "%{$query}%")
            ->orWhere('nidn', 'like', "%{$query}%")
            ->limit($limit)
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'type' => Dosen::class,
                'name' => $d->nama,
                'identifier' => $d->nidn,
                'avatar' => $d->avatar_url,
            ])
            ->toArray();

        $all = array_merge($users, $mahasiswa, $dosen);
        
        // Filter out current user
        $filtered = array_filter($all, fn($c) => !($c['type'] === $currentType && $c['id'] === $currentUser->id));
        
        return array_slice(array_values($filtered), 0, $limit);
    }
}
