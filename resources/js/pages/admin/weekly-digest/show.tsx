import NotificationIcon from '@/assets/admin/notification-center/icon-notifikasi.png';
import SettingsIcon from '@/assets/admin/pengaturan/pengaturan.png';
import StatSessionsIcon from '@/assets/dosen/dashboard/stat-total-sessions.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Download,
    Eye,
    EyeOff,
    Globe,
    Lightbulb,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface DigestDetail {
    id: number;
    courses: {
        id: number;
        name: string;
        code: string;
        dosen_name: string | null;
        meeting_number: number;
        title: string | null;
    }[];
    display_title: string;
    class_label: string;
    week_number: number;
    semester: string;
    week_range: string;
    has_structured_task: boolean;
    forum_posts_required: number;
    mentari_course_url: string | null;
    mentari_course_id: string | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    creator: string | null;
}

interface Props {
    digest: DigestDetail;
    constants: {
        class_label: string;
        platform_name: string;
        forum_posts_required: number;
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
    },
} as const;

export default function WeeklyDigestShow({ digest, constants }: Props) {
    const [deleteDialog, setDeleteDialog] = useState(false);

    return (
        <AppLayout>
            <Head title={`Info Pekanan Mentari: ${digest.display_title}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-25" />
                    <div className="absolute top-0 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative space-y-5">
                        <motion.button
                            type="button"
                            onClick={() => router.get('/admin/weekly-digest')}
                            whileHover={{ x: -4 }}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar
                        </motion.button>

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                                    <img
                                        src={NotificationIcon}
                                        alt="Detail Info Pekanan"
                                        className="h-20 w-20 shrink-0 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] sm:h-24 sm:w-24"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-sm font-medium tracking-wide text-indigo-100">
                                            Detail Entry Mentari
                                        </p>
                                        <h1 className="mt-1 text-2xl leading-tight font-bold sm:text-3xl">
                                            {digest.display_title}
                                        </h1>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                                    {digest.courses.map((course) => (
                                        <Badge
                                            key={course.id}
                                            className="border-indigo-300/30 bg-indigo-500/20 px-3 py-1.5 text-indigo-100 backdrop-blur-md"
                                        >
                                            {course.name} (P
                                            {course.meeting_number})
                                        </Badge>
                                    ))}
                                    <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                        Pekan {digest.week_range}
                                    </Badge>
                                    <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                        {digest.semester}
                                    </Badge>
                                    <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                        Kelas {constants.class_label}
                                    </Badge>
                                    <Badge className="border-white/20 bg-white/15 px-3 py-1.5 text-white backdrop-blur-md">
                                        {constants.platform_name}
                                    </Badge>
                                    <Badge
                                        className={cn(
                                            'px-3 py-1.5 text-white backdrop-blur-md',
                                            digest.is_published
                                                ? 'border-emerald-300/20 bg-emerald-500/30'
                                                : 'border-white/20 bg-white/15',
                                        )}
                                    >
                                        {digest.is_published
                                            ? 'Published'
                                            : 'Draft'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 xl:max-w-[360px] xl:justify-end">
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.get(
                                            `/admin/weekly-digest/${digest.id}/edit`,
                                        )
                                    }
                                    className="h-11 rounded-xl bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.patch(
                                            `/admin/weekly-digest/${digest.id}/publish`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    className={cn(
                                        'h-11 rounded-xl text-white shadow-lg',
                                        digest.is_published
                                            ? 'bg-amber-500 hover:bg-amber-600'
                                            : 'bg-emerald-500 hover:bg-emerald-600',
                                    )}
                                >
                                    {digest.is_published ? (
                                        <EyeOff className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Eye className="mr-2 h-4 w-4" />
                                    )}
                                    {digest.is_published
                                        ? 'Unpublish'
                                        : 'Publish'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        window.open(
                                            `/admin/weekly-digest/${digest.id}/export-pdf`,
                                            '_blank',
                                            'noopener,noreferrer',
                                        )
                                    }
                                    className="h-11 rounded-xl bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setDeleteDialog(true)}
                                    className="h-11 rounded-xl bg-rose-500 text-white shadow-lg hover:bg-rose-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <motion.div variants={itemVariants} className="h-full">
                        <div className="h-full rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="relative flex h-12 w-12 items-center justify-center">
                                    <img
                                        src={SettingsIcon}
                                        alt="Informasi Entry"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Informasi Entry
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Rincian sistematis dengan container yang
                                        sama seperti panel dashboard.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <InfoRow
                                    label="Mata Kuliah"
                                    value={
                                        digest.courses
                                            .map((c) => c.name)
                                            .join(', ') || '-'
                                    }
                                />
                                <InfoRow
                                    label="Dosen"
                                    value={
                                        digest.courses
                                            .map((c) => c.dosen_name)
                                            .filter(Boolean)
                                            .join(', ') || '-'
                                    }
                                />
                                <InfoRow
                                    label="Label Kelas"
                                    value={constants.class_label}
                                />
                                <InfoRow
                                    label="Platform"
                                    value={constants.platform_name}
                                />
                                <InfoRow
                                    label="Portal"
                                    value="mentari.unpam.ac.id"
                                />
                                <InfoRow
                                    label="Pertemuan"
                                    value={
                                        digest.courses.length > 1
                                            ? 'Multi Pertemuan'
                                            : `Pertemuan ${digest.courses[0].meeting_number}`
                                    }
                                />
                                <InfoRow
                                    label="Pekan Aktif"
                                    value={`${digest.week_range} • ${digest.semester}`}
                                />
                                <InfoRow
                                    label="Status"
                                    value={
                                        digest.is_published
                                            ? 'Published'
                                            : 'Draft'
                                    }
                                />
                                <InfoRow
                                    label="Updated At"
                                    value={digest.updated_at || '-'}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="relative flex h-12 w-12 items-center justify-center">
                                    <img
                                        src={StatSessionsIcon}
                                        alt="Preview Mahasiswa"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Preview Mahasiswa
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Gaya penyajian dibuat lebih padat,
                                        tegas, dan satu bahasa dengan dashboard
                                        dosen.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-2xl">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-indigo-200/80 uppercase">
                                        Info Pekanan
                                    </p>
                                    <p className="mt-2 text-2xl font-bold">
                                        {digest.display_title}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        {digest.courses.length > 1
                                            ? `${digest.courses.length} Mata Kuliah Terpilih`
                                            : digest.courses[0].name}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge className="border-white/10 bg-white/10 text-white">
                                        {digest.courses.length > 1
                                            ? 'Multi Pertemuan'
                                            : `Pertemuan ${digest.courses[0].meeting_number}`}
                                    </Badge>
                                    <Badge className="border-white/10 bg-white/10 text-white">
                                        {constants.class_label}
                                    </Badge>
                                    <Badge
                                        className={cn(
                                            'border-white/10 text-white',
                                            digest.has_structured_task
                                                ? 'bg-amber-500/80'
                                                : 'bg-slate-500/60',
                                        )}
                                    >
                                        {digest.has_structured_task
                                            ? 'Ada Tugas Terstruktur'
                                            : 'Tanpa Tugas Terstruktur'}
                                    </Badge>
                                </div>

                                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                                    <p className="text-sm font-semibold text-cyan-100">
                                        Materi sudah masuk di{' '}
                                        {constants.platform_name}
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-cyan-50/90">
                                        Mahasiswa wajib submit forum diskusi{' '}
                                        {digest.forum_posts_required}x untuk
                                        mendapatkan kehadiran.
                                    </p>
                                </div>

                                {digest.mentari_course_url && (
                                    <a
                                        href={digest.mentari_course_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/25"
                                    >
                                        <Globe className="h-4 w-4" />
                                        Buka Portal Mentari
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Tambahan Card Tips & Panduan untuk menyeimbangkan layout */}
                        <div className="flex flex-1 flex-col rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50">
                            <div className="mb-5 flex shrink-0 items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                                    <Lightbulb className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Tips & Panduan
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Rekomendasi pengelolaan entry ke
                                        platform Mentari.
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 rounded-b-2xl">
                                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                        Periksa Tautan Tujuan
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed font-medium text-amber-700/90 dark:text-amber-400/80">
                                        Pastikan tautan forum diskusi sudah
                                        sesuai dengan sesi pekan berjalan agar
                                        mahasiswa diarahkan ke topik diskusi
                                        yang tepat.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                                        Manajemen Status Draft
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed font-medium text-blue-700/90 dark:text-blue-400/80">
                                        Entry dalam status Draft belum bisa
                                        dilihat oleh mahasiswa. Pastikan Anda
                                        melakukan "Publish" jika materi sudah
                                        siap untuk dikerjakan.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                        Evaluasi Kehadiran
                                    </p>
                                    <p className="mt-1.5 text-xs leading-relaxed font-medium text-emerald-700/90 dark:text-emerald-400/80">
                                        Mengecek secara berkala keaktifan
                                        diskusi mahasiswa sesuai dengan batas
                                        waktu (deadline) sesi pertemuan sebelum
                                        merekap data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <ConfirmDialog
                    open={deleteDialog}
                    onOpenChange={setDeleteDialog}
                    onConfirm={() => {
                        router.delete(`/admin/weekly-digest/${digest.id}`, {
                            preserveScroll: true,
                            onSuccess: () => setDeleteDialog(false),
                        });
                    }}
                    title="Hapus Entry Pekanan"
                    message={`Yakin ingin menghapus entry ${digest.display_title}?`}
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </motion.div>
        </AppLayout>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/30">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {label}
            </p>
            <p className="mt-1 font-semibold break-words text-slate-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}
