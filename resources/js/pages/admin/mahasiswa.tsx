import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Award,
    Bell,
    BookOpen,
    Building2,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit,
    Filter,
    Hash,
    KeyRound,
    PartyPopper,
    Plus,
    RefreshCw,
    Save,
    Search,
    Send,
    Sparkles,
    Trash2,
    TrendingUp,
    User,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import fakultasIcon from '@/assets/admin/mahasiswa/fakultas.png';
import iconMahasiswa from '@/assets/admin/mahasiswa/icon-mahasiswa.png';
import mahasiswaAktifIcon from '@/assets/admin/mahasiswa/mahasiswa-aktif.png';
import totalMahasiswaIcon from '@/assets/admin/mahasiswa/total-mahasiswa.png';
import totalIcon from '@/assets/admin/mahasiswa/total.png';

// Fallback avatars
import defaultMaleAvatar from '@/assets/admin/mahasiswa/laki.png';
import defaultFemaleAvatar from '@/assets/admin/mahasiswa/perempuan.png';

const getFallbackAvatar = (nama: string, jenisKelamin?: string) => {
    if (jenisKelamin === 'P') return defaultFemaleAvatar;
    if (jenisKelamin === 'L') return defaultMaleAvatar;

    const nameStr = (nama || '').toLowerCase();
    const femaleIndicators = [
        'siti',
        'ayu',
        'wati',
        'nisa',
        'putri',
        'dewi',
        'nur',
        'indah',
        'sari',
        'lia',
        'dwi',
        'annisa',
        'aulia',
        'safitri',
        'zahra',
        'kartika',
        'linda',
        'ratna',
    ];
    const isFemale =
        femaleIndicators.some((indicator) => nameStr.includes(indicator)) ||
        /^[a-z]+[a|i|y]\b/.test(nameStr.split(' ')[0] || '');

    // Male exceptions for names ending in a/i
    const maleExceptions = [
        'arya',
        'dika',
        'bima',
        'raka',
        'nanda',
        'reza',
        'yuda',
        'putra',
        'adi',
        'budi',
        'jodi',
        'fauzi',
        'dani',
        'toni',
    ];
    const isMaleException = maleExceptions.some((indicator) =>
        nameStr.includes(indicator),
    );

    return isFemale && !isMaleException
        ? defaultFemaleAvatar
        : defaultMaleAvatar;
};

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    fakultas?: string;
    kelas?: string;
    semester?: number;
    jenis_kelamin?: 'L' | 'P';
    avatar_url?: string;
    created_at?: string;
}

interface Stats {
    total: number;
    by_fakultas: Record<string, number>;
    active_this_month: number;
    avg_attendance: number;
}

interface PageProps {
    mahasiswa: {
        data: Mahasiswa[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    attendanceSummary: {
        id: number;
        nama: string;
        nim: string;
        total: number;
        present: number;
        late: number;
    }[];
    fakultasList: string[];
    kelasList: string[];
    topPerformers: { id: number; nama: string; nim: string; count: number }[];
    lowAttendance: { id: number; nama: string; nim: string; count: number }[];
    registrationTrend: { labels: string[]; values: number[] };
    filters: {
        search: string;
        fakultas: string;
        kelas: string;
        sort_by: string;
        sort_dir: string;
    };
    flash?: { success?: string; error?: string };
}

export default function AdminMahasiswa({
    mahasiswa,
    stats,
    attendanceSummary,
    fakultasList,
    kelasList,
    topPerformers,
    lowAttendance,
    registrationTrend,
    filters,
    flash,
}: PageProps) {
    const [search, setSearch] = useState(filters.search);
    const [fakultas, setFakultas] = useState(filters.fakultas);
    const [kelas, setKelas] = useState(filters.kelas);
    const [showAddForm, setShowAddForm] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Warning notification modal state
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningTargets, setWarningTargets] = useState<any[]>([]);
    const [warningTitle, setWarningTitle] = useState('⚠️ Peringatan Kehadiran');
    const [warningMessage, setWarningMessage] = useState('');
    const [warningPriority, setWarningPriority] = useState<
        'normal' | 'high' | 'urgent'
    >('high');
    const [warningType, setWarningType] = useState<
        'warning' | 'reminder' | 'alert'
    >('warning');
    const [warningSending, setWarningSending] = useState(false);
    const [warningSent, setWarningSent] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
    const [sentWarningIds, setSentWarningIds] = useState<Set<number>>(
        new Set(),
    );

    // Appreciation System State
    const [showAppreciationModal, setShowAppreciationModal] = useState(false);
    const [selectedStudentForAppreciation, setSelectedStudentForAppreciation] =
        useState<any | null>(null);
    const [appreciationMessage, setAppreciationMessage] = useState('');

    const warningTemplates = [
        {
            name: 'Peringatan Umum',
            title: '⚠️ Peringatan Kehadiran',
            message:
                'Kehadiran kamu sudah mendekati batas minimum. Harap tingkatkan kehadiran agar tidak terkena sanksi akademik.',
            priority: 'high' as const,
            type: 'warning' as const,
            icon: '⚠️',
        },
        {
            name: 'Peringatan Keras',
            title: '⛔ Peringatan Keras Kehadiran',
            message:
                'Kamu sudah melebihi batas tidak hadir yang diizinkan. Sesuai peraturan UNPAM, kamu berisiko tidak dapat mengikuti UAS. Segera hubungi dosen pembimbing.',
            priority: 'urgent' as const,
            type: 'alert' as const,
            icon: '⛔',
        },
        {
            name: 'Pengingat Lembut',
            title: '📢 Pengingat Kehadiran',
            message:
                'Halo! Kami melihat kehadiran kamu mulai menurun. Yuk tingkatkan semangat belajar dan selalu hadir tepat waktu! 💪',
            priority: 'normal' as const,
            type: 'reminder' as const,
            icon: '📢',
        },
    ];

    const openWarningModal = (targets: any[]) => {
        setWarningTargets(targets);
        const template = warningTemplates[0];
        setWarningTitle(template.title);
        setWarningMessage(
            targets.length === 1
                ? `Kehadiran kamu sudah ${targets[0].count}x tidak hadir. Harap tingkatkan kehadiran agar tidak terkena sanksi akademik.`
                : template.message,
        );
        setWarningPriority(template.priority);
        setWarningType(template.type);
        setSelectedTemplate(0);
        setWarningSent(false);
        setShowWarningModal(true);
    };

    const applyTemplate = (index: number) => {
        const tmpl = warningTemplates[index];
        setSelectedTemplate(index);
        setWarningTitle(tmpl.title);
        setWarningPriority(tmpl.priority);
        setWarningType(tmpl.type);
        if (warningTargets.length === 1) {
            setWarningMessage(
                index === 0
                    ? `Kehadiran kamu sudah ${warningTargets[0].count}x tidak hadir. ${tmpl.message}`
                    : tmpl.message,
            );
        } else {
            setWarningMessage(tmpl.message);
        }
    };

    const sendWarning = () => {
        setWarningSending(true);
        router.post(
            '/admin/notification-center',
            {
                target: 'specific',
                target_type: 'mahasiswa',
                target_ids: warningTargets.map((s: any) => s.id),
                title: warningTitle,
                message: warningMessage,
                type: warningType,
                priority: warningPriority,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setWarningSending(false);
                    setWarningSent(true);
                    setSentWarningIds((prev) => {
                        const next = new Set(prev);
                        warningTargets.forEach((s: any) => next.add(s.id));
                        return next;
                    });
                    setTimeout(() => {
                        setShowWarningModal(false);
                        setWarningSent(false);
                    }, 2000);
                },
                onError: () => {
                    setWarningSending(false);
                    alert('Gagal mengirim peringatan.');
                },
            },
        );
    };

    const priorityConfig = {
        normal: {
            label: 'Normal',
            color: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-200 dark:border-blue-500/20',
            text: 'text-blue-600 dark:text-blue-400',
        },
        high: {
            label: 'Tinggi',
            color: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-200 dark:border-amber-500/20',
            text: 'text-amber-600 dark:text-amber-400',
        },
        urgent: {
            label: 'Darurat',
            color: 'from-red-500 to-rose-600',
            bg: 'bg-red-50 dark:bg-red-500/10',
            border: 'border-red-200 dark:border-red-500/20',
            text: 'text-red-600 dark:text-red-400',
        },
    };

    const addForm = useForm({
        nama: '',
        nim: '',
        fakultas: '',
        kelas: '',
        semester: 1,
    });

    const handleFilter = () => {
        router.get(
            '/admin/mahasiswa',
            { search, fakultas, kelas },
            { preserveState: true },
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setFakultas('all');
        setKelas('all');
        router.get('/admin/mahasiswa', {}, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/mahasiswa/pdf?fakultas=${fakultas}`, '_blank');
    };

    const submitAdd = (e: FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/mahasiswa', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddForm(false);
            },
        });
    };

    const trendData = registrationTrend.labels.map((label, i) => ({
        name: label,
        total: registrationTrend.values[i],
    }));

    const formatLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&')
            .replace(/<[^>]*>/g, '');

    const normalizePaginationLabel = (label: string) => {
        const cleaned = formatLabel(label).trim();
        const normalized = cleaned.toLowerCase();

        const isPrevious =
            normalized === '«' ||
            normalized.includes('previous') ||
            normalized.includes('sebelumnya') ||
            normalized.includes('pagination.previous');
        const isNext =
            normalized === '»' ||
            normalized.includes('next') ||
            normalized.includes('berikutnya') ||
            normalized.includes('pagination.next');

        return {
            isPrevious,
            isNext,
            text: isPrevious ? 'Sebelumnya' : isNext ? 'Berikutnya' : cleaned,
        };
    };

    // Animation variants
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
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12,
            },
        },
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getInitialColor = (name: string) => {
        const colors = [
            'from-violet-500 to-purple-600',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500',
            'from-pink-500 to-rose-500',
            'from-indigo-500 to-blue-600',
            'from-cyan-500 to-sky-500',
            'from-fuchsia-500 to-pink-500',
        ];
        const idx = name.charCodeAt(0) % colors.length;
        return colors[idx];
    };

    const statsConfig = [
        {
            id: 'total',
            label: 'Total Mahasiswa',
            value: stats.total,
            iconImg: totalMahasiswaIcon,
            hoverShadow: 'hover:shadow-blue-500/10',
            glowBg: 'bg-blue-500',
            gradBg: 'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
        },
        {
            id: 'active',
            label: 'Aktif Bulan Ini',
            value: stats.active_this_month,
            iconImg: mahasiswaAktifIcon,
            hoverShadow: 'hover:shadow-emerald-500/10',
            glowBg: 'bg-emerald-500',
            gradBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
        },
        {
            id: 'attendance',
            label: 'Total Kehadiran',
            value: stats.avg_attendance,
            iconImg: totalIcon,
            hoverShadow: 'hover:shadow-purple-500/10',
            glowBg: 'bg-purple-500',
            gradBg: 'from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:to-fuchsia-500/10',
        },
        {
            id: 'fakultas',
            label: 'Fakultas',
            value: Object.keys(stats.by_fakultas).length,
            iconImg: fakultasIcon,
            hoverShadow: 'hover:shadow-amber-500/10',
            glowBg: 'bg-amber-500',
            gradBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
        },
    ];

    return (
        <AppLayout>
            <Head title="Mahasiswa" />

            <motion.div
                className="space-y-6 p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HEADER — Matching Zona Style ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    {/* Animated Gradient Background */}
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating graduation pulses */}

                    <div className="relative">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left xl:flex-1">
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
                                        src={iconMahasiswa}
                                        alt="Data Mahasiswa"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Data Mahasiswa
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola data mahasiswa, pantau kehadiran,
                                        dan analisis performa akademik secara
                                        real-time.
                                    </motion.p>
                                </div>
                            </div>

                            {/* Quick info + quick actions */}
                            <div className="w-full xl:max-w-md">
                                <motion.div
                                    className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium sm:justify-start">
                                            <Users className="h-4 w-4 text-indigo-200" />
                                            {stats.total} Mahasiswa
                                        </div>
                                        <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium sm:justify-start">
                                            <UserCheck className="h-4 w-4 text-indigo-200" />
                                            {stats.active_this_month} Aktif
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <motion.button
                                            onClick={handleFilter}
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition-all hover:bg-white/20 sm:text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Filter
                                        </motion.button>
                                        <motion.button
                                            onClick={() =>
                                                router.visit(
                                                    '/admin/mahasiswa/create',
                                                )
                                            }
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300/35 bg-emerald-500/30 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition-all hover:bg-emerald-500/40 sm:text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Tambah
                                        </motion.button>
                                        <motion.a
                                            href="/mahasiswa/export.csv"
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition-all hover:bg-white/20 sm:text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Export CSV
                                        </motion.a>
                                        <motion.button
                                            onClick={handleExportPdf}
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition-all hover:bg-white/20 sm:text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Export PDF
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ FLASH MESSAGES ═══════ */}
                <AnimatePresence>
                    {(flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 20,
                            }}
                            className={`rounded-2xl border p-4 backdrop-blur-xl ${
                                flash?.success
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${flash?.success ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
                                >
                                    {flash?.success ? (
                                        <UserCheck className="h-4 w-4" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4" />
                                    )}
                                </div>
                                <p className="text-sm font-medium">
                                    {flash?.success || flash?.error}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ STATS CARDS ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    {statsConfig.map((stat, i) => (
                        <motion.div
                            key={stat.id}
                            variants={itemVariants}
                            className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${stat.hoverShadow} dark:border-white/5`}
                            onHoverStart={() => setHoveredCard(stat.id)}
                            onHoverEnd={() => setHoveredCard(null)}
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.gradBg}`}
                            />
                            <motion.div
                                animate={{
                                    scale: hoveredCard === stat.id ? 1.5 : 1,
                                    opacity:
                                        hoveredCard === stat.id ? 0.4 : 0.2,
                                }}
                                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.glowBg} blur-3xl transition-all duration-500`}
                            />

                            <div className="relative flex flex-row items-center gap-3 text-left sm:gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                >
                                    <img
                                        src={stat.iconImg}
                                        alt={stat.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                    />
                                </motion.div>
                                <div>
                                    <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <motion.p
                                        className="mt-0.5 text-lg font-bold text-neutral-900 sm:mt-1 sm:text-2xl dark:text-white"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 15,
                                            delay: i * 0.05,
                                        }}
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ FILTER & ACTIONS ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl transition-all hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                    <div className="mb-4 flex items-center gap-2 sm:mb-5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                            <Filter className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="font-bold text-neutral-900 dark:text-white">
                            Filter & Pencarian
                        </h2>
                    </div>
                    <div className="flex flex-nowrap items-end gap-4 overflow-x-auto pb-1">
                        <div className="min-w-[260px] flex-1 space-y-1.5">
                            <Label className="ml-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Cari
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    placeholder="Nama atau NIM..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleFilter()
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 pl-10 text-sm font-medium text-neutral-700 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                />
                            </div>
                        </div>
                        <div className="min-w-[210px] space-y-1.5">
                            <Label className="ml-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Fakultas
                            </Label>
                            <div className="relative">
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <select
                                    value={fakultas}
                                    onChange={(e) =>
                                        setFakultas(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="all">Semua</option>
                                    {fakultasList.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="min-w-[180px] space-y-1.5">
                            <Label className="ml-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                Kelas
                            </Label>
                            <div className="relative">
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <select
                                    value={kelas}
                                    onChange={(e) => setKelas(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="all">Semua</option>
                                    {kelasList.map((k) => (
                                        <option key={k} value={k}>
                                            {k}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <motion.button
                            onClick={handleResetFilter}
                            className="flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/60 px-5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <X className="h-4 w-4" />
                            Reset
                        </motion.button>
                        <motion.button
                            onClick={handleFilter}
                            className="flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Filter
                        </motion.button>
                    </div>
                </motion.div>

                {/* ═══════ ADD FORM MODAL ═══════ */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
                            onClick={() => setShowAddForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 250,
                                    damping: 22,
                                }}
                                className="w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header with Advanced Gradient */}
                                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                                    {/* Decorative Orbs */}
                                    <motion.div
                                        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                        }}
                                    />
                                    <motion.div
                                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            delay: 2,
                                        }}
                                    />

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-lg backdrop-blur-xl"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                            >
                                                <Plus className="h-7 w-7 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">
                                                    Tambah Mahasiswa
                                                </h2>
                                                <p className="text-sm text-indigo-100">
                                                    Masukkan data mahasiswa baru
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() =>
                                                setShowAddForm(false)
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-colors hover:bg-white/20"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row">
                                    {/* Left Side: Form */}
                                    <form
                                        onSubmit={submitAdd}
                                        className="flex-1 space-y-5 p-6"
                                    >
                                        {/* Nama */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                <User className="h-3.5 w-3.5" />
                                                Nama Lengkap{' '}
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                value={addForm.data.nama}
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'nama',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Budi Santoso"
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                            />
                                            <InputError
                                                message={addForm.errors.nama}
                                            />
                                        </motion.div>

                                        {/* NIM */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 }}
                                        >
                                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                <Hash className="h-3.5 w-3.5" />
                                                NIM{' '}
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                value={addForm.data.nim}
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'nim',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 221011401234"
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                            />
                                            <InputError
                                                message={addForm.errors.nim}
                                            />
                                        </motion.div>

                                        {/* Fakultas & Kelas */}
                                        <motion.div
                                            className="grid grid-cols-2 gap-4"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div>
                                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    Fakultas
                                                </label>
                                                <input
                                                    value={
                                                        addForm.data.fakultas
                                                    }
                                                    onChange={(e) =>
                                                        addForm.setData(
                                                            'fakultas',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Fakultas"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    Kelas
                                                </label>
                                                <input
                                                    value={addForm.data.kelas}
                                                    onChange={(e) =>
                                                        addForm.setData(
                                                            'kelas',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Kelas"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Semester */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 }}
                                        >
                                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Semester
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={14}
                                                value={addForm.data.semester}
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'semester',
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="w-32 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                            />
                                        </motion.div>
                                    </form>

                                    {/* Right Side: Live Preview & Actions */}
                                    <div className="flex w-full flex-col justify-between border-l border-neutral-200 bg-neutral-50 p-6 md:w-72 dark:border-neutral-800 dark:bg-neutral-800/30">
                                        <div className="space-y-4">
                                            <h3 className="mb-4 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                                Live Preview
                                            </h3>

                                            {/* Preview Card */}
                                            <motion.div
                                                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                                                layout
                                            >
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div
                                                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getInitialColor(addForm.data.nama || 'M')} flex items-center justify-center text-lg font-bold text-white shadow-md`}
                                                    >
                                                        {getInitials(
                                                            addForm.data.nama ||
                                                                'M',
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                            {addForm.data
                                                                .nama ||
                                                                'Nama Mahasiswa'}
                                                        </h4>
                                                        <p className="truncate text-xs text-neutral-500">
                                                            {addForm.data.nim ||
                                                                'NIM'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                                                        {addForm.data
                                                            .fakultas ||
                                                            'Fakultas'}
                                                    </span>
                                                    <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                                                        {addForm.data.kelas ||
                                                            'Kelas'}
                                                    </span>
                                                </div>
                                            </motion.div>

                                            {/* Default Password Info */}
                                            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
                                                        Password Default
                                                    </span>
                                                </div>
                                                <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80">
                                                    Password default mengikuti
                                                    kebijakan credential server
                                                    (.env).
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <motion.button
                                                onClick={submitAdd}
                                                disabled={addForm.processing}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {addForm.processing ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                Simpan Data
                                            </motion.button>
                                            <button
                                                onClick={() =>
                                                    setShowAddForm(false)
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-white py-3 font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ WARNING NOTIFICATION MODAL ═══════ */}
                <AnimatePresence>
                    {showWarningModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
                            onClick={() =>
                                !warningSending && setShowWarningModal(false)
                            }
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 250,
                                    damping: 22,
                                }}
                                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="relative flex-shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                    <motion.div
                                        className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.3, 0.6, 0.3],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                        }}
                                    />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                            >
                                                <Bell className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    Kirim Peringatan
                                                </h2>
                                                <p className="text-sm text-amber-100">
                                                    {warningTargets.length === 1
                                                        ? `Kepada: ${warningTargets[0].nama}`
                                                        : `Kepada ${warningTargets.length} mahasiswa`}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() =>
                                                setShowWarningModal(false)
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Scrollable Body */}
                                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                                    {/* Recipients Preview */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                            <Users className="h-3.5 w-3.5" />
                                            Penerima ({warningTargets.length})
                                        </label>
                                        <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                                            {warningTargets.map((s: any) => (
                                                <div
                                                    key={s.id}
                                                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs dark:border-neutral-600 dark:bg-neutral-700"
                                                >
                                                    <div
                                                        className={`h-6 w-6 rounded-md bg-gradient-to-br ${getInitialColor(s.nama)} flex items-center justify-center text-[10px] font-bold text-white`}
                                                    >
                                                        {getInitials(s.nama)}
                                                    </div>
                                                    <span className="max-w-[120px] truncate font-medium text-neutral-700 dark:text-neutral-200">
                                                        {s.nama}
                                                    </span>
                                                    <span className="font-bold text-red-500">
                                                        {s.count}x
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Template Selector */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            Template Pesan
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {warningTemplates.map(
                                                (tmpl, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() =>
                                                            applyTemplate(idx)
                                                        }
                                                        className={`rounded-xl border p-3 text-left transition-all ${
                                                            selectedTemplate ===
                                                            idx
                                                                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400/30 dark:border-amber-500 dark:bg-amber-500/10'
                                                                : 'border-neutral-200 bg-white hover:border-amber-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-amber-600'
                                                        }`}
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                    >
                                                        <div className="mb-1 text-lg">
                                                            {tmpl.icon}
                                                        </div>
                                                        <p
                                                            className={`text-xs font-semibold ${selectedTemplate === idx ? 'text-amber-700 dark:text-amber-300' : 'text-neutral-700 dark:text-neutral-300'}`}
                                                        >
                                                            {tmpl.name}
                                                        </p>
                                                    </motion.button>
                                                ),
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Priority Selector */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Prioritas
                                        </label>
                                        <div className="flex gap-2">
                                            {(
                                                Object.keys(
                                                    priorityConfig,
                                                ) as Array<
                                                    'normal' | 'high' | 'urgent'
                                                >
                                            ).map((key) => {
                                                const cfg = priorityConfig[key];
                                                return (
                                                    <motion.button
                                                        key={key}
                                                        type="button"
                                                        onClick={() =>
                                                            setWarningPriority(
                                                                key,
                                                            )
                                                        }
                                                        className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                                                            warningPriority ===
                                                            key
                                                                ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-2 ring-current/20`
                                                                : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                                                        }`}
                                                        whileHover={{
                                                            scale: 1.03,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.97,
                                                        }}
                                                    >
                                                        {cfg.label}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>

                                    {/* Title Input */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                            <Hash className="h-3.5 w-3.5" />
                                            Judul Notifikasi
                                        </label>
                                        <input
                                            value={warningTitle}
                                            onChange={(e) =>
                                                setWarningTitle(e.target.value)
                                            }
                                            placeholder="Judul peringatan"
                                            className="w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                                        />
                                    </motion.div>

                                    {/* Message Textarea */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                <Edit className="h-3.5 w-3.5" />
                                                Isi Pesan
                                            </label>
                                            <span
                                                className={`font-mono text-xs ${warningMessage.length > 900 ? 'text-red-500' : 'text-neutral-400'}`}
                                            >
                                                {warningMessage.length}/1000
                                            </span>
                                        </div>
                                        <textarea
                                            value={warningMessage}
                                            onChange={(e) =>
                                                setWarningMessage(
                                                    e.target.value.slice(
                                                        0,
                                                        1000,
                                                    ),
                                                )
                                            }
                                            rows={4}
                                            placeholder="Tulis pesan peringatan..."
                                            className="w-full resize-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                                        />
                                    </motion.div>

                                    {/* Live Preview */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                            Preview Notifikasi
                                        </label>
                                        <div
                                            className={`rounded-xl border p-4 ${priorityConfig[warningPriority].border} ${priorityConfig[warningPriority].bg}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${priorityConfig[warningPriority].color} flex flex-shrink-0 items-center justify-center shadow-lg`}
                                                >
                                                    <Bell className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className={`text-sm font-bold ${priorityConfig[warningPriority].text}`}
                                                    >
                                                        {warningTitle ||
                                                            'Judul notifikasi...'}
                                                    </p>
                                                    <p className="mt-1 text-xs whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">
                                                        {warningMessage ||
                                                            'Isi pesan akan muncul di sini...'}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityConfig[warningPriority].bg} ${priorityConfig[warningPriority].text} border ${priorityConfig[warningPriority].border}`}
                                                        >
                                                            {
                                                                priorityConfig[
                                                                    warningPriority
                                                                ].label
                                                            }
                                                        </span>
                                                        <span className="text-[10px] text-neutral-400">
                                                            Baru saja
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex-shrink-0 border-t border-neutral-200 p-6 dark:border-neutral-800">
                                    <motion.div
                                        className="flex gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {warningSent ? (
                                            <motion.div
                                                initial={{
                                                    scale: 0.8,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                }}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-center font-bold text-white"
                                            >
                                                <UserCheck className="h-5 w-5" />
                                                Peringatan Terkirim! ✓
                                            </motion.div>
                                        ) : (
                                            <>
                                                <motion.button
                                                    type="button"
                                                    onClick={sendWarning}
                                                    disabled={
                                                        warningSending ||
                                                        !warningTitle.trim() ||
                                                        !warningMessage.trim()
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {warningSending ? (
                                                        <>
                                                            <motion.div
                                                                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                                                animate={{
                                                                    rotate: 360,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    repeat: Infinity,
                                                                    ease: 'linear',
                                                                }}
                                                            />
                                                            Mengirim...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4" />
                                                            Kirim Peringatan ke{' '}
                                                            {
                                                                warningTargets.length
                                                            }{' '}
                                                            Mahasiswa
                                                        </>
                                                    )}
                                                </motion.button>
                                                <motion.button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowWarningModal(
                                                            false,
                                                        )
                                                    }
                                                    disabled={warningSending}
                                                    className="rounded-xl bg-neutral-100 px-6 py-3.5 font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    Batal
                                                </motion.button>
                                            </>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ MAIN CONTENT GRID ═══════ */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Student Table */}
                    <motion.div
                        variants={slideInLeft}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl lg:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-neutral-200 p-5 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                        Daftar Mahasiswa
                                    </h2>
                                </div>
                                <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400">
                                    {mahasiswa.from}-{mahasiswa.to} dari{' '}
                                    {mahasiswa.total}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                        <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                                            Mahasiswa
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                                            NIM
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                                            Kelas
                                        </th>
                                        <th className="px-5 py-3.5 text-right text-[10px] font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mahasiswa.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-16 text-center"
                                            >
                                                <Users className="mx-auto mb-3 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                                                <p className="font-medium text-neutral-500">
                                                    Tidak ada data mahasiswa
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    Tambahkan mahasiswa baru
                                                    untuk memulai
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        mahasiswa.data.map((m, index) => (
                                            <motion.tr
                                                key={m.id}
                                                className="group border-b border-neutral-100 transition-colors hover:bg-neutral-50/50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.03,
                                                    type: 'spring',
                                                    stiffness: 100,
                                                }}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                m.avatar_url ||
                                                                getFallbackAvatar(
                                                                    m.nama,
                                                                    m.jenis_kelamin,
                                                                )
                                                            }
                                                            alt={m.nama}
                                                            className="h-9 w-9 rounded-lg bg-neutral-100 object-cover shadow-sm"
                                                        />
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                            {m.nama}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="font-mono text-sm text-neutral-500 dark:text-neutral-400">
                                                        {m.nim}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {m.kelas || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <motion.button
                                                            onClick={() =>
                                                                router.get(
                                                                    `/admin/mahasiswa/${m.id}/edit`,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors hover:bg-indigo-500/20"
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.9,
                                                            }}
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() =>
                                                                router.post(
                                                                    `/admin/mahasiswa/${m.id}/reset-password`,
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition-colors hover:bg-amber-500/20"
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.9,
                                                            }}
                                                            title="Reset Password"
                                                        >
                                                            <KeyRound className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() =>
                                                                router.delete(
                                                                    `/admin/mahasiswa/${m.id}`,
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.9,
                                                            }}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {mahasiswa.last_page > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
                                {mahasiswa.links.map((link, i) => {
                                    const parsed = normalizePaginationLabel(
                                        link.label,
                                    );
                                    const isEdge =
                                        parsed.isPrevious || parsed.isNext;

                                    return (
                                        <motion.button
                                            key={i}
                                            onClick={() =>
                                                link.url &&
                                                router.get(
                                                    link.url,
                                                    {},
                                                    { preserveState: true },
                                                )
                                            }
                                            disabled={!link.url}
                                            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                                link.active
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                                    : link.url
                                                      ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-white'
                                                      : 'cursor-not-allowed bg-neutral-50 text-neutral-300 dark:bg-neutral-900/30 dark:text-neutral-600'
                                            } ${isEdge ? 'min-w-[110px] sm:min-w-[125px]' : 'min-w-[42px]'}`}
                                            whileHover={
                                                link.url ? { scale: 1.05 } : {}
                                            }
                                            whileTap={
                                                link.url ? { scale: 0.95 } : {}
                                            }
                                        >
                                            {parsed.isPrevious && (
                                                <ChevronLeft className="h-4 w-4" />
                                            )}
                                            <span>{parsed.text}</span>
                                            {parsed.isNext && (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* ═══════ SIDEBAR ═══════ */}
                    <div className="space-y-6">
                        {/* Top Performers — Advanced UI */}
                        <motion.div
                            variants={slideInRight}
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            {/* Animated Gradient Background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                                animate={{
                                    backgroundPosition: [
                                        '0% 0%',
                                        '100% 100%',
                                        '0% 0%',
                                    ],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{
                                    backgroundSize: '200% 200%',
                                }}
                            />

                            {/* Decorative Orbs */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                            <div className="relative border-b border-white/10 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-lg backdrop-blur-xl">
                                        <Award className="h-6 w-6 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Top Kehadiran
                                        </h2>
                                        <p className="text-xs text-indigo-100">
                                            Mahasiswa paling rajin
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative space-y-2 p-4">
                                {topPerformers.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-white/50">
                                        Tidak ada data
                                    </div>
                                ) : (
                                    topPerformers.map((s, i) => (
                                        <motion.div
                                            key={s.id}
                                            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: i * 0.04,
                                                type: 'spring',
                                                stiffness: 100,
                                            }}
                                        >
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg ${
                                                    i === 0
                                                        ? 'border border-yellow-200 bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900'
                                                        : i === 1
                                                          ? 'border border-slate-200 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800'
                                                          : i === 2
                                                            ? 'border border-orange-200 bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900'
                                                            : 'border border-white/20 bg-white/20 text-white'
                                                }`}
                                            >
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-yellow-100">
                                                    {s.nama}
                                                </p>
                                                <p className="font-mono text-xs text-indigo-200">
                                                    {s.nim}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-100">
                                                    {s.count}x
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedStudentForAppreciation(
                                                            s,
                                                        );
                                                        setShowAppreciationModal(
                                                            true,
                                                        );
                                                    }}
                                                    className="rounded-lg border border-white/30 bg-white/20 p-2 text-white shadow-lg transition-all hover:scale-110 hover:rotate-12 hover:bg-white/40 active:scale-95"
                                                    title="Kirim Apresiasi"
                                                >
                                                    <PartyPopper className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Low Attendance */}
                        <motion.div
                            variants={slideInRight}
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25">
                                            <AlertTriangle className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                                            Kehadiran Rendah
                                        </h2>
                                    </div>
                                    {lowAttendance.length > 0 && (
                                        <motion.button
                                            onClick={() =>
                                                openWarningModal(lowAttendance)
                                            }
                                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Send className="h-3 w-3" />
                                            Kirim Semua
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                {lowAttendance.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-neutral-400">
                                        Tidak ada data
                                    </div>
                                ) : (
                                    lowAttendance.map((s, i) => (
                                        <motion.div
                                            key={s.id}
                                            className="flex items-center gap-3 p-3 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: i * 0.04,
                                                type: 'spring',
                                                stiffness: 100,
                                            }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                    {s.nama}
                                                </p>
                                                <p className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                                                    {s.nim}
                                                </p>
                                            </div>
                                            <span className="mr-1 text-sm font-bold text-red-500 dark:text-red-400">
                                                {s.count}x
                                            </span>
                                            <motion.button
                                                onClick={() =>
                                                    !sentWarningIds.has(s.id) &&
                                                    openWarningModal([s])
                                                }
                                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${
                                                    sentWarningIds.has(s.id)
                                                        ? 'cursor-default border-emerald-200 bg-emerald-50 text-emerald-500 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        : 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                                                }`}
                                                whileHover={
                                                    sentWarningIds.has(s.id)
                                                        ? {}
                                                        : { scale: 1.15 }
                                                }
                                                whileTap={
                                                    sentWarningIds.has(s.id)
                                                        ? {}
                                                        : { scale: 0.9 }
                                                }
                                                title={
                                                    sentWarningIds.has(s.id)
                                                        ? `Peringatan sudah terkirim ke ${s.nama}`
                                                        : `Kirim peringatan ke ${s.nama}`
                                                }
                                            >
                                                {sentWarningIds.has(s.id) ? (
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Bell className="h-3.5 w-3.5" />
                                                )}
                                            </motion.button>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Registration Trend */}
                        {trendData.length > 0 && (
                            <motion.div
                                variants={slideInRight}
                                className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                                        <TrendingUp className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Tren Aktivitas
                                    </h2>
                                </div>
                                <div className="h-44">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={trendData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                                strokeOpacity={0.5}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{
                                                    fontSize: 10,
                                                    fill: '#9ca3af',
                                                }}
                                                stroke="#d1d5db"
                                            />
                                            <YAxis
                                                tick={{
                                                    fontSize: 10,
                                                    fill: '#9ca3af',
                                                }}
                                                stroke="#d1d5db"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        'rgba(255,255,255,0.95)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    boxShadow:
                                                        '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Bar
                                                dataKey="total"
                                                fill="url(#barGradient)"
                                                radius={[6, 6, 0, 0]}
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="barGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#818cf8"
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#6366f1"
                                                    />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
            {/* ═══════ APPRECIATION MODAL ═══════ */}
            <AnimatePresence>
                {showAppreciationModal && selectedStudentForAppreciation && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAppreciationModal(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{
                                    type: 'spring',
                                    damping: 25,
                                    stiffness: 300,
                                }}
                                className="pointer-events-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                {/* Modal Header */}
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                Kirim Apresiasi
                                            </h3>
                                            <p className="text-sm text-indigo-100">
                                                Kepada{' '}
                                                {
                                                    selectedStudentForAppreciation.nama
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            Pesan Apresiasi
                                        </label>
                                        <textarea
                                            value={appreciationMessage}
                                            onChange={(e) =>
                                                setAppreciationMessage(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tulis pesan apresiasi di sini... (Contoh: Pertahankan kehadiranmu!)"
                                            className="h-32 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                        />
                                        <p className="text-xs text-neutral-500">
                                            Pesan ini akan muncul di menu{' '}
                                            <strong>Evaluasi Studi</strong>{' '}
                                            mahasiswa.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() =>
                                                setShowAppreciationModal(false)
                                            }
                                            className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!appreciationMessage.trim())
                                                    return;

                                                router.post(
                                                    '/admin/attendance/warning',
                                                    {
                                                        mahasiswa_id:
                                                            selectedStudentForAppreciation.id,
                                                        title: 'Apresiasi Kehadiran',
                                                        message:
                                                            appreciationMessage,
                                                        type: 'appreciation',
                                                    },
                                                    {
                                                        onSuccess: () => {
                                                            setShowAppreciationModal(
                                                                false,
                                                            );
                                                            setAppreciationMessage(
                                                                '',
                                                            );
                                                        },
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }}
                                            disabled={
                                                !appreciationMessage.trim()
                                            }
                                            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Kirim Apresiasi
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
