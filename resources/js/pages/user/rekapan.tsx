import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { FileText } from 'lucide-react';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
};

type SessionInfo = {
    title?: string | null;
    meeting_number?: number | null;
    start_at?: string | null;
    course?: {
        name?: string | null;
    };
};

type AttendanceLog = {
    id: number;
    status: string;
    note?: string | null;
    distance_m?: number | null;
    scanned_at?: string | null;
    session?: SessionInfo | null;
};

type PageProps = {
    mahasiswa: MahasiswaInfo;
    logs: AttendanceLog[];
};

const statusStyles: Record<
    string,
    { label: string; className: string }
> = {
    present: {
        label: 'Hadir',
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    },
    late: {
        label: 'Terlambat',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
    },
    rejected: {
        label: 'Ditolak',
        className:
            'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
    },
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

export default function UserRekapan() {
    const { props } = usePage<SharedData & PageProps>();
    const { mahasiswa, logs } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mahasiswa', href: '/user/absen' },
        { title: 'Rekapan', href: '/user/rekapan' },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekapan Absensi" />
            <main className="flex w-full flex-col gap-6 px-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                            Rekapan
                        </p>
                        <h1 className="font-display text-2xl">
                            Rekapan Absensi
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                            Riwayat kehadiran untuk {mahasiswa.nama} (NIM{' '}
                            {mahasiswa.nim}).
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                        <FileText className="h-6 w-6" />
                    </div>
                </div>

                {logs.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:shadow-lg">
                        Belum ada data absensi. Silakan lakukan absensi terlebih
                        dahulu.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {logs.map((log) => {
                            const statusMeta =
                                statusStyles[log.status] ?? {
                                    label: log.status || 'Status',
                                    className:
                                        'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70',
                                };
                            const courseName =
                                log.session?.course?.name ??
                                log.session?.title ??
                                'Sesi Absensi';
                            const details = [
                                log.session?.course?.name && log.session?.title
                                    ? log.session?.title
                                    : null,
                                log.session?.meeting_number
                                    ? `Pertemuan ${log.session?.meeting_number}`
                                    : null,
                            ].filter(Boolean);
                            const detailText =
                                details.length > 0
                                    ? details.join(' - ')
                                    : 'Detail sesi belum tersedia.';
                            const distanceValue =
                                typeof log.distance_m === 'number'
                                    ? `${Math.round(log.distance_m)} m`
                                    : '-';

                            return (
                                <div
                                    key={log.id}
                                    className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                                                Mata kuliah
                                            </p>
                                            <h2 className="font-display text-lg">
                                                {courseName}
                                            </h2>
                                            <p className="text-sm text-slate-600 dark:text-white/60">
                                                {detailText}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                                        >
                                            {statusMeta.label}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-white/70">
                                        <div className="flex items-center justify-between">
                                            <span>Waktu scan</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {formatDate(log.scanned_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Jarak dari lokasi</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {distanceValue}
                                            </span>
                                        </div>
                                    </div>

                                    {log.note && (
                                        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
                                            {log.note}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </StudentLayout>
    );
}
