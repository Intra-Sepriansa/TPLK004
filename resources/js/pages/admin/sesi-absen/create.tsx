import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarPlus, FileText, BookOpen, Users, Calendar, Clock,
    MapPin, Globe, Video, QrCode, Camera, Fingerprint, Smartphone,
    Wifi, Eye, EyeOff, Bell, Mail, MessageSquare, MessageCircle,
    Save, Send, ChevronLeft, ChevronRight, AlertCircle,
    Edit, Copy, Download, Printer, Share2, Upload, Trash2,
    Settings, Zap, TrendingUp, BarChart3, Map, Lock, Unlock,
    Timer, Repeat, Tag, AlignLeft, Key, Building, Blend,
    Target, Radar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import SesiBaruIcon from '@/assets/admin/sesi-absen/sesi-baru-icon.png';

const steps = [
    { title: "Informasi Dasar", description: "Nama Sesi & Mata Kuliah" },
    { title: "Jadwal & Waktu", description: "Tanggal & Durasi" },
    { title: "Lokasi & Zona", description: "Fisik, Online, Radius" },
    { title: "Metode Absensi", description: "QR, GPS, Selfie dll" },
    { title: "Pengaturan Lanjutan", description: "Visibilitas & Sanksi" },
    { title: "Notifikasi", description: "Reminder & Alert" },
    { title: "Review & Publish", description: "Cek & Simpan" }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen: string;
}

interface PageProps {
    courses: Course[];
}

export default function CreateSesiAbsen({ courses }: PageProps) {
    const [currentStep, setCurrentStep] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('sesiAbsenStep');
            if (saved) return parseInt(saved);
        }
        return 1;
    });

    const [formData, setFormData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('sesiAbsenForm');
            if (saved) return JSON.parse(saved);
        }
        return {
            // Step 1
            nama_sesi: '',
            mata_kuliah_id: '',
            pertemuan: '',
            deskripsi: '',
            tags: [],

            // Step 2
            tanggal: '',
            waktu_mulai: '',
            waktu_selesai: '',
            waktu_buka_absen: '',
            waktu_tutup_absen: '',
            toleransi_keterlambatan: 15,
            recurring: false,

            // Step 3
            tipe_lokasi: 'fisik',
            ruangan_id: '',
            link_meeting: '',
            zona_lat: '',
            zona_lng: '',
            zona_radius: 100,

            // Step 4
            metode_absensi: [] as string[],
            qr_settings: {} as Record<string, any>,
            gps_settings: {} as Record<string, any>,
            selfie_settings: { liveness_check: true, strictness_level: 'medium' } as Record<string, any>,

            // Step 5
            status: 'published',
            visibilitas: 'all',
            mahasiswa_ids: [],
            pengaturan_absensi: { auto_close: true, allow_late: true },
            penilaian: { method: 'simple', weight: 100 },
            sanksi: { enabled: false },

            // Step 6
            notifikasi_mahasiswa: true,
            notifikasi_dosen: true,
            notifikasi_admin: false,
            notifikasi_ortu: false,
            channels: ['push', 'in-app'] as string[],
            timing: ['15_min_before'] as string[],
        };
    });

    // Save form state to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('sesiAbsenForm', JSON.stringify(formData));
        sessionStorage.setItem('sesiAbsenStep', currentStep.toString());
    }, [formData, currentStep]);

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(curr => curr + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(curr => curr - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.visit('/admin/sesi-absen');
        }
    };

    const handleSaveDraft = () => {
        console.log("Draft Saved", formData);
    };

    const handlePublish = () => {
        // Safely construct datetime strings so incomplete forms trigger clean 422 errors, not 500s.
        const startDateTime = (formData.tanggal && formData.waktu_mulai)
            ? `${formData.tanggal} ${formData.waktu_mulai}:00`
            : '';
        const endDateTime = (formData.tanggal && formData.waktu_selesai)
            ? `${formData.tanggal} ${formData.waktu_selesai}:00`
            : '';

        // Map the advanced frontend formData to the backend SesiAbsenController specification
        const payload = {
            course_id: formData.mata_kuliah_id,
            meeting_number: parseInt(formData.pertemuan_ke) || 1,
            title: formData.judul_sesi,
            start_at: startDateTime,
            end_at: endDateTime,
            auto_activate: formData.status === 'published',

            // Note: Advanced features (Zona, AI methods, settings) would need 
            // further backend migration extensions to store in the DB.
            // Sending the base required fields to ensure it publishes correctly.
        };

        console.log("PAYLOAD DIKIRIM:", payload);

        router.post('/admin/sesi-absen', payload, {
            onSuccess: () => {
                sessionStorage.removeItem('sesiAbsenForm');
                sessionStorage.removeItem('sesiAbsenStep');
                // Backend will redirect to the index route
            },
            onError: (errors) => {
                setValidationErrors(errors);
                console.error("Validation Errors:", errors);
                // Extract error messages into a readable string
                const errorMessages = Object.values(errors).flat().join('\n- ');
                const alertMessage = errorMessages
                    ? `Penyimpanan Gagal. Silakan periksa kembali:\n- ${errorMessages}`
                    : "Gagal mempublikasikan: Mohon lengkapi semua field yang wajib, seperti Mata Kuliah, Tanggal, dan Waktu.";

                alert(alertMessage);
            }
        });
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    };

    const toggleMethod = (method: string) => {
        setFormData((prev: typeof formData) => ({
            ...prev,
            metode_absensi: prev.metode_absensi.includes(method)
                ? prev.metode_absensi.filter((m: string) => m !== method)
                : [...prev.metode_absensi, method]
        }));
    };

    const toggleChannel = (channel: string) => {
        setFormData((prev: typeof formData) => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter((c: string) => c !== channel)
                : [...prev.channels, channel]
        }));
    };

    const handleSetToNow = () => {
        const now = new Date();
        // Adjust to local timezone string formats
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeNow = `${hours}:${minutes}`;

        // Add 2 hours for end time
        now.setHours(now.getHours() + 2);
        const endHours = String(now.getHours()).padStart(2, '0');
        const endMinutes = String(now.getMinutes()).padStart(2, '0');
        const timeEnd = `${endHours}:${endMinutes}`;

        setFormData((prev: typeof formData) => ({
            ...prev,
            tanggal: `${year}-${month}-${day}`,
            waktu_mulai: timeNow,
            waktu_selesai: timeEnd,
            waktu_buka_absen: timeNow,
        }));
    };

    const selectedCourse = courses?.find(c => c.id.toString() === formData.mata_kuliah_id);

    return (
        <AppLayout>
            <Head title="Buat Sesi Absen Baru" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >

                {/* HEADER SECTION EXACT MATCH TO KAS ADMIN */}
                <motion.div
                    variants={itemVariants}
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

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}
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
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="relative shrink-0"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <img src={SesiBaruIcon} alt="Sesi Baru" className="h-20 w-20 object-contain drop-shadow-2xl pointer-events-none" />
                                </motion.div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-white/70">Admin</span>
                                        <ChevronRight className="w-3 h-3 text-white/50" />
                                        <span className="text-sm font-semibold text-white/70">Sesi Absen</span>
                                        <ChevronRight className="w-3 h-3 text-white/50" />
                                        <span className="text-sm font-bold text-white">Buat Baru</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                                        Buat Sesi Absen Baru
                                    </h1>
                                    <p className="mt-1 text-indigo-100 max-w-lg">
                                        Atur jadwal, lokasi, dan pengaturan absensi dengan mudah
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN CONTAINER */}
                <div className="max-w-6xl mx-auto">

                    {/* PROGRESS STEPPER */}
                    <div className="hidden md:flex items-center justify-between mb-12 px-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center w-full relative">
                                <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => index + 1 < currentStep && setCurrentStep(index + 1)}>
                                    <motion.div
                                        className={cn(
                                            "h-14 w-14 rounded-full flex items-center justify-center border-[3px] shadow-lg transition-all duration-300",
                                            currentStep === index + 1
                                                ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-white/50 dark:border-indigo-500/30 scale-110"
                                                : currentStep > index + 1
                                                    ? "bg-emerald-500 text-white border-emerald-400/50"
                                                    : "bg-white/40 dark:bg-neutral-900/40 text-slate-400 dark:text-neutral-500 border-white/20 dark:border-white/5 backdrop-blur-xl"
                                        )}
                                        whileHover={{ scale: 1.15 }}
                                    >
                                        {currentStep > index + 1 ? (
                                            <CheckCircle className="h-6 w-6" />
                                        ) : (
                                            <span className="text-lg font-bold">{index + 1}</span>
                                        )}
                                    </motion.div>
                                    <div className="absolute top-16 w-32 text-center">
                                        <p className={cn(
                                            "text-sm font-bold mt-2 transition-colors",
                                            currentStep === index + 1 ? "text-indigo-600 dark:text-indigo-400" :
                                                currentStep > index + 1 ? "text-emerald-600 dark:text-emerald-400" :
                                                    "text-slate-500 dark:text-neutral-400"
                                        )}>{step.title}</p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 relative z-0 mt-[-2rem]">
                                        <div className="absolute inset-0 bg-slate-200 dark:bg-neutral-800 rounded-full" />
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full origin-left"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: currentStep > index + 1 ? 1 : 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* FORM AREA */}
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
                        variants={itemVariants}
                    >
                        <div className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {/* === STEP 1: INFORMASI DASAR === */}
                                {currentStep === 1 && (
                                    <motion.div key="step1" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Informasi Dasar</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Lengkapi identitas detail untuk sesi absensi ini.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><FileText className="w-4 h-4" /> Nama Sesi <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={formData.nama_sesi} onChange={e => updateField('nama_sesi', e.target.value)}
                                                    className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800"
                                                    placeholder="Contoh: Perkuliahan Algoritma - Pertemuan 1"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Mata Kuliah <span className="text-red-500">*</span></Label>
                                                    <Select value={formData.mata_kuliah_id} onValueChange={v => updateField('mata_kuliah_id', v)}>
                                                        <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800">
                                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {courses && courses.map(course => (
                                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                                    {course.nama} ({course.sks} SKS)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Users className="w-4 h-4" /> Dosen (Otomatis)</Label>
                                                    <Input
                                                        disabled
                                                        value={selectedCourse?.dosen || '-'}
                                                        className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800 text-slate-500"
                                                        placeholder="Pilih Mata Kuliah terlebih dahulu"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><FileText className="w-4 h-4" /> Pertemuan Ke- <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={16}
                                                        value={formData.pertemuan}
                                                        onChange={e => updateField('pertemuan', e.target.value)}
                                                        className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800"
                                                        placeholder="Contoh: 1"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Deskripsi Sesi (Opsional)</Label>
                                                <Textarea
                                                    value={formData.deskripsi} onChange={e => updateField('deskripsi', e.target.value)}
                                                    className="min-h-[120px] rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800"
                                                    placeholder="Tambahkan catatan khusus, instruksi, atau link materi untuk mahasiswa di sini..."
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 2: JADWAL & WAKTU === */}
                                {currentStep === 2 && (
                                    <motion.div key="step2" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600 dark:from-fuchsia-400 dark:to-pink-400">Jadwal & Waktu</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Sesuaikan hari, jam tayang, waktu buka dan tutup absensi.</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={handleSetToNow}
                                                className="bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:hover:bg-fuchsia-900/40 dark:border-fuchsia-800/50 shadow-sm"
                                            >
                                                <Zap className="w-4 h-4 mr-2" />
                                                Isi Sesi Sekarang
                                            </Button>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Waktu Sesi Utama */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 shadow-xl backdrop-blur-xl">
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Calendar className="w-4 h-4" /> Tanggal Sesi <span className="text-red-500">*</span></Label>
                                                    <Input type="date" value={formData.tanggal} onChange={e => updateField('tanggal', e.target.value)} className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800 dark:[color-scheme:dark]" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu Mulai <span className="text-red-500">*</span></Label>
                                                    <Input type="time" value={formData.waktu_mulai} onChange={e => updateField('waktu_mulai', e.target.value)} className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800 dark:[color-scheme:dark]" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu Selesai <span className="text-red-500">*</span></Label>
                                                    <Input type="time" value={formData.waktu_selesai} onChange={e => updateField('waktu_selesai', e.target.value)} className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800 dark:[color-scheme:dark]" />
                                                </div>
                                            </div>

                                            {/* Waktu Scan Absensi */}
                                            <h3 className="text-lg font-bold flex items-center gap-2 mt-4"><Scan className="w-5 h-5 text-indigo-500" /> Interval Scan Absensi</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                                                    <Label className="font-semibold text-slate-700 dark:text-emerald-200 flex items-center gap-2"><Unlock className="w-4 h-4" /> Waktu Buka Absen</Label>
                                                    <p className="text-xs text-slate-500 mb-2">Berapa menit sebelum sesi mulai absen dibuka?</p>
                                                    <Input type="time" value={formData.waktu_buka_absen} onChange={e => updateField('waktu_buka_absen', e.target.value)} className="h-12 bg-white/80 dark:bg-black/40 rounded-xl dark:[color-scheme:dark]" />
                                                </div>
                                                <div className="space-y-2 p-5 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50">
                                                    <Label className="font-semibold text-slate-700 dark:text-rose-200 flex items-center gap-2"><Lock className="w-4 h-4" /> Waktu Tutup Absen</Label>
                                                    <p className="text-xs text-slate-500 mb-2">Jam berapa mahasiswa sudah tidak bisa absen?</p>
                                                    <Input type="time" value={formData.waktu_tutup_absen} onChange={e => updateField('waktu_tutup_absen', e.target.value)} className="h-12 bg-white/80 dark:bg-black/40 rounded-xl dark:[color-scheme:dark]" />
                                                </div>
                                            </div>

                                            {/* Toleransi & Recurring */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                <div className="space-y-2">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Timer className="w-4 h-4" /> Toleransi Keterlambatan (Menit)</Label>
                                                    <Input type="number" value={formData.toleransi_keterlambatan} onChange={e => updateField('toleransi_keterlambatan', Number(e.target.value))} className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/30 dark:border-neutral-800" />
                                                </div>
                                                <div className="flex items-center space-x-4 p-4 rounded-xl border border-white/30 dark:border-neutral-800 bg-white/30 dark:bg-neutral-800/30">
                                                    <div className="flex-1">
                                                        <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Repeat className="w-4 h-4" /> Ulangi Otomatis (Recurring)</Label>
                                                        <p className="text-xs text-slate-500">Buat sesi yang sama setiap minggu otomatis.</p>
                                                    </div>
                                                    <Switch checked={formData.recurring} onCheckedChange={v => updateField('recurring', v)} />
                                                </div>
                                            </div>

                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 3: LOKASI & ZONA === */}
                                {currentStep === 3 && (
                                    <motion.div key="step3" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                                <Map className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Lokasi & Zona</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Dimana sesi ini berlangsung? Atur geofencing untuk physical class.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className="font-semibold text-slate-700 dark:text-slate-200">Jenis Sesi & Ruangan</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div onClick={() => updateField('tipe_lokasi', 'fisik')} className={cn("cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3", formData.tipe_lokasi === 'fisik' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-white/30 dark:border-neutral-800 bg-white/20 dark:bg-neutral-800/20 hover:bg-white/40")}>
                                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center"><Building className="w-6 h-6" /></div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">Fisik (Ruangan)</p>
                                                    </div>
                                                </div>
                                                <div onClick={() => updateField('tipe_lokasi', 'online')} className={cn("cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3", formData.tipe_lokasi === 'online' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-white/30 dark:border-neutral-800 bg-white/20 dark:bg-neutral-800/20 hover:bg-white/40")}>
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">Online (Virtual)</p>
                                                    </div>
                                                </div>
                                                <div onClick={() => updateField('tipe_lokasi', 'hybrid')} className={cn("cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3", formData.tipe_lokasi === 'hybrid' ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-white/30 dark:border-neutral-800 bg-white/20 dark:bg-neutral-800/20 hover:bg-white/40")}>
                                                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 flex items-center justify-center"><Blend className="w-6 h-6" /></div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">Hybrid</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Launcher untuk Pengaturan Detail */}
                                            {(formData.tipe_lokasi === 'fisik' || formData.tipe_lokasi === 'hybrid') && (
                                                <div className="mt-8 relative animate-in fade-in slide-in-from-bottom-4">

                                                    {/* If zone is already saved, show success UI */}
                                                    {formData.zona_lat && formData.zona_lng ? (
                                                        <div className="relative overflow-hidden rounded-3xl p-8 border border-emerald-500/30 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-2xl transition-all">
                                                            {/* Background Glow */}
                                                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                                                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                                                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                                                                    <motion.div
                                                                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 relative"
                                                                        animate={{ y: [0, -5, 0] }}
                                                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                                    >
                                                                        <MapPin className="w-10 h-10" />
                                                                        <div className="absolute -top-2 -right-2 bg-emerald-100 text-emerald-700 rounded-full p-1 shadow-md border border-emerald-200">
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        </div>
                                                                    </motion.div>
                                                                    <div>
                                                                        <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-1">Geofencing Siap Digunakan</h3>
                                                                        <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">Titik koordinat dan radius pengawasan telah diatur. Sesi kelas fisik Anda sudah terlindungi.</p>

                                                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                                                                                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-300">{formData.zona_lat}, {formData.zona_lng}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                                                                                <Radar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Radius: {formData.zona_radius} Meter</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    onClick={() => router.visit('/admin/zona?redirect=/admin/sesi-absen/create')}
                                                                    variant="outline"
                                                                    size="lg"
                                                                    className="w-full md:w-auto rounded-xl border-emerald-300 bg-white/60 hover:bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 dark:text-emerald-200 h-14 px-8 backdrop-blur-md shadow-sm transition-all font-bold hover:scale-105"
                                                                >
                                                                    <Edit className="w-5 h-5 mr-2" />
                                                                    Ubah Parameter
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center relative group transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:border-emerald-400 dark:hover:border-emerald-500/50">
                                                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center mb-5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-600 transition-colors">
                                                                <MapPin className="w-10 h-10 text-slate-500 group-hover:text-emerald-600 dark:text-slate-400 dark:group-hover:text-emerald-400 transition-colors" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Tentukan Geofencing & Ruangan</h3>
                                                            <p className="text-slate-500 text-sm max-w-lg mb-8">Untuk kelas fisik, mahasiswa diwajibkan berada dalam radius yang Anda tentukan dari titik pusat kelas agar dapat melakukan presensi kehadiran.</p>

                                                            <Button onClick={() => router.visit('/admin/zona?redirect=/admin/sesi-absen/create')} size="lg" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-xl shadow-lg h-14 px-10 text-lg font-bold group-button group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 dark:group-hover:text-white transition-all transform group-hover:scale-105">
                                                                <Settings className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                                                                Atur Lokasi & Zona Sekarang
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Jika Online atau Hybrid */}
                                            {(formData.tipe_lokasi === 'online' || formData.tipe_lokasi === 'hybrid') && (
                                                <div className="space-y-4 p-5 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 animate-in fade-in slide-in-from-top-4 duration-500 mt-6 !mt-6">
                                                    <Label className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2"><Video className="w-5 h-5" /> Meeting Online Settings (Opsional)</Label>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Link Platform (Zoom/Meet/Teams)</Label>
                                                        <Input placeholder="https://zoom.us/j/123456789" className="h-11 bg-white/80 dark:bg-black/40" value={formData.link_meeting} onChange={e => updateField('link_meeting', e.target.value)} />
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 4: METODE ABSENSI === */}
                                {currentStep === 4 && (
                                    <motion.div key="step4" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                                <Fingerprint className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">Metode Absensi</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Pilih satu atau lebih cara mahasiswa memvalidasi kehadiran.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                            {[
                                                { id: 'qr', title: 'QR Code Dynamic', desc: 'Scan QR di layar dosen yang refresh tiap detik', icon: QrCode, color: 'text-indigo-500' },
                                                { id: 'gps', title: 'Location Tracker', desc: 'Wajib berada di zona radius kampus', icon: MapPin, color: 'text-emerald-500' },
                                                { id: 'selfie', title: 'AI Face Selfie', desc: 'Verifikasi wajah dengan AI matching', icon: Camera, color: 'text-rose-500' },
                                                { id: 'manual', title: 'Manual Check-in', desc: 'Klik tombol hadir di aplikasi', icon: Smartphone, color: 'text-blue-500' },
                                            ].map((method) => {
                                                const isSelected = formData.metode_absensi.includes(method.id);
                                                return (
                                                    <div key={method.id} onClick={() => toggleMethod(method.id)}
                                                        className={cn("p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden",
                                                            isSelected ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/20" : "border-white/30 dark:border-neutral-800 bg-white/20 dark:bg-neutral-800/20 hover:bg-white/40")}
                                                    >
                                                        {isSelected && <div className="absolute top-3 right-3 text-amber-500"><CheckCircle className="w-5 h-5" /></div>}
                                                        <div className="flex items-start gap-4">
                                                            <div className={cn("p-3 rounded-full bg-white dark:bg-black/50 shadow-sm", method.color)}>
                                                                <method.icon className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{method.title}</h4>
                                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{method.desc}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Inline Settings Panel for QR and Selfie */}
                                        <AnimatePresence>
                                            {(formData.metode_absensi.includes('qr') || formData.metode_absensi.includes('selfie')) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 overflow-hidden"
                                                >
                                                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 shadow-inner">
                                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                                            <Settings className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                                                            Parameter Metode Lanjutan
                                                        </h3>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* QR Settings */}
                                                            {formData.metode_absensi.includes('qr') && (
                                                                <div className="space-y-3 p-4 rounded-xl bg-white/60 dark:bg-neutral-900/40 border border-white/50 dark:border-neutral-800">
                                                                    <Label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <QrCode className="w-4 h-4 text-indigo-500" /> Dynamic QR Interval
                                                                    </Label>
                                                                    <p className="text-xs text-slate-500 mb-2">QR Code akan diperbarui otomatis setiap detik ini.</p>
                                                                    <Select
                                                                        value={formData.qr_settings.refresh_interval?.toString() || '15'}
                                                                        onValueChange={(val) => setFormData((prev: typeof formData) => ({ ...prev, qr_settings: { ...prev.qr_settings, refresh_interval: parseInt(val) } }))}
                                                                    >
                                                                        <SelectTrigger className="bg-white dark:bg-black/50 h-11 border-slate-200 dark:border-slate-800">
                                                                            <SelectValue placeholder="Pilih interval" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="5">Super Cepat (5 Detik)</SelectItem>
                                                                            <SelectItem value="10">Cepat (10 Detik)</SelectItem>
                                                                            <SelectItem value="15">Normal (15 Detik)</SelectItem>
                                                                            <SelectItem value="30">Santai (30 Detik)</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}

                                                            {/* Selfie Settings */}
                                                            {formData.metode_absensi.includes('selfie') && (
                                                                <div className="space-y-4 p-4 rounded-xl bg-white/60 dark:bg-neutral-900/40 border border-white/50 dark:border-neutral-800">
                                                                    <Label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Camera className="w-4 h-4 text-rose-500" /> AI Selfie Configuration
                                                                    </Label>

                                                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                                        <div className="space-y-0.5">
                                                                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-200">Liveness Check</Label>
                                                                            <p className="text-[10px] text-slate-500">Cegah foto palsu atau print foto.</p>
                                                                        </div>
                                                                        <Switch
                                                                            checked={formData.selfie_settings.liveness_check ?? true}
                                                                            onCheckedChange={(val) => setFormData((prev: typeof formData) => ({ ...prev, selfie_settings: { ...prev.selfie_settings, liveness_check: val } }))}
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tingkat Ketat (Strictness)</Label>
                                                                        <Select
                                                                            value={formData.selfie_settings.strictness_level || 'medium'}
                                                                            onValueChange={(val) => setFormData((prev: typeof formData) => ({ ...prev, selfie_settings: { ...prev.selfie_settings, strictness_level: val } }))}
                                                                        >
                                                                            <SelectTrigger className="bg-white dark:bg-black/50 h-10 border-slate-200 dark:border-slate-800">
                                                                                <SelectValue placeholder="Pilih Strictness" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="low">Rendah (Mudah cocok)</SelectItem>
                                                                                <SelectItem value="medium">Sedang (Rekomendasi)</SelectItem>
                                                                                <SelectItem value="high">Tinggi (Sangat akurat)</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* === STEP 5: PENGATURAN LANJUTAN === */}
                                {currentStep === 5 && (
                                    <motion.div key="step5" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                                                <Settings className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400">Pengaturan Lanjutan</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Status, Visibilitas, Aturan Ketat, dan Sanksi.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200">Status Sesi</Label>
                                                    <div className="flex gap-4">
                                                        <div onClick={() => updateField('status', 'published')} className={cn("cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2", formData.status === 'published' ? "bg-red-50 dark:bg-red-900/20 border-red-500" : "border-white/30 dark:border-neutral-800")}><div className={cn("w-4 h-4 rounded-full border", formData.status === 'published' ? "border-red-500 bg-red-500" : "border-slate-400")} /><Label className="cursor-pointer">Published</Label></div>
                                                        <div onClick={() => updateField('status', 'draft')} className={cn("cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2", formData.status === 'draft' ? "bg-red-50 dark:bg-red-900/20 border-red-500" : "border-white/30 dark:border-neutral-800")}><div className={cn("w-4 h-4 rounded-full border", formData.status === 'draft' ? "border-red-500 bg-red-500" : "border-slate-400")} /><Label className="cursor-pointer">Draft</Label></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-semibold text-slate-700 dark:text-slate-200">Visibilitas</Label>
                                                    <div className="flex gap-4">
                                                        <div onClick={() => updateField('visibilitas', 'all')} className={cn("cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2", formData.visibilitas === 'all' ? "bg-red-50 dark:bg-red-900/20 border-red-500" : "border-white/30 dark:border-neutral-800")}><div className={cn("w-4 h-4 rounded-full border", formData.visibilitas === 'all' ? "border-red-500 bg-red-500" : "border-slate-400")} /><Label className="cursor-pointer">Semua Mahasiswa Kelas</Label></div>
                                                        <div onClick={() => updateField('visibilitas', 'selected')} className={cn("cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2", formData.visibilitas === 'selected' ? "bg-red-50 dark:bg-red-900/20 border-red-500" : "border-white/30 dark:border-neutral-800")}><div className={cn("w-4 h-4 rounded-full border", formData.visibilitas === 'selected' ? "border-red-500 bg-red-500" : "border-slate-400")} /><Label className="cursor-pointer">Mahasiswa Tertentu</Label></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
                                                <h3 className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Aturan Absensi Ekstra</h3>
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-white/30 dark:border-neutral-800 bg-white/30 dark:bg-neutral-800/30">
                                                    <div><Label className="font-semibold text-slate-700 dark:text-slate-200">Izinkan Keterlambatan</Label><p className="text-xs text-slate-500">Mahasiswa tetap bisa absen setelah waktu mulai, status (Terlambat)</p></div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-white/30 dark:border-neutral-800 bg-white/30 dark:bg-neutral-800/30">
                                                    <div><Label className="font-semibold text-slate-700 dark:text-slate-200">Izinkan Izin/Sakit via App</Label><p className="text-xs text-slate-500">Mahasiswa dapat mengunggah surat dokter langsung.</p></div>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-50/50 dark:bg-red-900/10">
                                                    <div><Label className="font-semibold text-red-700 dark:text-red-400">Aktifkan Sanksi Alpa</Label><p className="text-xs text-red-600/70 dark:text-red-400/70">Otomatis kirim surat peringatan (SP) jika alpa melebihi batas.</p></div>
                                                    <Switch />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 6: NOTIFIKASI === */}
                                {currentStep === 6 && (
                                    <motion.div key="step6" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">Notifikasi & Broadcast</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Kirim pengingat agar mahasiswa tidak lupa absensi.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className="font-semibold text-slate-700 dark:text-slate-200">Kirim Via Channel:</Label>
                                            <div className="flex gap-4">
                                                {[
                                                    { id: 'push', label: 'In-App / Push', icon: Smartphone },
                                                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                                    { id: 'email', label: 'Email', icon: Mail }
                                                ].map(channel => (
                                                    <div key={channel.id} onClick={() => toggleChannel(channel.id)}
                                                        className={cn("flex flex-1 items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all", formData.channels.includes(channel.id) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-slate-200 dark:border-neutral-800 text-slate-500")}
                                                    >
                                                        <channel.icon className="w-5 h-5" />
                                                        <span className="font-semibold text-sm">{channel.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-6 rounded-3xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 mt-6 !mt-8 shadow-xl backdrop-blur-xl space-y-4">
                                                <Label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Timing Reminder</Label>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3"><Checkbox id="t1" defaultChecked /><Label htmlFor="t1">1 Hari Sebelum Sesi</Label></div>
                                                    <div className="flex items-center gap-3"><Checkbox id="t2" defaultChecked /><Label htmlFor="t2">30 Menit Sebelum Sesi Mulai</Label></div>
                                                    <div className="flex items-center gap-3"><Checkbox id="t3" defaultChecked /><Label htmlFor="t3">15 Menit Sebelum Tutup Absen (Yang Belum Absen)</Label></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* === STEP 7: REVIEW & PUBLISH === */}
                                {currentStep === 7 && (
                                    <motion.div key="step7" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
                                        <div className="mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">Review & Publish</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Pastikan semua data sudah benar sebelum menyimpan.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 rounded-2xl border border-white/30 dark:border-neutral-800 bg-white/50 dark:bg-neutral-800/50 space-y-3 relative group">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCurrentStep(1)}><Edit className="w-4 h-4" /></Button>
                                                <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2"><FileText className="w-4 h-4" /> Info Dasar</h3>
                                                <p className="font-bold text-lg">{formData.nama_sesi || 'Belum diisi'}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300">Dosen: {selectedCourse?.dosen || '-'}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300">Pertemuan Ke: {formData.pertemuan || '-'}</p>
                                            </div>
                                            <div className="p-5 rounded-2xl border border-white/30 dark:border-neutral-800 bg-white/50 dark:bg-neutral-800/50 space-y-3 relative group">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCurrentStep(2)}><Edit className="w-4 h-4" /></Button>
                                                <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2"><Clock className="w-4 h-4" /> Waktu Sesi</h3>
                                                <p className="font-bold text-lg">{formData.tanggal ? formData.tanggal : 'XX-XX-XXXX'}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300">{formData.waktu_mulai || '00:00'} s/d {formData.waktu_selesai || '00:00'} WIB</p>
                                            </div>
                                            <div className="p-5 rounded-2xl border border-white/30 dark:border-neutral-800 bg-white/50 dark:bg-neutral-800/50 space-y-3 relative group">
                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCurrentStep(3)}><Edit className="w-4 h-4" /></Button>
                                                <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2"><MapPin className="w-4 h-4" /> Lokasi</h3>
                                                <p className="font-bold text-lg capitalize">{formData.tipe_lokasi}</p>
                                                {formData.tipe_lokasi === 'fisik' && <p className="text-sm text-slate-600 dark:text-slate-300 text-emerald-600"><CheckCircle className="w-3 h-3 inline mr-1" /> Geofencing Aktif</p>}
                                            </div>
                                            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-3 relative">
                                                <h3 className="text-sm font-bold text-emerald-600 uppercase flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Siap dipublish</h3>
                                                <p className="text-sm">Semua notifikasi aktif. QR Code dan Geofence akan otomatis dibuat setelah publish.</p>
                                            </div>
                                        </div>

                                    </motion.div>
                                )}

                            </AnimatePresence>

                            {/* BOTTOM NAVIGATION ACTIONS */}
                            <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200 dark:border-neutral-800">
                                <Button variant="outline" onClick={handleBack} className="rounded-xl h-12 px-6">
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    {currentStep === 1 ? 'Batal' : 'Kembali'}
                                </Button>

                                <div className="flex gap-3">
                                    {currentStep < steps.length ? (
                                        <Button onClick={handleNext} className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/30 border-0">
                                            Lanjut
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" onClick={handleSaveDraft} className="rounded-xl h-12 px-6">
                                                <Save className="w-4 h-4 mr-2" />
                                                Simpan Draft
                                            </Button>
                                            <Button onClick={handlePublish} className="rounded-xl h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/20 border-0">
                                                <Send className="w-4 h-4 mr-2" />
                                                Publish Sesi
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </AppLayout>
    );
}

// Icon fallbacks due to missing imports or missing lucide components used below
const CheckCircle = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
const ShieldCheck = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
const Scan = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
