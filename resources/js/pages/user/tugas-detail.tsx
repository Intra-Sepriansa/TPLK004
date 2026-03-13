import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    Download,
    FileText,
    Flag,
    MessageSquare,
    Pin,
    Reply,
    Send,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import tugasHeaderIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';

type Diskusi = {
    id: number;
    sender_type: string;
    sender_name: string;
    sender_avatar: string | null;
    pesan: string;
    visibility: string;
    recipient_name: string | null;
    is_pinned: boolean;
    is_mine: boolean;
    reply_to_id: number | null;
    reply_to?: { sender_name: string; pesan: string } | null;
    created_at: string;
    time_ago: string;
};

type Submission = {
    id: number;
    content: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    grade: number | null;
    grade_letter: string | null;
    feedback: string | null;
    submitted_at: string | null;
    graded_at: string | null;
};

type Tugas = {
    id: number;
    judul: string;
    deskripsi: string;
    instruksi: string | null;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    allow_late_submission: boolean;
    late_penalty_percent: number;
    max_grade: number;
    course: {
        id: number;
        nama: string;
        dosen: string | null;
        dosen_id: number | null;
    };
    created_by: string;
    is_overdue: boolean;
    days_until_deadline: number;
    created_at: string;
};

type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugas: Tugas;
    diskusi: Diskusi[];
    submission: Submission | null;
};

export default function UserTugasDetail({ tugas, diskusi, submission }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>(
        'public',
    );
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const submitForm = useForm({
        content: submission?.content || '',
        file: null as File | null,
    });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [diskusi]);

    const handleSubmit = () => {
        const formData = new FormData();
        if (submitForm.data.content)
            formData.append('content', submitForm.data.content);
        if (submitForm.data.file) formData.append('file', submitForm.data.file);

        router.post(`/user/tugas/${tugas.id}/submit`, formData, {
            forceFormData: true,
            onSuccess: () => setShowSubmitForm(false),
        });
    };

    const sendMessage = () => {
        if (!message.trim()) return;

        router.post(
            `/user/tugas/${tugas.id}/message`,
            {
                pesan: message,
                visibility,
                reply_to_id: replyTo?.id || null,
            },
            {
                onSuccess: () => {
                    setMessage('');
                    setReplyTo(null);
                },
                preserveScroll: true,
            },
        );
    };

    const handleReply = (d: Diskusi) => {
        setReplyTo(d);
        inputRef.current?.focus();
    };

    const getPriorityStyle = (priority: string) =>
        ({
            tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
            sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg',
            rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg',
        })[priority] || 'bg-gray-100 text-gray-700';

    const getSenderStyle = (type: string) =>
        ({
            admin: 'bg-gradient-to-br from-red-500 to-pink-600 text-white',
            dosen: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
            mahasiswa:
                'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
        })[type] || 'bg-gray-100 text-gray-700';

    return (
        <StudentLayout>
            <Head title={tugas.judul} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-5 p-4 sm:space-y-6 sm:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/user/tugas">
                            <motion.button
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar Tugas
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-4 text-white shadow-2xl sm:p-7 lg:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                                <div className="mb-5 flex w-full flex-col items-center gap-4 text-center sm:mb-6 sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            delay: 0.2,
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        className="relative mx-auto flex h-16 w-16 items-center justify-center sm:mx-0 sm:h-20 sm:w-20"
                                    >
                                        <img
                                            src={tugasHeaderIcon}
                                            alt="Tugas"
                                            className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                        />
                                    </motion.div>

                                    <div className="mt-1 flex-1 sm:mt-0">
                                        <p className="text-sm font-medium text-white/90">
                                            Detail Tugas
                                        </p>
                                        <h1 className="mt-1 text-xl leading-tight font-bold text-white sm:text-3xl">
                                            {tugas.judul}
                                        </h1>
                                    </div>
                                </div>

                                <div className="mb-4 flex flex-wrap items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                    >
                                        <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-sm font-bold text-white shadow-lg">
                                            {tugas.jenis}
                                        </Badge>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                    >
                                        <Badge
                                            className={`${getPriorityStyle(tugas.prioritas)} px-4 py-2 text-sm font-bold`}
                                        >
                                            <Flag className="mr-2 h-4 w-4" />
                                            Prioritas{' '}
                                            {tugas.prioritas
                                                .charAt(0)
                                                .toUpperCase() +
                                                tugas.prioritas.slice(1)}
                                        </Badge>
                                    </motion.div>
                                </div>

                                <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md sm:w-auto sm:justify-start"
                                    >
                                        <BookOpen className="h-5 w-5 text-white" />
                                        <span className="text-sm font-bold text-white">
                                            {tugas.course.nama}
                                        </span>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md sm:w-auto sm:justify-start"
                                    >
                                        <Calendar className="h-5 w-5 text-white" />
                                        <span className="text-sm font-bold text-white">
                                            {tugas.deadline_display}
                                        </span>
                                    </motion.div>

                                    {tugas.course.dosen && (
                                        <motion.div
                                            whileHover={{ scale: 1.04, y: -4 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 15,
                                            }}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md sm:w-auto sm:justify-start"
                                        >
                                            <Award className="h-5 w-5 text-white" />
                                            <span className="text-sm font-bold text-white">
                                                {tugas.course.dosen}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                    delay: 0.2,
                                }}
                                className="w-full min-w-0 rounded-2xl border-2 border-white/30 bg-white/20 p-5 shadow-2xl backdrop-blur-xl sm:w-auto sm:min-w-[180px] sm:p-6"
                            >
                                <div className="text-center">
                                    <p className="mb-2 text-sm font-semibold text-white/90">
                                        Sisa Waktu
                                    </p>
                                    <motion.div
                                        animate={
                                            tugas.is_overdue
                                                ? { scale: [1, 1.1, 1] }
                                                : {}
                                        }
                                        transition={
                                            tugas.is_overdue
                                                ? {
                                                      duration: 1.5,
                                                      repeat: Infinity,
                                                  }
                                                : {}
                                        }
                                        className={`text-4xl font-extrabold sm:text-5xl ${
                                            tugas.is_overdue
                                                ? 'text-red-300'
                                                : tugas.days_until_deadline <= 3
                                                  ? 'text-amber-300'
                                                  : 'text-white'
                                        }`}
                                    >
                                        {tugas.is_overdue
                                            ? '❌'
                                            : tugas.days_until_deadline}
                                    </motion.div>
                                    <p className="mt-2 text-sm font-semibold text-white/90">
                                        {tugas.is_overdue
                                            ? 'Sudah Lewat'
                                            : 'Hari Lagi'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-lg sm:p-3"
                        >
                            <FileText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                        </motion.div>
                        Deskripsi Tugas
                    </h3>
                    <div className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-800/60">
                        <p className="text-base leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                            {tugas.deskripsi}
                        </p>
                    </div>
                </motion.div>

                {tugas.instruksi && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <h3 className="mb-4 flex items-center gap-3 text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg sm:p-3"
                            >
                                <CheckCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </motion.div>
                            Instruksi Pengerjaan
                        </h3>
                        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-800/60">
                            <p className="text-base leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                                {tugas.instruksi}
                            </p>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <h3 className="mb-5 flex items-center gap-3 text-xl font-bold text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-lg"
                            >
                                <Award className="h-6 w-6 text-white" />
                            </motion.div>
                            Informasi
                        </h3>
                        <div className="space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.04, y: -4 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                }}
                                className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                            >
                                <p className="mb-1 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                    Dosen Pengampu
                                </p>
                                <p className="text-lg font-extrabold text-neutral-900 dark:text-white">
                                    {tugas.course.dosen || '-'}
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.04, y: -4 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                }}
                                className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                            >
                                <p className="mb-1 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                    Deadline
                                </p>
                                <p className="text-lg font-extrabold text-neutral-900 dark:text-white">
                                    {tugas.deadline_display}
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.04, y: -4 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                }}
                                className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                            >
                                <p className="mb-1 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                    Nilai Maksimal
                                </p>
                                <p className="text-lg font-extrabold text-neutral-900 dark:text-white">
                                    {tugas.max_grade}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <h3 className="mb-5 flex items-center gap-3 text-xl font-bold text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg"
                            >
                                <FileText className="h-6 w-6 text-white" />
                            </motion.div>
                            Status Pengumpulan
                        </h3>

                        {submission ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {submission.status === 'graded' ? (
                                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                                            ✓ Dinilai
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                                            📤 Dikumpulkan
                                        </Badge>
                                    )}
                                </div>

                                {submission.file_name && (
                                    <a
                                        href={submission.file_path || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 p-4 text-emerald-700 transition-all hover:shadow-lg dark:border-emerald-700 dark:from-emerald-900/40 dark:to-teal-900/40 dark:text-emerald-300"
                                    >
                                        <div className="rounded-lg bg-emerald-500 p-2">
                                            <Download className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="truncate font-bold">
                                            {submission.file_name}
                                        </span>
                                    </a>
                                )}

                                {submission.grade !== null && (
                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-5 shadow-2xl">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm font-bold text-white/90">
                                                Nilai Akhir:
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl font-extrabold text-white sm:text-4xl">
                                                    {submission.grade}
                                                </span>
                                                {submission.grade_letter && (
                                                    <span className="rounded-xl bg-white/20 px-4 py-2 text-xl font-extrabold text-white shadow-lg backdrop-blur-sm">
                                                        {
                                                            submission.grade_letter
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {submission.feedback && (
                                            <div className="mt-3 border-t border-white/20 pt-3">
                                                <p className="mb-1 text-xs font-semibold text-white/80">
                                                    Feedback Dosen:
                                                </p>
                                                <p className="text-sm leading-relaxed text-white">
                                                    {submission.feedback}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!showSubmitForm && (
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                        onClick={() => setShowSubmitForm(true)}
                                        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700"
                                    >
                                        Update Submission
                                    </motion.button>
                                )}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                                    Belum ada submission
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    }}
                                    onClick={() => setShowSubmitForm(true)}
                                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700"
                                >
                                    Submit Sekarang
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showSubmitForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 sm:p-6 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white shadow-lg">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                Submit Tugas
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Upload jawaban tugas Anda
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowSubmitForm(false)}
                                        className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                                {tugas.is_overdue && (
                                    <div className="rounded-2xl border-2 border-amber-400/50 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-900/20">
                                        <div className="flex items-center gap-3 text-sm font-semibold text-amber-900 dark:text-amber-300">
                                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                            <span>
                                                Deadline sudah lewat. Nilai akan
                                                dikurangi{' '}
                                                {tugas.late_penalty_percent}%.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                        Jawaban Tugas
                                    </label>
                                    <Textarea
                                        value={submitForm.data.content}
                                        onChange={(e) =>
                                            submitForm.setData(
                                                'content',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Tulis jawaban Anda di sini..."
                                        className="min-h-[200px] resize-none rounded-2xl border-white/20 bg-white/60 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                        Upload File (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            if (
                                                e.target.files &&
                                                e.target.files[0]
                                            ) {
                                                submitForm.setData(
                                                    'file',
                                                    e.target.files[0],
                                                );
                                            }
                                        }}
                                        className="w-full rounded-xl border border-white/20 bg-white/60 p-3 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                        onClick={handleSubmit}
                                        disabled={
                                            !submitForm.data.content.trim() &&
                                            !submitForm.data.file
                                        }
                                        className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Send className="h-5 w-5" />
                                            Submit Tugas
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 15,
                                        }}
                                        onClick={() => setShowSubmitForm(false)}
                                        className="w-full rounded-xl bg-white/60 px-6 py-3 font-bold text-neutral-900 backdrop-blur-xl transition-all hover:bg-white/80 sm:w-auto dark:bg-neutral-800/60 dark:text-white dark:hover:bg-neutral-700/60"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 sm:px-6 sm:py-4 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 text-white shadow-lg">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                    Diskusi & Tanya Jawab
                                </h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {diskusi.length} pesan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat area — adaptive height with scrollable overflow */}
                    <div className="max-h-[400px] min-h-[100px] space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                        {diskusi.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="mb-3 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
                                    <MessageSquare className="h-8 w-8 text-neutral-400" />
                                </div>
                                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                                    Belum ada diskusi
                                </p>
                                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                                    Mulai percakapan dengan mengirim pesan di
                                    bawah
                                </p>
                            </div>
                        )}
                        <AnimatePresence>
                            {diskusi.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`flex items-end gap-2 ${msg.is_mine ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className="mb-5 flex-shrink-0">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${getSenderStyle(msg.sender_type)}`}
                                        >
                                            {msg.sender_name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Bubble wrapper — uses inline-block for auto-width */}
                                    <div
                                        className={`flex max-w-[65%] flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}
                                    >
                                        {/* Sender info */}
                                        <div
                                            className={`mb-1 flex items-center gap-1.5 px-1 ${msg.is_mine ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                                                {msg.sender_name}
                                            </span>
                                            <span className="text-[10px] text-neutral-400">
                                                {msg.time_ago}
                                            </span>
                                            {msg.is_pinned && (
                                                <Pin className="h-3 w-3 text-amber-500" />
                                            )}
                                        </div>

                                        {/* Reply quote — shown inside bubble area */}
                                        {msg.reply_to && (
                                            <div
                                                className={`mb-1 w-full rounded-lg border-l-2 border-indigo-400 bg-neutral-100/80 px-2.5 py-1.5 dark:bg-neutral-700/60 ${msg.is_mine ? 'border-white/40' : ''}`}
                                            >
                                                <p className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                                                    {msg.reply_to.sender_name}
                                                </p>
                                                <p className="line-clamp-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                                                    {msg.reply_to.pesan}
                                                </p>
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div
                                            className={`inline-block rounded-2xl px-3.5 py-2.5 shadow-sm ${
                                                msg.is_mine
                                                    ? 'rounded-br-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                    : 'rounded-bl-md bg-white/80 text-neutral-900 dark:bg-neutral-800/80 dark:text-white'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {msg.pesan}
                                            </p>
                                        </div>

                                        {/* Reply action */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleReply(msg)}
                                            className={`mt-1 flex items-center gap-1 px-1 text-[11px] text-neutral-400 transition-colors hover:text-indigo-500 dark:hover:text-indigo-400 ${msg.is_mine ? 'flex-row-reverse' : ''}`}
                                        >
                                            <Reply className="h-3 w-3" />
                                            Reply
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="border-t border-white/20 bg-white/30 p-3 sm:p-4 dark:border-white/5 dark:bg-neutral-900/30">
                        {replyTo && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border-l-3 border-indigo-500 bg-indigo-50/80 px-3 py-2 dark:bg-indigo-900/20"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                        Membalas {replyTo.sender_name}
                                    </p>
                                    <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                                        {replyTo.pesan}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setReplyTo(null)}
                                    className="flex-shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </motion.div>
                        )}

                        <div className="mb-2.5 flex items-center gap-1.5">
                            <button
                                onClick={() => setVisibility('public')}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                                    visibility === 'public'
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'bg-white/60 text-neutral-500 hover:bg-white/80 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                                }`}
                            >
                                Public
                            </button>
                            <button
                                onClick={() => setVisibility('private')}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                                    visibility === 'private'
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'bg-white/60 text-neutral-500 hover:bg-white/80 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                                }`}
                            >
                                Private
                            </button>
                        </div>

                        <div className="flex items-end gap-2">
                            <Textarea
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Ketik pesan..."
                                rows={1}
                                className="max-h-[100px] min-h-[42px] flex-1 resize-none rounded-2xl border-white/20 bg-white/60 text-sm text-neutral-900 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60 dark:text-white"
                            />

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2.5 text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
