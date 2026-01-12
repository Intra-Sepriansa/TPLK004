<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\AttendanceSession;
use App\Models\AuditLog;
use App\Models\Mahasiswa;
use App\Models\SelfieVerification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(7)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $eventType = $request->get('event_type', 'all');
        
        // Audit Logs with filters
        $auditQuery = AuditLog::with(['mahasiswa', 'session.course'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        
        if ($eventType !== 'all') {
            $auditQuery->where('event_type', $eventType);
        }
        
        $auditLogs = $auditQuery->latest()
            ->paginate(20)
            ->withQueryString();
        
        // Security Statistics
        $securityStats = $this->getSecurityStats($dateFrom, $dateTo);
        
        // Event Type Distribution
        $eventDistribution = AuditLog::select('event_type', DB::raw('count(*) as total'))
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('event_type')
            ->orderByDesc('total')
            ->get();
        
        // Daily Audit Trend
        $dailyTrend = $this->getDailyAuditTrend($dateFrom, $dateTo);
        
        // Suspicious Activities
        $suspiciousActivities = $this->getSuspiciousActivities($dateFrom, $dateTo);
        
        // Top Flagged Students
        $topFlaggedStudents = $this->getTopFlaggedStudents($dateFrom, $dateTo);
        
        return Inertia::render('admin/audit', [
            'auditLogs' => $auditLogs,
            'securityStats' => $securityStats,
            'eventDistribution' => $eventDistribution,
            'dailyTrend' => $dailyTrend,
            'suspiciousActivities' => $suspiciousActivities,
            'topFlaggedStudents' => $topFlaggedStudents,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'event_type' => $eventType,
            ],
            'eventTypes' => $this->getEventTypes(),
        ]);
    }
    
    public function exportPdf(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(7)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $eventType = $request->get('event_type', 'all');
        
        $auditQuery = AuditLog::with(['mahasiswa', 'session.course'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        
        if ($eventType !== 'all') {
            $auditQuery->where('event_type', $eventType);
        }
        
        $auditLogs = $auditQuery->latest()->get();
        $securityStats = $this->getSecurityStats($dateFrom, $dateTo);
        $eventDistribution = AuditLog::select('event_type', DB::raw('count(*) as total'))
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('event_type')
            ->orderByDesc('total')
            ->get();
        
        $data = [
            'auditLogs' => $auditLogs,
            'securityStats' => $securityStats,
            'eventDistribution' => $eventDistribution,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'tanggal' => now()->format('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.audit-keamanan', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $filename = 'Laporan_Audit_Keamanan_' . $dateFrom . '_' . $dateTo . '.pdf';
        
        return $pdf->download($filename);
    }
    
    private function getSecurityStats($dateFrom, $dateTo)
    {
        $baseQuery = fn() => AuditLog::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        
        return [
            'total_events' => $baseQuery()->count(),
            'token_expired' => $baseQuery()->where('event_type', 'token_expired')->count(),
            'token_duplicate' => $baseQuery()->where('event_type', 'token_duplicate')->count(),
            'geofence_violation' => $baseQuery()->where('event_type', 'geofence_violation')->count(),
            'selfie_rejected' => SelfieVerification::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->where('status', 'rejected')->count(),
            'selfie_pending' => SelfieVerification::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->where('status', 'pending')->count(),
            'login_failed' => $baseQuery()->where('event_type', 'login_failed')->count(),
            'suspicious_activity' => $baseQuery()->where('event_type', 'suspicious_activity')->count(),
        ];
    }

    private function getDailyAuditTrend($dateFrom, $dateTo)
    {
        $counts = AuditLog::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date');
        
        $labels = [];
        $values = [];
        $start = \Carbon\Carbon::parse($dateFrom);
        $end = \Carbon\Carbon::parse($dateTo);
        
        while ($start <= $end) {
            $dateKey = $start->toDateString();
            $labels[] = $start->format('d/m');
            $values[] = (int) ($counts[$dateKey] ?? 0);
            $start->addDay();
        }
        
        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }
    
    private function getSuspiciousActivities($dateFrom, $dateTo)
    {
        return AuditLog::with(['mahasiswa', 'session.course'])
            ->whereIn('event_type', ['token_duplicate', 'geofence_violation', 'suspicious_activity'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event_type' => $log->event_type,
                    'message' => $log->message,
                    'mahasiswa' => $log->mahasiswa?->nama ?? '-',
                    'nim' => $log->mahasiswa?->nim ?? '-',
                    'course' => $log->session?->course?->nama ?? '-',
                    'created_at' => $log->created_at->format('d/m/Y H:i:s'),
                ];
            });
    }
    
    private function getTopFlaggedStudents($dateFrom, $dateTo)
    {
        return AuditLog::select('mahasiswa_id', DB::raw('count(*) as total_flags'))
            ->whereNotNull('mahasiswa_id')
            ->whereIn('event_type', ['token_duplicate', 'geofence_violation', 'token_expired'])
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('mahasiswa_id')
            ->orderByDesc('total_flags')
            ->take(5)
            ->get()
            ->map(function ($row) {
                $mahasiswa = Mahasiswa::find($row->mahasiswa_id);
                return [
                    'id' => $row->mahasiswa_id,
                    'nama' => $mahasiswa?->nama ?? '-',
                    'nim' => $mahasiswa?->nim ?? '-',
                    'total_flags' => $row->total_flags,
                ];
            });
    }
    
    private function getEventTypes()
    {
        return [
            ['value' => 'all', 'label' => 'Semua Event'],
            ['value' => 'token_expired', 'label' => 'Token Expired'],
            ['value' => 'token_duplicate', 'label' => 'Token Duplikat'],
            ['value' => 'geofence_violation', 'label' => 'Pelanggaran Geofence'],
            ['value' => 'login_failed', 'label' => 'Login Gagal'],
            ['value' => 'login_success', 'label' => 'Login Berhasil'],
            ['value' => 'suspicious_activity', 'label' => 'Aktivitas Mencurigakan'],
            ['value' => 'attendance_success', 'label' => 'Absensi Berhasil'],
            ['value' => 'selfie_uploaded', 'label' => 'Selfie Diupload'],
        ];
    }
}
