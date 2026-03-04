import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    Eye,
    Sparkles,
    Users,
    Vote,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import DisetujuiVotingIcon from '@/assets/admin/voting-kas/disetujui.png';
import DitolakVotingIcon from '@/assets/admin/voting-kas/ditolak.png';
import SedangVotingIcon from '@/assets/admin/voting-kas/icon-coting.png';
import TotalVotingIcon from '@/assets/admin/voting-kas/total.png';
import VotingKasIcon from '@/assets/admin/voting-kas/voting.png';

interface Voter {
    id: number;
    nama: string;
    nim: string;
}

interface VoteDetail {
    id: number;
    mahasiswa: Voter | null;
    vote: 'approve' | 'reject';
    comment: string | null;
    created_at: string;
}

interface VotingItem {
    id: number;
    title: string;
    description: string;
    amount: number;
    category: string;
    status: 'open' | 'approved' | 'rejected' | 'closed';
    creator: Voter | null;
    voting_deadline: string;
    is_expired: boolean;
    min_votes: number;
    approval_threshold: number;
    stats: {
        approve: number;
        reject: number;
        total: number;
        approval_percentage: number;
        is_valid: boolean;
    };
    votes: VoteDetail[];
    created_at: string;
}

interface Props {
    votings: VotingItem[];
    stats: {
        total: number;
        open: number;
        approved: number;
        rejected: number;
        closed: number;
    };
    filters: { status: string };
}

const categories: Record<
    string,
    { label: string; icon: string; color: string }
> = {
    kegiatan: {
        label: 'Kegiatan Kelas',
        icon: '🎉',
        color: 'bg-purple-100 text-purple-700',
    },
    perlengkapan: {
        label: 'Perlengkapan',
        icon: '📦',
        color: 'bg-blue-100 text-blue-700',
    },
    konsumsi: {
        label: 'Konsumsi',
        icon: '🍕',
        color: 'bg-orange-100 text-orange-700',
    },
    donasi: {
        label: 'Donasi/Sosial',
        icon: '❤️',
        color: 'bg-pink-100 text-pink-700',
    },
    lainnya: {
        label: 'Lainnya',
        icon: '📋',
        color: 'bg-slate-100 text-slate-700',
    },
};

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kas Voting', href: '/admin/kas-voting' },
];

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
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

const cardVariants: Variants = {
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

export default function AdminKasVoting({ votings, stats, filters }: Props) {
    const [selectedVoting, setSelectedVoting] = useState<VotingItem | null>(
        null,
    );
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState(filters.status);
    const [approveDialog, setApproveDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [closeDialog, setCloseDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [finalizeDialog, setFinalizeDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const openApproveDialog = (id: number) =>
        setApproveDialog({ open: true, id });
    const handleApprove = () => {
        if (!approveDialog.id) return;
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${approveDialog.id}/approve`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setApproveDialog({ open: false, id: null });
                },
            },
        );
    };

    const handleReject = (votingId: number) => {
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${votingId}/reject`,
            { reason: rejectReason },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowRejectDialog(false);
                    setRejectReason('');
                },
            },
        );
    };

    const handleClose = () => {
        if (!closeDialog.id) return;
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${closeDialog.id}/close`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setCloseDialog({ open: false, id: null });
                },
            },
        );
    };

    const handleFinalize = () => {
        if (!finalizeDialog.id) return;
        setProcessing(true);
        router.post(
            `/admin/kas-voting/${finalizeDialog.id}/finalize`,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setFinalizeDialog({ open: false, id: null });
                },
            },
        );
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get(
            '/admin/kas-voting',
            { status: tab },
            { preserveState: true },
        );
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'open':
                return {
                    icon: Clock,
                    label: 'Voting Aktif',
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                };
            case 'approved':
                return {
                    icon: CheckCircle,
                    label: 'Disetujui',
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-700',
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    label: 'Ditolak',
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                };
            case 'closed':
                return {
                    icon: AlertTriangle,
                    label: 'Ditutup',
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                };
            default:
                return {
                    icon: Vote,
                    label: status,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getCategoryConfig = (cat: string) =>
        categories[cat] || categories.lainnya;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin - Kas Voting" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* Animated Header with Dashboard Ultra Advanced Style */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl"
                    style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1500px',
                    }}
                >
                    {/* Ultra Advanced Animated Background Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.4, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-white/30 to-indigo-200/30 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            rotate: [360, 180, 0],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-purple-300/30 to-pink-400/30 blur-3xl"
                    />

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-6">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24"
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
                                        src={VotingKasIcon}
                                        alt="Voting Kas"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-indigo-100 sm:justify-start"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Manajemen Keuangan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-1 text-2xl font-bold sm:text-3xl"
                                    >
                                        Voting Pengeluaran Kas
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:text-base"
                                    >
                                        Kelola dan pantau voting pengeluaran kas
                                        mahasiswa secara transparan dan
                                        real-time
                                    </motion.p>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 flex flex-wrap justify-center gap-3 border-t border-white/10 pt-6 sm:justify-start"
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor:
                                        'rgba(255, 255, 255, 0.25)',
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.visit('/admin/kas')}
                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Lihat Kas Kelas
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Cards - Animated */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                >
                    {[
                        {
                            image: TotalVotingIcon,
                            label: 'Total',
                            value: stats.total,
                            shadowColor: 'hover:shadow-blue-500/10',
                            glow: 'bg-blue-500',
                            innerGrad:
                                'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
                        },
                        {
                            image: SedangVotingIcon,
                            label: 'Voting',
                            value: stats.open,
                            shadowColor: 'hover:shadow-violet-500/10',
                            glow: 'bg-violet-500',
                            innerGrad:
                                'from-violet-500/5 to-fuchsia-500/5 dark:from-violet-500/10 dark:to-fuchsia-500/10',
                        },
                        {
                            image: DisetujuiVotingIcon,
                            label: 'Disetujui',
                            value: stats.approved,
                            shadowColor: 'hover:shadow-emerald-500/10',
                            glow: 'bg-emerald-500',
                            innerGrad:
                                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                        },
                        {
                            image: DitolakVotingIcon,
                            label: 'Ditolak',
                            value: stats.rejected,
                            shadowColor: 'hover:shadow-red-500/10',
                            glow: 'bg-red-500',
                            innerGrad:
                                'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            whileHover="hover"
                            onHoverStart={() => setHoveredCard(`stat-${index}`)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:bg-neutral-900/40 ${stat.shadowColor} dark:border-white/5`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.innerGrad}`}
                            />
                            <motion.div
                                animate={{
                                    scale:
                                        hoveredCard === `stat-${index}`
                                            ? 1.5
                                            : 1,
                                    opacity:
                                        hoveredCard === `stat-${index}`
                                            ? 0.4
                                            : 0.2,
                                }}
                                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.glow} blur-3xl transition-all duration-500`}
                            />
                            <div className="relative flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                >
                                    <img
                                        src={stat.image}
                                        alt={stat.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <div className="mt-1">
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: 0.5 + index * 0.1,
                                                type: 'spring',
                                            }}
                                            className="text-2xl font-bold text-neutral-900 dark:text-white"
                                        >
                                            {stat.value}
                                        </motion.span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Voting List */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-xl shadow-indigo-100/50 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-black/50"
                >
                    <div className="border-b border-gray-100 p-4 sm:p-6 dark:border-neutral-800">
                        <div className="flex items-start gap-2.5 sm:items-center sm:gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center sm:mt-0 sm:h-10 sm:w-10">
                                <Vote className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-lg leading-tight font-bold text-gray-900 sm:text-xl dark:text-white">
                                    Daftar Voting Pengeluaran
                                </h2>
                                <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
                                    Lihat detail voting dan ambil keputusan
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="-mx-1 mb-6 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                        >
                            <div className="inline-flex min-w-max gap-2 sm:flex sm:min-w-0 sm:flex-wrap">
                                {[
                                    {
                                        value: 'all',
                                        label: 'Semua',
                                        icon: BarChart3,
                                        count: stats.total,
                                    },
                                    {
                                        value: 'open',
                                        label: 'Sedang Voting',
                                        icon: Clock,
                                        count: stats.open,
                                    },
                                    {
                                        value: 'approved',
                                        label: 'Disetujui',
                                        icon: CheckCircle,
                                        count: stats.approved,
                                    },
                                    {
                                        value: 'rejected',
                                        label: 'Ditolak',
                                        icon: XCircle,
                                        count: stats.rejected,
                                    },
                                    {
                                        value: 'closed',
                                        label: 'Ditutup',
                                        icon: AlertTriangle,
                                        count: stats.closed,
                                    },
                                ].map((tab, index) => (
                                    <motion.button
                                        key={tab.value}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.4 + index * 0.05,
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            handleTabChange(tab.value)
                                        }
                                        className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-all sm:px-5 sm:py-2.5 sm:text-sm ${
                                            activeTab === tab.value
                                                ? 'bg-zinc-900 text-white shadow-lg shadow-indigo-500/20 dark:bg-white dark:text-black'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 sm:gap-2">
                                            <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            {tab.label}
                                            <motion.span
                                                animate={{
                                                    scale:
                                                        activeTab === tab.value
                                                            ? [1, 1.2, 1]
                                                            : 1,
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                                className={`rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 ${
                                                    activeTab === tab.value
                                                        ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-gray-400'
                                                }`}
                                            >
                                                {tab.count}
                                            </motion.span>
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Voting Items */}
                        <AnimatePresence mode="wait">
                            {votings.length > 0 ? (
                                <motion.div
                                    key="voting-list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {votings.map((voting) => {
                                        const statusConfig = getStatusConfig(
                                            voting.status,
                                        );
                                        const StatusIcon = statusConfig.icon;
                                        const categoryConfig =
                                            getCategoryConfig(voting.category);

                                        return (
                                            <motion.div
                                                key={voting.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                whileHover={{
                                                    scale: 1.01,
                                                    y: -2,
                                                }}
                                                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:bg-neutral-900/50 ${
                                                    voting.status === 'open'
                                                        ? 'border-blue-200 dark:border-blue-900/30'
                                                        : voting.status ===
                                                            'approved'
                                                          ? 'border-emerald-200 dark:border-emerald-900/30'
                                                          : voting.status ===
                                                              'rejected'
                                                            ? 'border-red-200 dark:border-red-900/30'
                                                            : 'border-gray-200 dark:border-neutral-800'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="flex-1">
                                                        {/* Status & Category */}
                                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                                            <motion.span
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider uppercase ${statusConfig.bg} ${statusConfig.text}`}
                                                            >
                                                                <StatusIcon className="h-3.5 w-3.5" />
                                                                {
                                                                    statusConfig.label
                                                                }
                                                            </motion.span>
                                                            <motion.span
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider uppercase ${categoryConfig.color}`}
                                                            >
                                                                <span>
                                                                    {
                                                                        categoryConfig.icon
                                                                    }
                                                                </span>
                                                                {
                                                                    categoryConfig.label
                                                                }
                                                            </motion.span>
                                                            {voting.is_expired &&
                                                                voting.status ===
                                                                    'open' && (
                                                                    <span className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                                                                        ⏰
                                                                        Expired
                                                                    </span>
                                                                )}
                                                        </div>

                                                        {/* Title & Amount - Compact */}
                                                        <h4 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                                                            {voting.title}
                                                        </h4>
                                                        <motion.p
                                                            initial={{
                                                                scale: 0.8,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                            }}
                                                            className="mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-2xl font-black text-transparent"
                                                        >
                                                            {formatCurrency(
                                                                voting.amount,
                                                            )}
                                                        </motion.p>
                                                        <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                                            {voting.description}
                                                        </p>

                                                        {/* Meta Info - Compact */}
                                                        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {voting.creator
                                                                    ?.nama ||
                                                                    '-'}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {
                                                                    voting.voting_deadline
                                                                }
                                                            </span>
                                                        </div>

                                                        {/* Vote Progress - Compact */}
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay: 0.2,
                                                            }}
                                                            className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50"
                                                        >
                                                            <div className="mb-2 flex items-center justify-between text-xs">
                                                                <span className="text-slate-600 dark:text-slate-400">
                                                                    {
                                                                        voting
                                                                            .stats
                                                                            .total
                                                                    }{' '}
                                                                    votes
                                                                </span>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                                                    {
                                                                        voting
                                                                            .stats
                                                                            .approval_percentage
                                                                    }
                                                                    % setuju
                                                                </span>
                                                            </div>
                                                            <div className="flex h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                                <motion.div
                                                                    initial={{
                                                                        width: 0,
                                                                    }}
                                                                    animate={{
                                                                        width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        ease: 'easeOut',
                                                                    }}
                                                                    className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                                />
                                                                <motion.div
                                                                    initial={{
                                                                        width: 0,
                                                                    }}
                                                                    animate={{
                                                                        width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        ease: 'easeOut',
                                                                        delay: 0.2,
                                                                    }}
                                                                    className="bg-gradient-to-r from-red-400 to-red-600"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    {/* Action Buttons - Compact */}
                                                    <div className="flex min-w-[140px] flex-col gap-2">
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.05,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.95,
                                                            }}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full justify-start text-xs"
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/admin/kas-voting/${voting.id}`,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                Halaman Detail
                                                            </Button>
                                                        </motion.div>

                                                        {voting.status ===
                                                            'open' && (
                                                            <>
                                                                <motion.div
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.95,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        className="w-full justify-start bg-emerald-600 text-xs hover:bg-emerald-700"
                                                                        onClick={() =>
                                                                            openApproveDialog(
                                                                                voting.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                    >
                                                                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                                                        Setujui
                                                                    </Button>
                                                                </motion.div>
                                                                <motion.div
                                                                    whileHover={{
                                                                        scale: 1.05,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.95,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="w-full justify-start text-xs"
                                                                        onClick={() => {
                                                                            setSelectedVoting(
                                                                                voting,
                                                                            );
                                                                            setShowRejectDialog(
                                                                                true,
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                    >
                                                                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                                        Tolak
                                                                    </Button>
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty-state"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="py-16 text-center"
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center"
                                    >
                                        <Vote className="h-10 w-10 text-gray-400" />
                                    </motion.div>
                                    <p className="text-lg font-medium text-gray-500">
                                        Belum ada voting
                                    </p>
                                    <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                                        Voting akan muncul ketika mahasiswa
                                        mengusulkan pengeluaran baru.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectDialog && selectedVoting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowRejectDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/50"
                        >
                            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl">
                                            <XCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">
                                                Tolak Voting
                                            </h3>
                                            <p className="text-xs text-red-100">
                                                Konfirmasi penolakan
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                            setShowRejectDialog(false)
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="p-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Alasan Penolakan (opsional)
                                        </Label>
                                        <Textarea
                                            value={rejectReason}
                                            onChange={(e) =>
                                                setRejectReason(e.target.value)
                                            }
                                            placeholder="Masukkan alasan penolakan..."
                                            rows={4}
                                            className="resize-none rounded-xl"
                                        />
                                    </div>
                                </motion.div>

                                <div className="mt-6 flex gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowRejectDialog(false)
                                            }
                                            className="w-full"
                                        >
                                            Batal
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1"
                                    >
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                handleReject(selectedVoting.id)
                                            }
                                            disabled={processing}
                                            className="w-full shadow-lg shadow-red-500/30"
                                        >
                                            Ya, Tolak
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Approve Confirmation Dialog */}
            <ConfirmDialog
                open={approveDialog.open}
                onOpenChange={(open) =>
                    setApproveDialog({
                        open,
                        id: open ? approveDialog.id : null,
                    })
                }
                onConfirm={handleApprove}
                title="Setujui Voting"
                message="Yakin ingin menyetujui voting ini? Pengeluaran kas akan langsung dicatat."
                variant="success"
                confirmText="Ya, Setujui"
                cancelText="Batal"
                loading={processing}
            />

            {/* Close Confirmation Dialog */}
            <ConfirmDialog
                open={closeDialog.open}
                onOpenChange={(open) =>
                    setCloseDialog({ open, id: open ? closeDialog.id : null })
                }
                onConfirm={handleClose}
                title="Tutup Voting"
                message="Yakin ingin menutup voting ini tanpa keputusan?"
                variant="warning"
                confirmText="Ya, Tutup"
                cancelText="Batal"
                loading={processing}
            />

            {/* Finalize Confirmation Dialog */}
            <ConfirmDialog
                open={finalizeDialog.open}
                onOpenChange={(open) =>
                    setFinalizeDialog({
                        open,
                        id: open ? finalizeDialog.id : null,
                    })
                }
                onConfirm={handleFinalize}
                title="Finalisasi Voting"
                message="Finalisasi voting berdasarkan hasil suara saat ini?"
                variant="info"
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                loading={processing}
            />
        </AppLayout>
    );
}
