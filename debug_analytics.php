<?php

use App\Models\AttendanceLog;
use Carbon\Carbon;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$period = 'week';
$now = now();
$startDate = $now->copy()->startOfWeek();
$endDate = $now->copy()->endOfWeek();

$logs = AttendanceLog::whereBetween('scanned_at', [$startDate, $endDate])->get();
$totalAttendance = $logs->count();

echo "Date Range: " . $startDate->toDateTimeString() . " to " . $endDate->toDateTimeString() . "\n";
echo "Total Attendance for this period: $totalAttendance\n";

if ($totalAttendance == 0) {
    echo "NO ACTIVITY\n";
} else {
    // Trend
    $duration = $startDate->diffInDays($endDate) + 1;
    $prevStart = $startDate->copy()->subDays($duration);
    $prevEnd = $startDate->copy()->subSeconds(1);
    $prevAttendance = AttendanceLog::whereBetween('scanned_at', [$prevStart, $prevEnd])->count();
    
    if ($prevAttendance > 0) {
        $growth = (($totalAttendance - $prevAttendance) / $prevAttendance) * 100;
        echo "Growth: " . round($growth) . "%\n";
    }

    // Late
    $lateCount = $logs->where('status', 'late')->count();
    $lateRate = ($totalAttendance > 0) ? ($lateCount / $totalAttendance) * 100 : 0;
    echo "Late Rate: " . round($lateRate) . "%\n";

    // Geo
    $farCheckIns = $logs->where('distance_m', '>', 50)->count();
    echo "Far CheckIns: $farCheckIns\n";
}
