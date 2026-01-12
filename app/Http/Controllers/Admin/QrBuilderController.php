<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\AttendanceToken;
use App\Models\Course;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QrBuilderController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSession = AttendanceSession::with('course')
            ->where('is_active', true)
            ->first();

        $tokenTtlSeconds = Setting::getValue('token_ttl_seconds', 180);

        // Get recent tokens for active session
        $recentTokens = [];
        if ($activeSession) {
            $recentTokens = AttendanceToken::where('attendance_session_id', $activeSession->id)
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(fn($token) => [
                    'id' => $token->id,
                    'token' => $token->token,
                    'created_at' => $token->created_at->format('H:i:s'),
                    'expires_at' => $token->expires_at?->format('H:i:s'),
                    'is_expired' => $token->expires_at ? $token->expires_at->isPast() : false,
                    'scan_count' => $token->scan_count ?? 0,
                ]);
        }

        // Get all sessions for selection
        $sessions = AttendanceSession::with('course')
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(fn($session) => [
                'id' => $session->id,
                'title' => $session->title,
                'meeting_number' => $session->meeting_number,
                'course_name' => $session->course?->nama ?? 'Tanpa Mata Kuliah',
                'is_active' => $session->is_active,
                'start_at' => $session->start_at?->format('Y-m-d H:i'),
                'end_at' => $session->end_at?->format('Y-m-d H:i'),
            ]);

        // Token stats
        $tokenStats = [
            'total_generated' => AttendanceToken::count(),
            'total_today' => AttendanceToken::whereDate('created_at', today())->count(),
            'active_tokens' => AttendanceToken::where('expires_at', '>', now())->count(),
            'expired_tokens' => AttendanceToken::where('expires_at', '<=', now())->count(),
        ];

        // Hourly token generation for chart
        $hourlyTokens = AttendanceToken::whereDate('created_at', today())
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('total', 'hour')
            ->toArray();

        $hourlyData = [];
        for ($i = 0; $i < 24; $i++) {
            $hourlyData[] = [
                'hour' => sprintf('%02d:00', $i),
                'tokens' => $hourlyTokens[$i] ?? 0,
            ];
        }

        return Inertia::render('admin/qr-builder', [
            'activeSession' => $activeSession ? [
                'id' => $activeSession->id,
                'title' => $activeSession->title,
                'meeting_number' => $activeSession->meeting_number,
                'course' => $activeSession->course ? [
                    'nama' => $activeSession->course->nama,
                    'sks' => $activeSession->course->sks,
                ] : null,
                'start_at' => $activeSession->start_at?->format('Y-m-d H:i'),
                'end_at' => $activeSession->end_at?->format('Y-m-d H:i'),
            ] : null,
            'tokenTtlSeconds' => (int) $tokenTtlSeconds,
            'recentTokens' => $recentTokens,
            'sessions' => $sessions,
            'tokenStats' => $tokenStats,
            'hourlyData' => $hourlyData,
        ]);
    }
}
