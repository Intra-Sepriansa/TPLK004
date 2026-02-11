import { Head, router, useForm } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
    FileText, Plus, Clock, CheckCircle, XCircle, Upload, Trash2, Eye, X,
    HeartPulse, Calendar, AlertTriangle, BarChart3, Send, Sparkles, FileCheck, Star,
    ArrowLeft, ArrowRight, ClipboardList, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState, FormEvent } from 'react';

interface Props {
    permits: Array<{
        id: number;
        type: 'izin' | 'sakit';
        reason: string;
        attachment: string | null;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason: string | null;
        session: {
            id: number;
            mata_kuliah: string;
            tanggal: string;
            tanggal_display: string;
        };
        approver: string | null;
        approved_at: string | null;
        created_at: string;
    }>;
    availableSessions: Array<{
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
        waktu: string;
    }>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string };
}

export default function Permit({ permits, availableSessions, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [formStep, setFormStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
            },
        },
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        attendance_session_id: '',
        type: 'izin' as 'izin' | 'sakit',
        reason: '',
        attachment: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/permit', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
                setFormStep(1);
            },
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('attachment', e.dataTransfer.files[0]);
        }
    };

    const nextStep = () => {
        if (formStep < 3) setFormStep(formStep + 1);
    };

    const prevStep = () => {
        if (formStep > 1) setFormStep(formStep - 1);
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/user/permit/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/user/permit', { status: tab }, { preserveState: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { icon: Clock, label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
            case 'approved': return { icon: CheckCircle, label: 'Disetujui', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
            case 'rejected': return { icon: XCircle, label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
            default: return { icon: Clock, label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
        }
    };

    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

    return (
        <StudentLayout>
            <Head title="Pengajuan Izin/Sakit" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 p-6"
            >
                {/* Header with Advanced Animations */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                        />
                        
                        {/* Floating Medical Icons */}
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -40, -80],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            >
                                <HeartPulse className="h-4 w-4 text-white/40" />
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                                >
                                    <HeartPulse className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-white/90 font-medium"
                                    >
                                        Administrasi Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Pengajuan Izin/Sakit
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur border-0 shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajukan Izin
                                </Button>
                            </motion.div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Ajukan izin atau sakit dengan upload surat keterangan resmi
                        </motion.p>
                        
                        {/* Quick Stats with Dock-Style Animations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: BarChart3, label: 'Total Pengajuan', value: stats.total },
                                { icon: Clock, label: 'Menunggu', value: stats.pending },
                                { icon: CheckCircle, label: 'Disetujui', value: stats.approved },
                                { icon: FileCheck, label: 'Approval Rate', value: approvalRate, suffix: '%' },
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        y: -5,
                                        boxShadow: "0 10px 30px rgba(255,255,255,0.2)"
                                    }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <motion.div
                                            whileHover={{ scale: 1.2, y: -2 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        >
                                            <stat.icon className="h-5 w-5 text-white/80" />
                                        </motion.div>
                                        <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-3xl font-bold">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Cards with Dock-Style Animations */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-4 grid-cols-2 md:grid-cols-4"
                >
                    {[
                        { icon: BarChart3, label: 'Total', value: stats.total, gradient: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-500/50', color: 'slate' },
                        { icon: Clock, label: 'Menunggu', value: stats.pending, gradient: 'from-yellow-400 to-yellow-600', shadow: 'shadow-yellow-500/50', color: 'yellow' },
                        { icon: CheckCircle, label: 'Disetujui', value: stats.approved, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/50', color: 'emerald' },
                        { icon: XCircle, label: 'Ditolak', value: stats.rejected, gradient: 'from-red-400 to-red-600', shadow: 'shadow-red-500/50', color: 'red' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.08, 
                                y: -10,
                                boxShadow: `0 20px 40px ${stat.color === 'slate' ? 'rgba(100, 116, 139, 0.3)' : stat.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : stat.color === 'emerald' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-5 shadow-lg backdrop-blur dark:border-slate-800/50 dark:from-slate-900/80 dark:to-black/80 overflow-hidden cursor-pointer"
                        >
                            {/* Glow Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-current/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                animate={{
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow}`}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Permits List */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Pengajuan</h2>
                                <p className="text-xs text-slate-500">Lihat status pengajuan izin/sakit kamu</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua', icon: BarChart3, count: stats.total },
                                { value: 'pending', label: 'Menunggu', icon: Clock, count: stats.pending },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: XCircle, count: stats.rejected },
                            ].map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === tab.value
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-800 dark:text-slate-300'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                        activeTab === tab.value ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Permits Items */}
                        {permits.length > 0 ? (
                            <div className="space-y-4">
                                {permits.map((permit, index) => {
                                    const statusConfig = getStatusConfig(permit.status);
                                    const StatusIcon = statusConfig.icon;
                                    
                                    return (
                                        <motion.div 
                                            key={permit.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            className={`rounded-2xl border-2 p-5 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-all ${
                                                permit.status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' :
                                                permit.status === 'approved' ? 'border-emerald-200 dark:border-emerald-800' :
                                                permit.status === 'rejected' ? 'border-red-200 dark:border-red-800' :
                                                'border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div className="flex-1">
                                                    {/* Status & Type Badges */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                                                            permit.type === 'sakit' 
                                                                ? 'bg-red-100 text-red-700' 
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {permit.type === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Course & Date */}
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{permit.session.mata_kuliah}</h4>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {permit.session.tanggal_display}
                                                    </p>
                                                    
                                                    {/* Reason */}
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
                                                        {permit.reason}
                                                    </p>
                                                    
                                                    {/* Rejection Reason */}
                                                    {permit.status === 'rejected' && permit.rejection_reason && (
                                                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                                            <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                                                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                                                <span><strong>Alasan ditolak:</strong> {permit.rejection_reason}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Approval Info */}
                                                    {permit.status === 'approved' && permit.approver && (
                                                        <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Disetujui oleh {permit.approver} pada {permit.approved_at}
                                                        </p>
                                                    )}
                                                    
                                                    <p className="text-xs text-slate-400 mt-2">Diajukan: {permit.created_at}</p>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {permit.attachment && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => setPreviewImage(permit.attachment)}
                                                            className="rounded-xl"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Lihat Surat
                                                        </Button>
                                                    )}
                                                    {permit.status === 'pending' && (
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm" 
                                                            onClick={() => openDeleteDialog(permit.id)}
                                                            className="rounded-xl"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                                    <FileText className="h-10 w-10 text-teal-500" />
                                </div>
                                <p className="text-slate-500 font-medium">Belum ada pengajuan</p>
                                <p className="text-sm text-slate-400 mt-1">Klik tombol "Ajukan Izin" untuk membuat pengajuan baru</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg"
                                >
                                    <HeartPulse className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ajukan Izin/Sakit</h3>
                                    <p className="text-sm text-slate-500">Isi form berikut dengan lengkap</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowForm(false); setFormStep(1); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-between mb-6 px-4">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <motion.div
                                        animate={{
                                            scale: formStep === step ? 1.1 : 1,
                                            backgroundColor: formStep >= step ? '#14b8a6' : '#e5e7eb'
                                        }}
                                        className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold"
                                    >
                                        {formStep > step ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            step
                                        )}
                                    </motion.div>
                                    {step < 3 && (
                                        <motion.div
                                            animate={{
                                                backgroundColor: formStep > step ? '#14b8a6' : '#e5e7eb'
                                            }}
                                            className="flex-1 h-1 mx-2"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Session Selection */}
                                {formStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="text-center mb-4">
                                            <h3 className="text-lg font-semibold text-teal-600">Pilih Sesi Perkuliahan</h3>
                                            <p className="text-sm text-muted-foreground">Pilih sesi yang ingin kamu ajukan izin/sakit</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-teal-600" />
                                                Sesi Perkuliahan
                                            </Label>
                                            <Select value={data.attendance_session_id} onValueChange={(v) => setData('attendance_session_id', v)}>
                                                <SelectTrigger className="h-12 border-2 hover:border-teal-300 transition-colors rounded-xl">
                                                    <SelectValue placeholder="Pilih sesi perkuliahan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableSessions.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-teal-600" />
                                                                {s.mata_kuliah} - {s.tanggal_display}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.attendance_session_id && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {errors.attendance_session_id}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-teal-600" />
                                                Jenis Pengajuan
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { value: 'izin', label: 'Izin', icon: ClipboardList, color: 'blue' },
                                                    { value: 'sakit', label: 'Sakit', icon: Stethoscope, color: 'red' }
                                                ].map((type) => (
                                                    <motion.button
                                                        key={type.value}
                                                        type="button"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setData('type', type.value as any)}
                                                        className={`p-4 rounded-xl border-2 transition-all ${
                                                            data.type === type.value
                                                                ? type.color === 'blue'
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                                                    : 'border-red-500 bg-red-50 dark:bg-red-950/30'
                                                                : 'border-gray-200 hover:border-teal-300 dark:border-gray-700'
                                                        }`}
                                                    >
                                                        <motion.div
                                                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                                            transition={{ duration: 0.5 }}
                                                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                                                type.color === 'blue' 
                                                                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                                                                    : 'bg-red-100 dark:bg-red-900/30'
                                                            }`}
                                                        >
                                                            <type.icon className={`h-6 w-6 ${
                                                                type.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                                                            }`} />
                                                        </motion.div>
                                                        <div className="text-sm font-medium">{type.label}</div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Reason */}
                                {formStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="text-center mb-4">
                                            <h3 className="text-lg font-semibold text-teal-600">Alasan Pengajuan</h3>
                                            <p className="text-sm text-muted-foreground">Jelaskan alasan izin/sakit dengan detail</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-teal-600" />
                                                Alasan
                                            </Label>
                                            <Textarea
                                                value={data.reason}
                                                onChange={(e) => setData('reason', e.target.value)}
                                                placeholder="Jelaskan alasan izin/sakit dengan detail..."
                                                rows={6}
                                                className="border-2 hover:border-teal-300 focus:border-teal-500 transition-colors resize-none rounded-xl"
                                            />
                                            {errors.reason && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {errors.reason}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-teal-50 dark:bg-teal-950/20 rounded-xl border border-teal-200 dark:border-teal-800">
                                            <p className="text-sm text-teal-700 dark:text-teal-300 flex items-start gap-2">
                                                <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>Pastikan alasan yang kamu berikan jelas dan detail agar mudah disetujui oleh dosen</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Attachment */}
                                {formStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="text-center mb-4">
                                            <h3 className="text-lg font-semibold text-teal-600">Surat Keterangan</h3>
                                            <p className="text-sm text-muted-foreground">Upload surat keterangan (opsional)</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Upload className="h-4 w-4 text-teal-600" />
                                                Surat Keterangan (Opsional)
                                            </Label>
                                            <div
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                                                    dragActive
                                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20'
                                                        : 'border-gray-300 hover:border-teal-400'
                                                }`}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    id="attachment"
                                                />
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="mx-auto w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-3"
                                                    >
                                                        <Upload className="h-6 w-6 text-teal-600" />
                                                    </motion.div>
                                                    <p className="text-sm font-medium mb-1">
                                                        {data.attachment ? data.attachment.name : 'Drag & drop file atau klik untuk upload'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        JPG, PNG, PDF (max 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                            {data.attachment && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg"
                                                >
                                                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                                                        <FileCheck className="h-4 w-4 text-teal-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{data.attachment.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(data.attachment.size / 1024).toFixed(2)} KB
                                                        </p>
                                                    </div>
                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                </motion.div>
                                            )}
                                            {errors.attachment && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {errors.attachment}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                                <Star className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>Upload surat keterangan resmi untuk mempercepat proses persetujuan</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <div className="flex gap-3 pt-4 border-t">
                                {formStep > 1 && (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="button" variant="outline" onClick={prevStep} className="gap-2 rounded-xl">
                                            <ArrowLeft className="h-4 w-4" />
                                            Kembali
                                        </Button>
                                    </motion.div>
                                )}
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormStep(1); }} className="flex-1 rounded-xl">
                                    Batal
                                </Button>
                                {formStep < 3 ? (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button type="button" onClick={nextStep} className="gap-2 rounded-xl bg-teal-600 hover:bg-teal-700">
                                            Lanjut
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
                                        >
                                            {processing ? (
                                                <>
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </motion.div>
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Kirim Pengajuan
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Surat Keterangan</h3>
                            <button onClick={() => setPreviewImage(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        {previewImage.endsWith('.pdf') ? (
                            <iframe src={previewImage} className="w-full h-[500px] rounded-xl" />
                        ) : (
                            <img src={previewImage} alt="Surat Keterangan" className="w-full rounded-xl" />
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                onConfirm={handleDelete}
                title="Batalkan Pengajuan"
                message="Yakin ingin membatalkan pengajuan izin/sakit ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                confirmText="Ya, Batalkan"
                cancelText="Tidak"
            />
        </StudentLayout>
    );
}
