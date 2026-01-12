<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PerangkatController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        
        // OS Distribution
        $osDistribution = $this->getOsDistribution($dateFrom, $dateTo);
        
        // Device Type Distribution
        $deviceTypeDistribution = $this->getDeviceTypeDistribution($dateFrom, $dateTo);
        
        // Device Model Distribution
        $deviceModelDistribution = $this->getDeviceModelDistribution($dateFrom, $dateTo);
        
        // Statistics
        $stats = $this->getStats($dateFrom, $dateTo);
        
        // Daily device usage trend
        $dailyTrend = $this->getDailyDeviceTrend($dateFrom, $dateTo);
        
        // Recent device logs
        $recentLogs = AttendanceLog::with(['mahasiswa'])
            ->whereNotNull('device_os')
            ->whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('scanned_at', 'desc')
            ->take(20)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'mahasiswa' => $log->mahasiswa?->nama ?? '-',
                'nim' => $log->mahasiswa?->nim ?? '-',
                'device_os' => $log->device_os ?? '-',
                'device_model' => $log->device_model ?? '-',
                'device_type' => $log->device_type ?? '-',
                'scanned_at' => $log->scanned_at?->format('d/m/Y H:i'),
            ]);
        
        // Top devices by usage
        $topDevices = $this->getTopDevices($dateFrom, $dateTo);
        
        // Browser/App distribution (if available)
        $browserDistribution = $this->getBrowserDistribution($dateFrom, $dateTo);
        
        return Inertia::render('admin/perangkat', [
            'osDistribution' => $osDistribution,
            'deviceTypeDistribution' => $deviceTypeDistribution,
            'deviceModelDistribution' => $deviceModelDistribution,
            'stats' => $stats,
            'dailyTrend' => $dailyTrend,
            'recentLogs' => $recentLogs,
            'topDevices' => $topDevices,
            'browserDistribution' => $browserDistribution,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
    
    public function exportPdf(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        
        $osDistribution = $this->getOsDistribution($dateFrom, $dateTo);
        $deviceTypeDistribution = $this->getDeviceTypeDistribution($dateFrom, $dateTo);
        $stats = $this->getStats($dateFrom, $dateTo);
        $topDevices = $this->getTopDevices($dateFrom, $dateTo);
        
        $data = [
            'osDistribution' => $osDistribution,
            'deviceTypeDistribution' => $deviceTypeDistribution,
            'stats' => $stats,
            'topDevices' => $topDevices,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'tanggal' => now()->format('d F Y'),
            'tempat' => 'Tangerang Selatan',
            'logoUnpam' => public_path('logo-unpam.png'),
            'logoSasmita' => public_path('sasmita.png'),
        ];
        
        $pdf = Pdf::loadView('pdf.perangkat', $data);
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf->download('Laporan_Perangkat_' . $dateFrom . '_' . $dateTo . '.pdf');
    }
    
    private function getOsDistribution($dateFrom, $dateTo)
    {
        return AttendanceLog::select('device_os', DB::raw('count(*) as total'))
            ->whereNotNull('device_os')
            ->whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('device_os')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'name' => $item->device_os,
                'value' => $item->total,
            ]);
    }
    
    private function getDeviceTypeDistribution($dateFrom, $dateTo)
    {
        return AttendanceLog::select('device_type', DB::raw('count(*) as total'))
            ->whereNotNull('device_type')
            ->whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('device_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'name' => $item->device_type ?: 'Unknown',
                'value' => $item->total,
            ]);
    }
    
    private function getDeviceModelDistribution($dateFrom, $dateTo)
    {
        return AttendanceLog::select('device_model', DB::raw('count(*) as total'))
            ->whereNotNull('device_model')
            ->whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('device_model')
            ->orderByDesc('total')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'name' => $item->device_model ?: 'Unknown',
                'value' => $item->total,
            ]);
    }
    
    private function getStats($dateFrom, $dateTo)
    {
        $baseQuery = fn() => AttendanceLog::whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
        
        $totalScans = $baseQuery()->count();
        $uniqueDevices = $baseQuery()->whereNotNull('device_model')->distinct('device_model')->count('device_model');
        $androidCount = $baseQuery()->where('device_os', 'like', '%Android%')->count();
        $iosCount = $baseQuery()->where('device_os', 'like', '%iOS%')->count();
        $otherCount = $totalScans - $androidCount - $iosCount;
        
        $mobileCount = $baseQuery()->where('device_type', 'mobile')->count();
        $tabletCount = $baseQuery()->where('device_type', 'tablet')->count();
        $desktopCount = $baseQuery()->where('device_type', 'desktop')->count();
        
        return [
            'total_scans' => $totalScans,
            'unique_devices' => $uniqueDevices,
            'android_count' => $androidCount,
            'ios_count' => $iosCount,
            'other_count' => $otherCount,
            'mobile_count' => $mobileCount,
            'tablet_count' => $tabletCount,
            'desktop_count' => $desktopCount,
            'android_percentage' => $totalScans > 0 ? round(($androidCount / $totalScans) * 100, 1) : 0,
            'ios_percentage' => $totalScans > 0 ? round(($iosCount / $totalScans) * 100, 1) : 0,
        ];
    }
    
    private function getDailyDeviceTrend($dateFrom, $dateTo)
    {
        $data = AttendanceLog::selectRaw('DATE(scanned_at) as date, device_os, count(*) as total')
            ->whereNotNull('device_os')
            ->whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('date', 'device_os')
            ->orderBy('date')
            ->get();
        
        $labels = [];
        $androidData = [];
        $iosData = [];
        $otherData = [];
        
        $start = \Carbon\Carbon::parse($dateFrom);
        $end = \Carbon\Carbon::parse($dateTo);
        
        while ($start <= $end) {
            $dateKey = $start->toDateString();
            $labels[] = $start->format('d/m');
            
            $dayData = $data->where('date', $dateKey);
            $androidData[] = (int) $dayData->filter(fn($d) => str_contains($d->device_os, 'Android'))->sum('total');
            $iosData[] = (int) $dayData->filter(fn($d) => str_contains($d->device_os, 'iOS'))->sum('total');
            $otherData[] = (int) $dayData->filter(fn($d) => !str_contains($d->device_os, 'Android') && !str_contains($d->device_os, 'iOS'))->sum('total');
            
            $start->addDay();
        }
        
        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Android', 'data' => $androidData, 'color' => '#22c55e'],
                ['label' => 'iOS', 'data' => $iosData, 'color' => '#3b82f6'],
                ['label' => 'Lainnya', 'data' => $otherData, 'color' => '#94a3b8'],
            ],
        ];
    }
    
    private function getTopDevices($dateFrom, $dateTo)
    {
        return AttendanceLog::select('device_model', 'device_os', DB::raw('count(*) as usage_count'))
            ->whereNotNull('device_model')
            ->whereBetween('scanned_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('device_model', 'device_os')
            ->orderByDesc('usage_count')
            ->take(10)
            ->get()
            ->map(fn($item) => [
                'model' => $item->device_model,
                'os' => $item->device_os,
                'count' => $item->usage_count,
            ]);
    }
    
    private function getBrowserDistribution($dateFrom, $dateTo)
    {
        // This would require browser info to be stored
        // For now, return empty array
        return [];
    }
}
