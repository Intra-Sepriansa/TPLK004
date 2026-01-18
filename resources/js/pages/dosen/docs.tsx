/**
 * Dosen Enhanced Documentation Page
 * UI sama dengan mahasiswa dengan advanced cards, search, dan progress tracking
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
    type LucideIcon
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
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

interface Props {
    dosen: { id: number; nama: string };
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
};

export default function DosenDocs({ dosen }: Props) {
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
            console.log('Loading documentation for dosen...');
            const [guidesData, statsData] = await Promise.all([
                getGuides('dosen'),
                getProgressStats('dosen'),
            ]);
            console.log('Guides loaded:', guidesData);
            console.log('Stats loaded:', statsData);
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
            <DosenLayout dosen={dosen}>
                <Head title="Dokumentasi" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <Book className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-100">Dokumentasi</p>
                                    <h1 className="text-2xl font-bold">Loading...</h1>
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
        <DosenLayout dosen={dosen}>
            <Head title="Dokumentasi" />

            <div className="space-y-6 p-6">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
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
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
                                >
                                    <Book className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-emerald-100">Dokumentasi</p>
                                    <h1 className="text-2xl font-bold">Pusat Dokumentasi Dosen</h1>
                                    <p className="text-sm text-emerald-100">Panduan lengkap penggunaan sistem untuk dosen</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div variants={staggerItemVariants}>
                        <StatCard
                            label="Total Panduan"
                            value={stats.totalGuides}
                            icon={<Book className="w-full h-full" />}
                        />
                    </motion.div>
                    <motion.div variants={staggerItemVariants}>
                        <StatCard
                            label="Selesai"
                            value={stats.completedGuides}
                            icon={<CheckCircle className="w-full h-full" />}
                            trend={{ value: 25, direction: 'up' }}
                        />
                    </motion.div>
                    <motion.div variants={staggerItemVariants}>
                        <StatCard
                            label="Sedang Dibaca"
                            value={stats.inProgressGuides}
                            icon={<Clock className="w-full h-full" />}
                        />
                    </motion.div>
                    <motion.div variants={staggerItemVariants}>
                        <StatCard
                            label="Progress Keseluruhan"
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
                                label="Progress Keseluruhan"
                                celebrateOnComplete
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                                        Perjalanan Pembelajaran Anda
                                    </h3>
                                    {stats.overallProgress === 100 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                            className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Semua Selesai!
                                        </motion.div>
                                    )}
                                </div>
                                <p className={`mb-4 ${stats.overallProgress === 100 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {stats.overallProgress === 100 
                                        ? '🎉 Selamat! Anda telah menyelesaikan semua panduan dokumentasi!'
                                        : `Anda telah menyelesaikan ${stats.completedGuides} dari ${stats.totalGuides} panduan`
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
                        placeholder="Cari dokumentasi..."
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
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {category === 'all' ? 'Semua Panduan' : category}
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
                                <div className="h-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl dark:hover:shadow-emerald-500/20 transition-all duration-300 relative overflow-hidden group">
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
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>{guide.estimatedReadTime || 10} menit</span>
                                            </div>
                                            <div className={`text-xs font-semibold transition-colors ${
                                                guide.progress >= 100 
                                                    ? 'text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300' 
                                                    : 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                            }`}>
                                                {guide.progress >= 100 ? '✓ Selesai' : 'Mulai Belajar'} →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )})}
                    </motion.div>
                ) : (
                    <EmptyState
                        title="Tidak ada panduan ditemukan"
                        description="Coba sesuaikan pencarian atau filter Anda"
                        icon="search"
                        action={{
                            label: 'Hapus Filter',
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
