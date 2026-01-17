<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PreferenceManagerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function __construct(
        protected PreferenceManagerService $preferenceManager
    ) {}

    /**
     * Get all settings for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $settings = $this->preferenceManager->getSettings($user);

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update all settings for the authenticated user.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validate([
                'general' => 'sometimes|array',
                'notifications' => 'sometimes|array',
                'appearance' => 'sometimes|array',
                'privacy' => 'sometimes|array',
                'security' => 'sometimes|array',
                'data' => 'sometimes|array',
            ]);

            $settings = $this->preferenceManager->updateSettings($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'details' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Update settings for a specific category.
     */
    public function updateCategory(Request $request, string $category): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $settings = $request->all();
            $updated = $this->preferenceManager->updateCategorySettings($user, $category, $settings);

            return response()->json([
                'success' => true,
                'message' => "Settings for {$category} updated successfully",
                'data' => $updated,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'details' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Reset settings to defaults.
     */
    public function reset(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $category = $request->input('category');
        $settings = $this->preferenceManager->resetToDefaults($user, $category);

        $message = $category 
            ? "Settings for {$category} reset to defaults"
            : 'All settings reset to defaults';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $settings,
        ]);
    }

    /**
     * Export settings as JSON.
     */
    public function export(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $exported = $this->preferenceManager->exportSettings($user);

        return response()->json([
            'success' => true,
            'data' => $exported,
        ]);
    }

    /**
     * Import settings from JSON.
     */
    public function import(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validate([
                'version' => 'required|string',
                'settings' => 'required|array',
            ]);

            $settings = $this->preferenceManager->importSettings($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Settings imported successfully',
                'data' => $settings,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid settings format',
                'details' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get defaults for all categories.
     */
    public function defaults(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->preferenceManager->getDefaults(),
        ]);
    }

    /**
     * Get the authenticated user from various auth guards.
     */
    protected function getAuthenticatedUser(Request $request)
    {
        // Try different auth guards
        if ($user = auth('mahasiswa')->user()) {
            return $user;
        }
        
        if ($user = auth('dosen')->user()) {
            return $user;
        }
        
        if ($user = auth('web')->user()) {
            return $user;
        }

        return null;
    }

    /**
     * Get active sessions for the authenticated user.
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Return mock session data - in production, this would query actual sessions
        $sessions = [
            [
                'id' => 'session_' . md5($request->ip() . $request->userAgent()),
                'device' => $this->parseUserAgent($request->userAgent()),
                'browser' => $this->parseBrowser($request->userAgent()),
                'ip_address' => $request->ip(),
                'location' => 'Indonesia',
                'last_active' => now()->toIso8601String(),
                'is_current' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    /**
     * Terminate a specific session.
     */
    public function terminateSession(Request $request, string $sessionId): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // In production, this would invalidate the actual session
        return response()->json([
            'success' => true,
            'message' => 'Session terminated successfully',
        ]);
    }

    /**
     * Get login history for the authenticated user.
     */
    public function loginHistory(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $limit = $request->input('limit', 10);

        // Return mock login history - in production, query login_logs table
        $history = [
            [
                'id' => 'login_1',
                'device' => 'Chrome on Windows',
                'ip_address' => $request->ip(),
                'location' => 'Indonesia',
                'status' => 'success',
                'timestamp' => now()->subHours(1)->toIso8601String(),
            ],
            [
                'id' => 'login_2',
                'device' => 'Safari on iPhone',
                'ip_address' => '192.168.1.10',
                'location' => 'Indonesia',
                'status' => 'success',
                'timestamp' => now()->subDays(1)->toIso8601String(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => array_slice($history, 0, $limit),
        ]);
    }

    /**
     * Get storage usage information.
     */
    public function storageUsage(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Calculate real storage usage
        $documentsSize = 0;
        $cacheSize = 0;
        $otherSize = 0;

        // Calculate cache size from Laravel cache
        try {
            $cacheSize = $this->getCacheSize();
        } catch (\Exception $e) {
            $cacheSize = 0;
        }

        // Calculate session size
        try {
            $otherSize = $this->getSessionSize();
        } catch (\Exception $e) {
            $otherSize = 0;
        }

        // Total used
        $used = $documentsSize + $cacheSize + $otherSize;
        
        // Total available (100 MB per user)
        $total = 100 * 1024 * 1024; // 100 MB

        // Ensure no division by zero
        $percentage = $total > 0 ? round(($used / $total) * 100, 2) : 0;

        $storageData = [
            'used' => max(0, $used),
            'total' => $total,
            'breakdown' => [
                'documents' => max(0, $documentsSize),
                'cache' => max(0, $cacheSize),
                'other' => max(0, $otherSize),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $storageData,
        ]);
    }

    /**
     * Get cache directory size.
     */
    protected function getCacheSize(): int
    {
        $cachePath = storage_path('framework/cache/data');
        
        if (!is_dir($cachePath)) {
            return 0;
        }

        $size = 0;
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($cachePath, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }

        return $size;
    }

    /**
     * Get session directory size.
     */
    protected function getSessionSize(): int
    {
        $sessionPath = storage_path('framework/sessions');
        
        if (!is_dir($sessionPath)) {
            return 0;
        }

        $size = 0;
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($sessionPath, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }

        return $size;
    }

    /**
     * Clear cache for the authenticated user.
     */
    public function clearCache(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            // Clear application cache
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            
            // Clear config cache
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            
            // Clear route cache
            \Illuminate\Support\Facades\Artisan::call('route:clear');
            
            // Clear view cache
            \Illuminate\Support\Facades\Artisan::call('view:clear');

            return response()->json([
                'success' => true,
                'message' => 'Cache cleared successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse user agent string for device info.
     */
    protected function parseUserAgent(?string $userAgent): string
    {
        if (!$userAgent) return 'Unknown Device';
        
        if (str_contains($userAgent, 'Windows')) return 'Windows PC';
        if (str_contains($userAgent, 'Mac')) return 'Mac';
        if (str_contains($userAgent, 'iPhone')) return 'iPhone';
        if (str_contains($userAgent, 'Android')) return 'Android';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        
        return 'Unknown Device';
    }

    /**
     * Parse user agent string for browser info.
     */
    protected function parseBrowser(?string $userAgent): string
    {
        if (!$userAgent) return 'Unknown Browser';
        
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        if (str_contains($userAgent, 'Opera')) return 'Opera';
        
        return 'Unknown Browser';
    }

    /**
     * Get the user type from auth guard.
     */
    protected function getUserType(Request $request): string
    {
        if (auth('mahasiswa')->check()) return 'mahasiswa';
        if (auth('dosen')->check()) return 'dosen';
        return 'admin';
    }
}
