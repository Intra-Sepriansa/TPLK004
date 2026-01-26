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
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.patch(`/admin/mahasiswa/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
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
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12
            }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Mahasiswa" />

            <motion.div 
                className="p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg"
                >
                    <motion.div 
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <GraduationCap className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-sm text-blue-100">Manajemen</p>
                                <h1 className="text-2xl font-bold">Data Mahasiswa</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Kelola data mahasiswa, pantau kehadiran, dan analisis performa
                        </p>
                    </div>
                </motion.div>

                {/* Flash Messages */}
                <AnimatePresence>
                    {(flash?.success || flash?.error) && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`rounded-xl p-4 ${flash.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                        >
                            {flash.success || flash.error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <motion.div 
                        variants={itemVariants}
                        className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                        whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Users className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-500">Total Mahasiswa</p>
                                <motion.p 
                                    className="text-xl font-bold text-slate-900 dark:text-white"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    {stats.total}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div 
                        variants={itemVariants}
                        className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                        whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <UserCheck className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-500">Aktif Bulan Ini</p>
                                <motion.p 
                                    className="text-xl font-bold text-emerald-600"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    {stats.active_this_month}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div 
                        variants={itemVariants}
                        className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                        whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TrendingUp className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-500">Total Kehadiran</p>
                                <motion.p 
                                    className="text-xl font-bold text-purple-600"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    {stats.avg_attendance}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div 
                        variants={itemVariants}
                        className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                        whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600"
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <GraduationCap className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-500">Fakultas</p>
                                <motion.p 
                                    className="text-xl font-bold text-amber-600"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    {Object.keys(stats.by_fakultas).length}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filter & Actions */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                    whileHover={{ scale: 1.005, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter & Pencarian</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-6">
                        <div className="md:col-span-2">
                            <Label className="mb-2 block text-sm">Cari</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Nama atau NIM..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Fakultas</Label>
                            <select
                                value={fakultas}
                                onChange={e => setFakultas(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black"
                            >
                                <option value="all">Semua</option>
                                {fakultasList.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Kelas</Label>
                            <select
                                value={kelas}
                                onChange={e => setKelas(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black"
                            >
                                <option value="all">Semua</option>
                                {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter} className="flex-1">
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4" />
                                Tambah Mahasiswa
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" asChild>
                                <a href="/mahasiswa/export.csv">
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </a>
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button onClick={handleExportPdf} className="bg-gradient-to-r from-gray-900 to-black">
                                <Download className="h-4 w-4" />
                                Export PDF
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>


                {/* Add Form Modal */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowAddForm(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                exit={{ scale: 0.9, opacity: 0, rotateY: 15 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black"
                                onClick={(e) => e.stopPropagation()}
                            >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Tambah Mahasiswa</h3>
                                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <form onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <Label>Nama</Label>
                                    <Input value={addForm.data.nama} onChange={e => addForm.setData('nama', e.target.value)} />
                                    <InputError message={addForm.errors.nama} />
                                </div>
                                <div>
                                    <Label>NIM</Label>
                                    <Input value={addForm.data.nim} onChange={e => addForm.setData('nim', e.target.value)} />
                                    <InputError message={addForm.errors.nim} />
                                    <p className="text-xs text-slate-500 mt-1">Password default: tplk004# + 2 digit terakhir NIM</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Fakultas</Label>
                                        <Input value={addForm.data.fakultas} onChange={e => addForm.setData('fakultas', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Kelas</Label>
                                        <Input value={addForm.data.kelas} onChange={e => addForm.setData('kelas', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Semester</Label>
                                        <Input type="number" min={1} max={14} value={addForm.data.semester} onChange={e => addForm.setData('semester', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button type="submit" disabled={addForm.processing} className="w-full">
                                            <Plus className="h-4 w-4" />
                                            Simpan
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Batal</Button>
                                    </motion.div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}</AnimatePresence>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Student Table */}
                    <motion.div 
                        variants={slideInLeft}
                        className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black overflow-hidden"
                        whileHover={{ scale: 1.005, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Mahasiswa</h2>
                                </div>
                                <span className="text-sm text-slate-500">
                                    {mahasiswa.from}-{mahasiswa.to} dari {mahasiswa.total}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-black/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">NIM</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kelas</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {mahasiswa.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center">
                                                <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                                <p className="text-slate-500">Tidak ada data mahasiswa</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        mahasiswa.data.map((m, index) => (
                                            <motion.tr 
                                                key={m.id} 
                                                className="hover:bg-slate-50 dark:hover:bg-black/30"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                                                whileHover={{ scale: 1.01, x: 4 }}
                                            >
                                                {editingId === m.id ? (
                                                    <td colSpan={4} className="p-4">
                                                        <form onSubmit={submitEdit} className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <Input placeholder="Nama" value={editForm.data.nama} onChange={e => editForm.setData('nama', e.target.value)} />
                                                                <Input placeholder="NIM" value={editForm.data.nim} onChange={e => editForm.setData('nim', e.target.value)} />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <Input placeholder="Fakultas" value={editForm.data.fakultas} onChange={e => editForm.setData('fakultas', e.target.value)} />
                                                                <Input placeholder="Kelas" value={editForm.data.kelas} onChange={e => editForm.setData('kelas', e.target.value)} />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button type="submit" size="sm" disabled={editForm.processing}>Simpan</Button>
                                                                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>Batal</Button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-slate-900 dark:text-white">{m.nama}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">{m.nim}</td>
                                                        <td className="px-4 py-3 text-slate-600">{m.kelas || '-'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button size="icon" variant="ghost" onClick={() => startEdit(m)} title="Edit">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" onClick={() => router.post(`/admin/mahasiswa/${m.id}/reset-password`, {}, { preserveScroll: true })} title="Reset Password">
                                                                    <KeyRound className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="text-red-600" onClick={() => router.delete(`/admin/mahasiswa/${m.id}`, { preserveScroll: true })} title="Hapus">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {mahasiswa.last_page > 1 && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                                {mahasiswa.links.map((link, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded text-sm ${
                                            link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: formatLabel(link.label) }}
                                        whileHover={link.url ? { scale: 1.05 } : {}}
                                        whileTap={link.url ? { scale: 0.95 } : {}}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Top Performers */}
                        <motion.div 
                            variants={slideInRight}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black overflow-hidden"
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Top Kehadiran</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {topPerformers.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                                ) : (
                                    topPerformers.map((s, i) => (
                                        <motion.div 
                                            key={s.id} 
                                            className="p-3 flex items-center gap-3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                        >
                                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>{i + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.nama}</p>
                                                <p className="text-xs text-slate-500">{s.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600">{s.count}x</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Low Attendance */}
                        <motion.div 
                            variants={slideInRight}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black overflow-hidden"
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Rendah</h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {lowAttendance.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                                ) : (
                                    lowAttendance.map((s, i) => (
                                        <motion.div 
                                            key={s.id} 
                                            className="p-3 flex items-center gap-3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.nama}</p>
                                                <p className="text-xs text-slate-500">{s.nim}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-600">{s.count}x</span>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Registration Trend */}
                        {trendData.length > 0 && (
                            <motion.div 
                                variants={slideInRight}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                                whileHover={{ scale: 1.02, y: -4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Tren Aktivitas</h2>
                                </div>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                            <Tooltip />
                                            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
