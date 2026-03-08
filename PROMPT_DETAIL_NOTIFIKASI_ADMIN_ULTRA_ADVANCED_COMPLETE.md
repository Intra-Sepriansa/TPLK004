# PROMPT: Detail Notifikasi - Admin Panel
## Ultra Advanced Complete System

---

## 🎯 EXECUTIVE SUMMARY

Sistem **Detail Notifikasi** untuk Admin yang menampilkan informasi lengkap tentang notifikasi yang telah dikirim dengan fitur:

1. **Comprehensive Analytics** - Statistik lengkap delivery, read, click rate
2. **Recipient Tracking** - Detail setiap penerima dengan status real-time
3. **Timeline Visualization** - Visual timeline pengiriman dan interaksi
4. **Performance Metrics** - Grafik dan chart untuk analisis performa
5. **Action Management** - Resend, cancel, duplicate notifikasi
6. **Export Capabilities** - Export data ke PDF/Excel
7. **Real-time Updates** - Live tracking status notifikasi

**Key Concept:**
- Admin melihat detail lengkap notifikasi yang telah dibuat
- Tracking real-time untuk setiap penerima
- Analytics mendalam untuk evaluasi efektivitas
- Action management untuk follow-up

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

## 📋 PART 1: DATABASE QUERIES & DATA STRUCTURE

### 1.1 Enhanced Notification Detail Query

```php
// In NotificationManagementController.php
public function show($id)
{
    $notification = AppNotification::with([
        'template',
        'recipients' => function($query) {
            $query->orderBy('status', 'desc')
                  ->orderBy('read_at', 'desc');
        },
        'recipients.recipient'
    ])->findOrFail($id);

    // Calculate analytics
    $analytics = $this->calculateAnalytics($notification);
    
    // Get timeline events
    $timeline = $this->getTimeline($notification);
    
    // Get performance metrics
    $metrics = $this->getPerformanceMetrics($notification);
    
    // Get recipient breakdown
    $recipientBreakdown = $this->getRecipientBreakdown($notification);

    return Inertia::render('admin/notifications/detail', [
        'notification' => $this->formatNotification($notification),
        'analytics' => $analytics,
        'timeline' => $timeline,
        'metrics' => $metrics,
        'recipientBreakdown' => $recipientBreakdown,
    ]);
}

private function calculateAnalytics($notification): array
{
    $recipients = $notification->recipients;
    $total = $recipients->count();

    if ($total === 0) {
        return [
            'total_recipients' => 0,
            'sent' => 0,
            'delivered' => 0,
            'read' => 0,
            'clicked' => 0,
            'failed' => 0,
            'pending' => 0,
            'delivery_rate' => 0,
            'read_rate' => 0,
            'click_rate' => 0,
            'avg_read_time' => null,
        ];
    }

    $sent = $recipients->where('status', 'sent')->count();
    $delivered = $recipients->where('status', 'delivered')->count();
    $read = $recipients->whereNotNull('read_at')->count();
    $clicked = $recipients->where('clicked', true)->count();
    $failed = $recipients->where('status', 'failed')->count();
    $pending = $recipients->where('status', 'pending')->count();

    // Calculate average read time
    $readTimes = $recipients->filter(function($r) {
        return $r->read_at && $r->sent_at;
    })->map(function($r) {
        return $r->sent_at->diffInMinutes($r->read_at);
    });

    $avgReadTime = $readTimes->count() > 0 
        ? round($readTimes->average(), 1) 
        : null;

    return [
        'total_recipients' => $total,
        'sent' => $sent,
        'delivered' => $delivered,
        'read' => $read,
        'clicked' => $clicked,
        'failed' => $failed,
        'pending' => $pending,
        'delivery_rate' => round(($sent / $total) * 100, 2),
        'read_rate' => round(($read / $total) * 100, 2),
        'click_rate' => round(($clicked / $total) * 100, 2),
        'avg_read_time' => $avgReadTime,
        'avg_read_time_formatted' => $avgReadTime 
            ? $this->formatReadTime($avgReadTime) 
            : null,
    ];
}


private function getTimeline($notification): array
{
    $timeline = [];

    // Created event
    $timeline[] = [
        'type' => 'created',
        'title' => 'Notifikasi Dibuat',
        'description' => 'Notifikasi berhasil dibuat oleh admin',
        'timestamp' => $notification->created_at,
        'icon' => 'plus',
        'color' => 'blue',
    ];

    // Scheduled event (if applicable)
    if ($notification->scheduled_at) {
        $timeline[] = [
            'type' => 'scheduled',
            'title' => 'Dijadwalkan',
            'description' => 'Notifikasi dijadwalkan untuk dikirim',
            'timestamp' => $notification->scheduled_at,
            'icon' => 'calendar',
            'color' => 'purple',
        ];
    }

    // Sent event
    if ($notification->sent_at) {
        $timeline[] = [
            'type' => 'sent',
            'title' => 'Terkirim',
            'description' => "Notifikasi terkirim ke {$notification->recipient_count} penerima",
            'timestamp' => $notification->sent_at,
            'icon' => 'send',
            'color' => 'emerald',
        ];
    }

    // First read event
    $firstRead = $notification->recipients()
        ->whereNotNull('read_at')
        ->orderBy('read_at', 'asc')
        ->first();

    if ($firstRead) {
        $timeline[] = [
            'type' => 'first_read',
            'title' => 'Dibaca Pertama Kali',
            'description' => 'Notifikasi dibaca oleh penerima pertama',
            'timestamp' => $firstRead->read_at,
            'icon' => 'eye',
            'color' => 'amber',
        ];
    }

    // First click event
    $firstClick = $notification->recipients()
        ->where('clicked', true)
        ->whereNotNull('clicked_at')
        ->orderBy('clicked_at', 'asc')
        ->first();

    if ($firstClick) {
        $timeline[] = [
            'type' => 'first_click',
            'title' => 'Diklik Pertama Kali',
            'description' => 'Action button diklik oleh penerima',
            'timestamp' => $firstClick->clicked_at,
            'icon' => 'mouse-pointer',
            'color' => 'cyan',
        ];
    }

    // Sort by timestamp
    usort($timeline, function($a, $b) {
        return $a['timestamp'] <=> $b['timestamp'];
    });

    return $timeline;
}

private function getPerformanceMetrics($notification): array
{
    $recipients = $notification->recipients;

    // Hourly distribution
    $hourlyDistribution = [];
    for ($i = 0; $i < 24; $i++) {
        $hourlyDistribution[$i] = [
            'hour' => sprintf('%02d:00', $i),
            'read' => 0,
            'clicked' => 0,
        ];
    }

    foreach ($recipients as $recipient) {
        if ($recipient->read_at) {
            $hour = $recipient->read_at->hour;
            $hourlyDistribution[$hour]['read']++;
        }
        if ($recipient->clicked_at) {
            $hour = $recipient->clicked_at->hour;
            $hourlyDistribution[$hour]['clicked']++;
        }
    }

    // Status distribution
    $statusDistribution = [
        'pending' => $recipients->where('status', 'pending')->count(),
        'sent' => $recipients->where('status', 'sent')->count(),
        'delivered' => $recipients->where('status', 'delivered')->count(),
        'read' => $recipients->whereNotNull('read_at')->count(),
        'failed' => $recipients->where('status', 'failed')->count(),
    ];

    // Read time distribution
    $readTimeRanges = [
        '0-5 min' => 0,
        '5-15 min' => 0,
        '15-30 min' => 0,
        '30-60 min' => 0,
        '1-24 jam' => 0,
        '> 24 jam' => 0,
    ];

    foreach ($recipients as $recipient) {
        if ($recipient->read_at && $recipient->sent_at) {
            $minutes = $recipient->sent_at->diffInMinutes($recipient->read_at);
            
            if ($minutes <= 5) $readTimeRanges['0-5 min']++;
            elseif ($minutes <= 15) $readTimeRanges['5-15 min']++;
            elseif ($minutes <= 30) $readTimeRanges['15-30 min']++;
            elseif ($minutes <= 60) $readTimeRanges['30-60 min']++;
            elseif ($minutes <= 1440) $readTimeRanges['1-24 jam']++;
            else $readTimeRanges['> 24 jam']++;
        }
    }

    return [
        'hourly_distribution' => array_values($hourlyDistribution),
        'status_distribution' => $statusDistribution,
        'read_time_distribution' => $readTimeRanges,
    ];
}

private function getRecipientBreakdown($notification): array
{
    $recipients = $notification->recipients()->with('recipient')->get();

    return $recipients->map(function($recipient) {
        $user = $recipient->recipient;
        
        return [
            'id' => $recipient->id,
            'name' => $user->nama ?? 'Unknown',
            'identifier' => $user->nim ?? $user->nidn ?? $user->email ?? '-',
            'type' => $recipient->recipient_type,
            'status' => $recipient->status,
            'sent_at' => $recipient->sent_at,
            'delivered_at' => $recipient->delivered_at,
            'read_at' => $recipient->read_at,
            'clicked' => $recipient->clicked,
            'clicked_at' => $recipient->clicked_at,
            'failure_reason' => $recipient->failure_reason,
            'read_time_minutes' => $recipient->read_at && $recipient->sent_at
                ? $recipient->sent_at->diffInMinutes($recipient->read_at)
                : null,
        ];
    })->toArray();
}

private function formatReadTime($minutes): string
{
    if ($minutes < 1) return '< 1 menit';
    if ($minutes < 60) return round($minutes) . ' menit';
    
    $hours = floor($minutes / 60);
    $mins = $minutes % 60;
    
    if ($hours < 24) {
        return $mins > 0 
            ? "{$hours} jam {$mins} menit" 
            : "{$hours} jam";
    }
    
    $days = floor($hours / 24);
    $remainingHours = $hours % 24;
    
    return $remainingHours > 0
        ? "{$days} hari {$remainingHours} jam"
        : "{$days} hari";
}

private function formatNotification($notification): array
{
    return [
        'id' => $notification->id,
        'title' => $notification->title,
        'message' => $notification->message,
        'type' => $notification->type,
        'priority' => $notification->priority,
        'action_url' => $notification->action_url,
        'action_label' => $notification->action_label,
        'delivery_status' => $notification->delivery_status,
        'scheduled_at' => $notification->scheduled_at,
        'sent_at' => $notification->sent_at,
        'created_at' => $notification->created_at,
        'updated_at' => $notification->updated_at,
        'recipient_count' => $notification->recipient_count,
        'read_count' => $notification->read_count,
        'click_count' => $notification->click_count,
        'tags' => $notification->tags,
        'template' => $notification->template ? [
            'id' => $notification->template->id,
            'name' => $notification->template->name,
        ] : null,
    ];
}
```

---

## 📋 PART 2: ADDITIONAL CONTROLLER METHODS

### 2.1 Action Methods

```php
// Resend notification
public function resend($id)
{
    $notification = AppNotification::findOrFail($id);
    
    // Create new notification with same content
    $newNotification = $notification->replicate();
    $newNotification->sent_at = now();
    $newNotification->delivery_status = 'sent';
    $newNotification->save();

    // Copy recipients
    foreach ($notification->recipients as $recipient) {
        $newRecipient = $recipient->replicate();
        $newRecipient->notification_id = $newNotification->id;
        $newRecipient->status = 'sent';
        $newRecipient->sent_at = now();
        $newRecipient->save();
    }

    return redirect()->route('admin.notifications.show', $newNotification->id)
        ->with('success', 'Notifikasi berhasil dikirim ulang!');
}

// Cancel scheduled notification
public function cancel($id)
{
    $notification = AppNotification::findOrFail($id);
    
    if ($notification->delivery_status !== 'pending') {
        return back()->withErrors(['error' => 'Hanya notifikasi terjadwal yang dapat dibatalkan']);
    }

    $notification->update([
        'delivery_status' => 'cancelled',
    ]);

    $notification->recipients()->update([
        'status' => 'cancelled',
    ]);

    return back()->with('success', 'Notifikasi berhasil dibatalkan!');
}

// Duplicate notification
public function duplicate($id)
{
    $notification = AppNotification::findOrFail($id);
    
    return redirect()->route('admin.notifications.create', [
        'duplicate_from' => $id,
        'title' => $notification->title,
        'message' => $notification->message,
        'type' => $notification->type,
        'priority' => $notification->priority,
    ]);
}

// Export recipients
public function exportRecipients($id, Request $request)
{
    $notification = AppNotification::with('recipients.recipient')->findOrFail($id);
    $format = $request->get('format', 'excel'); // excel or pdf

    if ($format === 'pdf') {
        return $this->exportToPdf($notification);
    }

    return $this->exportToExcel($notification);
}

private function exportToExcel($notification)
{
    return Excel::download(
        new NotificationRecipientsExport($notification),
        "notification-{$notification->id}-recipients.xlsx"
    );
}

private function exportToPdf($notification)
{
    $pdf = PDF::loadView('exports.notification-recipients', [
        'notification' => $notification,
        'recipients' => $notification->recipients,
    ]);

    return $pdf->download("notification-{$notification->id}-recipients.pdf");
}
```


---

## 📋 PART 3: FRONTEND IMPLEMENTATION (React/TypeScript)

### 3.1 Main Detail Page Component

**File: `resources/js/pages/admin/notifications/detail.tsx`**

```tsx
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    ArrowLeft, Send, Copy, X, Download, RefreshCw, Eye,
    Clock, CheckCircle, XCircle, AlertTriangle, Users,
    TrendingUp, BarChart3, PieChart, Activity, MousePointer,
    Calendar, Bell, Info, Megaphone, Award, Filter, Search,
    FileDown, FileSpreadsheet, Trash2, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Import icons - MATCHING DASHBOARD ADMIN
import NotifIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import TotalIcon from '@/assets/admin/dashboard/total-icon.png';
import HadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import ReadIcon from '@/assets/admin/notification-center/recipients.png';
import ClickIcon from '@/assets/admin/notification-center/unread.png';
import FailedIcon from '@/assets/admin/notification-center/scheduled.png';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url: string | null;
    action_label: string | null;
    delivery_status: string;
    scheduled_at: string | null;
    sent_at: string | null;
    created_at: string;
    recipient_count: number;
    read_count: number;
    click_count: number;
    tags: string[] | null;
    template: { id: number; name: string } | null;
}

interface Analytics {
    total_recipients: number;
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
    pending: number;
    delivery_rate: number;
    read_rate: number;
    click_rate: number;
    avg_read_time: number | null;
    avg_read_time_formatted: string | null;
}

interface TimelineEvent {
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
}

interface Metrics {
    hourly_distribution: Array<{ hour: string; read: number; clicked: number }>;
    status_distribution: Record<string, number>;
    read_time_distribution: Record<string, number>;
}

interface Recipient {
    id: number;
    name: string;
    identifier: string;
    type: string;
    status: string;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    clicked: boolean;
    clicked_at: string | null;
    failure_reason: string | null;
    read_time_minutes: number | null;
}

interface DetailPageProps {
    notification: Notification;
    analytics: Analytics;
    timeline: TimelineEvent[];
    metrics: Metrics;
    recipientBreakdown: Recipient[];
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

const CHART_COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
};

export default function NotificationDetail({
    notification, analytics, timeline, metrics, recipientBreakdown
}: DetailPageProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [recipientFilter, setRecipientFilter] = useState('all');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const typeConfig = {
        info: { icon: Info, color: 'blue', label: 'Informasi' },
        reminder: { icon: Clock, color: 'amber', label: 'Pengingat' },
        announcement: { icon: Megaphone, color: 'purple', label: 'Pengumuman' },
        alert: { icon: AlertTriangle, color: 'red', label: 'Peringatan' },
        warning: { icon: AlertTriangle, color: 'orange', label: 'Perhatian' },
        achievement: { icon: Award, color: 'emerald', label: 'Pencapaian' },
    };

    const statusConfig = {
        pending: { label: 'Menunggu', color: 'neutral', icon: Clock },
        sent: { label: 'Terkirim', color: 'blue', icon: Send },
        delivered: { label: 'Tersampaikan', color: 'cyan', icon: CheckCircle },
        read: { label: 'Dibaca', color: 'emerald', icon: Eye },
        failed: { label: 'Gagal', color: 'red', icon: XCircle },
    };

    // Filter recipients
    const filteredRecipients = recipientBreakdown.filter(recipient => {
        // Status filter
        if (recipientFilter !== 'all') {
            if (recipientFilter === 'read' && !recipient.read_at) return false;
            if (recipientFilter === 'unread' && recipient.read_at) return false;
            if (recipientFilter === 'clicked' && !recipient.clicked) return false;
            if (recipientFilter === 'failed' && recipient.status !== 'failed') return false;
        }

        // Search filter
        if (recipientSearch) {
            const search = recipientSearch.toLowerCase();
            return recipient.name.toLowerCase().includes(search) ||
                   recipient.identifier.toLowerCase().includes(search);
        }

        return true;
    });

    const handleResend = () => {
        router.post(route('admin.notifications.resend', notification.id));
    };

    const handleCancel = () => {
        router.post(route('admin.notifications.cancel', notification.id));
        setShowCancelDialog(false);
    };

    const handleDuplicate = () => {
        router.visit(route('admin.notifications.duplicate', notification.id));
    };

    const handleDelete = () => {
        router.delete(route('admin.notifications.destroy', notification.id));
    };

    const handleExport = (format: 'excel' | 'pdf') => {
        window.location.href = route('admin.notifications.export-recipients', {
            id: notification.id,
            format
        });
    };

    return (
        <AdminLayout>
            <Head title={`Detail Notifikasi - ${notification.title}`} />

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
                            alt="Detail Notifikasi" 
                            className="h-10 w-10 md:h-12 md:w-12 object-contain"
                        />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                Detail Notifikasi
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Informasi lengkap dan analytics notifikasi
                            </p>
                        </div>
                    </div>

                    {/* Actions - MATCHING OTHER MENUS */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('admin.notifications.index'))}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>

                        {/* Actions Dropdown */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setShowActionsMenu(!showActionsMenu)}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>

                            <AnimatePresence>
                                {showActionsMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-50"
                                    >
                                        <div className="p-2">
                                            <button
                                                onClick={handleResend}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Kirim Ulang
                                            </button>
                                            <button
                                                onClick={handleDuplicate}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left"
                                            >
                                                <Copy className="h-4 w-4" />
                                                Duplikat
                                            </button>
                                            {notification.delivery_status === 'pending' && (
                                                <button
                                                    onClick={() => setShowCancelDialog(true)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-orange-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Batalkan
                                                </button>
                                            )}
                                            <div className="border-t border-neutral-200 dark:border-neutral-700 my-2" />
                                            <button
                                                onClick={() => handleExport('excel')}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left"
                                            >
                                                <FileSpreadsheet className="h-4 w-4" />
                                                Export Excel
                                            </button>
                                            <button
                                                onClick={() => handleExport('pdf')}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left"
                                            >
                                                <FileDown className="h-4 w-4" />
                                                Export PDF
                                            </button>
                                            <div className="border-t border-neutral-200 dark:border-neutral-700 my-2" />
                                            <button
                                                onClick={() => setShowDeleteDialog(true)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-left text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>


                {/* ═══════ ANALYTICS STATS - MATCHING DASHBOARD ═══════ */}
                <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
                >
                    {[
                        { 
                            label: 'Total Penerima', 
                            value: analytics.total_recipients, 
                            icon: TotalIcon,
                            gradient: 'from-blue-500 to-cyan-500',
                            subtext: '100%'
                        },
                        { 
                            label: 'Terkirim', 
                            value: analytics.sent, 
                            icon: HadirIcon,
                            gradient: 'from-emerald-500 to-teal-500',
                            subtext: `${analytics.delivery_rate}%`
                        },
                        { 
                            label: 'Dibaca', 
                            value: analytics.read, 
                            icon: ReadIcon,
                            gradient: 'from-purple-500 to-pink-500',
                            subtext: `${analytics.read_rate}%`
                        },
                        { 
                            label: 'Diklik', 
                            value: analytics.clicked, 
                            icon: ClickIcon,
                            gradient: 'from-amber-500 to-orange-500',
                            subtext: `${analytics.click_rate}%`
                        },
                        { 
                            label: 'Gagal', 
                            value: analytics.failed, 
                            icon: FailedIcon,
                            gradient: 'from-red-500 to-rose-500',
                            subtext: analytics.failed > 0 ? 'Perlu perhatian' : 'Baik'
                        },
                        { 
                            label: 'Avg. Read Time', 
                            value: analytics.avg_read_time_formatted || '-', 
                            icon: NotifIcon,
                            gradient: 'from-indigo-500 to-purple-500',
                            subtext: 'Rata-rata',
                            isText: true
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={cardVariants}
                            whileHover="hover"
                            className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <img 
                                        src={stat.icon} 
                                        alt={stat.label}
                                        className="h-8 w-8 object-contain opacity-80"
                                    />
                                </div>
                                {stat.isText ? (
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                ) : (
                                    <AnimatedCounter
                                        value={stat.value as number}
                                        className="text-3xl font-bold text-neutral-900 dark:text-white"
                                    />
                                )}
                                <p className="text-xs text-neutral-500 mt-2">
                                    {stat.subtext}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - Notification Info & Timeline */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                        
                        {/* Notification Content Card */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                                Konten Notifikasi
                            </h3>

                            <div className="space-y-4">
                                {/* Type & Priority Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {(() => {
                                        const config = typeConfig[notification.type as keyof typeof typeConfig];
                                        return (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-700 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
                                                <config.icon className="h-4 w-4" />
                                                {config.label}
                                            </span>
                                        );
                                    })()}
                                    
                                    {notification.priority !== 'normal' && (
                                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                            notification.priority === 'urgent'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                        }`}>
                                            {notification.priority === 'urgent' ? 'Mendesak' : 'Penting'}
                                        </span>
                                    )}

                                    {notification.template && (
                                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                            Template: {notification.template.name}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        Judul
                                    </label>
                                    <p className="text-lg font-semibold text-neutral-900 dark:text-white mt-1">
                                        {notification.title}
                                    </p>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        Pesan
                                    </label>
                                    <p className="text-neutral-700 dark:text-neutral-300 mt-1 whitespace-pre-wrap">
                                        {notification.message}
                                    </p>
                                </div>

                                {/* Action Button */}
                                {notification.action_url && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <label className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block">
                                            Action Button
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Button size="sm" className="pointer-events-none">
                                                {notification.action_label || 'Lihat Detail'}
                                            </Button>
                                            <a 
                                                href={notification.action_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                {notification.action_url}
                                                <MousePointer className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {notification.tags && notification.tags.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {notification.tags.map((tag, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-500" />
                                Timeline Aktivitas
                            </h3>

                            <div className="space-y-4">
                                {timeline.map((event, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={`h-10 w-10 rounded-full bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                                {event.icon === 'plus' && <Bell className={`h-5 w-5 text-${event.color}-600`} />}
                                                {event.icon === 'calendar' && <Calendar className={`h-5 w-5 text-${event.color}-600`} />}
                                                {event.icon === 'send' && <Send className={`h-5 w-5 text-${event.color}-600`} />}
                                                {event.icon === 'eye' && <Eye className={`h-5 w-5 text-${event.color}-600`} />}
                                                {event.icon === 'mouse-pointer' && <MousePointer className={`h-5 w-5 text-${event.color}-600`} />}
                                            </div>
                                            {idx < timeline.length - 1 && (
                                                <div className="w-0.5 h-full bg-neutral-200 dark:bg-neutral-700 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {event.title}
                                            </p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                {event.description}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-2">
                                                {new Date(event.timestamp).toLocaleString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>


                        {/* Performance Charts */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-emerald-500" />
                                Analisis Performa
                            </h3>

                            {/* Hourly Distribution Chart */}
                            <div className="mb-8">
                                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                                    Distribusi Per Jam
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={metrics.hourly_distribution}>
                                        <defs>
                                            <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="hour" 
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis 
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="read" 
                                            stroke={CHART_COLORS.primary}
                                            fillOpacity={1}
                                            fill="url(#colorRead)"
                                            name="Dibaca"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="clicked" 
                                            stroke={CHART_COLORS.success}
                                            fillOpacity={1}
                                            fill="url(#colorClick)"
                                            name="Diklik"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Read Time Distribution */}
                            <div>
                                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                                    Distribusi Waktu Baca
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart 
                                        data={Object.entries(metrics.read_time_distribution).map(([range, count]) => ({
                                            range,
                                            count
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="range" 
                                            stroke="#6b7280"
                                            style={{ fontSize: '11px' }}
                                        />
                                        <YAxis 
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar 
                                            dataKey="count" 
                                            fill={CHART_COLORS.purple}
                                            radius={[8, 8, 0, 0]}
                                            name="Jumlah"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN - Status Distribution & Quick Info */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        
                        {/* Status Distribution Pie Chart */}
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-amber-500" />
                                Distribusi Status
                            </h3>

                            <ResponsiveContainer width="100%" height={250}>
                                <RechartsPie>
                                    <Pie
                                        data={Object.entries(metrics.status_distribution).map(([status, count]) => ({
                                            name: statusConfig[status as keyof typeof statusConfig]?.label || status,
                                            value: count,
                                            color: statusConfig[status as keyof typeof statusConfig]?.color || 'neutral'
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {Object.entries(metrics.status_distribution).map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} 
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPie>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="space-y-2 mt-4">
                                {Object.entries(metrics.status_distribution).map(([status, count], idx) => {
                                    const config = statusConfig[status as keyof typeof statusConfig];
                                    if (!config) return null;
                                    
                                    return (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ 
                                                        backgroundColor: Object.values(CHART_COLORS)[idx % Object.values(CHART_COLORS).length]
                                                    }}
                                                />
                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {config.label}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Info Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                                Informasi Cepat
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">ID Notifikasi</span>
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                                        #{notification.id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Status</span>
                                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                                        notification.delivery_status === 'sent' 
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : notification.delivery_status === 'pending'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-neutral-100 text-neutral-700'
                                    }`}>
                                        {notification.delivery_status === 'sent' ? 'Terkirim' :
                                         notification.delivery_status === 'pending' ? 'Terjadwal' :
                                         notification.delivery_status}
                                    </span>
                                </div>
                                {notification.scheduled_at && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-700 dark:text-blue-300">Dijadwalkan</span>
                                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                                            {new Date(notification.scheduled_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {notification.sent_at && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-700 dark:text-blue-300">Terkirim</span>
                                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                                            {new Date(notification.sent_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Dibuat</span>
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                                        {new Date(notification.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Score Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
                                Skor Performa
                            </h3>
                            
                            {/* Overall Score */}
                            <div className="text-center mb-4">
                                <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {Math.round((analytics.read_rate + analytics.click_rate) / 2)}
                                </div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                                    Skor Keseluruhan
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-emerald-700 dark:text-emerald-300">Read Rate</span>
                                        <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                                            {analytics.read_rate}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${analytics.read_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-emerald-700 dark:text-emerald-300">Click Rate</span>
                                        <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                                            {analytics.click_rate}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${analytics.click_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-emerald-700 dark:text-emerald-300">Delivery Rate</span>
                                        <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                                            {analytics.delivery_rate}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${analytics.delivery_rate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>


                {/* ═══════ RECIPIENT BREAKDOWN TABLE ═══════ */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Detail Penerima ({filteredRecipients.length})
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Cari penerima..."
                                    value={recipientSearch}
                                    onChange={(e) => setRecipientSearch(e.target.value)}
                                    className="pl-10 w-full sm:w-64"
                                />
                            </div>

                            {/* Filter */}
                            <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="read">Sudah Dibaca</SelectItem>
                                    <SelectItem value="unread">Belum Dibaca</SelectItem>
                                    <SelectItem value="clicked">Sudah Diklik</SelectItem>
                                    <SelectItem value="failed">Gagal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table - Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Penerima
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Terkirim
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Dibaca
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Waktu Baca
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Diklik
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecipients.map((recipient, idx) => (
                                    <motion.tr
                                        key={recipient.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">
                                                    {recipient.name}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {recipient.identifier}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {(() => {
                                                const status = recipient.read_at ? 'read' : recipient.status;
                                                const config = statusConfig[status as keyof typeof statusConfig];
                                                if (!config) return null;
                                                
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
                                                        <config.icon className="h-3 w-3" />
                                                        {config.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            {recipient.sent_at 
                                                ? new Date(recipient.sent_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'
                                            }
                                        </td>
                                        <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            {recipient.read_at 
                                                ? new Date(recipient.read_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'
                                            }
                                        </td>
                                        <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            {recipient.read_time_minutes 
                                                ? `${recipient.read_time_minutes} menit`
                                                : '-'
                                            }
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {recipient.clicked ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-neutral-300 mx-auto" />
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredRecipients.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Tidak ada penerima yang sesuai dengan filter
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Cards - Mobile */}
                    <div className="md:hidden space-y-3">
                        {filteredRecipients.map((recipient, idx) => (
                            <motion.div
                                key={recipient.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">
                                            {recipient.name}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {recipient.identifier}
                                        </p>
                                    </div>
                                    {(() => {
                                        const status = recipient.read_at ? 'read' : recipient.status;
                                        const config = statusConfig[status as keyof typeof statusConfig];
                                        if (!config) return null;
                                        
                                        return (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                                                <config.icon className="h-3 w-3" />
                                                {config.label}
                                            </span>
                                        );
                                    })()}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-neutral-500 mb-1">Terkirim</p>
                                        <p className="text-neutral-900 dark:text-white font-medium">
                                            {recipient.sent_at 
                                                ? new Date(recipient.sent_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-1">Dibaca</p>
                                        <p className="text-neutral-900 dark:text-white font-medium">
                                            {recipient.read_at 
                                                ? new Date(recipient.read_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-1">Waktu Baca</p>
                                        <p className="text-neutral-900 dark:text-white font-medium">
                                            {recipient.read_time_minutes 
                                                ? `${recipient.read_time_minutes} menit`
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-1">Diklik</p>
                                        <p className="text-neutral-900 dark:text-white font-medium">
                                            {recipient.clicked ? 'Ya' : 'Tidak'}
                                        </p>
                                    </div>
                                </div>

                                {recipient.failure_reason && (
                                    <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-xs text-red-700 dark:text-red-300">
                                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                                            {recipient.failure_reason}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {filteredRecipients.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Tidak ada penerima yang sesuai dengan filter
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Confirm Dialogs */}
                <ConfirmDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={handleDelete}
                    title="Hapus Notifikasi"
                    message="Yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    theme="admin-dashboard"
                />

                <ConfirmDialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                    onConfirm={handleCancel}
                    title="Batalkan Notifikasi"
                    message="Yakin ingin membatalkan notifikasi terjadwal ini?"
                    variant="warning"
                    theme="admin-dashboard"
                />
            </motion.div>
        </AdminLayout>
    );
}
```


---

## 📋 PART 4: EXPORT FUNCTIONALITY

### 4.1 Excel Export Class

**File: `app/Exports/NotificationRecipientsExport.php`**

```php
<?php

namespace App\Exports;

use App\Models\AppNotification;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NotificationRecipientsExport implements 
    FromCollection, 
    WithHeadings, 
    WithMapping, 
    WithStyles,
    WithTitle
{
    protected $notification;

    public function __construct(AppNotification $notification)
    {
        $this->notification = $notification;
    }

    public function collection()
    {
        return $this->notification->recipients()->with('recipient')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama',
            'Identifier (NIM/NIDN)',
            'Tipe',
            'Status',
            'Terkirim',
            'Dibaca',
            'Diklik',
            'Waktu Baca (menit)',
            'Alasan Gagal',
        ];
    }

    public function map($recipient): array
    {
        $user = $recipient->recipient;
        
        return [
            $recipient->id,
            $user->nama ?? 'Unknown',
            $user->nim ?? $user->nidn ?? $user->email ?? '-',
            $recipient->recipient_type,
            $recipient->status,
            $recipient->sent_at ? $recipient->sent_at->format('Y-m-d H:i:s') : '-',
            $recipient->read_at ? $recipient->read_at->format('Y-m-d H:i:s') : '-',
            $recipient->clicked ? 'Ya' : 'Tidak',
            $recipient->read_at && $recipient->sent_at 
                ? $recipient->sent_at->diffInMinutes($recipient->read_at)
                : '-',
            $recipient->failure_reason ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Recipients';
    }
}
```

### 4.2 PDF Export View

**File: `resources/views/exports/notification-recipients.blade.php`**

```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Notification Recipients Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .info-section {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .info-section h2 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #333;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .status-badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .status-sent { background-color: #2196F3; color: white; }
        .status-read { background-color: #4CAF50; color: white; }
        .status-failed { background-color: #f44336; color: white; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Penerima Notifikasi</h1>
        <p>{{ $notification->title }}</p>
        <p>Tanggal: {{ now()->format('d F Y H:i') }}</p>
    </div>

    <div class="info-section">
        <h2>Informasi Notifikasi</h2>
        <div class="info-row">
            <span><strong>ID:</strong></span>
            <span>#{{ $notification->id }}</span>
        </div>
        <div class="info-row">
            <span><strong>Tipe:</strong></span>
            <span>{{ ucfirst($notification->type) }}</span>
        </div>
        <div class="info-row">
            <span><strong>Prioritas:</strong></span>
            <span>{{ ucfirst($notification->priority) }}</span>
        </div>
        <div class="info-row">
            <span><strong>Total Penerima:</strong></span>
            <span>{{ $notification->recipient_count }}</span>
        </div>
        <div class="info-row">
            <span><strong>Terkirim:</strong></span>
            <span>{{ $notification->sent_at ? $notification->sent_at->format('d F Y H:i') : '-' }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Identifier</th>
                <th>Status</th>
                <th>Terkirim</th>
                <th>Dibaca</th>
                <th>Diklik</th>
            </tr>
        </thead>
        <tbody>
            @foreach($recipients as $index => $recipient)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $recipient->recipient->nama ?? 'Unknown' }}</td>
                <td>{{ $recipient->recipient->nim ?? $recipient->recipient->nidn ?? '-' }}</td>
                <td>
                    <span class="status-badge status-{{ $recipient->status }}">
                        {{ ucfirst($recipient->status) }}
                    </span>
                </td>
                <td>{{ $recipient->sent_at ? $recipient->sent_at->format('d/m/Y H:i') : '-' }}</td>
                <td>{{ $recipient->read_at ? $recipient->read_at->format('d/m/Y H:i') : '-' }}</td>
                <td>{{ $recipient->clicked ? 'Ya' : 'Tidak' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Dokumen ini dibuat secara otomatis oleh sistem</p>
        <p>© {{ date('Y') }} - Admin Panel</p>
    </div>
</body>
</html>
```

---

## 📋 PART 5: ROUTES CONFIGURATION

### 5.1 Additional Routes

**File: `routes/admin.php`**

```php
// Notification Detail & Actions
Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/{id}', [NotificationManagementController::class, 'show'])->name('show');
    Route::post('/{id}/resend', [NotificationManagementController::class, 'resend'])->name('resend');
    Route::post('/{id}/cancel', [NotificationManagementController::class, 'cancel'])->name('cancel');
    Route::get('/{id}/duplicate', [NotificationManagementController::class, 'duplicate'])->name('duplicate');
    Route::get('/{id}/export-recipients', [NotificationManagementController::class, 'exportRecipients'])->name('export-recipients');
    Route::get('/{id}/analytics', [NotificationManagementController::class, 'analytics'])->name('analytics');
});
```

---

## 📋 PART 6: MOBILE RESPONSIVE ENHANCEMENTS

### 6.1 Mobile-Specific CSS

```css
/* Mobile Responsive - Matching Dashboard Admin */
@media (max-width: 768px) {
    /* Header */
    .notification-detail-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .notification-detail-header img {
        height: 2.5rem;
        width: 2.5rem;
    }

    /* Stats Grid - 1 column */
    .analytics-stats-grid {
        grid-template-columns: 1fr;
    }

    /* Layout - Stack columns */
    .detail-layout {
        grid-template-columns: 1fr;
    }

    /* Charts - Adjust height */
    .chart-container {
        height: 200px;
    }

    /* Table - Hide on mobile, show cards */
    .recipient-table {
        display: none;
    }

    .recipient-cards {
        display: block;
    }

    /* Actions menu - Full width */
    .actions-dropdown {
        width: 100%;
        right: 0;
        left: 0;
    }

    /* Timeline - Compact */
    .timeline-item {
        padding-left: 2rem;
    }

    .timeline-icon {
        width: 2rem;
        height: 2rem;
    }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
    .analytics-stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .detail-layout {
        grid-template-columns: 1fr;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .analytics-stats-grid {
        grid-template-columns: repeat(6, 1fr);
    }

    .detail-layout {
        grid-template-columns: 2fr 1fr;
    }

    .recipient-table {
        display: table;
    }

    .recipient-cards {
        display: none;
    }
}
```


---

## 📋 PART 7: ADVANCED FEATURES & INNOVATIONS

### 7.1 Real-time Updates with WebSockets

**Feature: Live tracking of notification status**

```typescript
// Add to detail.tsx
import { useEffect } from 'react';
import Echo from 'laravel-echo';

export default function NotificationDetail({ notification, ... }: DetailPageProps) {
    // ... existing code

    useEffect(() => {
        // Subscribe to notification channel
        const channel = window.Echo.channel(`notification.${notification.id}`);

        channel.listen('NotificationStatusUpdated', (event: any) => {
            // Update analytics in real-time
            router.reload({ only: ['analytics', 'recipientBreakdown'] });
        });

        return () => {
            channel.stopListening('NotificationStatusUpdated');
        };
    }, [notification.id]);

    // ... rest of component
}
```

**Backend Event:**

```php
// File: app/Events/NotificationStatusUpdated.php
<?php

namespace App\Events;

use App\Models\AppNotification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $recipientId;
    public $status;

    public function __construct(AppNotification $notification, $recipientId, $status)
    {
        $this->notification = $notification;
        $this->recipientId = $recipientId;
        $this->status = $status;
    }

    public function broadcastOn()
    {
        return new Channel('notification.' . $this->notification->id);
    }

    public function broadcastWith()
    {
        return [
            'recipient_id' => $this->recipientId,
            'status' => $this->status,
            'timestamp' => now()->toISOString(),
        ];
    }
}
```

### 7.2 Comparative Analytics

**Feature: Compare with previous notifications**

```typescript
interface ComparativeData {
    current: Analytics;
    average: Analytics;
    best: Analytics;
    improvement: {
        read_rate: number;
        click_rate: number;
        delivery_rate: number;
    };
}

const ComparativeAnalytics = ({ data }: { data: ComparativeData }) => {
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Perbandingan Performa
            </h3>

            <div className="space-y-4">
                {[
                    { label: 'Read Rate', key: 'read_rate' },
                    { label: 'Click Rate', key: 'click_rate' },
                    { label: 'Delivery Rate', key: 'delivery_rate' },
                ].map(metric => (
                    <div key={metric.key}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {metric.label}
                            </span>
                            <span className={`font-semibold ${
                                data.improvement[metric.key as keyof typeof data.improvement] > 0
                                    ? 'text-emerald-600'
                                    : data.improvement[metric.key as keyof typeof data.improvement] < 0
                                    ? 'text-red-600'
                                    : 'text-neutral-600'
                            }`}>
                                {data.improvement[metric.key as keyof typeof data.improvement] > 0 ? '+' : ''}
                                {data.improvement[metric.key as keyof typeof data.improvement].toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <div className="flex-1">
                                <p className="text-neutral-500 mb-1">Current</p>
                                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500"
                                        style={{ width: `${data.current[metric.key as keyof Analytics]}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-neutral-500 mb-1">Average</p>
                                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-neutral-400"
                                        style={{ width: `${data.average[metric.key as keyof Analytics]}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-neutral-500 mb-1">Best</p>
                                <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${data.best[metric.key as keyof Analytics]}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

### 7.3 AI-Powered Insights

**Feature: Automatic insights and recommendations**

```php
// In NotificationManagementController.php
private function generateInsights($notification, $analytics): array
{
    $insights = [];

    // Low read rate insight
    if ($analytics['read_rate'] < 30) {
        $insights[] = [
            'type' => 'warning',
            'title' => 'Read Rate Rendah',
            'message' => 'Tingkat baca notifikasi ini di bawah rata-rata. Pertimbangkan untuk menggunakan judul yang lebih menarik atau mengirim di waktu yang berbeda.',
            'action' => 'Lihat Tips',
        ];
    }

    // High click rate insight
    if ($analytics['click_rate'] > 50) {
        $insights[] = [
            'type' => 'success',
            'title' => 'Click Rate Tinggi',
            'message' => 'Notifikasi ini memiliki tingkat klik yang sangat baik! Action button Anda efektif.',
            'action' => 'Simpan sebagai Template',
        ];
    }

    // Slow read time insight
    if ($analytics['avg_read_time'] && $analytics['avg_read_time'] > 1440) {
        $insights[] = [
            'type' => 'info',
            'title' => 'Waktu Baca Lambat',
            'message' => 'Rata-rata waktu baca lebih dari 24 jam. Pertimbangkan untuk mengirim reminder.',
            'action' => 'Kirim Reminder',
        ];
    }

    // Failed deliveries insight
    if ($analytics['failed'] > 0) {
        $insights[] = [
            'type' => 'danger',
            'title' => 'Pengiriman Gagal',
            'message' => "{$analytics['failed']} notifikasi gagal terkirim. Periksa detail penerima untuk informasi lebih lanjut.",
            'action' => 'Lihat Detail',
        ];
    }

    // Best time insight
    $bestHour = $this->getBestReadHour($notification);
    if ($bestHour) {
        $insights[] = [
            'type' => 'info',
            'title' => 'Waktu Terbaik',
            'message' => "Notifikasi paling banyak dibaca pada pukul {$bestHour}:00. Pertimbangkan waktu ini untuk notifikasi berikutnya.",
            'action' => null,
        ];
    }

    return $insights;
}

private function getBestReadHour($notification): ?int
{
    $hourlyReads = $notification->recipients()
        ->whereNotNull('read_at')
        ->get()
        ->groupBy(function($recipient) {
            return $recipient->read_at->hour;
        })
        ->map(function($group) {
            return $group->count();
        })
        ->sortDesc();

    return $hourlyReads->keys()->first();
}
```

**Frontend Display:**

```tsx
const InsightsPanel = ({ insights }: { insights: Insight[] }) => {
    const iconMap = {
        success: CheckCircle,
        warning: AlertTriangle,
        info: Info,
        danger: XCircle,
    };

    const colorMap = {
        success: 'emerald',
        warning: 'amber',
        info: 'blue',
        danger: 'red',
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                AI Insights & Rekomendasi
            </h3>

            <div className="space-y-3">
                {insights.map((insight, idx) => {
                    const Icon = iconMap[insight.type as keyof typeof iconMap];
                    const color = colorMap[insight.type as keyof typeof colorMap];

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-xl border-2 border-${color}-200 dark:border-${color}-800 bg-${color}-50 dark:bg-${color}-900/20`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`h-5 w-5 text-${color}-600 flex-shrink-0 mt-0.5`} />
                                <div className="flex-1">
                                    <h4 className={`font-semibold text-${color}-900 dark:text-${color}-100 mb-1`}>
                                        {insight.title}
                                    </h4>
                                    <p className={`text-sm text-${color}-700 dark:text-${color}-300`}>
                                        {insight.message}
                                    </p>
                                    {insight.action && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-3"
                                        >
                                            {insight.action}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
```

### 7.4 Recipient Engagement Score

**Feature: Calculate engagement score for each recipient**

```php
private function calculateEngagementScore($recipient): int
{
    $score = 0;

    // Base score for delivery
    if ($recipient->status === 'sent' || $recipient->status === 'delivered') {
        $score += 20;
    }

    // Score for reading
    if ($recipient->read_at) {
        $score += 40;
        
        // Bonus for quick read (within 1 hour)
        if ($recipient->sent_at && $recipient->sent_at->diffInMinutes($recipient->read_at) <= 60) {
            $score += 10;
        }
    }

    // Score for clicking
    if ($recipient->clicked) {
        $score += 30;
    }

    return min($score, 100);
}
```

### 7.5 Notification Heatmap

**Feature: Visual heatmap of read times**

```tsx
const NotificationHeatmap = ({ data }: { data: HourlyData[] }) => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getIntensity = (value: number, max: number) => {
        if (value === 0) return 'bg-neutral-100 dark:bg-neutral-800';
        const percentage = (value / max) * 100;
        if (percentage < 25) return 'bg-blue-200 dark:bg-blue-900/40';
        if (percentage < 50) return 'bg-blue-400 dark:bg-blue-700/60';
        if (percentage < 75) return 'bg-blue-600 dark:bg-blue-600/80';
        return 'bg-blue-800 dark:bg-blue-500';
    };

    const maxValue = Math.max(...data.map(d => d.read));

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Heatmap Aktivitas
            </h3>

            <div className="overflow-x-auto">
                <div className="inline-grid grid-cols-25 gap-1">
                    {/* Header */}
                    <div />
                    {hours.map(hour => (
                        <div key={hour} className="text-xs text-center text-neutral-500">
                            {hour}
                        </div>
                    ))}

                    {/* Rows */}
                    {days.map((day, dayIdx) => (
                        <>
                            <div className="text-xs text-neutral-500 flex items-center">
                                {day}
                            </div>
                            {hours.map(hour => {
                                const value = data[dayIdx * 24 + hour]?.read || 0;
                                return (
                                    <div
                                        key={`${dayIdx}-${hour}`}
                                        className={`h-8 w-8 rounded ${getIntensity(value, maxValue)} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
                                        title={`${day} ${hour}:00 - ${value} dibaca`}
                                    />
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
};
```


---

## 📋 PART 8: PERFORMANCE OPTIMIZATION

### 8.1 Lazy Loading for Large Recipient Lists

```typescript
// Implement virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedRecipientList = ({ recipients }: { recipients: Recipient[] }) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: recipients.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="h-[600px] overflow-auto">
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const recipient = recipients[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <RecipientCard recipient={recipient} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
```

### 8.2 Caching Strategy

```php
// Cache analytics for better performance
public function show($id)
{
    $cacheKey = "notification_detail_{$id}";
    
    $data = Cache::remember($cacheKey, 300, function () use ($id) {
        $notification = AppNotification::with([
            'template',
            'recipients.recipient'
        ])->findOrFail($id);

        return [
            'notification' => $this->formatNotification($notification),
            'analytics' => $this->calculateAnalytics($notification),
            'timeline' => $this->getTimeline($notification),
            'metrics' => $this->getPerformanceMetrics($notification),
        ];
    });

    // Get fresh recipient breakdown (not cached for real-time updates)
    $notification = AppNotification::findOrFail($id);
    $data['recipientBreakdown'] = $this->getRecipientBreakdown($notification);

    return Inertia::render('admin/notifications/detail', $data);
}

// Clear cache when notification is updated
public function updateRecipientStatus($notificationId, $recipientId, $status)
{
    Cache::forget("notification_detail_{$notificationId}");
    
    // Update recipient status
    NotificationRecipient::where('id', $recipientId)->update([
        'status' => $status,
        'read_at' => $status === 'read' ? now() : null,
    ]);

    // Broadcast event
    broadcast(new NotificationStatusUpdated($notificationId, $recipientId, $status));
}
```

---

## 📋 PART 9: TESTING & VALIDATION

### 9.1 Unit Tests

```php
// File: tests/Unit/NotificationAnalyticsTest.php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\AppNotification;
use App\Models\NotificationRecipient;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NotificationAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_calculates_read_rate_correctly()
    {
        $notification = AppNotification::factory()->create([
            'recipient_count' => 10,
        ]);

        // Create 10 recipients, 7 read
        NotificationRecipient::factory()->count(7)->create([
            'notification_id' => $notification->id,
            'read_at' => now(),
        ]);

        NotificationRecipient::factory()->count(3)->create([
            'notification_id' => $notification->id,
            'read_at' => null,
        ]);

        $controller = new \App\Http\Controllers\Admin\NotificationManagementController(
            new \App\Services\AdminNotificationService()
        );

        $analytics = $controller->calculateAnalytics($notification);

        $this->assertEquals(70, $analytics['read_rate']);
    }

    public function test_calculates_average_read_time()
    {
        $notification = AppNotification::factory()->create();

        // Create recipients with different read times
        NotificationRecipient::factory()->create([
            'notification_id' => $notification->id,
            'sent_at' => now()->subMinutes(10),
            'read_at' => now(),
        ]);

        NotificationRecipient::factory()->create([
            'notification_id' => $notification->id,
            'sent_at' => now()->subMinutes(20),
            'read_at' => now(),
        ]);

        $controller = new \App\Http\Controllers\Admin\NotificationManagementController(
            new \App\Services\AdminNotificationService()
        );

        $analytics = $controller->calculateAnalytics($notification);

        $this->assertEquals(15, $analytics['avg_read_time']);
    }
}
```

### 9.2 Feature Tests

```php
// File: tests/Feature/NotificationDetailTest.php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\AppNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NotificationDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_notification_detail()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $notification = AppNotification::factory()->create();

        $response = $this->actingAs($admin)
            ->get(route('admin.notifications.show', $notification->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('admin/notifications/detail')
                ->has('notification')
                ->has('analytics')
                ->has('timeline')
        );
    }

    public function test_can_export_recipients_to_excel()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $notification = AppNotification::factory()->create();

        $response = $this->actingAs($admin)
            ->get(route('admin.notifications.export-recipients', [
                'id' => $notification->id,
                'format' => 'excel'
            ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_resend_notification()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $notification = AppNotification::factory()->create();

        $response = $this->actingAs($admin)
            ->post(route('admin.notifications.resend', $notification->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('app_notifications', [
            'title' => $notification->title,
            'message' => $notification->message,
        ]);
    }
}
```

---

## 📋 PART 10: ACCESSIBILITY ENHANCEMENTS

### 10.1 Screen Reader Support

```tsx
// Add ARIA labels and live regions
<div 
    role="region" 
    aria-label="Detail Notifikasi"
    aria-describedby="notification-description"
>
    <p id="notification-description" className="sr-only">
        Halaman detail notifikasi menampilkan informasi lengkap, analytics, dan daftar penerima
    </p>

    {/* Live region for updates */}
    <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
    >
        {analytics.read} dari {analytics.total_recipients} penerima telah membaca notifikasi
    </div>

    {/* Charts with descriptions */}
    <div role="img" aria-label={`Grafik distribusi per jam menunjukkan ${metrics.hourly_distribution.length} data point`}>
        <ResponsiveContainer>
            {/* Chart component */}
        </ResponsiveContainer>
    </div>
</div>
```

### 10.2 Keyboard Navigation

```typescript
// Add keyboard shortcuts
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        // R - Resend
        if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
            handleResend();
        }

        // D - Duplicate
        if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
            handleDuplicate();
        }

        // E - Export
        if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
            handleExport('excel');
        }

        // Escape - Close modals
        if (e.key === 'Escape') {
            setShowActionsMenu(false);
            setShowDeleteDialog(false);
            setShowCancelDialog(false);
        }

        // / - Focus search
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            document.getElementById('recipient-search')?.focus();
        }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, []);

// Show keyboard shortcuts help
const KeyboardShortcutsHelp = () => (
    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
        <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between">
                <span>Resend</span>
                <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border">R</kbd>
            </div>
            <div className="flex justify-between">
                <span>Duplicate</span>
                <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border">D</kbd>
            </div>
            <div className="flex justify-between">
                <span>Export</span>
                <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border">E</kbd>
            </div>
            <div className="flex justify-between">
                <span>Search</span>
                <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 rounded border">/</kbd>
            </div>
        </div>
    </div>
);
```

---

## 📋 PART 11: DEPLOYMENT CHECKLIST

### ✅ Backend Checklist

- [ ] Controller methods implemented
- [ ] Analytics calculations optimized
- [ ] Export functionality working
- [ ] Caching implemented
- [ ] Real-time events configured
- [ ] Database queries optimized
- [ ] Error handling complete
- [ ] Authorization checks in place

### ✅ Frontend Checklist

- [ ] Detail page component complete
- [ ] All charts rendering correctly
- [ ] Timeline visualization working
- [ ] Recipient table/cards functional
- [ ] Export buttons working
- [ ] Action menu functional
- [ ] Mobile responsive
- [ ] Dark mode support
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility features

### ✅ UI/UX Checklist

- [ ] Colors match dashboard admin
- [ ] Icons match dashboard admin
- [ ] No container on header icon
- [ ] No animated icon movements
- [ ] Back button matches other menus
- [ ] Mobile responsive like dashboard
- [ ] Charts readable on mobile
- [ ] Tables convert to cards on mobile
- [ ] No dummy data

### ✅ Performance Checklist

- [ ] Large recipient lists optimized
- [ ] Charts render efficiently
- [ ] Caching implemented
- [ ] Lazy loading for heavy components
- [ ] Database queries optimized
- [ ] Real-time updates efficient

---

## 🎉 CONCLUSION

Sistem **Detail Notifikasi** untuk Admin telah dirancang dengan sangat komprehensif, mencakup:

1. **Comprehensive Analytics** - Statistik lengkap dengan visualisasi
2. **Real-time Tracking** - Live updates untuk status notifikasi
3. **Advanced Charts** - Multiple chart types untuk analisis mendalam
4. **Recipient Management** - Detail tracking setiap penerima
5. **Export Capabilities** - Excel dan PDF export
6. **AI Insights** - Rekomendasi otomatis berdasarkan performa
7. **Performance Optimization** - Caching, lazy loading, virtual scrolling
8. **Accessibility** - ARIA labels, keyboard navigation
9. **Mobile Responsive** - Optimal di semua device
10. **Action Management** - Resend, duplicate, cancel functionality

**Key Highlights:**
- ✅ UI/UX 100% matching dengan dashboard admin
- ✅ Tidak ada data dummy
- ✅ Icon header tanpa container
- ✅ Tidak ada animasi icon bergerak
- ✅ Mobile responsive optimal dengan table → cards
- ✅ Tombol kembali konsisten
- ✅ Analytics mendalam dengan multiple visualizations
- ✅ Real-time updates dengan WebSockets
- ✅ AI-powered insights dan recommendations
- ✅ Export ke Excel dan PDF
- ✅ Performance optimized untuk large datasets

Sistem ini memberikan admin visibility lengkap terhadap performa notifikasi dengan analytics yang powerful dan actionable insights!

