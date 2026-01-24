import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Trophy, Medal, Crown, Star, Flame, TrendingUp, Users, Award, Sparkles, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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
    mahasiswa: { id: number; nama: string; nim: string };
    leaderboard: LeaderboardEntry[];
    podium: LeaderboardEntry[];
    myRank: number | null;
    myStats: LeaderboardEntry | null;
    stats: { total_students: number; avg_attendance_rate: number };
    period: string;
}

const rankColors: Record<number, string> = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-600 to-orange-700',
};

export default function Leaderboard({ mahasiswa, leaderboard, podium, myRank, myStats, stats, period }: PageProps) {
    const [hoveredRank, setHoveredRank] = useState<number | null>(null);

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/user/leaderboard', { period: newPeriod }, { preserveState: true });
    };


    return (
        <StudentLayout>
            <Head title="Leaderboard" />
            <div className="p-6 space-y-6">
                {/* Animated Header with Rotating Particles */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-black p-8 text-white shadow-2xl border border-slate-700/50"
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl"
                        />
                    </div>
                    
                    {/* Floating Sparkles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                y: [0, -30, -60]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeOut"
                            }}
                            style={{
                                left: `${15 + i * 12}%`,
                                top: `${40 + Math.random() * 30}%`,
                            }}
                        >
                            <Sparkles className="h-4 w-4 text-yellow-400/80" />
                        </motion.div>
                    ))}
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/50"
                                >
                                    <Trophy className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-gray-300 font-medium"
                                    >
                                        Kompetisi Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                    >
                                        Leaderboard
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-gray-300 mt-1"
                                    >
                                        Bersaing dan raih peringkat tertinggi!
                                    </motion.p>
                                </div>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl p-1"
                            >
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'month', label: 'Bulan Ini' },
                                    { value: 'week', label: 'Minggu Ini' },
                                ].map((p, index) => (
                                    <motion.button
                                        key={p.value}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + index * 0.05 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePeriodChange(p.value)}
                                        className={cn(
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                            period === p.value
                                                ? 'bg-white text-gray-900 shadow-lg'
                                                : 'text-white/80 hover:bg-white/10'
                                        )}
                                    >
                                        {p.label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Users, label: 'Total Peserta', value: stats.total_students, color: 'from-blue-500 to-cyan-600', delay: 0.1 },
                                { icon: TrendingUp, label: 'Rata-rata', value: stats.avg_attendance_rate, suffix: '%', color: 'from-emerald-500 to-green-600', delay: 0.15 },
                                { icon: Target, label: 'Peringkat Kamu', value: myRank || 0, prefix: '#', color: 'from-purple-500 to-violet-600', delay: 0.2 },
                                { icon: Star, label: 'Poin Kamu', value: myStats?.points || 0, color: 'from-amber-500 to-yellow-600', delay: 0.25 },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        y: -5,
                                        transition: { type: "spring", stiffness: 400, damping: 10 }
                                    }}
                                    className="group relative overflow-hidden bg-white/10 backdrop-blur rounded-xl p-3 cursor-pointer"
                                >
                                    {/* Glow effect on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                                    
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-1">
                                            <stat.icon className="h-4 w-4 text-gray-300" />
                                            <p className="text-gray-300 text-xs font-medium">{stat.label}</p>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            <AnimatedCounter 
                                                value={stat.value} 
                                                prefix={stat.prefix || ''} 
                                                suffix={stat.suffix || ''} 
                                            />
                                        </p>
                                    </div>
                                    
                                    {/* Animated border */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                                        initial={{ width: "0%", opacity: 0 }}
                                        whileHover={{ width: "100%", opacity: 0.5 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>


                {/* My Rank Card with Advanced Animations */}
                {myRank && myStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black via-slate-900 to-slate-800 p-6 text-white shadow-2xl border border-slate-700/50"
                    >
                        {/* Animated glow effect */}
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-2xl"
                        />
                        
                        <div className="relative flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                                    whileHover={{ 
                                        scale: 1.1,
                                        rotate: [0, -10, 10, -10, 0],
                                        transition: { duration: 0.5 }
                                    }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold shadow-lg shadow-amber-500/50"
                                >
                                    #{myRank}
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-slate-400 text-sm"
                                    >
                                        Peringkat Kamu
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-2xl font-bold"
                                    >
                                        {mahasiswa.nama}
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-sm text-slate-400 flex items-center gap-2"
                                    >
                                        <Star className="h-4 w-4 text-amber-400" />
                                        <AnimatedCounter value={myStats.points} /> poin • Level {myStats.level}
                                    </motion.p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                {[
                                    { label: 'Kehadiran', value: myStats.attendance_rate, suffix: '%', color: 'emerald', icon: null, delay: 0.8 },
                                    { label: 'Streak', value: myStats.streak, suffix: '', color: 'amber', icon: Flame, delay: 0.85 },
                                    { label: 'Tepat Waktu', value: myStats.on_time_rate, suffix: '%', color: 'blue', icon: null, delay: 0.9 },
                                ].map((stat) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        className="text-center p-3 bg-white/5 rounded-xl backdrop-blur cursor-pointer"
                                    >
                                        <div className={`flex items-center justify-center gap-1 text-${stat.color}-400`}>
                                            {stat.icon && <stat.icon className="h-5 w-5 animate-pulse" />}
                                            <p className="text-2xl font-bold">
                                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* Podium with Enhanced Animations */}
                {podium.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                                    className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
                                >
                                    <Crown className="h-4 w-4" />
                                </motion.div>
                                <div>
                                    <motion.h2
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="font-semibold text-slate-900 dark:text-white"
                                    >
                                        Top 3 Terbaik
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-xs text-slate-500"
                                    >
                                        Mahasiswa dengan performa terbaik
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-end justify-center gap-4">
                                {/* 2nd Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className="flex flex-col items-center cursor-pointer"
                                    onMouseEnter={() => setHoveredRank(2)}
                                    onMouseLeave={() => setHoveredRank(null)}
                                >
                                    <div className="relative">
                                        <motion.div
                                            animate={hoveredRank === 2 ? { 
                                                rotate: [0, -5, 5, -5, 0],
                                                scale: [1, 1.1, 1]
                                            } : {}}
                                            transition={{ duration: 0.5 }}
                                            className={cn(
                                                'h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-slate-300 transition-all duration-300',
                                                rankColors[2],
                                                hoveredRank === 2 && 'ring-slate-400 shadow-2xl'
                                            )}
                                        >
                                            {podium[1]?.avatar_url ? (
                                                <img src={podium[1].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[1]?.nama?.charAt(0) || '2'
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
                                            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold shadow-lg"
                                        >
                                            2
                                        </motion.div>
                                    </div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="mt-3 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[100px] truncate"
                                    >
                                        {podium[1]?.nama}
                                    </motion.p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-slate-400" />
                                        <AnimatedCounter value={podium[1]?.points || 0} suffix=" pts" />
                                    </p>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 96 }}
                                        transition={{ delay: 1.1, duration: 0.5 }}
                                        className="mt-2 w-24 rounded-t-lg bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center"
                                    >
                                        <Medal className="h-8 w-8 text-slate-500" />
                                    </motion.div>
                                </motion.div>

                                {/* 1st Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className="flex flex-col items-center -mt-8 cursor-pointer"
                                    onMouseEnter={() => setHoveredRank(1)}
                                    onMouseLeave={() => setHoveredRank(null)}
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: hoveredRank === 1 ? [0, -10, 10, -10, 0] : 0
                                        }}
                                        transition={{
                                            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                            rotate: { duration: 0.5 }
                                        }}
                                    >
                                        <Crown className="h-10 w-10 text-yellow-500 mb-2" />
                                    </motion.div>
                                    <div className="relative">
                                        <motion.div
                                            animate={hoveredRank === 1 ? { 
                                                rotate: [0, -5, 5, -5, 0],
                                                scale: [1, 1.1, 1]
                                            } : {}}
                                            transition={{ duration: 0.5 }}
                                            className={cn(
                                                'h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-yellow-400 transition-all duration-300',
                                                rankColors[1],
                                                hoveredRank === 1 && 'ring-yellow-300 shadow-yellow-500/50 shadow-2xl'
                                            )}
                                        >
                                            {podium[0]?.avatar_url ? (
                                                <img src={podium[0].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[0]?.nama?.charAt(0) || '1'
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1, type: "spring", stiffness: 300 }}
                                            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold shadow-lg"
                                        >
                                            1
                                        </motion.div>
                                    </div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.1 }}
                                        className="mt-3 font-bold text-slate-900 dark:text-white text-center max-w-[120px] truncate"
                                    >
                                        {podium[0]?.nama}
                                    </motion.p>
                                    <p className="text-sm text-amber-600 font-semibold flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        <AnimatedCounter value={podium[0]?.points || 0} suffix=" pts" />
                                    </p>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 128 }}
                                        transition={{ delay: 1.2, duration: 0.5 }}
                                        className="mt-2 w-28 rounded-t-lg bg-gradient-to-b from-yellow-300 to-amber-400 dark:from-yellow-600 dark:to-amber-700 flex items-center justify-center"
                                    >
                                        <Trophy className="h-10 w-10 text-yellow-700" />
                                    </motion.div>
                                </motion.div>

                                {/* 3rd Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className="flex flex-col items-center cursor-pointer"
                                    onMouseEnter={() => setHoveredRank(3)}
                                    onMouseLeave={() => setHoveredRank(null)}
                                >
                                    <div className="relative">
                                        <motion.div
                                            animate={hoveredRank === 3 ? { 
                                                rotate: [0, -5, 5, -5, 0],
                                                scale: [1, 1.1, 1]
                                            } : {}}
                                            transition={{ duration: 0.5 }}
                                            className={cn(
                                                'h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-amber-600 transition-all duration-300',
                                                rankColors[3],
                                                hoveredRank === 3 && 'ring-amber-500 shadow-2xl'
                                            )}
                                        >
                                            {podium[2]?.avatar_url ? (
                                                <img src={podium[2].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[2]?.nama?.charAt(0) || '3'
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1.1, type: "spring", stiffness: 300 }}
                                            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow-lg"
                                        >
                                            3
                                        </motion.div>
                                    </div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2 }}
                                        className="mt-3 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[100px] truncate"
                                    >
                                        {podium[2]?.nama}
                                    </motion.p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500" />
                                        <AnimatedCounter value={podium[2]?.points || 0} suffix=" pts" />
                                    </p>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 64 }}
                                        transition={{ delay: 1.3, duration: 0.5 }}
                                        className="mt-2 w-24 rounded-t-lg bg-gradient-to-b from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800 flex items-center justify-center"
                                    >
                                        <Award className="h-6 w-6 text-amber-200" />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* Stats Cards with Dock-Style Animations */}
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { icon: Users, label: 'Total Peserta', value: stats.total_students, color: 'from-blue-500 to-cyan-600', delay: 0.5 },
                        { icon: TrendingUp, label: 'Rata-rata Kehadiran', value: stats.avg_attendance_rate, suffix: '%', color: 'from-emerald-500 to-green-600', delay: 0.55 },
                        { icon: Trophy, label: 'Peringkat Kamu', value: myRank || 0, prefix: '#', color: 'from-amber-500 to-yellow-600', delay: 0.6 },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: stat.delay + 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ rotate: 360 }}
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter 
                                            value={stat.value} 
                                            prefix={stat.prefix || ''} 
                                            suffix={stat.suffix || ''} 
                                        />
                                    </p>
                                </div>
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 dark:via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>


                {/* Full Leaderboard with Staggered Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, type: "spring", stiffness: 200 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                                className="p-2 rounded-lg bg-gradient-to-br from-gray-900 to-black text-white"
                            >
                                <Trophy className="h-4 w-4" />
                            </motion.div>
                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.75 }}
                                    className="font-semibold text-slate-900 dark:text-white"
                                >
                                    Ranking Lengkap
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-xs text-slate-500"
                                >
                                    Semua peserta berdasarkan poin
                                </motion.p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <AnimatePresence>
                            {leaderboard.map((entry, index) => {
                                const rank = index + 1;
                                const isMe = entry.id === mahasiswa.id;
                                
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: 0.85 + index * 0.03, type: "spring", stiffness: 200 }}
                                        whileHover={{ 
                                            scale: 1.02, 
                                            x: 5,
                                            transition: { type: "spring", stiffness: 400, damping: 10 }
                                        }}
                                        className={cn(
                                            'p-4 flex items-center gap-4 transition-all duration-300 cursor-pointer',
                                            isMe 
                                                ? 'bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50' 
                                                : 'hover:bg-slate-50 dark:hover:bg-black/30'
                                        )}
                                    >
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.9 + index * 0.03, type: "spring", stiffness: 200 }}
                                            whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                                            className={cn(
                                                'flex h-12 w-12 items-center justify-center rounded-xl font-bold text-sm transition-all',
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
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.95 + index * 0.03 }}
                                                    className={cn(
                                                        'font-medium truncate',
                                                        isMe ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'
                                                    )}
                                                >
                                                    {entry.nama}
                                                </motion.p>
                                                {isMe && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 1 + index * 0.03, type: "spring", stiffness: 300 }}
                                                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                                                    >
                                                        Kamu
                                                    </motion.span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">{entry.nim} • {entry.kelas || '-'}</p>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center hidden sm:block">
                                                <p className="font-semibold text-emerald-600">
                                                    <AnimatedCounter value={entry.attendance_rate} suffix="%" />
                                                </p>
                                                <p className="text-xs text-slate-400">Kehadiran</p>
                                            </div>
                                            <div className="text-center hidden md:block">
                                                <div className="flex items-center gap-1 text-amber-600 justify-center">
                                                    <Flame className="h-4 w-4" />
                                                    <span className="font-semibold">
                                                        <AnimatedCounter value={entry.streak} />
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">Streak</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    <AnimatedCounter value={entry.points} />
                                                </p>
                                                <p className="text-xs text-slate-400">Poin</p>
                                            </div>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.05 + index * 0.03, type: "spring", stiffness: 300 }}
                                                whileHover={{ scale: 1.1 }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400"
                                            >
                                                <Zap className="h-3 w-3" />
                                                <span className="text-xs font-medium">Lv.{entry.level}</span>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </StudentLayout>
    );
}