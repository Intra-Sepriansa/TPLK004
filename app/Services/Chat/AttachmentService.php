<?php

namespace App\Services\Chat;

use App\Models\Message;
use App\Models\MessageAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AttachmentService
{
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    private const ALLOWED_TYPES = [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
        // Documents
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
        // Archives
        'zip', 'rar', '7z',
        // Audio
        'mp3', 'wav', 'ogg', 'm4a',
        // Video
        'mp4', 'avi', 'mov', 'webm',
    ];

    /**
     * Upload and attach file to message
     */
    public function uploadAttachment(Message $message, UploadedFile $file): MessageAttachment
    {
        $this->validateFile($file);

        $fileName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Generate unique path
        $path = $file->store('chat-attachments/' . date('Y/m'), 'public');

        return MessageAttachment::create([
            'message_id' => $message->id,
            'file_name' => $fileName,
            'file_path' => $path,
            'file_type' => $extension,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
        ]);
    }

    /**
     * Validate file before upload
     */
    public function validateFile(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $fileSize = $file->getSize();

        if (!in_array($extension, self::ALLOWED_TYPES)) {
            throw ValidationException::withMessages([
                'file' => "Tipe file '{$extension}' tidak diizinkan.",
            ]);
        }

        if ($fileSize > self::MAX_FILE_SIZE) {
            throw ValidationException::withMessages([
                'file' => 'Ukuran file maksimal 10MB.',
            ]);
        }
    }

    /**
     * Delete attachment and its file
     */
    public function deleteAttachment(MessageAttachment $attachment): bool
    {
        // Delete file from storage
        Storage::disk('public')->delete($attachment->file_path);

        // Delete record
        return $attachment->delete();
    }

    /**
     * Get allowed file types
     */
    public function getAllowedTypes(): array
    {
        return self::ALLOWED_TYPES;
    }

    /**
     * Get max file size in bytes
     */
    public function getMaxFileSize(): int
    {
        return self::MAX_FILE_SIZE;
    }

    /**
     * Get max file size formatted
     */
    public function getMaxFileSizeFormatted(): string
    {
        return '10MB';
    }
}
