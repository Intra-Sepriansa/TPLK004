<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CourseMeeting;
use App\Models\MahasiswaCourse;
use App\Models\MataKuliah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KehadiranController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        // Auto-sync courses if needed (same logic as AcademicCourseController)
        $this->syncCoursesIfNeeded($mahasiswa->id);

        // Load courses with meetings
        $courses = MahasiswaCourse::where('mahasiswa_id', $mahasiswa->id)
            ->with(['meetings' => function ($query) {
                $query->orderBy('meeting_number');
            }])
            ->orderBy('period_group')
            ->orderBy('name')
            ->get();

        // Try to match dosen and fetch sessions from mata_kuliah
    $mataKuliahs = MataKuliah::with('dosen')->get();
    $dosenMap = [];
    $mataKuliahMap = [];
    foreach ($mataKuliahs as $mk) {
        $nameKey = strtolower(trim($mk->nama));
        $dosenMap[$nameKey] = $mk->dosen?->nama ?? '-';
        $mataKuliahMap[$nameKey] = $mk->id;
    }

    $allSessions = \App\Models\AttendanceSession::whereIn('course_id', array_values($mataKuliahMap))->get()->groupBy('course_id');
    $allSessionIds = $allSessions->flatten()->pluck('id');
    $allLogs = \App\Models\AttendanceLog::whereIn('attendance_session_id', $allSessionIds)
        ->where('mahasiswa_id', $mahasiswa->id)
        ->get()
        ->keyBy('attendance_session_id');

    // Build course data with meeting mode calculation
    $courseData = $courses->map(function ($course) use ($dosenMap, $mataKuliahMap, $allSessions, $allLogs) {
        $totalMeetings = $course->sks === 3 ? 21 : 14;
        $utsMeetingNumber = $course->sks === 3 ? 10 : 7;
        
        $mkId = $mataKuliahMap[strtolower(trim($course->name))] ?? null;
        $courseSessions = $mkId ? ($allSessions->get($mkId) ?? collect())->keyBy('meeting_number') : collect();

        // Build meetings array
        $meetings = [];
        for ($i = 1; $i <= $totalMeetings; $i++) {
            $isThisMeetingBeforeUTS = $i <= $utsMeetingNumber;
            $isOnline = $this->getMeetingMode(
                $i,
                $course->sks,
                $course->period_group ?? 1,
                $isThisMeetingBeforeUTS,
                $course->name
            );

            $session = $courseSessions->get($i);
            $log = $session ? $allLogs->get($session->id) : null;

            $status = 'belum-dimulai';
            $date = null;
            $notes = null;
            $completedAt = null;

            if ($log && in_array($log->status, ['present', 'late'])) {
                $status = 'hadir';
                $date = $log->scanned_at?->format('d M Y');
                $completedAt = $log->scanned_at?->format('d M Y H:i');
                $notes = $log->note;
            } elseif ($session && !$session->is_active && $session->end_at && now()->greaterThan($session->end_at)) {
                $status = 'tidak-hadir';
                $date = $session->start_at?->format('d M Y');
                $notes = 'Absen tidak tercatat di sesi ini';
            } elseif ($session) {
                $date = $session->start_at?->format('d M Y');
            }

            $meetings[] = [
                'number' => $i,
                'date' => $date,
                'status' => $status,
                'mode' => $isOnline ? 'online' : 'offline',
                'notes' => $notes,
                'completedAt' => $completedAt,
            ];
        }

        $attendedCount = collect($meetings)->where('status', 'hadir')->count();
        $absentCount = collect($meetings)->where('status', 'tidak-hadir')->count();
            $attendanceRate = $totalMeetings > 0
                ? round(($attendedCount / $totalMeetings) * 100, 1)
                : 0;

            // Lookup dosen name
            $dosenName = $dosenMap[strtolower(trim($course->name))] ?? '-';

            return [
                'id' => $course->id,
                'name' => $course->name,
                'code' => '06TPLK004',
                'sks' => $course->sks,
                'period' => $course->period_group ?? 1,
                'mode' => $course->effective_mode,
                'modeName' => $course->effective_mode_name,
                'day' => $course->effective_schedule_day_name,
                'time' => $course->schedule_time?->format('H:i') ?? '-',
                'room' => $course->ruangan ?? '-',
                'lecturer' => $dosenName,
                'totalMeetings' => $totalMeetings,
                'attendedCount' => $attendedCount,
                'absentCount' => $absentCount,
                'attendanceRate' => $attendanceRate,
                'meetings' => $meetings,
                'currentMeeting' => $course->current_meeting,
            ];
        });

        // Calculate overall stats
        $totalMeetingsAll = $courseData->sum('totalMeetings');
        $attendedAll = $courseData->sum('attendedCount');
        $absentAll = $courseData->sum('absentCount');

        $stats = [
            'totalCourses' => $courseData->count(),
            'totalMeetings' => $totalMeetingsAll,
            'attendedMeetings' => $attendedAll,
            'absentMeetings' => $absentAll,
            'attendancePercentage' => $totalMeetingsAll > 0
                ? round(($attendedAll / $totalMeetingsAll) * 100, 1)
                : 0,
            'absentPercentage' => $totalMeetingsAll > 0
                ? round(($absentAll / $totalMeetingsAll) * 100, 1)
                : 0,
        ];

        // Determine UTS status from first course
        $isBeforeUTS = $courses->isNotEmpty()
            ? !$courses->first()->is_after_uts
            : true;

        return Inertia::render('user/akademik/kehadiran', [
            'courses' => $courseData->values(),
            'stats' => $stats,
            'isBeforeUTS' => $isBeforeUTS,
        ]);
    }

    /**
     * Show detail kehadiran for a specific course.
     */
    public function show(MahasiswaCourse $mahasiswaCourse): Response|RedirectResponse
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        if (!$mahasiswa || $mahasiswaCourse->mahasiswa_id !== $mahasiswa->id) {
            return redirect()->route('user.akademik.kehadiran');
        }

        $totalMeetings = $mahasiswaCourse->sks === 3 ? 21 : 14;
        $isAfterUts = $mahasiswaCourse->is_after_uts;

        // Dosen & MataKuliah lookup
        $mataKuliahs = MataKuliah::with('dosen')->get();
        $dosenName = '-';
        $mataKuliahId = null;
        foreach ($mataKuliahs as $mk) {
            if (strtolower(trim($mk->nama)) === strtolower(trim($mahasiswaCourse->name))) {
                $mataKuliahId = $mk->id;
                $dosenName = $mk->dosen?->nama ?? '-';
                break;
            }
        }

        // Fetch real attendance sessions for this course
        $actualSessions = \App\Models\AttendanceSession::where('course_id', $mataKuliahId)
            ->orderBy('meeting_number')
            ->get()
            ->keyBy('meeting_number');

        // Fetch real attendance logs for this student in those sessions
        $actualLogs = collect();
        if ($actualSessions->isNotEmpty()) {
            $actualLogs = \App\Models\AttendanceLog::whereIn('attendance_session_id', $actualSessions->pluck('id'))
                ->where('mahasiswa_id', $mahasiswa->id)
                ->get()
                ->keyBy('attendance_session_id');
        }

        // Build meetings array from 1 to $totalMeetings
        $meetings = [];
        $attendedCount = 0;
        $absentCount = 0;

        $utsMeetingNumber = $mahasiswaCourse->sks === 3 ? 10 : 7;

        for ($i = 1; $i <= $totalMeetings; $i++) {
            $isThisMeetingBeforeUTS = $i <= $utsMeetingNumber;

            $isOnline = $this->getMeetingMode(
                $i,
                $mahasiswaCourse->sks,
                $mahasiswaCourse->period_group ?? 1,
                $isThisMeetingBeforeUTS,
                $mahasiswaCourse->name
            );

            $session = $actualSessions->get($i);
            $log = $session ? $actualLogs->get($session->id) : null;

            $status = 'belum-dimulai';
            $date = null;
            $rawDate = null;
            $notes = null;
            $completedAt = null;

            if ($log && in_array($log->status, ['present', 'late'])) {
                $status = 'hadir';
                $attendedCount++;
                $date = $log->scanned_at?->format('d M Y');
                $rawDate = $log->scanned_at?->format('Y-m-d');
                $completedAt = $log->scanned_at?->format('d M Y H:i');
                $notes = $log->note ?? 'Sudah mengumpulkan bukti absensi';
            } elseif ($session && !$session->is_active && $session->end_at && now()->greaterThan($session->end_at)) {
                // Session is over and no present log found
                $status = 'tidak-hadir';
                $absentCount++;
                $date = $session->start_at?->format('d M Y');
                $rawDate = $session->start_at?->format('Y-m-d');
                $notes = 'Absen tidak tercatat di sesi ini';
            } elseif ($session) {
                // Session is started/scheduled but not closed yet, or waiting for student
                $date = $session->start_at?->format('d M Y');
                $rawDate = $session->start_at?->format('Y-m-d');
            }

            $meetings[] = [
                'number' => $i,
                'date' => $date,
                'rawDate' => $rawDate,
                'status' => $status,
                'mode' => $isOnline ? 'online' : 'offline',
                'notes' => $notes,
                'completedAt' => $completedAt,
            ];
        }

        $completedCount = $attendedCount + $absentCount;
        $remainingCount = $totalMeetings - $completedCount;
        $attendanceRate = $totalMeetings > 0 ? round(($attendedCount / $totalMeetings) * 100, 1) : 0;

        // Stats
        $stats = [
            'totalPertemuan' => $totalMeetings,
            'hadir' => $attendedCount,
            'tidakHadir' => $absentCount,
            'persentase' => $attendanceRate,
        ];

        // Prediction
        $requiredTotal = (int) ceil($totalMeetings * 0.75);
        $requiredAttendance = max(0, $requiredTotal - $attendedCount);
        $canAchieve75 = $requiredAttendance <= $remainingCount;
        $maxPossible = $attendedCount + $remainingCount;
        $maxPossiblePct = $totalMeetings > 0 ? round(($maxPossible / $totalMeetings) * 100, 1) : 0;
        $projectedPct = $canAchieve75
            ? round((($attendedCount + $requiredAttendance) / $totalMeetings) * 100, 1)
            : $maxPossiblePct;

        $prediction = [
            'remainingMeetings' => $remainingCount,
            'requiredAttendance' => $requiredAttendance,
            'canAchieve75' => $canAchieve75,
            'maxPossiblePercentage' => $maxPossiblePct,
            'projectedPercentage' => $projectedPct,
        ];

        // Pattern analysis
        $completedMeetings = collect($meetings)->whereIn('status', ['hadir', 'tidak-hadir'])->sortBy('number')->values();
        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;
        foreach ($completedMeetings as $m) {
            if ($m['status'] === 'hadir') {
                $tempStreak++;
                $longestStreak = max($longestStreak, $tempStreak);
            } else {
                $tempStreak = 0;
            }
        }
        for ($i = $completedMeetings->count() - 1; $i >= 0; $i--) {
            if ($completedMeetings[$i]['status'] === 'hadir') {
                $currentStreak++;
            } else {
                break;
            }
        }

        $onlineMeetings = collect($meetings)->where('mode', 'online');
        $offlineMeetings = collect($meetings)->where('mode', 'offline');
        $onlineAttended = $onlineMeetings->where('status', 'hadir')->count();
        $offlineAttended = $offlineMeetings->where('status', 'hadir')->count();

        $pattern = [
            'currentStreak' => $currentStreak,
            'longestStreak' => $longestStreak,
            'onlineTotal' => $onlineMeetings->count(),
            'onlineAttended' => $onlineAttended,
            'onlinePercentage' => $onlineMeetings->count() > 0 ? round(($onlineAttended / $onlineMeetings->count()) * 100) : 0,
            'offlineTotal' => $offlineMeetings->count(),
            'offlineAttended' => $offlineAttended,
            'offlinePercentage' => $offlineMeetings->count() > 0 ? round(($offlineAttended / $offlineMeetings->count()) * 100) : 0,
        ];

        $course = [
            'id' => $mahasiswaCourse->id,
            'name' => $mahasiswaCourse->name,
            'code' => '06TPLK004',
            'sks' => $mahasiswaCourse->sks,
            'period' => $mahasiswaCourse->period_group ?? 1,
            'mode' => $mahasiswaCourse->effective_mode,
            'modeName' => $mahasiswaCourse->effective_mode_name,
            'day' => $mahasiswaCourse->effective_schedule_day_name,
            'time' => $mahasiswaCourse->schedule_time?->format('H:i') ?? '-',
            'room' => $mahasiswaCourse->ruangan ?? '-',
            'lecturer' => $dosenName,
        ];

        return Inertia::render('user/akademik/kehadiran-detail', [
            'course' => $course,
            'meetings' => $meetings,
            'stats' => $stats,
            'prediction' => $prediction,
            'pattern' => $pattern,
            'isBeforeUTS' => !$isAfterUts,
        ]);
    }

    public function onlineSelfClaim(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'mahasiswa_course_id' => 'required|exists:mahasiswa_courses,id',
            'meeting_number' => 'required|integer|min:1|max:21',
        ]);

        $mahasiswa = Auth::guard('mahasiswa')->user();
        if (!$mahasiswa) {
            return back()->with('error', 'Silakan login terlebih dahulu.');
        }

        $mahasiswaCourse = MahasiswaCourse::where('id', $request->mahasiswa_course_id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        // 1. Matakuliah Lookup
        $mataKuliah = MataKuliah::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower(trim($mahasiswaCourse->name))])->first();
        if (!$mataKuliah) {
            return back()->with('error', 'Data referensi mata kuliah tidak ditemukan.');
        }

        // 2. Ensure meeting is Online
        $totalMeetings = $mahasiswaCourse->sks === 3 ? 21 : 14;
        $utsMeetingNumber = $mahasiswaCourse->sks === 3 ? 10 : 7;
        $isThisMeetingBeforeUTS = $request->meeting_number <= $utsMeetingNumber;
        
        $isOnline = $this->getMeetingMode(
            $request->meeting_number,
            $mahasiswaCourse->sks,
            $mahasiswaCourse->period_group ?? 1,
            $isThisMeetingBeforeUTS,
            $mahasiswaCourse->name
        );

        if (!$isOnline) {
            return back()->with('error', 'Pertemuan ini tidak diselenggarakan secara online.');
        }

        // 3. Find or create an AttendanceSession
        $session = \App\Models\AttendanceSession::firstOrCreate([
            'course_id' => $mataKuliah->id,
            'meeting_number' => $request->meeting_number,
            'metode' => 'online',
        ], [
            'title' => "Pertemuan Online " . $request->meeting_number,
            'start_at' => now(),
            'end_at' => now()->addDays(7),
            'is_active' => false,
            'created_by' => null,
            'created_by_dosen_id' => $mataKuliah->dosen_id,
        ]);

        if ($session->metode !== 'online') {
            $session->update(['metode' => 'online', 'is_active' => false]);
        }

        // 4. Create the AttendanceLog
        \App\Models\AttendanceLog::updateOrCreate([
            'attendance_session_id' => $session->id,
            'mahasiswa_id' => $mahasiswa->id,
        ], [
            'status' => 'present',
            'note' => 'Hadir via absensi mandiri kelas online (Fordis Mentari)',
            'scanned_at' => now(),
        ]);

        return back()->with('success', 'Kehadiran online berhasil dicatat!');
    }


    /**
     * Determine meeting mode (online/offline) based on SKS, period, meeting number, course name, and UTS status.
     */
    private function getMeetingMode(int $meetingNumber, int $sks, int $period, bool $isBeforeUTS, ?string $courseName = null): bool
    {
        // Special case overrides based on strict user request
        if ($courseName) {
            $normalizedName = strtolower(trim($courseName));
            
            // Rule: Basis Data II / Mobile Programming -> P1-10 Online, P11-21 mixed (12,15,18,21 online)
            if (in_array($normalizedName, ['basis data ii', 'mobile programming'])) {
                if ($isBeforeUTS) {
                    return true;
                } else {
                    return in_array($meetingNumber, [12, 15, 18, 21]);
                }
            }
            // Rule: KP & TIoT -> Before UTS: Online Semua, After UTS: Offline Semua
            if (in_array($normalizedName, ['kerja praktek', 'kp', 'teknologi internet of things'])) {
                if ($isBeforeUTS) {
                    return true; // Online
                } else {
                    return false; // Offline
                }
            }
        }

        if ($period === 1) {
            if ($sks === 3) {
                if ($isBeforeUTS) {
                    // If special course, overriding here to ensure it's online
                    if ($courseName && in_array(strtolower(trim($courseName)), ['basis data ii', 'mobile programming'])) {
                        return true;
                    }
                    // Pertemuan 1-10 offline, kecuali 3, 6, 9 online (for regular courses)
                    return in_array($meetingNumber, [3, 6, 9]);
                } else {
                    // Pertemuan 11-21 online semua
                    return true;
                }
            } else {
                if ($isBeforeUTS) {
                    // Pertemuan 1-7 offline
                    return false;
                } else {
                    // Pertemuan 8-14 online
                    return true;
                }
            }
        } else {
            // Periode 2
            if ($sks === 3) {
                if ($isBeforeUTS) {
                    // Pertemuan 1-10 online semua
                    return true;
                } else {
                    // Pertemuan 11-21 offline, kecuali 12, 15, 18, 21 online
                    return in_array($meetingNumber, [12, 15, 18, 21]);
                }
            } else {
                if ($isBeforeUTS) {
                    // Pertemuan 1-7 online
                    return true;
                } else {
                    // Pertemuan 8-14 offline
                    return false;
                }
            }
        }
    }

    /**
     * Get meeting status label.
     */
    private function getMeetingStatus(?CourseMeeting $meeting): string
    {
        if (!$meeting) {
            return 'belum-dimulai';
        }

        if ($meeting->is_completed) {
            return 'hadir';
        }

        if ($meeting->scheduled_date && $meeting->scheduled_date->isPast()) {
            return 'tidak-hadir';
        }

        return 'belum-dimulai';
    }

    /**
     * Sync courses from mata_kuliah table if the student has none.
     */
    private function syncCoursesIfNeeded(int $mahasiswaId): void
    {
        $existingCount = MahasiswaCourse::where('mahasiswa_id', $mahasiswaId)->count();

        if ($existingCount > 0) {
            return;
        }

        $mataKuliahs = MataKuliah::with('dosen')->orderBy('id')->get()->values();
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        $times = ['07:40', '09:20', '11:00', '13:50', '16:00'];
        $periodOneLimit = (int) ceil($mataKuliahs->count() / 2);

        foreach ($mataKuliahs as $index => $mk) {
            $periodGroup = $index < $periodOneLimit ? 1 : 2;

            MahasiswaCourse::create([
                'mahasiswa_id' => $mahasiswaId,
                'name' => $mk->nama,
                'sks' => $mk->sks ?? 3,
                'total_meetings' => 16,
                'current_meeting' => 1,
                'uts_meeting' => 8,
                'uas_meeting' => 16,
                'schedule_day' => $days[$index % count($days)],
                'schedule_time' => $times[$index % count($times)],
                'mode' => $periodGroup === 1 ? 'offline' : 'online',
                'period_group' => $periodGroup,
                'start_date' => now()->startOfMonth(),
            ]);
        }
    }
}


