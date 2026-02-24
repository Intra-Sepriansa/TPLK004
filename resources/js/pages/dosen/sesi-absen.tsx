import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Calendar, Play, Pause, Plus, Search, Clock, Users, CheckCircle, XCircle, RefreshCw, Eye, X, Sparkles, TrendingUp, AlertCircle, BookOpen, Grid, List, Download, Settings, FileText, Zap, ChevronRight, BarChart3, Copy, Trash2, Filter, MoreHorizontal, Info } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import SesiBaruIcon from '@/assets/admin/sesi-absen/sesi-baru-icon.png';

interface Session {
    id: number;
    course_id: number;
    course_name: string;
    course_sks: number;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    start_raw: string | null;
    is_active: boolean;
    logs_count: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
}

interface Stats {
    totalSessions: number;
    activeSessions: number;
    totalAttendance: number;
    avgAttendanceRate: number;
    totalLate: number;
    totalRejected: number;
    thisMonthSessions: number;
}

interface PageProps {
    dosen: { id: number; nama: string };
    sessions: Session[];
    courses: Course[];
    stats: Stats;
    flash?: {
        success?: string;
        error?: string;
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
    hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
} as const;

export default function DosenSesiAbsen({ dosen, sessions, courses, stats }: PageProps) {
    const { props } = usePage<any>();
    const { flash } = props;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [search, setSearch] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'history'>('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const createForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
        auto_activate: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/dosen/sessions', {
            onSuccess: () => { setShowCreateModal(false); createForm.reset(); }
        });
    };

    const handleActivate = (id: number) => router.patch(`/dosen/sessions/${id}/activate`);
    const handleClose = (id: number) => router.patch(`/dosen/sessions/${id}/close`);

    const now = new Date();
    const defaultStart = now.toISOString().slice(0, 16);
    const defaultEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    // Filtered sessions
    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            const matchSearch = s.course_name.toLowerCase().includes(search.toLowerCase()) ||
                s.title?.toLowerCase().includes(search.toLowerCase());
            const matchCourse = filterCourse === 'all' || String(s.course_id) === filterCourse;
            const matchStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && s.is_active) ||
                (filterStatus === 'inactive' && !s.is_active);
            const matchTab = activeTab === 'all' ||
                (activeTab === 'active' && s.is_active) ||
                (activeTab === 'history' && !s.is_active);
            return matchSearch && matchCourse && matchStatus && matchTab;
        });
    }, [sessions, search, filterCourse, filterStatus, activeTab]);

    // Calculate present count from totalAttendance - totalLate
    const totalPresent = stats.totalAttendance - stats.totalLate;

    const summaryCards = [
        { key: 'total', icon: Calendar, label: 'Total Sesi', value: stats.totalSessions, sub: `${stats.activeSessions} sesi aktif`, gradient: 'from-violet-400 to-purple-600', glow: 'bg-violet-500', shadow: 'hover:shadow-violet-500/10' },
        { key: 'present', icon: CheckCircle, label: 'Hadir', value: totalPresent, sub: 'tepat waktu', gradient: 'from-emerald-400 to-teal-600', glow: 'bg-emerald-500', shadow: 'hover:shadow-emerald-500/10' },
        { key: 'late', icon: Clock, label: 'Terlambat', value: stats.totalLate, sub: 'total mahasiswa', gradient: 'from-amber-400 to-orange-600', glow: 'bg-amber-500', shadow: 'hover:shadow-amber-500/10' },
        { key: 'rate', icon: TrendingUp, label: 'Rata-rata', value: stats.avgAttendanceRate, suffix: '%', sub: 'tingkat kehadiran', gradient: 'from-blue-400 to-cyan-600', glow: 'bg-blue-500', shadow: 'hover:shadow-blue-500/10' },
    ];

    const tabs = [
        { key: 'all' as const, label: 'Semua Sesi', count: sessions.length },
        { key: 'active' as const, label: 'Sesi Aktif', count: sessions.filter(s => s.is_active).length },
        { key: 'history' as const, label: 'Riwayat', count: sessions.filter(s => !s.is_active).length },
    ];

    return (
        <DosenLayout>
            <Head title="Sesi Absen" />

            {/* ═══════ ADVANCED TOAST NOTIFICATION ═══════ */}
            <AnimatePresence>
                {showToast && (flash?.success || flash?.error) && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)', transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed top-20 right-4 md:right-8 z-50 flex max-w-sm w-full shadow-2xl"
                    >
                        <div className={cn(
                            "relative overflow-hidden rounded-2xl border p-4 backdrop-blur-3xl shadow-2xl w-full",
                            flash.success
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-50"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-50"
                        )}>
                            {/* Animated background glow */}
                            <div className={cn(
                                "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-50",
                                flash.success ? "bg-emerald-500" : "bg-rose-500"
                            )} />

                            <div className="relative flex items-start gap-4">
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                    flash.success ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                )}>
                                    {flash.success ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white mb-1">
                                        {flash.success ? 'Sistem AI Diperbarui' : 'Terjadi Kesalahan'}
                                    </h4>
                                    <p className="text-xs text-white/80 leading-relaxed">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button onClick={() => setShowToast(false)} className="shrink-0 text-white/50 hover:text-white transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-6">

                {/* ═══════ HEADER — Kas Admin Style ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Pulse Rings */}
                    {[0, 1, 2].map(i => (
                        <motion.div key={i} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i }} />
                    ))}

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                                    <Calendar className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Manajemen Sesi</p>
                                    <h1 className="text-3xl font-bold text-white">Sesi Absensi</h1>
                                    <p className="mt-1 text-indigo-100">Kelola sesi absensi mata kuliah Anda dengan mudah</p>
                                </div>
                            </div>
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="h-6 w-6 text-white" /></div>
                                <div>
                                    <p className="text-xs text-indigo-100">Total Sesi Aktif</p>
                                    <p className="text-2xl font-bold text-white">{stats.activeSessions}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                            className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                            {([
                                { icon: Plus, label: 'Buat Sesi Baru', href: '/dosen/sesi-absen/create' },
                                { icon: FileText, label: 'Template Sesi', href: '/dosen/session-templates' },
                                { icon: Download, label: 'Export Laporan', href: '/dosen/rekapan' },
                                { icon: Settings, label: 'Pengaturan', href: '/dosen/settings' },
                            ] as { icon: any; label: string; href?: string; onClick?: () => void }[]).map(btn => (
                                btn.href ? (
                                    <Link key={btn.label} href={btn.href}>
                                        <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:bg-white/30">
                                            <btn.icon className="h-4 w-4" /> {btn.label}
                                        </motion.button>
                                    </Link>
                                ) : (
                                    <motion.button key={btn.label} onClick={btn.onClick} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:bg-white/30">
                                        <btn.icon className="h-4 w-4" /> {btn.label}
                                    </motion.button>
                                )
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ SUMMARY CARDS — 6 Cards with Glow ═══════ */}
                {/* ═══════ SUMMARY CARDS — 4 Cards with Glow ═══════ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map(card => (
                        <motion.div key={card.key} variants={cardVariants} whileHover="hover"
                            onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                            className={cn("group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5", card.shadow)}>
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 dark:opacity-10", card.gradient)} />
                            <motion.div animate={{ scale: hoveredCard === card.key ? 1.5 : 1, opacity: hoveredCard === card.key ? 0.4 : 0.2 }}
                                className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500", card.glow)} />
                            <div className="relative flex items-center gap-4">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", card.gradient)}>
                                    <card.icon className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
                                    <div className="mt-1">
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            <AnimatedCounter value={card.value} suffix={card.suffix} duration={1500} />
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">{card.sub}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════ FILTERS & SEARCH ═══════ */}
                <motion.div variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input type="text" placeholder="Cari sesi atau mata kuliah..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 py-2.5 pl-11 pr-10 text-sm shadow-sm backdrop-blur-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-white/10 dark:text-white" />
                            <AnimatePresence>
                                {search && (
                                    <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Course Filter */}
                        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                            className="rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(c => <option key={c.id} value={String(c.id)}>{c.nama}</option>)}
                        </select>

                        {/* Status Filter */}
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                            className="rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>

                        {/* View Mode */}
                        <div className="flex items-center rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 p-1 shadow-sm backdrop-blur-lg dark:border-white/10">
                            {[
                                { mode: 'list' as const, icon: List },
                                { mode: 'grid' as const, icon: Grid },
                            ].map(v => (
                                <motion.button key={v.mode} onClick={() => setViewMode(v.mode)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className={cn("rounded-lg p-2 transition-all", viewMode === v.mode ? "bg-indigo-500 text-white shadow" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400")}>
                                    <v.icon className="h-4 w-4" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ TAB NAVIGATION ═══════ */}
                <motion.div variants={itemVariants} className="flex gap-2">
                    {tabs.map(tab => (
                        <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className={cn("relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                activeTab === tab.key
                                    ? "text-white shadow-lg"
                                    : "text-neutral-600 dark:text-neutral-400 bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 backdrop-blur-xl hover:bg-white/60"
                            )}>
                            {activeTab === tab.key && (
                                <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.label}
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold",
                                    activeTab === tab.key ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                                )}>{tab.count}</span>
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* ═══════ SESSION LIST VIEW ═══════ */}
                {viewMode === 'list' && (
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 dark:text-neutral-300">Mata Kuliah</th>
                                        <th className="px-4 py-4 text-left font-semibold text-neutral-700 dark:text-neutral-300">Pertemuan</th>
                                        <th className="px-4 py-4 text-left font-semibold text-neutral-700 dark:text-neutral-300">Waktu</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Kehadiran</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredSessions.length === 0 ? (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <td colSpan={6} className="px-6 py-16 text-center">
                                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                                        <AlertCircle className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Tidak ada sesi ditemukan</p>
                                                        <p className="text-xs text-neutral-400 mt-1">Coba ubah filter atau buat sesi baru</p>
                                                    </motion.div>
                                                </td>
                                            </motion.tr>
                                        ) : filteredSessions.map((session, i) => {
                                            const total = session.present_count + session.late_count + session.rejected_count;
                                            const pctPresent = total > 0 ? (session.present_count / total) * 100 : 0;
                                            const pctLate = total > 0 ? (session.late_count / total) * 100 : 0;
                                            const pctRejected = total > 0 ? (session.rejected_count / total) * 100 : 0;
                                            return (
                                                <motion.tr key={session.id}
                                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 24 }}
                                                    className="border-b border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 dark:text-white">{session.course_name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {session.title && <p className="text-xs text-neutral-500 dark:text-neutral-400">{session.title}</p>}
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">{session.course_sks} SKS</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
                                                            <Sparkles className="h-3 w-3 text-indigo-500" />
                                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">#{session.meeting_number}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs space-y-0.5">
                                                            <p className="text-neutral-700 dark:text-neutral-300 font-medium">{session.start_at}</p>
                                                            <p className="text-neutral-400 dark:text-neutral-500">s/d {session.end_at}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center gap-1 text-xs"><CheckCircle className="h-3 w-3 text-emerald-500" /><span className="font-semibold text-emerald-600 dark:text-emerald-400">{session.present_count}</span></span>
                                                                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                                                                <span className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3 text-amber-500" /><span className="font-semibold text-amber-600 dark:text-amber-400">{session.late_count}</span></span>
                                                                <span className="text-neutral-300 dark:text-neutral-600">/</span>
                                                                <span className="flex items-center gap-1 text-xs"><XCircle className="h-3 w-3 text-rose-500" /><span className="font-semibold text-rose-600 dark:text-rose-400">{session.rejected_count}</span></span>
                                                            </div>
                                                            {total > 0 && (
                                                                <div className="w-full max-w-[120px] h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
                                                                    <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${pctPresent}%` }} />
                                                                    <div className="h-full bg-amber-500" style={{ width: `${pctLate}%` }} />
                                                                    <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${pctRejected}%` }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {session.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm">
                                                                <motion.span className="h-2 w-2 rounded-full bg-emerald-500"
                                                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }} />
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                                                Nonaktif
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                onClick={() => router.get(`/dosen/sesi-absen/${session.id}`)}
                                                                className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors" title="Detail">
                                                                <Eye className="h-4 w-4" />
                                                            </motion.button>
                                                            {session.is_active ? (
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleClose(session.id)}
                                                                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Nonaktifkan">
                                                                    <Pause className="h-4 w-4" />
                                                                </motion.button>
                                                            ) : (
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleActivate(session.id)}
                                                                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Aktifkan">
                                                                    <Play className="h-4 w-4" />
                                                                </motion.button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ SESSION GRID VIEW ═══════ */}
                {viewMode === 'grid' && (
                    <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {filteredSessions.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-16 text-center">
                                    <AlertCircle className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                    <p className="text-neutral-500 font-medium">Tidak ada sesi ditemukan</p>
                                </motion.div>
                            ) : filteredSessions.map((session, i) => {
                                const total = session.present_count + session.late_count + session.rejected_count;
                                return (
                                    <motion.div key={session.id} variants={cardVariants} whileHover="hover"
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 shadow-xl backdrop-blur-xl dark:border-white/5 cursor-pointer"
                                        onClick={() => router.get(`/dosen/sesi-absen/${session.id}`)}>
                                        {/* Gradient accent bar */}
                                        <div className={cn("h-1.5 w-full bg-gradient-to-r", session.is_active ? "from-emerald-400 to-teal-500" : "from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-600")} />

                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">{session.course_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">{session.course_sks} SKS</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">Pertemuan #{session.meeting_number}</span>
                                                    </div>
                                                </div>
                                                {session.is_active ? (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                                        <motion.span className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                                                            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Nonaktif</span>
                                                )}
                                            </div>

                                            {session.title && (
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-1">{session.title}</p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.start_at}</span>
                                                <span>s/d {session.end_at}</span>
                                            </div>

                                            {/* Attendance Stats */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1 text-xs"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /><span className="font-bold text-emerald-600 dark:text-emerald-400">{session.present_count}</span></span>
                                                    <span className="flex items-center gap-1 text-xs"><Clock className="h-3.5 w-3.5 text-amber-500" /><span className="font-bold text-amber-600 dark:text-amber-400">{session.late_count}</span></span>
                                                    <span className="flex items-center gap-1 text-xs"><XCircle className="h-3.5 w-3.5 text-rose-500" /><span className="font-bold text-rose-600 dark:text-rose-400">{session.rejected_count}</span></span>
                                                </div>
                                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">{total} total</span>
                                            </div>

                                            {/* Progress Bar */}
                                            {total > 0 && (
                                                <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
                                                    <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${(session.present_count / total) * 100}%` }} />
                                                    <div className="h-full bg-amber-500" style={{ width: `${(session.late_count / total) * 100}%` }} />
                                                    <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${(session.rejected_count / total) * 100}%` }} />
                                                </div>
                                            )}

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                    onClick={(e) => { e.stopPropagation(); router.get(`/dosen/sesi-absen/${session.id}`); }}
                                                    className="flex-1 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors">
                                                    Detail
                                                </motion.button>
                                                {session.is_active ? (
                                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => { e.stopPropagation(); handleClose(session.id); }}
                                                        className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors">
                                                        Nonaktifkan
                                                    </motion.button>
                                                ) : (
                                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => { e.stopPropagation(); handleActivate(session.id); }}
                                                        className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                                                        Aktifkan
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ═══════ CREATE SESSION MODAL ═══════ */}
                <AnimatePresence>
                    {showCreateModal && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                                <motion.div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto"
                                    onClick={e => e.stopPropagation()}>
                                    {/* Modal Header — Kas Admin Gradient */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                                        <div className="absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                                        {[0, 1].map(i => (
                                            <motion.div key={i} className="absolute right-8 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-white/10"
                                                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                                                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }} />
                                        ))}
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                                                    className="relative shrink-0">
                                                    <img src={SesiBaruIcon} alt="Sesi Baru" className="h-20 w-20 object-contain drop-shadow-xl pointer-events-none" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-bold">Buat Sesi Absen Baru</h3>
                                                    <p className="text-sm text-white/80 mt-1">Isi form di bawah untuk membuat sesi baru</p>
                                                </div>
                                            </div>
                                            <motion.button onClick={() => setShowCreateModal(false)} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur">
                                                <X className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleCreate} className="p-8 space-y-6">
                                        {/* Mata Kuliah */}
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                                                    <BookOpen className="h-4 w-4" />
                                                </div>
                                                Mata Kuliah
                                            </label>
                                            <select value={createForm.data.course_id} onChange={e => createForm.setData('course_id', e.target.value)}
                                                className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" required>
                                                <option value="">Pilih Mata Kuliah</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.nama} ({c.sks} SKS)</option>)}
                                            </select>
                                        </motion.div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Pertemuan Ke */}
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    Pertemuan Ke
                                                </label>
                                                <input type="number" min="1" max="21" value={createForm.data.meeting_number}
                                                    onChange={e => createForm.setData('meeting_number', parseInt(e.target.value))}
                                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" required />
                                            </motion.div>

                                            {/* Judul */}
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                                                        <Sparkles className="h-4 w-4" />
                                                    </div>
                                                    Judul (Opsional)
                                                </label>
                                                <input type="text" value={createForm.data.title} onChange={e => createForm.setData('title', e.target.value)}
                                                    placeholder="Materi pertemuan"
                                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" />
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Start */}
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                                                        <Play className="h-4 w-4" />
                                                    </div>
                                                    Mulai
                                                </label>
                                                <input type="datetime-local" value={createForm.data.start_at} onChange={e => createForm.setData('start_at', e.target.value)}
                                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" required />
                                            </motion.div>

                                            {/* End */}
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
                                                        <Pause className="h-4 w-4" />
                                                    </div>
                                                    Selesai
                                                </label>
                                                <input type="datetime-local" value={createForm.data.end_at} onChange={e => createForm.setData('end_at', e.target.value)}
                                                    className="w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" required />
                                            </motion.div>
                                        </div>

                                        {/* Auto Activate */}
                                        <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 cursor-pointer transition-all hover:border-emerald-300"
                                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            <input type="checkbox" checked={createForm.data.auto_activate}
                                                onChange={e => createForm.setData('auto_activate', e.target.checked)}
                                                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5" />
                                            <div>
                                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Aktifkan langsung setelah dibuat
                                                </span>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Sesi akan langsung aktif dan mahasiswa bisa absen</p>
                                            </div>
                                        </motion.label>

                                        {/* Errors */}
                                        <AnimatePresence>
                                            {createForm.errors && Object.keys(createForm.errors).length > 0 && (
                                                <motion.div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                    {Object.values(createForm.errors).map((error, i) => (
                                                        <p key={i}>• {error}</p>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Actions */}
                                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                            <motion.button type="button" onClick={() => setShowCreateModal(false)}
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                className="px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-semibold dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                                                Batal
                                            </motion.button>
                                            <motion.button type="submit" disabled={createForm.processing}
                                                whileHover={{ scale: createForm.processing ? 1 : 1.02 }} whileTap={{ scale: createForm.processing ? 1 : 0.98 }}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold disabled:opacity-50 shadow-lg disabled:cursor-not-allowed">
                                                {createForm.processing ? (
                                                    <><RefreshCw className="h-4 w-4 animate-spin" /> Menyimpan...</>
                                                ) : (
                                                    <><CheckCircle className="h-4 w-4" /> Buat Sesi</>
                                                )}
                                            </motion.button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </motion.div>
        </DosenLayout>
    );
}
