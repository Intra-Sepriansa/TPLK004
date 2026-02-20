import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, ArrowLeft, ArrowRight, Save, Eye, Target, Bell, Clock,
    AlertTriangle, Award, Info, CheckCircle, Search, Users, Calendar,
    Loader2, AlertCircle, X, FileText, Zap, Mail
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface NotificationTemplate {
    id: number; name: string; type: string; title: string; message: string; usage_count: number;
}
interface Props {
    dosen: { id: number; nama: string; nidn: string; email: string };
    courses: Array<{ id: number; nama: string; kode: string | number; mahasiswa_count: number }>;
    mahasiswa: Array<{ id: number; nama: string; nim: string; kelas: string }>;
    templates: NotificationTemplate[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
} as const;

const NOTIF_TYPES = [
    { value: 'reminder', label: 'Pengingat', icon: Clock, color: 'from-blue-400 to-cyan-600', desc: 'Reminder tugas/jadwal' },
    { value: 'announcement', label: 'Pengumuman', icon: Mail, color: 'from-purple-400 to-violet-600', desc: 'Info penting' },
    { value: 'alert', label: 'Peringatan', icon: AlertTriangle, color: 'from-red-400 to-pink-600', desc: 'Urgent alert' },
    { value: 'achievement', label: 'Pencapaian', icon: Award, color: 'from-amber-400 to-orange-600', desc: 'Prestasi mahasiswa' },
    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'from-orange-400 to-red-600', desc: 'Peringatan khusus' },
    { value: 'info', label: 'Informasi', icon: Info, color: 'from-emerald-400 to-teal-600', desc: 'Info umum' },
] as const;

const PRIORITIES = [
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Info },
    { value: 'high', label: 'Penting', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
] as const;

const STEPS = [
    { id: 1, title: 'Tipe & Template', description: 'Pilih tipe notifikasi', icon: Bell },
    { id: 2, title: 'Konten', description: 'Tulis pesan notifikasi', icon: FileText },
    { id: 3, title: 'Penerima', description: 'Pilih target penerima', icon: Users },
    { id: 4, title: 'Jadwal', description: 'Atur waktu pengiriman', icon: Calendar },
    { id: 5, title: 'Review', description: 'Periksa & kirim', icon: Send },
];

function getTypeColor(type: string) {
    const c: Record<string, string> = {
        reminder: 'bg-blue-100 text-blue-700', announcement: 'bg-purple-100 text-purple-700',
        alert: 'bg-red-100 text-red-700', achievement: 'bg-amber-100 text-amber-700',
        warning: 'bg-orange-100 text-orange-700', info: 'bg-emerald-100 text-emerald-700',
    };
    return c[type] || 'bg-neutral-100 text-neutral-700';
}
function getTypeLabel(type: string) {
    return NOTIF_TYPES.find(t => t.value === type)?.label || type;
}

export default function NotificationDetail({ dosen, courses, mahasiswa, templates }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDraft, setIsDraft] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [searchMhs, setSearchMhs] = useState('');
    const [confirmChecks, setConfirmChecks] = useState({ content: false, target: false });

    const [formData, setFormData] = useState({
        type: 'info' as string,
        priority: 'normal' as string,
        template_id: null as number | null,
        title: '',
        message: '',
        action_url: '',
        action_label: '',
        target_type: 'all' as 'all' | 'course' | 'custom',
        course_ids: [] as number[],
        mahasiswa_ids: [] as number[],
        send_now: true,
        scheduled_at: '',
        recurring: false,
        recurring_pattern: '' as string,
        recurring_days: [] as string[],
        recurring_end_date: '',
    });

    const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1: return !!formData.type && !!formData.priority;
            case 2: return formData.title.length > 0 && formData.title.length <= 100 && formData.message.length > 0 && formData.message.length <= 1000;
            case 3:
                if (formData.target_type === 'course') return formData.course_ids.length > 0;
                if (formData.target_type === 'custom') return formData.mahasiswa_ids.length > 0;
                return true;
            case 4:
                if (!formData.send_now && !formData.scheduled_at) return false;
                if (formData.recurring && !formData.recurring_end_date) return false;
                return true;
            case 5: return true;
            default: return false;
        }
    };

    const completedSteps = useMemo(() => {
        const s = new Set<number>();
        for (let i = 1; i <= 5; i++) { if (validateStep(i) && i < currentStep) s.add(i); }
        return s;
    }, [currentStep, formData]);

    const totalRecipients = useMemo(() => {
        if (formData.target_type === 'all') return mahasiswa.length;
        if (formData.target_type === 'course') return courses.filter(c => formData.course_ids.includes(c.id)).reduce((s, c) => s + c.mahasiswa_count, 0);
        return formData.mahasiswa_ids.length;
    }, [formData.target_type, formData.course_ids, formData.mahasiswa_ids, mahasiswa, courses]);

    const filteredMhs = useMemo(() => {
        if (!searchMhs) return mahasiswa;
        const q = searchMhs.toLowerCase();
        return mahasiswa.filter(m => m.nama.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q));
    }, [searchMhs, mahasiswa]);

    const handleTemplateSelect = (t: NotificationTemplate) => {
        setFormData(prev => ({ ...prev, template_id: t.id, title: t.title || '', message: t.message || '', type: t.type || prev.type }));
    };

    const handleNextStep = () => { if (validateStep(currentStep) && currentStep < 5) setCurrentStep(prev => prev + 1); };
    const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

    const handleSaveDraft = () => {
        setIsSaving(true);
        router.post('/dosen/notifications', { ...formData, is_draft: true } as any, {
            onFinish: () => { setIsSaving(false); setIsDraft(true); },
        });
    };

    const handleSend = () => {
        setSending(true);
        router.post('/dosen/notifications', {
            title: formData.title,
            message: formData.message,
            type: formData.type,
            priority: formData.priority,
            target_type: formData.target_type === 'course' ? 'all' : formData.target_type === 'custom' ? 'specific' : 'all',
            target_mahasiswa: formData.target_type === 'custom' ? formData.mahasiswa_ids : undefined,
            action_url: formData.action_url || undefined,
            scheduled_at: !formData.send_now ? formData.scheduled_at : undefined,
        } as any, {
            onFinish: () => setSending(false),
            onSuccess: () => router.visit('/dosen/notifications'),
        });
    };

    const canNavigateToStep = (step: number) => {
        for (let i = 1; i < step; i++) { if (!validateStep(i)) return false; }
        return true;
    };

    const allStepsValid = validateStep(1) && validateStep(2) && validateStep(3) && validateStep(4);

    const cardClass = "rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50";

    return (
        <DosenLayout>
            <Head title="Buat Notifikasi" />
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-6">

                {/* ═══════ HEADER ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    {[0, 1, 2].map(i => (
                        <motion.div key={i} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i }} />
                    ))}
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <motion.button whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.95 }} onClick={() => router.visit('/dosen/notifications')} className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl border border-white/30">
                                    <ArrowLeft className="h-6 w-6 text-white" />
                                </motion.button>
                                <motion.div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30" whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                                    <Send className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Buat Notifikasi Baru</p>
                                    <h1 className="text-3xl font-bold text-white">Kirim Pemberitahuan</h1>
                                    <p className="mt-1 text-indigo-100 max-w-lg">Buat dan kirim notifikasi ke mahasiswa</p>
                                </div>
                            </div>
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                <div className="p-2 bg-indigo-500/20 rounded-lg"><Target className="h-6 w-6 text-white" /></div>
                                <div>
                                    <p className="text-xs text-indigo-100">Progress</p>
                                    <p className="text-2xl font-bold text-white">{currentStep}/5</p>
                                </div>
                            </motion.div>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={handleSaveDraft} disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg disabled:opacity-50">
                                <Save className="h-4 w-4" /> Simpan Draft
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                <Eye className="h-4 w-4" /> Preview
                            </motion.button>
                            {isDraft && (
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30">
                                    <AlertCircle className="h-4 w-4 text-amber-200" /><span className="text-sm text-amber-100">Draft tersimpan</span>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ PROGRESS STEPPER ═══════ */}
                <motion.div variants={itemVariants} className={cardClass}>
                    <div className="flex items-start justify-between min-w-[750px] w-full px-2">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex items-center shrink-0 flex-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => canNavigateToStep(step.id) && setCurrentStep(step.id)}
                                    disabled={!canNavigateToStep(step.id)}
                                    className={`relative flex flex-col items-center gap-3 shrink-0 ${!canNavigateToStep(step.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="relative">
                                        <motion.div animate={{ scale: currentStep === step.id ? 1.1 : 1, backgroundColor: completedSteps.has(step.id) ? 'rgb(34,197,94)' : currentStep === step.id ? 'rgb(99,102,241)' : 'rgba(115, 115, 115, 0.2)' }} className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg border border-white/5 ${completedSteps.has(step.id) ? 'shadow-emerald-500/30' : currentStep === step.id ? 'shadow-indigo-500/30' : ''}`}>
                                            {completedSteps.has(step.id) ? <CheckCircle className="h-8 w-8 text-white" /> : <step.icon className={`h-8 w-8 ${currentStep === step.id ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />}
                                        </motion.div>
                                    </div>
                                    <div className="text-center w-28">
                                        <p className={`text-sm font-bold leading-tight ${currentStep === step.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-600 dark:text-neutral-400'}`}>{step.title}</p>
                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{step.description}</p>
                                    </div>
                                </motion.button>
                                {idx < STEPS.length - 1 && (
                                    <div className="flex-1 h-1 min-w-[40px] relative shrink mx-4">
                                        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                                        <motion.div initial={{ width: '0%' }} animate={{ width: completedSteps.has(step.id) ? '100%' : '0%' }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 w-full px-2">
                        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            <span>Progress Keseluruhan</span>
                            <span className="font-bold">{Math.round((currentStep / 5) * 100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full relative overflow-hidden">
                            <motion.div initial={{ width: '0%' }} animate={{ width: `${(currentStep / 5) * 100}%` }} transition={{ duration: 0.5 }} className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ WIZARD STEPS ═══════ */}
                <AnimatePresence mode="wait">
                    {/* STEP 1: Tipe & Template */}
                    {currentStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <motion.div variants={itemVariants} className={`${cardClass} !p-8`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30"><Bell className="h-6 w-6" /></motion.div>
                                        <div><h3 className="font-bold text-neutral-900 dark:text-white">Tipe Notifikasi</h3><p className="text-sm text-neutral-500">Pilih tipe dan template</p></div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Tipe Notifikasi *</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {NOTIF_TYPES.map(type => (
                                                    <motion.button key={type.value} type="button" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => updateForm('type', type.value)} className={`relative overflow-hidden rounded-2xl p-4 text-center transition-all ${formData.type === type.value ? 'ring-4 ring-indigo-500/50' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}>
                                                        <div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${type.color} text-white shadow-lg mb-2`}><type.icon className="h-6 w-6" /></div>
                                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{type.label}</p>
                                                        <p className="text-xs text-neutral-500 mt-1">{type.desc}</p>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Prioritas *</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {PRIORITIES.map(p => (
                                                    <motion.button key={p.value} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => updateForm('priority', p.value)} className={`px-4 py-3 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-2 ${formData.priority === p.value ? 'ring-4 ring-indigo-500/50 ' + p.color : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                                                        <p.icon className="h-4 w-4" />{p.label}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                        {templates.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Gunakan Template (Opsional)</label>
                                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                                    {templates.filter(t => !formData.type || t.type === formData.type).map(t => (
                                                        <motion.button key={t.id} type="button" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleTemplateSelect(t)} className={`p-4 rounded-xl text-left transition-all ${formData.template_id === t.id ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                                                            <p className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">{t.name}</p>
                                                            <p className="text-xs text-neutral-500 line-clamp-2">{t.message}</p>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div variants={itemVariants} className={`sticky top-6 ${cardClass}`}>
                                    <div className="flex items-center gap-2 mb-4"><Eye className="h-5 w-5 text-indigo-600" /><h4 className="font-bold text-neutral-900 dark:text-white">Preview</h4></div>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(formData.type)}`}>{getTypeLabel(formData.type)}</span>
                                        {formData.priority !== 'normal' && <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${formData.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{formData.priority === 'urgent' ? 'Urgent' : 'Penting'}</span>}
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white mt-3">{formData.title || 'Judul notifikasi...'}</p>
                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-3">{formData.message || 'Pesan notifikasi...'}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Konten */}
                    {currentStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <motion.div variants={itemVariants} className={`${cardClass} !p-8`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg shadow-purple-500/30"><FileText className="h-6 w-6" /></motion.div>
                                        <div><h3 className="font-bold text-neutral-900 dark:text-white">Konten Notifikasi</h3><p className="text-sm text-neutral-500">Tulis judul dan pesan</p></div>
                                    </div>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between mb-2"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Judul *</label><span className={`text-xs ${formData.title.length > 100 ? 'text-red-500' : 'text-neutral-400'}`}>{formData.title.length}/100</span></div>
                                            <input type="text" value={formData.title} onChange={e => updateForm('title', e.target.value)} maxLength={100} placeholder="Masukkan judul notifikasi..." className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2"><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Pesan *</label><span className={`text-xs ${formData.message.length > 1000 ? 'text-red-500' : 'text-neutral-400'}`}>{formData.message.length}/1000</span></div>
                                            <textarea value={formData.message} onChange={e => updateForm('message', e.target.value)} maxLength={1000} rows={8} placeholder="Tulis pesan notifikasi..." className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Action URL (Opsional)</label>
                                                <input type="url" value={formData.action_url} onChange={e => updateForm('action_url', e.target.value)} placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Action Label (Opsional)</label>
                                                <input type="text" value={formData.action_label} onChange={e => updateForm('action_label', e.target.value)} placeholder="Lihat Detail" className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div variants={itemVariants} className={`sticky top-6 ${cardClass}`}>
                                    <div className="flex items-center gap-2 mb-4"><Eye className="h-5 w-5 text-indigo-600" /><h4 className="font-bold text-neutral-900 dark:text-white">Preview</h4></div>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50 space-y-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(formData.type)}`}>{getTypeLabel(formData.type)}</span>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{formData.title || 'Judul...'}</p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{formData.message || 'Pesan...'}</p>
                                        {formData.action_label && <button className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{formData.action_label} →</button>}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Target Penerima */}
                    {currentStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <motion.div variants={itemVariants} className={`${cardClass} !p-8`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"><Users className="h-6 w-6" /></motion.div>
                                        <div><h3 className="font-bold text-neutral-900 dark:text-white">Target Penerima</h3><p className="text-sm text-neutral-500">Pilih siapa yang menerima</p></div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { value: 'all' as const, label: 'Semua Mahasiswa', icon: Users, desc: `${mahasiswa.length} mahasiswa` },
                                                { value: 'course' as const, label: 'Per Mata Kuliah', icon: FileText, desc: `${courses.length} mata kuliah` },
                                                { value: 'custom' as const, label: 'Pilih Manual', icon: Target, desc: 'Pilih spesifik' },
                                            ].map(opt => (
                                                <motion.button key={opt.value} type="button" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => updateForm('target_type', opt.value)} className={`rounded-2xl p-4 text-center transition-all ${formData.target_type === opt.value ? 'ring-4 ring-indigo-500/50 bg-indigo-50 dark:bg-indigo-900/20' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}>
                                                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg mb-2"><opt.icon className="h-5 w-5" /></div>
                                                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{opt.label}</p>
                                                    <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                        {formData.target_type === 'course' && (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Pilih Mata Kuliah</label>
                                                {courses.map(c => (
                                                    <motion.label key={c.id} whileHover={{ scale: 1.01 }} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${formData.course_ids.includes(c.id) ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/50' : 'bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                                                        <input type="checkbox" checked={formData.course_ids.includes(c.id)} onChange={() => updateForm('course_ids', formData.course_ids.includes(c.id) ? formData.course_ids.filter(id => id !== c.id) : [...formData.course_ids, c.id])} className="rounded border-neutral-300 text-indigo-600" />
                                                        <div className="flex-1"><p className="text-sm font-semibold text-neutral-900 dark:text-white">{c.nama}</p><p className="text-xs text-neutral-500">{c.mahasiswa_count} mahasiswa</p></div>
                                                    </motion.label>
                                                ))}
                                            </div>
                                        )}
                                        {formData.target_type === 'custom' && (
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                    <input type="text" value={searchMhs} onChange={e => setSearchMhs(e.target.value)} placeholder="Cari mahasiswa..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-neutral-500">{formData.mahasiswa_ids.length} dipilih</span>
                                                    <button type="button" onClick={() => updateForm('mahasiswa_ids', formData.mahasiswa_ids.length === mahasiswa.length ? [] : mahasiswa.map(m => m.id))} className="text-xs font-semibold text-indigo-600 hover:underline">{formData.mahasiswa_ids.length === mahasiswa.length ? 'Hapus Semua' : 'Pilih Semua'}</button>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto space-y-1">
                                                    {filteredMhs.map(m => (
                                                        <label key={m.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${formData.mahasiswa_ids.includes(m.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                                                            <input type="checkbox" checked={formData.mahasiswa_ids.includes(m.id)} onChange={() => updateForm('mahasiswa_ids', formData.mahasiswa_ids.includes(m.id) ? formData.mahasiswa_ids.filter(id => id !== m.id) : [...formData.mahasiswa_ids, m.id])} className="rounded border-neutral-300 text-indigo-600" />
                                                            <div><p className="text-sm font-semibold text-neutral-900 dark:text-white">{m.nama}</p><p className="text-xs text-neutral-400">{m.nim} · {m.kelas}</p></div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div variants={itemVariants} className={`sticky top-6 ${cardClass}`}>
                                    <div className="flex items-center gap-2 mb-4"><Users className="h-5 w-5 text-emerald-600" /><h4 className="font-bold text-neutral-900 dark:text-white">Target</h4></div>
                                    <div className="text-center py-6">
                                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{totalRecipients}</p>
                                        <p className="text-sm text-neutral-500 mt-1">Total Penerima</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Jadwal */}
                    {currentStep === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <motion.div variants={itemVariants} className={`${cardClass} !p-8`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30"><Calendar className="h-6 w-6" /></motion.div>
                                        <div><h3 className="font-bold text-neutral-900 dark:text-white">Jadwal Pengiriman</h3><p className="text-sm text-neutral-500">Atur waktu pengiriman</p></div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => updateForm('send_now', true)} className={`p-4 rounded-2xl text-center transition-all ${formData.send_now ? 'ring-4 ring-indigo-500/50 bg-indigo-50 dark:bg-indigo-900/20' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}>
                                                <Zap className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">Kirim Sekarang</p>
                                                <p className="text-xs text-neutral-500 mt-1">Langsung dikirim</p>
                                            </motion.button>
                                            <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => updateForm('send_now', false)} className={`p-4 rounded-2xl text-center transition-all ${!formData.send_now ? 'ring-4 ring-indigo-500/50 bg-indigo-50 dark:bg-indigo-900/20' : 'ring-1 ring-neutral-200 dark:ring-neutral-800'}`}>
                                                <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">Jadwalkan</p>
                                                <p className="text-xs text-neutral-500 mt-1">Kirim nanti</p>
                                            </motion.button>
                                        </div>
                                        {!formData.send_now && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tanggal & Waktu Kirim *</label>
                                                    <input type="datetime-local" value={formData.scheduled_at} onChange={e => updateForm('scheduled_at', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white focus:ring-2 focus:ring-indigo-500" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={formData.recurring} onChange={e => updateForm('recurring', e.target.checked)} className="rounded border-neutral-300 text-indigo-600" id="recurring" />
                                                    <label htmlFor="recurring" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Kirim Berulang</label>
                                                </div>
                                                {formData.recurring && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                                                        <div>
                                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Pola</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {['daily', 'weekly', 'monthly'].map(p => (
                                                                    <button key={p} type="button" onClick={() => updateForm('recurring_pattern', p)} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${formData.recurring_pattern === p ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {formData.recurring_pattern === 'weekly' && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Hari</label>
                                                                <div className="flex gap-2 flex-wrap">
                                                                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                                                                        <button key={d} type="button" onClick={() => updateForm('recurring_days', formData.recurring_days.includes(d) ? formData.recurring_days.filter(x => x !== d) : [...formData.recurring_days, d])} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${formData.recurring_days.includes(d) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>{d}</button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sampai Tanggal *</label>
                                                            <input type="date" value={formData.recurring_end_date} onChange={e => updateForm('recurring_end_date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm dark:border-neutral-700 dark:bg-black dark:text-white focus:ring-2 focus:ring-indigo-500" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                            <div className="lg:col-span-1">
                                <motion.div variants={itemVariants} className={`sticky top-6 ${cardClass}`}>
                                    <div className="flex items-center gap-2 mb-4"><Calendar className="h-5 w-5 text-amber-600" /><h4 className="font-bold text-neutral-900 dark:text-white">Jadwal</h4></div>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50 space-y-2">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formData.send_now ? '⚡ Kirim Sekarang' : '🕐 Dijadwalkan'}</p>
                                        {!formData.send_now && formData.scheduled_at && <p className="text-xs text-neutral-500">{new Date(formData.scheduled_at).toLocaleString('id-ID')}</p>}
                                        {formData.recurring && <p className="text-xs text-indigo-600 dark:text-indigo-400">🔄 Berulang {formData.recurring_pattern === 'daily' ? 'harian' : formData.recurring_pattern === 'weekly' ? 'mingguan' : 'bulanan'}</p>}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: Review & Kirim */}
                    {currentStep === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                            <motion.div variants={itemVariants} className={`${cardClass} !p-8`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"><CheckCircle className="h-6 w-6" /></motion.div>
                                    <div><h3 className="font-bold text-neutral-900 dark:text-white">Review & Kirim</h3><p className="text-sm text-neutral-500">Periksa sebelum mengirim</p></div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Tipe & Prioritas</h4>
                                            <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(formData.type)}`}>{getTypeLabel(formData.type)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${formData.priority === 'urgent' ? 'bg-red-100 text-red-700' : formData.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{formData.priority}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Konten</h4>
                                            <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                                        </div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formData.title}</p>
                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{formData.message}</p>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Penerima</h4>
                                            <button type="button" onClick={() => setCurrentStep(3)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                                        </div>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalRecipients}</p>
                                        <p className="text-xs text-neutral-500">{formData.target_type === 'all' ? 'Semua mahasiswa' : formData.target_type === 'course' ? 'Per mata kuliah' : 'Pilihan manual'}</p>
                                    </div>
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Jadwal</h4>
                                            <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                                        </div>
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formData.send_now ? '⚡ Kirim Sekarang' : '🕐 ' + (formData.scheduled_at ? new Date(formData.scheduled_at).toLocaleString('id-ID') : 'Belum diatur')}</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3 border-t border-neutral-200 dark:border-neutral-800 pt-6">
                                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Konfirmasi</h4>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={confirmChecks.content} onChange={e => setConfirmChecks(prev => ({ ...prev, content: e.target.checked }))} className="rounded border-neutral-300 text-indigo-600" />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Saya sudah memeriksa konten notifikasi</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={confirmChecks.target} onChange={e => setConfirmChecks(prev => ({ ...prev, target: e.target.checked }))} className="rounded border-neutral-300 text-indigo-600" />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Target penerima sudah benar</span>
                                    </label>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ NAVIGATION ═══════ */}
                <motion.div variants={itemVariants} className={`flex items-center justify-between ${cardClass}`}>
                    <motion.button whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} onClick={handlePrevStep} disabled={currentStep === 1} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold disabled:opacity-50">
                        <ArrowLeft className="h-5 w-5" /> Sebelumnya
                    </motion.button>
                    <div className="flex gap-3">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveDraft} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                            <Save className="h-5 w-5" /> Simpan Draft
                        </motion.button>
                        {currentStep < 5 ? (
                            <motion.button whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }} onClick={handleNextStep} disabled={!validateStep(currentStep)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50">
                                Selanjutnya <ArrowRight className="h-5 w-5" />
                            </motion.button>
                        ) : (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend} disabled={sending || !allStepsValid || !confirmChecks.content || !confirmChecks.target} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50">
                                {sending ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim...</> : <><Send className="h-5 w-5" /> Kirim Notifikasi</>}
                            </motion.button>
                        )}
                    </div>
                </motion.div>

            </motion.div>
        </DosenLayout>
    );
}
