#!/usr/bin/env python3
"""Script to write the grading-detail.tsx file in full."""

content = r'''import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, FileText, Printer, X, Check, TrendingUp, Award, CheckCircle, Clock, Calendar, Mail, Copy, ChevronDown, Filter, Search, BarChart3, MessageSquare, Eye, BookOpen, XCircle, RefreshCw, Plus, Trash2, ArrowUpDown, Target, Calculator } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

interface AttRec {
    id: number; meeting_number: number; session_title: string; session_date: string; session_time: string;
    status: 'present' | 'late' | 'permit' | 'sick' | 'absent' | 'rejected'; points: number;
    check_in_time?: string | null; check_in_location?: { latitude: number; longitude: number; address?: string | null } | null;
    selfie_photo?: string | null; notes?: string | null; device_info?: string | null;
    edited_by?: string | null; edit_reason?: string | null;
}
interface DNote { id: number; content: string; title: string; created_by: string; created_at: string; is_important: boolean; is_visible_to_student: boolean; }
interface Props {
    dosen: { id: number; nama: string; email: string };
    student: { id: number; nama: string; nim: string; email: string; foto?: string | null; prodi: string; fakultas: string; semester: number; kelas?: string | null; angkatan?: string | null };
    course: { id: number; nama: string; kode: string; sks: number; semester: string; tahun_ajaran: string };
    gradeData: {
        total_sessions: number; attended_sessions: number; attendance_rate: number; average_points: number;
        attendance_grade: number; grade_letter: string; can_take_uas: boolean; sessions_needed_for_uas: number;
        rank_in_class: number; total_students: number; percentile: number;
        status_breakdown: { present: number; late: number; permit: number; sick: number; absent: number; rejected: number };
        points_breakdown: { present_points: number; late_points: number; permit_points: number; sick_points: number; total_points: number; max_possible_points: number };
    };
    attendanceRecords: AttRec[];
    classAverage: { average_attendance_rate: number; average_points: number; mode_grade: string; total_students: number };
    dosenNotes: DNote[];
}

const containerVar = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } } as const;
const itemVar = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;

const statusClasses = (s: string) => ({ present: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400', late: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', permit: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', sick: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400', absent: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', rejected: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' }[s] || 'text-neutral-600 bg-neutral-100');
const statusLabel = (s: string) => ({ present: 'Hadir', late: 'Terlambat', permit: 'Izin', sick: 'Sakit', absent: 'Absen', rejected: 'Ditolak' }[s] || s);
const gradeColor = (l: string) => ({ A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500' }[l] || 'bg-red-500');
const chartColors: Record<string, string> = { present: '#10b981', late: '#f59e0b', permit: '#3b82f6', sick: '#06b6d4', absent: '#ef4444', rejected: '#f43f5e' };
const timelineColor = (s: string) => ({ present: 'bg-emerald-500', late: 'bg-amber-500', permit: 'bg-blue-500', sick: 'bg-cyan-500', absent: 'bg-red-500', rejected: 'bg-rose-500' }[s] || 'bg-neutral-500');
const initials = (n: string) => n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

function ModalWrapper({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function GradingDetail({ dosen, student, course, gradeData: gd, attendanceRecords: ar, classAverage: ca, dosenNotes: dn }: Props) {
    const [tab, setTab] = useState('riwayat');
    const [searchQ, setSearchQ] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<AttRec | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [chartType, setChartType] = useState('trend');
    const [copied, setCopied] = useState(false);
    const [tlFilter, setTlFilter] = useState('all');

    const editForm = useForm({ log_id: 0, status: '', reason: '' });
    const noteForm = useForm({ mahasiswa_id: student.id, content: '', title: '' });
    const sb = gd.status_breakdown;
    const pb = gd.points_breakdown;

    const filtered = useMemo(() => {
        let r = [...ar];
        if (searchQ) r = r.filter(x => x.session_title.toLowerCase().includes(searchQ.toLowerCase()));
        if (filterStatus !== 'all') r = r.filter(x => x.status === filterStatus);
        r.sort((a, b) => sortOrder === 'asc' ? a.meeting_number - b.meeting_number : b.meeting_number - a.meeting_number);
        return r;
    }, [ar, searchQ, filterStatus, sortOrder]);

    const lineData = useMemo(() => ar.map(r => ({ name: 'P' + r.meeting_number, points: r.points })), [ar]);
    const pieData = useMemo(() => [
        { name: 'Hadir', value: sb.present, color: chartColors.present },
        { name: 'Terlambat', value: sb.late, color: chartColors.late },
        { name: 'Izin', value: sb.permit, color: chartColors.permit },
        { name: 'Sakit', value: sb.sick, color: chartColors.sick },
        { name: 'Absen', value: sb.absent, color: chartColors.absent },
        { name: 'Ditolak', value: sb.rejected, color: chartColors.rejected },
    ].filter(d => d.value > 0), [sb]);
    const barData = useMemo(() => [
        { name: 'Kehadiran (%)', mhs: gd.attendance_rate, kls: ca.average_attendance_rate },
        { name: 'Poin Rata-rata', mhs: gd.average_points, kls: ca.average_points },
    ], [gd, ca]);
    const timelineRecs = useMemo(() => {
        let r = [...ar];
        if (tlFilter !== 'all') r = r.filter(x => x.status === tlFilter);
        return r;
    }, [ar, tlFilter]);

    const copyNim = useCallback(() => { navigator.clipboard.writeText(student.nim); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [student.nim]);
    const openDetail = useCallback((r: AttRec) => { setSelected(r); setShowDetail(true); }, []);
    const openEdit = useCallback((r: AttRec) => { setSelected(r); editForm.setData({ log_id: r.id, status: r.status, reason: '' }); setShowEdit(true); }, []);
    const saveStatus = useCallback(() => { editForm.post('/dosen/grading/detail/update-status', { onSuccess: () => { setShowEdit(false); editForm.reset(); } }); }, []);
    const saveNote = useCallback(() => { noteForm.post('/dosen/grading/detail/add-note', { onSuccess: () => { setShowNote(false); noteForm.setData({ mahasiswa_id: student.id, content: '', title: '' }); } }); }, [student.id]);
    const deleteNote = useCallback((id: number) => { if (confirm('Yakin hapus catatan ini?')) router.delete('/dosen/grading/detail/note/' + id); }, []);

    const summaryCards = [
        { key: 'total', label: 'Total Pertemuan', value: gd.total_sessions, sub: 'Sesi Terlaksana', Icon: BookOpen, from: 'from-blue-400', to: 'to-cyan-600', shadow: 'shadow-blue-500/30' },
        { key: 'hadir', label: 'Hadir', value: sb.present, sub: 'Kehadiran Penuh', Icon: CheckCircle, from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
        { key: 'late', label: 'Terlambat', value: sb.late, sub: 'Datang Terlambat', Icon: Clock, from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30' },
        { key: 'izin', label: 'Izin/Sakit', value: sb.permit + sb.sick, sub: 'Dengan Keterangan', Icon: FileText, from: 'from-blue-400', to: 'to-indigo-600', shadow: 'shadow-blue-500/30' },
        { key: 'absen', label: 'Absen', value: sb.absent + sb.rejected, sub: 'Tanpa Keterangan', Icon: XCircle, from: 'from-red-400', to: 'to-rose-600', shadow: 'shadow-red-500/30' },
        { key: 'avg', label: 'Rata-rata Poin', value: gd.average_points, sub: 'Poin Per Sesi', Icon: Award, from: 'from-purple-400', to: 'to-pink-600', shadow: 'shadow-purple-500/30' },
    ];

    const tabList: { key: string; label: string; Icon: any }[] = [
        { key: 'riwayat', label: 'Riwayat', Icon: FileText },
        { key: 'grafik', label: 'Grafik', Icon: BarChart3 },
        { key: 'timeline', label: 'Timeline', Icon: Calendar },
        { key: 'catatan', label: 'Catatan', Icon: MessageSquare },
        { key: 'perbandingan', label: 'Perbandingan', Icon: TrendingUp },
    ];

    return (
        <DosenLayout dosen={dosen}>
            <Head title={'Detail Nilai - ' + student.nama} />
            <motion.div initial="hidden" animate="visible" variants={containerVar} className="p-4 md:p-6 space-y-6">

                {/* HEADER */}
                <motion.div variants={itemVar} className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    {[0, 1, 2].map(i => <motion.div key={i} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i }} />)}
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-6">
                            <motion.button whileHover={{ scale: 1.05, x: -3 }} whileTap={{ scale: 0.95 }} onClick={() => router.visit('/dosen/grading')} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30">
                                <ArrowLeft className="h-4 w-4" /> Kembali
                            </motion.button>
                            <div className="hidden md:flex items-center gap-1 text-sm text-white/60">
                                <span>Grading</span><ChevronDown className="h-3 w-3 rotate-[-90deg]" /><span className="text-white/90">Detail</span>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-3xl font-bold shadow-xl">
                                    {student.foto ? <img src={student.foto} alt="" className="h-full w-full rounded-2xl object-cover" /> : initials(student.nama)}
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">{student.nama}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-sm text-indigo-100">{student.nim}</span>
                                        <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={copyNim} className="p-1 rounded-md hover:bg-white/20">
                                            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 text-white/60" />}
                                        </motion.button>
                                    </div>
                                    <p className="text-sm text-indigo-100 mt-1">{course.nama} ({course.sks} SKS)</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Kehadiran', value: gd.attended_sessions + '/' + gd.total_sessions, icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-emerald-500/20', delay: 0.5 },
                                    { label: 'Persentase', value: gd.attendance_rate + '%', icon: <TrendingUp className="h-5 w-5" />, bg: 'bg-blue-500/20', delay: 0.6 },
                                ].map((s, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: s.delay, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10">
                                        <div className={'p-2 rounded-lg ' + s.bg}>{s.icon}</div>
                                        <div><p className="text-xs text-indigo-100">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
                                    </motion.div>
                                ))}
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10">
                                    <div className={'px-4 py-2 rounded-xl text-white text-2xl font-bold shadow-lg ' + gradeColor(gd.grade_letter)}>{gd.grade_letter}</div>
                                </motion.div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/10">
                            {[
                                { label: 'Export', icon: <Download className="h-4 w-4" />, action: () => setShowExport(true) },
                                { label: 'Print', icon: <Printer className="h-4 w-4" />, action: () => window.print() },
                                { label: 'Refresh', icon: <RefreshCw className="h-4 w-4" />, action: () => router.reload() },
                            ].map((b, i) => (
                                <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={b.action} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30">
                                    {b.icon} {b.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* PROFILE CARD */}
                <motion.div variants={itemVar} className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-neutral-800 shrink-0">
                            {student.foto ? <img src={student.foto} alt="" className="h-full w-full rounded-2xl object-cover" /> : initials(student.nama)}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs font-medium text-neutral-500 mb-1">Pribadi</p>
                                <p className="font-bold text-neutral-900 dark:text-white">{student.nama}</p>
                                <p className="font-mono text-sm text-neutral-500 mt-1">{student.nim}</p>
                                <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1"><Mail className="h-3 w-3" />{student.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 mb-1">Akademik</p>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">{student.prodi}</p>
                                <p className="text-sm text-neutral-500">Fak. {student.fakultas}</p>
                                <p className="text-sm text-neutral-500">Sem. {student.semester}{student.kelas ? ' - ' + student.kelas : ''}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 mb-1">Status</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"><CheckCircle className="h-3 w-3" />Aktif</span>
                                    <span className={'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold ' + (gd.can_take_uas ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')}>
                                        {gd.can_take_uas ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        UAS: {gd.can_take_uas ? 'Ya' : 'Tidak'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 6 SUMMARY CARDS */}
                <motion.div variants={containerVar} className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {summaryCards.map(c => (
                        <motion.div key={c.key} variants={itemVar} whileHover={{ scale: 1.03, y: -8 }} className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className={'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ' + c.from + ' ' + c.to + ' ' + c.shadow}>
                                    <c.Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
                                    <p className="text-xs text-neutral-500">{c.sub}</p>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mt-3">{c.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* GRADE CALCULATION */}
                <motion.div variants={itemVar} className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4"><Calculator className="h-5 w-5 text-purple-500" />Rincian Perhitungan Nilai</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4">
                            <p className="text-xs font-medium text-neutral-500 mb-2">Step 1: Total Poin</p>
                            <div className="space-y-1 text-sm">
                                <p className="text-emerald-600">Hadir: {sb.present} x 100 = {pb.present_points}</p>
                                <p className="text-amber-600">Terlambat: {sb.late} x 75 = {pb.late_points}</p>
                                <p className="text-blue-600">Izin: {sb.permit} x 50 = {pb.permit_points}</p>
                                <p className="text-cyan-600">Sakit: {sb.sick} x 50 = {pb.sick_points}</p>
                                <p className="text-red-600">Absen: {sb.absent + sb.rejected} x 0 = 0</p>
                                <p className="font-bold text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-neutral-700 pt-1 mt-1">Total: {pb.total_points}</p>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4">
                            <p className="text-xs font-medium text-neutral-500 mb-2">Step 2: Persentase</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Poin: {pb.total_points}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Max Poin: {pb.max_possible_points}</p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">{gd.attendance_rate}%</p>
                        </div>
                        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4">
                            <p className="text-xs font-medium text-neutral-500 mb-2">Step 3: Grade</p>
                            <div className={'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xl ' + gradeColor(gd.grade_letter)}>{gd.grade_letter}</div>
                            <p className="text-sm text-neutral-500 mt-2">Nilai: {gd.attendance_grade}</p>
                        </div>
                        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4">
                            <p className="text-xs font-medium text-neutral-500 mb-2">Step 4: Status UAS</p>
                            {gd.can_take_uas
                                ? <div className="flex items-center gap-2 text-emerald-600"><CheckCircle className="h-6 w-6" /><span className="font-bold">Bisa UAS</span></div>
                                : <div><div className="flex items-center gap-2 text-red-600"><XCircle className="h-6 w-6" /><span className="font-bold">Tidak Bisa UAS</span></div>{gd.sessions_needed_for_uas > 0 && <p className="text-sm text-neutral-500 mt-1">Butuh {gd.sessions_needed_for_uas} sesi lagi</p>}</div>
                            }
                        </div>
                    </div>
                </motion.div>

                {/*
