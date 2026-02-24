import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Smartphone,
    Shield,
    Brain,
    Camera,
    AlertTriangle,
    Calendar,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Eye,
    Fingerprint,
    Globe,
    Monitor,
    Wifi,
    Award,
    User,
    FileText,
    ShieldCheck,
    ShieldAlert,
    Activity,
    Sparkles,
    Hash,
    ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import RekapIcon from '@/assets/admin/rekap-kehadiran/rekapan.png';

// ─── Types ───────────────────────────────────────────────
interface PageProps {
    dosen: { id: number; nama: string; nidn: string };
    log: {
        id: number;
        status: string;
        scanned_at: string | null;
        scanned_date: string | null;
        scanned_full: string | null;
        note: string | null;
        latitude: string | null;
        longitude: string | null;
        distance_m: string | null;
        accuracy: string | null;
        address: string | null;
        device_os: string | null;
        device_model: string | null;
        device_type: string | null;
        browser: string | null;
        platform: string | null;
        screen_resolution: string | null;
        timezone: string | null;
        ip_address: string | null;
        device_fingerprint: string | null;
        is_device_trusted: boolean | null;
        selfie_path: string | null;
        face_detected: boolean | null;
        face_match_score: number | null;
        is_live_photo: boolean | null;
        spoofing_detected: boolean | null;
        image_quality_score: number | null;
        ai_confidence: number | null;
        ai_recommendation: string | null;
        is_suspicious: boolean | null;
        risk_score: number | null;
        fraud_flags: string[] | null;
        ai_analysis_json: Record<string, unknown> | null;
        ai_processing_step: string | null;
        ai_processed_at: string | null;
    };
    mahasiswa: {
        id: number;
        nama: string;
        nim: string;
        fakultas: string;
        prodi: string;
        kelas: string;
        jenis_reguler: string;
        semester: string;
        avatar_url: string | null;
    };
    course: { id: number; nama: string; sks: number };
    session: { id: number; meeting_number: number; title: string | null; start_at: string | null; end_at: string | null };
    selfieVerification: { status: string; verified_by_name: string | null; verified_at: string | null; rejection_reason: string | null; note: string | null } | null;
    fraudAlerts: { id: number; type: string; severity: string; description: string; status: string }[];
    history: { id: number; meeting_number: number; status: string; scanned_at: string | null; scanned_date: string | null }[];
    studentStats: { total_sessions: number; present: number; late: number; absent: number; attendance_rate: number };
}

// ─── Animations ──────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const;

// ─── Helpers ─────────────────────────────────────────────
const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; bg: string; glow: string; color: string }> = {
    present: { icon: CheckCircle, label: 'Hadir', bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', glow: 'shadow-lg shadow-emerald-500/30', color: 'text-emerald-500' },
    late: { icon: Clock, label: 'Terlambat', bg: 'bg-gradient-to-r from-amber-500 to-orange-500', glow: 'shadow-lg shadow-amber-500/30', color: 'text-amber-500' },
    absent: { icon: XCircle, label: 'Tidak Hadir', bg: 'bg-gradient-to-r from-red-500 to-rose-500', glow: 'shadow-lg shadow-red-500/30', color: 'text-red-500' },
};

function ScoreBar({ value, max = 100, color }: { value: number | null; max?: number; color: string }) {
    const pct = value != null ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: typeof CheckCircle; label: string; value: string | number | null | undefined; mono?: boolean }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            <Icon className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 font-medium">{label}</p>
                <p className={`text-sm font-semibold text-neutral-900 dark:text-white truncate ${mono ? 'font-mono' : ''}`}>
                    {value ?? '-'}
                </p>
            </div>
        </div>
    );
}

function BoolBadge({ value, trueLabel, falseLabel }: { value: boolean | null; trueLabel: string; falseLabel: string }) {
    if (value === null || value === undefined) return <span className="text-xs text-neutral-400">N/A</span>;
    return value ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle className="h-3 w-3" />{trueLabel}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
            <XCircle className="h-3 w-3" />{falseLabel}
        </span>
    );
}

// ═════════════════════════════════════════════════════════
//  COMPONENT
// ═════════════════════════════════════════════════════════
export default function RekapanDetail({ log, mahasiswa, course, session, selfieVerification, fraudAlerts, history, studentStats }: PageProps) {
    const sc = statusConfig[log.status] ?? statusConfig.present;
    const StatusIcon = sc.icon;

    const riskColor = (log.risk_score ?? 0) > 70 ? 'bg-gradient-to-r from-red-400 to-rose-500' : (log.risk_score ?? 0) > 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500';
    const aiColor = (log.ai_confidence ?? 0) >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : (log.ai_confidence ?? 0) >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-rose-500';

    return (
        <DosenLayout>
            <Head title={`Detail Kehadiran — ${mahasiswa.nama}`} />

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* ═══ BACK + BREADCRUMB ═══ */}
                <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05, x: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.visit('/dosen/rekapan', { data: { course_id: course.id, session_id: session.id } })}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 backdrop-blur-xl hover:bg-white dark:hover:bg-neutral-800 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </motion.button>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span>Rekapan</span> <ChevronRight className="h-3 w-3" />
                        <span>{course.nama}</span> <ChevronRight className="h-3 w-3" />
                        <span>Pertemuan {session.meeting_number}</span> <ChevronRight className="h-3 w-3" />
                        <span className="text-neutral-900 dark:text-white font-semibold">{mahasiswa.nama}</span>
                    </div>
                </motion.div>

                {/* ═══ HEADER CARD ═══ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                    <motion.div className="absolute right-20 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-2 border-white/10" animate={{ scale: [1, 2], opacity: [0.3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }} />

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            {/* Avatar */}
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                                {mahasiswa.avatar_url ? (
                                    <img src={mahasiswa.avatar_url} alt={mahasiswa.nama} className="h-20 w-20 rounded-2xl object-cover border-2 border-white/30 shadow-xl" />
                                ) : (
                                    <div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{mahasiswa.nama.charAt(0)}</span>
                                    </div>
                                )}
                            </motion.div>
                            <div>
                                <p className="text-sm text-indigo-100 font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" /> Detail Kehadiran Mahasiswa
                                </p>
                                <h1 className="text-2xl md:text-3xl font-bold">{mahasiswa.nama}</h1>
                                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
                                    <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> {mahasiswa.nim}</span>
                                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {mahasiswa.prodi}</span>
                                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Semester {mahasiswa.semester}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white ${sc.bg} ${sc.glow} ring-2 ring-white/20`}>
                            <StatusIcon className="h-5 w-5" />
                            {sc.label}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══ QUICK INFO STRIP ═══ */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Mata Kuliah', value: course.nama, icon: BookOpen, gradient: 'from-blue-500 to-cyan-600' },
                        { label: 'Pertemuan', value: `Pertemuan ${session.meeting_number}`, icon: Calendar, gradient: 'from-purple-500 to-indigo-600' },
                        { label: 'Kelas', value: `${mahasiswa.kelas} • ${mahasiswa.jenis_reguler}`, icon: Award, gradient: 'from-emerald-500 to-teal-600' },
                        { label: 'Waktu Scan', value: log.scanned_at ?? '-', icon: Clock, gradient: 'from-amber-500 to-orange-600' },
                    ].map((item, i) => (
                        <motion.div key={i} variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl shadow-lg dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-neutral-500 font-medium">{item.label}</p>
                                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{item.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ MAIN CONTENT GRID ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── LEFT: Student Stats + Attendance History ── */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Student Stats Ring */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Statistik Mahasiswa</h3>
                                    <p className="text-xs text-neutral-500">Di mata kuliah {course.nama}</p>
                                </div>
                            </div>

                            {/* Attendance Rate Circle */}
                            <div className="flex flex-col items-center mb-5">
                                <div className="relative h-32 w-32">
                                    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-neutral-200 dark:text-neutral-700" />
                                        <motion.circle
                                            cx="60" cy="60" r="52" fill="none"
                                            strokeWidth="8" strokeLinecap="round"
                                            className={studentStats.attendance_rate >= 75 ? 'text-emerald-500' : studentStats.attendance_rate >= 50 ? 'text-amber-500' : 'text-red-500'}
                                            stroke="currentColor"
                                            strokeDasharray={`${2 * Math.PI * 52}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - studentStats.attendance_rate / 100) }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-neutral-900 dark:text-white">{studentStats.attendance_rate}%</span>
                                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Kehadiran</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Breakdown */}
                            <div className="space-y-3">
                                {[
                                    { label: 'Total Sesi', value: studentStats.total_sessions, color: 'text-blue-500' },
                                    { label: 'Hadir', value: studentStats.present, color: 'text-emerald-500' },
                                    { label: 'Terlambat', value: studentStats.late, color: 'text-amber-500' },
                                    { label: 'Tidak Hadir', value: studentStats.absent, color: 'text-red-500' },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">{s.label}</span>
                                        <span className={`font-bold ${s.color}`}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Attendance History */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-neutral-900 dark:text-white">Riwayat Kehadiran</h3>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {history.map((h, i) => {
                                    const hs = statusConfig[h.status];
                                    const HIcon = hs?.icon ?? CheckCircle;
                                    const isActive = h.id === log.id;
                                    return (
                                        <motion.div
                                            key={h.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(i * 0.05, 0.4) }}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                                        >
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${hs?.bg ?? 'bg-neutral-300'} text-white shrink-0`}>
                                                <HIcon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-neutral-900 dark:text-white">Pertemuan {h.meeting_number}</p>
                                                <p className="text-xs text-neutral-500">{h.scanned_date ?? '-'} • {h.scanned_at ?? '-'}</p>
                                            </div>
                                            <span className={`text-xs font-bold ${hs?.color ?? 'text-neutral-500'}`}>{hs?.label ?? h.status}</span>
                                        </motion.div>
                                    );
                                })}
                                {history.length === 0 && (
                                    <p className="text-sm text-neutral-500 text-center py-4">Belum ada riwayat</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: Detail Cards ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Selfie & AI Analysis */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                                    <Brain className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">AI Analysis & Verifikasi</h3>
                                    <p className="text-xs text-neutral-500">Hasil analisis kecerdasan buatan</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Selfie Preview */}
                                <div className="space-y-4">
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                        {log.selfie_path ? (
                                            <img src={`/storage/${log.selfie_path}`} alt="Selfie" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex flex-col items-center justify-center">
                                                <Camera className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mb-2" />
                                                <p className="text-xs text-neutral-400">Tidak ada foto</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selfie Verification Status */}
                                    {selfieVerification && (
                                        <div className={`rounded-xl p-3 border ${selfieVerification.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : selfieVerification.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {selfieVerification.status === 'approved' ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <ShieldAlert className="h-4 w-4 text-red-600" />}
                                                <span className="text-sm font-bold capitalize">{selfieVerification.status}</span>
                                            </div>
                                            {selfieVerification.verified_by_name && <p className="text-xs text-neutral-500">Oleh: {selfieVerification.verified_by_name}</p>}
                                            {selfieVerification.verified_at && <p className="text-xs text-neutral-500">Pada: {selfieVerification.verified_at}</p>}
                                            {selfieVerification.rejection_reason && <p className="text-xs text-red-600 mt-1">Alasan: {selfieVerification.rejection_reason}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* AI Scores */}
                                <div className="space-y-4">
                                    {/* AI Confidence */}
                                    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-100 dark:border-neutral-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-neutral-500 uppercase">AI Confidence</span>
                                            <span className="text-lg font-black text-neutral-900 dark:text-white">{log.ai_confidence ?? 0}%</span>
                                        </div>
                                        <ScoreBar value={log.ai_confidence} color={aiColor} />
                                    </div>

                                    {/* Face Match Score */}
                                    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-100 dark:border-neutral-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-neutral-500 uppercase">Face Match</span>
                                            <span className="text-lg font-black text-neutral-900 dark:text-white">{log.face_match_score ?? 0}%</span>
                                        </div>
                                        <ScoreBar value={log.face_match_score} color={log.face_match_score != null && log.face_match_score >= 70 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-rose-500'} />
                                    </div>

                                    {/* Risk Score */}
                                    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-100 dark:border-neutral-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-neutral-500 uppercase">Risk Score</span>
                                            <span className="text-lg font-black text-neutral-900 dark:text-white">{log.risk_score ?? 0}</span>
                                        </div>
                                        <ScoreBar value={log.risk_score} color={riskColor} />
                                    </div>

                                    {/* Image Quality */}
                                    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-100 dark:border-neutral-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-neutral-500 uppercase">Image Quality</span>
                                            <span className="text-lg font-black text-neutral-900 dark:text-white">{log.image_quality_score ?? 0}%</span>
                                        </div>
                                        <ScoreBar value={log.image_quality_score} color="bg-gradient-to-r from-blue-400 to-cyan-500" />
                                    </div>

                                    {/* Boolean Checks */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-100 dark:border-neutral-700 text-center">
                                            <p className="text-[10px] text-neutral-500 uppercase mb-1">Face Detected</p>
                                            <BoolBadge value={log.face_detected} trueLabel="Ya" falseLabel="Tidak" />
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-100 dark:border-neutral-700 text-center">
                                            <p className="text-[10px] text-neutral-500 uppercase mb-1">Live Photo</p>
                                            <BoolBadge value={log.is_live_photo} trueLabel="Ya" falseLabel="Tidak" />
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-100 dark:border-neutral-700 text-center">
                                            <p className="text-[10px] text-neutral-500 uppercase mb-1">Spoofing</p>
                                            <BoolBadge value={log.spoofing_detected} trueLabel="Terdeteksi" falseLabel="Aman" />
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-100 dark:border-neutral-700 text-center">
                                            <p className="text-[10px] text-neutral-500 uppercase mb-1">Suspicious</p>
                                            <BoolBadge value={log.is_suspicious} trueLabel="Ya" falseLabel="Tidak" />
                                        </div>
                                    </div>

                                    {/* AI Recommendation */}
                                    {log.ai_recommendation && (
                                        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-4 border border-indigo-200 dark:border-indigo-800">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">AI Recommendation</span>
                                            </div>
                                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 capitalize">{log.ai_recommendation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Fraud Alerts */}
                        {fraudAlerts.length > 0 && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-900 dark:text-red-300">Fraud Alerts</h3>
                                        <p className="text-xs text-red-500">{fraudAlerts.length} peringatan terdeteksi</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {fraudAlerts.map(a => (
                                        <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 border border-red-200 dark:border-red-800">
                                            <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${a.severity === 'high' ? 'text-red-500' : a.severity === 'medium' ? 'text-amber-500' : 'text-yellow-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{a.type}</p>
                                                <p className="text-xs text-neutral-500">{a.description}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : a.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {a.severity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Device & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Device Info */}
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-neutral-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Informasi Perangkat</h3>
                                </div>
                                <div className="space-y-0">
                                    <InfoRow icon={Smartphone} label="Model" value={log.device_model} />
                                    <InfoRow icon={Monitor} label="OS" value={log.device_os} />
                                    <InfoRow icon={Globe} label="Browser" value={log.browser} />
                                    <InfoRow icon={Monitor} label="Resolusi" value={log.screen_resolution} />
                                    <InfoRow icon={Wifi} label="IP Address" value={log.ip_address} mono />
                                    <InfoRow icon={Clock} label="Timezone" value={log.timezone} />
                                    <InfoRow icon={Fingerprint} label="Fingerprint" value={log.device_fingerprint ? `${log.device_fingerprint.substring(0, 16)}...` : null} mono />
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-neutral-500">Device Trusted</span>
                                        <BoolBadge value={log.is_device_trusted} trueLabel="Trusted" falseLabel="Untrusted" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Location Info */}
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-neutral-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Lokasi</h3>
                                </div>
                                <div className="space-y-0">
                                    <InfoRow icon={MapPin} label="Alamat" value={log.address} />
                                    <InfoRow icon={Globe} label="Koordinat" value={log.latitude && log.longitude ? `${log.latitude}, ${log.longitude}` : null} mono />
                                    <InfoRow icon={TrendingUp} label="Jarak" value={log.distance_m ? `${log.distance_m} m` : null} />
                                    <InfoRow icon={Eye} label="Akurasi GPS" value={log.accuracy ? `${log.accuracy} m` : null} />
                                </div>

                                {/* Mini Map Placeholder */}
                                {log.latitude && log.longitude && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                        <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} target="_blank" rel="noopener noreferrer" className="block">
                                            <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors">
                                                <div className="text-center">
                                                    <MapPin className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Buka di Google Maps</p>
                                                    <p className="text-[10px] text-emerald-600/60 font-mono">{log.latitude}, {log.longitude}</p>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                )}

                                {/* Session Time */}
                                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-0">
                                    <InfoRow icon={Calendar} label="Tanggal Scan" value={log.scanned_date} />
                                    <InfoRow icon={Clock} label="Waktu Scan" value={log.scanned_at} mono />
                                    {log.ai_processed_at && <InfoRow icon={Brain} label="AI Processed" value={log.ai_processed_at} mono />}
                                </div>
                            </motion.div>
                        </div>

                        {/* Fraud Flags */}
                        {log.fraud_flags && log.fraud_flags.length > 0 && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Fraud Flags</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {log.fraud_flags.map((flag, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800">
                                            <AlertTriangle className="h-3 w-3" />{flag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Note */}
                        {log.note && (
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 backdrop-blur-xl shadow-xl dark:border-neutral-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-500 to-neutral-600 text-white shadow-lg">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Catatan</h3>
                                </div>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{log.note}</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </DosenLayout>
    );
}
