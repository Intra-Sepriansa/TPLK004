<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AcademicTask;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Models\StudyGroup;
use App\Models\Tugas;
use App\Models\TugasSubmission;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MataKuliahController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        $this->syncCoursesFromMataKuliah($mahasiswa->id);

        $hasStudyGroupTables = Schema::hasTable('study_groups') && Schema::hasTable('study_group_members');

        $relations = [
            'meetings',
            'tasks',
            'notes',
            'materials',
        ];

        if ($hasStudyGroupTables) {
            $relations[] = 'studyGroups.members.mahasiswa:id,nama';
        }

        $courseModels = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->with($relations)
            ->orderBy('schedule_day')
            ->orderBy('schedule_time')
            ->get();

        $mataKuliahMap = MataKuliah::query()
            ->with('dosen')
            ->get()
            ->keyBy(fn (MataKuliah $mk) => $this->normalizeCourseName((string) $mk->nama));

        $matchedMataKuliahIds = $courseModels
            ->map(function (MahasiswaCourse $course) use ($mataKuliahMap) {
                $mk = $mataKuliahMap->get($this->normalizeCourseName((string) $course->name));
                return $mk?->id;
            })
            ->filter()
            ->unique()
            ->values();

        $totalSessionsByCourseId = collect();
        $attendedSessionsByCourseId = collect();
        $totalTugasByCourseId = collect();
        $submissionStatsByCourseId = collect();

        if ($matchedMataKuliahIds->isNotEmpty()) {
            $totalSessionsByCourseId = AttendanceSession::query()
                ->whereIn('course_id', $matchedMataKuliahIds)
                ->selectRaw('course_id, COUNT(*) as total_sessions')
                ->groupBy('course_id')
                ->pluck('total_sessions', 'course_id');

            $attendedSessionsByCourseId = AttendanceLog::query()
                ->join('attendance_sessions', 'attendance_sessions.id', '=', 'attendance_logs.attendance_session_id')
                ->where('attendance_logs.mahasiswa_id', $mahasiswa->id)
                ->whereIn('attendance_sessions.course_id', $matchedMataKuliahIds)
                ->whereIn(DB::raw('LOWER(attendance_logs.status)'), ['present', 'late', 'hadir'])
                ->selectRaw('attendance_sessions.course_id as course_id, COUNT(DISTINCT attendance_logs.attendance_session_id) as attended_sessions')
                ->groupBy('attendance_sessions.course_id')
                ->pluck('attended_sessions', 'course_id');

            $totalTugasByCourseId = Tugas::query()
                ->whereIn('course_id', $matchedMataKuliahIds)
                ->where('status', '!=', 'draft')
                ->selectRaw('course_id, COUNT(*) as total_tugas')
                ->groupBy('course_id')
                ->pluck('total_tugas', 'course_id');

            $submissionStatsByCourseId = TugasSubmission::query()
                ->join('tugas', 'tugas.id', '=', 'tugas_submissions.tugas_id')
                ->where('tugas_submissions.mahasiswa_id', $mahasiswa->id)
                ->whereIn('tugas.course_id', $matchedMataKuliahIds)
                ->selectRaw('tugas.course_id as course_id, COUNT(DISTINCT tugas_submissions.tugas_id) as submitted_tugas, AVG(tugas_submissions.grade) as avg_grade')
                ->groupBy('tugas.course_id')
                ->get()
                ->keyBy('course_id');
        }

        $courses = $courseModels->map(function (MahasiswaCourse $course) use (
            $mataKuliahMap,
            $mahasiswa,
            $hasStudyGroupTables,
            $totalSessionsByCourseId,
            $attendedSessionsByCourseId,
            $totalTugasByCourseId,
            $submissionStatsByCourseId
        ) {
            $key = $this->normalizeCourseName((string) $course->name);
            /** @var MataKuliah|null $mk */
            $mk = $mataKuliahMap->get($key);
            $mkId = $mk?->id;

            $trackedMeetings = (int) $course->meetings->where('is_completed', true)->count();
            $meetingRowsCount = (int) $course->meetings->count();

            $totalMeetingsFromAttendance = $mkId ? (int) ($totalSessionsByCourseId->get($mkId) ?? 0) : 0;
            $attendedMeetingsFromAttendance = $mkId ? (int) ($attendedSessionsByCourseId->get($mkId) ?? 0) : 0;

            $completedMeetings = $attendedMeetingsFromAttendance > 0
                ? $attendedMeetingsFromAttendance
                : $trackedMeetings;
            $totalMeetings = $totalMeetingsFromAttendance > 0
                ? $totalMeetingsFromAttendance
                : max($meetingRowsCount, (int) $course->total_meetings, 1);
            $completedMeetings = min($completedMeetings, $totalMeetings);

            $taskTotalFromTugas = $mkId ? (int) ($totalTugasByCourseId->get($mkId) ?? 0) : 0;
            $taskSubmittedFromTugas = 0;
            $averageGradeFromSubmission = null;
            if ($mkId && $submissionStatsByCourseId->has($mkId)) {
                $submissionStat = $submissionStatsByCourseId->get($mkId);
                $taskSubmittedFromTugas = (int) ($submissionStat->submitted_tugas ?? 0);
                $averageGradeFromSubmission = $submissionStat->avg_grade !== null
                    ? round((float) $submissionStat->avg_grade, 1)
                    : null;
            }

            $completedAssignments = $taskTotalFromTugas > 0
                ? $taskSubmittedFromTugas
                : (int) $course->tasks->where('status', 'completed')->count();
            $totalAssignments = $taskTotalFromTugas > 0
                ? $taskTotalFromTugas
                : (int) $course->tasks->count();
            $attendanceRate = round(($completedMeetings / $totalMeetings) * 100, 1);
            $averageGrade = $averageGradeFromSubmission !== null
                ? round((float) $averageGradeFromSubmission, 1)
                : null;

            $nextMeeting = $course->meetings
                ->where('is_completed', false)
                ->sortBy('meeting_number')
                ->first();

            $nextSession = null;
            if ($nextMeeting) {
                $sessionDate = $nextMeeting->scheduled_date
                    ? Carbon::parse($nextMeeting->scheduled_date)
                    : Carbon::now()->next($course->schedule_day ?? 'monday');

                $nextSession = [
                    'meeting_number' => $nextMeeting->meeting_number,
                    'topic' => "Pertemuan {$nextMeeting->meeting_number}",
                    'date' => $sessionDate->translatedFormat('d M Y'),
                    'time' => $course->schedule_time?->format('H:i') ?? '-',
                ];
            }

            $difficultyLevel = $course->difficulty_level ?: $this->calculateDifficulty($averageGrade, $attendanceRate);
            $aiRecommendation = $course->ai_recommendation ?: $this->generateAIRecommendation(
                $attendanceRate,
                $averageGrade,
                $completedAssignments,
                $totalAssignments
            );

            $meetingProgress = round(($completedMeetings / $totalMeetings) * 100, 1);
            $assignmentProgress = $totalAssignments > 0
                ? round(($completedAssignments / $totalAssignments) * 100, 1)
                : 0.0;

            $predictedWeeksLeft = max((int) ceil(($totalMeetings - $completedMeetings) / 1.5), 0);
            $predictedCompletionDate = Carbon::now()->addWeeks($predictedWeeksLeft)->translatedFormat('d M Y');

            return [
                'id' => $course->id,
                'mata_kuliah_id' => $mkId,
                'code' => (string) ($mk?->kode ?? ''),
                'name' => $course->name,
                'sks' => $course->sks,
                'semester' => (int) ($mahasiswa->semester ?? 1),
                'dosen' => $mk?->dosen?->nama ?? 'Dosen Belum Ditentukan',
                'dosen_avatar' => $mk?->dosen?->avatar_url,
                'mode' => in_array($course->mode, ['online', 'offline'], true) ? $course->mode : 'offline',
                'ruangan' => $course->ruangan ?: ($course->mode === 'online' ? 'Zoom / LMS' : 'Ruang Kelas'),
                'schedule' => [
                    'day' => $course->schedule_day_name,
                    'time' => $course->schedule_time?->format('H:i') ?? '-',
                ],
                'progress' => [
                    'meetings_completed' => $completedMeetings,
                    'total_meetings' => $totalMeetings,
                    'assignments_completed' => $completedAssignments,
                    'total_assignments' => $totalAssignments,
                    'attendance_rate' => $attendanceRate,
                    'average_grade' => $averageGrade,
                    'has_grade' => $averageGrade !== null,
                    'meeting_progress' => $meetingProgress,
                    'assignment_progress' => $assignmentProgress,
                    'notes_count' => $course->notes->count(),
                ],
                'next_session' => $nextSession,
                'color' => $course->color ?: '#6366f1',
                'is_favorite' => (bool) $course->is_favorite,
                'study_time_hours' => (int) $course->study_time_hours,
                'difficulty_level' => $difficultyLevel,
                'ai_recommendation' => $aiRecommendation,
                'predicted_completion_date' => $predictedCompletionDate,
                'milestones' => [
                    'meeting_50' => $meetingProgress >= 50,
                    'meeting_75' => $meetingProgress >= 75,
                    'assignment_80' => $assignmentProgress >= 80,
                ],
                'materials' => $course->materials->map(fn ($material) => [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => $material->type,
                    'url' => $material->url,
                    'size' => $material->size,
                ])->values(),
                'study_groups' => $hasStudyGroupTables
                    ? $course->studyGroups->map(fn (StudyGroup $group) => [
                        'id' => $group->id,
                        'name' => $group->name,
                        'description' => $group->description,
                        'member_count' => $group->members->count(),
                    ])->values()
                    : collect(),
            ];
        })->values();

        $gradedCourses = $courses->filter(fn (array $course) => (bool) ($course['progress']['has_grade'] ?? false));

        $stats = [
            'total_courses' => $courses->count(),
            'total_sks' => $courses->sum('sks'),
            'average_grade' => $gradedCourses->isNotEmpty()
                ? round((float) $gradedCourses->avg('progress.average_grade'), 1)
                : 0.0,
            'completion_rate' => round((float) $courses->avg('progress.meeting_progress'), 1),
            'study_hours_week' => $courses->sum('study_time_hours'),
            'on_track_courses' => $courses->filter(fn (array $c) =>
                $c['progress']['attendance_rate'] >= 75
                && ($c['progress']['has_grade'] ?? false)
                && $c['progress']['average_grade'] >= 70
            )->count(),
        ];

        return Inertia::render('user/akademik/mata-kuliah', [
            'courses' => $courses,
            'stats' => $stats,
            'study_groups' => $this->getStudyGroups($courseModels, $hasStudyGroupTables),
            'upcoming_deadlines' => $this->getUpcomingDeadlines($mahasiswa->id),
            'performance_data' => $this->getPerformanceData($courses, $courseModels, (int) $mahasiswa->id),
        ]);
    }

    public function toggleFavorite(Request $request, int $id): RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        $course = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($id);

        $course->update([
            'is_favorite' => !$course->is_favorite,
        ]);

        return back()->with('success', 'Favorite mata kuliah diperbarui.');
    }

    public function export(Request $request): StreamedResponse|RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        if (!$mahasiswa) {
            return back()->with('error', 'Sesi mahasiswa tidak valid.');
        }

        $rows = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('name')
            ->get(['name', 'sks', 'mode', 'current_meeting', 'total_meetings', 'study_time_hours']);

        $filename = 'laporan-mata-kuliah-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fputcsv($handle, ['Mata Kuliah', 'SKS', 'Mode', 'Pertemuan Selesai', 'Total Pertemuan', 'Jam Belajar/Minggu']);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row->name,
                    $row->sks,
                    ucfirst((string) $row->mode),
                    $row->current_meeting,
                    $row->total_meetings,
                    $row->study_time_hours,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function getStudyGroups(Collection $courseModels, bool $hasStudyGroupTables): Collection
    {
        if (!$hasStudyGroupTables) {
            return collect();
        }

        return $courseModels
            ->flatMap(fn (MahasiswaCourse $course) => $course->studyGroups)
            ->map(function (StudyGroup $group) {
            return [
                'id' => $group->id,
                'course_id' => $group->mahasiswa_course_id,
                'name' => $group->name,
                'description' => $group->description,
                'member_count' => $group->members->count(),
                'members' => $group->members->map(fn ($member) => [
                    'id' => $member->mahasiswa_id,
                    'name' => $member->mahasiswa?->nama ?? 'Mahasiswa',
                    'is_admin' => (bool) $member->is_admin,
                ])->values(),
            ];
        })
            ->values();
    }

    private function getUpcomingDeadlines(int $mahasiswaId): Collection
    {
        $deadlines = AcademicTask::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('status', '!=', 'completed')
            ->whereNotNull('deadline')
            ->with('course:id,name')
            ->orderBy('deadline')
            ->limit(8)
            ->get()
            ->map(fn (AcademicTask $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'course_name' => $task->course?->name ?? 'Mata Kuliah',
                'deadline' => $task->deadline?->format('Y-m-d'),
                'deadline_formatted' => $task->deadline?->translatedFormat('d M Y'),
                'days_remaining' => $task->days_remaining,
                'priority' => $task->days_remaining !== null && $task->days_remaining <= 2 ? 'high' : 'medium',
            ]);

        return $deadlines;
    }

    private function getPerformanceData(Collection $courses, Collection $courseModels, int $mahasiswaId): array
    {
        $weekMarkers = collect(range(5, 0))->map(function (int $offset) {
            $date = now()->subWeeks($offset)->startOfWeek();
            return [
                'label' => $date->translatedFormat('d M'),
                'start' => $date->copy(),
                'end' => $date->copy()->endOfWeek(),
            ];
        })->values();

        $selectedCourses = $courses
            ->filter(fn (array $course) => !empty($course['mata_kuliah_id']))
            ->take(4)
            ->values();

        $gradeAveragesByCourseWeek = collect();
        if ($selectedCourses->isNotEmpty()) {
            $mkIds = $selectedCourses->pluck('mata_kuliah_id')->map(fn ($id) => (int) $id)->all();
            $weekExpression = 'YEARWEEK(COALESCE(tugas_submissions.graded_at, tugas_submissions.submitted_at), 1)';

            $gradeAveragesByCourseWeek = TugasSubmission::query()
                ->join('tugas', 'tugas.id', '=', 'tugas_submissions.tugas_id')
                ->where('tugas_submissions.mahasiswa_id', $mahasiswaId)
                ->whereIn('tugas.course_id', $mkIds)
                ->whereNotNull('tugas_submissions.grade')
                ->selectRaw("tugas.course_id as course_id, {$weekExpression} as year_week, AVG(tugas_submissions.grade) as avg_grade")
                ->groupBy('tugas.course_id', DB::raw($weekExpression))
                ->get()
                ->mapWithKeys(fn ($row) => [
                    $row->course_id . '-' . $row->year_week => round((float) $row->avg_grade, 1),
                ]);
        }

        $gradeTrends = $selectedCourses->map(function (array $course) use ($weekMarkers, $gradeAveragesByCourseWeek) {
            $mkId = (int) $course['mata_kuliah_id'];

            return [
                'course' => $course['name'],
                'points' => $weekMarkers->map(function (array $marker) use ($mkId, $gradeAveragesByCourseWeek) {
                    $yearWeek = (int) $marker['start']->format('oW');
                    $value = $gradeAveragesByCourseWeek->get($mkId . '-' . $yearWeek);

                    return [
                        'label' => $marker['label'],
                        'value' => $value !== null ? (float) $value : null,
                    ];
                })->values(),
            ];
        })->values();

        $totalMeetings = (int) $courses->sum('progress.total_meetings');
        $completedMeetings = (int) $courses->sum('progress.meetings_completed');
        $attendanceValue = $totalMeetings > 0 ? (int) round(($completedMeetings / $totalMeetings) * 100) : 0;

        $attendancePatterns = [
            ['name' => 'Hadir', 'value' => $attendanceValue],
            ['name' => 'Belum Hadir', 'value' => max(0, 100 - $attendanceValue)],
        ];

        $dayMap = [
            'monday' => 'Sen',
            'tuesday' => 'Sel',
            'wednesday' => 'Rab',
            'thursday' => 'Kam',
            'friday' => 'Jum',
            'saturday' => 'Sab',
            'sunday' => 'Min',
        ];

        $studyTimeByDay = [];
        foreach ($dayMap as $key => $label) {
            $studyTimeByDay[$label] = 0;
        }

        foreach ($courseModels as $course) {
            $label = $dayMap[$course->schedule_day] ?? null;
            if (!$label) {
                continue;
            }

            $studyTimeByDay[$label] += (int) $course->study_time_hours;
        }

        $studyTimeTracking = collect($studyTimeByDay)
            ->map(fn (int $hours, string $day) => ['day' => $day, 'hours' => $hours])
            ->values();

        $gradedCourses = $courses->filter(fn (array $course) => (bool) ($course['progress']['has_grade'] ?? false));

        return [
            'grade_trends' => $gradeTrends,
            'attendance_patterns' => $attendancePatterns,
            'study_time_tracking' => $studyTimeTracking,
            'comparative' => [
                'my_average' => $gradedCourses->isNotEmpty()
                    ? round((float) $gradedCourses->avg('progress.average_grade'), 1)
                    : 0.0,
                'class_average' => null,
                'rank_estimate' => null,
            ],
        ];
    }

    private function generateAIRecommendation(
        float $attendanceRate,
        ?float $averageGrade,
        int $completedAssignments,
        int $totalAssignments
    ): string {
        if ($attendanceRate < 75) {
            return 'Prioritaskan kehadiran minggu ini. Targetkan minimal 2 pertemuan berturut-turut tepat waktu.';
        }

        if ($averageGrade !== null && $averageGrade < 70) {
            return 'Fokus pada latihan terstruktur 30 menit/hari dan diskusikan topik sulit di study group.';
        }

        $assignmentRate = $totalAssignments > 0 ? ($completedAssignments / $totalAssignments) * 100 : 100;
        if ($assignmentRate < 80) {
            return 'Selaraskan jadwal tugas dengan teknik time blocking agar semua deadline selesai sebelum H-1.';
        }

        return 'Performa kamu stabil. Naikkan 1 level dengan menambah sesi review akhir pekan.';
    }

    private function calculateDifficulty(?float $averageGrade, float $attendanceRate): string
    {
        if ($averageGrade === null) {
            return 'medium';
        }

        if ($averageGrade >= 82 && $attendanceRate >= 85) {
            return 'easy';
        }

        if ($averageGrade < 68 || $attendanceRate < 72) {
            return 'hard';
        }

        return 'medium';
    }

    private function normalizeCourseName(string $name): string
    {
        $normalized = mb_strtolower(trim($name));
        $normalized = preg_replace('/\s+/u', ' ', $normalized) ?? $normalized;

        return preg_replace('/[^\pL\pN\s]/u', '', $normalized) ?? $normalized;
    }

    private function syncCoursesFromMataKuliah(int $mahasiswaId): void
    {
        $existingCount = MahasiswaCourse::query()
            ->where('mahasiswa_id', $mahasiswaId)
            ->count();

        if ($existingCount > 0) {
            return;
        }

        $mataKuliahs = MataKuliah::query()->with('dosen')->get();

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $times = ['08:00', '10:00', '13:00', '15:00'];
        $dayIndex = 0;
        $timeIndex = 0;

        foreach ($mataKuliahs as $mk) {
            $sks = (int) ($mk->sks ?? 3);
            $totalMeetings = $sks === 2 ? 14 : 21;

            MahasiswaCourse::query()->create([
                'mahasiswa_id' => $mahasiswaId,
                'name' => $mk->nama,
                'sks' => $sks,
                'total_meetings' => $totalMeetings,
                'current_meeting' => 0,
                'uts_meeting' => $sks === 2 ? 7 : 14,
                'uas_meeting' => $totalMeetings,
                'schedule_day' => $days[$dayIndex % count($days)],
                'schedule_time' => $times[$timeIndex % count($times)],
                'mode' => 'offline',
                'start_date' => now()->startOfMonth(),
                'is_favorite' => false,
                'study_time_hours' => 0,
                'difficulty_level' => 'medium',
                'ai_recommendation' => null,
                'color' => '#6366f1',
                'ruangan' => null,
            ]);

            $timeIndex++;
            if ($timeIndex % count($times) === 0) {
                $dayIndex++;
            }
        }
    }
}
