import { cn } from '@/lib/utils'; // Assuming you have a utility for merging classes
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle,
    Clock,
    MapPin,
    Smartphone,
    X,
    XCircle,
} from 'lucide-react';

interface LogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: any; // Ideally this should be typed properly based on your Log interface
}

export default function LogDetailModal({
    isOpen,
    onClose,
    log,
}: LogDetailModalProps) {
    if (!log) return null;

    const statusConfig: Record<
        string,
        { label: string; color: string; bg: string; icon: any }
    > = {
        hadir: {
            label: 'Hadir',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            icon: CheckCircle,
        },
        terlambat: {
            label: 'Terlambat',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            icon: Clock,
        },
        ditolak: {
            label: 'Ditolak',
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/30',
            icon: XCircle,
        },
        izin: {
            label: 'Izin',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            icon: AlertTriangle,
        },
        sakit: {
            label: 'Sakit',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            icon: AlertTriangle,
        },
    };

    const StatusIcon = statusConfig[log.status]?.icon || AlertTriangle;
    const config = statusConfig[log.status] || {
        label: log.status,
        color: 'text-neutral-600',
        bg: 'bg-neutral-100',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    static
                    as={motion.div}
                    open={isOpen}
                    onClose={onClose}
                    className="relative z-50"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel
                            as={motion.div}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="relative p-6 text-center">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div
                                    className={cn(
                                        'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-lg ring-4 ring-white dark:ring-neutral-900',
                                        config.bg,
                                        config.color,
                                    )}
                                >
                                    <StatusIcon className="h-8 w-8" />
                                </div>

                                <Dialog.Title
                                    as="h3"
                                    className="text-xl font-bold text-neutral-900 dark:text-white"
                                >
                                    {log.name}
                                </Dialog.Title>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    {log.nim}
                                </p>

                                <div
                                    className={cn(
                                        'mx-auto mt-3 w-fit rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase',
                                        config.bg,
                                        config.color,
                                        config.bg.replace('bg-', 'border-'),
                                    )}
                                >
                                    {config.label}
                                </div>
                            </div>

                            <div className="space-y-3 bg-neutral-50 p-6 dark:bg-neutral-950/50">
                                <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                            Waktu Scan
                                        </p>
                                        <p className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                                            {log.time}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                            Mata Kuliah
                                        </p>
                                        <p className="line-clamp-1 text-sm font-bold text-neutral-900 dark:text-white">
                                            {log.course}
                                        </p>
                                    </div>
                                </div>

                                {log.distance_m !== null && (
                                    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                                Lokasi / Jarak
                                            </p>
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                {log.distance_m} meter{' '}
                                                <span className="font-normal text-neutral-500 dark:text-neutral-400">
                                                    dari pusat
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3 opacity-75 dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                                            Perangkat
                                        </p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                            Unknown Device
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="mt-2 w-full rounded-xl bg-neutral-900 py-3 font-bold text-white shadow-lg transition-transform hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-neutral-900"
                                >
                                    Tutup Detail
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
