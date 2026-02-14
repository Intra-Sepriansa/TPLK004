import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, TrendingUp, TrendingDown, CheckCircle, XCircle, Receipt, 
    DollarSign, Calendar, Sparkles, ArrowUpRight, ArrowDownRight, 
    Clock, Award, Target, Zap, TrendingUp as TrendUp
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface KasRecord {
    id: number;
    amount: number;
    status: string;
    period_date: string;
    period_display: string;
    description: string;
    category: string;
}

interface Expense {
    id: number;
    amount: number;
    description: string;
    period_date: string;
    period_display: string;
    category: string;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    kasRecords: KasRecord[];
    personalStats: { total_paid: number; total_unpaid: number; paid_count: number; unpaid_count: number };
    classSummary: { total_balance: number; total_income: number; total_expense: number };
    recentExpenses: Expense[];
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
            type: 'spring' as const,
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
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
        },
    },
};

export default function UserKas({ mahasiswa, kasRecords, personalStats, classSummary, recentExpenses }: PageProps) {
    const [selectedTab, setSelectedTab] = useState<'riwayat' | 'pengeluaran'>('riwayat');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const paymentRate = personalStats.paid_count + personalStats.unpaid_count > 0 
        ? (personalStats.paid_count / (personalStats.paid_count + personalStats.unpaid_count)) * 100 
        : 0;

    return (
        <StudentLayout>
            <Head title="Uang Kas" />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Premium Header with Advanced Animations */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"
                        />
                        
                        {/* Large Floating Icons */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, 0],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute right-8 top-8 opacity-10"
                        >
                            <Wallet className="h-32 w-32" />
                        </motion.div>
                        <motion.div
                            animate={{
                                y: [0, 15, 0],
                                rotate: [0, -5, 0],
                            }}
                            transition={{
                                duration: 7,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute left-8 bottom-8 opacity-10"
                        >
                            <DollarSign className="h-28 w-28" />
                        </motion.div>
                    </div>
                    
                    {/* Floating Money Icons */}
                    {[Wallet, DollarSign, Receipt, TrendingUp, Sparkles].map((Icon, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 0.4, 0],
                                scale: [0, 1, 0],
                                y: [0, -40, -80]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: "easeOut"
                            }}
                            style={{
                                left: `${15 + i * 18}%`,
                                top: `${20 + (i % 2) * 40}%`,
                            }}
                        >
                            <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                    ))}
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/50"
                                >
                                    <Wallet className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm text-gray-300 font-medium"
                                    >
                                        Keuangan Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                    >
                                        Uang Kas Saya
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-sm text-gray-300 mt-1"
                                    >
                                        {mahasiswa.nama} • {mahasiswa.nim}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Payment Rate Badge with Premium Design */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                whileHover={{ scale: 1.05, y: -3 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-xl border border-white/30">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Award className="h-6 w-6" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs text-gray-200 font-medium">Tingkat Pembayaran</p>
                                        <p className="text-2xl font-black">{paymentRate.toFixed(0)}%</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Personal Stats - Animated Cards */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-4 md:grid-cols-2"
                >
                    {/* Paid Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('paid')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-lg backdrop-blur dark:border-emerald-800/70 dark:from-emerald-950/50 dark:to-teal-950/50"
                    >
                        <div className="relative flex items-start gap-4">
                            <motion.div
                                whileHover={{ scale: 1.2, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                            >
                                <CheckCircle className="h-7 w-7" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Sudah Bayar</p>
                                <div className="mt-1">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                                        {formatCurrency(personalStats.total_paid)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <ArrowUpRight className="h-3 w-3" />
                                        <span className="font-semibold">{personalStats.paid_count} pertemuan</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Unpaid Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('unpaid')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-red-200/70 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-lg backdrop-blur dark:border-red-800/70 dark:from-red-950/50 dark:to-orange-950/50"
                    >
                        <div className="relative flex items-start gap-4">
                            <motion.div
                                whileHover={{ scale: 1.2, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/50"
                            >
                                <XCircle className="h-7 w-7" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Belum Bayar</p>
                                <div className="mt-1">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                                        {formatCurrency(personalStats.total_unpaid)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-semibold">{personalStats.unpaid_count} pertemuan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning Indicator */}
                        {personalStats.unpaid_count > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="mt-4 flex items-center gap-2 rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-2"
                            >
                                <div>
                                    <Target className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                    Segera lunasi pembayaran Anda
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Class Summary - Animated */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-black/80"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div>
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="font-semibold text-slate-900 dark:text-white text-lg">
                            Saldo Kas Kelas
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-800"
                        >
                            <div>
                                <Zap className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                            </div>
                            <p className="text-xs text-slate-500 mb-1">Saldo Aktif</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                {formatCurrency(classSummary.total_balance)}
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="text-center p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800"
                        >
                            <TrendUp className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                            <p className="text-xs text-slate-500 mb-1">Total Uang Masuk</p>
                            <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                                {formatCurrency(classSummary.total_income)}
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="text-center p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl border border-red-200 dark:border-red-800"
                        >
                            <TrendingDown className="h-8 w-8 mx-auto text-red-600 mb-2" />
                            <p className="text-xs text-slate-500 mb-1">Total Uang Keluar</p>
                            <p className="text-lg font-bold bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                                {formatCurrency(classSummary.total_expense)}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    variants={itemVariants}
                    className="flex gap-2 border-b border-slate-200 dark:border-slate-800"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTab('riwayat')}
                        className={cn(
                            'px-6 py-3 text-sm font-medium border-b-2 transition-all',
                            selectedTab === 'riwayat'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <Receipt className="h-4 w-4 inline mr-2" />
                        Riwayat Pembayaran
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTab('pengeluaran')}
                        className={cn(
                            'px-6 py-3 text-sm font-medium border-b-2 transition-all',
                            selectedTab === 'pengeluaran'
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <TrendingDown className="h-4 w-4 inline mr-2" />
                        Pengeluaran Kelas
                    </motion.button>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {selectedTab === 'riwayat' && (
                        <motion.div
                            key="riwayat"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-black/80 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-emerald-600" />
                                    Riwayat Pembayaran Saya
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {kasRecords.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-12 text-center"
                                    >
                                        <Receipt className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500">Belum ada tagihan kas</p>
                                    </motion.div>
                                ) : kasRecords.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 5, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                        className="p-4 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.2, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                                className={cn(
                                                    'flex h-10 w-10 items-center justify-center rounded-xl',
                                                    record.status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                                        : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                                )}
                                            >
                                                {record.status === 'paid' ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    <Clock className="h-5 w-5" />
                                                )}
                                            </motion.div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{record.period_display}</p>
                                                <p className="text-xs text-slate-500">{record.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(record.amount)}</p>
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className={cn(
                                                    'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                                                    record.status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                )}
                                            >
                                                {record.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {selectedTab === 'pengeluaran' && (
                        <motion.div
                            key="pengeluaran"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-black/80 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
                                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    Pengeluaran Kelas Terbaru
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {recentExpenses.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-12 text-center"
                                    >
                                        <TrendingDown className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500">Belum ada pengeluaran</p>
                                    </motion.div>
                                ) : recentExpenses.map((expense, index) => (
                                    <motion.div
                                        key={expense.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: -5, backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                                        className="p-4 flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.2, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30"
                                            >
                                                <ArrowDownRight className="h-5 w-5" />
                                            </motion.div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{expense.description}</p>
                                                <p className="text-xs text-slate-500">{expense.period_display}</p>
                                            </div>
                                        </div>
                                        <motion.p
                                            whileHover={{ scale: 1.1 }}
                                            className="font-bold text-red-600"
                                        >
                                            -{formatCurrency(expense.amount)}
                                        </motion.p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}
