import KasIcon from '@/assets/admin/kas/kas.png';
import SaldoAktifIcon from '@/assets/admin/kas/saldo-aktif.png';
import StatusIcon from '@/assets/admin/kas/status.png';
import {
    getPendingKasActions,
    removePendingKasActionsForDate,
    syncPendingKasActions,
    type KasPaymentMethod,
    upsertPendingKasAction,
} from '@/lib/admin-kas-offline';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { NetworkMonitor, type NetworkQuality } from '@/services/NetworkMonitor';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    Calendar,
    Check,
    ChevronRight,
    Download,
    FileText,
    Loader2,
    Printer,
    Receipt,
    Search,
    Target,
    Trash2,
    TrendingDown,
    Users,
    Vote,
    X,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MahasiswaKas {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    total_paid: number;
    total_unpaid: number;
    global_unpaid: number;
    status: string;
    records: {
        id: number;
        amount: number;
        status: string;
        period_date: string;
        description: string;
        payment_method?: string | null;
        payment_reference?: string | null;
        payment_note?: string | null;
        paid_at?: string | null;
    }[];
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
    payment_method?: string | null;
    payment_reference?: string | null;
    payment_note?: string | null;
    paid_at?: string | null;
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

export default function AdminKas({
    mahasiswaList,
    summary,
    ledger,
    pertemuanDates,
    filters,
    kasAmount,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'pembayaran' | 'buku-kas'>(
        'pembayaran',
    );
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelData, setCancelData] = useState<{ mahasiswaId: number, periodDate: string, studentName: string } | null>(null);
    const [deletePertemuanDialog, setDeletePertemuanDialog] = useState<{
        open: boolean;
        periodDate: string | null;
    }>({
        open: false,
        periodDate: null,
    });
    const [isDeletingPertemuan, setIsDeletingPertemuan] = useState(false);
    const [search, setSearch] = useState(filters.search);
    const [expandedDates, setExpandedDates] = useState<string[]>([]);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [statusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [paymentMethod, setPaymentMethod] =
        useState<KasPaymentMethod>('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [optimisticStatuses, setOptimisticStatuses] = useState<
        Record<string, 'paid' | 'unpaid'>
    >({});
    const [isOnline, setIsOnline] = useState(
        typeof navigator === 'undefined' ? true : navigator.onLine,
    );
    const [isSyncingKas, setIsSyncingKas] = useState(false);
    const [networkQuality, setNetworkQuality] = useState<NetworkQuality>(
        NetworkMonitor.getNetworkQuality(),
    );
    const syncInProgressRef = useRef(false);

    const expenseForm = useForm({
        amount: 0,
        description: '',
        category: 'pengeluaran',
        period_date: new Date().toISOString().split('T')[0],
    });

    const pertemuanForm = useForm({
        period_date: '',
    });

    const getStatusKey = (mahasiswaId: number, periodDate: string) =>
        `${mahasiswaId}:${periodDate}`;

    const refreshOfflineState = useCallback(() => {
        const queue = getPendingKasActions();
        const nextOverrides = queue.reduce<Record<string, 'paid' | 'unpaid'>>(
            (accumulator, item) => {
                accumulator[getStatusKey(item.mahasiswaId, item.periodDate)] =
                    item.status;

                return accumulator;
            },
            {},
        );

        setPendingSyncCount(queue.length);
        setOptimisticStatuses(nextOverrides);
    }, []);

    const flushPendingKasQueue = useCallback(async (showSuccessToast = false) => {
        if (syncInProgressRef.current) {
            return null;
        }

        syncInProgressRef.current = true;
        setIsSyncingKas(true);

        try {
            const result = await syncPendingKasActions();
            refreshOfflineState();

            if (result.successCount > 0) {
                router.reload({
                    only: ['mahasiswaList', 'summary', 'ledger', 'pertemuanDates'],
                    preserveScroll: true,
                    preserveState: true,
                });

                if (showSuccessToast) {
                    toast.success(
                        `${result.successCount} checklist kas berhasil disinkronkan.`,
                    );
                }
            }

            if (result.failedCount > 0) {
                toast.error(
                    result.errorMessages[0] ??
                        `${result.failedCount} checklist gagal disinkronkan.`,
                );
            } else if (
                showSuccessToast &&
                result.successCount === 0 &&
                pendingSyncCount > 0
            ) {
                toast.message('Belum ada data yang berhasil disinkronkan.');
            }

            return result;
        } finally {
            syncInProgressRef.current = false;
            setIsSyncingKas(false);
        }
    }, [pendingSyncCount, refreshOfflineState]);

    useEffect(() => {
        refreshOfflineState();
    }, [refreshOfflineState]);

    useEffect(() => {
        return NetworkMonitor.subscribe((quality) => {
            setNetworkQuality(quality);
            setIsOnline(quality.isOnline);
        });
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            void flushPendingKasQueue(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [flushPendingKasQueue]);

    useEffect(() => {
        if (!isOnline || pendingSyncCount === 0) {
            return;
        }

        const interval = window.setInterval(() => {
            void flushPendingKasQueue();
        }, 15000);

        return () => window.clearInterval(interval);
    }, [flushPendingKasQueue, isOnline, pendingSyncCount]);

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/kas',
            { ...filters, [key]: value },
            { preserveState: true },
        );
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
        router.post(
            '/admin/kas/create-pertemuan',
            {
                period_date: pertemuanForm.data.period_date,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPertemuanModal(false);
                    pertemuanForm.reset();
                },
            },
        );
    };

    const filteredMahasiswaList = mahasiswaList.filter((m) => {
        if (statusFilter === 'paid') return m.status === 'paid';
        if (statusFilter === 'unpaid') return m.status !== 'paid';
        return true;
    });

    const toggleExpand = (date: string) => {
        setExpandedDates((prev) =>
            prev.includes(date)
                ? prev.filter((d) => d !== date)
                : [...prev, date],
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const exportPdf = (
        type: 'pertemuan' | 'bulanan' | 'keseluruhan' | 'matrix',
    ) => {
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

    const paymentRate =
        summary.paid_count + summary.unpaid_count > 0
            ? (summary.paid_count /
                  (summary.paid_count + summary.unpaid_count)) *
              100
            : 0;

    // Matrix view helpers
    const monthDates = pertemuanDates
        .filter((date) => date.startsWith(filters.month))
        .sort();

    const getPaymentStatus = (
        student: MahasiswaKas,
        date: string,
    ): string | null => {
        const optimisticStatus = optimisticStatuses[getStatusKey(student.id, date)];
        if (optimisticStatus) {
            return optimisticStatus;
        }

        const record = student.records.find((r) => r.period_date === date);
        return record?.status || null;
    };

    const validatePaymentMetadata = () => {
        if (
            (paymentMethod === 'transfer' || paymentMethod === 'qris') &&
            !paymentReference.trim()
        ) {
            toast.error(
                paymentMethod === 'transfer'
                    ? 'Masukkan nomor rekening atau referensi transfer.'
                    : 'Masukkan data QRIS atau referensi QRIS.',
            );

            return false;
        }

        return true;
    };

    const handleMarkPaidForDate = async (
        mahasiswaId: number,
        periodDate: string,
    ) => {
        if (!validatePaymentMetadata()) {
            return;
        }

        const student = mahasiswaList.find((item) => item.id === mahasiswaId);

        upsertPendingKasAction({
            mahasiswaId,
            periodDate,
            status: 'paid',
            paymentMethod,
            paymentReference: paymentReference.trim() || undefined,
            paymentNote: paymentNote.trim() || undefined,
            studentName: student?.nama ?? 'Mahasiswa',
        });

        refreshOfflineState();

        if (!navigator.onLine) {
            toast.success(
                `Checklist ${student?.nama ?? 'mahasiswa'} disimpan offline dan akan disinkronkan otomatis.`,
            );
            return;
        }

        await flushPendingKasQueue();
    };

    const handleMarkUnpaidForDate = (mahasiswaId: number, periodDate: string, studentName: string) => {
        setCancelData({ mahasiswaId, periodDate, studentName });
        setShowCancelModal(true);
    };

    const confirmCancelKas = () => {
        if (!cancelData) return;
        upsertPendingKasAction({
            mahasiswaId: cancelData.mahasiswaId,
            periodDate: cancelData.periodDate,
            status: 'unpaid',
            paymentMethod: 'cash',
            studentName: cancelData.studentName,
        });
        refreshOfflineState();
        setShowCancelModal(false);
        setCancelData(null);

        if (!navigator.onLine) {
            toast.success(
                `Pembatalan lunas ${cancelData.studentName} disimpan offline.`,
            );
            return;
        }

        void flushPendingKasQueue();
    };

    const handleBulkMarkPaidForDate = (periodDate: string) => {
        const unpaidIds = mahasiswaList
            .filter((m) => {
                const status = getPaymentStatus(m, periodDate);
                return status === 'unpaid';
            })
            .map((m) => m.id);
        if (unpaidIds.length === 0) return;
        if (
            confirm(
                `Tandai ${unpaidIds.length} mahasiswa lunas untuk tanggal ini?`,
            )
        ) {
            if (!validatePaymentMetadata()) {
                return;
            }

            unpaidIds.forEach((mahasiswaId) => {
                const student = mahasiswaList.find((item) => item.id === mahasiswaId);

                upsertPendingKasAction({
                    mahasiswaId,
                    periodDate,
                    status: 'paid',
                    paymentMethod,
                    paymentReference: paymentReference.trim() || undefined,
                    paymentNote: paymentNote.trim() || undefined,
                    studentName: student?.nama ?? 'Mahasiswa',
                });
            });

            refreshOfflineState();

            if (!navigator.onLine) {
                toast.success(
                    `${unpaidIds.length} checklist kas disimpan offline.`,
                );
                return;
            }

            void flushPendingKasQueue();
        }
    };

    const getColumnStats = (date: string) => {
        let paid = 0,
            unpaid = 0;
        mahasiswaList.forEach((m) => {
            const status = getPaymentStatus(m, date);
            if (status === 'paid') paid++;
            else if (status === 'unpaid') unpaid++;
        });
        return { paid, unpaid, total: mahasiswaList.length };
    };

    const getStudentMonthStats = (student: MahasiswaKas) => {
        let paid = 0;
        monthDates.forEach((date) => {
            if (getPaymentStatus(student, date) === 'paid') paid++;
        });
        return {
            paid,
            total: monthDates.length,
            percentage:
                monthDates.length > 0
                    ? Math.round((paid / monthDates.length) * 100)
                    : 0,
        };
    };

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return {
            day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            date: d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
            }),
        };
    };

    const paymentMethodLabel = useMemo(() => {
        if (paymentMethod === 'transfer') {
            return 'Transfer';
        }

        if (paymentMethod === 'qris') {
            return 'QRIS';
        }

        return 'Tunai';
    }, [paymentMethod]);

    const handleDeletePertemuan = (periodDate: string) => {
        setDeletePertemuanDialog({
            open: true,
            periodDate,
        });
    };

    const handleManualSync = async () => {
        if (pendingSyncCount === 0) {
            toast.message('Tidak ada checklist kas yang perlu disinkronkan.');
            return;
        }

        if (!networkQuality.isOnline) {
            toast.error(
                'Perangkat sedang offline. Sinkronisasi akan berjalan saat koneksi kembali.',
            );
            return;
        }

        if (
            networkQuality.signalQuality === 'poor' ||
            networkQuality.effectiveType === '2g' ||
            networkQuality.effectiveType === 'slow-2g'
        ) {
            toast.warning(
                `Sinyal tidak stabil (${networkQuality.effectiveType}). Sinkronisasi mungkin lambat atau gagal.`,
            );
        } else {
            toast.loading('Menyiapkan sinkronisasi checklist kas...', {
                id: 'kas-sync-progress',
            });
        }

        const result = await flushPendingKasQueue(true);

        toast.dismiss('kas-sync-progress');

        if (!result) {
            toast.message('Sinkronisasi masih berjalan.');
            return;
        }

        if (result.successCount > 0 && result.failedCount === 0) {
            toast.success('Sinkronisasi kas selesai tanpa kendala.');
            return;
        }

        if (result.successCount > 0 && result.failedCount > 0) {
            toast.warning(
                `${result.successCount} berhasil, ${result.failedCount} masih tertunda karena koneksi/sinyal.`,
            );
            return;
        }

        if (result.failedCount > 0) {
            toast.error(
                result.errorMessages[0] ??
                    'Sinkronisasi gagal. Coba lagi saat sinyal lebih stabil.',
            );
        }
    };

    const confirmDeletePertemuan = () => {
        if (!deletePertemuanDialog.periodDate) {
            return;
        }

        setIsDeletingPertemuan(true);

        router.delete('/admin/kas/pertemuan', {
            data: {
                period_date: deletePertemuanDialog.periodDate,
            },
            preserveScroll: true,
            onSuccess: () => {
                removePendingKasActionsForDate(
                    deletePertemuanDialog.periodDate as string,
                );
                refreshOfflineState();
                setDeletePertemuanDialog({
                    open: false,
                    periodDate: null,
                });
                setIsDeletingPertemuan(false);
            },
            onError: () => {
                setIsDeletingPertemuan(false);
            },
            onFinish: () => {
                setIsDeletingPertemuan(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Uang Kas" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
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
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center p-1 sm:h-24 sm:w-24"
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
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Keuangan
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Uang Kas Kelas
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kas mingguan:{' '}
                                        {formatCurrency(kasAmount)} / mahasiswa
                                    </motion.p>
                                </div>
                            </div>

                            {/* Payment Rate Badge - Responsive */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-5 py-3 shadow-lg backdrop-blur-xl sm:w-auto sm:px-6"
                            >
                                <div className="shrink-0 rounded-lg bg-indigo-500/20 p-2">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-100">
                                        Tingkat Pembayaran
                                    </p>
                                    <p className="text-xl font-bold text-white sm:text-2xl">
                                        {paymentRate.toFixed(0)}%
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6 sm:flex-nowrap"
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor:
                                        'rgba(255, 255, 255, 0.25)',
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPertemuanModal(true)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:flex-none"
                            >
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span className="truncate">Buat Pertemuan</span>
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor:
                                        'rgba(255, 255, 255, 0.25)',
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowExpenseModal(true)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:flex-none"
                            >
                                <TrendingDown className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    Catat Pengeluaran
                                </span>
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor:
                                        'rgba(255, 255, 255, 0.25)',
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                    router.visit('/admin/kas-voting')
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:flex-none"
                            >
                                <Vote className="h-4 w-4 shrink-0" />
                                <span className="truncate">Voting Kas</span>
                            </motion.button>

                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor:
                                        'rgba(255, 255, 255, 0.25)',
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowExportModal(true)}
                                className="flex flex-[1_1_100%] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 sm:flex-none"
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
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6"
                >
                    {/* Balance Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('balance')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'balance' ? 1.5 : 1,
                                opacity: hoveredCard === 'balance' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
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
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Saldo Aktif
                                </p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {formatCurrency(summary.total_balance)}
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-amber-500/10 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'status' ? 1.5 : 1,
                                opacity: hoveredCard === 'status' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-500 blur-3xl transition-all duration-500"
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
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Status Pembayaran
                                </p>
                                <p className="mt-1 text-sm">
                                    <span className="text-lg font-bold text-emerald-600">
                                        {summary.paid_count}
                                    </span>{' '}
                                    <span className="text-xs text-neutral-400">
                                        Lunas
                                    </span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Navigation Tabs - Modern Pills */}
                <motion.div
                    variants={itemVariants}
                    className="flex w-fit gap-1 rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
                >
                    <motion.button
                        layout
                        onClick={() => setActiveTab('pembayaran')}
                        className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                            activeTab === 'pembayaran'
                                ? 'text-emerald-700 shadow-sm dark:text-emerald-300'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                        }`}
                    >
                        {activeTab === 'pembayaran' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                transition={{
                                    type: 'spring',
                                    bounce: 0.2,
                                    duration: 0.6,
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Pembayaran Mahasiswa
                        </span>
                    </motion.button>

                    <motion.button
                        layout
                        onClick={() => setActiveTab('buku-kas')}
                        className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                            activeTab === 'buku-kas'
                                ? 'text-emerald-700 shadow-sm dark:text-emerald-300'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                        }`}
                    >
                        {activeTab === 'buku-kas' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                transition={{
                                    type: 'spring',
                                    bounce: 0.2,
                                    duration: 0.6,
                                }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Buku Kas
                        </span>
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
                            className="space-y-4"
                        >
                            {/* Compact Filters - Modern Glass */}
                            <motion.div
                                variants={itemVariants}
                                className="space-y-4 rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                            >
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="min-w-[200px] flex-1">
                                        <div className="relative">
                                            <Search className="-tranneutral-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === 'Enter' &&
                                                    handleFilter(
                                                        'search',
                                                        search,
                                                    )
                                                }
                                                placeholder="Cari mahasiswa..."
                                                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-4 pl-10 text-sm dark:border-neutral-700 dark:bg-black dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="month"
                                        value={filters.month}
                                        onChange={(e) =>
                                            handleFilter(
                                                'month',
                                                e.target.value,
                                            )
                                        }
                                        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-black dark:text-white"
                                    />
                                </div>
                                <div className="grid gap-3 border-t border-neutral-200 pt-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] dark:border-neutral-800">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                            Metode Checklist
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target
                                                        .value as KasPaymentMethod,
                                                )
                                            }
                                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-black dark:text-white"
                                        >
                                            <option value="cash">Tunai</option>
                                            <option value="transfer">
                                                Transfer
                                            </option>
                                            <option value="qris">QRIS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                            Referensi {paymentMethodLabel}
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentReference}
                                            onChange={(e) =>
                                                setPaymentReference(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={
                                                paymentMethod === 'transfer'
                                                    ? 'Nomor rekening / bukti transfer'
                                                    : paymentMethod === 'qris'
                                                      ? 'Isi QRIS / tautan / keterangan QRIS'
                                                      : 'Opsional untuk tunai'
                                            }
                                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                            Catatan Pembayaran
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentNote}
                                            onChange={(e) =>
                                                setPaymentNote(e.target.value)
                                            }
                                            placeholder="Contoh: transfer mobile banking"
                                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-black dark:text-white"
                                        />
                                    </div>
                                </div>
                                {(pendingSyncCount > 0 || !isOnline) && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                                        <div>
                                            <p className="font-semibold text-amber-800 dark:text-amber-200">
                                                {!isOnline
                                                    ? 'Mode offline aktif'
                                                    : 'Sinkronisasi kas tertunda'}
                                            </p>
                                            <p className="text-amber-700/90 dark:text-amber-200/80">
                                                {pendingSyncCount} checklist belum
                                                masuk server dan akan dikirim
                                                otomatis saat koneksi stabil.
                                            </p>
                                            <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-200/70">
                                                Status jaringan: {networkQuality.signalQuality}
                                                {networkQuality.effectiveType !==
                                                'unknown'
                                                    ? ` • ${networkQuality.effectiveType}`
                                                    : ''}
                                                {networkQuality.rtt > 0
                                                    ? ` • ping ${networkQuality.rtt}ms`
                                                    : ''}
                                            </p>
                                        </div>
                                        {isOnline && pendingSyncCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleManualSync()
                                                }
                                                disabled={
                                                    isSyncingKas ||
                                                    pendingSyncCount === 0
                                                }
                                                className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-500/30 dark:bg-black/20 dark:text-amber-200"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Loader2
                                                        className={`h-3.5 w-3.5 ${isSyncingKas ? 'animate-spin' : ''}`}
                                                    />
                                                    {isSyncingKas
                                                        ? 'Sinkronisasi...'
                                                        : 'Sinkronkan Sekarang'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* Month Summary */}
                                <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            {new Date(
                                                filters.month + '-01',
                                            ).toLocaleDateString('id-ID', {
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="text-neutral-500">
                                            Pertemuan:
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            {monthDates.length}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="text-neutral-500">
                                            Mahasiswa:
                                        </span>
                                        <span className="font-bold text-neutral-900 dark:text-white">
                                            {filteredMahasiswaList.length}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <span className="text-neutral-500">
                                            Lunas:
                                        </span>
                                        <span className="font-bold text-emerald-600">
                                            {summary.paid_count}
                                        </span>
                                        <span className="text-neutral-400">
                                            /
                                        </span>
                                        <span className="text-neutral-500">
                                            Belum:
                                        </span>
                                        <span className="font-bold text-red-500">
                                            {summary.unpaid_count}
                                        </span>
                                    </div>
                                </div>
                                {monthDates.length > 0 && (
                                    <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                            <span>Hapus Pertemuan</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {monthDates.map((date) => {
                                                const formattedDate =
                                                    new Date(
                                                        `${date}T00:00:00`,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    );

                                                return (
                                                    <button
                                                        key={`delete-chip-${date}`}
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeletePertemuan(
                                                                date,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-500/35 hover:bg-red-500/15 dark:text-red-400"
                                                        title={`Hapus pertemuan ${formattedDate}`}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>
                                                            {formattedDate}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Matrix Grid */}
                            {monthDates.length === 0 ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/50 p-16 text-center dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <Calendar className="h-10 w-10 text-neutral-400" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
                                        Belum ada pertemuan
                                    </h3>
                                    <p className="mx-auto mb-6 max-w-sm text-neutral-500 dark:text-neutral-400">
                                        Mulai dengan membuat pertemuan baru
                                        untuk menagih uang kas kepada mahasiswa.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            setShowPertemuanModal(true)
                                        }
                                        className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700"
                                    >
                                        + Buat Pertemuan Baru
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={itemVariants}
                                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40"
                                >
                                    {/* Legend */}
                                    <div className="flex flex-wrap items-center gap-4 border-b border-neutral-200 bg-neutral-50/50 p-3 px-4 dark:border-neutral-800 dark:bg-black/50">
                                        <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                            Keterangan:
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/20">
                                                <Check className="h-3 w-3 text-emerald-600" />
                                            </div>
                                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                                Lunas
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-red-500/25 bg-red-500/15">
                                                <X className="h-3 w-3 text-red-500" />
                                            </div>
                                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                                Belum Bayar{' '}
                                                <span className="font-medium text-emerald-600">
                                                    (klik = tandai lunas)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-5 w-5 rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800" />
                                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                                Belum Ada Tagihan
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-max border-collapse">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black">
                                                    <th className="w-10 border-r border-neutral-200 px-3 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase dark:border-neutral-800 dark:text-neutral-400">
                                                        No
                                                    </th>
                                                    <th className="min-w-[200px] border-r border-neutral-200 px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase dark:border-neutral-800 dark:text-neutral-400">
                                                        Mahasiswa
                                                    </th>
                                                    {monthDates.map((date) => {
                                                        const {
                                                            day,
                                                            date: dateStr,
                                                        } =
                                                            formatShortDate(
                                                                date,
                                                            );
                                                        const stats =
                                                            getColumnStats(
                                                                date,
                                                            );
                                                        const allPaid =
                                                            stats.unpaid ===
                                                                0 &&
                                                            stats.paid > 0;
                                                        return (
                                                            <th
                                                                key={date}
                                                                className="min-w-[72px] border-r border-neutral-200/50 px-1.5 py-2 text-center dark:border-neutral-800/50"
                                                            >
                                                                <div className="text-[10px] font-medium text-neutral-400 uppercase">
                                                                    {day}
                                                                </div>
                                                                <div className="mt-0.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                                    {dateStr}
                                                                </div>
                                                                <div className="mt-1 flex items-center justify-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            event,
                                                                        ) => {
                                                                            event.stopPropagation();
                                                                            handleDeletePertemuan(
                                                                                date,
                                                                            );
                                                                        }}
                                                                        className="rounded-md border border-red-500/20 bg-red-500/10 p-1 text-red-500 transition hover:border-red-500/35 hover:bg-red-500/15"
                                                                        title="Hapus pertemuan kas ini"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                                <div
                                                                    className={`mt-1 text-[10px] font-semibold ${allPaid ? 'text-emerald-600' : 'text-neutral-400'}`}
                                                                >
                                                                    {stats.paid}
                                                                    /
                                                                    {stats.paid +
                                                                        stats.unpaid}
                                                                </div>
                                                                {stats.unpaid >
                                                                    0 && (
                                                                    <motion.button
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                        }}
                                                                        whileTap={{
                                                                            scale: 0.9,
                                                                        }}
                                                                        onClick={() =>
                                                                            handleBulkMarkPaidForDate(
                                                                                date,
                                                                            )
                                                                        }
                                                                        className="mt-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/20"
                                                                        title={`Tandai semua lunas (${stats.unpaid} tersisa)`}
                                                                    >
                                                                        ✓ All
                                                                    </motion.button>
                                                                )}
                                                            </th>
                                                        );
                                                    })}
                                                    <th className="min-w-[120px] border-l-2 border-neutral-200 px-3 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:border-neutral-700 dark:text-neutral-400">
                                                        Progress Bulan
                                                    </th>
                                                    <th className="min-w-[120px] border-l border-neutral-200 px-3 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase dark:border-neutral-700 dark:text-neutral-400">
                                                        Total Tunggakan
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                                {filteredMahasiswaList.map(
                                                    (m, index) => {
                                                        const monthStats =
                                                            getStudentMonthStats(
                                                                m,
                                                            );
                                                        return (
                                                            <motion.tr
                                                                key={m.id}
                                                                initial={{
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                }}
                                                                transition={{
                                                                    delay: Math.min(
                                                                        index *
                                                                            0.015,
                                                                        0.4,
                                                                    ),
                                                                }}
                                                                className="group transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.03]"
                                                            >
                                                                <td className="border-r border-neutral-200 px-4 py-3 text-xs font-medium text-neutral-400 transition-colors group-hover:bg-emerald-50/50 dark:border-neutral-800 dark:group-hover:bg-emerald-500/[0.05]">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="border-r border-neutral-200 px-5 py-3 transition-colors group-hover:bg-emerald-50/50 dark:border-neutral-800 dark:group-hover:bg-emerald-500/[0.05]">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 text-[10px] font-bold text-neutral-600 dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-400">
                                                                            {m.nama
                                                                                .substring(
                                                                                    0,
                                                                                    2,
                                                                                )
                                                                                .toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="max-w-[180px] truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                                                {
                                                                                    m.nama
                                                                                }
                                                                            </p>
                                                                            <p className="font-mono text-[10px] tracking-wide text-neutral-400">
                                                                                {
                                                                                    m.nim
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {monthDates.map(
                                                                    (date) => {
                                                                        const status =
                                                                            getPaymentStatus(
                                                                                m,
                                                                                date,
                                                                            );
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    date
                                                                                }
                                                                                className="border-r border-neutral-100/50 px-1 py-1.5 text-center dark:border-neutral-800/30"
                                                                            >
                                                                                {status ===
                                                                                'paid' ? (
                                                                                    <motion.button
                                                                                        whileHover={{
                                                                                            scale: 1.15,
                                                                                        }}
                                                                                        whileTap={{
                                                                                            scale: 0.85,
                                                                                        }}
                                                                                        onClick={() => handleMarkUnpaidForDate(m.id, date, m.nama)}
                                                                                        className="group/cell mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/15 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/15"
                                                                                        title="Klik untuk membatalkan lunas"
                                                                                    >
                                                                                        <Check className="h-4 w-4 text-emerald-600 group-hover/cell:hidden dark:text-emerald-400" />
                                                                                        <X className="hidden h-4 w-4 text-red-500 group-hover/cell:block" />
                                                                                    </motion.button>
                                                                                ) : status ===
                                                                                  'unpaid' ? (
                                                                                    <motion.button
                                                                                        whileHover={{
                                                                                            scale: 1.15,
                                                                                        }}
                                                                                        whileTap={{
                                                                                            scale: 0.85,
                                                                                        }}
                                                                                        onClick={() =>
                                                                                            handleMarkPaidForDate(
                                                                                                m.id,
                                                                                                date,
                                                                                            )
                                                                                        }
                                                                                        className="group/cell mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/15"
                                                                                        title="Klik untuk tandai lunas"
                                                                                    >
                                                                                        <X className="h-4 w-4 text-red-400 group-hover/cell:hidden" />
                                                                                        <Check className="hidden h-4 w-4 text-emerald-500 group-hover/cell:block" />
                                                                                    </motion.button>
                                                                                ) : (
                                                                                    <div className="mx-auto h-8 w-8 rounded-lg border border-neutral-200/60 bg-neutral-50 dark:border-neutral-700/30 dark:bg-neutral-800/30" />
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    },
                                                                )}
                                                                <td className="border-l-2 border-neutral-200 px-3 py-2.5 dark:border-neutral-700">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                                            <motion.div
                                                                                initial={{
                                                                                    width: 0,
                                                                                }}
                                                                                animate={{
                                                                                    width: `${monthStats.percentage}%`,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.8,
                                                                                    delay: Math.min(
                                                                                        index *
                                                                                            0.03,
                                                                                        0.5,
                                                                                    ),
                                                                                    ease: 'easeOut',
                                                                                }}
                                                                                className={`h-full rounded-full ${monthStats.percentage === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : monthStats.percentage >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
                                                                            />
                                                                        </div>
                                                                        <span
                                                                            className={`w-10 text-right text-[11px] font-bold tabular-nums ${monthStats.percentage === 100 ? 'text-emerald-600' : monthStats.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}
                                                                        >
                                                                            {
                                                                                monthStats.paid
                                                                            }
                                                                            /
                                                                            {
                                                                                monthStats.total
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="border-l border-neutral-200 px-3 py-2.5 text-center dark:border-neutral-700">
                                                                    {m.global_unpaid > 0 ? (
                                                                        <div className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
                                                                            <X className="h-3 w-3" />
                                                                            {formatCurrency(m.global_unpaid)}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                                            <Check className="h-3 w-3" />
                                                                            Lunas Total
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                            {filteredMahasiswaList.length >
                                                0 && (
                                                <tfoot>
                                                    <tr className="border-t-2 border-neutral-200 bg-gradient-to-r from-neutral-100 to-neutral-50 dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-950">
                                                        <td
                                                            colSpan={2}
                                                            className="border-r border-neutral-200 bg-neutral-100 px-4 py-3 text-xs font-bold text-neutral-700 uppercase dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Target className="h-4 w-4 text-emerald-500" />
                                                                TOTAL LUNAS
                                                                (Verified)
                                                            </div>
                                                        </td>
                                                        {monthDates.map(
                                                            (date) => {
                                                                const stats =
                                                                    getColumnStats(
                                                                        date,
                                                                    );
                                                                const allPaid =
                                                                    stats.unpaid ===
                                                                        0 &&
                                                                    stats.paid >
                                                                        0;
                                                                return (
                                                                    <td
                                                                        key={
                                                                            date
                                                                        }
                                                                        className="border-r border-neutral-200/50 px-2 py-3 text-center dark:border-neutral-800/50"
                                                                    >
                                                                        <span
                                                                            className={`text-xs font-bold ${allPaid ? 'text-emerald-600' : 'text-neutral-500'}`}
                                                                        >
                                                                            {
                                                                                stats.paid
                                                                            }
                                                                            /
                                                                            {stats.paid +
                                                                                stats.unpaid}
                                                                        </span>
                                                                        {allPaid && (
                                                                            <div className="text-[9px] font-medium text-emerald-500">
                                                                                ✓
                                                                                Lengkap
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            },
                                                        )}
                                                        <td className="border-l-2 border-neutral-200 px-3 py-3 text-center dark:border-neutral-700">
                                                            <div className="text-xs font-bold text-emerald-600">
                                                                {
                                                                    summary.paid_count
                                                                }{' '}
                                                                Lunas
                                                            </div>
                                                            <div className="text-[10px] font-medium text-red-500">
                                                                {
                                                                    summary.unpaid_count
                                                                }{' '}
                                                                Belum
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'buku-kas' && (
                        <motion.div
                            key="buku-kas"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/10 bg-white/40 p-6 backdrop-blur-md dark:bg-neutral-900/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Buku Kas - Rekap Per Pertemuan
                                        </h2>
                                        <p className="mt-1 text-xs font-medium text-neutral-500">
                                            Klik baris untuk melihat detail
                                            transaksi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ledger Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50">
                                            <th className="w-8 px-5 py-4 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400"></th>
                                            <th className="px-5 py-4 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                Tanggal Pertemuan
                                            </th>
                                            <th className="px-5 py-4 text-right text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                Uang Masuk
                                            </th>
                                            <th className="px-5 py-4 text-right text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                Uang Keluar
                                            </th>
                                            <th className="px-5 py-4 text-right text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                Saldo
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {ledger.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-12 text-center text-neutral-500"
                                                >
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.8,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                            <Receipt className="h-8 w-8 text-neutral-400" />
                                                        </div>
                                                        <p className="font-medium">
                                                            Belum ada transaksi
                                                        </p>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        ) : (
                                            ledger.map((item) => (
                                                <>
                                                    <motion.tr
                                                        key={item.date}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: 0.2,
                                                        }}
                                                        whileHover={{
                                                            backgroundColor:
                                                                'rgba(255, 255, 255, 0.5)',
                                                        }}
                                                        className="cursor-pointer transition-colors hover:bg-white/50 dark:hover:bg-neutral-800/50"
                                                        onClick={() =>
                                                            toggleExpand(
                                                                item.date,
                                                            )
                                                        }
                                                    >
                                                        <td className="px-5 py-4">
                                                            <motion.div
                                                                animate={{
                                                                    rotate: expandedDates.includes(
                                                                        item.date,
                                                                    )
                                                                        ? 90
                                                                        : 0,
                                                                }}
                                                                transition={{
                                                                    duration: 0.3,
                                                                }}
                                                            >
                                                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                                                            </motion.div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                {
                                                                    item.display_date
                                                                }
                                                            </p>
                                                        </td>
                                                        <td className="px-5 py-4 text-right text-sm font-bold text-emerald-600">
                                                            +
                                                            {formatCurrency(
                                                                item.income,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right text-sm font-bold text-red-600">
                                                            -
                                                            {formatCurrency(
                                                                item.expense,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right text-sm font-bold text-violet-600">
                                                            {formatCurrency(
                                                                item.balance,
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                    <AnimatePresence>
                                                        {expandedDates.includes(
                                                            item.date,
                                                        ) && (
                                                            <motion.tr
                                                                key={`${item.date}-detail`}
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: 'auto',
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                transition={{
                                                                    duration: 0.3,
                                                                }}
                                                            >
                                                                <td
                                                                    colSpan={5}
                                                                    className="bg-neutral-50/50 px-5 py-4 shadow-inner dark:bg-black/30"
                                                                >
                                                                    <div className="space-y-2 border-l-2 border-neutral-200 pl-4 dark:border-neutral-700">
                                                                        {item.transactions.map(
                                                                            (
                                                                                t,
                                                                                tIndex,
                                                                            ) => (
                                                                                <motion.div
                                                                                    key={
                                                                                        t.id
                                                                                    }
                                                                                    initial={{
                                                                                        opacity: 0,
                                                                                        x: -20,
                                                                                    }}
                                                                                    animate={{
                                                                                        opacity: 1,
                                                                                        x: 0,
                                                                                    }}
                                                                                    transition={{
                                                                                        delay:
                                                                                            tIndex *
                                                                                            0.05,
                                                                                    }}
                                                                                    className="flex items-center justify-between rounded-xl border border-white/20 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/60"
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <motion.span
                                                                                            whileHover={{
                                                                                                scale: 1.05,
                                                                                            }}
                                                                                            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}
                                                                                        >
                                                                                            {t.type ===
                                                                                            'income'
                                                                                                ? 'Masuk'
                                                                                                : 'Keluar'}
                                                                                        </motion.span>
                                                                                        <div>
                                                                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                                                                {t.type ===
                                                                                                    'income' &&
                                                                                                t.mahasiswa
                                                                                                    ? t.mahasiswa
                                                                                                    : t.description}
                                                                                            </span>
                                                                                            {t.type ===
                                                                                                'income' &&
                                                                                                t.payment_method && (
                                                                                                <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                                                                                    Metode:{' '}
                                                                                                    <span className="font-semibold uppercase text-neutral-700 dark:text-neutral-200">
                                                                                                        {
                                                                                                            t.payment_method
                                                                                                        }
                                                                                                    </span>
                                                                                                    {t.payment_reference
                                                                                                        ? ` • ${t.payment_reference}`
                                                                                                        : ''}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <span
                                                                                        className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                                                                                    >
                                                                                        {t.type ===
                                                                                        'income'
                                                                                            ? '+'
                                                                                            : '-'}
                                                                                        {formatCurrency(
                                                                                            t.amount,
                                                                                        )}
                                                                                    </span>
                                                                                </motion.div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            ))
                                        )}
                                    </tbody>

                                    {ledger.length > 0 && (
                                        <tfoot>
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="border-t border-neutral-800 bg-neutral-900 text-white dark:border-neutral-200 dark:bg-white dark:text-neutral-900"
                                            >
                                                <td
                                                    colSpan={2}
                                                    className="px-5 py-4 text-sm font-bold"
                                                >
                                                    TOTAL KESELURUHAN
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-bold text-emerald-400 dark:text-emerald-600">
                                                    +
                                                    {formatCurrency(
                                                        summary.total_income,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-bold text-red-400 dark:text-red-600">
                                                    -
                                                    {formatCurrency(
                                                        summary.total_expense,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-bold">
                                                    {formatCurrency(
                                                        summary.total_balance,
                                                    )}
                                                </td>
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                            onClick={() => setShowPertemuanModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                            >
                                                <Calendar className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    Buat Pertemuan
                                                </h3>
                                                <p className="mt-1 text-xs text-indigo-100">
                                                    Buat tagihan kas baru
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowPertemuanModal(false)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <form
                                        onSubmit={handleCreatePertemuan}
                                        className="space-y-5"
                                    >
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Tanggal Pertemuan
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={
                                                        pertemuanForm.data
                                                            .period_date
                                                    }
                                                    onChange={(e) =>
                                                        pertemuanForm.setData(
                                                            'period_date',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm shadow-sm transition-all focus:border-emerald-500 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                                                    required
                                                />
                                                <Calendar className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                                        >
                                            <div className="flex gap-3">
                                                <Zap className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                                    Setiap mahasiswa akan
                                                    ditagih{' '}
                                                    <span className="font-bold">
                                                        {formatCurrency(
                                                            kasAmount,
                                                        )}
                                                    </span>
                                                    .
                                                </p>
                                            </div>
                                        </motion.div>

                                        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={() =>
                                                    setShowPertemuanModal(false)
                                                }
                                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={
                                                    pertemuanForm.processing
                                                }
                                                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 disabled:opacity-50 disabled:shadow-none"
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                            onClick={() => setShowExpenseModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                            >
                                                <TrendingDown className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    Catat Pengeluaran
                                                </h3>
                                                <p className="mt-1 text-xs text-red-100">
                                                    Rekam pengeluaran kas rutin
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowExpenseModal(false)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <form
                                        onSubmit={handleAddExpense}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Jumlah (Rp)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-medium text-neutral-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    value={
                                                        expenseForm.data
                                                            .amount || ''
                                                    }
                                                    onChange={(e) =>
                                                        expenseForm.setData(
                                                            'amount',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    placeholder="50000"
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-3 pr-4 pl-10 text-lg font-bold text-neutral-900 shadow-sm transition-all focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                                                    required
                                                    min={1}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Keterangan
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    expenseForm.data.description
                                                }
                                                onChange={(e) =>
                                                    expenseForm.setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Beli spidol, Cetak dokumen"
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm shadow-sm transition-all focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                    Kategori
                                                </label>
                                                <select
                                                    value={
                                                        expenseForm.data
                                                            .category
                                                    }
                                                    onChange={(e) =>
                                                        expenseForm.setData(
                                                            'category',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm shadow-sm transition-all focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                                                >
                                                    <option value="pengeluaran">
                                                        Umum
                                                    </option>
                                                    <option value="kegiatan">
                                                        Kegiatan
                                                    </option>
                                                    <option value="perlengkapan">
                                                        Perlengkapan
                                                    </option>
                                                    <option value="lainnya">
                                                        Lainnya
                                                    </option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                    Tanggal
                                                </label>
                                                <input
                                                    type="date"
                                                    value={
                                                        expenseForm.data
                                                            .period_date
                                                    }
                                                    onChange={(e) =>
                                                        expenseForm.setData(
                                                            'period_date',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm shadow-sm transition-all focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={() =>
                                                    setShowExpenseModal(false)
                                                }
                                                className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={
                                                    expenseForm.processing
                                                }
                                                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50 disabled:opacity-50 disabled:shadow-none"
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                            onClick={() => setShowExportModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                            >
                                                <Download className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    Export Laporan
                                                </h3>
                                                <p className="mt-1 text-xs text-cyan-100">
                                                    Unduh data kas
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowExportModal(false)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="grid gap-4 p-6">
                                    {filters.pertemuan !== 'all' && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                exportPdf('pertemuan')
                                            }
                                            className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50/50 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-violet-500/50 dark:hover:bg-violet-900/10"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-500/20 dark:text-violet-400 dark:group-hover:bg-violet-500/30">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-bold text-neutral-900 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
                                                    Per Pertemuan
                                                </p>
                                                <p className="text-xs font-medium text-neutral-500 group-hover:text-violet-600/70 dark:text-neutral-400">
                                                    Data pertemuan yang dipilih
                                                </p>
                                            </div>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 transition-colors group-hover:bg-violet-100 dark:bg-neutral-700 dark:group-hover:bg-violet-900/30">
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
                                        className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-purple-300 hover:bg-purple-50/50 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-purple-500/50 dark:hover:bg-purple-900/10"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-500/20 dark:text-purple-400 dark:group-hover:bg-purple-500/30">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-neutral-900 transition-colors group-hover:text-purple-700 dark:text-white dark:group-hover:text-purple-300">
                                                Laporan Bulanan
                                            </p>
                                            <p className="text-xs font-medium text-neutral-500 group-hover:text-purple-600/70 dark:text-neutral-400">
                                                Rekapitulasi bulan{' '}
                                                {new Date(
                                                    filters.month,
                                                ).toLocaleDateString('id-ID', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 transition-colors group-hover:bg-purple-100 dark:bg-neutral-700 dark:group-hover:bg-purple-900/30">
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
                                        className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-900/10"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500/30">
                                            <Printer className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-neutral-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                                                Semua Data
                                            </p>
                                            <p className="text-xs font-medium text-neutral-500 group-hover:text-emerald-600/70 dark:text-neutral-400">
                                                Arsip lengkap dari awal
                                            </p>
                                        </div>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 transition-colors group-hover:bg-emerald-100 dark:bg-neutral-700 dark:group-hover:bg-emerald-900/30">
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
                                        className="group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-4 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/10 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-110">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-indigo-900 transition-colors group-hover:text-indigo-950 dark:text-indigo-100 dark:group-hover:text-white">
                                                Export Matrix Excel
                                            </p>
                                            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                                Tabel checklist pembayaran
                                            </p>
                                        </div>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-200/50 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-800/50 dark:group-hover:bg-indigo-800">
                                            <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                        </div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ConfirmDialog
                    open={deletePertemuanDialog.open}
                    onOpenChange={(open) =>
                        setDeletePertemuanDialog({
                            open,
                            periodDate: open
                                ? deletePertemuanDialog.periodDate
                                : null,
                        })
                    }
                    onConfirm={confirmDeletePertemuan}
                    title="Hapus Pertemuan Kas"
                    message={
                        deletePertemuanDialog.periodDate
                            ? `Yakin ingin menghapus pertemuan kas ${new Date(
                                  deletePertemuanDialog.periodDate +
                                      'T00:00:00',
                              ).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                              })}? Semua tagihan kas pada tanggal ini akan dihapus.`
                            : 'Yakin ingin menghapus pertemuan kas ini?'
                    }
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                    loading={isDeletingPertemuan}
                />

                {/* Cancel Kas Modal - Advanced Glassmorphism */}
                <AnimatePresence>
                    {showCancelModal && cancelData && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCancelModal(false)}
                                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm dark:bg-black/60"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/80"
                            >
                                <div className="p-6 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                                        <X className="h-8 w-8" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                                        Batalkan Pembayaran?
                                    </h3>
                                    <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                                        Anda yakin ingin membatalkan status lunas untuk{' '}
                                        <strong className="text-neutral-900 dark:text-white">{cancelData.studentName}</strong>{' '}
                                        pada pertemuan <strong className="text-neutral-900 dark:text-white">{cancelData.periodDate}</strong>?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCancelModal(false)}
                                            className="flex-1 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                        >
                                            Kembali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={confirmCancelKas}
                                            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-700 hover:shadow-red-500/50"
                                        >
                                            Ya, Batalkan
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
}
