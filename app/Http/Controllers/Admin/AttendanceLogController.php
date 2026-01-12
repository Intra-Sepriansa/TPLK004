<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sessionId = $request->query('session_id');

        $query = AttendanceLog::with(['mahasiswa', 'selfieVerification'])
            ->latest('scanned_at')
            ->take(30);

        if ($sessionId) {
            $query->where('attendance_session_id', $sessionId);
        }

        $logs = $query->get()->map(function (AttendanceLog $log) {
            return [
                'id' => $log->id,
                'name' => $log->mahasiswa?->nama ?? 'Mahasiswa',
                'time' => $log->scanned_at?->format('H:i') ?? '-',
                'status' => $log->status,
                'distance_m' => $log->distance_m,
                'selfie_status' => $log->selfieVerification?->status,
            ];
        });

        return response()->json([
            'logs' => $logs,
        ]);
    }
}
