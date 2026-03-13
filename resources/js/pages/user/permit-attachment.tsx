import permitIcon from '@/assets/dosen/izin-sakit/persetujuan-izin.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileText,
    RefreshCcw,
    RotateCw,
    Search,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    permit: {
        id: number;
        type: 'izin' | 'sakit';
        status: 'pending' | 'approved' | 'rejected';
        reason: string;
        created_at: string;
        session: {
            mata_kuliah: string;
            tanggal_display: string;
        };
    };
    attachment: {
        url: string;
        name: string;
        extension: string;
        mime: string | null;
        size_bytes: number | null;
    };
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

function formatFileSize(sizeBytes: number | null): string {
    if (!sizeBytes || sizeBytes <= 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = sizeBytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export default function PermitAttachment({ permit, attachment }: Props) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    const isPdf = useMemo(
        () =>
            attachment.extension === 'pdf' ||
            attachment.mime?.includes('pdf') === true,
        [attachment.extension, attachment.mime],
    );

    const isImage = useMemo(() => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        return (
            imageExtensions.includes(attachment.extension) ||
            attachment.mime?.startsWith('image/') === true
        );
    }, [attachment.extension, attachment.mime]);

    const statusBadgeClass = {
        pending:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        approved:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        rejected:
            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    }[permit.status];

    return (
        <StudentLayout>
            <Head title={`Surat Keterangan - ${permit.session.mata_kuliah}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 sm:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/user/permit">
                            <motion.button
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Izin/Sakit
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
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
                    <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
                        <motion.div
                            className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                delay: 0.2,
                            }}
                        >
                            <img
                                src={permitIcon}
                                alt="Surat Keterangan"
                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)]"
                            />
                        </motion.div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium tracking-wide text-indigo-100">
                                Dokumen Pengajuan
                            </p>
                            <h1 className="mt-1 truncate text-2xl font-bold sm:text-3xl">
                                Lihat Surat Keterangan
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge
                                    className={cn(
                                        'px-3 py-1 text-xs font-semibold',
                                        statusBadgeClass,
                                    )}
                                >
                                    {permit.status.toUpperCase()}
                                </Badge>
                                <Badge className="border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                                    {permit.type === 'sakit' ? 'SAKIT' : 'IZIN'}
                                </Badge>
                                <span className="text-xs text-indigo-100">
                                    ID #{permit.id}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 xl:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                <Eye className="h-5 w-5 text-indigo-500" />
                                Pratinjau Dokumen
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {isImage && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() =>
                                                setZoom((prev) =>
                                                    Math.max(
                                                        0.5,
                                                        Number(
                                                            (
                                                                prev - 0.1
                                                            ).toFixed(2),
                                                        ),
                                                    ),
                                                )
                                            }
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() =>
                                                setZoom((prev) =>
                                                    Math.min(
                                                        3,
                                                        Number(
                                                            (
                                                                prev + 0.1
                                                            ).toFixed(2),
                                                        ),
                                                    ),
                                                )
                                            }
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() =>
                                                setRotation(
                                                    (prev) => (prev + 90) % 360,
                                                )
                                            }
                                        >
                                            <RotateCw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                            onClick={() => {
                                                setZoom(1);
                                                setRotation(0);
                                            }}
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                <a
                                    href={attachment.url}
                                    download={attachment.name}
                                >
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Unduh
                                    </Button>
                                </a>
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Buka Tab Baru
                                    </Button>
                                </a>
                            </div>
                        </div>

                        <div className="h-[68vh] overflow-hidden rounded-2xl border border-white/20 bg-neutral-950/85 dark:border-white/5">
                            {isPdf ? (
                                <iframe
                                    src={attachment.url}
                                    title={`Surat ${attachment.name}`}
                                    className="h-full w-full"
                                />
                            ) : isImage ? (
                                <div className="flex h-full w-full items-center justify-center overflow-auto p-6">
                                    <img
                                        src={attachment.url}
                                        alt={attachment.name}
                                        className="max-h-full max-w-full object-contain transition-transform duration-300"
                                        style={{
                                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center p-6 text-center">
                                    <div>
                                        <FileText className="mx-auto h-14 w-14 text-white/60" />
                                        <p className="mt-3 text-sm text-white/80">
                                            Pratinjau tidak tersedia untuk
                                            format ini.
                                        </p>
                                        <p className="text-xs text-white/60">
                                            Gunakan tombol unduh atau buka tab
                                            baru.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isImage && (
                            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                                Zoom: {(zoom * 100).toFixed(0)}% • Rotasi:{' '}
                                {rotation}°
                            </p>
                        )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
                                Informasi Pengajuan
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Mata Kuliah
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {permit.session.mata_kuliah}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Tanggal Sesi
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {permit.session.tanggal_display}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        Waktu Pengajuan
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {permit.created_at}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                            <h3 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
                                Informasi File
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Nama File
                                    </p>
                                    <p className="font-semibold break-all text-neutral-900 dark:text-white">
                                        {attachment.name}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Format
                                    </p>
                                    <p className="font-semibold text-neutral-900 uppercase dark:text-white">
                                        {attachment.extension || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Tipe MIME
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {attachment.mime || '-'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/20 bg-white/60 p-3 dark:border-white/5 dark:bg-neutral-800/60">
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Ukuran
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {formatFileSize(attachment.size_bytes)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-5 shadow-lg dark:border-emerald-800/50 dark:bg-emerald-900/20">
                            <h3 className="mb-3 text-base font-bold text-emerald-700 dark:text-emerald-300">
                                Verifikasi Dokumen
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    File dapat diakses
                                </p>
                                <p className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <Search className="h-4 w-4" />
                                    Format file terdeteksi
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
