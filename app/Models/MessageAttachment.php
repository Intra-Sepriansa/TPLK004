<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = [
        'message_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['url'];

    // Relationships
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    // Accessors
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    public function getIsImageAttribute(): bool
    {
        return in_array($this->file_type, ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp']) 
            || str_starts_with($this->mime_type, 'image/');
    }

    public function getIsDocumentAttribute(): bool
    {
        return in_array($this->file_type, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']);
    }

    public function getIsVideoAttribute(): bool
    {
        return in_array($this->file_type, ['mp4', 'avi', 'mov', 'webm'])
            || str_starts_with($this->mime_type, 'video/');
    }

    public function getIsAudioAttribute(): bool
    {
        return in_array($this->file_type, ['mp3', 'wav', 'ogg', 'm4a'])
            || str_starts_with($this->mime_type, 'audio/');
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        
        return $bytes . ' bytes';
    }

    // Methods
    public function deleteFile(): bool
    {
        return Storage::disk('public')->delete($this->file_path);
    }
}
