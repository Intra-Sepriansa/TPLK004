<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Events\Chat\MessageReactionEvent;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\User;
use Illuminate\Http\Request;

class ReactionController extends Controller
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
     * Add reaction to message
     */
    public function store(Request $request, Message $message)
    {
        $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);
        $userName = $this->getUserName($user);

        // Check if user is participant
        if (!$message->conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if reaction already exists
        $existing = MessageReaction::where('message_id', $message->id)
            ->where('reactor_type', $userType)
            ->where('reactor_id', $user->id)
            ->where('emoji', $request->emoji)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Reaksi sudah ada'], 422);
        }

        $reaction = MessageReaction::create([
            'message_id' => $message->id,
            'reactor_type' => $userType,
            'reactor_id' => $user->id,
            'emoji' => $request->emoji,
        ]);

        // Broadcast reaction event
        broadcast(new MessageReactionEvent(
            $message->id,
            $message->conversation_id,
            'added',
            $request->emoji,
            $user->id,
            $userType,
            $userName
        ))->toOthers();

        return response()->json([
            'reaction' => [
                'id' => $reaction->id,
                'emoji' => $reaction->emoji,
                'reactor_name' => $userName,
            ],
        ]);
    }

    /**
     * Remove reaction from message
     */
    public function destroy(Request $request, Message $message, string $emoji)
    {
        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);
        $userName = $this->getUserName($user);

        $reaction = MessageReaction::where('message_id', $message->id)
            ->where('reactor_type', $userType)
            ->where('reactor_id', $user->id)
            ->where('emoji', $emoji)
            ->first();

        if (!$reaction) {
            return response()->json(['error' => 'Reaksi tidak ditemukan'], 404);
        }

        $reaction->delete();

        // Broadcast reaction event
        broadcast(new MessageReactionEvent(
            $message->id,
            $message->conversation_id,
            'removed',
            $emoji,
            $user->id,
            $userType,
            $userName
        ))->toOthers();

        return response()->json(['success' => true]);
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
