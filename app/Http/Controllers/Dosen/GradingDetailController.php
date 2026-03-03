<?php

namespace App\Http\Controllers\Dosen;

use App\Exports\GradingDetailExport;
use App\Http\Controllers\Controller;
use App\Models\AcademicNote;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Services\GradingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class GradingDetailController extends Controller
{
    public function __construct(
        private GradingService $gradingService
    ) {
    }

    public function show(int $mahasiswaId)
    {
        $payload = $this->buildDetailPayload($mahasiswaId);

        return Inertia::render('dosen/grading-detail', [
            'dosen' => $payload['dosen'],
            'student' => $payload['student'],
            'course' => $payload['course'],
            'gradeData' => $payload['gradeData'],
            'attendanceRecords' => $payload['attendanceRecords'],
            'classAverage' => $payload['classAverage'],
            'dosenNotes' => $payload['dosenNotes'],
        ]);
    }

    public function export(Request $request, int $mahasiswaId)
    {
        $request->validate([
            'format' => 'nullable|in:pdf,excel,xlsx',
            'scope' => 'nullable|in:summary,full',
            'include_notes' => 'nullable|boolean',
            'include_timeline' => 'nullable|boolean',
            'disposition' => 'nullable|in:download,inline',
        ]);

        $format = $request->string('format')->lower()->value() ?: 'pdf';
        if ($format === 'xlsx') {
            $format = 'excel';
        }

        $scope = $request->string('scope')->lower()->value() ?: 'full';
        $includeNotes = $request->boolean('include_notes', true);
        $includeTimeline = $request->boolean('include_timeline', true);
        $disposition = $request->string('disposition')->lower()->value() ?: 'download';

        $payload = $this->buildDetailPayload($mahasiswaId);
        $payload = $this->filterPayloadByScope($payload, $scope, $includeTimeline, $includeNotes);

        $nim = preg_replace('/[^A-Za-z0-9\-]/', '-', (string) ($payload['student']['nim'] ?? 'mahasiswa'));
        $filename = sprintf('grading-detail-%s-%s', $nim ?: 'mahasiswa', now()->format('Ymd-His'));

        if ($format === 'excel') {
            return Excel::download(
                new GradingDetailExport($payload, $scope, $includeTimeline, $includeNotes),
                $filename . '.xlsx'
            );
        }

        $generatedAt = now()->format('d M Y H:i:s');
        $pdf = Pdf::loadView('pdf.grading-detail-report', [
            'dosen' => $payload['dosen'],
            'student' => $payload['student'],
            'course' => $payload['course'],
            'gradeData' => $payload['gradeData'],
            'attendanceRecords' => $payload['attendanceRecords'],
            'classAverage' => $payload['classAverage'],
            'dosenNotes' => $payload['dosenNotes'],
            'generatedAt' => $generatedAt,
            'scope' => $scope,
        ]);

        $pdf->setPaper('a4', 'portrait');

        if ($disposition === 'inline') {
            return $pdf->stream($filename . '.pdf');
        }

        return $pdf->download($filename . '.pdf');
    }

    public function printView(Request $request, int $mahasiswaId)
    {
        $request->validate([
            'scope' => 'nullable|in:summary,full',
            'include_notes' => 'nullable|boolean',
            'include_timeline' => 'nullable|boolean',
            'auto' => 'nullable|boolean',
        ]);

        $scope = $request->string('scope')->lower()->value() ?: 'full';
        $includeNotes = $request->boolean('include_notes', true);
        $includeTimeline = $request->boolean('include_timeline', true);

        $payload = $this->buildDetailPayload($mahasiswaId);
        $payload = $this->filterPayloadByScope($payload, $scope, $includeTimeline, $includeNotes);

        return response()->view('print.grading-detail', [
            'dosen' => $payload['dosen'],
            'student' => $payload['student'],
            'course' => $payload['course'],
            'gradeData' => $payload['gradeData'],
            'attendanceRecords' => $payload['attendanceRecords'],
            'classAverage' => $payload['classAverage'],
            'dosenNotes' => $payload['dosenNotes'],
            'generatedAt' => now()->format('d M Y H:i:s'),
            'scope' => $scope,
        ]);
    }

    public function updateStatus(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'log_id' => 'required|exists:attendance_logs,id',
            'status' => 'required|in:present,late,permit,sick,rejected,absent',
            'reason' => 'required|string|min:10|max:500',
        ]);

        $log = AttendanceLog::with('session.course')->findOrFail($validated['log_id']);

        if (!$log->session->course || $log->session->course->dosen_id !== $dosen->id) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah data ini.');
        }

        $this->gradingService->overrideAttendance(
            $validated['log_id'],
            $validated['status'],
            $dosen->id,
            $validated['reason']
        );

        return back()->with('success', 'Status kehadiran berhasil diubah.');
    }

    public function addNote(Request $request)
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'content' => 'required|string|min:3|max:2000',
            'title' => 'nullable|string|max:255',
        ]);

        AcademicNote::create([
            'mahasiswa_id' => $request->integer('mahasiswa_id'),
            'title' => $request->string('title')->value() ?: 'Catatan Dosen',
            'content' => $request->string('content')->value(),
        ]);

        return back()->with('success', 'Catatan berhasil ditambahkan.');
    }

    public function deleteNote(int $noteId)
    {
        AcademicNote::findOrFail($noteId)->delete();

        return back()->with('success', 'Catatan berhasil dihapus.');
    }

    private function filterPayloadByScope(
        array $payload,
        string $scope,
        bool $includeTimeline,
        bool $includeNotes,
    ): array {
        if ($scope === 'summary' || !$includeTimeline) {
            $payload['attendanceRecords'] = [];
        }

        if (!$includeNotes) {
            $payload['dosenNotes'] = [];
        }

        return $payload;
    }

    private function buildDetailPayload(int $mahasiswaId): array
    {
        $dosen = Auth::guard('dosen')->user();
        $course = MataKuliah::where('dosen_id', $dosen->id)->first();

        if (!$course) {
            abort(404, 'Mata kuliah tidak ditemukan');
        }

        $student = Mahasiswa::findOrFail($mahasiswaId);
        $gradeData = $this->gradingService->calculateStudentGrade($mahasiswaId, $course->id);

        $sessions = AttendanceSession::where('course_id', $course->id)
            ->orderBy('meeting_number', 'asc')
            ->get();

        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->whereIn('attendance_session_id', $sessions->pluck('id'))
            ->get()
            ->keyBy('attendance_session_id');

        $attendanceRecords = [];
        foreach ($sessions as $session) {
            $log = $logs->get($session->id);
            $status = $log?->status ?? 'absent';
            $points = match ($status) {
                'present' => 100,
                'late' => 75,
                'permit', 'sick' => 50,
                default => 0,
            };

            $attendanceRecords[] = [
                'id' => $log?->id ?? 0,
                'meeting_number' => $session->meeting_number,
                'session_title' => $session->title,
                'session_date' => $session->start_at?->format('d M Y'),
                'session_time' => $session->start_at?->format('H:i'),
                'status' => $status,
                'points' => $points,
                'check_in_time' => $log?->scanned_at?->format('H:i:s'),
                'check_in_location' => ($log?->latitude && $log?->longitude) ? [
                    'latitude' => (float) $log->latitude,
                    'longitude' => (float) $log->longitude,
                    'address' => $log->address ?? null,
                    'accuracy' => $log->accuracy ?? null,
                ] : null,
                'selfie_photo' => $log?->selfie_path ? asset('storage/' . $log->selfie_path) : null,
                'verification_status' => $log?->face_detected !== null
                    ? ($log->face_match_score >= 0.7 ? 'verified' : 'rejected')
                    : null,
                'verification_score' => $log?->face_match_score,
                'notes' => $log?->note,
                'device_info' => $log?->device_model ? ($log->device_model . ' (' . ($log->device_os ?? '') . ')') : null,
                'edited_by' => $log?->override_by ? 'Dosen' : null,
                'edit_reason' => $log?->override_reason,
            ];
        }

        $statusBreakdown = [
            'present' => 0,
            'late' => 0,
            'permit' => 0,
            'sick' => 0,
            'absent' => 0,
            'rejected' => 0,
        ];

        foreach ($attendanceRecords as $record) {
            if (isset($statusBreakdown[$record['status']])) {
                $statusBreakdown[$record['status']]++;
            }
        }

        $presentPoints = $statusBreakdown['present'] * 100;
        $latePoints = $statusBreakdown['late'] * 75;
        $permitPoints = ($statusBreakdown['permit'] + $statusBreakdown['sick']) * 50;
        $totalPoints = $presentPoints + $latePoints + $permitPoints;
        $maxPossiblePoints = count($attendanceRecords) * 100;

        $classGrades = $this->gradingService->calculateClassGrades($course->id);
        $classAverage = [
            'average_attendance_rate' => $classGrades['summary']['average_attendance_rate'] ?? 0,
            'average_points' => 0,
            'mode_grade' => 'C',
            'total_students' => $classGrades['summary']['total_students'] ?? 0,
        ];

        if (!empty($classGrades['grades'])) {
            $totalAvgPoints = 0;
            $gradeCounts = [];

            foreach ($classGrades['grades'] as $g) {
                $totalAvgPoints += $g['average_points'];
                $gradeCounts[$g['grade_letter']] = ($gradeCounts[$g['grade_letter']] ?? 0) + 1;
            }

            $classAverage['average_points'] = round($totalAvgPoints / count($classGrades['grades']), 2);

            if (!empty($gradeCounts)) {
                arsort($gradeCounts);
                $classAverage['mode_grade'] = array_key_first($gradeCounts);
            }
        }

        $rankInClass = 1;
        $totalStudents = count($classGrades['grades']);
        foreach ($classGrades['grades'] as $g) {
            if ($g['mahasiswa_id'] === $mahasiswaId) {
                break;
            }
            $rankInClass++;
        }

        $dosenNotes = AcademicNote::where('mahasiswa_id', $mahasiswaId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($note) => [
                'id' => $note->id,
                'content' => $note->content,
                'title' => $note->title,
                'created_by' => $dosen->nama,
                'created_at' => $note->created_at?->format('d M Y H:i'),
                'updated_at' => $note->updated_at?->format('d M Y H:i'),
                'is_important' => false,
                'is_visible_to_student' => true,
            ])
            ->values()
            ->toArray();

        return [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'email' => $dosen->email ?? '',
                'foto' => $dosen->avatar_url,
            ],
            'student' => [
                'id' => $student->id,
                'nama' => $student->nama,
                'nim' => $student->nim,
                'email' => $student->nim . '@student.unpam.ac.id',
                'foto' => $student->avatar_url,
                'phone' => null,
                'prodi' => $student->prodi ?? 'Teknik Informatika',
                'fakultas' => $student->fakultas ?? 'Teknik',
                'semester' => $student->semester ?? 1,
                'kelas' => $student->kelas,
                'angkatan' => $student->kelas ? substr($student->nim, 0, 4) : null,
            ],
            'course' => [
                'id' => $course->id,
                'nama' => $course->nama,
                'kode' => $course->kode ?? ('MK-' . str_pad((string) $course->id, 3, '0', STR_PAD_LEFT)),
                'sks' => $course->sks,
                'semester' => 'Ganjil 2024/2025',
                'tahun_ajaran' => '2024/2025',
            ],
            'gradeData' => [
                'total_sessions' => $gradeData['total_sessions'],
                'attended_sessions' => $gradeData['attended_sessions'],
                'attendance_rate' => $gradeData['attendance_rate'],
                'average_points' => $gradeData['average_points'],
                'attendance_grade' => $gradeData['attendance_grade'],
                'grade_letter' => $gradeData['grade_letter'],
                'can_take_uas' => $gradeData['can_take_uas'],
                'sessions_needed_for_uas' => max(0, 3 - collect($attendanceRecords)->filter(fn ($r) => in_array($r['status'], ['absent', 'rejected'], true))->count()),
                'rank_in_class' => $rankInClass,
                'total_students' => $totalStudents,
                'percentile' => $totalStudents > 0 ? round((1 - ($rankInClass - 1) / $totalStudents) * 100, 1) : 0,
                'status_breakdown' => $statusBreakdown,
                'points_breakdown' => [
                    'present_points' => $presentPoints,
                    'late_points' => $latePoints,
                    'permit_points' => $permitPoints,
                    'sick_points' => 0,
                    'total_points' => $totalPoints,
                    'max_possible_points' => $maxPossiblePoints,
                ],
            ],
            'attendanceRecords' => $attendanceRecords,
            'classAverage' => $classAverage,
            'dosenNotes' => $dosenNotes,
        ];
    }
}
