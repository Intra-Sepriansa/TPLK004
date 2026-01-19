import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Trophy, Medal, Crown, Star, Flame, TrendingUp, Users, Award, Filter, Download } from 'lucide-react';
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
    const handleFilter = (key: string, value: string) => {
        router.get('/admin/leaderboard', { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Leaderboard" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Gamifikasi</p>
                                <h1 className="text-2xl font-bold">Leaderboard Mahasiswa</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">Ranking mahasiswa berdasarkan kehadiran dan pencapaian</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Filter:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {['all', 'month', 'week'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => handleFilter('period', p)}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                        filters.period === p
                                            ? 'bg-gradient-to-r from-gray-900 to-black text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                    )}
                                >
                                    {p === 'all' ? 'Semua Waktu' : p === 'month' ? 'Bulan Ini' : 'Minggu Ini'}
                                </button>
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
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Mahasiswa</p>
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
                                <Star className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rata-rata Poin</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.avg_points}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Podium */}
                {podium.length >= 3 && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 text-center">🏆 Top 3 Mahasiswa</h2>
                        <div className="flex items-end justify-center gap-4">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className={cn('h-16 w-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg', rankColors[2])}>
                                        {podium[1]?.nama?.charAt(0) || '2'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold text-xs shadow">2</div>
                                </div>
                                <p className="mt-2 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[80px] truncate">{podium[1]?.nama}</p>
                                <p className="text-xs text-slate-500">{podium[1]?.points} pts</p>
                                <div className="mt-2 h-20 w-20 rounded-t-lg bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                            </div>

                            {/* 1st Place */}
                            <div className="flex flex-col items-center -mt-6">
                                <Crown className="h-6 w-6 text-yellow-500 mb-1" />
                                <div className="relative">
                                    <div className={cn('h-20 w-20 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-yellow-400', rankColors[1])}>
                                        {podium[0]?.nama?.charAt(0) || '1'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold text-xs shadow">1</div>
                                </div>
                                <p className="mt-2 font-bold text-slate-900 dark:text-white text-center max-w-[100px] truncate">{podium[0]?.nama}</p>
                                <p className="text-sm text-amber-600 font-semibold">{podium[0]?.points} pts</p>
                                <div className="mt-2 h-28 w-24 rounded-t-lg bg-gradient-to-b from-yellow-300 to-amber-400 dark:from-yellow-600 dark:to-amber-700" />
                            </div>

                            {/* 3rd Place */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className={cn('h-16 w-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg', rankColors[3])}>
                                        {podium[2]?.nama?.charAt(0) || '3'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white font-bold text-xs shadow">3</div>
                                </div>
                                <p className="mt-2 font-semibold text-slate-900 dark:text-white text-sm text-center max-w-[80px] truncate">{podium[2]?.nama}</p>
                                <p className="text-xs text-slate-500">{podium[2]?.points} pts</p>
                                <div className="mt-2 h-14 w-20 rounded-t-lg bg-gradient-to-b from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
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
                                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-black/30">
                                            <td className="px-4 py-3">
                                                <div className={cn(
                                                    'flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm',
                                                    rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                                                    rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700' :
                                                    rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                )}>
                                                    {rank}
                                                </div>
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
                                                    <Star className="h-3 w-3" />
                                                    Lv.{entry.level}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
