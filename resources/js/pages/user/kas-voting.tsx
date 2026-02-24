import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Vote, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, Users, X, Wallet,
    PieChart, AlertCircle, Target, BarChart3, Info, Sparkles
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import SedangVotingIcon from '@/assets/admin/voting-kas/icon-coting.png';
import DisetujuiVotingIcon from '@/assets/admin/voting-kas/disetujui.png';
import DitolakVotingIcon from '@/assets/admin/voting-kas/ditolak.png';

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

const categories = [
    { value: 'kegiatan', label: 'Kegiatan Kelas', icon: 'noto:party-popper', color: 'bg-purple-100 text-purple-700' },
    { value: 'perlengkapan', label: 'Perlengkapan', icon: 'noto:package', color: 'bg-blue-100 text-blue-700' },
    { value: 'konsumsi', label: 'Konsumsi', icon: 'noto:pizza', color: 'bg-orange-100 text-orange-700' },
    { value: 'donasi', label: 'Donasi/Sosial', icon: 'noto:red-heart', color: 'bg-pink-100 text-pink-700' },
    { value: 'lainnya', label: 'Lainnya', icon: 'noto:clipboard', color: 'bg-slate-100 text-slate-700' },
];

export default function KasVoting({ votings, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState(filters.status);
    const [selectedVoting, setSelectedVoting] = useState<Props['votings'][0] | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        amount: '',
        category: 'kegiatan',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/kas-voting', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleVote = (votingId: number, vote: 'approve' | 'reject') => {
        router.post(`/user/kas-voting/${votingId}/vote`, { vote });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/user/kas-voting', { status: tab }, { preserveState: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'open':
                return { icon: Clock, label: 'Voting Aktif', bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-500' };
            case 'approved':
                return { icon: CheckCircle, label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500' };
            case 'rejected':
                return { icon: XCircle, label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500' };
            case 'closed':
                return { icon: AlertCircle, label: 'Ditutup', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500' };
            default:
                return { icon: Info, label: status, bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500' };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTimeRemaining = (deadline: string) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end.getTime() - now.getTime();
        if (diff <= 0) return 'Berakhir';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days} hari ${hours} jam`;
        return `${hours} jam`;
    };

    const getCategoryConfig = (categoryValue: string) => {
        return categories.find(c => c.value === categoryValue) || categories[4];
    };

    const totalVotings = stats.open + stats.approved + stats.rejected;
    const approvalRate = totalVotings > 0 ? Math.round((stats.approved / totalVotings) * 100) : 0;

    return (
        <StudentLayout>
            <Head title="Voting Pengeluaran Kas" />
            <div className="p-6 space-y-6">
                {/* Animated Header with Dashboard Ultra Advanced Style */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                    style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}
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
                            ease: "easeInOut"
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-white/30 to-cyan-200/30 blur-3xl"
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
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-teal-300/30 to-blue-400/30 blur-3xl"
                    />

                    {/* Pulsating Rings */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 2, 3],
                                opacity: [0.3, 0.15, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 1.3,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"
                            style={{
                                width: '100px',
                                height: '100px',
                            }}
                        />
                    ))}

                    {/* Floating Icons */}
                    {[Vote, ThumbsUp, ThumbsDown, CheckCircle, XCircle].map((Icon, i) => (
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
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <Wallet className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-emerald-100 font-medium"
                                    >
                                        Keuangan Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Voting Pengeluaran Kas
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Usulkan Pengeluaran
                                </Button>
                            </motion.div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-emerald-100"
                        >
                            Usulkan dan vote pengeluaran kas secara demokratis bersama teman sekelas
                        </motion.p>

                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Usulan', value: totalVotings, delay: 0.6 },
                                { label: 'Tingkat Persetujuan', value: `${approvalRate}%`, delay: 0.65 },
                                { label: 'Voting Aktif', value: stats.open, delay: 0.7 },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-3 cursor-pointer"
                                >
                                    <p className="text-emerald-100 text-xs">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards - Animated */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-4 grid-cols-2 md:grid-cols-4"
                >
                    {[
                        { isCustom: true, image: SedangVotingIcon, label: 'Sedang Voting', value: stats.open, progress: totalVotings > 0 ? (stats.open / totalVotings) * 100 : 0, shadowColor: 'hover:shadow-violet-500/10', glow: 'bg-violet-500', innerGrad: 'from-violet-500/5 to-fuchsia-500/5 dark:from-violet-500/10 dark:to-fuchsia-500/10', delay: 0.1 },
                        { isCustom: true, image: DisetujuiVotingIcon, label: 'Disetujui', value: stats.approved, progress: totalVotings > 0 ? (stats.approved / totalVotings) * 100 : 0, shadowColor: 'hover:shadow-emerald-500/10', glow: 'bg-emerald-500', innerGrad: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', delay: 0.15 },
                        { isCustom: true, image: DitolakVotingIcon, label: 'Ditolak', value: stats.rejected, progress: totalVotings > 0 ? (stats.rejected / totalVotings) * 100 : 0, shadowColor: 'hover:shadow-red-500/10', glow: 'bg-red-500', innerGrad: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', delay: 0.2 },
                        { isCustom: false, icon: Target, label: 'Approval Rate', value: `${approvalRate}%`, progress: approvalRate, iconColor: 'text-purple-500', shadowColor: 'hover:shadow-purple-500/10', glow: 'bg-purple-500', innerGrad: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10', delay: 0.25 },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                            className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-5 shadow-xl backdrop-blur-xl transition-all ${stat.shadowColor} dark:border-white/5 cursor-pointer`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.innerGrad}`} />
                            <motion.div
                                className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${stat.glow} blur-2xl opacity-20 group-hover:opacity-40 transform scale-100 group-hover:scale-150 transition-all duration-500`}
                            />

                            <div className="relative flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center p-1"
                                    >
                                        {stat.isCustom ? (
                                            <img
                                                src={stat.image}
                                                alt={stat.label}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        ) : (
                                            stat.icon && <stat.icon className={`h-full w-full object-contain ${stat.iconColor} drop-shadow-md`} />
                                        )}
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-tight">{stat.label}</p>
                                        <div className="mt-0.5">
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                                                className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white"
                                            >
                                                {stat.value}
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <Progress value={stat.progress} className="h-1.5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Voting List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Vote className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Voting</h2>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    {votings.length} usulan
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Tabs dengan animasi */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'open', label: 'Sedang Voting', icon: Clock, count: stats.open },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                                { value: 'all', label: 'Semua', icon: BarChart3, count: totalVotings },
                            ].map((tab, index) => (
                                <motion.button
                                    key={tab.value}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.value
                                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 hover:shadow-md'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.value ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Voting Items dengan AnimatePresence */}
                        <AnimatePresence mode="wait">
                            {votings.length > 0 ? (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid gap-4 md:grid-cols-2"
                                >
                                    {votings.map((voting, index) => {
                                        const statusConfig = getStatusConfig(voting.status);
                                        const StatusIcon = statusConfig.icon;
                                        const categoryConfig = getCategoryConfig(voting.category);
                                        const timeRemaining = getTimeRemaining(voting.voting_deadline);

                                        return (
                                            <motion.div
                                                key={voting.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.02, y: -5 }}
                                                className="relative group"
                                                onClick={() => setSelectedVoting(voting)}
                                            >
                                                {/* Glow Effect on Hover */}
                                                <motion.div
                                                    className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${voting.status === 'open' ? 'bg-blue-400' :
                                                        voting.status === 'approved' ? 'bg-emerald-400' :
                                                            voting.status === 'rejected' ? 'bg-red-400' :
                                                                'bg-slate-400'
                                                        }`}
                                                />

                                                <div className={`relative rounded-2xl border-2 p-5 bg-white dark:bg-black/50 hover:shadow-xl transition-all cursor-pointer ${voting.status === 'open' ? 'border-blue-200 dark:border-blue-800 hover:border-blue-300' :
                                                    voting.status === 'approved' ? 'border-emerald-200 dark:border-emerald-800' :
                                                        voting.status === 'rejected' ? 'border-red-200 dark:border-red-800' :
                                                            'border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <motion.span
                                                                whileHover={{ scale: 1.05 }}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} shadow-sm`}
                                                            >
                                                                <StatusIcon className="h-3.5 w-3.5" />
                                                                {statusConfig.label}
                                                            </motion.span>
                                                            <motion.span
                                                                whileHover={{ scale: 1.05 }}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${categoryConfig.color} shadow-sm`}
                                                            >
                                                                <Icon icon={categoryConfig.icon} className="w-4 h-4" />
                                                                {categoryConfig.label}
                                                            </motion.span>
                                                        </div>
                                                        {voting.my_vote && (
                                                            <motion.span
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                                className={`px-2 py-1 rounded-lg text-xs font-medium shadow-sm ${voting.my_vote === 'approve' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                                    }`}
                                                            >
                                                                {voting.my_vote === 'approve' ? '✓ Setuju' : '✗ Tolak'}
                                                            </motion.span>
                                                        )}
                                                    </div>

                                                    {/* Title & Amount */}
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">{voting.title}</h4>
                                                    <div className="mb-2">
                                                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                                                            {formatCurrency(voting.amount)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{voting.description}</p>

                                                    {/* Meta Info */}
                                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3.5 w-3.5" />
                                                            {voting.creator}
                                                        </span>
                                                        {voting.status === 'open' && (
                                                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {timeRemaining}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Vote Progress */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                                <Users className="h-4 w-4" />
                                                                <span className="font-medium">{voting.stats.total}</span> votes
                                                                {!voting.stats.is_valid && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <span className="text-yellow-600 text-xs">(min {voting.min_votes})</span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Minimal {voting.min_votes} vote untuk valid</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">{voting.stats.approval_percentage}% setuju</span>
                                                        </div>
                                                        <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${voting.stats.total > 0 ? (voting.stats.approve / voting.stats.total) * 100 : 0}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                            />
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${voting.stats.total > 0 ? (voting.stats.reject / voting.stats.total) * 100 : 0}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className="bg-gradient-to-r from-red-400 to-red-600"
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span className="text-emerald-600 flex items-center gap-1">
                                                                <ThumbsUp className="h-3 w-3" /> {voting.stats.approve} setuju
                                                            </span>
                                                            <span className="text-red-600 flex items-center gap-1">
                                                                <ThumbsDown className="h-3 w-3" /> {voting.stats.reject} tolak
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Vote Buttons */}
                                                    {voting.status === 'open' && !voting.is_expired && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                                                        >
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="flex-1"
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    className={`w-full ${voting.my_vote === 'approve'
                                                                        ? 'bg-emerald-600 cursor-not-allowed'
                                                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30'
                                                                        }`}
                                                                    onClick={(e) => { e.stopPropagation(); handleVote(voting.id, 'approve'); }}
                                                                    disabled={voting.my_vote === 'approve'}
                                                                >
                                                                    <img src="/build/assets/disetujui.png" alt="Setuju" className="h-4 w-4 mr-1 object-contain" />
                                                                    {voting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="flex-1"
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className={`w-full ${voting.my_vote === 'reject'
                                                                        ? 'cursor-not-allowed'
                                                                        : 'shadow-lg shadow-red-500/30'
                                                                        }`}
                                                                    onClick={(e) => { e.stopPropagation(); handleVote(voting.id, 'reject'); }}
                                                                    disabled={voting.my_vote === 'reject'}
                                                                >
                                                                    <img src="/build/assets/ditolak.png" alt="Tolak" className="h-4 w-4 mr-1 object-contain" />
                                                                    {voting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                                                </Button>
                                                            </motion.div>
                                                        </motion.div>
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
                                    className="text-center py-16"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                    >
                                        <Vote className="h-10 w-10 text-slate-400" />
                                    </motion.div>
                                    <p className="text-slate-500 font-medium">Belum ada voting</p>
                                    <p className="text-sm text-slate-400 mt-1">Jadilah yang pertama mengusulkan pengeluaran kas!</p>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button onClick={() => setShowForm(true)} className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                                            <Plus className="h-4 w-4 mr-2" /> Buat Usulan
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Add Form Modal dengan animasi */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowForm(false)}
                    >
                        {/* Floating Particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{
                                        y: "-100%",
                                        opacity: [0, 0.5, 0],
                                        x: [0, Math.sin(i) * 50, 0]
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                    className="absolute w-2 h-2 bg-teal-400 rounded-full"
                                    style={{
                                        left: `${(i * 7) % 100}%`,
                                    }}
                                />
                            ))}
                        </div>

                        <motion.div
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-br from-white via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-teal-950/20 p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-teal-100 dark:border-teal-900/30"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative Elements */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1.2, 1, 1.2],
                                    rotate: [360, 180, 0],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
                            />

                            {/* Header */}
                            <div className="relative flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        initial={{ rotate: -180, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="relative"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl blur-xl"
                                        />
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-white shadow-lg">
                                            <Sparkles className="h-8 w-8" />
                                        </div>
                                    </motion.div>
                                    <div>
                                        <motion.h3
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent"
                                        >
                                            Usulkan Pengeluaran
                                        </motion.h3>
                                        <motion.p
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"
                                        >
                                            <Clock className="h-3.5 w-3.5" />
                                            Usulan akan di-voting selama 3 hari
                                        </motion.p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowForm(false)}
                                    className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
                                >
                                    <X className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Judul Usulan */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-2"
                                >
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <PieChart className="h-4 w-4 text-teal-500" />
                                        Judul Usulan
                                    </Label>
                                    <div className="relative group">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity"
                                        />
                                        <Input
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Contoh: Beli spidol whiteboard"
                                            className="relative h-14 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-teal-400 dark:focus:border-teal-500 transition-all text-base bg-white/50 dark:bg-slate-900/50 backdrop-blur"
                                        />
                                    </div>
                                    {errors.title && (
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-sm text-red-500 flex items-center gap-1"
                                        >
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.title}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Deskripsi */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-2"
                                >
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-teal-500" />
                                        Deskripsi
                                    </Label>
                                    <div className="relative group">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity"
                                        />
                                        <Textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Jelaskan kebutuhan dan alasan pengeluaran ini..."
                                            rows={4}
                                            className="relative rounded-xl resize-none border-2 border-slate-200 dark:border-slate-700 focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute bottom-3 right-3 text-xs text-slate-400"
                                        >
                                            {data.description.length} karakter
                                        </motion.div>
                                    </div>
                                    {errors.description && (
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-sm text-red-500 flex items-center gap-1"
                                        >
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.description}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Jumlah & Kategori */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Jumlah */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="space-y-2"
                                    >
                                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-teal-500" />
                                            Jumlah (Rp)
                                        </Label>
                                        <div className="relative group">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity"
                                            />
                                            <Input
                                                type="number"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                placeholder="50000"
                                                className="relative h-14 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-teal-400 dark:focus:border-teal-500 transition-all text-base bg-white/50 dark:bg-slate-900/50 backdrop-blur"
                                            />
                                        </div>
                                        {errors.amount && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {errors.amount}
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Kategori */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="space-y-2"
                                    >
                                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-teal-500" />
                                            Kategori
                                        </Label>
                                        <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                            <SelectTrigger className="h-14 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-teal-400 dark:focus:border-teal-500 transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        <span className="flex items-center gap-2">
                                                            <Icon icon={cat.icon} className="w-5 h-5" />
                                                            {cat.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                </div>

                                {/* Info Box */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 p-4 border border-teal-200 dark:border-teal-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <motion.div
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        >
                                            <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                                        </motion.div>
                                        <div className="text-sm text-teal-700 dark:text-teal-300">
                                            <p className="font-semibold mb-1">Catatan Penting:</p>
                                            <ul className="space-y-1 text-xs">
                                                <li>• Usulan akan di-voting oleh seluruh anggota kelas</li>
                                                <li>• Periode voting berlangsung selama 3 hari</li>
                                                <li>• Pastikan deskripsi jelas dan detail</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex gap-3 pt-4"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowForm(false)}
                                            className="w-full h-14 rounded-xl border-2 text-base font-semibold"
                                        >
                                            Batal
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1"
                                    >
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="relative w-full h-14 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 text-base font-semibold overflow-hidden group"
                                        >
                                            {processing ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <motion.div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                                    Mengirim...
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                        animate={{
                                                            x: ['-100%', '100%'],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "linear"
                                                        }}
                                                    />
                                                    <span className="relative flex items-center gap-2">
                                                        <Sparkles className="h-5 w-5" />
                                                        Kirim Usulan
                                                    </span>
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Modal dengan animasi */}
            <AnimatePresence>
                {selectedVoting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setSelectedVoting(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-black max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {(() => {
                                const statusConfig = getStatusConfig(selectedVoting.status);
                                const StatusIcon = statusConfig.icon;
                                const categoryConfig = getCategoryConfig(selectedVoting.category);

                                return (
                                    <>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <motion.span
                                                    initial={{ scale: 0, x: -20 }}
                                                    animate={{ scale: 1, x: 0 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                                                >
                                                    <StatusIcon className="h-4 w-4" />
                                                    {statusConfig.label}
                                                </motion.span>
                                                <motion.span
                                                    initial={{ scale: 0, x: -20 }}
                                                    animate={{ scale: 1, x: 0 }}
                                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${categoryConfig.color}`}
                                                >
                                                    <Icon icon={categoryConfig.icon} className="w-4 h-4" />
                                                    {categoryConfig.label}
                                                </motion.span>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedVoting(null)}
                                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <X className="h-5 w-5 text-slate-400" />
                                            </motion.button>
                                        </div>

                                        <motion.h3
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-2xl font-bold text-slate-900 dark:text-white mb-3"
                                        >
                                            {selectedVoting.title}
                                        </motion.h3>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="mb-4"
                                        >
                                            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                                                {formatCurrency(selectedVoting.amount)}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6"
                                        >
                                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedVoting.description}</p>
                                        </motion.div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                            >
                                                <p className="text-xs text-slate-500 mb-1">Diusulkan oleh</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{selectedVoting.creator}</p>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                                            >
                                                <p className="text-xs text-slate-500 mb-1">Deadline Voting</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedVoting.voting_deadline)}</p>
                                            </motion.div>
                                        </div>

                                        {/* Vote Progress */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold text-slate-900 dark:text-white">Hasil Voting</span>
                                                <span className="text-sm text-slate-500">{selectedVoting.stats.total} dari min. {selectedVoting.min_votes} votes</span>
                                            </div>
                                            <div className="flex h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 mb-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedVoting.stats.total > 0 ? (selectedVoting.stats.approve / selectedVoting.stats.total) * 100 : 0}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                />
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${selectedVoting.stats.total > 0 ? (selectedVoting.stats.reject / selectedVoting.stats.total) * 100 : 0}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="bg-gradient-to-r from-red-400 to-red-600"
                                                />
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                    <span className="text-sm font-medium text-emerald-600">{selectedVoting.stats.approve} Setuju ({selectedVoting.stats.approval_percentage}%)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                                    <span className="text-sm font-medium text-red-600">{selectedVoting.stats.reject} Tolak ({100 - selectedVoting.stats.approval_percentage}%)</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Vote Buttons */}
                                        {selectedVoting.status === 'open' && !selectedVoting.is_expired && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="flex gap-3"
                                            >
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button
                                                        className={`w-full h-12 ${selectedVoting.my_vote === 'approve'
                                                            ? 'bg-emerald-600 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30'
                                                            }`}
                                                        onClick={() => handleVote(selectedVoting.id, 'approve')}
                                                        disabled={selectedVoting.my_vote === 'approve'}
                                                    >
                                                        <ThumbsUp className="h-5 w-5 mr-2" />
                                                        {selectedVoting.my_vote === 'approve' ? 'Sudah Setuju' : 'Setuju'}
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                    <Button
                                                        variant="destructive"
                                                        className={`w-full h-12 ${selectedVoting.my_vote === 'reject' ? 'cursor-not-allowed' : 'shadow-lg shadow-red-500/30'}`}
                                                        onClick={() => handleVote(selectedVoting.id, 'reject')}
                                                        disabled={selectedVoting.my_vote === 'reject'}
                                                    >
                                                        <ThumbsDown className="h-5 w-5 mr-2" />
                                                        {selectedVoting.my_vote === 'reject' ? 'Sudah Tolak' : 'Tolak'}
                                                    </Button>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
