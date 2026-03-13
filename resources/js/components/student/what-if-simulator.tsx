import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WhatIfSimulatorProps {
    totalSessions: number;
    presentSessions: number;
    remainingSessions: number;
}

export function WhatIfSimulator({
    totalSessions = 0,
    presentSessions = 0,
    remainingSessions = 14,
}: WhatIfSimulatorProps) {
    const [futurePresent, setFuturePresent] =
        useState<number>(remainingSessions);
    const [projectedRate, setProjectedRate] = useState<number>(0);
    const [currentRate, setCurrentRate] = useState<number>(0);

    useEffect(() => {
        const current =
            totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;
        setCurrentRate(current);

        const finalTotal = totalSessions + remainingSessions;
        const finalPresent = presentSessions + futurePresent;
        const projected =
            finalTotal > 0 ? (finalPresent / finalTotal) * 100 : 0;
        setProjectedRate(projected);
    }, [totalSessions, presentSessions, remainingSessions, futurePresent]);

    const getGradeColor = (rate: number) => {
        if (rate >= 80) return 'text-emerald-400';
        if (rate >= 70) return 'text-blue-400';
        if (rate >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getRecommendation = () => {
        if (projectedRate < 75)
            return 'Risiko Mengulang! Usahakan hadir di semua sesi tersisa.';
        if (projectedRate < 80)
            return 'Hati-hati, sedikit lagi menyentuh batas aman.';
        if (projectedRate < 90) return 'Bagus, pertahankan kehadiranmu.';
        return 'Luar biasa! Pertahankan performa ini.';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 flex h-full w-full flex-col"
        >
            <div className="mb-6">
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Proyeksikan kehadiran akhirmu dengan mengatur rencana
                    kehadiran di masa depan.
                </p>
            </div>

            <div className="flex flex-1 flex-col gap-6">
                <div className="space-y-4">
                    <div className="flex items-end justify-between">
                        <span className="flex-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Rencana Hadir (Sesi)
                        </span>
                        <motion.span
                            key={futurePresent}
                            initial={{ scale: 1.2, color: '#10b981' }}
                            animate={{ scale: 1, color: '' }}
                            className="font-mono text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white"
                        >
                            {futurePresent} / {remainingSessions}
                        </motion.span>
                    </div>

                    <div className="relative px-1 py-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-50 blur-xl dark:opacity-30" />
                        <Slider
                            value={[futurePresent]}
                            max={remainingSessions}
                            step={1}
                            onValueChange={(val) => setFuturePresent(val[0])}
                            className="relative z-10 cursor-grab py-4 active:cursor-grabbing"
                        />
                    </div>

                    <div className="flex justify-between text-xs font-medium tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                        <span>Bolos Semua</span>
                        <span>Hadir Semua</span>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 rounded-2xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:scale-105 sm:p-5 dark:border-white/10 dark:bg-neutral-900/50">
                        <p className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase sm:text-xs dark:text-neutral-400">
                            Saat Ini
                        </p>
                        <p
                            className={cn(
                                'text-2xl font-black tracking-tight sm:text-3xl',
                                getGradeColor(currentRate),
                            )}
                        >
                            {currentRate.toFixed(1)}%
                        </p>
                    </div>
                    <div className="group relative space-y-2 overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/50 p-4 shadow-sm transition-all hover:scale-105 sm:p-5 dark:border-emerald-500/20 dark:bg-emerald-900/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                        <p className="relative z-10 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase sm:text-xs dark:text-neutral-400">
                            Proyeksi Akhir
                        </p>
                        <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                            <p
                                className={cn(
                                    'text-2xl font-black tracking-tight sm:text-3xl',
                                    getGradeColor(projectedRate),
                                )}
                            >
                                {projectedRate.toFixed(1)}%
                            </p>
                            <ArrowRight
                                className={cn(
                                    'mb-1 hidden h-4 w-4 transition-transform sm:block',
                                    projectedRate >= currentRate
                                        ? '-rotate-45 text-emerald-500'
                                        : 'rotate-45 text-red-500',
                                )}
                            />
                        </div>
                    </div>
                </div>

                <motion.div
                    layout
                    className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs text-violet-700 shadow-sm sm:p-4 sm:text-sm dark:border-violet-500/20 dark:bg-violet-900/20 dark:text-violet-300"
                >
                    <RefreshCw className="animate-spin-slow mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500" />
                    <p className="leading-relaxed font-medium">
                        {getRecommendation()}
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
