/**
 * Student Documentation Detail Page
 * Menampilkan detail guide dengan sections dan progress tracking
 */

import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    BookOpen,
    ChevronRight,
    Award,
    type LucideIcon
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import DarkContainer from '@/components/ui/dark-container';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { fadeInVariants, slideUpVariants } from '@/lib/animations';

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

export default function StudentDocsDetail({ guideId }: { guideId: string }) {
    const [guide, setGuide] = useState<GuideDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('');
    const [completedSections, setCompletedSections] = useState<string[]>([]);

    useEffect(() => {
        loadGuideDetail();
    }, [guideId]);

    const loadGuideDetail = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/docs/guides/${guideId}?role=mahasiswa`);
            const data = await response.json();
            
            if (data.success) {
                setGuide(data.data);
                setCompletedSections(data.data.progress?.completed_sections || []);
                setActiveSection(data.data.sections[0]?.id || '');
            }
        } catch (error) {
            console.error('Failed to load guide:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSectionComplete = async (sectionId: string) => {
        const newCompleted = completedSections.includes(sectionId)
            ? completedSections.filter(id => id !== sectionId)
            : [...completedSections, sectionId];

        setCompletedSections(newCompleted);

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

    const handleBack = () => {
        router.visit('/user/docs');
    };

    if (isLoading) {
        return (
            <StudentLayout>
                <Head title="Loading..." />
                <div className="space-y-6 p-6">
                    <SkeletonGrid count={4} columns={1} />
                </div>
            </StudentLayout>
        );
    }

    if (!guide) {
        return (
            <StudentLayout>
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
            </StudentLayout>
        );
    }

    const activeContent = guide.sections.find(s => s.id === activeSection);
    const completionPercentage = Math.round((completedSections.length / guide.sections.length) * 100);

    return (
        <StudentLayout>
            <Head title={guide.title} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <motion.div
                    variants={fadeInVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <DarkContainer variant="secondary" padding="lg" rounded="xl">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Documentation</span>
                        </button>

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2">{guide.title}</h1>
                                <p className="text-white/70 mb-4">{guide.description}</p>
                                
                                <div className="flex items-center gap-6 text-sm text-white/60">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{guide.estimatedReadTime} min read</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{guide.sections.length} sections</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        <span>{completionPercentage}% complete</span>
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
                                    <span className="text-xl font-bold text-white">{completionPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </DarkContainer>
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
                        <DarkContainer variant="secondary" padding="md" rounded="xl" className="sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4">Sections</h3>
                            <div className="space-y-2">
                                {guide.sections.map((section, index) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                                            activeSection === section.id
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                                : 'glass border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {completedSections.includes(section.id) ? (
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                                                )}
                                                <span className="text-sm font-medium">{section.title}</span>
                                            </div>
                                            {activeSection === section.id && (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </DarkContainer>
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
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold text-white">{activeContent.title}</h2>
                                            <button
                                                onClick={() => handleSectionComplete(activeContent.id)}
                                                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                                    completedSections.includes(activeContent.id)
                                                        ? 'bg-green-600 text-white'
                                                        : 'glass border border-white/20 text-white hover:border-green-500'
                                                }`}
                                            >
                                                {completedSections.includes(activeContent.id) ? (
                                                    <span className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Completed
                                                    </span>
                                                ) : (
                                                    'Mark as Complete'
                                                )}
                                            </button>
                                        </div>

                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                                                {activeContent.content}
                                            </p>

                                            {/* Steps */}
                                            {activeContent.steps && activeContent.steps.length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    <h3 className="text-xl font-bold text-white">Steps</h3>
                                                    {activeContent.steps.map((step, index) => (
                                                        <div key={index} className="glass border border-white/10 rounded-lg p-4">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-white font-bold">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-white mb-1">{step.title}</h4>
                                                                    <p className="text-white/70 text-sm">{step.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* FAQs */}
                                            {activeContent.faqs && activeContent.faqs.length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
                                                    {activeContent.faqs.map((faq, index) => (
                                                        <div key={index} className="glass border border-white/10 rounded-lg p-4">
                                                            <h4 className="font-bold text-white mb-2">{faq.question}</h4>
                                                            <p className="text-white/70">{faq.answer}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                                            <button
                                                onClick={() => {
                                                    const currentIndex = guide.sections.findIndex(s => s.id === activeSection);
                                                    if (currentIndex > 0) {
                                                        setActiveSection(guide.sections[currentIndex - 1].id);
                                                    }
                                                }}
                                                disabled={guide.sections.findIndex(s => s.id === activeSection) === 0}
                                                className="px-4 py-2 rounded-lg glass border border-white/20 text-white hover:border-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                className="px-4 py-2 rounded-lg glass border border-white/20 text-white hover:border-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </StudentLayout>
    );
}
