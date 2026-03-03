<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaGroupMember;
use App\Models\GaSubmission;
use App\Models\GaPeerEvaluation;
use App\Models\GaConflictReport;
use App\Models\Mahasiswa;
use App\Services\GroupFormationService;
use App\Services\GroupCollaborationService;
use App\Services\GroupAnalyticsService;
use Illuminate\Http\Request;
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
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('nim', $user->username ?? $user->nim ?? '')->first();
        if (!$mahasiswa) abort(403, 'Mahasiswa profile not found');

        // mahasiswa_courses stores course 'name' as text, not a FK
        // Match by name to get corresponding mata_kuliah IDs
        $courseNames = \App\Models\MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)->pluck('name');
        $courseIds = \App\Models\MataKuliah::whereIn('nama', $courseNames)->pluck('id');

        $assignments = GroupAssignment::whereIn('course_id', $courseIds)
            ->with(['course'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($a) use ($mahasiswa) {
                $myGroup = GaGroup::where('assignment_id', $a->id)
                    ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
                    ->with(['members.student'])
                    ->first();

                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'description' => $a->description,
                    'course' => ['id' => $a->course->id, 'nama' => $a->course->nama],
                    'formation_mode' => $a->formation_mode,
                    'grading_mode' => $a->grading_mode,
                    'formation_deadline' => $a->formation_deadline?->toISOString(),
                    'formation_deadline_display' => $a->formation_deadline?->format('d M Y H:i'),
                    'submission_deadline' => $a->submission_deadline?->toISOString(),
                    'submission_deadline_display' => $a->submission_deadline?->format('d M Y H:i'),
                    'is_locked' => $a->is_locked,
                    'has_group' => $myGroup !== null,
                    'group_name' => $myGroup?->name,
                    'group_id' => $myGroup?->id,
                    'member_count' => $myGroup ? $myGroup->members->count() : 0,
                    'max_members' => $a->max_members,
                    'is_overdue' => $a->submission_deadline?->isPast() ?? false,
                    'days_until_deadline' => $a->submission_deadline ? (int) now()->diffInDays($a->submission_deadline, false) : 0,
                ];
            });

        return Inertia::render('user/akademik/tugas-kelompok', [
            'assignments' => $assignments->values(),
            'mahasiswa' => ['id' => $mahasiswa->id, 'nama' => $mahasiswa->nama],
        ]);
    }

    /**
     * Show group assignment detail (collaboration workspace)
     */
    public function show(int $id)
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('nim', $user->username ?? $user->nim ?? '')->first();
        if (!$mahasiswa) abort(403);

        $assignment = GroupAssignment::findOrFail($id);

        $myGroup = GaGroup::where('assignment_id', $assignment->id)
            ->whereHas('members', fn ($q) => $q->where('student_id', $mahasiswa->id))
            ->with(['members.student', 'tasks.assignees', 'files.uploader', 'submission', 'conflictReports'])
            ->first();

        // Get available groups to join (self-form mode, not locked)
        $availableGroups = collect();
        if (!$myGroup && $assignment->formation_mode === 'self-form' && !$assignment->is_locked) {
            $availableGroups = GaGroup::where('assignment_id', $assignment->id)
                ->withCount('members')
                ->having('members_count', '<', $assignment->max_members)
                ->with('members.student')
                ->get()
                ->map(fn ($g) => [
                    'id' => $g->id,
                    'name' => $g->name,
                    'member_count' => $g->members_count,
                    'max_members' => $assignment->max_members,
                    'leader' => $g->members->first(fn ($m) => $m->is_leader)?->student ?? ['nama' => 'Unknown'],
                ]);
        }

        // Get messages if in a group
        $messages = $myGroup ? $this->collaborationService->getGroupMessages($myGroup, 50) : collect();

        // Mark messages as read
        if ($myGroup) {
            $this->collaborationService->markMessagesAsRead($myGroup, $mahasiswa);
        }

        // Peer evaluation status
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

        return Inertia::render('user/akademik/tugas-kelompok-detail', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'formation_mode' => $assignment->formation_mode,
                'grading_mode' => $assignment->grading_mode,
                'min_members' => $assignment->min_members,
                'max_members' => $assignment->max_members,
                'formation_deadline' => $assignment->formation_deadline?->toISOString(),
                'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
                'submission_deadline' => $assignment->submission_deadline?->toISOString(),
                'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                'is_locked' => $assignment->is_locked,
                'course' => ['id' => $assignment->course->id, 'nama' => $assignment->course->nama],
                'features' => $assignment->features ?? [],
                'allow_resubmission' => $assignment->allow_resubmission,
            ],
            'myGroup' => $myGroup ? [
                'id' => $myGroup->id,
                'name' => $myGroup->name,
                'leader_id' => $myGroup->leader_id,
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
            'availableGroups' => $availableGroups,
            'peerEvalCompleted' => $peerEvalCompleted,
            'myGrade' => $myGrade,
            'mahasiswa' => ['id' => $mahasiswa->id, 'nama' => $mahasiswa->nama],
        ]);
    }

    // ═══════ GROUP FORMATION ACTIONS ═══════

    public function createGroup(Request $request, int $id)
    {
        $mahasiswa = $this->getMahasiswa();
        $assignment = GroupAssignment::findOrFail($id);

        $validated = $request->validate(['name' => 'required|string|max:100']);

        try {
            $this->formationService->createSelfFormGroup($assignment, $mahasiswa, $validated['name']);
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

    private function getMahasiswa(): Mahasiswa
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('nim', $user->username ?? $user->nim ?? '')->first();
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
}
