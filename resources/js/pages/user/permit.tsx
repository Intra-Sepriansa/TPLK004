import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    FileText, Plus, Clock, CheckCircle, XCircle, Upload, Trash2, Eye, X,
    HeartPulse, Calendar, AlertTriangle, BarChart3, Send, Sparkles, FileCheck, Star,
    ArrowLeft, ArrowRight, ClipboardList, Stethoscope, MessageSquare, Wand2, Bot, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, FormEvent, useMemo } from 'react';

import PermitIcon from '@/assets/dosen/izin-sakit/persetujuan-izin.png';
import totalStatIcon from '@/assets/admin/dashboard/total-icon.png';
import pendingStatIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import approvedStatIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import rejectedStatIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';

type PermitComment = {
    id: number;
    sender_type: 'mahasiswa' | 'dosen';
    sender_name: string;
    message: string;
    created_at: string;
    is_mine: boolean;
};

interface Props {
    permits: Array<{
        id: number;
        type: 'izin' | 'sakit';
        reason: string;
        attachment: string | null;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
        session: {
            id: number;
            mata_kuliah: string;
            tanggal: string;
            tanggal_display: string;
        };
        approver: string | null;
        approved_at: string | null;
        reviewed_at: string | null;
        estimated_approval_at: string | null;
        created_at: string;
        comments: PermitComment[];
    }>;
    availableSessions: Array<{
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
        waktu: string;
    }>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string };
}

type ReasonTemplate = {
    id: string;
    title: string;
    emoji: string;
    content: string;
};

const REASON_TEMPLATES: Record<'izin' | 'sakit', ReasonTemplate[]> = {
    izin: [
        {
            id: 'izin-keluarga',
            title: 'Keperluan Keluarga',
            emoji: '👨‍👩‍👧',
            content: 'Saya izin tidak mengikuti perkuliahan karena ada keperluan keluarga yang tidak dapat ditinggalkan. Saya akan mengejar materi yang tertinggal setelah sesi berakhir.',
        },
        {
            id: 'izin-acara',
            title: 'Acara Resmi',
            emoji: '🎓',
            content: 'Saya memohon izin tidak hadir karena mengikuti acara resmi pada waktu yang bersamaan. Bukti kegiatan akan saya lampirkan dan saya siap mengikuti arahan dosen terkait materi pengganti.',
        },
        {
            id: 'izin-transport',
            title: 'Kendala Transportasi',
            emoji: '🚗',
            content: 'Saya memohon izin tidak hadir karena kendala transportasi mendadak sehingga tidak dapat tiba di kampus tepat waktu. Saya akan mempelajari materi perkuliahan secara mandiri.',
        },
        {
            id: 'izin-wawancara',
            title: 'Wawancara/Seleksi',
            emoji: '💼',
            content: 'Saya memohon izin tidak mengikuti perkuliahan karena menghadiri wawancara/seleksi yang waktunya bersamaan. Saya akan melengkapi materi kuliah setelah kegiatan selesai.',
        },
    ],
    sakit: [
        {
            id: 'sakit-demam',
            title: 'Demam/Flu',
            emoji: '🤒',
            content: 'Saya tidak dapat mengikuti perkuliahan karena sedang mengalami demam/flu dan perlu beristirahat sesuai anjuran. Saya akan mengirimkan surat keterangan jika diperlukan.',
        },
        {
            id: 'sakit-dokter',
            title: 'Pemeriksaan Dokter',
            emoji: '🏥',
            content: 'Saya memohon izin tidak hadir karena harus menjalani pemeriksaan dan perawatan dokter pada jam perkuliahan. Surat keterangan akan saya lampirkan sebagai bukti pendukung.',
        },
        {
            id: 'sakit-rawat',
            title: 'Butuh Istirahat',
            emoji: '💊',
            content: 'Kondisi kesehatan saya saat ini belum memungkinkan untuk mengikuti perkuliahan. Saya membutuhkan waktu istirahat agar dapat kembali mengikuti kelas dengan optimal.',
        },
        {
            id: 'sakit-migrain',
            title: 'Migrain/Sakit Kepala',
            emoji: '🧠',
            content: 'Saya izin tidak hadir karena mengalami migrain/sakit kepala berat sehingga tidak dapat berkonsentrasi di kelas. Saya akan mengejar materi setelah kondisi membaik.',
        },
    ],
};

export default function Permit({ permits, availableSessions, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    const [activeSection, setActiveSection] = useState<'history' | 'analytics'>('history');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [formStep, setFormStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [showAiAssistant, setShowAiAssistant] = useState(false);
    const [openDiscussionId, setOpenDiscussionId] = useState<number | null>(null);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
            },
        },
    } as const;

    const { data, setData, post, processing, errors, reset } = useForm({
        attendance_session_id: '',
        type: 'izin' as 'izin' | 'sakit',
        reason: '',
        attachment: null as File | null,
    });
    const step1Complete = Boolean(data.attendance_session_id && data.type);
    const step2Complete = data.reason.trim().length >= 20;
    const step3Complete = Boolean(data.attachment);
    const completedByStep: Record<number, boolean> = {
        1: step1Complete,
        2: step2Complete,
        3: step3Complete,
    };
    const maxUnlockedStep = step1Complete ? (step2Complete ? 3 : 2) : 1;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/permit', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
                setFormStep(1);
                setShowAiAssistant(false);
            },
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('attachment', e.dataTransfer.files[0]);
        }
    };

    const nextStep = () => {
        const currentStepValid =
            (formStep === 1 && step1Complete) ||
            (formStep === 2 && step2Complete);

        if (!currentStepValid) {
            window.alert('Lengkapi langkah ini dulu sebelum lanjut.');
            return;
        }

        if (formStep < 3) setFormStep(formStep + 1);
    };

    const prevStep = () => {
        if (formStep > 1) setFormStep(formStep - 1);
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });

    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/permit/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/user/permit', { status: tab }, { preserveState: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { icon: Clock, label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
            case 'approved': return { icon: CheckCircle, label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
            case 'rejected': return { icon: XCircle, label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
            default: return { icon: Clock, label: status, bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-700 dark:text-neutral-300', border: 'border-white/20 dark:border-white/5' };
        }
    };

    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

    const toneScore = useMemo(() => {
        const text = data.reason.toLowerCase();
        if (!text.trim()) return 40;

        const formalMarkers = ['mohon', 'izin', 'dengan hormat', 'terima kasih', 'dikarenakan', 'berkenan'];
        const informalMarkers = ['ga', 'gak', 'nggak', 'aja', 'nih', 'dong'];

        const formalCount = formalMarkers.reduce((acc, keyword) => acc + (text.includes(keyword) ? 1 : 0), 0);
        const informalCount = informalMarkers.reduce((acc, keyword) => acc + (text.includes(keyword) ? 1 : 0), 0);
        const punctuationBonus = /[.!?]/.test(text) ? 8 : 0;
        const lengthBonus = text.length >= 80 ? 12 : text.length >= 40 ? 6 : 0;

        return Math.max(5, Math.min(100, 45 + formalCount * 12 - informalCount * 10 + punctuationBonus + lengthBonus));
    }, [data.reason]);

    const toneLabel = useMemo(() => {
        if (toneScore >= 80) return { label: 'Sangat Formal', emoji: '🎓' };
        if (toneScore >= 60) return { label: 'Cukup Formal', emoji: '🙂' };
        if (toneScore >= 40) return { label: 'Netral', emoji: '😐' };

        return { label: 'Terlalu Santai', emoji: '😊' };
    }, [toneScore]);

    const grammarSuggestions = useMemo(() => {
        const suggestions: Array<{ id: string; message: string; fix: string }> = [];
        const text = data.reason;

        if (text.trim() && text.trim().length < 30) {
            suggestions.push({
                id: 'short',
                message: 'Alasan terlalu singkat. Tambahkan konteks agar dosen mudah memverifikasi.',
                fix: `${text.trim()} Saya akan mengikuti materi yang tertinggal setelah kondisi memungkinkan.`,
            });
        }

        const replacements: Array<[RegExp, string, string]> = [
            [/\bgk\b|\bgak\b|\bga\b/gi, 'Gunakan "tidak" agar lebih formal.', text.replace(/\bgk\b|\bgak\b|\bga\b/gi, 'tidak')],
            [/\bkrn\b/gi, 'Gunakan "karena" agar kalimat lebih jelas.', text.replace(/\bkrn\b/gi, 'karena')],
            [/\bizin ya\b/gi, 'Gunakan kalimat permohonan resmi.', text.replace(/\bizin ya\b/gi, 'saya memohon izin')],
        ];

        replacements.forEach(([pattern, message, fixed], index) => {
            if (pattern.test(text)) {
                suggestions.push({
                    id: `replace-${index}`,
                    message,
                    fix: fixed,
                });
            }
        });

        return suggestions.slice(0, 3);
    }, [data.reason]);

    const monthlyData = useMemo(() => {
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const grouped = new Map<string, { month: string; izin: number; sakit: number }>();

        permits.forEach((permit) => {
            const parts = permit.created_at.split(' ');
            const monthToken = parts[1] ?? '';
            const yearToken = parts[2] ?? '';
            const monthIndex = monthName.findIndex((m) => m.toLowerCase() === monthToken.toLowerCase());
            const monthKey = `${monthToken}-${yearToken}`;
            if (!grouped.has(monthKey)) {
                grouped.set(monthKey, { month: monthToken || '-', izin: 0, sakit: 0 });
            }

            const item = grouped.get(monthKey)!;
            if (permit.type === 'izin') {
                item.izin += 1;
            } else {
                item.sakit += 1;
            }

            if (monthIndex === -1) {
                item.month = monthToken || '-';
            }
        });

        return Array.from(grouped.values()).slice(0, 6).reverse();
    }, [permits]);

    const applyTemplate = (template: ReasonTemplate) => {
        setData('reason', template.content);
    };

    const improveReason = () => {
        const base = data.reason.trim();
        if (!base) return;

        let improved = base;
        improved = improved
            .replace(/\bgk\b|\bgak\b|\bga\b/gi, 'tidak')
            .replace(/\bkrn\b/gi, 'karena')
            .replace(/\bsy\b/gi, 'saya');

        if (!improved.toLowerCase().includes('mohon') && !improved.toLowerCase().includes('izin')) {
            improved = `Saya memohon izin tidak mengikuti perkuliahan karena ${improved.charAt(0).toLowerCase()}${improved.slice(1)}`;
        }

        if (!/[.!?]$/.test(improved)) {
            improved += '.';
        }

        if (!improved.toLowerCase().includes('materi')) {
            improved += ' Saya akan mengejar materi yang tertinggal setelah kondisi memungkinkan.';
        }

        setData('reason', improved);
    };

    const applyGrammarSuggestion = (fix: string) => {
        setData('reason', fix);
    };

    const submitComment = (permitId: number) => {
        const message = commentDrafts[permitId]?.trim();
        if (!message) return;

        router.post(`/user/permit/${permitId}/comment`, { message }, {
            preserveScroll: true,
            onSuccess: () => {
                setCommentDrafts((prev) => ({ ...prev, [permitId]: '' }));
            },
        });
    };

    return (
        <StudentLayout>
            <Head title="Pengajuan Izin/Sakit" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        

                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center mx-auto sm:mx-0"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={PermitIcon} alt="Izin/Sakit" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>

                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-indigo-100 font-medium tracking-wide flex items-center justify-center sm:justify-start gap-2"
                                    >
                                        Administrasi Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                    >
                                        Pengajuan Izin/Sakit
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 text-indigo-100 max-w-xl text-sm sm:text-base leading-relaxed mx-auto sm:mx-0"
                                    >
                                        Ajukan izin atau sakit dengan upload surat keterangan resmi
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                className="flex w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => router.visit('/user/permit/create')}
                                    className="border-0 bg-white/20 text-white shadow-lg backdrop-blur hover:bg-white/30 hover:text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajukan Izin
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                >
                    {[
                        {
                            key: 'total',
                            title: 'Total Pengajuan',
                            value: stats.total,
                            icon: totalStatIcon,
                            glow: 'bg-indigo-500',
                            gradientBg: 'from-indigo-500/5 to-indigo-500/5 dark:from-indigo-500/10 dark:to-indigo-500/10',
                        },
                        {
                            key: 'pending',
                            title: 'Menunggu',
                            value: stats.pending,
                            icon: pendingStatIcon,
                            glow: 'bg-yellow-500',
                            gradientBg: 'from-yellow-500/5 to-yellow-500/5 dark:from-yellow-500/10 dark:to-yellow-500/10',
                        },
                        {
                            key: 'approved',
                            title: 'Disetujui',
                            value: stats.approved,
                            icon: approvedStatIcon,
                            glow: 'bg-emerald-500',
                            gradientBg: 'from-emerald-500/5 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/10',
                        },
                        {
                            key: 'rejected',
                            title: 'Ditolak',
                            value: stats.rejected,
                            icon: rejectedStatIcon,
                            glow: 'bg-red-500',
                            gradientBg: 'from-red-500/5 to-red-500/5 dark:from-red-500/10 dark:to-red-500/10',
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.key}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                            onHoverStart={() => setHoveredCard(stat.key)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientBg}`} />
                            <motion.div
                                initial={false}
                                animate={{ scale: hoveredCard === stat.key ? 1.5 : 1, opacity: hoveredCard === stat.key ? 0.4 : 0.2 }}
                                transition={{ duration: 0.5 }}
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.glow} blur-3xl`}
                            />

                            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center"
                                >
                                    <img
                                        src={stat.icon}
                                        alt={stat.title}
                                        className="h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <div>
                                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                                        {stat.title}
                                    </p>
                                    <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Permits List */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Riwayat Pengajuan</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Lihat status pengajuan izin/sakit kamu</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="mb-5 flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveSection('history')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeSection === 'history'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-800/80'
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                Riwayat
                            </button>
                            <button
                                onClick={() => setActiveSection('analytics')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeSection === 'analytics'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-800/80'
                                    }`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Analytics
                            </button>
                        </div>

                        {activeSection === 'history' ? (
                            <>
                                <div className="flex gap-2 mb-6 flex-wrap">
                                    {[
                                        { value: 'all', label: 'Semua', icon: BarChart3, count: stats.total },
                                        { value: 'pending', label: 'Menunggu', icon: Clock, count: stats.pending },
                                        { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                        { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                                    ].map(tab => (
                                        <button
                                            key={tab.value}
                                            onClick={() => handleTabChange(tab.value)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.value
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-800/80'
                                                }`}
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            {tab.label}
                                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.value ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {permits.length > 0 ? (
                                    <div className="space-y-4">
                                        {permits.map((permit) => {
                                            const statusConfig = getStatusConfig(permit.status);
                                            const StatusIcon = statusConfig.icon;
                                            const isDiscussionOpen = openDiscussionId === permit.id;

                                            return (
                                                <motion.div
                                                    key={permit.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    whileHover={{ scale: 1.01, y: -1 }}
                                                    className={`rounded-2xl border-2 p-5 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl hover:shadow-lg transition-all ${permit.status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' :
                                                        permit.status === 'approved' ? 'border-emerald-200 dark:border-emerald-800' :
                                                            permit.status === 'rejected' ? 'border-red-200 dark:border-red-800' :
                                                                'border-white/20 dark:border-white/5'
                                                        }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                                    {statusConfig.label}
                                                                </span>
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${permit.type === 'sakit'
                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                    }`}>
                                                                    {permit.type === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
                                                                </span>
                                                            </div>

                                                            <h4 className="font-bold text-lg text-neutral-900 dark:text-white">{permit.session.mata_kuliah}</h4>
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {permit.session.tanggal_display}
                                                            </p>

                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 p-3 bg-white/60 dark:bg-neutral-800/60 rounded-xl border border-white/20 dark:border-white/5">
                                                                {permit.reason}
                                                            </p>

                                                            {permit.status === 'rejected' && permit.rejection_reason && (
                                                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                                                    <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                                                                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                                                        <span><strong>Alasan ditolak:</strong> {permit.rejection_reason}</span>
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                <div className="rounded-xl border border-white/20 dark:border-white/5 p-2.5 bg-white/60 dark:bg-neutral-800/60">
                                                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Diajukan</p>
                                                                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{permit.created_at}</p>
                                                                </div>
                                                                <div className="rounded-xl border border-white/20 dark:border-white/5 p-2.5 bg-white/60 dark:bg-neutral-800/60">
                                                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Dibaca Dosen</p>
                                                                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{permit.reviewed_at || 'Belum dibaca'}</p>
                                                                </div>
                                                                <div className="rounded-xl border border-white/20 dark:border-white/5 p-2.5 bg-white/60 dark:bg-neutral-800/60">
                                                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{permit.status === 'pending' ? 'Estimasi Diproses' : 'Keputusan'}</p>
                                                                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                                                        {permit.status === 'pending' ? (permit.estimated_approval_at || 'Menunggu antrean') : (permit.approved_at || '-')}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3">
                                                                <button
                                                                    onClick={() => setOpenDiscussionId(isDiscussionOpen ? null : permit.id)}
                                                                    className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                                                >
                                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                                    Diskusi Dosen & Mahasiswa ({permit.comments.length})
                                                                </button>
                                                            </div>

                                                            <AnimatePresence>
                                                                {isDiscussionOpen && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -8 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -8 }}
                                                                        className="mt-3 rounded-2xl border border-white/20 dark:border-white/5 p-3 bg-white/60 dark:bg-neutral-800/60"
                                                                    >
                                                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                                                            {permit.comments.length > 0 ? (
                                                                                permit.comments.map((comment) => (
                                                                                    <div
                                                                                        key={comment.id}
                                                                                        className={`rounded-xl p-2.5 text-sm ${comment.is_mine
                                                                                            ? 'bg-indigo-600 text-white ml-6'
                                                                                            : 'bg-white/70 dark:bg-neutral-900/70 border border-white/20 dark:border-white/5 mr-6 text-neutral-700 dark:text-neutral-200'
                                                                                            }`}
                                                                                    >
                                                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                                                            <p className={`text-xs font-semibold ${comment.is_mine ? 'text-indigo-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                                                                                {comment.sender_name}
                                                                                            </p>
                                                                                            <p className={`text-[10px] ${comment.is_mine ? 'text-indigo-200' : 'text-neutral-400'}`}>
                                                                                                {comment.created_at}
                                                                                            </p>
                                                                                        </div>
                                                                                        <p className="whitespace-pre-wrap">{comment.message}</p>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Belum ada diskusi. Kamu bisa kirim pesan ke dosen dari sini.</p>
                                                                            )}
                                                                        </div>

                                                                        <div className="mt-3 flex gap-2">
                                                                            <Textarea
                                                                                value={commentDrafts[permit.id] || ''}
                                                                                onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [permit.id]: e.target.value }))}
                                                                                rows={2}
                                                                                placeholder="Ketik pertanyaan atau klarifikasi untuk dosen..."
                                                                                className="bg-white/70 dark:bg-neutral-900/70 border-white/20 dark:border-white/5"
                                                                            />
                                                                            <Button
                                                                                size="sm"
                                                                                className="self-end rounded-xl bg-indigo-600 hover:bg-indigo-700"
                                                                                onClick={() => submitComment(permit.id)}
                                                                                disabled={!(commentDrafts[permit.id] || '').trim()}
                                                                            >
                                                                                <Send className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>

                                                            {permit.status === 'approved' && permit.approver && (
                                                                <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Disetujui oleh {permit.approver} pada {permit.approved_at}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2">
                                                            {permit.attachment && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => router.visit(`/user/permit/${permit.id}/attachment`)}
                                                                    className="rounded-xl"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Lihat Surat
                                                                </Button>
                                                            )}
                                                            {permit.status === 'pending' && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => openDeleteDialog(permit.id)}
                                                                    className="rounded-xl"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                                            <FileText className="h-10 w-10 text-teal-500" />
                                        </div>
                                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">Belum ada pengajuan</p>
                                        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Klik tombol "Ajukan Izin" untuk membuat pengajuan baru</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="rounded-2xl border border-blue-200/50 bg-blue-50/70 dark:bg-blue-900/20 dark:border-blue-800/40 p-4">
                                        <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold">Approval Rate</p>
                                        <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-200 mt-1">{approvalRate}%</p>
                                        <p className="text-xs text-blue-500 mt-1">Dari total {stats.total} pengajuan</p>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/70 dark:bg-emerald-900/20 dark:border-emerald-800/40 p-4">
                                        <p className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold">Pengajuan Sakit</p>
                                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-200 mt-1">
                                            {permits.filter((permit) => permit.type === 'sakit').length}
                                        </p>
                                        <p className="text-xs text-emerald-500 mt-1">Perlu lampiran medis untuk validasi</p>
                                    </div>
                                    <div className="rounded-2xl border border-amber-200/50 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-800/40 p-4">
                                        <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Butuh Tindak Lanjut</p>
                                        <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-200 mt-1">{stats.pending}</p>
                                        <p className="text-xs text-amber-500 mt-1">Ajak dosen diskusi di tiap card</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 dark:border-white/5 p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl">
                                    <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">Trend Pengajuan (6 data terakhir)</h4>
                                    <div className="space-y-3">
                                        {monthlyData.length > 0 ? (
                                            monthlyData.map((item) => {
                                                const total = item.izin + item.sakit;
                                                const izinWidth = total ? (item.izin / total) * 100 : 0;
                                                const sakitWidth = total ? (item.sakit / total) * 100 : 0;

                                                return (
                                                    <div key={`${item.month}-${item.izin}-${item.sakit}`} className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
                                                            <span>{item.month}</span>
                                                            <span>{total} pengajuan</span>
                                                        </div>
                                                        <div className="h-2.5 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex">
                                                            <div className="bg-blue-500" style={{ width: `${izinWidth}%` }} />
                                                            <div className="bg-red-500" style={{ width: `${sakitWidth}%` }} />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                                                            <span>Izin: {item.izin}</span>
                                                            <span>Sakit: {item.sakit}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Belum ada data trend.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-purple-200/50 bg-purple-50/70 dark:bg-purple-900/20 dark:border-purple-800/40 p-4">
                                    <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">AI Insights (Rule-Based)</h4>
                                    <ul className="space-y-2 text-xs text-purple-700 dark:text-purple-200">
                                        <li>• Approval rate kamu saat ini <strong>{approvalRate}%</strong>. Gunakan alasan yang jelas dan lampiran agar cepat diproses.</li>
                                        <li>• Selalu cek status timeline: <strong>Diajukan → Dibaca Dosen → Keputusan</strong>.</li>
                                        <li>• Gunakan fitur diskusi untuk klarifikasi langsung ke dosen tanpa harus menunggu ditolak.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Ultra Advanced Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                        onClick={() => { setShowForm(false); setFormStep(1); setShowAiAssistant(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 30, rotateX: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 30, rotateX: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 max-h-[90vh] overflow-hidden flex flex-col"
                            style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Animated Background Orbs */}
                            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        rotate: [0, 90, 180],
                                        opacity: [0.05, 0.1, 0.05],
                                    }}
                                    transition={{
                                        duration: 15,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 blur-3xl"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1, 1.4, 1],
                                        rotate: [180, 90, 0],
                                        opacity: [0.05, 0.08, 0.05],
                                    }}
                                    transition={{
                                        duration: 18,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 blur-3xl"
                                />
                            </div>

                            {/* Header with Close Button */}
                            <div className="relative flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                        whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
                                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white shadow-2xl shadow-teal-500/30"
                                    >
                                        {/* Glow Effect */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 blur-xl"
                                        />
                                        <HeartPulse className="relative h-8 w-8" />
                                    </motion.div>
                                    <div>
                                        <motion.h3
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-2xl font-bold text-neutral-900 dark:text-white"
                                        >
                                            Ajukan Izin/Sakit
                                        </motion.h3>
                                        <motion.p
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-sm text-neutral-500 dark:text-neutral-400 font-medium"
                                        >
                                            Isi form berikut dengan lengkap dan jelas
                                        </motion.p>
                                    </div>
                                </div>
                                <motion.button
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setShowForm(false); setFormStep(1); setShowAiAssistant(false); }}
                                    className="p-3 rounded-xl hover:bg-white/60 dark:hover:bg-neutral-800/70 transition-all group"
                                >
                                    <X className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
                                </motion.button>
                            </div>

                            {/* Stepper */}
                            <div className="mb-8 px-2 sm:px-4">
                                <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="flex w-max min-w-full items-center gap-2 sm:justify-center">
                                        {[
                                            { step: 1, label: 'Pilih Sesi', icon: Calendar },
                                            { step: 2, label: 'Alasan', icon: FileText },
                                            { step: 3, label: 'Lampiran', icon: Upload },
                                        ].map((item, index) => {
                                            const isActive = formStep === item.step;
                                            const isDone = item.step < formStep && completedByStep[item.step];
                                            const canOpen = item.step <= maxUnlockedStep || item.step <= formStep;

                                            return (
                                                <div key={item.step} className="flex shrink-0 items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => {
                                                            if (!canOpen) {
                                                                window.alert('Lengkapi langkah sebelumnya dulu.');
                                                                return;
                                                            }
                                                            setFormStep(item.step);
                                                        }}
                                                        className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm ${
                                                            isActive
                                                                ? 'border-cyan-400 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                                                                : isDone
                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                    : 'border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-700 dark:bg-neutral-800/40'
                                                        } ${canOpen ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'}`}
                                                    >
                                                        {isDone ? <CheckCircle className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                                                        <span className="whitespace-nowrap">{item.label}</span>
                                                    </motion.button>
                                                    {index < 2 && <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Form Content with Advanced Animations */}
                            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-neutral-200 dark:scrollbar-track-neutral-800">
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Session Selection - Ultra Enhanced */}
                                    {formStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="space-y-6"
                                        >
                                            {/* Step Header with Animation */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                                                className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-200/50 dark:border-teal-800/50"
                                            >
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, 5, -5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="inline-block mb-3"
                                                >
                                                    <Calendar className="h-12 w-12 text-teal-600 dark:text-teal-400" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-2">Pilih Sesi Perkuliahan</h3>
                                                <p className="text-sm text-teal-600 dark:text-teal-400">Pilih sesi yang ingin kamu ajukan izin/sakit</p>
                                            </motion.div>

                                            {/* Session Selection with Enhanced Styling */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-neutral-700 dark:text-neutral-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                    </motion.div>
                                                    Sesi Perkuliahan
                                                </Label>
                                                <Select value={data.attendance_session_id} onValueChange={(v) => setData('attendance_session_id', v)}>
                                                    <SelectTrigger className="h-14 border-2 hover:border-teal-400 focus:border-teal-500 transition-all rounded-xl bg-white/70 dark:bg-neutral-800/70 border-white/20 dark:border-white/10 shadow-sm hover:shadow-md">
                                                        <SelectValue placeholder="🎓 Pilih sesi perkuliahan" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {availableSessions.map((s) => (
                                                            <SelectItem key={s.id} value={String(s.id)} className="rounded-lg my-1">
                                                                <div className="flex items-center gap-3 py-1">
                                                                    <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                                                        <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-neutral-900 dark:text-white">{s.mata_kuliah}</p>
                                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.tanggal_display}</p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <AnimatePresence>
                                                    {errors.attendance_session_id && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                        >
                                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                                            {errors.attendance_session_id}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>

                                            {/* Type Selection with Ultra Advanced Cards */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-neutral-700 dark:text-neutral-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                    </motion.div>
                                                    Jenis Pengajuan
                                                </Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[
                                                        { value: 'izin', label: 'Izin', icon: ClipboardList, color: 'blue', gradient: 'from-blue-400 to-blue-600', emoji: '📝' },
                                                        { value: 'sakit', label: 'Sakit', icon: Stethoscope, color: 'red', gradient: 'from-red-400 to-red-600', emoji: '🏥' }
                                                    ].map((type, index) => (
                                                        <motion.button
                                                            key={type.value}
                                                            type="button"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 300 }}
                                                            whileHover={{ scale: 1.05, y: -5 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setData('type', type.value as 'izin' | 'sakit')}
                                                            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${data.type === type.value
                                                                ? type.color === 'blue'
                                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 shadow-xl shadow-blue-500/20'
                                                                    : 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 shadow-xl shadow-red-500/20'
                                                                : 'border-white/20 dark:border-white/10 bg-white/70 dark:bg-neutral-800/70 hover:border-teal-300 dark:hover:border-teal-600'
                                                                }`}
                                                        >
                                                            {/* Animated Background Gradient */}
                                                            {data.type === type.value && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0 }}
                                                                    animate={{ opacity: 0.1, scale: 1 }}
                                                                    className={`absolute inset-0 bg-gradient-to-br ${type.gradient}`}
                                                                />
                                                            )}

                                                            <div className="relative">
                                                                <motion.div
                                                                    whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.1 }}
                                                                    transition={{ duration: 0.6 }}
                                                                    className="mx-auto w-16 h-16 flex items-center justify-center mb-4"
                                                                >
                                                                    <type.icon className={`h-8 w-8 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] ${data.type === type.value
                                                                        ? type.color === 'blue'
                                                                            ? 'text-blue-600 dark:text-blue-300'
                                                                            : 'text-red-600 dark:text-red-300'
                                                                        : 'text-neutral-400 dark:text-neutral-500'
                                                                        }`} />
                                                                </motion.div>
                                                                <div className="text-center">
                                                                    <p className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                                                                        <span>{type.emoji}</span>
                                                                        <span className={data.type === type.value ?
                                                                            (type.color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300')
                                                                            : 'text-neutral-700 dark:text-neutral-300'
                                                                        }>
                                                                            {type.label}
                                                                        </span>
                                                                    </p>
                                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        {type.value === 'izin' ? 'Keperluan pribadi' : 'Kondisi kesehatan'}
                                                                    </p>
                                                                </div>

                                                                {/* Checkmark Indicator */}
                                                                <AnimatePresence>
                                                                    {data.type === type.value && (
                                                                        <motion.div
                                                                            initial={{ scale: 0, rotate: -180 }}
                                                                            animate={{ scale: 1, rotate: 0 }}
                                                                            exit={{ scale: 0, rotate: 180 }}
                                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                            className="absolute top-3 right-3"
                                                                        >
                                                                            <div className={`p-1.5 rounded-full ${type.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
                                                                                } shadow-lg`}>
                                                                                <CheckCircle className="h-4 w-4 text-white" />
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Reason - Ultra Enhanced */}
                                    {formStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="space-y-6"
                                        >
                                            {/* Step Header with Animation */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                                                className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200/50 dark:border-purple-800/50"
                                            >
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        rotate: [0, -5, 5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="inline-block mb-3"
                                                >
                                                    <FileText className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">Alasan Pengajuan</h3>
                                                <p className="text-sm text-purple-600 dark:text-purple-400">Jelaskan alasan izin/sakit dengan detail dan jelas</p>
                                            </motion.div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowAiAssistant((prev) => !prev)}
                                                    className="rounded-xl border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
                                                >
                                                    <Bot className="h-4 w-4 mr-2" />
                                                    ✨ Bantu Saya Menulis
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={improveReason}
                                                    disabled={!data.reason.trim()}
                                                    className="rounded-xl border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
                                                >
                                                    <Wand2 className="h-4 w-4 mr-2" />
                                                    🔄 Perbaiki Tulisan
                                                </Button>
                                                <span className="inline-flex items-center gap-1 rounded-xl bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                    Tone: {toneLabel.emoji} {toneLabel.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="space-y-3"
                                                >
                                                    <Label className="flex items-center justify-between text-base font-semibold text-neutral-700 dark:text-neutral-300">
                                                        <span className="flex items-center gap-2">
                                                            <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}>
                                                                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                            </motion.div>
                                                            Alasan Detail
                                                        </span>
                                                        <motion.span
                                                            animate={{
                                                                color: data.reason.length < 20 ? '#ef4444' : data.reason.length < 50 ? '#f59e0b' : '#10b981'
                                                            }}
                                                            className="text-xs font-mono"
                                                        >
                                                            {data.reason.length}/500
                                                        </motion.span>
                                                    </Label>

                                                    <div className="relative">
                                                        <Textarea
                                                            value={data.reason}
                                                            onChange={(e) => setData('reason', e.target.value)}
                                                            placeholder="Contoh: Saya tidak dapat mengikuti perkuliahan karena sakit demam tinggi dan harus beristirahat di rumah sesuai anjuran dokter..."
                                                            rows={8}
                                                            maxLength={500}
                                                            className="border-2 hover:border-purple-400 focus:border-purple-500 transition-all resize-none rounded-xl bg-white/70 dark:bg-neutral-800/70 border-white/20 dark:border-white/10 shadow-sm focus:shadow-lg pr-12"
                                                        />
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: data.reason.length > 0 ? 1 : 0 }}
                                                            className="absolute bottom-3 right-3"
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${data.reason.length < 20 ? 'bg-red-100 text-red-600' :
                                                                data.reason.length < 50 ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-emerald-100 text-emerald-600'
                                                                }`}>
                                                                {Math.round((data.reason.length / 500) * 100)}%
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {errors.reason && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                            >
                                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                                {errors.reason}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-2xl border-2 border-teal-200/50 dark:border-teal-800/50">
                                                        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-2">Tips Pengajuan:</p>
                                                        <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1.5">
                                                            <li>• Jelaskan kondisi atau situasi dengan detail</li>
                                                            <li>• Sebutkan tanggal dan waktu kejadian</li>
                                                            <li>• Gunakan bahasa sopan dan formal</li>
                                                        </ul>
                                                    </div>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.25 }}
                                                    className="rounded-2xl border border-purple-200/60 dark:border-purple-800/40 bg-purple-50/60 dark:bg-purple-900/20 p-4"
                                                >
                                                    {showAiAssistant ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2">
                                                                <Bot className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                                                <h4 className="text-sm font-bold text-purple-700 dark:text-purple-200">AI Writing Assistant</h4>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mb-2">Template Cepat</p>
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    {REASON_TEMPLATES[data.type].map((template) => (
                                                                        <button
                                                                            key={template.id}
                                                                            type="button"
                                                                            onClick={() => applyTemplate(template)}
                                                                            className="text-left rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-purple-200 dark:border-purple-800 p-2.5 hover:border-purple-400 transition-colors"
                                                                        >
                                                                            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">{template.emoji} {template.title}</p>
                                                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">{template.content}</p>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center justify-between text-xs mb-1">
                                                                    <span className="font-semibold text-purple-600 dark:text-purple-300">Tone Analyzer</span>
                                                                    <span className="text-purple-700 dark:text-purple-200">{toneLabel.emoji} {toneLabel.label}</span>
                                                                </div>
                                                                <div className="h-2.5 rounded-full bg-purple-100 dark:bg-purple-950 overflow-hidden">
                                                                    <div className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-500" style={{ width: `${toneScore}%` }} />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mb-2">Grammar Check</p>
                                                                <div className="space-y-2">
                                                                    {grammarSuggestions.length > 0 ? (
                                                                        grammarSuggestions.map((issue) => (
                                                                            <div key={issue.id} className="rounded-lg border border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-neutral-900/70 p-2">
                                                                                <p className="text-[11px] text-neutral-600 dark:text-neutral-300">{issue.message}</p>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => applyGrammarSuggestion(issue.fix)}
                                                                                    className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300"
                                                                                >
                                                                                    Fix
                                                                                </button>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Tidak ada saran grammar. Teks sudah cukup baik.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-center">
                                                            <div>
                                                                <Sparkles className="h-7 w-7 text-purple-500 mx-auto mb-2" />
                                                                <p className="text-sm font-semibold text-purple-700 dark:text-purple-200">Assistant belum aktif</p>
                                                                <p className="text-xs text-purple-500 mt-1">Klik "Bantu Saya Menulis" untuk template dan saran otomatis.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Attachment - Ultra Enhanced with Advanced Drag & Drop */}
                                    {formStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="space-y-6"
                                        >
                                            {/* Step Header with Animation */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                                                className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200/50 dark:border-blue-800/50"
                                            >
                                                <motion.div
                                                    animate={{
                                                        y: [0, -10, 0],
                                                        rotate: [0, 5, -5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="inline-block mb-3"
                                                >
                                                    <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Surat Keterangan</h3>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">Upload surat keterangan resmi (opsional)</p>
                                            </motion.div>

                                            {/* Ultra Advanced Drag & Drop Zone */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label className="flex items-center gap-2 text-base font-semibold text-neutral-700 dark:text-neutral-300">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </motion.div>
                                                    Lampiran Dokumen
                                                </Label>
                                                <motion.div
                                                    animate={{
                                                        scale: dragActive ? 1.02 : 1,
                                                        borderColor: dragActive ? '#3b82f6' : undefined,
                                                    }}
                                                    onDragEnter={handleDrag}
                                                    onDragLeave={handleDrag}
                                                    onDragOver={handleDrag}
                                                    onDrop={handleDrop}
                                                    className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 overflow-hidden ${dragActive
                                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-xl shadow-blue-500/20'
                                                        : 'border-white/20 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-600 bg-white/70 dark:bg-neutral-800/70'
                                                        }`}
                                                >
                                                    {/* Animated Background Pattern */}
                                                    <motion.div
                                                        animate={{
                                                            opacity: dragActive ? 0.1 : 0,
                                                            scale: dragActive ? 1 : 0.8,
                                                        }}
                                                        className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500"
                                                    />

                                                    <input
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        id="attachment"
                                                    />
                                                    <div className="relative text-center">
                                                        <motion.div
                                                            animate={{
                                                                y: dragActive ? [0, -15, 0] : [0, -10, 0],
                                                                scale: dragActive ? [1, 1.1, 1] : 1,
                                                            }}
                                                            transition={{
                                                                duration: dragActive ? 1 : 2,
                                                                repeat: Infinity
                                                            }}
                                                            className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${dragActive
                                                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30'
                                                                : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                                                                }`}
                                                        >
                                                            <Upload className={`h-10 w-10 ${dragActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                                                                }`} />
                                                        </motion.div>
                                                        <AnimatePresence mode="wait">
                                                            {data.attachment ? (
                                                                <motion.div
                                                                    key="has-file"
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                >
                                                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-center gap-2">
                                                                        <CheckCircle className="h-5 w-5" />
                                                                        File Terpilih!
                                                                    </p>
                                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                                                                        {data.attachment.name}
                                                                    </p>
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key="no-file"
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                >
                                                                    <p className="text-base font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                                                                        {dragActive ? '📥 Lepaskan file di sini' : '📎 Drag & drop file atau klik untuk upload'}
                                                                    </p>
                                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                                        JPG, PNG, PDF • Max 5MB
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>

                                                {/* File Preview Card */}
                                                <AnimatePresence>
                                                    {data.attachment && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                            className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg"
                                                        >
                                                            <motion.div
                                                                animate={{
                                                                    scale: [1, 1.1, 1],
                                                                    rotate: [0, 5, -5, 0],
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                }}
                                                                className="p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30"
                                                            >
                                                                <FileCheck className="h-8 w-8 text-white" />
                                                            </motion.div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 truncate mb-1">
                                                                    {data.attachment.name}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400">
                                                                    <span className="font-mono">{(data.attachment.size / 1024).toFixed(2)} KB</span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Siap diupload
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => setData('attachment', null)}
                                                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                            >
                                                                <X className="h-5 w-5 text-red-500" />
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <AnimatePresence>
                                                    {errors.attachment && (
                                                        <motion.p
                                                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                        >
                                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                                            {errors.attachment}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>

                                            {/* Info Card */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/50"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <motion.div
                                                        animate={{
                                                            rotate: [0, -10, 10, 0],
                                                            scale: [1, 1.1, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                    >
                                                        <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Catatan Penting:</p>
                                                        <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-amber-500 mt-0.5">•</span>
                                                                <span>Upload surat keterangan resmi untuk mempercepat persetujuan</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-amber-500 mt-0.5">•</span>
                                                                <span>Pastikan file jelas dan mudah dibaca</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-amber-500 mt-0.5">•</span>
                                                                <span>Format yang didukung: JPG, PNG, PDF</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-3 pt-4 border-t border-white/20 dark:border-white/10">
                                    {formStep > 1 && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button type="button" variant="outline" onClick={prevStep} className="gap-2 rounded-xl">
                                                <ArrowLeft className="h-4 w-4" />
                                                Kembali
                                            </Button>
                                        </motion.div>
                                    )}
                                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormStep(1); setShowAiAssistant(false); }} className="flex-1 rounded-xl">
                                        Batal
                                    </Button>
                                    {formStep < 3 ? (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button type="button" onClick={nextStep} className="gap-2 rounded-xl bg-teal-600 hover:bg-teal-700">
                                                Lanjut
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
                                            >
                                                {processing ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                        </motion.div>
                                                        Mengirim...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        Kirim Pengajuan
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                onConfirm={handleDelete}
                title="Batalkan Pengajuan"
                message="Yakin ingin membatalkan pengajuan izin/sakit ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                confirmText="Ya, Batalkan"
                cancelText="Tidak"
            />
        </StudentLayout>
    );
}
