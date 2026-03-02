import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    FileText, Plus, Edit, Trash2, Calendar, Clock, Play, X,
    Copy, Search, Filter, Zap, CheckCircle, RefreshCw,
    Download, Eye, Star, Loader2, Save, Layout,
    TrendingUp, LayoutTemplate, Sparkles, AlertTriangle,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import TemplateHeaderIcon from '@/assets/dosen/template/template.png';
import TotalTemplateIcon from '@/assets/dosen/template/total-template.png';
import TemplateAktifIcon from '@/assets/dosen/template/template-aktif.png';
import AutoActivateIcon from '@/assets/dosen/template/Auto-Activate.png';
import DurasiIcon from '@/assets/admin/fraud-detection/pending.png';

// ═══ INTERFACES ═══

interface Template {
    id: number;
    name: string;
    description: string | null;
    default_start_time: string;
    default_end_time: string;
    duration_minutes: number;
    default_days: number[];
    auto_activate: boolean;
    is_active: boolean;
    course_id: number | null;
    course?: { id: number; nama: string; sks?: number };
}

interface TemplateStats {
    total_templates: number;
    active_templates: number;
    auto_activate_templates: number;
    average_duration: number;
}

interface Props {
    dosen: { id: number; nama: string };
    templates: Template[];
    stats: TemplateStats;
    courses: Array<{ id: number; nama: string; sks: number }>;
}

// ═══ ANIMATION VARIANTS (EXACT COPY FROM KAS.TSX) ═══

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
} as const;

// ═══ HELPER COMPONENTS ═══

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
    const spring = useSpring(0, { duration, bounce: 0 });
    const display = useTransform(spring, (current) => Math.round(current));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => { spring.set(value); }, [value, spring]);
    useEffect(() => {
        const unsub = display.on('change', (v) => setDisplayValue(v));
        return unsub;
    }, [display]);

    return <span>{displayValue}</span>;
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ═══ MAIN COMPONENT ═══

export default function SessionTemplates({ dosen, templates, stats, courses }: Props) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'auto'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateTemplate, setGenerateTemplate] = useState<Template | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    // Form state
    const [templateForm, setTemplateForm] = useState({
        course_id: '',
        name: '',
        description: '',
        default_start_time: '08:00',
        default_end_time: '10:00',
        default_days: [] as number[],
        auto_activate: false,
    });

    const generateForm = useForm({ start_date: '', total_meetings: 14 });

    // ═══ FILTERING & SORTING ═══

    const filteredTemplates = useMemo(() => {
        let result = templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.course?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                filterStatus === 'all' ||
                (filterStatus === 'active' && t.is_active) ||
                (filterStatus === 'inactive' && !t.is_active) ||
                (filterStatus === 'auto' && t.auto_activate);
            return matchesSearch && matchesFilter;
        });

        if (sortBy === 'name') {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [templates, searchQuery, filterStatus, sortBy]);

    // ═══ HANDLERS ═══

    const resetForm = () => {
        setTemplateForm({
            course_id: '', name: '', description: '',
            default_start_time: '08:00', default_end_time: '10:00',
            default_days: [], auto_activate: false,
        });
    };

    const openCreateModal = () => {
        router.visit('/dosen/session-templates/create');
    };

    const openEditModal = (template: Template) => {
        router.visit(`/dosen/session-templates/${template.id}/edit`);
    };

    const toggleDay = (day: number) => {
        const current = templateForm.default_days;
        setTemplateForm({
            ...templateForm,
            default_days: current.includes(day) ? current.filter(d => d !== day) : [...current, day],
        });
    };

    const handleSubmitTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = {
            ...templateForm,
            course_id: templateForm.course_id || null,
        };

        if (editingTemplate) {
            router.patch(`/dosen/session-templates/${editingTemplate.id}`, data, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    resetForm();
                    setEditingTemplate(null);
                    toast.success('Template berhasil diperbarui');
                },
                onError: () => toast.error('Gagal memperbarui template'),
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/dosen/session-templates', data, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    resetForm();
                    toast.success('Template berhasil dibuat');
                },
                onError: () => toast.error('Gagal membuat template'),
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/dosen/session-templates/${deleteTarget.id}`, {
            onSuccess: () => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
                toast.success('Template berhasil dihapus');
            },
        });
    };

    const handleDuplicate = (template: Template) => {
        router.post(`/dosen/session-templates/${template.id}/duplicate`, {}, {
            onSuccess: () => toast.success('Template berhasil diduplikasi'),
        });
        setActiveMenu(null);
    };

    const handleToggleActive = (template: Template) => {
        router.patch(`/dosen/session-templates/${template.id}/toggle-active`, {}, {
            onSuccess: () => toast.success(template.is_active ? 'Template dinonaktifkan' : 'Template diaktifkan'),
        });
        setActiveMenu(null);
    };

    const handleGenerate = () => {
        if (!generateTemplate) return;
        generateForm.post(`/dosen/session-templates/${generateTemplate.id}/generate`, {
            onSuccess: () => {
                setShowGenerateModal(false);
                setGenerateTemplate(null);
                generateForm.reset();
                toast.success('Sesi berhasil digenerate dari template');
            },
        });
    };

    const handleRefresh = () => {
        router.reload({ only: ['templates', 'stats'] });
        toast.success('Data diperbarui');
    };

    // ═══ RENDER ═══

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Session Templates" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 p-6"
            >
                {/* ═══ HEADER (EXACT KAS.TSX STYLE) ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img src={TemplateHeaderIcon} alt="Session Templates" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                        Manajemen Template
                                    </motion.p>
                                    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                        Session Templates
                                    </motion.h1>
                                    <motion.p className="mt-2 text-indigo-100 text-sm leading-relaxed max-w-lg"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                        Buat template sesi otomatis yang dapat digunakan berulang kali
                                    </motion.p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10"
                                >
                                    <div className="p-2 bg-indigo-500/20 rounded-lg"><Zap className="h-6 w-6 text-white" /></div>
                                    <div>
                                        <p className="text-xs text-indigo-100">Template Aktif</p>
                                        <p className="text-2xl font-bold text-white">{stats.active_templates}</p>
                                    </div>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2">
                                    <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={openCreateModal} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                        <Plus className="h-4 w-4" /> Buat Template
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={handleRefresh} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                        <RefreshCw className="h-4 w-4" /> Refresh
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ SUMMARY CARDS ═══════ */}
                <motion.div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}
                >
                    {([
                        { key: 'total', label: 'Total Templates', value: stats.total_templates, sub: 'tersimpan', imgSrc: TotalTemplateIcon, from: 'from-violet-400', to: 'to-purple-600', glow: 'bg-violet-500', hoverShadow: 'hover:shadow-violet-500/10' },
                        { key: 'active', label: 'Template Aktif', value: stats.active_templates, sub: 'siap digunakan', imgSrc: TemplateAktifIcon, from: 'from-emerald-400', to: 'to-teal-600', glow: 'bg-emerald-500', hoverShadow: 'hover:shadow-emerald-500/10' },
                        { key: 'auto', label: 'Auto-Activate', value: stats.auto_activate_templates, sub: 'otomatis aktif', imgSrc: AutoActivateIcon, from: 'from-blue-400', to: 'to-cyan-600', glow: 'bg-blue-500', hoverShadow: 'hover:shadow-blue-500/10' },
                        { key: 'duration', label: 'Rata-rata Durasi', value: stats.average_duration, sub: 'menit per sesi', imgSrc: DurasiIcon, from: 'from-amber-400', to: 'to-orange-600', glow: 'bg-amber-500', hoverShadow: 'hover:shadow-amber-500/10', suffix: ' min' },
                    ] as Array<{ key: string; label: string; value: number; sub: string; imgSrc: string; from: string; to: string; glow: string; hoverShadow: string; suffix?: string }>).map((card, i) => (
                        <motion.div key={card.key}
                            variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
                            whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                            onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                            className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 ${card.hoverShadow}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-${card.glow.replace('bg-', '')}/5 to-transparent opacity-50 dark:opacity-100`} />
                            <motion.div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all ${card.glow}`} animate={{ opacity: hoveredCard === card.key ? 0.4 : 0.15 }} />
                            <div className="relative z-10 flex flex-col items-center sm:items-start gap-3 h-full justify-between">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center">
                                        <img src={card.imgSrc} alt={card.label} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
                                        <div className="mt-1"><span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white"><AnimatedCounter value={card.value} />{card.suffix}</span></div>
                                        <p className="hidden sm:block text-xs text-neutral-400 mt-1">{card.sub}</p>
                                    </div>
                                </div>
                                <div className="mt-auto w-full pt-2 sm:pt-4">
                                    <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                        <motion.div className={`h-full bg-gradient-to-r ${card.from} ${card.to} rounded-full`}
                                            initial={{ width: 0 }} animate={{ width: '70%' }}
                                            transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: 'easeOut' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ FILTER & SEARCH ═══ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50 space-y-4">
                    <div className="flex items-center gap-3 mb-5">
                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30">
                            <Filter className="h-6 w-6" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Filter & Pencarian</h3>
                            <p className="text-sm text-neutral-500">Temukan template dengan mudah</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input type="text" placeholder="Cari template atau mata kuliah..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 border-2 focus:ring-4 focus:ring-blue-500/20" />
                            </div>
                        </div>
                        <div>
                            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                                <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Nonaktif</SelectItem>
                                    <SelectItem value="auto">Auto-Activate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200/50 dark:border-neutral-800">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSortBy('recent')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'recent' ? 'bg-indigo-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                            <Clock className="h-4 w-4" /> Terbaru
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSortBy('name')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === 'name' ? 'bg-indigo-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                            <TrendingUp className="h-4 w-4" /> Nama A-Z
                        </motion.button>
                        {(searchQuery || filterStatus !== 'all') && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSearchQuery(''); setFilterStatus('all'); setSortBy('recent'); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                                <X className="h-4 w-4" /> Reset
                            </motion.button>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-neutral-500">Menampilkan {filteredTemplates.length} dari {templates.length} template</span>
                    </div>
                </motion.div>

                {/* ═══ TEMPLATE CARDS GRID ═══ */}
                {
                    filteredTemplates.length === 0 ? (
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/50 p-12 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50 text-center">
                            <div>
                                <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                {searchQuery || filterStatus !== 'all' ? 'Tidak ada template yang sesuai' : 'Belum ada template'}
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                {searchQuery || filterStatus !== 'all' ? 'Coba ubah filter pencarian' : 'Buat template pertama Anda untuk memulai'}
                            </p>
                            {!searchQuery && filterStatus === 'all' && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreateModal} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30">
                                    <Plus className="h-5 w-5" /> Buat Template Pertama
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredTemplates.map((template, idx) => (
                                    <motion.div
                                        key={template.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/50 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50 transition-all hover:shadow-xl ${!template.is_active ? 'opacity-60' : ''}`}
                                    >
                                        {/* Status badges */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                                            {template.auto_activate && (
                                                <motion.div whileHover={{ scale: 1.2 }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg">
                                                    <Zap className="h-4 w-4" />
                                                </motion.div>
                                            )}
                                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${template.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                                <div className={`h-2 w-2 rounded-full ${template.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                                                {template.is_active ? 'Aktif' : 'Nonaktif'}
                                            </div>
                                        </div>

                                        {/* Template Header */}
                                        <div className="p-6 pb-0">
                                            <div className="flex items-start gap-4 mb-4">
                                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                                    <LayoutTemplate className="h-7 w-7" />
                                                </motion.div>
                                                <div className="flex-1 min-w-0 pr-20">
                                                    <h3 className="font-bold text-neutral-900 dark:text-white truncate">{template.name}</h3>
                                                    <p className="text-xs text-neutral-500 mt-1">{template.course?.nama || 'Semua Mata Kuliah'}</p>
                                                </div>
                                            </div>

                                            {template.description && (
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">{template.description}</p>
                                            )}
                                        </div>

                                        {/* Template Stats */}
                                        <div className="px-6 pb-4">
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-sm"><Clock className="h-4 w-4" /></div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">{template.default_start_time} - {template.default_end_time}</p>
                                                        <p className="text-xs text-neutral-500">{template.duration_minutes} menit</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-sm"><Calendar className="h-4 w-4" /></div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(template.default_days || []).map(d => (
                                                            <span key={d} className="px-1.5 py-0.5 rounded text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{DAYS[d]?.slice(0, 3)}</span>
                                                        ))}
                                                        {(!template.default_days || template.default_days.length === 0) && (
                                                            <span className="text-xs text-neutral-500">Belum diatur</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setGenerateTemplate(template); setShowGenerateModal(true); }}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/30">
                                                    <Play className="h-4 w-4" /> Generate
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEditModal(template)}
                                                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                                                    <Edit className="h-4 w-4" />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDuplicate(template)}
                                                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                                                    <Copy className="h-4 w-4" />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleToggleActive(template)}
                                                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                                                    {template.is_active ? <X className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setDeleteTarget(template); setShowDeleteConfirm(true); }}
                                                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/30">
                                                    <Trash2 className="h-4 w-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                }
            </motion.div >

            {/* ═══ CREATE / EDIT MODAL ═══ */}
            <AnimatePresence>
                {
                    showCreateModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCreateModal(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl max-h-[90vh] overflow-hidden">
                                {/* Modal Header */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">
                                                {editingTemplate ? <Edit className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold">{editingTemplate ? 'Edit Template' : 'Buat Template Baru'}</h3>
                                                <p className="text-sm text-white/80">Konfigurasi template untuk sesi absensi</p>
                                            </div>
                                        </div>
                                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowCreateModal(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30">
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                                    <form onSubmit={handleSubmitTemplate} className="space-y-6">
                                        {/* Basic Info */}
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /> Informasi Dasar</h4>
                                            <div>
                                                <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nama Template *</Label>
                                                <Input type="text" placeholder="Contoh: Template Kuliah Regular" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} required className="border-2" />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Deskripsi</Label>
                                                <Textarea placeholder="Deskripsi template..." value={templateForm.description} onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })} rows={2} className="border-2" />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mata Kuliah *</Label>
                                                <Select value={templateForm.course_id} onValueChange={v => setTemplateForm({ ...templateForm, course_id: v })}>
                                                    <SelectTrigger className="border-2"><SelectValue placeholder="Pilih Mata Kuliah" /></SelectTrigger>
                                                    <SelectContent>
                                                        {courses.map(c => (
                                                            <SelectItem key={c.id} value={String(c.id)}>{c.nama} ({c.sks} SKS)</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Session Configuration */}
                                        <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Konfigurasi Waktu</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Waktu Mulai *</Label>
                                                    <Input type="time" value={templateForm.default_start_time} onChange={e => setTemplateForm({ ...templateForm, default_start_time: e.target.value })} required className="border-2" />
                                                </div>
                                                <div>
                                                    <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Waktu Selesai *</Label>
                                                    <Input type="time" value={templateForm.default_end_time} onChange={e => setTemplateForm({ ...templateForm, default_end_time: e.target.value })} required className="border-2" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Days */}
                                        <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2"><Calendar className="h-4 w-4 text-purple-500" /> Hari Default</h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                {DAYS.map((day, idx) => (
                                                    <motion.button key={idx} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleDay(idx)}
                                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${templateForm.default_days.includes(idx) ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                                                        {day}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Auto Activate */}
                                        <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> Auto-Activate</p>
                                                    <p className="text-sm text-neutral-500">Aktifkan sesi otomatis saat digenerate</p>
                                                </div>
                                                <Switch checked={templateForm.auto_activate} onCheckedChange={v => setTemplateForm({ ...templateForm, auto_activate: v })} />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50">
                                                {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</> : <><Save className="h-5 w-5" /> {editingTemplate ? 'Update Template' : 'Simpan Template'}</>}
                                            </motion.button>
                                            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreateModal(false)}
                                                className="px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                                                Batal
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* ═══ GENERATE MODAL ═══ */}
            <AnimatePresence>
                {
                    showGenerateModal && generateTemplate && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowGenerateModal(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden">
                                {/* Generate Header */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 p-6 text-white">
                                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">
                                                <Play className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">Generate Sesi</h3>
                                                <p className="text-sm text-white/80">Dari template: {generateTemplate.name}</p>
                                            </div>
                                        </div>
                                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowGenerateModal(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30">
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Template Preview */}
                                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"><FileText className="h-5 w-5" /></div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{generateTemplate.course?.nama || 'Semua MK'}</p>
                                                <p className="text-xs text-neutral-500">{generateTemplate.default_start_time} - {generateTemplate.default_end_time} ({generateTemplate.duration_minutes} menit)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tanggal Mulai *</Label>
                                        <Input type="date" value={generateForm.data.start_date} onChange={e => generateForm.setData('start_date', e.target.value)} className="border-2" />
                                    </div>
                                    <div>
                                        <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Jumlah Pertemuan *</Label>
                                        <Input type="number" min={1} max={21} value={generateForm.data.total_meetings} onChange={e => generateForm.setData('total_meetings', parseInt(e.target.value))} className="border-2" />
                                        <p className="text-xs text-neutral-500 mt-1">2 SKS = 14 pertemuan, 3 SKS = 21 pertemuan</p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate} disabled={generateForm.processing}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50">
                                            {generateForm.processing ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Play className="h-5 w-5" /> Generate Sesi</>}
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowGenerateModal(false)}
                                            className="px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                                            Batal
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
            <AnimatePresence>
                {
                    showDeleteConfirm && deleteTarget && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-3xl border border-white/20 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden">
                                <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-pink-500 p-6 text-white">
                                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Hapus Template</h3>
                                            <p className="text-sm text-white/80">Tindakan ini tidak dapat dibatalkan</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                        Yakin ingin menghapus template <strong className="text-neutral-900 dark:text-white">"{deleteTarget.name}"</strong>? Template yang sudah dihapus tidak dapat dikembalikan.
                                    </p>
                                    <div className="flex gap-3">
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDelete}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-lg shadow-red-500/30">
                                            <Trash2 className="h-5 w-5" /> Ya, Hapus
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDeleteConfirm(false)}
                                            className="px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                                            Batal
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </DosenLayout >
    );
}
