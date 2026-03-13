<?php

namespace App\Services;

use App\Models\AttendanceSession;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class AttendanceSessionAutomationService
{
    public function syncActiveStates(?CarbonInterface $currentTime = null): void
    {
        $now = $currentTime?->copy() ?? now();

        AttendanceSession::where('is_active', true)
            ->where(function ($q) {
                $q->where('metode', '!=', 'offline')
                  ->orWhereNull('metode')
                  ->orWhereRaw('LOWER(title) LIKE ?', ['%online%']);
            })
            ->update(['is_active' => false, 'updated_at' => $now]); // Added updated_at

        // Auto-activate: Only for offline sessions
        AttendanceSession::where('is_active', false)
            ->where('metode', 'offline')
            ->whereRaw('LOWER(title) NOT LIKE ?', ['%online%'])
            ->where('start_at', '<=', $now) // Changed now() to $now
            ->where('end_at', '>=', $now) // Changed now() to $now
            ->where(function ($query) {
                $query->whereDoesntHave('logs')
                      ->orWhereExists(function ($sub) {
                          $sub->select(DB::raw(1))
                              ->from('attendance_sessions as active')
                              ->whereColumn('active.id', 'attendance_sessions.id')
                              ->where('active.is_active', true);
                      });
            })
            ->update(['is_active' => true, 'updated_at' => $now]); // Added updated_at

        // Deactivate sessions that have ended
        AttendanceSession::where('is_active', true)
            ->where('end_at', '<', $now)
            ->update([
                'is_active' => false,
                'updated_at' => $now,
            ]);
    }

    public function isSessionOpen(?AttendanceSession $session, ?CarbonInterface $currentTime = null): bool
    {
        if (! $session) {
            return false;
        }

        $now = $currentTime?->copy() ?? now();

        if ($session->is_active) {
            return ! $session->end_at || $session->end_at->greaterThanOrEqualTo($now);
        }

        if (! $session->start_at) {
            return false;
        }

        return $session->start_at->lessThanOrEqualTo($now)
            && (! $session->end_at || $session->end_at->greaterThanOrEqualTo($now));
    }
}
