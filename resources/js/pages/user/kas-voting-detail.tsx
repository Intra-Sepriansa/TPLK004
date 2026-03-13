import VotingKasIcon from '@/assets/admin/voting-kas/voting.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle,
    ClipboardList,
    Clock,
    Heart,
    MessageCircle,
    Package,
    PartyPopper,
    ThumbsDown,
    ThumbsUp,
    Users,
    UtensilsCrossed,
    Vote,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface VotingDetail {
    id: number;
    title: string;
    description: string;
    amount: number;
    category: string;
    status: 'open' | 'approved' | 'rejected' | 'closed';
    creator: {
        id: number | null;
        nama: string;
        nim?: string | null;
    };
    voting_deadline: string;
    voting_deadline_human: string;
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
    my_comment: string | null;
    created_at: string;
    votes: Array<{
        id: number;
        mahasiswa: { id: number | null; nama: string; nim?: string | null };
        vote: 'approve' | 'reject';
        comment: string | null;
        created_at: string;
    }>;
}

interface Props {
    voting: VotingDetail;
    relatedVotings: Array<{
        id: number;
        title: string;
        status: string;
        approval_percentage: number;
        total_votes: number;
        amount: number;
    }>;
}

const categories: Array<{
    value: 'kegiatan' | 'perlengkapan' | 'konsumsi' | 'donasi' | 'lainnya';
    label: string;
    icon: LucideIcon;
    color: string;
}> = [
    {
        value: 'kegiatan',
        label: 'Kegiatan Kelas',
        icon: PartyPopper,
        color: 'bg-purple-100 text-purple-700',
    },
    {
        value: 'perlengkapan',
        label: 'Perlengkapan',
        icon: Package,
        color: 'bg-blue-100 text-blue-700',
    },
    {
        value: 'konsumsi',
        label: 'Konsumsi',
        icon: UtensilsCrossed,
        color: 'bg-orange-100 text-orange-700',
    },
    {
        value: 'donasi',
        label: 'Donasi/Sosial',
        icon: Heart,
        color: 'bg-pink-100 text-pink-700',
    },
    {
        value: 'lainnya',
        label: 'Lainnya',
        icon: ClipboardList,
        color: 'bg-neutral-100 text-neutral-700',
    },
];

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'open':
            return {
                icon: Clock,
                label: 'Voting Aktif',
                badgeClass:
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            };
        case 'approved':
            return {
                icon: CheckCircle,
                label: 'Disetujui',
                badgeClass:
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            };
        case 'rejected':
            return {
                icon: XCircle,
                label: 'Ditolak',
                badgeClass:
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            };
        default:
            return {
                icon: Vote,
                label: 'Ditutup',
                badgeClass:
                    'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
            };
    }
};

export default function KasVotingDetail({ voting, relatedVotings }: Props) {
    const [comment, setComment] = useState(voting.my_comment ?? '');
    const categoryConfig =
        categories.find((c) => c.value === voting.category) ?? categories[4];
    const CategoryIcon = categoryConfig.icon;
    const statusConfig = getStatusConfig(voting.status);
    const StatusIcon = statusConfig.icon;

    const canVote = voting.status === 'open' && !voting.is_expired;
    const rejectPercentage = useMemo(
        () =>
            voting.stats.total > 0
                ? Math.max(0, 100 - voting.stats.approval_percentage)
                : 0,
        [voting.stats.approval_percentage, voting.stats.total],
    );

    const handleVote = (voteType: 'approve' | 'reject') => {
        router.post(`/user/kas-voting/${voting.id}/vote`, {
            vote: voteType,
            comment,
        });
    };

    return (
        <StudentLayout>
            <Head title={`Detail Voting: ${voting.title}`} />

            <div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
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
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/kas-voting')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Voting
                        </motion.button>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                            <motion.div
                                className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                            >
                                <img
                                    src={VotingKasIcon}
                                    alt="Detail Voting"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>

                            <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${statusConfig.badgeClass}`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {statusConfig.label}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${categoryConfig.color}`}
                                    >
                                        <CategoryIcon className="h-3.5 w-3.5" />
                                        {categoryConfig.label}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold sm:text-3xl">
                                    {voting.title}
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                    {voting.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-3 text-xs text-indigo-100/90 sm:text-sm">
                                    <span className="inline-flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {voting.creator.nama}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Deadline: {voting.voting_deadline_human}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <Vote className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Hasil Voting
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Pantau progres keputusan pengeluaran
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Nominal Usulan
                            </p>
                            <p className="mt-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent">
                                {formatCurrency(voting.amount)}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Dibuat: {voting.created_at}
                            </p>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                    {voting.stats.total} vote masuk (min.{' '}
                                    {voting.min_votes})
                                </span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                    <AnimatedCounter
                                        value={voting.stats.approval_percentage}
                                        suffix="%"
                                    />{' '}
                                    setuju
                                </span>
                            </div>

                            <div className="flex h-4 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${voting.stats.approval_percentage}%`,
                                    }}
                                    transition={{ duration: 0.9 }}
                                    className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${rejectPercentage}%` }}
                                    transition={{ duration: 0.9 }}
                                    className="bg-gradient-to-r from-red-400 to-red-600"
                                />
                            </div>

                            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
                                <p className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                    <ThumbsUp className="h-4 w-4" />{' '}
                                    {voting.stats.approve} Setuju
                                </p>
                                <p className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                                    <ThumbsDown className="h-4 w-4" />{' '}
                                    {voting.stats.reject} Tolak
                                </p>
                                <p
                                    className={`inline-flex items-center gap-1 font-medium ${voting.stats.is_valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    {voting.stats.is_valid
                                        ? 'Valid'
                                        : 'Belum valid'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/20 bg-white/50 p-4 dark:border-white/10 dark:bg-neutral-800/50">
                            <div className="mb-3 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-indigo-500" />
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Komentar Vote Anda
                                </p>
                            </div>
                            <Input
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Opsional: berikan alasan vote Anda"
                                className="h-11 rounded-xl border border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70"
                            />

                            {canVote && (
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        className={`h-11 w-full ${
                                            voting.my_vote === 'approve'
                                                ? 'cursor-not-allowed bg-emerald-600'
                                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700'
                                        }`}
                                        disabled={voting.my_vote === 'approve'}
                                        onClick={() => handleVote('approve')}
                                    >
                                        <ThumbsUp className="mr-2 h-4 w-4" />
                                        {voting.my_vote === 'approve'
                                            ? 'Sudah Setuju'
                                            : 'Setuju'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className={`h-11 w-full ${
                                            voting.my_vote === 'reject'
                                                ? 'cursor-not-allowed'
                                                : 'shadow-lg shadow-red-500/30'
                                        }`}
                                        disabled={voting.my_vote === 'reject'}
                                        onClick={() => handleVote('reject')}
                                    >
                                        <ThumbsDown className="mr-2 h-4 w-4" />
                                        {voting.my_vote === 'reject'
                                            ? 'Sudah Tolak'
                                            : 'Tolak'}
                                    </Button>
                                </div>
                            )}

                            {!canVote && (
                                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                                    Voting sudah tidak aktif untuk usulan ini.
                                </p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Partisipasi
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Daftar suara terbaru
                                </p>
                            </div>
                        </div>

                        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                            {voting.votes.length > 0 ? (
                                voting.votes.map((voteRow) => (
                                    <div
                                        key={voteRow.id}
                                        className="rounded-xl border border-white/20 bg-white/50 p-3 dark:border-white/10 dark:bg-neutral-800/50"
                                    >
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {voteRow.mahasiswa.nama}
                                            </p>
                                            <span
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                                    voteRow.vote === 'approve'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {voteRow.vote === 'approve'
                                                    ? 'Setuju'
                                                    : 'Tolak'}
                                            </span>
                                        </div>
                                        {voteRow.comment ? (
                                            <p className="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-300">
                                                {voteRow.comment}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-neutral-400">
                                                Tanpa komentar
                                            </p>
                                        )}
                                        <p className="mt-1 text-[10px] text-neutral-400">
                                            {voteRow.created_at}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-xl border border-white/20 bg-white/50 p-3 text-xs text-neutral-500 dark:border-white/10 dark:bg-neutral-800/50 dark:text-neutral-400">
                                    Belum ada suara masuk.
                                </p>
                            )}
                        </div>

                        {relatedVotings.length > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                                <p className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                    Voting Aktif Lainnya
                                </p>
                                <div className="space-y-2">
                                    {relatedVotings.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                router.visit(
                                                    `/user/kas-voting/${item.id}`,
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/50 p-3 text-left transition hover:bg-white/70 dark:border-white/10 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                                        >
                                            <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                {formatCurrency(item.amount)} •{' '}
                                                {item.approval_percentage}%
                                                setuju • {item.total_votes} vote
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </StudentLayout>
    );
}
