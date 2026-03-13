<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaSubmission;
use App\Models\GaConflictReport;
use App\Models\ForceAssignLog;
use App\Models\MahasiswaCourse;
use App\Services\GroupFormationService;
use App\Services\GroupGradingService;
use App\Services\GroupAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TugasKelompokController extends Controller
{
    public function __construct(
        private GroupFormationService $formationService,
        private GroupGradingService $gradingService,
        private GroupAnalyticsService $analyticsService,
    ) {}

    /**
     * List all group assignments for the dosen
     */
    public function index(Request $request)
    {
        $dosen = auth()->guard('dosen')->user();
        $query = GroupAssignment::where('dosen_id', $dosen->id)
            ->with(['course', 'groups.members'])
            ->withCount('groups');

        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($courseId = $request->input('course_id')) {
            if ($courseId !== 'all') {
                $query->where('course_id', $courseId);
            }
        }

        $assignments = $query->orderByDesc('created_at')->get()->map(function ($a) {
            $submittedCount = $a->submissions()->count();
            $gradedCount = $a->submissions()->whereNotNull('graded_at')->count();
            $totalStudents = \App\Models\GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $a->id))->count();

            return [
                'id' => $a->id,
                'title' => $a->title,
                'description' => $a->description,
                'formation_mode' => $a->formation_mode,
                'grading_mode' => $a->grading_mode,
                'random_group_count' => $a->random_group_count,
                'random_group_size' => $a->random_group_size,
                'self_form_group_count' => $a->self_form_group_count,
                'self_form_group_size' => $a->self_form_group_size,
                'course' => [
                    'id' => $a->course?->id,
                    'nama' => $a->course?->nama ?? 'Course Managed'
                ],
                'min_members' => $a->min_members,
                'max_members' => $a->max_members,
                'formation_deadline' => $a->formation_deadline?->toISOString(),
                'formation_deadline_display' => $a->formation_deadline?->format('d M Y H:i'),
                'submission_deadline' => $a->submission_deadline?->toISOString(),
                'submission_deadline_display' => $a->submission_deadline?->format('d M Y H:i'),
                'is_locked' => $a->is_locked,
                'total_groups' => $a->groups_count,
                'total_students' => $totalStudents,
                'submitted_groups' => $submittedCount,
                'graded_groups' => $gradedCount,
                'created_at' => $a->created_at->format('d M Y'),
                'is_overdue' => $a->submission_deadline?->isPast() ?? false,
                'days_until_deadline' => $a->submission_deadline ? (int) now()->diffInDays($a->submission_deadline, false) : 0,
            ];
        });

        // Stats
        $stats = [
            'total' => $assignments->count(),
            'active' => $assignments->where('is_overdue', false)->count(),
            'overdue' => $assignments->where('is_overdue', true)->count(),
            'total_groups' => $assignments->sum('total_groups'),
            'total_students' => $assignments->sum('total_students'),
            'avg_completion' => $assignments->count() > 0
                ? round($assignments->avg(fn ($a) => $a['total_groups'] > 0 ? ($a['submitted_groups'] / $a['total_groups']) * 100 : 0), 1)
                : 0,
        ];

        $courses = \App\Models\MataKuliah::whereIn('id',
            GroupAssignment::where('dosen_id', $dosen->id)->pluck('course_id')
        )->get(['id', 'nama']);

        // Also get all courses that this dosen teaches
        $allCourses = $dosen->mataKuliah()->get(['mata_kuliah.id', 'mata_kuliah.nama']);

        return Inertia::render('dosen/tugas-kelompok', [
            'assignments' => $assignments->values(),
            'stats' => $stats,
            'courses' => $courses,
            'allCourses' => $allCourses,
            'filters' => $request->only(['search', 'course_id']),
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
        ]);
    }

    /**
     * Create new group assignment page
     */
    public function create()
    {
        $dosen = auth()->guard('dosen')->user();

        // Only get courses taught by this dosen
        $courses = $dosen->mataKuliah()->get(['mata_kuliah.id', 'mata_kuliah.nama']);

        return Inertia::render('dosen/tugas-kelompok-create', [
            'courses' => $courses,
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
        ]);
    }

    /**
     * Store new group assignment
     */
    public function store(Request $request)
    {
        $dosen = auth()->guard('dosen')->user();
        $validated = $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'formation_mode' => 'required|in:self-form,random,manual',
            'grading_mode' => 'required|in:same,individual,peer,contribution',
            'min_members' => 'required|integer|min:2|max:20',
            'max_members' => 'required|integer|min:2|max:20|gte:min_members',
            'formation_deadline' => 'nullable|date',
            'submission_deadline' => 'nullable|date',
            'max_file_size_mb' => 'nullable|integer|min:1|max:100',
            'features' => 'nullable|array',
            'peer_evaluation_weight' => 'nullable|numeric|min:0|max:1',
            'contribution_threshold' => 'nullable|numeric|min:0|max:1',
            'allow_resubmission' => 'boolean',
            'random_group_count' => 'nullable|integer|min:1|max:100',
            'random_group_size' => 'nullable|integer|min:2|max:20',
            'self_form_group_count' => 'nullable|integer|min:1|max:100',
            'self_form_group_size' => 'nullable|integer|min:2|max:20',
        ]);

        $randomGroupCount = (int) ($validated['random_group_count'] ?? 0);
        $randomGroupSize = (int) ($validated['random_group_size'] ?? 0);
        $selfFormGroupCount = (int) ($validated['self_form_group_count'] ?? 0);
        $selfFormGroupSize = (int) ($validated['self_form_group_size'] ?? 0);

        if ($validated['formation_mode'] === 'random' && $randomGroupSize > 0) {
            if ($randomGroupSize < (int) $validated['min_members'] || $randomGroupSize > (int) $validated['max_members']) {
                return back()->withErrors([
                    'random_group_size' => "Anggota per kelompok random harus {$validated['min_members']} - {$validated['max_members']}.",
                ])->withInput();
            }
        }

        if ($validated['formation_mode'] === 'self-form') {
            if ($selfFormGroupCount < 1) {
                return back()->withErrors([
                    'self_form_group_count' => 'Jumlah kelompok self-form minimal 1.',
                ])->withInput();
            }

            if ($selfFormGroupSize < 2 || $selfFormGroupSize > 20) {
                return back()->withErrors([
                    'self_form_group_size' => 'Anggota per kelompok self-form harus antara 2 - 20.',
                ])->withInput();
            }
        }

        $assignment = GroupAssignment::create([
            'dosen_id' => $dosen->id,
            'course_id' => (int) $validated['course_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'formation_mode' => $validated['formation_mode'],
            'grading_mode' => $validated['grading_mode'],
            'min_members' => (int) $validated['min_members'],
            'max_members' => $validated['formation_mode'] === 'self-form' && $selfFormGroupSize > 0
                ? $selfFormGroupSize
                : (int) $validated['max_members'],
            'formation_deadline' => $validated['formation_deadline'] ?? null,
            'submission_deadline' => $validated['submission_deadline'] ?? null,
            'max_file_size_mb' => (int) ($validated['max_file_size_mb'] ?? 25),
            'features' => $validated['features'] ?? [],
            'peer_evaluation_weight' => $validated['peer_evaluation_weight'] ?? null,
            'contribution_threshold' => $validated['contribution_threshold'] ?? 0.30,
            'allow_resubmission' => (bool) ($validated['allow_resubmission'] ?? false),
            'random_group_count' => $validated['formation_mode'] === 'random' && $randomGroupCount > 0
                ? $randomGroupCount
                : null,
            'random_group_size' => $validated['formation_mode'] === 'random' && $randomGroupSize > 0
                ? $randomGroupSize
                : null,
            'self_form_group_count' => $validated['formation_mode'] === 'self-form' && $selfFormGroupCount > 0
                ? $selfFormGroupCount
                : null,
            'self_form_group_size' => $validated['formation_mode'] === 'self-form' && $selfFormGroupSize > 0
                ? $selfFormGroupSize
                : null,
        ]);

        // If formation mode is random, auto-create groups
        if ($assignment->formation_mode === 'random') {
            $this->formationService->formRandomGroupsAdvanced(
                $assignment,
                $randomGroupCount > 0 ? $randomGroupCount : null,
                $randomGroupSize > 0 ? $randomGroupSize : null
            );
            $assignment->update(['is_locked' => true]);
        }

        return redirect()->route('dosen.tugas-kelompok.show', $assignment->id)
            ->with('success', 'Tugas kelompok berhasil dibuat!');
    }

    /**
     * Show group assignment detail (groups, grading, analytics)
     */
    public function show(Request $request, int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)
            ->findOrFail($id);

        $groups = $assignment->groups()
            ->with(['members.student', 'submission.individualGrades.student', 'tasks', 'conflictReports'])
            ->get()
            ->map(fn ($g) => $this->analyticsService->getGroupSummary($g));

        $analytics = $this->analyticsService->getAssignmentAnalytics($assignment);
        $unassigned = $this->formationService->getUnassignedStudents($assignment);
        $peerEvalSummary = $this->analyticsService->getPeerEvaluationSummary($assignment);
        $conflictReports = GaConflictReport::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->with(['reporter', 'group'])
            ->orderByDesc('created_at')
            ->get();

        // Group monitoring data
        $totalStudentsInCourse = $this->formationService->getTotalCourseStudents($assignment);
        $calculatedMaxGroups = $this->formationService->calculateMaxGroups(
            $totalStudentsInCourse,
            max(2, (int) $assignment->min_members)
        );

        $forceAssignLogs = ForceAssignLog::where('assignment_id', $assignment->id)
            ->with(['student', 'group'])
            ->orderByDesc('created_at')
            ->take(50)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'student_name' => $log->student->nama ?? 'Unknown',
                'student_nim' => $log->student->nim ?? '',
                'group_name' => $log->group->name ?? 'Deleted',
                'action' => $log->action,
                'reason' => $log->reason,
                'admin_type' => $log->admin_type,
                'created_at' => $log->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('dosen/tugas-kelompok-detail', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'formation_mode' => $assignment->formation_mode,
                'grading_mode' => $assignment->grading_mode,
                'min_members' => $assignment->min_members,
                'max_members' => $assignment->max_members,
                'random_group_count' => $assignment->random_group_count,
                'random_group_size' => $assignment->random_group_size,
                'self_form_group_count' => $assignment->self_form_group_count,
                'self_form_group_size' => $assignment->self_form_group_size,
                'formation_deadline' => $assignment->formation_deadline?->toISOString(),
                'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
                'submission_deadline' => $assignment->submission_deadline?->toISOString(),
                'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                'is_locked' => $assignment->is_locked,
                'allow_force_assign' => $assignment->allow_force_assign ?? true,
                'course' => [
                    'id' => $assignment->course?->id,
                    'nama' => $assignment->course?->nama ?? 'Course Managed'
                ],
                'features' => $assignment->features ?? [],
                'peer_evaluation_weight' => $assignment->peer_evaluation_weight,
                'allow_resubmission' => $assignment->allow_resubmission,
            ],
            'groups' => $groups,
            'analytics' => $analytics,
            'unassignedStudents' => $unassigned->map(fn ($s) => ['id' => $s->id, 'nama' => $s->nama, 'nim' => $s->nim ?? '']),
            'peerEvalSummary' => $peerEvalSummary,
            'conflictReports' => $conflictReports,
            'totalStudentsInCourse' => $totalStudentsInCourse,
            'calculatedMaxGroups' => $calculatedMaxGroups,
            'forceAssignLogs' => $forceAssignLogs,
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
        ]);
    }

    /**
     * Form random groups (POST action)
     */
    public function formRandomGroups(int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->findOrFail($id);
        $this->formationService->formRandomGroups($assignment);
        return back()->with('success', 'Kelompok berhasil dibentuk secara acak!');
    }

    /**
     * Manually assign student to group (POST)
     */
    public function assignStudentToGroup(Request $request, int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->findOrFail($id);

        $validated = $request->validate([
            'group_id' => 'required|exists:ga_groups,id',
            'student_id' => 'required|exists:mahasiswa,id',
        ]);

        $group = GaGroup::where('assignment_id', $assignment->id)->findOrFail($validated['group_id']);

        try {
            $this->formationService->manualAssignStudent($group, $validated['student_id']);
            return back()->with('success', 'Mahasiswa berhasil ditambahkan ke kelompok.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Create a new empty group manually (POST)
     */
    public function createGroup(Request $request, int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'leader_id' => 'required|exists:mahasiswa,id',
        ]);

        $group = GaGroup::create([
            'assignment_id' => $assignment->id,
            'name' => $validated['name'],
            'leader_id' => $validated['leader_id'],
        ]);

        \App\Models\GaGroupMember::create([
            'group_id' => $group->id,
            'student_id' => $validated['leader_id'],
            'is_leader' => true,
        ]);

        return back()->with('success', "Kelompok '{$validated['name']}' berhasil dibuat.");
    }

    /**
     * Lock/unlock groups
     */
    public function toggleLock(int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->findOrFail($id);

        if ($assignment->is_locked) {
            $assignment->groups()->update(['is_locked' => false]);
            $assignment->update(['is_locked' => false]);
            return back()->with('success', 'Kelompok berhasil di-unlock.');
        } else {
            $this->formationService->lockGroups($assignment);
            return back()->with('success', 'Kelompok berhasil dikunci.');
        }
    }

    /**
     * Grade a group submission
     */
    public function gradeSubmission(Request $request, int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->findOrFail($id);

        $validated = $request->validate([
            'group_id' => 'required|exists:ga_groups,id',
            'grade' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'adjustments' => 'nullable|array',
            'adjustments.*' => 'numeric|min:-50|max:50',
        ]);

        $group = GaGroup::where('assignment_id', $assignment->id)->findOrFail($validated['group_id']);
        $submission = GaSubmission::where('group_id', $group->id)
            ->where('assignment_id', $assignment->id)
            ->firstOrFail();

        switch ($assignment->grading_mode) {
            case 'same':
                $this->gradingService->gradeSameForAll($submission, $validated['grade'], $validated['notes'], $dosen->id);
                break;
            case 'individual':
                $this->gradingService->gradeWithIndividualAdjustments($submission, $validated['grade'], $validated['adjustments'] ?? [], $validated['notes'], $dosen->id);
                break;
            case 'peer':
                $this->gradingService->calculatePeerEvaluationGrades($submission, $validated['grade'], $assignment->peer_evaluation_weight ?? 0.30, $dosen->id);
                break;
            case 'contribution':
                $this->gradingService->calculateContributionBasedGrades($submission, $validated['grade'], $assignment->contribution_threshold ?? 0.30, $dosen->id);
                break;
        }

        return back()->with('success', 'Nilai berhasil disimpan.');
    }

    /**
     * Resolve a conflict report
     */
    public function resolveConflict(Request $request, int $id, int $reportId)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->findOrFail($id);

        $report = GaConflictReport::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->findOrFail($reportId);

        $report->update([
            'status' => 'resolved',
            'resolution_notes' => $request->input('resolution_notes'),
            'resolved_by' => $dosen->id,
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Laporan konflik berhasil diselesaikan.');
    }

    /**
     * Show detailed progress of a single group
     */
    public function groupProgress(int $id, int $groupId)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', $dosen->id)->with('course')->findOrFail($id);
        $group = GaGroup::where('assignment_id', $assignment->id)
            ->with(['members.student', 'tasks.assignees', 'files.uploader', 'submission', 'conflictReports.reporter'])
            ->findOrFail($groupId);

        // ═══ MEMBER CONTRIBUTIONS (per-member activity breakdown) ═══
        $memberContributions = $this->analyticsService->getMemberContributions($group);
        $members = $group->members->map(function ($m) use ($group, $memberContributions) {
            $msgCount = $group->messages()->where('sender_id', $m->student_id)->count();
            $fileCount = $group->files()->where('uploader_id', $m->student_id)->count();
            $tasksCompleted = $group->tasks()
                ->where('status', 'completed')
                ->whereHas('assignees', fn ($q) => $q->where('mahasiswa_id', $m->student_id))
                ->count();
            $tasksAssigned = $group->tasks()
                ->whereHas('assignees', fn ($q) => $q->where('mahasiswa_id', $m->student_id))
                ->count();

            return [
                'id' => $m->student_id,
                'nama' => $m->student->nama ?? 'Unknown',
                'nim' => $m->student->nim ?? '',
                'kelas' => $m->student->kelas ?? null,
                'is_leader' => $m->is_leader,
                'joined_at' => $m->created_at?->format('d M Y H:i'),
                'contribution_points' => $memberContributions[$m->student_id] ?? 0,
                'message_count' => $msgCount,
                'file_count' => $fileCount,
                'tasks_completed' => $tasksCompleted,
                'tasks_assigned' => $tasksAssigned,
            ];
        });

        // ═══ TASKS ═══
        $tasks = $group->tasks->map(fn ($t) => [
            'id' => $t->id,
            'title' => $t->title,
            'description' => $t->description,
            'status' => $t->status,
            'deadline' => $t->deadline?->toISOString(),
            'deadline_display' => $t->deadline?->format('d M Y H:i'),
            'assignees' => $t->assignees->map(fn ($a) => ['id' => $a->id, 'nama' => $a->nama]),
            'created_at' => $t->created_at?->format('d M Y H:i'),
        ]);

        $taskStats = [
            'total' => $group->tasks->count(),
            'completed' => $group->tasks->where('status', 'completed')->count(),
            'in_progress' => $group->tasks->where('status', 'in_progress')->count(),
            'pending' => $group->tasks->where('status', 'pending')->count(),
        ];

        // ═══ COMMUNICATION STATS ═══
        $totalMessages = $group->messages()->count();
        $msgDistribution = $group->members->map(function ($m) use ($group) {
            $count = $group->messages()->where('sender_id', $m->student_id)->count();
            return ['student_id' => $m->student_id, 'nama' => $m->student->nama ?? 'Unknown', 'count' => $count];
        })->sortByDesc('count')->values();

        // ═══ FILES ═══
        $files = $group->files->map(fn ($f) => [
            'id' => $f->id,
            'original_name' => $f->original_name,
            'file_type' => $f->file_type ?? null,
            'file_size_formatted' => $f->file_size_formatted ?? null,
            'uploader_name' => $f->uploader->nama ?? 'Unknown',
            'file_path' => $f->file_path,
            'created_at' => $f->created_at?->format('d M Y H:i'),
        ]);

        // ═══ ACTIVITY TIMELINE (for this group) ═══
        $activityLogs = \App\Models\GaActivityLog::where('group_id', $group->id)
            ->with('user')
            ->orderByDesc('created_at')
            ->take(50)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'type' => $log->activity_type,
                'user_name' => $log->user->nama ?? 'Unknown',
                'metadata' => $log->activity_metadata,
                'points' => $log->points ?? 0,
                'created_at' => $log->created_at->diffForHumans(),
                'created_at_full' => $log->created_at->format('d M Y H:i'),
            ]);

        // ═══ SUBMISSION ═══
        $submission = $group->submission ? [
            'submitted_at' => $group->submission->submitted_at?->format('d M Y H:i'),
            'is_late' => $group->submission->is_late,
            'late_duration' => $group->submission->late_duration_minutes ?? 0,
            'grade' => $group->submission->grade,
            'grading_notes' => $group->submission->grading_notes,
            'graded_at' => $group->submission->graded_at?->format('d M Y H:i'),
        ] : null;

        // ═══ CONFLICT REPORTS ═══
        $conflictReports = ($group->conflictReports ?? collect())->map(fn ($cr) => [
            'id' => $cr->id,
            'reporter_name' => $cr->reporter->nama ?? 'Unknown',
            'description' => $cr->description,
            'status' => $cr->status,
            'resolution_notes' => $cr->resolution_notes ?? null,
            'created_at' => $cr->created_at?->format('d M Y H:i'),
        ]);

        // ═══ LAST ACTIVITY ═══
        $lastActivity = \App\Models\GaActivityLog::where('group_id', $group->id)
            ->orderByDesc('created_at')
            ->first();

        return Inertia::render('dosen/tugas-kelompok-group-progress', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'course' => [
                    'id' => $assignment->course?->id,
                    'nama' => $assignment->course?->nama ?? 'Course Managed'
                ],
                'formation_mode' => $assignment->formation_mode,
                'grading_mode' => $assignment->grading_mode,
                'submission_deadline' => $assignment->submission_deadline?->toISOString(),
                'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                'is_locked' => $assignment->is_locked,
            ],
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'slot_number' => $group->slot_number,
                'leader_id' => $group->leader_id,
                'progress' => $group->progress,
            ],
            'members' => $members->values(),
            'tasks' => $tasks->values(),
            'taskStats' => $taskStats,
            'communicationStats' => [
                'total_messages' => $totalMessages,
                'distribution' => $msgDistribution,
            ],
            'files' => $files->values(),
            'activityLogs' => $activityLogs->values(),
            'submission' => $submission,
            'conflictReports' => $conflictReports->values(),
            'lastActivity' => $lastActivity ? $lastActivity->created_at->diffForHumans() : null,
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
        ]);
    }

    /**
     * Delete a group assignment
     */
    public function destroy(int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', '=', $dosen->id)->findOrFail($id);
        $assignment->delete();
        return redirect()->route('dosen.tugas-kelompok')
            ->with('success', 'Tugas kelompok berhasil dihapus.');
    }

    /**
     * Update group configuration
     */
    public function updateGroupConfig(Request $request, int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', '=', $dosen->id)->findOrFail($id);

        $validated = $request->validate([
            'allow_force_assign' => 'required|boolean',
        ]);

        $assignment->update($validated);

        return back()->with('success', 'Konfigurasi kelompok berhasil diperbarui.');
    }

    /**
     * Force assign a student to a group
     */
    public function forceAssign(Request $request, int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', '=', $dosen->id)->findOrFail($id);

        $validated = $request->validate([
            'group_id' => 'required|exists:ga_groups,id',
            'student_id' => 'required|exists:mahasiswa,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $group = GaGroup::where('assignment_id', '=', $assignment->id)->findOrFail($validated['group_id']);

        try {
            $this->formationService->forceAssignStudent(
                $group,
                $validated['student_id'],
                $dosen->id,
                'dosen',
                $validated['reason'] ?? null
            );
            return back()->with('success', 'Mahasiswa berhasil dipaksa masuk kelompok.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Auto-assign all unassigned students
     */
    public function autoAssignRemaining(int $id)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', '=', $dosen->id)->findOrFail($id);

        try {
            $result = $this->formationService->autoAssignRemaining(
                $assignment,
                $dosen->id,
                'dosen'
            );
            return back()->with('success', "Berhasil menempatkan {$result['assigned_count']} mahasiswa. Sisa: {$result['remaining']}.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove a student from a group
     */
    public function removeGroupMember(int $id, int $groupId, int $studentId)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', '=', $dosen->id)->findOrFail($id);
        $group = GaGroup::where('assignment_id', '=', $assignment->id)->findOrFail($groupId);

        try {
            $this->formationService->removeStudentFromGroup($group, $studentId);

            ForceAssignLog::create([
                'assignment_id' => $assignment->id,
                'group_id' => $group->id,
                'student_id' => $studentId,
                'admin_id' => $dosen->id,
                'admin_type' => 'dosen',
                'action' => 'remove',
                'reason' => 'Removed by dosen',
            ]);

            return back()->with('success', 'Mahasiswa berhasil dikeluarkan dari kelompok.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Delete a group entirely
     */
    public function deleteGroupAction(int $id, int $groupId)
    {
        $dosen = auth()->guard('dosen')->user();
        $assignment = GroupAssignment::where('dosen_id', '=', $dosen->id)->findOrFail($id);
        $group = GaGroup::where('assignment_id', $assignment->id)->findOrFail($groupId);

        $this->formationService->deleteGroup($group);

        return back()->with('success', 'Kelompok berhasil dihapus.');
    }
}
