/**
 * Dosen Documentation Hub Page
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
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
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout>
            <Head title="Dokumentasi" />

            <div className="px-4 py-6">
                {selectedGuide ? (
                    <GuideDetail
                        guide={selectedGuide}
                        progress={guideProgress ?? undefined}
                        onBack={handleBack}
                        onSectionComplete={handleSectionComplete}
                        onMarkComplete={handleMarkComplete}
                    />
                ) : (
                    <DocumentationHub
                        guides={guides}
                        onGuideSelect={handleGuideSelect}
                        overallProgress={overallProgress ?? undefined}
                    />
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-background border">
                        {toast.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm">{toast.message}</span>
                    </div>
                )}
            </div>
        </DosenLayout>
    );
}
