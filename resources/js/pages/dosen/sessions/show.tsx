import { Head, Link, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    QrCode,
    Users,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    RefreshCw,
    Play,
    Pause,
    MapPin,
    Image,
    BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

interface DosenInfo {
    id: number;
    nama: string;
}

interface Session {
    id: number;
    title: string;
    meeting_number: number;
    course: string;
    course_id: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    qr_token: string;
}

interface Log {
    id: number;
    mahasiswa: string;
    nim: string;
    status: string;
    scanned_at: string;
    selfie_url: string | null;
    selfie_status: 'approved' | 'pending' | 'rejected';
    verified_by: string | null;
    verified_by_type: 'admin' | 'dosen' | null;
    distance: number | null;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    rejected: number;
    pendingVerification: number;
}

interface PageProps {
    dosen: DosenInfo;
    session: Session;
    logs: Log[];
    stats: Stats;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: AlertCircle },
};

const selfieStatusConfig: Record<string, { label: string; color: string }> = {
    approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700' },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700' },
};

export default function SessionShow({ dosen, session, logs, stats }: PageProps) {
    const qrValue = `${window.location.origin}/user/absen?token=${session.qr_token}`;

    const handleActivate = () => {
        router.patch(`/dosen/sessions/${session.id}/activate`);
    };

    const handleClose = () => {
        router.patch(`/dosen/sessions/${session.id}/close`);
    };

    const handleRegenerateQr = () => {
        router.patch(`/dosen/sessions/${session.id}/regenerate-qr`);
    };

    return (
        <DosenLayout>
            <Head title={`Sesi ${session.meeting_number} - ${session.course}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <Link href={`/dosen/courses/${session.course_id}`} className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Kembali ke {session.course}</span>
                        </Link>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-bold text-lg">
                                        {session.meeting_number}
                                    </span>
                                    {session.is_active && (
                                        <span className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-900 text-sm font-medium animate-pulse">
                                            AKTIF
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold">{session.title}</h1>
                                <p className="text-indigo-100">{session.start_at} - {session.end_at}</p>
                            </div>
                            <div className="flex gap-2">
                                {session.is_active ? (
                                    <Button onClick={handleClose} variant="destructive">
                                        <Pause className="h-4 w-4 mr-2" />
                                        Tutup Sesi
                                    </Button>
                                ) : (
                                    <Button onClick={handleActivate} className="bg-emerald-500 hover:bg-emerald-600">
                                        <Play className="h-4 w-4 mr-2" />
                                        Aktifkan Sesi
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-indigo-100">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-indigo-100">Hadir</p>
                                <p className="text-2xl font-bold">{stats.present}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-indigo-100">Terlambat</p>
                                <p className="text-2xl font-bold">{stats.late}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-indigo-100">Ditolak</p>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-indigo-100">Pending</p>
                                <p className="text-2xl font-bold">{stats.pendingVerification}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* QR Code */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-indigo-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">QR Code Absensi</h2>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleRegenerateQr}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Refresh
                            </Button>
                        </div>

                        <div className="flex justify-center p-4 bg-white rounded-xl">
                            <QRCodeSVG value={qrValue} size={200} level="H" includeMargin />
                        </div>

                        <p className="text-center text-sm text-slate-500 mt-4">
                            Mahasiswa scan QR ini untuk absen
                        </p>

                        {!session.is_active && (
                            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Sesi belum aktif</span>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                    Aktifkan sesi agar mahasiswa dapat melakukan absensi
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Attendance List */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-slate-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Kehadiran</h2>
                                </div>
                                <span className="text-sm text-slate-500">{logs.length} mahasiswa</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                            {logs.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500">Belum ada mahasiswa yang absen</p>
                                </div>
                            ) : (
                                logs.map(log => {
                                    const StatusIcon = statusConfig[log.status]?.icon || AlertCircle;
                                    return (
                                        <div key={log.id} className="flex items-center gap-4 p-4">
                                            {log.selfie_url ? (
                                                <img src={log.selfie_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                                                    <Image className="h-5 w-5 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{log.mahasiswa}</p>
                                                <p className="text-sm text-slate-500">{log.nim}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-400">
                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                        {log.scanned_at}
                                                    </span>
                                                    {log.distance !== null && (
                                                        <span className="text-xs text-slate-400">
                                                            <MapPin className="h-3 w-3 inline mr-1" />
                                                            {Math.round(log.distance)}m
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusConfig[log.status]?.color || 'bg-slate-100 text-slate-600')}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusConfig[log.status]?.label || log.status}
                                                </span>
                                                {log.selfie_url && (
                                                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', selfieStatusConfig[log.selfie_status]?.color || 'bg-slate-100 text-slate-600')}>
                                                        <BadgeCheck className="h-3 w-3" />
                                                        {selfieStatusConfig[log.selfie_status]?.label}
                                                    </span>
                                                )}
                                                {log.verified_by && (
                                                    <span className="text-xs text-slate-400">
                                                        oleh {log.verified_by_type === 'admin' ? 'Admin' : 'Dosen'}: {log.verified_by}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DosenLayout>
    );
}
