/**
 * Dosen Enhanced Documentation Page
 * Dark theme dengan advanced cards, search, dan progress tracking
 * Menggunakan emerald-teal-cyan color scheme untuk konsistensi dengan tema dosen
 */

import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Book,
    Clock,
    CheckCircle,
    TrendingUp,
    Home,
    Users,
    FileText,
    BarChart3,
    ClipboardList,
    FileCheck,
    GraduationCap,
    Award,
    Settings,
    Bell,
    Calendar,
    BookOpen,
    type LucideIcon
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import InteractiveSearch from '@/components/ui/interactive-search';
import ProgressIndicator, { LinearProgressBar } from '@/components/ui/progress-indicator';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import EmptyState from '@/components/ui/empty-state';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import type { GuideSummary } from '@/types/documentation';
import { getGuides, getProgressStats } from '@/lib/documentation-api';
import TotalGuidesIcon from '@/assets/admin/panduan/panduan.png';
import CompletedIcon from '@/assets/admin/notification-center/scheduled.png';
import InProgressIcon from '@/assets/admin/bulk-import/berhasil.png';
import OverallProgressIcon from '@/assets/admin/informasi-tugas/total-tugas.png';

interface DocumentationStats {
    totalGuides: number;
    completedGuides: number;
    inProgressGuides: number;
    overallProgress: number;
}

// Icon mapping untuk setiap guide berdasarkan icon name dari backend
const iconMap: Record<string, LucideIcon> = {
    'Home': Home,
    'Users': Users,
    'FileText': FileText,
    'BarChart3': BarChart3,
    'ClipboardList': ClipboardList,
    'FileCheck': FileCheck,
    'GraduationCap': GraduationCap,
    'Award': Award,
    'Settings': Settings,
    'Bell': Bell,
    'Calendar': Calendar,
    'Book': Book,
    'BookOpen': BookOpen,
};

export default function DosenDocs() {
    const [guides, setGuides] = useState<GuideSummary[]>([]);
    const [filteredGuides, setFilteredGuides] = useState<GuideSummary[]>([]);
    const [stats, setStats] = useState<DocumentationStats>({
        totalGuides: 0,
        completedGuides: 0,
        inProgressGuides: 0,
        overallProgress: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDocumentation();
    }, []);

    useEffect(() => {
        filterGuides();
    }, [guides, selectedCategory, searchQuery]);

    const loadDocumentation = async () => {
        try {
            setIsLoading(true);
            const [guidesData, statsData] = await Promise.all([
                getGuides('dosen'),
                getProgressStats('dosen'),
            ]);
            setGuides(guidesData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load documentation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterGuides = () => {
        let filtered = guides;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(g => g.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                g =>
                    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    g.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredGuides(filtered);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleGuideClick = (guideId: string) => {
        router.visit(`/dosen/docs/${guideId}`);
    };

    const categories = ['all', ...Array.from(new Set(guides.map(g => g.category)))];

    if (isLoading) {
        return (
            <DosenLayout>
                <Head title="Documentation" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                    <Book className="h-10 w-10" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/90 font-medium">Dokumentasi</p>
                                    <h1 className="text-3xl font-bold">Loading...</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <SkeletonGrid count={6} columns={3} />
                </div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout>
            <Head title="Documentation" />

            <div className="space-y-6 p-6">
                {/* ═══════ HEADER — Matching Notification Center Style ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600" />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Pulsating Rings */}


                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img src={TotalGuidesIcon} alt="Dokumentasi" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p className="text-sm text-white/90 font-medium tracking-wide flex items-center gap-2 justify-center sm:justify-start"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                        <BookOpen className="h-4 w-4" /> Dokumentasi
                                    </motion.p>
                                    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>Documentation Hub</motion.h1>
                                    <motion.p className="mt-2 text-white/90 text-sm leading-relaxed"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                        Learn everything about the platform
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards - Notification Style */}
                <motion.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 mb-8"
                >
                    {/* Total Guides Card */}
                    <motion.div
                        variants={staggerItemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-purple-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10" />
                        <motion.div
                            animate={{ scale: 1.5, opacity: 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center shrink-0"
                            >
                                <img src={TotalGuidesIcon} alt="Total" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Total Guides</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalGuides}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">semua dokumentasi</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Completed Card */}
                    <motion.div
                        variants={staggerItemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-orange-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10" />
                        <motion.div
                            animate={{ scale: 1.5, opacity: 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center shrink-0"
                            >
                                <img src={CompletedIcon} alt="Completed" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedGuides}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">telah diselesaikan</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* In Progress Card */}
                    <motion.div
                        variants={staggerItemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            animate={{ scale: 1.5, opacity: 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center shrink-0"
                            >
                                <img src={InProgressIcon} alt="In Progress" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">In Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgressGuides}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">sedang dibaca</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Overall Progress Card */}
                    <motion.div
                        variants={staggerItemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-blue-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10" />
                        <motion.div
                            animate={{ scale: 1.5, opacity: 0.2 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-14 w-14 items-center justify-center shrink-0"
                            >
                                <img src={OverallProgressIcon} alt="Overall Progress" className="absolute inset-0 h-full w-full object-contain drop-shadow-xl" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Overall Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.overallProgress}%</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">total kemajuan</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Overall Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className={`rounded-3xl p-6 transition-all duration-300 border backdrop-blur-xl ${stats.overallProgress === 100
                        ? 'bg-white/40 dark:bg-neutral-900/40 border-emerald-500/50 shadow-xl shadow-emerald-500/20'
                        : 'bg-white/40 dark:bg-neutral-900/40 border-white/20 dark:border-white/5 shadow-xl'
                        }`}>
                        <div className="flex items-center gap-6">
                            <ProgressIndicator
                                value={stats.overallProgress}
                                size="lg"
                                label="Overall Progress"
                                celebrateOnComplete
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                                        Your Learning Journey
                                    </h3>
                                    {stats.overallProgress === 100 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                            className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-lg"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            All Complete!
                                        </motion.div>
                                    )}
                                </div>
                                <p className={`mb-4 flex items-center gap-2 ${stats.overallProgress === 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {stats.overallProgress === 100
                                        ? (
                                            <>
                                                <Award className="h-5 w-5" />
                                                Congratulations! You have completed all documentation guides!
                                            </>
                                        )
                                        : `You've completed ${stats.completedGuides} out of ${stats.totalGuides} guides`
                                    }
                                </p>
                                <LinearProgressBar
                                    value={stats.overallProgress}
                                    height="md"
                                    gradient
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <InteractiveSearch
                        placeholder="Search documentation..."
                        onSearch={handleSearch}
                        className="mb-6"
                    />

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-3">
                        {categories.map((category, index) => (
                            <motion.button
                                key={category}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-md'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {category === 'all' ? 'All Guides' : category}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Documentation Cards */}
                {filteredGuides.length > 0 ? (
                    <motion.div
                        variants={staggerContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredGuides.map((guide, index) => {
                            // Get the icon component from the map
                            const IconComponent = guide.icon && typeof guide.icon === 'string'
                                ? iconMap[guide.icon] || Book
                                : Book;

                            return (
                                <motion.div
                                    key={guide.id}
                                    variants={staggerItemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleGuideClick(guide.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="h-full bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl dark:hover:shadow-emerald-500/20 transition-all duration-300 relative overflow-hidden group">
                                        {/* Background Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Content */}
                                        <div className="relative z-10">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                        <IconComponent className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                                            {guide.title}
                                                        </h3>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                                            {guide.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                {guide.progress >= 100 && (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                )}
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                                                {guide.description}
                                            </p>

                                            {/* Progress Bar */}
                                            {guide.progress > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                                        <span>Progress</span>
                                                        <span>{guide.progress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${guide.progress}%` }}
                                                            transition={{ duration: 1, delay: index * 0.05 }}
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span>{guide.estimatedReadTime || 10} min</span>
                                                </div>
                                                <div className={`text-xs font-semibold transition-colors flex items-center gap-1 ${guide.progress >= 100
                                                    ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                                    : 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                                    }`}>
                                                    {guide.progress >= 100 ? (
                                                        <>
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Completed
                                                        </>
                                                    ) : (
                                                        <>
                                                            Start Learning
                                                        </>
                                                    )} →
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                ) : (
                    <EmptyState
                        title="No guides found"
                        description="Try adjusting your search or filters"
                        icon="search"
                        action={{
                            label: 'Clear Filters',
                            onClick: () => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            },
                        }}
                    />
                )}
            </div>
        </DosenLayout>
    );
}
