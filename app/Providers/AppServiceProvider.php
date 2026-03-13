<?php

namespace App\Providers;

use App\Models\AppNotification;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') !== 'local') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Explicit model binding for notifications
        Route::model('notification', AppNotification::class);

        RateLimiter::for('weekly-digest-write', function (Request $request) {
            $identifier = auth()->guard('web')->id() ?: $request->ip();

            return Limit::perMinute(10)->by($identifier);
        });

        // Register AdminActivityObserver
        \App\Models\User::observe(\App\Observers\AdminActivityObserver::class);
        \App\Models\Mahasiswa::observe(\App\Observers\AdminActivityObserver::class);
        \App\Models\Dosen::observe(\App\Observers\AdminActivityObserver::class);
        \App\Models\Course::observe(\App\Observers\AdminActivityObserver::class);
        \App\Models\MataKuliah::observe(\App\Observers\AdminActivityObserver::class);
        \App\Models\Schedule::observe(\App\Observers\AdminActivityObserver::class);
        \App\Models\Setting::observe(\App\Observers\AdminActivityObserver::class);

        // Register Login Event Listener
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Login::class,
            \App\Listeners\LogSuccessfulLogin::class
        );
    }
}
