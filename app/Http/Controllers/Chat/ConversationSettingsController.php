<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationSettingsController extends Controller
{
    /**
     * Toggle pin conversation
     */
    public function togglePin(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('participant_type', get_class($user))
            ->where('participant_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Not a participant'], 403);
        }

        $participant->is_pinned = !$participant->is_pinned;
        $participant->save();

        return response()->json([
            'success' => true,
            'is_pinned' => $participant->is_pinned,
            'message' => $participant->is_pinned ? 'Chat disematkan' : 'Sematan dilepas',
        ]);
    }

    /**
     * Toggle archive conversation
     */
    public function toggleArchive(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('participant_type', get_class($user))
            ->where('participant_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Not a participant'], 403);
        }

        $participant->is_archived = !$participant->is_archived;
        $participant->save();

        return response()->json([
            'success' => true,
            'is_archived' => $participant->is_archived,
            'message' => $participant->is_archived ? 'Chat diarsipkan' : 'Arsip dibatalkan',
        ]);
    }

    /**
     * Toggle mute conversation
     */
    public function toggleMute(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('participant_type', get_class($user))
            ->where('participant_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Not a participant'], 403);
        }

        $participant->is_muted = !$participant->is_muted;
        $participant->save();

        return response()->json([
            'success' => true,
            'is_muted' => $participant->is_muted,
            'message' => $participant->is_muted ? 'Notifikasi dibisukan' : 'Notifikasi dibunyikan',
        ]);
    }

    /**
     * Get conversation info
     */
    public function info(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $this->getCurrentUser($request);
        
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('participant_type', get_class($user))
            ->where('participant_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['error' => 'Not a participant'], 403);
        }

        $conversation->load(['participants.participant']);

        $participants = $conversation->participants->map(function ($p) {
            return [
                'id' => $p->participant_id,
                'type' => $p->participant_type,
                'name' => $p->getParticipantName(),
                'avatar' => $p->getParticipantAvatar(),
                'role' => $p->role,
                'joined_at' => $p->joined_at?->toISOString(),
            ];
        });

        return response()->json([
            'id' => $conversation->id,
            'type' => $conversation->type,
            'name' => $conversation->name,
            'description' => $conversation->description,
            'avatar' => $conversation->avatar,
            'created_at' => $conversation->created_at->toISOString(),
            'participants' => $participants,
            'is_pinned' => $participant->is_pinned,
            'is_archived' => $participant->is_archived,
            'is_muted' => $participant->is_muted,
        ]);
    }

    private function getCurrentUser(Request $request)
    {
        // Try dosen auth first
        if (auth('dosen')->check()) {
            return auth('dosen')->user();
        }
        
        // Try mahasiswa auth
        if (auth('mahasiswa')->check()) {
            return auth('mahasiswa')->user();
        }
        
        // Fallback to default auth
        return auth()->user();
    }
}
