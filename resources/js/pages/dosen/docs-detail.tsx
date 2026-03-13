import DocumentationIcon from '@/assets/admin/panduan/panduan.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import {
    getOfflineGuideFromCache,
    migrateLegacyOfflineDocsCache,
    removeOfflineGuideFromCache,
    saveOfflineGuideToCache,
} from '@/lib/offline-docs-cache';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Bookmark,
    BookmarkCheck,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    Download,
    Info,
    MessageSquare,
    Star,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    WifiOff,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SectionType = 'text' | 'steps' | 'faq' | 'callout' | string;

interface GuideSection {
    id: string;
    title: string;
    type: SectionType;
    content: string;
    steps?: Array<{ title: string; description: string }>;
    faqs?: Array<{ question: string; answer: string }>;
}

interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple-choice' | string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points?: number;
}

interface Exercise {
    id: string;
    title: string;
    instruction: string;
}

interface GuideDetail {
    id: string;
    title: string;
    description: string;
    slug?: string;
    icon: string;
    category: string;
    difficulty?: number;
    estimatedReadTime: number;
    author?: string;
    tags?: string[];
    sections: GuideSection[];
    quiz?: QuizQuestion[];
    exercises?: Exercise[];
    progress: {
        completed_sections: string[];
        is_completed: boolean;
        completion_percentage: number;
    };
}

interface RelatedGuide {
    id: string;
    title: string;
    category: string;
    progress: number;
    estimatedTime: number;
}

interface Props {
    guide: GuideDetail;
    relatedGuides: RelatedGuide[];
}

interface FeedbackStats {
    helpful_count: number;
    not_helpful_count: number;
    total_ratings: number;
    average_rating: number;
}

const defaultFeedbackStats: FeedbackStats = {
    helpful_count: 0,
    not_helpful_count: 0,
    total_ratings: 0,
    average_rating: 0,
};

const categoryConfig: Record<string, { label: string; badge: string }> = {
    beginner: {
        label: 'Pemula',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    intermediate: {
        label: 'Menengah',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    advanced: {
        label: 'Lanjutan',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    reference: {
        label: 'Referensi',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
};

function getSectionTone(type: SectionType): string {
    if (type === 'callout') {
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/20';
    }

    if (type === 'faq') {
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20';
    }

    if (type === 'steps') {
        return 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20';
    }

    return 'border-white/20 bg-white/60 dark:border-white/10 dark:bg-neutral-900/60';
}

const formatText = (text: string) => {
    if (!text) return text;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong
                    key={index}
                    className="font-bold text-neutral-900 dark:text-white"
                >
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <em
                    key={index}
                    className="text-neutral-800 italic dark:text-neutral-200"
                >
                    {part.slice(1, -1)}
                </em>
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={index}
                    className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
};

export default function DosenDocsDetail({ guide, relatedGuides }: Props) {
    const [activeSectionId, setActiveSectionId] = useState(
        guide.sections[0]?.id ?? '',
    );
    const [completedSections, setCompletedSections] = useState<string[]>(() =>
        Array.from(new Set(guide.progress?.completed_sections ?? [])),
    );
    const [isCompleted, setIsCompleted] = useState<boolean>(
        guide.progress?.is_completed ?? false,
    );
    const [isSaving, setIsSaving] = useState(false);

    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [helpfulVote, setHelpfulVote] = useState<'yes' | 'no' | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [feedbackStats, setFeedbackStats] =
        useState<FeedbackStats>(defaultFeedbackStats);
    const [showFeedbackSavedAnimation, setShowFeedbackSavedAnimation] =
        useState(false);
    const [feedbackSavedAnimationKey, setFeedbackSavedAnimationKey] =
        useState(0);

    const [isFeedbackSaving, setIsFeedbackSaving] = useState(false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
    const [isOfflineLoading, setIsOfflineLoading] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isOfflineSaved, setIsOfflineSaved] = useState(false);
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof window === 'undefined' ? true : window.navigator.onLine,
    );
    const [offlineActionMessage, setOfflineActionMessage] = useState<
        string | null
    >(null);

    const getCsrfToken = () =>
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    // Initial hydration from DB-backed endpoints (bookmark, feedback, offline status).
    useEffect(() => {
        setActiveSectionId(guide.sections[0]?.id ?? '');
        setCompletedSections(
            Array.from(new Set(guide.progress?.completed_sections ?? [])),
        );
        setIsCompleted(Boolean(guide.progress?.is_completed));
        setQuizAnswers({});
        setQuizSubmitted(false);
        setHelpfulVote(null);
        setRating(0);
        setComment('');
        setFeedbackStats(defaultFeedbackStats);
        setShowFeedbackSavedAnimation(false);
        setFeedbackSavedAnimationKey(0);
        setOfflineActionMessage(null);

        const syncConnectionState = () => {
            setIsOnline(window.navigator.onLine);
        };

        window.addEventListener('online', syncConnectionState);
        window.addEventListener('offline', syncConnectionState);

        void (async () => {
            await migrateLegacyOfflineDocsCache();
            await Promise.all([
                loadBookmarkState(),
                loadFeedback(),
                loadOfflineState(),
            ]);
        })();

        return () => {
            window.removeEventListener('online', syncConnectionState);
            window.removeEventListener('offline', syncConnectionState);
        };
    }, [guide.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!showFeedbackSavedAnimation) {
            return;
        }

        const timerId = window.setTimeout(() => {
            setShowFeedbackSavedAnimation(false);
        }, 1600);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [showFeedbackSavedAnimation, feedbackSavedAnimationKey]);

    const completionPercentage = useMemo(() => {
        if (guide.sections.length === 0) return 0;

        return Math.round(
            (completedSections.length / guide.sections.length) * 100,
        );
    }, [completedSections, guide.sections.length]);

    const activeSection = useMemo(
        () =>
            guide.sections.find((section) => section.id === activeSectionId) ??
            guide.sections[0],
        [guide.sections, activeSectionId],
    );

    const currentSectionIndex = useMemo(
        () =>
            guide.sections.findIndex(
                (section) => section.id === activeSection?.id,
            ),
        [guide.sections, activeSection?.id],
    );

    const quizScore = useMemo(() => {
        const quiz = guide.quiz ?? [];
        if (!quiz.length) return 0;

        let total = 0;
        quiz.forEach((question) => {
            const answer = quizAnswers[question.id];
            const correct = Array.isArray(question.correctAnswer)
                ? question.correctAnswer.includes(answer)
                : question.correctAnswer === answer;

            if (correct) {
                total += question.points ?? 10;
            }
        });

        return total;
    }, [guide.quiz, quizAnswers]);

    const maxQuizScore = useMemo(
        () =>
            (guide.quiz ?? []).reduce(
                (sum, item) => sum + (item.points ?? 10),
                0,
            ),
        [guide.quiz],
    );

    const loadBookmarkState = async () => {
        try {
            const response = await fetch('/api/docs/bookmarks', {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json();
            if (!response.ok || !payload?.success) return;

            const bookmarked = (payload.data ?? []).some(
                (item: { guide_id: string }) => item.guide_id === guide.id,
            );
            setIsBookmarked(bookmarked);
        } catch {
            // Ignore transient fetch errors.
        }
    };

    const loadFeedback = async () => {
        try {
            const response = await fetch(`/api/docs/feedback/${guide.id}`, {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json();
            if (!response.ok || !payload?.success) return;

            const myFeedback = payload?.data?.my_feedback;
            const stats = payload?.data?.stats;

            if (typeof myFeedback?.helpful === 'boolean') {
                setHelpfulVote(myFeedback.helpful ? 'yes' : 'no');
            } else {
                setHelpfulVote(null);
            }

            setRating(Number(myFeedback?.rating ?? 0));
            setComment(String(myFeedback?.comment ?? ''));
            setFeedbackStats({
                helpful_count: Number(stats?.helpful_count ?? 0),
                not_helpful_count: Number(stats?.not_helpful_count ?? 0),
                total_ratings: Number(stats?.total_ratings ?? 0),
                average_rating: Number(stats?.average_rating ?? 0),
            });
        } catch {
            // Ignore transient fetch errors.
        }
    };

    const loadOfflineState = async () => {
        try {
            const response = await fetch('/api/docs/offline-downloads', {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json();
            if (!response.ok || !payload?.success) {
                const cached = await getOfflineGuideFromCache(guide.id);
                setIsOfflineSaved(Boolean(cached));
                return;
            }

            const saved = (payload.data ?? []).some(
                (item: { guide_id: string }) => item.guide_id === guide.id,
            );
            if (saved) {
                setIsOfflineSaved(true);
                return;
            }

            const cached = await getOfflineGuideFromCache(guide.id);
            setIsOfflineSaved(Boolean(cached));
        } catch {
            const cached = await getOfflineGuideFromCache(guide.id);
            setIsOfflineSaved(Boolean(cached));
        }
    };

    const toggleBookmark = async () => {
        setIsBookmarkLoading(true);
        try {
            const response = await fetch(`/api/docs/bookmarks/${guide.id}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            const payload = await response.json();
            if (!response.ok || !payload?.success) return;

            setIsBookmarked(Boolean(payload?.data?.bookmarked));
        } finally {
            setIsBookmarkLoading(false);
        }
    };

    const upsertFeedback = async (patch?: {
        helpful?: boolean | null;
        rating?: number | null;
        comment?: string | null;
    }) => {
        if (isFeedbackSaving) {
            return;
        }

        setIsFeedbackSaving(true);
        try {
            const response = await fetch(`/api/docs/feedback/${guide.id}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    helpful:
                        patch?.helpful ??
                        (helpfulVote === 'yes'
                            ? true
                            : helpfulVote === 'no'
                              ? false
                              : null),
                    rating: patch?.rating ?? (rating > 0 ? rating : null),
                    comment:
                        patch?.comment ??
                        (comment.trim() ? comment.trim() : null),
                }),
            });
            const payload = await response.json();
            if (!response.ok || !payload?.success) return;

            const myFeedback = payload?.data?.my_feedback;
            const stats = payload?.data?.stats;

            if (typeof myFeedback?.helpful === 'boolean') {
                setHelpfulVote(myFeedback.helpful ? 'yes' : 'no');
            } else {
                setHelpfulVote(null);
            }

            setRating(Number(myFeedback?.rating ?? 0));
            setComment(String(myFeedback?.comment ?? ''));
            setFeedbackStats({
                helpful_count: Number(stats?.helpful_count ?? 0),
                not_helpful_count: Number(stats?.not_helpful_count ?? 0),
                total_ratings: Number(stats?.total_ratings ?? 0),
                average_rating: Number(stats?.average_rating ?? 0),
            });
            setFeedbackSavedAnimationKey((current) => current + 1);
            setShowFeedbackSavedAnimation(true);
        } finally {
            setIsFeedbackSaving(false);
        }
    };

    const downloadOffline = async () => {
        setIsOfflineLoading(true);
        try {
            const guideResponse = await fetch(`/api/docs/guides/${guide.id}`, {
                headers: { Accept: 'application/json' },
            });
            const guidePayload = await guideResponse.json();
            if (!guideResponse.ok || !guidePayload?.success) return;

            const sizeKb = Math.max(
                1,
                Math.ceil(JSON.stringify(guidePayload.data).length / 1024),
            );
            await saveOfflineGuideToCache({
                guideId: guide.id,
                payload: guidePayload.data,
                title: guide.title,
                version: 'v2',
                sizeKb,
            });

            await fetch(`/api/docs/offline-downloads/${guide.id}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    title: guide.title,
                    version: 'v2',
                    size_kb: sizeKb,
                }),
            });

            setIsOfflineSaved(true);
            setOfflineActionMessage(
                'Dokumentasi berhasil disimpan ke cache offline.',
            );
        } finally {
            setIsOfflineLoading(false);
        }
    };

    const removeOffline = async () => {
        setIsOfflineLoading(true);
        try {
            await removeOfflineGuideFromCache(guide.id);

            await fetch(`/api/docs/offline-downloads/${guide.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            setIsOfflineSaved(false);
            setOfflineActionMessage(
                'Cache offline untuk dokumentasi ini sudah dihapus.',
            );
        } finally {
            setIsOfflineLoading(false);
        }
    };

    const openFromOfflineCache = async () => {
        setIsOfflineLoading(true);
        try {
            const cached = await getOfflineGuideFromCache(guide.id);
            if (
                !cached ||
                typeof cached.payload !== 'object' ||
                cached.payload === null
            ) {
                setOfflineActionMessage(
                    'Cache offline tidak ditemukan untuk materi ini.',
                );
                setIsOfflineSaved(false);
                return;
            }

            const payload = cached.payload as { sections?: unknown };
            if (
                Array.isArray(payload.sections) &&
                payload.sections.length > 0
            ) {
                const firstSection = payload.sections[0];
                if (
                    typeof firstSection === 'object' &&
                    firstSection !== null &&
                    'id' in firstSection &&
                    typeof (firstSection as { id?: unknown }).id === 'string'
                ) {
                    setActiveSectionId((firstSection as { id: string }).id);
                }
            }

            setOfflineActionMessage(
                'Materi berhasil dibuka dari cache offline.',
            );
        } finally {
            setIsOfflineLoading(false);
        }
    };

    const normalizeProgressPayload = (
        responseData: unknown,
        fallbackSections: string[],
    ): { completedSections: string[]; isCompleted: boolean } => {
        const payload =
            typeof responseData === 'object' && responseData !== null
                ? (responseData as Record<string, unknown>)
                : {};

        const rawSections =
            payload.completed_sections ?? payload.completedSections;
        const normalizedSections = Array.isArray(rawSections)
            ? Array.from(
                  new Set(
                      rawSections.filter(
                          (section): section is string =>
                              typeof section === 'string',
                      ),
                  ),
              )
            : fallbackSections;

        const rawIsCompleted = payload.is_completed ?? payload.isCompleted;
        const normalizedIsCompleted =
            typeof rawIsCompleted === 'boolean'
                ? rawIsCompleted
                : normalizedSections.length >= guide.sections.length;

        return {
            completedSections: normalizedSections,
            isCompleted: normalizedIsCompleted,
        };
    };

    const syncProgress = async (
        nextCompletedSections: string[],
    ): Promise<{
        completedSections: string[];
        isCompleted: boolean;
    } | null> => {
        setIsSaving(true);

        try {
            const response = await fetch(`/api/docs/progress/${guide.id}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    completed_sections: nextCompletedSections,
                }),
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.success) {
                return null;
            }

            return normalizeProgressPayload(
                payload?.data,
                nextCompletedSections,
            );
        } finally {
            setIsSaving(false);
        }
    };

    const syncSectionCompletion = async (
        sectionId: string,
        shouldComplete: boolean,
    ) => {
        const previousSections = completedSections;
        const previousCompletedFlag = isCompleted;
        const hasBeenCompleted = previousSections.includes(sectionId);

        if (
            (shouldComplete && hasBeenCompleted) ||
            (!shouldComplete && !hasBeenCompleted)
        ) {
            return;
        }

        const nextCompletedSections = shouldComplete
            ? Array.from(new Set([...previousSections, sectionId]))
            : previousSections.filter((id) => id !== sectionId);

        setCompletedSections(nextCompletedSections);
        const synced = await syncProgress(nextCompletedSections);

        if (!synced) {
            setCompletedSections(previousSections);
            setIsCompleted(previousCompletedFlag);
            return;
        }

        setCompletedSections(synced.completedSections);
        setIsCompleted(synced.isCompleted);
    };

    const handleToggleSection = async (sectionId: string) => {
        const shouldComplete = !completedSections.includes(sectionId);
        await syncSectionCompletion(sectionId, shouldComplete);
    };

    useEffect(() => {
        if (!activeSection?.id) {
            return;
        }

        if (completedSections.includes(activeSection.id)) {
            return;
        }

        const timerId = window.setTimeout(() => {
            void syncSectionCompletion(activeSection.id, true);
        }, 3000);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [activeSection?.id, completedSections]); // eslint-disable-line react-hooks/exhaustive-deps

    const markGuideAsComplete = async () => {
        setIsSaving(true);

        try {
            const response = await fetch(
                `/api/docs/progress/${guide.id}/complete`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                },
            );

            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.success) {
                return;
            }

            const fallbackSections = guide.sections.map((item) => item.id);
            const synced = normalizeProgressPayload(
                payload?.data,
                fallbackSections,
            );

            setCompletedSections(synced.completedSections);
            setIsCompleted(synced.isCompleted);
        } finally {
            setIsSaving(false);
        }
    };

    const submitQuiz = () => {
        setQuizSubmitted(true);
    };

    const category = categoryConfig[guide.category] ?? {
        label: guide.category,
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    };

    return (
        <DosenLayout>
            <Head title={`Dokumentasi • ${guide.title}`} />

            <div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/dosen/docs')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={DocumentationIcon}
                                        alt="Documentation"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>

                                <div className="flex-1">
                                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        <span
                                            className={cn(
                                                'rounded-lg px-2.5 py-1 text-xs font-semibold',
                                                category.badge,
                                            )}
                                        >
                                            {category.label}
                                        </span>
                                        <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                                            Lv.{guide.difficulty ?? 1}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        {guide.title}
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                        {guide.description}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-indigo-100/90 sm:justify-start sm:text-sm">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="h-3.5 w-3.5" />{' '}
                                            {guide.estimatedReadTime} menit
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <BookOpen className="h-3.5 w-3.5" />{' '}
                                            {guide.sections.length} section
                                        </span>
                                        {(guide.quiz?.length ?? 0) > 0 && (
                                            <span className="inline-flex items-center gap-1">
                                                <MessageSquare className="h-3.5 w-3.5" />{' '}
                                                {guide.quiz?.length} quiz
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-2 lg:w-auto lg:items-end">
                                <div className="flex w-full flex-wrap justify-center gap-2 sm:justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isBookmarkLoading}
                                        onClick={() => void toggleBookmark()}
                                        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isBookmarked ? (
                                            <BookmarkCheck className="h-4 w-4" />
                                        ) : (
                                            <Bookmark className="h-4 w-4" />
                                        )}
                                        {isBookmarked ? 'Tersimpan' : 'Simpan'}
                                    </motion.button>

                                    {isOfflineSaved ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isOfflineLoading}
                                            onClick={() => void removeOffline()}
                                            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Trash2 className="h-4 w-4" /> Hapus
                                            Offline
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isOfflineLoading}
                                            onClick={() =>
                                                void downloadOffline()
                                            }
                                            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Download className="h-4 w-4" />{' '}
                                            Download Offline
                                        </motion.button>
                                    )}

                                    {!isOnline && isOfflineSaved && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isOfflineLoading}
                                            onClick={() =>
                                                void openFromOfflineCache()
                                            }
                                            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <WifiOff className="h-4 w-4" /> Buka
                                            dari cache offline
                                        </motion.button>
                                    )}

                                    <div className="w-full rounded-2xl border border-white/10 bg-white/20 px-5 py-3 text-center shadow-lg backdrop-blur-xl sm:w-auto sm:text-left">
                                        <p className="text-xs text-indigo-100">
                                            Progress
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            <AnimatedCounter
                                                value={completionPercentage}
                                                suffix="%"
                                            />
                                        </p>
                                    </div>
                                </div>

                                {offlineActionMessage && (
                                    <p className="max-w-md text-center text-xs text-indigo-100/90 sm:text-right">
                                        {offlineActionMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 xl:col-span-2"
                    >
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Materi Dokumentasi
                                </h2>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {isSaving
                                        ? 'Menyimpan progress...'
                                        : 'Section aktif otomatis selesai setelah 3 detik dibaca'}
                                </div>
                            </div>

                            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {guide.sections.map((section) => {
                                    const sectionDone =
                                        completedSections.includes(section.id);

                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() =>
                                                setActiveSectionId(section.id)
                                            }
                                            className={cn(
                                                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium whitespace-nowrap transition sm:text-sm',
                                                activeSectionId === section.id
                                                    ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg'
                                                    : 'border-white/20 bg-white/60 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-300',
                                            )}
                                        >
                                            {sectionDone && (
                                                <Check className="h-3.5 w-3.5" />
                                            )}
                                            {section.title}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeSection && (
                                <div
                                    className={cn(
                                        'rounded-2xl border p-4 sm:p-5',
                                        getSectionTone(activeSection.type),
                                    )}
                                >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                                {activeSection.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                Jenis konten:{' '}
                                                {activeSection.type}
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleToggleSection(
                                                    activeSection.id,
                                                )
                                            }
                                            variant={
                                                completedSections.includes(
                                                    activeSection.id,
                                                )
                                                    ? 'outline'
                                                    : 'default'
                                            }
                                            className={cn(
                                                'rounded-xl',
                                                completedSections.includes(
                                                    activeSection.id,
                                                )
                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
                                            )}
                                        >
                                            {completedSections.includes(
                                                activeSection.id,
                                            ) ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />{' '}
                                                    Selesai
                                                </>
                                            ) : (
                                                'Tandai Selesai'
                                            )}
                                        </Button>
                                    </div>

                                    <div className="space-y-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                                        {activeSection.content
                                            .split('\n')
                                            .filter(Boolean)
                                            .map((paragraph, idx) => (
                                                <p
                                                    key={`${activeSection.id}-p-${idx}`}
                                                >
                                                    {formatText(paragraph)}
                                                </p>
                                            ))}
                                    </div>

                                    {activeSection.steps &&
                                        activeSection.steps.length > 0 && (
                                            <div className="mt-5 space-y-3">
                                                {activeSection.steps.map(
                                                    (step, index) => (
                                                        <div
                                                            key={`${activeSection.id}-step-${index}`}
                                                            className="rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70"
                                                        >
                                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                Langkah{' '}
                                                                {index + 1}:{' '}
                                                                {formatText(
                                                                    step.title,
                                                                )}
                                                            </p>
                                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                                {formatText(
                                                                    step.description,
                                                                )}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {activeSection.faqs &&
                                        activeSection.faqs.length > 0 && (
                                            <div className="mt-5 space-y-2">
                                                {activeSection.faqs.map(
                                                    (faq, index) => (
                                                        <div
                                                            key={`${activeSection.id}-faq-${index}`}
                                                            className="rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70"
                                                        >
                                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                Q:{' '}
                                                                {formatText(
                                                                    faq.question,
                                                                )}
                                                            </p>
                                                            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                                A:{' '}
                                                                {formatText(
                                                                    faq.answer,
                                                                )}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (currentSectionIndex > 0) {
                                            setActiveSectionId(
                                                guide.sections[
                                                    currentSectionIndex - 1
                                                ].id,
                                            );
                                        }
                                    }}
                                    disabled={currentSectionIndex <= 0}
                                    className="rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70"
                                >
                                    <ChevronLeft className="h-4 w-4" />{' '}
                                    Sebelumnya
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (
                                            currentSectionIndex <
                                            guide.sections.length - 1
                                        ) {
                                            setActiveSectionId(
                                                guide.sections[
                                                    currentSectionIndex + 1
                                                ].id,
                                            );
                                        }
                                    }}
                                    disabled={
                                        currentSectionIndex >=
                                        guide.sections.length - 1
                                    }
                                    className="rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70"
                                >
                                    Selanjutnya{' '}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {(guide.quiz?.length ?? 0) > 0 && (
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 text-white shadow-lg">
                                        <Info className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            Quiz Pemahaman
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {guide.quiz?.length} pertanyaan
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(guide.quiz ?? []).map(
                                        (question, index) => {
                                            const selected =
                                                quizAnswers[question.id];
                                            const correctAnswer = Array.isArray(
                                                question.correctAnswer,
                                            )
                                                ? question.correctAnswer
                                                : [question.correctAnswer];

                                            return (
                                                <div
                                                    key={question.id}
                                                    className="rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-900/70"
                                                >
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        {index + 1}.{' '}
                                                        {question.question}
                                                    </p>

                                                    <div className="mt-3 space-y-2">
                                                        {(
                                                            question.options ??
                                                            []
                                                        ).map((option) => {
                                                            const isSelected =
                                                                selected ===
                                                                option;
                                                            const isCorrect =
                                                                correctAnswer.includes(
                                                                    option,
                                                                );

                                                            return (
                                                                <button
                                                                    key={option}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setQuizAnswers(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [question.id]:
                                                                                    option,
                                                                            }),
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
                                                                        isSelected
                                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                                                                            : 'border-white/20 bg-white dark:border-white/10 dark:bg-neutral-900',
                                                                        quizSubmitted &&
                                                                            isCorrect &&
                                                                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                                                                        quizSubmitted &&
                                                                            isSelected &&
                                                                            !isCorrect &&
                                                                            'border-red-500 bg-red-50 dark:bg-red-950/30',
                                                                    )}
                                                                >
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {quizSubmitted &&
                                                        question.explanation && (
                                                            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
                                                                {
                                                                    question.explanation
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <Button
                                        type="button"
                                        onClick={submitQuiz}
                                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                    >
                                        Submit Quiz
                                    </Button>

                                    {quizSubmitted && (
                                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                                            Skor:{' '}
                                            <AnimatedCounter
                                                value={quizScore}
                                            />
                                            /{maxQuizScore}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(guide.exercises?.length ?? 0) > 0 && (
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            Latihan
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Praktikkan materi agar lebih melekat
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {(guide.exercises ?? []).map(
                                        (exercise, index) => (
                                            <div
                                                key={exercise.id}
                                                className="rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70"
                                            >
                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {index + 1}.{' '}
                                                    {exercise.title}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                    {exercise.instruction}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="space-y-4"
                    >
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Progress Materi
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                {completedSections.length}/
                                {guide.sections.length} section selesai
                            </p>

                            <div className="mt-3">
                                <Progress
                                    value={completionPercentage}
                                    className="h-2 bg-neutral-200/80 dark:bg-neutral-700"
                                    indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-600"
                                />
                            </div>

                            <div className="mt-4 space-y-2">
                                {guide.sections.map((section) => {
                                    const done = completedSections.includes(
                                        section.id,
                                    );
                                    return (
                                        <div
                                            key={section.id}
                                            className="flex items-center justify-between rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-xs dark:border-white/10 dark:bg-neutral-900/70"
                                        >
                                            <span className="line-clamp-1 text-neutral-700 dark:text-neutral-300">
                                                {section.title}
                                            </span>
                                            {done ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <div className="h-3 w-3 rounded-full border border-neutral-400" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                type="button"
                                onClick={markGuideAsComplete}
                                disabled={isSaving || isCompleted}
                                className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                            >
                                {isCompleted
                                    ? 'Guide Selesai'
                                    : 'Tandai Guide Selesai'}
                            </Button>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Feedback Cepat
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Apakah materi ini membantu?
                            </p>

                            <div className="mt-3 rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70">
                                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>Helpful</span>
                                    <span>
                                        {feedbackStats.helpful_count} ya •{' '}
                                        {feedbackStats.not_helpful_count} tidak
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>Rating</span>
                                    <span>
                                        {feedbackStats.average_rating.toFixed(
                                            1,
                                        )}{' '}
                                        / 5 ({feedbackStats.total_ratings})
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isFeedbackSaving}
                                    onClick={() =>
                                        void upsertFeedback({ helpful: true })
                                    }
                                    className={cn(
                                        'rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70',
                                        helpfulVote === 'yes' &&
                                            'border-emerald-500 text-emerald-600 dark:text-emerald-400',
                                    )}
                                >
                                    <ThumbsUp className="h-4 w-4" /> Ya
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isFeedbackSaving}
                                    onClick={() =>
                                        void upsertFeedback({ helpful: false })
                                    }
                                    className={cn(
                                        'rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70',
                                        helpfulVote === 'no' &&
                                            'border-red-500 text-red-600 dark:text-red-400',
                                    )}
                                >
                                    <ThumbsDown className="h-4 w-4" /> Tidak
                                </Button>
                            </div>

                            <div className="mt-3">
                                <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                    Rating materi
                                </p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            disabled={isFeedbackSaving}
                                            onClick={() =>
                                                void upsertFeedback({
                                                    rating: level,
                                                })
                                            }
                                            className="rounded-md p-1 transition hover:bg-white dark:hover:bg-neutral-800"
                                        >
                                            <Star
                                                className={cn(
                                                    'h-5 w-5',
                                                    level <= rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-neutral-300 dark:text-neutral-600',
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-3">
                                <Textarea
                                    value={comment}
                                    onChange={(event) =>
                                        setComment(event.target.value)
                                    }
                                    onBlur={() =>
                                        void upsertFeedback({
                                            comment: comment.trim()
                                                ? comment.trim()
                                                : null,
                                        })
                                    }
                                    placeholder="Tulis masukan singkat (opsional)"
                                    className="min-h-[90px] rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={() => void upsertFeedback()}
                                disabled={isFeedbackSaving}
                                className="mt-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                            >
                                {isFeedbackSaving
                                    ? 'Menyimpan...'
                                    : 'Simpan Feedback'}
                            </Button>

                            <AnimatePresence mode="wait">
                                {showFeedbackSavedAnimation && (
                                    <motion.div
                                        key={feedbackSavedAnimationKey}
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                            scale: 0.96,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.98,
                                        }}
                                        transition={{
                                            duration: 0.24,
                                            ease: 'easeOut',
                                        }}
                                        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Feedback tersimpan
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {relatedGuides.length > 0 && (
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Materi Terkait
                                </h3>
                                <div className="mt-3 space-y-2">
                                    {relatedGuides.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                router.visit(
                                                    `/dosen/docs/${item.id}`,
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/70 p-3 text-left transition hover:bg-white dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900"
                                        >
                                            <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                {item.estimatedTime} menit •{' '}
                                                {item.progress}% progress
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DosenLayout>
    );
}
