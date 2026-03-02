import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, RefreshCw, ArrowRight, TrendingUp, Maximize2, Minimize2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface WhatIfSimulatorProps {
    totalSessions: number;
    presentSessions: number;
    remainingSessions: number;
}

export function WhatIfSimulator({
    totalSessions = 0,
    presentSessions = 0,
    remainingSessions = 14
}: WhatIfSimulatorProps) {
    const [futurePresent, setFuturePresent] = useState<number>(remainingSessions);
    const [projectedRate, setProjectedRate] = useState<number>(0);
    const [currentRate, setCurrentRate] = useState<number>(0);

    useEffect(() => {
        const current = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;
        setCurrentRate(current);

        const finalTotal = totalSessions + remainingSessions;
        const finalPresent = presentSessions + futurePresent;
        const projected = finalTotal > 0 ? (finalPresent / finalTotal) * 100 : 0;
        setProjectedRate(projected);
    }, [totalSessions, presentSessions, remainingSessions, futurePresent]);

    const getGradeColor = (rate: number) => {
        if (rate >= 80) return 'text-emerald-400';
        if (rate >= 70) return 'text-blue-400';
        if (rate >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getRecommendation = () => {
        if (projectedRate < 75) return "Risiko Mengulang! Usahakan hadir di semua sesi tersisa.";
        if (projectedRate < 80) return "Hati-hati, sedikit lagi menyentuh batas aman.";
        if (projectedRate < 90) return "Bagus, pertahankan kehadiranmu.";
        return "Luar biasa! Pertahankan performa ini.";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col w-full mb-2"
        >
            <div className="mb-6">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Proyeksikan kehadiran akhirmu dengan mengatur rencana kehadiran di masa depan.
                </p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm flex-1 text-neutral-500 dark:text-neutral-400 font-medium">Rencana Hadir (Sesi)</span>
                        <motion.span
                            key={futurePresent}
                            initial={{ scale: 1.2, color: '#10b981' }}
                            animate={{ scale: 1, color: '' }}
                            className="text-xl sm:text-2xl font-bold font-mono text-neutral-900 dark:text-white"
                        >
                            {futurePresent} / {remainingSessions}
                        </motion.span>
                    </div>

                    <div className="relative py-2 px-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-xl opacity-50 dark:opacity-30" />
                        <Slider
                            value={[futurePresent]}
                            max={remainingSessions}
                            step={1}
                            onValueChange={(val) => setFuturePresent(val[0])}
                            className="relative z-10 py-4 cursor-grab active:cursor-grabbing"
                        />
                    </div>

                    <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">
                        <span>Bolos Semua</span>
                        <span>Hadir Semua</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/50 border border-white/20 dark:bg-neutral-900/50 dark:border-white/10 shadow-sm space-y-2 backdrop-blur-sm transition-all hover:scale-105">
                        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">Saat Ini</p>
                        <p className={cn("text-2xl sm:text-3xl font-black tracking-tight", getGradeColor(currentRate))}>
                            {currentRate.toFixed(1)}%
                        </p>
                    </div>
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/50 border border-emerald-500/20 dark:bg-emerald-900/10 dark:border-emerald-500/20 shadow-sm space-y-2 relative overflow-hidden group transition-all hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold relative z-10">Proyeksi Akhir</p>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 relative z-10">
                            <p className={cn("text-2xl sm:text-3xl font-black tracking-tight", getGradeColor(projectedRate))}>
                                {projectedRate.toFixed(1)}%
                            </p>
                            <ArrowRight className={cn(
                                "hidden sm:block h-4 w-4 mb-1 transition-transform",
                                projectedRate >= currentRate
                                    ? "text-emerald-500 -rotate-45"
                                    : "text-red-500 rotate-45"
                            )} />
                        </div>
                    </div>
                </div>

                <motion.div
                    layout
                    className="p-3 sm:p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs sm:text-sm flex gap-3 items-start shadow-sm"
                >
                    <RefreshCw className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin-slow text-violet-500" />
                    <p className="leading-relaxed font-medium">{getRecommendation()}</p>
                </motion.div>
            </div>
        </motion.div>
    );
}
