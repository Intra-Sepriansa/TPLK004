/**
 * Dosen Documentation Hub Page
 * Enhanced with advanced animations and interactive UI
 */

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { 
    RefreshCw, CheckCircle, AlertCircle, BookOpen, FileText, 
    Search, Filter, TrendingUp, Award, Clock, ArrowRight,
    ChevronRight, Star, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Input } from '@/components/ui/input';
import DosenLayout from '@/layouts/dosen-layout';
import { DocumentationHub, GuideDetail } from '@/components/documentation';
import type { GuideSummary, MenuGuide, ReadProgress } from '@/types/documentation';
import {
    getGuides,
    getGuide,
    getGuideProgress,
    updateProgress,
    markGuideCompleted,
    getProgressStats,
} from '@/lib/documentation-api';

type ToastType = { type: 'success' | 'error'; message: string } | null;

export default function DosenDocs() {
    const [guides, setGuides] = useState<GuideSummary[]>([]);
    const [selectedGuide, setSelectedGuide] = useState<MenuGuide | null>(null);
    const [guideProgress, setGuideProgress] = useState<ReadProgress | null>(null);
    const [overallProgress, setOverallProgress] = useState<{
        totalGuides: number;
        completedGuides: number;
        inProgressGuides: number;
        overallProgress: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<ToastType>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | 'completed' | 'in-progress'>('all');

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadGuides();
    }, []);

    const loadGuides = async () => {
        try {
            setIsLoading(true);
            const [guidesData, statsData] = await Promise.all([
                getGuides('dosen'),
                getProgressStats('dosen'),
            ]);
            setGuides(guidesData);
            setOverallProgress(statsData);
        } catch {
            showToast('error', 'Gagal memuat panduan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuideSelect = async (guideId: string) => {
        try {
            const [guide, progress] = await Promise.all([
                getGuide(guideId),
                getGuideProgress(guideId).catch(() => null),
            ]);
            setSelectedGuide(guide);
            setGuideProgress(progress);
        } catch {
            showToast('error', 'Gagal memuat panduan');
        }
    };

    const handleBack = () => {
        setSelectedGuide(null);
        setGuideProgress(null);
        loadGuides();
    };

    const handleSectionComplete = async (sectionId: string) => {
        if (!selectedGuide) return;

        try {
            const progress = await updateProgress(selectedGuide.id, sectionId, true);
            setGuideProgress(progress);
            showToast('success', 'Section ditandai selesai');
        } catch {
            showToast('error', 'Gagal menyimpan progress');
        }
    };

    const handleMarkComplete = async () => {
        if (!selectedGuide) return;

        try {
            const progress = await markGuideCompleted(selectedGuide.id);
            setGuideProgress(progress);
            showToast('success', 'Panduan ditandai selesai!');
        } catch {
            showToast('error', 'Gagal menandai selesai');
        }
    };

    if (isLoading) {
        return (
            <DosenLayout>
                <Head title="Dokumentasi" />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <RefreshCw className="h-8 w-8 text-blue-600" />
                    </motion.div>
                    <p className="mt-4 text-gray-500">Memuat dokumentasi...</p>
                </motion.div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout>
            <Head title="Dokumentasi" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
            >
                {!selectedGuide ? (
                    <>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                            />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                        >
                                            <BookOpen className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <p className="text-sm text-emerald-100">Pusat Bantuan</p>
                                            <h1 className="text-2xl font-bold">Dokumentasi</h1>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-emerald-100">Panduan lengkap penggunaan sistem</p>
                            </div>
                        </motion.div>

                        {/* Stats Cards */}
                        {overallProgress && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10 }}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                        >
                                            <BookOpen className="h-5 w-5" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total Panduan</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                <AnimatedCounter value={overallProgress.totalGuides} duration={1500} />
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10 }}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs text-gray-500">Selesai</p>
                                            <p className="text-xl font-bold text-green-600">
                                                <AnimatedCounter value={overallProgress.completedGuides} duration={1500} />
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10 }}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                        >
                                            <Clock className="h-5 w-5" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs text-gray-500">Sedang Dibaca</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                <AnimatedCounter value={overallProgress.inProgressGuides} duration={1500} />
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 10 }}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                                        >
                                            <TrendingUp className="h-5 w-5" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs text-gray-500">Progress</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                <AnimatedCounter value={Math.round(overallProgress.overallProgress)} duration={1500} />%
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari panduan..."
                                className="pl-10"
                            />
                        </motion.div>

                        {/* Documentation Hub Component */}
                        <DocumentationHub
                            guides={guides}
                            onGuideSelect={handleGuideSelect}
                            overallProgress={overallProgress ?? undefined}
                        />
                    </>
                ) : (
                    <GuideDetail
                        guide={selectedGuide}
                        progress={guideProgress ?? undefined}
                        onBack={handleBack}
                        onSectionComplete={handleSectionComplete}
                        onMarkComplete={handleMarkComplete}
                    />
                )}

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800"
                        >
                            {toast.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DosenLayout>
    );
}
