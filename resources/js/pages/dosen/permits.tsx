import TotalTugasIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import TerlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import DisetujuiIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import DitolakIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';
import IzinIcon from '@/assets/dosen/izin-sakit/persetujuan-izin.png';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    CalendarOff,
    Check,
    CheckCircle,
    ClipboardCheck,
    Clock,
    Eye,
    FileCheck,
    FileText,
    Image,
    Shield,
    Sparkles,
    Stethoscope,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Props {
    permits: Array<{
        id: number;
        mahasiswa: { id: number; nama: string; nim: string };
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
        created_at: string;
    }>;
    sessions: Array<{
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
    }>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string; session_id: string | null };
}

export default function Permits({ permits, sessions, stats, filters }: Props) {
    const [selectedPermits, setSelectedPermits] = useState<number[]>([]);
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        permitId: number | null;
    }>({ open: false, permitId: null });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState(filters.status || 'pending');

    const rejectForm = useForm({ rejection_reason: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    // Variants for staggered children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 24,
            },
        },
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleApprove = (id: number) => {
        router.patch(`/dosen/permits/${id}/approve`);
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();
        if (rejectDialog.permitId) {
            rejectForm.patch(`/dosen/permits/${rejectDialog.permitId}/reject`, {
                onSuccess: () => {
                    setRejectDialog({ open: false, permitId: null });
                    rejectForm.reset();
                },
            });
        }
    };

    const handleBulkApprove = () => {
        if (selectedPermits.length === 0) return;
        router.post(
            '/dosen/permits/bulk-approve',
            { permit_ids: selectedPermits },
            {
                onSuccess: () => setSelectedPermits([]),
            },
        );
    };

    const toggleSelect = (id: number) => {
        setSelectedPermits((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        const pendingIds = permits
            .filter((p) => p.status === 'pending')
            .map((p) => p.id);
        if (selectedPermits.length === pendingIds.length) {
            setSelectedPermits([]);
        } else {
            setSelectedPermits(pendingIds);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get(
            '/dosen/permits',
            { ...filters, status: tab },
            { preserveState: true },
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; icon: any; label: string }> =
            {
                pending: {
                    bg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                    icon: Clock,
                    label: 'Menunggu',
                },
                approved: {
                    bg: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
                    icon: CheckCircle,
                    label: 'Disetujui',
                },
                rejected: {
                    bg: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
                    icon: XCircle,
                    label: 'Ditolak',
                },
            };
        const style = styles[status] || styles.pending;
        const Icon = style.icon;
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                    style.bg,
                )}
            >
                <Icon className="h-3 w-3" /> {style.label}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const styles: Record<string, { bg: string; icon: any; label: string }> =
            {
                izin: {
                    bg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
                    icon: CalendarOff,
                    label: 'Izin',
                },
                sakit: {
                    bg: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
                    icon: Stethoscope,
                    label: 'Sakit',
                },
            };
        const style = styles[type] || styles.izin;
        const Icon = style.icon;
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                    style.bg,
                )}
            >
                <Icon className="h-3 w-3" /> {style.label}
            </span>
        );
    };

    const pendingPermits = permits.filter((p) => p.status === 'pending');
    const filteredPermits =
        activeTab === 'all'
            ? permits
            : permits.filter((p) => p.status === activeTab);

    return (
        <DosenLayout>
            <Head title="Persetujuan Izin" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* Header with Black Gradient */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-gray-800 p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
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

                    {/* Animated Background Orbs */}
                    <div className="absolute -top-20 -right-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl" />
                    <div
                        className="absolute -bottom-20 -left-20 h-56 w-56 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl"
                        style={{ animationDelay: '1s' }}
                    />
                    <div
                        className="absolute top-1/2 left-1/2 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-3xl"
                        style={{ animationDelay: '2s' }}
                    />

                    {/* Floating Icons */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {[Shield, FileCheck, ClipboardCheck].map((Icon, i) => (
                            <Icon
                                key={i}
                                className="absolute animate-pulse text-white/10"
                                style={{
                                    left: `${15 + i * 25}%`,
                                    top: `${20 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: '2s',
                                }}
                                size={24}
                            />
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                        y: [0, -8, 0],
                                    }}
                                    transition={{
                                        opacity: { duration: 0.4, delay: 0.2 },
                                        scale: {
                                            type: 'spring',
                                            stiffness: 300,
                                            delay: 0.2,
                                        },
                                        rotate: {
                                            type: 'spring',
                                            stiffness: 300,
                                            delay: 0.2,
                                        },
                                        y: {
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        },
                                    }}
                                >
                                    <img
                                        src={IzinIcon}
                                        alt="Izin"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div>
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-gray-400"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Persetujuan
                                    </motion.p>
                                    <motion.h1
                                        className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Izin & Sakit
                                        <Sparkles
                                            className="h-6 w-6 animate-spin text-amber-400"
                                            style={{ animationDuration: '3s' }}
                                        />
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                            >
                                <Select
                                    value={filters.session_id || 'all'}
                                    onValueChange={(v) =>
                                        router.get(
                                            '/dosen/permits',
                                            {
                                                ...filters,
                                                session_id:
                                                    v === 'all' ? null : v,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-[220px] border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15">
                                        <SelectValue placeholder="Filter Sesi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Sesi
                                        </SelectItem>
                                        {sessions.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.mata_kuliah} - {s.tanggal}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>
                        <motion.p
                            className="mt-4 text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Kelola pengajuan izin dan sakit mahasiswa
                        </motion.p>

                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                {
                                    icon: FileText,
                                    label: 'Total',
                                    value: stats.total,
                                    iconBg: 'bg-blue-500',
                                },
                                {
                                    icon: Clock,
                                    label: 'Menunggu',
                                    value: stats.pending,
                                    iconBg: 'bg-amber-500',
                                },
                                {
                                    icon: CheckCircle,
                                    label: 'Disetujui',
                                    value: stats.approved,
                                    iconBg: 'bg-emerald-500',
                                },
                                {
                                    icon: XCircle,
                                    label: 'Ditolak',
                                    value: stats.rejected,
                                    iconBg: 'bg-red-500',
                                },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="group relative cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                                >
                                    <div className="relative">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div
                                                className={`rounded-xl p-2.5 ${stat.iconBg} shadow-lg shadow-${stat.iconBg.split('-')[1]}-500/20`}
                                            >
                                                <stat.icon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <p className="mb-2 text-xs font-medium text-gray-400">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stat.value}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                    {[
                        {
                            imgSrc: TotalTugasIcon,
                            label: 'Total Pengajuan',
                            value: stats.total,
                        },
                        {
                            imgSrc: TerlambatIcon,
                            label: 'Menunggu',
                            value: stats.pending,
                        },
                        {
                            imgSrc: DisetujuiIcon,
                            label: 'Disetujui',
                            value: stats.approved,
                        },
                        {
                            imgSrc: DitolakIcon,
                            label: 'Ditolak',
                            value: stats.rejected,
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-gray-800/70 dark:bg-black/70"
                        >
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                                <div className="relative flex h-10 w-10 shrink-0 sm:h-12 sm:w-12">
                                    <img
                                        src={stat.imgSrc}
                                        alt={stat.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-slate-500 sm:text-sm">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bulk Actions */}
                {selectedPermits.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20"
                    >
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-blue-500 p-2 text-white">
                                <Users className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                                {selectedPermits.length} pengajuan dipilih
                            </span>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleBulkApprove}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-green-700"
                            >
                                <Check className="mr-1 h-4 w-4" /> Setujui Semua
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPermits([])}
                            >
                                Batal
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Tabs & Permits List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                >
                    <div className="border-b border-slate-200 p-4 dark:border-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-white">
                                    <ClipboardCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Daftar Pengajuan
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        {filteredPermits.length} pengajuan
                                    </p>
                                </div>
                            </div>

                            {/* Custom Tabs */}
                            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                {[
                                    {
                                        value: 'pending',
                                        label: 'Menunggu',
                                        count: stats.pending,
                                        icon: Clock,
                                    },
                                    {
                                        value: 'approved',
                                        label: 'Disetujui',
                                        count: stats.approved,
                                        icon: CheckCircle,
                                    },
                                    {
                                        value: 'rejected',
                                        label: 'Ditolak',
                                        count: stats.rejected,
                                        icon: XCircle,
                                    },
                                    {
                                        value: 'all',
                                        label: 'Semua',
                                        count: stats.total,
                                        icon: FileText,
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() =>
                                            handleTabChange(tab.value)
                                        }
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300',
                                            activeTab === tab.value
                                                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                                        )}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            {tab.label}
                                        </span>
                                        <span
                                            className={cn(
                                                'rounded-full px-1.5 py-0.5 text-xs',
                                                activeTab === tab.value
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
                                            )}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Select All for Pending */}
                        {activeTab === 'pending' &&
                            pendingPermits.length > 0 && (
                                <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                                    <Checkbox
                                        checked={
                                            selectedPermits.length ===
                                                pendingPermits.length &&
                                            pendingPermits.length > 0
                                        }
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Pilih Semua ({pendingPermits.length})
                                    </span>
                                </div>
                            )}

                        {filteredPermits.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="relative mx-auto mb-6 h-24 w-24">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20" />
                                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                                    Tidak ada pengajuan
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Belum ada pengajuan izin atau sakit untuk
                                    ditampilkan
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredPermits.map((permit, index) => {
                                    const isHovered = hoveredCard === permit.id;
                                    return (
                                        <div
                                            key={permit.id}
                                            onMouseEnter={() =>
                                                setHoveredCard(permit.id)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredCard(null)
                                            }
                                            className={cn(
                                                'group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-500',
                                                permit.status === 'pending' &&
                                                    'border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20',
                                                permit.status === 'approved' &&
                                                    'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-green-950/20',
                                                permit.status === 'rejected' &&
                                                    'border-red-200 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:border-red-800 dark:from-red-950/20 dark:to-rose-950/20',
                                                isHovered &&
                                                    'scale-[1.01] shadow-xl',
                                            )}
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                                animation: isLoaded
                                                    ? 'fadeInUp 0.5s ease-out forwards'
                                                    : 'none',
                                            }}
                                        >
                                            {/* Glow Effect */}
                                            {isHovered && (
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
                                            )}

                                            <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
                                                {permit.status ===
                                                    'pending' && (
                                                    <div className="flex items-center">
                                                        <Checkbox
                                                            checked={selectedPermits.includes(
                                                                permit.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                toggleSelect(
                                                                    permit.id,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    {/* Badges */}
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        {getTypeBadge(
                                                            permit.type,
                                                        )}
                                                        {getStatusBadge(
                                                            permit.status,
                                                        )}
                                                    </div>

                                                    {/* Student Info */}
                                                    <div className="mb-4 grid gap-4 md:grid-cols-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-bold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
                                                                {permit.mahasiswa.nama.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                                    {
                                                                        permit
                                                                            .mahasiswa
                                                                            .nama
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {
                                                                        permit
                                                                            .mahasiswa
                                                                            .nim
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400">
                                                                <Calendar className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white">
                                                                    {
                                                                        permit
                                                                            .session
                                                                            .mata_kuliah
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {
                                                                        permit
                                                                            .session
                                                                            .tanggal_display
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Reason */}
                                                    <div className="mb-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                                            {permit.reason}
                                                        </p>
                                                    </div>

                                                    {/* Rejection Reason */}
                                                    {permit.status ===
                                                        'rejected' &&
                                                        permit.rejection_reason && (
                                                            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                                                <div className="mb-1 flex items-center gap-2">
                                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                                        Alasan
                                                                        Ditolak
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                                    {
                                                                        permit.rejection_reason
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}

                                                    <p className="text-xs text-slate-400">
                                                        Diajukan:{' '}
                                                        {permit.created_at}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2 md:flex-col">
                                                    {permit.attachment && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setPreviewImage(
                                                                    permit.attachment,
                                                                )
                                                            }
                                                            className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
                                                        >
                                                            <Eye className="mr-1 h-4 w-4" />{' '}
                                                            Lihat Surat
                                                        </Button>
                                                    )}
                                                    {permit.status ===
                                                        'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        permit.id,
                                                                    )
                                                                }
                                                                className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-green-700"
                                                            >
                                                                <Check className="mr-1 h-4 w-4" />{' '}
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setRejectDialog(
                                                                        {
                                                                            open: true,
                                                                            permitId:
                                                                                permit.id,
                                                                        },
                                                                    )
                                                                }
                                                                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                                            >
                                                                <X className="mr-1 h-4 w-4" />{' '}
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Reject Modal */}
                {rejectDialog.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() =>
                                setRejectDialog({ open: false, permitId: null })
                            }
                        />
                        <div className="relative mx-4 w-full max-w-md animate-in overflow-hidden rounded-2xl bg-white shadow-2xl duration-300 fade-in zoom-in dark:bg-gray-900">
                            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2">
                                            <XCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">
                                            Tolak Pengajuan
                                        </h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setRejectDialog({
                                                open: false,
                                                permitId: null,
                                            })
                                        }
                                        className="text-white hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <form onSubmit={handleReject}>
                                <div className="space-y-4 p-6">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Berikan alasan penolakan agar mahasiswa
                                        dapat memahami keputusan Anda.
                                    </p>
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">
                                            Alasan Penolakan
                                        </Label>
                                        <Textarea
                                            value={
                                                rejectForm.data.rejection_reason
                                            }
                                            onChange={(e) =>
                                                rejectForm.setData(
                                                    'rejection_reason',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Jelaskan alasan penolakan..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                        {rejectForm.errors.rejection_reason && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {
                                                    rejectForm.errors
                                                        .rejection_reason
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setRejectDialog({
                                                    open: false,
                                                    permitId: null,
                                                })
                                            }
                                            className="flex-1"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={rejectForm.processing}
                                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                        >
                                            {rejectForm.processing
                                                ? 'Memproses...'
                                                : 'Tolak Pengajuan'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Image Preview Modal */}
                {previewImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setPreviewImage(null)}
                        />
                        <div className="relative mx-4 w-full max-w-3xl animate-in overflow-hidden rounded-2xl bg-white shadow-2xl duration-300 fade-in zoom-in dark:bg-gray-900">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-white/20 p-2">
                                            <Image className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">
                                            Surat Keterangan
                                        </h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPreviewImage(null)}
                                        className="text-white hover:bg-white/20"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                {previewImage.endsWith('.pdf') ? (
                                    <iframe
                                        src={previewImage}
                                        className="h-[500px] w-full rounded-lg"
                                    />
                                ) : (
                                    <img
                                        src={previewImage}
                                        alt="Surat Keterangan"
                                        className="w-full rounded-lg"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </DosenLayout>
    );
}
