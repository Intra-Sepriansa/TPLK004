/**
 * Dosen Documentation Detail Page
 * Menampilkan detail guide dengan sections dan progress tracking
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
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import DarkContainer from '@/components/ui/dark-container';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { fadeInVariants, slideUpVariants } from '@/lib/animations';
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
            
            if (maxScroll <= 10) {
                // Content fits in viewport or very close
                progress = 100;
            } else {
                // Calculate scroll percentage
                progress = Math.round((scrollTop / maxScroll) * 100);
            }
            
            setScrollProgress(Math.min(progress, 100));

            // Auto-complete when scrolled to 90% or more
            if (progress >= 90 && !completedSections.includes(activeSection) && !hasAutoCompleted.current) {
                hasAutoCompleted.current = true;
                setTimeout(() => {
                    handleSectionComplete(activeSection, true);
                }, 500); // Small delay to ensure smooth UX
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
        setTimeout(() => {
            if (contentRef.current) {
                const element = contentRef.current;
                const scrollHeight = element.scrollHeight;
                const clientHeight = element.clientHeight;
                
                // If content fits in viewport, auto-complete after 3 seconds of viewing
                if (scrollHeight - clientHeight <= 10 && !completedSections.includes(activeSection)) {
                    setTimeout(() => {
                        if (!hasAutoCompleted.current && !completedSections.includes(activeSection)) {
                            hasAutoCompleted.current = true;
                            handleSectionComplete(activeSection, true);
                        }
                    }, 3000);
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
                    router.visit('/user/docs');
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
        router.visit('/user/docs');
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
                {/* Header */}
                <motion.div
                    variants={fadeInVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 text-emerald-500" />
                            <span>Back to Documentation</span>
                        </button>

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{guide.title}</h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{guide.description}</p>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                        <span className="font-medium">{guide.estimatedReadTime} min read</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-teal-500" />
                                        <span className="font-medium">{guide.sections.length} sections</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-purple-500" />
                                        <span className="font-medium">{completionPercentage}% complete</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Circle */}
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-white/10"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                                        className="transition-all duration-500"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{completionPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Sections List */}
                    <motion.div
                        variants={slideUpVariants}
                        initial="hidden"
                        animate="visible"
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
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
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
                        variants={fadeInVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-3"
                    >
                        <DarkContainer variant="primary" padding="lg" rounded="xl">
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
                                                        <div className="h-1.5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${scrollProgress}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        </div>
                                                        <span>{scrollProgress}% read</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isGuideCompleted ? (
                                                <div className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold flex items-center gap-2 flex-shrink-0 shadow-lg">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Selesai</span>
                                                </div>
                                            ) : completionPercentage === 100 ? (
                                                <button
                                                    onClick={handleManualComplete}
                                                    className="px-6 py-2 rounded-xl transition-all duration-300 flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Tandai Selesai
                                                    </span>
                                                </button>
                                            ) : (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 font-medium">
                                                    {completionPercentage}% Complete
                                                </div>
                                            )}
                                        </div>

                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {activeContent.content}
                                            </p>

                                            {/* Steps */}
                                            {activeContent.steps && activeContent.steps.length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Steps</h3>
                                                    {activeContent.steps.map((step, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
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
                        </DarkContainer>
                    </motion.div>
                </div>
            </div>
        </DosenLayout>
    );
}
