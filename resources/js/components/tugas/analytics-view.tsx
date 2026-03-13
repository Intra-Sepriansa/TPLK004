import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Award,
    BookOpen,
    CheckCircle,
    Clock,
    Lightbulb,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    course: { id: number; nama: string; dosen: string | null };
    created_by: string;
    is_overdue: boolean;
    days_until_deadline: number;
    is_read: boolean;
    diskusi_count: number;
}

const COLORS = [
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#6366f1',
    '#ec4899',
    '#14b8a6',
    '#f97316',
];

export default function AnalyticsView({
    tugasList,
    stats,
}: {
    tugasList: Tugas[];
    stats: { total: number; upcoming: number; overdue: number; unread: number };
}) {
    const analytics = useMemo(() => {
        const byPriority = [
            {
                name: 'Tinggi',
                value: tugasList.filter((t) => t.prioritas === 'tinggi').length,
                color: '#ef4444',
            },
            {
                name: 'Sedang',
                value: tugasList.filter((t) => t.prioritas === 'sedang').length,
                color: '#f59e0b',
            },
            {
                name: 'Rendah',
                value: tugasList.filter((t) => t.prioritas === 'rendah').length,
                color: '#10b981',
            },
        ].filter((d) => d.value > 0);

        const courses: Record<string, { total: number; overdue: number }> = {};
        tugasList.forEach((t) => {
            if (!courses[t.course.nama])
                courses[t.course.nama] = { total: 0, overdue: 0 };
            courses[t.course.nama].total++;
            if (t.is_overdue) courses[t.course.nama].overdue++;
        });
        const byCourse = Object.entries(courses).map(
            ([name, { total, overdue }]) => ({
                name: name.length > 15 ? name.slice(0, 15) + '…' : name,
                total,
                overdue,
            }),
        );

        const completionRate =
            stats.total > 0
                ? Math.round(
                      ((stats.total - stats.overdue) / stats.total) * 100,
                  )
                : 0;
        const readRate =
            stats.total > 0
                ? Math.round(((stats.total - stats.unread) / stats.total) * 100)
                : 0;

        const urgentCount = tugasList.filter(
            (t) =>
                !t.is_overdue &&
                t.days_until_deadline <= 3 &&
                t.days_until_deadline >= 0,
        ).length;

        const avgDaysToDeadline =
            tugasList.length > 0
                ? Math.round(
                      tugasList
                          .filter((t) => !t.is_overdue)
                          .reduce((s, t) => s + t.days_until_deadline, 0) /
                          Math.max(
                              tugasList.filter((t) => !t.is_overdue).length,
                              1,
                          ),
                  )
                : 0;

        return {
            byPriority,
            byCourse,
            completionRate,
            readRate,
            urgentCount,
            avgDaysToDeadline,
        };
    }, [tugasList, stats]);

    const summaryCards = [
        {
            label: 'Completion Rate',
            value: `${analytics.completionRate}%`,
            icon: CheckCircle,
            color: 'from-emerald-500 to-teal-600',
        },
        {
            label: 'Read Rate',
            value: `${analytics.readRate}%`,
            icon: BookOpen,
            color: 'from-blue-500 to-indigo-600',
        },
        {
            label: 'Urgent Tasks',
            value: analytics.urgentCount,
            icon: AlertTriangle,
            color: 'from-amber-500 to-orange-600',
        },
        {
            label: 'Avg Days Left',
            value: `${analytics.avgDaysToDeadline}d`,
            icon: Clock,
            color: 'from-purple-500 to-violet-600',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {summaryCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div
                            className={`inline-flex rounded-xl bg-gradient-to-br p-3 ${s.color} mb-3 text-white`}
                        >
                            <s.icon className="h-6 w-6" />
                        </div>
                        <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {s.label}
                        </p>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {s.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Priority Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-2 text-white">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            Distribusi Prioritas
                        </h3>
                    </div>
                    {analytics.byPriority.length > 0 ? (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie
                                        data={analytics.byPriority}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        strokeWidth={3}
                                        stroke="rgba(255,255,255,0.3)"
                                    >
                                        {analytics.byPriority.map((d, i) => (
                                            <Cell key={i} fill={d.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255,255,255,0.95)',
                                            borderRadius: 12,
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {analytics.byPriority.map((d) => (
                                    <div
                                        key={d.name}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: d.color }}
                                        />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                            {d.name}
                                        </span>
                                        <span className="ml-auto font-bold text-neutral-900 dark:text-white">
                                            {d.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="py-8 text-center text-neutral-400">
                            Tidak ada data
                        </p>
                    )}
                </motion.div>

                {/* Course Breakdown */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 text-white">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            Per Mata Kuliah
                        </h3>
                    </div>
                    {analytics.byCourse.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={analytics.byCourse} barGap={4}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e7eb"
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis stroke="#6b7280" allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor:
                                            'rgba(255,255,255,0.95)',
                                        borderRadius: 12,
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#6366f1"
                                    radius={[6, 6, 0, 0]}
                                    name="Total"
                                />
                                <Bar
                                    dataKey="overdue"
                                    fill="#ef4444"
                                    radius={[6, 6, 0, 0]}
                                    name="Terlewat"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="py-8 text-center text-neutral-400">
                            Tidak ada data
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            Insights & Tips
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Rekomendasi berdasarkan data
                        </p>
                    </div>
                </div>
                <div className="space-y-3">
                    {[
                        analytics.completionRate >= 80
                            ? {
                                  type: 'success',
                                  icon: CheckCircle,
                                  color: 'from-emerald-500 to-teal-600',
                                  msg: `Bagus! ${analytics.completionRate}% tugas on-track.`,
                              }
                            : {
                                  type: 'warning',
                                  icon: AlertTriangle,
                                  color: 'from-amber-500 to-orange-600',
                                  msg: `Perhatian: ${stats.overdue} tugas sudah terlewat deadline.`,
                              },
                        analytics.urgentCount > 0
                            ? {
                                  type: 'urgent',
                                  icon: Clock,
                                  color: 'from-red-500 to-rose-600',
                                  msg: `${analytics.urgentCount} tugas deadline dalam 3 hari ke depan!`,
                              }
                            : {
                                  type: 'info',
                                  icon: Award,
                                  color: 'from-blue-500 to-indigo-600',
                                  msg: 'Tidak ada tugas urgent — waktu yang baik untuk belajar lebih lanjut.',
                              },
                        {
                            type: 'tip',
                            icon: Lightbulb,
                            color: 'from-cyan-500 to-blue-600',
                            msg: `Rata-rata sisa waktu: ${analytics.avgDaysToDeadline} hari. Kerjakan tugas prioritas tinggi terlebih dahulu.`,
                        },
                    ].map((insight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 rounded-2xl bg-white/60 p-4 backdrop-blur-xl dark:bg-neutral-800/60"
                        >
                            <div
                                className={`rounded-lg bg-gradient-to-br p-2 ${insight.color} flex-shrink-0 text-white`}
                            >
                                <insight.icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {insight.msg}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
