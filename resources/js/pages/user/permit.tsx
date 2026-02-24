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
                staggerChildren: 0.05,
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
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
            },
        },
    } as const;

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
                            transition={{ delay: 0.2 }}
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
                                            transition={{ delay: 0.2 }}
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

            {/* Ultra Advanced Form Modal */}
            <AnimatePresence>
            {showForm && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    onClick={() => { setShowForm(false); setFormStep(1); }}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.85, y: 30, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 30, rotateX: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-gray-900 dark:via-black dark:to-gray-900 p-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-slate-200/50 dark:border-gray-800/50"
                        style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Animated Background Orbs */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 90, 180],
                                    opacity: [0.05, 0.1, 0.05],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    rotate: [180, 90, 0],
                                    opacity: [0.05, 0.08, 0.05],
                                }}
                                transition={{
                                    duration: 18,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 blur-3xl"
                            />
                        </div>

                        {/* Header with Close Button */}
                        <div className="relative flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                    whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
                                    className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white shadow-2xl shadow-teal-500/30"
                                >
                                    {/* Glow Effect */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 blur-xl"
                                    />
                                    <HeartPulse className="relative h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.h3 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-2xl font-bold text-slate-900 dark:text-white"
                                    >
                                        Ajukan Izin/Sakit
                                    </motion.h3>
                                    <motion.p 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm text-slate-600 dark:text-slate-400 font-medium"
                                    >
                                        Isi form berikut dengan lengkap dan jelas
                                    </motion.p>
                                </div>
                            </div>
                            <motion.button 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => { setShowForm(false); setFormStep(1); }} 
                                className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                            >
                                <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                            </motion.button>
                        </div>

                        {/* Ultra Advanced Progress Steps */}
                        <div className="relative mb-10 px-6">
                            <div className="flex items-center justify-between">
                                {[
                                    { step: 1, label: 'Pilih Sesi', icon: Calendar },
                                    { step: 2, label: 'Alasan', icon: FileText },
                                    { step: 3, label: 'Lampiran', icon: Upload }
                                ].map((item, index) => (
                                    <div key={item.step} className="flex items-center flex-1">
                                        <div className="relative flex flex-col items-center">
                                            {/* Step Circle with Advanced Animations */}
                                            <motion.div
                                                animate={{
                                                    scale: formStep === item.step ? [1, 1.15, 1] : 1,
                                                    boxShadow: formStep === item.step 
                                                        ? ['0 0 0 0 rgba(20, 184, 166, 0)', '0 0 0 15px rgba(20, 184, 166, 0.1)', '0 0 0 0 rgba(20, 184, 166, 0)']
                                                        : '0 0 0 0 rgba(20, 184, 166, 0)',
                                                }}
                                                transition={{
                                                    scale: { duration: 0.3 },
                                                    boxShadow: { duration: 2, repeat: formStep === item.step ? Infinity : 0 }
                                                }}
                                                className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-lg transition-all duration-500 ${
                                                    formStep >= item.step
                                                        ? 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white shadow-xl shadow-teal-500/30'
                                                        : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-600'
                                                }`}
                                            >
                                                <AnimatePresence mode="wait">
                                                    {formStep > item.step ? (
                                                        <motion.div
                                                            key="check"
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            exit={{ scale: 0, rotate: 180 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                        >
                                                            <CheckCircle className="h-6 w-6" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="icon"
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            exit={{ scale: 0, rotate: 180 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                        >
                                                            <item.icon className="h-6 w-6" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                
                                                {/* Pulse Ring for Active Step */}
                                                {formStep === item.step && (
                                                    <motion.div
                                                        initial={{ scale: 1, opacity: 0.5 }}
                                                        animate={{ scale: 1.5, opacity: 0 }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className="absolute inset-0 rounded-2xl bg-teal-400"
                                                    />
                                                )}
                                            </motion.div>
                                            
                                            {/* Step Label */}
                                            <motion.p
                                                animate={{
                                                    color: formStep >= item.step ? '#14b8a6' : '#94a3b8',
                                                    fontWeight: formStep === item.step ? 700 : 500,
                                                }}
                                                className="mt-3 text-xs text-center whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.p>
                                        </div>
                                        
                                        {/* Connecting Line */}
                                        {index < 2 && (
                                            <div className="relative flex-1 h-1 mx-3 mt-[-30px]">
                                                <div className="absolute inset-0 bg-slate-200 dark:bg-gray-800 rounded-full" />
                                                <motion.div
                                                    initial={{ width: '0%' }}
                                                    animate={{
                                                        width: formStep > item.step ? '100%' : '0%',
                                                    }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                    className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 rounded-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Form Content with Advanced Animations */}
                        <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-slate-200 dark:scrollbar-track-gray-800">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Session Selection - Ultra Enhanced */}
                                {formStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="space-y-6"
                                    >
                                        {/* Step Header with Animation */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                                            className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-200/50 dark:border-teal-800/50"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, 5, -5, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="inline-block mb-3"
                                            >
                                                <Calendar className="h-12 w-12 text-teal-600 dark:text-teal-400" />
                                            </motion.div>
                                            <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-2">Pilih Sesi Perkuliahan</h3>
                                            <p className="text-sm text-teal-600 dark:text-teal-400">Pilih sesi yang ingin kamu ajukan izin/sakit</p>
                                        </motion.div>

                                        {/* Session Selection with Enhanced Styling */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-3"
                                        >
                                            <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                <motion.div
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                </motion.div>
                                                Sesi Perkuliahan
                                            </Label>
                                            <Select value={data.attendance_session_id} onValueChange={(v) => setData('attendance_session_id', v)}>
                                                <SelectTrigger className="h-14 border-2 hover:border-teal-400 focus:border-teal-500 transition-all rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
                                                    <SelectValue placeholder="🎓 Pilih sesi perkuliahan" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {availableSessions.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)} className="rounded-lg my-1">
                                                            <div className="flex items-center gap-3 py-1">
                                                                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                                                    <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 dark:text-white">{s.mata_kuliah}</p>
                                                                    <p className="text-xs text-slate-500">{s.tanggal_display}</p>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <AnimatePresence>
                                                {errors.attendance_session_id && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                        className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                    >
                                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                                        {errors.attendance_session_id}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Type Selection with Ultra Advanced Cards */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-3"
                                        >
                                            <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                <motion.div
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                </motion.div>
                                                Jenis Pengajuan
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { value: 'izin', label: 'Izin', icon: ClipboardList, color: 'blue', gradient: 'from-blue-400 to-blue-600', emoji: '📝' },
                                                    { value: 'sakit', label: 'Sakit', icon: Stethoscope, color: 'red', gradient: 'from-red-400 to-red-600', emoji: '🏥' }
                                                ].map((type, index) => (
                                                    <motion.button
                                                        key={type.value}
                                                        type="button"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 300 }}
                                                        whileHover={{ scale: 1.05, y: -5 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setData('type', type.value as any)}
                                                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                                                            data.type === type.value
                                                                ? type.color === 'blue'
                                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 shadow-xl shadow-blue-500/20'
                                                                    : 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 shadow-xl shadow-red-500/20'
                                                                : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-600'
                                                        }`}
                                                    >
                                                        {/* Animated Background Gradient */}
                                                        {data.type === type.value && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{ opacity: 0.1, scale: 1 }}
                                                                className={`absolute inset-0 bg-gradient-to-br ${type.gradient}`}
                                                            />
                                                        )}
                                                        
                                                        {/* Floating Particles */}
                                                        {data.type === type.value && [...Array(5)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, y: 0 }}
                                                                animate={{
                                                                    opacity: [0, 1, 0],
                                                                    y: [0, -30, -60],
                                                                    x: [0, Math.random() * 20 - 10, 0],
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                    delay: i * 0.3,
                                                                }}
                                                                className="absolute w-2 h-2 rounded-full bg-current"
                                                                style={{
                                                                    left: `${20 + i * 15}%`,
                                                                    bottom: '20%',
                                                                }}
                                                            />
                                                        ))}
                                                        
                                                        <div className="relative">
                                                            <motion.div
                                                                whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.1 }}
                                                                transition={{ duration: 0.6 }}
                                                                className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                                                                    data.type === type.value
                                                                        ? type.color === 'blue' 
                                                                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30' 
                                                                            : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30'
                                                                        : 'bg-slate-100 dark:bg-gray-700'
                                                                }`}
                                                            >
                                                                <type.icon className={`h-8 w-8 ${
                                                                    data.type === type.value ? 'text-white' : 'text-slate-400 dark:text-gray-500'
                                                                }`} />
                                                            </motion.div>
                                                            <div className="text-center">
                                                                <p className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                                                                    <span>{type.emoji}</span>
                                                                    <span className={data.type === type.value ? 
                                                                        (type.color === 'blue' ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300')
                                                                        : 'text-slate-700 dark:text-slate-300'
                                                                    }>
                                                                        {type.label}
                                                                    </span>
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {type.value === 'izin' ? 'Keperluan pribadi' : 'Kondisi kesehatan'}
                                                                </p>
                                                            </div>
                                                            
                                                            {/* Checkmark Indicator */}
                                                            <AnimatePresence>
                                                                {data.type === type.value && (
                                                                    <motion.div
                                                                        initial={{ scale: 0, rotate: -180 }}
                                                                        animate={{ scale: 1, rotate: 0 }}
                                                                        exit={{ scale: 0, rotate: 180 }}
                                                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                        className="absolute top-3 right-3"
                                                                    >
                                                                        <div className={`p-1.5 rounded-full ${
                                                                            type.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
                                                                        } shadow-lg`}>
                                                                            <CheckCircle className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* Step 2: Reason - Ultra Enhanced */}
                                {formStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="space-y-6"
                                    >
                                        {/* Step Header with Animation */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                                            className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200/50 dark:border-purple-800/50"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, -5, 5, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="inline-block mb-3"
                                            >
                                                <FileText className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                                            </motion.div>
                                            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">Alasan Pengajuan</h3>
                                            <p className="text-sm text-purple-600 dark:text-purple-400">Jelaskan alasan izin/sakit dengan detail dan jelas</p>
                                        </motion.div>

                                        {/* Textarea with Character Counter */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-3"
                                        >
                                            <Label className="flex items-center justify-between text-base font-semibold text-slate-700 dark:text-slate-300">
                                                <span className="flex items-center gap-2">
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                    >
                                                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    </motion.div>
                                                    Alasan Detail
                                                </span>
                                                <motion.span 
                                                    animate={{
                                                        color: data.reason.length < 20 ? '#ef4444' : data.reason.length < 50 ? '#f59e0b' : '#10b981'
                                                    }}
                                                    className="text-xs font-mono"
                                                >
                                                    {data.reason.length}/500
                                                </motion.span>
                                            </Label>
                                            <div className="relative">
                                                <Textarea
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    placeholder="Contoh: Saya tidak dapat mengikuti perkuliahan karena sakit demam tinggi dan harus beristirahat di rumah sesuai anjuran dokter..."
                                                    rows={8}
                                                    maxLength={500}
                                                    className="border-2 hover:border-purple-400 focus:border-purple-500 transition-all resize-none rounded-xl bg-white dark:bg-gray-800 shadow-sm focus:shadow-lg pr-12"
                                                />
                                                {/* Character indicator */}
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: data.reason.length > 0 ? 1 : 0 }}
                                                    className="absolute bottom-3 right-3"
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        data.reason.length < 20 ? 'bg-red-100 text-red-600' :
                                                        data.reason.length < 50 ? 'bg-amber-100 text-amber-600' :
                                                        'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                        {Math.round((data.reason.length / 500) * 100)}%
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <AnimatePresence>
                                                {errors.reason && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                        className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                    >
                                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                                        {errors.reason}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Tips Card with Animation */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-2xl border-2 border-teal-200/50 dark:border-teal-800/50"
                                        >
                                            <div className="flex items-start gap-3">
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, 10, -10, 0],
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-2">Tips Pengajuan:</p>
                                                    <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1.5">
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-teal-500 mt-0.5">•</span>
                                                            <span>Jelaskan kondisi atau situasi dengan detail</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-teal-500 mt-0.5">•</span>
                                                            <span>Sebutkan tanggal dan waktu kejadian</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-teal-500 mt-0.5">•</span>
                                                            <span>Gunakan bahasa yang sopan dan formal</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* Step 3: Attachment - Ultra Enhanced with Advanced Drag & Drop */}
                                {formStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="space-y-6"
                                    >
                                        {/* Step Header with Animation */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                                            className="text-center mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200/50 dark:border-blue-800/50"
                                        >
                                            <motion.div
                                                animate={{
                                                    y: [0, -10, 0],
                                                    rotate: [0, 5, -5, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="inline-block mb-3"
                                            >
                                                <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                            </motion.div>
                                            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Surat Keterangan</h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">Upload surat keterangan resmi (opsional)</p>
                                        </motion.div>

                                        {/* Ultra Advanced Drag & Drop Zone */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-3"
                                        >
                                            <Label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300">
                                                <motion.div
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </motion.div>
                                                Lampiran Dokumen
                                            </Label>
                                            <motion.div
                                                animate={{
                                                    scale: dragActive ? 1.02 : 1,
                                                    borderColor: dragActive ? '#3b82f6' : undefined,
                                                }}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 overflow-hidden ${
                                                    dragActive
                                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-xl shadow-blue-500/20'
                                                        : 'border-slate-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                                                }`}
                                            >
                                                {/* Animated Background Pattern */}
                                                <motion.div
                                                    animate={{
                                                        opacity: dragActive ? 0.1 : 0,
                                                        scale: dragActive ? 1 : 0.8,
                                                    }}
                                                    className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500"
                                                />
                                                
                                                {/* Floating Upload Icons */}
                                                {dragActive && [...Array(8)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 0 }}
                                                        animate={{
                                                            opacity: [0, 1, 0],
                                                            y: [0, -40, -80],
                                                            x: [0, Math.random() * 40 - 20, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: i * 0.2,
                                                        }}
                                                        className="absolute"
                                                        style={{
                                                            left: `${20 + i * 10}%`,
                                                            bottom: '20%',
                                                        }}
                                                    >
                                                        <Upload className="h-4 w-4 text-blue-400" />
                                                    </motion.div>
                                                ))}
                                                
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    id="attachment"
                                                />
                                                <div className="relative text-center">
                                                    <motion.div
                                                        animate={{ 
                                                            y: dragActive ? [0, -15, 0] : [0, -10, 0],
                                                            scale: dragActive ? [1, 1.1, 1] : 1,
                                                        }}
                                                        transition={{ 
                                                            duration: dragActive ? 1 : 2, 
                                                            repeat: Infinity 
                                                        }}
                                                        className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                                                            dragActive 
                                                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30' 
                                                                : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                                                        }`}
                                                    >
                                                        <Upload className={`h-10 w-10 ${
                                                            dragActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                                                        }`} />
                                                    </motion.div>
                                                    <AnimatePresence mode="wait">
                                                        {data.attachment ? (
                                                            <motion.div
                                                                key="has-file"
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.9 }}
                                                            >
                                                                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-center gap-2">
                                                                    <CheckCircle className="h-5 w-5" />
                                                                    File Terpilih!
                                                                </p>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                                    {data.attachment.name}
                                                                </p>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="no-file"
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.9 }}
                                                            >
                                                                <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                                    {dragActive ? '📥 Lepaskan file di sini' : '📎 Drag & drop file atau klik untuk upload'}
                                                                </p>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                    JPG, PNG, PDF • Max 5MB
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                            
                                            {/* File Preview Card */}
                                            <AnimatePresence>
                                                {data.attachment && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                        className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-lg"
                                                    >
                                                        <motion.div 
                                                            animate={{
                                                                scale: [1, 1.1, 1],
                                                                rotate: [0, 5, -5, 0],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                            }}
                                                            className="p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30"
                                                        >
                                                            <FileCheck className="h-8 w-8 text-white" />
                                                        </motion.div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 truncate mb-1">
                                                                {data.attachment.name}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400">
                                                                <span className="font-mono">{(data.attachment.size / 1024).toFixed(2)} KB</span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Siap diupload
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setData('attachment', null)}
                                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                        >
                                                            <X className="h-5 w-5 text-red-500" />
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            <AnimatePresence>
                                                {errors.attachment && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                                        className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                                                    >
                                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                                        {errors.attachment}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Info Card */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/50"
                                        >
                                            <div className="flex items-start gap-3">
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, -10, 10, 0],
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Catatan Penting:</p>
                                                    <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-amber-500 mt-0.5">•</span>
                                                            <span>Upload surat keterangan resmi untuk mempercepat persetujuan</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-amber-500 mt-0.5">•</span>
                                                            <span>Pastikan file jelas dan mudah dibaca</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="text-amber-500 mt-0.5">•</span>
                                                            <span>Format yang didukung: JPG, PNG, PDF</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
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
                </motion.div>
            )}
            </AnimatePresence>

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
