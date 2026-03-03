<?php

namespace App\Services;

use App\Models\GaGroup;
use App\Models\GaMessage;
use App\Models\GaFile;
use App\Models\GaTask;
use App\Models\GaActivityLog;
use App\Models\Mahasiswa;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;

class GroupCollaborationService
{
    // ═══════ MESSAGING ═══════

    public function sendMessage(GaGroup $group, Mahasiswa $student, string $content, ?int $replyToId = null, ?int $attachmentId = null): GaMessage
    {
        $message = GaMessage::create([
            'group_id' => $group->id,
            'sender_id' => $student->id,
            'content' => $content,
            'type' => $attachmentId ? 'file' : 'text',
            'reply_to_id' => $replyToId,
            'attachment_id' => $attachmentId,
        ]);

        $this->logActivity($group, $student, 'message', ['message_id' => $message->id], 1);

        return $message->load(['sender', 'replyTo', 'attachment']);
    }

    public function deleteMessage(GaMessage $message, Mahasiswa $student): void
    {
        if ($message->sender_id !== $student->id) {
            throw new \Exception('Anda tidak diizinkan menghapus pesan ini.');
        }
        $message->update(['is_deleted' => true, 'content' => null]);
    }

    public function getGroupMessages(GaGroup $group, int $limit = 50, ?int $beforeId = null): Collection
    {
        $query = $group->messages()
            ->with(['sender', 'replyTo.sender', 'attachment', 'reactions.user', 'reads'])
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        return $query->get()->reverse()->values();
    }

    public function markMessagesAsRead(GaGroup $group, Mahasiswa $student): void
    {
        $unreadIds = $group->messages()
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $student->id))
            ->where('sender_id', '!=', $student->id)
            ->pluck('id');

        if ($unreadIds->isNotEmpty()) {
            $inserts = $unreadIds->map(fn ($id) => ['message_id' => $id, 'user_id' => $student->id, 'read_at' => now()])->toArray();
            \DB::table('ga_message_reads')->insert($inserts);
        }
    }

    public function addReaction(GaMessage $message, Mahasiswa $student, string $emoji): void
    {
        $message->reactions()->firstOrCreate([
            'user_id' => $student->id,
            'emoji' => $emoji,
        ]);
    }

    public function removeReaction(GaMessage $message, Mahasiswa $student, string $emoji): void
    {
        $message->reactions()->where('user_id', $student->id)->where('emoji', $emoji)->delete();
    }

    // ═══════ FILE SHARING ═══════

    public function uploadFile(GaGroup $group, Mahasiswa $student, UploadedFile $file): GaFile
    {
        $assignment = $group->assignment;
        $maxSizeBytes = ($assignment->max_file_size_mb ?? 25) * 1024 * 1024;
        if ($file->getSize() > $maxSizeBytes) {
            throw new \Exception("Ukuran file melebihi batas ({$assignment->max_file_size_mb}MB).");
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("ga-files/{$group->id}", $filename, 'public');

        $gaFile = GaFile::create([
            'group_id' => $group->id,
            'uploaded_by' => $student->id,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        $this->logActivity($group, $student, 'file_upload', [
            'file_id' => $gaFile->id,
            'filename' => $gaFile->original_name,
        ], 3);

        return $gaFile;
    }

    public function getGroupFiles(GaGroup $group): Collection
    {
        return $group->files()->with('uploader')->orderByDesc('uploaded_at')->get();
    }

    // ═══════ TASK MANAGEMENT ═══════

    public function createTask(GaGroup $group, Mahasiswa $student, array $data): GaTask
    {
        $task = GaTask::create([
            'group_id' => $group->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'created_by' => $student->id,
            'deadline' => $data['deadline'] ?? null,
            'status' => 'pending',
        ]);

        // Assign members if provided
        if (!empty($data['assignee_ids'])) {
            foreach ($data['assignee_ids'] as $assigneeId) {
                $task->assignees()->attach($assigneeId);
            }
        }

        $this->logActivity($group, $student, 'task_created', [
            'task_id' => $task->id,
            'title' => $task->title,
        ], 5);

        return $task->load('assignees');
    }

    public function updateTaskStatus(GaTask $task, Mahasiswa $student, string $status): GaTask
    {
        $update = ['status' => $status];
        if ($status === 'completed') {
            $update['completed_at'] = now();
            $update['completed_by'] = $student->id;

            $this->logActivity($task->group, $student, 'task_completed', [
                'task_id' => $task->id,
                'title' => $task->title,
            ], 5);
        }

        $task->update($update);
        return $task->fresh();
    }

    public function getGroupTasks(GaGroup $group): Collection
    {
        return $group->tasks()->with(['creator', 'assignees', 'completedByUser'])->orderByDesc('created_at')->get();
    }

    // ═══════ ACTIVITY LOGGING ═══════

    private function logActivity(GaGroup $group, Mahasiswa $student, string $type, array $metadata, int $points = 0): void
    {
        GaActivityLog::create([
            'group_id' => $group->id,
            'user_id' => $student->id,
            'activity_type' => $type,
            'activity_metadata' => $metadata,
            'points' => $points,
        ]);
    }
}
