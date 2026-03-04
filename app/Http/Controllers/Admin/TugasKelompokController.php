<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaGroupMember;
use App\Models\GaSubmission;
use App\Models\GaConflictReport;
use App\Models\Mahasiswa;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Models\Dosen;
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
     * List all group assignments (admin sees everything)
     */
    public function index(Request $request)
    {
        $query = GroupAssignment::with(['course', 'groups.members', 'dosen'])
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
                'course' => ['id' => $a->course->id, 'nama' => $a->course->nama],
                'dosen' => $a->dosen ? ['id' => $a->dosen->id, 'nama' => $a->dosen->nama] : null,
                'min_members' => $a->min_members,
                'max_members' => $a->max_members,
                'formation_deadline_display' => $a->formation_deadline?->format('d M Y H:i'),
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

        $courses = \App\Models\MataKuliah::all(['id', 'nama']);

        return Inertia::render('admin/tugas-kelompok', [
            'assignments' => $assignments->values(),
            'stats' => $stats,
            'courses' => $courses,
            'filters' => $request->only(['search', 'course_id']),
        ]);
    }

    /**
     * Create new group assignment page
     */
    public function create()
    {
        $courses = \App\Models\MataKuliah::all(['id', 'nama']);
        $dosens = \App\Models\Dosen::all(['id', 'nama']);

        return Inertia::render('admin/tugas-kelompok-create', [
            'courses' => $courses,
            'dosens' => $dosens,
        ]);
    }

    /**
     * New workflow page for connected Admin-Dosen-Mahasiswa flow.
     */
    public function createWorkflow()
    {
        $courses = MataKuliah::orderBy('nama')->get(['id', 'nama', 'dosen_id']);
        $dosens = Dosen::orderBy('nama')->get(['id', 'nama']);

        $courseStudents = [];
        foreach ($courses as $course) {
            $studentIds = $this->resolveEligibleStudentIdsForCourse($course);
            $courseStudents[(string) $course->id] = Mahasiswa::whereIn('id', $studentIds)
                ->orderBy('nama')
                ->get(['id', 'nama', 'nim'])
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'nama' => $s->nama,
                    'nim' => $s->nim,
                ])
                ->values()
                ->all();
        }

        return Inertia::render('admin/tugas-kelompok-workflow', [
            'courses' => $courses->map(fn ($c) => [
                'id' => $c->id,
                'nama' => $c->nama,
                'dosen_id' => $c->dosen_id,
            ])->values(),
            'dosens' => $dosens,
            'courseStudents' => $courseStudents,
        ]);
    }

    /**
     * Store new group assignment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dosen_id' => 'required|exists:dosen,id',
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
            'manual_groups' => 'nullable|array|min:1',
            'manual_groups.*.name' => 'required_with:manual_groups|string|max:100',
            'manual_groups.*.leader_id' => 'required_with:manual_groups|integer|exists:mahasiswa,id',
            'manual_groups.*.member_ids' => 'required_with:manual_groups|array|min:1',
            'manual_groups.*.member_ids.*' => 'integer|exists:mahasiswa,id',
        ]);

        $randomGroupCount = (int) ($validated['random_group_count'] ?? 0);
        $randomGroupSize = (int) ($validated['random_group_size'] ?? 0);
        $selfFormGroupCount = (int) ($validated['self_form_group_count'] ?? ($validated['random_group_count'] ?? 0));
        $selfFormGroupSize = (int) ($validated['self_form_group_size'] ?? ($validated['random_group_size'] ?? 0));
        $manualGroups = collect($validated['manual_groups'] ?? [])->values();

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
                    'self_form_group_count' => 'Jumlah kelompok untuk mode self-form minimal 1.',
                ])->withInput();
            }

            if ($selfFormGroupSize < 2 || $selfFormGroupSize > 20) {
                return back()->withErrors([
                    'self_form_group_size' => 'Anggota per kelompok self-form harus antara 2 - 20.',
                ])->withInput();
            }
        }

        $course = MataKuliah::findOrFail($validated['course_id']);
        if ($course->dosen_id && (int) $validated['dosen_id'] !== (int) $course->dosen_id) {
            return back()->withErrors([
                'dosen_id' => 'Dosen harus sesuai dengan pengampu mata kuliah terpilih.',
            ])->withInput();
        }

        $enrolledStudentIds = $this->resolveEligibleStudentIdsForCourse($course);

        if ($validated['formation_mode'] === 'manual' && $manualGroups->isNotEmpty()) {
            $usedStudentIds = collect();
            $groupNames = collect();

            foreach ($manualGroups as $index => $groupPayload) {
                $groupName = trim((string) ($groupPayload['name'] ?? ''));
                if ($groupNames->contains($groupName)) {
                    return back()->withErrors([
                        "manual_groups.{$index}.name" => "Nama kelompok '{$groupName}' duplikat. Gunakan nama lain.",
                    ])->withInput();
                }
                $groupNames->push($groupName);

                $memberIds = collect($groupPayload['member_ids'] ?? [])
                    ->map(fn ($id) => (int) $id)
                    ->unique()
                    ->values();
                $leaderId = (int) ($groupPayload['leader_id'] ?? 0);

                if (!$memberIds->contains($leaderId)) {
                    $memberIds->push($leaderId);
                }

                if ($memberIds->count() < (int) $validated['min_members'] || $memberIds->count() > (int) $validated['max_members']) {
                    return back()->withErrors([
                        "manual_groups.{$index}.member_ids" => "Jumlah anggota untuk {$groupPayload['name']} harus antara {$validated['min_members']} - {$validated['max_members']}.",
                    ])->withInput();
                }

                $outsideCourse = $memberIds->diff($enrolledStudentIds);
                if ($outsideCourse->isNotEmpty()) {
                    return back()->withErrors([
                        "manual_groups.{$index}.member_ids" => "Ada anggota {$groupPayload['name']} yang tidak terdaftar di mata kuliah terpilih.",
                    ])->withInput();
                }

                $duplicatedAcrossGroups = $memberIds->intersect($usedStudentIds);
                if ($duplicatedAcrossGroups->isNotEmpty()) {
                    return back()->withErrors([
                        "manual_groups.{$index}.member_ids" => "Ada anggota {$groupPayload['name']} yang sudah dipakai di kelompok lain.",
                    ])->withInput();
                }

                $usedStudentIds = $usedStudentIds->merge($memberIds);
            }
        }

        $assignment = GroupAssignment::create([
            'dosen_id' => $validated['dosen_id'],
            'course_id' => $validated['course_id'],
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

        if ($assignment->formation_mode === 'random') {
            $this->formationService->formRandomGroupsAdvanced(
                $assignment,
                $randomGroupCount > 0 ? $randomGroupCount : null,
                $randomGroupSize > 0 ? $randomGroupSize : null
            );
            $this->formationService->lockGroups($assignment);
        }

        if ($assignment->formation_mode === 'manual' && $manualGroups->isNotEmpty()) {
            foreach ($manualGroups as $groupPayload) {
                $memberIds = collect($groupPayload['member_ids'] ?? [])
                    ->map(fn ($id) => (int) $id)
                    ->unique()
                    ->values();

                $leaderId = (int) $groupPayload['leader_id'];
                if (!$memberIds->contains($leaderId)) {
                    $memberIds->push($leaderId);
                }

                $group = GaGroup::create([
                    'assignment_id' => $assignment->id,
                    'name' => $groupPayload['name'],
                    'leader_id' => $leaderId,
                ]);

                foreach ($memberIds as $memberId) {
                    GaGroupMember::create([
                        'group_id' => $group->id,
                        'student_id' => $memberId,
                        'is_leader' => $memberId === $leaderId,
                    ]);
                }
            }

            $assignment->groups()->update(['is_locked' => true]);
            $assignment->update(['is_locked' => true]);
        }

        if ($request->boolean('return_to_workflow')) {
            return redirect()->route('admin.tugas-kelompok.workflow')
                ->with('success', "Tugas kelompok berhasil dibuat (ID: {$assignment->id}).");
        }

        return redirect()->route('admin.tugas-kelompok.show', $assignment->id)
            ->with('success', 'Tugas kelompok berhasil dibuat!');
    }

    /**
     * Resolve course students with fallback when course mapping data is still incomplete.
     */
    private function resolveEligibleStudentIdsForCourse(MataKuliah $course)
    {
        $enrolled = MahasiswaCourse::where('name', $course->nama)
            ->pluck('mahasiswa_id')
            ->unique()
            ->values();

        $totalMahasiswa = Mahasiswa::count();
        if ($enrolled->count() <= 2 && $totalMahasiswa >= 10) {
            return Mahasiswa::query()->pluck('id')->values();
        }

        return $enrolled;
    }

    /**
     * Show group assignment detail
     */
    public function show(int $id)
    {
        $assignment = GroupAssignment::with('course', 'dosen')->findOrFail($id);

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

        return Inertia::render('admin/tugas-kelompok-detail', [
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
                'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
                'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
                'is_locked' => $assignment->is_locked,
                'course' => ['id' => $assignment->course->id, 'nama' => $assignment->course->nama],
                'dosen' => $assignment->dosen ? ['id' => $assignment->dosen->id, 'nama' => $assignment->dosen->nama] : null,
                'features' => $assignment->features ?? [],
                'peer_evaluation_weight' => $assignment->peer_evaluation_weight,
                'allow_resubmission' => $assignment->allow_resubmission,
            ],
            'groups' => $groups,
            'analytics' => $analytics,
            'unassignedStudents' => $unassigned->map(fn ($s) => ['id' => $s->id, 'nama' => $s->nama, 'nim' => $s->nim ?? '']),
            'peerEvalSummary' => $peerEvalSummary,
            'conflictReports' => $conflictReports,
        ]);
    }

    public function formRandomGroups(int $id)
    {
        $assignment = GroupAssignment::findOrFail($id);
        $this->formationService->formRandomGroups($assignment);
        return back()->with('success', 'Kelompok berhasil dibentuk secara acak!');
    }

    public function assignStudentToGroup(Request $request, int $id)
    {
        $assignment = GroupAssignment::findOrFail($id);
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

    public function createGroup(Request $request, int $id)
    {
        $assignment = GroupAssignment::findOrFail($id);
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

    public function toggleLock(int $id)
    {
        $assignment = GroupAssignment::findOrFail($id);

        if ($assignment->is_locked) {
            $assignment->groups()->update(['is_locked' => false]);
            $assignment->update(['is_locked' => false]);
            return back()->with('success', 'Kelompok berhasil di-unlock.');
        } else {
            $this->formationService->lockGroups($assignment);
            return back()->with('success', 'Kelompok berhasil dikunci.');
        }
    }

    public function gradeSubmission(Request $request, int $id)
    {
        $assignment = GroupAssignment::findOrFail($id);
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

        $adminId = auth()->id();

        switch ($assignment->grading_mode) {
            case 'same':
                $this->gradingService->gradeSameForAll($submission, $validated['grade'], $validated['notes'], $adminId);
                break;
            case 'individual':
                $this->gradingService->gradeWithIndividualAdjustments($submission, $validated['grade'], $validated['adjustments'] ?? [], $validated['notes'], $adminId);
                break;
            case 'peer':
                $this->gradingService->calculatePeerEvaluationGrades($submission, $validated['grade'], $assignment->peer_evaluation_weight ?? 0.30, $adminId);
                break;
            case 'contribution':
                $this->gradingService->calculateContributionBasedGrades($submission, $validated['grade'], $assignment->contribution_threshold ?? 0.30, $adminId);
                break;
        }

        return back()->with('success', 'Nilai berhasil disimpan.');
    }

    public function resolveConflict(Request $request, int $id, int $reportId)
    {
        $assignment = GroupAssignment::findOrFail($id);
        $report = GaConflictReport::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->findOrFail($reportId);

        $report->update([
            'status' => 'resolved',
            'resolution_notes' => $request->input('resolution_notes'),
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Laporan konflik berhasil diselesaikan.');
    }

    public function destroy(int $id)
    {
        $assignment = GroupAssignment::findOrFail($id);
        $assignment->delete();
        return redirect()->route('admin.tugas-kelompok')
            ->with('success', 'Tugas kelompok berhasil dihapus.');
    }
}
