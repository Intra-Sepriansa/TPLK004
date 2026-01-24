import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, Plus, Search, CheckCircle, TrendingUp, TrendingDown, Users, 
    Calendar, DollarSign, Receipt, Check, FileText, Download, Printer,
    ChevronDown, ChevronRight, X, Sparkles, ArrowUpRight, ArrowDownRight,
    Clock, Award, Target, Zap, TrendingUp as TrendUp
} from 'lucide-react';
import { useState } from 'react';
import { AnimatedCurrencyShimmer } from '@/components/ui/animated-currency';

interface MahasiswaKas {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    total_paid: number;
    total_unpaid: number;
    status: string;
    records: { id: number; amount: number; status: string; period_date: string; description: string }[];
}

interface Summary {
    total_balance: number;
    total_income: number;
    total_expense: number;
    period_income: number;
    period_expense: number;
    paid_count: number;
    unpaid_count: number;
}

interface Transaction {
    id: number;
    mahasiswa: string | null;
    type: string;
    amount: number;
    status: string;
    description: string;
    category: string;
    period_date: string;
    period_display: string;
    created_at: string;
}

interface LedgerItem {
    date: string;
    display_date: string;
    income: number;
    expense: number;
    balance: number;
    transactions: Transaction[];
}

interface PageProps {
    mahasiswaList: MahasiswaKas[];
    summary: Summary;
    ledger: LedgerItem[];
    pertemuanDates: string[];
    filters: { search: string; pertemuan: string; month: string };
    kasAmount: number;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

export default function AdminKas({ mahasiswaList, summary, ledger, pertemuanDates, filters, kasAmount }: PageProps) {
    const [activeTab, setActiveTab] = useState<'pembayaran' | 'buku-kas'>('pembayaran');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search);
    const [expandedDates, setExpandedDates] = useState<string[]>([]);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

    const expenseForm = useForm({
        amount: 0,
        description: '',
        category: 'pengeluaran',
        period_date: new Date().toISOString().split('T')[0],
    });

    const pertemuanForm = useForm({
        period_date: '',
    });

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/kas', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleMarkPaid = (mahasiswaId: number) => {
        if (filters.pertemuan === 'all') {
            alert('Silakan pilih pertemuan terlebih dahulu untuk menandai lunas');
            return;
        }
        router.post('/admin/kas/mark-paid', {
            mahasiswa_id: mahasiswaId,
            period_date: filters.pertemuan,
        });
    };

    const handleBulkMarkPaid = () => {
        if (selectedMahasiswa.length === 0) return;
        if (filters.pertemuan === 'all') {
            alert('Silakan pilih pertemuan terlebih dahulu untuk menandai lunas');
            return;
        }
        router.post('/admin/kas/bulk-mark-paid', {
            mahasiswa_ids: selectedMahasiswa,
            period_date: filters.pertemuan,
        }, {
            onSuccess: () => setSelectedMahasiswa([]),
        });
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        expenseForm.post('/admin/kas/expense', {
            onSuccess: () => {
                setShowExpenseModal(false);
                expenseForm.reset();
            },
        });
    };

    const handleCreatePertemuan = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/kas/create-pertemuan', {
            period_date: pertemuanForm.data.period_date,
        }, {
            onSuccess: () => {
                setShowPertemuanModal(false);
                pertemuanForm.reset();
            },
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedMahasiswa(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const unpaidIds = mahasiswaList.filter(m => m.status !== 'paid').map(m => m.id);
        setSelectedMahasiswa(prev => prev.length === unpaidIds.length ? [] : unpaidIds);
    };

    const selectAllUnpaid = () => {
        const unpaidIds = mahasiswaList.filter(m => m.status !== 'paid').map(m => m.id);
        setSelectedMahasiswa(unpaidIds);
    };

    const markAllUnpaidAsLunas = () => {
        if (filters.pertemuan === 'all') {
            alert('Silakan pilih pertemuan terlebih dahulu untuk menandai lunas');
            return;
        }
        const unpaidIds = mahasiswaList.filter(m => m.status !== 'paid').map(m => m.id);
        if (unpaidIds.length === 0) {
            alert('Tidak ada mahasiswa yang belum bayar');
            return;
        }
        if (confirm(`Tandai ${unpaidIds.length} mahasiswa yang belum bayar sebagai lunas?`)) {
            router.post('/admin/kas/bulk-mark-paid', {
                mahasiswa_ids: unpaidIds,
                period_date: filters.pertemuan,
            });
        }
    };

    const filteredMahasiswaList = mahasiswaList.filter(m => {
        if (statusFilter === 'paid') return m.status === 'paid';
        if (statusFilter === 'unpaid') return m.status !== 'paid';
        return true;
    });

    const toggleExpand = (date: string) => {
        setExpandedDates(prev => 
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const exportPdf = (type: 'pertemuan' | 'bulanan' | 'keseluruhan' | 'matrix') => {
        let url = '/admin/kas/pdf?type=';
        if (type === 'pertemuan' && filters.pertemuan !== 'all') {
            url += `pertemuan&date=${filters.pertemuan}`;
        } else if (type === 'bulanan') {
            url += `keseluruhan&month=${filters.month}`;
        } else if (type === 'matrix') {
            url += `matrix&month=${filters.month}`;
        } else {
            url += 'keseluruhan';
        }
        window.open(url, '_blank');
        setShowExportModal(false);
    };

    const paymentRate = summary.paid_count + summary.unpaid_count > 0 
        ? (summary.paid_count / (summary.paid_count + summary.unpaid_count)) * 100 
        : 0;

    return (
        <AppLayout>
            <Head title="Uang Kas" />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Animated Header with Particles */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Circles */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
                    />

                    {/* Floating Sparkles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -30, 0],
                                x: [0, Math.random() * 20 - 10, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.5,
                            }}
                            className="absolute"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + Math.random() * 40}%`,
                            }}
                        >
                            <Sparkles className="h-4 w-4 text-white/60" />
                        </motion.div>
                    ))}

                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg"
                                >
                                    <Wallet className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm text-gray-300"
                                    >
                                        Manajemen Keuangan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-3xl font-bold"
                                    >
                                        Uang Kas Kelas
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-sm text-gray-300 mt-1"
                                    >
                                        Kas mingguan: {formatCurrency(kasAmount)} / mahasiswa
                                    </motion.p>
                                </div>
                            </div>

                            {/* Payment Rate Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg"
                            >
                                <Award className="h-6 w-6" />
                                <div>
                                    <p className="text-xs text-gray-300">Tingkat Pembayaran</p>
                                    <p className="text-2xl font-bold">{paymentRate.toFixed(0)}%</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-wrap gap-2 mt-6"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPertemuanModal(true)}
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur"
                            >
                                <Calendar className="h-4 w-4" />Buat Pertemuan
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowExpenseModal(true)}
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur"
                            >
                                <Plus className="h-4 w-4" />Catat Pengeluaran
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowExportModal(true)}
                                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                                <Download className="h-4 w-4" />Export PDF
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Summary Cards - Animated */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-4 md:grid-cols-4"
                >
                    {/* Balance Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('balance')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-lg backdrop-blur dark:border-emerald-800/70 dark:from-emerald-950/50 dark:to-teal-950/50"
                    >

                        <motion.div
                            animate={{
                                scale: hoveredCard === 'balance' ? 1.5 : 1,
                                opacity: hoveredCard === 'balance' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                            >
                                <DollarSign className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">Saldo Aktif</p>
                                <div className="mt-1">
                                    <AnimatedCurrencyShimmer
                                        value={summary.total_balance}
                                        duration={2.5}
                                        className="text-xl"
                                        gradient="from-emerald-600 via-teal-500 to-cyan-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Income Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('income')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-lg backdrop-blur dark:border-blue-800/70 dark:from-blue-950/50 dark:to-cyan-950/50"
                    >
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'income' ? 1.5 : 1,
                                opacity: hoveredCard === 'income' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                            >
                                <TrendingUp className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Total Uang Masuk</p>
                                <div className="mt-1">
                                    <AnimatedCurrencyShimmer
                                        value={summary.total_income}
                                        duration={2.5}
                                        className="text-xl"
                                        gradient="from-blue-600 via-cyan-500 to-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Expense Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('expense')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-red-200/70 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-lg backdrop-blur dark:border-red-800/70 dark:from-red-950/50 dark:to-orange-950/50"
                    >
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'expense' ? 1.5 : 1,
                                opacity: hoveredCard === 'expense' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/50"
                            >
                                <TrendingDown className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-red-700 dark:text-red-300">Total Uang Keluar</p>
                                <div className="mt-1">
                                    <AnimatedCurrencyShimmer
                                        value={summary.total_expense}
                                        duration={2.5}
                                        className="text-xl"
                                        gradient="from-red-600 via-orange-500 to-rose-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('status')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-lg backdrop-blur dark:border-amber-800/70 dark:from-amber-950/50 dark:to-yellow-950/50"
                    >
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'status' ? 1.5 : 1,
                                opacity: hoveredCard === 'status' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                            >
                                <Users className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Status Pembayaran</p>
                                <p className="text-sm mt-1">
                                    <span className="text-emerald-600 font-bold">
                                        {summary.paid_count}
                                    </span> lunas • <span className="text-red-600 font-bold">{summary.unpaid_count}</span> belum
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    variants={itemVariants}
                    className="flex gap-2 border-b border-slate-200 dark:border-slate-800"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('pembayaran')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'pembayaran' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="h-4 w-4 inline mr-2" />Pembayaran Mahasiswa
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('buku-kas')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'buku-kas' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText className="h-4 w-4 inline mr-2" />Buku Kas
                    </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'pembayaran' && (
                        <motion.div
                            key="pembayaran"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Filters */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/80 space-y-4"
                            >
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFilter('search', search)} placeholder="Cari mahasiswa..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-black dark:text-white" />
                                        </div>
                                    </div>
                                    <select value={filters.pertemuan} onChange={e => handleFilter('pertemuan', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black dark:text-white">
                                        <option value="all">Semua Pertemuan</option>
                                        {pertemuanDates.map(date => (
                                            <option key={date} value={date}>{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</option>
                                        ))}
                                    </select>
                                    <input type="month" value={filters.month} onChange={e => handleFilter('month', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black dark:text-white" />
                                </div>

                                {/* Status Filter Buttons */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter Status:</span>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setStatusFilter('all')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                statusFilter === 'all'
                                                    ? 'bg-slate-600 text-white shadow-lg'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            Semua ({mahasiswaList.length})
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setStatusFilter('unpaid')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                statusFilter === 'unpaid'
                                                    ? 'bg-red-600 text-white shadow-lg'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                        >
                                            Belum Bayar ({mahasiswaList.filter(m => m.status !== 'paid').length})
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setStatusFilter('paid')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                statusFilter === 'paid'
                                                    ? 'bg-emerald-600 text-white shadow-lg'
                                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}
                                        >
                                            Sudah Lunas ({mahasiswaList.filter(m => m.status === 'paid').length})
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                    {filters.pertemuan !== 'all' && mahasiswaList.filter(m => m.status !== 'paid').length > 0 && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={markAllUnpaidAsLunas}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Tandai Semua Belum Bayar Sebagai Lunas ({mahasiswaList.filter(m => m.status !== 'paid').length})
                                        </motion.button>
                                    )}
                                    {selectedMahasiswa.length > 0 && filters.pertemuan !== 'all' && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleBulkMarkPaid}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                                        >
                                            <Check className="h-4 w-4" />Tandai {selectedMahasiswa.length} Terpilih Lunas
                                        </motion.button>
                                    )}
                                    {filters.pertemuan !== 'all' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={selectAllUnpaid}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            <Users className="h-4 w-4" />Pilih Semua Belum Bayar
                                        </motion.button>
                                    )}
                                </div>
                                {filters.pertemuan === 'all' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                                    >
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            <strong>Info:</strong> Pilih pertemuan terlebih dahulu untuk menandai pembayaran lunas.
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Mahasiswa List */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/80 overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-black/50">
                                                <th className="px-4 py-3 text-left">
                                                    <input type="checkbox" onChange={selectAll} checked={selectedMahasiswa.length > 0 && selectedMahasiswa.length === mahasiswaList.filter(m => m.status !== 'paid').length} className="rounded border-slate-300" />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mahasiswa</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Kelas</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Sudah Bayar</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Belum Bayar</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">

                                            {filteredMahasiswaList.map((m, index) => (
                                                <motion.tr
                                                    key={m.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                                    className="cursor-pointer"
                                                >
                                                    <td className="px-4 py-3">
                                                        {m.status !== 'paid' && (
                                                            <input type="checkbox" checked={selectedMahasiswa.includes(m.id)} onChange={() => toggleSelect(m.id)} className="rounded border-slate-300" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-900 dark:text-white">{m.nama}</p>
                                                        <p className="text-xs text-slate-500">{m.nim}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{m.kelas || '-'}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">{formatCurrency(m.total_paid)}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-red-600">{formatCurrency(m.total_unpaid)}</td>
                                                    <td className="px-4 py-3">
                                                        <motion.span
                                                            whileHover={{ scale: 1.1 }}
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : m.status === 'unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-600'}`}
                                                        >
                                                            {m.status === 'paid' ? 'Lunas' : m.status === 'unpaid' ? 'Belum Bayar' : 'Belum Ada'}
                                                        </motion.span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {m.status !== 'paid' && filters.pertemuan !== 'all' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleMarkPaid(m.id)}
                                                                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600"
                                                                    title="Tandai Lunas"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </motion.button>
                                                            )}
                                                            {m.status !== 'paid' && filters.pertemuan === 'all' && (
                                                                <span className="text-xs text-slate-400" title="Pilih pertemuan untuk menandai lunas">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'buku-kas' && (
                        <motion.div
                            key="buku-kas"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/80 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-emerald-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Buku Kas - Rekap Per Pertemuan</h2>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Klik baris untuk melihat detail transaksi</p>
                            </div>
                            
                            {/* Ledger Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-black/50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase w-8"></th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tanggal Pertemuan</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Uang Masuk</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Uang Keluar</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {ledger.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                    >
                                                        <Receipt className="h-16 w-16 mx-auto text-slate-300 mb-2" />
                                                        Belum ada transaksi
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        ) : ledger.map((item, index) => (
                                            <>
                                                <motion.tr
                                                    key={item.date}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleExpand(item.date)}
                                                >

                                                    <td className="px-4 py-3">
                                                        <motion.div
                                                            animate={{ rotate: expandedDates.includes(item.date) ? 90 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                                        </motion.div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-900 dark:text-white">{item.display_date}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-emerald-600">+{formatCurrency(item.income)}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-red-600">-{formatCurrency(item.expense)}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(item.balance)}</td>
                                                </motion.tr>
                                                <AnimatePresence>
                                                    {expandedDates.includes(item.date) && (
                                                        <motion.tr
                                                            key={`${item.date}-detail`}
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <td colSpan={5} className="bg-slate-50 dark:bg-black/50 px-4 py-3">
                                                                <div className="space-y-2">
                                                                    {item.transactions.map((t, tIndex) => (
                                                                        <motion.div
                                                                            key={t.id}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: tIndex * 0.05 }}
                                                                            whileHover={{ scale: 1.02, x: 5 }}
                                                                            className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-800 rounded-lg"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <motion.span
                                                                                    whileHover={{ scale: 1.1 }}
                                                                                    className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                                                                                >
                                                                                    {t.type === 'income' ? 'Masuk' : 'Keluar'}
                                                                                </motion.span>
                                                                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                                                                    {t.type === 'income' && t.mahasiswa ? t.mahasiswa : t.description}
                                                                                </span>
                                                                            </div>
                                                                            <span className={`font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                                            </span>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        ))}
                                    </tbody>

                                    {ledger.length > 0 && (
                                        <tfoot>
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold"
                                            >
                                                <td colSpan={2} className="px-4 py-3">TOTAL</td>
                                                <td className="px-4 py-3 text-right">+{formatCurrency(summary.total_income)}</td>
                                                <td className="px-4 py-3 text-right">-{formatCurrency(summary.total_expense)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(summary.total_balance)}</td>
                                            </motion.tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Pertemuan Modal */}
                <AnimatePresence>
                    {showPertemuanModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowPertemuanModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Buat Pertemuan Baru</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowPertemuanModal(false)}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <X className="h-5 w-5 text-slate-500" />
                                    </motion.button>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Buat tagihan kas untuk semua mahasiswa pada tanggal pertemuan tertentu (biasanya hari Kamis).</p>
                                <form onSubmit={handleCreatePertemuan} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Pertemuan</label>
                                        <input type="date" value={pertemuanForm.data.period_date} onChange={e => pertemuanForm.setData('period_date', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
                                    >
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            <strong>Info:</strong> Setiap mahasiswa akan ditagih {formatCurrency(kasAmount)} untuk pertemuan ini.
                                        </p>
                                    </motion.div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => setShowPertemuanModal(false)}
                                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            Batal
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            disabled={pertemuanForm.processing}
                                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium disabled:opacity-50"
                                        >
                                            Buat Pertemuan
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expense Modal */}
                <AnimatePresence>
                    {showExpenseModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowExpenseModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Catat Pengeluaran</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowExpenseModal(false)}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <X className="h-5 w-5 text-slate-500" />
                                    </motion.button>
                                </div>

                                <form onSubmit={handleAddExpense} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah (Rp)</label>
                                        <input type="number" value={expenseForm.data.amount || ''} onChange={e => expenseForm.setData('amount', parseInt(e.target.value) || 0)} placeholder="50000" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required min={1} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan</label>
                                        <input type="text" value={expenseForm.data.description} onChange={e => expenseForm.setData('description', e.target.value)} placeholder="Contoh: Beli spidol, Cetak dokumen" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                        <select value={expenseForm.data.category} onChange={e => expenseForm.setData('category', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                            <option value="pengeluaran">Pengeluaran Umum</option>
                                            <option value="kegiatan">Kegiatan Kelas</option>
                                            <option value="perlengkapan">Perlengkapan</option>
                                            <option value="lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                                        <input type="date" value={expenseForm.data.period_date} onChange={e => expenseForm.setData('period_date', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => setShowExpenseModal(false)}
                                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            Batal
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            disabled={expenseForm.processing}
                                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium disabled:opacity-50"
                                        >
                                            Simpan
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Export Modal */}
                <AnimatePresence>
                    {showExportModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowExportModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Export Laporan PDF</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowExportModal(false)}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <X className="h-5 w-5 text-slate-500" />
                                    </motion.button>
                                </div>
                                <div className="space-y-3">
                                    {filters.pertemuan !== 'all' && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => exportPdf('pertemuan')}
                                            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">Laporan Per Pertemuan</p>
                                                <p className="text-xs text-slate-500">Export transaksi untuk pertemuan yang dipilih</p>
                                            </div>
                                        </motion.button>
                                    )}
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => exportPdf('bulanan')}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                                    >

                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Laporan Bulanan</p>
                                            <p className="text-xs text-slate-500">Export semua transaksi bulan {new Date(filters.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => exportPdf('keseluruhan')}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                            <Printer className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Laporan Keseluruhan</p>
                                            <p className="text-xs text-slate-500">Export semua transaksi dari awal sampai sekarang</p>
                                        </div>
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => exportPdf('matrix')}
                                        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors text-left"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-700 dark:text-blue-300">📊 Laporan Matrix (Excel-style)</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">Tabel pembayaran per mahasiswa dengan ✓ dan ✗</p>
                                        </div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
}
