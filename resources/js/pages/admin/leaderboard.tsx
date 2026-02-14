import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Medal, Crown, Star, Flame, TrendingUp, Users, Award, Filter, 
    Download, Sparkles, Target, Zap, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LeaderboardEntry {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    avatar_url: string | null;
    total_sessions: number;
    total_attendance: number;
    present_count: number;
    late_count: number;
    attendance_rate: number;
    on_time_rate: number;
    streak: number;
    points: number;
    level: number;
}

interface PageProps {
    leaderboard: LeaderboardEntry[];
    podium: LeaderboardEntry[];
    stats: { total_students: number; avg_attendance_rate: number; avg_points: number };
    kelasList: string[];
    filters: { period: string; kelas: string };
}

const rankColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-600 to-orange-700',
};

export default function AdminLeaderboard({ leaderboard, podium, stats, kelasList, filters }: PageProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [hoveredRank, setHoveredRank] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/leaderboard', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Leaderboard" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 space-y-6"
            >
                {/* Animated Header with Rotating Particles */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
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
                            <Trophy className="h-32 w-32" />
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
                            <Award className="h-28 w-28" />
                        </motion.div>
                    </div>
                    
                    {/* Floating Academic Icons */}
                    {[Trophy, Award, Medal, Crown, Star].map((Icon, i) => (
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
                        <div className="flex items-center gap-4 mb-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                whileHover={{ 
                                    scale: 1.1, 
                                    rotate: 360,
                                    boxShadow: "0 0 30px rgba(255,255,255,0.5)"
                                }}
                                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl"
                            >
                                <Trophy className="h-10 w-10" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-teal-100 font-medium flex items-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    Gamifikasi & Kompetisi
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold"
                                >
                                    Leaderboard Mahasiswa
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-teal-100 mt-1"
                                >
                                    Ranking mahasiswa berdasarkan kehadiran dan pencapaian
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/80"
                >
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Filter:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {['all', 'month', 'week'].map(p => (
                                <motion.button
                                    key={p}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleFilter('period', p)}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        filters.period === p
                                            ? 'bg-gradient-to-r from-gray-800 to-black text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                    )}
                                >
                                    {p === 'all' ? 'Semua Waktu' : p === 'month' ? 'Bulan Ini' : 'Minggu Ini'}
                                </motion.button>
                            ))}
                        </div>
                        <select
                            value={filters.kelas}
                            onChange={e => handleFilter('kelas', e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black dark:text-white"
                        >
                            <option value="all">Semua Kelas</option>
                            {kelasList.map(k => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid gap-4 md:grid-cols-3"
                >
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        onHoverStart={() => setHoveredCard('students')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-lg backdrop-blur dark:border-blue-800/70 dark:from-blue-950/50 dark:to-cyan-950/50"
                    >
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'students' ? 1.5 : 1,
                                opacity: hoveredCard === 'students' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                            >
                                <Users className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Mahasiswa</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_students}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        onHoverStart={() => setHoveredCard('attendance')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-lg backdrop-blur dark:border-emerald-800/70 dark:from-emerald-950/50 dark:to-teal-950/50"
                    >
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'attendance' ? 1.5 : 1,
                                opacity: hoveredCard === 'attendance' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                            >
                                <TrendingUp className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Rata-rata Kehadiran</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avg_attendance_rate}%</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        onHoverStart={() => setHoveredCard('points')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-lg backdrop-blur dark:border-amber-800/70 dark:from-amber-950/50 dark:to-yellow-950/50"
                    >
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'points' ? 1.5 : 1,
                                opacity: hoveredCard === 'points' ? 0.3 : 0.1,
                            }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500 blur-3xl"
                        />
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/50"
                            >
                                <Star className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Rata-rata Poin</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.avg_points}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Podium - Top 3 with Premium Design */}
                {podium.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 shadow-lg backdrop-blur dark:border-slate-800/70 overflow-hidden"
                    >
                        {/* Animated Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
                                    animate={{
                                        y: [0, -100],
                                        x: [0, Math.random() * 50 - 25],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        bottom: 0,
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg"
                                >
                                    <Crown className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">🏆 Top 3 Terbaik</h2>
                                    <p className="text-xs text-slate-500">Mahasiswa dengan performa terbaik</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative p-8">
                            <div className="flex items-end justify-center gap-6">
                                {/* 2nd Place */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    onHoverStart={() => setHoveredRank(2)}
                                    onHoverEnd={() => setHoveredRank(null)}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                boxShadow: hoveredRank === 2 
                                                    ? '0 20px 40px -5px rgba(148, 163, 184, 0.5)' 
                                                    : '0 10px 20px -3px rgba(148, 163, 184, 0.3)',
                                            }}
                                            className={cn(
                                                'h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl ring-4 ring-slate-300 transition-all',
                                                rankColors[2]
                                            )}
                                        >
                                            {podium[1]?.avatar_url ? (
                                                <img src={podium[1].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[1]?.nama?.charAt(0) || '2'
                                            )}
                                        </motion.div>
                                        <motion.div 
                                            animate={{
                                                scale: hoveredRank === 2 ? [1, 1.2, 1] : 1,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold shadow-lg text-lg"
                                        >
                                            2
                                        </motion.div>
                                    </div>
                                    <p className="mt-3 font-semibold text-slate-900 dark:text-white text-center max-w-[120px] truncate">{podium[1]?.nama}</p>
                                    <p className="text-xs text-slate-500">{podium[1]?.nim}</p>
                                    <p className="text-sm text-slate-600 font-semibold flex items-center gap-1 mt-1">
                                        <Star className="h-4 w-4 text-slate-400" />
                                        {podium[1]?.points} pts
                                    </p>
                                    <motion.div
                                        animate={{ height: hoveredRank === 2 ? 110 : 100 }}
                                        className="mt-3 w-28 rounded-t-xl bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-xl"
                                    >
                                        <Medal className="h-10 w-10 text-slate-500" />
                                    </motion.div>
                                </motion.div>

                                {/* 1st Place - Special Throne Design */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    onHoverStart={() => setHoveredRank(1)}
                                    onHoverEnd={() => setHoveredRank(null)}
                                    className="flex flex-col items-center -mt-12 relative"
                                >
                                    {/* Crown Image with Animation */}
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: hoveredRank === 1 ? [0, -5, 5, -5, 0] : 0,
                                            scale: hoveredRank === 1 ? [1, 1.5, 1] : 1,
                                        }}
                                        transition={{
                                            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                            rotate: { duration: 0.5 },
                                            scale: { duration: 0.5 }
                                        }}
                                        className="relative mb-4"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-yellow-400 rounded-full blur-xl"
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.6, 0.9, 0.6],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        />
                                        <img 
                                            src="/images/crown.png" 
                                            alt="Crown" 
                                            className="h-80 w-80 relative z-10 drop-shadow-[0_20px_50px_rgba(234,179,8,1)]"
                                        />
                                    </motion.div>

                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                boxShadow: hoveredRank === 1 
                                                    ? '0 30px 60px -12px rgba(234, 179, 8, 0.8)' 
                                                    : '0 25px 50px -12px rgba(234, 179, 8, 0.5)',
                                            }}
                                            className={cn(
                                                'h-32 w-32 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-3xl ring-4 ring-yellow-400 transition-all shadow-2xl',
                                                rankColors[1]
                                            )}
                                        >
                                            {podium[0]?.avatar_url ? (
                                                <img src={podium[0].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[0]?.nama?.charAt(0) || '1'
                                            )}
                                        </motion.div>
                                        <motion.div 
                                            animate={{
                                                scale: hoveredRank === 1 ? [1, 1.3, 1] : 1,
                                                rotate: hoveredRank === 1 ? [0, 360] : 0,
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900 font-bold shadow-2xl text-xl"
                                        >
                                            1
                                        </motion.div>
                                    </div>
                                    
                                    {/* Badge "JUARA 1" */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="mt-4 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg"
                                    >
                                        🏆 JUARA 1
                                    </motion.div>
                                    
                                    <p className="mt-2 font-bold text-slate-900 dark:text-white text-lg text-center max-w-[140px] truncate">{podium[0]?.nama}</p>
                                    <p className="text-sm text-slate-500">{podium[0]?.nim}</p>
                                    <p className="text-lg text-amber-600 font-bold flex items-center gap-1 mt-1">
                                        <Star className="h-5 w-5 fill-amber-500" />
                                        {podium[0]?.points} pts
                                    </p>
                                    <motion.div
                                        animate={{ height: hoveredRank === 1 ? 150 : 140 }}
                                        className="mt-4 w-36 rounded-t-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 dark:from-yellow-600 dark:to-amber-700 flex items-center justify-center shadow-2xl relative overflow-hidden"
                                    >
                                        {/* Shimmer Effect */}
                                        <motion.div
                                            animate={{
                                                x: ['-100%', '200%'],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        />
                                        <Trophy className="h-12 w-12 text-yellow-700 relative z-10" />
                                    </motion.div>
                                </motion.div>

                                {/* 3rd Place */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, type: 'spring' }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    onHoverStart={() => setHoveredRank(3)}
                                    onHoverEnd={() => setHoveredRank(null)}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                boxShadow: hoveredRank === 3 
                                                    ? '0 20px 40px -5px rgba(217, 119, 6, 0.5)' 
                                                    : '0 10px 20px -3px rgba(217, 119, 6, 0.3)',
                                            }}
                                            className={cn(
                                                'h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl ring-4 ring-amber-600 transition-all',
                                                rankColors[3]
                                            )}
                                        >
                                            {podium[2]?.avatar_url ? (
                                                <img src={podium[2].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[2]?.nama?.charAt(0) || '3'
                                            )}
                                        </motion.div>
                                        <motion.div 
                                            animate={{
                                                scale: hoveredRank === 3 ? [1, 1.2, 1] : 1,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow-lg text-lg"
                                        >
                                            3
                                        </motion.div>
                                    </div>
                                    <p className="mt-3 font-semibold text-slate-900 dark:text-white text-center max-w-[120px] truncate">{podium[2]?.nama}</p>
                                    <p className="text-xs text-slate-500">{podium[2]?.nim}</p>
                                    <p className="text-sm text-amber-600 font-semibold flex items-center gap-1 mt-1">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        {podium[2]?.points} pts
                                    </p>
                                    <motion.div
                                        animate={{ height: hoveredRank === 3 ? 78 : 70 }}
                                        className="mt-3 w-28 rounded-t-xl bg-gradient-to-b from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800 flex items-center justify-center shadow-xl"
                                    >
                                        <Award className="h-8 w-8 text-amber-200" />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Full Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-black/80 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-black/30">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 text-white">
                                <Trophy className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Ranking Lengkap</h2>
                                <p className="text-xs text-slate-500">Semua mahasiswa berdasarkan poin</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Rank</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Kelas</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Kehadiran</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tepat Waktu</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Streak</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Poin</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {leaderboard.map((entry, index) => {
                                    const rank = index + 1;
                                    return (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + index * 0.05 }}
                                            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                            className="cursor-pointer"
                                        >
                                            <td className="px-4 py-3">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className={cn(
                                                        'flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm',
                                                        rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30' :
                                                        rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 shadow-lg' :
                                                        rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-500/30' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    )}
                                                >
                                                    {rank <= 3 ? (
                                                        rank === 1 ? <Crown className="h-5 w-5" /> :
                                                        rank === 2 ? <Medal className="h-5 w-5" /> :
                                                        <Award className="h-5 w-5" />
                                                    ) : rank}
                                                </motion.div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900 dark:text-white">{entry.nama}</p>
                                                <p className="text-xs text-slate-500">{entry.nim}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{entry.kelas || '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-semibold text-emerald-600">{entry.attendance_rate}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-blue-600">{entry.on_time_rate}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1 text-amber-600">
                                                    <Flame className="h-4 w-4" />
                                                    <span className="font-semibold">{entry.streak}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-bold text-slate-900 dark:text-white">{entry.points}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium dark:bg-purple-900/30 dark:text-purple-400">
                                                    <Zap className="h-3 w-3" />
                                                    Lv.{entry.level}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
