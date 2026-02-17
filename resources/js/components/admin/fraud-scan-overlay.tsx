import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Camera, Smartphone, Clock, BrainCircuit, CheckCircle2, Loader2, AlertTriangle, Terminal, Cpu, Database, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScanStep {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    cmd: string;
}

const SCAN_STEPS: ScanStep[] = [
    { id: 'gps', label: 'GEO_SPATIAL_ANALYSIS', description: 'Triangulating GPS coordinates & altitude data...', icon: MapPin, color: 'text-red-500', cmd: 'exec geo_trace -v --depth=3' },
    { id: 'location', label: 'VELOCITY_CHECK', description: 'Analyzing movement vectors & speed anomalies...', icon: Activity, color: 'text-orange-500', cmd: 'run velocity_matrix_calc' },
    { id: 'device', label: 'DEVICE_FINGERPRINTING', description: 'Matching hardware ID, OS version, & screen res...', icon: Smartphone, color: 'text-cyan-500', cmd: 'query hardware_id --match-db' },
    { id: 'selfie', label: 'BIOMETRIC_HASH_COMPARE', description: 'Generating perceptual hashes for facial data...', icon: Camera, color: 'text-violet-500', cmd: 'exec face_recog --threshold=0.85' },
    { id: 'time', label: 'TEMPORAL_ANOMALY_SCAN', description: 'Checking NTP sync & timezone offsets...', icon: Clock, color: 'text-amber-500', cmd: 'sync_check --ntp-server=pool.ntp.org' },
    { id: 'pattern', label: 'HEURISTIC_PATTERN_MATCH', description: 'Running ML model for behavioral analysis...', icon: BrainCircuit, color: 'text-emerald-500', cmd: 'ml_predict --model=fraud_v4' },
];

import { Activity } from 'lucide-react';

interface FraudScanOverlayProps {
    isOpen: boolean;
    onComplete: () => void;
}

const FAKE_LOGS: string[] = [];

export function FraudScanOverlay({ isOpen, onComplete }: FraudScanOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setCompleted(false);
            setLogs([]);
            return;
        }

        const stepDuration = 1200; // Slower for dramatic effect
        let stepTimer: NodeJS.Timeout;

        const runSteps = (step: number) => {
            if (step >= SCAN_STEPS.length) {
                setCompleted(true);
                setTimeout(onComplete, 2500);
                return;
            }
            setCurrentStep(step);
            stepTimer = setTimeout(() => runSteps(step + 1), stepDuration);
        };

        // Start steps
        setTimeout(() => runSteps(0), 1000);

        // Logs Generator (Removed Fake Logs)
        const logInterval = setInterval(() => {
            // No operation or fetch real logs if available
        }, 1000);

        return () => {
            clearTimeout(stepTimer);
            clearInterval(logInterval);
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl font-mono"
                >
                    {/* ═══════ MATRIX BACKGROUND ═══════ */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] bg-[length:100%_4px,6px_100%]" />
                        {/* Moving Scan Line */}
                        <motion.div
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-red-500/20 to-transparent"
                        />
                    </div>

                    {/* ═══════ CONTENT ═══════ */}
                    <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-12 p-8">

                        {/* LEFT: VISUALIZER */}
                        <div className="space-y-8">
                            {/* Main Hexagon Loader */}
                            <div className="relative h-64 w-full flex items-center justify-center">
                                {/* Rotating Rings */}
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-48 h-48 border border-red-500/30 rounded-full border-dashed" />
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-60 h-60 border border-red-500/20 rounded-full border-dotted" />

                                {/* Center Pulse */}
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="relative z-10">
                                    <div className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                                        <Shield className="h-16 w-16 text-red-500" />
                                    </div>
                                </motion.div>

                                {/* Glitch Text Title */}
                                <div className="absolute -bottom-12 text-center w-full">
                                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                                        {completed ? 'SYSTEM_SECURE' : 'SYSTEM_BREACH_SCAN'}
                                    </h2>
                                    <p className="text-xs text-red-400 animate-pulse">
                                        {completed ? 'ANALYSIS COMPLETE' : 'EXECUTING PROTOCOL V9.2...'}
                                    </p>
                                </div>
                            </div>

                            {/* Fake Console Log */}
                            <div className="h-40 bg-black/50 border border-red-500/20 p-4 rounded-xl overflow-hidden font-mono text-xs relative">
                                <div className="absolute top-0 left-0 w-full px-2 py-1 bg-red-900/20 border-b border-red-500/20 text-red-400 flex justify-between">
                                    <span>TERMINAL_OUTPUT</span>
                                    <span>:8080</span>
                                </div>
                                <div className="mt-6 space-y-1">
                                    {logs.length > 0 ? logs.map((log, i) => (
                                        <div key={i} className="text-green-500/80">
                                            <span className="text-neutral-500 mr-2">{'>'}</span>{log}
                                        </div>
                                    )) : (
                                        <div className="text-green-500/50 italic">
                                            <span className="text-neutral-500 mr-2">{'>'}</span>System Analysis Running...
                                        </div>
                                    )}
                                    <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-4 bg-green-500 inline-block align-middle ml-1" />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: STEPS PROGRESS */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <Cpu className="h-5 w-5 text-red-500" />
                                    <span className="text-sm font-bold text-white/80 tracking-widest">PROCESS_MONITOR</span>
                                </div>
                                <span className="text-xs font-mono text-red-400">{currentStep + 1}/{SCAN_STEPS.length} MODULES</span>
                            </div>

                            <div className="space-y-3 relative">
                                {/* Connecting Line */}
                                <div className="absolute left-[1.35rem] top-4 bottom-4 w-0.5 bg-white/5" />

                                {SCAN_STEPS.map((step, idx) => {
                                    const isActive = idx === currentStep;
                                    const isDone = idx < currentStep || completed;

                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={cn(
                                                "relative flex items-start gap-4 p-3 rounded-lg border transition-all duration-500",
                                                isActive ? "bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                                                    isDone ? "bg-green-500/5 border-green-500/20" : "border-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                                                isActive ? "border-red-500 bg-red-950 text-red-400 scale-110" :
                                                    isDone ? "border-green-500 bg-green-950 text-green-400" : "border-neutral-700 bg-neutral-900 text-neutral-500"
                                            )}>
                                                {isDone ? <CheckCircle2 className="h-4 w-4" /> :
                                                    isActive ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                                        <span className="text-xs">{idx + 1}</span>}
                                            </div>

                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className={cn("text-xs font-bold tracking-widest", isActive ? "text-red-400" : isDone ? "text-green-400" : "text-neutral-500")}>
                                                        {step.label}
                                                    </p>
                                                    {isActive && <span className="text-[10px] text-red-500 animate-pulse">RUNNING</span>}
                                                </div>

                                                <p className="text-xs text-neutral-400 font-mono mb-1">{step.description}</p>

                                                {/* Mini CMD Line */}
                                                {(isActive || isDone) && (
                                                    <div className="bg-black/40 px-2 py-1 rounded text-[10px] font-mono text-neutral-500 border border-white/5">
                                                        $ {step.cmd}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
