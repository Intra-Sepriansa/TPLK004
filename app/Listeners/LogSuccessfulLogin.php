<?php

namespace App\Listeners;

use App\Models\AdminActivityLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogSuccessfulLogin
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        AdminActivityLog::log(
            'login',
            "User  logged in from " . request()->ip(),
            null,
            null,
            null,
            null
        );
    }
}
