import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    BadgeCheck,
    Building2,
    Calendar,
    CheckCircle2,
    GraduationCap,
    History,
    MoreHorizontal,
    Share2,
    Smartphone,
} from 'lucide-react';
import { useState } from 'react';

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

    // Male exceptions
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

interface Props {
    mahasiswa: {
        id: number;
        nama: string;
        nim: string;
        email?: string;
        photo?: string;
        fakultas?: string;
        prodi?: string;
        semester?: number;
        kelas?: string;
        jenis_kelamin?: 'L' | 'P';
        created_at: string;
    };
    stats: {
        total_attendance: number;
        present: number;
        late: number;
        alpha: number;
        permit: number;
        rate: number;
    };
    recentActivity: any[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
};

export default function MahasiswaDetail({
    mahasiswa,
    stats,
    recentActivity,
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'history', label: 'Riwayat Absensi', icon: History },
        { id: 'schedule', label: 'Jadwal Kuliah', icon: Calendar },
    ];

    return (
        <AppLayout>
            <Head title={`Profil - ${mahasiswa.nama}`} />

            <div className="min-h-screen bg-neutral-50/50 p-4 md:p-8 dark:bg-neutral-900/50">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="mx-auto max-w-5xl space-y-8"
                >
                    {/* ═══════ HEADER CARD ═══════ */}
                    <div className="relative">
                        {/* Purple Banner */}
                        <div className="relative h-48 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl shadow-purple-500/20 md:h-64">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay brightness-100 contrast-150"></div>
                            <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/10 blur-3xl"></div>

                            {/* Top Actions */}
                            <div className="absolute top-6 right-6 left-6 z-10 flex items-center justify-between text-white">
                                <Link href="/admin/mahasiswa">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="rounded-full border border-white/10 bg-black/20 p-2 backdrop-blur-md transition-colors hover:bg-black/40"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </motion.button>
                                </Link>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="rounded-full border border-white/10 bg-black/20 p-2 backdrop-blur-md transition-colors hover:bg-black/40"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="rounded-full border border-white/10 bg-black/20 p-2 backdrop-blur-md transition-colors hover:bg-black/40"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Overlay */}
                        <div className="relative -mt-20 mb-6 flex flex-col items-start gap-6 px-6 md:flex-row md:items-end md:px-12">
                            {/* Avatar */}
                            <motion.div
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                className="relative shrink-0"
                            >
                                <div className="h-40 w-40 rounded-full bg-neutral-50 p-1.5 shadow-2xl dark:bg-neutral-900">
                                    <div className="group relative h-full w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                        <img
                                            src={
                                                mahasiswa.photo ||
                                                getFallbackAvatar(
                                                    mahasiswa.nama,
                                                    mahasiswa.jenis_kelamin,
                                                )
                                            }
                                            alt={mahasiswa.nama}
                                            className="h-full w-full bg-neutral-100 object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Status Indicator */}
                                        <div
                                            className="absolute right-3 bottom-3 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 shadow-sm dark:border-neutral-900"
                                            title="Active"
                                        ></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Name & Badge */}
                            <div className="flex-1 pt-2 text-center md:pt-0 md:pb-4 md:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className="mb-1 text-sm font-bold tracking-wide text-violet-600 uppercase dark:text-violet-400">
                                        @{mahasiswa.nim}
                                    </p>
                                    <h1 className="flex items-center justify-center gap-2 text-3xl font-black text-neutral-900 md:justify-start md:text-4xl dark:text-white">
                                        {mahasiswa.nama}
                                        <BadgeCheck className="h-8 w-8 fill-blue-50 text-blue-500 dark:fill-blue-900/30" />
                                    </h1>
                                    <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-lg text-neutral-500 md:justify-start dark:text-neutral-400">
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="h-4 w-4" />{' '}
                                            {mahasiswa.prodi ||
                                                'Teknik Informatika'}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4" />{' '}
                                            Sem. {mahasiswa.semester || 1} -{' '}
                                            {mahasiswa.kelas || 'Reguler'}
                                        </span>
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 gap-4 px-2 lg:grid-cols-4"
                    >
                        {[
                            {
                                label: 'Kehadiran',
                                value: `${stats.rate}%`,
                                sub: 'Rate',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-500/10',
                            },
                            {
                                label: 'Hadir',
                                value: stats.present,
                                sub: 'Sesi',
                                color: 'text-blue-500',
                                bg: 'bg-blue-500/10',
                            },
                            {
                                label: 'Terlambat',
                                value: stats.late,
                                sub: 'Sesi',
                                color: 'text-orange-500',
                                bg: 'bg-orange-500/10',
                            },
                            {
                                label: 'Alpha',
                                value: stats.alpha,
                                sub: 'Sesi',
                                color: 'text-red-500',
                                bg: 'bg-red-500/10',
                            },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <span
                                    className={cn(
                                        'mb-1 text-xs font-bold tracking-wider uppercase',
                                        stat.color,
                                    )}
                                >
                                    {stat.label}
                                </span>
                                <span className="inline-flex items-baseline gap-1 text-3xl font-black text-neutral-900 dark:text-white">
                                    {stat.value}{' '}
                                    <span className="text-sm font-medium text-neutral-400">
                                        {stat.sub}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Tabs Navigation */}
                    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-2 pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all',
                                    activeTab === tab.id
                                        ? 'bg-neutral-900 text-white shadow-lg dark:bg-white dark:text-neutral-900'
                                        : 'border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800',
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="px-2 pb-12">
                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Recent Activity */}
                                <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
                                    <h3 className="mb-6 text-xl font-bold">
                                        Aktivitas Terkini
                                    </h3>
                                    <div className="relative space-y-6 before:absolute before:top-10 before:bottom-0 before:left-[19px] before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                                        {recentActivity.length === 0 ? (
                                            <p className="py-6 text-center text-neutral-500">
                                                Belum ada aktivitas.
                                            </p>
                                        ) : (
                                            recentActivity.map((log, i) => (
                                                <div
                                                    key={log.id}
                                                    className="relative flex items-start gap-4"
                                                >
                                                    <div
                                                        className={cn(
                                                            'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-xs font-bold dark:border-neutral-900',
                                                            log.status ===
                                                                'present'
                                                                ? 'bg-blue-100 text-blue-600'
                                                                : log.status ===
                                                                    'late'
                                                                  ? 'bg-orange-100 text-orange-600'
                                                                  : 'bg-red-100 text-red-600',
                                                        )}
                                                    >
                                                        {log.status ===
                                                        'present'
                                                            ? 'H'
                                                            : log.status ===
                                                                'late'
                                                              ? 'T'
                                                              : 'A'}
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <div className="flex items-start justify-between">
                                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                                {log.status ===
                                                                'present'
                                                                    ? 'Check-in Berhasil'
                                                                    : log.status ===
                                                                        'late'
                                                                      ? 'Check-in Terlambat'
                                                                      : 'Absen'}
                                                            </p>
                                                            <span className="font-mono text-xs text-neutral-400">
                                                                {new Date(
                                                                    log.time,
                                                                ).toLocaleTimeString(
                                                                    'id-ID',
                                                                    {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />{' '}
                                                                {log.date}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Smartphone className="h-3 w-3" />{' '}
                                                                {log.device ||
                                                                    'Unknown'}
                                                            </span>
                                                            {log.location && (
                                                                <span className="flex items-center gap-1 text-emerald-500">
                                                                    <CheckCircle2 className="h-3 w-3" />{' '}
                                                                    {
                                                                        log.location
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SCHEDULE (Placeholder) */}
                        {activeTab === 'schedule' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-neutral-200 bg-white py-12 text-center dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <Calendar className="h-8 w-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Jadwal Kuliah
                                </h3>
                                <p className="text-neutral-500">
                                    Fitur jadwal kuliah akan segera tersedia.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
