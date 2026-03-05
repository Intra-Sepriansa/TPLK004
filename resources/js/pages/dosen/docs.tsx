import AnalyticsLateIcon from '@/assets/admin/analytics/terlambat.png';
import DashboardHadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import InformationTaskIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import LeaderboardIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import LeaderboardAverageIcon from '@/assets/admin/leaderboard/rata-rata.png';
import DocumentationIcon from '@/assets/admin/panduan/panduan.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DosenLayout from '@/layouts/dosen-layout';
import {
    getAllOfflineGuidesFromCache,
    getOfflineGuideFromCache,
    migrateLegacyOfflineDocsCache,
    removeOfflineGuideFromCache,
    saveOfflineGuideToCache,
    type OfflineGuideCacheRecord,
} from '@/lib/offline-docs-cache';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Bookmark,
    BookmarkCheck,
    ChevronRight,
    Clock3,
    Download,
    Filter,
    Flame,
    GitBranch,
    LifeBuoy,
    Search,
    Trash2,
    Trophy,
    WifiOff,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type CategoryKey =
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'reference'
    | string;

interface GuideSummary {
    id: string;
    menuKey: string;
    title: string;
    description: string;
    icon: string;
    category: CategoryKey;
    slug?: string;
    difficulty?: number;
    tags?: string[];
    estimatedTime: number;
    sectionCount?: number;
    quizCount?: number;
    progress: number;
    isCompleted: boolean;
    lastReadAt?: string | null;
}

interface DocumentationStats {
    totalGuides: number;
    completedGuides: number;
    inProgressGuides: number;
    overallProgress: number;
}

interface Props {
    guides: GuideSummary[];
    stats: DocumentationStats;
    categories: string[];
}

interface OfflineDownload {
    guide_id: string;
    title: string | null;
    version: string | null;
    size_kb: number | null;
    downloaded_at: string | null;
    updated_at: string | null;
}

interface OfflineViewerGuideSection {
    id: string;
    title: string;
    content: string;
}

interface OfflineViewerGuide {
    id: string;
    title: string;
    description?: string;
    estimatedReadTime?: number;
    sections: OfflineViewerGuideSection[];
}

const categoryConfig: Record<
    string,
    {
        label: string;
        cardGradient: string;
        badge: string;
        iconAsset: string;
    }
> = {
    beginner: {
        label: 'Pemula',
        cardGradient: 'from-emerald-400 to-teal-600',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        iconAsset: DashboardHadirIcon,
    },
    intermediate: {
        label: 'Menengah',
        cardGradient: 'from-blue-400 to-indigo-600',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        iconAsset: LeaderboardAverageIcon,
    },
    advanced: {
        label: 'Lanjutan',
        cardGradient: 'from-purple-400 to-pink-600',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        iconAsset: LeaderboardIcon,
    },
    reference: {
        label: 'Referensi',
        cardGradient: 'from-amber-400 to-orange-600',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        iconAsset: InformationTaskIcon,
    },
};

function getDifficultyLabel(value: number): string {
    if (value <= 1) return 'Sangat Mudah';
    if (value === 2) return 'Mudah';
    if (value === 3) return 'Menengah';
    if (value === 4) return 'Sulit';
    return 'Lanjutan';
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

export default function DosenDocs({ guides, stats, categories }: Props) {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState<
        'popular' | 'recent' | 'difficulty' | 'title'
    >('popular');
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [offlineDownloads, setOfflineDownloads] = useState<OfflineDownload[]>(
        [],
    );
    const [offlineCacheRecords, setOfflineCacheRecords] = useState<
        OfflineGuideCacheRecord[]
    >([]);
    const [offlineViewerGuide, setOfflineViewerGuide] =
        useState<OfflineViewerGuide | null>(null);
    const [offlineViewerLoadingGuideId, setOfflineViewerLoadingGuideId] =
        useState<string | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof window === 'undefined' ? true : window.navigator.onLine,
    );
    const [bookmarkLoadingGuideId, setBookmarkLoadingGuideId] = useState<
        string | null
    >(null);
    const [offlineLoadingGuideId, setOfflineLoadingGuideId] = useState<
        string | null
    >(null);

    const getCsrfToken = () =>
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    useEffect(() => {
        const syncConnectionState = () => {
            setIsOnline(window.navigator.onLine);
        };

        window.addEventListener('online', syncConnectionState);
        window.addEventListener('offline', syncConnectionState);

        void (async () => {
            await migrateLegacyOfflineDocsCache();
            await Promise.all([
                loadBookmarks(),
                loadOfflineDownloads(),
                loadOfflineCacheIndex(),
            ]);
        })();

        return () => {
            window.removeEventListener('online', syncConnectionState);
            window.removeEventListener('offline', syncConnectionState);
        };
    }, []);

    const loadBookmarks = async () => {
        try {
            const response = await fetch('/api/docs/bookmarks', {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json();

            if (!response.ok || !payload?.success) return;

            const guideIds = (payload.data ?? []).map(
                (item: { guide_id: string }) => item.guide_id,
            );
            setBookmarks(guideIds);
        } catch {
            // Ignore transient fetch errors, keep UI usable.
        }
    };

    const loadOfflineDownloads = async () => {
        try {
            const response = await fetch('/api/docs/offline-downloads', {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json();

            if (!response.ok || !payload?.success) return;

            setOfflineDownloads(payload.data ?? []);
        } catch {
            // Ignore transient fetch errors, keep UI usable.
        }
    };

    const loadOfflineCacheIndex = async () => {
        try {
            const cachedGuides = await getAllOfflineGuidesFromCache();
            setOfflineCacheRecords(cachedGuides);
        } catch {
            // Ignore local cache read errors.
        }
    };

    const toOfflineViewerGuide = (
        payload: unknown,
    ): OfflineViewerGuide | null => {
        if (typeof payload !== 'object' || payload === null) return null;

        const data = payload as {
            id?: unknown;
            title?: unknown;
            description?: unknown;
            estimatedReadTime?: unknown;
            sections?: unknown;
        };

        if (typeof data.id !== 'string' || typeof data.title !== 'string')
            return null;

        const sections = Array.isArray(data.sections)
            ? data.sections
                  .map((section, index) => {
                      if (typeof section !== 'object' || section === null)
                          return null;

                      const parsedSection = section as {
                          id?: unknown;
                          title?: unknown;
                          content?: unknown;
                      };

                      const title =
                          typeof parsedSection.title === 'string'
                              ? parsedSection.title
                              : `Section ${index + 1}`;
                      const content =
                          typeof parsedSection.content === 'string'
                              ? parsedSection.content
                              : '';

                      return {
                          id:
                              typeof parsedSection.id === 'string'
                                  ? parsedSection.id
                                  : `offline-section-${index + 1}`,
                          title,
                          content,
                      };
                  })
                  .filter(
                      (section): section is OfflineViewerGuideSection =>
                          section !== null,
                  )
            : [];

        return {
            id: data.id,
            title: data.title,
            description:
                typeof data.description === 'string'
                    ? data.description
                    : undefined,
            estimatedReadTime:
                typeof data.estimatedReadTime === 'number'
                    ? data.estimatedReadTime
                    : undefined,
            sections,
        };
    };

    const openGuideFromOfflineCache = async (guideId: string) => {
        setOfflineViewerLoadingGuideId(guideId);
        try {
            const cached = await getOfflineGuideFromCache(guideId);
            const parsed = toOfflineViewerGuide(cached?.payload ?? null);
            if (!parsed) return;
            setOfflineViewerGuide(parsed);
        } finally {
            setOfflineViewerLoadingGuideId(null);
        }
    };

    const suggestions = useMemo(() => {
        if (query.trim().length < 2) return [];

        const lowerQuery = query.toLowerCase();
        return guides
            .filter((guide) => {
                const searchable = [
                    guide.title,
                    guide.description,
                    ...(guide.tags ?? []),
                ]
                    .join(' ')
                    .toLowerCase();
                return searchable.includes(lowerQuery);
            })
            .slice(0, 5)
            .map((guide) => guide.title);
    }, [guides, query]);

    const filteredGuides = useMemo(() => {
        let results = [...guides];

        if (selectedCategory !== 'all') {
            results = results.filter(
                (guide) => guide.category === selectedCategory,
            );
        }

        if (selectedDifficulty !== 'all') {
            results = results.filter(
                (guide) => String(guide.difficulty ?? 1) === selectedDifficulty,
            );
        }

        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            results = results.filter((guide) => {
                const searchable = [
                    guide.title,
                    guide.description,
                    ...(guide.tags ?? []),
                ]
                    .join(' ')
                    .toLowerCase();
                return searchable.includes(lowerQuery);
            });
        }

        if (sortBy === 'recent') {
            results.sort((a, b) =>
                (b.lastReadAt ?? '').localeCompare(a.lastReadAt ?? ''),
            );
        } else if (sortBy === 'difficulty') {
            results.sort((a, b) => (b.difficulty ?? 1) - (a.difficulty ?? 1));
        } else if (sortBy === 'title') {
            results.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            results.sort((a, b) => b.progress - a.progress);
        }

        return results;
    }, [guides, selectedCategory, selectedDifficulty, query, sortBy]);

    const learningPath = useMemo(() => {
        const steps = [...guides]
            .sort((a, b) => (a.difficulty ?? 1) - (b.difficulty ?? 1))
            .slice(0, 6);

        return steps.map((guide, index) => {
            const previous = steps[index - 1];
            const unlocked = index === 0 || Boolean(previous?.isCompleted);

            return {
                ...guide,
                unlocked,
            };
        });
    }, [guides]);

    const learningPathProgress = learningPath.length
        ? Math.round(
              (learningPath.filter((step) => step.isCompleted).length /
                  learningPath.length) *
                  100,
          )
        : 0;

    const offlineGuideIds = useMemo(
        () =>
            new Set([
                ...offlineDownloads.map((item) => item.guide_id),
                ...offlineCacheRecords.map((item) => item.guideId),
            ]),
        [offlineDownloads, offlineCacheRecords],
    );

    const offlineEntries = useMemo(() => {
        const items = new Map<
            string,
            {
                guide_id: string;
                title: string | null;
                size_kb: number | null;
            }
        >();

        offlineDownloads.forEach((item) => {
            items.set(item.guide_id, {
                guide_id: item.guide_id,
                title: item.title,
                size_kb: item.size_kb,
            });
        });

        offlineCacheRecords.forEach((item) => {
            if (items.has(item.guideId)) return;
            items.set(item.guideId, {
                guide_id: item.guideId,
                title: item.title,
                size_kb: item.sizeKb,
            });
        });

        return Array.from(items.values());
    }, [offlineDownloads, offlineCacheRecords]);

    const toggleBookmark = async (guideId: string) => {
        setBookmarkLoadingGuideId(guideId);

        try {
            const response = await fetch(`/api/docs/bookmarks/${guideId}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            const payload = await response.json();

            if (!response.ok || !payload?.success) return;

            const bookmarked = Boolean(payload?.data?.bookmarked);
            setBookmarks((prev) =>
                bookmarked
                    ? Array.from(new Set([...prev, guideId]))
                    : prev.filter((id) => id !== guideId),
            );
        } finally {
            setBookmarkLoadingGuideId(null);
        }
    };

    const downloadGuideOffline = async (guide: GuideSummary) => {
        setOfflineLoadingGuideId(guide.id);

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

            await Promise.all([
                loadOfflineDownloads(),
                loadOfflineCacheIndex(),
            ]);
        } finally {
            setOfflineLoadingGuideId(null);
        }
    };

    const removeGuideOffline = async (guideId: string) => {
        setOfflineLoadingGuideId(guideId);

        try {
            await removeOfflineGuideFromCache(guideId);

            await fetch(`/api/docs/offline-downloads/${guideId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            await Promise.all([
                loadOfflineDownloads(),
                loadOfflineCacheIndex(),
            ]);
        } finally {
            setOfflineLoadingGuideId(null);
        }
    };

    return (
        <DosenLayout>
            <Head title="Documentation Hub" />

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
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Pusat Pembelajaran
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Documentation Hub
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Panduan lengkap dan tutorial untuk
                                        memaksimalkan penggunaan sistem
                                        mahasiswa.
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-3 shadow-lg backdrop-blur-xl sm:w-auto sm:px-6"
                            >
                                <div>
                                    <p className="text-xs text-indigo-100">
                                        Progress Belajar
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        <AnimatedCounter
                                            value={stats.overallProgress}
                                            suffix="%"
                                        />
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {[
                        {
                            label: 'Total Materi',
                            value: stats.totalGuides,
                            iconAsset: DocumentationIcon,
                            color: 'from-indigo-400 to-purple-600',
                        },
                        {
                            label: 'Selesai',
                            value: stats.completedGuides,
                            iconAsset: DashboardHadirIcon,
                            color: 'from-emerald-400 to-teal-600',
                        },
                        {
                            label: 'Dipelajari',
                            value: stats.inProgressGuides,
                            iconAsset: LeaderboardAverageIcon,
                            color: 'from-amber-400 to-orange-600',
                        },
                        {
                            label: 'Progress',
                            value: stats.overallProgress,
                            suffix: '%',
                            iconAsset: AnalyticsLateIcon,
                            color: 'from-amber-400 to-orange-600',
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                delay: 0.1 + index * 0.05,
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-[0.07]`}
                            />
                            <div className="relative flex items-center gap-3">
                                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                                    <img
                                        src={item.iconAsset}
                                        alt={item.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)]"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                                        {item.label}
                                    </p>
                                    <p className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                        <AnimatedCounter
                                            value={item.value}
                                            suffix={item.suffix ?? ''}
                                        />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.button
                    type="button"
                    onClick={() => router.visit('/dosen/dokumentasi-uml')}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.18,
                        type: 'spring',
                        stiffness: 260,
                        damping: 24,
                    }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="group relative w-full overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-5 text-left shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/50"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-purple-500/8 to-pink-500/8" />
                    <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl transition-all group-hover:bg-purple-500/25" />

                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 text-white shadow-lg shadow-indigo-500/30">
                                <GitBranch className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-300">
                                    ADD-ON BARU
                                </p>
                                <h3 className="mt-0.5 text-xl font-bold text-neutral-900 dark:text-white">
                                    Dokumentasi UML Dosen
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
                                    Activity Eksisting, Use Case, Activity Baru,
                                    Sequence, dan Class Diagram per menu dosen
                                    dengan viewer interaktif dan penjelasan
                                    arsitektur detail.
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition group-hover:border-indigo-300 group-hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:group-hover:bg-indigo-900/40">
                            Buka Dokumentasi UML
                            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Filter className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Cari Dokumentasi
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Pencarian cepat berdasarkan judul, tag, dan
                                kategori
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari dokumentasi, tutorial, atau panduan..."
                            className="h-11 rounded-xl border-white/20 bg-white/70 pl-10 dark:border-white/10 dark:bg-neutral-900/60"
                        />
                    </div>

                    {suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setQuery(suggestion)}
                                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="h-10 rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Kategori
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {categoryConfig[category]?.label ??
                                            category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={selectedDifficulty}
                            onValueChange={setSelectedDifficulty}
                        >
                            <SelectTrigger className="h-10 rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60">
                                <SelectValue placeholder="Tingkat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Tingkat
                                </SelectItem>
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <SelectItem
                                        key={level}
                                        value={String(level)}
                                    >
                                        {getDifficultyLabel(level)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={sortBy}
                            onValueChange={(value) =>
                                setSortBy(value as typeof sortBy)
                            }
                        >
                            <SelectTrigger className="h-10 rounded-xl border-white/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/60">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">
                                    Progress Tertinggi
                                </SelectItem>
                                <SelectItem value="recent">
                                    Terakhir Diakses
                                </SelectItem>
                                <SelectItem value="difficulty">
                                    Tingkat Kesulitan
                                </SelectItem>
                                <SelectItem value="title">Judul A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Daftar Dokumentasi
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {filteredGuides.length} materi tersedia
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/20 bg-white/60 px-3 py-1 text-xs text-neutral-500 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-300">
                                Bookmark: {bookmarks.length}
                            </div>
                        </div>

                        {filteredGuides.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/40 p-8 text-center dark:border-white/10 dark:bg-neutral-900/40">
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                                    Tidak ada dokumentasi yang cocok.
                                </p>
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                    Coba ubah kata kunci atau filter.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredGuides.map((guide, index) => {
                                    const category = categoryConfig[
                                        guide.category
                                    ] ?? {
                                        label: guide.category,
                                        cardGradient:
                                            'from-indigo-400 to-purple-600',
                                        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
                                        iconAsset: DocumentationIcon,
                                    };
                                    const isBookmarked = bookmarks.includes(
                                        guide.id,
                                    );

                                    return (
                                        <motion.div
                                            key={guide.id}
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            transition={{
                                                delay: 0.05 * index,
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                            whileHover={{
                                                scale: 1.04,
                                                y: -4,
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 15,
                                                },
                                            }}
                                            onClick={() => {
                                                if (!isOnline) {
                                                    if (
                                                        offlineGuideIds.has(
                                                            guide.id,
                                                        )
                                                    ) {
                                                        void openGuideFromOfflineCache(
                                                            guide.id,
                                                        );
                                                    }
                                                    return;
                                                }
                                                router.visit(
                                                    `/dosen/docs/${guide.id}`,
                                                );
                                            }}
                                            className="group cursor-pointer rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-2">
                                                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                                                    <img
                                                        src={category.iconAsset}
                                                        alt={category.label}
                                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)]"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            bookmarkLoadingGuideId ===
                                                            guide.id
                                                        }
                                                        className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/70 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            void toggleBookmark(
                                                                guide.id,
                                                            );
                                                        }}
                                                        aria-label={
                                                            isBookmarked
                                                                ? 'Hapus bookmark'
                                                                : 'Tambah bookmark'
                                                        }
                                                    >
                                                        {isBookmarked ? (
                                                            <BookmarkCheck className="h-4 w-4" />
                                                        ) : (
                                                            <Bookmark className="h-4 w-4" />
                                                        )}
                                                    </button>

                                                    {offlineGuideIds.has(
                                                        guide.id,
                                                    ) ? (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                offlineLoadingGuideId ===
                                                                guide.id
                                                            }
                                                            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/70 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();
                                                                void removeGuideOffline(
                                                                    guide.id,
                                                                );
                                                            }}
                                                            aria-label="Hapus offline"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                offlineLoadingGuideId ===
                                                                guide.id
                                                            }
                                                            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/70 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();
                                                                void downloadGuideOffline(
                                                                    guide,
                                                                );
                                                            }}
                                                            aria-label="Download offline"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'rounded-lg px-2.5 py-1 text-[10px] font-semibold sm:text-xs',
                                                        category.badge,
                                                    )}
                                                >
                                                    {category.label}
                                                </span>
                                                <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-600 sm:text-xs dark:bg-neutral-800 dark:text-neutral-300">
                                                    Lv.{guide.difficulty ?? 1}
                                                </span>
                                            </div>

                                            <h3 className="line-clamp-2 text-base font-bold text-neutral-900 dark:text-white">
                                                {guide.title}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                {guide.description}
                                            </p>

                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                                    <span>Progress</span>
                                                    <span>
                                                        {guide.progress}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={guide.progress}
                                                    className="h-2 bg-neutral-200/80 dark:bg-neutral-700"
                                                    indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-600"
                                                />
                                            </div>

                                            <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock3 className="h-3.5 w-3.5" />{' '}
                                                    {guide.estimatedTime} menit
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <BookOpen className="h-3.5 w-3.5" />{' '}
                                                    {guide.sectionCount ?? 0}{' '}
                                                    section
                                                </span>
                                            </div>

                                            <div className="mt-3 inline-flex items-center text-sm font-semibold text-indigo-600 transition group-hover:translate-x-1 dark:text-indigo-400">
                                                {isOnline ? (
                                                    <>
                                                        Buka detail{' '}
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Mode offline aktif{' '}
                                                        <WifiOff className="ml-1 h-4 w-4" />
                                                    </>
                                                )}
                                            </div>

                                            {!isOnline &&
                                                offlineGuideIds.has(
                                                    guide.id,
                                                ) && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            offlineViewerLoadingGuideId ===
                                                            guide.id
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            void openGuideFromOfflineCache(
                                                                guide.id,
                                                            );
                                                        }}
                                                        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        Buka dari cache offline
                                                    </button>
                                                )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg">
                                    <Flame className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Streak Belajar
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Konsistensi mingguan
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-white/20 bg-white/60 p-3 text-center dark:border-white/10 dark:bg-neutral-900/60">
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter
                                            value={stats.completedGuides}
                                        />
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        Guide selesai
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/60 p-3 text-center dark:border-white/10 dark:bg-neutral-900/60">
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter
                                            value={stats.overallProgress}
                                            suffix="%"
                                        />
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        Progress total
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Learning Path
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Rute belajar bertahap
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                    <span>Progress Path</span>
                                    <span>{learningPathProgress}%</span>
                                </div>
                                <Progress
                                    value={learningPathProgress}
                                    className="h-2 bg-neutral-200/80 dark:bg-neutral-700"
                                    indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-600"
                                />
                            </div>

                            <div className="space-y-2">
                                {learningPath.map((step) => (
                                    <button
                                        key={step.id}
                                        onClick={() =>
                                            step.unlocked &&
                                            router.visit(
                                                `/dosen/docs/${step.id}`,
                                            )
                                        }
                                        disabled={!step.unlocked}
                                        className={cn(
                                            'w-full rounded-xl border p-3 text-left transition',
                                            step.unlocked
                                                ? 'border-white/20 bg-white/60 hover:bg-white/80 dark:border-white/10 dark:bg-neutral-900/60 dark:hover:bg-neutral-900'
                                                : 'cursor-not-allowed border-white/10 bg-white/40 opacity-60 dark:border-white/5 dark:bg-neutral-900/40',
                                        )}
                                    >
                                        <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                            {step.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                            {step.isCompleted
                                                ? 'Selesai'
                                                : step.unlocked
                                                  ? 'Siap dipelajari'
                                                  : 'Terkunci'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                    <Download className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Mode Offline
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {offlineEntries.length} dokumen
                                        tersimpan
                                    </p>
                                </div>
                            </div>

                            {offlineEntries.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-white/20 bg-white/60 p-3 text-xs text-neutral-500 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-400">
                                    Belum ada dokumentasi offline. Gunakan ikon
                                    download di kartu dokumentasi.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {offlineEntries.slice(0, 5).map((item) => (
                                        <button
                                            key={item.guide_id}
                                            type="button"
                                            onClick={() =>
                                                void openGuideFromOfflineCache(
                                                    item.guide_id,
                                                )
                                            }
                                            disabled={
                                                offlineViewerLoadingGuideId ===
                                                item.guide_id
                                            }
                                            className="rounded-xl border border-white/20 bg-white/70 p-3 dark:border-white/10 dark:bg-neutral-900/70"
                                        >
                                            <p className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                {item.title ?? item.guide_id}
                                            </p>
                                            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                                {item.size_kb
                                                    ? `${item.size_kb} KB`
                                                    : 'Ukuran tidak tersedia'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={() => router.visit('/dosen/help')}
                            variant="outline"
                            className="w-full rounded-2xl border-white/20 bg-white/40 py-5 text-neutral-700 hover:bg-white/70 dark:border-white/10 dark:bg-neutral-900/40 dark:text-neutral-200 dark:hover:bg-neutral-900"
                        >
                            <LifeBuoy className="h-4 w-4" /> Butuh bantuan
                            tambahan?
                        </Button>
                    </motion.div>
                </div>
            </div>

            {offlineViewerGuide && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onClick={() => setOfflineViewerGuide(null)}
                >
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 26,
                        }}
                        onClick={(event) => event.stopPropagation()}
                        className="relative h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:h-auto sm:max-h-[85vh] sm:max-w-3xl sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-neutral-900/95"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="inline-flex items-center gap-2 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                    <WifiOff className="h-3.5 w-3.5" /> Dibuka
                                    dari cache offline
                                </p>
                                <h3 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
                                    {offlineViewerGuide.title}
                                </h3>
                                {offlineViewerGuide.description && (
                                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                        {offlineViewerGuide.description}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setOfflineViewerGuide(null)}
                                className="rounded-lg border border-white/20 bg-white/70 p-2 text-neutral-500 transition hover:bg-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300"
                                aria-label="Tutup offline viewer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {offlineViewerGuide.sections.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-white/20 bg-white/60 p-4 text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-800/60 dark:text-neutral-300">
                                    Konten section tidak tersedia di cache
                                    offline.
                                </div>
                            ) : (
                                offlineViewerGuide.sections.map(
                                    (section, index) => (
                                        <div
                                            key={section.id}
                                            className="rounded-2xl border border-white/20 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-800/70"
                                        >
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {index + 1}. {section.title}
                                            </p>
                                            <div className="mt-2 space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                                                {section.content
                                                    .split('\n')
                                                    .filter(Boolean)
                                                    .map(
                                                        (
                                                            paragraph,
                                                            paragraphIndex,
                                                        ) => (
                                                            <p
                                                                key={`${section.id}-offline-${paragraphIndex}`}
                                                            >
                                                                {formatText(
                                                                    paragraph,
                                                                )}
                                                            </p>
                                                        ),
                                                    )}
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>

                        <div className="mt-5 flex justify-end">
                            <Button
                                type="button"
                                onClick={() => setOfflineViewerGuide(null)}
                                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                            >
                                Tutup
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </DosenLayout>
    );
}
