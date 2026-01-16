<?php

use App\Models\Conversation;
use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private channel for conversation messages
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    
    if (!$conversation) {
        return false;
    }
    
    // Check if user is a participant
    $userType = $user instanceof Mahasiswa ? Mahasiswa::class : User::class;
    
    return $conversation->participants()
        ->where('participant_type', $userType)
        ->where('participant_id', $user->id)
        ->exists();
});

// Presence channel for online status
Broadcast::channel('online', function ($user) {
    if ($user instanceof Mahasiswa) {
        return [
            'id' => $user->id,
            'type' => 'mahasiswa',
            'name' => $user->nama,
        ];
    }
    
    return [
        'id' => $user->id,
        'type' => 'user',
        'name' => $user->name,
    ];
});

// Private channel for user-specific notifications
Broadcast::channel('user.{userId}.{userType}', function ($user, $userId, $userType) {
    $currentType = $user instanceof Mahasiswa ? 'mahasiswa' : 'user';
    return (int) $user->id === (int) $userId && $currentType === $userType;
});
