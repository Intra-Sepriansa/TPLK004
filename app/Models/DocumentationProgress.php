<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentationProgress extends Model
{
    protected $table = 'documentation_progress';

    protected $fillable = [
        'reader_id',
        'reader_type',
        'guide_id',
        'completed_sections',
        'is_completed',
        'last_read_at',
    ];

    protected $casts = [
        'completed_sections' => 'array',
        'is_completed' => 'boolean',
        'last_read_at' => 'datetime',
    ];

    /**
     * Required sections for a guide to be considered complete
     */
    public const REQUIRED_SECTIONS = [
        'overview',
        'features',
        'tutorial',
        'tips',
        'faq',
    ];

    /**
     * Get the parent reader model (Mahasiswa, Dosen, or User).
     */
    public function reader(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Mark a section as completed.
     */
    public function markSectionComplete(string $section): self
    {
        $sections = $this->completed_sections ?? [];
        if (!in_array($section, $sections)) {
            $sections[] = $section;
            $this->completed_sections = $sections;
            $this->last_read_at = now();
            $this->checkCompletion();
            $this->save();
        }
        return $this;
    }

    /**
     * Mark multiple sections as completed.
     */
    public function markSectionsComplete(array $sections): self
    {
        $currentSections = $this->completed_sections ?? [];
        $this->completed_sections = array_unique(array_merge($currentSections, $sections));
        $this->last_read_at = now();
        $this->checkCompletion();
        $this->save();
        return $this;
    }

    /**
     * Mark guide as fully completed.
     */
    public function markComplete(): self
    {
        $this->completed_sections = self::REQUIRED_SECTIONS;
        $this->is_completed = true;
        $this->last_read_at = now();
        $this->save();
        return $this;
    }

    /**
     * Check if all required sections are completed and update is_completed flag.
     */
    protected function checkCompletion(): void
    {
        $completedSections = $this->completed_sections ?? [];
        $allComplete = count(array_intersect(self::REQUIRED_SECTIONS, $completedSections)) === count(self::REQUIRED_SECTIONS);
        $this->is_completed = $allComplete;
    }

    /**
     * Get completion percentage.
     */
    public function getCompletionPercentage(): int
    {
        $completedSections = $this->completed_sections ?? [];
        $completedCount = count(array_intersect(self::REQUIRED_SECTIONS, $completedSections));
        return (int) round(($completedCount / count(self::REQUIRED_SECTIONS)) * 100);
    }

    /**
     * Check if a specific section is completed.
     */
    public function isSectionCompleted(string $section): bool
    {
        return in_array($section, $this->completed_sections ?? []);
    }

    /**
     * Get or create progress for a user and guide.
     */
    public static function getOrCreate(Model $user, string $guideId): self
    {
        return self::firstOrCreate(
            [
                'reader_id' => $user->id,
                'reader_type' => get_class($user),
                'guide_id' => $guideId,
            ],
            [
                'completed_sections' => [],
                'is_completed' => false,
            ]
        );
    }

    /**
     * Get all progress for a user.
     */
    public static function getAllForUser(Model $user): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('reader_id', $user->id)
            ->where('reader_type', get_class($user))
            ->get();
    }

    /**
     * Get overall progress statistics for a user.
     */
    public static function getStatsForUser(Model $user, int $totalGuides): array
    {
        $progress = self::getAllForUser($user);
        $completedGuides = $progress->where('is_completed', true)->count();
        $inProgressGuides = $progress->where('is_completed', false)->count();

        return [
            'total_guides' => $totalGuides,
            'completed_guides' => $completedGuides,
            'in_progress_guides' => $inProgressGuides,
            'not_started_guides' => $totalGuides - $completedGuides - $inProgressGuides,
            'completion_percentage' => $totalGuides > 0 
                ? (int) round(($completedGuides / $totalGuides) * 100) 
                : 0,
        ];
    }

    /**
     * Reset progress for a user and guide.
     */
    public static function resetForUser(Model $user, string $guideId): void
    {
        self::where('reader_id', $user->id)
            ->where('reader_type', get_class($user))
            ->where('guide_id', $guideId)
            ->delete();
    }
}
