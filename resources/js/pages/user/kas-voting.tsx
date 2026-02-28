import VotingKasIcon from '@/assets/admin/voting-kas/voting.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    CheckCircle,
    ClipboardList,
    Clock,
    Heart,
    Package,
    PartyPopper,
    Plus,
    ThumbsDown,
    ThumbsUp,
    UtensilsCrossed,
    Users,
    Vote,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import SedangVotingIcon from '@/assets/admin/voting-kas/icon-coting.png';
import DisetujuiVotingIcon from '@/assets/admin/voting-kas/disetujui.png';
import DitolakVotingIcon from '@/assets/admin/voting-kas/ditolak.png';
import ApprovalRateIcon from '@/assets/mahasiswa/voting/approval.png';

interface Props {
    votings: Array<{
        id: number;
        title: string;
        description: string;
        amount: number;
        category: string;
        status: 'open' | 'approved' | 'rejected' | 'closed';
        creator: string;
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
        my_vote: 'approve' | 'reject' | null;
        created_at: string;
    }>;
    stats: {
        open: number;
        approved: number;
        rejected: number;
        total_amount_approved?: number;
        participation_rate?: number;
    };
    filters: { status: string };
}

const categories: Array<{
    value: 'kegiatan' | 'perlengkapan' | 'konsumsi' | 'donasi' | 'lainnya';
    label: string;
    icon: LucideIcon;
    color: string;
}> = [
    { value: 'kegiatan', label: 'Kegiatan Kelas', icon: PartyPopper, color: 'bg-purple-100 text-purple-700' },
    { value: 'perlengkapan', label: 'Perlengkapan', icon: Package, color: 'bg-blue-100 text-blue-700' },
    { value: 'konsumsi', label: 'Konsumsi', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700' },
    { value: 'donasi', label: 'Donasi/Sosial', icon: Heart, color: 'bg-pink-100 text-pink-700' },
    { value: 'lainnya', label: 'Lainnya', icon: ClipboardList, color: 'bg-neutral-100 text-neutral-700' },
];

const getStatusConfig = (status: string): {
    icon: LucideIcon;
    label: string;
    badgeClass: string;
    glow: string;
} => {
    switch (status) {
        case 'open':
            return {
                icon: Clock,
                label: 'Voting Aktif',
                badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                glow: 'bg-blue-400',
            };
        case 'approved':
            return {
                icon: CheckCircle,
                label: 'Disetujui',
                badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                glow: 'bg-emerald-400',
            };
        case 'rejected':
            return {
                icon: XCircle,
                label: 'Ditolak',
                badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                glow: 'bg-red-400',
            };
        default:
            return {
                icon: BarChart3,
                label: 'Ditutup',
                badgeClass: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                glow: 'bg-neutral-400',
            };
    }
};

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

const getTimeRemaining = (deadline: string): string => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Berakhir';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} hari ${hours} jam`;
    return `${hours} jam`;
};

export default function KasVoting({ votings, stats, filters }: Props) {
    const totalVotings = stats.open + stats.approved + stats.rejected;
    const approvalRate = totalVotings > 0 ? Math.round((stats.approved / totalVotings) * 100) : 0;

    const handleTabChange = (tab: string) => {
        router.get('/user/kas-voting', { status: tab }, { preserveState: true });
    };

    const handleVote = (votingId: number, vote: 'approve' | 'reject') => {
        router.post(`/user/kas-voting/${votingId}/vote`, { vote });
    };

    return (
        <StudentLayout>
            <Head title="Voting Pengeluaran Kas" />

            <div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/dashboard')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={VotingKasIcon}
                                        alt="Voting Kas"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
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
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Voting Pengeluaran Kas
                                    </motion.h1>
                                    <motion.p
                                        className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Usulkan dan vote pengeluaran kas secara demokratis bersama teman sekelas.
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="self-center sm:self-auto"
                            >
                                <Button
                                    onClick={() => router.visit('/user/kas-voting/create')}
                                    className="inline-flex h-11 w-auto items-center whitespace-nowrap rounded-2xl border border-white/20 bg-white/20 px-5 font-semibold text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Usulkan Pengeluaran
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
                >
                    {[
                        {
                            image: SedangVotingIcon,
                            label: 'Sedang Voting',
                            value: stats.open,
                            progress: totalVotings > 0 ? (stats.open / totalVotings) * 100 : 0,
                            shadowColor: 'hover:shadow-violet-500/10',
                            glow: 'bg-violet-500',
                            innerGrad: 'from-violet-500/5 to-fuchsia-500/5 dark:from-violet-500/10 dark:to-fuchsia-500/10',
                            delay: 0.1,
                        },
                        {
                            image: DisetujuiVotingIcon,
                            label: 'Disetujui',
                            value: stats.approved,
                            progress: totalVotings > 0 ? (stats.approved / totalVotings) * 100 : 0,
                            shadowColor: 'hover:shadow-emerald-500/10',
                            glow: 'bg-emerald-500',
                            innerGrad: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                            delay: 0.15,
                        },
                        {
                            image: DitolakVotingIcon,
                            label: 'Ditolak',
                            value: stats.rejected,
                            progress: totalVotings > 0 ? (stats.rejected / totalVotings) * 100 : 0,
                            shadowColor: 'hover:shadow-red-500/10',
                            glow: 'bg-red-500',
                            innerGrad: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
                            delay: 0.2,
                        },
                        {
                            image: ApprovalRateIcon,
                            cropImage: true,
                            label: 'Approval Rate',
                            value: approvalRate,
                            valueSuffix: '%',
                            progress: approvalRate,
                            shadowColor: 'hover:shadow-purple-500/10',
                            glow: 'bg-purple-500',
                            innerGrad: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10',
                            delay: 0.25,
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: 'spring', stiffness: 200 }}
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: { type: 'spring', stiffness: 400, damping: 15 },
                            }}
                            className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:p-5 ${stat.shadowColor} dark:border-white/5 dark:bg-neutral-900/40`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.innerGrad}`} />
                            <motion.div
                                className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${stat.glow} opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40`}
                            />

                            <div className="relative flex flex-col gap-3">
                                <div className="relative flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        <div className={`absolute inset-0 ${stat.cropImage ? 'overflow-hidden rounded-xl' : ''}`}>
                                            <img
                                                src={stat.image}
                                                alt={stat.label}
                                                className={`absolute inset-0 h-full w-full ${stat.cropImage ? 'object-cover object-center' : 'object-contain'} drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]`}
                                                style={
                                                    stat.cropImage
                                                        ? {
                                                              clipPath: 'inset(10% 10% 10% 10%)',
                                                              transform: 'scale(1.22)',
                                                              transformOrigin: 'center',
                                                          }
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    </motion.div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <p className="text-xs font-medium leading-tight text-neutral-500 dark:text-neutral-400 sm:text-sm">
                                            {stat.label}
                                        </p>
                                        <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                                            <AnimatedCounter value={stat.value} suffix={stat.valueSuffix ?? ''} />
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-neutral-400 sm:text-xs">
                                            {stat.progress.toFixed(0)}% dari total
                                        </p>
                                    </div>
                                </div>
                                <Progress value={stat.progress} className="h-1.5" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-white/10 p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <Vote className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Daftar Voting</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{votings.length} usulan</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {[
                                { value: 'open', label: 'Sedang Voting', shortLabel: 'Aktif', icon: Clock, count: stats.open },
                                { value: 'approved', label: 'Disetujui', shortLabel: 'Setuju', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', shortLabel: 'Tolak', icon: XCircle, count: stats.rejected },
                                { value: 'all', label: 'Semua', shortLabel: 'Semua', icon: BarChart3, count: totalVotings },
                            ].map((tab, index) => (
                                <motion.button
                                    key={tab.value}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`inline-flex items-center whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-2.5 sm:text-sm ${
                                        filters.status === tab.value
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-white/40 text-neutral-700 hover:bg-white/60 dark:bg-neutral-900/40 dark:text-neutral-300'
                                    }`}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.shortLabel}</span>
                                    </span>
                                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs ${
                                        filters.status === tab.value ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </motion.button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {votings.length > 0 ? (
                                <motion.div
                                    key={filters.status}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid gap-4 md:grid-cols-2"
                                >
                                    {votings.map((voting, index) => {
                                        const statusConfig = getStatusConfig(voting.status);
                                        const StatusIcon = statusConfig.icon;
                                        const categoryConfig = categories.find((c) => c.value === voting.category) ?? categories[4];
                                        const CategoryIcon = categoryConfig.icon;

                                        return (
                                            <motion.div
                                                key={voting.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    y: -4,
                                                    transition: { type: 'spring', stiffness: 350, damping: 18 },
                                                }}
                                                className="group relative"
                                            >
                                                <motion.div
                                                    className={`absolute inset-0 rounded-3xl ${statusConfig.glow} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30`}
                                                />
                                                <div
                                                    className="relative cursor-pointer rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                                                    onClick={() => router.visit(`/user/kas-voting/${voting.id}`)}
                                                >
                                                    <div className="mb-3 flex items-start justify-between gap-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold sm:px-2.5 sm:text-xs ${statusConfig.badgeClass}`}>
                                                                <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                {statusConfig.label}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium sm:px-2.5 sm:text-xs ${categoryConfig.color}`}>
                                                                <CategoryIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                {categoryConfig.label}
                                                            </span>
                                                        </div>

                                                        {voting.my_vote && (
                                                            <span className={`rounded-lg px-2 py-1 text-xs font-medium ${
                                                                voting.my_vote === 'approve'
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                            }`}>
                                                                {voting.my_vote === 'approve' ? '✓ Setuju' : '✗ Tolak'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="mb-2 line-clamp-1 text-lg font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 dark:text-white">
                                                        {voting.title}
                                                    </h3>
                                                    <p className="mb-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
                                                        {formatCurrency(voting.amount)}
                                                    </p>
                                                    <p className="mb-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                        {voting.description}
                                                    </p>

                                                    <div className="mb-4 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Users className="h-3.5 w-3.5" />
                                                            {voting.creator}
                                                        </span>
                                                        {voting.status === 'open' && (
                                                            <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {getTimeRemaining(voting.voting_deadline)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                                <Users className="h-4 w-4" />
                                                                <span className="font-medium">{voting.stats.total}</span> votes
                                                            </span>
                                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                                {voting.stats.approval_percentage}% setuju
                                                            </span>
                                                        </div>

                                                        <div className="flex h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }}
                                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                                className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                            />
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }}
                                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                                className="bg-gradient-to-r from-red-400 to-red-600"
                                                            />
                                                        </div>

                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                                <ThumbsUp className="h-3 w-3" /> {voting.stats.approve} setuju
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                                <ThumbsDown className="h-3 w-3" /> {voting.stats.reject} tolak
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {voting.status === 'open' && !voting.is_expired && (
                                                        <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                                                            <Button
                                                                size="sm"
                                                                className={`w-full ${
                                                                    voting.my_vote === 'approve'
                                                                        ? 'cursor-not-allowed bg-emerald-600'
                                                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700'
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVote(voting.id, 'approve');
                                                                }}
                                                                disabled={voting.my_vote === 'approve'}
                                                            >
                                                                <img
                                                                    src={DisetujuiVotingIcon}
                                                                    alt="Setuju"
                                                                    className="mr-1 h-4 w-4 object-contain"
                                                                />
                                                                {voting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className={`w-full ${
                                                                    voting.my_vote === 'reject'
                                                                        ? 'cursor-not-allowed'
                                                                        : 'shadow-lg shadow-red-500/30'
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleVote(voting.id, 'reject');
                                                                }}
                                                                disabled={voting.my_vote === 'reject'}
                                                            >
                                                                <img
                                                                    src={DitolakVotingIcon}
                                                                    alt="Tolak"
                                                                    className="mr-1 h-4 w-4 object-contain"
                                                                />
                                                                {voting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="py-16 text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <Vote className="h-10 w-10 text-neutral-400" />
                                    </div>
                                    <p className="font-medium text-neutral-500 dark:text-neutral-400">Belum ada voting</p>
                                    <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                                        Jadilah yang pertama mengusulkan pengeluaran kas!
                                    </p>
                                    <Button
                                        onClick={() => router.visit('/user/kas-voting/create')}
                                        className="mt-4 inline-flex h-11 w-auto items-center whitespace-nowrap rounded-2xl border border-white/20 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 font-semibold shadow-lg shadow-purple-500/30"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Usulkan Pengeluaran
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </StudentLayout>
    );
}
