import historyIcon from '@/assets/mahasiswa/riwayat/riwayat.png';
import { PDFGenerator } from '@/components/export/pdf-generator';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { AttendanceStats } from '@/components/ui/attendance-stats';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    Award,
    BadgeCheck,
    BarChart3,
    Calendar as CalendarIcon,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    Download,
    Flame,
    Image,
    List,
    MapPin,
    RefreshCw,
    Search,
    Sparkles,
    TrendingUp,
    Trophy,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface AttendanceRecord {
    id: number;
    date: string;
    course: string;
    courseId: number;
    meetingNumber: number;
    status: 'present' | 'absent' | 'late' | 'pending' | 'rejected';
    checkInTime: string | null;
    distance: number | null;
    selfieUrl: string | null;
    selfieStatus?: 'approved' | 'pending' | 'rejected' | null;
    note: string | null;
    location?: { lat: number; lng: number };
}

interface Course {
    id: number;
    name: string;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    records: AttendanceRecord[];
    courses: Course[];
    stats: {
        present: number;
        absent: number;
        late: number;
        pending: number;
        total: number;
        streak: number;
        longestStreak: number;
    };
}

const statusConfig = {
    present: {
        label: 'Hadir',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle2,
    },
    absent: {
        label: 'Tidak Hadir',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: XCircle,
    },
    rejected: {
        label: 'Ditolak',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: XCircle,
    },
    late: {
        label: 'Terlambat',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock,
    },
    pending: {
        label: 'Pending',
        color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        icon: AlertCircle,
    },
};

const selfieStatusConfig = {
    approved: {
        label: 'Terverifikasi',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: BadgeCheck,
    },
    pending: {
        label: 'Menunggu',
        color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        icon: Clock,
    },
    rejected: {
        label: 'Ditolak',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: XCircle,
    },
};

const CHART_COLORS = {
    present: '#10b981',
    late: '#f59e0b',
    absent: '#f43f5e',
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 15,
        },
    },
};

// ========== TIMELINE VIEW ==========
interface TimelineItem {
    date: Date;
    records: AttendanceRecord[];
    milestone?: {
        type: 'streak' | 'perfect_week' | 'achievement';
        title: string;
        description: string;
    };
}

function AttendanceTimeline({ records }: { records: AttendanceRecord[] }) {
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

    const timelineData = useMemo(() => {
        const grouped: Record<string, TimelineItem[]> = {};
        records.forEach((record) => {
            const date = new Date(record.date);
            const monthKey = date.toLocaleDateString('id-ID', {
                month: 'long',
                year: 'numeric',
            });
            if (!grouped[monthKey]) grouped[monthKey] = [];
            const existingDay = grouped[monthKey].find(
                (item) => item.date.toDateString() === date.toDateString(),
            );
            if (existingDay) {
                existingDay.records.push(record);
            } else {
                grouped[monthKey].push({ date, records: [record] });
            }
        });
        return grouped;
    }, [records]);

    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className="mb-6 flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2"
                >
                    <Clock className="h-5 w-5 text-indigo-500" />
                </motion.div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Timeline Kehadiran
                </h2>
            </div>
            <div className="space-y-6">
                {Object.entries(timelineData).map(
                    ([month, items], monthIndex) => (
                        <motion.div
                            key={month}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: monthIndex * 0.1 }}
                        >
                            <motion.button
                                onClick={() =>
                                    setExpandedMonth(
                                        expandedMonth === month ? null : month,
                                    )
                                }
                                whileHover={{ x: 5 }}
                                className="mb-4 flex w-full items-center gap-3 text-left"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-white">
                                        {month}
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        {items.length} hari
                                    </p>
                                </div>
                                <motion.div
                                    animate={{
                                        rotate:
                                            expandedMonth === month ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronRight className="h-5 w-5 text-neutral-400" />
                                </motion.div>
                            </motion.button>
                            <AnimatePresence>
                                {expandedMonth === month && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative space-y-4 pl-8"
                                    >
                                        <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-600" />
                                        {items.map((item, itemIndex) => (
                                            <motion.div
                                                key={itemIndex}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: itemIndex * 0.05,
                                                }}
                                                className="relative"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.5 }}
                                                    className="absolute top-3 -left-8 h-4 w-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white dark:ring-neutral-900"
                                                />
                                                <div className="rounded-xl border border-white/20 bg-white/60 p-4 backdrop-blur-sm dark:bg-neutral-800/60">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <p className="font-semibold text-neutral-900 dark:text-white">
                                                            {item.date.toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    weekday:
                                                                        'long',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                },
                                                            )}
                                                        </p>
                                                        <span className="text-xs text-neutral-500">
                                                            {
                                                                item.records
                                                                    .length
                                                            }{' '}
                                                            kehadiran
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.records.map(
                                                            (record, ri) => {
                                                                const StatusIcon =
                                                                    statusConfig[
                                                                        record
                                                                            .status
                                                                    ].icon;
                                                                return (
                                                                    <motion.div
                                                                        key={ri}
                                                                        whileHover={{
                                                                            scale: 1.05,
                                                                            y: -2,
                                                                        }}
                                                                        className={cn(
                                                                            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                                                                            statusConfig[
                                                                                record
                                                                                    .status
                                                                            ]
                                                                                .color,
                                                                        )}
                                                                    >
                                                                        <StatusIcon className="h-3 w-3" />
                                                                        {record
                                                                            .course
                                                                            .length >
                                                                        15
                                                                            ? record.course.substring(
                                                                                  0,
                                                                                  15,
                                                                              ) +
                                                                              '...'
                                                                            : record.course}
                                                                    </motion.div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ),
                )}
            </div>
        </motion.div>
    );
}

// ========== AI INSIGHTS ==========
interface AIInsight {
    type: 'pattern' | 'prediction' | 'recommendation' | 'alert';
    title: string;
    description: string;
    confidence: number;
}

function AIInsightsPanel({ records }: { records: AttendanceRecord[] }) {
    const insights = useMemo<AIInsight[]>(() => {
        const result: AIInsight[] = [];
        const dayStats: Record<number, { late: number; total: number }> = {};
        records.forEach((r) => {
            const day = new Date(r.date).getDay();
            if (!dayStats[day]) dayStats[day] = { late: 0, total: 0 };
            dayStats[day].total++;
            if (r.status === 'late') dayStats[day].late++;
        });
        Object.entries(dayStats).forEach(([day, s]) => {
            const lateRate = (s.late / s.total) * 100;
            if (lateRate > 30 && s.total >= 3) {
                const dayName = [
                    'Minggu',
                    'Senin',
                    'Selasa',
                    'Rabu',
                    'Kamis',
                    'Jumat',
                    'Sabtu',
                ][parseInt(day)];
                result.push({
                    type: 'pattern',
                    title: `Sering Terlambat di Hari ${dayName}`,
                    description: `Anda terlambat ${s.late} dari ${s.total} kali (${lateRate.toFixed(0)}%) di hari ${dayName}.`,
                    confidence: Math.min(lateRate, 95),
                });
            }
        });
        const presentCount = records.filter(
            (r) => r.status === 'present',
        ).length;
        const totalSessions = records.length;
        const attendanceRate =
            totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
        if (attendanceRate < 80 && attendanceRate > 60) {
            result.push({
                type: 'alert',
                title: 'Risiko Tidak Memenuhi Syarat Kehadiran',
                description: `Tingkat kehadiran ${attendanceRate.toFixed(1)}%. Perlu hadir di ${Math.ceil(0.75 * totalSessions - presentCount)} sesi berikutnya.`,
                confidence: 85,
            });
        }
        const courseStats: Record<string, { present: number; total: number }> =
            {};
        records.forEach((r) => {
            if (!courseStats[r.course])
                courseStats[r.course] = { present: 0, total: 0 };
            courseStats[r.course].total++;
            if (r.status === 'present') courseStats[r.course].present++;
        });
        const bestCourse = Object.entries(courseStats)
            .map(([course, s]) => ({
                course,
                rate: (s.present / s.total) * 100,
            }))
            .sort((a, b) => b.rate - a.rate)[0];
        if (bestCourse && bestCourse.rate >= 90) {
            result.push({
                type: 'recommendation',
                title: `Performa Terbaik: ${bestCourse.course}`,
                description: `Kehadiran ${bestCourse.rate.toFixed(0)}% di mata kuliah ini. Pertahankan!`,
                confidence: 90,
            });
        }
        const recentRecords = records.slice(-7);
        if (recentRecords.filter((r) => r.status === 'present').length >= 5) {
            result.push({
                type: 'prediction',
                title: 'Prediksi Streak',
                description:
                    'Performa bagus! Terus hadir 3 hari ke depan untuk streak 10 hari.',
                confidence: 75,
            });
        }
        return result;
    }, [records]);

    const getInsightColor = (type: AIInsight['type']) => {
        switch (type) {
            case 'pattern':
                return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
            case 'prediction':
                return 'from-violet-500/10 to-purple-500/10 border-violet-500/20';
            case 'recommendation':
                return 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20';
            case 'alert':
                return 'from-amber-500/10 to-orange-500/10 border-amber-500/20';
        }
    };
    const getInsightIcon = (type: AIInsight['type']) => {
        switch (type) {
            case 'pattern':
                return TrendingUp;
            case 'prediction':
                return Sparkles;
            case 'recommendation':
                return Award;
            case 'alert':
                return AlertTriangle;
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className="mb-6 flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    animate={{
                        boxShadow: [
                            '0 0 0 0 rgba(139,92,246,0)',
                            '0 0 0 10px rgba(139,92,246,0.1)',
                            '0 0 0 0 rgba(139,92,246,0)',
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2 text-white"
                >
                    <Sparkles className="h-5 w-5" />
                </motion.div>
                <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                        AI Insights
                    </h2>
                    <p className="text-xs text-neutral-500">
                        Powered by Machine Learning
                    </p>
                </div>
            </div>
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="py-8 text-center">
                        <Sparkles className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                        <p className="text-sm text-neutral-500">
                            Belum cukup data untuk analisis AI
                        </p>
                    </div>
                ) : (
                    insights.map((insight, index) => {
                        const Icon = getInsightIcon(insight.type);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className={cn(
                                    'rounded-2xl border bg-gradient-to-r p-4 backdrop-blur-sm',
                                    getInsightColor(insight.type),
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/50 dark:bg-black/30">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="mb-1 font-bold text-neutral-900 dark:text-white">
                                            {insight.title}
                                        </h3>
                                        <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                                            {insight.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${insight.confidence}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1,
                                                        delay:
                                                            index * 0.1 + 0.3,
                                                    }}
                                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-neutral-500">
                                                {insight.confidence}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}

// ========== COMPARISON ==========
interface ComparisonData {
    label: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}

function ComparisonPanel({ records }: { records: AttendanceRecord[] }) {
    const [selectedPeriod, setSelectedPeriod] = useState<
        'week' | 'month' | 'semester'
    >('month');

    const comparisonData = useMemo<ComparisonData[]>(() => {
        const now = new Date();
        let currentStart: Date, previousStart: Date, previousEnd: Date;
        if (selectedPeriod === 'week') {
            currentStart = new Date(now);
            currentStart.setDate(now.getDate() - 7);
            previousStart = new Date(currentStart);
            previousStart.setDate(currentStart.getDate() - 7);
            previousEnd = new Date(currentStart);
        } else if (selectedPeriod === 'month') {
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        } else {
            const month = now.getMonth();
            currentStart =
                month >= 7
                    ? new Date(now.getFullYear(), 7, 1)
                    : new Date(now.getFullYear(), 1, 1);
            previousStart =
                month >= 7
                    ? new Date(now.getFullYear(), 1, 1)
                    : new Date(now.getFullYear() - 1, 7, 1);
            previousEnd =
                month >= 7
                    ? new Date(now.getFullYear(), 6, 31)
                    : new Date(now.getFullYear(), 0, 31);
        }
        const currentRecords = records.filter((r) => {
            const d = new Date(r.date);
            return d >= currentStart && d <= now;
        });
        const previousRecords = records.filter((r) => {
            const d = new Date(r.date);
            return d >= previousStart && d <= previousEnd;
        });
        const cp = currentRecords.filter((r) => r.status === 'present').length;
        const pp = previousRecords.filter((r) => r.status === 'present').length;
        const cr =
            currentRecords.length > 0 ? (cp / currentRecords.length) * 100 : 0;
        const pr =
            previousRecords.length > 0
                ? (pp / previousRecords.length) * 100
                : 0;
        return [
            {
                label: 'Total Kehadiran',
                current: cp,
                previous: pp,
                change: cp - pp,
                changePercent: pp > 0 ? ((cp - pp) / pp) * 100 : 0,
            },
            {
                label: 'Tingkat Kehadiran',
                current: cr,
                previous: pr,
                change: cr - pr,
                changePercent: pr > 0 ? ((cr - pr) / pr) * 100 : 0,
            },
        ];
    }, [records, selectedPeriod]);

    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className="mb-6 flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2"
                >
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                </motion.div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Perbandingan Performa
                </h2>
            </div>
            <div className="mb-6 flex gap-2">
                {(['week', 'month', 'semester'] as const).map((period) => (
                    <motion.button
                        key={period}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPeriod(period)}
                        className={cn(
                            'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                            selectedPeriod === period
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
                        )}
                    >
                        {period === 'week'
                            ? 'Minggu'
                            : period === 'month'
                              ? 'Bulan'
                              : 'Semester'}
                    </motion.button>
                ))}
            </div>
            <div className="space-y-4">
                {comparisonData.map((data, index) => {
                    const isPositive = data.change >= 0;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="rounded-2xl border border-white/20 bg-gradient-to-r from-neutral-50 to-neutral-100 p-4 dark:from-neutral-800 dark:to-neutral-700"
                        >
                            <p className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                {data.label}
                            </p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                                        {data.current.toFixed(
                                            data.label.includes('Tingkat')
                                                ? 1
                                                : 0,
                                        )}
                                        {data.label.includes('Tingkat') && '%'}
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Sebelumnya:{' '}
                                        {data.previous.toFixed(
                                            data.label.includes('Tingkat')
                                                ? 1
                                                : 0,
                                        )}
                                        {data.label.includes('Tingkat') && '%'}
                                    </p>
                                </div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: index * 0.1 + 0.3,
                                        type: 'spring',
                                    }}
                                    className={cn(
                                        'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold',
                                        isPositive
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                                    )}
                                >
                                    {isPositive ? '↑' : '↓'}
                                    {Math.abs(data.changePercent).toFixed(1)}%
                                </motion.div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <div className="flex-1">
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min((data.previous / Math.max(data.current, data.previous, 1)) * 100, 100)}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: index * 0.1 + 0.5,
                                            }}
                                            className="h-full bg-neutral-400 dark:bg-neutral-500"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Previous
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min((data.current / Math.max(data.current, data.previous, 1)) * 100, 100)}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: index * 0.1 + 0.5,
                                            }}
                                            className={cn(
                                                'h-full',
                                                isPositive
                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                                    : 'bg-gradient-to-r from-rose-500 to-pink-600',
                                            )}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Current
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ========== EXPORT PANEL ==========
function ExportPanel({
    records,
    mahasiswa,
    stats,
}: {
    records: AttendanceRecord[];
    mahasiswa: { nama: string; nim: string };
    stats: PageProps['stats'];
}) {
    const [isExporting, setIsExporting] = useState(false);
    const handleExport = () => {
        setIsExporting(true);
        // Use backend DomPDF route for reliable PDF generation
        window.location.href = '/user/history/export-pdf';
        // Reset loading state after a delay (download starts in background)
        setTimeout(() => setIsExporting(false), 3000);
    };

    const printDateOnly = new Date().toLocaleDateString('id-ID');

    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className="mb-4 flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2"
                >
                    <Download className="h-5 w-5 text-rose-500" />
                </motion.div>
                <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                        Export Data
                    </h2>
                    <p className="text-xs text-neutral-500">
                        PDF detail satu halaman (A4)
                    </p>
                </div>
            </div>

            <div className="mb-5 rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-800/70">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-neutral-500">Nama</p>
                        <p className="font-bold text-neutral-900 dark:text-white">
                            {mahasiswa.nama}
                        </p>
                    </div>
                    <div>
                        <p className="text-neutral-500">NIM</p>
                        <p className="font-bold text-neutral-900 dark:text-white">
                            {mahasiswa.nim}
                        </p>
                    </div>
                    <div>
                        <p className="text-neutral-500">Total Data</p>
                        <p className="font-bold text-neutral-900 dark:text-white">
                            {records.length}
                        </p>
                    </div>
                    <div>
                        <p className="text-neutral-500">Dicetak</p>
                        <p className="font-bold text-neutral-900 dark:text-white">
                            {printDateOnly}
                        </p>
                    </div>
                </div>
            </div>

            <motion.button
                whileHover={!isExporting ? { scale: 1.02 } : undefined}
                whileTap={!isExporting ? { scale: 0.98 } : undefined}
                onClick={handleExport}
                disabled={isExporting}
                className={`flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all ${
                    isExporting
                        ? 'cursor-not-allowed bg-neutral-500 opacity-80'
                        : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-xl'
                }`}
            >
                {isExporting ? (
                    <>
                        <RefreshCw className="mr-2 inline h-5 w-5 animate-spin" />
                        Memproses PDF...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 inline h-5 w-5" />
                        Export PDF Satu Halaman
                    </>
                )}
            </motion.button>
        </motion.div>
    );
}

// ========== GAMIFICATION ==========
function GamificationShowcase({
    stats,
    records,
}: {
    stats: any;
    records: AttendanceRecord[];
}) {
    const achievements = useMemo(() => {
        const result: {
            type: string;
            title: string;
            description: string;
            icon: typeof Flame;
            unlocked: boolean;
        }[] = [];
        if (stats.streak >= 7)
            result.push({
                type: 'streak',
                title: 'Week Warrior',
                description: '7 hari streak',
                icon: Flame,
                unlocked: true,
            });
        if (stats.streak >= 30)
            result.push({
                type: 'streak',
                title: 'Month Master',
                description: '30 hari streak',
                icon: TrendingUp,
                unlocked: true,
            });
        const earlyCount = records.filter((r) => {
            if (!r.checkInTime) return false;
            const t = r.checkInTime.split(':');
            return parseInt(t[0]) < 8;
        }).length;
        if (earlyCount >= 10)
            result.push({
                type: 'early',
                title: 'Early Bird',
                description: '10x datang sebelum jam 8',
                icon: Clock,
                unlocked: true,
            });
        const presentRate =
            records.length > 0
                ? (records.filter((r) => r.status === 'present').length /
                      records.length) *
                  100
                : 0;
        if (presentRate >= 90)
            result.push({
                type: 'perfect',
                title: 'Honor Student',
                description: '90%+ kehadiran',
                icon: Award,
                unlocked: true,
            });
        if (records.length >= 50)
            result.push({
                type: 'veteran',
                title: 'Veteran',
                description: '50+ sesi tercatat',
                icon: Trophy,
                unlocked: true,
            });
        if (result.length === 0) {
            result.push({
                type: 'starter',
                title: 'Getting Started',
                description: 'Terus tingkatkan kehadiranmu!',
                icon: Sparkles,
                unlocked: false,
            });
        }
        return result;
    }, [stats, records]);

    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div className="mb-6 flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white"
                >
                    <Trophy className="h-5 w-5" />
                </motion.div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Achievements
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, type: 'spring' }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 text-center"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mb-2 flex items-center justify-center"
                        >
                            <achievement.icon className="h-10 w-10 text-amber-500" />
                        </motion.div>
                        <p className="mb-1 text-sm font-bold text-neutral-900 dark:text-white">
                            {achievement.title}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {achievement.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ========== ENHANCED SEARCH ==========
function EnhancedSearch({
    records,
    onSearch,
}: {
    records: AttendanceRecord[];
    onSearch: (results: AttendanceRecord[]) => void;
}) {
    const [query, setQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const searchResults = useMemo(() => {
        if (!query) return records;
        const lq = query.toLowerCase();
        return records.filter(
            (r) =>
                r.course.toLowerCase().includes(lq) ||
                new Date(r.date).toLocaleDateString('id-ID').includes(lq) ||
                statusConfig[r.status].label.toLowerCase().includes(lq),
        );
    }, [query, records]);

    useEffect(() => {
        onSearch(searchResults);
    }, [searchResults]);

    const handleSearch = (value: string) => {
        setQuery(value);
        if (value && !searchHistory.includes(value))
            setSearchHistory((prev) => [value, ...prev].slice(0, 5));
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                    placeholder="Cari mata kuliah, tanggal, status..."
                    className="w-full rounded-xl border border-white/20 bg-white/40 py-3 pr-4 pl-12 text-neutral-900 backdrop-blur-xl transition-all placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-900/40 dark:text-white"
                />
                {query && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuery('')}
                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-neutral-200 p-1 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                    >
                        <X className="h-4 w-4" />
                    </motion.button>
                )}
            </div>
            <AnimatePresence>
                {showHistory && searchHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 left-0 z-10 mt-2 rounded-xl border border-white/20 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:bg-neutral-900/95"
                    >
                        <p className="px-3 py-2 text-xs font-semibold text-neutral-500">
                            Recent Searches
                        </p>
                        {searchHistory.map((item, index) => (
                            <motion.button
                                key={index}
                                whileHover={{
                                    x: 5,
                                    backgroundColor: 'rgba(139,92,246,0.1)',
                                }}
                                onClick={() => setQuery(item)}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300"
                            >
                                <Clock className="mr-2 inline h-3 w-3 text-neutral-400" />
                                {item}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {query && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-neutral-500"
                >
                    Ditemukan {searchResults.length} hasil untuk "{query}"
                </motion.p>
            )}
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95"
        >
            <p className="mb-2 font-medium text-neutral-900 dark:text-white">
                {label}
            </p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-neutral-600 dark:text-neutral-400">
                        {entry.name}:
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                        {entry.value}
                    </span>
                </div>
            ))}
        </motion.div>
    );
};

export default function AttendanceHistory() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: '', nim: '' },
        records = [],
        courses = [],
        stats = {
            present: 0,
            absent: 0,
            late: 0,
            pending: 0,
            total: 0,
            streak: 0,
            longestStreak: 0,
        },
    } = props as unknown as PageProps;

    const [view, setView] = useState<'calendar' | 'list' | 'timeline'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilteredRecords, setSearchFilteredRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedRecord, setSelectedRecord] =
        useState<AttendanceRecord | null>(null);

    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            if (
                searchQuery &&
                !record.course.toLowerCase().includes(searchQuery.toLowerCase())
            )
                return false;
            if (statusFilter !== 'all' && record.status !== statusFilter)
                return false;
            if (
                courseFilter !== 'all' &&
                record.courseId.toString() !== courseFilter
            )
                return false;
            if (selectedDate) {
                const recordDate = new Date(record.date);
                if (
                    recordDate.getDate() !== selectedDate.getDate() ||
                    recordDate.getMonth() !== selectedDate.getMonth() ||
                    recordDate.getFullYear() !== selectedDate.getFullYear()
                )
                    return false;
            }
            return true;
        });
    }, [records, searchQuery, statusFilter, courseFilter, selectedDate]);

    const markedDates = useMemo(
        () =>
            records
                .filter((r) => r.status !== 'rejected')
                .map((r) => ({
                    date: new Date(r.date),
                    status: r.status as
                        | 'present'
                        | 'absent'
                        | 'late'
                        | 'pending',
                })),
        [records],
    );

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCourseFilter('all');
        setSelectedDate(undefined);
    };

    const hasActiveFilters =
        searchQuery ||
        statusFilter !== 'all' ||
        courseFilter !== 'all' ||
        selectedDate;

    const courseChartData = useMemo(() => {
        const courseStats: Record<
            string,
            { present: number; late: number; absent: number }
        > = {};
        records.forEach((record) => {
            if (!courseStats[record.course])
                courseStats[record.course] = { present: 0, late: 0, absent: 0 };
            if (record.status === 'present')
                courseStats[record.course].present++;
            else if (record.status === 'late')
                courseStats[record.course].late++;
            else courseStats[record.course].absent++;
        });
        return Object.entries(courseStats).map(([course, data]) => ({
            name: course.length > 15 ? course.substring(0, 15) + '...' : course,
            Hadir: data.present,
            Terlambat: data.late,
            'Tidak Hadir': data.absent,
        }));
    }, [records]);

    const monthlyTrendData = useMemo(() => {
        const monthStats: Record<
            string,
            { present: number; late: number; absent: number }
        > = {};
        records.forEach((record) => {
            const date = new Date(record.date);
            const monthKey = date.toLocaleDateString('id-ID', {
                month: 'short',
                year: '2-digit',
            });
            if (!monthStats[monthKey])
                monthStats[monthKey] = { present: 0, late: 0, absent: 0 };
            if (record.status === 'present') monthStats[monthKey].present++;
            else if (record.status === 'late') monthStats[monthKey].late++;
            else monthStats[monthKey].absent++;
        });
        return Object.entries(monthStats)
            .slice(-6)
            .map(([month, data]) => ({
                name: month,
                Hadir: data.present,
                Terlambat: data.late,
                'Tidak Hadir': data.absent,
            }));
    }, [records]);

    return (
        <StudentLayout>
            <Head title="Riwayat Kehadiran" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* Header Card - ULTRA ADVANCED matching Dashboard */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

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
                                        src={historyIcon}
                                        alt="Riwayat Mahasiswa"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.2,
                                            type: 'spring',
                                        }}
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                    >
                                        Riwayat Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        initial={{
                                            opacity: 0,
                                            x: -20,
                                            scale: 0.9,
                                        }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{
                                            delay: 0.3,
                                            type: 'spring',
                                            stiffness: 150,
                                        }}
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                    >
                                        {mahasiswa.nama}
                                    </motion.h1>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.4,
                                            type: 'spring',
                                        }}
                                        className="mt-2 flex items-center justify-center gap-2 sm:justify-start"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-purple-300" />
                                        <p className="font-mono text-sm text-indigo-100">
                                            NIM: {mahasiswa.nim}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="w-full sm:w-auto"
                            >
                                <div className="flex justify-center sm:justify-end">
                                    <PDFGenerator
                                        student={mahasiswa}
                                        records={filteredRecords}
                                        stats={stats}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats & Streak */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.005 }}
                        className="lg:col-span-2"
                    >
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <AttendanceStats
                                present={stats.present}
                                absent={stats.absent}
                                late={stats.late}
                                pending={stats.pending}
                                total={stats.total}
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.04, y: -4 }}
                        className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-xl"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.2, y: -2 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 15,
                                }}
                            >
                                <Flame className="h-6 w-6" />
                            </motion.div>
                            <span className="font-semibold">
                                Streak Kehadiran
                            </span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold">
                                <AnimatedCounter
                                    value={stats.streak}
                                    duration={1500}
                                />
                            </span>
                            <span className="mb-1 text-orange-100">hari</span>
                        </div>
                        <p className="mt-2 text-sm text-orange-100">
                            Streak terbaik: {stats.longestStreak} hari
                        </p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 flex gap-2"
                        >
                            <AchievementBadge
                                type="streak"
                                value={stats.streak}
                                size="sm"
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {courseChartData.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                </motion.div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Kehadiran per Mata Kuliah
                                </h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={courseChartData}
                                    layout="vertical"
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-neutral-200 dark:stroke-neutral-800"
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        width={100}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="Hadir"
                                        fill={CHART_COLORS.present}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="Terlambat"
                                        fill={CHART_COLORS.late}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="Tidak Hadir"
                                        fill={CHART_COLORS.absent}
                                        stackId="a"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                    {monthlyTrendData.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-4 flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </motion.div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Tren Kehadiran Bulanan
                                </h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthlyTrendData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-neutral-200 dark:stroke-neutral-800"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="Hadir"
                                        stroke={CHART_COLORS.present}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Terlambat"
                                        stroke={CHART_COLORS.late}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Tidak Hadir"
                                        stroke={CHART_COLORS.absent}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>

                {/* Filters */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.005 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Cari mata kuliah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-xl border border-white/20 bg-white/60 px-3 text-sm dark:border-white/10 dark:bg-neutral-800/60"
                        >
                            <option value="all">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="h-10 rounded-xl border border-white/20 bg-white/60 px-3 text-sm dark:border-white/10 dark:bg-neutral-800/60"
                        >
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <X className="mr-1 h-4 w-4" /> Reset
                            </Button>
                        )}
                        <div className="flex rounded-xl border border-white/20 p-1 dark:border-white/10">
                            <button
                                onClick={() => setView('list')}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                                    view === 'list'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5',
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setView('calendar')}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                                    view === 'calendar'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5',
                                )}
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setView('timeline')}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                                    view === 'timeline'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5',
                                )}
                            >
                                <Clock className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/20 pt-3 dark:border-white/5">
                            <span className="text-xs text-neutral-500">
                                Filter aktif:
                            </span>
                            {searchQuery && (
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    "{searchQuery}"
                                </span>
                            )}
                            {statusFilter !== 'all' && (
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    {
                                        statusConfig[
                                            statusFilter as keyof typeof statusConfig
                                        ]?.label
                                    }
                                </span>
                            )}
                            {selectedDate && (
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    {selectedDate.toLocaleDateString('id-ID')}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {view === 'calendar' && (
                        <div>
                            <Calendar
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                markedDates={markedDates}
                            />
                            {selectedDate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 w-full"
                                    onClick={() => setSelectedDate(undefined)}
                                >
                                    Tampilkan semua tanggal
                                </Button>
                            )}
                        </div>
                    )}
                    <div className={cn(view === 'list' && 'lg:col-span-2')}>
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/20 p-4 dark:border-white/5">
                                <div className="flex items-start justify-between gap-3 sm:items-center">
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                        Daftar Kehadiran
                                    </h2>
                                    <span className="text-xs whitespace-nowrap text-neutral-500 sm:text-sm">
                                        {filteredRecords.length} dari{' '}
                                        {records.length}
                                    </span>
                                </div>
                            </div>
                            <div className="max-h-[600px] divide-y divide-white/10 overflow-y-auto dark:divide-white/5">
                                {filteredRecords.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <CalendarIcon className="mx-auto h-12 w-12 text-neutral-300" />
                                        <p className="mt-3 text-neutral-500">
                                            Tidak ada data kehadiran
                                        </p>
                                    </div>
                                ) : (
                                    filteredRecords.map((record, index) => {
                                        const StatusIcon =
                                            statusConfig[record.status].icon;
                                        return (
                                            <motion.button
                                                key={record.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 20,
                                                }}
                                                whileHover={{
                                                    x: 5,
                                                    backgroundColor:
                                                        'rgba(139, 92, 246, 0.05)',
                                                    transition: {
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 15,
                                                    },
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() =>
                                                    router.visit(
                                                        `/user/history/${record.id}`,
                                                    )
                                                }
                                                className="w-full cursor-pointer p-3 text-left sm:p-4"
                                            >
                                                <div className="flex items-start gap-3 sm:items-center">
                                                    <div
                                                        className={cn(
                                                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:mt-0 sm:h-10 sm:w-10',
                                                            statusConfig[
                                                                record.status
                                                            ].color,
                                                        )}
                                                    >
                                                        <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="line-clamp-2 leading-snug font-medium text-neutral-900 sm:truncate dark:text-white">
                                                                {record.course}
                                                            </p>
                                                            <motion.div
                                                                whileHover={{
                                                                    x: 5,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 400,
                                                                }}
                                                                className="shrink-0 sm:hidden"
                                                            >
                                                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                                                            </motion.div>
                                                        </div>

                                                        <p className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                                                            Pertemuan{' '}
                                                            {
                                                                record.meetingNumber
                                                            }{' '}
                                                            •{' '}
                                                            {new Date(
                                                                record.date,
                                                            ).toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    weekday:
                                                                        'short',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                },
                                                            )}
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                                                            <span
                                                                className={cn(
                                                                    'rounded-full px-2.5 py-1 text-[11px] font-medium',
                                                                    statusConfig[
                                                                        record
                                                                            .status
                                                                    ].color,
                                                                )}
                                                            >
                                                                {
                                                                    statusConfig[
                                                                        record
                                                                            .status
                                                                    ].label
                                                                }
                                                            </span>
                                                            {record.checkInTime && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-neutral-500 dark:bg-neutral-800/70 dark:text-neutral-400">
                                                                    <Clock className="h-3 w-3" />
                                                                    {
                                                                        record.checkInTime
                                                                    }
                                                                </span>
                                                            )}
                                                            {record.selfieUrl && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-neutral-500 dark:bg-neutral-800/70 dark:text-neutral-400">
                                                                    <Camera className="h-3 w-3" />
                                                                    Bukti
                                                                </span>
                                                            )}
                                                        </div>

                                                        {record.checkInTime && (
                                                            <p className="mt-1 hidden items-center gap-1 text-xs text-neutral-400 sm:flex">
                                                                <Clock className="h-3 w-3" />
                                                                {
                                                                    record.checkInTime
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-3 py-1 text-xs font-medium',
                                                                statusConfig[
                                                                    record
                                                                        .status
                                                                ].color,
                                                            )}
                                                        >
                                                            {
                                                                statusConfig[
                                                                    record
                                                                        .status
                                                                ].label
                                                            }
                                                        </span>
                                                        {record.selfieUrl && (
                                                            <span className="flex items-center gap-1 text-xs text-neutral-400">
                                                                <Camera className="h-3 w-3" />{' '}
                                                                Bukti
                                                            </span>
                                                        )}
                                                    </div>

                                                    <motion.div
                                                        whileHover={{ x: 5 }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 400,
                                                        }}
                                                        className="hidden sm:block"
                                                    >
                                                        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                                                    </motion.div>
                                                </div>
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Timeline View */}
                {view === 'timeline' && (
                    <AttendanceTimeline records={filteredRecords} />
                )}

                {/* Enhanced Search */}
                <EnhancedSearch
                    records={records}
                    onSearch={setSearchFilteredRecords}
                />

                {/* AI Insights & Comparison */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AIInsightsPanel records={records} />
                    <ComparisonPanel records={records} />
                </div>

                {/* Gamification & Export */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <GamificationShowcase stats={stats} records={records} />
                    <ExportPanel
                        records={records}
                        mahasiswa={mahasiswa}
                        stats={stats}
                    />
                </div>
            </motion.div>

            {selectedRecord && (
                <RecordDetailModal
                    record={selectedRecord!}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </StudentLayout>
    );
}

function RecordDetailModal({
    record,
    onClose,
}: {
    record: AttendanceRecord;
    onClose: () => void;
}) {
    const StatusIcon = statusConfig[record.status].icon;
    const selfieStatus =
        record.selfieStatus ?? (record.selfieUrl ? 'pending' : null);
    const selfieConfig = selfieStatus ? selfieStatusConfig[selfieStatus] : null;
    const SelfieIcon = selfieConfig?.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 15 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        mass: 0.8,
                    }}
                    style={{ perspective: '1500px' }}
                    className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95"
                >
                    {/* Animated background orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.15, 0.1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-500/30 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.08, 0.12, 0.08],
                            rotate: [0, -90, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gradient-to-br from-teal-400/20 to-blue-500/20 blur-3xl"
                    />

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 rounded-full bg-neutral-100/80 p-2 shadow-lg backdrop-blur-xl hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
                    >
                        <X className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                    </motion.button>

                    <div className="relative z-10 space-y-6">
                        {/* Header with enhanced badges */}
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg',
                                        statusConfig[record.status].color,
                                    )}
                                >
                                    <StatusIcon className="h-4 w-4" />
                                    {statusConfig[record.status].label}
                                </motion.span>
                                {selfieConfig && SelfieIcon && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg',
                                            selfieConfig.color,
                                        )}
                                    >
                                        <SelfieIcon className="h-4 w-4" />
                                        {selfieConfig.label}
                                    </motion.span>
                                )}
                            </div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-1 text-2xl font-bold text-neutral-900 dark:text-white"
                            >
                                {record.course}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-neutral-500 dark:text-neutral-400"
                            >
                                Pertemuan {record.meetingNumber}
                            </motion.p>
                        </div>

                        {/* Enhanced Selfie / Bukti Masuk */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 shadow-xl dark:from-neutral-800 dark:to-neutral-700"
                        >
                            {record.selfieUrl ? (
                                <div className="group relative">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        src={record.selfieUrl}
                                        alt="Bukti selfie"
                                        className="h-64 w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                        {selfieConfig && SelfieIcon && (
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-2xl backdrop-blur-xl',
                                                    selfieConfig.color,
                                                )}
                                            >
                                                <SelfieIcon className="h-4 w-4" />
                                                {selfieConfig.label}
                                            </motion.span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-48 flex-col items-center justify-center text-neutral-400">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <Image className="mb-3 h-12 w-12" />
                                    </motion.div>
                                    <span className="text-sm font-medium">
                                        Tidak ada bukti selfie
                                    </span>
                                </div>
                            )}
                        </motion.div>

                        {/* Enhanced Details */}
                        <div className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ x: 4, scale: 1.02 }}
                                className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm dark:border-blue-800/30 dark:from-blue-900/20 dark:to-cyan-900/20"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                                    <CalendarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                                        Tanggal
                                    </p>
                                    <p className="font-bold text-neutral-900 dark:text-white">
                                        {new Date(
                                            record.date,
                                        ).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                            {record.checkInTime && (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ x: 4, scale: 1.02 }}
                                    className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm dark:border-emerald-800/30 dark:from-emerald-900/20 dark:to-teal-900/20"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                                            Waktu Check-in
                                        </p>
                                        <p className="font-bold text-neutral-900 dark:text-white">
                                            {record.checkInTime}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                            {record.distance !== null && (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ x: 4, scale: 1.02 }}
                                    className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 p-4 shadow-sm dark:border-violet-800/30 dark:from-violet-900/20 dark:to-purple-900/20"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-violet-600 uppercase dark:text-violet-400">
                                            Jarak dari Lokasi
                                        </p>
                                        <p className="font-bold text-neutral-900 dark:text-white">
                                            {Math.round(record.distance)} meter
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                            {record.note && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-lg dark:border-amber-800/50 dark:from-amber-900/20 dark:to-orange-900/20"
                                >
                                    <p className="mb-2 text-xs font-bold tracking-wide text-amber-600 uppercase dark:text-amber-400">
                                        Catatan
                                    </p>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        {record.note}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex gap-3 border-t-2 border-white/20 pt-6 dark:border-white/5">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1"
                            >
                                <Button
                                    variant="outline"
                                    className="h-12 w-full rounded-xl border-2 text-base font-semibold shadow-lg transition-shadow hover:shadow-xl"
                                    onClick={onClose}
                                >
                                    Tutup
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
