import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, FileText, Printer, X, Check, TrendingUp, Award, CheckCircle, Clock, Calendar, Copy, ChevronDown, Search, BarChart3, MessageSquare, BookOpen, XCircle, RefreshCw, Plus, Trash2, ArrowUpDown, Target, Calculator, Eye, Sparkles, AlertTriangle, Trophy, Users, Star, Activity, MapPin, Camera, Edit3, Zap, Hash, ChevronLeft, ChevronRight, Info, ThumbsUp, ThumbsDown, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, LabelList } from 'recharts';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import TotalIcon from '@/assets/admin/dashboard/total-icon.png';
import HadirIcon from '@/assets/admin/rekap-kehadiran/hadir.png';
import TerlambatIcon from '@/assets/admin/analytics/terlambat.png';
import RataRataIcon from '@/assets/admin/leaderboard/rata-rata.png';

interface AttRec { id: number; meeting_number: number; session_title: string; session_date: string; session_time: string; status: 'present' | 'late' | 'permit' | 'sick' | 'absent' | 'rejected'; points: number; check_in_time?: string | null; check_in_location?: { latitude: number; longitude: number; address?: string | null } | null; selfie_photo?: string | null; notes?: string | null; device_info?: string | null; edited_by?: string | null; edit_reason?: string | null; }
interface DNote { id: number; content: string; title: string; created_by: string; created_at: string; is_important: boolean; is_visible_to_student: boolean; }
interface Props {
  dosen: { id: number; nama: string; email: string };
  student: { id: number; nama: string; nim: string; email: string; foto?: string | null; prodi: string; fakultas: string; semester: number; kelas?: string | null; angkatan?: string | null };
  course: { id: number; nama: string; kode: string; sks: number; semester: string; tahun_ajaran: string };
  gradeData: { total_sessions: number; attended_sessions: number; attendance_rate: number; average_points: number; attendance_grade: number; grade_letter: string; can_take_uas: boolean; sessions_needed_for_uas: number; rank_in_class: number; total_students: number; percentile: number; status_breakdown: { present: number; late: number; permit: number; sick: number; absent: number; rejected: number }; points_breakdown: { present_points: number; late_points: number; permit_points: number; sick_points: number; total_points: number; max_possible_points: number } };
  attendanceRecords: AttRec[];
  classAverage: { average_attendance_rate: number; average_points: number; mode_grade: string; total_students: number };
  dosenNotes: DNote[];
}

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;
const cardV = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }, hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } } } as const;
const sC = (s: string): string => ({ present: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400', late: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', permit: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', sick: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400', absent: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', rejected: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' } as Record<string, string>)[s] || 'text-neutral-600 bg-neutral-100';
const sL = (s: string): string => ({ present: 'Hadir', late: 'Terlambat', permit: 'Izin', sick: 'Sakit', absent: 'Absen', rejected: 'Ditolak' } as Record<string, string>)[s] || s;
const gCol = (l: string): string => ({ A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500' } as Record<string, string>)[l] || 'bg-red-500';
const COLORS: Record<string, string> = { present: '#10b981', late: '#f59e0b', permit: '#3b82f6', sick: '#06b6d4', absent: '#ef4444', rejected: '#f43f5e' };
const tlDot = (s: string): string => ({ present: 'bg-emerald-500', late: 'bg-amber-500', permit: 'bg-blue-500', sick: 'bg-cyan-500', absent: 'bg-red-500', rejected: 'bg-rose-500' } as Record<string, string>)[s] || 'bg-neutral-500';
const ini = (n: string): string => n.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
const sIcon = (s: string) => ({ present: CheckCircle, late: Clock, permit: FileText, sick: Activity, absent: XCircle, rejected: XCircle } as Record<string, any>)[s] || Info;

function ModalW({ show, onClose, title, children, maxW = 'max-w-2xl' }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode; maxW?: string }) {
  return (<AnimatePresence>{show && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className={`bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl ${maxW} w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl"><h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3><motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><X className="h-5 w-5" /></motion.button></div>
      <div className="p-6">{children}</div>
    </motion.div></motion.div>)}</AnimatePresence>);
}

export default function GradingDetail({ dosen, student, course, gradeData: gd, attendanceRecords: ar, classAverage: ca, dosenNotes: dn }: Props) {
  const [tab, setTab] = useState('timeline');
  const [q, setQ] = useState(''); const [fs, setFs] = useState('all'); const [so, setSo] = useState<'asc' | 'desc'>('asc');
  const [sel, setSel] = useState<AttRec | null>(null);
  const [dM, setDM] = useState(false); const [eM, setEM] = useState(false); const [nM, setNM] = useState(false); const [exM, setExM] = useState(false);
  const [ct, setCt] = useState('trend'); const [cp, setCp] = useState(false); const [tf, setTf] = useState('all');
  const [hCard, setHCard] = useState<string | null>(null); const [selfieM, setSelfieM] = useState<string | null>(null);
  const [page, setPage] = useState(1); const perPage = 8;
  const [imgError, setImgError] = useState(false);
  const ef = useForm({ log_id: 0, status: '', reason: '' });
  const nf = useForm({ mahasiswa_id: student.id, content: '', title: '' });
  const sb = gd.status_breakdown; const pb = gd.points_breakdown;

  const filt = useMemo(() => { let r = [...ar]; if (q) r = r.filter(x => x.session_title.toLowerCase().includes(q.toLowerCase())); if (fs !== 'all') r = r.filter(x => x.status === fs); r.sort((a, b) => so === 'asc' ? a.meeting_number - b.meeting_number : b.meeting_number - a.meeting_number); return r; }, [ar, q, fs, so]);
  const paged = useMemo(() => filt.slice((page - 1) * perPage, page * perPage), [filt, page]);
  const totalPages = Math.ceil(filt.length / perPage);
  const ld = useMemo(() => ar.map(r => ({ name: 'P' + r.meeting_number, poin: r.points, status: r.status, avg: ca.average_points })), [ar, ca]);
  const pd = useMemo(() => [{ name: 'Hadir', value: sb.present, color: COLORS.present }, { name: 'Terlambat', value: sb.late, color: COLORS.late }, { name: 'Izin', value: sb.permit, color: COLORS.permit }, { name: 'Sakit', value: sb.sick, color: COLORS.sick }, { name: 'Absen', value: sb.absent, color: COLORS.absent }, { name: 'Ditolak', value: sb.rejected, color: COLORS.rejected }].filter(d => d.value > 0), [sb]);
  const bd = useMemo(() => [{ name: 'Kehadiran', mhs: gd.attendance_rate, kls: ca.average_attendance_rate }, { name: 'Poin', mhs: gd.average_points, kls: ca.average_points }], [gd, ca]);
  const tlR = useMemo(() => { let r = [...ar]; if (tf !== 'all') r = r.filter(x => x.status === tf); return r; }, [ar, tf]);
  const radarData = useMemo(() => { const t = ar.length || 1; return [{ subject: 'Kehadiran', A: Math.round(sb.present / t * 100), B: Math.round(ca.average_attendance_rate) }, { subject: 'Ketepatan', A: Math.round((sb.present / (sb.present + sb.late || 1)) * 100), B: 70 }, { subject: 'Konsistensi', A: Math.round(gd.attendance_rate), B: Math.round(ca.average_attendance_rate) }, { subject: 'Poin', A: Math.round(gd.average_points), B: Math.round(ca.average_points) }, { subject: 'Partisipasi', A: Math.round(gd.attended_sessions / t * 100), B: Math.round(ca.average_attendance_rate) }]; }, [ar, sb, gd, ca]);
  const streak = useMemo(() => { let s = 0, m = 0; for (const r of [...ar].sort((a, b) => a.meeting_number - b.meeting_number)) { if (r.status === 'present' || r.status === 'late') { s++; m = Math.max(m, s); } else s = 0; } return { current: s, max: m }; }, [ar]);
  const trendDir = useMemo(() => { if (ar.length < 3) return 'stable'; const sorted = [...ar].sort((a, b) => a.meeting_number - b.meeting_number); const last3 = sorted.slice(-3); const first3 = sorted.slice(0, 3); const avgL = last3.reduce((a, r) => a + r.points, 0) / last3.length; const avgF = first3.reduce((a, r) => a + r.points, 0) / first3.length; return avgL > avgF ? 'up' : avgL < avgF ? 'down' : 'stable'; }, [ar]);

  const cpN = useCallback(() => { navigator.clipboard.writeText(student.nim); setCp(true); setTimeout(() => setCp(false), 2000); }, [student.nim]);
  const oD = useCallback((r: AttRec) => { setSel(r); setDM(true); }, []);
  const oE = useCallback((r: AttRec) => { setSel(r); ef.setData({ log_id: r.id, status: r.status, reason: '' }); setEM(true); }, []);
  const sS = useCallback(() => { ef.post('/dosen/grading/detail/update-status', { onSuccess: () => { setEM(false); ef.reset(); } }); }, []);
  const addN = useCallback(() => { nf.post('/dosen/grading/detail/add-note', { onSuccess: () => { setNM(false); nf.setData({ mahasiswa_id: student.id, content: '', title: '' }); } }); }, [student.id]);
  const delN = useCallback((id: number) => { if (confirm('Yakin hapus catatan?')) router.delete('/dosen/grading/detail/note/' + id); }, []);

  const cards = [
    { k: 't', l: 'Total Pertemuan', v: gd.total_sessions, s: 'Sesi Terlaksana', I: TotalIcon, f: 'from-blue-400', t2: 'to-cyan-600', sh: 'shadow-blue-500/30', glow: 'bg-blue-500', isImage: true },
    { k: 'h', l: 'Hadir', v: sb.present, s: 'Kehadiran Penuh', I: HadirIcon, f: 'from-emerald-400', t2: 'to-teal-600', sh: 'shadow-emerald-500/30', glow: 'bg-emerald-500', isImage: true },
    { k: 'l', l: 'Terlambat', v: sb.late, s: 'Datang Terlambat', I: TerlambatIcon, f: 'from-amber-400', t2: 'to-orange-600', sh: 'shadow-amber-500/30', glow: 'bg-amber-500', isImage: true },
    { k: 'p', l: 'Rata-rata Poin', v: gd.average_points, s: 'Poin Per Sesi', I: RataRataIcon, f: 'from-purple-400', t2: 'to-pink-600', sh: 'shadow-purple-500/30', glow: 'bg-purple-500', isImage: true },
  ];
  const tbs: { k: string; l: string; I: any }[] = [{ k: 'timeline', l: 'Timeline', I: Calendar }, { k: 'stats', l: 'Statistik', I: BarChart3 }, { k: 'riwayat', l: 'Riwayat', I: FileText }, { k: 'catatan', l: 'Catatan', I: MessageSquare }, { k: 'perbandingan', l: 'Perbandingan', I: TrendingUp }];
  const diff = gd.attendance_rate - ca.average_attendance_rate;
  const diffPts = gd.average_points - ca.average_points;
  const TrendIcon = trendDir === 'up' ? ArrowUp : trendDir === 'down' ? ArrowDown : Minus;

  return (
    <DosenLayout dosen={dosen}><Head title={'Detail - ' + student.nama} />
      <motion.div initial="hidden" animate="visible" variants={cV} className="p-4 md:p-6 space-y-6">

        {/* ═══ HEADER ═══ */}
        <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl">
          <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          {[0, 1, 2].map(i => <motion.div key={i} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i }} />)}
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              {/* ═══ BACK BUTTON ═══ */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Button variant="ghost" onClick={() => router.visit('/dosen/grading')} className="group text-white hover:bg-white/20 hover:text-white transition-all duration-300">
                  <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </motion.div>
                  Kembali
                </Button>
              </motion.div>
              <div className="hidden md:flex items-center gap-1 text-sm text-white/60"><span>Grading</span><ChevronDown className="h-3 w-3 rotate-[-90deg]" /><span className="text-white/90">Detail</span></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-3xl font-bold shadow-xl overflow-hidden">
                  {student.foto && !imgError ? <img src={student.foto} alt="" className="h-full w-full rounded-2xl object-cover" onError={() => setImgError(true)} /> : ini(student.nama)}
                </motion.div>
                <div><h1 className="text-2xl md:text-3xl font-bold">{student.nama}</h1><div className="flex items-center gap-2 mt-1"><span className="font-mono text-sm text-indigo-100">{student.nim}</span><motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={cpN} className="p-1 rounded-md hover:bg-white/20">{cp ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3 text-white/60" />}</motion.button></div><p className="text-sm text-indigo-100 mt-1">{course.nama} ({course.sks} SKS) - {student.prodi}</p></div>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10"><div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle className="h-5 w-5" /></div><div><p className="text-xs text-indigo-100">Kehadiran</p><p className="text-xl font-bold">{gd.attended_sessions}/{gd.total_sessions}</p></div></motion.div>
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10"><div className="p-2 bg-blue-500/20 rounded-lg"><TrendingUp className="h-5 w-5" /></div><div><p className="text-xs text-indigo-100">Persentase</p><p className="text-xl font-bold">{gd.attendance_rate}%</p></div></motion.div>
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10"><div className={`px-4 py-2 rounded-xl text-white text-2xl font-bold shadow-lg ${gCol(gd.grade_letter)}`}>{gd.grade_letter}</div></motion.div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/10">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setExM(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30"><Download className="h-4 w-4" /> Export</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30"><Printer className="h-4 w-4" /> Print</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.reload()} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/30"><RefreshCw className="h-4 w-4" /> Refresh</motion.button>
            </div>
          </div>
        </motion.div>

        {/* ═══ 4 SUMMARY CARDS ═══ */}
        <motion.div variants={cV} className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {cards.map(c => <motion.div key={c.k} variants={cardV} whileHover="hover" onHoverStart={() => setHCard(c.k)} onHoverEnd={() => setHCard(null)} className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
            <motion.div animate={{ scale: hCard === c.k ? 1.5 : 1, opacity: hCard === c.k ? 0.4 : 0.2 }} className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${c.glow} blur-3xl transition-all duration-500`} />
            <div className="relative flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.f} ${c.t2} text-white shadow-lg ${c.sh}`}>
                {c.isImage ? <img src={c.I as string} alt="" className="h-6 w-6 object-contain drop-shadow-md" /> : <c.I className="h-6 w-6" />}
              </motion.div>
              <div><p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.l}</p><p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{c.v}</p><p className="text-[10px] text-neutral-400 dark:text-neutral-500">{c.s}</p></div>
            </div>
          </motion.div>)}
        </motion.div>

        {/* ═══ TAB NAVIGATION ═══ */}
        <motion.div variants={iV} className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10 overflow-x-auto">
          {tbs.map(t => <motion.button key={t.k} layout onClick={() => { setTab(t.k); setPage(1); }} className={`relative px-4 md:px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${tab === t.k ? 'text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}>
            {tab === t.k && <motion.div layoutId="gradeTab" className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
            <span className="relative z-10 flex items-center gap-2"><t.I className="h-4 w-4" />{t.l}</span>
          </motion.button>)}
        </motion.div>

        {/* ═══ TAB CONTENT — No nested AnimatePresence ═══ */}
        {/* TIMELINE TAB */}
        {tab === 'timeline' && <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Quick Insights Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl shadow-sm"><div className="flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-amber-500" /><span className="text-xs font-semibold text-neutral-500">Streak Saat Ini</span></div><p className="text-2xl font-bold text-neutral-900 dark:text-white">{streak.current}<span className="text-sm text-neutral-400 ml-1">sesi</span></p><p className="text-[10px] text-neutral-400 mt-1">Max: {streak.max} sesi berturut</p></motion.div>
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl shadow-sm"><div className="flex items-center gap-2 mb-2"><TrendIcon className={`h-4 w-4 ${trendDir === 'up' ? 'text-emerald-500' : trendDir === 'down' ? 'text-red-500' : 'text-neutral-400'}`} /><span className="text-xs font-semibold text-neutral-500">Tren</span></div><p className={`text-lg font-bold ${trendDir === 'up' ? 'text-emerald-600' : trendDir === 'down' ? 'text-red-600' : 'text-neutral-600'}`}>{trendDir === 'up' ? 'Meningkat' : trendDir === 'down' ? 'Menurun' : 'Stabil'}</p><p className="text-[10px] text-neutral-400 mt-1">Berdasarkan 3 sesi terakhir</p></motion.div>
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl shadow-sm"><div className="flex items-center gap-2 mb-2"><Trophy className="h-4 w-4 text-indigo-500" /><span className="text-xs font-semibold text-neutral-500">Peringkat</span></div><p className="text-2xl font-bold text-neutral-900 dark:text-white">#{gd.rank_in_class}<span className="text-sm text-neutral-400 ml-1">/ {gd.total_students}</span></p><p className="text-[10px] text-indigo-500 mt-1">Top {gd.percentile}%</p></motion.div>
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl shadow-sm"><div className="flex items-center gap-2 mb-2"><Star className="h-4 w-4 text-purple-500" /><span className="text-xs font-semibold text-neutral-500">Score</span></div><div className="flex items-center gap-2"><div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(gd.attendance_rate / 20) ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-700'}`} />)}</div><span className="text-sm font-bold text-neutral-900 dark:text-white">{(gd.attendance_rate / 20).toFixed(1)}</span></div></motion.div>
          </div>

          {/* Attendance Timeline */}
          <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg"><Calendar className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Timeline Kehadiran</h3><p className="text-sm text-neutral-500">{tlR.length} dari {ar.length} data ditampilkan</p></div></div>
              <div className="flex flex-wrap gap-1.5">
                {[{ s: 'all', l: 'Semua', c: ar.length }, { s: 'present', l: 'Hadir', c: sb.present }, { s: 'late', l: 'Telat', c: sb.late }, { s: 'permit', l: 'Izin', c: sb.permit }, { s: 'absent', l: 'Absen', c: sb.absent }].map(f => <motion.button key={f.s} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTf(f.s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${tf === f.s ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>{f.l} <span className="ml-1 opacity-70">{f.c}</span></motion.button>)}
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30" />
              <div className="space-y-3">
                {tlR.map((r, i) => {
                  const SI = sIcon(r.status); return (
                    <motion.div key={r.id || i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4), type: 'spring', stiffness: 200 }} className="relative flex gap-4 pl-1">
                      <div className="relative z-10 mt-2 flex flex-col items-center">
                        <motion.div whileHover={{ scale: 1.3 }} className={`h-9 w-9 rounded-full ${tlDot(r.status)} ring-4 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-lg cursor-pointer`}><SI className="h-4 w-4 text-white" /></motion.div>
                        {i < tlR.length - 1 && <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800 mt-1" />}
                      </div>
                      <motion.div whileHover={{ scale: 1.01, y: -2 }} className="flex-1 rounded-2xl border border-neutral-200/60 bg-white/90 dark:border-neutral-700/60 dark:bg-neutral-800/90 p-4 shadow-sm backdrop-blur-sm cursor-pointer mb-1 group" onClick={() => oD(r)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-[10px] font-bold text-neutral-600 dark:text-neutral-300"><Hash className="h-2.5 w-2.5" />{r.meeting_number}</span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">{r.session_title}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${sC(r.status)}`}>{sL(r.status)}</span>
                          </div>
                          <div className="text-right flex-shrink-0"><span className="text-xs text-neutral-400">{r.session_date}</span><div className="flex items-center gap-1 mt-0.5 justify-end"><span className={`text-sm font-bold ${r.points >= 100 ? 'text-emerald-600' : r.points >= 75 ? 'text-amber-600' : r.points >= 50 ? 'text-blue-600' : 'text-red-600'}`}>{r.points}</span><span className="text-[9px] text-neutral-400">poin</span></div></div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500">
                          {r.check_in_time && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/50"><Clock className="h-3 w-3 text-blue-500" />{r.check_in_time}</span>}
                          {r.selfie_photo && <motion.button whileHover={{ scale: 1.05 }} onClick={(e) => { e.stopPropagation(); setSelfieM(r.selfie_photo!); }} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"><Camera className="h-3 w-3" />Foto</motion.button>}
                          {r.check_in_location && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-900/50"><MapPin className="h-3 w-3 text-rose-500" />Lokasi</span>}
                          {r.edited_by && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600"><Edit3 className="h-3 w-3" />Diedit</span>}
                        </div>
                        {r.notes && <p className="mt-2 text-xs text-neutral-400 italic bg-neutral-50 dark:bg-neutral-900/50 rounded-lg px-3 py-1.5 border-l-2 border-indigo-300">"{r.notes}"</p>}
                      </motion.div>
                    </motion.div>);
                })}
                {tlR.length === 0 && <div className="text-center py-16 text-neutral-400"><Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-bold text-neutral-500 mb-1">Tidak ada data</p><p className="text-sm">Coba ubah filter di atas</p></div>}
              </div>
            </div>
          </div>

          {/* Grade Calculation Breakdown */}
          <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3 mb-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg"><Calculator className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Rincian Perhitungan Nilai</h3><p className="text-sm text-neutral-500">Formula: (Total Poin / Max Poin) x 100</p></div></div>
            <div className="grid md:grid-cols-3 gap-4">
              <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-5 space-y-3 border border-neutral-200/50 dark:border-neutral-700/50">
                <div className="flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-xs font-bold">1</span><h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Poin Terkumpul</h4></div>
                <div className="space-y-2 text-sm">
                  {[{ l: 'Hadir', c: 'text-emerald-600', v: `${sb.present} x 100`, r: pb.present_points }, { l: 'Telat', c: 'text-amber-600', v: `${sb.late} x 75`, r: pb.late_points }, { l: 'Izin/Sakit', c: 'text-blue-600', v: `${sb.permit + sb.sick} x 50`, r: pb.permit_points }, { l: 'Absen', c: 'text-red-600', v: `${sb.absent + sb.rejected} x 0`, r: 0 }].map(p => <div key={p.l} className="flex justify-between items-center"><span className={`${p.c} text-xs`}>{p.l}: {p.v}</span><span className="font-bold text-xs">{p.r}</span></div>)}
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 flex justify-between font-bold"><span className="text-xs">Total</span><span className="text-indigo-600">{pb.total_points}</span></div>
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-5 space-y-3 border border-neutral-200/50 dark:border-neutral-700/50">
                <div className="flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-bold">2</span><h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Persentase</h4></div>
                <div className="text-center py-3"><p className="text-xs text-neutral-500 mb-2">{pb.total_points} / {pb.max_possible_points} x 100</p><p className="text-4xl font-bold text-indigo-600">{gd.attendance_rate}%</p></div>
                <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${gd.attendance_rate}%` }} transition={{ duration: 1.2, delay: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" /></div>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-5 space-y-3 border border-neutral-200/50 dark:border-neutral-700/50">
                <div className="flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold">3</span><h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Hasil Akhir</h4></div>
                <div className="text-center py-2"><div className={`inline-flex h-16 w-16 rounded-2xl ${gCol(gd.grade_letter)} items-center justify-center text-3xl font-bold text-white shadow-xl mx-auto`}>{gd.grade_letter}</div></div>
                <div className={`rounded-xl p-3 text-center ${gd.can_take_uas ? 'bg-emerald-100/50 dark:bg-emerald-900/20' : 'bg-red-100/50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center justify-center gap-1.5">{gd.can_take_uas ? <><CheckCircle className="h-4 w-4 text-emerald-600" /><span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Eligible UAS</span></> : <><AlertTriangle className="h-4 w-4 text-red-600" /><span className="text-xs font-bold text-red-700 dark:text-red-400">Kurang {gd.sessions_needed_for_uas} sesi</span></>}</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Performance Alert */}
          {gd.attendance_rate < 75 && <motion.div variants={iV} className="rounded-3xl border border-red-200/50 dark:border-red-800/30 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 dark:from-red-900/10 dark:via-rose-900/10 dark:to-red-900/10 p-5 shadow-lg">
            <div className="flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" /><div><h3 className="text-base font-bold text-red-800 dark:text-red-300">Mahasiswa Berisiko — Kehadiran {gd.attendance_rate}%</h3><p className="text-sm text-red-600 dark:text-red-400 mt-0.5">Butuh minimal {gd.sessions_needed_for_uas} sesi lagi untuk eligible UAS (target 75%)</p></div></div>
          </motion.div>}
          {gd.attendance_rate >= 85 && <motion.div variants={iV} className="rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-emerald-900/10 p-5 shadow-lg">
            <div className="flex items-center gap-3"><Sparkles className="h-8 w-8 text-emerald-500 flex-shrink-0" /><div><h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">Performa Excellent — Top {gd.percentile}% di kelas</h3><p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">Kehadiran konsisten dengan streak {streak.max} sesi berturut-turut</p></div></div>
          </motion.div>}
        </div>}

        {/* ═══ STATISTICS TAB (ULTRA DASHBOARD) ═══ */}
        {tab === 'stats' && <div className="space-y-6 animate-in fade-in zoom-in duration-500">

          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 group hover:border-indigo-500/40 transition-all">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-all" />
              <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400"><Activity className="h-4 w-4" /></div><span className="text-xs font-bold text-indigo-300">Rata-rata Poin</span></div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{gd.average_points}</p>
              <p className="text-xs text-neutral-500 mt-1 dark:text-neutral-400">vs Kelas: {ca.average_points}</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 group hover:border-emerald-500/40 transition-all">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/30 transition-all" />
              <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><TrendingUp className="h-4 w-4" /></div><span className="text-xs font-bold text-emerald-300">Kehadiran</span></div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{gd.attendance_rate}%</p>
              <p className="text-xs text-neutral-500 mt-1 dark:text-neutral-400">Target: 75%</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 group hover:border-amber-500/40 transition-all">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-amber-500/20 blur-3xl group-hover:bg-amber-500/30 transition-all" />
              <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><Trophy className="h-4 w-4" /></div><span className="text-xs font-bold text-amber-300">Peringkat</span></div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">#{gd.rank_in_class}</p>
              <p className="text-xs text-neutral-500 mt-1 dark:text-neutral-400">Top {gd.percentile}%</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 p-5 group hover:border-pink-500/40 transition-all">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-pink-500/20 blur-3xl group-hover:bg-pink-500/30 transition-all" />
              <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-pink-500/20 text-pink-400"><Zap className="h-4 w-4" /></div><span className="text-xs font-bold text-pink-300">Streak</span></div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{streak.current} <span className="text-base font-normal opacity-50">Sesi</span></p>
              <p className="text-xs text-neutral-500 mt-1 dark:text-neutral-400">Max: {streak.max}</p>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 1. Trend Chart (Big - 2 cols) */}
            <div className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg dark:border-neutral-800 p-6 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Activity className="h-4 w-4" /></div><h3 className="font-bold text-neutral-900 dark:text-white">Tren Performa</h3></div>
                <div className="flex gap-2 text-xs"><span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400"><span className="h-2 w-2 rounded-full bg-indigo-500" />Mahasiswa</span><span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400"><span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />Kelas</span></div>
              </div>
              <div className="flex-1 w-full min-h-0 relative">
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ld} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="gPoinMega" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.1} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} stroke="#374151" tickLine={false} axisLine={false} dy={10} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} stroke="#374151" tickLine={false} axisLine={false} domain={[0, 100]} />
                      <RTooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#a3a3a3' }} cursor={{ stroke: '#6366f1', strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="avg" stroke="#525252" strokeWidth={2} fill="none" strokeDasharray="5 5" animationDuration={1000} />
                      <Area type="monotone" dataKey="poin" stroke="#818cf8" strokeWidth={3} fill="url(#gPoinMega)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 2. Radar Chart (1 col) */}
            <div className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg dark:border-neutral-800 p-6 flex flex-col h-[400px]">
              <div className="flex items-center gap-3 mb-2"><div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400"><Award className="h-4 w-4" /></div><h3 className="font-bold text-neutral-900 dark:text-white">Analisis Dimensi</h3></div>
              <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#374151" strokeOpacity={0.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Mahasiswa" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
                      <Radar name="Rata-rata" dataKey="B" stroke="#525252" fill="#525252" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 4" />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <RTooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3. Distribution Pie (1 col) */}
            <div className="rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg dark:border-neutral-800 p-6 flex flex-col h-[350px]">
              <div className="flex items-center gap-3 mb-4"><div className="h-8 w-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400"><Target className="h-4 w-4" /></div><h3 className="font-bold text-neutral-900 dark:text-white">Komposisi Status</h3></div>
              <div className="flex-1 flex gap-4">
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={pd} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"><Cell key="present" fill="#10b981" /><Cell key="late" fill="#f59e0b" /><Cell key="permit" fill="#3b82f6" /><Cell key="absent" fill="#ef4444" /><Cell key="sick" fill="#06b6d4" /><Cell key="rejected" fill="#f43f5e" /></Pie><RTooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', color: '#fff' }} /></PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none"><span className="text-3xl font-bold text-neutral-900 dark:text-white">{ar.length}</span><span className="text-[10px] text-neutral-500 uppercase tracking-widest">Total</span></div>
                </div>
                <div className="w-32 flex flex-col justify-center gap-2 overflow-y-auto pr-1 custom-scrollbar">
                  {pd.map(d => <div key={d.name} className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-neutral-500 dark:text-neutral-400 flex-1">{d.name}</span><span className="font-bold text-neutral-900 dark:text-white">{d.value}</span></div>)}
                </div>
              </div>
            </div>

            {/* 4. Comparison Bar (2 cols) */}
            <div className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl shadow-lg dark:border-neutral-800 p-6 flex flex-col h-[350px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400"><Users className="h-4 w-4" /></div><h3 className="font-bold text-neutral-900 dark:text-white">Komparasi Metrik Utama</h3></div>
              </div>
              <div className="flex-1 w-full min-h-0 relative">
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bd} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: '#a3a3a3' }} stroke="none" width={70} />
                      <RTooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="mhs" name="Mahasiswa" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}><LabelList position="right" fill="#fff" fontSize={11} /></Bar>
                      <Bar dataKey="kls" name="Rata-rata Kelas" fill="#525252" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}><LabelList position="right" fill="#a3a3a3" fontSize={11} /></Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </div>}

        {/* ═══ RIWAYAT TAB ═══ */}
        {tab === 'riwayat' && <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Status Summary Mini Cards */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[{ l: 'Hadir', v: sb.present, c: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' }, { l: 'Telat', v: sb.late, c: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' }, { l: 'Izin', v: sb.permit, c: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' }, { l: 'Sakit', v: sb.sick, c: 'bg-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/10' }, { l: 'Absen', v: sb.absent, c: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/10' }, { l: 'Ditolak', v: sb.rejected, c: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' }].map(s =>
              <motion.div key={s.l} whileHover={{ scale: 1.05, y: -2 }} className={`rounded-2xl ${s.bg} border border-white/20 dark:border-neutral-800 p-3 text-center cursor-pointer transition-all`}>
                <div className={`h-2 w-2 rounded-full ${s.c} mx-auto mb-1.5`} /><p className="text-xs text-neutral-500 font-medium">{s.l}</p><p className="text-xl font-bold text-neutral-900 dark:text-white">{s.v}</p>
              </motion.div>)}
          </div>

          {/* Table Container */}
          <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg"><FileText className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Riwayat Kehadiran Lengkap</h3><p className="text-sm text-neutral-500">{filt.length} dari {ar.length} data</p></div></div>
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[180px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" /><input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari pertemuan..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                <select value={fs} onChange={e => setFs(e.target.value)} className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"><option value="all">Semua</option><option value="present">Hadir</option><option value="late">Telat</option><option value="permit">Izin</option><option value="sick">Sakit</option><option value="absent">Absen</option><option value="rejected">Ditolak</option></select>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSo(so === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"><ArrowUpDown className="h-3.5 w-3.5" />{so === 'asc' ? 'Terlama' : 'Terbaru'}</motion.button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
              <table className="w-full">
                <thead><tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black"><th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">No</th><th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Pertemuan</th><th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Tanggal</th><th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Status</th><th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Check-in</th><th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Poin</th><th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Aksi</th></tr></thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                  {paged.length === 0 && <tr><td colSpan={7} className="px-4 py-16 text-center"><Search className="h-12 w-12 mx-auto mb-3 text-neutral-200 dark:text-neutral-700" /><p className="text-neutral-500 font-bold mb-1">Tidak ditemukan</p><p className="text-sm text-neutral-400">Coba ubah filter atau kata kunci</p></td></tr>}
                  {paged.map((r, i) => <motion.tr key={r.id || r.meeting_number} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.04] transition-colors group">
                    <td className="px-4 py-3.5"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400">{r.meeting_number}</span></td>
                    <td className="px-4 py-3.5"><p className="text-sm font-bold text-neutral-900 dark:text-white">{r.session_title}</p>{r.edited_by && <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><Edit3 className="h-2.5 w-2.5" />Diedit</span>}</td>
                    <td className="px-4 py-3.5"><p className="text-sm text-neutral-500">{r.session_date}</p><p className="text-[10px] text-neutral-400">{r.session_time}</p></td>
                    <td className="px-4 py-3.5 text-center"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${sC(r.status)}`}>{sL(r.status)}</span></td>
                    <td className="px-4 py-3.5 text-center text-sm text-neutral-500">{r.check_in_time || <span className="text-neutral-300">-</span>}</td>
                    <td className="px-4 py-3.5 text-center"><span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold ${r.points >= 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.points >= 75 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : r.points >= 50 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{r.points}</span></td>
                    <td className="px-4 py-3.5 text-center"><div className="flex justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity"><motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => oD(r)} className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30" title="Detail"><Eye className="h-4 w-4 text-indigo-500" /></motion.button><motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => oE(r)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30" title="Edit"><Edit3 className="h-4 w-4 text-amber-500" /></motion.button></div></td>
                  </motion.tr>)}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && <div className="flex items-center justify-between mt-4"><p className="text-sm text-neutral-500">Hal {page} dari {totalPages} | {filt.length} data</p><div className="flex gap-1"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></motion.button>{Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${page === i + 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>{i + 1}</button>)}<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></motion.button></div></div>}
          </div>
        </div>}

        {/* ═══ CATATAN TAB ═══ */}
        {tab === 'catatan' && <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl text-center"><p className="text-xs text-neutral-500 mb-1">Total Catatan</p><p className="text-3xl font-bold text-neutral-900 dark:text-white">{dn.length}</p></motion.div>
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl text-center"><p className="text-xs text-neutral-500 mb-1">Penting</p><p className="text-3xl font-bold text-red-600">{dn.filter(n => n.is_important).length}</p></motion.div>
            <motion.div variants={iV} className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 p-4 backdrop-blur-xl text-center"><p className="text-xs text-neutral-500 mb-1">Biasa</p><p className="text-3xl font-bold text-indigo-600">{dn.filter(n => !n.is_important).length}</p></motion.div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-lg"><MessageSquare className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Catatan Dosen</h3><p className="text-sm text-neutral-500">Catatan evaluasi dan feedback</p></div></div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setNM(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"><Plus className="h-4 w-4" /> Catatan Baru</motion.button>
            </div>

            {dn.length === 0 ? <div className="text-center py-16"><MessageSquare className="h-16 w-16 mx-auto mb-4 text-neutral-200 dark:text-neutral-700" /><p className="text-neutral-500 font-bold mt-2 text-lg">Belum ada catatan</p><p className="text-sm text-neutral-400 mt-1 mb-4">Tambahkan catatan evaluasi atau feedback untuk mahasiswa ini</p><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setNM(true)} className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"><Plus className="h-4 w-4" /> Buat Catatan Pertama</motion.button></div> :
              <div className="space-y-4">
                {dn.filter(n => n.is_important).length > 0 && <div className="mb-2"><p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" />Catatan Penting</p>
                  {dn.filter(n => n.is_important).map((n, i) => <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border-2 border-red-200/50 dark:border-red-800/30 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/10 dark:to-rose-900/10 p-5 group mb-3">
                    <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2.5"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600"><AlertTriangle className="h-4 w-4" /></span><div><h4 className="text-sm font-bold text-neutral-900 dark:text-white">{n.title || 'Catatan Penting'}</h4><p className="text-[10px] text-neutral-400">{n.created_by} | {n.created_at}</p></div></div>
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => delN(n.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"><Trash2 className="h-4 w-4 text-red-500" /></motion.button></div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  </motion.div>)}</div>}
                {dn.filter(n => !n.is_important).length > 0 && <div>{dn.filter(n => n.is_important).length > 0 && <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" />Catatan Lainnya</p>}
                  {dn.filter(n => !n.is_important).map((n, i) => <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 bg-white/90 dark:bg-neutral-800/90 p-5 group mb-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2.5"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"><MessageSquare className="h-4 w-4" /></span><div><h4 className="text-sm font-bold text-neutral-900 dark:text-white">{n.title || 'Catatan'}</h4><p className="text-[10px] text-neutral-400">{n.created_by} | {n.created_at}</p></div></div>
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => delN(n.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"><Trash2 className="h-4 w-4 text-red-500" /></motion.button></div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  </motion.div>)}</div>}
              </div>}
          </div>
        </div>}

        {/* ═══ PERBANDINGAN TAB ═══ */}
        {tab === 'perbandingan' && <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Hero Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={iV} className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <p className="text-xs text-indigo-100 flex items-center gap-1.5"><Trophy className="h-3 w-3" />Peringkat di Kelas</p>
              <p className="text-5xl font-bold mt-2">#{gd.rank_in_class}</p>
              <p className="text-sm text-indigo-200 mt-1">dari {gd.total_students} mahasiswa</p>
              <div className="mt-3 h-2.5 bg-white/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${gd.percentile}%` }} transition={{ duration: 1.2 }} className="h-full bg-white/80 rounded-full" /></div>
              <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1">Top {gd.percentile}% {gd.percentile <= 25 && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}</p>
            </motion.div>
            <motion.div variants={iV} className={`rounded-2xl p-5 shadow-xl relative overflow-hidden ${diff >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'}`}>
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <p className="text-xs opacity-80 flex items-center gap-1.5">{diff >= 0 ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />}vs Rata-rata Kelas</p>
              <p className="text-5xl font-bold mt-2">{diff >= 0 ? '+' : ''}{diff.toFixed(1)}%</p>
              <p className="text-sm opacity-80 mt-1">{diff >= 0 ? 'Di atas rata-rata' : 'Di bawah rata-rata'}</p>
              <div className="flex gap-3 mt-3"><div><p className="text-[10px] opacity-60">Mahasiswa</p><p className="text-lg font-bold">{gd.attendance_rate}%</p></div><div><p className="text-[10px] opacity-60">Kelas</p><p className="text-lg font-bold">{ca.average_attendance_rate}%</p></div></div>
            </motion.div>
            <motion.div variants={iV} className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 p-5 shadow-xl">
              <p className="text-xs text-neutral-500 flex items-center gap-1.5"><Award className="h-3 w-3" />UAS Status</p>
              <div className="flex items-center gap-3 mt-3">{gd.can_take_uas ? <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl"><CheckCircle className="h-7 w-7 text-white" /></div> : <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-xl"><XCircle className="h-7 w-7 text-white" /></div>}<div><p className={`text-xl font-bold ${gd.can_take_uas ? 'text-emerald-600' : 'text-red-600'}`}>{gd.can_take_uas ? 'Eligible' : 'Belum Eligible'}</p><p className="text-xs text-neutral-500 mt-0.5">{gd.can_take_uas ? 'Syarat kehadiran terpenuhi' : `Kurang ${gd.sessions_needed_for_uas} sesi`}</p></div></div>
              <div className="mt-3"><p className="text-[10px] text-neutral-400 mb-1">Grade Dominan Kelas</p><span className={`inline-flex px-3 py-1.5 rounded-xl text-white text-lg font-bold ${gCol(ca.mode_grade)}`}>{ca.mode_grade}</span></div>
            </motion.div>
          </div>

          {/* Detailed Comparison */}
          <div className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center gap-3 mb-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-lg"><Users className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Perbandingan Detail</h3><p className="text-sm text-neutral-500">Analisis komparatif mahasiswa vs rata-rata kelas</p></div></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-5">
                {[{ l: 'Tingkat Kehadiran', v1: gd.attendance_rate, v2: ca.average_attendance_rate, u: '%', g1: 'from-indigo-500 to-purple-500' }, { l: 'Rata-rata Poin', v1: gd.average_points, v2: ca.average_points, u: '', g1: 'from-amber-500 to-orange-500' }].map(m => {
                  const d = m.v1 - m.v2; return (
                    <motion.div key={m.l} whileHover={{ y: -2 }} className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 p-5 border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{m.l}</span><span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${d >= 0 ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'}`}>{d >= 0 ? '+' : ''}{d.toFixed(1)}{m.u}</span></div>
                      <div className="space-y-3">
                        <div><div className="flex justify-between text-xs mb-1"><span className="font-medium text-indigo-600 dark:text-indigo-400">Mahasiswa</span><span className="font-bold text-neutral-900 dark:text-white">{m.v1}{m.u}</span></div><div className="w-full h-3.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(m.v1, 100)}%` }} transition={{ duration: 1 }} className={`h-full rounded-full bg-gradient-to-r ${m.g1}`} /></div></div>
                        <div><div className="flex justify-between text-xs mb-1"><span className="text-neutral-400">Rata-rata Kelas</span><span className="font-bold text-neutral-500">{m.v2}{m.u}</span></div><div className="w-full h-3.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(m.v2, 100)}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full bg-neutral-300 dark:bg-neutral-600" /></div></div>
                      </div>
                    </motion.div>);
                })}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-500" />Multi-Dimensi</h4>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#e5e7eb" />
                      <Radar name="Mahasiswa" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2.5} />
                      <Radar name="Kelas" dataKey="B" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                      <Legend iconType="circle" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* ═══ MODALS ═══ */}

        {/* Detail Modal */}
        <ModalW show={dM} onClose={() => setDM(false)} title="Detail Kehadiran" maxW="max-w-xl">
          {sel && <div className="space-y-4">
            <div className="flex items-center gap-3"><div className={`h-12 w-12 rounded-xl ${tlDot(sel.status)} flex items-center justify-center text-white font-bold shadow-lg`}>{sel.meeting_number}</div><div><h4 className="font-bold text-neutral-900 dark:text-white">{sel.session_title}</h4><p className="text-sm text-neutral-500">{sel.session_date} | {sel.session_time}</p></div></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"><p className="text-xs text-neutral-500">Status</p><span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${sC(sel.status)}`}>{sL(sel.status)}</span></div>
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"><p className="text-xs text-neutral-500">Poin</p><p className="text-lg font-bold">{sel.points}</p></div>
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"><p className="text-xs text-neutral-500">Check-in</p><p className="text-sm font-medium">{sel.check_in_time || '-'}</p></div>
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"><p className="text-xs text-neutral-500">Device</p><p className="text-sm font-medium truncate">{sel.device_info || '-'}</p></div>
            </div>
            {sel.check_in_location && <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"><p className="text-xs text-neutral-500 mb-1">Lokasi</p><p className="text-sm">{sel.check_in_location.address || `${sel.check_in_location.latitude}, ${sel.check_in_location.longitude}`}</p></div>}
            {sel.selfie_photo && <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700"><img src={sel.selfie_photo} alt="Selfie" className="w-full h-48 object-cover" /></div>}
            {sel.edited_by && <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3"><p className="text-xs text-amber-600 font-bold mb-1"><Edit3 className="h-3 w-3 inline mr-1" />Diedit oleh {sel.edited_by}</p><p className="text-sm text-amber-800 dark:text-amber-300">{sel.edit_reason}</p></div>}
            {sel.notes && <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3"><p className="text-xs text-blue-600 font-bold mb-1">Catatan</p><p className="text-sm">{sel.notes}</p></div>}
            <div className="flex gap-2 pt-2"><Button onClick={() => { setDM(false); oE(sel); }} variant="outline" className="flex-1 rounded-xl"><Edit3 className="h-4 w-4 mr-2" />Edit</Button><Button onClick={() => setDM(false)} className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Tutup</Button></div>
          </div>}
        </ModalW>

        {/* Edit Status Modal */}
        <ModalW show={eM} onClose={() => setEM(false)} title="Edit Status Kehadiran" maxW="max-w-md">
          {sel && <div className="space-y-4">
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3"><p className="text-xs text-neutral-500">Pertemuan {sel.meeting_number}: {sel.session_title}</p><p className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Status saat ini: <span className={`px-2 py-0.5 rounded-lg text-xs ${sC(sel.status)}`}>{sL(sel.status)}</span></p></div>
            <div><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Status Baru</label><select value={ef.data.status} onChange={e => ef.setData('status', e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"><option value="">Pilih status...</option><option value="present">Hadir</option><option value="late">Terlambat</option><option value="permit">Izin</option><option value="sick">Sakit</option><option value="absent">Absen</option><option value="rejected">Ditolak</option></select>{ef.errors.status && <p className="text-xs text-red-500 mt-1">{ef.errors.status}</p>}</div>
            <div><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Alasan Perubahan</label><Textarea value={ef.data.reason} onChange={e => ef.setData('reason', e.target.value)} placeholder="Jelaskan alasan perubahan (min 10 karakter)..." className="mt-1 rounded-xl" rows={3} />{ef.errors.reason && <p className="text-xs text-red-500 mt-1">{ef.errors.reason}</p>}</div>
            <div className="flex gap-2 pt-2"><Button onClick={() => setEM(false)} variant="outline" className="flex-1 rounded-xl">Batal</Button><Button onClick={sS} disabled={ef.processing || !ef.data.status || ef.data.reason.length < 10} className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">{ef.processing ? 'Menyimpan...' : 'Simpan'}</Button></div>
          </div>}
        </ModalW>

        {/* Add Note Modal */}
        <ModalW show={nM} onClose={() => setNM(false)} title="Tambah Catatan" maxW="max-w-md">
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Judul</label><Input value={nf.data.title} onChange={e => nf.setData('title', e.target.value)} placeholder="Judul catatan..." className="mt-1 rounded-xl" /></div>
            <div><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Isi Catatan</label><Textarea value={nf.data.content} onChange={e => nf.setData('content', e.target.value)} placeholder="Tulis catatan evaluasi atau feedback..." className="mt-1 rounded-xl" rows={4} />{nf.errors.content && <p className="text-xs text-red-500 mt-1">{nf.errors.content}</p>}</div>
            <div className="flex gap-2 pt-2"><Button onClick={() => setNM(false)} variant="outline" className="flex-1 rounded-xl">Batal</Button><Button onClick={addN} disabled={nf.processing || !nf.data.content.trim()} className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">{nf.processing ? 'Menyimpan...' : 'Simpan'}</Button></div>
          </div>
        </ModalW>

        {/* Export Modal */}
        <ModalW show={exM} onClose={() => setExM(false)} title="Export Laporan" maxW="max-w-sm">
          <div className="space-y-3">
            <p className="text-sm text-neutral-500 mb-4">Pilih format export laporan mahasiswa ini.</p>
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => { window.open(`/dosen/grading/detail/${student.id}/export?format=pdf`, '_blank'); setExM(false); }} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:shadow-md"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white"><FileText className="h-5 w-5" /></div><div className="text-left"><p className="font-bold text-sm text-neutral-900 dark:text-white">PDF Report</p><p className="text-xs text-neutral-500">Laporan lengkap format PDF</p></div></motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => { window.open(`/dosen/grading/detail/${student.id}/export?format=excel`, '_blank'); setExM(false); }} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:shadow-md"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white"><Download className="h-5 w-5" /></div><div className="text-left"><p className="font-bold text-sm text-neutral-900 dark:text-white">Excel Spreadsheet</p><p className="text-xs text-neutral-500">Data kehadiran format XLSX</p></div></motion.button>
          </div>
        </ModalW>

        {/* Selfie Modal */}
        <AnimatePresence>{selfieM && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelfieM(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="max-w-lg w-full relative" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <img src={selfieM} alt="Selfie" className="w-full rounded-2xl shadow-2xl" />
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelfieM(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"><X className="h-5 w-5" /></motion.button>
          </motion.div>
        </motion.div>}</AnimatePresence>

      </motion.div>
    </DosenLayout>
  );
}
