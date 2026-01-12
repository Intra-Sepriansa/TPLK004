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
        $courses = MataKuliah::where('dosen_id', $dosen->id)->get();
        
        // Get selected course
        $selectedCourseId = $request->get('course_id');
        $selectedSessionId = $request->get('session_id');
        
        $sessions = [];
        $attendanceLogs = [];
        $selectedCourse = null;
        $selectedSession = null;
        
        if ($selectedCourseId) {
            $selectedCourse = MataKuliah::find($selectedCourseId);
            $sessions = AttendanceSession::where('course_id', $selectedCourseId)
                ->orderBy('meeting_number')
                ->get();
        }
        
        if ($selectedSessionId) {
            $selectedSession = AttendanceSession::with('course')->find($selectedSessionId);
            $attendanceLogs = AttendanceLog::with('mahasiswa')
                ->where('attendance_session_id', $selectedSessionId)
                ->orderBy('scanned_at')
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'mahasiswa_id' => $log->mahasiswa_id,
                        'nama' => $log->mahasiswa->nama ?? '-',
                        'nim' => $log->mahasiswa->nim ?? '-',
                        'fakultas' => $log->mahasiswa->fakultas ?? 'Teknik',
                        'prodi' => $log->mahasiswa->prodi ?? 'Teknik Informatika',
                        'kelas' => $log->mahasiswa->kelas ?? '05TPLK004',
                        'jenis_reguler' => $log->mahasiswa->jenis_reguler ?? 'Reguler A',
                        'semester' => $log->mahasiswa->semester ?? '5',
                        'status' => $log->status,
                        'scanned_at' => $log->scanned_at?->format('H:i:s'),
                        'scanned_date' => $log->scanned_at?->format('d/m/Y'),
                    ];
                });
        }
        
        // Statistics
        $stats = [
            'total' => count($attendanceLogs),
            'hadir' => collect($attendanceLogs)->where('status', 'present')->count(),
            'terlambat' => collect($attendanceLogs)->where('status', 'late')->count(),
            'tidak_hadir' => collect($attendanceLogs)->where('status', 'absent')->count(),
        ];
        
        return Inertia::render('dosen/rekapan', [
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
            ],
            'courses' => $courses,
            'sessions' => $sessions,
            'attendanceLogs' => $attendanceLogs,
            'selectedCourseId' => $selectedCourseId,
            'selectedSessionId' => $selectedSessionId,
            'selectedCourse' => $selectedCourse,
            'selectedSession' => $selectedSession,
            'stats' => $stats,
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
        
        $attendanceLogs = AttendanceLog::with('mahasiswa')
            ->where('attendance_session_id', $sessionId)
            ->orderBy('scanned_at')
            ->get()
            ->map(function ($log, $index) {
                return [
                    'no' => $index + 1,
                    'nama' => $log->mahasiswa->nama ?? '-',
                    'nim' => $log->mahasiswa->nim ?? '-',
                    'fakultas' => $log->mahasiswa->fakultas ?? 'Teknik',
                    'prodi' => $log->mahasiswa->prodi ?? 'Teknik Informatika',
                    'kelas' => $log->mahasiswa->kelas ?? '05TPLK004',
                    'jenis_reguler' => $log->mahasiswa->jenis_reguler ?? 'Reguler A',
                    'semester' => $log->mahasiswa->semester ?? '5',
                    'status' => $this->getStatusLabel($log->status),
                    'waktu' => $log->scanned_at?->format('H:i:s') ?? '-',
                ];
            });
        
        $data = [
            'dosen' => $dosen,
            'session' => $session,
            'course' => $session->course,
            'attendanceLogs' => $attendanceLogs,
            'tanggal' => $session->start_at?->format('d F Y') ?? now()->format('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.rekapan-kehadiran', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = 'Rekapan_Kehadiran_' . str_replace(' ', '_', $session->course->nama ?? 'MataKuliah') . '_Pertemuan_' . $session->meeting_number . '.pdf';
        
        return $pdf->download($filename);
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
