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
import { SessionTemplateWizard } from '@/components/dosen/session-template-wizard';
import { 
    FileText, Plus, Edit, Trash2, Calendar, Clock, Play, X, 
    Copy, MoreVertical, Search, Filter, TrendingUp, Zap,
    CheckCircle2, Settings, Sparkles, LayoutTemplate, RefreshCw,
    Download, Upload, Eye, ChevronRight, Info, AlertCircle
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
    const [previewModal, setPreviewModal] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);

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
                {/* Header - Black Theme with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Orbs */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1], 
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 30, 0],
                            y: [0, -20, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1], 
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, -30, 0],
                            y: [0, 20, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.25, 1], 
                            opacity: [0.25, 0.45, 0.25],
                            rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl"
                    />

                    {/* Floating Icons */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-8 right-32 opacity-10"
                    >
                        <LayoutTemplate className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-8 left-32 opacity-10"
                    >
                        <Sparkles className="h-12 w-12" />
                    </motion.div>

                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                                >
                                    <LayoutTemplate className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-gray-400"
                                    >
                                        Manajemen Template
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                    >
                                        Session Templates
                                    </motion.h1>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button 
                                        onClick={() => setCreateModal(true)} 
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/30"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Template
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-gray-400 flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            Buat template untuk generate sesi otomatis dengan konfigurasi yang dapat digunakan berulang kali
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats Cards - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Templates</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    <AnimatedCounter value={stats.total} duration={1500} />
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Template tersimpan</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
                            >
                                <LayoutTemplate className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Template Aktif</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">
                                    <AnimatedCounter value={stats.active} duration={1500} />
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Siap digunakan</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
                            >
                                <CheckCircle2 className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-Activate</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    <AnimatedCounter value={stats.autoActivate} duration={1500} />
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Otomatis aktif</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30"
                            >
                                <Zap className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata Durasi</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    <AnimatedCounter 
                                        value={templates.length > 0 ? Math.round(templates.reduce((sum, t) => sum + t.duration_minutes, 0) / templates.length) : 0} 
                                        duration={1500} 
                                    />
                                    <span className="text-lg ml-1">min</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Per sesi</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30"
                            >
                                <Clock className="h-7 w-7 text-white" />
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Quick Actions Bar */}
                {selectedTemplates.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 shadow-lg dark:border-indigo-800 dark:from-indigo-900/20 dark:to-purple-900/20"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white"
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {selectedTemplates.length} template dipilih
                                    </p>
                                    <p className="text-sm text-gray-500">Pilih aksi untuk template yang dipilih</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="sm" variant="outline">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplikat
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedTemplates([])}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Search & Filter - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-2xl border-2 border-gray-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600"
                        >
                            <Filter className="h-5 w-5 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Filter & Pencarian</h3>
                            <p className="text-xs text-gray-500">Temukan template dengan mudah</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari template atau mata kuliah..."
                                className="pl-10 border-2 focus:ring-4 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterActive('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterActive === 'all'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                Semua
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterActive('active')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterActive === 'active'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                Aktif
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilterActive('inactive')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterActive === 'inactive'
                                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                Nonaktif
                            </motion.button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Menampilkan {filteredTemplates.length} dari {templates.length} template</span>
                        {searchQuery && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSearchQuery('')}
                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </motion.button>
                        )}
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
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`relative rounded-2xl border-2 border-gray-200/70 bg-gradient-to-br from-white to-gray-50/80 shadow-lg backdrop-blur dark:border-gray-800/70 dark:from-black dark:to-gray-900/80 overflow-hidden group ${!template.is_active ? 'opacity-60' : ''}`}
                            >
                                {/* Gradient Border Effect on Hover */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                                    }}
                                />

                                {/* Selection Checkbox */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-4 left-4 z-10"
                                >
                                    <Checkbox
                                        checked={selectedTemplates.includes(template.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedTemplates([...selectedTemplates, template.id]);
                                            } else {
                                                setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                                            }
                                        }}
                                        className="h-5 w-5 border-2"
                                    />
                                </motion.div>
                                
                                <div className="relative">
                                    {/* Header */}
                                    <div className="p-5 border-b-2 border-gray-200 dark:border-gray-800">
                                        <div className="flex justify-between items-start pl-8">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{template.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{template.course?.nama}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <motion.span
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${template.is_active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}
                                                >
                                                    {template.is_active ? 'Aktif' : 'Nonaktif'}
                                                </motion.span>
                                                
                                                {/* Actions Menu */}
                                                <div className="relative">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                                                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                                                                className="absolute right-0 top-10 z-20 w-52 rounded-xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                                                            >
                                                                <div className="p-2">
                                                                    <button
                                                                        onClick={() => { setPreviewModal({ open: true, template }); setActiveMenu(null); }}
                                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                                    >
                                                                        <Eye className="h-4 w-4 text-indigo-600" />
                                                                        <span>Preview</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDuplicate(template)}
                                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                    >
                                                                        <Copy className="h-4 w-4 text-blue-600" />
                                                                        <span>Duplikat</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleToggleActive(template)}
                                                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                                    >
                                                                        <Settings className="h-4 w-4 text-emerald-600" />
                                                                        <span>{template.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
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
                                    <div className="p-5 space-y-4">
                                        {template.description && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic"
                                            >
                                                "{template.description}"
                                            </motion.p>
                                        )}
                                        
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{template.default_start_time} - {template.default_end_time}</p>
                                                <p className="text-xs text-gray-500">Durasi {template.duration_minutes} menit</p>
                                            </div>
                                        </motion.div>
                                        
                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            className="flex items-center gap-3 text-sm"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {template.default_days.map(d => (
                                                    <motion.span
                                                        key={d}
                                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 shadow-sm"
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
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                                            >
                                                <Zap className="h-3.5 w-3.5" />
                                                Auto-activate
                                            </motion.span>
                                        )}
                                        
                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                                <Button 
                                                    size="sm" 
                                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30" 
                                                    onClick={() => setGenerateModal({ open: true, template })}
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Generate
                                                </Button>
                                            </motion.div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="border-2"
                                                    onClick={() => openEditModal(template)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-red-200 hover:border-red-300" 
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

            {/* Create/Edit Modal - Advanced Multi-Step Wizard */}
            <SessionTemplateWizard
                isOpen={createModal || editModal.open}
                editTemplate={editModal.template}
                form={form}
                courses={courses}
                onClose={() => {
                    setCreateModal(false);
                    setEditModal({ open: false, template: null });
                    form.reset();
                }}
                onSubmit={editModal.template ? handleUpdate : handleCreate}
            />

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
