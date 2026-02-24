import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle,
    Clock,
    Eye,
    Image,
    Lock,
    RefreshCw,
    ScanFace,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Asset Icons
import VerifikasiSelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
import TotalSelfieIcon from '@/assets/admin/verifikasi-selfie/total-selfie.png';
import PendingIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import DisetujuiIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import DitolakIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
}

interface AttendanceLog {
    id: number;
    selfie_path: string | null;
    scanned_at: string | null;
    status: string;
    distance_m: number | null;
    mahasiswa: Mahasiswa | null;
    course: string;
}

interface SelfieItem {
    id: number;
    status: string;
    created_at: string | null;
    verified_at: string | null;
    verified_by_name: string | null;
    rejection_reason: string | null;
    note: string | null;
    has_approved_request: boolean;
    attendance_log: AttendanceLog | null;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    today_pending: number;
    today_processed: number;
}

interface TrendData {
    date: string;
    pending: number;
    approved: number;
    rejected: number;
}

interface RecentVerification {
    id: number;
    status: string;
    verified_at: string;
    verified_by_name: string;
}

interface PageProps {
    selfieQueue: {
        data: SelfieItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
    trendData: TrendData[];
    recentVerifications: RecentVerification[];
    currentFilter: string;
}

const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
> = {
    pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
    approved: {
        label: 'Disetujui',
        color: 'text-emerald-700',
        bg: 'bg-emerald-100',
    },
    rejected: { label: 'Ditolak', color: 'text-red-700', bg: 'bg-red-100' },
};

export default function VerifikasiSelfie({
    selfieQueue,
    stats,
    trendData,
    recentVerifications,
    currentFilter,
}: PageProps) {
    const [filter, setFilter] = useState(currentFilter);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleFilter = (status: string) => {
        setFilter(status);
        router.get(
            '/admin/verifikasi-selfie',
            { status },
            { preserveState: true },
        );
    };

    const handleApprove = (id: number) =>
        router.patch(
            `/selfie-verifications/${id}/approve`,
            {},
            { preserveScroll: true },
        );
    const handleReject = (id: number) =>
        router.patch(
            `/selfie-verifications/${id}/reject`,
            {},
            { preserveScroll: true },
        );

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        router.post(
            '/admin/verifikasi-selfie/bulk-approve',
            { ids: selectedIds },
            { preserveScroll: true, onSuccess: () => setSelectedIds([]) },
        );
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0) return;
        router.post(
            '/admin/verifikasi-selfie/bulk-reject',
            { ids: selectedIds },
            { preserveScroll: true, onSuccess: () => setSelectedIds([]) },
        );
    };

    const toggleSelect = (id: number) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    const toggleSelectAll = () => {
        const pendingIds = selfieQueue.data
            .filter((s) => s.status === 'pending')
            .map((s) => s.id);
        setSelectedIds(
            selectedIds.length === pendingIds.length ? [] : pendingIds,
        );
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
        visible: {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 120,
                damping: 12,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            rotateY: 15,
            transition: { duration: 0.3 },
        },
    };

    return (
        <AppLayout>
            <Head title="Verifikasi Selfie" />
            <motion.div
                className="min-h-screen space-y-8 bg-neutral-50/50 p-6 dark:bg-neutral-950"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                    variants={itemVariants}
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

                    {/* Pulsating Rings */}
                    <motion.div
                        className="absolute top-1/2 right-16 h-32 w-32 -translate-y-1/2 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 right-16 h-32 w-32 -translate-y-1/2 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: 1,
                        }}
                    />

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 mb-2">
                                <motion.div
                                    className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 relative items-center justify-center"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                    <img src={VerifikasiSelfieIcon} alt="Verifikasi Selfie" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-xs sm:text-sm text-indigo-200 font-medium tracking-wide uppercase"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Validasi Foto
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Verifikasi Selfie
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.p
                                className="text-indigo-100 max-w-xl mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Validasi foto selfie mahasiswa untuk kehadiran. Pastikan wajah terlihat jelas dan sesuai dengan data mahasiswa.
                            </motion.p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    router.visit('/admin/verifikasi-selfie')
                                }
                                className="flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh Data</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-2 gap-6 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard
                        imageIcon={TotalSelfieIcon}
                        label="Total Selfie"
                        value={stats.total}
                        color="blue"
                        delay={0.1}
                    />
                    <StatCard
                        imageIcon={PendingIcon}
                        label="Pending"
                        value={stats.pending}
                        color="amber"
                        delay={0.2}
                    />
                    <StatCard
                        imageIcon={DisetujuiIcon}
                        label="Disetujui"
                        value={stats.approved}
                        color="emerald"
                        delay={0.3}
                    />
                    <StatCard
                        imageIcon={DitolakIcon}
                        label="Ditolak"
                        value={stats.rejected}
                        color="red"
                        delay={0.4}
                    />
                </motion.div>

                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl lg:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Tren Validasi
                                </h2>
                                <p className="text-xs text-neutral-500">
                                    Statistik 7 hari terakhir
                                </p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient
                                            id="colorApproved"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#10b981"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#10b981"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="colorRejected"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef4444"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e5e5e5"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#737373' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#737373' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255,255,255,0.8)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '12px',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                        itemStyle={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="approved"
                                        stackId="1"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="url(#colorApproved)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rejected"
                                        stackId="1"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fill="url(#colorRejected)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="border-b border-white/10 bg-white/30 p-6 dark:border-white/5 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                        Verifikasi Terbaru
                                    </h2>
                                    <p className="text-xs text-neutral-500">
                                        Aktivitas admin terakhir
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="custom-scrollbar max-h-[300px] flex-1 space-y-3 overflow-y-auto p-4">
                            {recentVerifications.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <Clock className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <p className="text-sm font-medium text-neutral-500">
                                        Belum ada aktivitas
                                    </p>
                                </div>
                            ) : (
                                recentVerifications.map((v) => (
                                    <div
                                        key={v.id}
                                        className="group flex items-center justify-between rounded-xl border border-transparent bg-white/40 p-3 transition-all hover:border-white/20 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-neutral-800/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-2 w-2 rounded-full shadow-sm ${v.status === 'approved' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`}
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-700 transition-colors group-hover:text-neutral-900 dark:text-neutral-200">
                                                    {v.verified_by_name}
                                                </p>
                                                <p className="mt-1 w-fit rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800">
                                                    {v.status === 'approved'
                                                        ? 'Menyetujui'
                                                        : 'Menolak'}{' '}
                                                    pengajuan
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] font-medium tracking-tight text-neutral-400">
                                            {v.verified_at}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="min-h-[500px] overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    variants={itemVariants}
                >
                    <div className="border-b border-white/10 bg-white/30 p-6 dark:border-white/5 dark:bg-black/20">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                                    <ScanFace className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        Antrian Selfie
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        Manajemen antrian validasi
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                                    {[
                                        'all',
                                        'pending',
                                        'approved',
                                        'rejected',
                                    ].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleFilter(s)}
                                            className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-all ${filter === s
                                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 dark:bg-neutral-700 dark:text-indigo-400'
                                                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                                                } `}
                                        >
                                            {s === 'all'
                                                ? 'Semua'
                                                : statusConfig[s]?.label || s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {selectedIds.length > 0 && (
                            <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                    {selectedIds.length} dipilih
                                </span>
                                <button
                                    onClick={handleBulkApprove}
                                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                                >
                                    Setujui Semua
                                </button>
                                <button
                                    onClick={handleBulkReject}
                                    className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                                >
                                    Tolak Semua
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="rounded bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>

                    <motion.div
                        className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        variants={containerVariants}
                    >
                        <AnimatePresence mode="popLayout">
                            {selfieQueue.data.length === 0 ? (
                                <motion.div
                                    className="col-span-full p-12 text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <ScanFace className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                                    <p className="text-slate-500">
                                        Tidak ada selfie dalam antrian
                                    </p>
                                </motion.div>
                            ) : (
                                selfieQueue.data.map((item) => {
                                    const cfg = statusConfig[item.status] || {
                                        label: item.status,
                                        color: 'text-slate-700',
                                        bg: 'bg-slate-100',
                                    };
                                    return (
                                        <motion.div
                                            key={item.id}
                                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-neutral-900/40"
                                            variants={cardVariants}
                                            layout
                                            whileHover={{
                                                scale: 1.02,
                                                y: -4,
                                                boxShadow:
                                                    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                                transition: { duration: 0.2 },
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                {item.attendance_log
                                                    ?.selfie_path ? (
                                                    <div className="relative h-full w-full">
                                                        <img
                                                            src={`/storage/${item.attendance_log.selfie_path}`}
                                                            alt="Selfie"
                                                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.has_approved_request ? '' : 'scale-110 blur-xl'}`}
                                                        />

                                                        {/* Gradient Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                                        {!item.has_approved_request && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center backdrop-blur-sm">
                                                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                                                                    <Lock className="h-5 w-5 text-white" />
                                                                </div>
                                                                <p className="text-xs font-medium text-white/90">
                                                                    Privasi
                                                                    Terlindungi
                                                                </p>
                                                            </div>
                                                        )}
                                                        {item.has_approved_request && (
                                                            <div className="absolute bottom-3 left-3">
                                                                <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/20 backdrop-blur-md">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Disetujui
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Image className="h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                                                    </div>
                                                )}

                                                {/* Top Badges */}
                                                <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
                                                    {item.status ===
                                                        'pending' ? (
                                                        <div
                                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md transition-colors hover:bg-white/40"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSelect(
                                                                    item.id,
                                                                );
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(
                                                                    item.id,
                                                                )}
                                                                onChange={() => { }}
                                                                className="h-4 w-4 cursor-pointer rounded border-white/50 bg-transparent checked:bg-indigo-500 focus:ring-0"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div />
                                                    )}
                                                    <span
                                                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md ${cfg.bg} ${cfg.color} bg-opacity-90`}
                                                    >
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <h3
                                                            className="max-w-[120px] truncate font-bold text-neutral-900 dark:text-white"
                                                            title={
                                                                item
                                                                    .attendance_log
                                                                    ?.mahasiswa
                                                                    ?.nama
                                                            }
                                                        >
                                                            {item.attendance_log
                                                                ?.mahasiswa
                                                                ?.nama ??
                                                                'Unknown'}
                                                        </h3>
                                                        <p className="font-mono text-xs text-neutral-500">
                                                            {item.attendance_log
                                                                ?.mahasiswa
                                                                ?.nim ?? '-'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-medium text-neutral-400">
                                                            {item.created_at}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        router.visit(
                                                            `/admin/verifikasi-selfie/${item.id}`,
                                                        )
                                                    }
                                                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-100 py-2 text-xs font-semibold text-neutral-700 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400 dark:hover:bg-neutral-700"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Lihat Detail
                                                </button>

                                                {item.status === 'pending' && (
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleReject(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}

                                                {item.status === 'rejected' &&
                                                    item.rejection_reason && (
                                                        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-2 dark:border-red-900/30 dark:bg-red-900/20">
                                                            <p className="line-clamp-2 text-[10px] text-red-600 dark:text-red-400">
                                                                "
                                                                {
                                                                    item.rejection_reason
                                                                }
                                                                "
                                                            </p>
                                                        </div>
                                                    )}
                                                {item.verified_by_name && (
                                                    <p className="mt-2 text-center text-[10px] text-neutral-400">
                                                        Diverifikasi oleh{' '}
                                                        {item.verified_by_name}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {selfieQueue.last_page > 1 && (
                        <div className="flex justify-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
                            {selfieQueue.links.map((link, i) => (
                                <button
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
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300' : 'cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-black'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

function StatCard({
    icon: Icon,
    imageIcon,
    label,
    value,
    color,
    delay = 0,
}: {
    icon?: any;
    imageIcon?: string;
    label: string;
    value: number;
    color: string;
    delay?: number;
}) {
    const gradients: Record<
        string,
        { from: string; to: string; shadow: string; bg: string }
    > = {
        blue: {
            from: 'from-sky-400',
            to: 'to-indigo-600',
            shadow: 'shadow-sky-500/30',
            bg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
        },
        emerald: {
            from: 'from-emerald-400',
            to: 'to-teal-600',
            shadow: 'shadow-emerald-500/30',
            bg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
        },
        amber: {
            from: 'from-amber-400',
            to: 'to-orange-600',
            shadow: 'shadow-amber-500/30',
            bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
        },
        red: {
            from: 'from-red-400',
            to: 'to-rose-600',
            shadow: 'shadow-red-500/30',
            bg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
        },
        purple: {
            from: 'from-purple-400',
            to: 'to-fuchsia-600',
            shadow: 'shadow-purple-500/30',
            bg: 'from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:to-fuchsia-500/10',
        },
        orange: {
            from: 'from-orange-400',
            to: 'to-red-600',
            shadow: 'shadow-orange-500/30',
            bg: 'from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10',
        },
    };
    const g = gradients[color] ?? gradients.blue;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay, duration: 0.5 },
                },
            }}
            className="group relative cursor-default overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 p-3 sm:p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${g.bg}`} />
            <div
                className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${g.from} ${g.to} opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-20`}
            />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${g.from} ${g.to} text-white shadow-lg ${g.shadow}`}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-7 sm:w-7" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <motion.p
                            className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                delay: 0.2 + delay,
                            }}
                        >
                            {value}
                        </motion.p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
