import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    Calendar,
    CheckCircle,
    Clock,
    CornerDownRight,
    Edit3,
    FileText,
    Image as ImageIcon,
    Lock,
    MessageSquare,
    Pin,
    Plus,
    Reply,
    Send,
    Smile,
    Sparkles,
    Trash2,
    User,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

type Diskusi = {
    id: number;
    sender_type: string;
    sender_name: string;
    sender_avatar: string | null;
    sender_nim?: string | null;
    lampiran_url?: string | null;
    lampiran_nama?: string | null;
    pesan: string;
    visibility: string;
    recipient_name: string | null;
    is_pinned: boolean;
    reply_to_id: number | null;
    reply_to?: { sender_name: string; pesan: string } | null;
    is_me: boolean;
    created_at_iso?: string | null;
    created_at: string;
    time_ago: string;
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
    status: string;
    course: { id: number; nama: string };
    created_by: string;
    created_by_type: string;
    edited_by: string | null;
    edited_at: string | null;
    is_overdue: boolean;
    days_until_deadline: number;
    created_at: string;
};
type Props = { tugas: Tugas; diskusi: Diskusi[] };

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
};

const formatChatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

const getChatDayKey = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'invalid';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getChatDayLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    const messageDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor(
        (today.getTime() - messageDay.getTime()) / 86400000,
    );

    if (diffDays <= 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) {
        const weekday = new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
        }).format(date);
        return weekday.charAt(0).toUpperCase() + weekday.slice(1);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export default function DosenTugasDetail({ tugas, diskusi }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [attachmentImage, setAttachmentImage] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
        null,
    );
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [diskusi]);

    useEffect(() => {
        return () => {
            if (attachmentPreview) {
                URL.revokeObjectURL(attachmentPreview);
            }
        };
    }, [attachmentPreview]);

    const clearAttachment = () => {
        if (attachmentPreview) {
            URL.revokeObjectURL(attachmentPreview);
        }
        setAttachmentPreview(null);
        setAttachmentImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePickAttachment = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;

        if (attachmentPreview) {
            URL.revokeObjectURL(attachmentPreview);
        }
        setAttachmentImage(file);
        setAttachmentPreview(URL.createObjectURL(file));
    };

    const sendMessage = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage && !attachmentImage) return;

        const payload = new FormData();
        payload.append('pesan', trimmedMessage);
        payload.append('visibility', visibility);
        if (replyTo?.id) {
            payload.append('reply_to_id', String(replyTo.id));
        }
        if (attachmentImage) {
            payload.append('lampiran', attachmentImage);
        }

        router.post(`/dosen/tugas/${tugas.id}/message`, payload, {
            onSuccess: () => {
                setMessage('');
                setReplyTo(null);
                clearAttachment();
            },
            preserveScroll: true,
        });
    };

    const handleReply = (d: Diskusi) => {
        setReplyTo(d);
        inputRef.current?.focus();
    };
    const togglePin = (id: number) =>
        router.patch(
            `/dosen/tugas/diskusi/${id}/pin`,
            {},
            { preserveScroll: true },
        );
    const openDeleteDialog = (id: number) =>
        setDeleteDialog({ open: true, id });
    const deleteMessage = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/tugas/diskusi/${deleteDialog.id}`, {
                preserveScroll: true,
            });
            setDeleteDialog({ open: false, id: null });
        }
    };

    const getPriorityStyle = (p: string) =>
        ({
            tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
            sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
            rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
        })[p] || 'bg-gray-100 text-gray-700';

    const getStatusStyle = (s: string) =>
        ({
            published:
                'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
            draft: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
            closed: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
        })[s] || 'bg-gray-100 text-gray-700';

    const getSenderStyle = (type: string) =>
        ({
            admin: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white',
            dosen: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
            mahasiswa:
                'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
        })[type] || 'bg-gray-100 text-gray-700';

    return (
        <DosenLayout>
            <Head title={tugas.judul} />
            <div className="space-y-6 p-4 md:p-6">
                {/* ═══ BACK BUTTON ═══ */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/dosen/tugas')}
                        className="group transition-all duration-300 hover:bg-white/60 dark:hover:bg-neutral-800/60"
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
                        Kembali ke Daftar Tugas
                    </Button>
                </motion.div>

                {/* ═══ GRADIENT HEADER (kas-matching) ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl p-5 shadow-2xl sm:p-6 md:p-8"
                >
                    {/* Animated gradient bg */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Pulse rings */}
                    <div className="relative">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                <motion.div className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                                    <img
                                        src={TugasIcon}
                                        alt="Header Icon"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl leading-tight font-bold text-white sm:text-3xl">
                                        {tugas.judul}
                                    </h1>
                                    <p className="mt-1 text-sm text-white/70">
                                        {tugas.course.nama}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Badges row */}
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <Badge
                                className={`${getPriorityStyle(tugas.prioritas)} flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold capitalize`}
                            >
                                <Zap className="h-3.5 w-3.5" />
                                {tugas.prioritas}
                            </Badge>
                            <Badge
                                className={`${getStatusStyle(tugas.status)} flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold capitalize`}
                            >
                                <CheckCircle className="h-3.5 w-3.5" />
                                {tugas.status}
                            </Badge>
                            <Badge className="flex items-center gap-1.5 border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-semibold text-white capitalize backdrop-blur-md">
                                <FileText className="h-3.5 w-3.5" />
                                {tugas.jenis}
                            </Badge>
                            {tugas.is_overdue && (
                                <div>
                                    <Badge className="flex items-center gap-1.5 border border-red-400/30 bg-red-500/80 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Overdue
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Summary stats in header */}
                        <motion.div
                            className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 md:grid-cols-4 md:gap-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {[
                                {
                                    label: 'Sisa Waktu',
                                    value: tugas.is_overdue
                                        ? 'Lewat'
                                        : `${tugas.days_until_deadline} Hari`,
                                    sub: tugas.is_overdue
                                        ? 'Deadline terlewati'
                                        : 'Hingga deadline',
                                    icon: Clock,
                                },
                                {
                                    label: 'Total Diskusi',
                                    value: diskusi.length.toString(),
                                    sub: 'Pesan diskusi',
                                    icon: MessageSquare,
                                },
                                {
                                    label: 'Jenis Tugas',
                                    value: tugas.jenis,
                                    sub: 'Tipe assignment',
                                    icon: FileText,
                                },
                                {
                                    label: 'Deadline',
                                    value:
                                        tugas.deadline_display?.split(',')[0] ||
                                        '-',
                                    sub:
                                        tugas.deadline_display?.split(',')[1] ||
                                        '',
                                    icon: Calendar,
                                },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    className="rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl sm:rounded-2xl sm:p-4"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                >
                                    <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                                        <span className="text-[10px] font-medium text-white/75 sm:text-xs">
                                            {s.label}
                                        </span>
                                        <div className="rounded-lg bg-white/20 p-1 sm:p-1.5">
                                            <s.icon className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
                                        </div>
                                    </div>
                                    <p className="text-sm leading-tight font-bold text-white capitalize sm:text-lg md:text-xl">
                                        {s.value}
                                    </p>
                                    <p className="mt-0.5 text-[10px] leading-tight text-white/60 sm:text-xs sm:leading-normal">
                                        {s.sub}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div
                            className="mt-6 grid grid-cols-1 gap-2 border-t border-white/10 pt-5 sm:flex sm:flex-wrap sm:gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                    router.visit(
                                        `/dosen/tugas/${tugas.id}/grading`,
                                    )
                                }
                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                            >
                                <Award className="h-4 w-4" /> Penilaian
                                Submission
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══ DETAIL CARDS (kas-matching containers) ═══ */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    {/* Deskripsi Card */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 text-white shadow-lg shadow-amber-500/30">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Deskripsi Tugas
                            </h3>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {tugas.deskripsi}
                        </p>
                    </motion.div>

                    {/* Instruksi Card */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-2.5 text-white shadow-lg shadow-purple-500/30">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Instruksi Pengerjaan
                            </h3>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {tugas.instruksi || 'Belum ada instruksi khusus.'}
                        </p>
                    </motion.div>

                    {/* Creator Info Card */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-2.5 text-white shadow-lg shadow-emerald-500/30">
                                <User className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Dibuat oleh
                            </h3>
                        </div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {tugas.created_by}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            <span className="capitalize">
                                {tugas.created_by_type}
                            </span>{' '}
                            • {tugas.created_at}
                        </p>
                    </motion.div>

                    {/* Editor Info Card */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-2.5 text-white shadow-lg shadow-pink-500/30">
                                <Edit3 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Terakhir diedit
                            </h3>
                        </div>
                        {tugas.edited_by ? (
                            <>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                    {tugas.edited_by}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {tugas.edited_at}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Belum pernah diedit
                            </p>
                        )}
                    </motion.div>
                </motion.div>

                {/* ═══ DISKUSI SECTION (kas-matching container) ═══ */}
                <motion.div
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Diskusi Header (gradient like kas.tsx section headers) */}
                    <div className="relative overflow-hidden border-b border-white/10 p-4 sm:p-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10" />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                                <motion.div
                                    className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white shadow-lg shadow-purple-500/30"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                        Diskusi Tugas
                                        <motion.span
                                            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-1 text-sm font-semibold text-white shadow-lg"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: 0.4,
                                                type: 'spring',
                                            }}
                                        >
                                            {diskusi.length}
                                        </motion.span>
                                    </h2>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                        Diskusi terkait tugas ini
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="relative max-h-[600px] space-y-3 overflow-y-auto p-4 sm:space-y-4 sm:p-6">
                        {diskusi.length === 0 ? (
                            <motion.div
                                className="py-14 text-center sm:py-20"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="relative mx-auto mb-6 h-24 w-24 sm:mb-8 sm:h-32 sm:w-32">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl" />
                                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl shadow-purple-500/30">
                                        <MessageSquare className="h-12 w-12 text-white sm:h-16 sm:w-16" />
                                    </div>
                                </div>
                                <motion.p
                                    className="mb-3 text-xl font-bold text-slate-700 dark:text-slate-300"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Belum ada diskusi
                                </motion.p>
                                <motion.p
                                    className="text-sm text-slate-500"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Mulai diskusi dengan mengirim pesan pertama
                                </motion.p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {diskusi.map((d, index) => {
                                    const replyTarget = d.reply_to_id
                                        ? diskusi.find(
                                              (x) => x.id === d.reply_to_id,
                                          )
                                        : null;
                                    const isMe = d.is_me;
                                    const createdAtValue =
                                        d.created_at_iso ?? d.created_at;
                                    const chatTime =
                                        formatChatTime(createdAtValue);
                                    const currentDayKey =
                                        getChatDayKey(createdAtValue);
                                    const previousDayKey =
                                        index > 0
                                            ? getChatDayKey(
                                                  diskusi[index - 1]
                                                      .created_at_iso ??
                                                      diskusi[index - 1]
                                                          .created_at,
                                              )
                                            : null;
                                    const showDaySeparator =
                                        index === 0 ||
                                        currentDayKey !== previousDayKey;
                                    const senderMeta =
                                        d.sender_nim ||
                                        (d.sender_type === 'dosen'
                                            ? null
                                            : d.sender_type.toUpperCase());
                                    return (
                                        <motion.div
                                            key={d.id}
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.3,
                                            }}
                                            className={cn(
                                                'relative flex w-full flex-col gap-2',
                                                isMe
                                                    ? 'items-end'
                                                    : 'items-start',
                                                d.is_pinned
                                                    ? 'order-first'
                                                    : '',
                                            )}
                                        >
                                            {showDaySeparator && (
                                                <div className="flex w-full justify-center py-1">
                                                    <span className="rounded-full border border-white/20 bg-white/60 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-slate-300">
                                                        {getChatDayLabel(
                                                            createdAtValue,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Reply indicator */}
                                            {replyTarget && (
                                                <motion.div
                                                    className={cn(
                                                        'w-full max-w-[84%] rounded-xl border border-white/30 bg-white/50 p-2 text-xs backdrop-blur-sm sm:max-w-[78%] md:max-w-[70%] dark:border-neutral-700/50 dark:bg-neutral-800/50',
                                                        isMe
                                                            ? 'mr-9 text-right sm:mr-12'
                                                            : 'ml-9 text-left sm:ml-12',
                                                    )}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex items-center gap-2',
                                                            isMe
                                                                ? 'justify-end'
                                                                : 'justify-start',
                                                        )}
                                                    >
                                                        <CornerDownRight className="h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
                                                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                            Balas{' '}
                                                            {
                                                                replyTarget.sender_name
                                                            }
                                                            :
                                                        </span>
                                                        <span className="max-w-[150px] truncate text-slate-600 dark:text-slate-400">
                                                            "{replyTarget.pesan}
                                                            "
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div
                                                className={cn(
                                                    'flex w-full items-end gap-2',
                                                    isMe
                                                        ? 'justify-end'
                                                        : 'justify-start',
                                                )}
                                            >
                                                {!isMe && (
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.08,
                                                        }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 400,
                                                            damping: 25,
                                                        }}
                                                    >
                                                        <Avatar className="h-7 w-7 flex-shrink-0 shadow-md ring-2 ring-white/30 sm:h-10 sm:w-10 dark:ring-neutral-700/60">
                                                            {d.sender_avatar && (
                                                                <AvatarImage
                                                                    src={
                                                                        d.sender_avatar
                                                                    }
                                                                    alt={
                                                                        d.sender_name
                                                                    }
                                                                    className="object-cover"
                                                                />
                                                            )}
                                                            <AvatarFallback
                                                                className={cn(
                                                                    'text-sm font-bold',
                                                                    getSenderStyle(
                                                                        d.sender_type,
                                                                    ),
                                                                )}
                                                            >
                                                                {d.sender_name.charAt(
                                                                    0,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.div>
                                                )}

                                                {/* Message Card */}
                                                <motion.div
                                                    className={cn(
                                                        'relative w-fit max-w-[84%] overflow-hidden rounded-2xl border px-2.5 py-2 backdrop-blur-md transition-all duration-300 sm:max-w-[78%] sm:px-4 sm:py-3 md:max-w-[70%]',
                                                        isMe
                                                            ? 'rounded-br-md border-indigo-500/30 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-500/20'
                                                            : 'rounded-bl-md border-white/40 bg-white/85 shadow-md dark:border-neutral-700/50 dark:bg-neutral-800/85',
                                                        d.is_pinned
                                                            ? 'ring-2 ring-amber-400/40'
                                                            : '',
                                                    )}
                                                    whileHover={{
                                                        scale: 1.01,
                                                        y: -1,
                                                    }}
                                                >
                                                    {d.is_pinned && (
                                                        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[10px] font-semibold text-white">
                                                            <Pin className="h-3 w-3" />{' '}
                                                            Pinned
                                                        </div>
                                                    )}

                                                    <div
                                                        className={cn(
                                                            'mb-1 flex items-center gap-1 pr-10 text-[10px] sm:gap-1.5 sm:pr-14 sm:text-[11px]',
                                                            isMe
                                                                ? 'justify-end text-indigo-100/90'
                                                                : 'justify-start text-slate-500 dark:text-slate-400',
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'font-semibold sm:font-bold',
                                                                isMe
                                                                    ? 'text-white'
                                                                    : 'text-slate-900 dark:text-slate-100',
                                                            )}
                                                        >
                                                            {d.sender_name}
                                                        </span>
                                                        {senderMeta && (
                                                            <>
                                                                {d.sender_type !==
                                                                    'dosen' && (
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                )}
                                                                <span>
                                                                    {senderMeta}
                                                                </span>
                                                            </>
                                                        )}
                                                        {d.visibility ===
                                                            'private' && (
                                                            <span
                                                                className={cn(
                                                                    'ml-1 rounded px-1.5 py-0.5 text-[9px] font-semibold',
                                                                    isMe
                                                                        ? 'bg-white/15 text-white'
                                                                        : 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
                                                                )}
                                                            >
                                                                PRIVATE
                                                            </span>
                                                        )}
                                                    </div>

                                                    {d.lampiran_url && (
                                                        <a
                                                            href={
                                                                d.lampiran_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mb-2 block overflow-hidden rounded-xl border border-white/20"
                                                        >
                                                            <img
                                                                src={
                                                                    d.lampiran_url
                                                                }
                                                                alt={
                                                                    d.lampiran_nama ??
                                                                    'Lampiran gambar'
                                                                }
                                                                className="max-h-72 w-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        </a>
                                                    )}

                                                    {d.pesan?.trim() && (
                                                        <p
                                                            className={cn(
                                                                'mb-1 text-[13px] leading-relaxed break-words whitespace-pre-wrap sm:text-sm',
                                                                isMe
                                                                    ? 'text-white/95'
                                                                    : 'text-slate-700 dark:text-slate-300',
                                                            )}
                                                        >
                                                            {d.pesan}
                                                        </p>
                                                    )}

                                                    <div
                                                        className={cn(
                                                            'flex items-center justify-end text-[10px]',
                                                            isMe
                                                                ? 'text-indigo-100/90'
                                                                : 'text-slate-500 dark:text-slate-400',
                                                        )}
                                                    >
                                                        <span>{chatTime}</span>
                                                    </div>
                                                </motion.div>

                                                {isMe && (
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.08,
                                                        }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 400,
                                                            damping: 25,
                                                        }}
                                                    >
                                                        <Avatar className="h-7 w-7 flex-shrink-0 shadow-md ring-2 ring-white/30 sm:h-10 sm:w-10 dark:ring-neutral-700/60">
                                                            {d.sender_avatar && (
                                                                <AvatarImage
                                                                    src={
                                                                        d.sender_avatar
                                                                    }
                                                                    alt={
                                                                        d.sender_name
                                                                    }
                                                                    className="object-cover"
                                                                />
                                                            )}
                                                            <AvatarFallback className="bg-white/20 text-sm font-bold text-white">
                                                                {d.sender_name.charAt(
                                                                    0,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div
                                                className={cn(
                                                    'flex w-full max-w-[84%] flex-wrap gap-1 sm:max-w-[78%] md:max-w-[70%]',
                                                    isMe
                                                        ? 'justify-end pr-9 sm:pr-12'
                                                        : 'justify-start pl-9 sm:pl-12',
                                                )}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleReply(d)
                                                        }
                                                        className="h-6 px-1.5 text-[11px] font-medium text-purple-600 hover:bg-purple-100/50 sm:h-7 sm:px-2 sm:text-xs dark:text-purple-400 dark:hover:bg-purple-900/30"
                                                    >
                                                        <Reply className="mr-1 h-3 w-3" />{' '}
                                                        Balas
                                                    </Button>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            togglePin(d.id)
                                                        }
                                                        className="h-6 px-1.5 text-[11px] font-medium text-amber-600 hover:bg-amber-100/50 sm:h-7 sm:px-2 sm:text-xs dark:text-amber-400 dark:hover:bg-amber-900/30"
                                                    >
                                                        <Pin className="mr-1 h-3 w-3" />{' '}
                                                        {d.is_pinned
                                                            ? 'Unpin'
                                                            : 'Pin'}
                                                    </Button>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDeleteDialog(
                                                                d.id,
                                                            )
                                                        }
                                                        className="h-6 px-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100/50 sm:h-7 sm:px-2 sm:text-xs dark:text-red-400 dark:hover:bg-red-900/30"
                                                    >
                                                        <Trash2 className="mr-1 h-3 w-3" />{' '}
                                                        Hapus
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Reply indicator */}
                    <AnimatePresence>
                        {replyTo && (
                            <motion.div
                                className="border-t border-purple-200/30 bg-purple-50/50 px-4 py-4 backdrop-blur-sm sm:px-6 dark:border-purple-800/30 dark:bg-purple-900/20"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2 text-white">
                                            <Reply className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                Membalas {replyTo.sender_name}
                                            </p>
                                            <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                                                "{replyTo.pesan}"
                                            </p>
                                        </div>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setReplyTo(null)}
                                            className="h-8 w-8 rounded-lg p-0 hover:bg-purple-200/50 dark:hover:bg-purple-800/30"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Area */}
                    <div className="relative border-t border-white/10 bg-black/20 p-3 backdrop-blur-sm sm:p-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePickAttachment}
                        />

                        <div className="mb-2 flex justify-center sm:justify-start">
                            <Select
                                value={visibility}
                                onValueChange={setVisibility}
                            >
                                <SelectTrigger className="h-8 w-[132px] rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-purple-400 dark:border-neutral-700/60 dark:bg-neutral-800/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">
                                        <span className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />{' '}
                                            Public
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="private">
                                        <span className="flex items-center gap-2">
                                            <Lock className="h-3.5 w-3.5" />{' '}
                                            Private
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {attachmentPreview && (
                            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/50">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/20">
                                    <img
                                        src={attachmentPreview}
                                        alt={
                                            attachmentImage?.name ||
                                            'Preview gambar'
                                        }
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-100">
                                        <ImageIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                                        <span className="truncate">
                                            {attachmentImage?.name ??
                                                'Gambar terpilih'}
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Tambahkan teks sebagai caption lalu
                                        kirim.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearAttachment}
                                    className="h-8 w-8 shrink-0 rounded-full text-slate-300 hover:bg-white/15 hover:text-slate-100 dark:hover:bg-neutral-700/60"
                                    title="Hapus gambar"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 rounded-[30px] border border-white/10 bg-black/30 p-2 shadow-inner shadow-black/30">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-11 w-11 shrink-0 rounded-full border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20 dark:border-neutral-700/60 dark:bg-neutral-800/50"
                                title="Lampiran"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>

                            <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/50">
                                <Textarea
                                    ref={inputRef}
                                    placeholder={
                                        replyTo
                                            ? `Balas ke ${replyTo.sender_name}...`
                                            : 'Tulis pesan diskusi...'
                                    }
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={1}
                                    className="h-6 max-h-20 min-h-6 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-slate-100 shadow-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 rounded-full text-slate-300 hover:bg-white/15 hover:text-slate-100 dark:hover:bg-neutral-700/60"
                                    title="Emoji"
                                >
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="shrink-0"
                            >
                                <Button
                                    onClick={sendMessage}
                                    disabled={
                                        !message.trim() && !attachmentImage
                                    }
                                    className="h-11 w-11 rounded-full bg-emerald-500 p-0 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Delete Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({
                            open,
                            id: open ? deleteDialog.id : null,
                        })
                    }
                    onConfirm={deleteMessage}
                    title="Hapus Pesan"
                    message="Yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </DosenLayout>
    );
}
