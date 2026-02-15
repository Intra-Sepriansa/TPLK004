import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Users,
    Search,
    Plus,
    Trash2,
    Edit,
    Download,
    Filter,
    RefreshCw,
    Award,
    AlertTriangle,
    GraduationCap,
    UserCheck,
    TrendingUp,
    KeyRound,
    X,
    User,
    Hash,
    Building2,
    BookOpen,
    Calendar,
    Save,
    Shield,
} from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    fakultas?: string;
    kelas?: string;
    semester?: number;
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
    attendanceSummary: { id: number; nama: string; nim: string; total: number; present: number; late: number }[];
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
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const addForm = useForm({
        nama: '',
        nim: '',
        fakultas: '',
        kelas: '',
        semester: 1,
    });

    const editForm = useForm({
        nama: '',
        nim: '',
        fakultas: '',
        kelas: '',
        semester: 1,
    });

    const handleFilter = () => {
        router.get('/admin/mahasiswa', { search, fakultas, kelas }, { preserveState: true });
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

    const startEdit = (m: Mahasiswa) => {
        setEditingId(m.id);
        editForm.setData({
            nama: m.nama,
            nim: m.nim,
            fakultas: m.fakultas || '',
            kelas: m.kelas || '',
            semester: m.semester || 1,
        });
        setShowEditForm(true);
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.patch(`/admin/mahasiswa/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setShowEditForm(false);
            },
        });
    };

    const trendData = registrationTrend.labels.map((label, i) => ({
        name: label,
        total: registrationTrend.values[i],
    }));

    const formatLabel = (label: string) =>
        label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&amp;/g, '&').replace(/<[^>]*>/g, '');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 12 }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1, x: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1, x: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
        { label: 'Total Mahasiswa', value: stats.total, icon: Users, gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
        { label: 'Aktif Bulan Ini', value: stats.active_this_month, icon: UserCheck, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
        { label: 'Total Kehadiran', value: stats.avg_attendance, icon: TrendingUp, gradient: 'from-purple-500 to-fuchsia-600', glow: 'shadow-purple-500/20' },
        { label: 'Fakultas', value: Object.keys(stats.by_fakultas).length, icon: GraduationCap, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
    ];

    return (
        <AppLayout>
            <Head title="Mahasiswa" />

            <motion.div
                className="p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HEADER — Matching Zona Style ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
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
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating graduation pulses */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        <GraduationCap className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm text-indigo-100 font-medium">Manajemen</p>
                                        <h1 className="text-3xl font-bold">Data Mahasiswa</h1>
                                    </div>
                                </div>
                                <p className="mt-4 text-indigo-100 max-w-xl">
                                    Kelola data mahasiswa, pantau kehadiran, dan analisis performa akademik secara real-time
                                </p>
                            </div>

                            {/* Quick info badges */}
                            <div className="flex flex-col items-end gap-2">
                                <motion.div
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Users className="h-4 w-4 text-indigo-200" />
                                    <span className="text-sm font-medium">{stats.total} Mahasiswa</span>
                                </motion.div>
                                <motion.div
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <UserCheck className="h-4 w-4 text-indigo-200" />
                                    <span className="text-sm font-medium">{stats.active_this_month} Aktif Bulan Ini</span>
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
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`rounded-2xl p-4 border backdrop-blur-xl ${flash?.success
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-300 border-red-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${flash?.success ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                    {flash?.success ? <UserCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                </div>
                                <p className="text-sm font-medium">{flash?.success || flash?.error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ STATS CARDS ═══════ */}
                <motion.div className="grid gap-4 md:grid-cols-4" variants={containerVariants}>
                    {statsConfig.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            className={`relative overflow-hidden rounded-2xl bg-black border border-slate-800/50 p-5 shadow-lg ${stat.glow} group cursor-default`}
                            whileHover={{ scale: 1.03, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            {/* Gradient accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                            <div className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-b ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

                            <div className="relative flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                                    <motion.p
                                        className="text-2xl font-bold text-white"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.1 }}
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
                    className="rounded-2xl bg-black border border-slate-800/50 p-6 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Filter className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="font-bold text-white">Filter & Pencarian</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-6">
                        <div className="md:col-span-2">
                            <Label className="mb-2 block text-xs text-slate-400 uppercase tracking-wider">Cari</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    placeholder="Nama atau NIM..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleFilter()}
                                    className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs text-slate-400 uppercase tracking-wider">Fakultas</Label>
                            <select
                                value={fakultas}
                                onChange={e => setFakultas(e.target.value)}
                                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            >
                                <option value="all">Semua</option>
                                {fakultasList.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs text-slate-400 uppercase tracking-wider">Kelas</Label>
                            <select
                                value={kelas}
                                onChange={e => setKelas(e.target.value)}
                                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            >
                                <option value="all">Semua</option>
                                {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <motion.button
                                onClick={handleFilter}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </motion.button>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <motion.button
                            onClick={() => setShowAddForm(true)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Mahasiswa
                        </motion.button>
                        <motion.a
                            href="/mahasiswa/export.csv"
                            className="px-5 py-2.5 rounded-xl border border-slate-700/50 bg-slate-900/50 text-slate-300 font-medium text-sm flex items-center gap-2 hover:bg-slate-800 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </motion.a>
                        <motion.button
                            onClick={handleExportPdf}
                            className="px-5 py-2.5 rounded-xl border border-slate-700/50 bg-slate-900/50 text-slate-300 font-medium text-sm flex items-center gap-2 hover:bg-slate-800 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                            onClick={() => setShowAddForm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                                className="w-full max-w-lg rounded-2xl bg-black border border-slate-700/50 shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Plus className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Tambah Mahasiswa</h2>
                                                <p className="text-sm text-emerald-100">Masukkan data mahasiswa baru</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => setShowAddForm(false)}
                                            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={submitAdd} className="p-6 space-y-5">
                                    {/* Nama */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                            <User className="h-3.5 w-3.5" />
                                            Nama Lengkap <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            value={addForm.data.nama}
                                            onChange={e => addForm.setData('nama', e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                        />
                                        <InputError message={addForm.errors.nama} />
                                    </motion.div>

                                    {/* NIM */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                            <Hash className="h-3.5 w-3.5" />
                                            NIM <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            value={addForm.data.nim}
                                            onChange={e => addForm.setData('nim', e.target.value)}
                                            placeholder="Masukkan NIM"
                                            className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                                        />
                                        <InputError message={addForm.errors.nim} />
                                        <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <Shield className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                                            <p className="text-xs text-amber-300">Password default: <span className="font-mono font-bold">tplk004#</span> + 2 digit terakhir NIM</p>
                                        </div>
                                    </motion.div>

                                    {/* Fakultas & Kelas */}
                                    <motion.div
                                        className="grid grid-cols-2 gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div>
                                            <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Fakultas
                                            </label>
                                            <input
                                                value={addForm.data.fakultas}
                                                onChange={e => addForm.setData('fakultas', e.target.value)}
                                                placeholder="Fakultas"
                                                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Kelas
                                            </label>
                                            <input
                                                value={addForm.data.kelas}
                                                onChange={e => addForm.setData('kelas', e.target.value)}
                                                placeholder="Kelas"
                                                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Semester */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Semester
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={14}
                                            value={addForm.data.semester}
                                            onChange={e => addForm.setData('semester', Number(e.target.value))}
                                            className="w-full max-w-[120px] rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        />
                                    </motion.div>

                                    {/* Actions */}
                                    <motion.div
                                        className="flex gap-3 pt-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <motion.button
                                            type="submit"
                                            disabled={addForm.processing}
                                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Save className="h-4 w-4" />
                                            {addForm.processing ? 'Menyimpan...' : 'Simpan Data'}
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Batal
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ EDIT FORM MODAL ═══════ */}
                <AnimatePresence>
                    {showEditForm && editingId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                            onClick={() => { setShowEditForm(false); setEditingId(null); }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                                className="w-full max-w-lg rounded-2xl bg-black border border-slate-700/50 shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Edit className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Edit Mahasiswa</h2>
                                                <p className="text-sm text-indigo-100">Perbarui informasi mahasiswa</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={() => { setShowEditForm(false); setEditingId(null); }}
                                            className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={submitEdit} className="p-6 space-y-5">
                                    {/* Preview Card */}
                                    <motion.div
                                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${getInitialColor(editForm.data.nama || 'A')} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                            {getInitials(editForm.data.nama || 'A')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{editForm.data.nama || 'Nama Mahasiswa'}</p>
                                            <p className="text-sm text-slate-400">{editForm.data.nim || 'NIM'} • Semester {editForm.data.semester}</p>
                                        </div>
                                    </motion.div>

                                    {/* Nama */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                            <User className="h-3.5 w-3.5" />
                                            Nama Lengkap <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            value={editForm.data.nama}
                                            onChange={e => editForm.setData('nama', e.target.value)}
                                            placeholder="Nama lengkap"
                                            className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        />
                                        <InputError message={editForm.errors.nama} />
                                    </motion.div>

                                    {/* NIM */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                            <Hash className="h-3.5 w-3.5" />
                                            NIM <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            value={editForm.data.nim}
                                            onChange={e => editForm.setData('nim', e.target.value)}
                                            placeholder="NIM"
                                            className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        />
                                        <InputError message={editForm.errors.nim} />
                                    </motion.div>

                                    {/* Fakultas & Kelas */}
                                    <motion.div
                                        className="grid grid-cols-2 gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <div>
                                            <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Fakultas
                                            </label>
                                            <input
                                                value={editForm.data.fakultas}
                                                onChange={e => editForm.setData('fakultas', e.target.value)}
                                                placeholder="Fakultas"
                                                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Kelas
                                            </label>
                                            <input
                                                value={editForm.data.kelas}
                                                onChange={e => editForm.setData('kelas', e.target.value)}
                                                placeholder="Kelas"
                                                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Semester */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Semester
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={14}
                                            value={editForm.data.semester}
                                            onChange={e => editForm.setData('semester', Number(e.target.value))}
                                            className="w-full max-w-[120px] rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </motion.div>

                                    {/* Actions */}
                                    <motion.div
                                        className="flex gap-3 pt-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <motion.button
                                            type="submit"
                                            disabled={editForm.processing}
                                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Save className="h-4 w-4" />
                                            {editForm.processing ? 'Menyimpan...' : 'Perbarui Data'}
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            onClick={() => { setShowEditForm(false); setEditingId(null); }}
                                            className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Batal
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ MAIN CONTENT GRID ═══════ */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Student Table */}
                    <motion.div
                        variants={slideInLeft}
                        className="lg:col-span-2 rounded-2xl bg-black border border-slate-800/50 shadow-lg overflow-hidden"
                    >
                        <div className="p-5 border-b border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                    <h2 className="font-bold text-white">Daftar Mahasiswa</h2>
                                </div>
                                <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                                    {mahasiswa.from}-{mahasiswa.to} dari {mahasiswa.total}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800/50">
                                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mahasiswa</th>
                                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">NIM</th>
                                        <th className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kelas</th>
                                        <th className="px-5 py-3.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mahasiswa.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-16 text-center">
                                                <Users className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                                                <p className="text-slate-500 font-medium">Tidak ada data mahasiswa</p>
                                                <p className="text-xs text-slate-600 mt-1">Tambahkan mahasiswa baru untuk memulai</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        mahasiswa.data.map((m, index) => (
                                            <motion.tr
                                                key={m.id}
                                                className="border-b border-slate-800/30 hover:bg-slate-900/50 transition-colors group"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03, type: 'spring', stiffness: 100 }}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${getInitialColor(m.nama)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                                            {getInitials(m.nama)}
                                                        </div>
                                                        <p className="font-semibold text-white text-sm">{m.nama}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm text-slate-400 font-mono">{m.nim}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-sm text-slate-400">{m.kelas || '-'}</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <motion.button
                                                            onClick={() => startEdit(m)}
                                                            className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 flex items-center justify-center transition-colors"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => router.post(`/admin/mahasiswa/${m.id}/reset-password`, {}, { preserveScroll: true })}
                                                            className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 flex items-center justify-center transition-colors"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            title="Reset Password"
                                                        >
                                                            <KeyRound className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => router.delete(`/admin/mahasiswa/${m.id}`, { preserveScroll: true })}
                                                            className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
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
                            <div className="p-4 border-t border-slate-800/50 flex justify-center gap-2">
                                {mahasiswa.links.map((link, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${link.active
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                            : link.url
                                                ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                                : 'bg-slate-900/30 text-slate-600 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: formatLabel(link.label) }}
                                        whileHover={link.url ? { scale: 1.05 } : {}}
                                        whileTap={link.url ? { scale: 0.95 } : {}}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* ═══════ SIDEBAR ═══════ */}
                    <div className="space-y-6">
                        {/* Top Performers */}
                        <motion.div
                            variants={slideInRight}
                            className="rounded-2xl bg-black border border-slate-800/50 shadow-lg overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                        <Award className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <h2 className="font-bold text-white text-sm">Top Kehadiran</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {topPerformers.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">Tidak ada data</div>
                                ) : (
                                    topPerformers.map((s, i) => (
                                        <motion.div
                                            key={s.id}
                                            className="p-3 flex items-center gap-3 hover:bg-slate-900/50 transition-colors"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                                        >
                                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                                                    : i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                                                        : 'bg-slate-800 text-slate-400'
                                                }`}>{i + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{s.nama}</p>
                                                <p className="text-xs text-slate-500 font-mono">{s.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-400">{s.count}x</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Low Attendance */}
                        <motion.div
                            variants={slideInRight}
                            className="rounded-2xl bg-black border border-slate-800/50 shadow-lg overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                                        <AlertTriangle className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <h2 className="font-bold text-white text-sm">Kehadiran Rendah</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {lowAttendance.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">Tidak ada data</div>
                                ) : (
                                    lowAttendance.map((s, i) => (
                                        <motion.div
                                            key={s.id}
                                            className="p-3 flex items-center gap-3 hover:bg-slate-900/50 transition-colors"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{s.nama}</p>
                                                <p className="text-xs text-slate-500 font-mono">{s.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-400">{s.count}x</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Registration Trend */}
                        {trendData.length > 0 && (
                            <motion.div
                                variants={slideInRight}
                                className="rounded-2xl bg-black border border-slate-800/50 p-5 shadow-lg"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <TrendingUp className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <h2 className="font-bold text-white text-sm">Tren Aktivitas</h2>
                                </div>
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" />
                                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#000',
                                                    border: '1px solid rgba(51,65,85,0.5)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#818cf8" />
                                                    <stop offset="100%" stopColor="#6366f1" />
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
        </AppLayout>
    );
}
