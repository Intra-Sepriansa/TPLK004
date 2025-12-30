import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BadgeCheck } from 'lucide-react';

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

type ProofLog = {
    id: number;
    status: string;
    note?: string | null;
    scanned_at?: string | null;
    selfie_url?: string | null;
    selfie_status?: string | null;
    session?: SessionInfo | null;
};

type PageProps = {
    mahasiswa: MahasiswaInfo;
    logs: ProofLog[];
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

const verificationStyles: Record<
    string,
    { label: string; className: string }
> = {
    approved: {
        label: 'Terverifikasi',
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
    },
    pending: {
        label: 'Menunggu',
        className:
            'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
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

export default function UserBuktiMasuk() {
    const { props } = usePage<SharedData & PageProps>();
    const { mahasiswa, logs } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mahasiswa', href: '/user/absen' },
        { title: 'Bukti Masuk', href: '/user/bukti-masuk' },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Bukti Masuk" />
            <main className="flex w-full flex-col gap-6 px-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                            Bukti masuk
                        </p>
                        <h1 className="font-display text-2xl">Bukti Absensi</h1>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                            Dokumentasi selfie absensi untuk {mahasiswa.nama}.
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                        <BadgeCheck className="h-6 w-6" />
                    </div>
                </div>

                {logs.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:shadow-lg">
                        Belum ada bukti absensi. Silakan lakukan absensi
                        terlebih dahulu.
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {logs.map((log) => {
                            const statusMeta =
                                statusStyles[log.status] ?? {
                                    label: log.status || 'Status',
                                    className:
                                        'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70',
                                };
                            const verificationStatus =
                                log.selfie_status ??
                                (log.selfie_url ? 'pending' : null);
                            const verificationMeta = verificationStatus
                                ? verificationStyles[verificationStatus] ?? {
                                      label: verificationStatus,
                                      className:
                                          'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/70',
                                  }
                                : null;
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

                            return (
                                <div
                                    key={log.id}
                                    className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg"
                                >
                                    <div className="relative aspect-video bg-slate-100 dark:bg-black/40">
                                        {log.selfie_url ? (
                                            <img
                                                src={log.selfie_url}
                                                alt="Bukti selfie"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-white/50">
                                                Belum ada foto selfie.
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
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
                                            <div className="flex flex-wrap gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                                                >
                                                    {statusMeta.label}
                                                </span>
                                                {verificationMeta && (
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${verificationMeta.className}`}
                                                    >
                                                        {verificationMeta.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-white/70">
                                            <div className="flex items-center justify-between">
                                                <span>Waktu scan</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {formatDate(log.scanned_at)}
                                                </span>
                                            </div>
                                        </div>

                                        {log.note && (
                                            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
                                                {log.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </StudentLayout>
    );
}
