<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\TugasSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TugasGradingController extends Controller
{
    public function index(Request $request, Tugas $tuga): InertiaResponse
    {
        $dosen = auth('dosen')->user();

        // Verify ownership
        if ($tuga->created_by_type === 'dosen' && $tuga->created_by_id !== $dosen->id) {
            abort(403);
        }

        $rawSubmissions = TugasSubmission::with('mahasiswa')
            ->where('tugas_id', $tuga->id)
            ->orderBy('submitted_at', 'desc')
            ->get();

        $submissions = $rawSubmissions->map(fn($s) => [
            'id' => $s->id,
            'mahasiswa' => [
                'id' => $s->mahasiswa->id,
                'nama' => $s->mahasiswa->nama,
                'nim' => $s->mahasiswa->nim,
            ],
            'content' => $s->content,
            'file_path' => $s->file_path ? Storage::url($s->file_path) : null,
            'file_name' => $s->file_name,
            'status' => $s->status,
            'grade' => $s->grade,
            'grade_letter' => $s->grade_letter,
            'feedback' => $s->feedback,
            'submitted_at' => $s->submitted_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'graded_at' => $s->graded_at?->timezone('Asia/Jakarta')->format('d M Y H:i'),
            'is_late' => $s->isLate(),
        ]);

        // Enhanced stats
        $graded = $rawSubmissions->whereNotNull('grade');
        $lateCount = $rawSubmissions->filter(fn($s) => $s->isLate())->count();
        $highestSub = $graded->sortByDesc('grade')->first();
        $lowestSub = $graded->sortBy('grade')->first();

        // Grade distribution
        $distribution = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0];
        foreach ($graded as $s) {
            $letter = $s->grade_letter ?? 'E';
            if (isset($distribution[$letter])) $distribution[$letter]++;
        }

        // Total students fallback: use submission count
        $totalStudents = $rawSubmissions->count();

        $stats = [
            'total' => $submissions->count(),
            'graded' => $graded->count(),
            'pending' => $rawSubmissions->whereIn('status', ['submitted', 'late'])->count(),
            'avg_grade' => round($graded->avg('grade') ?? 0, 2),
            'highest_score' => $highestSub?->grade ?? 0,
            'highest_scorer' => $highestSub?->mahasiswa?->nama ?? '-',
            'lowest_score' => $lowestSub?->grade ?? 0,
            'late_count' => $lateCount,
            'late_penalty_percent' => $tuga->late_penalty_percent ?? 10,
            'distribution' => $distribution,
            'total_students' => $totalStudents,
        ];

        return Inertia::render('dosen/tugas-grading', [
            'tugas' => [
                'id' => $tuga->id,
                'judul' => $tuga->judul,
                'deadline' => $tuga->deadline?->format('Y-m-d H:i'),
                'deadline_display' => $tuga->deadline?->translatedFormat('l, d F Y H:i'),
                'max_grade' => $tuga->max_grade ?? 100,
                'course_nama' => $tuga->course?->nama ?? '-',
            ],
            'submissions' => $submissions,
            'stats' => $stats,
        ]);
    }

    public function grade(Request $request, TugasSubmission $submission): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        $request->validate([
            'grade' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $rawGrade = $request->grade;
        $finalGrade = $submission->calculateFinalGrade($rawGrade);
        $gradeLetter = TugasSubmission::calculateGradeLetter($finalGrade);

        $submission->update([
            'grade' => $finalGrade,
            'grade_letter' => $gradeLetter,
            'feedback' => $request->feedback,
            'status' => 'graded',
            'graded_by' => $dosen->id,
            'graded_at' => now(),
        ]);

        return back()->with('success', "Nilai berhasil disimpan: {$finalGrade} ({$gradeLetter})");
    }

    public function bulkGrade(Request $request, Tugas $tuga): RedirectResponse
    {
        $dosen = auth('dosen')->user();

        $request->validate([
            'grades' => 'required|array',
            'grades.*.submission_id' => 'required|exists:tugas_submissions,id',
            'grades.*.grade' => 'required|numeric|min:0|max:100',
            'grades.*.feedback' => 'nullable|string|max:1000',
        ]);

        foreach ($request->grades as $gradeData) {
            $submission = TugasSubmission::find($gradeData['submission_id']);
            if (!$submission || $submission->tugas_id !== $tuga->id) continue;

            $rawGrade = $gradeData['grade'];
            $finalGrade = $submission->calculateFinalGrade($rawGrade);
            $gradeLetter = TugasSubmission::calculateGradeLetter($finalGrade);

            $submission->update([
                'grade' => $finalGrade,
                'grade_letter' => $gradeLetter,
                'feedback' => $gradeData['feedback'] ?? null,
                'status' => 'graded',
                'graded_by' => $dosen->id,
                'graded_at' => now(),
            ]);
        }

        return back()->with('success', 'Nilai berhasil disimpan untuk ' . count($request->grades) . ' submission.');
    }
}
