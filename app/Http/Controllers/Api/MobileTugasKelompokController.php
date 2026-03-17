<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GaGroup;
use App\Models\GaGroupMember;
use App\Models\GaInvitation;
use App\Models\GaPeerEvaluation;
use App\Models\GaSubmission;
use App\Models\GroupAssignment;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Services\GroupCollaborationService;
use App\Services\GroupFormationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

class MobileTugasKelompokController extends Controller
{
    public function __construct(
        private GroupFormationService $formationService,
        private GroupCollaborationService $collaborationService,
    ) {}

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok
     */
    public function index(Request $request): JsonResponse
    {
        $mahasiswa = $request->user();
        $allowedCourseIds = $this->resolveEligibleCourseIds($mahasiswa);

        $assignments = GroupAssignment::query()
            ->with(['course', 'dosen'])
            ->withCount('groups')
            ->where(function ($query) use ($allowedCourseIds, $mahasiswa) {
                if ($allowedCourseIds->isNotEmpty()) {
                    $query->whereIn('course_id', $allowedCourseIds);
                } else {
                    $query->whereRaw('1 = 0');
                }
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
                        'id' => $assignment->course?->id ?? 0,
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
            'upcoming_deadline' => $this->upcomingDeadline($assignments),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'assignments' => $assignments,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * GET /api/mobile/mahasiswa/tugas-kelompok/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $assignment = GroupAssignment::with('course')->findOrFail($id);

        $myGroup = GaGroup::where('assignment_id', $assignment->id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->with(['members.student', 'tasks.assignees', 'files.uploader', 'submission'])
            ->first();

        $selfFormGroupSize = (int) ($assignment->self_form_group_size ?? $assignment->max_members);
        $selfFormGroupCount = (int) ($assignment->self_form_group_count ?? 0);

        // All groups (for grid view)
        $allGroups = collect();
        if ($assignment->formation_mode === 'self-form') {
            if ($selfFormGroupCount > 0) {
                $groupsBySlot = GaGroup::where('assignment_id', $assignment->id)
                    ->withCount('members')
                    ->with('members.student')
                    ->get()
                    ->filter(fn ($g) => (int) $g->slot_number > 0)
                    ->keyBy(fn ($g) => (int) $g->slot_number);

                for ($slot = 1; $slot <= $selfFormGroupCount; $slot++) {
                    $group = $groupsBySlot->get($slot);
                    $memberCount = (int) ($group?->members_count ?? 0);
                    $members = $group ? $group->members->map(fn ($m) => [
                        'id' => $m->student_id,
                        'nama' => $m->student->nama ?? 'Unknown',
                        'nim' => $m->student->nim ?? '',
                        'is_leader' => $m->is_leader,
                    ])->values()->all() : [];

                    $allGroups->push([
                        'id' => $group?->id,
                        'slot_number' => $slot,
                        'name' => $group?->name ?? "Kelompok {$slot}",
                        'member_count' => $memberCount,
                        'max_members' => $selfFormGroupSize,
                        'is_full' => $memberCount >= $selfFormGroupSize,
                        'is_my_group' => $group && $group->members->contains(fn ($m) => (int) $m->student_id === (int) $mahasiswa->id),
                        'leader' => $group
                            ? ['nama' => $group->members->first(fn ($m) => $m->is_leader)?->student?->nama ?? '-']
                            : ['nama' => '-'],
                        'members' => $members,
                    ]);
                }
            } else {
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
                        'leader' => ['nama' => $g->members->first(fn ($m) => $m->is_leader)?->student?->nama ?? 'Unknown'],
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
        $leaderTools = ['can_manage' => false, 'unassigned_students' => []];
        if ($myGroup && (int) $myGroup->leader_id === (int) $mahasiswa->id && $assignment->formation_mode === 'self-form' && !$assignment->is_locked) {
            $leaderTools['can_manage'] = true;
            $leaderTools['unassigned_students'] = $this->formationService
                ->getUnassignedStudents($assignment)
                ->where('id', '!=', $mahasiswa->id)
                ->sortBy('nama')
                ->values()
                ->map(fn ($s) => ['id' => $s->id, 'nama' => $s->nama, 'nim' => $s->nim, 'kelas' => $s->kelas ?? null])
                ->all();
        }

        // Messages
        $messages = $myGroup ? $this->collaborationService->getGroupMessages($myGroup, 50) : collect();
        if ($myGroup) {
            $this->collaborationService->markMessagesAsRead($myGroup, $mahasiswa);
        }

        // Grade
        $myGrade = null;
        if ($myGroup?->submission) {
            $grade = \App\Models\GaIndividualGrade::where('submission_id', $myGroup->submission->id)
                ->where('student_id', $mahasiswa->id)
                ->first();
            $myGrade = $grade?->final_grade;
        }

        // Pending invitations
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

        // Sent invitations
        $sentInvitations = collect();
        if ($myGroup && (int) $myGroup->leader_id === (int) $mahasiswa->id) {
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

        // Stats
        $studentsWithGroup = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->distinct('student_id')
            ->count('student_id');
        $totalStudents = $studentsWithGroup;
        try {
            $allEligible = $this->formationService->getUnassignedStudents($assignment);
            $totalStudents = $studentsWithGroup + $allEligible->count();
        } catch (\Exception $e) {
            // fallback silently
        }

        // Activity logs
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
                ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'assignment' => [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'formation_mode' => $assignment->formation_mode,
                    'grading_mode' => $assignment->grading_mode,
                    'course' => $assignment->course
                        ? ['id' => $assignment->course->id, 'nama' => $assignment->course->nama]
                        : ['id' => 0, 'nama' => ''],
                    'min_members' => $assignment->min_members,
                    'max_members' => $assignment->max_members,
                    'formation_deadline' => $assignment->formation_deadline?->toISOString(),
                    'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
                    'submission_deadline' => $assignment->submission_deadline?->toISOString(),
                    'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                    'is_locked' => $assignment->is_locked,
                    'is_overdue' => $assignment->submission_deadline?->isPast() ?? false,
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
                    ])->values()->all(),
                    'tasks' => $myGroup->tasks->map(fn ($t) => [
                        'id' => $t->id,
                        'title' => $t->title,
                        'description' => $t->description,
                        'status' => $t->status,
                        'priority' => $t->priority ?? 'medium',
                        'due_date' => $t->deadline?->toISOString(),
                        'assignees' => $t->assignees->map(fn ($a) => ['id' => $a->id, 'nama' => $a->nama])->values()->all(),
                    ])->values()->all(),
                    'files' => $myGroup->files->map(fn ($f) => [
                        'id' => $f->id,
                        'original_name' => $f->original_name,
                        'file_size_formatted' => $f->file_size_formatted,
                        'uploader' => ['nama' => $f->uploader->nama ?? 'Unknown'],
                        'download_url' => $f->file_path,
                        'created_at' => $f->uploaded_at?->format('d M Y H:i') ?? $f->created_at?->format('d M Y H:i'),
                    ])->values()->all(),
                    'message_count' => $myGroup->messages()->count(),
                    'file_count' => $myGroup->files->count(),
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
                    'sender' => ['id' => $m->sender_id ?? 0, 'nama' => $m->sender->nama ?? 'Unknown'],
                    'content' => $m->content,
                    'type' => $m->type ?? 'text',
                    'created_at' => $m->created_at->format('H:i'),
                    'attachment' => $m->attachment ? [
                        'name' => $m->attachment->original_name ?? null,
                        'url' => $m->attachment->file_path ?? null,
                    ] : null,
                ])->values(),
                'hasSubmitted' => (bool) $myGroup?->submission,
                'myGrade' => $myGrade,
                'selfFormConfig' => [
                    'enabled' => $assignment->formation_mode === 'self-form',
                    'group_count' => $selfFormGroupCount,
                    'group_size' => $selfFormGroupSize,
                ],
                'leaderTools' => $leaderTools,
                'pendingInvitations' => $pendingInvitations->values(),
                'sentInvitations' => $sentInvitations->values(),
                'stats' => [
                    'total_students' => $totalStudents,
                    'students_with_group' => $studentsWithGroup,
                    'students_without_group' => max(0, $totalStudents - $studentsWithGroup),
                ],
                'activityLogs' => $activityLogs->values(),
            ],
        ]);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/join
     */
    public function join(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $request->validate(['group_id' => 'required|integer']);

        $group = GaGroup::where('assignment_id', $id)->findOrFail($request->group_id);

        try {
            $this->formationService->joinGroup($group, $mahasiswa);
            return response()->json(['success' => true, 'message' => 'Berhasil bergabung ke kelompok!']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/message
     */
    public function message(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $request->validate(['content' => 'required|string|max:2000']);

        $myGroup = GaGroup::where('assignment_id', $id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->firstOrFail();

        $this->collaborationService->sendMessage($myGroup, $mahasiswa, $request->content);

        return response()->json(['success' => true, 'message' => 'Pesan berhasil dikirim']);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/upload
     */
    public function upload(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $request->validate(['file' => 'required|file|max:10240']);

        $myGroup = GaGroup::where('assignment_id', $id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->firstOrFail();

        $this->collaborationService->uploadFile($myGroup, $mahasiswa, $request->file('file'));

        return response()->json(['success' => true, 'message' => 'File berhasil diupload']);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/submit
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $assignment = GroupAssignment::findOrFail($id);

        $myGroup = GaGroup::where('assignment_id', $id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->firstOrFail();

        if ($myGroup->submission && !$assignment->allow_resubmission) {
            return response()->json(['success' => false, 'message' => 'Assignment sudah disubmit dan tidak boleh resubmit'], 422);
        }

        GaSubmission::updateOrCreate(
            ['group_id' => $myGroup->id, 'assignment_id' => $id],
            [
                'submitted_at' => now(),
                'submitted_by' => $mahasiswa->id,
                'notes' => $request->input('notes'),
                'is_late' => $assignment->submission_deadline?->isPast() ?? false,
            ],
        );

        return response()->json(['success' => true, 'message' => 'Assignment berhasil disubmit']);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/invite
     */
    public function invite(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $assignment = GroupAssignment::findOrFail($id);
        $request->validate(['student_id' => 'required|integer|exists:mahasiswa,id']);

        $myGroup = GaGroup::where('assignment_id', $id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->firstOrFail();

        if ((int) $myGroup->leader_id !== (int) $mahasiswa->id) {
            return response()->json(['success' => false, 'message' => 'Hanya ketua yang bisa mengundang'], 403);
        }

        $inviteeId = (int) $request->student_id;

        $alreadyInGroup = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $id))
            ->where('student_id', $inviteeId)
            ->exists();

        if ($alreadyInGroup) {
            return response()->json(['success' => false, 'message' => 'Mahasiswa sudah tergabung dalam kelompok lain'], 422);
        }

        $existing = GaInvitation::where('group_id', $myGroup->id)
            ->where('invitee_id', $inviteeId)
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Undangan sudah dikirim sebelumnya'], 422);
        }

        GaInvitation::create([
            'group_id' => $myGroup->id,
            'inviter_id' => $mahasiswa->id,
            'invitee_id' => $inviteeId,
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Undangan berhasil dikirim']);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/invitation/{invId}/accept
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/invitation/{invId}/decline
     */
    public function respondInvitation(Request $request, int $id, int $invId, string $action): JsonResponse
    {
        $mahasiswa = $request->user();
        $invitation = GaInvitation::where('invitee_id', $mahasiswa->id)
            ->where('status', 'pending')
            ->findOrFail($invId);

        if ($action === 'accept') {
            try {
                $this->formationService->joinGroup($invitation->group, $mahasiswa);
                $invitation->update(['status' => 'accepted']);
                return response()->json(['success' => true, 'message' => 'Berhasil bergabung ke kelompok!']);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
            }
        }

        $invitation->update(['status' => 'declined']);
        return response()->json(['success' => true, 'message' => 'Undangan ditolak']);
    }

    /**
     * POST /api/mobile/mahasiswa/tugas-kelompok/{id}/task
     */
    public function addTask(Request $request, int $id): JsonResponse
    {
        $mahasiswa = $request->user();
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
        ]);

        $myGroup = GaGroup::where('assignment_id', $id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->firstOrFail();

        $myGroup->tasks()->create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => 'pending',
            'deadline' => $request->due_date,
            'created_by' => $mahasiswa->id,
        ]);

        return response()->json(['success' => true, 'message' => 'Tugas berhasil ditambahkan']);
    }

    // ── Helpers ──

    private function resolveEligibleCourseIds($mahasiswa)
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
            $normalizedNames = $courseNames->map(fn ($n) => mb_strtolower($n))->unique()->values();
            $idsByNormalizedName = MataKuliah::query()
                ->get(['id', 'nama'])
                ->filter(fn ($c) => $normalizedNames->contains(mb_strtolower(trim((string) $c->nama))))
                ->pluck('id');
        }

        $idsByClass = collect();
        if (!empty($mahasiswa->kelas) && Schema::hasColumn('mata_kuliah', 'kelas')) {
            $idsByClass = MataKuliah::query()->where('kelas', $mahasiswa->kelas)->pluck('id');
        }

        return $idsByExactName->merge($idsByNormalizedName)->merge($idsByClass)->map(fn ($id) => (int) $id)->unique()->values();
    }

    private function upcomingDeadline($assignments): string
    {
        $upcoming = collect($assignments)
            ->filter(fn ($a) => !$a['has_submitted'] && !empty($a['submission_deadline']))
            ->sortBy('submission_deadline')
            ->first();

        if (!$upcoming) return '-';
        $days = (int) now()->diffInDays(Carbon::parse($upcoming['submission_deadline']), false);
        if ($days < 0) return 'Terlewat';
        if ($days === 0) return 'Hari ini';
        if ($days === 1) return 'Besok';
        return $days . ' hari';
    }
}
