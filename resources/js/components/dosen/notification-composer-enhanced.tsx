import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    X, Send, Users, User, AlertCircle, Info, Megaphone, 
    Clock, AlertTriangle, Sparkles, Eye, Zap, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
}

interface Course {
    id: number;
    nama: string;
}

interface Props {
    isOpen: boolean;
    course: Course | null;
    mahasiswa: Mahasiswa[];
    onClose: () => void;
}

const NOTIFICATION_TYPES = [
    { value: 'info', label: 'Informasi', icon: Info, color: 'blue' },
    { value: 'reminder', label: 'Pengingat', icon: Clock, color: 'indigo' },
    { value: 'announcement', label: 'Pengumuman', icon: Megaphone, color: 'purple' },
    { value: 'warning', label: 'Peringatan', icon: AlertTriangle, color: 'orange' },
    { value: 'alert', label: 'Alert', icon: AlertCircle, color: 'red' },
] as const;

const PRIORITY_LEVELS = [
    { value: 'normal', label: 'Normal', color: 'gray' },
    { value: 'high', label: 'Penting', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' },
] as const;

const TEMPLATES = [
    {
        name: 'Pengingat Tugas',
        title: 'Pengingat: Deadline Tugas',
        message: 'Halo mahasiswa,\n\nIni adalah pengingat bahwa tugas [NAMA TUGAS] akan segera berakhir pada [TANGGAL].\n\nPastikan untuk mengumpulkan tepat waktu.\n\nTerima kasih.',
        type: 'reminder',
        priority: 'high',
    },
    {
        name: 'Pengumuman Kelas',
        title: 'Pengumuman: Perubahan Jadwal',
        message: 'Kepada seluruh mahasiswa,\n\nDiberitahukan bahwa jadwal perkuliahan [TANGGAL] akan [PERUBAHAN].\n\nMohon perhatiannya.\n\nTerima kasih.',
        type: 'announcement',
        priority: 'normal',
    },
    {
        name: 'Peringatan Kehadiran',
        title: 'Peringatan: Kehadiran Rendah',
        message: 'Kepada mahasiswa yang bersangkutan,\n\nPersentase kehadiran Anda saat ini di bawah batas minimum.\n\nMohon untuk meningkatkan kehadiran di pertemuan selanjutnya.\n\nTerima kasih.',
        type: 'warning',
        priority: 'high',
    },
] as const;

export function NotificationComposerEnhanced({ isOpen, course, mahasiswa, onClose }: Props) {
    const [step, setStep] = useState(1);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<number[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const form = useForm({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        target_type: 'all',
        target_mahasiswa: [] as number[],
        action_url: '',
    });

    const handleSubmit = () => {
        form.post('/dosen/notifications', {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => {
                    onClose();
                    form.reset();
                    setStep(1);
                    setSelectedMahasiswa([]);
                    setShowSuccess(false);
                }, 2000);
            },
        });
    };

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        form.setData({
            ...form.data,
            title: template.title,
            message: template.message,
            type: template.type,
            priority: template.priority,
        });
    };

    const toggleMahasiswa = (id: number) => {
        const newSelected = selectedMahasiswa.includes(id)
            ? selectedMahasiswa.filter(m => m !== id)
            : [...selectedMahasiswa, id];
        setSelectedMahasiswa(newSelected);
        form.setData('target_mahasiswa', newSelected);
    };

    const selectAllMahasiswa = () => {
        const allIds = mahasiswa.map(m => m.id);
        setSelectedMahasiswa(allIds);
        form.setData('target_mahasiswa', allIds);
    };

    const clearSelection = () => {
        setSelectedMahasiswa([]);
        form.setData('target_mahasiswa', []);
    };

    const getTypeIcon = (type: string) => {
        const typeConfig = NOTIFICATION_TYPES.find(t => t.value === type);
        return typeConfig ? typeConfig.icon : Info;
    };

    const getTypeColor = (type: string) => {
        const typeConfig = NOTIFICATION_TYPES.find(t => t.value === type);
        return typeConfig ? typeConfig.color : 'gray';
    };

    if (!isOpen) return null;

    // Success Animation
    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="bg-white dark:bg-black rounded-full p-12 shadow-2xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <CheckCircle2 className="h-24 w-24 text-emerald-500" />
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Enhanced Background with Blur */}
                <motion.div
                    initial={{ backdropFilter: 'blur(0px)' }}
                    animate={{ backdropFilter: 'blur(16px)' }}
                    exit={{ backdropFilter: 'blur(0px)' }}
                    className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"
                />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ 
                                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                                scale: 0
                            }}
                            animate={{ 
                                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                                x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                                scale: [0, Math.random() * 1.5 + 0.5, 0],
                                opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                                duration: 4 + Math.random() * 3,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                                ease: "easeInOut"
                            }}
                            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 blur-sm"
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 60, rotateX: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 60, rotateX: 20 }}
                    transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20,
                        mass: 0.8
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-4xl rounded-3xl bg-white/98 shadow-2xl dark:bg-black/98 border border-gray-200/50 dark:border-gray-800/50 overflow-hidden max-h-[90vh] flex flex-col backdrop-blur-2xl"
                    style={{ 
                        perspective: '1500px',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* Enhanced Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 text-white">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                            className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                        />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <Send className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <h3 className="text-2xl font-bold">Buat Notifikasi</h3>
                                    <p className="text-sm text-white/90">
                                        {course ? `Untuk mahasiswa ${course.nama}` : 'Kirim notifikasi ke mahasiswa'}
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.15, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur hover:bg-white/30 transition-colors shadow-lg"
                            >
                                <X className="h-6 w-6" />
                            </motion.button>
                        </div>

                        {/* Enhanced Progress Steps */}
                        <div className="mt-6 flex items-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <motion.div 
                                    key={s} 
                                    className="flex-1 relative"
                                >
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: step >= s ? 1 : 0 }}
                                        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                                        className="h-2.5 rounded-full origin-left shadow-lg"
                                        style={{ 
                                            backgroundColor: step > s ? 'rgba(255,255,255,0.95)' : 
                                                            step === s ? 'rgba(255,255,255,0.75)' : 
                                                            'rgba(255,255,255,0.25)' 
                                        }}
                                    />
                                    {step === s && (
                                        <motion.div
                                            animate={{ x: [0, 10, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute right-0 top-0 h-2.5 w-8 bg-gradient-to-r from-transparent to-white/50 rounded-full"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Content */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 30, rotateY: -10 }}
                                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                    exit={{ opacity: 0, x: -30, rotateY: 10 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    className="space-y-5"
                                >
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center gap-3 mb-6"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                        >
                                            <Sparkles className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Konten Notifikasi</h4>
                                            <p className="text-sm text-gray-500">Tulis pesan untuk mahasiswa</p>
                                        </div>
                                    </motion.div>

                                    {/* Templates */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <motion.div
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Zap className="h-5 w-5 text-blue-600" />
                                            </motion.div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Template Cepat</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {TEMPLATES.map((template, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                                    whileHover={{ scale: 1.05, y: -3, rotateZ: 2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => applyTemplate(template)}
                                                    className="p-3 text-left rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <Label className="mb-2 block font-medium">
                                            Judul <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            value={form.data.title} 
                                            onChange={(e) => form.setData('title', e.target.value)}
                                            placeholder="Contoh: Pengumuman Penting" 
                                            className="border-2 focus:ring-4 focus:ring-indigo-500/20"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Label className="mb-2 block font-medium">
                                            Pesan <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea 
                                            value={form.data.message} 
                                            onChange={(e) => form.setData('message', e.target.value)}
                                            placeholder="Tulis pesan notifikasi..."
                                            rows={8}
                                            className="border-2 resize-none focus:ring-4 focus:ring-indigo-500/20"
                                        />
                                        <motion.p 
                                            animate={{ scale: form.data.message.length > 0 ? [1, 1.05, 1] : 1 }}
                                            className="mt-1 text-xs text-gray-500"
                                        >
                                            {form.data.message.length} karakter
                                        </motion.p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <Label className="mb-2 block font-medium">Tipe</Label>
                                            <Select value={form.data.type} onValueChange={(v) => form.setData('type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {NOTIFICATION_TYPES.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="mb-2 block font-medium">Prioritas</Label>
                                            <Select value={form.data.priority} onValueChange={(v) => form.setData('priority', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITY_LEVELS.map(priority => (
                                                        <SelectItem key={priority.value} value={priority.value}>
                                                            {priority.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <Label className="mb-2 block font-medium">Link Terkait (opsional)</Label>
                                        <Input 
                                            value={form.data.action_url} 
                                            onChange={(e) => form.setData('action_url', e.target.value)}
                                            placeholder="https://..." 
                                            className="border-2 focus:ring-4 focus:ring-indigo-500/20"
                                        />
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Step 2: Target Audience */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 30, rotateY: -10 }}
                                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                    exit={{ opacity: 0, x: -30, rotateY: 10 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    className="space-y-5"
                                >
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center gap-3 mb-6"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                                        >
                                            <Users className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Target Penerima</h4>
                                            <p className="text-sm text-gray-500">Pilih mahasiswa yang akan menerima notifikasi</p>
                                        </div>
                                    </motion.div>

                                    <div className="space-y-3">
                                        <motion.label
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all shadow-md ${
                                                form.data.target_type === 'all'
                                                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-500 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-indigo-500/20'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="target_type"
                                                value="all"
                                                checked={form.data.target_type === 'all'}
                                                onChange={(e) => form.setData('target_type', e.target.value)}
                                                className="hidden"
                                            />
                                            <motion.div 
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 shadow-lg"
                                            >
                                                <Users className="h-6 w-6" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">Semua Mahasiswa</p>
                                                <p className="text-sm text-gray-500">Kirim ke seluruh mahasiswa ({mahasiswa.length} orang)</p>
                                            </div>
                                        </motion.label>

                                        <motion.label
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all shadow-md ${
                                                form.data.target_type === 'specific'
                                                    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-500 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-blue-500/20'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="target_type"
                                                value="specific"
                                                checked={form.data.target_type === 'specific'}
                                                onChange={(e) => form.setData('target_type', e.target.value)}
                                                className="hidden"
                                            />
                                            <motion.div 
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 shadow-lg"
                                            >
                                                <User className="h-6 w-6" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">Mahasiswa Tertentu</p>
                                                <p className="text-sm text-gray-500">Pilih mahasiswa secara manual</p>
                                            </div>
                                        </motion.label>
                                    </div>

                                    {form.data.target_type === 'specific' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {selectedMahasiswa.length} dari {mahasiswa.length} dipilih
                                                </p>
                                                <div className="flex gap-2">
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button size="sm" variant="outline" onClick={selectAllMahasiswa}>
                                                            Pilih Semua
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button size="sm" variant="outline" onClick={clearSelection}>
                                                            Hapus Pilihan
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <div className="max-h-64 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/50">
                                                {mahasiswa.map((mhs, idx) => (
                                                    <motion.label
                                                        key={mhs.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        whileHover={{ x: 8, scale: 1.02 }}
                                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                                            selectedMahasiswa.includes(mhs.id)
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            checked={selectedMahasiswa.includes(mhs.id)}
                                                            onCheckedChange={() => toggleMahasiswa(mhs.id)}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{mhs.nama}</p>
                                                            <p className="text-xs text-gray-500">{mhs.nim}</p>
                                                        </div>
                                                    </motion.label>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 3: Preview */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 30, rotateY: -10 }}
                                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                    exit={{ opacity: 0, x: -30, rotateY: 10 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    className="space-y-5"
                                >
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center gap-3 mb-6"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                        >
                                            <Eye className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Preview & Kirim</h4>
                                            <p className="text-sm text-gray-500">Periksa notifikasi sebelum dikirim</p>
                                        </div>
                                    </motion.div>

                                    {/* Preview Card with 3D Effect */}
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
                                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                        whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
                                        className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black rounded-2xl border-2 border-gray-200 dark:border-gray-800 shadow-2xl"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <motion.div 
                                                whileHover={{ rotate: 360, scale: 1.2 }}
                                                transition={{ duration: 0.6 }}
                                                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-${getTypeColor(form.data.type)}-100 text-${getTypeColor(form.data.type)}-600 shadow-lg`}
                                            >
                                                {(() => {
                                                    const Icon = getTypeIcon(form.data.type);
                                                    return <Icon className="h-7 w-7" />;
                                                })()}
                                            </motion.div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h5 className="font-semibold text-gray-900 dark:text-white text-lg">{form.data.title || 'Judul notifikasi'}</h5>
                                                    {form.data.priority !== 'normal' && (
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${form.data.priority === 'urgent' ? 'red' : 'orange'}-100 text-${form.data.priority === 'urgent' ? 'red' : 'orange'}-700`}
                                                        >
                                                            {form.data.priority === 'urgent' ? 'Urgent' : 'Penting'}
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                                    {form.data.message || 'Pesan notifikasi akan muncul di sini'}
                                                </p>
                                                {form.data.action_url && (
                                                    <motion.p 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-sm text-blue-600 mt-3 flex items-center gap-1"
                                                    >
                                                        🔗 {form.data.action_url}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Summary */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                                    >
                                        <h6 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Info className="h-5 w-5 text-blue-600" />
                                            Ringkasan
                                        </h6>
                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                            <motion.p whileHover={{ x: 5 }} className="flex items-center gap-2">
                                                • Tipe: <span className="font-medium">{NOTIFICATION_TYPES.find(t => t.value === form.data.type)?.label}</span>
                                            </motion.p>
                                            <motion.p whileHover={{ x: 5 }} className="flex items-center gap-2">
                                                • Prioritas: <span className="font-medium">{PRIORITY_LEVELS.find(p => p.value === form.data.priority)?.label}</span>
                                            </motion.p>
                                            <motion.p whileHover={{ x: 5 }} className="flex items-center gap-2">
                                                • Penerima: <span className="font-medium">{form.data.target_type === 'all' ? `Semua mahasiswa (${mahasiswa.length})` : `${selectedMahasiswa.length} mahasiswa`}</span>
                                            </motion.p>
                                            {course && (
                                                <motion.p whileHover={{ x: 5 }} className="flex items-center gap-2">
                                                    • Mata Kuliah: <span className="font-medium">{course.nama}</span>
                                                </motion.p>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Enhanced Footer */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-black/50 p-6 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-gray-500 flex items-center gap-2"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="h-2 w-2 rounded-full bg-indigo-500"
                                />
                                Step {step} dari 3
                            </motion.div>
                            <div className="flex gap-2">
                                {step > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ scale: 1.05, x: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                                            Kembali
                                        </Button>
                                    </motion.div>
                                )}
                                {step < 3 ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button 
                                            onClick={() => setStep(step + 1)}
                                            disabled={
                                                (step === 1 && (!form.data.title || !form.data.message)) ||
                                                (step === 2 && form.data.target_type === 'specific' && selectedMahasiswa.length === 0)
                                            }
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/30"
                                        >
                                            Lanjut
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button 
                                            onClick={handleSubmit}
                                            disabled={form.processing}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/30"
                                        >
                                            {form.processing ? (
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="inline-block"
                                                >
                                                    ⏳
                                                </motion.span>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Kirim Notifikasi
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
