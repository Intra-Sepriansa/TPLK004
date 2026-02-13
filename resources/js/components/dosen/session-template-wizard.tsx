import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    X, Sparkles, FileText, Clock, Settings, Eye, CheckCircle2, 
    AlertCircle, Zap, ChevronRight, RefreshCw, Info 
} from 'lucide-react';
import { useState } from 'react';

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

interface Course {
    id: number;
    nama: string;
    sks: number;
}

interface Props {
    isOpen: boolean;
    editTemplate: Template | null;
    form: any;
    courses: Course[];
    onClose: () => void;
    onSubmit: () => void;
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function SessionTemplateWizard({ isOpen, editTemplate, form, courses, onClose, onSubmit }: Props) {
    const [formStep, setFormStep] = useState(1);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Validation functions
    const validateStep = (step: number): boolean => {
        const errors: Record<string, string> = {};
        
        if (step === 1) {
            if (!form.data.course_id) errors.course_id = 'Pilih mata kuliah';
            if (!form.data.name.trim()) errors.name = 'Nama template wajib diisi';
            if (form.data.name.length < 3) errors.name = 'Nama minimal 3 karakter';
        }
        
        if (step === 2) {
            if (!form.data.default_start_time) errors.default_start_time = 'Jam mulai wajib diisi';
            if (!form.data.default_end_time) errors.default_end_time = 'Jam selesai wajib diisi';
            if (form.data.default_start_time >= form.data.default_end_time) {
                errors.default_end_time = 'Jam selesai harus lebih besar dari jam mulai';
            }
            if (form.data.default_days.length === 0) errors.default_days = 'Pilih minimal 1 hari';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(formStep)) {
            setFormStep(formStep + 1);
        }
    };

    const prevStep = () => {
        setFormStep(formStep - 1);
        setFormErrors({});
    };

    const handleClose = () => {
        setFormStep(1);
        setFormErrors({});
        onClose();
    };

    const handleSubmit = () => {
        onSubmit();
        setFormStep(1);
        setFormErrors({});
    };

    // Smart time suggestions
    const timeSlots = [
        { label: 'Pagi (08:00 - 10:00)', start: '08:00', end: '10:00' },
        { label: 'Pagi (10:00 - 12:00)', start: '10:00', end: '12:00' },
        { label: 'Siang (13:00 - 15:00)', start: '13:00', end: '15:00' },
        { label: 'Sore (15:00 - 17:00)', start: '15:00', end: '17:00' },
    ];

    const applyTimeSlot = (start: string, end: string) => {
        form.setData({ ...form.data, default_start_time: start, default_end_time: end });
    };

    const toggleDay = (day: number) => {
        const current = form.data.default_days;
        form.setData('default_days', current.includes(day) ? current.filter((d: number) => d !== day) : [...current, day]);
    };

    // Calculate duration
    const calculateDuration = () => {
        if (!form.data.default_start_time || !form.data.default_end_time) return 0;
        const [startH, startM] = form.data.default_start_time.split(':').map(Number);
        const [endH, endM] = form.data.default_end_time.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-black border-2 border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                    {/* Modal Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-6 text-white">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"
                        />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                >
                                    <Sparkles className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {editTemplate ? 'Edit Template' : 'Buat Template Baru'}
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        Step {formStep} dari 3
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-6 flex items-center gap-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex-1">
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: formStep >= step ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-2 rounded-full origin-left"
                                        style={{ 
                                            backgroundColor: formStep > step ? 'rgba(255,255,255,0.9)' : 
                                                            formStep === step ? 'rgba(255,255,255,0.7)' : 
                                                            'rgba(255,255,255,0.2)' 
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Basic Info */}
                            {formStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Informasi Dasar</h4>
                                            <p className="text-sm text-gray-500">Pilih mata kuliah dan nama template</p>
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Label className="mb-2 block font-medium">
                                            Mata Kuliah <span className="text-red-500">*</span>
                                        </Label>
                                        <Select 
                                            value={form.data.course_id} 
                                            onValueChange={(v) => {
                                                form.setData('course_id', v);
                                                setFormErrors({ ...formErrors, course_id: '' });
                                            }}
                                        >
                                            <SelectTrigger className={`border-2 ${formErrors.course_id ? 'border-red-500' : 'border-gray-200'}`}>
                                                <SelectValue placeholder="Pilih mata kuliah" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(c => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.nama} ({c.sks} SKS)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.course_id && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {formErrors.course_id}
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <Label className="mb-2 block font-medium">
                                            Nama Template <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            value={form.data.name} 
                                            onChange={(e) => {
                                                form.setData('name', e.target.value);
                                                setFormErrors({ ...formErrors, name: '' });
                                            }}
                                            placeholder="Contoh: Jadwal Reguler Semester Ganjil" 
                                            className={`border-2 ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                        {formErrors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-1 text-sm text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {formErrors.name}
                                            </motion.p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            {form.data.name.length}/50 karakter
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label className="mb-2 block font-medium">Deskripsi (opsional)</Label>
                                        <Textarea 
                                            value={form.data.description} 
                                            onChange={(e) => form.setData('description', e.target.value)} 
                                            placeholder="Tambahkan deskripsi untuk template ini..."
                                            rows={3}
                                            className="border-2 border-gray-200 resize-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Deskripsi membantu Anda mengingat tujuan template ini
                                        </p>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Step 2: Schedule */}
                            {formStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Jadwal & Waktu</h4>
                                            <p className="text-sm text-gray-500">Atur jam dan hari pertemuan</p>
                                        </div>
                                    </div>

                                    {/* Smart Time Suggestions */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Saran Waktu Cepat</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {timeSlots.map((slot, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => applyTimeSlot(slot.start, slot.end)}
                                                    className="p-2 text-left rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 hover:border-blue-400 transition-colors"
                                                >
                                                    <p className="text-xs font-medium text-gray-900 dark:text-white">{slot.label}</p>
                                                    <p className="text-xs text-gray-500">{slot.start} - {slot.end}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <Label className="mb-2 block font-medium">
                                                Jam Mulai <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                type="time" 
                                                value={form.data.default_start_time} 
                                                onChange={(e) => {
                                                    form.setData('default_start_time', e.target.value);
                                                    setFormErrors({ ...formErrors, default_start_time: '' });
                                                }}
                                                className={`border-2 ${formErrors.default_start_time ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            {formErrors.default_start_time && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-1 text-xs text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {formErrors.default_start_time}
                                                </motion.p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="mb-2 block font-medium">
                                                Jam Selesai <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                type="time" 
                                                value={form.data.default_end_time} 
                                                onChange={(e) => {
                                                    form.setData('default_end_time', e.target.value);
                                                    setFormErrors({ ...formErrors, default_end_time: '' });
                                                }}
                                                className={`border-2 ${formErrors.default_end_time ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            {formErrors.default_end_time && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-1 text-xs text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {formErrors.default_end_time}
                                                </motion.p>
                                            )}
                                        </div>
                                    </motion.div>

                                    {calculateDuration() > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                                        >
                                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <p className="text-sm font-medium">
                                                    Durasi: {calculateDuration()} menit ({(calculateDuration() / 60).toFixed(1)} jam)
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Label className="mb-3 block font-medium">
                                            Hari Default <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {DAYS.map((day, idx) => {
                                                const isSelected = form.data.default_days.includes(idx);
                                                return (
                                                    <motion.label
                                                        key={idx}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                            isSelected 
                                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                                        }`}
                                                    >
                                                        <Checkbox 
                                                            checked={isSelected} 
                                                            onCheckedChange={() => {
                                                                toggleDay(idx);
                                                                setFormErrors({ ...formErrors, default_days: '' });
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm font-medium">{day}</span>
                                                    </motion.label>
                                                );
                                            })}
                                        </div>
                                        {formErrors.default_days && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 text-sm text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {formErrors.default_days}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Step 3: Settings & Preview */}
                            {formStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Pengaturan & Preview</h4>
                                            <p className="text-sm text-gray-500">Atur opsi dan lihat preview template</p>
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Switch 
                                                checked={form.data.auto_activate} 
                                                onCheckedChange={(v) => form.setData('auto_activate', v)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <Label className="font-medium text-gray-900 dark:text-white">
                                                    Auto-activate sesi yang dibuat
                                                </Label>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Sesi yang dibuat dari template ini akan langsung aktif dan siap digunakan
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Preview Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black rounded-2xl border-2 border-gray-200 dark:border-gray-800 shadow-lg"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <Eye className="h-4 w-4 text-indigo-600" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Preview Template</p>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Nama Template</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {form.data.name || 'Belum diisi'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Mata Kuliah</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {courses.find(c => String(c.id) === form.data.course_id)?.nama || 'Belum dipilih'}
                                                </p>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Waktu</p>
                                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                                                        <Clock className="h-3 w-3" />
                                                        {form.data.default_start_time} - {form.data.default_end_time}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Durasi</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {calculateDuration()} menit
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Hari</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {form.data.default_days.length > 0 ? (
                                                        form.data.default_days.sort((a: number, b: number) => a - b).map((day: number) => (
                                                            <span 
                                                                key={day}
                                                                className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg"
                                                            >
                                                                {DAYS[day]}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Belum dipilih</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {form.data.description && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {form.data.description}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                {form.data.auto_activate ? (
                                                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Auto-activate enabled
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Info className="h-3 w-3" />
                                                        Manual activation required
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-gray-500">
                                {formStep === 1 && 'Isi informasi dasar template'}
                                {formStep === 2 && 'Atur jadwal dan waktu'}
                                {formStep === 3 && 'Review dan simpan template'}
                            </div>
                            <div className="flex gap-2">
                                {formStep > 1 && (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button 
                                            variant="outline" 
                                            onClick={prevStep}
                                            className="border-2"
                                        >
                                            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                                            Kembali
                                        </Button>
                                    </motion.div>
                                )}
                                {formStep < 3 ? (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button 
                                            onClick={nextStep}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                                        >
                                            Lanjut
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button 
                                            onClick={handleSubmit} 
                                            disabled={form.processing}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                                        >
                                            {form.processing ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    {editTemplate ? 'Simpan Perubahan' : 'Buat Template'}
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
