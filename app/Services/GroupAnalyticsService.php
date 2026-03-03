<?php

namespace App\Services;

use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaActivityLog;
use App\Models\GaGroupMember;
use App\Models\GaPeerEvaluation;
use Illuminate\Support\Collection;

class GroupAnalyticsService
{
    /**
     * Get full assignment analytics overview
     */
    public function getAssignmentAnalytics(GroupAssignment $assignment): array
    {
        $groups = $assignment->groups()->withCount('members')->get();
        $submissions = $assignment->submissions()->with('individualGrades')->get();
        $totalStudents = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))->count();

        return [
            'overview' => [
                'total_groups' => $groups->count(),
                'total_students' => $totalStudents,
                'submitted_groups' => $submissions->count(),
                'unsubmitted_groups' => $groups->count() - $submissions->count(),
                'graded_groups' => $submissions->whereNotNull('graded_at')->count(),
                'average_grade' => round($submissions->whereNotNull('grade')->avg('grade') ?? 0, 1),
                'late_submissions' => $submissions->where('is_late', true)->count(),
            ],
            'groups' => $groups->map(fn ($g) => $this->getGroupSummary($g)),
            'contribution' => $this->getContributionAnalysis($assignment),
            'timeline' => $this->getActivityTimeline($assignment),
        ];
    }

    /**
     * Get summary for a single group
     */
    public function getGroupSummary(GaGroup $group): array
    {
        $members = $group->members()->with('student')->get();
        $tasks = $group->tasks;
        $messages = $group->messages()->count();
        $files = $group->files()->count();
        $submission = $group->submission;

        $memberContributions = $this->getMemberContributions($group);

        return [
            'id' => $group->id,
            'name' => $group->name,
            'member_count' => $members->count(),
            'members' => $members->map(fn ($m) => [
                'id' => $m->student_id,
                'nama' => $m->student->nama ?? 'Unknown',
                'is_leader' => $m->is_leader,
                'contribution_points' => $memberContributions[$m->student_id] ?? 0,
            ]),
            'task_stats' => [
                'total' => $tasks->count(),
                'completed' => $tasks->where('status', 'completed')->count(),
                'in_progress' => $tasks->where('status', 'in_progress')->count(),
                'pending' => $tasks->where('status', 'pending')->count(),
            ],
            'message_count' => $messages,
            'file_count' => $files,
            'has_submission' => $submission !== null,
            'grade' => $submission?->grade,
            'is_late' => $submission?->is_late ?? false,
            'progress' => $group->progress,
        ];
    }

    /**
     * Get contribution points per member in a group
     */
    public function getMemberContributions(GaGroup $group): Collection
    {
        return GaActivityLog::where('group_id', $group->id)
            ->get()
            ->groupBy('user_id')
            ->map(fn ($logs) => $logs->sum('points'));
    }

    /**
     * Contribution analysis across all groups in an assignment
     */
    public function getContributionAnalysis(GroupAssignment $assignment): array
    {
        $groups = $assignment->groups;
        $allContributions = [];

        foreach ($groups as $group) {
            $perMember = $this->getMemberContributions($group);
            foreach ($perMember as $studentId => $points) {
                $allContributions[] = [
                    'student_id' => $studentId,
                    'group_id' => $group->id,
                    'group_name' => $group->name,
                    'points' => $points,
                ];
            }
        }

        $totalPoints = collect($allContributions);
        $avgContribution = $totalPoints->avg('points') ?? 0;

        return [
            'average_contribution' => round($avgContribution, 1),
            'max_contribution' => $totalPoints->max('points') ?? 0,
            'min_contribution' => $totalPoints->min('points') ?? 0,
            'inactive_members' => $totalPoints->where('points', '<', $avgContribution * 0.3)->count(),
            'top_contributors' => $totalPoints->sortByDesc('points')->take(5)->values()->toArray(),
        ];
    }

    /**
     * Activity timeline for the assignment (aggregated per day)
     */
    public function getActivityTimeline(GroupAssignment $assignment): array
    {
        $groupIds = $assignment->groups()->pluck('id');
        $logs = GaActivityLog::whereIn('group_id', $groupIds)
            ->orderBy('created_at')
            ->get();

        return $logs->groupBy(fn ($log) => $log->created_at->format('Y-m-d'))
            ->map(fn ($dayLogs, $date) => [
                'date' => $date,
                'activities' => $dayLogs->count(),
                'messages' => $dayLogs->where('activity_type', 'message')->count(),
                'files' => $dayLogs->where('activity_type', 'file_upload')->count(),
                'tasks' => $dayLogs->whereIn('activity_type', ['task_created', 'task_completed'])->count(),
            ])
            ->values()
            ->toArray();
    }

    /**
     * Identify members below contribution threshold
     */
    public function identifyInactiveMembers(GroupAssignment $assignment): Collection
    {
        $threshold = $assignment->contribution_threshold ?? 0.30;
        $groups = $assignment->groups;
        $inactive = collect();

        foreach ($groups as $group) {
            $contributions = $this->getMemberContributions($group);
            $maxPoints = $contributions->max() ?: 1;

            $group->members->each(function ($member) use ($contributions, $maxPoints, $threshold, $group, &$inactive) {
                $points = $contributions[$member->student_id] ?? 0;
                if ($points < $maxPoints * $threshold) {
                    $inactive->push([
                        'student_id' => $member->student_id,
                        'student_name' => $member->student->nama ?? 'Unknown',
                        'group_name' => $group->name,
                        'points' => $points,
                        'percentage' => $maxPoints > 0 ? round(($points / $maxPoints) * 100, 1) : 0,
                    ]);
                }
            });
        }

        return $inactive;
    }

    /**
     * Get peer evaluation summary for an assignment
     */
    public function getPeerEvaluationSummary(GroupAssignment $assignment): array
    {
        $evaluations = GaPeerEvaluation::where('assignment_id', $assignment->id)->get();
        $totalMembers = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))->count();
        $evaluatedCount = $evaluations->pluck('evaluator_id')->unique()->count();

        return [
            'total_evaluations' => $evaluations->count(),
            'completed_by' => $evaluatedCount,
            'total_expected' => $totalMembers,
            'completion_rate' => $totalMembers > 0 ? round(($evaluatedCount / $totalMembers) * 100, 1) : 0,
            'avg_contribution' => round($evaluations->avg('contribution_score') ?? 0, 1),
            'avg_communication' => round($evaluations->avg('communication_score') ?? 0, 1),
            'avg_reliability' => round($evaluations->avg('reliability_score') ?? 0, 1),
            'avg_quality' => round($evaluations->avg('quality_score') ?? 0, 1),
        ];
    }
}
