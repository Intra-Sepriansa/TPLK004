import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Bell,
    Circle,
    Clock,
    Eye,
    FileText,
    Filter,
    Globe,
    GraduationCap,
    Info,
    Megaphone,
    Plus,
    Search,
    Send,
    Siren,
    Sparkles,
    Target,
    Trophy,
    UserCog,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// Custom Icons — MATCHING existing notification-center.tsx
import notifikasiIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import recipientsIcon from '@/assets/admin/notification-center/recipients.png';
import scheduledIcon from '@/assets/admin/notification-center/scheduled.png';
import totalIcon from '@/assets/admin/notification-center/total.png';
import unreadIcon from '@/assets/admin/notification-center/unread.png';

// ─── Types ───────────────────────────────────────────────────────────
interface Template {
    id: number;
    name: string;
    subject: string;
    body: string;
    type: string;
    variables: string[] | null;
}

interface Course {
    id: number;
    nama: string;
    dosen: string;
}

interface MahasiswaItem {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
}

interface DosenItem {
    id: number;
    nama: string;
    nidn: string;
}

interface Stats {
    total_mahasiswa: number;
    total_dosen: number;
    total_templates: number;
    sent_today: number;
    scheduled: number;
}

interface Props {
    templates: Template[];
    courses: Course[];
    classes: string[];
    mahasiswa: MahasiswaItem[];
    dosen: DosenItem[];
    stats: Stats;
}

// ─── Animations ──────────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
};

// ─── Component ───────────────────────────────────────────────────────
export default function CreateNotification({
    templates,
    courses,
    classes,
    mahasiswa,
    dosen,
    stats,
}: Props) {
    const [showPreview, setShowPreview] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [searchRecipient, setSearchRecipient] = useState('');

    const form = useForm({
        target: 'all' as 'all' | 'mahasiswa' | 'dosen' | 'specific',
        title: '',
        message: '',
        type: 'info' as string,
        priority: 'normal' as string,
        action_url: '',
        scheduled_at: '',
        target_type: 'mahasiswa' as 'mahasiswa' | 'dosen',
        target_ids: [] as number[],
        // Extra frontend-only fields
        filter_classes: [] as string[],
    });

    // Recipient count
    const recipientCount = useMemo(() => {
        if (form.data.target === 'all')
            return stats.total_mahasiswa + stats.total_dosen;
        if (form.data.target === 'mahasiswa') return stats.total_mahasiswa;
        if (form.data.target === 'dosen') return stats.total_dosen;
        if (form.data.target === 'specific') return form.data.target_ids.length;
        return 0;
    }, [form.data.target, form.data.target_ids.length, stats]);

    // Filtered mahasiswa by class + search
    const filteredMahasiswa = useMemo(() => {
        let list = mahasiswa;
        if (form.data.filter_classes.length > 0) {
            list = list.filter((m) =>
                form.data.filter_classes.includes(m.kelas),
            );
        }
        if (searchRecipient) {
            const q = searchRecipient.toLowerCase();
            list = list.filter(
                (m) =>
                    m.nama.toLowerCase().includes(q) ||
                    m.nim.toLowerCase().includes(q),
            );
        }
        return list;
    }, [mahasiswa, form.data.filter_classes, searchRecipient]);

    const filteredDosen = useMemo(() => {
        if (!searchRecipient) return dosen;
        const q = searchRecipient.toLowerCase();
        return dosen.filter(
            (d) =>
                d.nama.toLowerCase().includes(q) ||
                (d.nidn && d.nidn.toLowerCase().includes(q)),
        );
    }, [dosen, searchRecipient]);

    const applyTemplate = (t: Template) => {
        form.setData((prev) => ({
            ...prev,
            title: t.subject,
            message: t.body,
            type: t.type || 'info',
        }));
        setSelectedTemplate(t);
        setShowTemplateModal(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Record<string, unknown> = {
            target: form.data.target,
            title: form.data.title,
            message: form.data.message,
            type: form.data.type,
            priority: form.data.priority,
            action_url: form.data.action_url || null,
            scheduled_at: form.data.scheduled_at || null,
        };
        if (form.data.target === 'specific') {
            payload.target_ids = form.data.target_ids;
            payload.target_type = form.data.target_type;
        }
        router.post('/admin/notification-center', payload as any);
    };

    const typeConfig: Record<
        string,
        { icon: typeof Info; color: string; label: string }
    > = {
        info: { icon: Info, color: 'blue', label: 'Informasi' },
        reminder: { icon: Clock, color: 'amber', label: 'Pengingat' },
        announcement: { icon: Megaphone, color: 'purple', label: 'Pengumuman' },
        alert: { icon: Siren, color: 'red', label: 'Alert' },
        warning: { icon: AlertTriangle, color: 'orange', label: 'Peringatan' },
        achievement: { icon: Trophy, color: 'emerald', label: 'Achievement' },
    };

    const priorityConfig: Record<string, { label: string; color: string }> = {
        low: { label: 'Low', color: 'emerald' },
        normal: { label: 'Normal', color: 'blue' },
        high: { label: 'High', color: 'orange' },
        urgent: { label: 'Urgent', color: 'red' },
    };

    // ─── Stat color configs — matching notification-center.tsx ────────
    const statCards = [
        {
            title: 'Total Mahasiswa',
            value: stats.total_mahasiswa,
            imgSrc: totalIcon,
            color: 'indigo',
            change: 'Aktif',
        },
        {
            title: 'Total Dosen',
            value: stats.total_dosen,
            imgSrc: unreadIcon,
            color: 'emerald',
            change: 'Aktif',
        },
        {
            title: 'Terkirim Hari Ini',
            value: stats.sent_today,
            imgSrc: recipientsIcon,
            color: 'amber',
            change: 'Hari ini',
        },
        {
            title: 'Terjadwal',
            value: stats.scheduled,
            imgSrc: scheduledIcon,
            color: 'rose',
            change: 'Upcoming',
        },
    ];

    const colorConfigs: Record<
        string,
        {
            from: string;
            to: string;
            bg: string;
            hoverShadow: string;
            gradientBg: string;
        }
    > = {
        indigo: {
            from: 'from-sky-400',
            to: 'to-indigo-600',
            bg: 'bg-sky-500',
            hoverShadow: 'hover:shadow-sky-500/10',
            gradientBg:
                'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
        },
        emerald: {
            from: 'from-emerald-400',
            to: 'to-teal-600',
            bg: 'bg-emerald-500',
            hoverShadow: 'hover:shadow-emerald-500/10',
            gradientBg:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
        },
        amber: {
            from: 'from-amber-400',
            to: 'to-orange-600',
            bg: 'bg-amber-500',
            hoverShadow: 'hover:shadow-amber-500/10',
            gradientBg:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
        },
        rose: {
            from: 'from-rose-400',
            to: 'to-pink-600',
            bg: 'bg-rose-500',
            hoverShadow: 'hover:shadow-rose-500/10',
            gradientBg:
                'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
        },
    };

    return (
        <AppLayout>
            <Head title="Buat Notifikasi Baru" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8 p-6"
            >
                {/* ═══════ HEADER — matching notification-center.tsx ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-start">
                            <motion.button
                                type="button"
                                onClick={() =>
                                    router.get('/admin/notification-center')
                                }
                                whileHover={{ x: -4 }}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar
                            </motion.button>
                        </div>

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={notifikasiIcon}
                                        alt="Notifikasi"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]"
                                    />
                                </motion.div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium tracking-wide text-indigo-100">
                                        Buat & Kirim
                                    </p>
                                    <h1 className="mt-1 text-2xl leading-tight font-bold sm:text-3xl">
                                        Buat Notifikasi Baru
                                    </h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 max-w-2xl text-sm text-indigo-100/90"
                                    >
                                        Kirim notifikasi ke mahasiswa, dosen,
                                        atau semua pengguna.
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ STAT CARDS — same design as notification-center.tsx ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {statCards.map((stat, i) => {
                        const cc =
                            colorConfigs[stat.color] || colorConfigs.indigo;
                        return (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 100,
                                            damping: 15,
                                        },
                                    },
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    },
                                }}
                                className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${cc.hoverShadow} dark:border-white/5`}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`}
                                />
                                <motion.div
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${cc.bg} opacity-20 blur-3xl transition-all group-hover:opacity-40`}
                                />
                                <div className="relative z-10 flex h-full flex-col items-center justify-between gap-4 sm:items-start sm:gap-5">
                                    <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-300 sm:h-14 sm:w-14"
                                        >
                                            <img
                                                src={stat.imgSrc}
                                                alt={stat.title}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        </motion.div>
                                        <div className="flex flex-col">
                                            <h3 className="mb-0.5 text-[10px] leading-tight font-medium text-neutral-500 sm:mb-1 sm:text-sm dark:text-neutral-400">
                                                {stat.title}
                                            </h3>
                                            <span className="text-xl leading-none font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                                {stat.value}
                                            </span>
                                            <div className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                                                <div className="flex items-center gap-0.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                                                    {stat.change}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ MAIN FORM ═══════ */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* ── LEFT COLUMN ── */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-6 lg:col-span-2"
                        >
                            {/* Template Selection Card */}
                            <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                        <FileText className="h-5 w-5 text-purple-500" />
                                        Template Notifikasi
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowTemplateModal(true)
                                        }
                                        className="rounded-xl"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Pilih Template
                                    </Button>
                                </div>
                                {selectedTemplate && (
                                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-purple-900 dark:text-purple-100">
                                                    {selectedTemplate.name}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-sm text-purple-700 dark:text-purple-300">
                                                    {selectedTemplate.body}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedTemplate(null)
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {!selectedTemplate &&
                                    templates.length === 0 && (
                                        <p className="text-sm text-neutral-500">
                                            Belum ada template tersedia.
                                        </p>
                                    )}
                            </div>

                            {/* Basic Info Card */}
                            <div className="space-y-5 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                    <Bell className="h-5 w-5 text-blue-500" />
                                    Informasi Notifikasi
                                </h3>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Judul Notifikasi *
                                    </Label>
                                    <Input
                                        value={form.data.title}
                                        onChange={(e) =>
                                            form.setData(
                                                'title',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Masukkan judul notifikasi..."
                                        className="h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="text-sm text-red-600">
                                            {form.errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Isi Pesan *
                                    </Label>
                                    <Textarea
                                        value={form.data.message}
                                        onChange={(e) =>
                                            form.setData(
                                                'message',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Tulis isi pesan notifikasi..."
                                        rows={5}
                                        className="resize-none rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        required
                                    />
                                    <p className="text-xs text-neutral-500">
                                        {form.data.message.length} karakter
                                    </p>
                                    {form.errors.message && (
                                        <p className="text-sm text-red-600">
                                            {form.errors.message}
                                        </p>
                                    )}
                                </div>

                                {/* Type & Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            <Bell className="h-4 w-4 text-purple-500" />{' '}
                                            Tipe
                                        </Label>
                                        <Select
                                            value={form.data.type}
                                            onValueChange={(v) =>
                                                form.setData('type', v)
                                            }
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white dark:bg-neutral-900">
                                                <SelectItem value="info">
                                                    <span className="flex items-center gap-2">
                                                        <Info className="h-4 w-4 text-blue-500" />{' '}
                                                        Info
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="reminder">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-amber-500" />{' '}
                                                        Reminder
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="announcement">
                                                    <span className="flex items-center gap-2">
                                                        <Megaphone className="h-4 w-4 text-purple-500" />{' '}
                                                        Pengumuman
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="alert">
                                                    <span className="flex items-center gap-2">
                                                        <Siren className="h-4 w-4 text-red-500" />{' '}
                                                        Alert
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="warning">
                                                    <span className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-amber-500" />{' '}
                                                        Peringatan
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="achievement">
                                                    <span className="flex items-center gap-2">
                                                        <Trophy className="h-4 w-4 text-emerald-500" />{' '}
                                                        Achievement
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />{' '}
                                            Prioritas
                                        </Label>
                                        <Select
                                            value={form.data.priority}
                                            onValueChange={(v) =>
                                                form.setData('priority', v)
                                            }
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white dark:bg-neutral-900">
                                                <SelectItem value="low">
                                                    <span className="flex items-center gap-2">
                                                        <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" />{' '}
                                                        Low
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="normal">
                                                    <span className="flex items-center gap-2">
                                                        <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />{' '}
                                                        Normal
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="high">
                                                    <span className="flex items-center gap-2">
                                                        <Circle className="h-3 w-3 fill-amber-500 text-amber-500" />{' '}
                                                        High
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="urgent">
                                                    <span className="flex items-center gap-2">
                                                        <Circle className="h-3 w-3 fill-red-500 text-red-500" />{' '}
                                                        Urgent
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Action URL (Optional) */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Action URL{' '}
                                        <span className="text-xs font-normal text-neutral-400">
                                            (Opsional)
                                        </span>
                                    </Label>
                                    <Input
                                        value={form.data.action_url}
                                        onChange={(e) =>
                                            form.setData(
                                                'action_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="/user/tugas atau https://..."
                                        className="h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50"
                                    />
                                </div>
                            </div>

                            {/* Target Recipients Card */}
                            <div className="space-y-5 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                    <Target className="h-5 w-5 text-emerald-500" />
                                    Target Penerima
                                </h3>

                                {/* Target Type — matching existing store() API: all, mahasiswa, dosen, specific */}
                                <div>
                                    <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Kirim Ke *
                                    </Label>
                                    <Select
                                        value={form.data.target}
                                        onValueChange={(v: any) => {
                                            form.setData('target', v);
                                            form.setData('target_ids', []);
                                        }}
                                    >
                                        <SelectTrigger className="mt-2 h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl bg-white dark:bg-neutral-900">
                                            <SelectItem value="all">
                                                <span className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-blue-500" />{' '}
                                                    Semua Pengguna
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="mahasiswa">
                                                <span className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-indigo-500" />{' '}
                                                    Semua Mahasiswa (
                                                    {stats.total_mahasiswa})
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="dosen">
                                                <span className="flex items-center gap-2">
                                                    <UserCog className="h-4 w-4 text-purple-500" />{' '}
                                                    Semua Dosen (
                                                    {stats.total_dosen})
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="specific">
                                                <span className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-cyan-500" />{' '}
                                                    Spesifik
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Specific recipient selection */}
                                {form.data.target === 'specific' && (
                                    <div className="space-y-4">
                                        {/* Sub-target type */}
                                        <div>
                                            <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Tipe Penerima
                                            </Label>
                                            <Select
                                                value={form.data.target_type}
                                                onValueChange={(v: any) => {
                                                    form.setData(
                                                        'target_type',
                                                        v,
                                                    );
                                                    form.setData(
                                                        'target_ids',
                                                        [],
                                                    );
                                                }}
                                            >
                                                <SelectTrigger className="mt-2 h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl bg-white dark:bg-neutral-900">
                                                    <SelectItem value="mahasiswa">
                                                        Mahasiswa
                                                    </SelectItem>
                                                    <SelectItem value="dosen">
                                                        Dosen
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Class filter chips (only for mahasiswa) */}
                                        {form.data.target_type ===
                                            'mahasiswa' &&
                                            classes.length > 0 && (
                                                <div>
                                                    <Label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                        <Filter className="mr-1 inline h-4 w-4 text-indigo-500" />
                                                        Filter Kelas
                                                    </Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {classes.map(
                                                            (kelas) => (
                                                                <button
                                                                    key={kelas}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current =
                                                                            form
                                                                                .data
                                                                                .filter_classes;
                                                                        form.setData(
                                                                            'filter_classes',
                                                                            current.includes(
                                                                                kelas,
                                                                            )
                                                                                ? current.filter(
                                                                                      (
                                                                                          c,
                                                                                      ) =>
                                                                                          c !==
                                                                                          kelas,
                                                                                  )
                                                                                : [
                                                                                      ...current,
                                                                                      kelas,
                                                                                  ],
                                                                        );
                                                                    }}
                                                                    className={cn(
                                                                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                                                                        form.data.filter_classes.includes(
                                                                            kelas,
                                                                        )
                                                                            ? 'border-indigo-500 bg-indigo-500 text-white'
                                                                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-indigo-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                                                                    )}
                                                                >
                                                                    {kelas}
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                            <Input
                                                value={searchRecipient}
                                                onChange={(e) =>
                                                    setSearchRecipient(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Cari nama atau NIM/NIDN..."
                                                className="h-11 rounded-xl border-neutral-200 bg-neutral-50/80 pl-10 dark:border-neutral-700 dark:bg-neutral-800/50"
                                            />
                                        </div>

                                        {/* Recipient list */}
                                        <div className="max-h-64 divide-y divide-neutral-100 overflow-y-auto rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-700">
                                            {form.data.target_type ===
                                            'mahasiswa' ? (
                                                filteredMahasiswa.length ===
                                                0 ? (
                                                    <p className="p-4 text-center text-sm text-neutral-500">
                                                        Tidak ditemukan.
                                                    </p>
                                                ) : (
                                                    filteredMahasiswa.map(
                                                        (mhs) => (
                                                            <label
                                                                key={mhs.id}
                                                                className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                                            >
                                                                <Checkbox
                                                                    checked={form.data.target_ids.includes(
                                                                        mhs.id,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) => {
                                                                        form.setData(
                                                                            'target_ids',
                                                                            checked
                                                                                ? [
                                                                                      ...form
                                                                                          .data
                                                                                          .target_ids,
                                                                                      mhs.id,
                                                                                  ]
                                                                                : form.data.target_ids.filter(
                                                                                      (
                                                                                          id,
                                                                                      ) =>
                                                                                          id !==
                                                                                          mhs.id,
                                                                                  ),
                                                                        );
                                                                    }}
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                                        {
                                                                            mhs.nama
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-neutral-500">
                                                                        {
                                                                            mhs.nim
                                                                        }{' '}
                                                                        •{' '}
                                                                        {
                                                                            mhs.kelas
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        ),
                                                    )
                                                )
                                            ) : filteredDosen.length === 0 ? (
                                                <p className="p-4 text-center text-sm text-neutral-500">
                                                    Tidak ditemukan.
                                                </p>
                                            ) : (
                                                filteredDosen.map((dsn) => (
                                                    <label
                                                        key={dsn.id}
                                                        className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                                    >
                                                        <Checkbox
                                                            checked={form.data.target_ids.includes(
                                                                dsn.id,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                form.setData(
                                                                    'target_ids',
                                                                    checked
                                                                        ? [
                                                                              ...form
                                                                                  .data
                                                                                  .target_ids,
                                                                              dsn.id,
                                                                          ]
                                                                        : form.data.target_ids.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  dsn.id,
                                                                          ),
                                                                );
                                                            }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                                {dsn.nama}
                                                            </p>
                                                            <p className="text-xs text-neutral-500">
                                                                {dsn.nidn}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                        </div>

                                        {form.data.target_ids.length > 0 && (
                                            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                    Terpilih
                                                </span>
                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {
                                                        form.data.target_ids
                                                            .length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {form.errors.target_ids && (
                                            <p className="text-sm text-red-600">
                                                {form.errors.target_ids}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Recipient count summary */}
                                {form.data.target !== 'specific' && (
                                    <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Total Penerima
                                        </span>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {recipientCount}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Schedule Card */}
                            <div className="space-y-4 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    Opsi Lanjutan
                                </h3>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        <Clock className="h-4 w-4 text-emerald-500" />
                                        Jadwal Pengiriman
                                        <span className="text-xs font-normal text-neutral-400">
                                            (Opsional)
                                        </span>
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.scheduled_at}
                                        onChange={(e) =>
                                            form.setData(
                                                'scheduled_at',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 rounded-xl border-neutral-200 bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        min={new Date()
                                            .toISOString()
                                            .slice(0, 16)}
                                    />
                                    <p className="text-xs text-neutral-500">
                                        Kosongkan untuk mengirim sekarang
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── RIGHT COLUMN — Preview & Actions ── */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-6"
                        >
                            {/* Preview Card */}
                            <div className="sticky top-6 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                        <Eye className="h-5 w-5 text-blue-500" />
                                        Preview
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setShowPreview(!showPreview)
                                        }
                                        className="rounded-xl"
                                    >
                                        {showPreview
                                            ? 'Sembunyikan'
                                            : 'Tampilkan'}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {showPreview && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {/* Mini phone preview */}
                                            <div className="rounded-xl border-2 border-neutral-300 bg-neutral-100 p-4 dark:border-neutral-600 dark:bg-neutral-900">
                                                <div className="rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800">
                                                    <div className="mb-3 flex items-center gap-2">
                                                        {(() => {
                                                            const cfg =
                                                                typeConfig[
                                                                    form.data
                                                                        .type
                                                                ] ||
                                                                typeConfig.info;
                                                            return (
                                                                <>
                                                                    <cfg.icon
                                                                        className={`h-4 w-4 text-${cfg.color}-500`}
                                                                    />
                                                                    <span
                                                                        className={`text-xs font-medium text-${cfg.color}-600`}
                                                                    >
                                                                        {
                                                                            cfg.label
                                                                        }
                                                                    </span>
                                                                </>
                                                            );
                                                        })()}
                                                        {form.data.priority !==
                                                            'normal' &&
                                                            form.data
                                                                .priority !==
                                                                'low' && (
                                                                <span
                                                                    className={cn(
                                                                        'ml-auto rounded-full px-2 py-0.5 text-xs',
                                                                        form
                                                                            .data
                                                                            .priority ===
                                                                            'urgent'
                                                                            ? 'bg-red-100 text-red-700'
                                                                            : 'bg-orange-100 text-orange-700',
                                                                    )}
                                                                >
                                                                    {
                                                                        priorityConfig[
                                                                            form
                                                                                .data
                                                                                .priority
                                                                        ]?.label
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>
                                                    <h4 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                                        {form.data.title ||
                                                            'Judul notifikasi...'}
                                                    </h4>
                                                    <p className="mb-3 text-xs whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                                                        {form.data.message ||
                                                            'Pesan notifikasi akan ditampilkan di sini...'}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400">
                                                        Baru saja
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            <div className="space-y-1 text-xs text-neutral-500">
                                                <p>
                                                    • Penerima:{' '}
                                                    <strong>
                                                        {recipientCount}
                                                    </strong>{' '}
                                                    orang
                                                </p>
                                                <p>
                                                    • Tipe:{' '}
                                                    {typeConfig[form.data.type]
                                                        ?.label ||
                                                        form.data.type}
                                                </p>
                                                <p>
                                                    • Prioritas:{' '}
                                                    {priorityConfig[
                                                        form.data.priority
                                                    ]?.label ||
                                                        form.data.priority}
                                                </p>
                                                {form.data.scheduled_at && (
                                                    <p>
                                                        • Dijadwalkan:{' '}
                                                        {new Date(
                                                            form.data.scheduled_at,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={
                                            form.processing ||
                                            recipientCount === 0 ||
                                            !form.data.title ||
                                            !form.data.message
                                        }
                                        className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700"
                                    >
                                        {form.processing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                {form.data.scheduled_at
                                                    ? 'Jadwalkan Notifikasi'
                                                    : 'Kirim Notifikasi'}
                                            </>
                                        )}
                                    </Button>
                                </motion.div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.get('/admin/notification-center')
                                    }
                                    className="h-11 w-full rounded-xl"
                                >
                                    Batal
                                </Button>
                            </div>

                            {/* Quick Stats */}
                            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
                                <h4 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">
                                    Statistik Cepat
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Terkirim Hari Ini
                                        </span>
                                        <span className="font-semibold">
                                            {stats.sent_today}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Template Tersedia
                                        </span>
                                        <span className="font-semibold">
                                            {stats.total_templates}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Terjadwal
                                        </span>
                                        <span className="font-semibold">
                                            {stats.scheduled}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </form>

                {/* ═══════ TEMPLATE SELECTION MODAL ═══════ */}
                <AnimatePresence>
                    {showTemplateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowTemplateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-800"
                            >
                                <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        Pilih Template
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setShowTemplateModal(false)
                                        }
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="max-h-[calc(80vh-80px)] overflow-y-auto p-6">
                                    {templates.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <FileText className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
                                            <p className="text-neutral-600 dark:text-neutral-400">
                                                Belum ada template tersedia
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {templates.map((template) => (
                                                <motion.div
                                                    key={template.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="cursor-pointer rounded-xl border-2 border-neutral-200 p-4 transition-all hover:border-indigo-500 dark:border-neutral-700"
                                                    onClick={() =>
                                                        applyTemplate(template)
                                                    }
                                                >
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                            {template.name}
                                                        </h4>
                                                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-700">
                                                            {template.type}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                                                        <p className="mb-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                                            {template.subject}
                                                        </p>
                                                        <p className="line-clamp-2 text-xs text-neutral-500">
                                                            {template.body}
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
        </AppLayout>
    );
}
