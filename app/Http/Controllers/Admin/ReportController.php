<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $timezone = $this->resolveDisplayTimezone($request->query('tz'));
        $sessionId = $request->query('session_id');
        $session = null;

        $query = AttendanceLog::with(['mahasiswa', 'session.course']);

        if ($sessionId) {
            $query->where('attendance_session_id', $sessionId);
            $session = AttendanceSession::with('course')->find($sessionId);
        }

        $filename = $session
            ? 'rekap-' . ($session->course?->code ?? 'session') . '-P' . $session->meeting_number . '.csv'
            : 'rekap-absensi.csv';

        return response()->streamDownload(function () use ($query, $timezone) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Nama',
                'NIM',
                'Mata Kuliah',
                'Pertemuan',
                'Status',
                'Waktu Scan',
                'Jarak (m)',
            ]);

            $query->orderByDesc('scanned_at')->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->mahasiswa?->nama,
                        $log->mahasiswa?->nim,
                        $log->session?->course?->nama,
                        $log->session?->meeting_number,
                        $log->status,
                        $this->formatDisplayTime($log->scanned_at, 'Y-m-d H:i:s', $timezone),
                        $log->distance_m,
                    ]);
                }
            });

            fclose($handle);
        }, $filename);
    }

    public function exportAudit(Request $request): StreamedResponse
    {
        $timezone = $this->resolveDisplayTimezone($request->query('tz'));
        $query = AuditLog::with(['mahasiswa', 'session.course'])->latest();

        return response()->streamDownload(function () use ($query, $timezone) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Waktu',
                'Event',
                'Pesan',
                'Mahasiswa',
                'NIM',
                'Mata Kuliah',
                'Pertemuan',
            ]);

            $query->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $this->formatDisplayTime($log->created_at, 'Y-m-d H:i:s', $timezone),
                        $log->event_type,
                        $log->message,
                        $log->mahasiswa?->nama,
                        $log->mahasiswa?->nim,
                        $log->session?->course?->nama,
                        $log->session?->meeting_number,
                    ]);
                }
            });

            fclose($handle);
        }, 'audit-keamanan.csv');
    }
}
