<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\MataKuliah;
use App\Services\GradingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GradingController extends Controller
{
    public function __construct(
        private GradingService $gradingService
    ) {}

    public function index(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Get dosen's course (1 dosen = 1 mata kuliah)
        $course = MataKuliah::where('dosen_id', $dosen->id)->first();
        
        if (!$course) {
            return Inertia::render('dosen/grading', [
                'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
                'course' => null,
                'sessions' => [],
                'grades' => null,
            ]);
        }

        // Get all sessions for this course
        $sessions = \App\Models\AttendanceSession::where('course_id', $course->id)
            ->orderBy('meeting_number', 'asc')
            ->get(['id', 'meeting_number', 'title', 'start_at'])
            ->map(fn($s) => [
                'id' => $s->id,
                'meeting_number' => $s->meeting_number,
                'title' => $s->title,
                'date' => $s->start_at?->format('d M Y'),
            ]);

        // Calculate grades for all students
        $grades = $this->gradingService->calculateClassGrades($course->id);

        return Inertia::render('dosen/grading', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'course' => [
                'id' => $course->id,
                'nama' => $course->nama,
                'kode' => $course->kode,
                'sks' => $course->sks,
            ],
            'sessions' => $sessions,
            'grades' => $grades,
        ]);
    }

    public function export(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        $course = MataKuliah::where('dosen_id', $dosen->id)->first();

        if (!$course) {
            abort(404, 'Mata kuliah tidak ditemukan');
        }

        $csv = $this->gradingService->exportGrades($course->id, 'csv');
        $filename = sprintf('nilai_kehadiran_%s_%s.csv', 
            str_replace(' ', '_', $course->nama ?? 'course'),
            now()->format('Y-m-d')
        );

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    public function exportPdf(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        $course = MataKuliah::where('dosen_id', $dosen->id)->first();

        if (!$course) {
            abort(404, 'Mata kuliah tidak ditemukan');
        }

        $grades = $this->gradingService->calculateClassGrades($course->id);

        $data = [
            'course' => $course,
            'dosen' => $dosen,
            'grades' => $grades,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.nilai-kehadiran-dosen', $data);
        $pdf->setPaper('a4', 'landscape');

        $filename = sprintf('nilai_kehadiran_%s_%s.pdf', 
            str_replace(' ', '_', $course->nama ?? 'course'),
            now()->format('Y-m-d')
        );

        return $pdf->download($filename);
    }

    public function studentReport(int $mahasiswaId)
    {
        $dosen = Auth::guard('dosen')->user();
        $report = $this->gradingService->getStudentReport($mahasiswaId);

        return response()->json($report);
    }

    public function override(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'log_id' => 'required|exists:attendance_logs,id',
            'status' => 'required|in:present,late,permit,sick,rejected',
            'reason' => 'required|string|max:500',
        ]);

        $log = AttendanceLog::with('session.course')->findOrFail($validated['log_id']);

        // Verify dosen has access
        if (!$log->session->course || $log->session->course->dosen_id !== $dosen->id) {
            abort(403);
        }

        $this->gradingService->overrideAttendance(
            $validated['log_id'],
            $validated['status'],
            $dosen->id,
            $validated['reason']
        );

        return back()->with('success', 'Status kehadiran berhasil diubah.');
    }
}
