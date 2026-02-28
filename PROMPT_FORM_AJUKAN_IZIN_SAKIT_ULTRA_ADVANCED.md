# 🎯 PROMPT: FORM AJUKAN IZIN/SAKIT - ULTRA ADVANCED (1 HALAMAN BARU)

## 📋 OVERVIEW

Prompt ini untuk membuat **halaman form ajukan izin/sakit** yang sangat advanced dengan UI/UX modern, multi-step wizard, drag & drop upload, dan 100% matching dengan dashboard admin.

### Fokus Utama:
1. **1 Halaman Baru** - Route: `/user/permit/create`
2. **Multi-Step Wizard** - 3 steps dengan progress indicator
3. **Drag & Drop Upload** - Upload surat keterangan dengan preview
4. **100% Matching Dashboard** - Warna, animasi, glassmorphism
5. **Real-time Validation** - Form validation dengan error messages
6. **Responsive Mobile** - Perfect di semua device
7. **Smooth Animations** - Framer Motion animations

---

## 🎨 DESIGN SYSTEM - MATCHING DASHBOARD

### Color Palette (WAJIB)
```typescript
// GRADIENT HEADER
from-indigo-600 via-purple-600 to-pink-500

// GLASSMORPHISM CONTAINERS
bg-white/40 dark:bg-neutral-900/40
backdrop-blur-xl
border-white/20 dark:border-white/5

// STEP INDICATOR
Active: bg-gradient-to-r from-indigo-500 to-purple-600
Completed: bg-emerald-500
Inactive: bg-neutral-300 dark:bg-neutral-700

// BUTTONS
Primary: bg-gradient-to-r from-indigo-500 to-purple-600
Secondary: bg-white/20 backdrop-blur
Danger: bg-red-500

// DRAG & DROP ZONE
Default: border-dashed border-neutral-300
Active: border-indigo-500 bg-indigo-50/50
Success: border-emerald-500 bg-emerald-50/50
```

### Animation Standards
```typescript
// Page transitions
stiffness: 300
damping: 20

// Step transitions
type: 'spring'
stiffness: 400
damping: 25

// Hover effects
scale: 1.02
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🚀 ROUTE & NAVIGATION

### Route Definition
```php
// routes/web.php
Route::middleware(['auth', 'role:mahasiswa'])->group(function () {
    Route::get('/user/permit/create', [PermitController::class, 'create'])->name('permit.create');
    Route::post('/user/permit', [PermitController::class, 'store'])->name('permit.store');
});
```

### Navigation Flow
```
Dashboard → Izin/Sakit → Tombol "Ajukan Izin" → /user/permit/create
```

---

## 📝 FORM STRUCTURE - MULTI-STEP WIZARD

### Step 1: Pilih Sesi & Jenis
- Pilih sesi kuliah (dropdown dengan search)
- Pilih jenis: Izin atau Sakit (radio button dengan icon)
- Tanggal mulai dan selesai (date picker)

### Step 2: Alasan & Keterangan
- Textarea untuk alasan (required, min 20 karakter)
- Keterangan tambahan (optional)
- Character counter real-time

### Step 3: Upload Surat Keterangan
- Drag & drop zone
- File preview dengan thumbnail
- Support: JPG, PNG, PDF (max 5MB)
- Progress bar saat upload

---

## 💎 COMPLETE IMPLEMENTATION

### File: resources/js/pages/user/permit-create.tsx

```typescript
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft, ArrowRight, Check, Upload, X, FileText,
    Calendar, Clock, AlertCircle, CheckCircle, Paperclip,
    FileCheck, Stethoscope, ClipboardList, Image as ImageIcon,
    FileType, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import icon
import permitIcon from '@/assets/admin/dashboard/hadir-icon.png';

type Session = {
    id: number;
    mata_kuliah: string;
    tanggal: string;
    tanggal_display: string;
    waktu: string;
    dosen: string;
};

type Props = {
    availableSessions: Session[];
};

export default function PermitCreate({ availableSessions }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [dragActive, setDragActive] = useState(false);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [searchSession, setSearchSession] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        attendance_session_id: '',
        type: 'izin' as 'izin' | 'sakit',
        tanggal_mulai: '',
        tanggal_selesai: '',
        reason: '',
        keterangan: '',
        attachment: null as File | null,
    });

    // Filter sessions based on search
    const filteredSessions = availableSessions.filter(session =>
        session.mata_kuliah.toLowerCase().includes(searchSession.toLowerCase()) ||
        session.dosen.toLowerCase().includes(searchSession.toLowerCase())
    );

    // Handle file selection
    const handleFileChange = (file: File | null) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB.');
            return;
        }

        setData('attachment', file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    // Drag & drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    // Step validation
    const canProceedToStep2 = () => {
        return data.attendance_session_id && data.type && data.tanggal_mulai && data.tanggal_selesai;
    };

    const canProceedToStep3 = () => {
        return data.reason.length >= 20;
    };

    const canSubmit = () => {
        return data.attachment !== null;
    };

    // Handle submit
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/permit', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/user/permit');
            },
        });
    };

    // Steps configuration
    const steps = [
        { number: 1, title: 'Pilih Sesi', icon: Calendar, description: 'Pilih sesi kuliah dan jenis' },
        { number: 2, title: 'Alasan', icon: FileText, description: 'Tulis alasan izin/sakit' },
        { number: 3, title: 'Upload Surat', icon: Upload, description: 'Upload surat keterangan' },
    ];

    return (
        <StudentLayout>
            <Head title="Ajukan Izin/Sakit" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 md:p-6 lg:p-8 space-y-6"
            >
```

                {/* ═══════ HERO HEADER ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        {/* Tombol Kembali */}
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/permit')}
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                            {/* Icon Header */}
                            <motion.div
                                className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img 
                                    src={permitIcon} 
                                    alt="Ajukan Izin" 
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
                                />
                            </motion.div>
                            
                            <div className="flex-1 mt-1 sm:mt-0">
                                <motion.p
                                    className="text-sm text-indigo-100 font-medium tracking-wide"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Form Pengajuan
                                </motion.p>
                                <motion.h1
                                    className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Ajukan Izin/Sakit
                                </motion.h1>
                                <motion.p
                                    className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Lengkapi formulir di bawah untuk mengajukan izin atau sakit
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ PROGRESS INDICATOR ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;
                            
                            return (
                                <div key={step.number} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        {/* Step Circle */}
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                scale: isActive ? 1.1 : 1,
                                            }}
                                            className={cn(
                                                "relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full transition-all duration-300",
                                                isCompleted && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                                                isActive && "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30",
                                                !isActive && !isCompleted && "bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-6 w-6 sm:h-8 sm:w-8" />
                                            ) : (
                                                <StepIcon className="h-5 w-5 sm:h-7 sm:w-7" />
                                            )}
                                            
                                            {/* Pulse animation for active step */}
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                        opacity: [0.5, 0, 0.5],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            )}
                                        </motion.div>

                                        {/* Step Info */}
                                        <div className="mt-3 text-center">
                                            <p className={cn(
                                                "text-xs sm:text-sm font-semibold transition-colors",
                                                isActive && "text-indigo-600 dark:text-indigo-400",
                                                isCompleted && "text-emerald-600 dark:text-emerald-400",
                                                !isActive && !isCompleted && "text-neutral-500"
                                            )}>
                                                {step.title}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 hidden sm:block">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-1 mx-2 sm:mx-4 mb-8">
                                            <motion.div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    currentStep > step.number 
                                                        ? "bg-emerald-500" 
                                                        : "bg-neutral-300 dark:bg-neutral-700"
                                                )}
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: currentStep > step.number ? 1 : 0 }}
                                                transition={{ duration: 0.5 }}
                                                style={{ transformOrigin: 'left' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ═══════ FORM CONTAINER ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {/* ═══════ STEP 1: PILIH SESI & JENIS ═══════ */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="space-y-6"
                                >
                                    {/* Pilih Sesi Kuliah */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-indigo-500" />
                                            Pilih Sesi Kuliah
                                        </Label>
                                        
                                        {/* Search Input */}
                                        <Input
                                            type="text"
                                            placeholder="Cari mata kuliah atau dosen..."
                                            value={searchSession}
                                            onChange={(e) => setSearchSession(e.target.value)}
                                            className="rounded-xl border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur"
                                        />

                                        {/* Sessions List */}
                                        <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/40 dark:bg-neutral-800/40 p-3">
                                            {filteredSessions.length > 0 ? (
                                                filteredSessions.map((session) => (
                                                    <motion.button
                                                        key={session.id}
                                                        type="button"
                                                        onClick={() => setData('attendance_session_id', session.id.toString())}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "w-full text-left p-4 rounded-xl transition-all",
                                                            data.attendance_session_id === session.id.toString()
                                                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                                                                : "bg-white/60 dark:bg-neutral-800/60 hover:bg-white/80 dark:hover:bg-neutral-800/80"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-semibold">{session.mata_kuliah}</p>
                                                                <p className={cn(
                                                                    "text-sm mt-1",
                                                                    data.attendance_session_id === session.id.toString()
                                                                        ? "text-white/90"
                                                                        : "text-neutral-600 dark:text-neutral-400"
                                                                )}>
                                                                    {session.dosen}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-2 text-xs">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {session.tanggal_display}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {session.waktu}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {data.attendance_session_id === session.id.toString() && (
                                                                <CheckCircle className="h-6 w-6 text-white shrink-0" />
                                                            )}
                                                        </div>
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-neutral-500">
                                                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    <p>Tidak ada sesi yang ditemukan</p>
                                                </div>
                                            )}
                                        </div>
                                        {errors.attendance_session_id && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.attendance_session_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Pilih Jenis */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5 text-indigo-500" />
                                            Jenis Pengajuan
                                        </Label>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { value: 'izin', label: 'Izin', icon: '📝', color: 'from-blue-500 to-cyan-600' },
                                                { value: 'sakit', label: 'Sakit', icon: '🏥', color: 'from-red-500 to-pink-600' },
                                            ].map((type) => (
                                                <motion.button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setData('type', type.value as 'izin' | 'sakit')}
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "relative p-6 rounded-2xl transition-all overflow-hidden",
                                                        data.type === type.value
                                                            ? `bg-gradient-to-br ${type.color} text-white shadow-xl`
                                                            : "bg-white/60 dark:bg-neutral-800/60 hover:bg-white/80 dark:hover:bg-neutral-800/80"
                                                    )}
                                                >
                                                    <div className="relative z-10 text-center">
                                                        <div className="text-4xl mb-2">{type.icon}</div>
                                                        <p className="font-semibold text-lg">{type.label}</p>
                                                    </div>
                                                    {data.type === type.value && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-2 right-2"
                                                        >
                                                            <CheckCircle className="h-6 w-6 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                        {errors.type && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tanggal Mulai & Selesai */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Tanggal Mulai
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.tanggal_mulai}
                                                onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                                className="rounded-xl border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60"
                                            />
                                            {errors.tanggal_mulai && (
                                                <p className="text-xs text-red-600">{errors.tanggal_mulai}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Tanggal Selesai
                                            </Label>
                                            <Input
                                                type="date"
                                                value={data.tanggal_selesai}
                                                onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                                min={data.tanggal_mulai}
                                                className="rounded-xl border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60"
                                            />
                                            {errors.tanggal_selesai && (
                                                <p className="text-xs text-red-600">{errors.tanggal_selesai}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════ STEP 2: ALASAN & KETERANGAN ═══════ */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="space-y-6"
                                >
                                    {/* Alasan */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-indigo-500" />
                                            Alasan {data.type === 'sakit' ? 'Sakit' : 'Izin'}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            placeholder={`Jelaskan alasan ${data.type === 'sakit' ? 'sakit' : 'izin'} Anda secara detail (minimal 20 karakter)...`}
                                            rows={6}
                                            className="rounded-xl border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur resize-none"
                                        />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={cn(
                                                "flex items-center gap-1",
                                                data.reason.length >= 20 
                                                    ? "text-emerald-600" 
                                                    : "text-neutral-500"
                                            )}>
                                                {data.reason.length >= 20 && <CheckCircle className="h-4 w-4" />}
                                                {data.reason.length}/20 karakter minimum
                                            </span>
                                            <span className="text-neutral-400">
                                                {data.reason.length} karakter
                                            </span>
                                        </div>
                                        {errors.reason && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.reason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Keterangan Tambahan */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-neutral-900 dark:text-white">
                                            Keterangan Tambahan (Opsional)
                                        </Label>
                                        <Textarea
                                            value={data.keterangan}
                                            onChange={(e) => setData('keterangan', e.target.value)}
                                            placeholder="Tambahkan keterangan lain jika diperlukan..."
                                            rows={4}
                                            className="rounded-xl border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 backdrop-blur resize-none"
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    >
                                        <div className="flex gap-3">
                                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                                <p className="font-semibold mb-1">Tips Menulis Alasan:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li>Jelaskan secara detail dan jujur</li>
                                                    <li>Sertakan informasi yang relevan</li>
                                                    <li>Gunakan bahasa yang sopan dan formal</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}


                            {/* ═══════ STEP 3: UPLOAD SURAT KETERANGAN ═══════ */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                            <Upload className="h-5 w-5 text-indigo-500" />
                                            Upload Surat Keterangan
                                            <span className="text-red-500">*</span>
                                        </Label>

                                        {/* Drag & Drop Zone */}
                                        <motion.div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            whileHover={{ scale: 1.01 }}
                                            className={cn(
                                                "relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer",
                                                dragActive && "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-105",
                                                data.attachment && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20",
                                                !dragActive && !data.attachment && "border-neutral-300 dark:border-neutral-700 hover:border-indigo-400"
                                            )}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                                className="hidden"
                                            />

                                            {!data.attachment ? (
                                                <div className="text-center">
                                                    <motion.div
                                                        animate={{
                                                            y: dragActive ? -10 : [0, -10, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: dragActive ? 0 : Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-4"
                                                    >
                                                        <Upload className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                                                    </motion.div>
                                                    <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                                        {dragActive ? 'Lepaskan file di sini' : 'Upload Surat Keterangan'}
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                                        Drag & drop file atau klik untuk memilih
                                                    </p>
                                                    <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                                                        <span className="flex items-center gap-1">
                                                            <ImageIcon className="h-4 w-4" />
                                                            JPG, PNG
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FileType className="h-4 w-4" />
                                                            PDF
                                                        </span>
                                                        <span>Max 5MB</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4"
                                                    >
                                                        <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                                    </motion.div>
                                                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                                                        File berhasil diupload!
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {data.attachment.name}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {(data.attachment.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* File Preview */}
                                        {data.attachment && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 p-4 backdrop-blur"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Preview Thumbnail */}
                                                    <div className="shrink-0">
                                                        {filePreview ? (
                                                            <img 
                                                                src={filePreview} 
                                                                alt="Preview" 
                                                                className="h-24 w-24 rounded-xl object-cover border-2 border-neutral-200 dark:border-neutral-700"
                                                            />
                                                        ) : (
                                                            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700">
                                                                <FileType className="h-12 w-12 text-neutral-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-neutral-900 dark:text-white truncate">
                                                            {data.attachment.name}
                                                        </p>
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                            {data.attachment.type}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 mt-1">
                                                            Ukuran: {(data.attachment.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                        
                                                        {/* Progress Bar (Simulated) */}
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '100%' }}
                                                            transition={{ duration: 0.5 }}
                                                            className="mt-3 h-2 rounded-full bg-emerald-500"
                                                        />
                                                    </div>

                                                    {/* Remove Button */}
                                                    <motion.button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setData('attachment', null);
                                                            setFilePreview(null);
                                                        }}
                                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {errors.attachment && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.attachment}
                                            </p>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                    >
                                        <div className="flex gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-sm text-amber-700 dark:text-amber-300">
                                                <p className="font-semibold mb-1">Persyaratan Surat Keterangan:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs">
                                                    <li>Surat harus asli dan jelas terbaca</li>
                                                    <li>Untuk sakit: Surat keterangan dokter</li>
                                                    <li>Untuk izin: Surat izin dari orang tua/wali</li>
                                                    <li>Format: JPG, PNG, atau PDF (max 5MB)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Summary Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800"
                                    >
                                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            Ringkasan Pengajuan
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">Jenis:</span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {data.type === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">Periode:</span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {data.tanggal_mulai} - {data.tanggal_selesai}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">Alasan:</span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {data.reason.length} karakter
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-600 dark:text-neutral-400">Lampiran:</span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {data.attachment ? '✓ Sudah upload' : '✗ Belum upload'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ═══════ NAVIGATION BUTTONS ═══════ */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700"
                        >
                            {/* Back Button */}
                            {currentStep > 1 && (
                                <motion.button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    whileHover={{ scale: 1.02, x: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 hover:bg-white/80 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-medium transition-all backdrop-blur border border-neutral-200 dark:border-neutral-700"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </motion.button>
                            )}

                            <div className="flex-1" />

                            {/* Next/Submit Button */}
                            {currentStep < 3 ? (
                                <motion.button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    disabled={
                                        (currentStep === 1 && !canProceedToStep2()) ||
                                        (currentStep === 2 && !canProceedToStep3())
                                    }
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg",
                                        (currentStep === 1 && canProceedToStep2()) || (currentStep === 2 && canProceedToStep3())
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:shadow-purple-500/30"
                                            : "bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                                    )}
                                >
                                    Selanjutnya
                                    <ArrowRight className="h-4 w-4" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="submit"
                                    disabled={!canSubmit() || processing}
                                    whileHover={{ scale: canSubmit() && !processing ? 1.02 : 1 }}
                                    whileTap={{ scale: canSubmit() && !processing ? 0.98 : 1 }}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg",
                                        canSubmit() && !processing
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:shadow-emerald-500/30"
                                            : "bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                                    )}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Kirim Pengajuan
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 🎨 STYLING DETAILS

### Glassmorphism Effect
```css
/* Main containers */
background: rgba(255, 255, 255, 0.4);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.2);

/* Dark mode */
background: rgba(23, 23, 23, 0.4);
border: 1px solid rgba(255, 255, 255, 0.05);
```

### Gradient Backgrounds
```css
/* Header gradient */
background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%);
background-size: 200% 200%;
animation: gradient 15s linear infinite;

/* Button gradient */
background: linear-gradient(90deg, #6366f1 0%, #9333ea 100%);
```

### Animations
```typescript
// Step transition
initial={{ opacity: 0, x: 50 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -50 }}
transition={{ type: 'spring', stiffness: 300, damping: 25 }}

// Pulse effect (active step)
animate={{
  scale: [1, 1.3, 1],
  opacity: [0.5, 0, 0.5],
}}
transition={{
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut"
}}

// Upload animation
animate={{
  y: dragActive ? -10 : [0, -10, 0],
}}
transition={{
  duration: 2,
  repeat: dragActive ? 0 : Infinity,
  ease: "easeInOut"
}}
```

---

## 📱 RESPONSIVE DESIGN

### Mobile Breakpoints
```typescript
// Header
className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6"

// Icon size
className="h-20 w-20 sm:h-24 sm:w-24"

// Text size
className="text-2xl sm:text-3xl"

// Step indicator
className="h-12 w-12 sm:h-16 sm:w-16"

// Grid layout
className="grid grid-cols-1 sm:grid-cols-2 gap-4"

// Padding
className="p-4 sm:p-6 lg:p-8"
```

---

## 🔧 BACKEND CONTROLLER

### File: app/Http/Controllers/User/PermitController.php

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\AttendanceSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PermitController extends Controller
{
    public function create()
    {
        $availableSessions = AttendanceSession::with(['course', 'dosen'])
            ->where('tanggal', '>=', now())
            ->orderBy('tanggal')
            ->orderBy('waktu_mulai')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'mata_kuliah' => $session->course->nama,
                    'tanggal' => $session->tanggal,
                    'tanggal_display' => $session->tanggal->format('d M Y'),
                    'waktu' => $session->waktu_mulai . ' - ' . $session->waktu_selesai,
                    'dosen' => $session->dosen->nama,
                ];
            });

        return Inertia::render('user/permit-create', [
            'availableSessions' => $availableSessions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'attendance_session_id' => 'required|exists:attendance_sessions,id',
            'type' => 'required|in:izin,sakit',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'reason' => 'required|string|min:20',
            'keterangan' => 'nullable|string',
            'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        // Upload file
        $path = $request->file('attachment')->store('permits', 'public');

        // Create permit
        Permit::create([
            'mahasiswa_id' => auth()->id(),
            'attendance_session_id' => $validated['attendance_session_id'],
            'type' => $validated['type'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'reason' => $validated['reason'],
            'keterangan' => $validated['keterangan'],
            'attachment' => $path,
            'status' => 'pending',
        ]);

        return redirect()->route('permit.index')
            ->with('success', 'Pengajuan izin/sakit berhasil dikirim!');
    }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Header Section
- [ ] Gradient background animated (indigo-purple-pink)
- [ ] Icon header tanpa container
- [ ] Tombol kembali simple style
- [ ] Blur orbs di background
- [ ] Responsive mobile layout

### Progress Indicator
- [ ] 3 steps dengan icon
- [ ] Active step dengan pulse animation
- [ ] Completed step dengan checkmark
- [ ] Connector line animated
- [ ] Responsive mobile

### Step 1: Pilih Sesi
- [ ] Search input untuk filter sesi
- [ ] List sesi dengan scroll
- [ ] Selected state dengan gradient
- [ ] Radio button jenis (Izin/Sakit) dengan icon
- [ ] Date picker tanggal mulai & selesai
- [ ] Validation real-time

### Step 2: Alasan
- [ ] Textarea dengan character counter
- [ ] Minimum 20 karakter validation
- [ ] Keterangan tambahan (optional)
- [ ] Info box dengan tips
- [ ] Real-time validation feedback

### Step 3: Upload
- [ ] Drag & drop zone
- [ ] File type validation (JPG, PNG, PDF)
- [ ] File size validation (max 5MB)
- [ ] Image preview untuk JPG/PNG
- [ ] Progress bar animation
- [ ] Remove file button
- [ ] Summary card
- [ ] Info box persyaratan

### Navigation
- [ ] Back button (step > 1)
- [ ] Next button dengan validation
- [ ] Submit button dengan loading state
- [ ] Disabled state untuk invalid form

### Animations
- [ ] Page fade in
- [ ] Step transition (slide)
- [ ] Hover effects
- [ ] Pulse animation (active step)
- [ ] Upload animation
- [ ] Button interactions

---

## 🎯 FINAL RESULT

Form ajukan izin/sakit akan memiliki:
- ✅ Multi-step wizard dengan 3 langkah
- ✅ Progress indicator yang jelas
- ✅ Drag & drop upload dengan preview
- ✅ Real-time validation
- ✅ Smooth animations
- ✅ 100% matching dashboard admin
- ✅ Responsive mobile perfect
- ✅ Glassmorphism effect
- ✅ User-friendly UX
