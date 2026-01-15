<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZonaController extends Controller
{
    public function index(Request $request): Response
    {
        $geofence = [
            'lat' => (float) Setting::getValue('geofence_lat', -6.3441),
            'lng' => (float) Setting::getValue('geofence_lng', 106.7349),
            'radius_m' => (int) Setting::getValue('geofence_radius_m', 100),
        ];

        // Geofence violation stats
        $violationStats = [
            'total_violations' => AttendanceLog::where('distance_m', '>', $geofence['radius_m'])->count(),
            'today_violations' => AttendanceLog::where('distance_m', '>', $geofence['radius_m'])
                ->whereDate('scanned_at', today())->count(),
            'week_violations' => AttendanceLog::where('distance_m', '>', $geofence['radius_m'])
                ->whereDate('scanned_at', '>=', now()->subDays(7))->count(),
            'avg_distance' => round(AttendanceLog::whereNotNull('distance_m')->avg('distance_m') ?? 0, 1),
        ];

        // Distance distribution
        $distanceRanges = [
            ['label' => '0-50m', 'min' => 0, 'max' => 50],
            ['label' => '50-100m', 'min' => 50, 'max' => 100],
            ['label' => '100-200m', 'min' => 100, 'max' => 200],
            ['label' => '200-500m', 'min' => 200, 'max' => 500],
            ['label' => '>500m', 'min' => 500, 'max' => 999999],
        ];

        $distanceDistribution = [];
        foreach ($distanceRanges as $range) {
            $count = AttendanceLog::whereNotNull('distance_m')
                ->where('distance_m', '>=', $range['min'])
                ->where('distance_m', '<', $range['max'])
                ->count();
            $distanceDistribution[] = [
                'range' => $range['label'],
                'count' => $count,
            ];
        }

        // Recent violations
        $recentViolations = AttendanceLog::with(['mahasiswa', 'session.course'])
            ->where('distance_m', '>', $geofence['radius_m'])
            ->orderBy('scanned_at', 'desc')
            ->take(20)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'mahasiswa' => $log->mahasiswa?->nama ?? 'Unknown',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'distance_m' => $log->distance_m,
                'course' => $log->session?->course?->nama ?? '-',
                'scanned_at' => $log->scanned_at?->format('Y-m-d H:i:s'),
                'lat' => $log->latitude,
                'lng' => $log->longitude,
            ]);

        // Daily violation trend
        $dailyViolations = AttendanceLog::where('distance_m', '>', $geofence['radius_m'])
            ->whereDate('scanned_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(scanned_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('total', 'date')
            ->toArray();

        $trendData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $trendData[] = [
                'date' => now()->subDays($i)->format('d M'),
                'violations' => $dailyViolations[$date] ?? 0,
            ];
        }

        // Recent scan locations for map
        $recentLocations = AttendanceLog::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('scanned_at', 'desc')
            ->take(100)
            ->get()
            ->map(fn($log) => [
                'lat' => $log->latitude,
                'lng' => $log->longitude,
                'distance_m' => $log->distance_m,
                'is_violation' => $log->distance_m > $geofence['radius_m'],
            ]);

        return Inertia::render('admin/zona', [
            'geofence' => $geofence,
            'violationStats' => $violationStats,
            'distanceDistribution' => $distanceDistribution,
            'recentViolations' => $recentViolations,
            'trendData' => $trendData,
            'recentLocations' => $recentLocations,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'geofence_lat' => 'required|numeric',
            'geofence_lng' => 'required|numeric',
            'geofence_radius_m' => 'required|integer|min:10|max:5000',
        ]);

        try {
            Setting::setValue('geofence_lat', (string) $validated['geofence_lat']);
            Setting::setValue('geofence_lng', (string) $validated['geofence_lng']);
            Setting::setValue('geofence_radius_m', (string) $validated['geofence_radius_m']);

            return back()->with('success', 'Zona geofence berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan: ' . $e->getMessage());
        }
    }
}
