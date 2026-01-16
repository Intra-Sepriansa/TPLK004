<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Services\Chat\AttachmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function __construct(private AttachmentService $attachmentService)
    {
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
     * Upload attachment to message
     */
    public function store(Request $request, Message $message)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
        ]);

        $user = $this->getCurrentUser($request);

        // Check if user is participant
        if (!$message->conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if user is sender
        $userType = $this->getUserType($user);
        if ($message->sender_type !== $userType || $message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $attachment = $this->attachmentService->uploadAttachment($message, $request->file('file'));

        return response()->json([
            'attachment' => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_type' => $attachment->file_type,
                'file_size' => $attachment->formatted_size,
                'url' => $attachment->url,
                'is_image' => $attachment->is_image,
            ],
        ]);
    }

    /**
     * Download attachment
     */
    public function download(Request $request, MessageAttachment $attachment)
    {
        $user = $this->getCurrentUser($request);

        // Check if user is participant
        if (!$attachment->message->conversation->isParticipant($user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    /**
     * Delete attachment
     */
    public function destroy(Request $request, MessageAttachment $attachment)
    {
        $user = $this->getCurrentUser($request);
        $userType = $this->getUserType($user);

        // Check if user is sender
        if ($attachment->message->sender_type !== $userType || $attachment->message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->attachmentService->deleteAttachment($attachment);

        return response()->json(['success' => true]);
    }

    /**
     * Get allowed file types
     */
    public function allowedTypes()
    {
        return response()->json([
            'types' => $this->attachmentService->getAllowedTypes(),
            'max_size' => $this->attachmentService->getMaxFileSizeFormatted(),
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
