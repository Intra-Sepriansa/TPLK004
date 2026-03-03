<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaSubmission;
use App\Models\GaConflictReport;
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
        ]);

        $assignment = GroupAssignment::create($validated);

        if ($assignment->formation_mode === 'random') {
            $this->formationService->formRandomGroups($assignment);
            $assignment->update(['is_locked' => true]);
        }

        return redirect()->route('admin.tugas-kelompok.show', $assignment->id)
            ->with('success', 'Tugas kelompok berhasil dibuat!');
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
