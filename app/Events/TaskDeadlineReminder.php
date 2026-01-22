<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeadlineReminder implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $mahasiswaId;

    /**
     * Create a new event instance.
     */
    public function __construct($task, $mahasiswaId)
    {
        $this->task = $task;
        $this->mahasiswaId = $mahasiswaId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('mahasiswa.' . $this->mahasiswaId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'task.deadline.reminder';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => $this->task->judul,
            'course' => $this->task->course->nama,
            'deadline' => $this->task->deadline,
            'hours_remaining' => now()->diffInHours($this->task->deadline),
            'priority' => $this->task->prioritas,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
