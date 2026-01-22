<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdvancedAnalyticsService;
use App\Models\AnalyticsEvent;
use App\Models\DailyMetric;
use App\Models\Prediction;
use App\Models\Anomaly;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        private AdvancedAnalyticsService $analyticsService
    ) {}

    public function dashboard()
    {
        $stats = $this->analyticsService->getDashboardStats();

        return Inertia::render('Admin/Analytics/Dashboard', [
            'stats' => $stats,
        ]);
    }

    public function events(Request $request)
    {
        $query = AnalyticsEvent::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $events = $query->paginate(50);

        return Inertia::render('Admin/Analytics/Events', [
            'events' => $events,
            'filters' => $request->only(['event_type', 'date_from', 'date_to']),
        ]);
    }

    public function metrics(Request $request)
    {
        $metricType = $request->get('metric_type', 'attendance_rate');
        $days = $request->get('days', 30);

        $metrics = DailyMetric::where('metric_type', $metricType)
            ->where('date', '>=', now()->subDays($days))
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Analytics/Metrics', [
            'metrics' => $metrics,
            'metric_type' => $metricType,
            'days' => $days,
        ]);
    }

    public function predictions()
    {
        $predictions = Prediction::with('subject')
            ->orderBy('prediction_date', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Analytics/Predictions', [
            'predictions' => $predictions,
        ]);
    }

    public function anomalies(Request $request)
    {
        $query = Anomaly::with(['subject', 'resolver'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        $anomalies = $query->paginate(20);

        return Inertia::render('Admin/Analytics/Anomalies', [
            'anomalies' => $anomalies,
            'filters' => $request->only(['status', 'severity']),
        ]);
    }

    public function resolveAnomaly(Request $request, Anomaly $anomaly)
    {
        $validated = $request->validate([
            'resolution_notes' => 'required|string',
        ]);

        $anomaly->resolve(auth()->user(), $validated['resolution_notes']);

        return redirect()->back()->with('success', 'Anomaly resolved');
    }

    public function markAsFalsePositive(Request $request, Anomaly $anomaly)
    {
        $validated = $request->validate([
            'resolution_notes' => 'required|string',
        ]);

        $anomaly->markAsFalsePositive(auth()->user(), $validated['resolution_notes']);

        return redirect()->back()->with('success', 'Marked as false positive');
    }

    public function investigateAnomaly(Anomaly $anomaly)
    {
        $anomaly->investigate();

        return redirect()->back()->with('success', 'Anomaly marked as investigating');
    }

    public function generateReport(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after:date_from',
            'metrics' => 'required|array',
        ]);

        // Generate comprehensive report
        $report = [];

        foreach ($validated['metrics'] as $metricType) {
            $report[$metricType] = DailyMetric::where('metric_type', $metricType)
                ->whereBetween('date', [$validated['date_from'], $validated['date_to']])
                ->orderBy('date')
                ->get();
        }

        return response()->json([
            'report' => $report,
            'period' => [
                'from' => $validated['date_from'],
                'to' => $validated['date_to'],
            ],
        ]);
    }
}
