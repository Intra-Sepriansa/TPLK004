<?php

namespace App\Http\Controllers\Admin;

use App\Models\AttendanceLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

trait PerangkatDetailTrait
{
    public function show($id)
    {
        // Try to find device by fingerprint, or fallback to exact model, or log ID
        $baseLog = AttendanceLog::with('mahasiswa')
            ->where('device_fingerprint', $id)
            ->orWhere('device_model', $id)
            ->orWhere('id', $id)
            ->latest('scanned_at')
            ->firstOrFail();

        // The identifier we'll use to group logs
        $deviceId = $baseLog->device_fingerprint ?? $baseLog->device_model;
        $deviceQuery = AttendanceLog::where('device_fingerprint', $deviceId)
            ->orWhere('device_model', $deviceId);

        $totalScans = $deviceQuery->count();
        $logs = $deviceQuery->latest('scanned_at')->get();
        $mahasiswa = $baseLog->mahasiswa;

        // Security Analysis
        $score = $baseLog->risk_score ?? 100;
        $score = is_numeric($score) ? 100 - $score : 100; // Assuming higher risk_score means lower security score, or if risk_score is 0 then 100 safe.
        
        $checks = [
            ['label' => 'Jaringan Aman', 'passed' => !$baseLog->is_suspicious],
            ['label' => 'Lokasi Terdeteksi', 'passed' => !empty($baseLog->latitude)],
            ['label' => 'Perangkat Dikenal', 'passed' => $baseLog->is_device_trusted ?? true],
        ];

        // Prepare Mock Anomaly
        $anomalies = [
            'active' => $baseLog->is_suspicious ? 1 : 0,
            'total' => $baseLog->is_suspicious ? 1 : 0,
            'list' => []
        ];
        if ($baseLog->is_suspicious) {
            $anomalies['list'][] = [
                'type' => 'Lokasi Tidak Wajar',
                'severity' => 'high',
                'description' => 'Akses terdeteksi dari luar area kampus.',
                'timestamp' => $baseLog->scanned_at ? $baseLog->scanned_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i')
            ];
        }

        // Prepare Activities
        $activities = $logs->map(function ($log) {
            return [
                'date' => $log->scanned_at ? $log->scanned_at->format('d/m/Y') : '-',
                'time' => $log->scanned_at ? $log->scanned_at->format('H:i') : '-',
                'type' => 'scan',
                'action' => 'Scan QR Absensi',
                'location' => $log->address ?? 'Lokasi tidak diketahui',
                'ip' => $log->ip_address ?? '-',
                'status' => $log->is_suspicious ? 'warning' : 'success',
            ];
        });

        // Mock Usage Timeline (Last 7 Days)
        $timelineLabels = collect();
        $timelineValues = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $timelineLabels->push($date->format('D'));
            $timelineValues->push($logs->whereBetween('scanned_at', [
                $date->copy()->startOfDay(),
                $date->copy()->endOfDay()
            ])->count());
        }

        return Inertia::render('admin/perangkat-detail', [
            'deviceInfo' => [
                'id' => $baseLog->id, // Send primary key ID to frontend for safe routing instead of model string
                'deviceId' => $deviceId, // The logical grouping id (fingerprint or model)
                'model' => $baseLog->device_model ?? 'Unknown Device',
                'os' => $baseLog->device_os ?? 'Unknown OS',
                'osVersion' => '-',
                'browser' => $baseLog->browser ?? 'Unknown Browser',
                'browserVersion' => '-',
                'processor' => 'Architecture ' . ($baseLog->platform ?? 'Unknown'),
                'memory' => '-',
                'resolution' => $baseLog->screen_resolution ?? 'Unknown',
                'userAgent' => $baseLog->user_agent ?? '-',
                'status' => $baseLog->is_device_trusted === false ? 'blocked' : ($baseLog->is_suspicious ? 'suspicious' : 'active'),
            ],
            'student' => [
                'id' => $mahasiswa ? $mahasiswa->id : null,
                'nama' => $mahasiswa ? $mahasiswa->nama : 'Unknown',
                'nim' => $mahasiswa ? $mahasiswa->nim : '-',
                'foto' => $mahasiswa ? $mahasiswa->avatar_url : null,
                'prodi' => $mahasiswa ? $mahasiswa->fakultas : '-',
                'semester' => 3,
                'email' => $mahasiswa ? $mahasiswa->email : '-',
                'phone' => '-',
                'totalAbsen' => $totalScans,
                'kehadiran' => 95,
            ],
            'stats' => [
                'totalScans' => $totalScans,
                'lastAccess' => $baseLog->scanned_at ? $baseLog->scanned_at->format('d/m/Y, H:i') : '-',
                'securityScore' => $score,
                'osSystem' => explode(' ', $baseLog->device_os ?? '')[0] ?? 'Unknown',
                'osVersion' => $baseLog->device_os ?? '',
            ],
            'timeline' => [
                'labels' => $timelineLabels,
                'values' => $timelineValues,
                'avgDaily' => round($totalScans / 7, 1),
                'peakDay' => $totalScans > 0 ? $timelineLabels[$timelineValues->search($timelineValues->max())] : '-',
                'totalWeek' => $timelineValues->sum(),
            ],
            'locations' => [
                [
                    'name' => 'Kampus Utama',
                    'coordinates' => ($baseLog->latitude ?? '-') . ', ' . ($baseLog->longitude ?? '-'),
                    'count' => $totalScans,
                    'x' => 50,
                    'y' => 50
                ]
            ],
            'security' => [
                'score' => $score,
                'checks' => $checks,
                'recommendations' => $score < 100 ? ['Pastikan akses dari jaringan yang aman.'] : []
            ],
            'anomalies' => $anomalies,
            'activities' => $activities,
        ]);
    }

    public function block($id)
    {
        $baseLog = AttendanceLog::findOrFail($id);
        $deviceId = $baseLog->device_fingerprint ?? $baseLog->device_model;
        
        AttendanceLog::where('device_fingerprint', $deviceId)
            ->orWhere('device_model', $deviceId)
            ->update([
                'is_device_trusted' => false,
                'is_suspicious' => true
            ]);

        return redirect()->route('admin.perangkat.show', $id)
            ->with('success', 'Perangkat ' . ($baseLog->device_model ?? 'ini') . ' berhasil diblokir secara sistem.');
    }

    public function whitelist($id)
    {
        $baseLog = AttendanceLog::findOrFail($id);
        $deviceId = $baseLog->device_fingerprint ?? $baseLog->device_model;

        AttendanceLog::where('device_fingerprint', $deviceId)
            ->orWhere('device_model', $deviceId)
            ->update([
                'is_device_trusted' => true,
                'is_suspicious' => false
            ]);

        return redirect()->route('admin.perangkat.show', $id)
            ->with('success', 'Perangkat ' . ($baseLog->device_model ?? 'ini') . ' berhasil diverifikasi sebagai aman (Whitelist).');
    }

    public function exportDetailPdf($id)
    {
        // Gather the exact same data as the show method for consistency
        $baseLog = AttendanceLog::where('id', $id)
            ->orWhere('device_fingerprint', $id)
            ->orWhere('device_model', $id)
            ->latest('scanned_at')
            ->firstOrFail();

        $deviceId = $baseLog->device_fingerprint ?? $baseLog->device_model;
        $deviceQuery = AttendanceLog::where('device_fingerprint', $deviceId)
            ->orWhere('device_model', $deviceId);

        $totalScans = $deviceQuery->count();
        $logs = $deviceQuery->latest('scanned_at')->get();
        $mahasiswa = $baseLog->mahasiswa;

        $score = $baseLog->risk_score ?? 100;
        $score = is_numeric($score) ? 100 - $score : 100;

        $checks = [
            ['label' => 'Jaringan Aman', 'passed' => !$baseLog->is_suspicious],
            ['label' => 'Lokasi Terdeteksi', 'passed' => !empty($baseLog->latitude)],
            ['label' => 'Perangkat Dikenal', 'passed' => $baseLog->is_device_trusted ?? true],
        ];

        $anomalies = [
            'active' => $baseLog->is_suspicious ? 1 : 0,
            'total' => $baseLog->is_suspicious ? 1 : 0,
            'list' => []
        ];
        if ($baseLog->is_suspicious) {
            $anomalies['list'][] = [
                'type' => 'Lokasi Tidak Wajar',
                'severity' => 'high',
                'description' => 'Akses terdeteksi dari luar area kampus.',
                'timestamp' => $baseLog->scanned_at ? $baseLog->scanned_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i')
            ];
        }

        $activities = $logs->take(15)->map(fn($log) => [
            'date' => $log->scanned_at ? $log->scanned_at->format('d/m/Y') : '-',
            'time' => $log->scanned_at ? $log->scanned_at->format('H:i') : '-',
            'type' => 'scan',
            'action' => 'Scan QR Absensi',
            'location' => $log->address ?? 'Lokasi tidak diketahui',
            'ip' => $log->ip_address ?? '-',
            'status' => $log->is_suspicious ? 'warning' : 'success',
        ]);

        $timelineLabels = collect();
        $timelineValues = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $timelineLabels->push($date->format('D'));
            $timelineValues->push($logs->whereBetween('scanned_at', [
                $date->copy()->startOfDay(),
                $date->copy()->endOfDay()
            ])->count());
        }

        $data = [
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
            'iconPerangkat' => public_path('build/assets/perangkat-icon.png'), // If needed for base64
            'deviceInfo' => [
                'id' => $deviceId,
                'model' => $baseLog->device_model ?? 'Unknown Device',
                'os' => $baseLog->device_os ?? 'Unknown OS',
                'osVersion' => '-',
                'browser' => $baseLog->browser ?? 'Unknown Browser',
                'processor' => 'Architecture ' . ($baseLog->platform ?? 'Unknown'),
                'resolution' => $baseLog->screen_resolution ?? 'Unknown',
                'userAgent' => $baseLog->user_agent ?? '-',
                'status' => $baseLog->is_device_trusted === false ? 'blocked' : ($baseLog->is_suspicious ? 'suspicious' : 'active'),
            ],
            'student' => [
                'nama' => $mahasiswa ? $mahasiswa->nama : 'Unknown',
                'nim' => $mahasiswa ? $mahasiswa->nim : '-',
                'foto' => $mahasiswa && $mahasiswa->avatar_url ? str_replace(url('/'), public_path(), $mahasiswa->avatar_url) : null,
                'prodi' => $mahasiswa ? $mahasiswa->fakultas : '-',
                'semester' => 3,
                'email' => $mahasiswa ? $mahasiswa->email : '-',
                'phone' => '-',
                'totalAbsen' => $totalScans,
                'kehadiran' => 95,
            ],
            'stats' => [
                'totalScans' => $totalScans,
                'lastAccess' => $baseLog->scanned_at ? $baseLog->scanned_at->format('d/m/Y, H:i') : '-',
                'securityScore' => $score,
                'osSystem' => explode(' ', $baseLog->device_os ?? '')[0] ?? 'Unknown',
                'osVersion' => $baseLog->device_os ?? '',
            ],
            'timeline' => [
                'labels' => $timelineLabels,
                'values' => $timelineValues,
                'avgDaily' => round($totalScans / 7, 1),
                'peakDay' => $totalScans > 0 ? $timelineLabels[$timelineValues->search($timelineValues->max())] : '-',
                'totalWeek' => $timelineValues->sum(),
            ],
            'security' => [
                'score' => $score,
                'checks' => $checks,
                'recommendations' => $score < 100 ? ['Pastikan akses dari jaringan yang aman.'] : []
            ],
            'anomalies' => $anomalies,
            'activities' => $activities,
        ];

        // Ensure PDF uses absolute path for images correctly
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.perangkat-detail', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('Detail_Perangkat_' . \Illuminate\Support\Str::slug($baseLog->device_model) . '_' . now()->format('YmdHis') . '.pdf');
    }
}
