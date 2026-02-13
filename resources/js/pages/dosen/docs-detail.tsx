/**
 * Dosen Documentation Detail Page - Enhanced Version
 * Menampilkan detail guide dengan sections dan progress tracking
 * With advanced UI/UX and animations
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
    Trophy,
    Zap,
    Check,
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import DarkContainer from '@/components/ui/dark-container';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { fadeInVariants, slideUpVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import { toast } from 'sonner';

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

export default function DosenDocsDetail({ guideId }: { guideId: string }) {
    const [guide, setGuide] = useState<GuideDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('');
    const [completedSections, setCompletedSections] = useState<string[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isGuideCompleted, setIsGuideCompleted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const hasAutoCompleted = useRef(false);

    useEffect(() => {
        loadGuideDetail();
    }, [guideId]);

    // Auto-complete tracking based on scroll
    useEffect(() => {
        if (!guide || !activeSection) return;

        const handleScroll = () => {
            if (!contentRef.current) return;

            const element = contentRef.current;
            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;

            // If content is not scrollable (fits in viewport), consider it as 100% read
            const maxScroll = scrollHeight - clientHeight;
            let progress = 0;
            
            if (maxScroll <= 50) {
                // Content fits in viewport or very close
                progress = 100;
            } else {
                // Calculate scroll percentage
                progress = Math.round((scrollTop / maxScroll) * 100);
            }
            
            setScrollProgress(Math.min(progress, 100));

            // Auto-complete when scrolled to 85% or more (lowered threshold)
            if (progress >= 85 && !completedSections.includes(activeSection) && !hasAutoCompleted.current) {
                hasAutoCompleted.current = true;
                setTimeout(() => {
                    handleSectionComplete(activeSection, true);
                }, 300); // Small delay to ensure smooth UX
            }
        };

        const element = contentRef.current;
        if (element) {
            // Initial check
            setTimeout(() => handleScroll(), 100);
            
            element.addEventListener('scroll', handleScroll);
            return () => element.removeEventListener('scroll', handleScroll);
        }
    }, [activeSection, completedSections, guide]);

    // Reset auto-complete flag when section changes
    useEffect(() => {
        hasAutoCompleted.current = false;
        setScrollProgress(0);
        
        // Trigger initial scroll check after section change
        const checkTimer = setTimeout(() => {
            if (contentRef.current && activeSection) {
                const element = contentRef.current;
                const scrollHeight = element.scrollHeight;
                const clientHeight = element.clientHeight;
                
                // If content fits in viewport, auto-complete after 2 seconds of viewing
                if (scrollHeight - clientHeight <= 50 && !completedSections.includes(activeSection)) {
                    const autoCompleteTimer = setTimeout(() => {
                        if (!hasAutoCompleted.current && !completedSections.includes(activeSection)) {
                            hasAutoCompleted.current = true;
                            handleSectionComplete(activeSection, true);
                        }
                    }, 2000); // Reduced from 3 to 2 seconds
                    
                    return () => clearTimeout(autoCompleteTimer);
                }
            }
        }, 300);
        
        return () => clearTimeout(checkTimer);
    }, [activeSection, completedSections]);

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

        // NO toast notification for auto-complete
        // Only save progress silently

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
            <DosenLayout>
                <Head title="Loading..." />
                <div className="space-y-6 p-6">
                    <SkeletonGrid count={4} columns={1} />
                </div>
            </DosenLayout>
        );
    }

    if (!guide) {
        return (
            <DosenLayout>
                <Head title="Guide Not Found" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Guide Not Found</h2>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <DosenLayout>
            <Head title={guide.title} />

            <div className="space-y-6 p-6">
                {/* Enhanced Header with Gradient Background */}
                <motion.div
                    variants={fadeInVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden"
                >
                    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                        {/* Animated Background Orbs */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1], 
                                opacity: [0.3, 0.5, 0.3],
                                x: [0, 20, 0],
                                y: [0, -15, 0]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"
                        />
                        <motion.div
                            animate={{ 
                                scale: [1, 1.3, 1], 
                                opacity: [0.2, 0.4, 0.2],
                                x: [0, -20, 0],
                                y: [0, 15, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl"
                        />

                        {/* Floating Icons */}
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-6 right-24 opacity-10"
                        >
                            <BookOpen className="h-12 w-12" />
                        </motion.div>

                        <div className="relative z-10">
                            <motion.button
                                onClick={handleBack}
                                whileHover={{ x: -5, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-medium group"
                            >
                                <motion.div
                                    animate={{ x: [0, -5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ArrowLeft className="w-5 h-5 text-emerald-500" />
                                </motion.div>
                                <span>Back to Documentation</span>
                            </motion.button>

                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    <motion.h1 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3"
                                    >
                                        {guide.title}
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-gray-400 mb-6 text-lg leading-relaxed"
                                    >
                                        {guide.description}
                                    </motion.p>
                                    
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex flex-wrap items-center gap-4 text-sm"
                                    >
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                            <Clock className="w-4 h-4 text-emerald-400" />
                                            <span className="font-medium text-gray-300">{guide.estimatedReadTime} min read</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                            <BookOpen className="w-4 h-4 text-teal-400" />
                                            <span className="font-medium text-gray-300">{guide.sections.length} sections</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                            <Award className="w-4 h-4 text-purple-400" />
                                            <span className="font-medium text-gray-300">{completionPercentage}% complete</span>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Enhanced Progress Circle */}
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                                    className="relative"
                                >
                                    <div className="relative w-32 h-32">
                                        {/* Glow effect */}
                                        {completionPercentage === 100 && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-green-500/30 blur-xl"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.5, 0.8, 0.5]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        )}
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="none"
                                                className="text-white/10"
                                            />
                                            <motion.circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="url(#gradient)"
                                                strokeWidth="10"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 56}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - completionPercentage / 100) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="50%" stopColor="#14b8a6" />
                                                    <stop offset="100%" stopColor="#06b6d4" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            {completionPercentage === 100 ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200 }}
                                                >
                                                    <Trophy className="w-10 h-10 text-green-400" />
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-white">{completionPercentage}%</span>
                                                    <span className="text-xs text-gray-400 mt-1">Progress</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Enhanced Sidebar - Sections List */}
                    <motion.div
                        variants={slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800/70 rounded-2xl p-5 shadow-xl sticky top-24">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sections</h3>
                            </div>
                            
                            <motion.div 
                                variants={staggerContainerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-2"
                            >
                                {guide.sections.map((section, index) => (
                                    <motion.button
                                        key={section.id}
                                        variants={staggerItemVariants}
                                        onClick={() => setActiveSection(section.id)}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                                            activeSection === section.id
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Animated background on hover */}
                                        {activeSection !== section.id && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            />
                                        )}
                                        
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {completedSections.includes(section.id) ? (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="flex-shrink-0"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                        activeSection === section.id ? 'border-white bg-white/20' : 'border-current'
                                                    }`}>
                                                        <span className="text-xs font-bold">{index + 1}</span>
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium truncate">{section.title}</span>
                                            </div>
                                            {activeSection === section.id && (
                                                <motion.div
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>

                            {/* Progress Summary */}
                            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{completionPercentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Main Content */}
                    <motion.div
                        variants={fadeInVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-3"
                    >
                        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800/70 rounded-2xl shadow-xl overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeContent && (
                                    <motion.div
                                        key={activeContent.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-8"
                                    >
                                        {/* Section Header */}
                                        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                                            <div className="flex-1">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-3 mb-3"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                                                        <Sparkles className="w-5 h-5 text-white" />
                                                    </div>
                                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{activeContent.title}</h2>
                                                </motion.div>
                                                
                                                {!completedSections.includes(activeContent.id) && scrollProgress > 0 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex items-center gap-3 mt-3"
                                                    >
                                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full relative overflow-hidden"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${scrollProgress}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <motion.div
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                                    animate={{ x: ['-100%', '200%'] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                                />
                                                            </motion.div>
                                                        </div>
                                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 min-w-[60px]">{scrollProgress}% read</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                {/* Section Complete Button */}
                                                {!completedSections.includes(activeContent.id) ? (
                                                    <motion.button
                                                        onClick={() => handleSectionComplete(activeContent.id, false)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-5 py-2.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 text-sm flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Tandai Selesai
                                                    </motion.button>
                                                ) : (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-medium flex items-center gap-2 shadow-lg text-sm"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Selesai</span>
                                                    </motion.div>
                                                )}
                                                
                                                {/* Guide Complete Button */}
                                                {isGuideCompleted ? (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center gap-2 shadow-lg"
                                                    >
                                                        <Trophy className="w-5 h-5" />
                                                        <span>Guide Selesai</span>
                                                    </motion.div>
                                                ) : completionPercentage === 100 && (
                                                    <motion.button
                                                        onClick={handleManualComplete}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-6 py-2.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center gap-2"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                        Selesaikan Guide
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Area with Enhanced Typography */}
                                        <div
                                            ref={contentRef}
                                            className="overflow-y-auto pr-4 custom-scrollbar"
                                            style={{ 
                                                maxHeight: 'calc(100vh - 450px)',
                                                minHeight: '400px',
                                                scrollBehavior: 'smooth' 
                                            }}
                                        >
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="prose prose-lg dark:prose-invert max-w-none"
                                            >
                                                {/* Enhanced Content Display */}
                                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                                                    {activeContent.content.split('\n\n').map((paragraph, idx) => {
                                                        // Check if it's a heading (starts with **)
                                                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                                            const headingText = paragraph.replace(/\*\*/g, '');
                                                            return (
                                                                <motion.h3
                                                                    key={idx}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.1 }}
                                                                    className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-3"
                                                                >
                                                                    <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                                                                    {headingText}
                                                                </motion.h3>
                                                            );
                                                        }
                                                        
                                                        // Check if it's a list item (starts with number or bullet)
                                                        if (paragraph.match(/^\d+\.\s/) || paragraph.startsWith('•') || paragraph.startsWith('-')) {
                                                            const items = paragraph.split('\n').filter(item => item.trim());
                                                            return (
                                                                <motion.ul
                                                                    key={idx}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.1 }}
                                                                    className="space-y-3 my-6"
                                                                >
                                                                    {items.map((item, itemIdx) => {
                                                                        const cleanItem = item.replace(/^[\d+\.\-•]\s*/, '');
                                                                        return (
                                                                            <motion.li
                                                                                key={itemIdx}
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: (idx * 0.1) + (itemIdx * 0.05) }}
                                                                                className="flex items-start gap-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                                                                            >
                                                                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                                                </div>
                                                                                <span className="flex-1 text-gray-700 dark:text-gray-300 leading-relaxed">{cleanItem}</span>
                                                                            </motion.li>
                                                                        );
                                                                    })}
                                                                </motion.ul>
                                                            );
                                                        }
                                                        
                                                        // Regular paragraph
                                                        return (
                                                            <motion.p
                                                                key={idx}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4"
                                                            >
                                                                {paragraph}
                                                            </motion.p>
                                                        );
                                                    })}
                                                </div>

                                                {/* Enhanced Steps Section */}
                                                {activeContent.steps && activeContent.steps.length > 0 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="mt-10 space-y-4"
                                                    >
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                                                <Zap className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Langkah-Langkah</h3>
                                                        </div>
                                                        {activeContent.steps.map((step, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.4 + (index * 0.1) }}
                                                                whileHover={{ scale: 1.02, x: 5 }}
                                                                className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
                                                            >
                                                                {/* Step Number Badge */}
                                                                <div className="absolute -left-4 -top-4">
                                                                    <motion.div
                                                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                                                        transition={{ duration: 0.6 }}
                                                                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-blue-500/50"
                                                                    >
                                                                        <span className="text-white font-bold text-lg">{index + 1}</span>
                                                                    </motion.div>
                                                                </div>
                                                                
                                                                {/* Animated background glow */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                
                                                                <div className="relative z-10 ml-6">
                                                                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                                        {step.title}
                                                                        <motion.div
                                                                            animate={{ x: [0, 5, 0] }}
                                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <ChevronRight className="w-5 h-5 text-blue-500" />
                                                                        </motion.div>
                                                                    </h4>
                                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {/* Enhanced FAQs Section */}
                                                {activeContent.faqs && activeContent.faqs.length > 0 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.5 }}
                                                        className="mt-10 space-y-4"
                                                    >
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                                                <Star className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pertanyaan Umum</h3>
                                                        </div>
                                                        {activeContent.faqs.map((faq, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.6 + (index * 0.1) }}
                                                                whileHover={{ scale: 1.01 }}
                                                                className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                                                            >
                                                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                                                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <span className="text-white text-xs font-bold">Q</span>
                                                                    </div>
                                                                    <span className="flex-1">{faq.question}</span>
                                                                </h4>
                                                                <div className="ml-9 pl-3 border-l-2 border-purple-200 dark:border-purple-800">
                                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            {/* Enhanced Navigation */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7 }}
                                                className="flex items-center justify-between mt-10 pt-8 border-t-2 border-gray-200 dark:border-gray-800"
                                            >
                                                <motion.button
                                                    onClick={() => {
                                                        const currentIndex = guide.sections.findIndex(s => s.id === activeSection);
                                                        if (currentIndex > 0) {
                                                            setActiveSection(guide.sections[currentIndex - 1].id);
                                                        }
                                                    }}
                                                    disabled={guide.sections.findIndex(s => s.id === activeSection) === 0}
                                                    whileHover={{ scale: 1.05, x: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-3 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium flex items-center gap-2"
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                    Previous
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => {
                                                        const currentIndex = guide.sections.findIndex(s => s.id === activeSection);
                                                        if (currentIndex < guide.sections.length - 1) {
                                                            setActiveSection(guide.sections[currentIndex + 1].id);
                                                        }
                                                    }}
                                                    disabled={guide.sections.findIndex(s => s.id === activeSection) === guide.sections.length - 1}
                                                    whileHover={{ scale: 1.05, x: 5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                                                >
                                                    Next
                                                    <ChevronRight className="w-4 h-4" />
                                                </motion.button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DosenLayout>
    );
}
