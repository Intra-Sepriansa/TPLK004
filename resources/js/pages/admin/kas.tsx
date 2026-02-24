import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, CheckCircle, TrendingDown, Users,
    Calendar, Receipt, Check, FileText, Download, Printer,
    ChevronDown, ChevronRight, X, Sparkles, ArrowUpRight, ArrowDownRight,
    Clock, Award, Target, Zap, TrendingUp as TrendUp
} from 'lucide-react';
import { useState } from 'react';
import KasIcon from '@/assets/admin/kas/kas.png';
import SaldoAktifIcon from '@/assets/admin/kas/saldo-aktif.png';
import PemasukanIcon from '@/assets/admin/kas/pemasukan.png';
import PengeluaranIcon from '@/assets/admin/kas/pengeluaran.png';
import StatusIcon from '@/assets/admin/kas/status.png';


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

// Animation variants matching Dashboard
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        }
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
        scale: 1.04,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
} as const;

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


    // Matrix view helpers
    const monthDates = pertemuanDates.filter(date => date.startsWith(filters.month)).sort();

    const getPaymentStatus = (student: MahasiswaKas, date: string): string | null => {
        const record = student.records.find(r => r.period_date === date);
        return record?.status || null;
    };

    const handleMarkPaidForDate = (mahasiswaId: number, periodDate: string) => {
        router.post('/admin/kas/mark-paid', {
            mahasiswa_id: mahasiswaId,
            period_date: periodDate,
        });
    };

    const handleBulkMarkPaidForDate = (periodDate: string) => {
        const unpaidIds = mahasiswaList.filter(m => {
            const status = getPaymentStatus(m, periodDate);
            return status === 'unpaid';
        }).map(m => m.id);
        if (unpaidIds.length === 0) return;
        if (confirm(`Tandai ${unpaidIds.length} mahasiswa lunas untuk tanggal ini?`)) {
            router.post('/admin/kas/bulk-mark-paid', {
                mahasiswa_ids: unpaidIds,
                period_date: periodDate,
            });
        }
    };

    const getColumnStats = (date: string) => {
        let paid = 0, unpaid = 0;
        mahasiswaList.forEach(m => {
            const status = getPaymentStatus(m, date);
            if (status === 'paid') paid++;
            else if (status === 'unpaid') unpaid++;
        });
        return { paid, unpaid, total: mahasiswaList.length };
    };

    const getStudentMonthStats = (student: MahasiswaKas) => {
        let paid = 0;
        monthDates.forEach(date => {
            if (getPaymentStatus(student, date) === 'paid') paid++;
        });
        return { paid, total: monthDates.length, percentage: monthDates.length > 0 ? Math.round((paid / monthDates.length) * 100) : 0 };
    };

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return {
            day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        };
    };

    return (
        <AppLayout>
            <Head title="Uang Kas" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* ═══════ HEADER — Matching Perangkat Style ═══════ */}
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

                    {/* Floating Animations (Pulses) */}
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
                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center p-1"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={KasIcon}
                                        alt="Kas"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Keuangan
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Uang Kas Kelas
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kas mingguan: {formatCurrency(kasAmount)} / mahasiswa
                                    </motion.p>
                                </div>
                            </div>

                            {/* Payment Rate Badge - Responsive */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 sm:px-6 py-3 shadow-lg border border-white/10 w-full sm:w-auto"
                            >
                                <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-100">Tingkat Pembayaran</p>
                                    <p className="text-xl sm:text-2xl font-bold text-white">{paymentRate.toFixed(0)}%</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-wrap sm:flex-nowrap gap-3 mt-8 pt-6 border-t border-white/10"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPertemuanModal(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
                            >
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span className="truncate">Buat Pertemuan</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowExpenseModal(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
                            >
                                <TrendingDown className="h-4 w-4 shrink-0" />
                                <span className="truncate">Catat Pengeluaran</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowExportModal(true)}
                                className="flex-[1_1_100%] sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
                            >
                                <Download className="h-4 w-4 shrink-0" />
                                <span className="truncate">Export Laporan</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Summary Cards - Advanced Glassmorphism */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-4"
                >
                    {/* Balance Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('balance')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'balance' ? 1.5 : 1,
                                opacity: hoveredCard === 'balance' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center"
                            >
                                <img
                                    src={SaldoAktifIcon}
                                    alt="Saldo Aktif"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Saldo Aktif</p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {formatCurrency(summary.total_balance)}
                                    </span>
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-violet-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'income' ? 1.5 : 1,
                                opacity: hoveredCard === 'income' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center"
                            >
                                <img
                                    src={PemasukanIcon}
                                    alt="Total Masuk"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Masuk</p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {formatCurrency(summary.total_income)}
                                    </span>
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-red-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'expense' ? 1.5 : 1,
                                opacity: hoveredCard === 'expense' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center"
                            >
                                <img
                                    src={PengeluaranIcon}
                                    alt="Total Keluar"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Keluar</p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {formatCurrency(summary.total_expense)}
                                    </span>
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-amber-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'status' ? 1.5 : 1,
                                opacity: hoveredCard === 'status' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center"
                            >
                                <img
                                    src={StatusIcon}
                                    alt="Status Pembayaran"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Status Pembayaran</p>
                                <p className="text-sm mt-1">
                                    <span className="text-emerald-600 font-bold text-lg">
                                        {summary.paid_count}
                                    </span> <span className="text-neutral-400 text-xs">Lunas</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Navigation Tabs - Modern Pills */}
                <motion.div
                    variants={itemVariants}
                    className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10"
                >
                    <motion.button
                        layout
                        onClick={() => setActiveTab('pembayaran')}
                        className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'pembayaran'
                            ? 'text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                            }`}
                    >
                        {activeTab === 'pembayaran' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Pembayaran Mahasiswa
                        </span>
                    </motion.button>

                    <motion.button
                        layout
                        onClick={() => setActiveTab('buku-kas')}
                        className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'buku-kas'
                            ? 'text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                            }`}
                    >
                        {activeTab === 'buku-kas' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Buku Kas
                        </span>
                    </motion.button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {
                        activeTab === 'pembayaran' && (
                            <motion.div
                                key="pembayaran"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {/* Compact Filters - Modern Glass */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50 space-y-4"
                                >
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 h-4 w-4 text-neutral-400" />
                                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFilter('search', search)} placeholder="Cari mahasiswa..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white" />
                                            </div>
                                        </div>
                                        <input type="month" value={filters.month} onChange={e => handleFilter('month', e.target.value)} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-black dark:text-white" />
                                    </div>
                                    {/* Month Summary */}
                                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-emerald-500" />
                                            <span className="font-semibold text-neutral-900 dark:text-white">
                                                {new Date(filters.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <span className="text-neutral-500">Pertemuan:</span>
                                            <span className="font-bold text-emerald-600">{monthDates.length}</span>
                                        </div>
                                        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <span className="text-neutral-500">Mahasiswa:</span>
                                            <span className="font-bold text-neutral-900 dark:text-white">{filteredMahasiswaList.length}</span>
                                        </div>
                                        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <span className="text-neutral-500">Lunas:</span>
                                            <span className="font-bold text-emerald-600">{summary.paid_count}</span>
                                            <span className="text-neutral-400">/</span>
                                            <span className="text-neutral-500">Belum:</span>
                                            <span className="font-bold text-red-500">{summary.unpaid_count}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Matrix Grid */}
                                {monthDates.length === 0 ? (
                                    <motion.div
                                        variants={itemVariants}
                                        className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/50 p-16 text-center dark:border-neutral-800 dark:bg-neutral-900/50"
                                    >
                                        <div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
                                            <Calendar className="h-10 w-10 text-neutral-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Belum ada pertemuan</h3>
                                        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                                            Mulai dengan membuat pertemuan baru untuk menagih uang kas kepada mahasiswa.
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowPertemuanModal(true)}
                                            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700"
                                        >
                                            + Buat Pertemuan Baru
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        variants={itemVariants}
                                        className="rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
                                    >
                                        {/* Legend */}
                                        <div className="p-3 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/50 flex flex-wrap items-center gap-4">
                                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Keterangan:</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-5 w-5 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-emerald-600" />
                                                </div>
                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">Lunas</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-5 w-5 rounded-md bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                                                    <X className="h-3 w-3 text-red-500" />
                                                </div>
                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">Belum Bayar <span className="text-emerald-600 font-medium">(klik = tandai lunas)</span></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-5 w-5 rounded-md bg-neutral-100 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700" />
                                                <span className="text-xs text-neutral-600 dark:text-neutral-400">Belum Ada Tagihan</span>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse min-w-max">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black">
                                                        <th className="sticky left-0 z-20 bg-neutral-50 dark:bg-neutral-950 px-3 py-3 text-left text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase w-10 border-r border-neutral-200 dark:border-neutral-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">No</th>
                                                        <th className="sticky left-[40px] z-20 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase min-w-[200px] border-r border-neutral-200 dark:border-neutral-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">Mahasiswa</th>
                                                        {monthDates.map(date => {
                                                            const { day, date: dateStr } = formatShortDate(date);
                                                            const stats = getColumnStats(date);
                                                            const allPaid = stats.unpaid === 0 && stats.paid > 0;
                                                            return (
                                                                <th key={date} className="px-1.5 py-2 text-center min-w-[72px] border-r border-neutral-200/50 dark:border-neutral-800/50">
                                                                    <div className="text-[10px] font-medium text-neutral-400 uppercase">{day}</div>
                                                                    <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">{dateStr}</div>
                                                                    <div className={`text-[10px] font-semibold mt-1 ${allPaid ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                                                        {stats.paid}/{stats.paid + stats.unpaid}
                                                                    </div>
                                                                    {stats.unpaid > 0 && (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.1 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                            onClick={() => handleBulkMarkPaidForDate(date)}
                                                                            className="mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 hover:border-emerald-500/40"
                                                                            title={`Tandai semua lunas (${stats.unpaid} tersisa)`}
                                                                        >
                                                                            ✓ All
                                                                        </motion.button>
                                                                    )}
                                                                </th>
                                                            );
                                                        })}
                                                        <th className="px-3 py-3 text-center text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase min-w-[120px] border-l-2 border-neutral-200 dark:border-neutral-700">Progress Bulan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                                    {filteredMahasiswaList.map((m, index) => {
                                                        const monthStats = getStudentMonthStats(m);
                                                        return (
                                                            <motion.tr
                                                                key={m.id}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: Math.min(index * 0.015, 0.4) }}
                                                                className="hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.03] transition-colors group"
                                                            >
                                                                <td className="sticky left-0 z-10 bg-white/95 dark:bg-neutral-950/95 px-4 py-3 text-xs text-neutral-400 font-medium border-r border-neutral-200 dark:border-neutral-800 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-500/[0.05] transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md">{index + 1}</td>
                                                                <td className="sticky left-[48px] z-10 bg-white/95 dark:bg-neutral-950/95 px-5 py-3 border-r border-neutral-200 dark:border-neutral-800 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-500/[0.05] transition-colors shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                                                                            {m.nama.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-[180px]">{m.nama}</p>
                                                                            <p className="text-[10px] text-neutral-400 font-mono tracking-wide">{m.nim}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {monthDates.map(date => {
                                                                    const status = getPaymentStatus(m, date);
                                                                    return (
                                                                        <td key={date} className="px-1 py-1.5 text-center border-r border-neutral-100/50 dark:border-neutral-800/30">
                                                                            {status === 'paid' ? (
                                                                                <motion.div
                                                                                    initial={{ scale: 0 }}
                                                                                    animate={{ scale: 1 }}
                                                                                    className="mx-auto h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center"
                                                                                >
                                                                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                                </motion.div>
                                                                            ) : status === 'unpaid' ? (
                                                                                <motion.button
                                                                                    whileHover={{ scale: 1.15 }}
                                                                                    whileTap={{ scale: 0.85 }}
                                                                                    onClick={() => handleMarkPaidForDate(m.id, date)}
                                                                                    className="mx-auto h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer group/cell"
                                                                                    title="Klik untuk tandai lunas"
                                                                                >
                                                                                    <X className="h-4 w-4 text-red-400 group-hover/cell:hidden" />
                                                                                    <Check className="h-4 w-4 text-emerald-500 hidden group-hover/cell:block" />
                                                                                </motion.button>
                                                                            ) : (
                                                                                <div className="mx-auto h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-200/60 dark:bg-neutral-800/30 dark:border-neutral-700/30" />
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                                <td className="px-3 py-2.5 border-l-2 border-neutral-200 dark:border-neutral-700">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex-1 h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${monthStats.percentage}%` }}
                                                                                transition={{ duration: 0.8, delay: Math.min(index * 0.03, 0.5), ease: 'easeOut' }}
                                                                                className={`h-full rounded-full ${monthStats.percentage === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : monthStats.percentage >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
                                                                            />
                                                                        </div>
                                                                        <span className={`text-[11px] font-bold tabular-nums w-10 text-right ${monthStats.percentage === 100 ? 'text-emerald-600' : monthStats.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                                            {monthStats.paid}/{monthStats.total}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </tbody>
                                                {filteredMahasiswaList.length > 0 && (
                                                    <tfoot>
                                                        <tr className="bg-gradient-to-r from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border-t-2 border-neutral-200 dark:border-neutral-700">
                                                            <td colSpan={2} className="sticky left-0 z-10 bg-neutral-100 dark:bg-neutral-900 px-4 py-3 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase border-r border-neutral-200 dark:border-neutral-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                                                <div className="flex items-center gap-2">
                                                                    <Target className="h-4 w-4 text-emerald-500" />
                                                                    TOTAL LUNAS (Verified)
                                                                </div>
                                                            </td>
                                                            {monthDates.map(date => {
                                                                const stats = getColumnStats(date);
                                                                const allPaid = stats.unpaid === 0 && stats.paid > 0;
                                                                return (
                                                                    <td key={date} className="px-2 py-3 text-center border-r border-neutral-200/50 dark:border-neutral-800/50">
                                                                        <span className={`text-xs font-bold ${allPaid ? 'text-emerald-600' : 'text-neutral-500'}`}>
                                                                            {stats.paid}/{stats.paid + stats.unpaid}
                                                                        </span>
                                                                        {allPaid && <div className="text-[9px] text-emerald-500 font-medium">✓ Lengkap</div>}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="px-3 py-3 text-center border-l-2 border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-xs font-bold text-emerald-600">{summary.paid_count} Lunas</div>
                                                                <div className="text-[10px] text-red-500 font-medium">{summary.unpaid_count} Belum</div>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )
                    }

                    {activeTab === 'buku-kas' && (
                        <motion.div
                            key="buku-kas"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Buku Kas - Rekap Per Pertemuan</h2>
                                        <p className="text-xs text-neutral-500 mt-1 font-medium">Klik baris untuk melihat detail transaksi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ledger Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                                            <th className="px-5 py-4 text-left text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-8"></th>
                                            <th className="px-5 py-4 text-left text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Tanggal Pertemuan</th>
                                            <th className="px-5 py-4 text-right text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Uang Masuk</th>
                                            <th className="px-5 py-4 text-right text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Uang Keluar</th>
                                            <th className="px-5 py-4 text-right text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {ledger.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <div className="h-16 w-16 mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                            <Receipt className="h-8 w-8 text-neutral-400" />
                                                        </div>
                                                        <p className="font-medium">Belum ada transaksi</p>
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
                                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                                                    className="cursor-pointer hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-colors"
                                                    onClick={() => toggleExpand(item.date)}
                                                >

                                                    <td className="px-5 py-4">
                                                        <motion.div
                                                            animate={{ rotate: expandedDates.includes(item.date) ? 90 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                                                        </motion.div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-sm text-neutral-900 dark:text-white">{item.display_date}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-bold text-sm text-emerald-600">+{formatCurrency(item.income)}</td>
                                                    <td className="px-5 py-4 text-right font-bold text-sm text-red-600">-{formatCurrency(item.expense)}</td>
                                                    <td className="px-5 py-4 text-right font-bold text-sm text-violet-600">{formatCurrency(item.balance)}</td>
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
                                                            <td colSpan={5} className="bg-neutral-50/50 dark:bg-black/30 px-5 py-4 shadow-inner">
                                                                <div className="space-y-2 pl-4 border-l-2 border-neutral-200 dark:border-neutral-700">
                                                                    {item.transactions.map((t, tIndex) => (
                                                                        <motion.div
                                                                            key={t.id}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: tIndex * 0.05 }}
                                                                            className="flex items-center justify-between py-3 px-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl border border-white/20 dark:border-neutral-700 backdrop-blur-sm"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <motion.span
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}
                                                                                >
                                                                                    {t.type === 'income' ? 'Masuk' : 'Keluar'}
                                                                                </motion.span>
                                                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                                    {t.type === 'income' && t.mahasiswa ? t.mahasiswa : t.description}
                                                                                </span>
                                                                            </div>
                                                                            <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
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
                                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-t border-neutral-800 dark:border-neutral-200"
                                            >
                                                <td colSpan={2} className="px-5 py-4 font-bold text-sm">TOTAL KESELURUHAN</td>
                                                <td className="px-5 py-4 text-right font-bold text-sm text-emerald-400 dark:text-emerald-600">+{formatCurrency(summary.total_income)}</td>
                                                <td className="px-5 py-4 text-right font-bold text-sm text-red-400 dark:text-red-600">-{formatCurrency(summary.total_expense)}</td>
                                                <td className="px-5 py-4 text-right font-bold text-sm">{formatCurrency(summary.total_balance)}</td>
                                            </motion.tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Pertemuan Modal - Advanced Glassmorphism */}
                <AnimatePresence>
                    {showPertemuanModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
                            onClick={() => setShowPertemuanModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-neutral-800 ring-1 ring-black/5 overflow-hidden"
                            >
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Calendar className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">Buat Pertemuan</h3>
                                                <p className="text-xs text-indigo-100 mt-1">Buat tagihan kas baru</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowPertemuanModal(false)}
                                            className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleCreatePertemuan} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tanggal Pertemuan</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={pertemuanForm.data.period_date}
                                                    onChange={e => pertemuanForm.setData('period_date', e.target.value)}
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white transition-all shadow-sm"
                                                    required
                                                />
                                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-50/50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20"
                                        >
                                            <div className="flex gap-3">
                                                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                                    Setiap mahasiswa akan ditagih <span className="font-bold">{formatCurrency(kasAmount)}</span>.
                                                </p>
                                            </div>
                                        </motion.div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={() => setShowPertemuanModal(false)}
                                                className="px-5 py-2.5 rounded-xl bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 text-sm font-semibold shadow-sm dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={pertemuanForm.processing}
                                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:shadow-none transition-all"
                                            >
                                                Buat Pertemuan
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expense Modal - Advanced Glassmorphism */}
                <AnimatePresence>
                    {showExpenseModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
                            onClick={() => setShowExpenseModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-neutral-800 ring-1 ring-black/5 overflow-hidden"
                            >
                                <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <TrendingDown className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">Catat Pengeluaran</h3>
                                                <p className="text-xs text-red-100 mt-1">Rekam pengeluaran kas rutin</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowExpenseModal(false)}
                                            className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="p-6">

                                    <form onSubmit={handleAddExpense} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Jumlah (Rp)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">Rp</span>
                                                <input
                                                    type="number"
                                                    value={expenseForm.data.amount || ''}
                                                    onChange={e => expenseForm.setData('amount', parseInt(e.target.value) || 0)}
                                                    placeholder="50000"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 py-3 text-lg font-bold text-neutral-900 focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white transition-all shadow-sm"
                                                    required
                                                    min={1}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Keterangan</label>
                                            <input
                                                type="text"
                                                value={expenseForm.data.description}
                                                onChange={e => expenseForm.setData('description', e.target.value)}
                                                placeholder="Contoh: Beli spidol, Cetak dokumen"
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white transition-all shadow-sm"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Kategori</label>
                                                <select
                                                    value={expenseForm.data.category}
                                                    onChange={e => expenseForm.setData('category', e.target.value)}
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white transition-all shadow-sm appearance-none"
                                                >
                                                    <option value="pengeluaran">Umum</option>
                                                    <option value="kegiatan">Kegiatan</option>
                                                    <option value="perlengkapan">Perlengkapan</option>
                                                    <option value="lainnya">Lainnya</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Tanggal</label>
                                                <input
                                                    type="date"
                                                    value={expenseForm.data.period_date}
                                                    onChange={e => expenseForm.setData('period_date', e.target.value)}
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white transition-all shadow-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={() => setShowExpenseModal(false)}
                                                className="px-5 py-2.5 rounded-xl bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 text-sm font-semibold shadow-sm dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={expenseForm.processing}
                                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:shadow-none transition-all"
                                            >
                                                Simpan Pengeluaran
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Export Modal - Advanced Glassmorphism */}
                <AnimatePresence>
                    {showExportModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
                            onClick={() => setShowExportModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-neutral-800 ring-1 ring-black/5 overflow-hidden"
                            >
                                <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center"
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                            >
                                                <Download className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">Export Laporan</h3>
                                                <p className="text-xs text-cyan-100 mt-1">Unduh data kas</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowExportModal(false)}
                                            className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="p-6 grid gap-4">
                                    {filters.pertemuan !== 'all' && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => exportPdf('pertemuan')}
                                            className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-violet-300 hover:bg-violet-50/50 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-violet-500/50 dark:hover:bg-violet-900/10 transition-all shadow-sm"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-500/20 dark:text-violet-400 dark:group-hover:bg-violet-500/30 transition-all duration-300">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-neutral-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">Per Pertemuan</p>
                                                <p className="text-xs text-neutral-500 font-medium group-hover:text-violet-600/70 dark:text-neutral-400">Data pertemuan yang dipilih</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-neutral-100 group-hover:bg-violet-100 dark:bg-neutral-700 dark:group-hover:bg-violet-900/30 flex items-center justify-center transition-colors">
                                                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-violet-600 dark:text-neutral-400 dark:group-hover:text-violet-300" />
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
                                        className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-purple-500/50 dark:hover:bg-purple-900/10 transition-all shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-500/20 dark:text-purple-400 dark:group-hover:bg-purple-500/30 transition-all duration-300">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-neutral-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">Laporan Bulanan</p>
                                            <p className="text-xs text-neutral-500 font-medium group-hover:text-purple-600/70 dark:text-neutral-400">Rekapitulasi bulan {new Date(filters.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-neutral-100 group-hover:bg-purple-100 dark:bg-neutral-700 dark:group-hover:bg-purple-900/30 flex items-center justify-center transition-colors">
                                            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-purple-600 dark:text-neutral-400 dark:group-hover:text-purple-300" />
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => exportPdf('keseluruhan')}
                                        className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-900/10 transition-all shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500/30 transition-all duration-300">
                                            <Printer className="h-6 w-6" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Semua Data</p>
                                            <p className="text-xs text-neutral-500 font-medium group-hover:text-emerald-600/70 dark:text-neutral-400">Arsip lengkap dari awal</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-neutral-100 group-hover:bg-emerald-100 dark:bg-neutral-700 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                                            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-emerald-600 dark:text-neutral-400 dark:group-hover:text-emerald-300" />
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => exportPdf('matrix')}
                                        className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-400 dark:border-indigo-700 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-500 transition-all shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-indigo-900 dark:text-indigo-100 group-hover:text-indigo-950 dark:group-hover:text-white transition-colors">Export Matrix Excel</p>
                                            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Tabel checklist pembayaran</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-indigo-200/50 group-hover:bg-indigo-200 dark:bg-indigo-800/50 dark:group-hover:bg-indigo-800 flex items-center justify-center transition-colors">
                                            <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
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
