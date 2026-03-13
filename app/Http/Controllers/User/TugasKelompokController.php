<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaGroupMember;
use App\Models\GaSubmission;
use App\Models\GaPeerEvaluation;
use App\Models\GaConflictReport;
use App\Models\GaInvitation;
use App\Models\Mahasiswa;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Services\GroupFormationService;
use App\Services\GroupCollaborationService;
use App\Services\GroupAnalyticsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class TugasKelompokController extends Controller
{
    public function __construct(
        private GroupFormationService $formationService,
        private GroupCollaborationService $collaborationService,
        private GroupAnalyticsService $analyticsService,
    ) {}

    /**
     * List group assignments for current student
     */
    public function index()
    {
        $mahasiswa = $this->getMahasiswa();
        $allowedCourseIds = $this->resolveEligibleAssignmentCourseIds($mahasiswa);

        $assignments = GroupAssignment::query()
            ->with(['course', 'dosen'])
            ->withCount('groups')
            ->where(function ($query) use ($allowedCourseIds, $mahasiswa) {
                if ($allowedCourseIds->isNotEmpty()) {
                    $query->whereIn('course_id', $allowedCourseIds);
                } else {
                    $query->whereRaw('1 = 0');
                }

                // Fallback: always include assignments where student already has history
                // (joined group or has pending invitation), even when course mapping is incomplete.
                $query->orWhereHas('groups.members', fn ($q) => $q->where('student_id', $mahasiswa->id))
                    ->orWhereHas('groups.invitations', fn ($q) => $q
                        ->where('invitee_id', $mahasiswa->id)
                        ->where('status', 'pending'));
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function (GroupAssignment $assignment) use ($mahasiswa) {
                $myGroup = GaGroup::query()
                    ->where('assignment_id', $assignment->id)
                    ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
                    ->withCount('members')
                    ->with('submission')
                    ->first();

                $hasGroup = $myGroup !== null;
                $hasSubmitted = (bool) $myGroup?->submission;
                $status = $hasSubmitted ? 'submitted' : ($hasGroup ? 'joined' : 'not_joined');
                $canJoin = !$hasGroup
                    && $assignment->formation_mode === 'self-form'
                    && !$assignment->is_locked
                    && (!$assignment->formation_deadline || $assignment->formation_deadline->isFuture());

                $totalGroups = (int) (
                    $assignment->self_form_group_count
                    ?: $assignment->random_group_count
                    ?: $assignment->groups_count
                );

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'course' => [
                        'id' => $assignment->course?->id,
                        'nama' => $assignment->course?->nama ?? '-',
                    ],
                    'dosen' => [
                        'id' => $assignment->dosen?->id,
                        'nama' => $assignment->dosen?->nama ?? '-',
                    ],
                    'formation_mode' => $assignment->formation_mode,
                    'grading_mode' => $assignment->grading_mode,
                    'formation_deadline' => $assignment->formation_deadline?->toISOString(),
                    'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
                    'submission_deadline' => $assignment->submission_deadline?->toISOString(),
                    'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                    'is_locked' => $assignment->is_locked,
                    'is_overdue' => $assignment->submission_deadline?->isPast() ?? false,
                    'days_until_deadline' => $assignment->submission_deadline
                        ? (int) now()->diffInDays($assignment->submission_deadline, false)
                        : null,
                    'status' => $status,
                    'can_join' => $canJoin,
                    'has_group' => $hasGroup,
                    'has_submitted' => $hasSubmitted,
                    'group_name' => $myGroup?->name,
                    'group_id' => $myGroup?->id,
                    'member_count' => (int) ($myGroup?->members_count ?? 0),
                    'max_members' => (int) ($assignment->self_form_group_size ?: $assignment->max_members),
                    'total_groups' => $totalGroups,
                    'my_group' => $myGroup ? [
                        'id' => $myGroup->id,
                        'name' => $myGroup->name,
                        'number' => $myGroup->slot_number,
                        'progress' => (float) $myGroup->progress,
                        'members_count' => (int) $myGroup->members_count,
                    ] : null,
                ];
            })
            ->values();

        $stats = [
            'total' => $assignments->count(),
            'active_groups' => $assignments->where('status', 'joined')->count(),
            'completed' => $assignments->where('status', 'submitted')->count(),
            'not_joined' => $assignments->where('status', 'not_joined')->count(),
            'upcoming_deadline' => $this->calculateUpcomingDeadline($assignments),
        ];

        return Inertia::render('user/akademik/tugas-kelompok', [
            'assignments' => $assignments,
            'stats' => $stats,
            'mahasiswa' => ['id' => $mahasiswa->id, 'nama' => $mahasiswa->nama],
        ]);
    }

    private function resolveEligibleAssignmentCourseIds(Mahasiswa $mahasiswa)
    {
        $courseNames = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->pluck('name')
            ->filter(fn ($name) => filled($name))
            ->map(fn ($name) => trim((string) $name))
            ->unique()
            ->values();

        $idsByExactName = collect();
        if ($courseNames->isNotEmpty()) {
            $idsByExactName = MataKuliah::query()
                ->whereIn('nama', $courseNames)
                ->pluck('id');
        }

        $idsByNormalizedName = collect();
        if ($courseNames->isNotEmpty() && $idsByExactName->count() < $courseNames->count()) {
            $normalizedNames = $courseNames
                ->map(fn ($name) => mb_strtolower($name))
                ->unique()
                ->values();

            $idsByNormalizedName = MataKuliah::query()
                ->get(['id', 'nama'])
                ->filter(fn ($course) => $normalizedNames->contains(mb_strtolower(trim((string) $course->nama))))
                ->pluck('id');
        }

        $idsByClass = collect();
        if (!empty($mahasiswa->kelas) && Schema::hasColumn('mata_kuliah', 'kelas')) {
            $idsByClass = MataKuliah::query()
                ->where('kelas', $mahasiswa->kelas)
                ->pluck('id');
        }

        return $idsByExactName
            ->merge($idsByNormalizedName)
            ->merge($idsByClass)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
    }

    private function calculateUpcomingDeadline($assignments): string
    {
        $upcoming = collect($assignments)
            ->filter(fn ($assignment) => !$assignment['has_submitted'] && !empty($assignment['submission_deadline']))
            ->sortBy('submission_deadline')
            ->first();

        if (!$upcoming) {
            return '-';
        }

        $days = (int) now()->diffInDays(Carbon::parse($upcoming['submission_deadline']), false);
        if ($days < 0) {
            return 'Terlewat';
        }
        if ($days === 0) {
            return 'Hari ini';
        }
        if ($days === 1) {
            return 'Besok';
        }

        return $days . ' hari';
    }

    /**
     * Show group assignment detail (collaboration workspace)
     */
    public function show(int $id)
    {
        $mahasiswa = $this->getMahasiswa();

        $assignment = GroupAssignment::with('course')->findOrFail($id);

        $myGroup = GaGroup::where('assignment_id', $assignment->id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->with(['members.student', 'tasks.assignees', 'files.uploader', 'submission', 'conflictReports'])
            ->first();

        $selfFormGroupCount = (int) ($assignment->self_form_group_count ?? 0);
        $selfFormGroupSize = (int) ($assignment->self_form_group_size ?? $assignment->max_members);

        // ═══ ALL GROUPS (for the real-time grid view) ═══
        $allGroups = collect();
        if ($assignment->formation_mode === 'self-form') {
            if ($selfFormGroupCount > 0) {
                // Slot-based: show all slots
                $groupsBySlot = GaGroup::where('assignment_id', $assignment->id)
                    ->withCount('members')
                    ->with(['members.student'])
                    ->get()
                    ->filter(fn ($group) => (int) $group->slot_number > 0)
                    ->keyBy(fn ($group) => (int) $group->slot_number);

                for ($slot = 1; $slot <= $selfFormGroupCount; $slot++) {
                    $group = $groupsBySlot->get($slot);
                    $memberCount = (int) ($group?->members_count ?? 0);
                    $members = $group ? $group->members->map(fn ($m) => [
                        'id' => $m->student_id,
                        'nama' => $m->student->nama ?? 'Unknown',
                        'nim' => $m->student->nim ?? '',
                        'is_leader' => $m->is_leader,
                    ])->values()->all() : [];

                    $isFull = $memberCount >= $selfFormGroupSize;
                    $isMyGroup = $group && $group->members->contains(fn ($m) => (int) $m->student_id === (int) $mahasiswa->id);

                    $allGroups->push([
                        'id' => $group?->id,
                        'slot_number' => $slot,
                        'name' => $group?->name ?? "Kelompok {$slot}",
                        'member_count' => $memberCount,
                        'max_members' => $selfFormGroupSize,
                        'is_full' => $isFull,
                        'is_my_group' => $isMyGroup,
                        'leader' => $group
                            ? ($group->members->first(fn ($m) => $m->is_leader)?->student ?? ['nama' => '-'])
                            : ['nama' => '-'],
                        'members' => $members,
                    ]);
                }
            } else {
                // Freeform groups
                $allGroups = GaGroup::where('assignment_id', $assignment->id)
                    ->withCount('members')
                    ->with('members.student')
                    ->get()
                    ->map(fn ($g) => [
                        'id' => $g->id,
                        'slot_number' => $g->slot_number,
                        'name' => $g->name,
                        'member_count' => $g->members_count,
                        'max_members' => $assignment->max_members,
                        'is_full' => $g->members_count >= $assignment->max_members,
                        'is_my_group' => $g->members->contains(fn ($m) => (int) $m->student_id === (int) $mahasiswa->id),
                        'leader' => $g->members->first(fn ($m) => $m->is_leader)?->student ?? ['nama' => 'Unknown'],
                        'members' => $g->members->map(fn ($m) => [
                            'id' => $m->student_id,
                            'nama' => $m->student->nama ?? 'Unknown',
                            'nim' => $m->student->nim ?? '',
                            'is_leader' => $m->is_leader,
                        ])->values()->all(),
                    ]);
            }
        }

        // Leader tools
        $leaderTools = [
            'can_manage' => false,
            'unassigned_students' => [],
        ];

        if ($myGroup && (int) $myGroup->leader_id === (int) $mahasiswa->id && $assignment->formation_mode === 'self-form' && !$assignment->is_locked) {
            $leaderTools['can_manage'] = true;
            $leaderTools['unassigned_students'] = $this->formationService
                ->getUnassignedStudents($assignment)
                ->where('id', '!=', $mahasiswa->id)
                ->sortBy('nama')
                ->values()
                ->map(fn ($student) => [
                    'id' => $student->id,
                    'nama' => $student->nama,
                    'nim' => $student->nim,
                    'kelas' => $student->kelas ?? null,
                ])
                ->all();
        }

        // Messages
        $messages = $myGroup ? $this->collaborationService->getGroupMessages($myGroup, 50) : collect();

        // Mark messages as read
        if ($myGroup) {
            $this->collaborationService->markMessagesAsRead($myGroup, $mahasiswa);
        }

        // Peer eval status
        $peerEvalCompleted = false;
        if ($myGroup && $assignment->grading_mode === 'peer') {
            $peerEvalCompleted = GaPeerEvaluation::where('assignment_id', $assignment->id)
                ->where('evaluator_id', $mahasiswa->id)
                ->exists();
        }

        // Individual grade
        $myGrade = null;
        if ($myGroup?->submission) {
            $grade = \App\Models\GaIndividualGrade::where('submission_id', $myGroup->submission->id)
                ->where('student_id', $mahasiswa->id)
                ->first();
            if ($grade) {
                $myGrade = [
                    'base_grade' => $grade->base_grade,
                    'adjustment' => $grade->adjustment,
                    'peer_evaluation_score' => $grade->peer_evaluation_score,
                    'contribution_score' => $grade->contribution_score,
                    'final_grade' => $grade->final_grade,
                ];
            }
        }

        // ═══ PENDING INVITATIONS for current student ═══
        $pendingInvitations = GaInvitation::where('invitee_id', $mahasiswa->id)
            ->where('status', 'pending')
            ->whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->with(['group', 'inviter', 'group.members.student'])
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'group_id' => $inv->group_id,
                'group_name' => $inv->group->name,
                'inviter_name' => $inv->inviter->nama ?? 'Unknown',
                'group_member_count' => $inv->group->members->count(),
                'group_max_members' => $selfFormGroupSize,
                'group_members' => $inv->group->members->map(fn ($m) => [
                    'nama' => $m->student->nama ?? 'Unknown',
                    'is_leader' => $m->is_leader,
                ])->values()->all(),
                'created_at' => $inv->created_at->diffForHumans(),
            ]);

        $sentInvitations = collect();
        if ($myGroup && (int) $myGroup->leader_id === (int) $mahasiswa->id && $assignment->formation_mode === 'self-form') {
            $sentInvitations = GaInvitation::where('group_id', $myGroup->id)
                ->where('status', 'pending')
                ->with('invitee')
                ->latest('created_at')
                ->get()
                ->map(fn ($inv) => [
                    'id' => $inv->id,
                    'invitee_id' => $inv->invitee_id,
                    'invitee_name' => $inv->invitee->nama ?? 'Unknown',
                    'invitee_nim' => $inv->invitee->nim ?? null,
                    'created_at' => $inv->created_at->diffForHumans(),
                ]);
        }

        // ═══ STATS ═══
        $totalStudents = count($leaderTools['unassigned_students']);
        $studentsWithGroup = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))->distinct('student_id')->count('student_id');
        if ($totalStudents === 0) {
            // Fallback: count total by getting assigned + unassigned
            $totalStudents = $studentsWithGroup + count($leaderTools['unassigned_students']);
        }
        // Use the formation service count if available
        try {
            $allEligible = $this->formationService->getUnassignedStudents($assignment);
            $totalStudents = $studentsWithGroup + $allEligible->count();
        } catch (\Exception $e) {
            // fallback silently
        }

        // ═══ ACTIVITY TIMELINE ═══
        $activityLogs = collect();
        if ($myGroup) {
            $activityLogs = $myGroup->activityLogs()
                ->with('user')
                ->orderByDesc('created_at')
                ->take(20)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'type' => $log->activity_type,
                    'user_name' => $log->user->nama ?? 'Unknown',
                    'metadata' => $log->activity_metadata,
                    'created_at' => $log->created_at->diffForHumans(),
                    'created_at_full' => $log->created_at->format('d M Y H:i'),
                ]);
        }

        return Inertia::render('user/akademik/tugas-kelompok-detail', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'formation_mode' => $assignment->formation_mode,
                'grading_mode' => $assignment->grading_mode,
                'min_members' => $assignment->min_members,
                'max_members' => $assignment->max_members,
                'self_form_group_count' => $assignment->self_form_group_count,
                'self_form_group_size' => $assignment->self_form_group_size,
                'formation_deadline' => $assignment->formation_deadline?->toISOString(),
                'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
                'submission_deadline' => $assignment->submission_deadline?->toISOString(),
                'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                'is_locked' => $assignment->is_locked,
                'course' => $assignment->course ? ['id' => $assignment->course->id, 'nama' => $assignment->course->nama] : null,
                'features' => $assignment->features ?? [],
                'allow_resubmission' => $assignment->allow_resubmission,
                'is_overdue' => $assignment->formation_deadline?->isPast() ?? false,
            ],
            'myGroup' => $myGroup ? [
                'id' => $myGroup->id,
                'name' => $myGroup->name,
                'leader_id' => $myGroup->leader_id,
                'slot_number' => $myGroup->slot_number,
                'members' => $myGroup->members->map(fn ($m) => [
                    'id' => $m->student_id,
                    'nama' => $m->student->nama ?? 'Unknown',
                    'nim' => $m->student->nim ?? '',
                    'is_leader' => $m->is_leader,
                ]),
                'tasks' => $myGroup->tasks->map(fn ($t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                    'description' => $t->description,
                    'status' => $t->status,
                    'deadline' => $t->deadline?->toISOString(),
                    'assignees' => $t->assignees->map(fn ($a) => ['id' => $a->id, 'nama' => $a->nama]),
                    'created_by' => $t->created_by,
                ]),
                'files' => $myGroup->files->map(fn ($f) => [
                    'id' => $f->id,
                    'original_name' => $f->original_name,
                    'file_type' => $f->file_type,
                    'file_size_formatted' => $f->file_size_formatted,
                    'uploaded_by' => $f->uploader->nama ?? 'Unknown',
                    'uploaded_at' => $f->uploaded_at?->format('d M Y H:i'),
                    'file_path' => $f->file_path,
                ]),
                'submission' => $myGroup->submission ? [
                    'submitted_at' => $myGroup->submission->submitted_at?->format('d M Y H:i'),
                    'is_late' => $myGroup->submission->is_late,
                    'grade' => $myGroup->submission->grade,
                    'grading_notes' => $myGroup->submission->grading_notes,
                ] : null,
                'progress' => $myGroup->progress,
            ] : null,
            'allGroups' => $allGroups->values(),
            'messages' => $messages->map(fn ($m) => [
                'id' => $m->id,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender->nama ?? 'Unknown',
                'content' => $m->content,
                'type' => $m->type,
                'created_at' => $m->created_at->format('H:i'),
                'created_at_full' => $m->created_at->format('d M Y H:i'),
                'is_deleted' => $m->is_deleted,
                'is_edited' => $m->is_edited,
                'reply_to' => $m->replyTo ? ['sender_name' => $m->replyTo->sender->nama ?? 'Unknown', 'content' => $m->replyTo->content] : null,
                'attachment' => $m->attachment ? ['original_name' => $m->attachment->original_name, 'file_path' => $m->attachment->file_path] : null,
                'reactions' => $m->reactions->groupBy('emoji')->map(fn ($r) => ['count' => $r->count(), 'users' => $r->pluck('user.nama')]),
            ])->values(),
            'selfFormConfig' => [
                'enabled' => $assignment->formation_mode === 'self-form',
                'group_count' => $selfFormGroupCount,
                'group_size' => $selfFormGroupSize,
            ],
            'leaderTools' => $leaderTools,
            'peerEvalCompleted' => $peerEvalCompleted,
            'myGrade' => $myGrade,
            'pendingInvitations' => $pendingInvitations->values(),
            'sentInvitations' => $sentInvitations->values(),
            'stats' => [
                'total_students' => $totalStudents,
                'students_with_group' => $studentsWithGroup,
                'students_without_group' => max(0, $totalStudents - $studentsWithGroup),
            ],
            'activityLogs' => $activityLogs->values(),
            'mahasiswa' => ['id' => $mahasiswa->id, 'nama' => $mahasiswa->nama],
        ]);
    }

    /**
     * Export advanced PDF report for student group assignment detail
     */
    public function exportPdf(int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::query()
            ->with([
                'course',
                'dosen',
                'groups.members.student',
                'groups.tasks.assignees',
                'groups.files.uploader',
                'groups.messages',
                'groups.activityLogs',
                'groups.submission',
            ])
            ->findOrFail($id);

        $myGroup = $assignment->groups->first(function (GaGroup $group) use ($mahasiswa) {
            return $group->members->contains(function (GaGroupMember $member) use ($mahasiswa) {
                return (int) $member->student_id === (int) $mahasiswa->id;
            });
        });

        abort_if(!$myGroup, 403, 'Anda belum tergabung dalam kelompok untuk tugas ini.');

        $members = $myGroup->members->sortByDesc(fn ($member) => (bool) $member->is_leader)->values();
        $tasks = $myGroup->tasks->sortBy(function ($task) {
            return optional($task->deadline)->timestamp ?? PHP_INT_MAX;
        })->values();
        $files = $myGroup->files->sortByDesc(fn ($file) => optional($file->uploaded_at)->timestamp ?? 0)->values();
        $messages = $myGroup->messages->sortByDesc(fn ($message) => optional($message->created_at)->timestamp ?? 0)->values();
        $activityLogs = $myGroup->activityLogs->sortByDesc(fn ($log) => optional($log->created_at)->timestamp ?? 0)->values();

        $taskTotal = $tasks->count();
        $taskCompleted = $tasks->where('status', 'completed')->count();
        $taskInProgress = $tasks->where('status', 'in_progress')->count();
        $taskPending = $tasks->where('status', 'pending')->count();
        $taskOverdue = $tasks
            ->filter(fn ($task) => $task->status !== 'completed' && $task->deadline && $task->deadline->isPast())
            ->count();
        $completionRate = $taskTotal > 0 ? round(($taskCompleted / $taskTotal) * 100, 1) : 0.0;

        $activity24h = $activityLogs->filter(fn ($log) => $log->created_at && $log->created_at->gte(now()->subDay()))->count();
        $activity72h = $activityLogs->filter(fn ($log) => $log->created_at && $log->created_at->gte(now()->subDays(3)))->count();
        $message24h = $messages->filter(fn ($msg) => $msg->created_at && $msg->created_at->gte(now()->subDay()))->count();
        $file7d = $files->filter(fn ($file) => $file->uploaded_at && $file->uploaded_at->gte(now()->subDays(7)))->count();

        $velocityScore = min(100, (int) round(($activity72h * 6) + ($message24h * 4) + ($file7d * 7)));
        $momentumLabel = $velocityScore >= 70 ? 'Sangat Aktif' : ($velocityScore >= 40 ? 'Stabil' : 'Perlu Didorong');

        $collaborationIndex = min(100, (int) round(
            ($completionRate * 0.45)
            + (min($message24h, 25) * 1.2)
            + (min($file7d, 15) * 1.8)
            + (min($activity24h, 20) * 1.1)
        ));

        $riskScore = 0;
        $riskFlags = [];
        if ($taskOverdue > 0) {
            $riskScore += min(45, $taskOverdue * 12);
            $riskFlags[] = "Ada {$taskOverdue} task overdue.";
        }
        if ($completionRate < 45 && $taskTotal > 0) {
            $riskScore += 20;
            $riskFlags[] = 'Progress penyelesaian masih di bawah 45%.';
        }
        if ($message24h === 0 && $activity24h === 0) {
            $riskScore += 15;
            $riskFlags[] = 'Tidak ada aktivitas 24 jam terakhir.';
        }
        if ($assignment->submission_deadline && $assignment->submission_deadline->isFuture()) {
            $daysLeft = now()->diffInDays($assignment->submission_deadline, false);
            if ($daysLeft <= 2 && $completionRate < 80) {
                $riskScore += 25;
                $riskFlags[] = 'Deadline sangat dekat dengan progress yang belum aman.';
            }
        }
        $riskScore = min(100, $riskScore);
        $riskLevel = $riskScore >= 70 ? 'Tinggi' : ($riskScore >= 40 ? 'Sedang' : 'Rendah');
        if (empty($riskFlags)) {
            $riskFlags[] = 'Tidak ada risiko mayor terdeteksi.';
        }

        $myGroupProgress = $taskTotal > 0 ? round(($taskCompleted / $taskTotal) * 100, 1) : 0.0;

        $groupProgresses = $assignment->groups
            ->map(function ($group) {
                $total = $group->tasks->count();
                if ($total === 0) {
                    return 0.0;
                }
                $completed = $group->tasks->where('status', 'completed')->count();
                return round(($completed / $total) * 100, 1);
            })
            ->values();
        $classAverageProgress = $groupProgresses->count() > 0
            ? round($groupProgresses->avg(), 1)
            : 0.0;
        $positionVsAverage = round($myGroupProgress - $classAverageProgress, 1);

        $memberContribution = $members->map(function ($member) use ($messages, $files, $tasks, $activityLogs) {
            $memberId = (int) $member->student_id;

            $msgCount = $messages->where('sender_id', $memberId)->count();
            $fileCount = $files->where('uploaded_by', $memberId)->count();
            $taskCreated = $tasks->where('created_by', $memberId)->count();
            $taskCompleted = $tasks->where('completed_by', $memberId)->count();
            $points = (int) $activityLogs
                ->where('user_id', $memberId)
                ->sum(fn ($log) => (int) ($log->points ?? 0));

            $rawScore = (float) (
                ($points * 1.0)
                + ($msgCount * 1.5)
                + ($fileCount * 2.2)
                + ($taskCreated * 1.4)
                + ($taskCompleted * 4.0)
            );

            return [
                'id' => $memberId,
                'nama' => $member->student->nama ?? 'Unknown',
                'nim' => $member->student->nim ?? '-',
                'is_leader' => (bool) $member->is_leader,
                'messages' => $msgCount,
                'files' => $fileCount,
                'task_created' => $taskCreated,
                'task_completed' => $taskCompleted,
                'points' => $points,
                'raw_score' => $rawScore,
            ];
        })->sortByDesc('raw_score')->values();

        $maxRawScore = max(1.0, (float) ($memberContribution->max('raw_score') ?? 1.0));
        $memberContribution = $memberContribution->map(function ($item) use ($maxRawScore) {
            $item['score_percent'] = (int) round(($item['raw_score'] / $maxRawScore) * 100);
            return $item;
        })->values();

        $weeklyActivity = collect(range(6, 0))->map(function ($dayAgo) use ($activityLogs) {
            $day = now()->subDays($dayAgo)->startOfDay();
            $count = $activityLogs->filter(function ($log) use ($day) {
                return $log->created_at && $log->created_at->isSameDay($day);
            })->count();

            return [
                'label' => $day->translatedFormat('D'),
                'date' => $day->format('d/m'),
                'count' => $count,
            ];
        })->values();
        $maxWeeklyCount = max(1, (int) $weeklyActivity->max('count'));
        $weeklyActivity = $weeklyActivity->map(function ($item) use ($maxWeeklyCount) {
            $item['percent'] = (int) round(($item['count'] / $maxWeeklyCount) * 100);
            return $item;
        })->values();

        $upcomingTasks = $tasks
            ->filter(fn ($task) => $task->status !== 'completed' && $task->deadline)
            ->sortBy(fn ($task) => optional($task->deadline)->timestamp ?? PHP_INT_MAX)
            ->take(6)
            ->map(function ($task) {
                return [
                    'title' => $task->title,
                    'status' => $task->status,
                    'deadline_display' => optional($task->deadline)->timezone('Asia/Jakarta')->format('d M Y H:i'),
                    'is_overdue' => (bool) ($task->deadline && $task->deadline->isPast()),
                ];
            })
            ->values();

        $deadlineInsight = [
            'formation_deadline' => optional($assignment->formation_deadline)->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'submission_deadline' => optional($assignment->submission_deadline)->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'submission_days_left' => $assignment->submission_deadline
                ? now()->diffInDays($assignment->submission_deadline, false)
                : null,
        ];

        $data = [
            'assignment' => $assignment,
            'student' => $mahasiswa,
            'myGroup' => $myGroup,
            'members' => $members,
            'tasks' => $tasks,
            'files' => $files,
            'messages' => $messages,
            'activityLogs' => $activityLogs->take(15)->values(),
            'stats' => [
                'task_total' => $taskTotal,
                'task_completed' => $taskCompleted,
                'task_in_progress' => $taskInProgress,
                'task_pending' => $taskPending,
                'task_overdue' => $taskOverdue,
                'completion_rate' => $completionRate,
                'activity_24h' => $activity24h,
                'activity_72h' => $activity72h,
                'message_24h' => $message24h,
                'file_7d' => $file7d,
                'velocity_score' => $velocityScore,
                'momentum_label' => $momentumLabel,
                'collaboration_index' => $collaborationIndex,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'class_average_progress' => $classAverageProgress,
                'position_vs_average' => $positionVsAverage,
                'my_group_progress' => $myGroupProgress,
            ],
            'riskFlags' => $riskFlags,
            'memberContribution' => $memberContribution,
            'weeklyActivity' => $weeklyActivity,
            'upcomingTasks' => $upcomingTasks,
            'deadlineInsight' => $deadlineInsight,
            'logoUnpam' => file_exists(public_path('logo-unpam.png'))
                ? public_path('logo-unpam.png')
                : public_path('images/logo_unpam.png'),
            'logoSasmita' => file_exists(public_path('sasmita.png'))
                ? public_path('sasmita.png')
                : public_path('images/logo_sasmita.png'),
            'tempat' => 'Tangerang Selatan',
            'tanggalCetak' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'generatedAt' => now()->timezone('Asia/Jakarta')->format('d M Y H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.user-tugas-kelompok-detail', $data);
        $pdf->setPaper('a4', 'portrait');

        $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '-', (string) $assignment->title);
        $filename = 'Laporan-Tugas-Kelompok-' . trim((string) $safeTitle, '-') . '-' . now()->format('Ymd-His') . '.pdf';

        return $pdf->download($filename);
    }

    // ═══════ GROUP FORMATION ACTIONS ═══════

    public function createGroup(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::findOrFail($id);

        $validated = $request->validate(['name' => 'required|string|max:100']);

        try {
            $group = $this->formationService->createSelfFormGroup($assignment, $mahasiswa, $validated['name']);

            $configuredSlotCount = (int) ($assignment->self_form_group_count ?? 0);
            if ($assignment->formation_mode === 'self-form' && $configuredSlotCount > 0) {
                $usedSlots = GaGroup::where('assignment_id', $assignment->id)
                    ->whereNotNull('slot_number')
                    ->pluck('slot_number')
                    ->map(fn ($slot) => (int) $slot)
                    ->all();

                $availableSlot = null;
                for ($slot = 1; $slot <= $configuredSlotCount; $slot++) {
                    if (!in_array($slot, $usedSlots, true)) {
                        $availableSlot = $slot;
                        break;
                    }
                }

                if (!$availableSlot) {
                    $group->delete();
                    return back()->with('error', 'Seluruh slot kelompok sudah terisi.');
                }

                $group->update([
                    'slot_number' => $availableSlot,
                    'name' => "Kelompok {$availableSlot}",
                ]);
            }

            return back()->with('success', 'Kelompok berhasil dibuat!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function joinGroup(int $id, int $groupId)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = GaGroup::where('assignment_id', $id)->findOrFail($groupId);

        try {
            $this->formationService->joinGroup($group, $mahasiswa);
            return back()->with('success', 'Berhasil bergabung ke kelompok!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function joinGroupSlot(int $id, int $slotNumber)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::with('course')->findOrFail($id);

        if ($assignment->formation_mode !== 'self-form') {
            return back()->with('error', 'Fitur pilih slot hanya tersedia pada mode self-form.');
        }

        if ($assignment->is_locked) {
            return back()->with('error', 'Formasi kelompok sudah dikunci.');
        }

        $maxSlot = (int) ($assignment->self_form_group_count ?? 0);
        if ($maxSlot < 1 || $slotNumber < 1 || $slotNumber > $maxSlot) {
            return back()->with('error', 'Slot kelompok tidak valid.');
        }

        $group = GaGroup::where('assignment_id', $assignment->id)
            ->where('slot_number', $slotNumber)
            ->first();

        try {
            if (!$group) {
                $group = $this->formationService->createSelfFormGroup($assignment, $mahasiswa, "Kelompok {$slotNumber}");
                $group->update([
                    'slot_number' => $slotNumber,
                    'name' => "Kelompok {$slotNumber}",
                ]);

                return back()->with('success', "Kelompok {$slotNumber} berhasil dibuat dan Anda menjadi ketua.");
            }

            $this->formationService->joinGroup($group, $mahasiswa);
            return back()->with('success', "Berhasil bergabung ke Kelompok {$slotNumber}.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function leaderAddMember(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::with('course')->findOrFail($id);
        $group = $this->getMyGroup($id, $mahasiswa);
        $this->assertSelfFormLeader($assignment, $group, $mahasiswa);

        $validated = $request->validate([
            'student_id' => 'required|integer|exists:mahasiswa,id',
        ]);

        $targetStudentId = (int) $validated['student_id'];
        $isEnrolled = $this->isStudentEligibleForAssignmentCourse($assignment, $targetStudentId);

        if (!$isEnrolled) {
            return back()->with('error', 'Mahasiswa tidak terdaftar pada mata kuliah ini.');
        }

        try {
            $this->formationService->manualAssignStudent($group, $targetStudentId, false);
            return back()->with('success', 'Anggota berhasil ditambahkan oleh ketua.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function leaderRemoveMember(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::findOrFail($id);
        $group = $this->getMyGroup($id, $mahasiswa);
        $this->assertSelfFormLeader($assignment, $group, $mahasiswa);

        $validated = $request->validate([
            'student_id' => 'required|integer|exists:mahasiswa,id',
        ]);

        $studentId = (int) $validated['student_id'];
        if ($studentId === (int) $mahasiswa->id) {
            return back()->with('error', 'Ketua tidak bisa menghapus dirinya sendiri.');
        }

        $member = GaGroupMember::where('group_id', $group->id)
            ->where('student_id', $studentId)
            ->first();

        if (!$member) {
            return back()->with('error', 'Mahasiswa tidak berada dalam kelompok ini.');
        }

        if ($member->is_leader) {
            return back()->with('error', 'Pindahkan ketua terlebih dahulu sebelum menghapus anggota ini.');
        }

        $member->delete();
        return back()->with('success', 'Anggota berhasil dikeluarkan dari kelompok.');
    }

    public function leaderSetLeader(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::findOrFail($id);
        $group = $this->getMyGroup($id, $mahasiswa);
        $this->assertSelfFormLeader($assignment, $group, $mahasiswa);

        $validated = $request->validate([
            'student_id' => 'required|integer|exists:mahasiswa,id',
        ]);

        $newLeaderId = (int) $validated['student_id'];
        $member = GaGroupMember::where('group_id', $group->id)
            ->where('student_id', $newLeaderId)
            ->first();

        if (!$member) {
            return back()->with('error', 'Mahasiswa harus menjadi anggota kelompok sebelum dijadikan ketua.');
        }

        GaGroupMember::where('group_id', $group->id)->update(['is_leader' => false]);
        $member->update(['is_leader' => true]);
        $group->update(['leader_id' => $newLeaderId]);

        return back()->with('success', 'Ketua kelompok berhasil diperbarui.');
    }

    public function leaveGroup(int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = GaGroup::where('assignment_id', $id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->firstOrFail();

        try {
            $this->formationService->leaveGroup($group, $mahasiswa);
            return back()->with('success', 'Berhasil keluar dari kelompok.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // ═══════ INVITATION SYSTEM ═══════

    public function invite(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::with('course')->findOrFail($id);
        $group = $this->getMyGroup($id, $mahasiswa);

        if ($assignment->is_locked) {
            return back()->with('error', 'Formasi kelompok sudah dikunci.');
        }

        $this->assertSelfFormLeader($assignment, $group, $mahasiswa);

        $validated = $request->validate([
            'student_id' => 'required|integer|exists:mahasiswa,id',
        ]);

        $inviteeId = (int) $validated['student_id'];

        // Eligibility check (Course enrollment or class-wide fallback)
        if (!$this->isStudentEligibleForAssignmentCourse($assignment, $inviteeId)) {
            return back()->with('error', 'Mahasiswa tidak terdaftar pada mata kuliah ini.');
        }

        // Cannot invite yourself
        if ($inviteeId === (int) $mahasiswa->id) {
            return back()->with('error', 'Tidak bisa mengundang diri sendiri.');
        }

        // Check if student is already in a group for this assignment
        $alreadyInGroup = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $id))
            ->where('student_id', $inviteeId)
            ->exists();

        if ($alreadyInGroup) {
            return back()->with('error', 'Mahasiswa sudah tergabung dalam kelompok lain.');
        }

        // Check if group is full
        $selfFormGroupSize = (int) ($assignment->self_form_group_size ?? $assignment->max_members);
        $currentMemberCount = GaGroupMember::where('group_id', $group->id)->count();
        if ($currentMemberCount >= $selfFormGroupSize) {
            return back()->with('error', 'Kelompok sudah penuh.');
        }

        // Check for existing pending invitation
        $existing = GaInvitation::where('group_id', $group->id)
            ->where('invitee_id', $inviteeId)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('error', 'Undangan sudah dikirim sebelumnya dan masih pending.');
        }

        GaInvitation::create([
            'group_id' => $group->id,
            'inviter_id' => $mahasiswa->id,
            'invitee_id' => $inviteeId,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Undangan berhasil dikirim!');
    }

    public function respondInvitation(Request $request, int $id, int $invitationId)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::findOrFail($id);

        $invitation = GaInvitation::where('id', $invitationId)
            ->where('invitee_id', $mahasiswa->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $validated = $request->validate([
            'response' => 'required|in:accepted,rejected',
        ]);

        $invitation->update([
            'status' => $validated['response'],
            'responded_at' => now(),
        ]);

        if ($validated['response'] === 'accepted') {
            // Check if student already in a group
            $alreadyInGroup = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $id))
                ->where('student_id', $mahasiswa->id)
                ->exists();

            if ($alreadyInGroup) {
                $invitation->update(['status' => 'rejected']);
                return back()->with('error', 'Anda sudah tergabung dalam kelompok lain.');
            }

            // Check group is not full
            $group = GaGroup::findOrFail($invitation->group_id);
            $selfFormGroupSize = (int) ($assignment->self_form_group_size ?? $assignment->max_members);
            $currentCount = GaGroupMember::where('group_id', $group->id)->count();

            if ($currentCount >= $selfFormGroupSize) {
                $invitation->update(['status' => 'rejected']);
                return back()->with('error', 'Kelompok sudah penuh.');
            }

            // Join group
            try {
                $this->formationService->joinGroup($group, $mahasiswa);
                return back()->with('success', 'Berhasil bergabung ke kelompok!');
            } catch (\Exception $e) {
                $invitation->update(['status' => 'rejected']);
                return back()->with('error', $e->getMessage());
            }
        }

        return back()->with('success', 'Undangan berhasil ditolak.');
    }

    public function renameGroup(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::findOrFail($id);
        $group = $this->getMyGroup($id, $mahasiswa);
        $this->assertSelfFormLeader($assignment, $group, $mahasiswa);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $group->update(['name' => $validated['name']]);

        return back()->with('success', 'Nama kelompok berhasil diubah.');
    }

    // ═══════ COLLABORATION ACTIONS ═══════

    public function sendMessage(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = $this->getMyGroup($id, $mahasiswa);

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'reply_to_id' => 'nullable|exists:ga_messages,id',
        ]);

        $this->collaborationService->sendMessage($group, $mahasiswa, $validated['content'], $validated['reply_to_id'] ?? null);
        return back();
    }

    public function uploadFile(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = $this->getMyGroup($id, $mahasiswa);

        $request->validate(['file' => 'required|file|max:25600']);

        try {
            $this->collaborationService->uploadFile($group, $mahasiswa, $request->file('file'));
            return back()->with('success', 'File berhasil diupload!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function createTask(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = $this->getMyGroup($id, $mahasiswa);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:mahasiswa,id',
        ]);

        $this->collaborationService->createTask($group, $mahasiswa, $validated);
        return back()->with('success', 'Task berhasil dibuat!');
    }

    public function updateTaskStatus(Request $request, int $id, int $taskId)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = $this->getMyGroup($id, $mahasiswa);

        $task = $group->tasks()->findOrFail($taskId);
        $validated = $request->validate(['status' => 'required|in:pending,in_progress,completed']);
        $this->collaborationService->updateTaskStatus($task, $mahasiswa, $validated['status']);
        return back();
    }

    // ═══════ SUBMISSION ═══════

    public function submitWork(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = $this->getMyGroup($id, $mahasiswa);
        $assignment = GroupAssignment::findOrFail($id);

        $existing = GaSubmission::where('group_id', $group->id)->where('assignment_id', $id)->first();
        if ($existing && !$assignment->allow_resubmission) {
            return back()->with('error', 'Kelompok sudah melakukan submit.');
        }

        $isLate = $assignment->submission_deadline?->isPast() ?? false;
        $lateDuration = $isLate && $assignment->submission_deadline ? (int) $assignment->submission_deadline->diffInMinutes(now()) : 0;

        $submission = GaSubmission::updateOrCreate(
            ['group_id' => $group->id, 'assignment_id' => $id],
            [
                'submitted_by' => $mahasiswa->id,
                'submission_notes' => $request->input('notes'),
                'is_late' => $isLate,
                'late_duration_minutes' => $lateDuration,
            ]
        );

        // Attach selected files
        if ($request->has('file_ids')) {
            $submission->files()->sync($request->input('file_ids'));
        }

        return back()->with('success', 'Tugas berhasil di-submit!');
    }

    // ═══════ PEER EVALUATION ═══════

    public function submitPeerEvaluation(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();

        $validated = $request->validate([
            'evaluations' => 'required|array',
            'evaluations.*.student_id' => 'required|exists:mahasiswa,id',
            'evaluations.*.contribution_score' => 'required|integer|min:1|max:5',
            'evaluations.*.communication_score' => 'required|integer|min:1|max:5',
            'evaluations.*.reliability_score' => 'required|integer|min:1|max:5',
            'evaluations.*.quality_score' => 'required|integer|min:1|max:5',
            'evaluations.*.comments' => 'nullable|string|max:500',
        ]);

        foreach ($validated['evaluations'] as $eval) {
            if ($eval['student_id'] == $mahasiswa->id) continue;

            GaPeerEvaluation::updateOrCreate(
                ['assignment_id' => $id, 'evaluator_id' => $mahasiswa->id, 'evaluated_id' => $eval['student_id']],
                [
                    'contribution_score' => $eval['contribution_score'],
                    'communication_score' => $eval['communication_score'],
                    'reliability_score' => $eval['reliability_score'],
                    'quality_score' => $eval['quality_score'],
                    'comments' => $eval['comments'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Evaluasi peer berhasil dikirim!');
    }

    // ═══════ CONFLICT REPORT ═══════

    public function reportConflict(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $group = $this->getMyGroup($id, $mahasiswa);

        $validated = $request->validate([
            'description' => 'required|string|max:2000',
            'involved_members' => 'nullable|array',
        ]);

        GaConflictReport::create([
            'group_id' => $group->id,
            'reporter_id' => $mahasiswa->id,
            'description' => $validated['description'],
            'involved_members' => $validated['involved_members'] ?? [],
        ]);

        return back()->with('success', 'Laporan konflik berhasil dikirim.');
    }

    // ═══════ HELPERS ═══════

    private function assertSelfFormLeader(GroupAssignment $assignment, GaGroup $group, Mahasiswa $mahasiswa): void
    {
        abort_if($assignment->formation_mode !== 'self-form', 403, 'Aksi ini hanya berlaku pada mode self-form.');
        abort_if($assignment->is_locked, 403, 'Formasi kelompok sudah dikunci.');
        abort_if((int) $group->leader_id !== (int) $mahasiswa->id, 403, 'Hanya ketua kelompok yang bisa melakukan aksi ini.');
    }

    private function getMahasiswa(): Mahasiswa
    {
        $user = Auth::user();
        abort_if(!$user, 403, 'Akun tidak terautentikasi.');

        $nim = (string) (data_get($user, 'username') ?: data_get($user, 'nim') ?: '');
        $mahasiswa = Mahasiswa::where('nim', $nim)->first();
        abort_if(!$mahasiswa, 403, 'Profil mahasiswa tidak ditemukan.');
        return $mahasiswa;
    }

    private function getMyGroup(int $assignmentId, Mahasiswa $mahasiswa): GaGroup
    {
        $group = GaGroup::where('assignment_id', $assignmentId)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->first();
        abort_if(!$group, 404, 'Anda belum tergabung dalam kelompok.');
        return $group;
    }

    private function isStudentEligibleForAssignmentCourse(GroupAssignment $assignment, int $studentId): bool
    {
        $courseName = trim((string) ($assignment->course->nama ?? ''));
        if (empty($courseName)) {
            return true;
        }

        $enrolledIds = MahasiswaCourse::query()
            ->where(function ($query) use ($courseName) {
                $query->where('name', $courseName)
                    ->orWhere('name', 'like', $courseName);
            })
            ->pluck('mahasiswa_id');

        $totalMahasiswa = Mahasiswa::count();
        $enrolledCount = $enrolledIds->count();

        // ═══════ Leniency Fallback ═══════
        // If enrolled count is suspiciously low (e.g. < 10) or represents less than 50%
        // of total students, we allow all students.
        $isSuspiciouslyLow = ($enrolledCount < 10) || ($totalMahasiswa >= 10 && $enrolledCount < ($totalMahasiswa * 0.5));

        if ($isSuspiciouslyLow && $totalMahasiswa > 0) {
            return Mahasiswa::whereKey($studentId)->exists();
        }

        return $enrolledIds->contains($studentId);
    }
}
