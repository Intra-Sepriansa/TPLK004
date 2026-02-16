import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Camera, Smartphone, Clock, BrainCircuit, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScanStep {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

const SCAN_STEPS: ScanStep[] = [
    { id: 'gps', label: 'GPS Spoofing', description: 'Memeriksa koordinat GPS mencurigakan...', icon: MapPin, color: 'text-red-400' },
    { id: 'location', label: 'Perpindahan Lokasi', description: 'Menganalisis kecepatan perpindahan...', icon: MapPin, color: 'text-orange-400' },
    { id: 'selfie', label: 'Selfie Duplikat', description: 'Membandingkan hash foto selfie...', icon: Camera, color: 'text-violet-400' },
    { id: 'device', label: 'Perangkat', description: 'Memvalidasi device fingerprint...', icon: Smartphone, color: 'text-cyan-400' },
    { id: 'time', label: 'Anomali Waktu', description: 'Memeriksa waktu scan absensi...', icon: Clock, color: 'text-amber-400' },
    { id: 'pattern', label: 'Pola Mencurigakan', description: 'Menganalisis pola perilaku 30 hari...', icon: BrainCircuit, color: 'text-emerald-400' },
];

interface FraudScanOverlayProps {
    isOpen: boolean;
    onComplete: () => void;
}

export function FraudScanOverlay({ isOpen, onComplete }: FraudScanOverlayProps) {
    const [currentStep, setCurrentStep] = useState(-1);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!isOpen) { setCurrentStep(-1); setCompleted(false); return; }
        const stepDuration = 800;
        let timer: NodeJS.Timeout;
        const runSteps = (step: number) => {
            if (step >= SCAN_STEPS.length) {
                setCompleted(true);
                timer = setTimeout(onComplete, 2000);
                return;
            }
            setCurrentStep(step);
            timer = setTimeout(() => runSteps(step + 1), stepDuration);
        };
        timer = setTimeout(() => runSteps(0), 600);
        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
                >
                    {/* Radar Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 3], opacity: [0.15, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.75 }}
                                className="absolute w-40 h-40 rounded-full border border-red-500/30"
                            />
                        ))}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-80 h-80"
                        >
                            <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-red-500/60 to-transparent" />
                        </motion.div>
                    </div>

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.8, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative z-10 w-full max-w-md mx-4"
                    >
                        {/* Shield Icon */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center justify-center mb-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl scale-150" />
                                <div className="relative p-6 rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-2xl shadow-red-500/50">
                                    <Shield className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-bold text-white text-center mb-2"
                        >
                            {completed ? 'Scan Selesai!' : 'Scanning System...'}
                        </motion.h2>
                        <motion.p className="text-sm text-neutral-400 text-center mb-8">
                            {completed ? 'Semua pemeriksaan telah selesai' : 'Memeriksa seluruh log absensi'}
                        </motion.p>

                        {/* Steps */}
                        <div className="space-y-3">
                            {SCAN_STEPS.map((step, idx) => {
                                const isActive = idx === currentStep;
                                const isDone = idx < currentStep || completed;
                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: idx <= currentStep || completed ? 1 : 0.3, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-xl border transition-all",
                                            isDone ? "bg-emerald-500/10 border-emerald-500/20" :
                                                isActive ? "bg-white/5 border-white/10 shadow-lg" :
                                                    "bg-white/[0.02] border-white/5"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-lg", isDone ? "bg-emerald-500/20" : isActive ? "bg-white/10" : "bg-white/5")}>
                                            {isDone ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> :
                                                isActive ? <Loader2 className="h-5 w-5 text-white animate-spin" /> :
                                                    <step.icon className={cn("h-5 w-5", step.color, "opacity-50")} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-medium", isDone ? "text-emerald-300" : isActive ? "text-white" : "text-neutral-500")}>
                                                {step.label}
                                            </p>
                                            {isActive && (
                                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-neutral-400 mt-0.5">
                                                    {step.description}
                                                </motion.p>
                                            )}
                                        </div>
                                        {isDone && <span className="text-xs text-emerald-400 font-medium">OK</span>}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: completed ? '100%' : `${((currentStep + 1) / SCAN_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
