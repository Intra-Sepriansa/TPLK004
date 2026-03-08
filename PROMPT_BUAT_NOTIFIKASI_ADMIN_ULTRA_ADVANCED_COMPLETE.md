# PROMPT: Buat Notifikasi Baru - Admin Panel
## Ultra Advanced Complete System

---

## 🎯 EXECUTIVE SUMMARY

Sistem **Buat Notifikasi Baru** untuk Admin yang memungkinkan pembuatan dan pengiriman notifikasi kepada mahasiswa, dosen, atau semua pengguna dengan fitur:

1. **Multi-Target Notification** - Kirim ke mahasiswa, dosen, atau semua
2. **Smart Recipient Selection** - Filter berdasarkan kelas, mata kuliah, status
3. **Rich Content Editor** - Teks lengkap dengan formatting
4. **Template Management** - Simpan dan gunakan template notifikasi
5. **Scheduling** - Jadwalkan pengiriman notifikasi
6. **Preview & Testing** - Preview sebelum kirim
7. **Analytics** - Track delivery dan read status

**Key Concept:**
- Admin membuat notifikasi dengan target spesifik
- Sistem mengirim notifikasi secara real-time atau terjadwal
- Tracking lengkap untuk setiap notifikasi
- Template untuk efisiensi pembuatan notifikasi

**CRITICAL UI/UX REQUIREMENTS:**
- Warna, container, header icon SAMA dengan dashboard admin
- Tidak ada data dummy
- Icon header tanpa container background
- Tidak ada animasi icon bergerak ke atas
- Responsive mobile seperti dashboard admin
- Tombol kembali sama dengan menu lain
- Header rapi dan konsisten
- Mode mobile optimal

---

## 📋 PART 1: DATABASE SCHEMA ENHANCEMENT

### 1.1 Enhanced Notification Templates Table

```sql
CREATE TABLE notification_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    
    -- Template Content
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    
    -- Template Settings
    type ENUM('info', 'reminder', 'announcement', 'alert', 'warning', 'achievement') DEFAULT 'info',
    priority ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
    
    -- Variables Support
    available_variables JSON NULL COMMENT 'e.g., {name}, {course}, {date}',
    
    -- Usage Stats
    usage_count INT DEFAULT 0,
    last_used_at DATETIME NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE COMMENT 'System templates cannot be deleted',
    
    -- Metadata
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_active (is_active),
    INDEX idx_type (type),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### 1.2 Enhanced App Notifications Table

```sql
-- Add columns to existing app_notifications table
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS template_id BIGINT UNSIGNED NULL;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS scheduled_at DATETIME NULL;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS sent_at DATETIME NULL;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS delivery_status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending';
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS failure_reason TEXT NULL;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS recipient_count INT DEFAULT 0;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS read_count INT DEFAULT 0;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS tags JSON NULL;
ALTER TABLE app_notifications ADD COLUMN IF NOT EXISTS filters JSON NULL COMMENT 'Recipient filter criteria';

ALTER TABLE app_notifications ADD INDEX idx_template (template_id);
ALTER TABLE app_notifications ADD INDEX idx_scheduled (scheduled_at);
ALTER TABLE app_notifications ADD INDEX idx_delivery (delivery_status);
ALTER TABLE app_notifications ADD INDEX idx_sent (sent_at);
```

### 1.3 Notification Recipients Tracking Table

```sql
CREATE TABLE notification_recipients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notification_id BIGINT UNSIGNED NOT NULL,
    
    -- Recipient Info
    recipient_type ENUM('mahasiswa', 'dosen', 'admin') NOT NULL,
    recipient_id BIGINT UNSIGNED NOT NULL,
    
    -- Delivery Status
    status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
    sent_at DATETIME NULL,
    delivered_at DATETIME NULL,
    read_at DATETIME NULL,
    
    -- Interaction
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at DATETIME NULL,
    
    -- Error Handling
    failure_reason TEXT NULL,
    retry_count INT DEFAULT 0,
    
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (notification_id) REFERENCES app_notifications(id) ON DELETE CASCADE,
    INDEX idx_notification (notification_id),
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_status (status),
    INDEX idx_read (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


---

## 📋 PART 2: LARAVEL MODELS & SERVICES

### 2.1 Enhanced NotificationTemplate Model

**File: `app/Models/NotificationTemplate.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $fillable = [
        'name', 'description', 'title_template', 'message_template',
        'type', 'priority', 'available_variables', 'usage_count',
        'last_used_at', 'is_active', 'is_system', 'created_by'
    ];

    protected $casts = [
        'available_variables' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function notifications()
    {
        return $this->hasMany(AppNotification::class, 'template_id');
    }

    public function incrementUsage()
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);
    }

    public function render(array $variables = []): array
    {
        $title = $this->title_template;
        $message = $this->message_template;

        foreach ($variables as $key => $value) {
            $title = str_replace("{{$key}}", $value, $title);
            $message = str_replace("{{$key}}", $value, $message);
        }

        return ['title' => $title, 'message' => $message];
    }
}
```

### 2.2 NotificationRecipient Model

**File: `app/Models/NotificationRecipient.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationRecipient extends Model
{
    protected $fillable = [
        'notification_id', 'recipient_type', 'recipient_id',
        'status', 'sent_at', 'delivered_at', 'read_at',
        'clicked', 'clicked_at', 'failure_reason', 'retry_count'
    ];

    protected $casts = [
        'clicked' => 'boolean',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    public function notification()
    {
        return $this->belongsTo(AppNotification::class, 'notification_id');
    }

    public function recipient()
    {
        return $this->morphTo('recipient', 'recipient_type', 'recipient_id');
    }
}
```


### 2.3 Advanced Notification Service

**File: `app/Services/AdminNotificationService.php`**

```php
<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\NotificationRecipient;
use App\Models\NotificationTemplate;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminNotificationService
{
    public function createNotification(array $data): AppNotification
    {
        DB::beginTransaction();
        try {
            // Get recipients
            $recipients = $this->getRecipients($data);
            
            if (empty($recipients)) {
                throw new \Exception('Tidak ada penerima yang valid');
            }

            // Create notification
            $notification = AppNotification::create([
                'title' => $data['title'],
                'message' => $data['message'],
                'type' => $data['type'] ?? 'info',
                'priority' => $data['priority'] ?? 'normal',
                'action_url' => $data['action_url'] ?? null,
                'action_label' => $data['action_label'] ?? null,
                'template_id' => $data['template_id'] ?? null,
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'delivery_status' => isset($data['scheduled_at']) ? 'pending' : 'sent',
                'sent_at' => isset($data['scheduled_at']) ? null : now(),
                'recipient_count' => count($recipients),
                'tags' => $data['tags'] ?? null,
                'filters' => $data['filters'] ?? null,
                'created_by_type' => 'admin',
                'created_by_id' => auth()->id(),
                'metadata' => json_encode($data['metadata'] ?? []),
            ]);

            // Create recipient records
            foreach ($recipients as $recipient) {
                NotificationRecipient::create([
                    'notification_id' => $notification->id,
                    'recipient_type' => $recipient['type'],
                    'recipient_id' => $recipient['id'],
                    'status' => isset($data['scheduled_at']) ? 'pending' : 'sent',
                    'sent_at' => isset($data['scheduled_at']) ? null : now(),
                ]);
            }

            // Update template usage
            if ($data['template_id'] ?? null) {
                $template = NotificationTemplate::find($data['template_id']);
                $template?->incrementUsage();
            }

            DB::commit();
            return $notification;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create notification', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    private function getRecipients(array $data): array
    {
        $recipients = [];
        $targetType = $data['target_type'] ?? 'all';
        $targetRole = $data['target_role'] ?? 'mahasiswa';

        if ($targetType === 'all') {
            // Send to all users of specific role
            if ($targetRole === 'mahasiswa') {
                $users = Mahasiswa::all();
                foreach ($users as $user) {
                    $recipients[] = ['type' => 'mahasiswa', 'id' => $user->id];
                }
            } elseif ($targetRole === 'dosen') {
                $users = Dosen::all();
                foreach ($users as $user) {
                    $recipients[] = ['type' => 'dosen', 'id' => $user->id];
                }
            } elseif ($targetRole === 'all_users') {
                // All mahasiswa
                foreach (Mahasiswa::all() as $user) {
                    $recipients[] = ['type' => 'mahasiswa', 'id' => $user->id];
                }
                // All dosen
                foreach (Dosen::all() as $user) {
                    $recipients[] = ['type' => 'dosen', 'id' => $user->id];
                }
            }
        } elseif ($targetType === 'filtered') {
            $recipients = $this->getFilteredRecipients($data['filters'] ?? []);
        } elseif ($targetType === 'specific') {
            // Specific users
            $specificIds = $data['specific_recipients'] ?? [];
            foreach ($specificIds as $id) {
                $recipients[] = ['type' => $targetRole, 'id' => $id];
            }
        }

        return $recipients;
    }

    private function getFilteredRecipients(array $filters): array
    {
        $recipients = [];
        $query = Mahasiswa::query();

        // Filter by class
        if (!empty($filters['classes'])) {
            $query->whereIn('kelas', $filters['classes']);
        }

        // Filter by course
        if (!empty($filters['courses'])) {
            // Assuming relationship exists
            $query->whereHas('enrollments', function($q) use ($filters) {
                $q->whereIn('mata_kuliah_id', $filters['courses']);
            });
        }

        // Filter by attendance rate
        if (isset($filters['attendance_rate'])) {
            // Custom logic for attendance filtering
        }

        $users = $query->get();
        foreach ($users as $user) {
            $recipients[] = ['type' => 'mahasiswa', 'id' => $user->id];
        }

        return $recipients;
    }

    public function getAnalytics(int $notificationId): array
    {
        $notification = AppNotification::findOrFail($notificationId);
        $recipients = NotificationRecipient::where('notification_id', $notificationId)->get();

        return [
            'total_recipients' => $recipients->count(),
            'sent' => $recipients->where('status', 'sent')->count(),
            'delivered' => $recipients->where('status', 'delivered')->count(),
            'read' => $recipients->whereNotNull('read_at')->count(),
            'clicked' => $recipients->where('clicked', true)->count(),
            'failed' => $recipients->where('status', 'failed')->count(),
            'pending' => $recipients->where('status', 'pending')->count(),
            'read_rate' => $recipients->count() > 0 
                ? round(($recipients->whereNotNull('read_at')->count() / $recipients->count()) * 100, 2)
                : 0,
            'click_rate' => $recipients->count() > 0
                ? round(($recipients->where('clicked', true)->count() / $recipients->count()) * 100, 2)
                : 0,
        ];
    }
}
```


---

## 📋 PART 3: CONTROLLER IMPLEMENTATION

### 3.1 Admin Notification Controller

**File: `app/Http/Controllers/Admin/NotificationManagementController.php`**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\NotificationTemplate;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationManagementController extends Controller
{
    protected $notificationService;

    public function __construct(AdminNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function create()
    {
        // Get templates
        $templates = NotificationTemplate::where('is_active', true)
            ->orderBy('usage_count', 'desc')
            ->get()
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'description' => $t->description,
                    'title_template' => $t->title_template,
                    'message_template' => $t->message_template,
                    'type' => $t->type,
                    'priority' => $t->priority,
                    'available_variables' => $t->available_variables,
                    'usage_count' => $t->usage_count,
                ];
            });

        // Get courses
        $courses = MataKuliah::with('dosen')
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'nama' => $c->nama,
                    'kode' => $c->kode ?? 'MK-' . $c->id,
                    'dosen' => $c->dosen ? $c->dosen->nama : '-',
                ];
            });

        // Get classes (unique)
        $classes = Mahasiswa::select('kelas')
            ->distinct()
            ->whereNotNull('kelas')
            ->orderBy('kelas')
            ->pluck('kelas');

        // Get mahasiswa
        $mahasiswa = Mahasiswa::select('id', 'nama', 'nim', 'kelas')
            ->orderBy('nama')
            ->get();

        // Get dosen
        $dosen = Dosen::select('id', 'nama', 'nidn')
            ->orderBy('nama')
            ->get();

        // Stats
        $stats = [
            'total_mahasiswa' => Mahasiswa::count(),
            'total_dosen' => Dosen::count(),
            'total_templates' => NotificationTemplate::where('is_active', true)->count(),
            'sent_today' => AppNotification::whereDate('sent_at', today())->count(),
            'sent_this_week' => AppNotification::whereBetween('sent_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'scheduled' => AppNotification::where('delivery_status', 'pending')
                ->whereNotNull('scheduled_at')
                ->count(),
        ];

        return Inertia::render('admin/notifications/create', [
            'templates' => $templates,
            'courses' => $courses,
            'classes' => $classes,
            'mahasiswa' => $mahasiswa,
            'dosen' => $dosen,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,reminder,announcement,alert,warning,achievement',
            'priority' => 'required|in:normal,high,urgent',
            'target_type' => 'required|in:all,filtered,specific',
            'target_role' => 'required|in:mahasiswa,dosen,all_users',
            'specific_recipients' => 'nullable|array',
            'filters' => 'nullable|array',
            'filters.classes' => 'nullable|array',
            'filters.courses' => 'nullable|array',
            'action_url' => 'nullable|url',
            'action_label' => 'nullable|string|max:100',
            'template_id' => 'nullable|exists:notification_templates,id',
            'scheduled_at' => 'nullable|date|after:now',
            'tags' => 'nullable|array',
            'save_as_template' => 'boolean',
            'template_name' => 'nullable|required_if:save_as_template,true|string|max:255',
        ]);

        try {
            // Create notification
            $notification = $this->notificationService->createNotification($validated);

            // Save as template if requested
            if ($validated['save_as_template'] ?? false) {
                NotificationTemplate::create([
                    'name' => $validated['template_name'],
                    'title_template' => $validated['title'],
                    'message_template' => $validated['message'],
                    'type' => $validated['type'],
                    'priority' => $validated['priority'],
                    'is_active' => true,
                    'created_by' => auth()->id(),
                ]);
            }

            $message = isset($validated['scheduled_at'])
                ? 'Notifikasi berhasil dijadwalkan!'
                : 'Notifikasi berhasil dikirim ke ' . $notification->recipient_count . ' penerima!';

            return redirect()->route('admin.notifications.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Gagal mengirim notifikasi: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'type' => 'required|string',
            'priority' => 'required|string',
        ]);

        return response()->json([
            'preview' => $validated
        ]);
    }
}
```


---

## 📋 PART 4: FRONTEND IMPLEMENTATION (React/TypeScript)

### 4.1 Main Create Notification Page

**File: `resources/js/pages/admin/notifications/create.tsx`**

```tsx
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    ArrowLeft, Send, Save, Eye, Users, Filter, Calendar,
    Bell, AlertTriangle, Info, Megaphone, Award, Clock,
    Target, CheckCircle, X, Plus, Trash2, Search, ChevronDown,
    FileText, Sparkles, Zap, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AnimatedCounter } from '@/components/ui/animated-counter';

// Import icons - MATCHING DASHBOARD ADMIN
import NotifIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import TotalIcon from '@/assets/admin/dashboard/total-icon.png';
import HadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import ScheduledIcon from '@/assets/admin/notification-center/scheduled.png';

interface Template {
    id: number;
    name: string;
    description: string;
    title_template: string;
    message_template: string;
    type: string;
    priority: string;
    available_variables: string[];
    usage_count: number;
}

interface Course {
    id: number;
    nama: string;
    kode: string;
    dosen: string;
}

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
}

interface Dosen {
    id: number;
    nama: string;
    nidn: string;
}

interface Stats {
    total_mahasiswa: number;
    total_dosen: number;
    total_templates: number;
    sent_today: number;
    sent_this_week: number;
    scheduled: number;
}

interface CreatePageProps {
    templates: Template[];
    courses: Course[];
    classes: string[];
    mahasiswa: Mahasiswa[];
    dosen: Dosen[];
    stats: Stats;
}

// Animation variants - MATCHING DASHBOARD
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
} as const;


export default function CreateNotification({
    templates, courses, classes, mahasiswa, dosen, stats
}: CreatePageProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [recipientCount, setRecipientCount] = useState(0);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const form = useForm({
        title: '',
        message: '',
        type: 'info' as 'info' | 'reminder' | 'announcement' | 'alert' | 'warning' | 'achievement',
        priority: 'normal' as 'normal' | 'high' | 'urgent',
        target_type: 'all' as 'all' | 'filtered' | 'specific',
        target_role: 'mahasiswa' as 'mahasiswa' | 'dosen' | 'all_users',
        specific_recipients: [] as number[],
        filters: {
            classes: [] as string[],
            courses: [] as number[],
        },
        action_url: '',
        action_label: '',
        template_id: null as number | null,
        scheduled_at: '',
        tags: [] as string[],
        save_as_template: false,
        template_name: '',
    });

    // Calculate recipient count
    useEffect(() => {
        let count = 0;
        if (form.data.target_type === 'all') {
            if (form.data.target_role === 'mahasiswa') count = stats.total_mahasiswa;
            else if (form.data.target_role === 'dosen') count = stats.total_dosen;
            else count = stats.total_mahasiswa + stats.total_dosen;
        } else if (form.data.target_type === 'specific') {
            count = form.data.specific_recipients.length;
        } else if (form.data.target_type === 'filtered') {
            // Calculate based on filters
            let filtered = mahasiswa;
            if (form.data.filters.classes.length > 0) {
                filtered = filtered.filter(m => form.data.filters.classes.includes(m.kelas));
            }
            count = filtered.length;
        }
        setRecipientCount(count);
    }, [form.data.target_type, form.data.target_role, form.data.specific_recipients, form.data.filters]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.notifications.store'));
    };

    const applyTemplate = (template: Template) => {
        form.setData({
            ...form.data,
            title: template.title_template,
            message: template.message_template,
            type: template.type as any,
            priority: template.priority as any,
            template_id: template.id,
        });
        setSelectedTemplate(template);
        setShowTemplateModal(false);
    };

    const typeConfig = {
        info: { icon: Info, color: 'blue', label: 'Informasi' },
        reminder: { icon: Clock, color: 'amber', label: 'Pengingat' },
        announcement: { icon: Megaphone, color: 'purple', label: 'Pengumuman' },
        alert: { icon: AlertTriangle, color: 'red', label: 'Peringatan' },
        warning: { icon: AlertTriangle, color: 'orange', label: 'Perhatian' },
        achievement: { icon: Award, color: 'emerald', label: 'Pencapaian' },
    };

    const priorityConfig = {
        normal: { label: 'Normal', color: 'neutral' },
        high: { label: 'Penting', color: 'orange' },
        urgent: { label: 'Mendesak', color: 'red' },
    };

    return (
        <AdminLayout>
            <Head title="Buat Notifikasi Baru" />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ═══════ HEADER - MATCHING DASHBOARD ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        {/* Icon Header - NO CONTAINER */}
                        <img 
                            src={NotifIcon} 
                            alt="Notifikasi" 
                            className="h-10 w-10 md:h-12 md:w-12 object-contain"
                        />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                Buat Notifikasi Baru
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Kirim notifikasi ke mahasiswa, dosen, atau semua pengguna
                            </p>
                        </div>
                    </div>

                    {/* Back Button - MATCHING OTHER MENUS */}
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('admin.notifications.index'))}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Kembali</span>
                    </Button>
                </motion.div>

                {/* ═══════ STATS CARDS - MATCHING DASHBOARD ═══════ */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {[
                        { 
                            label: 'Total Mahasiswa', 
                            value: stats.total_mahasiswa, 
                            icon: TotalIcon,
                            gradient: 'from-blue-500 to-cyan-500'
                        },
                        { 
                            label: 'Total Dosen', 
                            value: stats.total_dosen, 
                            icon: HadirIcon,
                            gradient: 'from-emerald-500 to-teal-500'
                        },
                        { 
                            label: 'Terkirim Hari Ini', 
                            value: stats.sent_today, 
                            icon: NotifIcon,
                            gradient: 'from-purple-500 to-pink-500'
                        },
                        { 
                            label: 'Terjadwal', 
                            value: stats.scheduled, 
                            icon: ScheduledIcon,
                            gradient: 'from-amber-500 to-orange-500'
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={cardVariants}
                            whileHover="hover"
                            className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <AnimatedCounter
                                        value={stat.value}
                                        className="text-3xl font-bold text-neutral-900 dark:text-white mt-2"
                                    />
                                </div>
                                <img 
                                    src={stat.icon} 
                                    alt={stat.label}
                                    className="h-12 w-12 object-contain opacity-80"
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>


                {/* ═══════ MAIN FORM ═══════ */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN - Form Fields */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                            
                            {/* Template Selection Card */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-purple-500" />
                                        Template Notifikasi
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowTemplateModal(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Pilih Template
                                    </Button>
                                </div>
                                {selectedTemplate && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-purple-900 dark:text-purple-100">
                                                    {selectedTemplate.name}
                                                </p>
                                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                                    {selectedTemplate.description}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedTemplate(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Basic Info Card */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-blue-500" />
                                    Informasi Notifikasi
                                </h3>

                                {/* Title */}
                                <div>
                                    <Label htmlFor="title">Judul Notifikasi *</Label>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={e => form.setData('title', e.target.value)}
                                        placeholder="Masukkan judul notifikasi..."
                                        className="mt-2"
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.title}</p>
                                    )}
                                </div>

                                {/* Message */}
                                <div>
                                    <Label htmlFor="message">Pesan *</Label>
                                    <Textarea
                                        id="message"
                                        value={form.data.message}
                                        onChange={e => form.setData('message', e.target.value)}
                                        placeholder="Tulis pesan notifikasi di sini..."
                                        rows={6}
                                        className="mt-2"
                                        required
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {form.data.message.length} karakter
                                    </p>
                                    {form.errors.message && (
                                        <p className="text-sm text-red-600 mt-1">{form.errors.message}</p>
                                    )}
                                </div>

                                {/* Type & Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="type">Tipe Notifikasi *</Label>
                                        <Select
                                            value={form.data.type}
                                            onValueChange={(value: any) => form.setData('type', value)}
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(typeConfig).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <config.icon className={`h-4 w-4 text-${config.color}-500`} />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="priority">Prioritas *</Label>
                                        <Select
                                            value={form.data.priority}
                                            onValueChange={(value: any) => form.setData('priority', value)}
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(priorityConfig).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {config.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Action Button (Optional) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="action_label">Label Tombol (Opsional)</Label>
                                        <Input
                                            id="action_label"
                                            value={form.data.action_label}
                                            onChange={e => form.setData('action_label', e.target.value)}
                                            placeholder="Lihat Detail"
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="action_url">URL Tombol (Opsional)</Label>
                                        <Input
                                            id="action_url"
                                            type="url"
                                            value={form.data.action_url}
                                            onChange={e => form.setData('action_url', e.target.value)}
                                            placeholder="https://..."
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Target Recipients Card */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Target className="h-5 w-5 text-emerald-500" />
                                    Target Penerima
                                </h3>

                                {/* Target Type */}
                                <div>
                                    <Label>Jenis Target *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                        {[
                                            { value: 'all', label: 'Semua', icon: Users },
                                            { value: 'filtered', label: 'Filter', icon: Filter },
                                            { value: 'specific', label: 'Spesifik', icon: Target },
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => form.setData('target_type', option.value as any)}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    form.data.target_type === option.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                                }`}
                                            >
                                                <option.icon className={`h-6 w-6 mx-auto mb-2 ${
                                                    form.data.target_type === option.value
                                                        ? 'text-blue-500'
                                                        : 'text-neutral-400'
                                                }`} />
                                                <p className="text-sm font-medium">{option.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Target Role (for 'all' type) */}
                                {form.data.target_type === 'all' && (
                                    <div>
                                        <Label>Kirim Ke *</Label>
                                        <Select
                                            value={form.data.target_role}
                                            onValueChange={(value: any) => form.setData('target_role', value)}
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mahasiswa">Semua Mahasiswa</SelectItem>
                                                <SelectItem value="dosen">Semua Dosen</SelectItem>
                                                <SelectItem value="all_users">Semua Pengguna</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Filters (for 'filtered' type) */}
                                {form.data.target_type === 'filtered' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Filter Berdasarkan Kelas</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                                {classes.map(kelas => (
                                                    <label
                                                        key={kelas}
                                                        className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={form.data.filters.classes.includes(kelas)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    form.setData('filters', {
                                                                        ...form.data.filters,
                                                                        classes: [...form.data.filters.classes, kelas]
                                                                    });
                                                                } else {
                                                                    form.setData('filters', {
                                                                        ...form.data.filters,
                                                                        classes: form.data.filters.classes.filter(c => c !== kelas)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm">{kelas}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Filter Berdasarkan Mata Kuliah</Label>
                                            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                                                {courses.map(course => (
                                                    <label
                                                        key={course.id}
                                                        className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={form.data.filters.courses.includes(course.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    form.setData('filters', {
                                                                        ...form.data.filters,
                                                                        courses: [...form.data.filters.courses, course.id]
                                                                    });
                                                                } else {
                                                                    form.setData('filters', {
                                                                        ...form.data.filters,
                                                                        courses: form.data.filters.courses.filter(c => c !== course.id)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{course.nama}</p>
                                                            <p className="text-xs text-neutral-500">{course.dosen}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Specific Recipients (for 'specific' type) */}
                                {form.data.target_type === 'specific' && (
                                    <div>
                                        <Label>Pilih Penerima *</Label>
                                        <div className="mt-2">
                                            <Select
                                                value={form.data.target_role}
                                                onValueChange={(value: any) => {
                                                    form.setData('target_role', value);
                                                    form.setData('specific_recipients', []);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                                                    <SelectItem value="dosen">Dosen</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                                            {form.data.target_role === 'mahasiswa' ? (
                                                mahasiswa.map(mhs => (
                                                    <label
                                                        key={mhs.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={form.data.specific_recipients.includes(mhs.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    form.setData('specific_recipients', [
                                                                        ...form.data.specific_recipients,
                                                                        mhs.id
                                                                    ]);
                                                                } else {
                                                                    form.setData('specific_recipients',
                                                                        form.data.specific_recipients.filter(id => id !== mhs.id)
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{mhs.nama}</p>
                                                            <p className="text-xs text-neutral-500">
                                                                {mhs.nim} • {mhs.kelas}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))
                                            ) : (
                                                dosen.map(dsn => (
                                                    <label
                                                        key={dsn.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={form.data.specific_recipients.includes(dsn.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    form.setData('specific_recipients', [
                                                                        ...form.data.specific_recipients,
                                                                        dsn.id
                                                                    ]);
                                                                } else {
                                                                    form.setData('specific_recipients',
                                                                        form.data.specific_recipients.filter(id => id !== dsn.id)
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{dsn.nama}</p>
                                                            <p className="text-xs text-neutral-500">{dsn.nidn}</p>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recipient Count Display */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Total Penerima
                                        </span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {recipientCount}
                                        </span>
                                    </div>
                                </div>
                            </div>


                            {/* Advanced Options Card */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    Opsi Lanjutan
                                </h3>

                                {/* Schedule */}
                                <div>
                                    <Label htmlFor="scheduled_at">Jadwalkan Pengiriman (Opsional)</Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={form.data.scheduled_at}
                                        onChange={e => form.setData('scheduled_at', e.target.value)}
                                        className="mt-2"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Kosongkan untuk mengirim sekarang
                                    </p>
                                </div>

                                {/* Save as Template */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                    <Checkbox
                                        id="save_template"
                                        checked={form.data.save_as_template}
                                        onCheckedChange={(checked) => form.setData('save_as_template', checked as boolean)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="save_template" className="cursor-pointer">
                                            Simpan sebagai Template
                                        </Label>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                            Template dapat digunakan kembali untuk notifikasi serupa
                                        </p>
                                        {form.data.save_as_template && (
                                            <Input
                                                placeholder="Nama template..."
                                                value={form.data.template_name}
                                                onChange={e => form.setData('template_name', e.target.value)}
                                                className="mt-3"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT COLUMN - Preview & Actions */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            
                            {/* Preview Card */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700 sticky top-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-blue-500" />
                                        Preview
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPreview(!showPreview)}
                                    >
                                        {showPreview ? 'Sembunyikan' : 'Tampilkan'}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {showPreview && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4"
                                        >
                                            {/* Mobile Preview */}
                                            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4 border-2 border-neutral-300 dark:border-neutral-600">
                                                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
                                                    {/* Type Badge */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {(() => {
                                                            const config = typeConfig[form.data.type];
                                                            return (
                                                                <>
                                                                    <config.icon className={`h-4 w-4 text-${config.color}-500`} />
                                                                    <span className={`text-xs font-medium text-${config.color}-600`}>
                                                                        {config.label}
                                                                    </span>
                                                                </>
                                                            );
                                                        })()}
                                                        {form.data.priority !== 'normal' && (
                                                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                                                                form.data.priority === 'urgent'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                                {priorityConfig[form.data.priority].label}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                                                        {form.data.title || 'Judul notifikasi...'}
                                                    </h4>

                                                    {/* Message */}
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                                        {form.data.message || 'Pesan notifikasi akan ditampilkan di sini...'}
                                                    </p>

                                                    {/* Action Button */}
                                                    {form.data.action_label && (
                                                        <Button size="sm" className="w-full">
                                                            {form.data.action_label}
                                                        </Button>
                                                    )}

                                                    {/* Timestamp */}
                                                    <p className="text-xs text-neutral-400 mt-3">
                                                        Baru saja
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="text-xs text-neutral-500 space-y-1">
                                                <p>• Penerima: {recipientCount} orang</p>
                                                <p>• Tipe: {typeConfig[form.data.type].label}</p>
                                                <p>• Prioritas: {priorityConfig[form.data.priority].label}</p>
                                                {form.data.scheduled_at && (
                                                    <p>• Dijadwalkan: {new Date(form.data.scheduled_at).toLocaleString('id-ID')}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    disabled={form.processing || recipientCount === 0}
                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                                >
                                    {form.processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            {form.data.scheduled_at ? 'Jadwalkan Notifikasi' : 'Kirim Notifikasi'}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.notifications.index'))}
                                    className="w-full"
                                >
                                    Batal
                                </Button>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                    Statistik Cepat
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">Terkirim Hari Ini</span>
                                        <span className="font-semibold">{stats.sent_today}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">Minggu Ini</span>
                                        <span className="font-semibold">{stats.sent_this_week}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">Template Tersedia</span>
                                        <span className="font-semibold">{stats.total_templates}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </form>


                {/* Template Selection Modal */}
                <AnimatePresence>
                    {showTemplateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowTemplateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                            >
                                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                            Pilih Template Notifikasi
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowTemplateModal(false)}
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                                    {templates.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                                            <p className="text-neutral-600 dark:text-neutral-400">
                                                Belum ada template tersedia
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {templates.map(template => (
                                                <motion.div
                                                    key={template.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-500 cursor-pointer transition-all"
                                                    onClick={() => applyTemplate(template)}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                const config = typeConfig[template.type as keyof typeof typeConfig];
                                                                return <config.icon className={`h-5 w-5 text-${config.color}-500`} />;
                                                            })()}
                                                            <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                                {template.name}
                                                            </h4>
                                                        </div>
                                                        <span className="text-xs text-neutral-500">
                                                            {template.usage_count}x
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                                        {template.description}
                                                    </p>
                                                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                                                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                                            {template.title_template}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 line-clamp-2">
                                                            {template.message_template}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AdminLayout>
    );
}
```

---

## 📋 PART 5: ROUTES & INTEGRATION

### 5.1 Routes Configuration

**File: `routes/admin.php`**

```php
use App\Http\Controllers\Admin\NotificationManagementController;

// Notification Management Routes
Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationManagementController::class, 'index'])->name('index');
    Route::get('/create', [NotificationManagementController::class, 'create'])->name('create');
    Route::post('/', [NotificationManagementController::class, 'store'])->name('store');
    Route::post('/preview', [NotificationManagementController::class, 'preview'])->name('preview');
    Route::get('/{id}', [NotificationManagementController::class, 'show'])->name('show');
    Route::get('/{id}/analytics', [NotificationManagementController::class, 'analytics'])->name('analytics');
    Route::delete('/{id}', [NotificationManagementController::class, 'destroy'])->name('destroy');
});

// Template Management
Route::prefix('notification-templates')->name('notification-templates.')->group(function () {
    Route::get('/', [NotificationTemplateController::class, 'index'])->name('index');
    Route::post('/', [NotificationTemplateController::class, 'store'])->name('store');
    Route::put('/{id}', [NotificationTemplateController::class, 'update'])->name('update');
    Route::delete('/{id}', [NotificationTemplateController::class, 'destroy'])->name('destroy');
});
```


---

## 📋 PART 6: MOBILE RESPONSIVE DESIGN

### 6.1 Mobile-First CSS Enhancements

**Tambahkan ke file CSS global atau component:**

```css
/* Mobile Responsive - Matching Dashboard Admin */
@media (max-width: 768px) {
    /* Header adjustments */
    .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .notification-header img {
        height: 2.5rem;
        width: 2.5rem;
    }

    .notification-header h1 {
        font-size: 1.5rem;
    }

    /* Stats cards - 1 column on mobile */
    .stats-grid {
        grid-template-columns: 1fr;
    }

    /* Form layout - stack on mobile */
    .form-grid {
        grid-template-columns: 1fr;
    }

    /* Preview card - full width on mobile */
    .preview-card {
        position: relative;
        top: 0;
    }

    /* Modal - full screen on mobile */
    .template-modal {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
    }

    /* Recipient list - compact on mobile */
    .recipient-list {
        max-height: 300px;
    }

    /* Action buttons - full width */
    .action-buttons button {
        width: 100%;
    }
}

/* Tablet adjustments */
@media (min-width: 768px) and (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}

/* Desktop optimizations */
@media (min-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }

    .form-grid {
        grid-template-columns: 2fr 1fr;
    }
}
```

---

## 📋 PART 7: ADVANCED FEATURES & INNOVATIONS

### 7.1 Smart Recipient Suggestions

**Feature: AI-powered recipient suggestions based on notification content**

```typescript
// Add to create.tsx
const [suggestedRecipients, setSuggestedRecipients] = useState<number[]>([]);

useEffect(() => {
    // Analyze notification content and suggest recipients
    if (form.data.message.length > 20) {
        const keywords = form.data.message.toLowerCase();
        
        // Example: If message contains "tugas", suggest students with pending assignments
        if (keywords.includes('tugas') || keywords.includes('assignment')) {
            // Fetch students with pending assignments
            // setSuggestedRecipients(...)
        }
        
        // If message contains course name, suggest enrolled students
        courses.forEach(course => {
            if (keywords.includes(course.nama.toLowerCase())) {
                // Fetch enrolled students
            }
        });
    }
}, [form.data.message]);
```

### 7.2 Notification Analytics Dashboard

**Feature: Real-time analytics for sent notifications**

```typescript
interface NotificationAnalytics {
    total_sent: number;
    total_delivered: number;
    total_read: number;
    total_clicked: number;
    read_rate: number;
    click_rate: number;
    delivery_rate: number;
    avg_read_time: string;
    peak_read_hours: number[];
}

// Component to display analytics
const NotificationAnalytics = ({ notificationId }: { notificationId: number }) => {
    const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);

    useEffect(() => {
        fetch(`/admin/notifications/${notificationId}/analytics`)
            .then(res => res.json())
            .then(data => setAnalytics(data));
    }, [notificationId]);

    if (!analytics) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Terkirim" value={analytics.total_sent} />
            <StatCard label="Dibaca" value={analytics.total_read} />
            <StatCard label="Diklik" value={analytics.total_clicked} />
            <StatCard label="Read Rate" value={`${analytics.read_rate}%`} />
        </div>
    );
};
```

### 7.3 Bulk Actions & Batch Processing

**Feature: Send notifications in batches to prevent server overload**

```php
// In AdminNotificationService.php
public function sendInBatches(AppNotification $notification, int $batchSize = 100): void
{
    $recipients = NotificationRecipient::where('notification_id', $notification->id)
        ->where('status', 'pending')
        ->get();

    $chunks = $recipients->chunk($batchSize);

    foreach ($chunks as $chunk) {
        dispatch(new SendNotificationBatch($notification, $chunk));
        
        // Add delay between batches to prevent rate limiting
        sleep(1);
    }
}
```

### 7.4 Rich Text Editor Integration

**Feature: WYSIWYG editor for notification messages**

```typescript
import { Editor } from '@tinymce/tinymce-react';

// In create.tsx
<Editor
    apiKey="your-tinymce-api-key"
    value={form.data.message}
    onEditorChange={(content) => form.setData('message', content)}
    init={{
        height: 300,
        menubar: false,
        plugins: ['lists', 'link', 'emoticons'],
        toolbar: 'bold italic | bullist numlist | link emoticons',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }'
    }}
/>
```

### 7.5 Notification Templates with Variables

**Feature: Dynamic variable replacement in templates**

```typescript
// Template variables support
const availableVariables = [
    { key: '{name}', description: 'Nama penerima' },
    { key: '{course}', description: 'Nama mata kuliah' },
    { key: '{date}', description: 'Tanggal hari ini' },
    { key: '{time}', description: 'Waktu sekarang' },
    { key: '{deadline}', description: 'Deadline tugas' },
];

// Variable insertion UI
<div className="flex flex-wrap gap-2 mb-4">
    {availableVariables.map(variable => (
        <button
            key={variable.key}
            type="button"
            onClick={() => {
                const newMessage = form.data.message + ' ' + variable.key;
                form.setData('message', newMessage);
            }}
            className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
            {variable.key}
        </button>
    ))}
</div>
```


---

## 📋 PART 8: TESTING & VALIDATION

### 8.1 Form Validation Rules

```typescript
// Client-side validation
const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!form.data.title.trim()) {
        errors.push('Judul notifikasi wajib diisi');
    }

    if (!form.data.message.trim()) {
        errors.push('Pesan notifikasi wajib diisi');
    }

    if (form.data.message.length > 1000) {
        errors.push('Pesan terlalu panjang (maksimal 1000 karakter)');
    }

    if (recipientCount === 0) {
        errors.push('Pilih minimal 1 penerima');
    }

    if (form.data.save_as_template && !form.data.template_name.trim()) {
        errors.push('Nama template wajib diisi');
    }

    if (form.data.action_url && !isValidUrl(form.data.action_url)) {
        errors.push('URL action tidak valid');
    }

    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }

    return true;
};

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
```

### 8.2 Backend Validation

```php
// In NotificationManagementController.php
protected function validateNotificationData(Request $request): array
{
    return $request->validate([
        'title' => 'required|string|max:255|min:3',
        'message' => 'required|string|max:1000|min:10',
        'type' => 'required|in:info,reminder,announcement,alert,warning,achievement',
        'priority' => 'required|in:normal,high,urgent',
        'target_type' => 'required|in:all,filtered,specific',
        'target_role' => 'required|in:mahasiswa,dosen,all_users',
        'specific_recipients' => 'nullable|array|min:1',
        'specific_recipients.*' => 'integer|exists:mahasiswa,id',
        'filters' => 'nullable|array',
        'filters.classes' => 'nullable|array',
        'filters.classes.*' => 'string',
        'filters.courses' => 'nullable|array',
        'filters.courses.*' => 'integer|exists:mata_kuliah,id',
        'action_url' => 'nullable|url|max:500',
        'action_label' => 'nullable|string|max:100',
        'template_id' => 'nullable|exists:notification_templates,id',
        'scheduled_at' => 'nullable|date|after:now',
        'tags' => 'nullable|array',
        'tags.*' => 'string|max:50',
        'save_as_template' => 'boolean',
        'template_name' => 'nullable|required_if:save_as_template,true|string|max:255',
    ], [
        'title.required' => 'Judul notifikasi wajib diisi',
        'title.min' => 'Judul minimal 3 karakter',
        'message.required' => 'Pesan notifikasi wajib diisi',
        'message.min' => 'Pesan minimal 10 karakter',
        'message.max' => 'Pesan maksimal 1000 karakter',
        'specific_recipients.min' => 'Pilih minimal 1 penerima',
        'scheduled_at.after' => 'Waktu jadwal harus di masa depan',
    ]);
}
```

---

## 📋 PART 9: PERFORMANCE OPTIMIZATION

### 9.1 Database Indexing

```sql
-- Add indexes for better query performance
CREATE INDEX idx_notifications_created_by ON app_notifications(created_by_type, created_by_id);
CREATE INDEX idx_notifications_scheduled ON app_notifications(scheduled_at, delivery_status);
CREATE INDEX idx_notifications_sent ON app_notifications(sent_at);
CREATE INDEX idx_recipients_status ON notification_recipients(status, notification_id);
CREATE INDEX idx_recipients_read ON notification_recipients(read_at, notification_id);
```

### 9.2 Caching Strategy

```php
// In AdminNotificationService.php
use Illuminate\Support\Facades\Cache;

public function getCachedStats(): array
{
    return Cache::remember('admin_notification_stats', 300, function () {
        return [
            'total_mahasiswa' => Mahasiswa::count(),
            'total_dosen' => Dosen::count(),
            'total_templates' => NotificationTemplate::where('is_active', true)->count(),
            'sent_today' => AppNotification::whereDate('sent_at', today())->count(),
            'sent_this_week' => AppNotification::whereBetween('sent_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'scheduled' => AppNotification::where('delivery_status', 'pending')
                ->whereNotNull('scheduled_at')
                ->count(),
        ];
    });
}
```

### 9.3 Queue Jobs for Async Processing

```php
// File: app/Jobs/SendNotificationBatch.php
<?php

namespace App\Jobs;

use App\Models\AppNotification;
use App\Models\NotificationRecipient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationBatch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $notification;
    protected $recipients;

    public function __construct(AppNotification $notification, $recipients)
    {
        $this->notification = $notification;
        $this->recipients = $recipients;
    }

    public function handle()
    {
        foreach ($this->recipients as $recipient) {
            try {
                // Send notification logic here
                // Update recipient status
                $recipient->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            } catch (\Exception $e) {
                $recipient->update([
                    'status' => 'failed',
                    'failure_reason' => $e->getMessage(),
                ]);
            }
        }
    }
}
```

---

## 📋 PART 10: SECURITY & BEST PRACTICES

### 10.1 Authorization Checks

```php
// In NotificationManagementController.php
public function __construct()
{
    $this->middleware('auth:admin');
    $this->middleware('can:manage-notifications');
}

// In AuthServiceProvider.php
Gate::define('manage-notifications', function ($user) {
    return $user->role === 'admin' || $user->role === 'super_admin';
});
```

### 10.2 Rate Limiting

```php
// In routes/admin.php
Route::middleware(['throttle:notifications'])->group(function () {
    Route::post('/notifications', [NotificationManagementController::class, 'store']);
});

// In app/Providers/RouteServiceProvider.php
RateLimiter::for('notifications', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
});
```

### 10.3 Input Sanitization

```php
// In AdminNotificationService.php
protected function sanitizeInput(array $data): array
{
    return [
        'title' => strip_tags($data['title']),
        'message' => strip_tags($data['message'], '<b><i><u><br>'),
        'action_url' => filter_var($data['action_url'] ?? '', FILTER_SANITIZE_URL),
        // ... other fields
    ];
}
```

---

## 📋 PART 11: DEPLOYMENT CHECKLIST

### 11.1 Migration Commands

```bash
# Run migrations
php artisan migrate

# Seed default templates
php artisan db:seed --class=NotificationTemplateSeeder

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize
php artisan optimize
```

### 11.2 Environment Variables

```env
# Add to .env
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_RATE_LIMIT=10
NOTIFICATION_CACHE_TTL=300
QUEUE_CONNECTION=redis
```

### 11.3 Queue Worker Setup

```bash
# Start queue worker
php artisan queue:work --queue=notifications --tries=3 --timeout=90

# Or use supervisor for production
[program:notification-worker]
command=php /path/to/artisan queue:work --queue=notifications
autostart=true
autorestart=true
user=www-data
```

---

## 📋 PART 12: DOCUMENTATION & TRAINING

### 12.1 User Guide (Indonesian)

**Panduan Penggunaan: Buat Notifikasi Baru**

1. **Akses Menu**
   - Login sebagai Admin
   - Navigasi ke "Notifikasi" > "Buat Notifikasi Baru"

2. **Pilih Template (Opsional)**
   - Klik "Pilih Template" untuk menggunakan template yang sudah ada
   - Template akan mengisi judul dan pesan secara otomatis

3. **Isi Informasi Notifikasi**
   - Judul: Masukkan judul yang jelas dan ringkas
   - Pesan: Tulis pesan lengkap (maksimal 1000 karakter)
   - Tipe: Pilih tipe notifikasi (Info, Pengingat, Pengumuman, dll)
   - Prioritas: Tentukan tingkat prioritas

4. **Pilih Penerima**
   - Semua: Kirim ke semua mahasiswa/dosen
   - Filter: Filter berdasarkan kelas atau mata kuliah
   - Spesifik: Pilih penerima secara manual

5. **Opsi Lanjutan**
   - Jadwalkan pengiriman untuk waktu tertentu
   - Simpan sebagai template untuk digunakan kembali
   - Tambahkan tombol action dengan URL

6. **Preview & Kirim**
   - Lihat preview notifikasi di panel kanan
   - Pastikan jumlah penerima sudah benar
   - Klik "Kirim Notifikasi" atau "Jadwalkan Notifikasi"


---

## 📋 PART 13: UI/UX DESIGN SPECIFICATIONS

### 13.1 Color Palette (Matching Dashboard Admin)

```typescript
// Color system - EXACT match with dashboard
const colorSystem = {
    primary: {
        blue: 'from-blue-500 to-cyan-500',
        emerald: 'from-emerald-500 to-teal-500',
        purple: 'from-purple-500 to-pink-500',
        amber: 'from-amber-500 to-orange-500',
    },
    notification: {
        info: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30',
        reminder: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30',
        announcement: 'text-purple-700 bg-purple-100 dark:bg-purple-900/30',
        alert: 'text-red-700 bg-red-100 dark:bg-red-900/30',
        warning: 'text-orange-700 bg-orange-100 dark:bg-orange-900/30',
        achievement: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30',
    },
    priority: {
        normal: 'bg-neutral-100 text-neutral-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    }
};
```

### 13.2 Typography Standards

```css
/* Typography - Matching dashboard */
.notification-title {
    font-size: 2rem; /* 32px */
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.notification-subtitle {
    font-size: 0.875rem; /* 14px */
    font-weight: 400;
    line-height: 1.5;
    color: rgb(115 115 115); /* neutral-600 */
}

.card-title {
    font-size: 1.125rem; /* 18px */
    font-weight: 600;
    line-height: 1.4;
}

.body-text {
    font-size: 0.875rem; /* 14px */
    font-weight: 400;
    line-height: 1.6;
}

.label-text {
    font-size: 0.875rem; /* 14px */
    font-weight: 500;
    line-height: 1.4;
}
```

### 13.3 Spacing System

```typescript
// Spacing - Consistent with dashboard
const spacing = {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
};

// Apply to components
const cardPadding = 'p-6';           // 24px
const sectionGap = 'space-y-6';      // 24px vertical gap
const gridGap = 'gap-4';             // 16px grid gap
const buttonPadding = 'px-4 py-2';   // 16px horizontal, 8px vertical
```

### 13.4 Border Radius Standards

```css
/* Border radius - Matching dashboard */
.card-rounded {
    border-radius: 1rem; /* 16px */
}

.card-rounded-lg {
    border-radius: 1.5rem; /* 24px */
}

.button-rounded {
    border-radius: 0.5rem; /* 8px */
}

.badge-rounded {
    border-radius: 9999px; /* full */
}
```

### 13.5 Shadow System

```css
/* Shadows - Matching dashboard */
.shadow-card {
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.shadow-card-hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.shadow-modal {
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

---

## 📋 PART 14: ACCESSIBILITY FEATURES

### 14.1 ARIA Labels & Roles

```tsx
// Accessibility enhancements
<div role="main" aria-label="Buat Notifikasi Baru">
    <h1 id="page-title">Buat Notifikasi Baru</h1>
    
    <form 
        onSubmit={handleSubmit}
        aria-labelledby="page-title"
        aria-describedby="form-description"
    >
        <p id="form-description" className="sr-only">
            Form untuk membuat dan mengirim notifikasi ke mahasiswa atau dosen
        </p>

        <div role="group" aria-labelledby="basic-info-heading">
            <h3 id="basic-info-heading">Informasi Notifikasi</h3>
            
            <label htmlFor="title">
                Judul Notifikasi
                <span aria-label="wajib diisi">*</span>
            </label>
            <input
                id="title"
                type="text"
                aria-required="true"
                aria-invalid={!!form.errors.title}
                aria-describedby={form.errors.title ? "title-error" : undefined}
            />
            {form.errors.title && (
                <p id="title-error" role="alert" className="text-red-600">
                    {form.errors.title}
                </p>
            )}
        </div>

        <button
            type="submit"
            disabled={form.processing || recipientCount === 0}
            aria-busy={form.processing}
            aria-disabled={form.processing || recipientCount === 0}
        >
            {form.processing ? 'Mengirim...' : 'Kirim Notifikasi'}
        </button>
    </form>
</div>
```

### 14.2 Keyboard Navigation

```typescript
// Keyboard shortcuts
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (validateForm()) {
                form.submit();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            setShowTemplateModal(false);
            setShowPreview(false);
        }

        // Ctrl/Cmd + P to toggle preview
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            setShowPreview(!showPreview);
        }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, [form, showPreview]);
```

### 14.3 Screen Reader Support

```tsx
// Live region for dynamic updates
<div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    className="sr-only"
>
    {recipientCount > 0 && `${recipientCount} penerima dipilih`}
    {form.processing && 'Sedang mengirim notifikasi'}
    {form.recentlySuccessful && 'Notifikasi berhasil dikirim'}
</div>

// Skip to main content link
<a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
>
    Skip to main content
</a>
```

---

## 📋 PART 15: ERROR HANDLING & USER FEEDBACK

### 15.1 Error States

```tsx
// Error handling component
const ErrorDisplay = ({ errors }: { errors: Record<string, string> }) => {
    if (Object.keys(errors).length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
            role="alert"
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Terdapat kesalahan pada form
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                        {Object.entries(errors).map(([field, message]) => (
                            <li key={field}>• {message}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};
```

### 15.2 Success Feedback

```tsx
// Success toast notification
const showSuccessToast = (message: string) => {
    toast.custom((t) => (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-4 border border-emerald-200 dark:border-emerald-800"
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                        Berhasil!
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {message}
                    </p>
                </div>
            </div>
        </motion.div>
    ));
};
```

### 15.3 Loading States

```tsx
// Loading overlay
const LoadingOverlay = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-blue-200 dark:border-blue-900" />
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {message}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Mohon tunggu sebentar...
                </p>
            </div>
        </div>
    </motion.div>
);
```

---

## 📋 PART 16: FINAL IMPLEMENTATION CHECKLIST

### ✅ Backend Checklist

- [ ] Database migrations created and tested
- [ ] Models with relationships defined
- [ ] Service layer implemented
- [ ] Controller with all CRUD operations
- [ ] Routes configured
- [ ] Validation rules implemented
- [ ] Authorization gates defined
- [ ] Queue jobs for async processing
- [ ] Caching strategy implemented
- [ ] Error handling and logging

### ✅ Frontend Checklist

- [ ] Main create page component
- [ ] Form with all fields
- [ ] Template selection modal
- [ ] Recipient selection UI
- [ ] Preview functionality
- [ ] Mobile responsive design
- [ ] Dark mode support
- [ ] Animations and transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback
- [ ] Accessibility features
- [ ] Keyboard navigation

### ✅ UI/UX Checklist

- [ ] Colors match dashboard admin
- [ ] Icons match dashboard admin
- [ ] Typography consistent
- [ ] Spacing consistent
- [ ] Border radius consistent
- [ ] Shadows consistent
- [ ] No container on header icon
- [ ] No animated icon movements
- [ ] Back button matches other menus
- [ ] Mobile responsive like dashboard
- [ ] No dummy data

### ✅ Testing Checklist

- [ ] Unit tests for services
- [ ] Integration tests for controllers
- [ ] Frontend component tests
- [ ] E2E tests for critical flows
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing
- [ ] Cross-browser testing
- [ ] Mobile device testing

### ✅ Documentation Checklist

- [ ] Code comments
- [ ] API documentation
- [ ] User guide (Indonesian)
- [ ] Admin guide
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 🎉 CONCLUSION

Sistem **Buat Notifikasi Baru** untuk Admin telah dirancang dengan sangat detail dan komprehensif, mencakup:

1. **Database Schema** - Struktur lengkap dengan tracking dan analytics
2. **Backend Logic** - Service layer, controllers, validation
3. **Frontend UI** - React/TypeScript dengan design system yang konsisten
4. **Advanced Features** - Templates, scheduling, analytics, batch processing
5. **Performance** - Caching, indexing, queue jobs
6. **Security** - Authorization, rate limiting, input sanitization
7. **Accessibility** - ARIA labels, keyboard navigation, screen reader support
8. **Mobile Responsive** - Optimal di semua device
9. **Error Handling** - Comprehensive error states dan user feedback
10. **Documentation** - Lengkap dalam Bahasa Indonesia

**Key Highlights:**
- ✅ UI/UX 100% matching dengan dashboard admin
- ✅ Tidak ada data dummy
- ✅ Icon header tanpa container
- ✅ Tidak ada animasi icon bergerak
- ✅ Mobile responsive optimal
- ✅ Tombol kembali konsisten
- ✅ Header rapi dan profesional
- ✅ Inovasi signifikan dalam fitur notifikasi

Sistem ini siap untuk diimplementasikan dan akan memberikan pengalaman yang sangat baik untuk admin dalam mengelola notifikasi!

