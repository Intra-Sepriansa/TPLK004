import { Head, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    Flame,
    Star,
    Zap,
    Award,
    Trophy,
    Crown,
    Lock,
    CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AchievementType = 'streak' | 'perfect' | 'early' | 'consistent' | 'champion' | 'legend';

interface Achievement {
    type: AchievementType;
    name: string;
    description: string;
    requirement: string;
    progress: number;
    target: number;
    unlocked: boolean;
    unlockedAt?: string;
    points: number;
}

interface PageProps {
    mahasiswa: { nama: string; nim: string };
    achievements: Achievement[];
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    rank?: number;
    totalStudents?: number;
}

const achievementIcons = {
    streak: Flame,
    perfect: Star,
    early: Zap,
    consistent: Award,
    champion: Trophy,
    legend: Crown,
};

const achievementColors = {
    streak: 'from-orange-400 to-red-500',
    perfect: 'from-yellow-400 to-amber-500',
    early: 'from-sky-400 to-blue-500',
    consistent: 'from-emerald-400 to-green-500',
    champion: 'from-violet-400 to-purple-500',
    legend: 'from-rose-400 to-pink-500',
};

export default function Achievements() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { nama: '', nim: '' },
        achievements = [],
        totalPoints = 0,
        level = 1,
        nextLevelPoints = 100,
        rank,
        totalStudents,
    } = props as unknown as PageProps;

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const levelProgress = nextLevelPoints > 0 ? (totalPoints % nextLevelPoints) / nextLevelPoints * 100 : 0;

    // Default achievements if none provided
    const defaultAchievements: Achievement[] = [
        {
            type: 'streak',
            name: 'Streak Master',
            description: 'Hadir berturut-turut tanpa absen',
            requirement: 'Hadir 7 hari berturut-turut',
            progress: 3,
            target: 7,
            unlocked: false,
            points: 100,
        },
        {
            type: 'perfect',
            name: 'Perfect Attendance',
            description: 'Kehadiran sempurna dalam satu bulan',
            requirement: '100% kehadiran selama 1 bulan',
            progress: 85,
            target: 100,
            unlocked: false,
            points: 200,
        },
        {
            type: 'early',
            name: 'Early Bird',
            description: 'Selalu hadir tepat waktu',
            requirement: 'Tidak pernah terlambat dalam 10 sesi',
            progress: 8,
            target: 10,
            unlocked: false,
            points: 150,
        },
        {
            type: 'consistent',
            name: 'Consistent',
            description: 'Kehadiran konsisten di atas 80%',
            requirement: 'Pertahankan kehadiran >80% selama semester',
            progress: 82,
            target: 80,
            unlocked: true,
            unlockedAt: '2025-12-15',
            points: 250,
        },
        {
            type: 'champion',
            name: 'Champion',
            description: 'Top 10 kehadiran di kelas',
            requirement: 'Masuk 10 besar kehadiran tertinggi',
            progress: 0,
            target: 1,
            unlocked: false,
            points: 300,
        },
        {
            type: 'legend',
            name: 'Legend',
            description: 'Pencapaian tertinggi',
            requirement: 'Unlock semua achievement lainnya',
            progress: 1,
            target: 5,
            unlocked: false,
            points: 500,
        },
    ];

    const displayAchievements = achievements.length > 0 ? achievements : defaultAchievements;

    return (
        <StudentLayout>
            <Head title="Pencapaian" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Gamification
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Pencapaian Saya
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Trophy className="h-5 w-5" />
                        <span className="font-bold">{unlockedCount}/{displayAchievements.length}</span>
                        <span className="text-sm">unlocked</span>
                    </div>
                </div>

                {/* Level & Points Card */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold shadow-lg">
                                {level}
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Level</p>
                                <p className="text-2xl font-bold">
                                    {level < 5 ? 'Pemula' : level < 10 ? 'Rajin' : level < 20 ? 'Expert' : 'Master'}
                                </p>
                                <p className="text-sm text-slate-400">
                                    <AnimatedCounter value={totalPoints} /> poin total
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 min-w-[200px] max-w-md">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Progress ke Level {level + 1}</span>
                                <span className="text-amber-400">
                                    {totalPoints % nextLevelPoints}/{nextLevelPoints}
                                </span>
                            </div>
                            <Progress
                                value={levelProgress}
                                className="h-3 bg-slate-700"
                                indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500"
                            />
                        </div>

                        {rank && totalStudents && (
                            <div className="text-center">
                                <p className="text-slate-400 text-sm">Peringkat</p>
                                <p className="text-3xl font-bold text-amber-400">#{rank}</p>
                                <p className="text-xs text-slate-500">dari {totalStudents} mahasiswa</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayAchievements.map((achievement, index) => {
                        const Icon = achievementIcons[achievement.type];
                        const gradientColor = achievementColors[achievement.type];
                        const progressPercent = achievement.target > 0 
                            ? Math.min((achievement.progress / achievement.target) * 100, 100) 
                            : 0;

                        return (
                            <div
                                key={index}
                                className={cn(
                                    'rounded-2xl border p-6 transition-all',
                                    achievement.unlocked
                                        ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30'
                                        : 'border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/70'
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn(
                                        'flex h-14 w-14 items-center justify-center rounded-2xl',
                                        achievement.unlocked
                                            ? `bg-gradient-to-br ${gradientColor} text-white shadow-lg`
                                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                    )}>
                                        {achievement.unlocked ? (
                                            <Icon className="h-7 w-7" />
                                        ) : (
                                            <Lock className="h-6 w-6" />
                                        )}
                                    </div>
                                    {achievement.unlocked && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <CheckCircle className="h-3 w-3" />
                                            Unlocked
                                        </div>
                                    )}
                                </div>

                                <h3 className={cn(
                                    'font-bold text-lg',
                                    achievement.unlocked
                                        ? 'text-amber-900 dark:text-amber-100'
                                        : 'text-slate-900 dark:text-white'
                                )}>
                                    {achievement.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {achievement.description}
                                </p>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-slate-500">{achievement.requirement}</span>
                                        <span className={cn(
                                            'font-medium',
                                            achievement.unlocked ? 'text-emerald-600' : 'text-slate-600'
                                        )}>
                                            {achievement.progress}/{achievement.target}
                                        </span>
                                    </div>
                                    <Progress
                                        value={progressPercent}
                                        className="h-2"
                                        indicatorClassName={cn(
                                            achievement.unlocked
                                                ? 'bg-emerald-500'
                                                : `bg-gradient-to-r ${gradientColor}`
                                        )}
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-amber-600">
                                        <Star className="h-4 w-4" />
                                        <span className="font-bold">{achievement.points}</span>
                                        <span className="text-xs text-slate-500">poin</span>
                                    </div>
                                    {achievement.unlockedAt && (
                                        <span className="text-xs text-slate-400">
                                            {new Date(achievement.unlockedAt).toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
                        💡 Tips Mendapatkan Achievement
                    </h2>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-start gap-2">
                            <Flame className="h-4 w-4 mt-0.5 text-orange-500" />
                            <span>Hadir setiap hari untuk membangun streak dan mendapat bonus poin</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Zap className="h-4 w-4 mt-0.5 text-sky-500" />
                            <span>Datang tepat waktu untuk unlock achievement Early Bird</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Star className="h-4 w-4 mt-0.5 text-amber-500" />
                            <span>Pertahankan kehadiran 100% selama sebulan untuk Perfect Attendance</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Trophy className="h-4 w-4 mt-0.5 text-violet-500" />
                            <span>Bersaing dengan teman sekelas untuk masuk top 10 dan jadi Champion</span>
                        </li>
                    </ul>
                </div>
            </div>
        </StudentLayout>
    );
}
