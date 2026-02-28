import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileText, Plus, Edit, Clock, Play, X, ArrowLeft, ArrowRight, Zap, CheckCircle, Save, Eye, Loader2, Sparkles, AlertCircle, Shield, MapPin, Camera, Bell, StopCircle, Target, ShieldAlert, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import React from 'react';
import SesiAbsenIcon from '@/assets/admin/sesi-absen/sesi-icon.png';

interface Template { id: number; name: string; description: string | null; category: string; course_id: number | null; tags: string[] | null; duration_minutes: number; qr_refresh_interval: number; allow_late_minutes: number; grace_period_minutes: number; default_days: number[] | null; require_selfie: boolean; selfie_verification_level: string; require_location: boolean; location_radius_meters: number; anti_spoofing: boolean; max_attempts: number; auto_activate: boolean; auto_activate_time: string | null; auto_deactivate: boolean; auto_deactivate_time: string | null; send_reminder: boolean; reminder_minutes_before: number; is_active: boolean; is_draft: boolean; is_favorite: boolean; course?: { id: number; nama: string; sks?: number }; }
interface Props { dosen: { id: number; nama: string }; template?: Template; courses: Array<{ id: number; nama: string; sks: number }>; mode: 'create' | 'edit'; }
interface FD { name: string; description: string; category: string; course_id: number | null; tags: string[]; duration_minutes: number; qr_refresh_interval: number; allow_late_minutes: number; grace_period_minutes: number; default_days: number[]; require_selfie: boolean; selfie_verification_level: string; require_location: boolean; location_radius_meters: number; anti_spoofing: boolean; max_attempts: number; auto_activate: boolean; auto_activate_time: string; auto_deactivate: boolean; auto_deactivate_time: string; send_reminder: boolean; reminder_minutes_before: number; is_active: boolean; is_draft: boolean; }

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const iV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } } as const;
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const CATS = [{ v: 'regular', l: 'Regular', d: 'Kuliah biasa', c: 'from-blue-400 to-cyan-600' }, { v: 'exam', l: 'Ujian', d: 'UTS/UAS', c: 'from-red-400 to-pink-600' }, { v: 'lab', l: 'Lab', d: 'Praktikum', c: 'from-purple-400 to-violet-600' }, { v: 'seminar', l: 'Seminar', d: 'Presentasi', c: 'from-emerald-400 to-teal-600' }, { v: 'custom', l: 'Custom', d: 'Lainnya', c: 'from-amber-400 to-orange-600' }];
const VERIF = [{ v: 'basic', l: 'Basic', d: 'Cek upload', icon: CheckCircle, c: 'from-blue-400 to-cyan-600' }, { v: 'strict', l: 'Strict', d: 'Validasi wajah', icon: Shield, c: 'from-amber-400 to-orange-600' }, { v: 'ai', l: 'AI', d: 'Face recognition', icon: Sparkles, c: 'from-purple-400 to-pink-600' }];

function init(t?: Template): FD { return { name: t?.name || '', description: t?.description || '', category: t?.category || 'regular', course_id: t?.course_id || null, tags: t?.tags || [], duration_minutes: t?.duration_minutes || 100, qr_refresh_interval: t?.qr_refresh_interval || 30, allow_late_minutes: t?.allow_late_minutes || 15, grace_period_minutes: t?.grace_period_minutes || 5, default_days: t?.default_days || [], require_selfie: t?.require_selfie || false, selfie_verification_level: t?.selfie_verification_level || 'basic', require_location: t?.require_location || false, location_radius_meters: t?.location_radius_meters || 100, anti_spoofing: t?.anti_spoofing || false, max_attempts: t?.max_attempts || 3, auto_activate: t?.auto_activate || false, auto_activate_time: t?.auto_activate_time || '08:00', auto_deactivate: t?.auto_deactivate || false, auto_deactivate_time: t?.auto_deactivate_time || '10:00', send_reminder: t?.send_reminder || false, reminder_minutes_before: t?.reminder_minutes_before || 15, is_active: t?.is_active ?? true, is_draft: t?.is_draft || false }; }
function fmtDur(m: number) { const h = Math.floor(m / 60), r = m % 60; if (!h) return r + ' mnt'; if (!r) return h + ' jam'; return h + 'j ' + r + 'm'; }
function fmtTime(m: number) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
function secLvl(f: FD) { let s = 20; if (f.require_selfie) s += 25; if (f.selfie_verification_level === 'strict') s += 10; if (f.selfie_verification_level === 'ai') s += 15; if (f.require_location) s += 20; if (f.anti_spoofing) s += 15; if (f.max_attempts <= 2) s += 5; return Math.min(s, 100); }

function Card({ icon: Icon, gradient, title, desc, children }: { icon: any; gradient: string; title: string; desc: string; children: React.ReactNode }) {
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center gap-3 mb-6">
            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}><Icon className="h-6 w-6" /></motion.div>
            <div><h3 className="font-bold text-neutral-900 dark:text-white">{title}</h3><p className="text-sm text-neutral-500">{desc}</p></div>
        </div>
        <div className="space-y-5">{children}</div>
    </motion.div>);
}

function NavBar({ step, total, onPrev, onNext, onDraft, onSubmit, submitting, canNext }: { step: number; total: number; onPrev: () => void; onNext: () => void; onDraft: () => void; onSubmit: () => void; submitting: boolean; canNext: boolean }) {
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-between rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
        <motion.button whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} onClick={onPrev} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold disabled:opacity-50"><ArrowLeft className="h-5 w-5" />Sebelumnya</motion.button>
        <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onDraft} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold"><Save className="h-4 w-4" />Draft</motion.button>
            {step < total ? (<motion.button whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} onClick={onNext} disabled={!canNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50">Selanjutnya<ArrowRight className="h-5 w-5" /></motion.button>
            ) : (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSubmit} disabled={submitting || !canNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50">{submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Menyimpan...</> : <><CheckCircle className="h-5 w-5" />Simpan Template</>}</motion.button>)}
        </div>
    </motion.div>);
}

export default function SessionDetail({ dosen, template, courses, mode }: Props) {
    const [step, setStep] = useState(1);
    const [f, setF] = useState<FD>(init(template));
    const [sub, setSub] = useState(false);
    const [tag, setTag] = useState('');
    const T = 5;

    const up = useCallback(<K extends keyof FD>(k: K, v: FD[K]) => { setF(p => ({ ...p, [k]: v })); }, []);
    const toggleDay = (d: number) => { const a = f.default_days; up('default_days', a.includes(d) ? a.filter(x => x !== d) : [...a, d]); };
    const addTag = () => { if (tag.trim() && !f.tags.includes(tag.trim())) { up('tags', [...f.tags, tag.trim()]); setTag(''); } };
    const rmTag = (i: number) => up('tags', f.tags.filter((_, j) => j !== i));

    const valid = (s: number): boolean => { switch (s) { case 1: return !!(f.name && f.name.length >= 3 && f.category); case 2: return f.duration_minutes >= 30 && f.qr_refresh_interval >= 10; case 3: return !f.require_selfie || !!f.selfie_verification_level; case 4: return !f.auto_activate || f.default_days.length > 0; case 5: return [1, 2, 3, 4].every(x => valid(x)); default: return false; } };
    const next = () => { if (valid(step)) { setStep(s => Math.min(s + 1, T)); window.scrollTo({ top: 0, behavior: 'smooth' }); } else toast.error('Lengkapi field wajib'); };
    const prev = () => { setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const submit = () => {
        if (!valid(5)) { toast.error('Lengkapi semua konfigurasi'); return; } setSub(true); const d = { ...f, is_draft: false };
        if (mode === 'edit' && template) { router.put(`/dosen/session-templates/${template.id}/advanced`, d, { onSuccess: () => toast.success('Template diperbarui'), onError: () => toast.error('Gagal'), onFinish: () => setSub(false) }); }
        else { router.post('/dosen/session-templates/advanced', d, { onSuccess: () => toast.success('Template dibuat'), onError: () => toast.error('Gagal'), onFinish: () => setSub(false) }); }
    };
    const draft = () => { router.post('/dosen/session-templates/draft', { ...f, id: template?.id }, { onSuccess: () => toast.success('Draft tersimpan') }); };

    const sl = secLvl(f);
    const steps = [{ id: 1, t: 'Informasi Dasar', d: 'Nama, kategori', icon: FileText }, { id: 2, t: 'Konfigurasi Waktu', d: 'Durasi, interval QR', icon: Clock }, { id: 3, t: 'Verifikasi', d: 'Selfie, lokasi', icon: Shield }, { id: 4, t: 'Aktivasi', d: 'Jadwal, reminder', icon: Zap }, { id: 5, t: 'Review', d: 'Tinjau semua', icon: CheckCircle }];

    useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); draft(); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [f]);

    const catGrad = CATS.find(c => c.v === f.category)?.c || 'from-blue-400 to-cyan-600';
    const catLabel = CATS.find(c => c.v === f.category)?.l || 'Regular';
    const courseName = courses.find(c => c.id === f.course_id)?.nama || 'Semua';

    return (
        <DosenLayout dosen={dosen}>
            <Head title={mode === 'create' ? 'Buat Template' : 'Edit Template'} />
            <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-6 p-6">

                {/* ═══ HEADER ═══ */}
                <motion.div variants={iV} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    {[0, 1, 2].map(i => (<motion.div key={i} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i }} />))}
                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.button whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.95 }} onClick={() => router.visit('/dosen/session-templates')} className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 shrink-0">
                                    <ArrowLeft className="h-6 w-6" />
                                </motion.button>
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img src={SesiAbsenIcon} alt="Sesi" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>{mode === 'create' ? 'Buat Template Baru' : 'Edit Template'}</motion.p>
                                    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>{f.name || 'Template Sesi Absensi'}</motion.h1>
                                    <motion.p className="mt-2 text-indigo-100 text-sm leading-relaxed"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Konfigurasi template untuk sesi absensi</motion.p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg"><Target className="h-6 w-6 text-white" /></div>
                                    <div><p className="text-xs text-indigo-100">Progress</p><p className="text-2xl font-bold text-white">{step}/{T}</p></div>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-2">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={draft} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg"><Save className="h-4 w-4" />Simpan Draft</motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ STEPPER ═══ */}
                <motion.div variants={iV} className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="flex items-center justify-between">
                        {steps.map((s, i) => (<React.Fragment key={s.id}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if (s.id <= step || (s.id > 1 && valid(s.id - 1))) setStep(s.id); }} className={`relative flex flex-col items-center gap-3 ${s.id > step + 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <div className="relative">
                                    <motion.div animate={{ scale: step === s.id ? 1.1 : 1 }} className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${s.id < step ? 'bg-emerald-500 shadow-emerald-500/30' : step === s.id ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                                        {s.id < step ? <CheckCircle className="h-7 w-7 text-white" /> : <s.icon className={`h-7 w-7 ${step === s.id ? 'text-white' : 'text-neutral-500'}`} />}
                                    </motion.div>
                                    <motion.div animate={{ scale: step === s.id ? 1 : 0.8, opacity: step === s.id ? 1 : 0.6 }} className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold shadow-lg">{s.id}</motion.div>
                                </div>
                                <div className="text-center max-w-[100px]"><p className={`text-xs font-bold ${step === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'}`}>{s.t}</p><p className="text-[10px] text-neutral-400 mt-0.5 hidden md:block">{s.d}</p></div>
                            </motion.button>
                            {i < steps.length - 1 && (<div className="flex-1 h-1 mx-2 relative"><div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 rounded-full" /><motion.div initial={{ width: '0%' }} animate={{ width: s.id < step ? '100%' : '0%' }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" /></div>)}
                        </React.Fragment>))}
                    </div>
                    <div className="mt-6"><div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2"><span>Progress</span><span className="font-bold">{Math.round((step / T) * 100)}%</span></div><div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"><motion.div initial={{ width: '0%' }} animate={{ width: `${(step / T) * 100}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" /></div></div>
                </motion.div>

                {/* ═══ STEP CONTENT ═══ */}
                <AnimatePresence mode="wait">
                    {step === 1 && (<motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card icon={FileText} gradient="from-blue-400 to-cyan-600" title="Informasi Dasar" desc="Nama, kategori, dan deskripsi template">
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nama Template *</label><Input placeholder="Contoh: Template Kuliah Regular" value={f.name} onChange={e => up('name', e.target.value)} className="border-2" /><p className="text-xs text-neutral-500 mt-1">Minimal 3 karakter</p></div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Deskripsi</label><Textarea placeholder="Jelaskan kegunaan template ini..." value={f.description} onChange={e => up('description', e.target.value)} rows={3} className="border-2" /><p className="text-xs text-neutral-500 mt-1">{f.description.length}/500</p></div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kategori *</label>
                                    <div className="grid grid-cols-5 gap-3">{CATS.map(c => (<motion.button key={c.v} type="button" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => up('category', c.v)} className={`relative overflow-hidden rounded-2xl p-4 text-center transition-all ${f.category === c.v ? 'ring-4 ring-indigo-500/50' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}><div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${c.c} text-white shadow-lg mb-2`}><FileText className="h-6 w-6" /></div><p className="text-xs font-semibold text-neutral-900 dark:text-white">{c.l}</p><p className="text-[10px] text-neutral-500">{c.d}</p></motion.button>))}</div>
                                </div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mata Kuliah (Opsional)</label>
                                    <select value={f.course_id ?? ''} onChange={e => up('course_id', e.target.value ? parseInt(e.target.value) : null)} className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"><option value="">Semua Mata Kuliah</option>{courses.map(c => (<option key={c.id} value={c.id}>{c.nama} - {c.sks} SKS</option>))}</select>
                                </div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">{f.tags.map((t, i) => (<motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">{t}<button type="button" onClick={() => rmTag(i)} className="hover:text-red-600"><X className="h-3 w-3" /></button></motion.span>))}</div>
                                    <div className="flex gap-2"><Input placeholder="Tambah tag..." value={tag} onChange={e => setTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="border-2" /><motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addTag} className="px-4 py-2 rounded-xl bg-indigo-500 text-white"><Plus className="h-4 w-4" /></motion.button></div>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-6 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                            <div className="flex items-center gap-2 mb-4"><Eye className="h-5 w-5 text-indigo-600" /><h4 className="font-bold text-neutral-900 dark:text-white">Preview</h4></div>
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${catGrad} text-white shadow-lg mb-3`}><FileText className="h-7 w-7" /></div>
                                <h5 className="font-bold text-neutral-900 dark:text-white mb-1">{f.name || 'Nama Template'}</h5>
                                <p className="text-xs text-neutral-500 mb-3">{f.description || 'Deskripsi template...'}</p>
                                {f.tags.length > 0 && <div className="flex flex-wrap gap-1">{f.tags.map((t, i) => (<span key={i} className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">{t}</span>))}</div>}
                            </div>
                            <div className="text-xs text-neutral-500 space-y-1 mt-4"><p>Kategori: {catLabel}</p><p>Mata Kuliah: {courseName}</p><p>Tags: {f.tags.length} tag</p></div>
                        </motion.div></div>
                    </motion.div>)}

                    {step === 2 && (<motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card icon={Clock} gradient="from-amber-400 to-orange-600" title="Konfigurasi Waktu" desc="Durasi sesi dan pengaturan waktu">
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Durasi Sesi (menit) *</label>
                                    <div className="flex items-center gap-4"><input type="range" min="30" max="300" step="15" value={f.duration_minutes} onChange={e => up('duration_minutes', parseInt(e.target.value))} className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700" /><div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30"><Clock className="h-4 w-4 text-indigo-600" /><span className="text-lg font-bold text-indigo-600">{f.duration_minutes}</span><span className="text-sm text-indigo-600">mnt</span></div></div>
                                    <div className="flex gap-2 mt-3">{[60, 90, 120, 150, 180].map(d => (<motion.button key={d} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => up('duration_minutes', d)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${f.duration_minutes === d ? 'bg-indigo-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{d} min</motion.button>))}</div>
                                </div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">QR Code Refresh (detik) *</label>
                                    <div className="grid grid-cols-6 gap-2">{[10, 20, 30, 45, 60, 90].map(s => (<motion.button key={s} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => up('qr_refresh_interval', s)} className={`py-3 rounded-xl text-center font-bold ${f.qr_refresh_interval === s ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{s}s</motion.button>))}</div>
                                    <p className="text-xs text-neutral-500 mt-2">Interval pendek = keamanan tinggi</p>
                                </div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Toleransi Keterlambatan (menit)</label>
                                    <div className="flex items-center gap-4"><input type="range" min="0" max="60" step="5" value={f.allow_late_minutes} onChange={e => up('allow_late_minutes', parseInt(e.target.value))} className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700" /><div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30"><AlertCircle className="h-4 w-4 text-amber-600" /><span className="text-lg font-bold text-amber-600">{f.allow_late_minutes}</span><span className="text-sm text-amber-600">mnt</span></div></div>
                                    <div className="flex gap-2 mt-3">{[0, 10, 15, 20, 30].map(l => (<motion.button key={l} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => up('allow_late_minutes', l)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${f.allow_late_minutes === l ? 'bg-indigo-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{l === 0 ? 'Tidak ada' : `${l} min`}</motion.button>))}</div>
                                </div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Grace Period (menit)</label><Input type="number" min="0" max="30" value={f.grace_period_minutes} onChange={e => up('grace_period_minutes', parseInt(e.target.value) || 0)} className="border-2 w-32" /><p className="text-xs text-neutral-500 mt-1">Waktu tambahan setelah sesi berakhir</p></div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-6 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                            <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Timeline Preview</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white"><Play className="h-5 w-5" /></div><div><p className="text-xs text-neutral-500">Mulai</p><p className="font-bold text-neutral-900 dark:text-white">00:00</p></div></div>
                                {f.allow_late_minutes > 0 && <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white"><Clock className="h-5 w-5" /></div><div><p className="text-xs text-neutral-500">Toleransi</p><p className="font-bold text-neutral-900 dark:text-white">+{f.allow_late_minutes} mnt</p></div></div>}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white"><StopCircle className="h-5 w-5" /></div><div><p className="text-xs text-neutral-500">Selesai</p><p className="font-bold text-neutral-900 dark:text-white">{fmtTime(f.duration_minutes)}</p></div></div>
                            </div>
                            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20"><p className="text-xs text-neutral-500">Durasi Total</p><p className="text-lg font-bold text-indigo-600">{fmtDur(f.duration_minutes)}</p></div>
                        </motion.div></div>
                    </motion.div>)}

                    {step === 3 && (<motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card icon={Shield} gradient="from-red-400 to-pink-600" title="Verifikasi & Keamanan" desc="Pengaturan keamanan">
                                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><Camera className="h-5 w-5 text-indigo-600" /><div><p className="font-bold text-neutral-900 dark:text-white">Verifikasi Selfie</p><p className="text-xs text-neutral-500">Wajibkan upload selfie</p></div></div><Switch checked={f.require_selfie} onCheckedChange={v => up('require_selfie', v)} /></div>
                                    {f.require_selfie && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800"><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Level Verifikasi</label>
                                        <div className="grid grid-cols-3 gap-3">{VERIF.map(lv => (<motion.button key={lv.v} type="button" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => up('selfie_verification_level', lv.v)} className={`p-4 rounded-xl text-center ${f.selfie_verification_level === lv.v ? 'ring-4 ring-indigo-500/50' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}><div className={`flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-gradient-to-br ${lv.c} text-white shadow-lg mb-2`}><lv.icon className="h-5 w-5" /></div><p className="text-sm font-bold text-neutral-900 dark:text-white">{lv.l}</p><p className="text-xs text-neutral-500">{lv.d}</p></motion.button>))}</div>
                                    </motion.div>}
                                </div>
                                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-emerald-600" /><div><p className="font-bold text-neutral-900 dark:text-white">Verifikasi Lokasi</p><p className="text-xs text-neutral-500">Batasi berdasarkan lokasi</p></div></div><Switch checked={f.require_location} onCheckedChange={v => up('require_location', v)} /></div>
                                    {f.require_location && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-neutral-200 dark:border-neutral-800"><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Radius (meter)</label><div className="flex items-center gap-4"><input type="range" min="10" max="500" step="10" value={f.location_radius_meters} onChange={e => up('location_radius_meters', parseInt(e.target.value))} className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700" /><div className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><span className="text-lg font-bold text-emerald-600">{f.location_radius_meters}m</span></div></div></motion.div>}
                                </div>
                                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ShieldAlert className="h-5 w-5 text-red-600" /><div><p className="font-bold text-neutral-900 dark:text-white">Anti-Spoofing</p><p className="text-xs text-neutral-500">Deteksi kecurangan otomatis</p></div></div><Switch checked={f.anti_spoofing} onCheckedChange={v => up('anti_spoofing', v)} /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Maks. Percobaan</label><div className="grid grid-cols-5 gap-2">{[1, 2, 3, 5, 10].map(n => (<motion.button key={n} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => up('max_attempts', n)} className={`py-3 rounded-xl text-center font-bold ${f.max_attempts === n ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{n}x</motion.button>))}</div></div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-6 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                            <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Security Level</h4>
                            <div className={`p-4 rounded-xl ${sl >= 70 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : sl >= 40 ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-gradient-to-br from-red-500 to-pink-600 text-white'}`}>
                                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Level Keamanan</span><Shield className="h-5 w-5" /></div>
                                <p className="text-2xl font-bold">{sl >= 70 ? 'Tinggi' : sl >= 40 ? 'Sedang' : 'Rendah'}</p>
                                <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${sl}%` }} className="h-full bg-white rounded-full" /></div>
                                <p className="text-xs mt-2 opacity-80">{sl}%</p>
                            </div>
                            <div className="space-y-2 text-sm mt-4">
                                <div className="flex items-center gap-2">{f.require_selfie ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-neutral-400" />}<span className="text-neutral-700 dark:text-neutral-300">Selfie</span></div>
                                <div className="flex items-center gap-2">{f.require_location ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-neutral-400" />}<span className="text-neutral-700 dark:text-neutral-300">Lokasi</span></div>
                                <div className="flex items-center gap-2">{f.anti_spoofing ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-neutral-400" />}<span className="text-neutral-700 dark:text-neutral-300">Anti-Spoofing</span></div>
                            </div>
                        </motion.div></div>
                    </motion.div>)}

                    {step === 4 && (<motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card icon={Zap} gradient="from-emerald-400 to-teal-600" title="Aktivasi Otomatis" desc="Jadwal dan reminder">
                                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><Zap className="h-5 w-5 text-emerald-600" /><div><p className="font-bold text-neutral-900 dark:text-white">Auto-Activate</p><p className="text-xs text-neutral-500">Aktifkan sesi otomatis</p></div></div><Switch checked={f.auto_activate} onCheckedChange={v => up('auto_activate', v)} /></div>
                                    {f.auto_activate && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Hari Aktif *</label><div className="grid grid-cols-7 gap-2">{DAYS.map((d, i) => (<motion.button key={i} type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggleDay(i)} className={`py-3 rounded-xl text-center text-sm font-bold ${f.default_days.includes(i) ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{d}</motion.button>))}</div></div>
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Waktu Aktivasi</label><Input type="time" value={f.auto_activate_time} onChange={e => up('auto_activate_time', e.target.value)} className="border-2 w-40" /></div>
                                    </motion.div>}
                                </div>
                                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><StopCircle className="h-5 w-5 text-red-600" /><div><p className="font-bold text-neutral-900 dark:text-white">Auto-Deactivate</p><p className="text-xs text-neutral-500">Nonaktifkan otomatis</p></div></div><Switch checked={f.auto_deactivate} onCheckedChange={v => up('auto_deactivate', v)} /></div>
                                    {f.auto_deactivate && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-neutral-200 dark:border-neutral-800"><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Waktu Deaktivasi</label><Input type="time" value={f.auto_deactivate_time} onChange={e => up('auto_deactivate_time', e.target.value)} className="border-2 w-40" /></motion.div>}
                                </div>
                                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><Bell className="h-5 w-5 text-amber-600" /><div><p className="font-bold text-neutral-900 dark:text-white">Reminder</p><p className="text-xs text-neutral-500">Kirim pengingat sebelum sesi</p></div></div><Switch checked={f.send_reminder} onCheckedChange={v => up('send_reminder', v)} /></div>
                                    {f.send_reminder && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-neutral-200 dark:border-neutral-800"><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Kirim {f.reminder_minutes_before} menit sebelum</label><div className="flex items-center gap-4"><input type="range" min="5" max="60" step="5" value={f.reminder_minutes_before} onChange={e => up('reminder_minutes_before', parseInt(e.target.value))} className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700" /><div className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30"><span className="font-bold text-amber-600">{f.reminder_minutes_before} mnt</span></div></div></motion.div>}
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sticky top-6 rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                            <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Jadwal Preview</h4>
                            <div className="space-y-3">
                                {f.auto_activate && f.default_days.length > 0 ? (<>{f.default_days.sort().map(d => (<div key={d} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white text-sm font-bold">{DAYS[d]}</div><div><p className="text-sm font-medium text-neutral-900 dark:text-white">{DAYS[d]}</p><p className="text-xs text-neutral-500">{f.auto_activate_time}{f.auto_deactivate ? ` - ${f.auto_deactivate_time}` : ''}</p></div></div>))}</>) : (<div className="text-center py-8 text-neutral-400"><Bell className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Belum ada jadwal</p></div>)}
                            </div>
                        </motion.div></div>
                    </motion.div>)}

                    {step === 5 && (<motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <Card icon={CheckCircle} gradient="from-emerald-400 to-teal-600" title="Review & Konfirmasi" desc="Tinjau semua konfigurasi">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-3"><h5 className="font-bold text-neutral-900 dark:text-white text-sm">Informasi Dasar</h5><motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep(1)} className="text-indigo-500 text-xs font-medium">Edit</motion.button></div>
                                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400"><p>Nama: <span className="font-medium text-neutral-900 dark:text-white">{f.name}</span></p><p>Kategori: <span className="font-medium text-neutral-900 dark:text-white">{catLabel}</span></p><p>Mata Kuliah: <span className="font-medium text-neutral-900 dark:text-white">{courseName}</span></p>{f.tags.length > 0 && <p>Tags: {f.tags.join(', ')}</p>}</div>
                                </div>
                                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-3"><h5 className="font-bold text-neutral-900 dark:text-white text-sm">Waktu</h5><motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep(2)} className="text-indigo-500 text-xs font-medium">Edit</motion.button></div>
                                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400"><p>Durasi: <span className="font-medium text-neutral-900 dark:text-white">{fmtDur(f.duration_minutes)}</span></p><p>QR Refresh: <span className="font-medium text-neutral-900 dark:text-white">{f.qr_refresh_interval}s</span></p><p>Toleransi: <span className="font-medium text-neutral-900 dark:text-white">{f.allow_late_minutes} mnt</span></p></div>
                                </div>
                                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-3"><h5 className="font-bold text-neutral-900 dark:text-white text-sm">Keamanan</h5><motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep(3)} className="text-indigo-500 text-xs font-medium">Edit</motion.button></div>
                                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400"><p>Selfie: <span className="font-medium text-neutral-900 dark:text-white">{f.require_selfie ? `Ya (${f.selfie_verification_level})` : 'Tidak'}</span></p><p>Lokasi: <span className="font-medium text-neutral-900 dark:text-white">{f.require_location ? `Ya (${f.location_radius_meters}m)` : 'Tidak'}</span></p><p>Anti-Spoofing: <span className="font-medium text-neutral-900 dark:text-white">{f.anti_spoofing ? 'Ya' : 'Tidak'}</span></p><p>Level: <span className={`font-bold ${sl >= 70 ? 'text-emerald-500' : sl >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{sl >= 70 ? 'Tinggi' : sl >= 40 ? 'Sedang' : 'Rendah'} ({sl}%)</span></p></div>
                                </div>
                                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-3"><h5 className="font-bold text-neutral-900 dark:text-white text-sm">Aktivasi</h5><motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep(4)} className="text-indigo-500 text-xs font-medium">Edit</motion.button></div>
                                    <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400"><p>Auto-Activate: <span className="font-medium text-neutral-900 dark:text-white">{f.auto_activate ? 'Ya' : 'Tidak'}</span></p>{f.auto_activate && <><p>Hari: <span className="font-medium text-neutral-900 dark:text-white">{f.default_days.map(d => DAYS[d]).join(', ')}</span></p><p>Waktu: <span className="font-medium text-neutral-900 dark:text-white">{f.auto_activate_time}</span></p></>}<p>Reminder: <span className="font-medium text-neutral-900 dark:text-white">{f.send_reminder ? `Ya (${f.reminder_minutes_before} mnt)` : 'Tidak'}</span></p></div>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-emerald-600" /><div><p className="font-bold text-emerald-800 dark:text-emerald-300">Validasi</p><p className="text-sm text-emerald-600 dark:text-emerald-400">{valid(5) ? 'Semua konfigurasi valid. Template siap disimpan.' : 'Beberapa field belum lengkap. Periksa kembali.'}</p></div></div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"><Switch checked={f.is_active} onCheckedChange={v => up('is_active', v)} /><div><p className="font-bold text-neutral-900 dark:text-white text-sm">Aktifkan Template</p><p className="text-xs text-neutral-500">Template akan langsung tersedia</p></div></div>
                        </Card>
                    </motion.div>)}
                </AnimatePresence>

                {/* ═══ NAVIGATION ═══ */}
                <NavBar step={step} total={T} onPrev={prev} onNext={next} onDraft={draft} onSubmit={submit} submitting={sub} canNext={valid(step)} />

            </motion.div>
        </DosenLayout>
    );
}
