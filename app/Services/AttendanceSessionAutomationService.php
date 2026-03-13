<?php

namespace App\Services;

use App\Models\AttendanceSession;
use Carbon\CarbonInterface;

class AttendanceSessionAutomationService
{
    public function syncActiveStates(?CarbonInterface $currentTime = null): void
    {
        $now = $currentTime?->copy() ?? now();

        AttendanceSession::query()
            ->where('is_active', false)
            ->where('start_at', '<=', $now)
            ->where('end_at', '>=', $now)
            ->update([
                'is_active' => true,
                'updated_at' => $now,
            ]);

        AttendanceSession::query()
            ->where('is_active', true)
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
