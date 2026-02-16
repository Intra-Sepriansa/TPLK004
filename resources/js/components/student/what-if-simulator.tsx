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
            className="rounded-[2rem] bg-[#0F172A] border border-slate-800 overflow-hidden shadow-2xl h-full flex flex-col"
        >
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-900/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Simulator "What-If"</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Proyeksikan kehadiran akhirmu dengan mengatur rencana kehadiran di masa depan.
                </p>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-slate-400 font-medium">Rencana Hadir (Sesi)</span>
                        <motion.span
                            key={futurePresent}
                            initial={{ scale: 1.2, color: '#fff' }}
                            animate={{ scale: 1, color: '#94a3b8' }}
                            className="text-xl font-bold font-mono text-white"
                        >
                            {futurePresent} / {remainingSessions}
                        </motion.span>
                    </div>

                    <div className="relative py-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-xl opacity-50" />
                        <Slider
                            value={[futurePresent]}
                            max={remainingSessions}
                            step={1}
                            onValueChange={(val) => setFuturePresent(val[0])}
                            className="relative z-10 py-4 cursor-grab active:cursor-grabbing"
                        />
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
                        <span>Bolos Semua</span>
                        <span>Hadir Semua</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Saat Ini</p>
                        <p className={cn("text-3xl font-black tracking-tight", getGradeColor(currentRate))}>
                            {currentRate.toFixed(1)}%
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold relative z-10">Proyeksi Akhir</p>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <p className={cn("text-3xl font-black tracking-tight", getGradeColor(projectedRate))}>
                                {projectedRate.toFixed(1)}%
                            </p>
                            <ArrowRight className={cn(
                                "h-4 w-4 mb-1 transition-transform",
                                projectedRate >= currentRate
                                    ? "text-emerald-500 -rotate-45"
                                    : "text-red-500 rotate-45"
                            )} />
                        </div>
                    </div>
                </div>

                <motion.div
                    layout
                    className="mt-auto p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 text-violet-300 text-sm flex gap-3 items-start"
                >
                    <RefreshCw className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin-slow" />
                    <p className="leading-relaxed font-medium">{getRecommendation()}</p>
                </motion.div>
            </div>
        </motion.div>
    );
}
