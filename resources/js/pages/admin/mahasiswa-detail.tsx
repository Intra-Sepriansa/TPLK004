import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, User, Mail, Smartphone, MapPin, Calendar,
    CheckCircle2, Clock, XCircle, AlertTriangle, ShieldAlert,
    ChevronRight, ExternalLink, GraduationCap, Building2,
    Activity, History, FileText, BadgeCheck, MoreHorizontal,
    Share2, Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
    mahasiswa: {
        id: number;
        nama: string;
        nim: string;
        email?: string;
        photo?: string;
        fakultas?: string;
        prodi?: string;
        semester?: number;
        kelas?: string;
        created_at: string;
    };
    stats: {
        total_attendance: number;
        present: number;
        late: number;
        alpha: number;
        permit: number;
        rate: number;
    };
    recentActivity: any[];
    fraudHistory: any[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function MahasiswaDetail({ mahasiswa, stats, recentActivity, fraudHistory }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'history', label: 'Riwayat Absensi', icon: History },
        { id: 'schedule', label: 'Jadwal Kuliah', icon: Calendar },
        { id: 'fraud', label: 'Fraud Alerts', icon: ShieldAlert, count: fraudHistory.length },
    ];

    return (
        <AppLayout>
            <Head title={`Profil - ${mahasiswa.nama}`} />

            <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-900/50 p-4 md:p-8">
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-5xl mx-auto space-y-8">

                    {/* ═══════ HEADER CARD ═══════ */}
                    <div className="relative">
                        {/* Purple Banner */}
                        <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden relative shadow-2xl shadow-purple-500/20">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                            {/* Top Actions */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white z-10">
                                <Link href="/admin/mahasiswa">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors">
                                        <ArrowLeft className="h-5 w-5" />
                                    </motion.button>
                                </Link>
                                <div className="flex gap-2">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors">
                                        <Share2 className="h-5 w-5" />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Overlay */}
                        <div className="px-6 md:px-12 relative flex flex-col md:flex-row items-start md:items-end -mt-20 mb-6 gap-6">
                            {/* Avatar */}
                            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="relative shrink-0"
                            >
                                <div className="w-40 h-40 rounded-full p-1.5 bg-neutral-50 dark:bg-neutral-900 shadow-2xl">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative group">
                                        {mahasiswa.photo ? (
                                            <img src={mahasiswa.photo} alt={mahasiswa.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 text-violet-500 dark:text-violet-300">
                                                <User className="h-16 w-16" />
                                            </div>
                                        )}
                                        {/* Status Indicator */}
                                        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-neutral-900 shadow-sm" title="Active"></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Name & Badge */}
                            <div className="flex-1 pt-2 md:pt-0 md:pb-4 text-center md:text-left">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <p className="text-violet-600 dark:text-violet-400 font-bold text-sm tracking-wide uppercase mb-1">@{mahasiswa.nim}</p>
                                    <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                                        {mahasiswa.nama}
                                        <BadgeCheck className="h-8 w-8 text-blue-500 fill-blue-50 dark:fill-blue-900/30" />
                                    </h1>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-lg mt-1 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                                        <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {mahasiswa.prodi || 'Teknik Informatika'}</span>
                                        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                        <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> Sem. {mahasiswa.semester || 1} - {mahasiswa.kelas || 'Reguler'}</span>
                                    </p>
                                </motion.div>
                            </div>

                            {/* Action Button */}
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full md:w-auto pb-4">
                                <button className="w-full md:w-auto px-8 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                                    <Edit className="h-4 w-4" /> Edit Profile
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                        {[
                            { label: 'Kehadiran', value: `${stats.rate}%`, sub: 'Rate', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Hadir', value: stats.present, sub: 'Sesi', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Terlambat', value: stats.late, sub: 'Sesi', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                            { label: 'Alpha', value: stats.alpha, sub: 'Sesi', color: 'text-red-500', bg: 'bg-red-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center">
                                <span className={cn('text-xs font-bold uppercase tracking-wider mb-1', stat.color)}>{stat.label}</span>
                                <span className="text-3xl font-black text-neutral-900 dark:text-white inline-flex items-baseline gap-1">
                                    {stat.value} <span className="text-sm font-medium text-neutral-400">{stat.sub}</span>
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar px-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2',
                                    activeTab === tab.id
                                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg'
                                        : 'bg-white dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="px-2 pb-12">

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Recent Activity */}
                                <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8">
                                    <h3 className="font-bold text-xl mb-6">Aktivitas Terkini</h3>
                                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-10 before:bottom-0 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                                        {recentActivity.length === 0 ? (
                                            <p className="text-neutral-500 text-center py-6">Belum ada aktivitas.</p>
                                        ) : (
                                            recentActivity.map((log, i) => (
                                                <div key={log.id} className="relative flex items-start gap-4">
                                                    <div className={cn(
                                                        'relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 font-bold text-xs',
                                                        log.status === 'present' ? 'bg-blue-100 text-blue-600' :
                                                            log.status === 'late' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                                    )}>
                                                        {log.status === 'present' ? 'H' : log.status === 'late' ? 'T' : 'A'}
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                                {log.status === 'present' ? 'Check-in Berhasil' : log.status === 'late' ? 'Check-in Terlambat' : 'Absen'}
                                                            </p>
                                                            <span className="text-xs font-mono text-neutral-400">{new Date(log.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {log.date}</span>
                                                            <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> {log.device || 'Unknown'}</span>
                                                            {log.location && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-3 w-3" /> {log.location}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SCHEDULE (Placeholder) */}
                        {activeTab === 'schedule' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="h-8 w-8 text-neutral-400" />
                                </div>
                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Jadwal Kuliah</h3>
                                <p className="text-neutral-500">Fitur jadwal kuliah akan segera tersedia.</p>
                            </motion.div>
                        )}

                        {/* FRAUD HISTORY */}
                        {activeTab === 'fraud' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                {fraudHistory.length === 0 ? (
                                    <div className="text-center py-12 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Bersih!</h3>
                                        <p className="text-neutral-500">Mahasiswa ini tidak memiliki catatan kecurangan.</p>
                                    </div>
                                ) : (
                                    fraudHistory.map(alert => (
                                        <div key={alert.id} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                                    <ShieldAlert className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-neutral-900 dark:text-white">{alert.alert_type}</h4>
                                                    <p className="text-sm text-neutral-500">{alert.description}</p>
                                                    <p className="text-xs text-neutral-400 mt-1">{new Date(alert.created_at).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <Link href={`/admin/fraud-detection/${alert.id}`} className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                                                Detail
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </div>

                </motion.div>
            </div>
        </AppLayout>
    );
}
