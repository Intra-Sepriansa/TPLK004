<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FraudAlert;
use App\Services\FraudDetectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FraudDetectionController extends Controller
{
    public function __construct(
        private FraudDetectionService $fraudService
    ) {}

    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $severity = $request->get('severity', 'all');
        $type = $request->get('type', 'all');

        $query = FraudAlert::with(['mahasiswa', 'session.course'])
            ->orderByDesc('created_at');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($severity !== 'all') {
            $query->where('severity', $severity);
        }

        if ($type !== 'all') {
            $query->where('alert_type', $type);
        }

        $alerts = $query->paginate(20)->withQueryString();

        // Enhanced Stats
        $stats = [
            'total' => FraudAlert::count(),
            'pending' => FraudAlert::where('status', 'pending')->count(),
            'investigating' => FraudAlert::where('status', 'investigating')->count(),
            'critical' => FraudAlert::where('severity', 'critical')->where('status', 'pending')->count(),
            'confirmed' => FraudAlert::where('status', 'confirmed')->count(),
            'dismissed' => FraudAlert::where('status', 'dismissed')->count(),
            'today' => FraudAlert::whereDate('created_at', today())->count(),
            'this_week' => FraudAlert::where('created_at', '>=', now()->startOfWeek())->count(),
            'resolved_today' => FraudAlert::whereIn('status', ['confirmed', 'dismissed'])
                ->whereDate('reviewed_at', today())->count(),
            'by_type' => FraudAlert::selectRaw('alert_type, COUNT(*) as count')
                ->groupBy('alert_type')
                ->pluck('count', 'alert_type')
                ->toArray(),
            'by_severity' => FraudAlert::selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity')
                ->toArray(),
            'recent_trend' => FraudAlert::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date')
                ->toArray(),
        ];

        // Last scan info
        $lastScan = cache()->get('fraud_last_scan');

        return Inertia::render('admin/fraud-detection', [
            'alerts' => $alerts,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'severity' => $severity,
                'type' => $type,
            ],
            'lastScan' => $lastScan,
        ]);
    }

    public function show(FraudAlert $alert)
    {
        $alert->load(['mahasiswa', 'attendanceLog.session.course', 'session.course']);

        // Get related alerts for same student
        $relatedAlerts = FraudAlert::where('mahasiswa_id', $alert->mahasiswa_id)
            ->where('id', '!=', $alert->id)
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        return Inertia::render('admin/fraud-detection-detail', [
            'alert' => $alert,
            'relatedAlerts' => $relatedAlerts,
        ]);
    }

    public function review(Request $request, FraudAlert $alert)
    {
        $validated = $request->validate([
            'status' => 'required|in:investigating,confirmed,dismissed',
            'notes' => 'nullable|string|max:1000',
        ]);

        $alert->update([
            'status' => $validated['status'],
            'review_notes' => $validated['notes'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Status alert berhasil diperbarui.');
    }

    public function runScan()
    {
        $startTime = microtime(true);
        $results = $this->fraudService->runFullScan();
        $duration = round(microtime(true) - $startTime, 2);

        // Store last scan info in cache
        $scanInfo = [
            'scanned' => $results['scanned'],
            'alerts_created' => $results['alerts_created'],
            'by_type' => $results['by_type'],
            'duration_seconds' => $duration,
            'scanned_at' => now()->toDateTimeString(),
        ];
        cache()->put('fraud_last_scan', $scanInfo, now()->addHours(24));

        return back()->with([
            'success' => sprintf(
                'Scan selesai dalam %.1f detik. %d log diperiksa, %d alert baru ditemukan.',
                $duration,
                $results['scanned'],
                $results['alerts_created']
            ),
            'scanResults' => $scanInfo,
        ]);
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:fraud_alerts,id',
            'action' => 'required|in:dismiss,confirm,investigate',
        ]);

        $statusMap = [
            'dismiss' => 'dismissed',
            'confirm' => 'confirmed',
            'investigate' => 'investigating',
        ];

        FraudAlert::whereIn('id', $validated['ids'])->update([
            'status' => $statusMap[$validated['action']],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', count($validated['ids']) . ' alert berhasil diperbarui.');
    }
}
