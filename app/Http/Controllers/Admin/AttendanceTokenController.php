<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\AttendanceToken;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttendanceTokenController extends Controller
{
    public function store(Request $request, AttendanceSession $attendanceSession): JsonResponse
    {
        if (! $attendanceSession->is_active) {
            return response()->json([
                'message' => 'Sesi belum aktif.',
            ], 422);
        }

        $ttl = (int) Setting::getValue('token_ttl_seconds', '180');
        $now = now();
        $forceRefresh = $request->boolean('force');

        if ($forceRefresh) {
            AttendanceToken::query()
                ->where('attendance_session_id', $attendanceSession->id)
                ->where('expires_at', '>', $now)
                ->update(['expires_at' => $now]);
        }

        $token = null;
        if (! $forceRefresh) {
            $token = AttendanceToken::query()
                ->where('attendance_session_id', $attendanceSession->id)
                ->where('expires_at', '>', $now)
                ->latest()
                ->first();
        }

        if (! $token) {
            $token = AttendanceToken::create([
                'attendance_session_id' => $attendanceSession->id,
                'token' => Str::upper(Str::random(20)),
                'expires_at' => $now->copy()->addSeconds($ttl),
            ]);
        }

        return response()->json([
            'token' => $token->token,
            'expires_at' => $token->expires_at->toIso8601String(),
            'expires_at_ts' => $token->expires_at->getTimestamp(),
            'ttl_seconds' => $ttl,
        ]);
    }
}
