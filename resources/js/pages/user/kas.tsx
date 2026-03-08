import KasIcon from '@/assets/admin/kas/kas.png';
import PengeluaranIcon from '@/assets/admin/kas/pengeluaran.png';
import SaldoAktifIcon from '@/assets/admin/kas/saldo-aktif.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BellRing,
    Brain,
    CheckCircle,
    Clock,
    DollarSign,
    Flame,
    Lightbulb,
    Loader2,
    Receipt,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp as TrendUp,
    Upload,
    Vote,
    XCircle,
    Zap,
} from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

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

interface FinancialIntelligence {
    healthScore: number;
    healthCategory: 'excellent' | 'good' | 'fair' | 'poor';
    paymentStreak: number;
    longestStreak: number;
    behaviorType: 'early' | 'ontime' | 'late' | 'inconsistent';
    behaviorScore: {
        early: number;
        ontime: number;
        late: number;
    };
    insights: string[];
    recommendations: string[];
}

interface PaymentPrediction {
    nextPaymentDate: string;
    confidenceLevel: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    optimalPaymentDate: string;
    cashFlowForecast: {
        month: string;
        predictedBalance: number;
        predictedIncome: number;
        predictedExpense: number;
    }[];
}

interface PaymentPlanning {
    calendar: {
        date: string;
        amount: number;
        status: 'paid' | 'upcoming' | 'overdue';
        description: string;
    }[];
    budget: {
        monthly: number;
        spent: number;
        remaining: number;
        percentage: number;
    };
    savingsGoal: {
        target: number;
        current: number;
        percentage: number;
        estimatedCompletion: string;
    };
    installments: {
        totalAmount: number;
        installmentCount: number;
        amountPerInstallment: number;
        paidInstallments: number;
        remainingInstallments: number;
    }[];
}

interface Gamification {
    achievements: {
        id: string;
        name: string;
        description: string;
        icon: string;
        unlocked: boolean;
        unlockedAt?: string | null;
        progress: number;
        target: number;
    }[];
    leaderboard: {
        rank: number;
        totalParticipants: number;
        category: string;
        score: number;
    };
    rewardPoints: {
        total: number;
        earned: number;
        spent: number;
        multiplier: number;
    };
    challenges: {
        id: string;
        title: string;
        description: string;
        type: 'weekly' | 'monthly' | 'class';
        progress: number;
        target: number;
        reward: number;
        deadline: string;
        completed: boolean;
    }[];
}

interface SocialFeatures {
    classStats: {
        totalStudents: number;
        paidStudents: number;
        unpaidStudents: number;
        paymentRate: number;
        target: number;
    };
    peerComparison: {
        yourRank: number;
        totalPeers: number;
        percentile: number;
        category: string;
    };
}

interface ReminderSettings {
    enabled: boolean;
    channels: {
        inApp: boolean;
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    };
}

interface UpcomingReminder {
    id: number;
    channel: string;
    scheduled_at: string;
    status: string;
    message: string;
}

interface ReceiptUploadTarget {
    id: number;
    label: string;
    amount: number;
}

interface ReceiptWorkflowItem {
    id: number;
    kas_id: number;
    status: 'pending' | 'verified' | 'rejected';
    image_url: string | null;
    ocr_data: {
        amount?: number | null;
        date?: string | null;
        bankName?: string | null;
        confidence?: number | null;
    } | null;
    expected_amount: number;
    kas_description: string;
    period_date: string | null;
    created_at: string | null;
    reviewed_at: string | null;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    kasRecords: KasRecord[];
    personalStats: {
        total_paid: number;
        total_unpaid: number;
        paid_count: number;
        unpaid_count: number;
    };
    classSummary: {
        total_balance: number;
        total_income: number;
        total_expense: number;
    };
    recentExpenses: Expense[];
    financialIntelligence: FinancialIntelligence;
    paymentPrediction: PaymentPrediction;
    paymentPlanning: PaymentPlanning;
    gamification: Gamification;
    socialFeatures: SocialFeatures;
    reminderSettings: ReminderSettings;
    upcomingReminders: UpcomingReminder[];
    receiptUploadTargets: ReceiptUploadTarget[];
    receiptWorkflow: ReceiptWorkflowItem[];
}

// Animation variants matching Dashboard
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 },
    },
} as const;

export default function UserKas({
    mahasiswa,
    kasRecords,
    personalStats,
    classSummary,
    recentExpenses,
    financialIntelligence,
    paymentPrediction,
    paymentPlanning,
    gamification,
    socialFeatures,
    reminderSettings,
    upcomingReminders,
    receiptUploadTargets,
    receiptWorkflow,
}: PageProps) {
    const [selectedTab, setSelectedTab] = useState<'riwayat' | 'pengeluaran'>(
        'riwayat',
    );
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedKasId, setSelectedKasId] = useState<string>(
        receiptUploadTargets[0]?.id ? String(receiptUploadTargets[0].id) : '',
    );
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [receiptItems, setReceiptItems] =
        useState<ReceiptWorkflowItem[]>(receiptWorkflow);

    useEffect(() => {
        setReceiptItems(receiptWorkflow);
    }, [receiptWorkflow]);

    useEffect(() => {
        return () => {
            if (receiptPreview) {
                URL.revokeObjectURL(receiptPreview);
            }
        };
    }, [receiptPreview]);

    const paymentRate =
        personalStats.paid_count + personalStats.unpaid_count > 0
            ? (personalStats.paid_count /
                  (personalStats.paid_count + personalStats.unpaid_count)) *
              100
            : 0;

    const healthLabel = {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
    }[financialIntelligence.healthCategory];

    const riskTone = {
        low: 'text-emerald-600 dark:text-emerald-400',
        medium: 'text-amber-600 dark:text-amber-400',
        high: 'text-rose-600 dark:text-rose-400',
    }[paymentPrediction.riskLevel];

    const receiptStatusConfig: Record<
        ReceiptWorkflowItem['status'],
        { label: string; badgeClass: string; progress: number }
    > = {
        pending: {
            label: 'Menunggu Review',
            badgeClass:
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            progress: 50,
        },
        verified: {
            label: 'Terverifikasi',
            badgeClass:
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            progress: 100,
        },
        rejected: {
            label: 'Ditolak',
            badgeClass:
                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
            progress: 100,
        },
    };

    const handleReceiptFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setReceiptFile(file);

        if (receiptPreview) {
            URL.revokeObjectURL(receiptPreview);
            setReceiptPreview(null);
        }

        if (file) {
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadReceipt = async () => {
        if (!selectedKasId) {
            toast.error('Pilih tagihan kas terlebih dahulu.');
            return;
        }

        if (!receiptFile) {
            toast.error('Pilih file bukti transfer terlebih dahulu.');
            return;
        }

        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';

        const formData = new FormData();
        formData.append('kas_id', selectedKasId);
        formData.append('receipt', receiptFile);
        if (csrfToken) {
            formData.append('_token', csrfToken);
        }

        setUploadingReceipt(true);

        try {
            const response = await fetch('/api/kas/receipts/upload', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const payload = (await response.json()) as {
                message?: string;
                data?: {
                    id: number;
                    status: 'pending' | 'verified' | 'rejected';
                    imageUrl: string;
                };
            };

            if (!response.ok || !payload.data) {
                toast.error(payload.message ?? 'Upload bukti transfer gagal.');
                return;
            }

            const target = receiptUploadTargets.find(
                (item) => String(item.id) === selectedKasId,
            );

            const newItem: ReceiptWorkflowItem = {
                id: payload.data.id,
                kas_id: Number(selectedKasId),
                status: payload.data.status,
                image_url: payload.data.imageUrl,
                ocr_data: null,
                expected_amount: target?.amount ?? 0,
                kas_description: target?.label ?? 'Pembayaran kas',
                period_date: null,
                created_at: new Date().toISOString(),
                reviewed_at: null,
            };

            setReceiptItems((prev) => [newItem, ...prev]);
            setReceiptFile(null);
            if (receiptPreview) {
                URL.revokeObjectURL(receiptPreview);
            }
            setReceiptPreview(null);

            toast.success(
                payload.message ?? 'Bukti transfer berhasil diupload.',
            );
        } catch {
            toast.error('Terjadi kesalahan saat upload bukti transfer.');
        } finally {
            setUploadingReceipt(false);
        }
    };

    return (
        <StudentLayout>
            <Head title="Uang Kas" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
            >
                {/* Premium Header with Advanced Animations matching Admin Kas */}
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

                    <div className="relative">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                                {/* Icon Header - NO CONTAINER */}
                                <motion.div
                                    className="relative flex h-16 w-16 shrink-0 sm:h-24 sm:w-24"
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
                                        src={KasIcon}
                                        alt="Kas"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                </motion.div>
                                <div className="mt-1 w-full flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Keuangan Kelas
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-xl font-bold leading-tight text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Uang Kas Saya
                                    </motion.h1>
                                    <motion.p
                                        className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:max-w-lg sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {mahasiswa.nama} • {mahasiswa.nim}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Payment Rate Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-2.5 shadow-lg backdrop-blur-xl sm:w-auto sm:justify-start sm:px-6 sm:py-3"
                            >
                                <div className="shrink-0 rounded-lg bg-indigo-500/20 p-2">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-100">
                                        Tingkat Pembayaran
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        <AnimatedCounter
                                            value={paymentRate}
                                            decimals={0}
                                            suffix="%"
                                        />
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-5 flex justify-center sm:justify-end"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.visit('/user/kas-voting')}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                            >
                                <Vote className="h-4 w-4 shrink-0" />
                                <span>Voting Kas</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Personal Stats - Animated Cards matching Admin Kas */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6"
                >
                    {/* Paid Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('paid')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'paid' ? 1.5 : 1,
                                opacity: hoveredCard === 'paid' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-11 w-11 items-center justify-center p-1 sm:h-14 sm:w-14"
                            >
                                <img
                                    src={SaldoAktifIcon}
                                    alt="Total Sudah Bayar"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-[11px] font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    Total Sudah Bayar
                                </p>
                                <div className="mt-1">
                                    <p className="text-lg font-bold leading-tight text-neutral-900 sm:text-3xl dark:text-white">
                                        <AnimatedCounter
                                            value={personalStats.total_paid}
                                            prefix="Rp "
                                        />
                                    </p>
                                </div>
                                <div className="mt-1.5 flex items-center justify-center gap-2 sm:mt-2 sm:justify-start">
                                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <ArrowUpRight className="h-3 w-3" />
                                        <span className="font-semibold">
                                            {personalStats.paid_count} pertemuan
                                        </span>
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all hover:shadow-red-500/10 sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'unpaid' ? 1.5 : 1,
                                opacity: hoveredCard === 'unpaid' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-11 w-11 items-center justify-center p-1 sm:h-14 sm:w-14"
                            >
                                <img
                                    src={PengeluaranIcon}
                                    alt="Total Belum Bayar"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-[11px] font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    Total Belum Bayar
                                </p>
                                <div className="mt-1">
                                    <p className="text-lg font-bold leading-tight text-neutral-900 sm:text-3xl dark:text-white">
                                        <AnimatedCounter
                                            value={personalStats.total_unpaid}
                                            prefix="Rp "
                                        />
                                    </p>
                                </div>
                                <div className="mt-1.5 flex items-center justify-center gap-2 sm:mt-2 sm:justify-start">
                                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-semibold">
                                            {personalStats.unpaid_count}{' '}
                                            pertemuan
                                        </span>
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
                                className="mt-3 flex items-center gap-2 rounded-lg bg-red-100 px-2.5 py-2 sm:mt-4 sm:px-3 dark:bg-red-900/30"
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

                {/* Financial Intelligence Dashboard */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Brain className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Financial Intelligence
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Analisis kesehatan pembayaran dan rekomendasi
                                cerdas
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Payment Health Score
                            </p>
                            <div className="mt-3 flex items-center gap-4">
                                <div
                                    className="relative h-16 w-16 rounded-full"
                                    style={{
                                        background: `conic-gradient(rgb(99 102 241) ${financialIntelligence.healthScore * 3.6}deg, rgba(255,255,255,0.2) 0deg)`,
                                    }}
                                >
                                    <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-white/90 text-sm font-bold text-neutral-900 dark:bg-neutral-900 dark:text-white">
                                        <AnimatedCounter
                                            value={
                                                financialIntelligence.healthScore
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p
                                        className={cn(
                                            'text-sm font-semibold',
                                            financialIntelligence.healthCategory ===
                                                'poor'
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-emerald-600 dark:text-emerald-400',
                                        )}
                                    >
                                        {healthLabel}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Skor finansial saat ini
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Payment Streak
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                    <Flame className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter
                                            value={
                                                financialIntelligence.paymentStreak
                                            }
                                        />
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Longest:{' '}
                                        {financialIntelligence.longestStreak}x
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Behavior Analysis
                            </p>
                            <div className="mt-3 space-y-2">
                                {[
                                    {
                                        label: 'Early',
                                        value: financialIntelligence
                                            .behaviorScore.early,
                                        tone: 'bg-emerald-500',
                                    },
                                    {
                                        label: 'On-time',
                                        value: financialIntelligence
                                            .behaviorScore.ontime,
                                        tone: 'bg-sky-500',
                                    },
                                    {
                                        label: 'Late',
                                        value: financialIntelligence
                                            .behaviorScore.late,
                                        tone: 'bg-rose-500',
                                    },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                            <span>{item.label}</span>
                                            <span>{item.value}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-700/70">
                                            <div
                                                className={cn(
                                                    'h-1.5 rounded-full transition-all duration-500',
                                                    item.tone,
                                                )}
                                                style={{
                                                    width: `${item.value}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                Payment Risk
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-orange-600 text-white shadow-lg shadow-rose-500/30">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <p
                                        className={cn(
                                            'text-lg font-bold uppercase',
                                            riskTone,
                                        )}
                                    >
                                        {paymentPrediction.riskLevel}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Confidence:{' '}
                                        {paymentPrediction.confidenceLevel}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <div className="mb-3 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Insights
                                </p>
                            </div>
                            <ul className="space-y-2">
                                {financialIntelligence.insights.map(
                                    (insight) => (
                                        <li
                                            key={insight}
                                            className="text-xs text-neutral-600 dark:text-neutral-300"
                                        >
                                            • {insight}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <div className="mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Recommendations
                                </p>
                            </div>
                            <ul className="space-y-2">
                                {financialIntelligence.recommendations.map(
                                    (item) => (
                                        <li
                                            key={item}
                                            className="text-xs text-neutral-600 dark:text-neutral-300"
                                        >
                                            • {item}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Predictive + Planner + Gamification */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Predictive Payment Analytics
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Prediksi pembayaran dan proyeksi kas kelas 3
                                    bulan
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Prediksi Pembayaran Berikutnya
                                </p>
                                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                    {paymentPrediction.nextPaymentDate}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Tanggal Optimal
                                </p>
                                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                    {paymentPrediction.optimalPaymentDate}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Faktor Risiko
                                </p>
                                <p
                                    className={cn(
                                        'mt-1 text-sm font-semibold',
                                        riskTone,
                                    )}
                                >
                                    {paymentPrediction.riskFactors.length === 0
                                        ? 'Stabil'
                                        : `${paymentPrediction.riskFactors.length} faktor`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/20 dark:border-white/10">
                            <div className="grid grid-cols-4 bg-white/60 px-4 py-2 text-xs font-semibold text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
                                <span>Bulan</span>
                                <span>Saldo</span>
                                <span>Income</span>
                                <span>Expense</span>
                            </div>
                            {paymentPrediction.cashFlowForecast.map((item) => (
                                <div
                                    key={item.month}
                                    className="grid grid-cols-4 border-t border-white/10 px-4 py-2 text-xs text-neutral-600 dark:border-white/5 dark:text-neutral-300"
                                >
                                    <span>{item.month}</span>
                                    <span>
                                        <AnimatedCounter
                                            value={item.predictedBalance}
                                            prefix="Rp "
                                        />
                                    </span>
                                    <span>
                                        <AnimatedCounter
                                            value={item.predictedIncome}
                                            prefix="Rp "
                                        />
                                    </span>
                                    <span>
                                        <AnimatedCounter
                                            value={item.predictedExpense}
                                            prefix="Rp "
                                        />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Rewards & Challenges
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Gamification progress
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Reward Points
                            </p>
                            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                                <AnimatedCounter
                                    value={gamification.rewardPoints.total}
                                />
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Multiplier{' '}
                                {gamification.rewardPoints.multiplier}x
                            </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {gamification.challenges
                                .slice(0, 2)
                                .map((challenge) => (
                                    <div
                                        key={challenge.id}
                                        className="rounded-2xl border border-white/20 bg-white/50 p-3 dark:border-white/10 dark:bg-neutral-800/50"
                                    >
                                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                                            {challenge.title}
                                        </p>
                                        <div className="mt-2 h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-700/70">
                                            <div
                                                className={cn(
                                                    'h-1.5 rounded-full',
                                                    challenge.completed
                                                        ? 'bg-emerald-500'
                                                        : 'bg-indigo-500',
                                                )}
                                                style={{
                                                    width: `${Math.min(100, Math.round((challenge.progress / Math.max(challenge.target, 1)) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                            {challenge.progress}/
                                            {challenge.target} • Reward{' '}
                                            {challenge.reward} pts
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </motion.div>
                </div>

                {/* Reminder + Social + Budget */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-600 text-white shadow-lg shadow-pink-500/30">
                                <BellRing className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Smart Reminders
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Reminder otomatis multi-channel
                                </p>
                            </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                            {Object.entries(reminderSettings.channels).map(
                                ([channel, active]) => (
                                    <span
                                        key={channel}
                                        className={cn(
                                            'rounded-full px-2.5 py-1 text-[11px] font-medium',
                                            active
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                                        )}
                                    >
                                        {channel}
                                    </span>
                                ),
                            )}
                        </div>

                        <div className="space-y-2">
                            {upcomingReminders.slice(0, 3).map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="rounded-xl border border-white/20 bg-white/50 p-2.5 text-xs text-neutral-600 dark:border-white/10 dark:bg-neutral-800/50 dark:text-neutral-300"
                                >
                                    <p>{reminder.message}</p>
                                    <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                        {reminder.scheduled_at} •{' '}
                                        {reminder.status}
                                    </p>
                                </div>
                            ))}
                            {upcomingReminders.length === 0 && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Belum ada reminder terjadwal.
                                </p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Budget Planner
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Rencana kas bulanan pribadi
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Budget Bulanan
                            </p>
                            <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                                <AnimatedCounter
                                    value={paymentPlanning.budget.monthly}
                                    prefix="Rp "
                                />
                            </p>
                            <div className="mt-2 h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-700/70">
                                <div
                                    className="h-1.5 rounded-full bg-indigo-500"
                                    style={{
                                        width: `${Math.min(100, paymentPlanning.budget.percentage)}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                Spent: {paymentPlanning.budget.percentage}% •
                                Remaining{' '}
                                <AnimatedCounter
                                    value={paymentPlanning.budget.remaining}
                                    prefix="Rp "
                                />
                            </p>
                        </div>

                        <div className="mt-3 rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Savings Goal
                            </p>
                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                ETA{' '}
                                {
                                    paymentPlanning.savingsGoal
                                        .estimatedCompletion
                                }
                            </p>
                            <div className="mt-2 h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-700/70">
                                <div
                                    className="h-1.5 rounded-full bg-emerald-500"
                                    style={{
                                        width: `${Math.min(100, paymentPlanning.savingsGoal.percentage)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                                <TrendUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Social Snapshot
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Statistik kelas dan peringkat Anda
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Payment Rate Kelas
                            </p>
                            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                                <AnimatedCounter
                                    value={
                                        socialFeatures.classStats.paymentRate
                                    }
                                    suffix="%"
                                />
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                {socialFeatures.classStats.paidStudents}/
                                {socialFeatures.classStats.totalStudents}{' '}
                                mahasiswa
                            </p>
                        </div>

                        <div className="mt-3 rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Peer Comparison
                            </p>
                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                Rank #{socialFeatures.peerComparison.yourRank}{' '}
                                dari {socialFeatures.peerComparison.totalPeers}
                            </p>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                                {socialFeatures.peerComparison.percentile}%
                                percentile •{' '}
                                {socialFeatures.peerComparison.category}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Receipt Upload & Verification Workflow */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Upload Bukti Transfer
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Upload bukti, pantau status review, dan lihat
                                hasil verifikasi
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                Pilih Tagihan
                            </label>
                            <select
                                value={selectedKasId}
                                onChange={(event) =>
                                    setSelectedKasId(event.target.value)
                                }
                                className="w-full rounded-xl border border-white/20 bg-white/80 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-neutral-900/70 dark:text-white"
                            >
                                {receiptUploadTargets.length === 0 ? (
                                    <option value="">
                                        Tidak ada tagihan aktif
                                    </option>
                                ) : (
                                    receiptUploadTargets.map((target) => (
                                        <option
                                            key={target.id}
                                            value={String(target.id)}
                                        >
                                            {target.label}
                                        </option>
                                    ))
                                )}
                            </select>

                            <label className="mt-4 mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                File Bukti Transfer
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptFileChange}
                                className="w-full rounded-xl border border-white/20 bg-white/80 px-3 py-2 text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-300"
                            />

                            {receiptPreview && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-white/20 dark:border-white/10">
                                    <img
                                        src={receiptPreview}
                                        alt="Preview Bukti Transfer"
                                        className="h-48 w-full object-cover"
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleUploadReceipt}
                                disabled={
                                    uploadingReceipt ||
                                    !selectedKasId ||
                                    !receiptFile
                                }
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {uploadingReceipt ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mengupload...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Upload Bukti
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="mb-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                Workflow Verifikasi
                            </p>

                            <div className="space-y-3">
                                {receiptItems.length === 0 && (
                                    <p className="rounded-xl border border-dashed border-white/20 bg-white/60 px-3 py-4 text-center text-xs text-neutral-500 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-400">
                                        Belum ada bukti transfer yang diupload.
                                    </p>
                                )}

                                {receiptItems.slice(0, 6).map((item) => {
                                    const status =
                                        receiptStatusConfig[item.status];

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/10 dark:bg-neutral-900/60"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                                                        {item.kas_description}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                                                        {item.created_at ??
                                                            'Waktu upload tidak tersedia'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold',
                                                        status.badgeClass,
                                                    )}
                                                >
                                                    {item.status ===
                                                    'verified' ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : item.status ===
                                                      'rejected' ? (
                                                        <XCircle className="h-3 w-3" />
                                                    ) : (
                                                        <Clock className="h-3 w-3" />
                                                    )}
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div className="mt-2 h-1.5 rounded-full bg-neutral-200/80 dark:bg-neutral-700/70">
                                                <div
                                                    className={cn(
                                                        'h-1.5 rounded-full transition-all',
                                                        item.status ===
                                                            'verified'
                                                            ? 'bg-emerald-500'
                                                            : item.status ===
                                                                'rejected'
                                                              ? 'bg-rose-500'
                                                              : 'bg-amber-500',
                                                    )}
                                                    style={{
                                                        width: `${status.progress}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-2 grid grid-cols-[64px_1fr] gap-2">
                                                <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/20 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt="Receipt"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-neutral-600 dark:text-neutral-300">
                                                    <p>
                                                        Nominal:{' '}
                                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                                            <AnimatedCounter
                                                                value={
                                                                    item.expected_amount
                                                                }
                                                                prefix="Rp "
                                                            />
                                                        </span>
                                                    </p>
                                                    {item.ocr_data
                                                        ?.confidence ? (
                                                        <p className="mt-0.5">
                                                            OCR confidence:{' '}
                                                            {
                                                                item.ocr_data
                                                                    .confidence
                                                            }
                                                            %
                                                        </p>
                                                    ) : (
                                                        <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                                                            Menunggu OCR /
                                                            review bendahara
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Class Summary - Glassmorphism */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Saldo Kas Kelas
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Ringkasan keuangan kelas
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <motion.div
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                            className="rounded-2xl border border-white/20 bg-white/50 p-4 text-center shadow-xl backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-neutral-800/50"
                        >
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
                                <Zap className="h-5 w-5" />
                            </div>
                            <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Saldo Aktif
                            </p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                <AnimatedCounter
                                    value={classSummary.total_balance}
                                    prefix="Rp "
                                />
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                            className="rounded-2xl border border-white/20 bg-white/50 p-4 text-center shadow-xl backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-neutral-800/50"
                        >
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <TrendUp className="h-5 w-5" />
                            </div>
                            <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Total Uang Masuk
                            </p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                <AnimatedCounter
                                    value={classSummary.total_income}
                                    prefix="Rp "
                                />
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                            className="rounded-2xl border border-white/20 bg-white/50 p-4 text-center shadow-xl backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-neutral-800/50"
                        >
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-orange-600 text-white shadow-lg shadow-rose-500/30">
                                <TrendingDown className="h-5 w-5" />
                            </div>
                            <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Total Uang Keluar
                            </p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                <AnimatedCounter
                                    value={classSummary.total_expense}
                                    prefix="Rp "
                                />
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    variants={itemVariants}
                    className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-white/20 bg-white/40 p-1 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTab('riwayat')}
                        className={cn(
                            'rounded-xl px-4 py-2.5 text-sm font-medium transition-all sm:px-6',
                            selectedTab === 'riwayat'
                                ? 'bg-white text-emerald-600 shadow-sm dark:bg-neutral-800 dark:text-emerald-400'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white',
                        )}
                    >
                        <Receipt className="mr-2 inline h-4 w-4" />
                        Riwayat Pembayaran
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTab('pengeluaran')}
                        className={cn(
                            'rounded-xl px-4 py-2.5 text-sm font-medium transition-all sm:px-6',
                            selectedTab === 'pengeluaran'
                                ? 'bg-white text-red-600 shadow-sm dark:bg-neutral-800 dark:text-red-400'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white',
                        )}
                    >
                        <TrendingDown className="mr-2 inline h-4 w-4" />
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
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/10 p-4 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            Riwayat Pembayaran Saya
                                        </h2>
                                        <p className="text-sm text-neutral-500">
                                            {kasRecords.length} transaksi
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-white/10">
                                {kasRecords.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 text-center sm:p-12"
                                    >
                                        <Receipt className="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                                        <p className="text-neutral-500 dark:text-neutral-400">
                                            Belum ada tagihan kas
                                        </p>
                                    </motion.div>
                                ) : (
                                    kasRecords.map((record, index) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{
                                                x: 5,
                                                backgroundColor:
                                                    'rgba(16, 185, 129, 0.05)',
                                            }}
                                            className="flex cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.2,
                                                        y: -2,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 15,
                                                    }}
                                                    className={cn(
                                                        'flex h-10 w-10 items-center justify-center rounded-xl',
                                                        record.status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                                            : 'bg-red-100 text-red-600 dark:bg-red-900/30',
                                                    )}
                                                >
                                                    {record.status ===
                                                    'paid' ? (
                                                        <CheckCircle className="h-5 w-5" />
                                                    ) : (
                                                        <Clock className="h-5 w-5" />
                                                    )}
                                                </motion.div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">
                                                        {record.period_display}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {record.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="self-start text-left sm:self-auto sm:text-right">
                                                <p className="font-bold text-neutral-900 dark:text-white">
                                                    <AnimatedCounter
                                                        value={record.amount}
                                                        prefix="Rp "
                                                    />
                                                </p>
                                                <motion.span
                                                    whileHover={{ scale: 1.1 }}
                                                    className={cn(
                                                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                                                        record.status === 'paid'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                                    )}
                                                >
                                                    {record.status === 'paid'
                                                        ? 'Lunas'
                                                        : 'Belum Bayar'}
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
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
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/10 p-4 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-orange-600 text-white shadow-lg shadow-red-500/30">
                                        <TrendingDown className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            Pengeluaran Kelas Terbaru
                                        </h2>
                                        <p className="text-sm text-neutral-500">
                                            {recentExpenses.length} pengeluaran
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-white/10">
                                {recentExpenses.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 text-center sm:p-12"
                                    >
                                        <TrendingDown className="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                                        <p className="text-neutral-500 dark:text-neutral-400">
                                            Belum ada pengeluaran
                                        </p>
                                    </motion.div>
                                ) : (
                                    recentExpenses.map((expense, index) => (
                                        <motion.div
                                            key={expense.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{
                                                x: -5,
                                                backgroundColor:
                                                    'rgba(239, 68, 68, 0.05)',
                                            }}
                                            className="flex cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.2,
                                                        y: -2,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 15,
                                                    }}
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30"
                                                >
                                                    <ArrowDownRight className="h-5 w-5" />
                                                </motion.div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">
                                                        {expense.description}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {expense.period_display}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.p
                                                whileHover={{ scale: 1.1 }}
                                                className="font-bold text-red-600"
                                            >
                                                -
                                                <AnimatedCounter
                                                    value={expense.amount}
                                                    prefix="Rp "
                                                />
                                            </motion.p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}
