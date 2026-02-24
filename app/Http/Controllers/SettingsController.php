<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        $user = Auth::user();
        
        return response()->json([
            'general' => [
                'language' => $user->language ?? 'id',
                'timezone' => $user->timezone ?? 'Asia/Jakarta',
                'dateFormat' => $user->date_format ?? 'DD/MM/YYYY',
            ],
            'appearance' => [
                'theme' => $user->theme_preference ?? 'light',
                'sidebarPosition' => $user->sidebar_position ?? 'left',
                'compactMode' => $user->compact_mode ?? false,
            ],
            'notifications' => [
                'email' => json_decode($user->email_notifications ?? '{}', true),
                'push' => json_decode($user->push_notifications ?? '{}', true),
                'sound' => $user->notification_sound ?? true,
            ],
            'privacy' => [
                'profileVisibility' => $user->profile_visibility ?? 'students',
                'showEmail' => $user->show_email ?? false,
                'showPhone' => $user->show_phone ?? false,
            ],
        ]);
    }

    /**
     * Update general settings
     */
    public function updateGeneral(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'nullable|in:id,en',
            'timezone' => 'nullable|string',
            'dateFormat' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $user->update($request->only(['language', 'timezone', 'dateFormat']));

        return response()->json([
            'success' => true,
            'message' => 'General settings updated successfully',
        ]);
    }

    /**
     * Update theme
     */
    public function updateTheme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme' => 'required|in:light,dark,auto',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        // Fallback to storing JSON if column 'theme_preference' is not strictly migrated, though we assume user logic for update exists.
        $user->update(['theme_preference' => $request->theme]);

        return response()->json([
            'success' => true,
            'message' => 'Theme updated successfully',
            'theme' => $request->theme,
        ]);
    }

    /**
     * Reset settings to default
     */
    public function reset()
    {
        $user = Auth::user();
        
        $user->update([
            'language' => 'id',
            'timezone' => 'Asia/Jakarta',
            'date_format' => 'DD/MM/YYYY',
            'theme_preference' => 'light',
            'sidebar_position' => 'left',
            'compact_mode' => false,
            'email_notifications' => json_encode([]),
            'push_notifications' => json_encode([]),
            'notification_sound' => true,
            'profile_visibility' => 'students',
            'show_email' => false,
            'show_phone' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Settings reset to default',
        ]);
    }

    /**
     * Clear cache
     */
    public function clearCache()
    {
        Cache::flush();
        
        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully',
        ]);
    }

    /**
     * Import settings
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'general' => 'nullable|array',
            'appearance' => 'nullable|array',
            'notifications' => 'nullable|array',
            'privacy' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        
        // Update settings from imported data
        if ($request->has('general')) {
            $user->update([
                'language' => $request->input('general.language'),
                'timezone' => $request->input('general.timezone'),
                'date_format' => $request->input('general.dateFormat'),
            ]);
        }

        if ($request->has('appearance')) {
            $user->update([
                'theme_preference' => $request->input('appearance.theme'),
                'sidebar_position' => $request->input('appearance.sidebarPosition'),
                'compact_mode' => $request->input('appearance.compactMode'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings imported successfully',
        ]);
    }
}
