# PROMPT: Pengaturan Admin - Ultra Advanced Complete System
## Modern Layout with Advanced Features

---

## 🎯 EXECUTIVE SUMMARY

Halaman **Pengaturan Admin** yang dirancang ulang dengan layout modern, interaktif, dan super advanced. Berbeda dari layout pengaturan tradisional yang membosankan, halaman ini menggunakan:

1. **Modern Card-Based Layout** - Bukan list biasa, tapi card interaktif dengan visual menarik
2. **Categorized Sections** - Pengaturan dikelompokkan dalam kategori yang jelas
3. **Real-time Preview** - Preview langsung perubahan sebelum disimpan
4. **Smart Search** - Cari pengaturan dengan cepat
5. **Quick Actions** - Shortcut untuk pengaturan yang sering digunakan
6. **Activity Log** - Track semua perubahan pengaturan
7. **Backup & Restore** - Backup dan restore konfigurasi
8. **Advanced Customization** - Kustomisasi mendalam untuk setiap aspek sistem

**Key Features:**
- Modern dashboard-style layout dengan cards
- Tab navigation untuk kategori pengaturan
- Real-time validation dan preview
- Drag & drop untuk reordering
- Color picker untuk customization
- Image upload dengan crop & resize
- Import/Export settings
- Version control untuk settings
- Role-based access control
- Audit trail lengkap
- Notification preferences
- Email templates editor
- System maintenance tools
- Performance monitoring
- Security settings
- Integration management

**UI/UX Requirements:**
- Warna, animasi, dan style SAMA dengan dashboard admin
- Modern card-based layout (bukan list tradisional)
- Interactive elements dengan smooth animations
- Responsive mobile design
- Icon tanpa container background
- Gradient backgrounds untuk sections
- Hover effects yang menarik
- Loading states yang smooth
- Toast notifications untuk feedback
- Modal dialogs untuk confirmations

---

## 📋 PART 1: DATABASE SCHEMA

### 1.1 System Settings Table

```sql
CREATE TABLE system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Setting Details
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'file', 'color', 'email', 'url') DEFAULT 'string',
    
    -- Metadata
    category VARCHAR(100) NOT NULL COMMENT 'general, appearance, email, notification, security, etc',
    label VARCHAR(255) NOT NULL,
    description TEXT NULL,
    
    -- Validation
    validation_rules JSON NULL COMMENT 'Validation rules for the setting',
    default_value TEXT NULL,
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Can be accessed by non-admin',
    requires_restart BOOLEAN DEFAULT FALSE COMMENT 'Requires system restart',
    
    -- Versioning
    version INT DEFAULT 1,
    previous_value TEXT NULL,
    changed_by BIGINT UNSIGNED NULL,
    changed_at DATETIME NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_category (category),
    INDEX idx_key (setting_key),
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 Settings History Table

```sql
CREATE TABLE settings_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    setting_id BIGINT UNSIGNED NOT NULL,
    setting_key VARCHAR(255) NOT NULL,
    
    -- Change Details
    old_value TEXT NULL,
    new_value TEXT NULL,
    change_type ENUM('create', 'update', 'delete', 'restore') NOT NULL,
    
    -- User Info
    changed_by BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Additional Info
    notes TEXT NULL,
    
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (setting_id) REFERENCES system_settings(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_setting (setting_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.3 Settings Backups Table

```sql
CREATE TABLE settings_backups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Backup Details
    backup_name VARCHAR(255) NOT NULL,
    backup_description TEXT NULL,
    
    -- Backup Data
    settings_data JSON NOT NULL COMMENT 'Complete settings snapshot',
    
    -- Metadata
    created_by BIGINT UNSIGNED NULL,
    file_size INT NULL COMMENT 'Size in bytes',
    settings_count INT DEFAULT 0,
    
    -- Status
    is_auto_backup BOOLEAN DEFAULT FALSE,
    can_restore BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.4 Email Templates Table

```sql
CREATE TABLE email_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Template Details
    template_key VARCHAR(255) NOT NULL UNIQUE,
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT NULL,
    
    -- Content
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NULL,
    
    -- Variables
    available_variables JSON NULL COMMENT 'List of available template variables',
    
    -- Metadata
    category VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Versioning
    version INT DEFAULT 1,
    last_modified_by BIGINT UNSIGNED NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_key (template_key),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.5 Notification Preferences Table

```sql
CREATE TABLE notification_preferences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Email Notifications
    email_enabled BOOLEAN DEFAULT TRUE,
    email_digest ENUM('instant', 'daily', 'weekly', 'never') DEFAULT 'instant',
    
    -- Push Notifications
    push_enabled BOOLEAN DEFAULT TRUE,
    
    -- Notification Types
    notify_new_user BOOLEAN DEFAULT TRUE,
    notify_new_submission BOOLEAN DEFAULT TRUE,
    notify_new_comment BOOLEAN DEFAULT TRUE,
    notify_system_alert BOOLEAN DEFAULT TRUE,
    notify_deadline_reminder BOOLEAN DEFAULT TRUE,
    
    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME NULL,
    quiet_hours_end TIME NULL,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 PART 2: LARAVEL MODELS

### 2.1 SystemSetting Model

**File: `app/Models/SystemSetting.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $table = 'system_settings';

    protected $fillable = [
        'setting_key',
        'setting_value',
        'setting_type',
        'category',
        'label',
        'description',
        'validation_rules',
        'default_value',
        'is_public',
        'requires_restart',
        'version',
        'previous_value',
        'changed_by',
        'changed_at',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'requires_restart' => 'boolean',
        'validation_rules' => 'array',
        'changed_at' => 'datetime',
    ];

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function history(): HasMany
    {
        return $this->hasMany(SettingsHistory::class, 'setting_id');
    }

    // Scopes
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    // Helper Methods
    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function() use ($key, $default) {
            $setting = static::where('setting_key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            return static::castValue($setting->setting_value, $setting->setting_type);
        });
    }

    public static function set(string $key, $value, ?int $userId = null): bool
    {
        $setting = static::where('setting_key', $key)->first();
        
        if (!$setting) {
            return false;
        }

        // Store previous value
        $previousValue = $setting->setting_value;
        
        // Update setting
        $setting->update([
            'setting_value' => static::prepareValue($value, $setting->setting_type),
            'previous_value' => $previousValue,
            'version' => $setting->version + 1,
            'changed_by' => $userId,
            'changed_at' => now(),
        ]);

        // Log history
        SettingsHistory::create([
            'setting_id' => $setting->id,
            'setting_key' => $key,
            'old_value' => $previousValue,
            'new_value' => $setting->setting_value,
            'change_type' => 'update',
            'changed_by' => $userId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Clear cache
        Cache::forget("setting.{$key}");

        return true;
    }

    private static function castValue($value, string $type)
    {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($value) ? (float) $value : 0;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    private static function prepareValue($value, string $type): string
    {
        switch ($type) {
            case 'boolean':
                return $value ? '1' : '0';
            case 'json':
                return json_encode($value);
            default:
                return (string) $value;
        }
    }

    public function getTypedValueAttribute()
    {
        return static::castValue($this->setting_value, $this->setting_type);
    }
}
```

### 2.2 SettingsHistory Model

**File: `app/Models/SettingsHistory.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettingsHistory extends Model
{
    protected $table = 'settings_history';

    public $timestamps = false;

    protected $fillable = [
        'setting_id',
        'setting_key',
        'old_value',
        'new_value',
        'change_type',
        'changed_by',
        'ip_address',
        'user_agent',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function setting(): BelongsTo
    {
        return $this->belongsTo(SystemSetting::class, 'setting_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    // Helper Methods
    public function getFormattedChangeAttribute(): string
    {
        return "{$this->old_value} → {$this->new_value}";
    }
}
```

### 2.3 SettingsBackup Model

**File: `app/Models/SettingsBackup.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettingsBackup extends Model
{
    protected $table = 'settings_backups';

    public $timestamps = false;

    protected $fillable = [
        'backup_name',
        'backup_description',
        'settings_data',
        'created_by',
        'file_size',
        'settings_count',
        'is_auto_backup',
        'can_restore',
        'created_at',
    ];

    protected $casts = [
        'settings_data' => 'array',
        'is_auto_backup' => 'boolean',
        'can_restore' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Helper Methods
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function restore(): bool
    {
        if (!$this->can_restore) {
            return false;
        }

        try {
            \DB::beginTransaction();

            foreach ($this->settings_data as $key => $value) {
                SystemSetting::set($key, $value, auth()->id());
            }

            \DB::commit();
            return true;
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Failed to restore settings backup', [
                'backup_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
```


### 2.4 EmailTemplate Model

**File: `app/Models/EmailTemplate.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailTemplate extends Model
{
    protected $table = 'email_templates';

    protected $fillable = [
        'template_key',
        'template_name',
        'template_description',
        'subject',
        'body_html',
        'body_text',
        'available_variables',
        'category',
        'is_active',
        'version',
        'last_modified_by',
    ];

    protected $casts = [
        'available_variables' => 'array',
        'is_active' => 'boolean',
    ];

    public function lastModifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_modified_by');
    }

    // Helper Methods
    public function render(array $data = []): string
    {
        $html = $this->body_html;
        
        foreach ($data as $key => $value) {
            $html = str_replace("{{" . $key . "}}", $value, $html);
        }
        
        return $html;
    }

    public function renderSubject(array $data = []): string
    {
        $subject = $this->subject;
        
        foreach ($data as $key => $value) {
            $subject = str_replace("{{" . $key . "}}", $value, $subject);
        }
        
        return $subject;
    }
}
```

---

## 📋 PART 3: CONTROLLER IMPLEMENTATION

### 3.1 Settings Controller

**File: `app/Http/Controllers/Admin/SettingsController.php`**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\SettingsHistory;
use App\Models\SettingsBackup;
use App\Models\EmailTemplate;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function index()
    {
        // Get all settings grouped by category
        $settings = SystemSetting::with('changedBy')
            ->orderBy('category')
            ->orderBy('label')
            ->get()
            ->groupBy('category');

        // Get recent history
        $recentHistory = SettingsHistory::with(['user', 'setting'])
            ->latest()
            ->limit(10)
            ->get();

        // Get backups
        $backups = SettingsBackup::with('creator')
            ->latest()
            ->limit(5)
            ->get();

        // Get email templates
        $emailTemplates = EmailTemplate::orderBy('category')
            ->orderBy('template_name')
            ->get();

        // System info
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'storage_disk' => config('filesystems.default'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale'),
        ];

        // Statistics
        $stats = [
            'total_settings' => SystemSetting::count(),
            'total_changes_today' => SettingsHistory::whereDate('created_at', today())->count(),
            'total_backups' => SettingsBackup::count(),
            'last_backup' => SettingsBackup::latest()->first()?->created_at,
        ];

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'recentHistory' => $recentHistory,
            'backups' => $backups,
            'emailTemplates' => $emailTemplates,
            'systemInfo' => $systemInfo,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        try {
            \DB::beginTransaction();

            $updated = [];
            $requiresRestart = false;

            foreach ($validated['settings'] as $settingData) {
                $setting = SystemSetting::where('setting_key', $settingData['key'])->first();
                
                if (!$setting) {
                    continue;
                }

                // Validate value based on setting type
                $this->validateSettingValue($setting, $settingData['value']);

                // Update setting
                SystemSetting::set($settingData['key'], $settingData['value'], auth()->id());
                
                $updated[] = $setting->label;

                if ($setting->requires_restart) {
                    $requiresRestart = true;
                }
            }

            \DB::commit();

            return back()->with('success', [
                'message' => count($updated) . ' pengaturan berhasil diperbarui',
                'updated' => $updated,
                'requires_restart' => $requiresRestart,
            ]);

        } catch (\Exception $e) {
            \DB::rollBack();
            
            return back()->withErrors([
                'error' => 'Gagal memperbarui pengaturan: ' . $e->getMessage()
            ]);
        }
    }

    private function validateSettingValue(SystemSetting $setting, $value)
    {
        $rules = $setting->validation_rules ?? [];
        
        if (empty($rules)) {
            return;
        }

        $validator = Validator::make(
            ['value' => $value],
            ['value' => $rules]
        );

        if ($validator->fails()) {
            throw new \Exception("Validasi gagal untuk {$setting->label}: " . $validator->errors()->first());
        }
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'setting_key' => 'required|string',
        ]);

        $setting = SystemSetting::where('setting_key', $request->setting_key)->firstOrFail();

        // Delete old file if exists
        if ($setting->setting_value && Storage::exists($setting->setting_value)) {
            Storage::delete($setting->setting_value);
        }

        // Store new file
        $path = $request->file('file')->store('settings', 'public');

        // Update setting
        SystemSetting::set($request->setting_key, $path, auth()->id());

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }

    public function createBackup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $settings = SystemSetting::all()->pluck('setting_value', 'setting_key')->toArray();

            $backup = SettingsBackup::create([
                'backup_name' => $validated['name'],
                'backup_description' => $validated['description'] ?? null,
                'settings_data' => $settings,
                'created_by' => auth()->id(),
                'file_size' => strlen(json_encode($settings)),
                'settings_count' => count($settings),
                'is_auto_backup' => false,
                'created_at' => now(),
            ]);

            return back()->with('success', 'Backup berhasil dibuat!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal membuat backup: ' . $e->getMessage()]);
        }
    }

    public function restoreBackup($id)
    {
        try {
            $backup = SettingsBackup::findOrFail($id);

            if (!$backup->can_restore) {
                return back()->withErrors(['error' => 'Backup ini tidak dapat di-restore']);
            }

            if ($backup->restore()) {
                return back()->with('success', 'Pengaturan berhasil di-restore dari backup!');
            } else {
                return back()->withErrors(['error' => 'Gagal restore backup']);
            }

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal restore backup: ' . $e->getMessage()]);
        }
    }

    public function deleteBackup($id)
    {
        try {
            $backup = SettingsBackup::findOrFail($id);
            $backup->delete();

            return back()->with('success', 'Backup berhasil dihapus!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus backup: ' . $e->getMessage()]);
        }
    }

    public function exportSettings()
    {
        $settings = SystemSetting::all()->pluck('setting_value', 'setting_key')->toArray();
        
        $filename = 'settings_export_' . date('Y-m-d_His') . '.json';
        
        return response()->json($settings)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    public function importSettings(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json',
        ]);

        try {
            $content = file_get_contents($request->file('file')->getRealPath());
            $settings = json_decode($content, true);

            if (!is_array($settings)) {
                throw new \Exception('Format file tidak valid');
            }

            \DB::beginTransaction();

            $imported = 0;
            foreach ($settings as $key => $value) {
                if (SystemSetting::where('setting_key', $key)->exists()) {
                    SystemSetting::set($key, $value, auth()->id());
                    $imported++;
                }
            }

            \DB::commit();

            return back()->with('success', "{$imported} pengaturan berhasil diimport!");

        } catch (\Exception $e) {
            \DB::rollBack();
            return back()->withErrors(['error' => 'Gagal import pengaturan: ' . $e->getMessage()]);
        }
    }

    public function history(Request $request)
    {
        $query = SettingsHistory::with(['user', 'setting']);

        if ($request->filled('setting_key')) {
            $query->where('setting_key', $request->setting_key);
        }

        if ($request->filled('user_id')) {
            $query->where('changed_by', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $history = $query->latest()->paginate(50);

        return Inertia::render('admin/settings/history', [
            'history' => $history,
            'filters' => $request->only(['setting_key', 'user_id', 'date_from', 'date_to']),
        ]);
    }

    // Email Templates
    public function updateEmailTemplate(Request $request, $id)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:500',
            'body_html' => 'required|string',
            'body_text' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        try {
            $template = EmailTemplate::findOrFail($id);
            
            $template->update([
                ...$validated,
                'version' => $template->version + 1,
                'last_modified_by' => auth()->id(),
            ]);

            return back()->with('success', 'Email template berhasil diperbarui!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal memperbarui template: ' . $e->getMessage()]);
        }
    }

    public function testEmailTemplate(Request $request, $id)
    {
        $validated = $request->validate([
            'test_email' => 'required|email',
            'test_data' => 'nullable|array',
        ]);

        try {
            $template = EmailTemplate::findOrFail($id);
            
            $testData = $validated['test_data'] ?? [];
            
            // Send test email
            \Mail::send([], [], function ($message) use ($template, $testData, $validated) {
                $message->to($validated['test_email'])
                    ->subject($template->renderSubject($testData))
                    ->html($template->render($testData));
            });

            return back()->with('success', 'Test email berhasil dikirim!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengirim test email: ' . $e->getMessage()]);
        }
    }

    // System Maintenance
    public function clearCache()
    {
        try {
            \Artisan::call('cache:clear');
            \Artisan::call('config:clear');
            \Artisan::call('route:clear');
            \Artisan::call('view:clear');

            return back()->with('success', 'Cache berhasil dibersihkan!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal membersihkan cache: ' . $e->getMessage()]);
        }
    }

    public function optimizeSystem()
    {
        try {
            \Artisan::call('optimize');
            \Artisan::call('config:cache');
            \Artisan::call('route:cache');
            \Artisan::call('view:cache');

            return back()->with('success', 'Sistem berhasil dioptimasi!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal mengoptimasi sistem: ' . $e->getMessage()]);
        }
    }
}
```

---

## 📋 PART 4: FRONTEND COMPONENT - MODERN LAYOUT

### 4.1 Main Settings Page Component

**File: `resources/js/pages/admin/settings/index.tsx`**

```tsx
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    Settings, Save, RefreshCw, Download, Upload, History, Database,
    Shield, Mail, Bell, Palette, Globe, Code, Zap, Server, Lock,
    Users, FileText, Image, Video, Music, Archive, Search, Filter,
    ChevronRight, Check, X, AlertTriangle, Info, Sparkles, TrendingUp,
    BarChart3, Clock, Calendar, Eye, Edit2, Trash2, Copy, Plus,
    ArrowLeft, ExternalLink, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Import icons - MATCHING DASHBOARD ADMIN
import SettingsIcon from '@/assets/admin/dashboard/settings-icon.png';
import GeneralIcon from '@/assets/admin/dashboard/total-icon.png';
import SecurityIcon from '@/assets/admin/dashboard/hadir-icon.png';
import EmailIcon from '@/assets/admin/dashboard/selfie-icon.png';

interface Setting {
    id: number;
    setting_key: string;
    setting_value: string;
    setting_type: string;
    category: string;
    label: string;
    description: string;
    validation_rules: any;
    default_value: string;
    is_public: boolean;
    requires_restart: boolean;
    changed_by: any;
    changed_at: string;
}

interface SettingsPageProps {
    settings: Record<string, Setting[]>;
    recentHistory: any[];
    backups: any[];
    emailTemplates: any[];
    systemInfo: Record<string, string>;
    stats: {
        total_settings: number;
        total_changes_today: number;
        total_backups: number;
        last_backup: string;
    };
}


// Category configurations with icons and colors
const CATEGORIES = {
    general: {
        label: 'Pengaturan Umum',
        icon: Settings,
        color: 'from-blue-500 to-cyan-500',
        description: 'Konfigurasi dasar sistem'
    },
    appearance: {
        label: 'Tampilan',
        icon: Palette,
        color: 'from-purple-500 to-pink-500',
        description: 'Kustomisasi tampilan dan tema'
    },
    email: {
        label: 'Email',
        icon: Mail,
        color: 'from-emerald-500 to-teal-500',
        description: 'Konfigurasi email dan SMTP'
    },
    notification: {
        label: 'Notifikasi',
        icon: Bell,
        color: 'from-amber-500 to-orange-500',
        description: 'Pengaturan notifikasi sistem'
    },
    security: {
        label: 'Keamanan',
        icon: Shield,
        color: 'from-red-500 to-rose-500',
        description: 'Pengaturan keamanan dan privasi'
    },
    integration: {
        label: 'Integrasi',
        icon: Zap,
        color: 'from-indigo-500 to-purple-500',
        description: 'Integrasi dengan layanan eksternal'
    },
    system: {
        label: 'Sistem',
        icon: Server,
        color: 'from-neutral-500 to-neutral-700',
        description: 'Konfigurasi sistem dan maintenance'
    },
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
} as const;

export default function SettingsIndex({ 
    settings, 
    recentHistory, 
    backups, 
    emailTemplates,
    systemInfo,
    stats 
}: SettingsPageProps) {
    const [activeCategory, setActiveCategory] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [changedSettings, setChangedSettings] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);

    const form = useForm({
        settings: [] as Array<{ key: string; value: any }>,
    });

    // Filter settings based on search
    const filteredSettings = Object.entries(settings).reduce((acc, [category, categorySettings]) => {
        if (searchQuery) {
            const filtered = categorySettings.filter(setting =>
                setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.setting_key.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length > 0) {
                acc[category] = filtered;
            }
        } else {
            acc[category] = categorySettings;
        }
        return acc;
    }, {} as Record<string, Setting[]>);

    const handleSettingChange = (key: string, value: any) => {
        setChangedSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        const settingsToUpdate = Object.entries(changedSettings).map(([key, value]) => ({
            key,
            value
        }));

        if (settingsToUpdate.length === 0) {
            toast.info('Tidak ada perubahan untuk disimpan');
            return;
        }

        setIsSaving(true);

        try {
            await router.post(route('admin.settings.update'), {
                settings: settingsToUpdate
            }, {
                onSuccess: () => {
                    toast.success('Pengaturan berhasil disimpan!');
                    setChangedSettings({});
                },
                onError: (errors) => {
                    toast.error('Gagal menyimpan pengaturan');
                    console.error(errors);
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });
        } catch (error) {
            setIsSaving(false);
            toast.error('Terjadi kesalahan');
        }
    };

    const hasChanges = Object.keys(changedSettings).length > 0;

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem" />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ═══════ HEADER - MATCHING DASHBOARD ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />

                    <div className="relative">
                        <div className="flex items-center gap-5 mb-6">
                            {/* Icon Header - NO CONTAINER */}
                            <img 
                                src={SettingsIcon} 
                                alt="Settings" 
                                className="h-16 w-16 object-contain"
                            />
                            <div>
                                <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
                                <p className="text-blue-100/80 mt-1">Kelola konfigurasi dan preferensi sistem</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Pengaturan', value: stats.total_settings, icon: Settings },
                                { label: 'Perubahan Hari Ini', value: stats.total_changes_today, icon: TrendingUp },
                                { label: 'Total Backup', value: stats.total_backups, icon: Database },
                                { label: 'Last Backup', value: stats.last_backup ? new Date(stats.last_backup).toLocaleDateString('id-ID') : 'Belum ada', icon: Clock },
                            ].map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-100/70">{stat.label}</p>
                                                <p className="text-lg font-bold">{stat.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ SEARCH & ACTIONS BAR ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 items-center justify-between"
                >
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Cari pengaturan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-xl"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHistoryDialog(true)}
                            className="rounded-xl"
                        >
                            <History className="h-4 w-4 mr-2" />
                            Riwayat
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBackupDialog(true)}
                            className="rounded-xl"
                        >
                            <Database className="h-4 w-4 mr-2" />
                            Backup
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get(route('admin.settings.export'))}
                            className="rounded-xl"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>

                        {hasChanges && (
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Simpan Perubahan ({Object.keys(changedSettings).length})
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* ═══════ CATEGORY TABS - MODERN CARDS ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4"
                >
                    {Object.entries(CATEGORIES).map(([key, config]) => {
                        const Icon = config.icon;
                        const isActive = activeCategory === key;
                        const categorySettings = filteredSettings[key] || [];
                        
                        return (
                            <motion.button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                                    isActive
                                        ? 'bg-white dark:bg-neutral-800 shadow-xl ring-2 ring-purple-500'
                                        : 'bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800'
                                } border border-neutral-200 dark:border-neutral-700`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-${isActive ? '10' : '5'}`} />
                                
                                <div className="relative space-y-3">
                                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mx-auto`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    
                                    <div className="text-center">
                                        <p className={`font-semibold text-sm ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                            {config.label}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {categorySettings.length} item
                                        </p>
                                    </div>
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* ═══════ SETTINGS CONTENT ═══════ */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        {/* Category Header */}
                        <div className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${CATEGORIES[activeCategory as keyof typeof CATEGORIES].color} flex items-center justify-center`}>
                                    {(() => {
                                        const Icon = CATEGORIES[activeCategory as keyof typeof CATEGORIES].icon;
                                        return <Icon className="h-7 w-7 text-white" />;
                                    })()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {CATEGORIES[activeCategory as keyof typeof CATEGORIES].label}
                                    </h2>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                        {CATEGORIES[activeCategory as keyof typeof CATEGORIES].description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Settings List */}
                        {filteredSettings[activeCategory]?.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredSettings[activeCategory].map((setting, idx) => (
                                    <SettingCard
                                        key={setting.id}
                                        setting={setting}
                                        value={changedSettings[setting.setting_key] ?? setting.setting_value}
                                        onChange={(value) => handleSettingChange(setting.setting_key, value)}
                                        isChanged={setting.setting_key in changedSettings}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-white dark:bg-neutral-800 p-12 text-center shadow-lg border border-neutral-200 dark:border-neutral-700">
                                <Settings className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {searchQuery ? 'Tidak ada pengaturan yang cocok dengan pencarian' : 'Tidak ada pengaturan di kategori ini'}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

            </motion.div>

            {/* ═══════ BACKUP DIALOG ═══════ */}
            <BackupDialog
                open={showBackupDialog}
                onClose={() => setShowBackupDialog(false)}
                backups={backups}
            />

            {/* ═══════ HISTORY DIALOG ═══════ */}
            <HistoryDialog
                open={showHistoryDialog}
                onClose={() => setShowHistoryDialog(false)}
                history={recentHistory}
            />
        </AdminLayout>
    );
}


### 4.2 Setting Card Component

```tsx
interface SettingCardProps {
    setting: Setting;
    value: any;
    onChange: (value: any) => void;
    isChanged: boolean;
    index: number;
}

function SettingCard({ setting, value, onChange, isChanged, index }: SettingCardProps) {
    const [showInfo, setShowInfo] = useState(false);

    const renderInput = () => {
        switch (setting.setting_type) {
            case 'boolean':
                return (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {value ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <Switch
                            checked={value === '1' || value === true}
                            onCheckedChange={(checked) => onChange(checked ? '1' : '0')}
                        />
                    </div>
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="rounded-xl"
                    />
                );

            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <Input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-12 w-20 rounded-xl cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 rounded-xl font-mono"
                            placeholder="#000000"
                        />
                    </div>
                );

            case 'file':
                return (
                    <div className="space-y-3">
                        {value && (
                            <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                <img 
                                    src={`/storage/${value}`} 
                                    alt="Preview" 
                                    className="w-full h-32 object-cover"
                                />
                            </div>
                        )}
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Handle file upload
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('setting_key', setting.setting_key);
                                    
                                    axios.post(route('admin.settings.upload-file'), formData)
                                        .then(response => {
                                            onChange(response.data.path);
                                            toast.success('File berhasil diupload!');
                                        })
                                        .catch(error => {
                                            toast.error('Gagal upload file');
                                        });
                                }
                            }}
                            className="rounded-xl"
                        />
                    </div>
                );

            case 'json':
                return (
                    <Textarea
                        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                onChange(parsed);
                            } catch {
                                onChange(e.target.value);
                            }
                        }}
                        rows={6}
                        className="rounded-xl font-mono text-sm"
                    />
                );

            default:
                if (setting.validation_rules?.in) {
                    // Dropdown for enum values
                    return (
                        <Select value={value} onValueChange={onChange}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {setting.validation_rules.in.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                }

                // Default text input
                return setting.description && setting.description.length > 100 ? (
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={4}
                        className="rounded-xl"
                    />
                ) : (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="rounded-xl"
                    />
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border-2 transition-all ${
                isChanged
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-neutral-200 dark:border-neutral-700'
            }`}
        >
            {/* Changed Indicator */}
            {isChanged && (
                <div className="absolute top-3 right-3">
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Diubah
                    </Badge>
                </div>
            )}

            {/* Requires Restart Indicator */}
            {setting.requires_restart && (
                <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Perlu Restart
                    </Badge>
                </div>
            )}

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {setting.label}
                        </h3>
                        {setting.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                                {setting.description}
                            </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-2 font-mono">
                            {setting.setting_key}
                        </p>
                    </div>

                    {setting.description && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowInfo(!showInfo)}
                            className="shrink-0"
                        >
                            <Info className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Info Panel */}
                <AnimatePresence>
                    {showInfo && setting.description && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {setting.description}
                                </p>
                                {setting.default_value && (
                                    <p className="text-xs text-neutral-500 mt-2">
                                        Default: <code className="bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">{setting.default_value}</code>
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input */}
                <div>
                    {renderInput()}
                </div>

                {/* Changed Info */}
                {setting.changed_by && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Clock className="h-3 w-3" />
                        <span>
                            Terakhir diubah oleh {setting.changed_by.name} pada {new Date(setting.changed_at).toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
```

### 4.3 Backup Dialog Component

```tsx
interface BackupDialogProps {
    open: boolean;
    onClose: () => void;
    backups: any[];
}

function BackupDialog({ open, onClose, backups }: BackupDialogProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [backupName, setBackupName] = useState('');
    const [backupDescription, setBackupDescription] = useState('');

    const handleCreateBackup = async () => {
        if (!backupName) {
            toast.error('Nama backup harus diisi');
            return;
        }

        setIsCreating(true);

        try {
            await router.post(route('admin.settings.create-backup'), {
                name: backupName,
                description: backupDescription,
            }, {
                onSuccess: () => {
                    toast.success('Backup berhasil dibuat!');
                    setBackupName('');
                    setBackupDescription('');
                    onClose();
                },
                onError: () => {
                    toast.error('Gagal membuat backup');
                },
                onFinish: () => {
                    setIsCreating(false);
                }
            });
        } catch (error) {
            setIsCreating(false);
            toast.error('Terjadi kesalahan');
        }
    };

    const handleRestore = async (backupId: number) => {
        if (!confirm('Apakah Anda yakin ingin restore backup ini? Pengaturan saat ini akan diganti.')) {
            return;
        }

        try {
            await router.post(route('admin.settings.restore-backup', backupId), {}, {
                onSuccess: () => {
                    toast.success('Backup berhasil di-restore!');
                    onClose();
                },
                onError: () => {
                    toast.error('Gagal restore backup');
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleDelete = async (backupId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus backup ini?')) {
            return;
        }

        try {
            await router.delete(route('admin.settings.delete-backup', backupId), {
                onSuccess: () => {
                    toast.success('Backup berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus backup');
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Database className="h-6 w-6 text-blue-600" />
                        Backup & Restore
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Create Backup Form */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Buat Backup Baru
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Nama Backup *</Label>
                                <Input
                                    value={backupName}
                                    onChange={(e) => setBackupName(e.target.value)}
                                    placeholder="e.g., Backup Sebelum Update"
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea
                                    value={backupDescription}
                                    onChange={(e) => setBackupDescription(e.target.value)}
                                    placeholder="Deskripsi backup (opsional)"
                                    rows={3}
                                    className="mt-2 rounded-xl"
                                />
                            </div>
                            <Button
                                onClick={handleCreateBackup}
                                disabled={isCreating}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600"
                            >
                                {isCreating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Database className="h-4 w-4 mr-2" />
                                )}
                                Buat Backup
                            </Button>
                        </div>
                    </div>

                    {/* Backup List */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Backup Tersedia</h3>
                        {backups.length === 0 ? (
                            <div className="text-center py-12 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                <Database className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                                <p className="text-neutral-600 dark:text-neutral-400">Belum ada backup</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {backups.map((backup) => (
                                    <div
                                        key={backup.id}
                                        className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                    {backup.backup_name}
                                                </h4>
                                                {backup.backup_description && (
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                        {backup.backup_description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(backup.created_at).toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Settings className="h-3 w-3" />
                                                        {backup.settings_count} pengaturan
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Archive className="h-3 w-3" />
                                                        {backup.formatted_size}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {backup.can_restore && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestore(backup.id)}
                                                        className="rounded-xl"
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Restore
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(backup.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
```


### 4.4 History Dialog Component

```tsx
interface HistoryDialogProps {
    open: boolean;
    onClose: () => void;
    history: any[];
}

function HistoryDialog({ open, onClose, history }: HistoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <History className="h-6 w-6 text-purple-600" />
                        Riwayat Perubahan
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                            <History className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400">Belum ada riwayat perubahan</p>
                        </div>
                    ) : (
                        history.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Timeline Dot */}
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            {item.change_type === 'create' && <Plus className="h-5 w-5 text-white" />}
                                            {item.change_type === 'update' && <Edit2 className="h-5 w-5 text-white" />}
                                            {item.change_type === 'delete' && <Trash2 className="h-5 w-5 text-white" />}
                                            {item.change_type === 'restore' && <RefreshCw className="h-5 w-5 text-white" />}
                                        </div>
                                        {idx < history.length - 1 && (
                                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-neutral-200 dark:bg-neutral-700" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                    {item.setting?.label || item.setting_key}
                                                </h4>
                                                <p className="text-xs text-neutral-500 font-mono mt-1">
                                                    {item.setting_key}
                                                </p>
                                            </div>
                                            <Badge className={
                                                item.change_type === 'create' ? 'bg-emerald-100 text-emerald-700' :
                                                item.change_type === 'update' ? 'bg-blue-100 text-blue-700' :
                                                item.change_type === 'delete' ? 'bg-red-100 text-red-700' :
                                                'bg-purple-100 text-purple-700'
                                            }>
                                                {item.change_type}
                                            </Badge>
                                        </div>

                                        {/* Change Details */}
                                        {item.change_type === 'update' && (
                                            <div className="mt-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-neutral-500 mb-1">Nilai Lama:</p>
                                                        <code className="text-red-600 dark:text-red-400 break-all">
                                                            {item.old_value || '-'}
                                                        </code>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-neutral-500 mb-1">Nilai Baru:</p>
                                                        <code className="text-emerald-600 dark:text-emerald-400 break-all">
                                                            {item.new_value || '-'}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {item.user?.name || 'System'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(item.created_at).toLocaleString('id-ID')}
                                            </span>
                                            {item.ip_address && (
                                                <span className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    {item.ip_address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('admin.settings.history'))}
                        className="rounded-xl"
                    >
                        Lihat Semua Riwayat
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

---

## 📋 PART 5: ROUTES CONFIGURATION

### 5.1 Web Routes

**File: `routes/web.php`**

```php
// Admin Routes - Settings
Route::middleware(['auth:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Main settings page
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/update', [SettingsController::class, 'update'])->name('settings.update');
    
    // File upload
    Route::post('/settings/upload-file', [SettingsController::class, 'uploadFile'])->name('settings.upload-file');
    
    // Backup & Restore
    Route::post('/settings/backup/create', [SettingsController::class, 'createBackup'])->name('settings.create-backup');
    Route::post('/settings/backup/{id}/restore', [SettingsController::class, 'restoreBackup'])->name('settings.restore-backup');
    Route::delete('/settings/backup/{id}', [SettingsController::class, 'deleteBackup'])->name('settings.delete-backup');
    
    // Import & Export
    Route::get('/settings/export', [SettingsController::class, 'exportSettings'])->name('settings.export');
    Route::post('/settings/import', [SettingsController::class, 'importSettings'])->name('settings.import');
    
    // History
    Route::get('/settings/history', [SettingsController::class, 'history'])->name('settings.history');
    
    // Email Templates
    Route::put('/settings/email-template/{id}', [SettingsController::class, 'updateEmailTemplate'])->name('settings.update-email-template');
    Route::post('/settings/email-template/{id}/test', [SettingsController::class, 'testEmailTemplate'])->name('settings.test-email-template');
    
    // System Maintenance
    Route::post('/settings/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.clear-cache');
    Route::post('/settings/optimize', [SettingsController::class, 'optimizeSystem'])->name('settings.optimize');
});
```

---

## 📋 PART 6: SEEDER FOR DEFAULT SETTINGS

### 6.1 Settings Seeder

**File: `database/seeders/SystemSettingsSeeder.php`**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;

class SystemSettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            // General Settings
            [
                'setting_key' => 'app_name',
                'setting_value' => 'UNPAM Learning System',
                'setting_type' => 'string',
                'category' => 'general',
                'label' => 'Nama Aplikasi',
                'description' => 'Nama aplikasi yang ditampilkan di seluruh sistem',
                'default_value' => 'UNPAM Learning System',
            ],
            [
                'setting_key' => 'app_description',
                'setting_value' => 'Sistem Pembelajaran Online Universitas Pamulang',
                'setting_type' => 'string',
                'category' => 'general',
                'label' => 'Deskripsi Aplikasi',
                'description' => 'Deskripsi singkat tentang aplikasi',
                'default_value' => '',
            ],
            [
                'setting_key' => 'timezone',
                'setting_value' => 'Asia/Jakarta',
                'setting_type' => 'string',
                'category' => 'general',
                'label' => 'Timezone',
                'description' => 'Zona waktu yang digunakan sistem',
                'validation_rules' => ['in' => ['Asia/Jakarta', 'UTC', 'Asia/Singapore']],
                'default_value' => 'Asia/Jakarta',
            ],
            [
                'setting_key' => 'date_format',
                'setting_value' => 'd/m/Y',
                'setting_type' => 'string',
                'category' => 'general',
                'label' => 'Format Tanggal',
                'description' => 'Format tampilan tanggal',
                'validation_rules' => ['in' => ['d/m/Y', 'Y-m-d', 'm/d/Y']],
                'default_value' => 'd/m/Y',
            ],
            [
                'setting_key' => 'maintenance_mode',
                'setting_value' => '0',
                'setting_type' => 'boolean',
                'category' => 'general',
                'label' => 'Mode Maintenance',
                'description' => 'Aktifkan mode maintenance untuk menonaktifkan akses sementara',
                'default_value' => '0',
                'requires_restart' => true,
            ],

            // Appearance Settings
            [
                'setting_key' => 'primary_color',
                'setting_value' => '#6366f1',
                'setting_type' => 'color',
                'category' => 'appearance',
                'label' => 'Warna Utama',
                'description' => 'Warna utama tema aplikasi',
                'default_value' => '#6366f1',
            ],
            [
                'setting_key' => 'secondary_color',
                'setting_value' => '#8b5cf6',
                'setting_type' => 'color',
                'category' => 'appearance',
                'label' => 'Warna Sekunder',
                'description' => 'Warna sekunder tema aplikasi',
                'default_value' => '#8b5cf6',
            ],
            [
                'setting_key' => 'logo',
                'setting_value' => '',
                'setting_type' => 'file',
                'category' => 'appearance',
                'label' => 'Logo Aplikasi',
                'description' => 'Logo yang ditampilkan di header',
                'default_value' => '',
            ],
            [
                'setting_key' => 'favicon',
                'setting_value' => '',
                'setting_type' => 'file',
                'category' => 'appearance',
                'label' => 'Favicon',
                'description' => 'Icon yang ditampilkan di browser tab',
                'default_value' => '',
            ],
            [
                'setting_key' => 'dark_mode_enabled',
                'setting_value' => '1',
                'setting_type' => 'boolean',
                'category' => 'appearance',
                'label' => 'Dark Mode',
                'description' => 'Aktifkan opsi dark mode untuk pengguna',
                'default_value' => '1',
            ],

            // Email Settings
            [
                'setting_key' => 'mail_driver',
                'setting_value' => 'smtp',
                'setting_type' => 'string',
                'category' => 'email',
                'label' => 'Mail Driver',
                'description' => 'Driver untuk mengirim email',
                'validation_rules' => ['in' => ['smtp', 'sendmail', 'mailgun', 'ses']],
                'default_value' => 'smtp',
                'requires_restart' => true,
            ],
            [
                'setting_key' => 'mail_host',
                'setting_value' => 'smtp.gmail.com',
                'setting_type' => 'string',
                'category' => 'email',
                'label' => 'SMTP Host',
                'description' => 'Host server SMTP',
                'default_value' => 'smtp.gmail.com',
                'requires_restart' => true,
            ],
            [
                'setting_key' => 'mail_port',
                'setting_value' => '587',
                'setting_type' => 'number',
                'category' => 'email',
                'label' => 'SMTP Port',
                'description' => 'Port server SMTP',
                'default_value' => '587',
                'requires_restart' => true,
            ],
            [
                'setting_key' => 'mail_from_address',
                'setting_value' => 'noreply@unpam.ac.id',
                'setting_type' => 'email',
                'category' => 'email',
                'label' => 'Email Pengirim',
                'description' => 'Alamat email pengirim default',
                'validation_rules' => ['email'],
                'default_value' => 'noreply@unpam.ac.id',
            ],
            [
                'setting_key' => 'mail_from_name',
                'setting_value' => 'UNPAM Learning System',
                'setting_type' => 'string',
                'category' => 'email',
                'label' => 'Nama Pengirim',
                'description' => 'Nama pengirim email default',
                'default_value' => 'UNPAM Learning System',
            ],

            // Notification Settings
            [
                'setting_key' => 'notifications_enabled',
                'setting_value' => '1',
                'setting_type' => 'boolean',
                'category' => 'notification',
                'label' => 'Notifikasi Aktif',
                'description' => 'Aktifkan sistem notifikasi',
                'default_value' => '1',
            ],
            [
                'setting_key' => 'email_notifications',
                'setting_value' => '1',
                'setting_type' => 'boolean',
                'category' => 'notification',
                'label' => 'Notifikasi Email',
                'description' => 'Kirim notifikasi via email',
                'default_value' => '1',
            ],
            [
                'setting_key' => 'push_notifications',
                'setting_value' => '1',
                'setting_type' => 'boolean',
                'category' => 'notification',
                'label' => 'Push Notifications',
                'description' => 'Kirim push notifications ke browser',
                'default_value' => '1',
            ],

            // Security Settings
            [
                'setting_key' => 'password_min_length',
                'setting_value' => '8',
                'setting_type' => 'number',
                'category' => 'security',
                'label' => 'Panjang Minimum Password',
                'description' => 'Jumlah karakter minimum untuk password',
                'validation_rules' => ['min:6', 'max:20'],
                'default_value' => '8',
            ],
            [
                'setting_key' => 'session_lifetime',
                'setting_value' => '120',
                'setting_type' => 'number',
                'category' => 'security',
                'label' => 'Session Lifetime (menit)',
                'description' => 'Durasi session sebelum logout otomatis',
                'default_value' => '120',
                'requires_restart' => true,
            ],
            [
                'setting_key' => 'two_factor_enabled',
                'setting_value' => '0',
                'setting_type' => 'boolean',
                'category' => 'security',
                'label' => 'Two-Factor Authentication',
                'description' => 'Aktifkan autentikasi dua faktor',
                'default_value' => '0',
            ],
            [
                'setting_key' => 'max_login_attempts',
                'setting_value' => '5',
                'setting_type' => 'number',
                'category' => 'security',
                'label' => 'Maksimal Percobaan Login',
                'description' => 'Jumlah maksimal percobaan login sebelum akun dikunci',
                'validation_rules' => ['min:3', 'max:10'],
                'default_value' => '5',
            ],

            // System Settings
            [
                'setting_key' => 'cache_enabled',
                'setting_value' => '1',
                'setting_type' => 'boolean',
                'category' => 'system',
                'label' => 'Cache Aktif',
                'description' => 'Aktifkan caching untuk performa lebih baik',
                'default_value' => '1',
                'requires_restart' => true,
            ],
            [
                'setting_key' => 'debug_mode',
                'setting_value' => '0',
                'setting_type' => 'boolean',
                'category' => 'system',
                'label' => 'Debug Mode',
                'description' => 'Aktifkan mode debug (hanya untuk development)',
                'default_value' => '0',
                'requires_restart' => true,
            ],
            [
                'setting_key' => 'log_level',
                'setting_value' => 'error',
                'setting_type' => 'string',
                'category' => 'system',
                'label' => 'Log Level',
                'description' => 'Level logging sistem',
                'validation_rules' => ['in' => ['debug', 'info', 'warning', 'error']],
                'default_value' => 'error',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['setting_key' => $setting['setting_key']],
                $setting
            );
        }
    }
}
```

---

## 📋 PART 7: ADDITIONAL FEATURES

### 7.1 System Maintenance Tools

Add these methods to the SettingsController for system maintenance:

```php
public function getSystemStatus()
{
    return response()->json([
        'disk_usage' => [
            'total' => disk_total_space('/'),
            'free' => disk_free_space('/'),
            'used' => disk_total_space('/') - disk_free_space('/'),
        ],
        'memory_usage' => [
            'current' => memory_get_usage(true),
            'peak' => memory_get_peak_usage(true),
        ],
        'cache_size' => $this->getCacheSize(),
        'log_size' => $this->getLogSize(),
        'database_size' => $this->getDatabaseSize(),
    ]);
}

private function getCacheSize()
{
    $path = storage_path('framework/cache');
    return $this->getDirectorySize($path);
}

private function getLogSize()
{
    $path = storage_path('logs');
    return $this->getDirectorySize($path);
}

private function getDirectorySize($path)
{
    $size = 0;
    foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path)) as $file) {
        $size += $file->getSize();
    }
    return $size;
}

private function getDatabaseSize()
{
    $database = config('database.connections.mysql.database');
    $result = \DB::select("
        SELECT SUM(data_length + index_length) as size
        FROM information_schema.TABLES
        WHERE table_schema = ?
    ", [$database]);
    
    return $result[0]->size ?? 0;
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Database & Backend
- [ ] Create all database tables (settings, history, backups, templates, preferences)
- [ ] Implement all Laravel models with relationships
- [ ] Create SettingsController with all methods
- [ ] Run SystemSettingsSeeder
- [ ] Test all CRUD operations
- [ ] Test backup & restore functionality
- [ ] Test import & export
- [ ] Implement caching strategy

### Frontend
- [ ] Build modern card-based settings page
- [ ] Implement category tabs with icons
- [ ] Create SettingCard component for each setting type
- [ ] Build BackupDialog component
- [ ] Build HistoryDialog component
- [ ] Implement search functionality
- [ ] Add real-time validation
- [ ] Test all input types (text, number, boolean, color, file, json)
- [ ] Test mobile responsiveness
- [ ] Add smooth animations

### Features
- [ ] Setting value validation
- [ ] File upload for logo/favicon
- [ ] Color picker for theme colors
- [ ] JSON editor for complex settings
- [ ] Backup creation & restoration
- [ ] Settings history tracking
- [ ] Import/Export functionality
- [ ] Email template editor
- [ ] System maintenance tools
- [ ] Cache management

### Testing
- [ ] Test all setting types
- [ ] Test validation rules
- [ ] Test backup & restore
- [ ] Test import & export
- [ ] Test file uploads
- [ ] Test permissions
- [ ] Performance testing
- [ ] Mobile testing
- [ ] Security audit

---

## 📝 FINAL NOTES

**UI/UX Requirements (CRITICAL):**
- ✅ Warna, animasi, style SAMA dengan dashboard admin
- ✅ Modern card-based layout (bukan list tradisional)
- ✅ Icon header TANPA container background
- ✅ Interactive elements dengan smooth animations
- ✅ Responsive mobile design
- ✅ Gradient backgrounds untuk sections
- ✅ Hover effects yang menarik
- ✅ Loading states yang smooth
- ✅ Toast notifications untuk feedback

**Advanced Features:**
- Modern category-based navigation
- Real-time setting changes tracking
- Backup & restore system
- Complete audit trail
- Import/Export functionality
- Email template management
- System maintenance tools
- Performance monitoring
- Security settings
- Integration management

**Performance:**
- Efficient caching strategy
- Optimized database queries
- Fast search functionality
- Lazy loading for large lists
- Debounced auto-save

---

**END OF PROMPT - PENGATURAN ADMIN ULTRA ADVANCED**
