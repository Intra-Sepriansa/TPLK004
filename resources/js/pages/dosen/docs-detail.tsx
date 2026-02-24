/**
 * Dosen Documentation Detail Page
 * UI/UX matches kas.tsx - animated header with orbs, glassmorphism containers
 */

import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    BookOpen,
    ChevronRight,
    Award,
    Sparkles,
    Star,
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface GuideSection {
    id: string;
    title: string;
    type: string;
    content: string;
    steps?: Array<{ title: string; description: string }>;
    faqs?: Array<{ question: string; answer: string }>;
}

interface GuideDetail {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    estimatedReadTime: number;
    sections: GuideSection[];
    progress: {
        completed_sections: string[];
        is_completed: boolean;
        completion_percentage: number;
    };
}

interface Props {
    dosen: any;
    guideId: string;
}

export default function DosenDocsDetail({ guideId, dosen }: Props) {
    const [guide, setGuide] = useState<GuideDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('');
    const [completedSections, setCompletedSections] = useState<string[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isGuideCompleted, setIsGuideCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const hasAutoCompleted = useRef(false);

    useEffect(() => {
        loadGuideDetail();
    }, [guideId]);

    // Auto-complete tracking based on scroll
    useEffect(() => {
        if (!guide || !activeSection) return;

        let checkInterval: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            if (!contentRef.current) return;

            const element = contentRef.current;
            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;

            // Calculate how far from bottom (with 100px buffer for easier completion)
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            
            let progress = 0;
            
            if (maxScroll <= 10) {
                // Content fits in viewport or very close
                progress = 100;
            } else {
                // Calculate scroll percentage
                progress = Math.round((scrollTop / maxScroll) * 100);
            }
            
            setScrollProgress(Math.min(progress, 100));

            // Auto-complete when:
            // 1. Scrolled to within 100px of bottom OR
            // 2. Progress >= 70% (lebih mudah lagi)
            const isNearBottom = distanceFromBottom <= 100;
            const hasReadEnough = progress >= 70;
            
            // Debug log
            console.log('Scroll Debug:', {
                scrollTop,
                scrollHeight,
                clientHeight,
                distanceFromBottom,
                progress,
                isNearBottom,
                hasReadEnough,
                hasAutoCompleted: hasAutoCompleted.current,
                isCompleted: completedSections.includes(activeSection)
            });
            
            if ((isNearBottom || hasReadEnough) && !completedSections.includes(activeSection) && !hasAutoCompleted.current) {
                console.log('✅ Triggering auto-complete!');
                hasAutoCompleted.current = true;
                setTimeout(() => {
                    handleSectionComplete(activeSection, true);
                }, 150);
            }
        };

        const element = contentRef.current;
        if (element) {
            // Initial check after mount
            setTimeout(() => handleScroll(), 100);
            
            // Add scroll listener
            element.addEventListener('scroll', handleScroll, { passive: true });
            
            // Also check when scroll ends (for better detection)
            element.addEventListener('scrollend', handleScroll);
            
            // Fallback: Check every 500ms if user is near bottom
            checkInterval = setInterval(() => {
                handleScroll();
            }, 500);
            
            return () => {
                element.removeEventListener('scroll', handleScroll);
                element.removeEventListener('scrollend', handleScroll);
                if (checkInterval) {
                    clearInterval(checkInterval);
                }
            };
        }
    }, [activeSection, completedSections, guide]);

    // Reset auto-complete flag when section changes
    useEffect(() => {
        hasAutoCompleted.current = false;
        setScrollProgress(0);
        
        // Trigger initial scroll check after section change
        setTimeout(() => {
            if (contentRef.current && activeSection) {
                const element = contentRef.current;
                const scrollHeight = element.scrollHeight;
                const clientHeight = element.clientHeight;
                
                // If content fits in viewport (tidak perlu scroll), auto-complete after 1.5 seconds
                if (scrollHeight - clientHeight <= 10 && !completedSections.includes(activeSection)) {
                    setTimeout(() => {
                        if (!hasAutoCompleted.current && !completedSections.includes(activeSection)) {
                            hasAutoCompleted.current = true;
                            handleSectionComplete(activeSection, true);
                        }
                    }, 1500); // 1.5 detik untuk konten pendek (lebih cepat)
                }
            }
        }, 200);
    }, [activeSection]);

    const loadGuideDetail = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/docs/guides/${guideId}?role=dosen`);
            const data = await response.json();
            
            if (data.success) {
                setGuide(data.data);
                setCompletedSections(data.data.progress?.completed_sections || []);
                setIsGuideCompleted(data.data.progress?.is_completed || false);
                setActiveSection(data.data.sections[0]?.id || '');
            }
        } catch (error) {
            console.error('Failed to load guide:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSectionComplete = async (sectionId: string, isAutoComplete = false) => {
        const newCompleted = completedSections.includes(sectionId)
            ? completedSections.filter(id => id !== sectionId)
            : [...completedSections, sectionId];

        setCompletedSections(newCompleted);

        // Trigger confetti animation when section is completed
        if (isAutoComplete && !completedSections.includes(sectionId)) {
            // Confetti burst from center
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#14b8a6', '#06b6d4', '#fbbf24', '#f59e0b'],
            });

            // Second burst with stars
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#10b981', '#14b8a6', '#06b6d4'],
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#fbbf24', '#f59e0b', '#10b981'],
                });
            }, 200);

            // Show celebration toast
            toast.success('Section Selesai!', {
                description: 'Bagus! Lanjutkan ke section berikutnya.',
                duration: 3000,
                icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
            });
        }

        try {
            await fetch(`/api/docs/guides/${guideId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    completed_sections: newCompleted,
                }),
            });

            // Check if all sections are now completed (only trigger when adding new completion)
            if (guide && newCompleted.length === guide.sections.length && !completedSections.includes(sectionId)) {
                // All sections completed! Auto-complete the guide
                await fetch(`/api/docs/progress/${guideId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                // Update local state
                setIsGuideCompleted(true);
                
                // Show celebration overlay
                setShowCelebration(true);

                // Show big celebration toast
                toast.success('🎊 Guide Selesai!', {
                    description: 'Selamat! Anda telah menyelesaikan semua panduan! Kembali ke dokumentasi...',
                    duration: 3000,
                });

                // Big confetti celebration
                const duration = 3000;
                const animationEnd = Date.now() + duration;
                const defaults = { 
                    startVelocity: 30, 
                    spread: 360, 
                    ticks: 60, 
                    zIndex: 9999,
                    colors: ['#10b981', '#14b8a6', '#06b6d4', '#22d3ee', '#34d399', '#fbbf24']
                };

                const interval = setInterval(() => {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: Math.random(), y: Math.random() - 0.2 }
                    });
                }, 250);

                // Navigate back to docs list after 3 seconds
                setTimeout(() => {
                    router.visit('/dosen/docs');
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    const handleManualComplete = async () => {
        if (!guide) return;

        // Check if all sections are completed
        const allSectionsComplete = guide.sections.every(section => 
            completedSections.includes(section.id)
        );

        if (allSectionsComplete) {
            // Mark guide as fully completed
            try {
                await fetch(`/api/docs/progress/${guideId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                // Update local state
                setIsGuideCompleted(true);

                // Show success notification
                toast.success('Guide Selesai! 🎊', {
                    description: 'Selamat! Anda telah menyelesaikan panduan ini!',
                    duration: 5000,
                });

                // Optional: Navigate back to docs list after 2 seconds
                setTimeout(() => {
                    router.visit('/dosen/docs');
                }, 2000);
            } catch (error) {
                console.error('Failed to mark guide as complete:', error);
                toast.error('Gagal menyelesaikan guide', {
                    description: 'Silakan coba lagi nanti.',
                });
            }
        } else {
            toast.warning('Belum semua section selesai', {
                description: 'Silakan baca semua section terlebih dahulu.',
            });
        }
    };

    const handleBack = () => {
        router.visit('/dosen/docs');
    };

    if (isLoading) {
        return (
            <DosenLayout dosen={dosen}>
                <Head title="Loading..." />
                <div className="space-y-6 p-6">
                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border border-slate-200/70 dark:border-neutral-800/70 rounded-2xl p-6 shadow-lg animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-2/3"></div>
                    </div>
                </div>
            </DosenLayout>
        );
    }

    if (!guide) {
        return (
            <DosenLayout dosen={dosen}>
                <Head title="Guide Not Found" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Guide Not Found</h2>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors"
                        >
                            Back to Documentation
                        </button>
                    </div>
                </div>
            </DosenLayout>
        );
    }

    const activeContent = guide.sections.find(s => s.id === activeSection);
    const completionPercentage = Math.round((completedSections.length / guide.sections.length) * 100);

    return (
        <DosenLayout dosen={dosen}>
            <Head title={guide.title} />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #10b981, #14b8a6);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #059669, #0d9488);
                }
                
                /* Hide ** and make text bold */
                .prose p {
                    white-space: pre-wrap;
                }
            `}</style>

            <div className="space-y-6 p-6">
                {/* Header - Matching Docs List Style */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Pulsating Rings */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                    />

                    <div className="relative">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Documentation</span>
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm text-white/90 font-medium">Dokumentasi Dosen</p>
                                <h1 className="text-3xl font-bold">{guide.title}</h1>
                            </div>
                        </div>

                        <p className="text-white/90 mb-4">{guide.description}</p>

                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{guide.estimatedReadTime} min read</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">{guide.sections.length} sections</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span className="font-medium">{completionPercentage}% complete</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">TOTAL GUIDES</p>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{guide.sections.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">COMPLETED</p>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedSections.length}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">↑ {completionPercentage}%</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">IN PROGRESS</p>
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <Clock className="w-5 h-5 text-cyan-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{guide.sections.length - completedSections.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">OVERALL PROGRESS</p>
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Award className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{completionPercentage}%</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">↑ {completionPercentage > 50 ? '60%' : '0%'}</p>
                    </motion.div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Sections List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sections</h3>
                            <div className="space-y-2">
                                {guide.sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                            activeSection === section.id
                                                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {completedSections.includes(section.id) ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                                                        activeSection === section.id ? 'border-white' : 'border-current'
                                                    }`} />
                                                )}
                                                <span className="text-sm font-medium">{section.title}</span>
                                            </div>
                                            {activeSection === section.id && (
                                                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
                            <AnimatePresence mode="wait">
                                {activeContent && (
                                    <motion.div
                                        key={activeContent.id}
                                        ref={contentRef}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-y-auto pr-4 custom-scrollbar"
                                        style={{ 
                                            maxHeight: 'calc(100vh - 400px)',
                                            minHeight: '400px',
                                            scrollBehavior: 'smooth' 
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeContent.title}</h2>
                                                {!completedSections.includes(activeContent.id) && scrollProgress > 0 && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        <div className="h-1.5 w-32 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden shadow-inner">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${scrollProgress}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        </div>
                                                        <span>{scrollProgress}% read</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Section Complete Buttons */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {completedSections.includes(activeContent.id) ? (
                                                    <div className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2 shadow-lg">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Selesai</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {scrollProgress >= 50 && (
                                                            <button
                                                                onClick={() => handleSectionComplete(activeContent.id, true)}
                                                                className="px-4 py-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-sm"
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Tandai Selesai
                                                                </span>
                                                            </button>
                                                        )}
                                                        {isGuideCompleted ? (
                                                            <div className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2 shadow-lg">
                                                                <CheckCircle className="w-5 h-5" />
                                                                <span>Guide Selesai</span>
                                                            </div>
                                                        ) : completionPercentage === 100 ? (
                                                            <button
                                                                onClick={handleManualComplete}
                                                                className="px-6 py-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Selesaikan Guide
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                                {completionPercentage}% Complete
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {activeContent.content.split('\n\n').map((paragraph, idx) => {
                                                    if (!paragraph.trim()) return null;
                                                    
                                                    // Replace **text** with <strong>text</strong>
                                                    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                                                    const rendered = parts.map((part, i) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
                                                        }
                                                        return <span key={i}>{part}</span>;
                                                    });

                                                    return (
                                                        <p key={idx} className="mb-4 leading-relaxed whitespace-pre-wrap">
                                                            {rendered}
                                                        </p>
                                                    );
                                                })}
                                            </div>

                                            {/* Steps */}
                                            {activeContent.steps && activeContent.steps.length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Steps</h3>
                                                    {activeContent.steps.map((step, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                                    <span className="text-white font-bold text-sm">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* FAQs */}
                                            {activeContent.faqs && activeContent.faqs.length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                                                    {activeContent.faqs.map((faq, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                                                            <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                                            <button
                                                onClick={() => {
                                                    const currentIndex = guide.sections.findIndex(s => s.id === activeSection);
                                                    if (currentIndex > 0) {
                                                        setActiveSection(guide.sections[currentIndex - 1].id);
                                                    }
                                                }}
                                                disabled={guide.sections.findIndex(s => s.id === activeSection) === 0}
                                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                ← Previous
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const currentIndex = guide.sections.findIndex(s => s.id === activeSection);
                                                    if (currentIndex < guide.sections.length - 1) {
                                                        setActiveSection(guide.sections[currentIndex + 1].id);
                                                    }
                                                }}
                                                disabled={guide.sections.findIndex(s => s.id === activeSection) === guide.sections.length - 1}
                                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Celebration Overlay */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 20,
                                duration: 0.8 
                            }}
                            className="relative"
                        >
                            {/* Glowing background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-3xl opacity-50 animate-pulse" />
                            
                            {/* Main card */}
                            <div className="relative bg-white dark:bg-neutral-900 rounded-3xl p-12 shadow-2xl border-4 border-emerald-500 max-w-md">
                                {/* Floating icons */}
                                <div className="absolute -top-8 -left-8">
                                    <motion.div
                                        animate={{ 
                                            rotate: [0, 360],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <Award className="w-8 h-8 text-white" />
                                    </motion.div>
                                </div>
                                
                                <div className="absolute -top-8 -right-8">
                                    <motion.div
                                        animate={{ 
                                            rotate: [360, 0],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.5
                                        }}
                                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <Star className="w-8 h-8 text-white" />
                                    </motion.div>
                                </div>

                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                                    <motion.div
                                        animate={{ 
                                            y: [0, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ 
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="text-center space-y-6">
                                    {/* Trophy icon */}
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{ 
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="flex justify-center"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                                            <Award className="w-14 h-14 text-white" />
                                        </div>
                                    </motion.div>

                                    {/* Text */}
                                    <div className="space-y-3">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring' }}
                                            className="flex items-center justify-center gap-3"
                                        >
                                            <Award className="h-10 w-10 text-emerald-600" />
                                            <motion.h2
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
                                            >
                                                Selamat!
                                            </motion.h2>
                                        </motion.div>
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-xl font-bold text-gray-900 dark:text-white"
                                        >
                                            Guide Berhasil Diselesaikan!
                                        </motion.p>
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-gray-600 dark:text-gray-400"
                                        >
                                            Anda telah menyelesaikan semua panduan dengan sempurna!
                                        </motion.p>
                                    </div>

                                    {/* Progress indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.9, type: "spring" }}
                                        className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold"
                                    >
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="text-2xl">100%</span>
                                    </motion.div>

                                    {/* Redirect message */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2 }}
                                        className="text-sm text-gray-500 dark:text-gray-500"
                                    >
                                        Kembali ke dokumentasi dalam beberapa detik...
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DosenLayout>
    );
}
