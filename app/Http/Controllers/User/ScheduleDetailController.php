<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\CourseMaterial;
use App\Models\CourseNote;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use App\Models\ScheduleReminder;
use App\Models\WeeklyLearningDigest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleDetailController extends Controller
{
    public function show(Request $request, $courseId)
    {
        $mahasiswa = $request->user('mahasiswa');

        $course = MahasiswaCourse::where('id', $courseId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        $mataKuliah = MataKuliah::with('dosen')
            ->where('nama', $course->name)
            ->when($mahasiswa->kelas, function ($query) use ($mahasiswa) {
                $query->orderByRaw(
                    "case when kelas = ? then 0 when kelas is null or kelas = '' then 1 else 2 end",
                    [$mahasiswa->kelas]
                );
            })
            ->first();

        $weeklyDigest = null;

        if ($mataKuliah) {
            $digestModel = WeeklyLearningDigest::query()
                ->where('class_label', '06TPLK004')
                ->published()
                ->orderByDesc('week_number')
                ->orderByDesc('updated_at')
                ->first();

            if ($digestModel) {
                $digestEntries = WeeklyLearningDigest::with('mataKuliah')
                    ->where('class_label', '06TPLK004')
                    ->where('semester', $digestModel->semester)
                    ->where('week_number', $digestModel->week_number)
                    ->published()
                    ->orderBy('meeting_number')
                    ->orderBy('mata_kuliah_id')
                    ->get();

                $weeklyDigest = [
                    'week_number' => $digestModel->week_number,
                    'semester' => $digestModel->semester,
                    'week_range' => $digestModel->week_range,
                    'class_label' => '06TPLK004',
                    'published_at' => $digestModel->published_at?->format('d M Y H:i'),
                    'items' => $digestEntries->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'course_name' => $item->mataKuliah?->nama ?? 'Mata Kuliah',
                            'course_code' => $item->mataKuliah?->kode,
                            'meeting_number' => $item->meeting_number,
                            'title' => $item->title,
                            'display_title' => $item->title ?: 'Materi Pertemuan ' . $item->meeting_number,
                            'has_structured_task' => (bool) $item->has_structured_task,
                            'forum_posts_required' => (int) $item->forum_posts_required,
                            'mentari_course_url' => $item->mentari_course_url,
                            'mentari_course_id' => $item->mentari_course_id,
                        ];
                    })->values()->all(),
               ];
            }
        }

        $startTime = Carbon::parse($course->schedule_time);
        $endTime   = $startTime->copy()->addMinutes($course->sks * 50);
        $effectiveMode = $course->effective_mode;

        $courseDetail = [
            'id'           => $course->id,
            'course_name'  => $course->name,
            'course_code'  => 'MK-' . str_pad($course->id, 3, '0', STR_PAD_LEFT),
            'sks'          => $course->sks,
            'semester'     => 1,
            'mode'         => $effectiveMode,
            'ruangan'      => $effectiveMode === 'online' ? 'Online' : 'Ruang Kelas',
            'meeting_link' => null,
            'schedule_day' => $course->effective_schedule_day_name,
            'time_range'   => $startTime->format('H:i') . ' - ' . $endTime->format('H:i'),
            'jam_mulai'    => $startTime->format('H:i'),
            'jam_selesai'  => $endTime->format('H:i'),
            'duration'     => ($course->sks * 50) . ' menit',
            'color'        => $this->getColorForCourse($course->id),
            'description'  => null,
            'syllabus_url' => null,
        ];

        // Real attendance from AttendanceLog via AttendanceSession
        // Match MahasiswaCourse.name to MataKuliah.nama to find sessions
        $attendanceRecords = [];
        if ($mataKuliah) {
            $sessionIds = AttendanceSession::where('course_id', $mataKuliah->id)
                ->pluck('id');

            $logs = AttendanceLog::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('attendance_session_id', $sessionIds)
                ->with('session')
                ->orderByDesc('scanned_at')
                ->get();

            $attendanceRecords = $logs->map(function ($log) {
                return [
                    'id'             => $log->id,
                    'meeting_number' => $log->session->meeting_number ?? 0,
                    'date'           => $log->scanned_at ? $log->scanned_at->format('d M Y') : '-',
                    'status'         => $log->status,
                    'time_in'        => $log->scanned_at ? $log->scanned_at->format('H:i') : null,
                    'notes'          => $log->note ?? null,
                ];
            })->toArray();

            // Also count sessions where this student was absent (no log)
            $allSessions = AttendanceSession::where('course_id', $mataKuliah->id)
                ->where('start_at', '<=', now())
                ->orderByDesc('meeting_number')
                ->get();

            $attendedSessionIds = $logs->pluck('attendance_session_id')->toArray();

            foreach ($allSessions as $session) {
                if (!in_array($session->id, $attendedSessionIds)) {
                    $attendanceRecords[] = [
                        'id'             => $session->id,
                        'meeting_number' => $session->meeting_number ?? 0,
                        'date'           => $session->start_at ? $session->start_at->format('d M Y') : '-',
                        'status'         => 'absent',
                        'time_in'        => null,
                        'notes'          => null,
                    ];
                }
            }

            // Sort by meeting_number descending
            usort($attendanceRecords, fn($a, $b) => $b['meeting_number'] <=> $a['meeting_number']);
        }

        // Materials
        $materials = CourseMaterial::where('course_id', $courseId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($material) {
                return [
                    'id'          => $material->id,
                    'title'       => $material->title,
                    'type'        => $material->type,
                    'url'         => $material->url,
                    'size'        => $material->size ? $this->formatFileSize($material->size) : null,
                    'uploaded_at' => Carbon::parse($material->created_at)->format('d M Y'),
                ];
            });

        // Notes
        $notes = CourseNote::where('mahasiswa_id', $mahasiswa->id)
            ->where('course_id', $courseId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id'         => $note->id,
                    'content'    => $note->content,
                    'created_at' => Carbon::parse($note->created_at)->format('d M Y H:i'),
                    'updated_at' => Carbon::parse($note->updated_at)->format('d M Y H:i'),
                ];
            });

        // Stats
        $totalMeetings  = $course->total_meetings ?? 14;
        $attended        = collect($attendanceRecords)->where('status', 'present')->count();
        $late            = collect($attendanceRecords)->where('status', 'late')->count();
        $absent          = collect($attendanceRecords)->where('status', 'absent')->count();
        $attendanceRate  = $totalMeetings > 0 ? round((($attended + $late) / $totalMeetings) * 100, 1) : 0;
        $minAttendance   = 75;

        $stats = [
            'total_meetings'  => $totalMeetings,
            'attended'        => $attended,
            'late'            => $late,
            'absent'          => $absent,
            'attendance_rate' => $attendanceRate,
            'can_take_uas'    => $attendanceRate >= $minAttendance,
            'min_attendance'  => $minAttendance,
        ];

        // Reminder
        $hasReminder = ScheduleReminder::where('mahasiswa_id', $mahasiswa->id)
            ->where('course_id', $courseId)
            ->where('is_active', true)
            ->exists();

        // Next meeting — use the number of actual sessions held
        $sessionsHeld = $mataKuliah
            ? AttendanceSession::where('course_id', $mataKuliah->id)->count()
            : 0;
        $nextMeeting = $this->getNextMeeting($course, $sessionsHeld);

        return Inertia::render('user/akademik/jadwal-detail', [
            'course'            => $courseDetail,
            'weeklyDigest'      => $weeklyDigest,
            'dosen'             => [
                'id'        => $mataKuliah?->dosen?->id ?? 0,
                'name'      => $mataKuliah?->dosen?->nama ?? 'Dosen Pengampu',
                'nidn'      => $mataKuliah?->dosen?->nidn ?? '-',
                'email'     => $mataKuliah?->dosen?->email,
                'phone'     => $mataKuliah?->dosen?->phone,
                'photo_url' => null,
                'expertise' => [],
            ],
            'attendanceRecords' => $attendanceRecords,
            'materials'         => $materials,
            'notes'             => $notes,
            'stats'             => $stats,
            'hasReminder'       => $hasReminder,
            'nextMeeting'       => $nextMeeting,
        ]);
    }

    public function toggleReminder(Request $request, $courseId)
    {
        $mahasiswa = $request->user('mahasiswa');

        $reminder = ScheduleReminder::where('mahasiswa_id', $mahasiswa->id)
            ->where('course_id', $courseId)
            ->first();

        if ($reminder) {
            $reminder->update(['is_active' => !$reminder->is_active]);
        } else {
            ScheduleReminder::create([
                'mahasiswa_id'     => $mahasiswa->id,
                'course_id'        => $courseId,
                'reminder_minutes' => 15,
                'is_active'        => true,
            ]);
        }

        return back();
    }

    public function storeNote(Request $request, $courseId)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        CourseNote::create([
            'mahasiswa_id' => $request->user('mahasiswa')->id,
            'course_id'    => $courseId,
            'content'      => $validated['content'],
        ]);

        return back();
    }

    public function updateNote(Request $request, $courseId, $noteId)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        CourseNote::where('id', $noteId)
            ->where('mahasiswa_id', $request->user('mahasiswa')->id)
            ->where('course_id', $courseId)
            ->firstOrFail()
            ->update(['content' => $validated['content']]);

        return back();
    }

    public function deleteNote(Request $request, $courseId, $noteId)
    {
        CourseNote::where('id', $noteId)
            ->where('mahasiswa_id', $request->user('mahasiswa')->id)
            ->where('course_id', $courseId)
            ->delete();

        return back();
    }

    public function exportIcal(Request $request, $courseId)
    {
        $course = MahasiswaCourse::findOrFail($courseId);

        $startTime = Carbon::parse($course->schedule_time);
        $endTime   = $startTime->copy()->addMinutes($course->sks * 50);
        $effectiveMode = $course->effective_mode;
        $effectiveScheduleDay = $course->effective_schedule_day;

        $ical  = "BEGIN:VCALENDAR\r\n";
        $ical .= "VERSION:2.0\r\n";
        $ical .= "PRODID:-//Attendance System//Schedule//EN\r\n";
        $ical .= "BEGIN:VEVENT\r\n";
        $ical .= "UID:" . $course->id . "@attendance-system\r\n";
        $ical .= "DTSTAMP:" . Carbon::now()->format('Ymd\THis\Z') . "\r\n";
        $ical .= "DTSTART:" . $startTime->format('Ymd\THis\Z') . "\r\n";
        $ical .= "DTEND:" . $endTime->format('Ymd\THis\Z') . "\r\n";
        $ical .= "SUMMARY:" . $course->name . "\r\n";
        $ical .= "LOCATION:" . ($effectiveMode === 'online' ? 'Online' : 'Ruang Kelas') . "\r\n";
        $ical .= "RRULE:FREQ=WEEKLY;BYDAY=" . $this->getDayAbbr($effectiveScheduleDay) . "\r\n";
        $ical .= "END:VEVENT\r\n";
        $ical .= "END:VCALENDAR\r\n";

        return response($ical)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $course->name . '.ics"');
    }

    /* ─── Helpers ──────────────────────────────────── */

    private function getDayAbbr(string $day): string
    {
        return match ($day) {
            'monday'    => 'MO',
            'tuesday'   => 'TU',
            'wednesday' => 'WE',
            'thursday'  => 'TH',
            'friday'    => 'FR',
            'saturday'  => 'SA',
            'sunday'    => 'SU',
            default     => 'MO',
        };
    }

    private function getColorForCourse(int $id): string
    {
        $colors = ['blue', 'green', 'purple', 'orange', 'pink'];
        return $colors[$id % count($colors)];
    }

    private function formatFileSize(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }

    private function getNextMeeting(MahasiswaCourse $course, int $currentMeeting): ?array
    {
        $totalMeetings = $course->total_meetings ?? 14;

        if ($currentMeeting >= $totalMeetings) {
            return null;
        }

        $dayMapping = [
            'monday'    => Carbon::MONDAY,
            'tuesday'   => Carbon::TUESDAY,
            'wednesday' => Carbon::WEDNESDAY,
            'thursday'  => Carbon::THURSDAY,
            'friday'    => Carbon::FRIDAY,
            'saturday'  => Carbon::SATURDAY,
        ];

        $dayOfWeek = $dayMapping[$course->effective_schedule_day] ?? Carbon::MONDAY;
        $nextDate  = Carbon::now()->next($dayOfWeek);
        $time      = Carbon::parse($course->schedule_time)->format('H:i');

        return [
            'number' => $currentMeeting + 1,
            'date'   => $nextDate->translatedFormat('d M Y'),
            'time'   => $time,
        ];
    }
}
