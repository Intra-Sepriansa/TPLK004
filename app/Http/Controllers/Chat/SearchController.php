<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Mahasiswa;
use App\Services\Chat\SearchService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(private SearchService $searchService)
    {
    }

    /**
     * Search messages
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|min:2',
            'conversation_id' => 'nullable|exists:conversations,id',
            'type' => 'nullable|in:text,image,file',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'has_attachments' => 'nullable|boolean',
        ]);

        $user = $this->getCurrentUser($request);
        $conversation = $request->conversation_id 
            ? Conversation::find($request->conversation_id) 
            : null;

        // Check access
        if ($conversation && !$conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $this->searchService->advancedSearch(
            $user,
            $request->q,
            $request->type,
            $request->start_date ? Carbon::parse($request->start_date) : null,
            $request->end_date ? Carbon::parse($request->end_date) : null,
            $conversation,
            $request->boolean('has_attachments', false)
        );

        return response()->json([
            'messages' => $messages->map(fn($m) => [
                'id' => $m->id,
                'conversation_id' => $m->conversation_id,
                'conversation_name' => $m->conversation->name ?? 'Personal Chat',
                'content' => $m->getDisplayContent(),
                'sender_name' => $m->getSenderName(),
                'type' => $m->type,
                'created_at' => $m->created_at->toISOString(),
            ]),
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'total' => $messages->total(),
            ],
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
}
