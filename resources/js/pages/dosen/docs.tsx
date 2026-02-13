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
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white shadow-2xl border border-gray-800"
                >
                    {/* Animated Background Orbs */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1], 
                            opacity: [0.3, 0.6, 0.3],
                            x: [0, 30, 0],
                            y: [0, -20, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.4, 1], 
                            opacity: [0.2, 0.5, 0.2],
                            x: [0, -30, 0],
                            y: [0, 20, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.25, 1], 
                            opacity: [0.25, 0.45, 0.25],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl"
                    />

                    {/* Floating Icons */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-8 right-32 opacity-10"
                    >
                        <Book className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-8 left-32 opacity-10"
                    >
                        <GraduationCap className="h-12 w-12" />
                    </motion.div>
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50"
                                >
                                    <Book className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-gray-400"
                                    >
                                        Dokumentasi
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                    >
                                        Pusat Dokumentasi Dosen
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-gray-400 flex items-center gap-2 mt-1"
                                    >
                                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                                        Panduan lengkap penggunaan sistem untuk dosen
                                    </motion.p>
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
                    className="mb-8 relative"
                >
                    {/* Confetti particles when 100% */}
                    {stats.overallProgress === 100 && (
                        <>
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ 
                                        opacity: 0, 
                                        y: 0, 
                                        x: 0,
                                        scale: 0,
                                        rotate: 0
                                    }}
                                    animate={{ 
                                        opacity: [0, 1, 1, 0],
                                        y: [0, -100 - Math.random() * 200],
                                        x: [-50 + Math.random() * 100, -100 + Math.random() * 200],
                                        scale: [0, 1, 1, 0.5],
                                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        delay: Math.random() * 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 3 + Math.random() * 2
                                    }}
                                    className="absolute pointer-events-none z-10"
                                    style={{
                                        left: `${20 + Math.random() * 60}%`,
                                        top: '50%',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                                        background: [
                                            '#10b981', '#3b82f6', '#f59e0b', 
                                            '#ef4444', '#8b5cf6', '#ec4899'
                                        ][Math.floor(Math.random() * 6)]
                                    }}
                                />
                            ))}
                        </>
                    )}

                    <div className={`rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${
                        stats.overallProgress === 100 
                            ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-green-500 shadow-2xl shadow-green-500/30' 
                            : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg'
                    }`}>
                        {/* Animated gradient overlay when 100% */}
                        {stats.overallProgress === 100 && (
                            <>
                                <motion.div
                                    className="absolute inset-0 opacity-30"
                                    animate={{
                                        background: [
                                            'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                                            'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                                        ]
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{
                                        x: ['-100%', '200%']
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                        repeatDelay: 1
                                    }}
                                />
                            </>
                        )}

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="relative">
                                <ProgressIndicator
                                    value={stats.overallProgress}
                                    size="lg"
                                    label="Progress Keseluruhan"
                                    celebrateOnComplete
                                />
                                {/* Pulsing glow when 100% */}
                                {stats.overallProgress === 100 && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-green-500/30 blur-xl"
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.5, 0.8, 0.5]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">
                                        Perjalanan Pembelajaran Anda
                                    </h3>
                                    {stats.overallProgress === 100 && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ 
                                                scale: 1, 
                                                rotate: 0,
                                            }}
                                            transition={{ 
                                                type: 'spring', 
                                                stiffness: 200,
                                                damping: 15
                                            }}
                                            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-full text-sm font-bold shadow-lg relative overflow-hidden"
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                animate={{
                                                    x: ['-100%', '200%']
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                            />
                                            <motion.div
                                                animate={{ 
                                                    rotate: [0, 360],
                                                    scale: [1, 1.2, 1]
                                                }}
                                                transition={{
                                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                                }}
                                            >
                                                <Award className="w-5 h-5" />
                                            </motion.div>
                                            <span className="relative z-10">Semua Selesai!</span>
                                        </motion.div>
                                    )}
                                </div>
                                <motion.p 
                                    className={`mb-4 font-medium ${stats.overallProgress === 100 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}
                                    animate={stats.overallProgress === 100 ? {
                                        scale: [1, 1.02, 1],
                                    } : {}}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {stats.overallProgress === 100 
                                        ? '🎉 Selamat! Anda telah menyelesaikan semua panduan dokumentasi!'
                                        : `Anda telah menyelesaikan ${stats.completedGuides} dari ${stats.totalGuides} panduan`
                                    }
                                </motion.p>
                                <div className="relative">
                                    <LinearProgressBar
                                        value={stats.overallProgress}
                                        height="md"
                                        gradient
                                    />
                                    {/* Sparkle effect on progress bar when 100% */}
                                    {stats.overallProgress === 100 && (
                                        <>
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"
                                                    style={{
                                                        left: `${i * 25}%`,
                                                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                                                    }}
                                                    animate={{
                                                        scale: [0, 1.5, 0],
                                                        opacity: [0, 1, 0]
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        delay: i * 0.3,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
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
                                whileHover={{ scale: 1.03, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleGuideClick(guide.id)}
                                className="cursor-pointer"
                            >
                                <div className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-2 border-gray-200/70 dark:border-gray-800/70 rounded-2xl p-6 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-2xl dark:hover:shadow-emerald-500/30 transition-all duration-300 relative overflow-hidden group">
                                    {/* Enhanced Background Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Animated Border Gradient */}
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            background: 'linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%)',
                                            backgroundSize: '200% 200%',
                                        }}
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%'],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    />
                                    
                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div 
                                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                                    transition={{ duration: 0.6 }}
                                                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30"
                                                >
                                                    <IconComponent className="w-7 h-7 text-white" />
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {guide.title}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                        {guide.category}
                                                    </span>
                                                </div>
                                            </div>
                                            {guide.progress >= 100 && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 200 }}
                                                >
                                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">
                                            {guide.description}
                                        </p>

                                        {/* Progress Bar */}
                                        {guide.progress > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                                                    <span>Progress</span>
                                                    <span className="font-bold">{guide.progress}%</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${guide.progress}%` }}
                                                        transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full shadow-sm relative overflow-hidden"
                                                    >
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                            animate={{
                                                                x: ['-100%', '200%'],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                        />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="font-medium">{guide.estimatedReadTime || 10} menit</span>
                                            </div>
                                            <motion.div 
                                                className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                                                    guide.progress >= 100 
                                                        ? 'text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300' 
                                                        : 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                                }`}
                                                whileHover={{ x: 5 }}
                                            >
                                                {guide.progress >= 100 ? '✓ Selesai' : 'Mulai Belajar'}
                                                <motion.span
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    →
                                                </motion.span>
                                            </motion.div>
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
