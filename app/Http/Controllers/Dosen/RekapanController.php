<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RekapanController extends Controller
{
    public function index(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        
        // Get courses taught by this dosen
        $courses = MataKuliah::where('dosen_id', $dosen->id)
            ->withCount(['sessions as session_count'])
            ->get();
        
        // Get selected course & auto-select latest if empty
        $selectedCourseId = $request->get('course_id');
        
        if (!$selectedCourseId && $courses->count() > 0) {
            $selectedCourseId = $courses->first()->id;
        }

        $selectedSessionId = $request->get('session_id');
        $searchQuery = $request->get('search', '');
        $statusFilter = $request->get('status', 'all');
        
        $sessions = [];
        $attendanceLogs = [];
        $selectedCourse = null;
        $selectedSession = null;
        
        if ($selectedCourseId) {
            $selectedCourse = MataKuliah::find($selectedCourseId);
            $sessions = AttendanceSession::where('course_id', $selectedCourseId)
                ->withCount('logs as attendance_count')
                ->orderBy('meeting_number')
                ->get();
                
            // Auto-select latest session if empty
            if (!$selectedSessionId && $sessions->count() > 0) {
                // Get the most recent session based on start_at or meeting_number
                $selectedSessionId = AttendanceSession::where('course_id', $selectedCourseId)
                    ->orderBy('start_at', 'desc')
                    ->orderBy('meeting_number', 'desc')
                    ->first()
                    ->id;
            }
        }
        
        if ($selectedSessionId) {
            $selectedSession = AttendanceSession::with('course')->find($selectedSessionId);
            
            // Get all students in this class
            $students = \App\Models\Mahasiswa::where('kelas', $selectedCourse->kelas)->orderBy('nama')->get();
            
            // Get existing logs for this session
            $logs = AttendanceLog::where('attendance_session_id', $selectedSessionId)
                ->get()
                ->keyBy('mahasiswa_id');
            
            // Merge students with logs
            $attendanceLogs = $students->map(function ($student) use ($logs) {
                $log = $logs->get($student->id);
                $status = $log ? $log->status : 'absent';
                
                return [
                    'id' => $log->id ?? 0,
                    'mahasiswa_id' => $student->id,
                    'nama' => $student->nama,
                    'nim' => $student->nim,
                    'fakultas' => $student->fakultas ?? 'Teknik',
                    'prodi' => $student->prodi ?? 'Teknik Informatika',
                    'kelas' => $student->kelas ?? '-',
                    'jenis_reguler' => $student->jenis_reguler ?? 'Reguler A',
                    'semester' => $student->semester ?? '-',
                    'status' => $status,
                    'scanned_at' => $log ? $log->scanned_at?->format('H:i:s') : null,
                    'scanned_date' => $log ? $log->scanned_at?->format('d/m/Y') : null,
                ];
            });

            // Apply search filter
            if ($searchQuery) {
                $attendanceLogs = $attendanceLogs->filter(function ($item) use ($searchQuery) {
                    return stripos($item['nama'], $searchQuery) !== false || 
                           stripos($item['nim'], $searchQuery) !== false;
                });
            }

            // Apply status filter
            if ($statusFilter && $statusFilter !== 'all') {
                $attendanceLogs = $attendanceLogs->filter(function ($item) use ($statusFilter) {
                    return $item['status'] === $statusFilter;
                });
            }
        }
        
        // Statistics (based on class population and processed logs)
        $totalStudentsCount = $selectedCourse ? \App\Models\Mahasiswa::where('kelas', $selectedCourse->kelas)->count() : 0;
        
        // Count statuses from ALL students in the class for the session
        $allClassLogs = [];
        if ($selectedSessionId && $selectedCourse) {
            $studentsInClass = \App\Models\Mahasiswa::where('kelas', $selectedCourse->kelas)->get();
            $existingLogs = AttendanceLog::where('attendance_session_id', $selectedSessionId)
                ->get()
                ->keyBy('mahasiswa_id');
            
            $hadirCount = 0;
            $terlambatCount = 0;
            $tidakHadirCount = 0;

            foreach ($studentsInClass as $s) {
                $l = $existingLogs->get($s->id);
                $status = $l ? $l->status : 'absent';
                if ($status === 'present') $hadirCount++;
                elseif ($status === 'late') $terlambatCount++;
                else $tidakHadirCount++;
            }
        } else {
            $hadirCount = 0;
            $terlambatCount = 0;
            $tidakHadirCount = 0;
        }
        
        $stats = [
            'total' => $totalStudentsCount,
            'hadir' => $hadirCount,
            'terlambat' => $terlambatCount,
            'tidak_hadir' => $tidakHadirCount,
            'attendance_rate' => $totalStudentsCount > 0
                ? round((($hadirCount + $terlambatCount) / $totalStudentsCount) * 100, 1)
                : 0,
        ];
        
        return Inertia::render('dosen/rekapan', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
                'email' => $dosen->email ?? '',
                'avatar_url' => $dosen->avatar_url ?? null,
                'initials' => $dosen->initials,
            ],
            'courses' => $courses,
            'sessions' => $sessions,
            'attendanceLogs' => $attendanceLogs,
            'selectedCourseId' => $selectedCourseId,
            'selectedSessionId' => $selectedSessionId,
            'selectedCourse' => $selectedCourse,
            'selectedSession' => $selectedSession,
            'stats' => $stats,
            'filters' => [
                'search' => $searchQuery,
                'status' => $statusFilter,
            ],
        ]);
    }

    public function exportPdf(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            return back()->with('error', 'Pilih sesi terlebih dahulu');
        }
        
        $session = AttendanceSession::with('course')->find($sessionId);
        
        if (!$session) {
            return back()->with('error', 'Sesi tidak ditemukan');
        }
        
        // Get all students in this class
        $students = \App\Models\Mahasiswa::where('kelas', $session->course->kelas)->orderBy('nama')->get();
        
        // Get existing logs for this session
        $logs = AttendanceLog::where('attendance_session_id', $sessionId)
            ->get()
            ->keyBy('mahasiswa_id');
        
        // Merge students with logs
        $attendanceLogs = $students->map(function ($student, $index) use ($logs) {
            $log = $logs->get($student->id);
            $status = $log ? $log->status : 'absent';
            
            return [
                'no' => $index + 1,
                'nama' => $student->nama,
                'nim' => $student->nim,
                'fakultas' => $student->fakultas ?? 'Teknik',
                'prodi' => $student->prodi ?? 'Teknik Informatika',
                'kelas' => $student->kelas ?? '-',
                'jenis_reguler' => $student->jenis_reguler ?? 'Reguler A',
                'semester' => $student->semester ?? '-',
                'status' => $this->getStatusLabel($status),
                'waktu' => $log ? ($log->scanned_at?->format('H:i:s') ?? '-') : '-',
            ];
        });
        
        $data = [
            'dosen' => $dosen,
            'session' => $session,
            'course' => $session->course,
            'attendanceLogs' => $attendanceLogs,
            'tanggal' => $session->start_at?->timezone('Asia/Jakarta')->translatedFormat('d F Y') ?? now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.rekapan-kehadiran', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = 'Rekapan_Kehadiran_' . str_replace(' ', '_', $session->course->nama ?? 'MataKuliah') . '_Pertemuan_' . $session->meeting_number . '.pdf';
        
        return $pdf->download($filename);
    }
    
    public function show(AttendanceLog $log)
    {
        $dosen = Auth::guard('dosen')->user();

        // Load all relationships
        $log->load(['mahasiswa', 'session.course', 'selfieVerification']);

        // Ensure the log belongs to a course owned by this dosen
        $course = $log->session?->course;
        if (!$course || $course->dosen_id !== $dosen->id) {
            abort(403, 'Unauthorized');
        }

        // Mahasiswa info
        $mhs = $log->mahasiswa;

        // Attendance history for this student in this course
        $history = AttendanceLog::with('session')
            ->where('mahasiswa_id', $log->mahasiswa_id)
            ->whereHas('session', function ($q) use ($course) {
                $q->where('course_id', $course->id);
            })
            ->orderBy('scanned_at', 'desc')
            ->get()
            ->map(function ($h) {
                return [
                    'id' => $h->id,
                    'meeting_number' => $h->session?->meeting_number,
                    'status' => $h->status,
                    'scanned_at' => $h->scanned_at?->format('H:i:s'),
                    'scanned_date' => $h->scanned_at?->format('d/m/Y'),
                ];
            });

        // Calculate student attendance stats for this course
        $totalSessions = AttendanceSession::where('course_id', $course->id)->count();
        $studentPresent = $history->where('status', 'present')->count();
        $studentLate = $history->where('status', 'late')->count();
        $studentAbsent = $history->where('status', 'absent')->count();
        $studentRate = $totalSessions > 0
            ? round((($studentPresent + $studentLate) / $totalSessions) * 100, 1)
            : 0;

        return Inertia::render('dosen/rekapan-detail', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
            ],
            'log' => [
                'id' => $log->id,
                'status' => $log->status,
                'scanned_at' => $log->scanned_at?->format('H:i:s'),
                'scanned_date' => $log->scanned_at?->format('d F Y'),
                'scanned_full' => $log->scanned_at?->format('d/m/Y H:i:s'),
                'note' => $log->note,
                // Location
                'latitude' => $log->latitude,
                'longitude' => $log->longitude,
                'distance_m' => $log->distance_m,
                'accuracy' => $log->accuracy,
                'address' => $log->address,
                // Device
                'device_os' => $log->device_os,
                'device_model' => $log->device_model,
                'device_type' => $log->device_type,
                'browser' => $log->browser,
                'platform' => $log->platform,
                'screen_resolution' => $log->screen_resolution,
                'timezone' => $log->timezone,
                'ip_address' => $log->ip_address,
                'device_fingerprint' => $log->device_fingerprint,
                'is_device_trusted' => $log->is_device_trusted,
                // AI Analysis
                'selfie_path' => $log->selfie_path,
                'face_detected' => $log->face_detected,
                'face_match_score' => $log->face_match_score,
                'is_live_photo' => $log->is_live_photo,
                'spoofing_detected' => $log->spoofing_detected,
                'image_quality_score' => $log->image_quality_score,
                'ai_confidence' => $log->ai_confidence,
                'ai_recommendation' => $log->ai_recommendation,
                'is_suspicious' => $log->is_suspicious,
                'risk_score' => $log->risk_score,

                'ai_analysis_json' => $log->ai_analysis_json,
                'ai_processing_step' => $log->ai_processing_step,
                'ai_processed_at' => $log->ai_processed_at?->format('d/m/Y H:i:s'),
            ],
            'mahasiswa' => [
                'id' => $mhs?->id,
                'nama' => $mhs?->nama ?? '-',
                'nim' => $mhs?->nim ?? '-',
                'fakultas' => $mhs?->fakultas ?? 'Teknik',
                'prodi' => $mhs?->prodi ?? 'Teknik Informatika',
                'kelas' => $mhs?->kelas ?? '-',
                'jenis_reguler' => $mhs?->jenis_reguler ?? 'Reguler A',
                'semester' => $mhs?->semester ?? '-',
                'avatar_url' => $mhs?->avatar_url,
            ],
            'course' => [
                'id' => $course->id,
                'nama' => $course->nama,
                'sks' => $course->sks,
            ],
            'session' => [
                'id' => $log->session?->id,
                'meeting_number' => $log->session?->meeting_number,
                'title' => $log->session?->title,
                'start_at' => $log->session?->start_at?->format('d F Y H:i'),
                'end_at' => $log->session?->end_at?->format('d F Y H:i'),
            ],
            'selfieVerification' => $log->selfieVerification ? [
                'status' => $log->selfieVerification->status,
                'verified_by_name' => $log->selfieVerification->verified_by_name,
                'verified_at' => $log->selfieVerification->verified_at?->format('d/m/Y H:i'),
                'rejection_reason' => $log->selfieVerification->rejection_reason,
                'note' => $log->selfieVerification->note,
            ] : null,
            'fraudAlerts' => [],
            'history' => $history,
            'studentStats' => [
                'total_sessions' => $totalSessions,
                'present' => $studentPresent,
                'late' => $studentLate,
                'absent' => $studentAbsent,
                'attendance_rate' => $studentRate,
            ],
        ]);
    }

    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'present' => 'Hadir',
            'late' => 'Terlambat',
            'absent' => 'Tidak Hadir',
            default => ucfirst($status),
        };
    }
}
