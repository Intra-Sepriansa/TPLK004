import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Trophy, Medal, Crown, Star, Flame, TrendingUp, Users, Award, Sparkles, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

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
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredRank, setHoveredRank] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/user/leaderboard', { period: newPeriod }, { preserveState: true });
    };


    return (
        <StudentLayout>
            <Head title="Leaderboard" />
            <div className="p-6 space-y-6">
                {/* Animated Header with Particles */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-8 text-white shadow-2xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    {/* Animated Background Circles */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" style={{ animation: 'pulse 6s infinite' }} />
                    
                    {/* Floating Sparkles */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-bounce"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + Math.random() * 40}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            <Sparkles className="h-4 w-4 text-white/60" />
                        </div>
                    ))}
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 font-medium">Kompetisi Kelas</p>
                                    <h1 className="text-3xl font-bold">Leaderboard</h1>
                                    <p className="text-sm text-gray-300 mt-1">Bersaing dan raih peringkat tertinggi!</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl p-1">
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'month', label: 'Bulan Ini' },
                                    { value: 'week', label: 'Minggu Ini' },
                                ].map(p => (
                                    <button
                                        key={p.value}
                                        onClick={() => handlePeriodChange(p.value)}
                                        className={cn(
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                            period === p.value
                                                ? 'bg-white text-gray-900 shadow-lg'
                                                : 'text-white/80 hover:bg-white/10'
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-gray-300" />
                                    <p className="text-gray-300 text-xs font-medium">Total Peserta</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.total_students}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-gray-300" />
                                    <p className="text-gray-300 text-xs font-medium">Rata-rata</p>
                                </div>
                                <p className="text-2xl font-bold">{stats.avg_attendance_rate}%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="h-4 w-4 text-gray-300" />
                                    <p className="text-gray-300 text-xs font-medium">Peringkat Kamu</p>
                                </div>
                                <p className="text-2xl font-bold">#{myRank || '-'}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="h-4 w-4 text-gray-300" />
                                    <p className="text-gray-300 text-xs font-medium">Poin Kamu</p>
                                </div>
                                <p className="text-2xl font-bold">{myStats?.points || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* My Rank Card */}
                {myRank && myStats && (
                    <div className={`rounded-2xl bg-gradient-to-br from-black to-slate-800 p-6 text-white shadow-xl transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold shadow-lg animate-pulse" style={{ animationDuration: '2s' }}>
                                    #{myRank}
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Peringkat Kamu</p>
                                    <p className="text-2xl font-bold">{mahasiswa.nama}</p>
                                    <p className="text-sm text-slate-400 flex items-center gap-2">
                                        <Star className="h-4 w-4 text-amber-400" />
                                        {myStats.points} poin • Level {myStats.level}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <p className="text-2xl font-bold text-emerald-400">{myStats.attendance_rate}%</p>
                                    <p className="text-xs text-slate-400">Kehadiran</p>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <div className="flex items-center justify-center gap-1 text-amber-400">
                                        <Flame className="h-5 w-5 animate-pulse" />
                                        <p className="text-2xl font-bold">{myStats.streak}</p>
                                    </div>
                                    <p className="text-xs text-slate-400">Streak</p>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <p className="text-2xl font-bold text-blue-400">{myStats.on_time_rate}%</p>
                                    <p className="text-xs text-slate-400">Tepat Waktu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Podium */}
                {podium.length >= 3 && (
                    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                                    <Crown className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Top 3 Terbaik</h2>
                                    <p className="text-xs text-slate-500">Mahasiswa dengan performa terbaik</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-end justify-center gap-4">
                                {/* 2nd Place */}
                                <div 
                                    className="flex flex-col items-center transition-all duration-500 hover:scale-105"
                                    onMouseEnter={() => setHoveredRank(2)}
                                    onMouseLeave={() => setHoveredRank(null)}
                                >
                                    <div className="relative">
                                        <div className={cn(
                                            'h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-slate-300 transition-all duration-300',
                                            rankColors[2],
                                            hoveredRank === 2 && 'scale-110 ring-slate-400'
                                        )}>
                                            {podium[1]?.avatar_url ? (
                                                <img src={podium[1].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[1]?.nama?.charAt(0) || '2'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold shadow-lg">
                                            2
                                        </div>
                                    </div>
                                    <p className="mt-3 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[100px] truncate">{podium[1]?.nama}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-slate-400" />
                                        {podium[1]?.points} pts
                                    </p>
                                    <div className="mt-2 h-24 w-24 rounded-t-lg bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                                        <Medal className="h-8 w-8 text-slate-500" />
                                    </div>
                                </div>


                                {/* 1st Place */}
                                <div 
                                    className="flex flex-col items-center -mt-8 transition-all duration-500 hover:scale-105"
                                    onMouseEnter={() => setHoveredRank(1)}
                                    onMouseLeave={() => setHoveredRank(null)}
                                >
                                    <Crown className={cn(
                                        "h-10 w-10 text-yellow-500 mb-2 transition-all duration-300",
                                        hoveredRank === 1 && "animate-bounce"
                                    )} />
                                    <div className="relative">
                                        <div className={cn(
                                            'h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-yellow-400 transition-all duration-300',
                                            rankColors[1],
                                            hoveredRank === 1 && 'scale-110 ring-yellow-300 shadow-yellow-500/50'
                                        )}>
                                            {podium[0]?.avatar_url ? (
                                                <img src={podium[0].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[0]?.nama?.charAt(0) || '1'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold shadow-lg">
                                            1
                                        </div>
                                    </div>
                                    <p className="mt-3 font-bold text-slate-900 dark:text-white text-center max-w-[120px] truncate">{podium[0]?.nama}</p>
                                    <p className="text-sm text-amber-600 font-semibold flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {podium[0]?.points} pts
                                    </p>
                                    <div className="mt-2 h-32 w-28 rounded-t-lg bg-gradient-to-b from-yellow-300 to-amber-400 dark:from-yellow-600 dark:to-amber-700 flex items-center justify-center">
                                        <Trophy className="h-10 w-10 text-yellow-700" />
                                    </div>
                                </div>


                                {/* 3rd Place */}
                                <div 
                                    className="flex flex-col items-center transition-all duration-500 hover:scale-105"
                                    onMouseEnter={() => setHoveredRank(3)}
                                    onMouseLeave={() => setHoveredRank(null)}
                                >
                                    <div className="relative">
                                        <div className={cn(
                                            'h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-amber-600 transition-all duration-300',
                                            rankColors[3],
                                            hoveredRank === 3 && 'scale-110 ring-amber-500'
                                        )}>
                                            {podium[2]?.avatar_url ? (
                                                <img src={podium[2].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                podium[2]?.nama?.charAt(0) || '3'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow-lg">
                                            3
                                        </div>
                                    </div>
                                    <p className="mt-3 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[100px] truncate">{podium[2]?.nama}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500" />
                                        {podium[2]?.points} pts
                                    </p>
                                    <div className="mt-2 h-16 w-24 rounded-t-lg bg-gradient-to-b from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800 flex items-center justify-center">
                                        <Award className="h-6 w-6 text-amber-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Stats Cards */}
                <div className={`grid gap-4 md:grid-cols-3 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Peserta</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_students}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Rata-rata Kehadiran</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.avg_attendance_rate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Peringkat Kamu</p>
                                <p className="text-2xl font-bold text-amber-600">#{myRank || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Full Leaderboard */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-900 to-black text-white">
                                <Trophy className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Ranking Lengkap</h2>
                                <p className="text-xs text-slate-500">Semua peserta berdasarkan poin</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {leaderboard.map((entry, index) => {
                            const rank = index + 1;
                            const isMe = entry.id === mahasiswa.id;
                            
                            return (
                                <div
                                    key={entry.id}
                                    className={cn(
                                        'p-4 flex items-center gap-4 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-black/30',
                                        isMe && 'bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50'
                                    )}
                                    style={{ 
                                        animationDelay: `${index * 50}ms`,
                                        animation: isLoaded ? 'fadeInLeft 0.5s ease-out forwards' : 'none'
                                    }}
                                >
                                    <div className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-xl font-bold text-sm transition-all',
                                        rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30' :
                                        rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 shadow-lg' :
                                        rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-500/30' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    )}>
                                        {rank <= 3 ? (
                                            rank === 1 ? <Crown className="h-5 w-5" /> :
                                            rank === 2 ? <Medal className="h-5 w-5" /> :
                                            <Award className="h-5 w-5" />
                                        ) : rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                'font-medium truncate',
                                                isMe ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'
                                            )}>
                                                {entry.nama}
                                            </p>
                                            {isMe && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 animate-pulse">
                                                    Kamu
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">{entry.nim} • {entry.kelas || '-'}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center hidden sm:block">
                                            <p className="font-semibold text-emerald-600">{entry.attendance_rate}%</p>
                                            <p className="text-xs text-slate-400">Kehadiran</p>
                                        </div>
                                        <div className="text-center hidden md:block">
                                            <div className="flex items-center gap-1 text-amber-600 justify-center">
                                                <Flame className="h-4 w-4" />
                                                <span className="font-semibold">{entry.streak}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Streak</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-900 dark:text-white">{entry.points}</p>
                                            <p className="text-xs text-slate-400">Poin</p>
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400">
                                            <Zap className="h-3 w-3" />
                                            <span className="text-xs font-medium">Lv.{entry.level}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </StudentLayout>
    );
}