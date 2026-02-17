import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ShieldAlert, MapPin, Camera, Clock, Smartphone,
    CheckCircle, XCircle, Search, BrainCircuit, Activity,
    User, Calendar, FileText, ChevronRight, ExternalLink, Minimize2,
    Maximize2, AlertTriangle, ShieldCheck, ShieldX, Save,
    Lock, Unlock, History, Fingerprint
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FraudAlert {
    id: number;
    mahasiswa_id: number;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: Record<string, any>;
    status: 'pending' | 'investigating' | 'confirmed' | 'dismissed';
    created_at: string;
    review_notes?: string;
    reviewed_at?: string;
    reviewed_by?: number;
    mahasiswa?: { nama: string; nim: string; prodi?: string; photo?: string; email?: string };
    session?: { course?: { nama: string; code?: string }; start_at?: string };
    attendanceLog?: {
        scanned_at: string;
        latitude?: number;
        longitude?: number;
        device_model?: string;
        device_id?: string;
        selfie_path?: string;
        ip_address?: string;
    };
}

interface Props {
    alert: FraudAlert;
    relatedAlerts: FraudAlert[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const ALERT_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; darkColor: string; bg: string; border: string }> = {
    gps_spoofing: { icon: MapPin, label: 'GPS Spoofing', color: 'text-red-500', darkColor: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    rapid_location_change: { icon: Activity, label: 'Perpindahan Cepat', color: 'text-orange-500', darkColor: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    duplicate_selfie: { icon: Camera, label: 'Selfie Duplikat', color: 'text-violet-500', darkColor: '#8b5cf6', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    device_mismatch: { icon: Smartphone, label: 'Perangkat Berbeda', color: 'text-cyan-500', darkColor: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    time_anomaly: { icon: Clock, label: 'Anomali Waktu', color: 'text-amber-500', darkColor: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    suspicious_pattern: { icon: BrainCircuit, label: 'Pola Mencurigakan', color: 'text-emerald-500', darkColor: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; gradient: string }> = {
    critical: { label: 'CRITICAL', color: 'text-red-100', bg: 'bg-red-500/20', border: 'border-red-500/50', gradient: 'from-red-600 to-rose-700' },
    high: { label: 'HIGH', color: 'text-orange-100', bg: 'bg-orange-500/20', border: 'border-orange-500/50', gradient: 'from-orange-500 to-red-600' },
    medium: { label: 'MEDIUM', color: 'text-yellow-100', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', gradient: 'from-yellow-500 to-orange-600' },
    low: { label: 'LOW', color: 'text-blue-100', bg: 'bg-blue-500/20', border: 'border-blue-500/50', gradient: 'from-blue-500 to-cyan-600' },
};

export default function FraudDetectionDetail({ alert, relatedAlerts }: Props) {
    const { data, setData, patch, processing } = useForm({
        status: alert.status,
        notes: alert.review_notes || '',
    });

    const typeConf = ALERT_TYPE_CONFIG[alert.alert_type] || ALERT_TYPE_CONFIG.suspicious_pattern;
    const sevConf = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;

    const handleUpdate = () => {
        patch(`/admin/fraud-detection/${alert.id}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                // Ideally show a toast here. For now, rely on Inertia reload.
                // alert('Review status updated successfully'); 
                // We'll trust the flash message if the Layout supports it.
            },
            onError: (errors: any) => {
                console.error('Review failed', errors);
                window.alert('Gagal menyimpan review. Cek konsol.');
            }
        });
    };

    return (
        <AppLayout>
            <Head title={`Fraud Detail - #${alert.id}`} />

            <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-900/50">
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-8 space-y-8 w-full max-w-[2000px] mx-auto">

                    {/* ═══════ MEGA HEADER ═══════ */}
                    <div className="relative rounded-[2.5rem] overflow-hidden min-h-[220px] flex items-end">
                        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-90', sevConf.gradient)} />
                        {/* Animated Orbs */}
                        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }}
                            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

                        <div className="relative z-10 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white">
                            <div className="space-y-4 max-w-2xl">
                                <Link href="/admin/fraud-detection" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-sm font-medium border border-white/10 mb-2">
                                    <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Alert
                                </Link>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                    {typeConf.label}
                                </h1>
                                <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                                    {alert.description}
                                </p>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <span className={cn('px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 uppercase tracking-wider bg-black/20 border-white/20')}>
                                        <AlertTriangle className="h-3 w-3" /> {sevConf.label} SEVERITY
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 uppercase tracking-wider bg-black/20 border-white/20">
                                        <History className="h-3 w-3" /> {new Date(alert.created_at).toLocaleString('id-ID')}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 uppercase tracking-wider bg-black/20 border-white/20">
                                        ID: #{alert.id}
                                    </span>
                                </div>
                            </div>

                            {/* Key Stats / Quick Actions */}
                            <div className="flex gap-4">
                                <motion.div whileHover={{ y: -5 }} className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                                    <p className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Risk Level</p>
                                    <p className="text-3xl font-black uppercase text-white">{sevConf.label}</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* ═══════ LEFT COLUMN (8 cols) ═══════ */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* EVIDENCE CARD */}
                            <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-neutral-200/50 dark:shadow-black/50">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <Search className="h-6 w-6 text-blue-500" />
                                            Bukti & Data Teknis
                                        </h2>
                                        <div className="flex gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-xs font-mono text-neutral-400">EVIDENCE_LOG_V2</span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Map Visualization */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Geolocation Data
                                            </h3>
                                            <div className="aspect-square rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 relative overflow-hidden group/map">
                                                {/* Mock Map */}
                                                {/* Map Placeholder */}
                                                <div className="absolute inset-0 opacity-50 bg-neutral-900 group-hover/map:opacity-40 transition-all duration-700" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="relative">
                                                        <span className="absolute -inset-4 rounded-full bg-blue-500/30 animate-ping" />
                                                        <span className="relative flex h-4 w-4">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-neutral-900"></span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl">
                                                    <div className="flex justify-between items-center text-xs font-mono">
                                                        <span className="text-neutral-500">LAT: {alert.attendanceLog?.latitude || 'N/A'}</span>
                                                        <span className="text-neutral-500">LNG: {alert.attendanceLog?.longitude || 'N/A'}</span>
                                                    </div>
                                                    <div className="mt-1 text-xs font-bold text-neutral-900 dark:text-white">
                                                        Distance: {alert.evidence?.distance ? `${alert.evidence.distance}m` : 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Device & Validation Data */}
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                                                    <Smartphone className="h-4 w-4" /> Device Fingerprint
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800">
                                                                <Smartphone className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-neutral-500 uppercase">Device Model</p>
                                                                <p className="font-bold text-neutral-900 dark:text-white">{alert.attendanceLog?.device_model || 'Unknown Device'}</p>
                                                            </div>
                                                        </div>
                                                        {alert.attendanceLog?.device_id && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800">
                                                                <Fingerprint className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-neutral-500 uppercase">IP Address</p>
                                                                <p className="font-bold text-neutral-900 dark:text-white">{alert.attendanceLog?.ip_address || '192.168.x.x'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                                                    <BrainCircuit className="h-4 w-4" /> Raw Evidence Log
                                                </h3>
                                                <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-500 font-mono text-xs overflow-auto max-h-40 border border-neutral-800 shadow-inner">
                                                    {JSON.stringify(alert.evidence, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* HISTORY LIST */}
                            <motion.div variants={itemVariants} className="rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl">
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                    <History className="h-6 w-6 text-purple-500" /> Riwayat Alert
                                </h3>
                                <div className="space-y-4">
                                    {relatedAlerts.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                            <p className="text-neutral-500">Tidak ada riwayat alert sebelumnya.</p>
                                        </div>
                                    ) : (
                                        relatedAlerts.map((h, i) => (
                                            <motion.div key={h.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn('p-3 rounded-xl text-white shadow-lg', ALERT_TYPE_CONFIG[h.alert_type]?.bg)}>
                                                        <AlertTriangle className={cn('h-5 w-5', ALERT_TYPE_CONFIG[h.alert_type]?.color)} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 dark:text-white">{ALERT_TYPE_CONFIG[h.alert_type]?.label}</p>
                                                        <p className="text-sm text-neutral-500">{new Date(h.created_at).toLocaleString('id-ID')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-4 md:mt-0">
                                                    <span className={cn('px-3 py-1 rounded-full text-xs font-bold border',
                                                        h.status === 'confirmed' ? 'bg-red-100 text-red-600 border-red-200' :
                                                            h.status === 'dismissed' ? 'bg-green-100 text-green-600 border-green-200' :
                                                                'bg-neutral-100 text-neutral-600 border-neutral-200'
                                                    )}>
                                                        {h.status.toUpperCase()}
                                                    </span>
                                                    <Link href={`/admin/fraud-detection/${h.id}`} className="p-2 rounded-full hover:bg-white dark:hover:bg-black/20 text-neutral-400 hover:text-blue-500 transition-colors">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                        </div>

                        {/* ═══════ RIGHT COLUMN (4 cols) ═══════ */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* STUDENT PROFILE CARD */}
                            <motion.div variants={itemVariants} className="sticky top-6">
                                <div className="rounded-[2.5rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-t-[2rem]" />

                                    <div className="relative pt-16 px-6 pb-8 text-center">
                                        <div className="relative mx-auto w-32 h-32 mb-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-[2rem] rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-50 blur-xl" />
                                            <div className="relative w-full h-full bg-white dark:bg-black rounded-[2rem] p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                                                {alert.mahasiswa?.photo ? (
                                                    <img src={alert.mahasiswa.photo} alt={alert.mahasiswa.nama} className="w-full h-full object-cover rounded-[1.8rem]" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-[1.8rem]">
                                                        <User className="h-12 w-12 text-neutral-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-1">{alert.mahasiswa?.nama}</h2>
                                        <p className="text-neutral-500 font-mono text-sm tracking-wider mb-6">{alert.mahasiswa?.nim}</p>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                                                <p className="text-xs text-neutral-500 mb-1">PRODI</p>
                                                <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{alert.mahasiswa?.prodi || 'TI'}</p>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                                                <p className="text-xs text-neutral-500 mb-1">TOTAL ALERTS</p>
                                                <p className="font-bold text-sm text-neutral-900 dark:text-white">{relatedAlerts.length + 1}</p>
                                            </div>
                                        </div>

                                        <Link href={`/admin/mahasiswa/${alert.mahasiswa_id}`} className="w-full py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2 text-sm font-bold transition-all">
                                            Lihat Profil Lengkap <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </Link>
                                    </div>
                                </div>

                                {/* REVIEW PANEL */}
                                <div className="mt-8 rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-8">
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                        <ShieldCheck className="h-6 w-6 text-emerald-500" /> Review Panel
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 block uppercase tracking-wide">Status Keputusan</label>
                                            <div className="space-y-2">
                                                {(['pending', 'investigating', 'confirmed', 'dismissed'] as const).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setData('status', s)}
                                                        className={cn(
                                                            'w-full flex items-center justify-between px-5 py-4 rounded-xl border text-sm font-bold transition-all',
                                                            data.status === s
                                                                ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                                                                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                                        )}
                                                    >
                                                        <span className="capitalize">{s}</span>
                                                        {data.status === s && <CheckCircle className="h-5 w-5" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 block uppercase tracking-wide">Catatan Investigator</label>
                                            <Textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Berikan alasan keputusan ini..."
                                                rows={5}
                                                className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 resize-none focus:ring-blue-500 rounded-2xl p-4 text-sm"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleUpdate}
                                            disabled={processing}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/20 h-14 rounded-2xl text-base font-bold tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> SAVING...</span>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 mr-2" /> SIMPAN KEPUTUSAN
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AppLayout>
    );
}
