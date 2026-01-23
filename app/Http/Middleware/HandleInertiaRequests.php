<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get dosen if authenticated via dosen guard
        $dosen = null;
        if (auth()->guard('dosen')->check()) {
            $dosenUser = auth()->guard('dosen')->user();
            $dosen = [
                'id' => $dosenUser->id,
                'nama' => $dosenUser->nama,
                'nidn' => $dosenUser->nidn,
                'email' => $dosenUser->email,
                'avatar_url' => $dosenUser->avatar_url,
                'initials' => $dosenUser->initials,
            ];
        }

        // Get mahasiswa if authenticated via mahasiswa guard
        $mahasiswa = null;
        if (auth()->guard('mahasiswa')->check()) {
            $mahasiswaUser = auth()->guard('mahasiswa')->user();
            $mahasiswa = [
                'id' => $mahasiswaUser->id,
                'nama' => $mahasiswaUser->nama,
                'nim' => $mahasiswaUser->nim,
                'email' => $mahasiswaUser->email,
                'avatar_url' => $mahasiswaUser->avatar_url,
                'initials' => $mahasiswaUser->initials ?? strtoupper(substr($mahasiswaUser->nama, 0, 2)),
            ];
        }

        // Get theme preference from authenticated user
        $themePreference = 'light'; // default
        if ($request->user()) {
            $themePreference = $request->user()->theme_preference ?? 'light';
        } elseif (auth()->guard('mahasiswa')->check()) {
            $themePreference = auth()->guard('mahasiswa')->user()->theme_preference ?? 'light';
        } elseif (auth()->guard('dosen')->check()) {
            $themePreference = auth()->guard('dosen')->user()->theme_preference ?? 'light';
        }

        // Get header notifications based on authenticated user type
        $headerNotifications = null;
        $notificationConfig = null;
        
        // Temporarily disabled notifications until app_notifications table is created
        /*
        if (auth()->guard('mahasiswa')->check()) {
            $mahasiswa = auth()->guard('mahasiswa')->user();
            $notifications = AppNotification::forUser('mahasiswa', $mahasiswa->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $unreadCount = AppNotification::forUser('mahasiswa', $mahasiswa->id)->unread()->count();
            
            $headerNotifications = [
                'items' => $notifications,
                'unreadCount' => $unreadCount,
            ];
            $notificationConfig = [
                'baseUrl' => '/user/notifications',
                'allUrl' => '/user/notifications',
            ];
        } elseif (auth()->guard('dosen')->check()) {
            $dosenUser = auth()->guard('dosen')->user();
            $notifications = AppNotification::forUser('dosen', $dosenUser->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $unreadCount = AppNotification::forUser('dosen', $dosenUser->id)->unread()->count();
            
            $headerNotifications = [
                'items' => $notifications,
                'unreadCount' => $unreadCount,
            ];
            $notificationConfig = [
                'baseUrl' => '/dosen/notifications',
                'allUrl' => '/dosen/notifications',
            ];
        } elseif ($request->user()) {
            // Admin user
            $notifications = AppNotification::forUser('admin', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $unreadCount = AppNotification::forUser('admin', $request->user()->id)->unread()->count();
            
            $headerNotifications = [
                'items' => $notifications,
                'unreadCount' => $unreadCount,
            ];
            $notificationConfig = [
                'baseUrl' => '/admin/notifications',
                'allUrl' => '/admin/notification-center',
            ];
        }
        */

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'dosen' => $dosen,
            'mahasiswa' => $mahasiswa,
            'themePreference' => $themePreference,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'headerNotifications' => $headerNotifications,
            'notificationConfig' => $notificationConfig,
        ];
    }
}
