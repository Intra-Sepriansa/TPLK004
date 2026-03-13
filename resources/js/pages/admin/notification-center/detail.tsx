import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Bell,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    MousePointerClick,
    RotateCcw,
    Search,
    Target,
    TrendingUp,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

interface Recipient {
    id: number;
    target_type: string;
    target_id: number | null;
    name: string;
    identifier: string;
    status: string;
    read_at: string | null;
    read_time_seconds: number | null;
}

interface DetailProps {
    notification: {
        id: number;
        title: string;
        message: string;
        type: string;
        priority: string;
        created_at: string;
        scheduled_at: string | null;
        action_url: string | null;
    };
    campaign_stats: {
        total: number;
        sent: number;
        read: number;
        failed: number;
        clicked: number;
        avg_read_time: string;
    };
    timeline: {
        status: string;
        title: string;
        date: string;
        description: string;
    }[];
    charts: {
        hourly: { hour: string; count: number }[];
        status: { name: string; value: number; color: string }[];
    };
    recipients: Recipient[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

export default function NotificationDetail({
    notification,
    campaign_stats,
    timeline,
    charts,
    recipients,
}: DetailProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'resend' | 'cancel' | null;
    }>({
        open: false,
        type: null,
    });
    const [showExportMenu, setShowExportMenu] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder':
                return Clock;
            case 'announcement':
                return Bell;
            case 'alert':
                return AlertTriangle;
            case 'achievement':
                return CheckCircle;
            case 'warning':
                return AlertTriangle;
            default:
                return Bell;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return (
                    <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.2)] dark:text-red-400">
                        URGENT
                    </span>
                );
            case 'high':
                return (
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/20 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                        HIGH
                    </span>
                );
            case 'normal':
                return (
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        NORMAL
                    </span>
                );
            default:
                return (
                    <span className="rounded-full border border-slate-500/30 bg-slate-500/20 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                        LOW
                    </span>
                );
        }
    };

    const TypeIcon = getTypeIcon(notification.type);

    const handleActionConfirm = () => {
        if (actionDialog.type === 'resend') {
            router.post(
                `/admin/notification-center/${notification.id}/resend`,
                {},
                {
                    onSuccess: () =>
                        setActionDialog({ open: false, type: null }),
                },
            );
        } else if (actionDialog.type === 'cancel') {
            router.post(
                `/admin/notification-center/${notification.id}/cancel`,
                {},
                {
                    onSuccess: () =>
                        setActionDialog({ open: false, type: null }),
                },
            );
        }
    };

    const filteredRecipients = useMemo(() => {
        return recipients.filter((r) => {
            const matchesSearch =
                r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.identifier.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === 'all' || r.status === statusFilter;
            const matchesType =
                typeFilter === 'all' || r.target_type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [recipients, searchTerm, statusFilter, typeFilter]);

    const readRate =
        campaign_stats.total > 0
            ? Math.round((campaign_stats.read / campaign_stats.total) * 100)
            : 0;
    const clickRate =
        campaign_stats.read > 0
            ? Math.round((campaign_stats.clicked / campaign_stats.read) * 100)
            : 0;

    return (
        <AppLayout>
            <Head title={`Detail | ${notification.title}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8"
            >
                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl lg:p-10"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
                    <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px]" />

                    <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div className="flex flex-col gap-4">
                            <motion.button
                                type="button"
                                onClick={() => window.history.back()}
                                whileHover={{ x: -4 }}
                                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar
                            </motion.button>

                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-md">
                                        <TypeIcon className="h-4 w-4" />
                                        {notification.type
                                            .charAt(0)
                                            .toUpperCase() +
                                            notification.type.slice(1)}
                                    </span>
                                    {getPriorityBadge(notification.priority)}
                                </div>
                                <h1 className="max-w-4xl text-3xl leading-tight font-black tracking-tight text-pretty drop-shadow-lg sm:text-4xl lg:text-5xl">
                                    {notification.title}
                                </h1>
                                <p className="mt-2 flex items-center gap-2 font-medium text-white/80">
                                    <Clock className="h-4 w-4" />
                                    Dibuat pada{' '}
                                    {new Date(
                                        notification.created_at,
                                    ).toLocaleString('id-ID', {
                                        dateStyle: 'full',
                                        timeStyle: 'short',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                            <div className="relative">
                                <Button
                                    onClick={() =>
                                        setShowExportMenu(!showExportMenu)
                                    }
                                    className="h-11 rounded-xl border border-white/20 bg-white/10 px-5 font-semibold text-white backdrop-blur-md hover:bg-white/20"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Laporan
                                    {showExportMenu ? (
                                        <ChevronUp className="ml-2 h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    )}
                                </Button>

                                <AnimatePresence>
                                    {showExportMenu && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800"
                                        >
                                            <button
                                                onClick={() => {
                                                    window.open(
                                                        `/admin/notification-center/${notification.id}/export/pdf`,
                                                        '_blank',
                                                    );
                                                    setShowExportMenu(false);
                                                }}
                                                className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                            >
                                                <FileText className="h-4 w-4 text-red-500" />{' '}
                                                Export PDF
                                            </button>
                                            <button
                                                onClick={() => {
                                                    window.location.href = `/admin/notification-center/${notification.id}/export/excel`;
                                                    setShowExportMenu(false);
                                                }}
                                                className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                            >
                                                <FileText className="h-4 w-4 text-emerald-500" />{' '}
                                                Export Excel
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-md">
                                <button
                                    onClick={() =>
                                        setActionDialog({
                                            open: true,
                                            type: 'resend',
                                        })
                                    }
                                    className="rounded-lg p-2.5 text-white transition-colors hover:bg-white/20"
                                    title="Resend to Unread"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        setActionDialog({
                                            open: true,
                                            type: 'cancel',
                                        })
                                    }
                                    className="rounded-lg p-2.5 text-red-200 transition-colors hover:bg-red-500/50 hover:text-white"
                                    title="Cancel Unsent/Unread"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ KEY METRICS ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6"
                >
                    {[
                        {
                            label: 'Total Penerima',
                            value: campaign_stats.total,
                            sub: 'Users',
                            icon: Users,
                            color: 'text-blue-500',
                            bg: 'bg-blue-50 dark:bg-blue-500/10',
                        },
                        {
                            label: 'Tingkat Baca',
                            value: `${readRate}%`,
                            sub: `${campaign_stats.read} dari ${campaign_stats.total}`,
                            icon: Eye,
                            color: 'text-emerald-500',
                            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                        },
                        {
                            label: 'Rata-rata Waktu',
                            value: campaign_stats.avg_read_time,
                            sub: 'Waktu baca (HH:MM:SS)',
                            icon: Zap,
                            color: 'text-amber-500',
                            bg: 'bg-amber-50 dark:bg-amber-500/10',
                        },
                        {
                            label: 'Click Rate',
                            value: `${clickRate}%`,
                            sub: `Est. dari pembaca`,
                            icon: MousePointerClick,
                            color: 'text-purple-500',
                            bg: 'bg-purple-50 dark:bg-purple-500/10',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm lg:p-6 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div
                                className={`absolute -top-6 -right-6 h-24 w-24 rounded-full ${stat.bg} blur-2xl transition-transform duration-500 group-hover:scale-150`}
                            />

                            <div className="relative z-10 mb-4 flex items-center gap-3">
                                <div
                                    className={`rounded-xl p-2.5 ${stat.bg} ${stat.color}`}
                                >
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm leading-tight font-semibold text-neutral-500 dark:text-neutral-400">
                                    {stat.label}
                                </h3>
                            </div>
                            <div className="relative z-10">
                                <div className="mb-1 text-3xl font-extrabold tracking-tight text-neutral-900 lg:text-4xl dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                                    {stat.sub}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ MAIN CONTENT GRID ═══════ */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column (Content & Timeline) */}
                    <div className="col-span-1 space-y-6 lg:col-span-2">
                        {/* Message Card */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm lg:p-8 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-500 dark:bg-indigo-500/10">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Isi Notifikasi
                                </h2>
                            </div>

                            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                <h3 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
                                    {notification.title}
                                </h3>
                                <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    {notification.message
                                        .split('\n')
                                        .map((line, i) => (
                                            <p
                                                key={i}
                                                className="mb-2 last:mb-0"
                                            >
                                                {line}
                                            </p>
                                        ))}
                                </div>
                                {notification.action_url && (
                                    <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                                        <Button
                                            variant="outline"
                                            className="pointer-events-none gap-2 opacity-80"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            Aksi URL:
                                            <span className="ml-1 font-mono text-xs text-blue-500">
                                                {notification.action_url}
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Status Pie */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                    <Target className="h-5 w-5 text-neutral-400" />
                                    Distribusi Status
                                </h2>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={charts.status}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {charts.status.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{
                                                    borderRadius: '1rem',
                                                    border: 'none',
                                                    boxShadow:
                                                        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Engagement Area Chart */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                    <TrendingUp className="h-5 w-5 text-neutral-400" />
                                    Aktivitas (Per Jam)
                                </h2>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={charts.hourly}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="colorCount"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#3b82f6"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e5e7eb"
                                                className="dark:stroke-neutral-800"
                                            />
                                            <XAxis
                                                dataKey="hour"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#9ca3af',
                                                }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#9ca3af',
                                                }}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    borderRadius: '1rem',
                                                    border: 'none',
                                                    boxShadow:
                                                        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorCount)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column (Insights & Timeline) */}
                    <div className="col-span-1 space-y-6">
                        {/* AI Insights Panel */}
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-[1.5rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 backdrop-blur-xl dark:border-indigo-500/30"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Activity className="h-32 w-32 text-indigo-500" />
                            </div>
                            <div className="relative z-10 mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 text-white shadow-lg">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    AI Insights
                                </h2>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="rounded-xl border border-white/20 bg-white/60 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
                                    <p className="mb-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        Performa Kampanye
                                    </p>
                                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                                        Tingkat baca mencapai{' '}
                                        <span className="font-bold text-emerald-500">
                                            {readRate}%
                                        </span>
                                        .
                                        {readRate > 50
                                            ? ' Kampanye ini berjalan sangat baik dan mendapatkan perhatian yang tinggi dari target.'
                                            : ' Pertimbangkan untuk menggunakan kalimat subjek yang lebih menarik atau mengirim ulang.'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-white/20 bg-white/60 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
                                    <p className="mb-1 text-sm font-semibold text-purple-600 dark:text-purple-400">
                                        Saran Waktu
                                    </p>
                                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                                        Berdasarkan aktivitas, penerima
                                        cenderung membaca notifikasi pada{' '}
                                        {charts.hourly.length > 0
                                            ? charts.hourly.reduce(
                                                  (max, h) =>
                                                      h.count > max.count
                                                          ? h
                                                          : max,
                                                  charts.hourly[0],
                                              ).hour
                                            : 'pagi hari'}
                                        . Jadwalkan notifikasi serupa di jam
                                        ini.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Campaign Timeline */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                <Clock className="h-5 w-5 text-neutral-400" />
                                Timeline Kampanye
                            </h2>

                            <div className="relative ml-3 space-y-6 border-l-2 border-neutral-100 dark:border-neutral-800">
                                {timeline.map((event, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div
                                            className={cn(
                                                'absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white dark:border-neutral-900',
                                                event.status === 'created'
                                                    ? 'bg-indigo-500'
                                                    : event.status ===
                                                        'scheduled'
                                                      ? 'bg-amber-500'
                                                      : event.status === 'read'
                                                        ? 'bg-emerald-500'
                                                        : 'bg-neutral-400',
                                            )}
                                        />
                                        <div>
                                            <h4 className="mb-1 text-sm leading-none font-bold text-neutral-900 dark:text-white">
                                                {event.title}
                                            </h4>
                                            <p className="mb-2 text-[11px] font-medium text-neutral-400">
                                                {new Date(
                                                    event.date,
                                                ).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ═══════ RECIPIENTS TABLE ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                            <Users className="h-5 w-5 text-neutral-400" />
                            Detail Penerima ({filteredRecipients.length})
                        </h2>

                        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    placeholder="Cari penerima..."
                                    className="h-10 w-full rounded-xl border-neutral-200 bg-neutral-50 pl-9 sm:w-[250px] dark:border-neutral-700 dark:bg-neutral-800/50"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-neutral-200 bg-neutral-50 sm:w-[140px] dark:border-neutral-700 dark:bg-neutral-800/50">
                                    <Filter className="mr-2 h-4 w-4 text-neutral-400" />
                                    <SelectValue placeholder="Tipe" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-700">
                                    <SelectItem value="all">
                                        Semua Tipe
                                    </SelectItem>
                                    <SelectItem value="mahasiswa">
                                        Mahasiswa
                                    </SelectItem>
                                    <SelectItem value="dosen">Dosen</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-neutral-200 bg-neutral-50 sm:w-[140px] dark:border-neutral-700 dark:bg-neutral-800/50">
                                    <Filter className="mr-2 h-4 w-4 text-neutral-400" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-700">
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="read">Dibaca</SelectItem>
                                    <SelectItem value="sent">
                                        Terkirim
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
                                <tr>
                                    <th scope="col" className="px-6 py-4">
                                        Nama Penerima
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Waktu Baca
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Durasi Respon
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredRecipients.length > 0 ? (
                                    filteredRecipients.map((recipient) => (
                                        <tr
                                            key={recipient.id}
                                            className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col font-semibold text-neutral-900 dark:text-white">
                                                    {recipient.name}
                                                    <span className="text-xs font-medium text-neutral-500">
                                                        {recipient.identifier}{' '}
                                                        &bull;{' '}
                                                        {recipient.target_type
                                                            ? recipient.target_type
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              recipient.target_type.slice(
                                                                  1,
                                                              )
                                                            : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {recipient.status === 'read' ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{' '}
                                                        Dibaca
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                                        <CheckCircle className="h-3 w-3" />{' '}
                                                        Terkirim
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                {recipient.read_at
                                                    ? new Date(
                                                          recipient.read_at,
                                                      ).toLocaleString(
                                                          'id-ID',
                                                          {
                                                              dateStyle:
                                                                  'short',
                                                              timeStyle:
                                                                  'short',
                                                          },
                                                      )
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-neutral-500">
                                                {recipient.read_time_seconds
                                                    ? `${Math.round(recipient.read_time_seconds / 60)} mnt`
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center text-neutral-500"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Users className="mb-2 h-10 w-10 text-neutral-300" />
                                                <p>
                                                    Tidak ada penerima yang
                                                    cocok dengan filter.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Action Dialog */}
                <ConfirmDialog
                    open={actionDialog.open}
                    onOpenChange={(open) =>
                        setActionDialog((prev) => ({ ...prev, open }))
                    }
                    onConfirm={handleActionConfirm}
                    title={
                        actionDialog.type === 'resend'
                            ? 'Kirim Ulang Notifikasi'
                            : 'Batalkan Notifikasi'
                    }
                    message={
                        actionDialog.type === 'resend'
                            ? 'Yakin ingin mengirim ulang notifikasi kepada penerima yang belum membacanya?'
                            : 'Yakin ingin MEMBATALKAN notifikasi ini? Notifikasi akan dihapus dari antrean dan kotak masuk bagi mereka yang belum membacanya.'
                    }
                    variant={actionDialog.type === 'resend' ? 'info' : 'danger'}
                    confirmText={
                        actionDialog.type === 'resend'
                            ? 'Ya, Kirim Ulang'
                            : 'Ya, Batalkan'
                    }
                />
            </motion.div>
        </AppLayout>
    );
}
