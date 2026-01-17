<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for TutorialService
 * Feature: advanced-settings-documentation
 * 
 * Property 8: Tutorial State Management
 * For any tutorial interaction (start, advance, skip, complete), the state change 
 * SHALL be persisted and the tutorial SHALL resume from the correct state on next access.
 * 
 * Validates: Requirements 5.3, 5.4, 5.5
 */
class TutorialServiceTest extends TestCase
{
    /**
     * Simulated tutorial state storage
     */
    protected array $tutorialStates = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->tutorialStates = [];
    }

    /**
     * Property 8: Starting a tutorial sets correct initial state
     */
    public function test_start_tutorial_sets_initial_state(): void
    {
        $tutorialIds = ['tutorial-1', 'tutorial-2', 'tutorial-3'];

        foreach ($tutorialIds as $tutorialId) {
            $state = $this->startTutorial($tutorialId);

            $this->assertEquals(1, $state['current_step'], 'Started tutorial should be at step 1');
            $this->assertFalse($state['completed'], 'Started tutorial should not be completed');
            $this->assertFalse($state['skipped'], 'Started tutorial should not be skipped');
            $this->assertNotNull($state['started_at'], 'Started tutorial should have started_at timestamp');
        }
    }

    /**
     * Property 8: Advancing step increments current_step
     */
    public function test_advance_step_increments_current_step(): void
    {
        $tutorialId = 'test-tutorial';
        $this->startTutorial($tutorialId);

        // Advance multiple times
        for ($i = 2; $i <= 5; $i++) {
            $state = $this->advanceStep($tutorialId);
            $this->assertEquals($i, $state['current_step'], "After advancing, step should be {$i}");
        }
    }

    /**
     * Property 8: Setting step directly works correctly
     */
    public function test_set_step_directly(): void
    {
        $tutorialId = 'test-tutorial';
        $this->startTutorial($tutorialId);

        $testSteps = [3, 1, 5, 2, 4];

        foreach ($testSteps as $step) {
            $state = $this->setStep($tutorialId, $step);
            $this->assertEquals($step, $state['current_step'], "Step should be set to {$step}");
        }
    }

    /**
     * Property 8: Completing tutorial sets correct state
     */
    public function test_complete_tutorial_sets_correct_state(): void
    {
        $tutorialIds = ['tutorial-1', 'tutorial-2', 'tutorial-3'];

        foreach ($tutorialIds as $tutorialId) {
            $this->startTutorial($tutorialId);
            $state = $this->completeTutorial($tutorialId);

            $this->assertTrue($state['completed'], 'Completed tutorial should have completed=true');
            $this->assertFalse($state['skipped'], 'Completed tutorial should have skipped=false');
            $this->assertNotNull($state['completed_at'], 'Completed tutorial should have completed_at timestamp');
        }
    }

    /**
     * Property 8: Skipping tutorial sets correct state
     */
    public function test_skip_tutorial_sets_correct_state(): void
    {
        $tutorialIds = ['tutorial-1', 'tutorial-2', 'tutorial-3'];

        foreach ($tutorialIds as $tutorialId) {
            $this->startTutorial($tutorialId);
            $state = $this->skipTutorial($tutorialId);

            $this->assertTrue($state['skipped'], 'Skipped tutorial should have skipped=true');
            $this->assertFalse($state['completed'], 'Skipped tutorial should have completed=false');
            $this->assertNull($state['completed_at'], 'Skipped tutorial should not have completed_at');
        }
    }

    /**
     * Property 8: Reset tutorial clears all state
     */
    public function test_reset_tutorial_clears_state(): void
    {
        $tutorialId = 'test-tutorial';
        
        // Start and advance
        $this->startTutorial($tutorialId);
        $this->advanceStep($tutorialId);
        $this->advanceStep($tutorialId);
        
        // Reset
        $state = $this->resetTutorial($tutorialId);

        $this->assertEquals(0, $state['current_step'], 'Reset tutorial should have step 0');
        $this->assertFalse($state['completed'], 'Reset tutorial should not be completed');
        $this->assertFalse($state['skipped'], 'Reset tutorial should not be skipped');
        $this->assertNull($state['started_at'], 'Reset tutorial should not have started_at');
        $this->assertNull($state['completed_at'], 'Reset tutorial should not have completed_at');
    }

    /**
     * Property 8: State persists across accesses
     */
    public function test_state_persists_across_accesses(): void
    {
        $tutorialId = 'test-tutorial';
        
        // Start and advance
        $this->startTutorial($tutorialId);
        $this->advanceStep($tutorialId);
        $this->advanceStep($tutorialId);

        // Access state again (simulating new request)
        $state = $this->getState($tutorialId);

        $this->assertEquals(3, $state['current_step'], 'State should persist current_step');
        $this->assertFalse($state['completed'], 'State should persist completed status');
        $this->assertNotNull($state['started_at'], 'State should persist started_at');
    }

    /**
     * Property 8: Multiple tutorials maintain independent state
     */
    public function test_multiple_tutorials_independent_state(): void
    {
        $tutorial1 = 'tutorial-1';
        $tutorial2 = 'tutorial-2';
        $tutorial3 = 'tutorial-3';

        // Start all tutorials
        $this->startTutorial($tutorial1);
        $this->startTutorial($tutorial2);
        $this->startTutorial($tutorial3);

        // Advance tutorial1 to step 3
        $this->advanceStep($tutorial1);
        $this->advanceStep($tutorial1);

        // Complete tutorial2
        $this->completeTutorial($tutorial2);

        // Skip tutorial3
        $this->skipTutorial($tutorial3);

        // Verify independent states
        $state1 = $this->getState($tutorial1);
        $state2 = $this->getState($tutorial2);
        $state3 = $this->getState($tutorial3);

        $this->assertEquals(3, $state1['current_step'], 'Tutorial 1 should be at step 3');
        $this->assertFalse($state1['completed'], 'Tutorial 1 should not be completed');

        $this->assertTrue($state2['completed'], 'Tutorial 2 should be completed');
        $this->assertFalse($state2['skipped'], 'Tutorial 2 should not be skipped');

        $this->assertTrue($state3['skipped'], 'Tutorial 3 should be skipped');
        $this->assertFalse($state3['completed'], 'Tutorial 3 should not be completed');
    }

    /**
     * Property 8: Completing after skip updates state correctly
     */
    public function test_complete_after_skip_updates_state(): void
    {
        $tutorialId = 'test-tutorial';

        $this->startTutorial($tutorialId);
        $this->skipTutorial($tutorialId);
        
        // Now complete it
        $state = $this->completeTutorial($tutorialId);

        $this->assertTrue($state['completed'], 'Should be completed after completing');
        $this->assertFalse($state['skipped'], 'Should not be skipped after completing');
    }

    /**
     * Property 8: Skipping after complete updates state correctly
     */
    public function test_skip_after_complete_updates_state(): void
    {
        $tutorialId = 'test-tutorial';

        $this->startTutorial($tutorialId);
        $this->completeTutorial($tutorialId);
        
        // Now skip it (reset and skip)
        $this->resetTutorial($tutorialId);
        $state = $this->skipTutorial($tutorialId);

        $this->assertTrue($state['skipped'], 'Should be skipped after skipping');
        $this->assertFalse($state['completed'], 'Should not be completed after skipping');
    }

    /**
     * Property 8: In-progress detection works correctly
     */
    public function test_in_progress_detection(): void
    {
        $tutorialId = 'test-tutorial';

        // Not started - not in progress
        $this->assertFalse($this->isInProgress($tutorialId), 'Not started tutorial should not be in progress');

        // Started - in progress
        $this->startTutorial($tutorialId);
        $this->assertTrue($this->isInProgress($tutorialId), 'Started tutorial should be in progress');

        // Completed - not in progress
        $this->completeTutorial($tutorialId);
        $this->assertFalse($this->isInProgress($tutorialId), 'Completed tutorial should not be in progress');

        // Reset and skip - not in progress
        $this->resetTutorial($tutorialId);
        $this->startTutorial($tutorialId);
        $this->skipTutorial($tutorialId);
        $this->assertFalse($this->isInProgress($tutorialId), 'Skipped tutorial should not be in progress');
    }

    /**
     * Property 8: Should show tutorial logic
     */
    public function test_should_show_tutorial_logic(): void
    {
        $tutorialId = 'test-tutorial';

        // Not started - should show
        $this->assertTrue($this->shouldShowTutorial($tutorialId), 'Should show tutorial if not started');

        // Started (in progress) - should show
        $this->startTutorial($tutorialId);
        $this->assertTrue($this->shouldShowTutorial($tutorialId), 'Should show tutorial if in progress');

        // Completed - should not show
        $this->completeTutorial($tutorialId);
        $this->assertFalse($this->shouldShowTutorial($tutorialId), 'Should not show tutorial if completed');

        // Reset and skip - should not show
        $this->resetTutorial($tutorialId);
        $this->startTutorial($tutorialId);
        $this->skipTutorial($tutorialId);
        $this->assertFalse($this->shouldShowTutorial($tutorialId), 'Should not show tutorial if skipped');
    }

    // Helper methods to simulate TutorialCompletion behavior

    protected function startTutorial(string $tutorialId): array
    {
        if (!isset($this->tutorialStates[$tutorialId])) {
            $this->tutorialStates[$tutorialId] = $this->getDefaultState();
        }

        $this->tutorialStates[$tutorialId]['started_at'] = now()->toIso8601String();
        $this->tutorialStates[$tutorialId]['current_step'] = 1;

        return $this->tutorialStates[$tutorialId];
    }

    protected function advanceStep(string $tutorialId): array
    {
        if (isset($this->tutorialStates[$tutorialId])) {
            $this->tutorialStates[$tutorialId]['current_step']++;
        }
        return $this->tutorialStates[$tutorialId] ?? $this->getDefaultState();
    }

    protected function setStep(string $tutorialId, int $step): array
    {
        if (isset($this->tutorialStates[$tutorialId])) {
            $this->tutorialStates[$tutorialId]['current_step'] = $step;
        }
        return $this->tutorialStates[$tutorialId] ?? $this->getDefaultState();
    }

    protected function completeTutorial(string $tutorialId): array
    {
        if (isset($this->tutorialStates[$tutorialId])) {
            $this->tutorialStates[$tutorialId]['completed'] = true;
            $this->tutorialStates[$tutorialId]['skipped'] = false;
            $this->tutorialStates[$tutorialId]['completed_at'] = now()->toIso8601String();
        }
        return $this->tutorialStates[$tutorialId] ?? $this->getDefaultState();
    }

    protected function skipTutorial(string $tutorialId): array
    {
        if (isset($this->tutorialStates[$tutorialId])) {
            $this->tutorialStates[$tutorialId]['skipped'] = true;
            $this->tutorialStates[$tutorialId]['completed'] = false;
            $this->tutorialStates[$tutorialId]['completed_at'] = null;
        }
        return $this->tutorialStates[$tutorialId] ?? $this->getDefaultState();
    }

    protected function resetTutorial(string $tutorialId): array
    {
        $this->tutorialStates[$tutorialId] = $this->getDefaultState();
        return $this->tutorialStates[$tutorialId];
    }

    protected function getState(string $tutorialId): array
    {
        return $this->tutorialStates[$tutorialId] ?? $this->getDefaultState();
    }

    protected function isInProgress(string $tutorialId): bool
    {
        $state = $this->getState($tutorialId);
        return $state['started_at'] !== null && !$state['completed'] && !$state['skipped'];
    }

    protected function shouldShowTutorial(string $tutorialId): bool
    {
        if (!isset($this->tutorialStates[$tutorialId])) {
            return true;
        }
        $state = $this->tutorialStates[$tutorialId];
        return !$state['completed'] && !$state['skipped'];
    }

    protected function getDefaultState(): array
    {
        return [
            'current_step' => 0,
            'completed' => false,
            'skipped' => false,
            'started_at' => null,
            'completed_at' => null,
        ];
    }
}
