import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    Clock,
    Eye,
    Info,
    Megaphone,
    Send,
    Sparkles,
    User,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

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
    {
        value: 'announcement',
        label: 'Pengumuman',
        icon: Megaphone,
        color: 'purple',
    },
    {
        value: 'warning',
        label: 'Peringatan',
        icon: AlertTriangle,
        color: 'orange',
    },
    { value: 'alert', label: 'Alert', icon: AlertCircle, color: 'red' },
];

const PRIORITY_LEVELS = [
    { value: 'normal', label: 'Normal', color: 'gray' },
    { value: 'high', label: 'Penting', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' },
];

const TEMPLATES = [
    {
        name: 'Pengingat Tugas',
        title: 'Pengingat: Deadline Tugas',
        message:
            'Halo mahasiswa,\n\nIni adalah pengingat bahwa tugas [NAMA TUGAS] akan segera berakhir pada [TANGGAL].\n\nPastikan untuk mengumpulkan tepat waktu.\n\nTerima kasih.',
        type: 'reminder',
        priority: 'high',
    },
    {
        name: 'Pengumuman Kelas',
        title: 'Pengumuman: Perubahan Jadwal',
        message:
            'Kepada seluruh mahasiswa,\n\nDiberitahukan bahwa jadwal perkuliahan [TANGGAL] akan [PERUBAHAN].\n\nMohon perhatiannya.\n\nTerima kasih.',
        type: 'announcement',
        priority: 'normal',
    },
    {
        name: 'Peringatan Kehadiran',
        title: 'Peringatan: Kehadiran Rendah',
        message:
            'Kepada mahasiswa yang bersangkutan,\n\nPersentase kehadiran Anda saat ini di bawah batas minimum.\n\nMohon untuk meningkatkan kehadiran di pertemuan selanjutnya.\n\nTerima kasih.',
        type: 'warning',
        priority: 'high',
    },
];

export function NotificationComposer({
    isOpen,
    course,
    mahasiswa,
    onClose,
}: Props) {
    const [step, setStep] = useState(1);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<number[]>([]);
    const [showPreview, setShowPreview] = useState(false);

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
                onClose();
                form.reset();
                setStep(1);
                setSelectedMahasiswa([]);
            },
        });
    };

    const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
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
            ? selectedMahasiswa.filter((m) => m !== id)
            : [...selectedMahasiswa, id];
        setSelectedMahasiswa(newSelected);
        form.setData('target_mahasiswa', newSelected);
    };

    const selectAllMahasiswa = () => {
        const allIds = mahasiswa.map((m) => m.id);
        setSelectedMahasiswa(allIds);
        form.setData('target_mahasiswa', allIds);
    };

    const clearSelection = () => {
        setSelectedMahasiswa([]);
        form.setData('target_mahasiswa', []);
    };

    const getTypeIcon = (type: string) => {
        const typeConfig = NOTIFICATION_TYPES.find((t) => t.value === type);
        return typeConfig ? typeConfig.icon : Info;
    };

    const getTypeColor = (type: string) => {
        const typeConfig = NOTIFICATION_TYPES.find((t) => t.value === type);
        return typeConfig ? typeConfig.color : 'gray';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-black"
                >
                    {/* Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-6 text-white">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                        />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                >
                                    <Send className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        Buat Notifikasi
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        {course
                                            ? `Untuk mahasiswa ${course.nama}`
                                            : 'Kirim notifikasi ke mahasiswa'}
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur transition-colors hover:bg-white/30"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Progress Steps */}
                        <div className="mt-6 flex items-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex-1">
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: step >= s ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-2 origin-left rounded-full"
                                        style={{
                                            backgroundColor:
                                                step > s
                                                    ? 'rgba(255,255,255,0.9)'
                                                    : step === s
                                                      ? 'rgba(255,255,255,0.7)'
                                                      : 'rgba(255,255,255,0.2)',
                                        }}
                                    />
                                </div>
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
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Konten Notifikasi
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Tulis pesan untuk mahasiswa
                                            </p>
                                        </div>
                                    </div>

                                    {/* Templates */}
                                    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Template Cepat
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {TEMPLATES.map((template, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{
                                                        scale: 1.03,
                                                        y: -2,
                                                    }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() =>
                                                        applyTemplate(template)
                                                    }
                                                    className="rounded-lg border border-blue-200 bg-white p-2 text-left transition-colors hover:border-blue-400 dark:border-blue-700 dark:bg-gray-800"
                                                >
                                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                                        {template.name}
                                                    </p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block font-medium">
                                            Judul{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            value={form.data.title}
                                            onChange={(e) =>
                                                form.setData(
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Pengumuman Penting"
                                            className="border-2"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block font-medium">
                                            Pesan{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Textarea
                                            value={form.data.message}
                                            onChange={(e) =>
                                                form.setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tulis pesan notifikasi..."
                                            rows={8}
                                            className="resize-none border-2"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {form.data.message.length} karakter
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="mb-2 block font-medium">
                                                Tipe
                                            </Label>
                                            <Select
                                                value={form.data.type}
                                                onValueChange={(v) =>
                                                    form.setData('type', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {NOTIFICATION_TYPES.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.value}
                                                                value={
                                                                    type.value
                                                                }
                                                            >
                                                                {type.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="mb-2 block font-medium">
                                                Prioritas
                                            </Label>
                                            <Select
                                                value={form.data.priority}
                                                onValueChange={(v) =>
                                                    form.setData('priority', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITY_LEVELS.map(
                                                        (priority) => (
                                                            <SelectItem
                                                                key={
                                                                    priority.value
                                                                }
                                                                value={
                                                                    priority.value
                                                                }
                                                            >
                                                                {priority.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block font-medium">
                                            Link Terkait (opsional)
                                        </Label>
                                        <Input
                                            value={form.data.action_url}
                                            onChange={(e) =>
                                                form.setData(
                                                    'action_url',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://..."
                                            className="border-2"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Target Audience */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Target Penerima
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Pilih mahasiswa yang akan
                                                menerima notifikasi
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <motion.label
                                            whileHover={{ scale: 1.02 }}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                                form.data.target_type === 'all'
                                                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="target_type"
                                                value="all"
                                                checked={
                                                    form.data.target_type ===
                                                    'all'
                                                }
                                                onChange={(e) =>
                                                    form.setData(
                                                        'target_type',
                                                        e.target.value,
                                                    )
                                                }
                                                className="hidden"
                                            />
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Semua Mahasiswa
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Kirim ke seluruh mahasiswa (
                                                    {mahasiswa.length} orang)
                                                </p>
                                            </div>
                                        </motion.label>

                                        <motion.label
                                            whileHover={{ scale: 1.02 }}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                                form.data.target_type ===
                                                'specific'
                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="target_type"
                                                value="specific"
                                                checked={
                                                    form.data.target_type ===
                                                    'specific'
                                                }
                                                onChange={(e) =>
                                                    form.setData(
                                                        'target_type',
                                                        e.target.value,
                                                    )
                                                }
                                                className="hidden"
                                            />
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Mahasiswa Tertentu
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Pilih mahasiswa secara
                                                    manual
                                                </p>
                                            </div>
                                        </motion.label>
                                    </div>

                                    {form.data.target_type === 'specific' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {selectedMahasiswa.length}{' '}
                                                    dari {mahasiswa.length}{' '}
                                                    dipilih
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={
                                                            selectAllMahasiswa
                                                        }
                                                    >
                                                        Pilih Semua
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={clearSelection}
                                                    >
                                                        Hapus Pilihan
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border-2 border-gray-200 p-3 dark:border-gray-700">
                                                {mahasiswa.map((mhs) => (
                                                    <motion.label
                                                        key={mhs.id}
                                                        whileHover={{ x: 5 }}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                                                            selectedMahasiswa.includes(
                                                                mhs.id,
                                                            )
                                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            checked={selectedMahasiswa.includes(
                                                                mhs.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                toggleMahasiswa(
                                                                    mhs.id,
                                                                )
                                                            }
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {mhs.nama}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {mhs.nim}
                                                            </p>
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
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                            <Eye className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                Preview & Kirim
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Periksa notifikasi sebelum
                                                dikirim
                                            </p>
                                        </div>
                                    </div>

                                    {/* Preview Card */}
                                    <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-black">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${getTypeColor(form.data.type)}-100 text-${getTypeColor(form.data.type)}-600`}
                                            >
                                                {(() => {
                                                    const Icon = getTypeIcon(
                                                        form.data.type,
                                                    );
                                                    return (
                                                        <Icon className="h-6 w-6" />
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <h5 className="font-semibold text-gray-900 dark:text-white">
                                                        {form.data.title ||
                                                            'Judul notifikasi'}
                                                    </h5>
                                                    {form.data.priority !==
                                                        'normal' && (
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium bg-${form.data.priority === 'urgent' ? 'red' : 'orange'}-100 text-${form.data.priority === 'urgent' ? 'red' : 'orange'}-700`}
                                                        >
                                                            {form.data
                                                                .priority ===
                                                            'urgent'
                                                                ? 'Urgent'
                                                                : 'Penting'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                                                    {form.data.message ||
                                                        'Pesan notifikasi akan muncul di sini'}
                                                </p>
                                                {form.data.action_url && (
                                                    <p className="mt-2 text-sm text-blue-600">
                                                        🔗{' '}
                                                        {form.data.action_url}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                        <h6 className="mb-2 font-medium text-gray-900 dark:text-white">
                                            Ringkasan
                                        </h6>
                                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <p>
                                                • Tipe:{' '}
                                                {
                                                    NOTIFICATION_TYPES.find(
                                                        (t) =>
                                                            t.value ===
                                                            form.data.type,
                                                    )?.label
                                                }
                                            </p>
                                            <p>
                                                • Prioritas:{' '}
                                                {
                                                    PRIORITY_LEVELS.find(
                                                        (p) =>
                                                            p.value ===
                                                            form.data.priority,
                                                    )?.label
                                                }
                                            </p>
                                            <p>
                                                • Penerima:{' '}
                                                {form.data.target_type === 'all'
                                                    ? `Semua mahasiswa (${mahasiswa.length})`
                                                    : `${selectedMahasiswa.length} mahasiswa`}
                                            </p>
                                            {course && (
                                                <p>
                                                    • Mata Kuliah: {course.nama}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="border-t-2 border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Step {step} dari 3
                            </div>
                            <div className="flex gap-2">
                                {step > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(step - 1)}
                                    >
                                        Kembali
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button
                                        onClick={() => setStep(step + 1)}
                                        disabled={
                                            (step === 1 &&
                                                (!form.data.title ||
                                                    !form.data.message)) ||
                                            (step === 2 &&
                                                form.data.target_type ===
                                                    'specific' &&
                                                selectedMahasiswa.length === 0)
                                        }
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                                    >
                                        Lanjut
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={form.processing}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                                    >
                                        {form.processing ? (
                                            'Mengirim...'
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Kirim Notifikasi
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
