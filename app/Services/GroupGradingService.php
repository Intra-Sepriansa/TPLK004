<?php

namespace App\Services;

use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaSubmission;
use App\Models\GaIndividualGrade;
use App\Models\GaPeerEvaluation;
use App\Models\GaActivityLog;
use Illuminate\Support\Collection;

class GroupGradingService
{
    /**
     * Grade a group's submission — same grade for all members
     */
    public function gradeSameForAll(GaSubmission $submission, float $grade, ?string $notes = null, int $dosenId = 0): void
    {
        $submission->update([
            'grade' => $grade,
            'grading_notes' => $notes,
            'graded_at' => now(),
            'graded_by' => $dosenId,
        ]);

        $group = $submission->group;
        foreach ($group->members as $member) {
            GaIndividualGrade::updateOrCreate(
                ['submission_id' => $submission->id, 'student_id' => $member->student_id],
                ['base_grade' => $grade, 'adjustment' => 0, 'final_grade' => $grade, 'grading_notes' => $notes]
            );
        }
    }

    /**
     * Grade with individual adjustments — dosen sets base + per-student adjustments
     */
    public function gradeWithIndividualAdjustments(GaSubmission $submission, float $baseGrade, array $adjustments, ?string $notes = null, int $dosenId = 0): void
    {
        $submission->update([
            'grade' => $baseGrade,
            'grading_notes' => $notes,
            'graded_at' => now(),
            'graded_by' => $dosenId,
        ]);

        $group = $submission->group;
        foreach ($group->members as $member) {
            $adj = $adjustments[$member->student_id] ?? 0;
            GaIndividualGrade::updateOrCreate(
                ['submission_id' => $submission->id, 'student_id' => $member->student_id],
                [
                    'base_grade' => $baseGrade,
                    'adjustment' => $adj,
                    'final_grade' => max(0, min(100, $baseGrade + $adj)),
                    'grading_notes' => $notes,
                ]
            );
        }
    }

    /**
     * Grade using peer evaluation scores
     */
    public function calculatePeerEvaluationGrades(GaSubmission $submission, float $baseGrade, float $peerWeight = 0.30, int $dosenId = 0): void
    {
        $assignment = $submission->assignment;
        $group = $submission->group;

        $submission->update([
            'grade' => $baseGrade,
            'graded_at' => now(),
            'graded_by' => $dosenId,
        ]);

        foreach ($group->members as $member) {
            $evaluations = GaPeerEvaluation::where('assignment_id', $assignment->id)
                ->where('evaluated_id', $member->student_id)
                ->get();

            $peerScore = 0;
            if ($evaluations->isNotEmpty()) {
                $avgScores = $evaluations->map(fn ($e) => $e->average_score);
                $peerScore = $avgScores->avg();
            }

            // Normalize peer score to 0-100 scale (scores are 1-5)
            $normalizedPeerScore = ($peerScore / 5) * 100;
            $finalGrade = round($baseGrade * (1 - $peerWeight) + $normalizedPeerScore * $peerWeight, 2);

            GaIndividualGrade::updateOrCreate(
                ['submission_id' => $submission->id, 'student_id' => $member->student_id],
                [
                    'base_grade' => $baseGrade,
                    'peer_evaluation_score' => round($normalizedPeerScore, 2),
                    'final_grade' => max(0, min(100, $finalGrade)),
                ]
            );
        }
    }

    /**
     * Grade based on contribution activity (messages, files, tasks)
     */
    public function calculateContributionBasedGrades(GaSubmission $submission, float $baseGrade, float $contributionWeight = 0.30, int $dosenId = 0): void
    {
        $group = $submission->group;

        $submission->update([
            'grade' => $baseGrade,
            'graded_at' => now(),
            'graded_by' => $dosenId,
        ]);

        $contributionScores = $this->getContributionScores($group);
        $maxScore = $contributionScores->max() ?: 1;

        foreach ($group->members as $member) {
            $rawScore = $contributionScores[$member->student_id] ?? 0;
            $normalizedScore = ($rawScore / $maxScore) * 100;

            $finalGrade = round($baseGrade * (1 - $contributionWeight) + $normalizedScore * $contributionWeight, 2);

            GaIndividualGrade::updateOrCreate(
                ['submission_id' => $submission->id, 'student_id' => $member->student_id],
                [
                    'base_grade' => $baseGrade,
                    'contribution_score' => round($normalizedScore, 2),
                    'final_grade' => max(0, min(100, $finalGrade)),
                ]
            );
        }
    }

    /**
     * Get contribution scores for a group — messages ×1, files ×3, tasks ×5
     */
    public function getContributionScores(GaGroup $group): Collection
    {
        $logs = GaActivityLog::where('group_id', $group->id)->get();

        return $logs->groupBy('user_id')->map(function ($userLogs) {
            return $userLogs->sum('points');
        });
    }

    /**
     * Get individual grades for a submission
     */
    public function getIndividualGrades(GaSubmission $submission): Collection
    {
        return $submission->individualGrades()->with('student')->get();
    }
}
