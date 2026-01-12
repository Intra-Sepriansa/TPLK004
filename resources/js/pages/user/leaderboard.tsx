import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Trophy, Medal, Crown, Star, Flame, TrendingUp, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const rankColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-600 to-orange-700',
};

const rankIcons = {
    1: Crown,
    2: Medal,
    3: Award,
};

export default function Leaderboard({ mahasiswa, leaderboard, podium, myRank, myStats, stats, period }: PageProps) {
    const handlePeriodChange = (newPeriod: string) => {
        router.get('/user/leaderboard', { period: newPeriod }, { preserveState: true });
    };

    return (
        <StudentLayout>
            <Head title="Leaderboard" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Kompetisi</p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {['all', 'month', 'week'].map(p => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                    period === p
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                )}
                            >
                                {p === 'all' ? 'Semua' : p === 'month' ? 'Bulan Ini' : 'Minggu Ini'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* My Rank Card */}
                {myRank && myStats && (
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold shadow-lg">
                                    #{myRank}
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Peringkat Kamu</p>
                                    <p className="text-2xl font-bold">{mahasiswa.nama}</p>
                                    <p className="text-sm text-slate-400">{myStats.points} poin • Level {myStats.level}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-400">{myStats.attendance_rate}%</p>
                                    <p className="text-xs text-slate-400">Kehadiran</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-400">{myStats.streak}</p>
                                    <p className="text-xs text-slate-400">Streak</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">{myStats.on_time_rate}%</p>
                                    <p className="text-xs text-slate-400">Tepat Waktu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Podium */}
                {podium.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 py-8">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className={cn(
                                    'h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg',
                                    rankColors[2]
                                )}>
                                    {podium[1]?.avatar_url ? (
                                        <img src={podium[1].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        podium[1]?.nama?.charAt(0) || '2'
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold shadow">
                                    2
                                </div>
                            </div>
                            <p className="mt-3 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[100px] truncate">{podium[1]?.nama}</p>
                            <p className="text-xs text-slate-500">{podium[1]?.points} pts</p>
                            <div className="mt-2 h-24 w-24 rounded-t-lg bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center -mt-8">
                            <Crown className="h-8 w-8 text-yellow-500 mb-2" />
                            <div className="relative">
                                <div className={cn(
                                    'h-24 w-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-yellow-400',
                                    rankColors[1]
                                )}>
                                    {podium[0]?.avatar_url ? (
                                        <img src={podium[0].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        podium[0]?.nama?.charAt(0) || '1'
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold shadow">
                                    1
                                </div>
                            </div>
                            <p className="mt-3 font-bold text-slate-900 dark:text-white text-center max-w-[120px] truncate">{podium[0]?.nama}</p>
                            <p className="text-sm text-amber-600 font-semibold">{podium[0]?.points} pts</p>
                            <div className="mt-2 h-32 w-28 rounded-t-lg bg-gradient-to-b from-yellow-300 to-amber-400 dark:from-yellow-600 dark:to-amber-700" />
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className={cn(
                                    'h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg',
                                    rankColors[3]
                                )}>
                                    {podium[2]?.avatar_url ? (
                                        <img src={podium[2].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        podium[2]?.nama?.charAt(0) || '3'
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white font-bold shadow">
                                    3
                                </div>
                            </div>
                            <p className="mt-3 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[100px] truncate">{podium[2]?.nama}</p>
                            <p className="text-xs text-slate-500">{podium[2]?.points} pts</p>
                            <div className="mt-2 h-16 w-24 rounded-t-lg bg-gradient-to-b from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800" />
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Peserta</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total_students}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rata-rata Kehadiran</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.avg_attendance_rate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Peringkat Kamu</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">#{myRank || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Leaderboard */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Ranking Lengkap</h2>
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
                                        'p-4 flex items-center gap-4 transition-colors',
                                        isMe ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900/30'
                                    )}
                                >
                                    <div className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm',
                                        rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                                        rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700' :
                                        rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    )}>
                                        {rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                'font-medium truncate',
                                                isMe ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'
                                            )}>
                                                {entry.nama}
                                                {isMe && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/50 dark:text-blue-300">Kamu</span>}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500">{entry.nim} • {entry.kelas || '-'}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center hidden sm:block">
                                            <p className="font-semibold text-emerald-600">{entry.attendance_rate}%</p>
                                            <p className="text-xs text-slate-400">Kehadiran</p>
                                        </div>
                                        <div className="text-center hidden md:block">
                                            <div className="flex items-center gap-1 text-amber-600">
                                                <Flame className="h-4 w-4" />
                                                <span className="font-semibold">{entry.streak}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Streak</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-900 dark:text-white">{entry.points}</p>
                                            <p className="text-xs text-slate-400">Poin</p>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                            <Star className="h-3 w-3" />
                                            <span className="text-xs font-medium">Lv.{entry.level}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
