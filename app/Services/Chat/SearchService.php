<?php

namespace App\Services\Chat;

use App\Models\Conversation;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchService
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
     * Search messages globally across all user's conversations
     */
    public function searchGlobal($user, string $query, int $perPage = 20): LengthAwarePaginator
    {
        $userType = $this->getUserType($user);

        return Message::whereHas('conversation.participants', function ($q) use ($userType, $user) {
                $q->where('participant_type', $userType)
                  ->where('participant_id', $user->id);
            })
            ->where(function ($q) use ($query) {
                $q->whereRaw('MATCH(content) AGAINST(? IN BOOLEAN MODE)', [$query])
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->with(['conversation', 'sender'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Search messages within a specific conversation
     */
    public function searchInConversation(Conversation $conversation, string $query, int $perPage = 20): LengthAwarePaginator
    {
        return $conversation->messages()
            ->where(function ($q) use ($query) {
                $q->whereRaw('MATCH(content) AGAINST(? IN BOOLEAN MODE)', [$query])
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->with(['sender', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Search messages by date range
     */
    public function searchByDateRange(
        $user,
        Carbon $startDate,
        Carbon $endDate,
        ?Conversation $conversation = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        $userType = $this->getUserType($user);

        $query = Message::whereBetween('created_at', [$startDate, $endDate])
            ->with(['conversation', 'sender']);

        if ($conversation) {
            $query->where('conversation_id', $conversation->id);
        } else {
            $query->whereHas('conversation.participants', function ($q) use ($userType, $user) {
                $q->where('participant_type', $userType)
                  ->where('participant_id', $user->id);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Search messages by type (text, image, file, etc.)
     */
    public function searchByType(
        $user,
        string $type,
        ?Conversation $conversation = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        $userType = $this->getUserType($user);

        $query = Message::where('type', $type)
            ->with(['conversation', 'sender', 'attachments']);

        if ($conversation) {
            $query->where('conversation_id', $conversation->id);
        } else {
            $query->whereHas('conversation.participants', function ($q) use ($userType, $user) {
                $q->where('participant_type', $userType)
                  ->where('participant_id', $user->id);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get messages with attachments
     */
    public function getMessagesWithAttachments(
        $user,
        ?Conversation $conversation = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        $userType = $this->getUserType($user);

        $query = Message::whereHas('attachments')
            ->with(['conversation', 'sender', 'attachments']);

        if ($conversation) {
            $query->where('conversation_id', $conversation->id);
        } else {
            $query->whereHas('conversation.participants', function ($q) use ($userType, $user) {
                $q->where('participant_type', $userType)
                  ->where('participant_id', $user->id);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Advanced search with multiple filters
     */
    public function advancedSearch(
        $user,
        ?string $query = null,
        ?string $type = null,
        ?Carbon $startDate = null,
        ?Carbon $endDate = null,
        ?Conversation $conversation = null,
        bool $hasAttachments = false,
        int $perPage = 20
    ): LengthAwarePaginator {
        $userType = $this->getUserType($user);

        $messageQuery = Message::with(['conversation', 'sender', 'attachments']);

        // Filter by conversation or user's conversations
        if ($conversation) {
            $messageQuery->where('conversation_id', $conversation->id);
        } else {
            $messageQuery->whereHas('conversation.participants', function ($q) use ($userType, $user) {
                $q->where('participant_type', $userType)
                  ->where('participant_id', $user->id);
            });
        }

        // Filter by search query
        if ($query) {
            $messageQuery->where(function ($q) use ($query) {
                $q->whereRaw('MATCH(content) AGAINST(? IN BOOLEAN MODE)', [$query])
                  ->orWhere('content', 'like', "%{$query}%");
            });
        }

        // Filter by type
        if ($type) {
            $messageQuery->where('type', $type);
        }

        // Filter by date range
        if ($startDate && $endDate) {
            $messageQuery->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $messageQuery->where('created_at', '>=', $startDate);
        } elseif ($endDate) {
            $messageQuery->where('created_at', '<=', $endDate);
        }

        // Filter by attachments
        if ($hasAttachments) {
            $messageQuery->whereHas('attachments');
        }

        return $messageQuery->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
