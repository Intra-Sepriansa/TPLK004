import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Zap,
    BrainCircuit,
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    X,
    Minimize2,
    CheckCheck,
    BookOpen,
    ShieldCheck,
    BarChart3,
    Lightbulb,
    Heart,
    GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis
} from 'recharts';
import { Button } from '@/components/ui/button';

interface InsightDetail {
    icon: React.ElementType;
    title: string;
    text: string;
    color: string;
    bg: string;
    border: string;
    detailTitle: string;
    detailSections: {
        heading: string;
        icon: React.ElementType;
        items: string[];
        color: string;
    }[];
    closingMessage: string;
    closingType: 'motivational' | 'appreciative' | 'strategic';
}

interface EvaluationDashboardProps {
    attendanceRate: number;
    totalSessions: number;
    missedSessions: number;
}

export function EvaluationDashboard({
    attendanceRate = 0,
    totalSessions = 0,
    missedSessions = 0
}: EvaluationDashboardProps) {

    const [selectedInsight, setSelectedInsight] = useState<InsightDetail | null>(null);

    // Calculate "Health Score" (0-100)
    const healthScore = Math.max(0, Math.min(100, attendanceRate));

    const getHealthColor = (score: number) => {
        if (score >= 90) return '#10b981'; // Emerald
        if (score >= 75) return '#3b82f6'; // Blue
        if (score >= 60) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const getHealthLabel = (score: number) => {
        if (score >= 90) return 'Exemplary';
        if (score >= 75) return 'Good Standing';
        if (score >= 60) return 'At Risk';
        return 'Critical';
    };

    const data = [{ name: 'Health', value: healthScore, fill: getHealthColor(healthScore) }];

    const insights: InsightDetail[] = [
        {
            icon: Zap,
            text: healthScore > 80 ? "Konsistensi kehadiranmu sangat baik!" : "Tingkatkan konsistensi kehadiranmu.",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
            title: "Tingkatkan Konsistensi Kehadiranmu",
            detailTitle: "Analisis #1 – Tingkatkan Konsistensi Kehadiranmu",
            detailSections: [
                {
                    heading: "Makna dari analisis ini",
                    icon: Lightbulb,
                    color: "text-amber-400",
                    items: [
                        "Kehadiran mungkin belum stabil (kadang hadir, kadang absen).",
                        "Ada kemungkinan persentase kehadiran berada di batas minimum.",
                        "Diperlukan komitmen lebih untuk hadir secara rutin."
                    ]
                },
                {
                    heading: "Tujuan rekomendasi ini",
                    icon: Target,
                    color: "text-amber-400",
                    items: [
                        "Membantu meningkatkan disiplin.",
                        "Mencegah risiko tidak memenuhi syarat mengikuti ujian.",
                        "Menjaga performa akademik tetap optimal."
                    ]
                }
            ],
            closingMessage: "Pesan ini bersifat motivasional dan preventif, agar kamu lebih sadar terhadap pentingnya kehadiran yang stabil. Tingkatkan kehadiranmu mulai dari sekarang! 💪",
            closingType: 'motivational'
        },
        {
            icon: BrainCircuit,
            text: missedSessions === 0 ? "Tidak pernah absen. Pertahankan!" : `Kamu telah melewatkan ${missedSessions} sesi.`,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
            title: "Tidak Pernah Absen. Pertahankan!",
            detailTitle: "Analisis #2 – Tidak Pernah Absen. Pertahankan!",
            detailSections: [
                {
                    heading: "Makna dari analisis ini",
                    icon: Heart,
                    color: "text-violet-400",
                    items: [
                        "Tidak terdapat riwayat ketidakhadiran.",
                        "Tingkat disiplin sangat tinggi.",
                        "Konsistensi sudah berada pada level optimal."
                    ]
                },
                {
                    heading: "Tujuan rekomendasi ini",
                    icon: ShieldCheck,
                    color: "text-violet-400",
                    items: [
                        "Memberikan apresiasi atas kedisiplinan.",
                        "Mendorong kamu untuk mempertahankan performa tersebut.",
                        "Menjaga motivasi agar tetap stabil hingga akhir semester."
                    ]
                }
            ],
            closingMessage: "Pesan ini bersifat apresiatif dan mendukung keberlanjutan kebiasaan positif. Kamu luar biasa! Keep it up! 🌟",
            closingType: 'appreciative'
        },
        {
            icon: Target,
            text: "Target kehadiran 85% untuk ujian akhir.",
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
            border: "border-cyan-400/20",
            title: "Target Kehadiran 85% untuk Ujian Akhir",
            detailTitle: "Analisis #3 – Target Kehadiran 85% untuk Ujian Akhir",
            detailSections: [
                {
                    heading: "Makna dari analisis ini",
                    icon: BarChart3,
                    color: "text-cyan-400",
                    items: [
                        "Sistem menetapkan batas minimal 85% kehadiran.",
                        "Jika kehadiran di bawah angka tersebut, ada risiko tidak dapat mengikuti ujian.",
                        "Kamu perlu menghitung dan mengontrol sisa toleransi absen."
                    ]
                },
                {
                    heading: "Tujuan rekomendasi ini",
                    icon: GraduationCap,
                    color: "text-cyan-400",
                    items: [
                        "Memberikan target yang jelas dan terukur.",
                        "Membantu perencanaan kehadiran hingga akhir periode.",
                        "Menghindari pelanggaran aturan akademik."
                    ]
                }
            ],
            closingMessage: "Analisis ini bersifat strategis karena memberikan angka konkret sebagai standar pencapaian. Rencanakan kehadiranmu dengan bijak! 🎯",
            closingType: 'strategic'
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Holographic Health Core */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center min-h-[320px] shadow-2xl"
                >
                    {/* Ambient Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-cyan-500/50 blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* 3D Ring Container */}
                    <div className="relative w-64 h-64">
                        {/* Rotating Rings Background */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-white/10"
                                style={{ margin: `${i * 10}px` }}
                            />
                        ))}

                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                innerRadius="75%"
                                outerRadius="100%"
                                barSize={15}
                                data={data}
                                startAngle={180}
                                endAngle={0}
                            >
                                <RadialBar
                                    cornerRadius={20}
                                    background={{ fill: 'rgba(255,255,255,0.05)' }}
                                    dataKey="value"
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>

                        {/* Center Stat */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="relative"
                            >
                                <span className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                    {healthScore.toFixed(0)}
                                </span>
                                <Zap className="absolute -top-4 -right-6 h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                            </motion.div>
                            <span className="text-xs text-cyan-200/50 uppercase tracking-[0.2em] mt-2 font-medium">Health Score</span>
                        </div>
                    </div>

                    <div className="mt-[-20px] text-center z-10 px-6">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            {getHealthLabel(healthScore)}
                        </h3>
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full animate-ping",
                                healthScore >= 75 ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            <p className="text-sm text-neutral-400">
                                Status kehadiranmu {healthScore >= 75 ? "stabil" : "perlu perhatian"}.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Insights Stack */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1 pl-1">
                        <BrainCircuit className="h-5 w-5 text-purple-400" />
                        <h3 className="font-bold text-lg text-white">AI Analysis</h3>
                    </div>

                    <div className="space-y-3 flex-1">
                        {insights.map((insight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.15, type: "spring" }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedInsight(insight)}
                                className={cn(
                                    "group p-4 rounded-2xl bg-neutral-900/50 border backdrop-blur-md flex items-start gap-4 transition-all duration-300 cursor-pointer",
                                    insight.border,
                                    "hover:bg-neutral-800/80 hover:shadow-lg hover:shadow-cyan-500/10"
                                )}
                            >
                                <div className={cn("p-2.5 rounded-xl", insight.bg, "group-hover:scale-110 transition-transform")}>
                                    <insight.icon className={cn("h-5 w-5", insight.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white text-sm mb-0.5 opacity-90">Analysis #{idx + 1}</h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed group-hover:text-neutral-300">{insight.text}</p>
                                </div>
                                <div className={cn("p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity", insight.bg)}>
                                    <ChevronRight className={cn("h-4 w-4", insight.color)} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-blue-300" />
                                    <h4 className="font-bold text-sm text-white">Rekomendasi</h4>
                                </div>
                                <p className="text-xs text-blue-100/80">
                                    {attendanceRate < 80
                                        ? "Segera konsultasi akademik."
                                        : "Pertahankan untuk nilai tambah."}
                                </p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-blue-400 opacity-50" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Detail Modal for Analysis */}
            <AnimatePresence>
                {selectedInsight && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedInsight(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="relative p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
                                {/* Background Glow */}
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1.2, opacity: [0.15, 0.25, 0.15] }}
                                    transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                                    className={cn(
                                        "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl",
                                        selectedInsight.closingType === 'motivational' && "bg-amber-500/30",
                                        selectedInsight.closingType === 'appreciative' && "bg-violet-500/30",
                                        selectedInsight.closingType === 'strategic' && "bg-cyan-500/30",
                                    )}
                                />
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1.1, opacity: [0.1, 0.2, 0.1] }}
                                    transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                                    className={cn(
                                        "absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl",
                                        selectedInsight.closingType === 'motivational' && "bg-orange-500/20",
                                        selectedInsight.closingType === 'appreciative' && "bg-purple-500/20",
                                        selectedInsight.closingType === 'strategic' && "bg-teal-500/20",
                                    )}
                                />

                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                    className={cn(
                                        "w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-xl ring-4 ring-white/10 relative z-10",
                                        selectedInsight.closingType === 'motivational' && "bg-gradient-to-br from-amber-500 to-orange-600",
                                        selectedInsight.closingType === 'appreciative' && "bg-gradient-to-br from-violet-500 to-purple-600",
                                        selectedInsight.closingType === 'strategic' && "bg-gradient-to-br from-cyan-500 to-teal-600",
                                    )}
                                >
                                    <selectedInsight.icon className="h-10 w-10 text-white" />
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-bold text-white mb-1 relative z-10"
                                >
                                    {selectedInsight.detailTitle}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="text-sm text-neutral-400 relative z-10"
                                >
                                    {selectedInsight.text}
                                </motion.p>
                            </div>

                            {/* Detail Content */}
                            <div className="px-6 sm:px-8 pb-4 overflow-y-auto flex-1 space-y-5">
                                {selectedInsight.detailSections.map((section, sIdx) => (
                                    <motion.div
                                        key={sIdx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + sIdx * 0.1 }}
                                        className="rounded-xl bg-white/5 border border-white/5 p-4"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <section.icon className={cn("h-4 w-4", section.color)} />
                                            <h3 className="font-semibold text-sm text-white">{section.heading}</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {section.items.map((item, iIdx) => (
                                                <motion.li
                                                    key={iIdx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + sIdx * 0.1 + iIdx * 0.05 }}
                                                    className="flex items-start gap-3 text-sm text-neutral-300 leading-relaxed"
                                                >
                                                    <div className={cn("h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0", selectedInsight.bg.replace('/10', '/50'))} />
                                                    {item}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}

                                {/* Closing Message */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className={cn(
                                        "rounded-xl p-4 border text-sm leading-relaxed",
                                        selectedInsight.closingType === 'motivational' && "bg-amber-500/5 border-amber-500/15 text-amber-200",
                                        selectedInsight.closingType === 'appreciative' && "bg-violet-500/5 border-violet-500/15 text-violet-200",
                                        selectedInsight.closingType === 'strategic' && "bg-cyan-500/5 border-cyan-500/15 text-cyan-200",
                                    )}
                                >
                                    {selectedInsight.closingMessage}
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-white/5 flex justify-between items-center bg-neutral-900/80">
                                <button
                                    onClick={() => setSelectedInsight(null)}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Minimize2 className="h-5 w-5 text-neutral-400" />
                                </button>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() => setSelectedInsight(null)}
                                        className="rounded-full px-6 shadow-lg"
                                    >
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        Saya Mengerti
                                    </Button>
                                </motion.div>
                                <div className="w-9" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
