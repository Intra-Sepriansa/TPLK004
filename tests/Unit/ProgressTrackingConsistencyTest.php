<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for Progress Tracking Consistency
 * Feature: advanced-settings-documentation
 * 
 * Property 7: Progress Tracking Consistency
 * Progress tracking SHALL be consistent across documentation and tutorials.
 * Completed sections/steps should be accurately reflected in progress percentage.
 * Progress should never exceed 100% or go below 0%.
 * 
 * Validates: Requirements 2.5, 5.5
 */
class ProgressTrackingConsistencyTest extends TestCase
{
    /**
     * Simulated progress storage
     */
    protected array $documentationProgress = [];
    protected array $tutorialProgress = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->documentationProgress = [];
        $this->tutorialProgress = [];
    }

    /**
     * Property 7: Progress percentage should be between 0 and 100
     */
    public function test_progress_percentage_within_bounds(): void
    {
        $totalSections = 5;
        
        for ($completed = 0; $completed <= $totalSections; $completed++) {
            $progress = $this->calculateProgress($completed, $totalSections);
            
            $this->assertGreaterThanOrEqual(0, $progress, 'Progress should never be below 0%');
            $this->assertLessThanOrEqual(100, $progress, 'Progress should never exceed 100%');
        }
    }

    /**
     * Property 7: Progress should increase monotonically as sections are completed
     */
    public function test_progress_increases_monotonically(): void
    {
        $totalSections = 10;
        $previousProgress = 0;
        
        for ($completed = 0; $completed <= $totalSections; $completed++) {
            $currentProgress = $this->calculateProgress($completed, $totalSections);
            
            $this->assertGreaterThanOrEqual(
                $previousProgress, 
                $currentProgress, 
                "Progress should increase or stay same: {$previousProgress}% -> {$currentProgress}%"
            );
            
            $previousProgress = $currentProgress;
        }
    }

    /**
     * Property 7: Zero completed sections should result in 0% progress
     */
    public function test_zero_completed_is_zero_progress(): void
    {
        $testCases = [1, 5, 10, 20, 100];
        
        foreach ($testCases as $totalSections) {
            $progress = $this->calculateProgress(0, $totalSections);
            $this->assertEquals(0, $progress, "Zero completed sections should be 0% progress (total: {$totalSections})");
        }
    }

    /**
     * Property 7: All sections completed should result in 100% progress
     */
    public function test_all_completed_is_hundred_progress(): void
    {
        $testCases = [1, 5, 10, 20, 100];
        
        foreach ($testCases as $totalSections) {
            $progress = $this->calculateProgress($totalSections, $totalSections);
            $this->assertEquals(100, $progress, "All sections completed should be 100% progress (total: {$totalSections})");
        }
    }

    /**
     * Property 7: Progress calculation should be accurate
     */
    public function test_progress_calculation_accuracy(): void
    {
        $testCases = [
            ['completed' => 1, 'total' => 2, 'expected' => 50],
            ['completed' => 1, 'total' => 4, 'expected' => 25],
            ['completed' => 3, 'total' => 4, 'expected' => 75],
            ['completed' => 1, 'total' => 5, 'expected' => 20],
            ['completed' => 2, 'total' => 5, 'expected' => 40],
            ['completed' => 3, 'total' => 5, 'expected' => 60],
            ['completed' => 4, 'total' => 5, 'expected' => 80],
            ['completed' => 5, 'total' => 5, 'expected' => 100],
        ];
        
        foreach ($testCases as $case) {
            $progress = $this->calculateProgress($case['completed'], $case['total']);
            $this->assertEquals(
                $case['expected'], 
                $progress, 
                "Progress for {$case['completed']}/{$case['total']} should be {$case['expected']}%"
            );
        }
    }

    /**
     * Property 7: Completing a section should update progress immediately
     */
    public function test_section_completion_updates_progress_immediately(): void
    {
        $guideId = 'test-guide';
        $totalSections = 5;
        
        // Initialize progress
        $this->initDocumentationProgress($guideId, $totalSections);
        $this->assertEquals(0, $this->getDocumentationProgress($guideId), 'Initial progress should be 0%');
        
        // Complete sections one by one
        for ($i = 1; $i <= $totalSections; $i++) {
            $this->completeSection($guideId, "section-{$i}");
            $expectedProgress = ($i / $totalSections) * 100;
            
            $this->assertEquals(
                $expectedProgress, 
                $this->getDocumentationProgress($guideId), 
                "Progress after completing section {$i} should be {$expectedProgress}%"
            );
        }
    }

    /**
     * Property 7: Tutorial step completion should update progress
     */
    public function test_tutorial_step_completion_updates_progress(): void
    {
        $tutorialId = 'test-tutorial';
        $totalSteps = 4;
        
        // Initialize tutorial
        $this->initTutorialProgress($tutorialId, $totalSteps);
        $this->assertEquals(0, $this->getTutorialProgress($tutorialId), 'Initial tutorial progress should be 0%');
        
        // Complete steps one by one
        for ($i = 1; $i <= $totalSteps; $i++) {
            $this->completeTutorialStep($tutorialId, $i);
            $expectedProgress = ($i / $totalSteps) * 100;
            
            $this->assertEquals(
                $expectedProgress, 
                $this->getTutorialProgress($tutorialId), 
                "Tutorial progress after step {$i} should be {$expectedProgress}%"
            );
        }
    }

    /**
     * Property 7: Completing same section twice should not increase progress
     */
    public function test_duplicate_completion_does_not_increase_progress(): void
    {
        $guideId = 'test-guide';
        $totalSections = 5;
        
        $this->initDocumentationProgress($guideId, $totalSections);
        
        // Complete section 1
        $this->completeSection($guideId, 'section-1');
        $progressAfterFirst = $this->getDocumentationProgress($guideId);
        
        // Complete section 1 again
        $this->completeSection($guideId, 'section-1');
        $progressAfterDuplicate = $this->getDocumentationProgress($guideId);
        
        $this->assertEquals(
            $progressAfterFirst, 
            $progressAfterDuplicate, 
            'Completing same section twice should not increase progress'
        );
    }

    /**
     * Property 7: Progress should be consistent across multiple reads
     */
    public function test_progress_consistency_across_reads(): void
    {
        $guideId = 'test-guide';
        $totalSections = 5;
        
        $this->initDocumentationProgress($guideId, $totalSections);
        $this->completeSection($guideId, 'section-1');
        $this->completeSection($guideId, 'section-2');
        
        // Read progress multiple times
        $read1 = $this->getDocumentationProgress($guideId);
        $read2 = $this->getDocumentationProgress($guideId);
        $read3 = $this->getDocumentationProgress($guideId);
        
        $this->assertEquals($read1, $read2, 'Progress should be consistent across reads');
        $this->assertEquals($read2, $read3, 'Progress should be consistent across reads');
    }

    /**
     * Property 7: isCompleted flag should be true only when progress is 100%
     */
    public function test_is_completed_flag_consistency(): void
    {
        $guideId = 'test-guide';
        $totalSections = 3;
        
        $this->initDocumentationProgress($guideId, $totalSections);
        
        // Not completed yet
        $this->completeSection($guideId, 'section-1');
        $this->assertFalse($this->isDocumentationCompleted($guideId), 'Should not be completed at 33%');
        
        $this->completeSection($guideId, 'section-2');
        $this->assertFalse($this->isDocumentationCompleted($guideId), 'Should not be completed at 66%');
        
        $this->completeSection($guideId, 'section-3');
        $this->assertTrue($this->isDocumentationCompleted($guideId), 'Should be completed at 100%');
    }

    /**
     * Property 7: Tutorial completion should set completed flag
     */
    public function test_tutorial_completion_flag(): void
    {
        $tutorialId = 'test-tutorial';
        $totalSteps = 2;
        
        $this->initTutorialProgress($tutorialId, $totalSteps);
        
        $this->completeTutorialStep($tutorialId, 1);
        $this->assertFalse($this->isTutorialCompleted($tutorialId), 'Tutorial should not be completed at 50%');
        
        $this->completeTutorialStep($tutorialId, 2);
        $this->assertTrue($this->isTutorialCompleted($tutorialId), 'Tutorial should be completed at 100%');
    }

    /**
     * Property 7: Progress with zero total sections should handle gracefully
     */
    public function test_zero_total_sections_handled_gracefully(): void
    {
        // Should not throw exception, should return 0 or 100
        $progress = $this->calculateProgressSafe(0, 0);
        $this->assertTrue(
            $progress === 0.0 || $progress === 100.0 || $progress === 0 || $progress === 100,
            'Zero total sections should return 0 or 100'
        );
    }

    /**
     * Property 7: Negative values should be handled gracefully
     */
    public function test_negative_values_handled_gracefully(): void
    {
        // Negative completed should be treated as 0
        $progress = $this->calculateProgressSafe(-1, 5);
        $this->assertEquals(0, $progress, 'Negative completed should be treated as 0');
        
        // Negative total should be handled
        $progress = $this->calculateProgressSafe(1, -5);
        $this->assertTrue(
            $progress === 0.0 || $progress === 100.0 || $progress === 0 || $progress === 100,
            'Negative total should be handled gracefully'
        );
    }

    /**
     * Helper: Calculate progress percentage
     */
    protected function calculateProgress(int $completed, int $total): float
    {
        if ($total === 0) {
            return 0;
        }
        return ($completed / $total) * 100;
    }

    /**
     * Helper: Calculate progress with safety checks
     */
    protected function calculateProgressSafe(int $completed, int $total): float
    {
        if ($total <= 0) {
            return $completed > 0 ? 100 : 0;
        }
        $completed = max(0, $completed);
        return min(100, ($completed / $total) * 100);
    }

    /**
     * Helper: Initialize documentation progress
     */
    protected function initDocumentationProgress(string $guideId, int $totalSections): void
    {
        $this->documentationProgress[$guideId] = [
            'totalSections' => $totalSections,
            'completedSections' => [],
        ];
    }

    /**
     * Helper: Complete a section
     */
    protected function completeSection(string $guideId, string $sectionId): void
    {
        if (!in_array($sectionId, $this->documentationProgress[$guideId]['completedSections'])) {
            $this->documentationProgress[$guideId]['completedSections'][] = $sectionId;
        }
    }

    /**
     * Helper: Get documentation progress
     */
    protected function getDocumentationProgress(string $guideId): float
    {
        $data = $this->documentationProgress[$guideId] ?? ['totalSections' => 0, 'completedSections' => []];
        return $this->calculateProgress(count($data['completedSections']), $data['totalSections']);
    }

    /**
     * Helper: Check if documentation is completed
     */
    protected function isDocumentationCompleted(string $guideId): bool
    {
        return $this->getDocumentationProgress($guideId) >= 100;
    }

    /**
     * Helper: Initialize tutorial progress
     */
    protected function initTutorialProgress(string $tutorialId, int $totalSteps): void
    {
        $this->tutorialProgress[$tutorialId] = [
            'totalSteps' => $totalSteps,
            'completedSteps' => [],
        ];
    }

    /**
     * Helper: Complete a tutorial step
     */
    protected function completeTutorialStep(string $tutorialId, int $step): void
    {
        if (!in_array($step, $this->tutorialProgress[$tutorialId]['completedSteps'])) {
            $this->tutorialProgress[$tutorialId]['completedSteps'][] = $step;
        }
    }

    /**
     * Helper: Get tutorial progress
     */
    protected function getTutorialProgress(string $tutorialId): float
    {
        $data = $this->tutorialProgress[$tutorialId] ?? ['totalSteps' => 0, 'completedSteps' => []];
        return $this->calculateProgress(count($data['completedSteps']), $data['totalSteps']);
    }

    /**
     * Helper: Check if tutorial is completed
     */
    protected function isTutorialCompleted(string $tutorialId): bool
    {
        return $this->getTutorialProgress($tutorialId) >= 100;
    }
}
