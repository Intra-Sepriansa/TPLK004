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
    
    public function show($id)
    {
        $auditLog = AuditLog::with(['mahasiswa', 'session.course.dosen'])
            ->findOrFail($id);
        
        // Get related logs (same user, last 7 days)
        $relatedEvents = AuditLog::with(['mahasiswa', 'session.course'])
            ->where('id', '!=', $id)
            ->where('mahasiswa_id', $auditLog->mahasiswa_id)
            ->where('created_at', '>=', now()->subDays(7))
            ->latest()
            ->take(10)
            ->get();
            
        // Get action history
        $actionHistory = \App\Models\AuditAction::where('audit_log_id', $auditLog->id)
            ->with('actor')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate risk assessment
        $riskAssessment = $this->calculateRiskAssessment($auditLog);

        // Pattern analysis
        $patternAnalysis = $this->analyzePattern($auditLog);
        
        return Inertia::render('admin/audit-detail', [
            'auditLog' => $auditLog,
            'relatedEvents' => $relatedEvents,
            'actionHistory' => $actionHistory,
            'riskAssessment' => $riskAssessment,
            'patternAnalysis' => $patternAnalysis,
        ]);
    }

    private function calculateRiskAssessment($auditLog)
    {
        $historicalViolations = AuditLog::where('mahasiswa_id', $auditLog->mahasiswa_id)
            ->where('severity', 'high')
            ->count();
        
        $likelihood = min(100, ($historicalViolations * 20) + 40);

        $impactScores = [
            'token_duplicate' => 80,
            'geofence_violation' => 60,
            'suspicious_activity' => 70,
            'login_failed' => 40,
        ];
        
        $impact = $impactScores[$auditLog->event_type] ?? 50;

        $overallRisk = ($likelihood + $impact) / 2;

        $riskFactors = [];
        
        if ($historicalViolations > 0) {
            $riskFactors[] = [
                'factor' => 'Previous violations detected',
                'severity' => 'high',
            ];
        }

        if ($auditLog->event_type === 'token_duplicate') {
            $riskFactors[] = [
                'factor' => 'Token reuse detected',
                'severity' => 'critical',
            ];
        }

        return [
            'likelihood' => $likelihood,
            'impact' => $impact,
            'overall_risk' => $overallRisk,
            'risk_factors' => $riskFactors,
        ];
    }

    private function analyzePattern($auditLog)
    {
        $similarIncidents = AuditLog::where('event_type', $auditLog->event_type)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $patternMatch = 0;
        $patternId = null;

        if ($auditLog->event_type === 'token_duplicate') {
            $patternMatch = 85;
            $patternId = 'PTN-2024-0042';
        }

        return [
            'pattern_match' => $patternMatch,
            'pattern_id' => $patternId,
            'similar_incidents' => $similarIncidents,
        ];
    }

    public function executeAction(Request $request, $id)
    {
        $validated = $request->validate([
            'action_type' => 'required|string',
            'description' => 'nullable|string',
            'notify' => 'nullable|array',
        ]);

        $auditLog = AuditLog::findOrFail($id);
        $oldStatus = $auditLog->status;

        // Example logic, can be expanded to actually call services
        switch ($validated['action_type']) {
            case 'block_user':
                // block user log
                break;
            case 'void_attendance':
                // void attendance logic
                break;
            case 'flag_device':
                // flag device logic
                break;
            case 'send_warning':
                // send email logic
                break;
            case 'escalate':
                $auditLog->status = 'investigating';
                break;
            case 'resolve':
                $auditLog->status = 'resolved';
                $auditLog->security_score = min(100, $auditLog->security_score + 20);
                $auditLog->threat_level = 'safe';
                break;
            default:
                // Just a note
                break;
        }
        
        if ($auditLog->isDirty()) {
             $auditLog->save();
             
             // Broadcast status update
             broadcast(new \App\Events\SecurityEventUpdated(
                 $auditLog->id, 
                 $auditLog->security_score, 
                 $auditLog->threat_level
             ));
        }

        // Log action
        $action = \App\Models\AuditAction::create([
            'audit_log_id' => $auditLog->id,
            'action_type' => $validated['action_type'],
            'description' => $validated['description'],
            'actor_id' => auth()->id(),
        ]);
        
        // Broadcast custom action executed
        broadcast(new \App\Events\ActionExecuted($auditLog->id, $action->load('actor'), $auditLog->status));

        return redirect()->back()->with('success', 'Action executed successfully');
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
            'tanggal' => now()->timezone('Asia/Jakarta')->translatedFormat('d F Y'),
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
