import { Head, router, useForm } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Calendar, Clock, BookOpen, Users, MapPin, Map,
    Camera, ScanFace, FileText, Settings, RadioReceiver,
    ArrowLeft, CheckCircle2, AlertCircle, PlusCircle, Video
} from 'lucide-react';
import { useState, useEffect } from 'react';
import SesiBaruIcon from '@/assets/admin/sesi-absen/sesi-baru-icon.png';

// Interfaces
interface Course {
    id: number;
    nama: string;
    sks: number;
    kelas?: string;
    jadwal?: string;
    next_meeting_number?: number;
}

interface PageProps {
    dosen: { id: number; nama: string };
    courses: Course[];
    request_course_id?: number | null;
}

// Animation configurations
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
};

const hoverGlow = "hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]";

export default function CreateSession({ dosen, courses, request_course_id }: PageProps) {
    const defaultCourseId = request_course_id || (courses.length > 0 ? courses[0].id : '');

    const { data, setData, post, processing, errors } = useForm({
        course_id: defaultCourseId,
        title: '',
        meeting_number: 1,
        start_at: new Date().toISOString().slice(0, 16),
        end_at: new Date(new Date().getTime() + 100 * 60000).toISOString().slice(0, 16),
        auto_activate: true,
        // Advance UI mock features
        require_ai_selfie: true,
        enable_geofence: false,
        geofence_radius: 50,
        broadcast_notification: false,
    });

    // Extract query parameter on mount if passed manually via React router (though Inertia handles it via props)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const courseIdQuery = urlParams.get('course_id');
        if (courseIdQuery && !request_course_id) {
            setData('course_id', Number(courseIdQuery));
        }
    }, []);

    // Auto-update meeting number when course selection changes
    useEffect(() => {
        if (data.course_id) {
            const course = courses.find((c) => c.id === Number(data.course_id));
            if (course && course.next_meeting_number) {
                setData('meeting_number', course.next_meeting_number);
            }
        }
    }, [data.course_id, courses]);

    const selectedCourse = courses.find((c) => c.id === Number(data.course_id));

    // Handle Time Presets
    const setTimePreset = (type: 'now' | 'schedule' | 'night') => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;

        if (type === 'now') {
            const startStr = new Date(now.getTime() - offset).toISOString().slice(0, 16);
            // Default 100 mins
            const endStr = new Date(now.getTime() - offset + 100 * 60000).toISOString().slice(0, 16);
            setData(d => ({ ...d, start_at: startStr, end_at: endStr }));
        } else if (type === 'schedule') {
            // Mock schedule: next day 08:00
            const tmrw = new Date(now.getTime() + 86400000);
            tmrw.setHours(8, 0, 0, 0);
            const startStr = new Date(tmrw.getTime() - offset).toISOString().slice(0, 16);
            const endStr = new Date(tmrw.getTime() - offset + 100 * 60000).toISOString().slice(0, 16);
            setData(d => ({ ...d, start_at: startStr, end_at: endStr }));
        } else if (type === 'night') {
            // Today 19:00
            const night = new Date();
            night.setHours(19, 0, 0, 0);
            const startStr = new Date(night.getTime() - offset).toISOString().slice(0, 16);
            const endStr = new Date(night.getTime() - offset + 150 * 60000).toISOString().slice(0, 16);
            setData(d => ({ ...d, start_at: startStr, end_at: endStr }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dosen/sessions');
    };

    return (
        <DosenLayout>
            <Head title="Buat Sesi Absen Baru" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto"
            >
                {/* ═══════ HEADER ANIMATED SPHERE ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl isolate">
                    <div className="absolute inset-0 bg-neutral-900 z-0" />

                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-600 z-0 opacity-90"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            filter: ['hue-rotate(0deg)', 'hue-rotate(15deg)', 'hue-rotate(0deg)'],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Grain Noise & Hover Orbs */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/40 rounded-full blur-[100px] mix-blend-screen" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/40 rounded-full blur-[100px] mix-blend-screen" />

                    {/* Floating Orbs (Subtle Movement) */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full border border-white/20 bg-white/5 blur-sm mix-blend-overlay"
                            style={{
                                width: Math.random() * 150 + 50,
                                height: Math.random() * 150 + 50,
                                left: `${Math.random() * 80 + 10}%`,
                                top: `${Math.random() * 80 + 10}%`,
                            }}
                            animate={{
                                y: [0, Math.random() * -50, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}

                    <div className="relative z-10">
                        <motion.button
                            onClick={() => router.visit('/dosen/sesi-absen')}
                            whileHover={{ x: -5, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8 hover:bg-white/20 transition-all group"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </motion.button>

                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="relative shrink-0"
                            >
                                <img src={SesiBaruIcon} alt="Sesi Baru" className="h-20 w-20 object-contain drop-shadow-2xl pointer-events-none" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm mb-2">
                                    Mulai Sesi Baru
                                </h1>
                                <p className="text-indigo-100 text-lg font-medium max-w-xl">
                                    Konfigurasi presensi cerdas Anda. Sistem AI akan otomatis memvalidasi kehadiran mahasiswa secara real-time.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ MAIN CONTENT 2-COLUMN LAYOUT ═══════ */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Configuration Form */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Pemilihan Kelas */}
                        <motion.div variants={itemVariants} className={`rounded-[2.5rem] border border-white/10 bg-white/5 dark:bg-neutral-900/60 p-6 md:p-8 shadow-xl backdrop-blur-3xl transition-all ${hoverGlow}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                    <BookOpen className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Pilih Kelas / Mata Kuliah</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {courses.map(course => (
                                    <motion.div
                                        key={course.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setData('course_id', course.id)}
                                        className={`relative cursor-pointer overflow-hidden rounded-[1.5rem] p-5 border transition-all ${Number(data.course_id) === course.id
                                            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 dark:border-white/5 dark:bg-neutral-800/40'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg">{course.nama}</h3>
                                            {Number(data.course_id) === course.id && (
                                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
                                            )}
                                        </div>
                                        <div className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.kelas || 'Reguler A'}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.sks} SKS</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            {errors.course_id && <p className="text-red-500 text-xs mt-2">{errors.course_id}</p>}
                        </motion.div>

                        {/* 2. Topik & Waktu Presets */}
                        <motion.div variants={itemVariants} className={`rounded-[2.5rem] border border-white/10 bg-white/5 dark:bg-neutral-900/60 p-6 md:p-8 shadow-xl backdrop-blur-3xl transition-all ${hoverGlow}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-fuchsia-500/20 rounded-2xl">
                                    <Calendar className="h-6 w-6 text-fuchsia-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Jadwal & Topik Perkuliahan</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Pertemuan Ke-</label>
                                    <div className="flex items-center">
                                        <button type="button" onClick={() => setData('meeting_number', Math.max(1, data.meeting_number - 1))} className="px-4 py-3 bg-neutral-200 dark:bg-neutral-800 rounded-l-xl text-neutral-700 dark:text-white font-bold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">-</button>
                                        <input
                                            type="number"
                                            value={data.meeting_number}
                                            onChange={e => setData('meeting_number', parseInt(e.target.value) || 1)}
                                            className="w-full text-center py-3 bg-white/50 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800 font-black text-xl text-neutral-900 dark:text-white focus:ring-0 focus:outline-none"
                                            min="1"
                                        />
                                        <button type="button" onClick={() => setData('meeting_number', data.meeting_number + 1)} className="px-4 py-3 bg-neutral-200 dark:bg-neutral-800 rounded-r-xl text-neutral-700 dark:text-white font-bold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">+</button>
                                    </div>
                                    {errors.meeting_number && <p className="text-red-500 text-xs mt-1">{errors.meeting_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Topik (Opsional)</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="Misal: Pengantar AI..."
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Quick Time Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => setTimePreset('now')} className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">Mulai Sekarang</button>
                                    <button type="button" onClick={() => setTimePreset('schedule')} className="px-4 py-2 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">Besok Pagi (08:00)</button>
                                    <button type="button" onClick={() => setTimePreset('night')} className="px-4 py-2 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all">Shift Malam (19:00)</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Waktu Mulai</label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_at}
                                        onChange={e => setData('start_at', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    {errors.start_at && <p className="text-red-500 text-xs mt-1">{errors.start_at}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Waktu Selesai</label>
                                    <input
                                        type="datetime-local"
                                        value={data.end_at}
                                        onChange={e => setData('end_at', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    {errors.end_at && <p className="text-red-500 text-xs mt-1">{errors.end_at}</p>}
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Security & Automation (Anti-Titip Absen) */}
                        <motion.div variants={itemVariants} className={`rounded-[2.5rem] border border-white/10 bg-white/5 dark:bg-neutral-900/60 p-6 md:p-8 shadow-xl backdrop-blur-3xl transition-all ${hoverGlow}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <ScanFace className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Smart Security (Anti-Titip Absen)</h2>
                            </div>

                            <div className="space-y-6">
                                {/* AI Selfie Toggle */}
                                <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <div className="pt-1">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${data.require_ai_selfie ? 'bg-emerald-500' : 'bg-neutral-600'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${data.require_ai_selfie ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={data.require_ai_selfie}
                                        onChange={e => setData('require_ai_selfie', e.target.checked)}
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                            Wajibkan Foto Selfie AI <SparkleIcon />
                                        </p>
                                        <p className="text-sm text-neutral-500">Menganalisis wajah (Face Match) dan liveness untuk mencegah pemalsuan identitas.</p>
                                    </div>
                                </label>

                                {/* Geofence Toggle & Slider */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <label className="flex items-start gap-4 cursor-pointer">
                                        <div className="pt-1">
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${data.enable_geofence ? 'bg-blue-500' : 'bg-neutral-600'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${data.enable_geofence ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={data.enable_geofence}
                                            onChange={e => setData('enable_geofence', e.target.checked)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                                Batas Lokasi (Geofencing) <MapPin className="h-4 w-4 text-blue-400" />
                                            </p>
                                            <p className="text-sm text-neutral-500 mb-4">Mahasiswa hanya bisa absen jika berada dalam radius tertentu dari titik tengah kelas.</p>

                                            <AnimatePresence>
                                                {data.enable_geofence && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-2">
                                                            <div className="flex justify-between text-xs text-neutral-400 mb-2 font-medium">
                                                                <span>Ketat (10M)</span>
                                                                <span className="text-blue-400 font-bold">{data.geofence_radius} Meter</span>
                                                                <span>Longgar (250M)</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="10"
                                                                max="250"
                                                                step="10"
                                                                value={data.geofence_radius}
                                                                onChange={e => setData('geofence_radius', parseInt(e.target.value))}
                                                                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </label>
                                </div>

                                {/* Automation & Broadcast */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={data.auto_activate}
                                            onChange={e => setData('auto_activate', e.target.checked)}
                                            className="w-5 h-5 rounded border-neutral-600 text-indigo-500 focus:ring-indigo-500 bg-transparent"
                                        />
                                        <span className="text-sm font-medium text-neutral-300">Otomatis Aktif Saat Jadwal</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={data.broadcast_notification}
                                            onChange={e => setData('broadcast_notification', e.target.checked)}
                                            className="w-5 h-5 rounded border-neutral-600 text-fuchsia-500 focus:ring-fuchsia-500 bg-transparent"
                                        />
                                        <span className="text-sm font-medium text-neutral-300">Broadcast Notifikasi ke Mahasiswa</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Holographic Sticky Preview */}
                    <div className="lg:col-span-4 lg:relative">
                        <motion.div variants={itemVariants} className="sticky top-24">
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-black/60 p-6 shadow-2xl backdrop-blur-3xl before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-indigo-500/10 before:to-transparent">

                                {/* Top Ticket Notches */}
                                <div className="absolute -left-3 top-20 w-6 h-6 rounded-full bg-[#111827] border-r border-indigo-500/20 shadow-inner" />
                                <div className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#111827] border-l border-indigo-500/20 shadow-inner" />

                                <div className="border-b border-dashed border-white/20 pb-6 mb-6 text-center">
                                    <div className="inline-flex items-center justify-center p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mb-4 border border-indigo-500/30">
                                        <ScanFace className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Tiket Kelas AI</h3>
                                    <h4 className="text-white font-black text-2xl truncate">{selectedCourse?.nama || 'Pilih Mata Kuliah'}</h4>
                                    <p className="text-indigo-300 text-sm mt-1">{selectedCourse?.kelas || '-'} • P{data.meeting_number || 1}</p>
                                </div>

                                <div className="space-y-4 text-sm mb-8">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-neutral-400 flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-400" /> Start</span>
                                        <span className="text-white font-bold">{data.start_at ? new Date(data.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-neutral-400 flex items-center gap-2"><Clock className="h-4 w-4 text-rose-400" /> End</span>
                                        <span className="text-white font-bold">{data.end_at ? new Date(data.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                    </div>

                                    <div className="pt-2">
                                        <div className="text-xs text-neutral-500 font-bold mb-2 uppercase tracking-wider">Aturan Keamanan Aktif</div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.require_ai_selfie && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 text-xs font-medium flex items-center gap-1"><Camera className="h-3 w-3" /> AI Selfie</span>}
                                            {data.enable_geofence && <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 text-xs font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {data.geofence_radius}m Radius</span>}
                                            {data.auto_activate && <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 text-xs font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Auto-Aktif</span>}
                                            {data.broadcast_notification && <span className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 rounded border border-fuchsia-500/30 text-xs font-medium flex items-center gap-1"><RadioReceiver className="h-3 w-3" /> Broadcast</span>}
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={processing || !data.course_id}
                                    className="w-full relative overflow-hidden group flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        <PlusCircle className="h-5 w-5" /> Buat Sesi & Mulai
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                </form>

            </motion.div>
        </DosenLayout>
    );
}

function SparkleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    )
}
