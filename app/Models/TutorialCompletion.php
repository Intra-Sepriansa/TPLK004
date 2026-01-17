<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TutorialCompletion extends Model
{
    protected $fillable = [
        'learner_id',
        'learner_type',
        'tutorial_id',
        'completed',
        'skipped',
        'current_step',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'skipped' => 'boolean',
        'current_step' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the parent learner model (Mahasiswa, Dosen, or User).
     */
    public function learner(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Start a tutorial.
     */
    public function start(): self
    {
        if (!$this->started_at) {
            $this->started_at = now();
            $this->current_step = 1;
            $this->save();
        }
        return $this;
    }

    /**
     * Advance to the next step.
     */
    public function advanceStep(): self
    {
        $this->current_step++;
        $this->save();
        return $this;
    }

    /**
     * Set current step.
     */
    public function setStep(int $step): self
    {
        $this->current_step = $step;
        $this->save();
        return $this;
    }

    /**
     * Mark tutorial as completed.
     */
    public function markComplete(): self
    {
        $this->completed = true;
        $this->skipped = false;
        $this->completed_at = now();
        $this->save();
        return $this;
    }

    /**
     * Mark tutorial as skipped.
     */
    public function markSkipped(): self
    {
        $this->skipped = true;
        $this->completed = false;
        $this->completed_at = null;
        $this->save();
        return $this;
    }

    /**
     * Reset tutorial progress.
     */
    public function reset(): self
    {
        $this->completed = false;
        $this->skipped = false;
        $this->current_step = 0;
        $this->started_at = null;
        $this->completed_at = null;
        $this->save();
        return $this;
    }

    /**
     * Check if tutorial is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->started_at !== null && !$this->completed && !$this->skipped;
    }

    /**
     * Get or create tutorial completion for a user.
     */
    public static function getOrCreate(Model $user, string $tutorialId): self
    {
        return self::firstOrCreate(
            [
                'learner_id' => $user->id,
                'learner_type' => get_class($user),
                'tutorial_id' => $tutorialId,
            ],
            [
                'completed' => false,
                'skipped' => false,
                'current_step' => 0,
            ]
        );
    }

    /**
     * Get all tutorial completions for a user.
     */
    public static function getAllForUser(Model $user): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('learner_id', $user->id)
            ->where('learner_type', get_class($user))
            ->get();
    }

    /**
     * Get tutorial status for a user.
     */
    public static function getStatusForUser(Model $user): array
    {
        $completions = self::getAllForUser($user);
        
        return [
            'completed' => $completions->where('completed', true)->pluck('tutorial_id')->toArray(),
            'skipped' => $completions->where('skipped', true)->pluck('tutorial_id')->toArray(),
            'in_progress' => $completions->filter(fn($c) => $c->isInProgress())->pluck('tutorial_id')->toArray(),
        ];
    }

    /**
     * Check if user should see tutorial (first time or not skipped/completed).
     */
    public static function shouldShowTutorial(Model $user, string $tutorialId): bool
    {
        $completion = self::where('learner_id', $user->id)
            ->where('learner_type', get_class($user))
            ->where('tutorial_id', $tutorialId)
            ->first();

        // Show if no record exists (first time) or if in progress
        if (!$completion) {
            return true;
        }

        // Don't show if completed or skipped
        return !$completion->completed && !$completion->skipped;
    }

    /**
     * Start tutorial for user.
     */
    public static function startForUser(Model $user, string $tutorialId): self
    {
        $completion = self::getOrCreate($user, $tutorialId);
        return $completion->start();
    }

    /**
     * Complete tutorial for user.
     */
    public static function completeForUser(Model $user, string $tutorialId): self
    {
        $completion = self::getOrCreate($user, $tutorialId);
        return $completion->markComplete();
    }

    /**
     * Skip tutorial for user.
     */
    public static function skipForUser(Model $user, string $tutorialId): self
    {
        $completion = self::getOrCreate($user, $tutorialId);
        return $completion->markSkipped();
    }

    /**
     * Reset tutorial for user.
     */
    public static function resetForUser(Model $user, string $tutorialId): self
    {
        $completion = self::getOrCreate($user, $tutorialId);
        return $completion->reset();
    }
}
