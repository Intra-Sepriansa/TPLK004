import SesiBaruIcon from '@/assets/admin/sesi-absen/sesi-baru-icon.png';
import { Button } from '@/components/ui/button';
import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Camera,
    Clock,
    FileText,
    MapPin,
    PlusCircle,
    RadioReceiver,
    ScanFace,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';

// Interfaces
interface Course {
    id: number;
    nama: string;
    sks: number;
    kelas?: string;
    jadwal?: string;
    scheduled_meetings: number[];
    offline_meetings: number[];
    quick_ready_meetings: number[];
    meeting_templates: {
        meeting_number: number;
        topic: string | null;
        description: string | null;
        mode: 'offline' | 'online' | 'hybrid' | null;
        is_offline: boolean;
        quick_ready: boolean;
        suggested_title: string;
        suggested_description: string;
    }[];
}

interface PageProps {
    dosen: { id: number; nama: string };
    courses: Course[];
    request_course_id?: number | null;
}

// Animation configurations
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
};

const hoverGlow = 'hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]';
const formatMeetingBadges = (meetings: number[]) =>
    meetings.length > 0 ? meetings.map((meeting) => `P${meeting}`).join(', ') : '-';
const floatingOrbs = [
    { width: 120, height: 120, left: '12%', top: '18%', drift: -24, duration: 16 },
    { width: 168, height: 168, left: '68%', top: '24%', drift: -18, duration: 20 },
    { width: 96, height: 96, left: '54%', top: '68%', drift: -32, duration: 14 },
];

export default function CreateSession({
    courses,
    request_course_id,
}: PageProps) {
    const defaultCourseId =
        request_course_id || (courses.length > 0 ? courses[0].id : '');

    const { data, setData, post, processing, errors } = useForm({
        course_id: defaultCourseId,
        title: '',
        description: '',
        meeting_number: 1,
        start_at: new Date().toISOString().slice(0, 16),
        end_at: new Date(new Date().getTime() + 100 * 60000)
            .toISOString()
            .slice(0, 16),
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
    }, [request_course_id, setData]);

    const selectedCourse = courses.find((c) => c.id === Number(data.course_id));
    const availableOfflineMeetings = useMemo(
        () =>
            selectedCourse
                ? selectedCourse.offline_meetings.filter(
                      (meetingNumber) =>
                          !selectedCourse.scheduled_meetings.includes(
                              meetingNumber,
                          ),
                  )
                : [],
        [selectedCourse],
    );
    const selectedMeetingTemplate = selectedCourse?.meeting_templates.find(
        (meeting) => meeting.meeting_number === Number(data.meeting_number),
    );

    useEffect(() => {
        if (!selectedMeetingTemplate?.quick_ready) {
            return;
        }

        setData((prev) => {
            if (
                prev.title === selectedMeetingTemplate.suggested_title &&
                prev.description ===
                    selectedMeetingTemplate.suggested_description
            ) {
                return prev;
            }

            return {
                ...prev,
                title: selectedMeetingTemplate.suggested_title,
                description: selectedMeetingTemplate.suggested_description,
            };
        });
    }, [selectedMeetingTemplate, setData]);

    useEffect(() => {
        if (availableOfflineMeetings.length === 0) {
            return;
        }

        if (availableOfflineMeetings.includes(Number(data.meeting_number))) {
            return;
        }

        setData('meeting_number', availableOfflineMeetings[0]);
    }, [availableOfflineMeetings, data.meeting_number, setData]);

    const applyMeetingTemplate = () => {
        if (!selectedMeetingTemplate) {
            return;
        }

        setData((prev) => ({
            ...prev,
            title: selectedMeetingTemplate.suggested_title,
            description: selectedMeetingTemplate.suggested_description,
        }));
    };

    // Handle Time Presets
    const setTimePreset = (type: 'now' | 'schedule' | 'night') => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;

        if (type === 'now') {
            const startStr = new Date(now.getTime() - offset)
                .toISOString()
                .slice(0, 16);
            // Default 100 mins
            const endStr = new Date(now.getTime() - offset + 100 * 60000)
                .toISOString()
                .slice(0, 16);
            setData((d) => ({ ...d, start_at: startStr, end_at: endStr }));
        } else if (type === 'schedule') {
            // Mock schedule: next day 08:00
            const tmrw = new Date(now.getTime() + 86400000);
            tmrw.setHours(8, 0, 0, 0);
            const startStr = new Date(tmrw.getTime() - offset)
                .toISOString()
                .slice(0, 16);
            const endStr = new Date(tmrw.getTime() - offset + 100 * 60000)
                .toISOString()
                .slice(0, 16);
            setData((d) => ({ ...d, start_at: startStr, end_at: endStr }));
        } else if (type === 'night') {
            // Today 19:00
            const night = new Date();
            night.setHours(19, 0, 0, 0);
            const startStr = new Date(night.getTime() - offset)
                .toISOString()
                .slice(0, 16);
            const endStr = new Date(night.getTime() - offset + 150 * 60000)
                .toISOString()
                .slice(0, 16);
            setData((d) => ({ ...d, start_at: startStr, end_at: endStr }));
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
                className="mx-auto max-w-7xl space-y-8 p-4 md:p-6 lg:p-8"
            >
                {/* ═══════ HEADER ANIMATED SPHERE ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative isolate overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 z-0 bg-neutral-900" />

                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-600 opacity-90"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            filter: [
                                'hue-rotate(0deg)',
                                'hue-rotate(15deg)',
                                'hue-rotate(0deg)',
                            ],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Grain Noise & Hover Orbs */}
                    <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-pink-500/40 mix-blend-screen blur-[100px]" />
                    <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/40 mix-blend-screen blur-[100px]" />

                    {/* Floating Orbs (Subtle Movement) */}
                    {floatingOrbs.map((orb, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full border border-white/20 bg-white/5 mix-blend-overlay blur-sm"
                            style={{
                                width: orb.width,
                                height: orb.height,
                                left: orb.left,
                                top: orb.top,
                            }}
                            animate={{
                                y: [0, orb.drift, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: orb.duration,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6"
                        >
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    router.visit('/dosen/sesi-absen')
                                }
                                className="group text-white transition-all duration-300 hover:bg-white/20"
                            >
                                <motion.div
                                    whileHover={{ x: -4 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    }}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                </motion.div>
                                Kembali
                            </Button>
                        </motion.div>

                        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                                className="relative h-20 w-20 shrink-0"
                            >
                                <img
                                    src={SesiBaruIcon}
                                    alt="Sesi Baru"
                                    className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>
                            <div className="text-center lg:text-left">
                                <motion.h1
                                    className="mb-2 text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-5xl"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Mulai Sesi Baru
                                </motion.h1>
                                <motion.p
                                    className="max-w-xl text-lg font-medium text-indigo-100"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Konfigurasi presensi cerdas Anda. Sistem AI
                                    akan otomatis memvalidasi kehadiran
                                    mahasiswa secara real-time.
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ MAIN CONTENT 2-COLUMN LAYOUT ═══════ */}
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-12"
                >
                    {/* LEFT COLUMN: Configuration Form */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* 1. Pemilihan Kelas */}
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-3xl transition-all md:p-8 dark:bg-neutral-900/60 ${hoverGlow}`}
                        >
                            <div className="mb-6 flex items-center gap-4">
                                <div className="rounded-2xl bg-indigo-500/20 p-3">
                                    <BookOpen className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                                    Pilih Kelas / Mata Kuliah
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {courses.map((course) => (
                                    <motion.div
                                        key={course.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                            setData('course_id', course.id)
                                        }
                                        className={`relative cursor-pointer overflow-hidden rounded-[1.5rem] border p-5 transition-all ${
                                            Number(data.course_id) === course.id
                                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10 dark:border-white/5 dark:bg-neutral-800/40'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                {course.nama}
                                            </h3>
                                            {Number(data.course_id) ===
                                                course.id && (
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                                            )}
                                        </div>
                                        <div className="flex gap-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />{' '}
                                                {course.kelas || 'Reguler A'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />{' '}
                                                {course.sks} SKS
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            {errors.course_id && (
                                <p className="mt-2 text-xs text-red-500">
                                    {errors.course_id}
                                </p>
                            )}
                        </motion.div>

                        {/* 2. Topik & Waktu Presets */}
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-3xl transition-all md:p-8 dark:bg-neutral-900/60 ${hoverGlow}`}
                        >
                            <div className="mb-6 flex items-center gap-4">
                                <div className="rounded-2xl bg-fuchsia-500/20 p-3">
                                    <Calendar className="h-6 w-6 text-fuchsia-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                                    Jadwal & Topik Perkuliahan
                                </h2>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Pertemuan Ke-
                                    </label>
                                    {selectedCourse?.offline_meetings.length ? (
                                        <select
                                            value={
                                                availableOfflineMeetings.includes(
                                                    data.meeting_number,
                                                )
                                                    ? String(
                                                          data.meeting_number,
                                                      )
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'meeting_number',
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-fuchsia-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                        >
                                            {availableOfflineMeetings.length ===
                                            0 ? (
                                                <option value="">
                                                    Semua pertemuan offline
                                                    sudah dijadwalkan
                                                </option>
                                            ) : (
                                                availableOfflineMeetings.map(
                                                    (meetingNumber) => (
                                                        <option
                                                            key={meetingNumber}
                                                            value={
                                                                meetingNumber
                                                            }
                                                        >
                                                            Pertemuan{' '}
                                                            {meetingNumber}
                                                        </option>
                                                    ),
                                                )
                                            )}
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            value={data.meeting_number}
                                            onChange={(e) =>
                                                setData(
                                                    'meeting_number',
                                                    parseInt(e.target.value) ||
                                                        1,
                                                )
                                            }
                                            className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-fuchsia-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                            min="1"
                                        />
                                    )}
                                    {errors.meeting_number && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.meeting_number}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Topik (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Misal: Pengantar AI..."
                                        className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-fuchsia-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 rounded-[1.75rem] border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 via-white/80 to-fuchsia-500/10 p-5 dark:from-indigo-500/10 dark:via-neutral-900/70 dark:to-fuchsia-500/10">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-[0.26em] text-indigo-500 uppercase">
                                            Pertemuan Otomatis
                                        </p>
                                        <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                                            Topik dan deskripsi langsung ikut
                                            pertemuan offline yang dipilih
                                        </h3>
                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                            Pilih pertemuan offline dari RPS.
                                            Sistem akan memasang template yang
                                            sesuai dan sesi aktif otomatis saat
                                            jam mulai tiba.
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/70 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-indigo-600 uppercase dark:bg-white/5 dark:text-indigo-300">
                                        Aktif Sesuai Jadwal
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                    <div className="rounded-2xl border border-white/10 bg-white/80 p-4 dark:bg-black/20">
                                        <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                                            Offline Di RPS
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                            {selectedCourse
                                                ? formatMeetingBadges(
                                                      selectedCourse.offline_meetings,
                                                  )
                                                : 'Pilih mata kuliah dulu'}
                                        </p>
                                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                            Belum dijadwalkan:{' '}
                                            {selectedCourse
                                                ? formatMeetingBadges(
                                                      availableOfflineMeetings,
                                                  )
                                                : '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/80 p-4 dark:bg-black/20">
                                        <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                                            Meeting Aktif
                                        </p>
                                        {!selectedCourse ? (
                                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                Pilih kelas dulu untuk melihat
                                                template RPS.
                                            </p>
                                        ) : selectedMeetingTemplate ? (
                                            <>
                                                <p className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                                    P
                                                    {
                                                        selectedMeetingTemplate.meeting_number
                                                    }{' '}
                                                    •{' '}
                                                    {selectedMeetingTemplate.mode ??
                                                        'belum ditandai'}
                                                </p>
                                                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                                    {selectedMeetingTemplate.topic ??
                                                        'Topik RPS belum diisi.'}
                                                </p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            applyMeetingTemplate
                                                        }
                                                        disabled={
                                                            !selectedMeetingTemplate.quick_ready
                                                        }
                                                        className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-300"
                                                    >
                                                        <Zap className="mr-2 h-3.5 w-3.5" />
                                                        Terapkan Template
                                                    </button>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        {selectedMeetingTemplate.quick_ready
                                                            ? 'Template offline siap dipakai.'
                                                            : selectedMeetingTemplate.is_offline
                                                              ? 'Meeting offline ada, tapi topik/deskripsinya belum lengkap.'
                                                              : 'Sesi absensi offline hanya bisa dibuat dari pertemuan offline.'}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                                                Belum ada template offline
                                                untuk meeting ini.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    Deskripsi Sesi
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Catatan materi, arahan kelas, atau ringkasan singkat dari RPS..."
                                    rows={4}
                                    className="w-full rounded-2xl border border-neutral-200 bg-white/50 px-4 py-3 text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-fuchsia-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    Quick Time Presets
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTimePreset('now')}
                                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400"
                                    >
                                        Mulai Sekarang
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTimePreset('schedule')
                                        }
                                        className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-500/20 dark:text-indigo-400"
                                    >
                                        Besok Pagi (08:00)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimePreset('night')}
                                        className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-600 transition-all hover:bg-purple-500/20 dark:text-purple-400"
                                    >
                                        Shift Malam (19:00)
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Waktu Mulai
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_at}
                                        onChange={(e) =>
                                            setData('start_at', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-fuchsia-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                        required
                                    />
                                    {errors.start_at && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.start_at}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                        Waktu Selesai
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.end_at}
                                        onChange={(e) =>
                                            setData('end_at', e.target.value)
                                        }
                                        className="w-full rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-fuchsia-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                                        required
                                    />
                                    {errors.end_at && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.end_at}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Security & Automation (Anti-Titip Absen) */}
                        <motion.div
                            variants={itemVariants}
                            className={`rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-3xl transition-all md:p-8 dark:bg-neutral-900/60 ${hoverGlow}`}
                        >
                            <div className="mb-6 flex items-center gap-4">
                                <div className="rounded-2xl bg-emerald-500/20 p-3">
                                    <ScanFace className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                                    Smart Security (Anti-Titip Absen)
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {/* AI Selfie Toggle */}
                                <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                                    <div className="pt-1">
                                        <div
                                            className={`h-6 w-12 rounded-full p-1 transition-colors duration-300 ease-in-out ${data.require_ai_selfie ? 'bg-emerald-500' : 'bg-neutral-600'}`}
                                        >
                                            <div
                                                className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${data.require_ai_selfie ? 'translate-x-6' : 'translate-x-0'}`}
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={data.require_ai_selfie}
                                        onChange={(e) =>
                                            setData(
                                                'require_ai_selfie',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <div className="flex-1">
                                        <p className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                                            Wajibkan Foto Selfie AI{' '}
                                            <SparkleIcon />
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Menganalisis wajah (Face Match) dan
                                            liveness untuk mencegah pemalsuan
                                            identitas.
                                        </p>
                                    </div>
                                </label>

                                {/* Geofence Toggle & Slider */}
                                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                                    <label className="flex cursor-pointer items-start gap-4">
                                        <div className="pt-1">
                                            <div
                                                className={`h-6 w-12 rounded-full p-1 transition-colors duration-300 ease-in-out ${data.enable_geofence ? 'bg-blue-500' : 'bg-neutral-600'}`}
                                            >
                                                <div
                                                    className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${data.enable_geofence ? 'translate-x-6' : 'translate-x-0'}`}
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={data.enable_geofence}
                                            onChange={(e) =>
                                                setData(
                                                    'enable_geofence',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <div className="flex-1">
                                            <p className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                                                Batas Lokasi (Geofencing){' '}
                                                <MapPin className="h-4 w-4 text-blue-400" />
                                            </p>
                                            <p className="mb-4 text-sm text-neutral-500">
                                                Mahasiswa hanya bisa absen jika
                                                berada dalam radius tertentu
                                                dari titik tengah kelas.
                                            </p>

                                            <AnimatePresence>
                                                {data.enable_geofence && (
                                                    <motion.div
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: 'auto',
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-2">
                                                            <div className="mb-2 flex justify-between text-xs font-medium text-neutral-400">
                                                                <span>
                                                                    Ketat (10M)
                                                                </span>
                                                                <span className="font-bold text-blue-400">
                                                                    {
                                                                        data.geofence_radius
                                                                    }{' '}
                                                                    Meter
                                                                </span>
                                                                <span>
                                                                    Longgar
                                                                    (250M)
                                                                </span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="10"
                                                                max="250"
                                                                step="10"
                                                                value={
                                                                    data.geofence_radius
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'geofence_radius',
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-blue-500 dark:bg-neutral-700"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </label>
                                </div>

                                {/* Automation & Broadcast */}
                                <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-sm font-medium text-indigo-200">
                                        Sesi akan aktif otomatis saat waktu
                                        mulai tiba, tanpa perlu toggle manual.
                                    </div>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
                                        <input
                                            type="checkbox"
                                            checked={
                                                data.broadcast_notification
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'broadcast_notification',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded border-neutral-600 bg-transparent text-fuchsia-500 focus:ring-fuchsia-500"
                                        />
                                        <span className="text-sm font-medium text-neutral-300">
                                            Broadcast Notifikasi ke Mahasiswa
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Holographic Sticky Preview */}
                    <div className="lg:relative lg:col-span-4">
                        <motion.div
                            variants={itemVariants}
                            className="sticky top-24"
                        >
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-black/60 p-6 shadow-2xl backdrop-blur-3xl before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-indigo-500/10 before:to-transparent">
                                {/* Top Ticket Notches */}
                                <div className="absolute top-20 -left-3 h-6 w-6 rounded-full border-r border-indigo-500/20 bg-[#111827] shadow-inner" />
                                <div className="absolute top-20 -right-3 h-6 w-6 rounded-full border-l border-indigo-500/20 bg-[#111827] shadow-inner" />

                                <div className="mb-6 border-b border-dashed border-white/20 pb-6 text-center">
                                <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 p-2 text-indigo-400">
                                    <ScanFace className="h-6 w-6" />
                                </div>
                                    <h3 className="mb-1 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
                                        Tiket Kelas AI
                                    </h3>
                                    <h4 className="truncate text-2xl font-black text-white">
                                        {selectedCourse?.nama ||
                                            'Pilih Mata Kuliah'}
                                    </h4>
                                    <p className="mt-1 text-sm text-indigo-300">
                                        {selectedCourse?.kelas || '-'} • P
                                        {data.meeting_number || 1}
                                    </p>
                                </div>

                                <div className="mb-8 space-y-4 text-sm">
                                    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                                        <span className="flex items-center gap-2 text-neutral-400">
                                            <FileText className="h-4 w-4 text-indigo-300" />
                                            Topik
                                        </span>
                                        <p className="mt-2 text-sm font-semibold text-white">
                                            {data.title || '-'}
                                        </p>
                                        {data.description && (
                                            <p className="mt-1 line-clamp-3 text-xs text-neutral-400">
                                                {data.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                                        <span className="flex items-center gap-2 text-neutral-400">
                                            <Clock className="h-4 w-4 text-emerald-400" />{' '}
                                            Start
                                        </span>
                                        <span className="font-bold text-white">
                                            {data.start_at
                                                ? new Date(
                                                      data.start_at,
                                                  ).toLocaleTimeString([], {
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })
                                                : '--:--'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                                        <span className="flex items-center gap-2 text-neutral-400">
                                            <Clock className="h-4 w-4 text-rose-400" />{' '}
                                            End
                                        </span>
                                        <span className="font-bold text-white">
                                            {data.end_at
                                                ? new Date(
                                                      data.end_at,
                                                  ).toLocaleTimeString([], {
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })
                                                : '--:--'}
                                        </span>
                                    </div>

                                    <div className="pt-2">
                                        <div className="mb-2 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                            Aturan Keamanan Aktif
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.require_ai_selfie && (
                                                <span className="flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                                                    <Camera className="h-3 w-3" />{' '}
                                                    AI Selfie
                                                </span>
                                            )}
                                            {data.enable_geofence && (
                                                <span className="flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                                                    <MapPin className="h-3 w-3" />{' '}
                                                    {data.geofence_radius}m
                                                    Radius
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-300">
                                                <Clock className="h-3 w-3" />{' '}
                                                Aktif Sesuai Jadwal
                                            </span>
                                            {data.broadcast_notification && (
                                                <span className="flex items-center gap-1 rounded border border-fuchsia-500/30 bg-fuchsia-500/20 px-2 py-1 text-xs font-medium text-fuchsia-300">
                                                    <RadioReceiver className="h-3 w-3" />{' '}
                                                    Broadcast
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={processing || !data.course_id}
                                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <div className="animate-gradient absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        <PlusCircle className="h-5 w-5" /> Buat
                                        Sesi Terjadwal
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
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400"
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
    );
}
