<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\FraudAlert;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FraudDetectionService
{
    // GPS Spoofing detection threshold (meters per second - max human speed ~12 m/s running)
    private const MAX_SPEED_MPS = 50; // Allow for some GPS inaccuracy
    
    // Minimum time between scans from same device (seconds)
    private const MIN_SCAN_INTERVAL = 30;
    
    // Selfie similarity threshold (0-1, 1 = identical)
    private const SELFIE_SIMILARITY_THRESHOLD = 0.95;

    public function analyzeAttendanceLog(AttendanceLog $log): array
    {
        $alerts = [];

        // Check for GPS spoofing
        $gpsAlert = $this->detectGpsSpoofing($log);
        if ($gpsAlert) $alerts[] = $gpsAlert;

        // Check for rapid location change
        $locationAlert = $this->detectRapidLocationChange($log);
        if ($locationAlert) $alerts[] = $locationAlert;

        // Check for duplicate selfie
        $selfieAlert = $this->detectDuplicateSelfie($log);
        if ($selfieAlert) $alerts[] = $selfieAlert;

        // Check for device mismatch
        $deviceAlert = $this->detectDeviceMismatch($log);
        if ($deviceAlert) $alerts[] = $deviceAlert;

        // Check for time anomaly
        $timeAlert = $this->detectTimeAnomaly($log);
        if ($timeAlert) $alerts[] = $timeAlert;

        // Save alerts to database
        foreach ($alerts as $alertData) {
            FraudAlert::create($alertData);
        }

        return $alerts;
    }

    public function detectGpsSpoofing(AttendanceLog $log): ?array
    {
        // Check if location is exactly at common spoofing coordinates
        $spoofingCoordinates = [
            ['lat' => 0, 'lng' => 0],
            ['lat' => -6.2088, 'lng' => 106.8456], // Jakarta center (common default)
        ];

        foreach ($spoofingCoordinates as $coord) {
            if (abs($log->latitude - $coord['lat']) < 0.0001 && 
                abs($log->longitude - $coord['lng']) < 0.0001) {
                return [
                    'mahasiswa_id' => $log->mahasiswa_id,
                    'attendance_log_id' => $log->id,
                    'attendance_session_id' => $log->attendance_session_id,
                    'alert_type' => 'gps_spoofing',
                    'severity' => 'high',
                    'description' => 'Koordinat GPS mencurigakan terdeteksi (kemungkinan GPS spoofing)',
                    'evidence' => [
                        'latitude' => $log->latitude,
                        'longitude' => $log->longitude,
                        'matched_spoofing_coord' => $coord,
                    ],
                ];
            }
        }

        // Check for mock location flag if available
        if ($log->is_mock_location) {
            return [
                'mahasiswa_id' => $log->mahasiswa_id,
                'attendance_log_id' => $log->id,
                'attendance_session_id' => $log->attendance_session_id,
                'alert_type' => 'gps_spoofing',
                'severity' => 'critical',
                'description' => 'Aplikasi mock location terdeteksi aktif',
                'evidence' => [
                    'is_mock_location' => true,
                    'device_info' => $log->device_info,
                ],
            ];
        }

        return null;
    }

    public function detectRapidLocationChange(AttendanceLog $log): ?array
    {
        // Get previous log from same student within last hour
        $previousLog = AttendanceLog::where('mahasiswa_id', $log->mahasiswa_id)
            ->where('id', '!=', $log->id)
            ->where('scanned_at', '>=', now()->subHour())
            ->where('scanned_at', '<', $log->scanned_at)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderByDesc('scanned_at')
            ->first();

        if (!$previousLog || !$log->latitude || !$log->longitude) {
            return null;
        }

        // Calculate distance and time difference
        $distance = $this->calculateDistance(
            $previousLog->latitude, $previousLog->longitude,
            $log->latitude, $log->longitude
        );

        $timeDiff = $log->scanned_at->diffInSeconds($previousLog->scanned_at);
        
        if ($timeDiff <= 0) return null;

        $speed = $distance / $timeDiff; // meters per second

        if ($speed > self::MAX_SPEED_MPS) {
            return [
                'mahasiswa_id' => $log->mahasiswa_id,
                'attendance_log_id' => $log->id,
                'attendance_session_id' => $log->attendance_session_id,
                'alert_type' => 'rapid_location_change',
                'severity' => $speed > 100 ? 'critical' : 'high',
                'description' => sprintf(
                    'Perpindahan lokasi tidak wajar: %.1f km dalam %d detik (%.1f m/s)',
                    $distance / 1000, $timeDiff, $speed
                ),
                'evidence' => [
                    'previous_location' => [
                        'lat' => $previousLog->latitude,
                        'lng' => $previousLog->longitude,
                        'time' => $previousLog->scanned_at->toDateTimeString(),
                    ],
                    'current_location' => [
                        'lat' => $log->latitude,
                        'lng' => $log->longitude,
                        'time' => $log->scanned_at->toDateTimeString(),
                    ],
                    'distance_meters' => $distance,
                    'time_seconds' => $timeDiff,
                    'speed_mps' => $speed,
                ],
            ];
        }

        return null;
    }

    public function detectDuplicateSelfie(AttendanceLog $log): ?array
    {
        if (!$log->selfie_path) return null;

        // Get previous selfies from same student
        $previousLogs = AttendanceLog::where('mahasiswa_id', $log->mahasiswa_id)
            ->where('id', '!=', $log->id)
            ->whereNotNull('selfie_path')
            ->orderByDesc('scanned_at')
            ->take(10)
            ->get();

        foreach ($previousLogs as $prevLog) {
            // Simple file comparison (in production, use image hashing like pHash)
            if ($this->compareSelfies($log->selfie_path, $prevLog->selfie_path)) {
                return [
                    'mahasiswa_id' => $log->mahasiswa_id,
                    'attendance_log_id' => $log->id,
                    'attendance_session_id' => $log->attendance_session_id,
                    'alert_type' => 'duplicate_selfie',
                    'severity' => 'critical',
                    'description' => 'Foto selfie yang sama terdeteksi digunakan pada absensi sebelumnya',
                    'evidence' => [
                        'current_selfie' => $log->selfie_path,
                        'matched_selfie' => $prevLog->selfie_path,
                        'matched_log_id' => $prevLog->id,
                        'matched_date' => $prevLog->scanned_at->toDateTimeString(),
                    ],
                ];
            }
        }

        return null;
    }

    public function detectDeviceMismatch(AttendanceLog $log): ?array
    {
        if (!$log->device_id) return null;

        // Get student's usual devices
        $usualDevices = AttendanceLog::where('mahasiswa_id', $log->mahasiswa_id)
            ->whereNotNull('device_id')
            ->where('scanned_at', '>=', now()->subDays(30))
            ->groupBy('device_id')
            ->select('device_id', DB::raw('COUNT(*) as count'))
            ->orderByDesc('count')
            ->pluck('count', 'device_id')
            ->toArray();

        if (empty($usualDevices)) return null;

        // If this device is new and student has established pattern
        $totalScans = array_sum($usualDevices);
        if ($totalScans >= 5 && !isset($usualDevices[$log->device_id])) {
            return [
                'mahasiswa_id' => $log->mahasiswa_id,
                'attendance_log_id' => $log->id,
                'attendance_session_id' => $log->attendance_session_id,
                'alert_type' => 'device_mismatch',
                'severity' => 'medium',
                'description' => 'Absensi dari perangkat baru yang tidak biasa digunakan',
                'evidence' => [
                    'new_device_id' => $log->device_id,
                    'device_os' => $log->device_os,
                    'usual_devices' => $usualDevices,
                ],
            ];
        }

        return null;
    }

    public function detectTimeAnomaly(AttendanceLog $log): ?array
    {
        $session = $log->session;
        if (!$session) return null;

        // Check if scan is way before session starts (more than 30 min)
        if ($log->scanned_at->lt($session->start_at->subMinutes(30))) {
            return [
                'mahasiswa_id' => $log->mahasiswa_id,
                'attendance_log_id' => $log->id,
                'attendance_session_id' => $log->attendance_session_id,
                'alert_type' => 'time_anomaly',
                'severity' => 'medium',
                'description' => 'Absensi dilakukan jauh sebelum sesi dimulai',
                'evidence' => [
                    'scan_time' => $log->scanned_at->toDateTimeString(),
                    'session_start' => $session->start_at->toDateTimeString(),
                    'minutes_early' => $session->start_at->diffInMinutes($log->scanned_at),
                ],
            ];
        }

        return null;
    }

    public function detectSuspiciousPatterns(int $mahasiswaId): ?array
    {
        // Analyze patterns over last 30 days
        $logs = AttendanceLog::where('mahasiswa_id', $mahasiswaId)
            ->where('scanned_at', '>=', now()->subDays(30))
            ->orderBy('scanned_at')
            ->get();

        if ($logs->count() < 5) return null;

        $suspiciousIndicators = [];

        // Check for always-late pattern at exact same time
        $lateTimes = $logs->where('status', 'late')
            ->map(fn($l) => $l->scanned_at->format('H:i'))
            ->countBy()
            ->filter(fn($count) => $count >= 3);

        if ($lateTimes->isNotEmpty()) {
            $suspiciousIndicators['repeated_late_times'] = $lateTimes->toArray();
        }

        // Check for always scanning at session boundary
        $boundaryScans = 0;
        foreach ($logs as $log) {
            if ($log->session) {
                $diffFromStart = abs($log->scanned_at->diffInSeconds($log->session->start_at));
                if ($diffFromStart <= 60) $boundaryScans++;
            }
        }

        if ($boundaryScans >= 5 && $boundaryScans / $logs->count() > 0.8) {
            $suspiciousIndicators['boundary_scanning'] = [
                'count' => $boundaryScans,
                'percentage' => round(($boundaryScans / $logs->count()) * 100, 1),
            ];
        }

        if (!empty($suspiciousIndicators)) {
            return [
                'mahasiswa_id' => $mahasiswaId,
                'alert_type' => 'suspicious_pattern',
                'severity' => 'medium',
                'description' => 'Pola absensi mencurigakan terdeteksi',
                'evidence' => $suspiciousIndicators,
            ];
        }

        return null;
    }

    public function runFullScan(): array
    {
        $results = [
            'scanned' => 0,
            'alerts_created' => 0,
            'by_type' => [],
        ];

        // Scan recent logs (last 24 hours)
        $logs = AttendanceLog::where('scanned_at', '>=', now()->subDay())
            ->whereDoesntHave('fraudAlerts')
            ->get();

        foreach ($logs as $log) {
            $results['scanned']++;
            $alerts = $this->analyzeAttendanceLog($log);
            $results['alerts_created'] += count($alerts);

            foreach ($alerts as $alert) {
                $type = $alert['alert_type'];
                $results['by_type'][$type] = ($results['by_type'][$type] ?? 0) + 1;
            }
        }

        // Run pattern analysis for active students
        $activeStudents = AttendanceLog::where('scanned_at', '>=', now()->subDays(7))
            ->distinct('mahasiswa_id')
            ->pluck('mahasiswa_id');

        foreach ($activeStudents as $studentId) {
            $patternAlert = $this->detectSuspiciousPatterns($studentId);
            if ($patternAlert) {
                // Check if similar alert exists
                $exists = FraudAlert::where('mahasiswa_id', $studentId)
                    ->where('alert_type', 'suspicious_pattern')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->exists();

                if (!$exists) {
                    FraudAlert::create($patternAlert);
                    $results['alerts_created']++;
                    $results['by_type']['suspicious_pattern'] = 
                        ($results['by_type']['suspicious_pattern'] ?? 0) + 1;
                }
            }
        }

        return $results;
    }

    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // meters

        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLng = deg2rad($lng2 - $lng1);

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($deltaLng / 2) * sin($deltaLng / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    private function compareSelfies(string $path1, string $path2): bool
    {
        // Simple file size comparison as basic check
        // In production, implement proper image hashing (pHash, dHash)
        try {
            $size1 = Storage::disk('public')->size($path1);
            $size2 = Storage::disk('public')->size($path2);
            
            // If file sizes are exactly the same, likely duplicate
            if ($size1 === $size2 && $size1 > 0) {
                // Additional check: compare file hashes
                $hash1 = md5(Storage::disk('public')->get($path1));
                $hash2 = md5(Storage::disk('public')->get($path2));
                
                return $hash1 === $hash2;
            }
        } catch (\Exception $e) {
            // File not found or other error
        }

        return false;
    }
}
