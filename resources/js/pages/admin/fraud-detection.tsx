import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, AlertTriangle, MapPin, Camera, Clock, Smartphone,
    Eye, CheckCircle, XCircle, Search, RefreshCw, X, Filter, Zap
} from 'lucide-react';
import { useState } from 'react';

interface FraudAlert {
    id: number;
    mahasiswa_id: number;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: Record<string, any>;
    status: 'pending' | 'investigating' | 'confirmed' | 'dismissed';
    created_at: string;
    mahasiswa?: { nama: string; nim: string };
    session?: { course?: { nama: string } };
}

interface Props {
    alerts: {
        data: FraudAlert[];
        links: any;
        current_page: number;
        last_page: number;
    };
    stats: {
        total: number;
        pending: number;
        critical: number;
        confirmed: number;
        by_type: Record<string, number>;
    };
    filters: { status: string; severity: string; type: string };
}

export default function FraudDetection({ alerts, stats, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reviewModal, setReviewModal] = useState<{ open: boolean; alert: FraudAlert | null }>({ open: false, alert: null });
    const [scanning, setScanning] = useState(false);

    const reviewForm = useForm({ status: '', notes: '' });

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/fraud-detection', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleScan = () => {
        setScanning(true);
        router.post('/admin/fraud-detection/scan', {}, {
            onFinish: () => setScanning(false)
        });
    };

    const handleBulkAction = (action: string) => {
        if (selectedIds.length === 0) return;
        router.post('/admin/fraud-detection/bulk-action', { ids: selectedIds, action }, {
            onSuccess: () => setSelectedIds([])
        });
    };

    const handleReview = () => {
        if (!reviewModal.alert) return;
        reviewForm.patch(`/admin/fraud-detection/${reviewModal.alert.id}/review`, {
            onSuccess: () => {
                setReviewModal({ open: false, alert: null });
                reviewForm.reset();
            }
        });
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'gps_spoofing': return <MapPin className="h-4 w-4" />;
            case 'rapid_location_change': return <MapPin className="h-4 w-4" />;
            case 'duplicate_selfie': return <Camera className="h-4 w-4" />;
            case 'device_mismatch': return <Smartphone className="h-4 w-4" />;
            case 'time_anomaly': return <Clock className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-slate-900';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Pending</span>;
            case 'investigating': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Investigating</span>;
            case 'confirmed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Confirmed</span>;
            case 'dismissed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Dismissed</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    const getAlertTypeName = (type: string) => {
        const names: Record<string, string> = {
            'gps_spoofing': 'GPS Spoofing',
            'rapid_location_change': 'Perpindahan Cepat',
            'duplicate_selfie': 'Selfie Duplikat',
            'device_mismatch': 'Perangkat Berbeda',
            'time_anomaly': 'Anomali Waktu',
            'suspicious_pattern': 'Pola Mencurigakan'
        };
        return names[type] || type;
    };

    return (
        <AppLayout>
            <Head title="Fraud Detection" />
            
            <div className="p-6 space-y-6">
                {/* Header dengan animasi masuk */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-2xl border border-slate-700/50"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-red-500/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/50"
                                >
                                    <Shield className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-slate-600 dark:text-slate-400 font-medium"
                                    >
                                        Sistem Keamanan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                    >
                                        Fraud Detection System
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleScan}
                                disabled={scanning}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-50"
                            >
                                {scanning ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Jalankan Scan
                                    </>
                                )}
                            </motion.button>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-slate-600 dark:text-slate-400"
                        >
                            Deteksi kecurangan absensi: GPS spoofing, selfie duplikat, dan anomali lainnya
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dock-style */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { icon: Shield, label: 'Total Alert', value: stats.total, color: 'from-slate-600 to-slate-700', delay: 0.1 },
                        { icon: Clock, label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-orange-500', delay: 0.2 },
                        { icon: AlertTriangle, label: 'Critical', value: stats.critical, color: 'from-red-500 to-rose-600', delay: 0.3 },
                        { icon: CheckCircle, label: 'Confirmed', value: stats.confirmed, color: 'from-orange-500 to-red-500', delay: 0.4 },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay + 0.2, type: "spring" }}
                                        className="text-4xl font-bold text-slate-900 dark:text-white mt-2"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                                >
                                    <stat.icon className="h-7 w-7 text-white" />
                                </motion.div>
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 dark:via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Alert Types Distribution dengan background hitam */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Distribusi Tipe Alert</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.by_type).map(([type, count], index) => (
                            <motion.div
                                key={type}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 hover:border-red-500/50 transition-all cursor-pointer"
                            >
                                <div className="text-red-600 dark:text-red-400">
                                    {getAlertIcon(type)}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{getAlertTypeName(type)}</span>
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold">{count}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Filters & Actions dengan background hitam */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl border border-slate-200 dark:border-slate-800/50"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Filter & Actions</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="investigating">Investigating</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                        <select
                            value={filters.severity}
                            onChange={(e) => handleFilterChange('severity', e.target.value)}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="all">Semua Level</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="gps_spoofing">GPS Spoofing</option>
                            <option value="rapid_location_change">Perpindahan Cepat</option>
                            <option value="duplicate_selfie">Selfie Duplikat</option>
                            <option value="device_mismatch">Perangkat Berbeda</option>
                            <option value="time_anomaly">Anomali Waktu</option>
                        </select>
                        
                        <AnimatePresence>
                            {selectedIds.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                    className="flex gap-2 ml-auto"
                                >
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleBulkAction('dismiss')}
                                        className="border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-white hover:bg-slate-700"
                                    >
                                        <XCircle className="h-4 w-4 mr-1" /> Dismiss ({selectedIds.length})
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg shadow-red-500/30" 
                                        onClick={() => handleBulkAction('confirm')}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" /> Confirm ({selectedIds.length})
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Alerts List dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Daftar Alert</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-800">
                        <AnimatePresence>
                            {alerts.data.map((alert, index) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: 0.8 + index * 0.05 }}
                                    whileHover={{ 
                                        backgroundColor: "rgba(15, 23, 42, 0.5)",
                                        transition: { duration: 0.2 }
                                    }}
                                    className="p-5 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <Checkbox
                                            checked={selectedIds.includes(alert.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedIds(prev => 
                                                    checked 
                                                        ? [...prev, alert.id]
                                                        : prev.filter(id => id !== alert.id)
                                                );
                                            }}
                                            className="mt-1"
                                        />
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={`p-2.5 rounded-xl ${getSeverityColor(alert.severity)} shadow-lg`}
                                        >
                                            {getAlertIcon(alert.alert_type)}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <span className="font-semibold text-slate-900 dark:text-white">{alert.mahasiswa?.nama}</span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">({alert.mahasiswa?.nim})</span>
                                                {getStatusBadge(alert.status)}
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {getAlertTypeName(alert.alert_type)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{alert.description}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(alert.created_at).toLocaleString('id-ID')}
                                                {alert.session?.course && ` • ${alert.session.course.nama}`}
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setReviewModal({ open: true, alert });
                                                reviewForm.setData({ status: alert.status, notes: '' });
                                            }}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 transition-all"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {alerts.data.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-12 text-center"
                            >
                                <Shield className="h-16 w-16 mx-auto text-slate-700 mb-3" />
                                <p className="text-slate-500 font-medium">Tidak ada alert ditemukan</p>
                                <p className="text-slate-600 text-sm mt-1">Sistem keamanan berjalan normal</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Pagination */}
                {alerts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: alerts.last_page }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => router.get('/admin/fraud-detection', { ...filters, page: i + 1 })}
                                className={`px-3 py-1 rounded text-sm ${
                                    alerts.current_page === i + 1 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal dengan background hitam */}
            <AnimatePresence>
                {reviewModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setReviewModal({ open: false, alert: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-2xl border border-slate-200 dark:border-slate-800/50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
                                        <Eye className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Review Alert</h3>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setReviewModal({ open: false, alert: null })}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                            {reviewModal.alert && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 rounded-xl">
                                        <p className="font-semibold text-slate-900 dark:text-white mb-1">{reviewModal.alert.mahasiswa?.nama}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{reviewModal.alert.description}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Evidence</label>
                                        <pre className="p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 overflow-auto max-h-[150px] font-mono">
                                            {JSON.stringify(reviewModal.alert.evidence, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Status</label>
                                        <select
                                            value={reviewForm.data.status}
                                            onChange={(e) => reviewForm.setData('status', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        >
                                            <option value="investigating">Investigating</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="dismissed">Dismissed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Catatan</label>
                                        <Textarea
                                            className="bg-slate-100 dark:bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            value={reviewForm.data.notes}
                                            onChange={(e) => reviewForm.setData('notes', e.target.value)}
                                            placeholder="Tambahkan catatan..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleReview}
                                            disabled={reviewForm.processing}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-50"
                                        >
                                            {reviewForm.processing ? 'Menyimpan...' : 'Simpan'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setReviewModal({ open: false, alert: null })}
                                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                                        >
                                            Batal
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
