/**
 * Student Enhanced Documentation Page
 * Dark theme dengan advanced cards, search, dan progress tracking
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
    QrCode,
    FileText,
    History,
    ClipboardList,
    FileCheck,
    GraduationCap,
    BarChart3,
    Award,
    Trophy,
    Wallet,
    Vote,
    MessageCircle,
    type LucideIcon
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import InteractiveSearch from '@/components/ui/interactive-search';
import { StatCard } from '@/components/ui/advanced-card';
import ProgressIndicator, { LinearProgressBar } from '@/components/ui/progress-indicator';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import EmptyState from '@/components/ui/empty-state';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/animations';
import type { GuideSummary } from '@/types/documentation';
import { getGuides, getProgressStats } from '@/lib/documentation-api';

interface DocumentationStats {
    totalGuides: number;
    completedGuides: number;
    inProgressGuides: number;
    overallProgress: number;
}

// Icon mapping untuk setiap guide berdasarkan icon name dari backend
const iconMap: Record<string, LucideIcon> = {
    'Home': Home,
    'QrCode': QrCode,
    'FileText': FileText,
    'History': History,
    'ClipboardList': ClipboardList,
    'FileCheck': FileCheck,
    'GraduationCap': GraduationCap,
    'BarChart3': BarChart3,
    'Award': Award,
    'Trophy': Trophy,
    'Wallet': Wallet,
    'Vote': Vote,
    'MessageCircle': MessageCircle,
    'Book': Book,
};

export default function StudentDocs() {
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
                getGuides('mahasiswa'),
                getProgressStats('mahasiswa'),
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
        router.visit(`/user/docs/${guideId}`);
    };

    const categories = ['all', ...Array.from(new Set(guides.map(g => g.category)))];

    if (isLoading) {
        return (
            <StudentLayout>
                <Head title="Documentation" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-lg">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <Book className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100">Dokumentasi</p>
                                    <h1 className="text-2xl font-bold">Loading...</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <SkeletonGrid count={6} columns={3} />
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <Head title="Documentation" />

            <div className="space-y-6 p-6">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-xl">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <Book className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100">Dokumentasi</p>
                                    <h1 className="text-2xl font-bold">Documentation Hub</h1>
                                    <p className="text-sm text-blue-100">Learn everything about the platform</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <motion.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                        <motion.div variants={staggerItemVariants}>
                            <StatCard
                                label="Total Guides"
                                value={stats.totalGuides}
                                icon={<Book className="w-full h-full" />}
                            />
                        </motion.div>
                        <motion.div variants={staggerItemVariants}>
                            <StatCard
                                label="Completed"
                                value={stats.completedGuides}
                                icon={<CheckCircle className="w-full h-full" />}
                                trend={{ value: 25, direction: 'up' }}
                            />
                        </motion.div>
                        <motion.div variants={staggerItemVariants}>
                            <StatCard
                                label="In Progress"
                                value={stats.inProgressGuides}
                                icon={<Clock className="w-full h-full" />}
                            />
                        </motion.div>
                        <motion.div variants={staggerItemVariants}>
                            <StatCard
                                label="Overall Progress"
                                value={`${stats.overallProgress}%`}
                                icon={<TrendingUp className="w-full h-full" />}
                                trend={{ value: 50, direction: 'up' }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Overall Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className={`rounded-2xl p-6 transition-all duration-300 ${
                            stats.overallProgress === 100 
                                ? 'bg-white dark:bg-black border-2 border-green-500 shadow-lg shadow-green-500/20' 
                                : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg'
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
                                                className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                All Complete!
                                            </motion.div>
                                        )}
                                    </div>
                                    <p className={`mb-4 ${stats.overallProgress === 100 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {stats.overallProgress === 100 
                                            ? '🎉 Congratulations! You have completed all documentation guides!'
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
                        transition={{ delay: 0.3 }}
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
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                        selectedCategory === category
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
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
                                <div className="h-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl dark:hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden group">
                                    {/* Background Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
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
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
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
                                                        transition={{ duration: 1, delay: index * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{guide.estimatedReadTime || 10} min</span>
                                            </div>
                                            <div className={`text-xs font-semibold transition-colors ${
                                                guide.progress >= 100 
                                                    ? 'text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300' 
                                                    : 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                                            }`}>
                                                {guide.progress >= 100 ? '✓ Completed' : 'Start Learning'} →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )})}
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
        </StudentLayout>
    );
}
