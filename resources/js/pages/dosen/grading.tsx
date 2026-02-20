import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, TrendingUp, AlertTriangle, Search, Download, FileText, ChevronRight, CheckCircle, XCircle, BarChart3, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface StudentGrade {
  mahasiswa_id: number; nama: string; nim: string; total_sessions: number; attended_sessions: number;
  attendance_rate: number; average_points: number; attendance_grade: number;
  grade_letter: string; can_take_uas: boolean; sessions_needed_for_uas: number;
  rank_in_class: number; total_students: number; percentile: number;
  status_breakdown: { present: number; late: number; permit: number; sick: number; absent: number; rejected: number };
}
interface GradesSummary { total_students: number; total_sessions: number; grade_distribution: { A: number; B: number; C: number; D: number; E: number }; average_attendance_rate: number; students_at_risk: number; }
interface GradesData { course: { id: number; nama: string; sks: number }; summary: GradesSummary; grades: StudentGrade[]; }
interface Session { id: number; meeting_number: number; title: string; date: string; }
interface Props {
  dosen: { id: number; nama: string };
  course: { id: number; nama: string; kode: string; sks: number } | null;
  sessions: Session[];
  grades: GradesData | null;
}

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;
const cardV = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }, hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } } } as const;
const gCol = (l: string): string => ({ A: 'text-emerald-600', B: 'text-blue-600', C: 'text-amber-600', D: 'text-orange-600', E: 'text-red-600' } as Record<string, string>)[l] || 'text-neutral-600';
const gBg = (l: string): string => ({ A: 'bg-emerald-100 dark:bg-emerald-900/30', B: 'bg-blue-100 dark:bg-blue-900/30', C: 'bg-amber-100 dark:bg-amber-900/30', D: 'bg-orange-100 dark:bg-orange-900/30', E: 'bg-red-100 dark:bg-red-900/30' } as Record<string, string>)[l] || 'bg-neutral-100';

export default function Grading({ dosen, course, sessions, grades }: Props) {
  const [q, setQ] = useState('');
  const [gf, setGf] = useState('all');
  const [sf, setSf] = useState<'rate-desc' | 'rate-asc' | 'name' | 'points'>('rate-desc');
  const [hCard, setHCard] = useState<string | null>(null);

  const sm = grades?.summary;
  const gr = grades?.grades || [];

  const filtered = useMemo(() => {
    let r = [...gr];
    if (q) r = r.filter(s => s.nama.toLowerCase().includes(q.toLowerCase()) || s.nim.includes(q));
    if (gf !== 'all') r = r.filter(s => gf === 'at-risk' ? !s.can_take_uas : s.grade_letter === gf);
    if (sf === 'rate-desc') r.sort((a, b) => b.attendance_rate - a.attendance_rate);
    else if (sf === 'rate-asc') r.sort((a, b) => a.attendance_rate - b.attendance_rate);
    else if (sf === 'name') r.sort((a, b) => a.nama.localeCompare(b.nama));
    else if (sf === 'points') r.sort((a, b) => b.average_points - a.average_points);
    return r;
  }, [gr, q, gf, sf]);

  if (!course) { return (<DosenLayout dosen={dosen}><Head title="Grading" /><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><BookOpen className="h-16 w-16 mx-auto mb-4 text-neutral-300" /><h2 className="text-xl font-bold text-neutral-900 dark:text-white">Belum Ada Mata Kuliah</h2><p className="text-neutral-500 mt-2">Anda belum ditugaskan ke mata kuliah manapun.</p></div></div></DosenLayout>); }

  const cards = [
    { k: 'mhs', l: 'Total Mahasiswa', v: sm?.total_students || 0, s: 'Terdaftar di kelas', I: Users, f: 'from-blue-400', t: 'to-cyan-600', sh: 'shadow-blue-500/30', glow: 'bg-blue-500' },
    { k: 'sesi', l: 'Total Sesi', v: sm?.total_sessions || 0, s: 'Pertemuan terlaksana', I: BookOpen, f: 'from-violet-400', t: 'to-purple-600', sh: 'shadow-violet-500/30', glow: 'bg-violet-500' },
    { k: 'avg', l: 'Rata-rata Kehadiran', v: (sm?.average_attendance_rate || 0) + '%', s: 'Seluruh mahasiswa', I: TrendingUp, f: 'from-emerald-400', t: 'to-teal-600', sh: 'shadow-emerald-500/30', glow: 'bg-emerald-500' },
    { k: 'risk', l: 'Mahasiswa Berisiko', v: sm?.students_at_risk || 0, s: 'Tidak eligible UAS', I: AlertTriangle, f: 'from-red-400', t: 'to-rose-600', sh: 'shadow-red-500/30', glow: 'bg-red-500' },
  ];

  return (
    <DosenLayout dosen={dosen}><Head title="Grading" />
      <motion.div initial="hidden" animate="visible" variants={cV} className="p-4 md:p-6 space-y-6">

        {/* ═══ HEADER ═══ */}
        <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl">
          <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          {[0, 1, 2].map(i => <motion.div key={i} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i }} />)}
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"><Award className="h-8 w-8 text-white" /></motion.div>
                <div>
                  <p className="text-sm text-indigo-100 font-medium tracking-wide">Penilaian Kehadiran</p>
                  <h1 className="text-3xl font-bold text-white">{course.nama}</h1>
                  <p className="mt-1 text-indigo-100">{course.kode} • {course.sks} SKS</p>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                <div className="p-2 bg-indigo-500/20 rounded-lg"><Trophy className="h-6 w-6 text-white" /></div>
                <div><p className="text-xs text-indigo-100">Rata-rata Kelas</p><p className="text-2xl font-bold text-white">{sm?.average_attendance_rate || 0}%</p></div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
              <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => window.open('/dosen/grading/export', '_blank')} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg"><Download className="h-4 w-4" />Export CSV</motion.button>
              <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => window.open('/dosen/grading/export-pdf', '_blank')} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg"><FileText className="h-4 w-4" />Export PDF</motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══ SUMMARY CARDS ═══ */}
        <motion.div variants={cV} className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {cards.map(c => <motion.div key={c.k} variants={cardV} whileHover="hover" onHoverStart={() => setHCard(c.k)} onHoverEnd={() => setHCard(null)} className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
            <motion.div animate={{ scale: hCard === c.k ? 1.5 : 1, opacity: hCard === c.k ? 0.4 : 0.2 }} className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${c.glow} blur-3xl transition-all duration-500`} />
            <div className="relative flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.f} ${c.t} text-white shadow-lg ${c.sh}`}><c.I className="h-6 w-6" /></motion.div>
              <div><p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.l}</p><p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{c.v}</p><p className="text-[10px] text-neutral-400 dark:text-neutral-500">{c.s}</p></div>
            </div>
          </motion.div>)}
        </motion.div>

        {/* ═══ GRADE DISTRIBUTION ═══ */}
        {sm && (() => {
          const GRADE_COLORS: Record<string, string> = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', E: '#ef4444' };
          const distData = (['A', 'B', 'C', 'D', 'E'] as const).map(g => ({ grade: g, jumlah: (sm.grade_distribution as Record<string, number>)[g] || 0, fill: GRADE_COLORS[g] }));
          const pieData = distData.filter(d => d.jumlah > 0);
          return (
            <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex items-center gap-3 mb-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg"><BarChart3 className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Distribusi Nilai</h3><p className="text-sm text-neutral-500">{sm.total_students} mahasiswa terdaftar</p></div></div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Jumlah per Grade</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={distData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="grade" tick={{ fontSize: 13, fontWeight: 700 }} stroke="#9ca3af" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.95)' }} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                      <Bar dataKey="jumlah" name="Mahasiswa" radius={[8, 8, 0, 0]} animationDuration={1200}>
                        {distData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Pie Chart */}
                <div>
                  <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Persentase</h4>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={pieData} dataKey="jumlah" nameKey="grade" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#9ca3af' }} animationDuration={1200}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                        <Legend iconType="circle" formatter={(v: string) => <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (<div className="flex items-center justify-center h-[280px] text-neutral-400"><p>Belum ada data</p></div>)}
                </div>
              </div>
              {/* Summary badges */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                {distData.map(d => <div key={d.grade} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} /><span className="text-xs font-bold" style={{ color: d.fill }}>{d.grade}</span><span className="text-xs text-neutral-500">{d.jumlah} mhs ({sm.total_students > 0 ? Math.round(d.jumlah / sm.total_students * 100) : 0}%)</span></div>)}
              </div>
            </motion.div>);
        })()}

        {/* ═══ FILTERS & TABLE ═══ */}
        <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3 mb-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg"><Users className="h-5 w-5" /></div><div><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Daftar Mahasiswa</h3><p className="text-sm text-neutral-500">{filtered.length} dari {gr.length} mahasiswa</p></div></div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" /><input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama atau NIM..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500" /></div>
            <select value={gf} onChange={e => setGf(e.target.value)} className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"><option value="all">Semua Grade</option><option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option><option value="D">Grade D</option><option value="E">Grade E</option><option value="at-risk">⚠ Berisiko</option></select>
            <select value={sf} onChange={e => setSf(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"><option value="rate-desc">Kehadiran ↓</option><option value="rate-asc">Kehadiran ↑</option><option value="name">Nama A-Z</option><option value="points">Poin ↓</option></select>
          </div>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
            <table className="w-full">
              <thead><tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">No</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Mahasiswa</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Kehadiran</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Poin</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Grade</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Status UAS</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center"><Search className="h-10 w-10 mx-auto mb-3 text-neutral-300" /><p className="text-neutral-500 font-medium">Tidak ada mahasiswa ditemukan</p></td></tr>}
                {filtered.map((s, i) => <motion.tr key={s.nim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.5) }} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.03] transition-colors group cursor-pointer" onClick={() => router.visit('/dosen/grading/detail/' + s.mahasiswa_id)}>
                  <td className="px-4 py-3.5 text-sm font-medium text-neutral-400">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400 flex-shrink-0">{s.nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}</div>
                      <div><p className="font-bold text-sm text-neutral-900 dark:text-white">{s.nama}</p><p className="text-[10px] text-neutral-400 font-mono tracking-wide">{s.nim}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`text-sm font-bold ${s.attendance_rate >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{s.attendance_rate}%</span>
                      <span className="text-[10px] text-neutral-400">{s.attended_sessions}/{s.total_sessions}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center"><span className="text-sm font-bold text-neutral-900 dark:text-white">{s.average_points}</span></td>
                  <td className="px-4 py-3.5 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${gCol(s.grade_letter)} ${gBg(s.grade_letter)}`}>{s.grade_letter}</span></td>
                  <td className="px-4 py-3.5 text-center">{s.can_take_uas ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle className="h-3.5 w-3.5" />Eligible</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle className="h-3.5 w-3.5" />Tidak</span>}</td>
                  <td className="px-4 py-3.5 text-center"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); router.visit('/dosen/grading/detail/' + s.mahasiswa_id); }} className="p-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors" title="Lihat Detail"><ChevronRight className="h-4 w-4 text-indigo-500" /></motion.button></td>
                </motion.tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-neutral-500"><span>Menampilkan {filtered.length} mahasiswa</span><span>{sm?.total_sessions || 0} sesi terlaksana</span></div>
        </motion.div>

      </motion.div>
    </DosenLayout>
  );
}
