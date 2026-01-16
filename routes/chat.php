<?php

use App\Http\Controllers\Chat\AttachmentController;
use App\Http\Controllers\Chat\ChatController;
use App\Http\Controllers\Chat\MessageController;
use App\Http\Controllers\Chat\ReactionController;
use App\Http\Controllers\Chat\SearchController;
use App\Http\Controllers\Chat\ConversationSettingsController;
use App\Http\Controllers\Chat\MessageActionsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Chat Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:web,mahasiswa,dosen'])->group(function () {
    // Chat pages - specific routes first
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/contacts/search', [ChatController::class, 'searchContacts'])->name('chat.contacts.search');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::post('/chat/course/{course}', [ChatController::class, 'createGroupForCourse'])->name('chat.course-group');
    // Wildcard route must be last
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');

    // Messages API
    Route::prefix('api/chat')->group(function () {
        // Messages
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
        Route::put('/messages/{message}', [MessageController::class, 'update']);
        Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
        Route::post('/conversations/{conversation}/read', [MessageController::class, 'markAsRead']);
        Route::post('/messages/{message}/forward', [MessageController::class, 'forward']);
        Route::post('/conversations/{conversation}/typing', [MessageController::class, 'typing']);
        Route::get('/conversations/{conversation}/messages', [MessageController::class, 'loadMore']);

        // Reactions
        Route::post('/messages/{message}/reactions', [ReactionController::class, 'store']);
        Route::delete('/messages/{message}/reactions/{emoji}', [ReactionController::class, 'destroy']);

        // Attachments
        Route::post('/messages/{message}/attachments', [AttachmentController::class, 'store']);
        Route::get('/attachments/{attachment}/download', [AttachmentController::class, 'download']);
        Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
        Route::get('/attachments/allowed-types', [AttachmentController::class, 'allowedTypes']);

        // Search
        Route::get('/search', [SearchController::class, 'search']);

        // Conversation Settings (pin, archive, mute)
        Route::post('/conversations/{conversation}/pin', [ConversationSettingsController::class, 'togglePin']);
        Route::post('/conversations/{conversation}/archive', [ConversationSettingsController::class, 'toggleArchive']);
        Route::post('/conversations/{conversation}/mute', [ConversationSettingsController::class, 'toggleMute']);
        Route::get('/conversations/{conversation}/info', [ConversationSettingsController::class, 'info']);

        // Message Actions (star, pin message, forward, info)
        Route::post('/messages/{message}/star', [MessageActionsController::class, 'toggleStar']);
        Route::post('/messages/{message}/pin', [MessageActionsController::class, 'togglePin']);
        Route::post('/messages/{message}/forward', [MessageActionsController::class, 'forward']);
        Route::get('/messages/{message}/info', [MessageActionsController::class, 'info']);
        Route::get('/starred-messages', [MessageActionsController::class, 'starredMessages']);
        Route::get('/conversations/{conversation}/pinned-messages', [MessageActionsController::class, 'pinnedMessages']);
    });
});
