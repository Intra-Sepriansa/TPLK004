import DashboardOverview from '@/components/admin/dashboard-overview';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ScrollFloat from '@/components/ui/scroll-float';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BarChart3,
    BookOpen,
    CalendarCheck,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileBarChart,
    Fingerprint,
    Flame,
    Lock,
    MapPin,
    Pencil,
    Plus,
    QrCode,
    Radar,
    ScanBarcode,
    ScanFace,
    RefreshCcw,
    Settings,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Timer,
    Trash2,
    TrendingUp,
    Users,
    UserCheck,
    XCircle,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPie,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
    type FormEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import QRCode from 'qrcode';

type Mahasiswa = {
    id: number;
    nama: string;
    nim: string;
    created_at?: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type MataKuliah = {
    id: number;
    nama: string;
    sks: number;
    dosen?: string | null;
};

type AttendanceSession = {
    id: number;
    course_id?: number | null;
    title: string | null;
    meeting_number: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    course: {
        nama?: string | null;
        sks?: number | null;
        dosen?: string | null;
    } | null;
};

type ActivityLog = {
    id: number;
    name: string;
    time: string;
    status: string;
    distance_m: number | null;
    selfie_status: string | null;
    note?: string | null;
};

type WeeklyData = {
    labels: string[];
    values: number[];
};

type DeviceDistribution = {
    label: string;
    total: number;
};

type WeeklyDetailedData = {
    day: string;
    hadir: number;
    terlambat: number;
    tidakHadir: number;
};

type HourlyData = {
    hour: string;
    count: number;
};

type TopStudent = {
    id: number;
    name: string;
    nim: string;
    attendance: number;
    streak: number;
};

type CourseStats = {
    name: string;
    hadir: number;
    terlambat: number;
    tidakHadir: number;
};

type ActiveSession = {
    id: number;
    title: string | null;
    meeting_number: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    course: {
        nama?: string | null;
        sks?: number | null;
        dosen?: string | null;
    } | null;
};

type AiScanResponse = {
    status: string;
    message?: string;
    model?: string | null;
    detection?: {
        class_id?: number | null;
        class_name?: string | null;
        confidence?: number | null;
        box?: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        } | null;
    };
    log?: {
        id: number;
        status: string;
        time: string | null;
        mahasiswa: string;
        nim: string;
    };
};

type SettingsData = {
    token_ttl_seconds: number;
    geofence: {
        lat: number;
        lng: number;
        radius_m: number;
    };
    late_minutes: number;
    selfie_required: boolean;
};

type StatCard = {
    title: string;
    value: number;
    change: string | null;
    note: string;
    tone: 'emerald' | 'amber' | 'rose' | 'sky';
    trend: 'up' | 'down';
};

type DashboardPageProps = {
    section?: string | null;
    settings?: SettingsData;
    activeSession?: ActiveSession | null;
    activeStats?: {
        total: number;
        rejected: number;
        selfie_pending: number;
    } | null;
    stats?: StatCard[];
    activity?: ActivityLog[];
    weekly?: WeeklyData;
    weeklyDetailed?: WeeklyDetailedData[];
    hourlyData?: HourlyData[];
    topStudents?: TopStudent[];
    courseStats?: CourseStats[];
    attendanceRate?: number;
    upcomingSessions?: AttendanceSession[];
    deviceDistribution?: DeviceDistribution[];
    securitySummary?: {
        duplicate_tokens: number;
        expired_tokens: number;
        selfie_rate: number;
    };
    mahasiswa?: Paginated<Mahasiswa>;
    courses?: MataKuliah[];
    sessions?: AttendanceSession[];
    tokenTtlSeconds?: number;
    monitorLogs?: ActivityLog[];
    selfieQueue?: any[];
    geofence?: SettingsData['geofence'];
    settingsForm?: {
        token_ttl_seconds: number;
        late_minutes: number;
        selfie_required: boolean;
        notify_rejected: boolean;
        notify_selfie_blur: boolean;
    };
    reportSessions?: any[];
    auditLogs?: any[];
    aiStudents?: Mahasiswa[];
    aiConfig?: {
        min_conf: number;
        target_label: string;
        maintenance: boolean;
    };
};

const sectionTitles: Record<string, string> = {
    overview: 'Dashboard',
    sessions: 'Sesi Absen',
    qr: 'QR Builder',
    monitor: 'Live Monitor',
    selfie: 'Verifikasi Selfie',
    geofence: 'Zona',
    students: 'Mahasiswa',
    devices: 'Perangkat',
    schedule: 'Jadwal',
    settings: 'Pengaturan',
    reports: 'Rekap Kehadiran',
    audit: 'Audit Keamanan',
    'absen-ai': 'Absen AI',
    'admin-guide': 'Panduan Admin',
    'help-center': 'Help Center',
};

const formatTtl = (seconds: number) => {
    if (!Number.isFinite(seconds)) {
        return '-';
    }
    if (seconds % 60 === 0) {
        return `${seconds / 60} menit`;
    }
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return `${minutes}m ${remaining}s`;
    }
    return `${seconds} detik`;
};

const formatCountdown = (seconds: number) => {
    if (!Number.isFinite(seconds)) {
        return '-';
    }
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;
    if (minutes > 0) {
        return `${minutes}:${String(remaining).padStart(2, '0')}`;
    }
    return `${safeSeconds}s`;
};

const ensureLeafletIcons = (() => {
    let configured = false;
    return () => {
        if (configured) return;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });
        configured = true;
    };
})();

function SectionHeader({
    kicker,
    title,
    description,
    actions,
    useScrollFloat = false,
}: {
    kicker?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    useScrollFloat?: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                {kicker && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {kicker}
                    </p>
                )}
                {useScrollFloat ? (
                    <ScrollFloat
                        containerClassName="!my-0"
                        textClassName="!text-2xl font-display text-slate-900 dark:text-white"
                        animationDuration={0.8}
                        ease="power2.out"
                        scrollStart="top bottom-=100"
                        scrollEnd="top center"
                        stagger={0.02}
                    >
                        {title}
                    </ScrollFloat>
                ) : (
                    <h1 className="font-display text-2xl text-slate-900 dark:text-white">
                        {title}
                    </h1>
                )}
                {description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

function StudentsSection({
    mahasiswa,
    flash,
}: {
    mahasiswa: Paginated<Mahasiswa>;
    flash?: SharedData['flash'];
}) {
    const form = useForm({
        nama: '',
        nim: '',
    });
    const rows = mahasiswa.data;

    const formatLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&')
            .replace(/<[^>]*>/g, '');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/mahasiswa', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Manajemen"
                title="Mahasiswa"
                description="Kelola data mahasiswa dan password default otomatis."
                useScrollFloat={true}
                actions={
                    <Button variant="outline" size="sm" asChild>
                        <a href="/mahasiswa/export.csv">
                            <FileBarChart className="h-4 w-4" />
                            Export
                        </a>
                    </Button>
                }
            />

            {(flash?.success || flash?.error) && (
                <div className="grid gap-2">
                    {flash?.success && (
                        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                            {flash.error}
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Form
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Tambah mahasiswa
                            </h2>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>

                    <form className="mt-6 grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="nama">Nama</Label>
                            <Input
                                id="nama"
                                name="nama"
                                placeholder="Nama lengkap"
                                value={form.data.nama}
                                onChange={(event) =>
                                    form.setData('nama', event.target.value)
                                }
                            />
                            <InputError message={form.errors.nama} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nim">NIM</Label>
                            <Input
                                id="nim"
                                name="nim"
                                placeholder="231011400000"
                                value={form.data.nim}
                                onChange={(event) =>
                                    form.setData('nim', event.target.value)
                                }
                            />
                            <InputError message={form.errors.nim} />
                            <p className="text-xs text-slate-500">
                                Password default: tplk004# + 2 digit terakhir
                                NIM.
                            </p>
                        </div>
                        <Button type="submit" disabled={form.processing}>
                            <Plus className="h-4 w-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan mahasiswa'}
                        </Button>
                    </form>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Database
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Daftar mahasiswa
                            </h2>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            Total {mahasiswa.total}
                        </span>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                <tr className="border-b border-slate-200/70 dark:border-slate-800/70">
                                    <th className="pb-3">Nama</th>
                                    <th className="pb-3">NIM</th>
                                    <th className="pb-3">Tanggal</th>
                                    <th className="pb-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-6 text-center text-sm text-slate-500"
                                        >
                                            Belum ada data mahasiswa.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-200/50 text-slate-700 last:border-none dark:border-slate-800/50 dark:text-slate-200"
                                        >
                                            <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                                                {item.nama}
                                            </td>
                                            <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                                                {item.nim}
                                            </td>
                                            <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                                                {item.created_at
                                                    ? item.created_at.slice(0, 10)
                                                    : '-'}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-rose-600 hover:text-rose-700"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/mahasiswa/${item.id}`,
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {mahasiswa.links.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                            <span>
                                Menampilkan {mahasiswa.from ?? 0}–
                                {mahasiswa.to ?? 0} dari {mahasiswa.total}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                {mahasiswa.links.map((link, index) => (
                                    <button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url
                                                ? router.get(
                                                      link.url,
                                                      {},
                                                      { preserveScroll: true },
                                                  )
                                                : undefined
                                        }
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-black text-white dark:bg-white dark:text-slate-900'
                                                : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-black'
                                        } ${
                                            link.url
                                                ? ''
                                                : 'cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {formatLabel(link.label)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SessionsSection({
    courses,
    sessions,
}: {
    courses: MataKuliah[];
    sessions: AttendanceSession[];
}) {
    const sessionForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });
    const selectedCourse = useMemo(() => {
        const courseId = Number(sessionForm.data.course_id);
        if (!Number.isFinite(courseId)) {
            return null;
        }
        return courses.find((course) => course.id === courseId) ?? null;
    }, [courses, sessionForm.data.course_id]);
    const maxMeeting = selectedCourse?.sks === 3 ? 21 : 14;

    const submitSession = (event: FormEvent) => {
        event.preventDefault();
        sessionForm.post('/attendance-sessions', {
            preserveScroll: true,
            onSuccess: () => sessionForm.reset('meeting_number', 'title', 'start_at', 'end_at'),
        });
    };

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Absensi"
                title="Sesi Absen"
                description="Buat sesi baru, atur jadwal, dan pilih mata kuliah."
                useScrollFloat={true}
                actions={
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            router.get(
                                dashboard({ query: { section: 'schedule' } }),
                            )
                        }
                    >
                        <CalendarCheck className="h-4 w-4" />
                        Jadwal aktif
                    </Button>
                }
            />
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-display text-lg text-slate-900 dark:text-white">
                        Mata kuliah tersedia
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Data diambil langsung dari database mahasiswa.
                    </p>
                    <div className="mt-4 grid max-h-72 gap-3 overflow-auto text-sm">
                        {courses.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-black">
                                Belum ada data mata kuliah.
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 dark:border-slate-800 dark:bg-black"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {course.nama}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {course.dosen
                                                    ? `Dosen: ${course.dosen}`
                                                    : 'Dosen belum diisi'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                            {course.sks} SKS
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-display text-lg text-slate-900 dark:text-white">
                        Buat sesi absen
                    </h2>
                    <form className="mt-4 grid gap-4" onSubmit={submitSession}>
                        <div className="grid gap-2">
                            <Label htmlFor="session-course">Mata kuliah</Label>
                            <select
                                id="session-course"
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-black"
                                value={sessionForm.data.course_id}
                                onChange={(event) =>
                                    sessionForm.setData(
                                        'course_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Pilih mata kuliah</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.nama} (SKS {course.sks})
                                    </option>
                                ))}
                            </select>
                            <InputError message={sessionForm.errors.course_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="meeting">Pertemuan ke</Label>
                            <Input
                                id="meeting"
                                type="number"
                                min={1}
                                max={maxMeeting}
                                value={sessionForm.data.meeting_number}
                                onChange={(event) =>
                                    sessionForm.setData(
                                        'meeting_number',
                                        Number(event.target.value),
                                    )
                                }
                            />
                            <p className="text-xs text-slate-500">
                                {selectedCourse
                                    ? `Maksimum ${maxMeeting} pertemuan (SKS ${selectedCourse.sks}).`
                                    : 'Pilih mata kuliah untuk melihat batas pertemuan.'}
                            </p>
                            <InputError message={sessionForm.errors.meeting_number} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="session-title">Judul</Label>
                            <Input
                                id="session-title"
                                value={sessionForm.data.title}
                                onChange={(event) =>
                                    sessionForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="start-at">Mulai</Label>
                            <Input
                                id="start-at"
                                type="datetime-local"
                                value={sessionForm.data.start_at}
                                onChange={(event) =>
                                    sessionForm.setData(
                                        'start_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={sessionForm.errors.start_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end-at">Selesai</Label>
                            <Input
                                id="end-at"
                                type="datetime-local"
                                value={sessionForm.data.end_at}
                                onChange={(event) =>
                                    sessionForm.setData(
                                        'end_at',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={sessionForm.errors.end_at} />
                        </div>
                        <Button type="submit" disabled={sessionForm.processing}>
                            <CalendarCheck className="h-4 w-4" />
                            Buat sesi
                        </Button>
                    </form>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Daftar sesi
                        </p>
                        <h2 className="font-display text-xl text-slate-900 dark:text-white">
                            Sesi terbaru
                        </h2>
                    </div>
                </div>
                <div className="mt-4 grid gap-3">
                    {sessions.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                            Belum ada sesi.
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-black"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {session.course?.nama ?? 'Mata kuliah'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Pertemuan {session.meeting_number}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {session.start_at} - {session.end_at}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {session.is_active ? (
                                            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                                Nonaktif
                                            </span>
                                        )}
                                        {session.is_active ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    router.patch(
                                                        `/attendance-sessions/${session.id}/close`,
                                                    )
                                                }
                                            >
                                                Tutup
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                    router.patch(
                                                        `/attendance-sessions/${session.id}/activate`,
                                                    )
                                                }
                                            >
                                                Jadikan aktif
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function QrSection({
    activeSession,
    tokenTtlSeconds = 180,
}: {
    activeSession?: ActiveSession | null;
    tokenTtlSeconds?: number;
}) {
    const [token, setToken] = useState<string | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const rotatingRef = useRef(false);
    const ttlLabel = useMemo(() => formatTtl(tokenTtlSeconds), [tokenTtlSeconds]);

    useEffect(() => {
        if (!token) {
            setQrUrl(null);
            return;
        }

        QRCode.toDataURL(
            token,
            { width: 260 },
            (error: Error | null, url?: string) => {
                if (!error && url) {
                    setQrUrl(url);
                }
            },
        );
    }, [token]);

    useEffect(() => {
        if (!expiresAtMs) {
            setTimeLeft(null);
            return;
        }

        const updateTimeLeft = () => {
            const diffMs = expiresAtMs - Date.now();
            const seconds = Math.max(0, Math.ceil(diffMs / 1000));
            setTimeLeft(seconds);
        };
        updateTimeLeft();
        const interval = window.setInterval(updateTimeLeft, 500);

        return () => window.clearInterval(interval);
    }, [expiresAtMs]);

    useEffect(() => {
        setToken(null);
        setExpiresAtMs(null);
    }, [activeSession?.id]);

    useEffect(() => {
        if (!expiresAtMs || !token) return;

        const timeout = window.setTimeout(() => {
            void generateToken({ silent: true });
        }, Math.max(0, expiresAtMs - Date.now() + 200));

        return () => window.clearTimeout(timeout);
    }, [expiresAtMs, token]);

    const generateToken = async ({
        silent = false,
        force = false,
    }: {
        silent?: boolean;
        force?: boolean;
    } = {}) => {
        if (!activeSession?.id) return;
        if (rotatingRef.current) return;
        rotatingRef.current = true;
        if (!silent) {
            setLoading(true);
        }
        const csrf = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        try {
            const payload = force ? { force: true } : {};
            const response = await fetch(
                `/attendance-sessions/${activeSession.id}/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                if (typeof data.expires_at_ts === 'number') {
                    setExpiresAtMs(data.expires_at_ts * 1000);
                } else if (typeof data.expires_at === 'string') {
                    const parsed = Date.parse(data.expires_at);
                    if (!Number.isNaN(parsed)) {
                        setExpiresAtMs(parsed);
                    }
                }
            }
        } finally {
            rotatingRef.current = false;
            if (!silent) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Absensi"
                title="QR Builder"
                description={`Generate token ${ttlLabel} untuk sesi aktif.`}
                actions={
                    <Button
                        size="sm"
                        onClick={() => void generateToken({ force: true })}
                        disabled={loading}
                    >
                        <QrCode className="h-4 w-4" />
                        {loading ? 'Membuat...' : 'Generate QR'}
                    </Button>
                }
            />
            {!activeSession ? (
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center text-sm text-slate-500 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    Belum ada sesi aktif. Aktifkan sesi di menu Sesi Absen.
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                                <span>Token TTL</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {ttlLabel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Sesi aktif</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {activeSession.course?.nama}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Pertemuan</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {activeSession.meeting_number}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-black">
                            Token akan otomatis berubah setiap {ttlLabel} dan hanya
                            berlaku untuk sesi aktif.
                        </div>
                    </div>

                    <div className="relative mx-auto flex w-full flex-col items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        {qrUrl ? (
                            <img
                                src={qrUrl}
                                alt="QR Token"
                                className="h-64 w-64 rounded-2xl border border-slate-200/60 bg-white p-4"
                            />
                        ) : (
                            <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50 text-sm text-slate-400">
                                QR belum dibuat
                            </div>
                        )}
                        <div className="text-center text-sm text-slate-600 dark:text-slate-300">
                            {token ? (
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                        Token aktif
                                    </p>
                                    <div className="break-all rounded-2xl border border-slate-200/60 bg-white px-4 py-3 font-mono text-base font-semibold tracking-[0.2em] text-slate-900 dark:border-slate-800 dark:bg-black dark:text-white sm:text-2xl">
                                        {token}
                                    </div>
                                    {timeLeft !== null ? (
                                        <p className="text-xs text-slate-500">
                                            Sisa {formatCountdown(timeLeft)}
                                        </p>
                                    ) : null}
                                </div>
                            ) : (
                                'Klik Generate QR untuk membuat token.'
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void generateToken({ force: true })}
                        >
                            <ScanBarcode className="h-4 w-4" />
                            Refresh token
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MonitorSection({
    activeSession,
    initialLogs,
}: {
    activeSession?: ActiveSession | null;
    initialLogs: ActivityLog[];
}) {
    const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);

    const fetchLogs = useCallback(async () => {
        const query = activeSession?.id ? `?session_id=${activeSession.id}` : '';
        const response = await fetch(`/attendance-logs${query}`);
        if (!response.ok) return;
        const data = await response.json();
        setLogs(data.logs || []);
    }, [activeSession?.id]);

    useEffect(() => {
        fetchLogs();
        const interval = window.setInterval(fetchLogs, 5000);
        return () => window.clearInterval(interval);
    }, [fetchLogs]);

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Absensi"
                title="Live Monitor"
                description="Pantau scan masuk secara real time dan status validasi."
                actions={
                    <Button variant="outline" size="sm" onClick={fetchLogs}>
                        <Radar className="h-4 w-4" />
                        Refresh
                    </Button>
                }
            />
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl text-slate-900 dark:text-white">
                        Aktivitas terbaru
                    </h2>
                    <span className="text-xs text-slate-500">
                        {activeSession?.course?.nama ?? 'Semua sesi'}
                    </span>
                </div>
                <div className="mt-5 grid gap-3">
                    {logs.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                            Belum ada scan masuk.
                        </div>
                    ) : (
                        logs.map((item) => {
                            const status = item.status;
                            const iconMap: Record<string, ReactNode> = {
                                present: <Camera className="h-5 w-5" />,
                                late: <Timer className="h-5 w-5" />,
                                rejected: <ScanFace className="h-5 w-5" />,
                            };
                            const badgeMap: Record<string, string> = {
                                present:
                                    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                                late: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                                rejected:
                                    'bg-rose-500/15 text-rose-700 dark:text-rose-300',
                            };

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/70 dark:bg-black/70 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                            {iconMap[status] ?? (
                                                <Camera className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {item.distance_m
                                                    ? `Jarak ${item.distance_m}m`
                                                    : 'Jarak belum ada'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-right sm:flex-col sm:items-end">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.time}
                                        </span>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                                                badgeMap[status] ?? 'bg-slate-200 text-slate-700'
                                            }`}
                                        >
                                            {status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function AiAttendanceSection({
    activeSession,
    students,
    aiConfig,
}: {
    activeSession?: ActiveSession | null;
    students: Mahasiswa[];
    aiConfig?: DashboardPageProps['aiConfig'];
}) {
    const [selectedId, setSelectedId] = useState<number | ''>(
        students[0]?.id ?? '',
    );
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState('Kamera belum aktif.');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AiScanResponse | null>(null);
    const [flowStep, setFlowStep] = useState<
        'idle' | 'scan' | 'verify' | 'recorded' | 'error'
    >('idle');
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [consentError, setConsentError] = useState<string | null>(null);
    const [cameraPermission, setCameraPermission] = useState<
        PermissionState | 'unknown'
    >('unknown');
    const maintenanceMode = Boolean(aiConfig?.maintenance);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<number | null>(null);
    const busyRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = window.localStorage.getItem(
            'tplk004_camera_consent_admin',
        );
        if (stored === '1') {
            setConsentAccepted(true);
        }
    }, []);

    useEffect(() => {
        if (!navigator.permissions?.query) return;
        navigator.permissions
            .query({ name: 'camera' as PermissionName })
            .then((result) => {
                setCameraPermission(result.state);
                result.onchange = () => setCameraPermission(result.state);
            })
            .catch(() => {
                setCameraPermission('unknown');
            });
    }, []);

    const stopCamera = useCallback(() => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const getCameraErrorMessage = useCallback((err: unknown) => {
        if (!err || typeof err !== 'object') {
            return 'Gagal mengakses kamera.';
        }
        const name = (err as DOMException).name;
        if (name === 'NotAllowedError') {
            return 'Izin kamera ditolak. Aktifkan akses kamera di browser.';
        }
        if (name === 'NotFoundError') {
            return 'Kamera tidak ditemukan di perangkat ini.';
        }
        if (name === 'NotReadableError') {
            return 'Kamera sedang digunakan aplikasi lain.';
        }
        if (name === 'OverconstrainedError') {
            return 'Perangkat tidak mendukung mode kamera yang diminta.';
        }
        return 'Gagal mengakses kamera.';
    }, []);

    const drawDetection = useCallback(
        (detection: AiScanResponse['detection'] | null | undefined) => {
            const video = videoRef.current;
            const canvas = overlayRef.current;
            if (!video || !canvas) return;

            const width = video.clientWidth;
            const height = video.clientHeight;
            if (!width || !height) return;

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            if (!detection?.box) return;
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            if (!vw || !vh) return;

            const scale = Math.max(width / vw, height / vh);
            const scaledW = vw * scale;
            const scaledH = vh * scale;
            const offsetX = (width - scaledW) / 2;
            const offsetY = (height - scaledH) / 2;

            const rawX1 = detection.box.x1;
            const rawY1 = detection.box.y1;
            const rawX2 = detection.box.x2;
            const rawY2 = detection.box.y2;
            const x1 = Math.min(rawX1, rawX2) * scale + offsetX;
            const y1 = Math.min(rawY1, rawY2) * scale + offsetY;
            const x2 = Math.max(rawX1, rawX2) * scale + offsetX;
            const y2 = Math.max(rawY1, rawY2) * scale + offsetY;

            const clampedX1 = Math.max(0, Math.min(x1, width));
            const clampedY1 = Math.max(0, Math.min(y1, height));
            const clampedX2 = Math.max(0, Math.min(x2, width));
            const clampedY2 = Math.max(0, Math.min(y2, height));
            const boxW = Math.max(0, clampedX2 - clampedX1);
            const boxH = Math.max(0, clampedY2 - clampedY1);
            if (boxW <= 1 || boxH <= 1) return;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(clampedX1, clampedY1, boxW, boxH);

            const labelText = [
                detection.class_name ?? 'deteksi',
                typeof detection.confidence === 'number'
                    ? detection.confidence.toFixed(2)
                    : null,
            ]
                .filter(Boolean)
                .join(' ');

            if (labelText) {
                ctx.font = '12px ui-sans-serif, system-ui';
                ctx.textBaseline = 'top';
                const paddingX = 6;
                const paddingY = 4;
                const textWidth = ctx.measureText(labelText).width;
                const textX = clampedX1;
                const textY = Math.max(0, clampedY1 - (12 + paddingY * 2));
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(
                    textX,
                    textY,
                    textWidth + paddingX * 2,
                    12 + paddingY * 2,
                );
                ctx.fillStyle = '#e2e8f0';
                ctx.fillText(labelText, textX + paddingX, textY + paddingY);
            }
        },
        [],
    );

    const resetScan = useCallback(() => {
        setResult(null);
        setError(null);
        setStatus(
            maintenanceMode ? 'Fitur sedang maintenance.' : 'Siap memindai.',
        );
        setFlowStep('idle');
        drawDetection(null);
    }, [drawDetection, maintenanceMode]);

    const startCamera = useCallback(async () => {
        if (maintenanceMode) {
            setError('Fitur sedang maintenance.');
            setStatus('Fitur sedang maintenance.');
            return;
        }
        if (!consentAccepted) {
            setConsentError('Setujui persetujuan kamera sebelum memulai.');
            setError('Persetujuan kamera belum disetujui.');
            setStatus('Izin kamera belum disetujui.');
            return;
        }
        setError(null);
        setConsentError(null);
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Browser tidak mendukung kamera.');
            setStatus('Browser tidak mendukung kamera.');
            return;
        }
        if (cameraPermission === 'denied') {
            const message =
                'Izin kamera ditolak. Aktifkan di pengaturan browser.';
            setError(message);
            setStatus(message);
            return;
        }
        try {
            stopCamera();
            setStatus('Menyalakan kamera...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setRunning(true);
            setStatus('Kamera siap, mulai mendeteksi.');
            setFlowStep('idle');
            drawDetection(result?.detection);
        } catch (err) {
            const message = getCameraErrorMessage(err);
            if ((err as DOMException)?.name === 'NotAllowedError') {
                setCameraPermission('denied');
            }
            setError(message);
            setStatus(message);
            setRunning(false);
        }
    }, [
        cameraPermission,
        consentAccepted,
        drawDetection,
        getCameraErrorMessage,
        maintenanceMode,
        result?.detection,
        stopCamera,
    ]);

    const captureFrame = useCallback(async () => {
        if (busyRef.current) return;
        if (!videoRef.current) return;
        if (maintenanceMode) {
            setError('Fitur sedang maintenance.');
            setStatus('Fitur sedang maintenance.');
            setFlowStep('error');
            return;
        }
        if (!consentAccepted) {
            setConsentError('Setujui persetujuan kamera sebelum memulai.');
            setError('Persetujuan kamera belum disetujui.');
            setStatus('Izin kamera belum disetujui.');
            setFlowStep('error');
            return;
        }
        if (!activeSession?.id) {
            setError('Tidak ada sesi aktif.');
            setFlowStep('error');
            return;
        }
        if (!selectedId) {
            setError('Pilih mahasiswa terlebih dulu.');
            setFlowStep('error');
            return;
        }

        const video = videoRef.current;
        if (!video.videoWidth || !video.videoHeight) {
            return;
        }

        busyRef.current = true;
        setError(null);
        setStatus('Memindai frame...');
        setFlowStep('scan');

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            busyRef.current = false;
            setError('Gagal memproses frame.');
            setFlowStep('error');
            return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.85);
        });

        if (!blob) {
            busyRef.current = false;
            setError('Gagal membaca gambar.');
            setFlowStep('error');
            return;
        }

        const payload = new FormData();
        payload.append('image', blob, `frame-${Date.now()}.jpg`);
        payload.append('mahasiswa_id', String(selectedId));

        const csrf = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        try {
            setStatus('Verifikasi AI...');
            setFlowStep('verify');
            const response = await fetch('/attendance-ai/scan', {
                method: 'POST',
                headers: {
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
                },
                body: payload,
            });

            const data = (await response.json()) as AiScanResponse;
            if (!response.ok) {
                setError(data.message || 'Gagal memproses deteksi.');
                setStatus(data.message || 'Gagal memproses deteksi.');
                setFlowStep('error');
                return;
            }
            setResult(data);
            setStatus(data.message || 'Deteksi selesai.');
            drawDetection(data.detection);

            if (data.status === 'recorded' || data.status === 'duplicate') {
                setFlowStep('recorded');
                stopCamera();
                setRunning(false);
            } else if (data.status === 'no_detection') {
                setFlowStep('scan');
            } else if (data.status === 'session_closed') {
                setFlowStep('error');
            }
        } catch (err) {
            setError('Gagal menghubungi server.');
            setStatus('Gagal menghubungi server.');
            setFlowStep('error');
        } finally {
            busyRef.current = false;
        }
    }, [
        activeSession?.id,
        consentAccepted,
        drawDetection,
        maintenanceMode,
        selectedId,
        stopCamera,
    ]);

    useEffect(() => {
        drawDetection(result?.detection);
    }, [drawDetection, result?.detection]);

    useEffect(() => {
        if (!maintenanceMode) {
            return;
        }
        resetScan();
        if (running) {
            stopCamera();
            setRunning(false);
        }
    }, [maintenanceMode, resetScan, running, stopCamera]);

    useEffect(() => {
        if (!consentAccepted && running) {
            stopCamera();
            setRunning(false);
            setStatus('Kamera berhenti karena persetujuan dicabut.');
            setFlowStep('idle');
        }
    }, [consentAccepted, running, stopCamera]);

    useEffect(() => {
        if (!running) {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = window.setInterval(() => {
            void captureFrame();
        }, 1500);

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [captureFrame, running]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const detectionLabel = result?.detection?.class_name ?? '-';
    const detectionConf =
        typeof result?.detection?.confidence === 'number'
            ? result.detection.confidence.toFixed(2)
            : '-';
    const minConfLabel =
        typeof aiConfig?.min_conf === 'number'
            ? aiConfig.min_conf.toFixed(2)
            : '0.60';
    const cameraPermissionLabel =
        cameraPermission === 'granted'
            ? 'Diizinkan'
            : cameraPermission === 'denied'
              ? 'Ditolak'
              : 'Perlu izin';
    const flowItems = [
        { key: 'scan', label: 'Scan', active: flowStep === 'scan' },
        { key: 'verify', label: 'Verifikasi', active: flowStep === 'verify' },
        {
            key: 'recorded',
            label: 'Tercatat',
            active: flowStep === 'recorded',
        },
    ];

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Absensi"
                title="Absen AI"
                description="Deteksi mahasiswa via kamera admin dan catat absensi otomatis."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void startCamera()}
                            disabled={maintenanceMode}
                        >
                            {maintenanceMode ? (
                                <Lock className="h-4 w-4 animate-pulse" />
                            ) : (
                                <Camera className="h-4 w-4" />
                            )}
                            Mulai kamera
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                stopCamera();
                                setRunning(false);
                                setStatus('Kamera berhenti.');
                                setFlowStep('idle');
                            }}
                            disabled={maintenanceMode}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Stop
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                resetScan();
                                if (!running) {
                                    void startCamera();
                                }
                            }}
                            disabled={maintenanceMode}
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Ulang scan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void captureFrame()}
                            disabled={!running || maintenanceMode}
                        >
                            <ScanFace className="h-4 w-4" />
                            Scan sekali
                        </Button>
                    </div>
                }
            />

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Dengan menyalakan kamera, Anda menyetujui pemrosesan gambar
                    untuk absensi sesuai kebijakan privasi. Jika ingin
                    penghapusan data, ajukan permintaan ke admin kampus.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-300">
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={consentAccepted}
                            onCheckedChange={(value) => {
                                const checked = Boolean(value);
                                setConsentAccepted(checked);
                                setConsentError(null);
                                if (typeof window !== 'undefined') {
                                    window.localStorage.setItem(
                                        'tplk004_camera_consent_admin',
                                        checked ? '1' : '0',
                                    );
                                }
                            }}
                        />
                        <span>Setuju penggunaan kamera</span>
                    </label>
                    <a
                        href="/privacy"
                        className="text-slate-700 underline underline-offset-4 dark:text-slate-200"
                    >
                        Kebijakan privasi
                    </a>
                </div>
                {consentError && (
                    <div className="mt-2 rounded-xl border border-rose-200/60 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        {consentError}
                    </div>
                )}
            </div>

            {!activeSession && (
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-sm text-amber-700">
                    Belum ada sesi aktif. Aktifkan sesi di menu Sesi Absen dulu.
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200/70 bg-black">
                        {maintenanceMode ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-slate-200">
                                <div className="h-44 w-44">
                                    <DotLottieReact
                                        src="/lottie/maintenance.json"
                                        loop
                                        autoplay
                                    />
                                </div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    Maintenance
                                </p>
                                <p className="text-sm text-slate-200/80">
                                    Fitur Absen AI sedang maintenance.
                                </p>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    className="h-full w-full object-cover"
                                    muted
                                    playsInline
                                />
                                <canvas
                                    ref={overlayRef}
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                />
                                {running && (
                                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                        Kamera aktif
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>Status kamera</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {maintenanceMode
                                    ? 'Maintenance'
                                    : running
                                      ? 'Aktif'
                                      : 'Nonaktif'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Status deteksi</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Izin kamera</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {cameraPermissionLabel}
                            </span>
                        </div>
                        {error && (
                            <div className="mt-2 rounded-xl border border-rose-200/60 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                {error}
                            </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {flowItems.map((item) => (
                                <span
                                    key={item.key}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${
                                        item.active
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                                            : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/60'
                                    }`}
                                >
                                    <span className="h-2 w-2 rounded-full bg-current" />
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Target
                        </p>
                        <h3 className="mt-2 font-display text-lg text-slate-900 dark:text-white">
                            Mahasiswa
                        </h3>
                        <div className="mt-3 grid gap-3">
                            <Label htmlFor="ai-student">Pilih mahasiswa</Label>
                            <select
                                id="ai-student"
                                className="h-10 w-full rounded-xl border border-slate-200/70 bg-white px-3 text-sm text-slate-800 shadow-sm focus:outline-none dark:border-slate-800/70 dark:bg-slate-950 dark:text-slate-100"
                                value={selectedId}
                                onChange={(event) =>
                                    setSelectedId(
                                        event.target.value
                                            ? Number(event.target.value)
                                            : '',
                                    )
                                }
                            >
                                <option value="">Pilih mahasiswa</option>
                                {students.map((row) => (
                                    <option key={row.id} value={row.id}>
                                        {row.nama} ({row.nim})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {aiConfig?.target_label && (
                            <div className="mt-3 text-xs text-slate-500">
                                Target label: {aiConfig.target_label}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Hasil
                        </p>
                        <h3 className="mt-2 font-display text-lg text-slate-900 dark:text-white">
                            Deteksi terakhir
                        </h3>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                                <span>Label</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {detectionLabel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Confidence</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {detectionConf}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Min conf</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {minConfLabel}
                                </span>
                            </div>
                            {result?.log && (
                                <div className="mt-3 rounded-xl border border-emerald-200/70 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                    Absen tercatat: {result.log.mahasiswa} (
                                    {result.log.nim}) - {result.log.status}
                                </div>
                            )}
                            {result?.status === 'no_detection' && (
                                <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    Belum ada deteksi yang valid.
                                </div>
                            )}
                            {result?.status === 'duplicate' && (
                                <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    Mahasiswa sudah tercatat di sesi aktif.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SelfieSection({ selfieQueue }: { selfieQueue: any[] }) {
    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Absensi"
                title="Verifikasi Selfie"
                description="Review selfie yang masuk dan tandai validasi manual."
                actions={
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            router.get(
                                dashboard({ query: { section: 'selfie' } }),
                                {},
                                { preserveScroll: true },
                            )
                        }
                    >
                        <ScanFace className="h-4 w-4" />
                        Refresh queue
                    </Button>
                }
            />

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="grid gap-3">
                    {selfieQueue.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                            Tidak ada selfie pending.
                        </div>
                    ) : (
                        selfieQueue.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800/70 dark:bg-black/70"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                            <ScanFace className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {item.attendance_log?.mahasiswa?.nama ??
                                                    'Mahasiswa'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {item.attendance_log?.scanned_at}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.patch(
                                                    `/selfie-verifications/${item.id}/approve`,
                                                )
                                            }
                                        >
                                            Setujui
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.patch(
                                                    `/selfie-verifications/${item.id}/reject`,
                                                )
                                            }
                                        >
                                            Tolak
                                        </Button>
                                    </div>
                                </div>
                                {item.attendance_log?.selfie_path && (
                                    <img
                                        src={`/storage/${item.attendance_log.selfie_path}`}
                                        alt="Selfie"
                                        className="h-48 w-full rounded-2xl object-cover"
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function GeofenceSection({ geofence }: { geofence: SettingsData['geofence'] }) {
    const form = useForm({
        geofence_lat: geofence.lat,
        geofence_lng: geofence.lng,
        geofence_radius_m: geofence.radius_m,
    });
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const pulseCircleRef = useRef<L.Circle | null>(null);
    const initialCenterRef = useRef<[number, number]>([
        geofence.lat,
        geofence.lng,
    ]);
    const initialRadiusRef = useRef(geofence.radius_m);
    const [locationStatus, setLocationStatus] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch('/settings/geofence', { preserveScroll: true });
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('GPS tidak didukung di browser ini.');
            return;
        }
        setLocationLoading(true);
        setLocationStatus('Mengambil lokasi sekarang...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationLoading(false);
                form.setData(
                    'geofence_lat',
                    Number(position.coords.latitude.toFixed(7)),
                );
                form.setData(
                    'geofence_lng',
                    Number(position.coords.longitude.toFixed(7)),
                );
                setLocationStatus('Lokasi berhasil diambil.');
            },
            (error) => {
                setLocationLoading(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationStatus('Izin lokasi ditolak.');
                    return;
                }
                if (error.code === error.TIMEOUT) {
                    setLocationStatus('Waktu pengambilan lokasi habis.');
                    return;
                }
                setLocationStatus('Gagal mengambil lokasi.');
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
        );
    };

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        ensureLeafletIcons();
        const center = initialCenterRef.current;
        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        }).setView(center, 17);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;

        markerRef.current = L.marker(center, { draggable: true }).addTo(map);
        circleRef.current = L.circle(center, {
            radius: initialRadiusRef.current,
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.18,
            weight: 2,
        }).addTo(map);
        pulseCircleRef.current = L.circle(center, {
            radius: initialRadiusRef.current,
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.12,
            weight: 1,
            className: 'geofence-pulse',
        }).addTo(map);

        markerRef.current.on('dragend', () => {
            const position = markerRef.current?.getLatLng();
            if (!position) return;
            form.setData('geofence_lat', Number(position.lat.toFixed(7)));
            form.setData('geofence_lng', Number(position.lng.toFixed(7)));
        });

        map.on('click', (event) => {
            const position = event.latlng;
            form.setData('geofence_lat', Number(position.lat.toFixed(7)));
            form.setData('geofence_lng', Number(position.lng.toFixed(7)));
        });

        setMapReady(true);
        window.setTimeout(() => {
            map.invalidateSize();
        }, 0);

        return () => {
            map.off();
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
            circleRef.current = null;
            pulseCircleRef.current = null;
        };
    }, [form]);

    useEffect(() => {
        if (!mapReady || !mapInstanceRef.current) return;
        if (!markerRef.current || !circleRef.current || !pulseCircleRef.current) {
            return;
        }

        const position: [number, number] = [
            form.data.geofence_lat,
            form.data.geofence_lng,
        ];
        markerRef.current.setLatLng(position);
        circleRef.current.setLatLng(position);
        pulseCircleRef.current.setLatLng(position);
        mapInstanceRef.current.panTo(position, { animate: true });
    }, [form.data.geofence_lat, form.data.geofence_lng, mapReady]);

    useEffect(() => {
        if (!mapReady) return;
        if (!circleRef.current || !pulseCircleRef.current) return;
        circleRef.current.setRadius(form.data.geofence_radius_m);
        pulseCircleRef.current.setRadius(form.data.geofence_radius_m);
    }, [form.data.geofence_radius_m, mapReady]);

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Absensi"
                title="Zona"
                description="Kelola titik lokasi dan radius absensi mahasiswa."
            />

            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Geofence aktif
                        </p>
                        <h2 className="font-display text-xl text-slate-900 dark:text-white">
                            Titik lokasi kampus
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Geser pin atau klik peta untuk memindahkan zona.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        <MapPin className="h-4 w-4" />
                        Radius {form.data.geofence_radius_m}m
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/70">
                    <div className="relative h-[360px] w-full bg-slate-100/70 dark:bg-black/70">
                        <div ref={mapRef} className="h-full w-full" />
                        {!mapReady && (
                            <div className="absolute inset-0 flex h-full w-full items-center justify-center px-6 text-center text-sm text-slate-500 backdrop-blur-sm dark:text-slate-400">
                                Memuat peta OpenStreetMap...
                            </div>
                        )}
                        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/30 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-950/80 dark:text-slate-300">
                            Drag pin atau tap peta
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-sm text-slate-600 dark:border-slate-800/60 dark:bg-black/70 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>Latitude</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {form.data.geofence_lat}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <span>Longitude</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {form.data.geofence_lng}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <span>Radius aktif</span>
                            <span className="font-semibold text-emerald-600">
                                {form.data.geofence_radius_m} meter
                            </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            Titik geofence disimpan ke database dan akan dipakai
                            di absensi mahasiswa.
                        </p>
                    </div>

                    <form className="grid gap-4 text-sm" onSubmit={submit}>
                        <div className="flex flex-col items-start gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-black"
                                onClick={useCurrentLocation}
                                disabled={locationLoading}
                            >
                                <MapPin className="h-4 w-4" />
                                {locationLoading
                                    ? 'Mengambil lokasi...'
                                    : 'Pindai lokasi saat ini'}
                            </Button>
                            {locationStatus && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {locationStatus}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Latitude</Label>
                            <Input
                                type="number"
                                step="any"
                                value={form.data.geofence_lat}
                                onChange={(event) =>
                                    form.setData(
                                        'geofence_lat',
                                        Number.isNaN(event.target.valueAsNumber)
                                            ? 0
                                            : event.target.valueAsNumber,
                                    )
                                }
                            />
                            <InputError message={form.errors.geofence_lat} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Longitude</Label>
                            <Input
                                type="number"
                                step="any"
                                value={form.data.geofence_lng}
                                onChange={(event) =>
                                    form.setData(
                                        'geofence_lng',
                                        Number.isNaN(event.target.valueAsNumber)
                                            ? 0
                                            : event.target.valueAsNumber,
                                    )
                                }
                            />
                            <InputError message={form.errors.geofence_lng} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Radius (meter)</Label>
                            <Input
                                type="number"
                                value={form.data.geofence_radius_m}
                                onChange={(event) =>
                                    form.setData(
                                        'geofence_radius_m',
                                        Number(event.target.value),
                                    )
                                }
                            />
                            <InputError
                                message={form.errors.geofence_radius_m}
                            />
                        </div>
                        <Button type="submit" disabled={form.processing}>
                            <MapPin className="h-4 w-4" />
                            Simpan geofence
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function DevicesSection({
    deviceDistribution,
}: {
    deviceDistribution: DeviceDistribution[];
}) {
    const totalDevices = deviceDistribution.reduce(
        (acc, item) => acc + item.total,
        0,
    );

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Manajemen"
                title="Perangkat"
                description="Pantau distribusi OS dan kompatibilitas perangkat user."
            />
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="grid gap-4 text-sm">
                    {deviceDistribution.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                            Belum ada data perangkat.
                        </div>
                    ) : (
                        deviceDistribution.map((device) => {
                            const percentage = totalDevices
                                ? Math.round((device.total / totalDevices) * 100)
                                : 0;

                            return (
                                <div
                                    key={device.label}
                                    className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 dark:border-slate-800 dark:bg-black"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 dark:text-slate-300">
                                            {device.label}
                                        </span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {percentage}%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function ScheduleSection({
    sessions,
    courses,
}: {
    sessions: AttendanceSession[];
    courses: MataKuliah[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const editForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });
    const selectedCourse = useMemo(() => {
        const courseId = Number(editForm.data.course_id);
        if (!Number.isFinite(courseId)) {
            return null;
        }
        return courses.find((course) => course.id === courseId) ?? null;
    }, [courses, editForm.data.course_id]);
    const maxMeeting = selectedCourse?.sks === 3 ? 21 : 14;

    const formatDateTimeInput = useCallback((value?: string | null) => {
        if (!value) {
            return '';
        }
        const normalized = value.replace(' ', 'T');
        return normalized.length >= 16 ? normalized.slice(0, 16) : normalized;
    }, []);

    const startEdit = useCallback(
        (session: AttendanceSession) => {
            setEditingId(session.id);
            editForm.setData(
                'course_id',
                session.course_id ? String(session.course_id) : '',
            );
            editForm.setData('meeting_number', session.meeting_number);
            editForm.setData('title', session.title ?? '');
            editForm.setData(
                'start_at',
                formatDateTimeInput(session.start_at),
            );
            editForm.setData('end_at', formatDateTimeInput(session.end_at));
            editForm.clearErrors();
        },
        [editForm, formatDateTimeInput],
    );

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        editForm.reset();
        editForm.clearErrors();
    }, [editForm]);

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!editingId) {
            return;
        }
        editForm.patch(`/attendance-sessions/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                editForm.reset();
            },
        });
    };

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Manajemen"
                title="Jadwal"
                description="Daftar jadwal sesi absen yang tersimpan, bisa diedit atau dihapus."
            />
            <div className="grid gap-4 md:grid-cols-2">
                {sessions.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center text-sm text-slate-500 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        Belum ada jadwal.
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        {session.start_at} - {session.end_at}
                                    </p>
                                    <h2 className="mt-1 font-display text-lg text-slate-900 dark:text-white">
                                        {session.course?.nama ?? 'Mata kuliah'}
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Pertemuan {session.meeting_number}
                                    </p>
                                    {session.title && (
                                        <p className="text-xs text-slate-500">
                                            {session.title}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                        {session.is_active
                                            ? 'Aktif'
                                            : 'Terjadwal'}
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEdit(session)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            router.delete(
                                                `/attendance-sessions/${session.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="h-4 w-4" />
                                Auto check-in sesuai waktu sesi.
                            </div>
                            {editingId === session.id && (
                                <form
                                    className="mt-4 grid gap-4 text-sm"
                                    onSubmit={submitEdit}
                                >
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`edit-course-${session.id}`}
                                        >
                                            Mata kuliah
                                        </Label>
                                        <select
                                            id={`edit-course-${session.id}`}
                                            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-black"
                                            value={editForm.data.course_id}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'course_id',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Pilih mata kuliah
                                            </option>
                                            {courses.map((course) => (
                                                <option
                                                    key={course.id}
                                                    value={course.id}
                                                >
                                                    {course.nama} (SKS {course.sks})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={editForm.errors.course_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`edit-meeting-${session.id}`}
                                        >
                                            Pertemuan ke
                                        </Label>
                                        <Input
                                            id={`edit-meeting-${session.id}`}
                                            type="number"
                                            min={1}
                                            max={maxMeeting}
                                            value={editForm.data.meeting_number}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'meeting_number',
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                        <p className="text-xs text-slate-500">
                                            {selectedCourse
                                                ? `Maksimum ${maxMeeting} pertemuan (SKS ${selectedCourse.sks}).`
                                                : 'Pilih mata kuliah untuk melihat batas pertemuan.'}
                                        </p>
                                        <InputError
                                            message={editForm.errors.meeting_number}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`edit-title-${session.id}`}
                                        >
                                            Judul
                                        </Label>
                                        <Input
                                            id={`edit-title-${session.id}`}
                                            value={editForm.data.title}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'title',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`edit-start-${session.id}`}
                                        >
                                            Mulai
                                        </Label>
                                        <Input
                                            id={`edit-start-${session.id}`}
                                            type="datetime-local"
                                            value={editForm.data.start_at}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'start_at',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={editForm.errors.start_at}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`edit-end-${session.id}`}
                                        >
                                            Selesai
                                        </Label>
                                        <Input
                                            id={`edit-end-${session.id}`}
                                            type="datetime-local"
                                            value={editForm.data.end_at}
                                            onChange={(event) =>
                                                editForm.setData(
                                                    'end_at',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={editForm.errors.end_at}
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={editForm.processing}
                                        >
                                            <CalendarCheck className="h-4 w-4" />
                                            Simpan perubahan
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={cancelEdit}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function SettingsSection({
    settingsForm,
}: {
    settingsForm: DashboardPageProps['settingsForm'];
}) {
    const form = useForm({
        token_ttl_seconds: settingsForm?.token_ttl_seconds ?? 180,
        late_minutes: settingsForm?.late_minutes ?? 10,
        selfie_required: settingsForm?.selfie_required ?? true,
        notify_rejected: settingsForm?.notify_rejected ?? true,
        notify_selfie_blur: settingsForm?.notify_selfie_blur ?? true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch('/settings', { preserveScroll: true });
    };

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Manajemen"
                title="Pengaturan"
                description="Atur preferensi absensi, keamanan, dan notifikasi."
            />
            <form
                className="grid gap-6 lg:grid-cols-[1fr_1fr]"
                onSubmit={submit}
            >
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-display text-lg text-slate-900 dark:text-white">
                        Keamanan sesi
                    </h2>
                    <div className="mt-4 grid gap-3 text-sm">
                        <label className="flex items-center gap-3">
                            <Checkbox
                                checked={form.data.selfie_required}
                                onCheckedChange={(value) =>
                                    form.setData('selfie_required', value === true)
                                }
                            />
                            <span>Aktifkan selfie wajib</span>
                        </label>
                        <div className="grid gap-2">
                            <Label htmlFor="ttl">Token TTL (detik)</Label>
                            <Input
                                id="ttl"
                                type="number"
                                value={form.data.token_ttl_seconds}
                                onChange={(event) =>
                                    form.setData(
                                        'token_ttl_seconds',
                                        Number(event.target.value),
                                    )
                                }
                            />
                            <InputError message={form.errors.token_ttl_seconds} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="late">Batas terlambat (menit)</Label>
                            <Input
                                id="late"
                                type="number"
                                value={form.data.late_minutes}
                                onChange={(event) =>
                                    form.setData(
                                        'late_minutes',
                                        Number(event.target.value),
                                    )
                                }
                            />
                            <InputError message={form.errors.late_minutes} />
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-display text-lg text-slate-900 dark:text-white">
                        Notifikasi
                    </h2>
                    <div className="mt-4 grid gap-4 text-sm">
                        <label className="flex items-center gap-3">
                            <Checkbox
                                checked={form.data.notify_rejected}
                                onCheckedChange={(value) =>
                                    form.setData(
                                        'notify_rejected',
                                        value === true,
                                    )
                                }
                            />
                            <span>Notifikasi jika scan ditolak</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <Checkbox
                                checked={form.data.notify_selfie_blur}
                                onCheckedChange={(value) =>
                                    form.setData(
                                        'notify_selfie_blur',
                                        value === true,
                                    )
                                }
                            />
                            <span>Notifikasi jika selfie blur</span>
                        </label>
                        <p className="text-xs text-slate-500">
                            Notifikasi dikirim via dashboard admin.
                        </p>
                    </div>
                    <Button
                        type="submit"
                        className="mt-6"
                        disabled={form.processing}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Simpan pengaturan
                    </Button>
                </div>
            </form>
        </div>
    );
}

function useClientTimezone(): string {
    const [timezone, setTimezone] = useState('');

    useEffect(() => {
        if (typeof Intl === 'undefined') {
            return;
        }

        const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (resolved) {
            setTimezone(resolved);
        }
    }, []);

    return timezone;
}

function ReportsSection({ reportSessions }: { reportSessions: any[] }) {
    const timezone = useClientTimezone();
    const buildReportUrl = (sessionId?: number) => {
        const params = new URLSearchParams();
        if (typeof sessionId === 'number') {
            params.set('session_id', String(sessionId));
        }
        if (timezone) {
            params.set('tz', timezone);
        }
        const query = params.toString();

        return query
            ? `/reports/attendance.csv?${query}`
            : '/reports/attendance.csv';
    };

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Laporan"
                title="Rekap Kehadiran"
                description="Ringkasan kehadiran per sesi dan export data."
                actions={
                    <Button size="sm" asChild>
                        <a href={buildReportUrl()}>
                            <FileBarChart className="h-4 w-4" />
                            Export CSV
                        </a>
                    </Button>
                }
            />
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="grid gap-3">
                    {reportSessions.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                            Belum ada rekap.
                        </div>
                    ) : (
                        reportSessions.map((session) => (
                            <div
                                key={session.id}
                                className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-black"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {session.course?.nama}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Pertemuan {session.meeting_number}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {session.start_at}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-700">
                                            Hadir {session.present_count}
                                        </span>
                                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-700">
                                            Telat {session.late_count}
                                        </span>
                                        <span className="rounded-full bg-rose-500/15 px-3 py-1 text-rose-700">
                                            Ditolak {session.rejected_count}
                                        </span>
                                        <a
                                            href={buildReportUrl(session.id)}
                                            className="text-emerald-600 hover:underline"
                                        >
                                            Export
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function AuditSection({ auditLogs }: { auditLogs: any[] }) {
    const timezone = useClientTimezone();
    const auditParams = new URLSearchParams();
    if (timezone) {
        auditParams.set('tz', timezone);
    }
    const auditUrl = auditParams.toString()
        ? `/reports/audit.csv?${auditParams.toString()}`
        : '/reports/audit.csv';

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Laporan"
                title="Audit Keamanan"
                description="Pantau aktivitas mencurigakan dan log verifikasi."
                actions={
                    <Button size="sm" variant="outline" asChild>
                        <a href={auditUrl}>
                            <ShieldCheck className="h-4 w-4" />
                            Unduh log
                        </a>
                    </Button>
                }
            />
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="grid gap-3">
                    {auditLogs.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                            Belum ada audit.
                        </div>
                    ) : (
                        auditLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-black sm:flex-row sm:items-center"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {log.event_type}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {log.message}
                                    </p>
                                </div>
                                <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                                    {log.created_at}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminGuideSection() {
    const dailyFlow = [
        'Buka Dashboard dan cek ringkasan hadir, terlambat, selfie ditolak.',
        'Buat sesi absen dengan mata kuliah, pertemuan, dan waktu.',
        'Buka QR Builder lalu bagikan QR ke kelas.',
        'Pantau Live Monitor untuk status scan masuk.',
        'Verifikasi selfie pending sebelum sesi ditutup.',
        'Tutup sesi dan export rekap jika diperlukan.',
    ];
    const preClassChecklist = [
        'Data mahasiswa sudah terdaftar dan valid.',
        'Geofence sesuai lokasi kelas dan radius tepat.',
        'Token TTL dan batas terlambat sesuai kebijakan.',
        'Jadwal sesi sudah dibuat.',
        'Koneksi internet dan perangkat kamera siap.',
    ];
    const postClassChecklist = [
        'Tutup sesi aktif agar tidak ada scan tambahan.',
        'Cek rekap kehadiran dan export CSV bila dibutuhkan.',
        'Tinjau audit token untuk anomali.',
        'Catat kendala untuk perbaikan berikutnya.',
    ];
    const menuGuides = [
        {
            title: 'Dashboard',
            items: [
                'Ringkasan hadir, terlambat, selfie ditolak, total mahasiswa.',
                'Pantau sesi aktif dan status token.',
                'Gunakan tombol cepat untuk buat sesi dan QR.',
            ],
        },
        {
            title: 'Sesi Absen',
            items: [
                'Buat sesi baru dengan mata kuliah, pertemuan, judul, waktu.',
                'Aktifkan sesi saat kelas dimulai, tutup saat selesai.',
                'Daftar sesi terbaru menampilkan status aktif atau nonaktif.',
            ],
        },
        {
            title: 'QR Builder',
            items: [
                'Generate token QR untuk sesi aktif.',
                'Token berotasi otomatis sesuai TTL.',
                'Gunakan layar besar agar mudah dipindai.',
            ],
        },
        {
            title: 'Live Monitor',
            items: [
                'Pantau scan masuk secara real time.',
                'Lihat status hadir, terlambat, ditolak.',
                'Cek jarak lokasi dan status selfie.',
            ],
        },
        {
            title: 'Verifikasi Selfie',
            items: [
                'Buka antrean selfie pending.',
                'Approve jika foto jelas dan sesuai.',
                'Reject jika blur atau tidak sesuai.',
            ],
        },
        {
            title: 'Zona Geofence',
            items: [
                'Atur titik lokasi kelas di peta.',
                'Sesuaikan radius lalu simpan.',
                'Mencegah scan di luar area.',
            ],
        },
        {
            title: 'Mahasiswa',
            items: [
                'Tambah mahasiswa dengan nama dan NIM.',
                'Password default mengikuti format yang ditampilkan.',
                'Hapus data mahasiswa yang sudah tidak aktif.',
            ],
        },
        {
            title: 'Jadwal',
            items: [
                'Lihat daftar jadwal sesi yang tersimpan.',
                'Gunakan Edit untuk ubah mata kuliah, pertemuan, judul, waktu.',
                'Gunakan Hapus untuk membatalkan jadwal yang tidak jadi.',
            ],
        },
        {
            title: 'Pengaturan',
            items: [
                'Atur token TTL dan batas terlambat.',
                'Aktifkan atau nonaktifkan selfie wajib.',
                'Kelola notifikasi admin.',
            ],
        },
        {
            title: 'Rekap Kehadiran',
            items: [
                'Lihat ringkasan kehadiran per sesi.',
                'Download CSV untuk arsip dan laporan.',
                'Cek hadir, telat, dan ditolak per sesi.',
            ],
        },
        {
            title: 'Audit Keamanan',
            items: [
                'Pantau token ganda dan token kadaluarsa.',
                'Gunakan log untuk investigasi.',
                'Download audit CSV bila diperlukan.',
            ],
        },
        {
            title: 'Perangkat',
            items: [
                'Lihat distribusi OS perangkat mahasiswa.',
                'Gunakan data untuk uji kompatibilitas.',
                'Pantau tren perangkat yang paling sering dipakai.',
            ],
        },
    ];

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Panduan"
                title="Panduan Admin"
                description="Panduan operasional untuk mengelola absensi, keamanan, dan data."
            />
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Alur Harian
                    </p>
                    <h2 className="mt-2 font-display text-lg text-slate-900 dark:text-white">
                        Langkah Utama
                    </h2>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600 dark:text-slate-300">
                        {dailyFlow.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Persiapan
                    </p>
                    <h2 className="mt-2 font-display text-lg text-slate-900 dark:text-white">
                        Checklist Sebelum Kelas
                    </h2>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600 dark:text-slate-300">
                        {preClassChecklist.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Penutupan
                    </p>
                    <h2 className="mt-2 font-display text-lg text-slate-900 dark:text-white">
                        Setelah Kelas
                    </h2>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600 dark:text-slate-300">
                        {postClassChecklist.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {menuGuides.map((menu) => (
                    <div
                        key={menu.title}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="font-display text-lg text-slate-900 dark:text-white">
                            {menu.title}
                        </h3>
                        <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600 dark:text-slate-300">
                            {menu.items.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HelpCenterSection() {
    const issueGuides = [
        {
            title: 'QR tidak terbaca atau kadaluarsa',
            steps: [
                'Pastikan sesi aktif dan QR dibuat dari menu QR Builder.',
                'Generate ulang QR jika token sudah lewat TTL.',
                'Periksa koneksi internet di perangkat admin dan mahasiswa.',
                'Gunakan kamera dengan pencahayaan cukup.',
            ],
        },
        {
            title: 'Lokasi di luar geofence',
            steps: [
                'Aktifkan GPS dan izin lokasi di browser.',
                'Tunggu akurasi stabil selama beberapa detik.',
                'Cek radius di menu Zona.',
                'Pindah ke area terbuka jika sinyal GPS lemah.',
            ],
        },
        {
            title: 'Selfie gagal atau kamera tidak muncul',
            steps: [
                'Izinkan akses kamera saat diminta.',
                'Tutup aplikasi kamera lain yang sedang aktif.',
                'Coba browser terbaru lalu refresh halaman.',
                'Gunakan perangkat lain jika kamera bermasalah.',
            ],
        },
        {
            title: 'Token ditolak atau ganda',
            steps: [
                'Pastikan mahasiswa tidak scan QR berulang.',
                'Periksa token TTL di menu Pengaturan.',
                'Pastikan hanya satu sesi yang aktif.',
                'Cek log di Audit Keamanan untuk detail.',
            ],
        },
        {
            title: 'Sesi atau jadwal tidak muncul',
            steps: [
                'Pastikan jadwal sudah dibuat dan waktu sesuai.',
                'Refresh dashboard setelah membuat sesi.',
                'Pastikan pertemuan tidak duplikat pada mata kuliah yang sama.',
                'Cek status aktif atau terjadwal.',
            ],
        },
        {
            title: 'Mahasiswa gagal login atau tidak terdaftar',
            steps: [
                'Pastikan data mahasiswa ada di menu Mahasiswa.',
                'Cek format password default sesuai ketentuan.',
                'Minta mahasiswa cek koneksi dan browser.',
                'Hapus lalu tambah ulang data jika perlu.',
            ],
        },
    ];
    const faq = [
        {
            question: 'Bagaimana cara mengubah jadwal sesi?',
            answer: 'Masuk menu Jadwal, klik Edit, ubah data, lalu simpan.',
        },
        {
            question: 'Bagaimana cara menghapus jadwal?',
            answer: 'Masuk menu Jadwal dan klik Hapus pada kartu sesi.',
        },
        {
            question: 'Bagaimana cara mengubah radius geofence?',
            answer: 'Buka menu Zona, geser pin, ubah radius, lalu simpan.',
        },
        {
            question: 'Apa arti status Ditolak?',
            answer: 'Scan ditolak karena lokasi, token, atau selfie tidak valid.',
        },
        {
            question: 'Bagaimana cara export data?',
            answer: 'Masuk Rekap Kehadiran lalu klik Export CSV.',
        },
        {
            question: 'Selfie wajib bisa dimatikan?',
            answer: 'Bisa, atur di menu Pengaturan pada opsi selfie wajib.',
        },
    ];
    const reportChecklist = [
        'Nama dan NIM mahasiswa.',
        'Sesi atau pertemuan ke berapa.',
        'Waktu kejadian.',
        'Screenshot atau foto bukti.',
        'Jenis perangkat dan browser.',
        'Status jaringan saat kejadian.',
    ];

    return (
        <div className="grid gap-6">
            <SectionHeader
                kicker="Bantuan"
                title="Help Center"
                description="Jawaban cepat untuk kendala umum dan panduan troubleshooting."
            />
            <div className="grid gap-4 lg:grid-cols-2">
                {issueGuides.map((issue) => (
                    <div
                        key={issue.title}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="font-display text-lg text-slate-900 dark:text-white">
                            {issue.title}
                        </h3>
                        <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600 dark:text-slate-300">
                            {issue.steps.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-display text-lg text-slate-900 dark:text-white">
                        FAQ
                    </h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        {faq.map((item) => (
                            <div key={item.question}>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    {item.question}
                                </p>
                                <p>{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-display text-lg text-slate-900 dark:text-white">
                        Data untuk Laporan
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Siapkan data berikut agar investigasi lebih cepat.
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600 dark:text-slate-300">
                        {reportChecklist.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        Kirim laporan ke admin sistem atau helpdesk internal.
                    </p>
                </div>
            </div>
        </div>
    );
}

function OverviewSection({
    stats,
    activity,
    weekly,
    weeklyDetailed,
    hourlyData,
    topStudents,
    courseStats,
    attendanceRate,
    upcomingSessions,
    deviceDistribution,
    activeSession,
    settings,
    activeStats,
    securitySummary,
}: {
    stats: StatCard[];
    activity: ActivityLog[];
    weekly: WeeklyData;
    weeklyDetailed?: WeeklyDetailedData[];
    hourlyData?: HourlyData[];
    topStudents?: TopStudent[];
    courseStats?: CourseStats[];
    attendanceRate?: number;
    upcomingSessions: AttendanceSession[];
    deviceDistribution: DeviceDistribution[];
    activeSession?: ActiveSession | null;
    settings?: SettingsData;
    activeStats?: DashboardPageProps['activeStats'];
    securitySummary?: DashboardPageProps['securitySummary'];
}) {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const statIcons = [UserCheck, AlertTriangle, ScanFace, Users];
    const chartData = useMemo(
        () =>
            weekly.labels.map((label, index) => ({
                label,
                total: weekly.values[index] ?? 0,
            })),
        [weekly],
    );
    const chartMax = Math.max(1, ...chartData.map((item) => item.total));

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        present: { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        late: { label: 'Terlambat', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        rejected: { label: 'Ditolak', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
        pending: { label: 'Pending', color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/30' },
    };

    return (
        <>
            <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-950 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_90%_10%,rgba(16,185,129,0.25),transparent_60%)]" />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.08),transparent)] bg-[length:200%_200%] opacity-60 animate-sweep" />
                <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="flex flex-col gap-6 animate-appear">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/80">
                            <Sparkles className="h-4 w-4 text-emerald-300" />
                            Absensi barcode
                        </div>
                        <div className="space-y-3">
                            <h1 className="font-display text-3xl leading-tight md:text-5xl">
                                Kontrol absensi real time, selfie wajib,
                                radius {settings?.geofence.radius_m ?? 100}m.
                            </h1>
                            <p className="max-w-xl text-sm text-white/70 md:text-base">
                                Buat sesi, sebarkan QR dinamis, dan pantau
                                validasi token, lokasi, serta foto dalam
                                satu panel yang rapi.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(
                                        dashboard({
                                            query: { section: 'sessions' },
                                        }),
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
                            >
                                <CalendarCheck className="h-4 w-4" />
                                Buat sesi
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(
                                        dashboard({
                                            query: { section: 'qr' },
                                        }),
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                <QrCode className="h-4 w-4" />
                                Generate QR
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(
                                        dashboard({
                                            query: { section: 'reports' },
                                        }),
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                <FileBarChart className="h-4 w-4" />
                                Export laporan
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
                                <Timer className="h-4 w-4 text-emerald-300" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                        Token rotasi
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        {formatTtl(
                                            settings?.token_ttl_seconds ?? 180,
                                        )}{' '}
                                        otomatis
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
                                <Camera className="h-4 w-4 text-sky-300" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                        Selfie wajib
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        {settings?.selfie_required
                                            ? 'Aktif'
                                            : 'Nonaktif'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
                                <MapPin className="h-4 w-4 text-amber-300" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                        Geofence
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        Radius {settings?.geofence.radius_m ?? 100}m
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
                                <ShieldCheck className="h-4 w-4 text-emerald-200" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                        Keamanan
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        Audit token aktif
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm animate-appear [animation-delay:120ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                    Sesi aktif
                                </p>
                                <p className="text-lg font-semibold">
                                    {activeSession?.course?.nama ??
                                        'Belum ada sesi aktif'}
                                </p>
                                <p className="text-xs text-white/70">
                                    {activeSession
                                        ? `Pertemuan ${activeSession.meeting_number}`
                                        : 'Aktifkan sesi untuk memulai'}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                {activeSession ? 'Live' : 'Idle'}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm text-white/70">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-white/60" />
                                    Waktu
                                </span>
                                <span className="text-white">
                                    {activeSession
                                        ? `${activeSession.start_at} - ${activeSession.end_at}`
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-white/60" />
                                    Radius
                                </span>
                                <span className="text-white">
                                    {settings?.geofence.radius_m ?? 100} meter
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                    <ScanBarcode className="h-4 w-4 text-white/60" />
                                    Token
                                </span>
                                <span className="text-white">
                                    Rotasi{' '}
                                    {formatTtl(
                                        settings?.token_ttl_seconds ?? 180,
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center justify-between text-xs text-white/60">
                                        <span>Scan masuk</span>
                                        <span>{activeStats?.total ?? 0}</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-white/10">
                                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-200" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                                        Ditolak: {activeStats?.rejected ?? 0}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center justify-between text-xs text-white/60">
                                        <span>Selfie pending</span>
                                        <span>{activeStats?.selfie_pending ?? 0}</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-white/10">
                                        <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-sky-400 to-emerald-200" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
                                        Perlu verifikasi
                                    </div>
                                </div>
                            </div>

                            <div className="relative mx-auto aspect-square w-40 rounded-2xl border border-white/15 bg-white/5 p-3">
                                <div className="absolute inset-3 rounded-xl bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:12px_12px]" />
                                <div className="absolute inset-3 rounded-xl border border-white/20" />
                                <div className="absolute left-1/2 top-0 h-10 w-20 -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/60 to-transparent blur-sm animate-scan-line" />
                                <div className="absolute bottom-3 left-3 rounded-lg bg-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                                    Token aktif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = statIcons[index] ?? Users;
                    const trendUp = stat.trend === 'up';
                    const toneMap: Record<string, string> = {
                        emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
                        amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                        rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
                        sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
                    };

                    return (
                        <div
                            key={stat.title}
                            className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear"
                            style={{ animationDelay: `${index * 90}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[stat.tone]}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-xs font-semibold ${
                                        trendUp
                                            ? 'text-emerald-600 dark:text-emerald-300'
                                            : 'text-rose-600 dark:text-rose-300'
                                    }`}
                                >
                                    {trendUp ? (
                                        <ArrowUpRight className="h-4 w-4" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4" />
                                    )}
                                    {stat.change ?? '—'}
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                {stat.title}
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                                {stat.value}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {stat.note}
                            </p>
                            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-50 dark:from-white/10" />
                        </div>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                <div className="grid gap-6">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:120ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Statistik
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Kehadiran 7 hari
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                <BarChart3 className="h-4 w-4" />
                                Minggu ini
                            </div>
                        </div>

                        <div className="mt-6 h-44 text-slate-400">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 6, right: 0, left: -8, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="attendanceGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#34d399"
                                                stopOpacity={0.95}
                                            />
                                            <stop
                                                offset="70%"
                                                stopColor="#38bdf8"
                                                stopOpacity={0.75}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#fde68a"
                                                stopOpacity={0.6}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="rgba(148, 163, 184, 0.2)"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'currentColor', fontSize: 10 }}
                                    />
                                    <YAxis hide domain={[0, chartMax]} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) {
                                                return null;
                                            }
                                            const value = payload[0]
                                                .value as number;
                                            return (
                                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {label}
                                                    </p>
                                                    <p>{value} hadir</p>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="url(#attendanceGradient)"
                                        radius={[999, 999, 0, 0]}
                                        maxBarSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-black">
                                <p className="text-xs text-slate-500">
                                    Rata-rata hadir
                                </p>
                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                    {weekly.values.length
                                        ? Math.round(
                                              weekly.values.reduce(
                                                  (acc, val) => acc + val,
                                                  0,
                                              ) / weekly.values.length,
                                          )
                                        : 0}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    per hari
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-black">
                                <p className="text-xs text-slate-500">
                                    Token ganda
                                </p>
                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                    {securitySummary?.duplicate_tokens ?? 0}
                                </p>
                                <p className="text-xs text-rose-600">
                                    audit log
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-black">
                                <p className="text-xs text-slate-500">
                                    Selfie lolos
                                </p>
                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                    {securitySummary?.selfie_rate ?? 0}%
                                </p>
                                <p className="text-xs text-emerald-600">
                                    verifikasi
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:180ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Aktivitas
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Scan terakhir
                                </h2>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3">
                            {activity.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                                    Belum ada aktivitas.
                                </div>
                            ) : (
                                activity.map((item) => {
                                    const status = item.status;
                                    const badgeMap: Record<string, string> = {
                                        present:
                                            'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                                        late: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                                        rejected:
                                            'bg-rose-500/15 text-rose-700 dark:text-rose-300',
                                    };

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/70 dark:bg-black/70 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                                    <Camera className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {item.distance_m
                                                            ? `Radius ${item.distance_m}m`
                                                            : 'Data jarak belum ada'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 text-right sm:flex-col sm:items-end">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item.time}
                                                </span>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                                                        badgeMap[status] ??
                                                        'bg-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:150ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Jadwal
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Sesi berikutnya
                                </h2>
                            </div>
                            <CalendarCheck className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="mt-4 grid gap-3">
                            {upcomingSessions.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                                    Belum ada sesi berikutnya.
                                </div>
                            ) : (
                                upcomingSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-black"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {session.course?.nama}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {session.start_at} - {session.end_at}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Pertemuan {session.meeting_number}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                Terjadwal
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:210ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Geofence
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Radius {settings?.geofence.radius_m ?? 100} meter
                                </h2>
                            </div>
                            <MapPin className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="mt-6 flex items-center justify-center">
                            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10">
                                <div className="absolute h-24 w-24 rounded-full border border-emerald-400/60 bg-emerald-500/15 animate-pulse-soft" />
                                <div className="absolute h-14 w-14 rounded-full border border-emerald-400/60 bg-emerald-500/30" />
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40">
                                    <MapPin className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:240ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Keamanan
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Audit & kepatuhan
                                </h2>
                            </div>
                            <Fingerprint className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="mt-4 grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-black">
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    Token ganda
                                </span>
                                <span className="font-semibold text-emerald-600">
                                    {securitySummary?.duplicate_tokens ?? 0} kasus
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-black">
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Camera className="h-4 w-4 text-sky-500" />
                                    Selfie lolos
                                </span>
                                <span className="font-semibold text-sky-600">
                                    {securitySummary?.selfie_rate ?? 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-black">
                                <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <QrCode className="h-4 w-4 text-amber-500" />
                                    Token kadaluarsa
                                </span>
                                <span className="font-semibold text-amber-600">
                                    {securitySummary?.expired_tokens ?? 0} kasus
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:270ms]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Perangkat
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Distribusi OS
                                </h2>
                            </div>
                            <BarChart3 className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="mt-4 grid gap-3 text-sm">
                            {deviceDistribution.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                                    Belum ada data perangkat.
                                </div>
                            ) : (
                                deviceDistribution.map((device) => (
                                    <div
                                        key={device.label}
                                        className="rounded-2xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-black"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-300">
                                                {device.label}
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {device.total}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* New: Top Students & Course Stats Section */}
            <section className="grid gap-6 lg:grid-cols-2">
                {/* Top Students Leaderboard */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:300ms]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Leaderboard
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Top Mahasiswa
                            </h2>
                        </div>
                        <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="space-y-3">
                        {(topStudents ?? []).length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                                Belum ada data mahasiswa.
                            </div>
                        ) : (
                            (topStudents ?? []).map((student, index) => (
                                <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-black/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                        index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                        index === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                                        index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{student.name}</p>
                                        <p className="text-xs text-slate-500">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-emerald-600 text-sm">{student.attendance}%</p>
                                        <div className="flex items-center gap-1 text-xs text-amber-600">
                                            <Flame className="h-3 w-3" />
                                            {student.streak} hari
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Course Stats */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:330ms]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Per Mata Kuliah
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Statistik Kehadiran
                            </h2>
                        </div>
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="h-64">
                        {(courseStats ?? []).length === 0 ? (
                            <div className="flex items-center justify-center h-full rounded-2xl border border-slate-200/60 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                                Belum ada data mata kuliah.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={courseStats} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                                    <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                                                            <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar dataKey="hadir" name="Hadir" fill="#10b981" stackId="a" />
                                    <Bar dataKey="terlambat" name="Terlambat" fill="#f59e0b" stackId="a" />
                                    <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            {/* New: Attendance Rate & Hourly Distribution */}
            <section className="grid gap-6 lg:grid-cols-3">
                {/* Attendance Rate Gauge */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:360ms]">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Keseluruhan
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Tingkat Kehadiran
                            </h2>
                        </div>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: attendanceRate ?? 0, fill: '#10b981' }]} startAngle={180} endAngle={0}>
                                <RadialBar background dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-6">
                        <p className="text-4xl font-bold text-slate-900 dark:text-white">{attendanceRate ?? 0}%</p>
                        <p className="text-sm text-slate-500">Rata-rata kehadiran</p>
                    </div>
                </div>

                {/* Hourly Distribution */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:390ms]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Hari Ini
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Distribusi Jam Absen
                            </h2>
                        </div>
                        <Clock className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="h-40">
                        {(hourlyData ?? []).length === 0 ? (
                            <div className="flex items-center justify-center h-full rounded-2xl border border-slate-200/60 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-black">
                                Belum ada data hari ini.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}>
                                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis hide />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                                    <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                                                    <p className="text-slate-600 dark:text-slate-400">{payload[0].value} absen</p>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar dataKey="count" name="Absen" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 animate-appear [animation-delay:420ms]">
                <h2 className="font-display text-xl text-slate-900 dark:text-white mb-4">Aksi Cepat</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <a href="/admin/qr-builder" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-black/50 dark:hover:bg-black">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 transition-transform group-hover:scale-110">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">QR Builder</p>
                            <p className="text-sm text-slate-500">Buat QR code absensi</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/admin/mahasiswa" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-black/50 dark:hover:bg-black">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 transition-transform group-hover:scale-110">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">Mahasiswa</p>
                            <p className="text-sm text-slate-500">Kelola data mahasiswa</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/admin/sesi-absen" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-black/50 dark:hover:bg-black">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 transition-transform group-hover:scale-110">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">Sesi Absen</p>
                            <p className="text-sm text-slate-500">Kelola sesi absensi</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/admin/rekap-kehadiran" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-black/50 dark:hover:bg-black">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 transition-transform group-hover:scale-110">
                            <FileBarChart className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">Rekap</p>
                            <p className="text-sm text-slate-500">Lihat rekap kehadiran</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </section>
        </>
    );
}

export default function Dashboard() {
    const { props } = usePage<SharedData & DashboardPageProps>();
    const sectionKey = props.section ?? 'overview';
    const sectionTitle = sectionTitles[sectionKey] ?? 'Dashboard';
    const emptyMahasiswa: Paginated<Mahasiswa> = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
        links: [],
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: sectionTitle,
            href:
                sectionKey === 'overview'
                    ? dashboard().url
                    : dashboard({ query: { section: sectionKey } }).url,
        },
    ];

    const sectionContent = useMemo(() => {
        switch (sectionKey) {
            case 'students':
                return (
                    <StudentsSection
                        mahasiswa={props.mahasiswa ?? emptyMahasiswa}
                        flash={props.flash}
                    />
                );
            case 'sessions':
                return (
                    <SessionsSection
                        courses={props.courses ?? []}
                        sessions={props.sessions ?? []}
                    />
                );
            case 'qr':
                return (
                    <QrSection
                        activeSession={props.activeSession}
                        tokenTtlSeconds={props.tokenTtlSeconds ?? 180}
                    />
                );
            case 'monitor':
                return (
                    <MonitorSection
                        activeSession={props.activeSession}
                        initialLogs={props.monitorLogs ?? []}
                    />
                );
            case 'absen-ai':
                return (
                    <AiAttendanceSection
                        activeSession={props.activeSession}
                        students={props.aiStudents ?? []}
                        aiConfig={props.aiConfig}
                    />
                );
            case 'selfie':
                return <SelfieSection selfieQueue={props.selfieQueue ?? []} />;
            case 'geofence':
                return (
                    <GeofenceSection
                        geofence={
                            props.geofence ??
                            props.settings?.geofence ?? {
                                lat: -6.3460957,
                                lng: 106.6915144,
                                radius_m: 100,
                            }
                        }
                    />
                );
            case 'devices':
                return (
                    <DevicesSection
                        deviceDistribution={props.deviceDistribution ?? []}
                    />
                );
            case 'schedule':
                return (
                    <ScheduleSection
                        sessions={props.sessions ?? []}
                        courses={props.courses ?? []}
                    />
                );
            case 'settings':
                return <SettingsSection settingsForm={props.settingsForm} />;
            case 'reports':
                return <ReportsSection reportSessions={props.reportSessions ?? []} />;
            case 'audit':
                return <AuditSection auditLogs={props.auditLogs ?? []} />;
            case 'admin-guide':
                return <AdminGuideSection />;
            case 'help-center':
                return <HelpCenterSection />;
            default:
                return (
                    <DashboardOverview
                        stats={props.stats ?? []}
                        activity={props.activity ?? []}
                        weekly={
                            props.weekly ?? { labels: [], values: [] }
                        }
                        weeklyDetailed={props.weeklyDetailed}
                        hourlyData={props.hourlyData}
                        topStudents={props.topStudents}
                        courseStats={props.courseStats}
                        attendanceRate={props.attendanceRate}
                        upcomingSessions={props.upcomingSessions ?? []}
                        deviceDistribution={props.deviceDistribution ?? []}
                        activeSession={props.activeSession}
                        settings={props.settings}
                        activeStats={props.activeStats}
                        securitySummary={props.securitySummary}
                    />
                );
        }
    }, [sectionKey, props]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={sectionTitle} />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-hidden px-6 pb-10 pt-6">
                {sectionContent}
            </div>
        </AppLayout>
    );
}
