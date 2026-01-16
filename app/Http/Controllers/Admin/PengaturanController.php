<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index()
    {
        $settings = $this->getAllSettings();
        
        // System info
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_time' => now()->format('Y-m-d H:i:s'),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'db_connection' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
        ];
        
        // Storage info
        $storageInfo = [
            'total_space' => disk_total_space(storage_path()),
            'free_space' => disk_free_space(storage_path()),
            'used_percentage' => round((1 - disk_free_space(storage_path()) / disk_total_space(storage_path())) * 100, 1),
        ];
        
        return Inertia::render('admin/pengaturan', [
            'settings' => $settings,
            'systemInfo' => $systemInfo,
            'storageInfo' => $storageInfo,
        ]);
    }
    
    public function update(Request $request)
    {
        $request->validate([
            'token_ttl_seconds' => 'required|integer|min:30|max:600',
            'late_minutes' => 'required|integer|min:1|max:60',
            'selfie_required' => 'required|boolean',
            'notify_rejected' => 'required|boolean',
            'notify_selfie_blur' => 'required|boolean',
        ]);
        
        $this->setSetting('token_ttl_seconds', $request->token_ttl_seconds);
        $this->setSetting('late_minutes', $request->late_minutes);
        $this->setSetting('selfie_required', $request->selfie_required);
        $this->setSetting('notify_rejected', $request->notify_rejected);
        $this->setSetting('notify_selfie_blur', $request->notify_selfie_blur);
        
        Cache::forget('app_settings');
        
        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
    
    public function updateGeofence(Request $request)
    {
        $request->validate([
            'geofence_lat' => 'required|numeric|between:-90,90',
            'geofence_lng' => 'required|numeric|between:-180,180',
            'geofence_radius' => 'required|integer|min:10|max:5000',
        ]);
        
        $this->setSetting('geofence_lat', $request->geofence_lat);
        $this->setSetting('geofence_lng', $request->geofence_lng);
        $this->setSetting('geofence_radius', $request->geofence_radius);
        
        Cache::forget('app_settings');
        
        return back()->with('success', 'Pengaturan geofence berhasil disimpan.');
    }
    
    public function updateNotifications(Request $request)
    {
        $request->validate([
            'email_notifications' => 'required|boolean',
            'push_notifications' => 'required|boolean',
            'daily_report' => 'required|boolean',
            'weekly_report' => 'required|boolean',
        ]);
        
        $this->setSetting('email_notifications', $request->email_notifications);
        $this->setSetting('push_notifications', $request->push_notifications);
        $this->setSetting('daily_report', $request->daily_report);
        $this->setSetting('weekly_report', $request->weekly_report);
        
        Cache::forget('app_settings');
        
        return back()->with('success', 'Pengaturan notifikasi berhasil disimpan.');
    }
    
    public function updateAdvanced(Request $request)
    {
        $request->validate([
            'max_login_attempts' => 'required|integer|min:3|max:10',
            'lockout_duration' => 'required|integer|min:5|max:60',
            'session_lifetime' => 'required|integer|min:30|max:480',
            'ai_verification_enabled' => 'required|boolean',
            'face_match_threshold' => 'required|integer|min:50|max:99',
            'blur_detection_enabled' => 'required|boolean',
            'auto_approve_verified' => 'required|boolean',
            'maintenance_mode' => 'required|boolean',
        ]);
        
        $this->setSetting('max_login_attempts', $request->max_login_attempts);
        $this->setSetting('lockout_duration', $request->lockout_duration);
        $this->setSetting('session_lifetime', $request->session_lifetime);
        $this->setSetting('ai_verification_enabled', $request->ai_verification_enabled);
        $this->setSetting('face_match_threshold', $request->face_match_threshold);
        $this->setSetting('blur_detection_enabled', $request->blur_detection_enabled);
        $this->setSetting('auto_approve_verified', $request->auto_approve_verified);
        $this->setSetting('maintenance_mode', $request->maintenance_mode);
        
        Cache::forget('app_settings');
        
        return back()->with('success', 'Pengaturan lanjutan berhasil disimpan.');
    }
    
    public function clearCache()
    {
        Cache::flush();
        
        return back()->with('success', 'Cache berhasil dibersihkan.');
    }
    
    public function optimize()
    {
        try {
            Artisan::call('optimize:clear');
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');
            
            return back()->with('success', 'Database berhasil dioptimasi.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengoptimasi: ' . $e->getMessage());
        }
    }
    
    private function getAllSettings()
    {
        return Cache::remember('app_settings', 3600, function () {
            $defaults = [
                'token_ttl_seconds' => 180,
                'late_minutes' => 10,
                'selfie_required' => true,
                'notify_rejected' => true,
                'notify_selfie_blur' => true,
                'geofence_lat' => -6.3431,
                'geofence_lng' => 106.7394,
                'geofence_radius' => 100,
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
            
            $settings = Setting::pluck('value', 'key')->toArray();
            
            foreach ($defaults as $key => $default) {
                if (!isset($settings[$key])) {
                    $settings[$key] = $default;
                } else {
                    // Cast to appropriate type
                    if (is_bool($default)) {
                        $settings[$key] = filter_var($settings[$key], FILTER_VALIDATE_BOOLEAN);
                    } elseif (is_int($default)) {
                        $settings[$key] = (int) $settings[$key];
                    } elseif (is_float($default)) {
                        $settings[$key] = (float) $settings[$key];
                    }
                }
            }
            
            return $settings;
        });
    }
    
    private function setSetting($key, $value)
    {
        Setting::updateOrCreate(
            ['key' => $key],
            ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value]
        );
    }
}
