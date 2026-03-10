import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, useMemo } from 'react';
import {
    AlertTriangle, ArrowLeft, Award, BookOpen, Calendar, CheckCircle2,
    ChevronLeft, ChevronRight, Clock, Flame, Grid3X3, Info, List,
    MapPin, Printer, RefreshCw, Sparkles, TrendingUp, User, Wifi, X, XCircle,
} from 'lucide-react';

import kehadiranIcon from '@/assets/mahasiswa/akademik/kehadiran.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import terlambatIcon from '@/assets/admin/dashboard/terlambat-icon.png';
import selfieIcon from '@/assets/admin/dashboard/selfie-icon.png';

interface Meeting {
    number: number;
    date: string | null;
    rawDate: string | null;
    status: 'hadir' | 'tidak-hadir' | 'belum-dimulai';
    mode: 'online' | 'offline';
    notes: string | null;
    completedAt: string | null;
}

interface Course {
    id: number; name: string; code: string; sks: 2 | 3; period: 1 | 2;
    mode: string; modeName: string; day: string; time: string; room: string; lecturer: string;
}

interface Stats { totalPertemuan: number; hadir: number; tidakHadir: number; persentase: number; }

interface Prediction {
    remainingMeetings: number; requiredAttendance: number; canAchieve75: boolean;
    maxPossiblePercentage: number; projectedPercentage: number;
}

interface Pattern {
    currentStreak: number; longestStreak: number;
    onlineTotal: number; onlineAttended: number; onlinePercentage: number;
    offlineTotal: number; offlineAttended: number; offlinePercentage: number;
}

interface Props {
    course: Course; meetings: Meeting[]; stats: Stats;
    prediction: Prediction; pattern: Pattern; isBeforeUTS: boolean;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const itemVariants = { hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } } as const;

function MeetingModal({ meeting, courseName, onClose }: { meeting: Meeting; courseName: string; onClose: () => void }) {
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Pertemuan {meeting.number}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{courseName}</p></div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="w-5 h-5 text-neutral-500" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex justify-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${meeting.status === 'hadir' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                                    meeting.status === 'tidak-hadir' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                                        'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'}`}>
                                {meeting.status === 'hadir' && <><CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Hadir</span></>}
                                {meeting.status === 'tidak-hadir' && <><XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /><span className="text-sm font-semibold text-red-700 dark:text-red-300">Tidak Hadir</span></>}
                                {meeting.status === 'belum-dimulai' && <><Clock className="w-5 h-5 text-neutral-500" /><span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Belum Dimulai</span></>}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {meeting.date && <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-neutral-400" /><div><p className="text-xs text-neutral-500">Tanggal</p><p className="text-sm font-medium text-neutral-900 dark:text-white">{meeting.date}</p></div></div>}
                            <div className="flex items-center gap-3">
                                {meeting.mode === 'online' ? <Wifi className="w-5 h-5 text-cyan-600" /> : <MapPin className="w-5 h-5 text-purple-600" />}
                                <div><p className="text-xs text-neutral-500">Mode</p><p className="text-sm font-medium text-neutral-900 dark:text-white">{meeting.mode === 'online' ? 'Online' : 'Offline (Tatap Muka)'}</p></div>
                            </div>
                            {meeting.completedAt && <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-neutral-400" /><div><p className="text-xs text-neutral-500">Waktu Absen</p><p className="text-sm font-medium text-neutral-900 dark:text-white">{meeting.completedAt}</p></div></div>}
                            {meeting.notes && <div className="flex items-start gap-3"><BookOpen className="w-5 h-5 text-neutral-400 mt-0.5" /><div><p className="text-xs text-neutral-500">Catatan</p><p className="text-sm text-neutral-700 dark:text-neutral-300">{meeting.notes}</p></div></div>}
                        </div>
                    </div>
                    <div className="p-5 border-t border-neutral-200 dark:border-neutral-800">
                        <button onClick={onClose} className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium text-sm">Tutup</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function DetailKehadiranMataKuliah({ course, meetings, stats, prediction, pattern, isBeforeUTS }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const recommendations = useMemo(() => {
        const recs: { type: 'success' | 'warning' | 'info'; title: string; message: string }[] = [];
        if (stats.persentase >= 80) recs.push({ type: 'success', title: 'Kehadiran Sangat Baik!', message: 'Pertahankan kehadiran Anda untuk hasil yang optimal.' });
        else if (stats.persentase >= 75) recs.push({ type: 'warning', title: 'Kehadiran Cukup', message: 'Anda memenuhi syarat minimal, usahakan meningkatkan.' });
        else if (stats.hadir + stats.tidakHadir > 0) recs.push({ type: 'warning', title: 'Kehadiran Kurang', message: 'Tingkatkan kehadiran untuk memenuhi syarat ujian.' });
        if (prediction.canAchieve75 && prediction.requiredAttendance > 0) recs.push({ type: 'info', title: 'Target Kehadiran', message: `Hadir di ${prediction.requiredAttendance} pertemuan lagi untuk mencapai 75%.` });
        if (pattern.currentStreak >= 3) recs.push({ type: 'success', title: 'Streak Bagus!', message: `Anda sudah hadir ${pattern.currentStreak} pertemuan berturut-turut.` });
        return recs;
    }, [stats, prediction, pattern]);

    const statCards = [
        { icon: totalIcon, title: 'Total Pertemuan', value: stats.totalPertemuan, colorConfig: { from: 'from-sky-400', to: 'to-indigo-600', bg: 'bg-sky-500', hoverShadow: 'hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10' } },
        { icon: hadirIcon, title: 'Hadir', value: stats.hadir, colorConfig: { from: 'from-emerald-400', to: 'to-teal-600', bg: 'bg-emerald-500', hoverShadow: 'hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' } },
        { icon: terlambatIcon, title: 'Tidak Hadir', value: stats.tidakHadir, colorConfig: { from: 'from-rose-400', to: 'to-red-600', bg: 'bg-rose-500', hoverShadow: 'hover:shadow-rose-500/10', gradientBg: 'from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10' } },
        { icon: selfieIcon, title: 'Persentase', value: Math.round(stats.persentase), suffix: '%', colorConfig: { from: 'from-amber-400', to: 'to-orange-600', bg: 'bg-amber-500', hoverShadow: 'hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' } },
    ];

    return (
        <StudentLayout>
            <Head title={`Kehadiran - ${course.name}`} />
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">

                {/* ═══ HERO HEADER ═══ */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(10)].map((_, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 0.5, 0], scale: [0, 1, 0], y: [0, -70] }}
                                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
                                className="absolute" style={{ left: `${Math.random() * 100}%`, top: `${80 + Math.random() * 20}%` }}>
                                {i % 3 === 0 ? <BookOpen className="h-3 w-3 text-white/40" /> : i % 3 === 1 ? <CheckCircle2 className="h-3 w-3 text-white/40" /> : <Sparkles className="h-3 w-3 text-white/40" />}
                            </motion.div>
                        ))}
                    </div>
                    <div className="relative z-10">
                        <Link href="/user/akademik/kehadiran" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white transition-colors mb-4 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Monitoring Kehadiran
                        </Link>
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                                <motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24" initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }} whileHover={{ scale: 1.05, rotate: 5 }}>
                                    <img src={kehadiranIcon} alt="Detail Kehadiran" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">{course.code}</span>
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">SKS {course.sks}</span>
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">Periode {course.period}</span>
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">{isBeforeUTS ? 'Sebelum UTS' : 'Setelah UTS'}</span>
                                    </div>
                                    <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-2xl sm:text-3xl font-bold text-white">{course.name}</motion.h1>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-2 flex flex-wrap items-center gap-4 text-sm text-indigo-100">
                                        <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{course.lecturer}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.day}, {course.time}</span>
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{course.room}</span>
                                        <span className="flex items-center gap-1.5">{course.mode === 'online' ? <Wifi className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}{course.modeName}</span>
                                    </motion.div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full sm:w-auto items-center sm:items-end gap-2 mt-4 sm:mt-0">
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10">
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-center sm:text-right">
                                        <p className="text-2xl font-bold tabular-nums">{stats.persentase}%</p>
                                        <p className="text-[10px] text-indigo-200">Kehadiran</p>
                                    </div>
                                </motion.div>
                                {pattern.currentStreak > 0 && (
                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: 'spring' }}
                                        className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-xl border border-white/10">
                                        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}><Flame className="h-4 w-4 text-orange-300" /></motion.div>
                                        <span className="font-bold">{pattern.currentStreak}</span><span className="text-xs text-indigo-100">streak</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
                            className="flex flex-nowrap w-full overflow-x-auto gap-2 sm:gap-3 mt-6 pt-6 pb-2 border-t border-white/10 [&::-webkit-scrollbar]:hidden">
                            {[{ href: '/user/akademik/kehadiran', icon: ArrowLeft, label: 'Semua MK' }, { href: '/user/akademik', icon: BookOpen, label: 'Akademik' }].map((item, i) => (
                                <motion.a key={item.href} href={item.href}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold shadow-lg transition hover:-translate-y-0.5 ${i === 0 ? 'bg-white text-indigo-600' : 'bg-white/20 text-white backdrop-blur-md border border-white/20 hover:bg-white/30'}`}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <item.icon className="h-3.5 w-3.5" />{item.label}
                                </motion.a>
                            ))}
                            <motion.button onClick={() => window.print()}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-md border border-white/20 hover:bg-white/30 shadow-lg"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Printer className="h-3.5 w-3.5" />Print</motion.button>
                            <motion.button onClick={() => router.reload()}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-md border border-white/20 hover:bg-white/30 shadow-lg"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><RefreshCw className="h-3.5 w-3.5" />Refresh</motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══ STATS CARDS ═══ */}
                <motion.div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}>
                    {statCards.map((stat, index) => {
                        const ck = `stat-${index}`;
                        return (
                            <motion.div key={stat.title}
                                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${stat.colorConfig.hoverShadow} dark:border-white/5`}
                                variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } }}
                                whileHover={{ scale: 1.04, y: -4 }} onHoverStart={() => setHoveredCard(ck)} onHoverEnd={() => setHoveredCard(null)}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                                <motion.div initial={false} animate={{ scale: hoveredCard === ck ? 1.5 : 1, opacity: hoveredCard === ck ? 0.4 : 0.2 }}
                                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl`} />
                                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center">
                                        <img src={stat.icon} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.title}</p>
                                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══ PROGRESS & PREDICTION ═══ */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"><TrendingUp className="h-5 w-5" /></div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Progress Kehadiran</h3><p className="text-xs text-neutral-500">{stats.hadir} dari {stats.totalPertemuan} pertemuan</p></div>
                        </div>
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-neutral-200 dark:text-neutral-700" />
                                    <motion.circle cx="80" cy="80" r="70" stroke={stats.persentase >= 75 ? '#10b981' : '#ef4444'} strokeWidth="8" fill="none"
                                        strokeLinecap="round" initial={{ strokeDasharray: '0 440' }} animate={{ strokeDasharray: `${stats.persentase * 4.4} 440` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">{stats.persentase}%</span>
                                    <span className="text-xs text-neutral-500 mt-1">{stats.hadir}/{stats.totalPertemuan}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div><div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1"><span>Hadir</span><span>{stats.hadir}</span></div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2"><motion.div initial={{ width: 0 }} animate={{ width: `${stats.totalPertemuan > 0 ? (stats.hadir / stats.totalPertemuan) * 100 : 0}%` }} transition={{ duration: 1 }} className="bg-emerald-500 h-2 rounded-full" /></div></div>
                            <div><div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1"><span>Tidak Hadir</span><span>{stats.tidakHadir}</span></div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2"><motion.div initial={{ width: 0 }} animate={{ width: `${stats.totalPertemuan > 0 ? (stats.tidakHadir / stats.totalPertemuan) * 100 : 0}%` }} transition={{ duration: 1 }} className="bg-red-500 h-2 rounded-full" /></div></div>
                        </div>
                        {stats.persentase < 75 && stats.hadir + stats.tidakHadir > 0 && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-red-700 dark:text-red-400">Kehadiran di bawah 75%! Perlu hadir di {Math.ceil(stats.totalPertemuan * 0.75) - stats.hadir} pertemuan lagi.</p>
                            </div>
                        )}
                    </div>

                    {/* Prediction */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30"><Sparkles className="h-5 w-5" /></div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Prediksi Kehadiran</h3><p className="text-xs text-neutral-500">{prediction.remainingMeetings} pertemuan tersisa</p></div>
                        </div>
                        {prediction.canAchieve75 ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                    <div><p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Anda Bisa Mencapai 75%!</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Hadir di {prediction.requiredAttendance} dari {prediction.remainingMeetings} pertemuan tersisa</p></div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Pertemuan Tersisa</span><span className="font-bold text-neutral-900 dark:text-white">{prediction.remainingMeetings}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Harus Hadir Minimal</span><span className="font-bold text-neutral-900 dark:text-white">{prediction.requiredAttendance}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Boleh Tidak Hadir</span><span className="font-bold text-neutral-900 dark:text-white">{prediction.remainingMeetings - prediction.requiredAttendance}</span></div>
                                </div>
                                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                    <p className="text-xs text-neutral-500 mb-2">Proyeksi Akhir Semester</p>
                                    <div className="flex items-center gap-2"><div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5"><motion.div initial={{ width: 0 }} animate={{ width: `${prediction.projectedPercentage}%` }} transition={{ duration: 1 }} className="bg-emerald-500 h-2.5 rounded-full" /></div>
                                        <span className="text-sm font-bold text-emerald-600">{prediction.projectedPercentage}%</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div><p className="text-sm font-bold text-red-800 dark:text-red-300">Tidak Bisa Mencapai 75%</p>
                                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">Maksimal: {prediction.maxPossiblePercentage}%</p></div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Pertemuan Tersisa</span><span className="font-bold text-neutral-900 dark:text-white">{prediction.remainingMeetings}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-600 dark:text-neutral-400">Maksimal Kehadiran</span><span className="font-bold text-red-600">{stats.hadir + prediction.remainingMeetings}/{stats.totalPertemuan}</span></div>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <p className="text-xs text-amber-800 dark:text-amber-300">💡 Hubungi dosen untuk konsultasi mengenai kehadiran Anda</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ═══ VIEW TOGGLE ═══ */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Tampilan Pertemuan</h3>
                        <div className="flex gap-2">
                            {([['grid', Grid3X3, 'Grid'], ['timeline', List, 'Timeline']] as const).map(([mode, Icon, label]) => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === mode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                    <Icon className="w-4 h-4" />{label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ GRID VIEW ═══ */}
                {viewMode === 'grid' && (
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-5 sm:p-6">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">Daftar Pertemuan ({stats.totalPertemuan} — SKS {course.sks})</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3">
                            {meetings.map((m, idx) => {
                                const isH = m.status === 'hadir', isA = m.status === 'tidak-hadir', isOn = m.mode === 'online';
                                return (
                                    <motion.button key={m.number} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.02 }}
                                        whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedMeeting(m)}
                                        className={`relative rounded-xl p-2.5 sm:p-3 border-2 transition-all cursor-pointer group ${isH ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 shadow-md shadow-emerald-500/10' : isA ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 shadow-md shadow-red-500/10' : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700'}`}>
                                        <div className="text-center mb-1.5">
                                            <p className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">Pertemuan</p>
                                            <p className={`text-xl sm:text-2xl font-extrabold tabular-nums ${isH ? 'text-emerald-600 dark:text-emerald-400' : isA ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}>{m.number}</p>
                                        </div>
                                        <div className={`flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-semibold ${isOn ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                                            {isOn ? <><Wifi className="w-2.5 h-2.5" /><span>Online</span></> : <><MapPin className="w-2.5 h-2.5" /><span>Offline</span></>}
                                        </div>
                                        {isH && <div className="absolute -top-1.5 -right-1.5"><div className="bg-emerald-500 rounded-full p-0.5 shadow-lg"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div></div>}
                                        {isA && <div className="absolute -top-1.5 -right-1.5"><div className="bg-red-500 rounded-full p-0.5 shadow-lg"><X className="w-3.5 h-3.5 text-white" /></div></div>}
                                        {m.date && <p className="text-[8px] sm:text-[9px] text-neutral-400 text-center mt-1.5 truncate">{m.date}</p>}
                                    </motion.button>
                                );
                            })}
                        </div>
                        <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-700/50 flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div><span className="text-neutral-600 dark:text-neutral-400">Hadir</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center"><X className="w-2.5 h-2.5 text-white" /></div><span className="text-neutral-600 dark:text-neutral-400">Tidak Hadir</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-neutral-300 dark:bg-neutral-600 rounded-full" /><span className="text-neutral-600 dark:text-neutral-400">Belum Terlaksana</span></div>
                            <div className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-cyan-600" /><span className="text-neutral-600 dark:text-neutral-400">Online</span></div>
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-600" /><span className="text-neutral-600 dark:text-neutral-400">Offline</span></div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ TIMELINE VIEW ═══ */}
                {viewMode === 'timeline' && (
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-5 sm:p-6">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-6">Timeline Pertemuan</h3>
                        <div className="space-y-2">
                            {meetings.map((m, idx) => {
                                const isH = m.status === 'hadir', isA = m.status === 'tidak-hadir';
                                return (
                                    <motion.div key={m.number} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                                        className="relative flex gap-4" onClick={() => setSelectedMeeting(m)}>
                                        {idx < meetings.length - 1 && <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />}
                                        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-md ${isH ? 'bg-emerald-500' : isA ? 'bg-red-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                                            {isH ? <CheckCircle2 className="w-5 h-5 text-white" /> : isA ? <XCircle className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
                                        </div>
                                        <div className="flex-1 pb-4 cursor-pointer">
                                            <div className="bg-neutral-50/80 dark:bg-neutral-800/60 backdrop-blur rounded-xl p-4 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors border border-neutral-200/50 dark:border-neutral-700/50">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg">P{m.number}</span>
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${m.mode === 'online' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                                                                {m.mode === 'online' ? 'Online' : 'Offline'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${isH ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : isA ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
                                                                {isH ? 'Hadir' : isA ? 'Tidak Hadir' : 'Belum Dimulai'}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Pertemuan {m.number}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                            {m.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.date}</span>}
                                                            {m.completedAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Absen: {m.completedAt}</span>}
                                                        </div>
                                                        {m.notes && <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 italic">"{m.notes}"</p>}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ═══ PATTERN ANALYSIS & RECOMMENDATIONS ═══ */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pattern */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30"><Flame className="h-5 w-5" /></div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Pola Kehadiran</h3><p className="text-xs text-neutral-500">Analisis kehadiran Anda</p></div>
                        </div>
                        {pattern.currentStreak > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl mb-4">
                                <Flame className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div><p className="text-sm font-bold text-orange-800 dark:text-orange-300">Streak: {pattern.currentStreak} Pertemuan</p>
                                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">Rekor terbaik: {pattern.longestStreak} berturut-turut</p></div>
                            </div>
                        )}
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Kehadiran per Mode</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                                <div className="flex items-center gap-2 mb-1"><Wifi className="w-4 h-4 text-cyan-600" /><span className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">Online</span></div>
                                <p className="text-2xl font-extrabold text-cyan-900 dark:text-cyan-200">{pattern.onlinePercentage}%</p>
                                <p className="text-xs text-cyan-700 dark:text-cyan-400 mt-0.5">{pattern.onlineAttended}/{pattern.onlineTotal} pertemuan</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-1"><MapPin className="w-4 h-4 text-purple-600" /><span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Offline</span></div>
                                <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-200">{pattern.offlinePercentage}%</p>
                                <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">{pattern.offlineAttended}/{pattern.offlineTotal} pertemuan</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30"><Info className="h-5 w-5" /></div>
                            <div><h3 className="font-bold text-neutral-900 dark:text-white">Rekomendasi</h3><p className="text-xs text-neutral-500">Saran untuk kehadiran Anda</p></div>
                        </div>
                        <div className="space-y-3">
                            {recommendations.length === 0 ? (
                                <p className="text-sm text-neutral-500 text-center py-4">Belum ada data cukup untuk rekomendasi.</p>
                            ) : recommendations.map((rec, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${rec.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : rec.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800'}`}>
                                    {rec.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : rec.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" /> : <Info className="w-5 h-5 text-sky-600 mt-0.5" />}
                                    <div><p className={`text-sm font-bold ${rec.type === 'success' ? 'text-emerald-800 dark:text-emerald-300' : rec.type === 'warning' ? 'text-amber-800 dark:text-amber-300' : 'text-sky-800 dark:text-sky-300'}`}>{rec.title}</p>
                                        <p className={`text-xs mt-0.5 ${rec.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : rec.type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-sky-700 dark:text-sky-400'}`}>{rec.message}</p></div>
                                </div>
                            ))}
                        </div>
                        {stats.persentase === 100 && stats.hadir > 0 && (
                            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                                <Award className="w-6 h-6 text-emerald-600" />
                                <div><p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Perfect Attendance! 🎉</p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Anda hadir di semua pertemuan</p></div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
            {selectedMeeting && <MeetingModal meeting={selectedMeeting} courseName={course.name} onClose={() => setSelectedMeeting(null)} />}
        </StudentLayout>
    );
}
