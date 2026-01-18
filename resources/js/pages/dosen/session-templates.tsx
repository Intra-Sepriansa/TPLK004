import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    FileText, Plus, Edit, Trash2, Calendar, Clock, Play, X, 
    Copy, MoreVertical, Search, Filter, TrendingUp, Zap,
    CheckCircle2, Settings
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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
    course?: { id: number; nama: string };
}

interface Props {
    dosen: { id: number; nama: string };
    templates: Template[];
    courses: Array<{ id: number; nama: string; sks: number }>;
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SessionTemplates({ dosen, templates, courses }: Props) {
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });
    const [generateModal, setGenerateModal] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    const form = useForm({
        course_id: '',
        name: '',
        description: '',
        default_start_time: '08:00',
        default_end_time: '10:00',
        default_days: [] as number[],
        auto_activate: false,
    });

    const generateForm = useForm({ start_date: '', total_meetings: 14 });

    // Filter templates
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.course?.nama.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterActive === 'all' || 
                            (filterActive === 'active' && t.is_active) ||
                            (filterActive === 'inactive' && !t.is_active);
        return matchesSearch && matchesFilter;
    });

    // Calculate stats
    const stats = {
        total: templates.length,
        active: templates.filter(t => t.is_active).length,
        autoActivate: templates.filter(t => t.auto_activate).length,
    };

    const handleCreate = () => {
        form.post('/dosen/session-templates', { onSuccess: () => { setCreateModal(false); form.reset(); } });
    };

    const handleUpdate = () => {
        if (!editModal.template) return;
        form.patch(`/dosen/session-templates/${editModal.template.id}`, { onSuccess: () => { setEditModal({ open: false, template: null }); form.reset(); } });
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/session-templates/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleGenerate = () => {
        if (!generateModal.template) return;
        generateForm.post(`/dosen/session-templates/${generateModal.template.id}/generate`, { onSuccess: () => { setGenerateModal({ open: false, template: null }); generateForm.reset(); } });
    };

    const openEditModal = (template: Template) => {
        form.setData({ course_id: String(template.course?.id || ''), name: template.name, description: template.description || '', default_start_time: template.default_start_time, default_end_time: template.default_end_time, default_days: template.default_days, auto_activate: template.auto_activate });
        setEditModal({ open: true, template });
    };

    const toggleDay = (day: number) => {
        const current = form.data.default_days;
        form.setData('default_days', current.includes(day) ? current.filter(d => d !== day) : [...current, day]);
    };

    const handleDuplicate = (template: Template) => {
        form.setData({
            course_id: String(template.course?.id || ''),
            name: `${template.name} (Copy)`,
            description: template.description || '',
            default_start_time: template.default_start_time,
            default_end_time: template.default_end_time,
            default_days: template.default_days,
            auto_activate: template.auto_activate,
        });
        setCreateModal(true);
        setActiveMenu(null);
    };

    const handleToggleActive = (template: Template) => {
        router.patch(`/dosen/session-templates/${template.id}/toggle-active`);
        setActiveMenu(null);
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Session Templates" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 text-white shadow-lg"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                >
                                    <FileText className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-teal-100">Manajemen</p>
                                    <h1 className="text-2xl font-bold">Session Templates</h1>
                                </div>
                            </div>
                            <motion.div whileTap={{ scale: 0.95 }}>
                                <Button onClick={() => setCreateModal(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Template
                                </Button>
                            </motion.div>
                        </div>
                        <p className="mt-4 text-teal-100">Buat template untuk generate sesi otomatis</p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/30"
                            >
                                <FileText className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-500">Total Templates</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    <AnimatedCounter value={stats.total} duration={1500} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-500">Template Aktif</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    <AnimatedCounter value={stats.active} duration={1500} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="rounded-xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 10 }}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            >
                                <Zap className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-gray-500">Auto-Activate</p>
                                <p className="text-xl font-bold text-blue-600">
                                    <AnimatedCounter value={stats.autoActivate} duration={1500} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari template atau mata kuliah..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterActive('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterActive === 'all'
                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            Semua
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterActive('active')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterActive === 'active'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            Aktif
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterActive('inactive')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterActive === 'inactive'
                                    ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                            Nonaktif
                        </motion.button>
                    </div>
                </motion.div>

                {/* Templates Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredTemplates.map((template, idx) => (
                            <motion.div
                                key={template.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                className={`relative rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black overflow-hidden ${!template.is_active ? 'opacity-60' : ''}`}
                            >
                                {/* Gradient Border Effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(16, 185, 129, 0.1))',
                                    }}
                                />
                                
                                <div className="relative">
                                    {/* Header */}
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                                                <p className="text-sm text-gray-500">{template.course?.nama}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <motion.span
                                                    whileHover={{ scale: 1.1 }}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${template.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}
                                                >
                                                    {template.is_active ? 'Aktif' : 'Nonaktif'}
                                                </motion.span>
                                                
                                                {/* Actions Menu */}
                                                <div className="relative">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                                                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                    </motion.button>
                                                    
                                                    <AnimatePresence>
                                                        {activeMenu === template.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                                            >
                                                                <div className="p-1">
                                                                    <button
                                                                        onClick={() => handleDuplicate(template)}
                                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                        Duplikat
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleToggleActive(template)}
                                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Settings className="h-4 w-4" />
                                                                        {template.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Body */}
                                    <div className="p-4 space-y-3">
                                        {template.description && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-sm text-gray-500 line-clamp-2"
                                            >
                                                {template.description}
                                            </motion.p>
                                        )}
                                        
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-2 text-sm text-gray-600"
                                        >
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>{template.default_start_time} - {template.default_end_time}</span>
                                            <span className="text-gray-400">({template.duration_minutes} menit)</span>
                                        </motion.div>
                                        
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <div className="flex flex-wrap gap-1">
                                                {template.default_days.map(d => (
                                                    <motion.span
                                                        key={d}
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                    >
                                                        {DAYS[d].slice(0, 3)}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </motion.div>
                                        
                                        {template.auto_activate && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                whileHover={{ scale: 1.05 }}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                                            >
                                                <Zap className="h-3 w-3" />
                                                Auto-activate
                                            </motion.span>
                                        )}
                                        
                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="w-full" 
                                                    onClick={() => setGenerateModal({ open: true, template })}
                                                >
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Generate
                                                </Button>
                                            </motion.div>
                                            <motion.div whileTap={{ scale: 0.95 }}>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => openEditModal(template)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                            <motion.div whileTap={{ scale: 0.95 }}>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                                    onClick={() => openDeleteDialog(template.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {/* Empty State */}
                    {filteredTemplates.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black py-12 text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            </motion.div>
                            <p className="text-gray-500 mb-4">
                                {searchQuery || filterActive !== 'all' 
                                    ? 'Tidak ada template yang sesuai' 
                                    : 'Belum ada template'}
                            </p>
                            {!searchQuery && filterActive === 'all' && (
                                <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button onClick={() => setCreateModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Template Pertama
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(createModal || editModal.open) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => { setCreateModal(false); setEditModal({ open: false, template: null }); form.reset(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{editModal.template ? 'Edit Template' : 'Buat Template Baru'}</h3>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setCreateModal(false); setEditModal({ open: false, template: null }); form.reset(); }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Label className="mb-2 block">Mata Kuliah</Label>
                                    <Select value={form.data.course_id} onValueChange={(v) => form.setData('course_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                                        <SelectContent>{courses.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>))}</SelectContent>
                                    </Select>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Label className="mb-2 block">Nama Template</Label>
                                    <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Contoh: Jadwal Reguler" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Label className="mb-2 block">Deskripsi (opsional)</Label>
                                    <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Deskripsi template..." />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div><Label className="mb-2 block">Jam Mulai</Label><Input type="time" value={form.data.default_start_time} onChange={(e) => form.setData('default_start_time', e.target.value)} /></div>
                                    <div><Label className="mb-2 block">Jam Selesai</Label><Input type="time" value={form.data.default_end_time} onChange={(e) => form.setData('default_end_time', e.target.value)} /></div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Label className="mb-2 block">Hari Default</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS.map((day, idx) => (
                                            <motion.label
                                                key={idx}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <Checkbox checked={form.data.default_days.includes(idx)} onCheckedChange={() => toggleDay(idx)} />
                                                <span className="text-sm">{day}</span>
                                            </motion.label>
                                        ))}
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="flex items-center gap-2"
                                >
                                    <Switch checked={form.data.auto_activate} onCheckedChange={(v) => form.setData('auto_activate', v)} />
                                    <Label>Auto-activate sesi yang dibuat</Label>
                                </motion.div>
                                <div className="flex gap-2 pt-2">
                                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                        <Button onClick={editModal.template ? handleUpdate : handleCreate} disabled={form.processing} className="w-full">
                                            {editModal.template ? 'Simpan' : 'Buat'}
                                        </Button>
                                    </motion.div>
                                    <motion.div whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" onClick={() => { setCreateModal(false); setEditModal({ open: false, template: null }); form.reset(); }}>
                                            Batal
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generate Modal */}
            <AnimatePresence>
                {generateModal.open && generateModal.template && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setGenerateModal({ open: false, template: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-black"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Generate Sesi dari Template</h3>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setGenerateModal({ open: false, template: null })}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl border border-teal-200 dark:border-teal-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/50"
                                        >
                                            <FileText className="h-5 w-5" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{generateModal.template.name}</p>
                                            <p className="text-sm text-gray-500">{generateModal.template.course?.nama}</p>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                                <Clock className="h-3 w-3" />
                                                <span>{generateModal.template.default_start_time} - {generateModal.template.default_end_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Label className="mb-2 block">Tanggal Mulai</Label>
                                    <Input type="date" value={generateForm.data.start_date} onChange={(e) => generateForm.setData('start_date', e.target.value)} />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Label className="mb-2 block">Jumlah Pertemuan</Label>
                                    <Input type="number" min={1} max={21} value={generateForm.data.total_meetings} onChange={(e) => generateForm.setData('total_meetings', parseInt(e.target.value))} />
                                    <p className="text-xs text-gray-500 mt-1">2 SKS = 14 pertemuan, 3 SKS = 21 pertemuan</p>
                                </motion.div>
                                <div className="flex gap-2 pt-2">
                                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                        <Button onClick={handleGenerate} disabled={generateForm.processing} className="w-full">
                                            <Play className="h-4 w-4 mr-2" />
                                            Generate Sesi
                                        </Button>
                                    </motion.div>
                                    <motion.div whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" onClick={() => setGenerateModal({ open: false, template: null })}>
                                            Batal
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                onConfirm={handleDelete}
                title="Hapus Template"
                message="Yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </DosenLayout>
    );
}
