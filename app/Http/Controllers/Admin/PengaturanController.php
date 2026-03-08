<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\SettingBackup;
use App\Models\SettingHistory;
use App\Models\NotificationTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengaturanController extends Controller
{
    private const SETTING_LABELS = [
        'token_ttl_seconds' => 'Durasi Token QR',
        'late_minutes' => 'Toleransi Terlambat',
        'selfie_required' => 'Wajib Selfie',
        'notify_rejected' => 'Notifikasi Absen Ditolak',
        'notify_selfie_blur' => 'Notifikasi Selfie Blur',
        'geofence_lat' => 'Latitude Geofence',
        'geofence_lng' => 'Longitude Geofence',
        'geofence_radius_m' => 'Radius Geofence',
        'email_notifications' => 'Notifikasi Email',
        'push_notifications' => 'Push Notification',
        'daily_report' => 'Laporan Harian',
        'weekly_report' => 'Laporan Mingguan',
        'max_login_attempts' => 'Batas Login Gagal',
        'lockout_duration' => 'Durasi Lockout',
        'session_lifetime' => 'Durasi Sesi Login',
        'ai_verification_enabled' => 'Verifikasi AI',
        'face_match_threshold' => 'Threshold Face Match',
        'blur_detection_enabled' => 'Deteksi Blur',
        'auto_approve_verified' => 'Auto Approve Verified',
        'maintenance_mode' => 'Mode Maintenance',
    ];

    public function index(): Response
    {
        $settings = $this->getAllSettings();
        $emailTemplates = NotificationTemplate::orderBy('name')->get();

        $recentHistory = SettingHistory::with('user')
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn (SettingHistory $item) => [
                'id' => $item->id,
                'setting_key' => $item->setting_key,
                'setting_label' => $item->setting_label,
                'old_value' => $item->old_value,
                'new_value' => $item->new_value,
                'change_type' => $item->change_type,
                'changed_by' => $item->changed_by,
                'user' => $item->user ? [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                ] : null,
                'ip_address' => $item->ip_address,
                'created_at' => $item->created_at?->toISOString(),
            ]);

        $backups = SettingBackup::with('creator')
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn (SettingBackup $backup) => [
                'id' => $backup->id,
                'backup_name' => $backup->backup_name,
                'backup_description' => $backup->backup_description,
                'file_size' => (int) $backup->file_size,
                'settings_count' => (int) $backup->settings_count,
                'is_auto_backup' => (bool) $backup->is_auto_backup,
                'can_restore' => (bool) $backup->can_restore,
                'created_at' => $backup->created_at?->toISOString(),
                'creator' => $backup->creator ? [
                    'id' => $backup->creator->id,
                    'name' => $backup->creator->name,
                ] : null,
            ]);

        return Inertia::render('admin/pengaturan', [
            'settings' => $settings,
            'systemInfo' => $this->getSystemInfo(),
            'storageInfo' => $this->getStorageInfo(),
            'stats' => $this->buildStats(),
            'recentHistory' => $recentHistory,
            'backups' => $backups,
            'emailTemplates' => $emailTemplates,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token_ttl_seconds' => 'required|integer|min:30|max:600',
            'late_minutes' => 'required|integer|min:1|max:60',
            'selfie_required' => 'required|boolean',
            'notify_rejected' => 'required|boolean',
            'notify_selfie_blur' => 'required|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $this->persistSetting('token_ttl_seconds', $validated['token_ttl_seconds']);
            $this->persistSetting('late_minutes', $validated['late_minutes']);
            $this->persistSetting('selfie_required', $validated['selfie_required']);
            $this->persistSetting('notify_rejected', $validated['notify_rejected']);
            $this->persistSetting('notify_selfie_blur', $validated['notify_selfie_blur']);
        });

        Cache::forget('app_settings');

        return back()->with('success', 'Pengaturan umum berhasil disimpan.');
    }

    public function updateGeofence(Request $request): RedirectResponse
    {
        $request->merge([
            'geofence_lat' => str_replace(',', '.', (string) $request->input('geofence_lat')),
            'geofence_lng' => str_replace(',', '.', (string) $request->input('geofence_lng')),
        ]);

        $validated = $request->validate([
            'geofence_lat' => 'required|numeric|between:-90,90',
            'geofence_lng' => 'required|numeric|between:-180,180',
            'geofence_radius_m' => 'required|integer|min:10|max:5000',
        ]);

        DB::transaction(function () use ($validated) {
            $this->persistSetting('geofence_lat', $validated['geofence_lat']);
            $this->persistSetting('geofence_lng', $validated['geofence_lng']);
            $this->persistSetting('geofence_radius_m', $validated['geofence_radius_m']);
        });

        Cache::forget('app_settings');

        return back()->with('success', 'Pengaturan geofence berhasil disimpan.');
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email_notifications' => 'required|boolean',
            'push_notifications' => 'required|boolean',
            'daily_report' => 'required|boolean',
            'weekly_report' => 'required|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $this->persistSetting('email_notifications', $validated['email_notifications']);
            $this->persistSetting('push_notifications', $validated['push_notifications']);
            $this->persistSetting('daily_report', $validated['daily_report']);
            $this->persistSetting('weekly_report', $validated['weekly_report']);
        });

        Cache::forget('app_settings');

        return back()->with('success', 'Pengaturan notifikasi berhasil disimpan.');
    }

    public function updateAdvanced(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'max_login_attempts' => 'required|integer|min:3|max:10',
            'lockout_duration' => 'required|integer|min:5|max:60',
            'session_lifetime' => 'required|integer|min:30|max:480',
            'ai_verification_enabled' => 'required|boolean',
            'face_match_threshold' => 'required|integer|min:50|max:99',
            'blur_detection_enabled' => 'required|boolean',
            'auto_approve_verified' => 'required|boolean',
            'maintenance_mode' => 'required|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $this->persistSetting('max_login_attempts', $validated['max_login_attempts']);
            $this->persistSetting('lockout_duration', $validated['lockout_duration']);
            $this->persistSetting('session_lifetime', $validated['session_lifetime']);
            $this->persistSetting('ai_verification_enabled', $validated['ai_verification_enabled']);
            $this->persistSetting('face_match_threshold', $validated['face_match_threshold']);
            $this->persistSetting('blur_detection_enabled', $validated['blur_detection_enabled']);
            $this->persistSetting('auto_approve_verified', $validated['auto_approve_verified']);
            $this->persistSetting('maintenance_mode', $validated['maintenance_mode']);
        });

        Cache::forget('app_settings');

        return back()->with('success', 'Pengaturan lanjutan berhasil disimpan.');
    }

    public function updateTemplate(Request $request, NotificationTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $template->update($validated);

        return back()->with('success', 'Template notifikasi berhasil diperbarui.');
    }

    public function createBackup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $this->createSnapshotBackup(
            $validated['name'],
            $validated['description'] ?? null,
            false,
        );

        return back()->with('success', 'Backup pengaturan berhasil dibuat.');
    }

    public function restoreBackup(SettingBackup $backup): RedirectResponse
    {
        if (! $backup->can_restore) {
            return back()->with('error', 'Backup ini tidak dapat di-restore.');
        }

        DB::transaction(function () use ($backup) {
            $this->createSnapshotBackup(
                'Auto Backup sebelum restore',
                'Snapshot otomatis sebelum restore backup #' . $backup->id,
                true,
            );

            foreach (($backup->settings_data ?? []) as $key => $value) {
                if (! array_key_exists($key, $this->getSettingDefaults())) {
                    continue;
                }

                $this->persistSetting($key, $value, 'restore');
            }
        });

        Cache::forget('app_settings');

        return back()->with('success', 'Pengaturan berhasil di-restore dari backup.');
    }

    public function deleteBackup(SettingBackup $backup): RedirectResponse
    {
        $backup->delete();

        return back()->with('success', 'Backup berhasil dihapus.');
    }

    public function exportSettings(): StreamedResponse
    {
        $payload = [
            'exported_at' => now()->toISOString(),
            'exported_by' => auth()->user()?->name,
            'settings' => $this->snapshotSettings(),
        ];

        $filename = 'pengaturan-admin-' . now()->format('Ymd-His') . '.json';

        return response()->streamDownload(function () use ($payload): void {
            echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function importSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimetypes:application/json,text/plain|max:2048',
        ]);

        $decoded = json_decode(file_get_contents($validated['file']->getRealPath()), true);

        if (! is_array($decoded)) {
            return back()->with('error', 'File JSON tidak valid.');
        }

        $settings = $decoded['settings'] ?? $decoded;

        if (! is_array($settings)) {
            return back()->with('error', 'Format file pengaturan tidak dikenali.');
        }

        DB::transaction(function () use ($settings) {
            $this->createSnapshotBackup(
                'Auto Backup sebelum import',
                'Snapshot otomatis sebelum import pengaturan.',
                true,
            );

            foreach ($settings as $key => $value) {
                if (! array_key_exists($key, $this->getSettingDefaults())) {
                    continue;
                }

                $this->persistSetting($key, $value, 'import');
            }
        });

        Cache::forget('app_settings');

        return back()->with('success', 'Pengaturan berhasil diimport.');
    }

    public function history(Request $request): JsonResponse
    {
        $perPage = max(10, min((int) $request->integer('per_page', 25), 100));

        $history = SettingHistory::with('user')
            ->latest('created_at')
            ->paginate($perPage);

        return response()->json($history);
    }

    public function clearCache(): RedirectResponse
    {
        Cache::flush();

        return back()->with('success', 'Cache berhasil dibersihkan.');
    }

    public function optimize(): RedirectResponse
    {
        try {
            Artisan::call('optimize:clear');
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');

            return back()->with('success', 'Sistem berhasil dioptimasi.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengoptimasi: ' . $e->getMessage());
        }
    }

    private function buildStats(): array
    {
        $lastBackup = SettingBackup::query()->latest('created_at')->value('created_at');

        return [
            'total_settings' => count($this->getSettingDefaults()),
            'changes_today' => SettingHistory::query()->whereDate('created_at', today())->count(),
            'backups_count' => SettingBackup::query()->count(),
            'last_backup_at' => $lastBackup ? \Carbon\Carbon::parse($lastBackup)->toISOString() : null,
        ];
    }

    private function getAllSettings(): array
    {
        return Cache::remember('app_settings', 3600, function (): array {
            $defaults = $this->getSettingDefaults();
            $stored = Setting::query()->pluck('value', 'key')->toArray();
            $resolved = [];

            if (! isset($stored['geofence_radius_m']) && isset($stored['geofence_radius'])) {
                $stored['geofence_radius_m'] = $stored['geofence_radius'];
            }

            foreach ($defaults as $key => $default) {
                $resolved[$key] = array_key_exists($key, $stored)
                    ? $this->castSettingValue($stored[$key], $default)
                    : $default;
            }

            return $resolved;
        });
    }

    private function getSettingDefaults(): array
    {
        return [
            'token_ttl_seconds' => 180,
            'late_minutes' => 10,
            'selfie_required' => true,
            'notify_rejected' => true,
            'notify_selfie_blur' => true,
            'geofence_lat' => -6.3431,
            'geofence_lng' => 106.7394,
            'geofence_radius_m' => 100,
            'email_notifications' => false,
            'push_notifications' => false,
            'daily_report' => false,
            'weekly_report' => false,
            'max_login_attempts' => 5,
            'lockout_duration' => 15,
            'session_lifetime' => 120,
            'ai_verification_enabled' => true,
            'face_match_threshold' => 70,
            'blur_detection_enabled' => true,
            'auto_approve_verified' => false,
            'maintenance_mode' => false,
        ];
    }

    private function castSettingValue(mixed $value, mixed $default): mixed
    {
        if (is_bool($default)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        if (is_int($default)) {
            return (int) $value;
        }

        if (is_float($default)) {
            return (float) $value;
        }

        return $value;
    }

    private function persistSetting(string $key, mixed $value, string $changeType = 'update'): void
    {
        $newValue = $this->formatSettingValue($value);
        $current = Setting::query()->find($key);
        $oldValue = $current?->value;

        if ($oldValue === $newValue) {
            return;
        }

        Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $newValue],
        );

        SettingHistory::query()->create([
            'setting_key' => $key,
            'setting_label' => self::SETTING_LABELS[$key] ?? $key,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'change_type' => $changeType,
            'changed_by' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);
    }

    private function formatSettingValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]';
        }

        return (string) $value;
    }

    private function snapshotSettings(): array
    {
        return array_intersect_key($this->getAllSettings(), $this->getSettingDefaults());
    }

    private function createSnapshotBackup(string $name, ?string $description = null, bool $isAuto = false): SettingBackup
    {
        $snapshot = $this->snapshotSettings();
        $payload = json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';

        return SettingBackup::query()->create([
            'backup_name' => $name,
            'backup_description' => $description,
            'settings_data' => $snapshot,
            'created_by' => auth()->id(),
            'file_size' => strlen($payload),
            'settings_count' => count($snapshot),
            'is_auto_backup' => $isAuto,
            'can_restore' => true,
        ]);
    }

    private function getSystemInfo(): array
    {
        return [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_time' => now()->format('Y-m-d H:i:s'),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env'),
            'debug_mode' => (bool) config('app.debug'),
            'db_connection' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'memory_limit' => ini_get('memory_limit') ?: 'unknown',
            'cache_size' => $this->getDirectorySize(storage_path('framework/cache')),
            'log_size' => $this->getDirectorySize(storage_path('logs')),
            'database_size' => $this->getDatabaseSize(),
        ];
    }

    private function getStorageInfo(): array
    {
        $total = (float) (disk_total_space(storage_path()) ?: 0);
        $free = (float) (disk_free_space(storage_path()) ?: 0);
        $usedPercentage = $total > 0 ? round((1 - ($free / $total)) * 100, 1) : 0;

        return [
            'total_space' => $total,
            'free_space' => $free,
            'used_percentage' => $usedPercentage,
        ];
    }

    private function getDirectorySize(string $path): int
    {
        if (! is_dir($path)) {
            return 0;
        }

        $size = 0;

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $size += $file->getSize();
        }

        return $size;
    }

    private function getDatabaseSize(): int
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");
        $driver = config("database.connections.{$connection}.driver");

        if (! $database || ! $driver) {
            return 0;
        }

        if ($driver === 'sqlite' && is_file($database)) {
            return filesize($database) ?: 0;
        }

        if ($driver === 'mysql') {
            $result = DB::select(
                'SELECT SUM(data_length + index_length) AS size FROM information_schema.TABLES WHERE table_schema = ?',
                [$database],
            );

            return (int) ($result[0]->size ?? 0);
        }

        return 0;
    }
}
