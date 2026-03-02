<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Services\PreferenceManagerService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        $settings = $this->preferenceManager->getSettings($user);

        return response()->json([
            'success' => true,
            'data' => $this->transformSettingsForFrontend($settings),
        ]);
    }

    /**
     * Update all settings for the authenticated user.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        try {
            $validated = $request->validate([
                'general' => 'sometimes|array',
                'notifications' => 'sometimes|array',
                'appearance' => 'sometimes|array',
                'privacy' => 'sometimes|array',
                'security' => 'sometimes|array',
                'data' => 'sometimes|array',
                'dataManagement' => 'sometimes|array',
            ]);

            $normalized = $this->normalizeSettingsPayload($validated);
            $settings = $this->preferenceManager->updateSettings($user, $normalized);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $this->transformSettingsForFrontend($settings),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pengaturan gagal',
                'details' => $e->errors(),
                'code' => 'SETTINGS_VALIDATION_FAILED',
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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        try {
            $normalizedCategory = $this->normalizeCategoryName($category);
            $settings = $request->all();

            if (
                $normalizedCategory === 'appearance' &&
                array_key_exists('theme', $settings)
            ) {
                $settings['theme'] = $this->normalizeThemeValue(
                    $settings['theme'] ?? null
                );
            }

            $updated = $this->preferenceManager->updateCategorySettings($user, $normalizedCategory, $settings);

            return response()->json([
                'success' => true,
                'message' => "Settings for {$normalizedCategory} updated successfully",
                'data' => $this->transformCategorySettingsForFrontend($normalizedCategory, $updated),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pengaturan kategori gagal',
                'details' => $e->errors(),
                'code' => 'SETTINGS_VALIDATION_FAILED',
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui pengaturan kategori',
                'code' => 'SETTINGS_UPDATE_FAILED',
            ], 500);
        }
    }

    /**
     * Reset settings to defaults.
     */
    public function reset(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        $category = $request->input('category');
        $normalizedCategory = $category ? $this->normalizeCategoryName($category) : null;
        $settings = $this->preferenceManager->resetToDefaults($user, $normalizedCategory);

        $message = $normalizedCategory
            ? "Settings for {$normalizedCategory} reset to defaults"
            : 'All settings reset to defaults';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $this->transformSettingsForFrontend($settings),
        ]);
    }

    /**
     * Export settings as JSON.
     */
    public function export(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        $exported = $this->preferenceManager->exportSettings($user);
        $exported['settings'] = $this->transformSettingsForFrontend($exported['settings'] ?? []);

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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        try {
            $validated = $request->validate([
                'version' => 'required|string',
                'settings' => 'required|array',
            ]);

            $validated['settings'] = $this->normalizeSettingsPayload($validated['settings']);
            $settings = $this->preferenceManager->importSettings($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Settings imported successfully',
                'data' => $this->transformSettingsForFrontend($settings),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Format file pengaturan tidak valid',
                'details' => $e->errors(),
                'code' => 'SETTINGS_IMPORT_INVALID',
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengimpor pengaturan',
                'code' => 'SETTINGS_IMPORT_FAILED',
            ], 500);
        }
    }

    /**
     * Get defaults for all categories.
     */
    public function defaults(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->transformSettingsForFrontend($this->preferenceManager->getDefaults()),
        ]);
    }

    /**
     * Get the authenticated user from various auth guards.
     */
    protected function getAuthenticatedUser(Request $request): ?Model
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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        $currentSessionId = $request->session()->getId();

        $rawSessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->limit(15)
            ->get();

        $sessions = $rawSessions
            ->filter(fn ($session) => $this->sessionBelongsToUser($session->payload ?? null, $user))
            ->map(function ($session) use ($currentSessionId) {
                $lastActive = is_numeric($session->last_activity)
                    ? now()->setTimestamp((int) $session->last_activity)->toIso8601String()
                    : now()->toIso8601String();

                return [
                    'id' => $session->id,
                    'device' => $this->parseUserAgent($session->user_agent),
                    'browser' => $this->parseBrowser($session->user_agent),
                    'ip_address' => $session->ip_address,
                    'location' => 'Tidak diketahui',
                    'last_active' => $lastActive,
                    'is_current' => $session->id === $currentSessionId,
                ];
            })
            ->values()
            ->all();

        if (empty($sessions)) {
            $sessions[] = [
                'id' => $currentSessionId,
                'device' => $this->parseUserAgent($request->userAgent()),
                'browser' => $this->parseBrowser($request->userAgent()),
                'ip_address' => $request->ip(),
                'location' => 'Tidak diketahui',
                'last_active' => now()->toIso8601String(),
                'is_current' => true,
            ];
        }

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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        if ($sessionId === $request->session()->getId()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengakhiri sesi yang sedang aktif',
            ], 422);
        }

        $session = DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak ditemukan atau tidak memiliki akses',
            ], 404);
        }

        if (!$this->sessionBelongsToUser($session->payload ?? null, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid untuk akun saat ini',
                'code' => 'SESSION_OWNERSHIP_MISMATCH',
            ], 403);
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->delete();

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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        $limit = (int) $request->input('limit', 10);
        $limit = min(max($limit, 1), 50);

        $userTypes = array_values(array_unique([
            get_class($user),
            method_exists($user, 'getMorphClass') ? $user->getMorphClass() : null,
        ]));

        $history = AdminActivityLog::query()
            ->where('user_id', $user->id)
            ->whereIn('user_type', array_filter($userTypes))
            ->whereIn('action', ['login', 'login_success', 'login_failed'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (AdminActivityLog $log) {
                return [
                    'id' => (string) $log->id,
                    'device' => $this->parseUserAgent($log->user_agent),
                    'browser' => $this->parseBrowser($log->user_agent),
                    'ip_address' => $log->ip_address,
                    'location' => 'Tidak diketahui',
                    'status' => str_contains($log->action, 'failed') ? 'failed' : 'success',
                    'timestamp' => optional($log->created_at)->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Get storage usage information.
     */
    public function storageUsage(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        $documentsSize = 0;
        $cacheSize = 0;
        $otherSize = 0;

        try {
            $userSettings = $this->preferenceManager->getSettings($user);
            $cacheSize = strlen((string) json_encode($userSettings));
        } catch (Throwable $e) {
            $cacheSize = 0;
        }

        try {
            $otherSize = $this->getSessionSizeForUser($user);
        } catch (Throwable $e) {
            $otherSize = 0;
        }

        // Total used
        $used = $documentsSize + $cacheSize + $otherSize;
        
        // Total available (100 MB per user)
        $total = 100 * 1024 * 1024; // 100 MB

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

    protected function getSessionSizeForUser(Model $user): int
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->limit(50)
            ->get(['payload']);

        $size = 0;
        foreach ($sessions as $session) {
            if ($this->sessionBelongsToUser($session->payload ?? null, $user)) {
                $size += strlen((string) ($session->payload ?? ''));
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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'code' => 'UNAUTHORIZED',
            ], 401);
        }

        try {
            $this->preferenceManager->clearUserCache($user);

            return response()->json([
                'success' => true,
                'message' => 'Cache preferensi berhasil dibersihkan',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membersihkan cache preferensi',
                'code' => 'SETTINGS_CACHE_CLEAR_FAILED',
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

    /**
     * Normalize incoming category alias from frontend.
     */
    protected function normalizeCategoryName(string $category): string
    {
        return $category === 'dataManagement' ? 'data' : $category;
    }

    /**
     * Normalize incoming payload so API can accept both `data` and `dataManagement`.
     */
    protected function normalizeSettingsPayload(array $payload): array
    {
        if (array_key_exists('dataManagement', $payload) && !array_key_exists('data', $payload)) {
            $payload['data'] = $payload['dataManagement'];
            unset($payload['dataManagement']);
        }

        if (
            array_key_exists('appearance', $payload) &&
            is_array($payload['appearance']) &&
            array_key_exists('theme', $payload['appearance'])
        ) {
            $payload['appearance']['theme'] = $this->normalizeThemeValue(
                $payload['appearance']['theme'] ?? null
            );
        }

        return $payload;
    }

    /**
     * Transform settings payload so frontend receives `dataManagement`.
     */
    protected function transformSettingsForFrontend(array $settings): array
    {
        if (array_key_exists('data', $settings) && !array_key_exists('dataManagement', $settings)) {
            $settings['dataManagement'] = $settings['data'];
        }

        if (
            array_key_exists('appearance', $settings) &&
            is_array($settings['appearance'])
        ) {
            $settings['appearance']['theme'] = $this->normalizeThemeValue(
                $settings['appearance']['theme'] ?? null
            );
        }

        unset($settings['data']);

        return $settings;
    }

    /**
     * Transform single category response to frontend expected shape.
     */
    protected function transformCategorySettingsForFrontend(string $category, array $settings): array
    {
        if ($category === 'data') {
            return ['dataManagement' => $settings];
        }

        if ($category === 'appearance') {
            $settings['theme'] = $this->normalizeThemeValue(
                $settings['theme'] ?? null
            );
        }

        return [$category => $settings];
    }

    protected function normalizeThemeValue(mixed $theme): string
    {
        if ($theme === 'auto') {
            return 'system';
        }

        if (in_array($theme, ['light', 'dark', 'system'], true)) {
            return $theme;
        }

        return 'system';
    }

    protected function sessionBelongsToUser(?string $payload, Model $user): bool
    {
        if (!$payload) {
            return false;
        }

        $decoded = base64_decode($payload, true);
        $sessionData = @unserialize($decoded !== false ? $decoded : $payload);

        if (!is_array($sessionData)) {
            return false;
        }

        $userId = (string) $user->getAuthIdentifier();
        $flatten = Arr::dot($sessionData);

        foreach ($flatten as $key => $value) {
            if (
                is_scalar($value) &&
                is_string($key) &&
                str_contains($key, 'login_') &&
                (string) $value === $userId
            ) {
                return true;
            }
        }

        return false;
    }
}
