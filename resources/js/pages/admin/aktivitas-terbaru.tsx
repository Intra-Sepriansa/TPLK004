import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Radio, Scan, Users, AlertTriangle, CheckCircle,
    Filter, Download, Bell, Pause, Play, Eye, MapPin, Clock,
    Smartphone, Camera, X, ChevronLeft, Search, SlidersHorizontal,
    Volume2, VolumeX, FileSpreadsheet, FileText, FileDown,
    Info, History, User, GraduationCap, RefreshCw, Settings,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';

import LiveMonitorIcon from '@/assets/admin/live-monitor/live-monitor-icon.png';
import SesiAktifIcon from '@/assets/admin/live-monitor/sesi-aktif-icon.png';
import ScanIcon from '@/assets/admin/live-monitor/scan-icon.png';
import HadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import AnomaliIcon from '@/assets/admin/live-monitor/anomali-icon.png';

// Mock pusher since real one needs env vars and backend setup.
class MockPusher {
    bind(event: string, callback: any) { }
    unbind_all() { }
    unsubscribe() { }
    disconnect() { }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
    },
} as const;

const pulseVariants: any = {
    initial: { scale: 1, opacity: 1 },
    pulse: {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: { duration: 0.6, repeat: 3 },
    },
};

export default function AktivitasTerbaru({
    initialActivities = [],
    initialActiveSessions = [],
    initialTodayStats = { hadir: 0, terlambat: 0, izin: 0, anomali: 0 },
    initialStats = { activeSessions: 0, totalScans: 0, activeStudents: 0, anomalyCount: 0, scanRate: 0 }
}: any) {
    const [activities, setActivities] = useState<any[]>(initialActivities);
    const [activeSessions, setActiveSessions] = useState<any[]>(initialActiveSessions);
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [stats, setStats] = useState(initialStats);
    const [todayStats, setTodayStats] = useState(initialTodayStats);
    const [autoScroll, setAutoScroll] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sessionFilter, setSessionFilter] = useState('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const feedRef = useRef<HTMLDivElement>(null);

    // Helper functions
    const playNotificationSound = () => {
        // Only play if supported and file exists, suppress errors
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.debug('Audio play failed:', err));
    };

    const playAlertSound = () => {
        const audio = new Audio('/sounds/alert.mp3');
        audio.volume = 0.8;
        audio.play().catch(err => console.debug('Audio play failed:', err));
    };

    const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
        try {
            toast.info(`Memproses export ${format.toUpperCase()}...`);

            const url = new URL(window.location.origin + '/admin/live-monitor/aktivitas-terbaru/export');
            url.searchParams.append('format', format === 'csv' ? 'excel' : format);
            url.searchParams.append('status', statusFilter);
            url.searchParams.append('session', sessionFilter);

            window.location.href = url.toString();
        } catch (error) {
            toast.error('Gagal mengexport data');
        }
    };

    const viewAnomaly = (anomaly: any) => {
        // Find activity for anomaly and open it
        const act = activities.find(a => a.id === anomaly.activity_id);
        if (act) setSelectedActivity(act);
        setAnomalies(prev => prev.filter(a => a.id !== anomaly.id));
    };

    const dismissAnomaly = (id: string) => {
        setAnomalies(prev => prev.filter(a => a.id !== id));
    };

    const refreshData = () => {
        router.reload({ only: ['initialActivities', 'initialActiveSessions', 'initialTodayStats', 'initialStats'] });
        toast.success('Data berhasil diperbarui');
    };

    const exportActivityDetail = (activity: any) => {
        if (!activity || !activity.id) return;
        try {
            toast.info(`Menyiapkan dokumen detail aktivitas (PDF)...`);
            const url = new URL(`${window.location.origin}/admin/live-monitor/aktivitas-terbaru/${activity.id}/export-pdf`);
            window.location.href = url.toString();
        } catch (error) {
            toast.error('Gagal mengexport detail');
        }
    };

    const toggleMethodFilter = (method: string) => {
        // TBD placeholder
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('search-input')?.focus();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                handleExport('excel');
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                setAutoScroll(prev => !prev);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                refreshData();
            }
            if (e.key === 'Escape' && selectedActivity) {
                setSelectedActivity(null);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [autoScroll, selectedActivity]);

    useEffect(() => {
        // Mocking real-time using setInterval for demo purposes if Pusher is not available
        const interval = setInterval(() => {
            if (!autoScroll) return;

            // Simulating a new event 10% of the time every 5 seconds
            if (Math.random() < 0.1 && activities.length > 0) {
                const randomActivity = { ...activities[Math.floor(Math.random() * activities.length)] };
                randomActivity.id = Date.now().toString();
                randomActivity.time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                randomActivity.isNew = true;

                setActivities(prev => [randomActivity, ...prev]);

                if (soundEnabled) playNotificationSound();
                toast.success(`${randomActivity.student_name} telah melakukan absensi`, {
                    description: `Status: ${randomActivity.status} • Waktu: ${randomActivity.time}`,
                });

                // Remove new indicator
                setTimeout(() => {
                    setActivities(prev => prev.map(a => a.id === randomActivity.id ? { ...a, isNew: false } : a));
                }, 5000);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activities, autoScroll, soundEnabled]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            if (searchQuery && !activity.student_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !activity.nim.includes(searchQuery)) {
                return false;
            }
            if (statusFilter !== 'all' && activity.status !== statusFilter) {
                return false;
            }
            if (sessionFilter !== 'all' && activity.session_id !== sessionFilter) {
                return false;
            }
            return true;
        });
    }, [activities, searchQuery, statusFilter, sessionFilter]);

    const uniqueSessions = useMemo(() => {
        const sessMap = new Map();
        initialActivities.forEach((a: any) => {
            if (!sessMap.has(a.session_id)) sessMap.set(a.session_id, { id: a.session_id, name: a.session_name });
        });
        return Array.from(sessMap.values());
    }, [initialActivities]);

    return (
        <AppLayout>
            <Head title="Live Monitor: Aktivitas Terbaru" />

            {/* Main Container */}
            <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 dark:bg-neutral-950">
                <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">

                    {/* HEADER SECTION */}
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/admin/live-monitor')}
                            className="mb-4 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 text-xs sm:text-sm"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                            Kembali ke Live Monitor
                        </Button>

                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                        >
                            {/* Animated Gradient Background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
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

                            {/* Blur Orbs */}
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

                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-4">
                                    <div className="text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 mb-2">
                                            <motion.div
                                                className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 relative items-center justify-center"
                                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                            >
                                                <img src={LiveMonitorIcon} alt="Live Monitor" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                            </motion.div>
                                            <div className="flex-1 mt-1 sm:mt-0">
                                                <motion.p
                                                    className="text-xs sm:text-sm text-indigo-100 font-medium tracking-wide uppercase"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    Live Monitoring
                                                </motion.p>
                                                <motion.h1
                                                    className="text-2xl sm:text-4xl font-bold text-white leading-tight drop-shadow-md"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    Aktivitas Terbaru
                                                </motion.h1>
                                            </div>
                                        </div>
                                        <motion.p
                                            className="text-xs sm:text-sm mt-3 sm:mt-1 text-indigo-100 max-w-lg leading-relaxed"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            Pantau semua aktivitas absensi secara real-time dengan detail lengkap
                                        </motion.p>
                                    </div>

                                    {/* Live Indicator Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6, type: 'spring' }}
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        className="relative group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-xl border border-white/30">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-3 w-3 rounded-full bg-green-400"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-200 font-medium">Status</p>
                                                <p className="text-xl font-black">LIVE</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* REAL-TIME STATS (4 Cards — Dashboard Style) */}
                    <motion.div
                        className="grid gap-4 grid-cols-2 md:grid-cols-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } }
                        }}
                    >
                        <StatCard imageIcon={SesiAktifIcon} label="Sesi Aktif" value={stats.activeSessions} color="purple" />
                        <StatCard imageIcon={ScanIcon} label="Scan Hari Ini" value={stats.totalScans} color="emerald" />
                        <StatCard imageIcon={HadirIcon} label="Hadir" value={todayStats.hadir} color="blue" />
                        <StatCard imageIcon={AnomaliIcon} label="Anomali" value={stats.anomalyCount} color="red" />
                    </motion.div>

                    {/* MAIN CONTENT AREA */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Activity Feed (70%) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* FILTER & SEARCH BAR */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                        <Filter className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Filter & Pencarian</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            placeholder="Cari nama, NIM, sesi..."
                                            className="pl-10 bg-white/60 dark:bg-neutral-800"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="bg-white/60 dark:bg-neutral-800">
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="hadir">Hadir</SelectItem>
                                            <SelectItem value="terlambat">Terlambat</SelectItem>
                                            <SelectItem value="izin">Izin</SelectItem>
                                            <SelectItem value="anomali">Anomali</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Session Filter */}
                                    <Select value={sessionFilter} onValueChange={setSessionFilter}>
                                        <SelectTrigger className="bg-white/60 dark:bg-neutral-800">
                                            <SelectValue placeholder="Semua Sesi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Sesi</SelectItem>
                                            {uniqueSessions.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Advanced Filters Toggle */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="mt-3"
                                >
                                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                                    {showAdvancedFilters ? 'Sembunyikan' : 'Tampilkan'} Filter Lanjutan
                                </Button>

                                {/* Advanced Filters Panel */}
                                <AnimatePresence>
                                    {showAdvancedFilters && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Time Range */}
                                                <div>
                                                    <Label>Rentang Waktu</Label>
                                                    <div className="flex gap-2 mt-2">
                                                        <Input type="time" className="bg-white/60 dark:bg-neutral-800" />
                                                        <span className="self-center">-</span>
                                                        <Input type="time" className="bg-white/60 dark:bg-neutral-800" />
                                                    </div>
                                                </div>

                                                {/* Method Filter */}
                                                <div>
                                                    <Label>Metode Absensi</Label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {['QR Code', 'GPS', 'Selfie', 'Manual', 'NFC'].map(method => (
                                                            <Badge
                                                                key={method}
                                                                variant="outline"
                                                                className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                                                onClick={() => toggleMethodFilter(method)}
                                                            >
                                                                {method}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Distance Range */}
                                                <div>
                                                    <Label>Jarak Maksimal (meter)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Contoh: 50"
                                                        className="mt-2 bg-white/60 dark:bg-neutral-800"
                                                    />
                                                </div>

                                                {/* Device Type */}
                                                <div>
                                                    <Label>Tipe Device</Label>
                                                    <Select>
                                                        <SelectTrigger className="mt-2 bg-white/60 dark:bg-neutral-800">
                                                            <SelectValue placeholder="Semua Device" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua Device</SelectItem>
                                                            <SelectItem value="android">Android</SelectItem>
                                                            <SelectItem value="ios">iOS</SelectItem>
                                                            <SelectItem value="web">Web Browser</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* ACTIVITY FEED HEADER */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="h-3 w-3 rounded-full bg-green-500"
                                    />
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        Live Activity Feed
                                    </h2>
                                    <Badge variant="success" className="animate-pulse">
                                        <Radio className="h-3 w-3 mr-1" />
                                        {filteredActivities.length} aktivitas
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Auto-scroll Toggle */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAutoScroll(!autoScroll)}
                                    >
                                        {autoScroll ? (
                                            <>
                                                <Pause className="h-4 w-4 mr-2" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4 mr-2" />
                                                Resume
                                            </>
                                        )}
                                    </Button>

                                    {/* Export Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleExport('excel')}>
                                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                                Export ke Excel
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Export ke PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleExport('csv')}>
                                                <FileDown className="h-4 w-4 mr-2" />
                                                Export ke CSV
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Sound Toggle */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                    >
                                        {soundEnabled ? (
                                            <Volume2 className="h-4 w-4" />
                                        ) : (
                                            <VolumeX className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* ACTIVITY FEED */}
                            <div
                                ref={feedRef}
                                className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
                            >
                                <AnimatePresence>
                                    {filteredActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            onClick={() => setSelectedActivity(activity)}
                                            className={cn(
                                                "relative rounded-xl p-4 cursor-pointer transition-all",
                                                "bg-neutral-900 hover:bg-neutral-800 border border-neutral-800",
                                                "hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10",
                                                activity.isNew && "ring-1 ring-green-400 animate-pulse border-transparent"
                                            )}
                                        >
                                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                                                {/* Left: Student Info */}
                                                <div className="flex items-center gap-4">
                                                    {/* Status Icon */}
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 0.5 }}
                                                        className={cn(
                                                            "flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-lg",
                                                            activity.status === 'hadir' && "bg-gradient-to-br from-green-400 to-emerald-600",
                                                            activity.status === 'terlambat' && "bg-gradient-to-br from-yellow-400 to-amber-600",
                                                            activity.status === 'izin' && "bg-gradient-to-br from-blue-400 to-cyan-600",
                                                            activity.status === 'anomali' && "bg-gradient-to-br from-red-400 to-rose-600 animate-pulse"
                                                        )}
                                                    >
                                                        {activity.status === 'hadir' && <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                                                        {activity.status === 'terlambat' && <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                                                        {activity.status === 'izin' && <Info className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                                                        {activity.status === 'anomali' && <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                                                    </motion.div>

                                                    {/* Student Details */}
                                                    <div>
                                                        <h3 className="font-bold text-base sm:text-lg text-white">
                                                            {activity.student_name}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-400">
                                                            {activity.nim}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 max-w-[150px] sm:max-w-[200px] truncate">
                                                            {activity.session_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right: Time & Status */}
                                                <div className="text-right sm:ml-auto">
                                                    <p className="text-xl sm:text-2xl font-bold text-white">
                                                        {activity.time}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 justify-end">
                                                        <Badge variant="outline" className="text-[10px] sm:text-xs bg-neutral-800 text-gray-300 border-neutral-700">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {activity.distance}m
                                                        </Badge>
                                                        <Badge
                                                            variant={
                                                                activity.status === 'hadir' ? 'success' :
                                                                    activity.status === 'terlambat' ? 'warning' :
                                                                        activity.status === 'izin' ? 'default' :
                                                                            'destructive'
                                                            }
                                                            className="text-[10px] sm:text-xs uppercase"
                                                        >
                                                            {activity.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                                        {activity.method}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quick Info Bar */}
                                            <div className="mt-3 pt-3 border-t border-neutral-800 hidden sm:block">
                                                <div className="grid grid-cols-4 gap-3 text-xs">
                                                    <div>
                                                        <p className="text-neutral-500">Lokasi</p>
                                                        <p className="font-medium text-gray-300">{activity.location}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-500">Device</p>
                                                        <p className="font-medium text-gray-300 truncate" title={activity.device}>{activity.device}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-500">Akurasi GPS</p>
                                                        <p className="font-medium text-gray-300">{activity.gps_accuracy}m</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-500">IP Address</p>
                                                        <p className="font-medium text-gray-300 truncate" title={activity.ip_address}>{activity.ip_address}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* New Activity Indicator */}
                                            {activity.isNew && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-2 -right-2">
                                                    <Badge className="bg-green-500 hover:bg-green-600 text-white animate-bounce">
                                                        <Sparkles className="h-3 w-3 mr-1 text-white" />
                                                        Baru
                                                    </Badge>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Empty State */}
                                {filteredActivities.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <Activity className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
                                        <p className="text-neutral-500">Belum ada aktivitas</p>
                                        <p className="text-sm text-neutral-400 mt-2">
                                            Aktivitas akan muncul secara real-time ketika mahasiswa melakukan absensi
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar (30%) */}
                        <div className="space-y-6">

                            {/* ACTIVE SESSIONS PANEL */}
                            <div className="sticky top-6">
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
                                >
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-900 dark:text-white">
                                        <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
                                        Sesi Aktif
                                        <Badge variant="success" className="ml-auto">{activeSessions.length}</Badge>
                                    </h3>

                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
                                    >
                                        {activeSessions.map(session => (
                                            <motion.div
                                                key={session.id}
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.02 }}
                                                className="rounded-xl border border-white/30 dark:border-white/10 p-3 cursor-pointer hover:border-blue-500/50 transition-all bg-white/50 dark:bg-neutral-800/50"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white truncate max-w-[140px]" title={session.course}>
                                                        {session.course}
                                                    </h4>
                                                    <Badge variant="success" className="text-xs">
                                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1" />
                                                        Live
                                                    </Badge>
                                                </div>

                                                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                                                    <p className="flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" />
                                                        {session.class}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {session.lecturer}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.location}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium text-neutral-900 dark:text-white">
                                                            {session.present}/{session.total}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-neutral-500">
                                                        <Clock className="h-3 w-3" />
                                                        {session.timeLeft}
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${session.total > 0 ? (session.present / session.total) * 100 : 0}%` }}
                                                        transition={{ duration: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>

                                {/* QUICK ACTIONS */}
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
                                >
                                    <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <Button className="w-full justify-start border-neutral-200 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-800" variant="outline" onClick={() => setAutoScroll(!autoScroll)}>
                                            {autoScroll ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                            {autoScroll ? 'Pause Monitoring' : 'Resume Monitoring'}
                                        </Button>
                                        <Button className="w-full justify-start border-neutral-200 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-800" variant="outline" onClick={() => handleExport('excel')}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Semua Data
                                        </Button>
                                        <Button className="w-full justify-start border-neutral-200 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-800" variant="outline">
                                            <Bell className="h-4 w-4 mr-2" />
                                            Pengaturan Alert
                                        </Button>
                                        <Button className="w-full justify-start border-neutral-200 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-800" variant="outline" onClick={refreshData}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh Manual
                                        </Button>
                                        <Button className="w-full justify-start border-neutral-200 dark:border-neutral-700 dark:bg-transparent dark:text-white dark:hover:bg-neutral-800" variant="outline">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Pengaturan Tampilan
                                        </Button>
                                    </div>
                                </motion.div>

                                {/* STATISTICS SUMMARY */}
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-6 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl"
                                >
                                    <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">Ringkasan Hari Ini</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Hadir</span>
                                            <span className="font-bold text-green-600">{todayStats.hadir}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Terlambat</span>
                                            <span className="font-bold text-yellow-600">{todayStats.terlambat}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Izin</span>
                                            <span className="font-bold text-blue-600">{todayStats.izin}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Anomali</span>
                                            <span className="font-bold text-red-600">{todayStats.anomali}</span>
                                        </div>
                                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Tingkat Kehadiran</span>
                                                <span className="font-bold text-lg text-indigo-600">
                                                    {((todayStats.hadir / Math.max(1, (todayStats.hadir + todayStats.terlambat + todayStats.izin))) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITY DETAIL MODAL */}
                    <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                        <DialogContent className="sm:max-w-[800px] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto bg-neutral-50 dark:bg-neutral-900 border-none shadow-2xl">
                            {selectedActivity && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                                            Detail Aktivitas Absensi
                                            {selectedActivity.isNew && (
                                                <Badge className="bg-green-500 text-white animate-pulse rounded-full px-3 py-1 text-xs ml-2 border-0">
                                                    Baru Saja
                                                </Badge>
                                            )}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        {/* LEFT: Student Information */}
                                        <div className="space-y-4">
                                            {/* Student Profile Card */}
                                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 shadow-sm relative overflow-hidden">
                                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

                                                <div className="flex items-center gap-4 mb-4 relative">
                                                    <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-neutral-800 shadow-xl">
                                                        <AvatarImage src={selectedActivity.student.photo} />
                                                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                            {selectedActivity.student.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                                            {selectedActivity.student.name}
                                                        </h3>
                                                        <p className="text-neutral-600 dark:text-neutral-400 font-medium tracking-wide text-sm">
                                                            {selectedActivity.student.nim}
                                                        </p>
                                                        <Badge
                                                            className="mt-2 text-xs"
                                                            variant={
                                                                selectedActivity.status === 'hadir' ? 'success' :
                                                                    selectedActivity.status === 'terlambat' ? 'warning' :
                                                                        selectedActivity.status === 'izin' ? 'default' :
                                                                            'destructive'
                                                            }
                                                        >
                                                            {selectedActivity.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 text-sm pt-4 border-t border-indigo-100 dark:border-indigo-900/50 relative">
                                                    <div className="flex justify-between items-center group">
                                                        <span className="text-neutral-500 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><GraduationCap className="w-4 h-4" /> Program Studi</span>
                                                        <span className="font-semibold text-neutral-900 dark:text-neutral-200">{selectedActivity.student.major}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group">
                                                        <span className="text-neutral-500 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><History className="w-4 h-4" /> Semester</span>
                                                        <span className="font-semibold text-neutral-900 dark:text-neutral-200">{selectedActivity.student.semester}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group">
                                                        <span className="text-neutral-500 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">@ Email</span>
                                                        <span className="font-medium text-xs bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md text-neutral-700 dark:text-neutral-300">{selectedActivity.student.email}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center group">
                                                        <span className="text-neutral-500 flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><Smartphone className="w-4 h-4" /> No. HP</span>
                                                        <span className="font-semibold text-neutral-900 dark:text-neutral-200">{selectedActivity.student.phone}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Attendance History */}
                                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900/50 shadow-sm">
                                                <h4 className="font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                                    <History className="h-5 w-5 text-indigo-500" />
                                                    Riwayat Kehadiran (3 Hari Terakhir)
                                                </h4>
                                                <div className="space-y-3">
                                                    {selectedActivity.student.recentAttendance.map((att: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                                            <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                                                <div className={cn("w-2 h-2 rounded-full", att.status === 'hadir' ? 'bg-green-500' : 'bg-yellow-500')} />
                                                                {att.date}
                                                            </span>
                                                            <Badge variant={att.status === 'hadir' ? 'success' : 'warning'} className="text-xs shadow-sm">
                                                                {att.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT: Attendance Details */}
                                        <div className="space-y-4">
                                            {/* Scan Details */}
                                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900/50 shadow-sm">
                                                <h4 className="font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                                    <Scan className="h-5 w-5 text-purple-500" />
                                                    Detail Scan
                                                </h4>
                                                <dl className="space-y-3 text-sm">
                                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                        <dt className="text-neutral-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu Scan</dt>
                                                        <dd className="font-bold text-neutral-900 dark:text-white">{selectedActivity.time}</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                        <dt className="text-neutral-500">Metode</dt>
                                                        <dd className="font-medium text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{selectedActivity.method}</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                        <dt className="text-neutral-500">Jarak ke Titik Pusat</dt>
                                                        <dd className="font-medium text-neutral-900 dark:text-white flex items-center gap-1">
                                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", selectedActivity.distance <= 50 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
                                                                {selectedActivity.distance}m
                                                            </span>
                                                        </dd>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                        <dt className="text-neutral-500">Akurasi GPS (Radius)</dt>
                                                        <dd className="font-medium text-neutral-900 dark:text-white">{selectedActivity.gps_accuracy}m</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                        <dt className="text-neutral-500">Koordinat</dt>
                                                        <dd className="font-mono text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded select-all">{selectedActivity.coordinates}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {/* Device Information */}
                                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900/50 shadow-sm">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                                    <Smartphone className="h-5 w-5 text-blue-500" />
                                                    Informasi Device
                                                </h4>
                                                <dl className="space-y-2 text-sm">
                                                    <div className="flex justify-between items-center py-1">
                                                        <dt className="text-neutral-500">Device/OS</dt>
                                                        <dd className="font-medium text-neutral-900 dark:text-white max-w-[200px] truncate" title={selectedActivity.device}>
                                                            {selectedActivity.device}
                                                        </dd>
                                                    </div>
                                                    <div className="flex justify-between items-center py-1">
                                                        <dt className="text-neutral-500">Browser/App</dt>
                                                        <dd className="font-medium text-neutral-900 dark:text-white">{selectedActivity.browser}</dd>
                                                    </div>
                                                    <div className="flex justify-between items-center py-1">
                                                        <dt className="text-neutral-500 flex items-center gap-1">IP Address</dt>
                                                        <dd className="font-mono text-xs text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded select-all">{selectedActivity.ip_address}</dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {/* Selfie Verification (if available) */}
                                            {selectedActivity.selfie && (
                                                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900/50 shadow-sm">
                                                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                                        <Camera className="h-5 w-5 text-teal-500" />
                                                        Verifikasi Selfie
                                                    </h4>
                                                    <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-3">
                                                        <img
                                                            src={selectedActivity.selfie}
                                                            alt="Selfie"
                                                            className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                            <Button size="sm" variant="secondary" className="w-full bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30">
                                                                <Eye className="w-4 h-4 mr-2" /> Lihat Full
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Face Match AI Score:</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                                <div className={cn("h-full", selectedActivity.face_match >= 80 ? 'bg-green-500' : 'bg-yellow-500')} style={{ width: `${selectedActivity.face_match}%` }} />
                                                            </div>
                                                            <Badge variant={selectedActivity.face_match >= 80 ? 'success' : 'warning'} className="shadow-sm">
                                                                {selectedActivity.face_match}%
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Location Map Mock */}
                                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900/50 shadow-sm">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                                                    <MapPin className="h-5 w-5 text-red-500" />
                                                    Lokasi Tersimpan
                                                </h4>
                                                <div className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-700 overflow-hidden relative group">
                                                    {/* Fake map background using css patterns or just an icon */}
                                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                                                    <MapPin className="h-10 w-10 text-neutral-400 mb-2 group-hover:text-red-500 transition-colors group-hover:scale-110 duration-300 relative z-10" />
                                                    <p className="text-neutral-500 text-sm font-medium relative z-10">Peta interaktif tidak dimuat</p>
                                                </div>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 flex items-start gap-2 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                                                    <Info className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                                                    {selectedActivity.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <DialogFooter className="mt-6 gap-3 sm:gap-0">
                                <Button variant="outline" onClick={() => setSelectedActivity(null)} className="border-neutral-200 dark:border-neutral-700">
                                    Tutup
                                </Button>
                                <Button onClick={() => exportActivityDetail(selectedActivity)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Detail PDF
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

        </AppLayout>
    );
}

/* ─── StatCard Component — Glassmorphism + Gradient Icons (Dashboard Style) ─── */
function StatCard({ icon: Icon, imageIcon, label, value, color }: { icon?: any; imageIcon?: string; label: string; value: number; color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    const colorConfigs: Record<string, any> = {
        emerald: { bg: 'bg-emerald-500', hoverShadow: 'group-hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
        orange: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30' },
        blue: { bg: 'bg-sky-500', hoverShadow: 'group-hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30' },
        green: { bg: 'bg-green-500', hoverShadow: 'group-hover:shadow-green-500/10', gradientBg: 'from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10', iconBg: 'from-green-400 to-emerald-600 shadow-green-500/30' },
        purple: { bg: 'bg-purple-500', hoverShadow: 'group-hover:shadow-purple-500/10', gradientBg: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10', iconBg: 'from-purple-400 to-violet-600 shadow-purple-500/30' },
        red: { bg: 'bg-red-500', hoverShadow: 'group-hover:shadow-red-500/10', gradientBg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', iconBg: 'from-red-400 to-rose-600 shadow-red-500/30' },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            className={`group h-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/50 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${c.hoverShadow} dark:border-white/5 cursor-pointer`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileTap={{ scale: 0.95 }}
            style={{ perspective: 1000 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`} />
            <motion.div
                initial={false}
                animate={{ scale: isHovered ? 1.5 : 1, opacity: isHovered ? 0.4 : 0.2 }}
                transition={{ duration: 0.5 }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            {value?.toLocaleString?.() ?? value}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
