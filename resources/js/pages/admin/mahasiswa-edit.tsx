import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import IconMahasiswa from '@/assets/admin/mahasiswa/icon-mahasiswa.png';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    GraduationCap,
    Camera,
    Save,
    X,
    ChevronLeft,
    Upload,
    Check,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Student {
    id: number;
    nim: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: 'L' | 'P';
    faculty: string;
    major: string;
    class: string;
    semester: number;
    entry_year: number;
    photo: string;
    status: 'active' | 'inactive' | 'graduated';
    password?: string;
    password_confirmation?: string;
}

interface Props {
    student: Student;
    faculties: string[];
    majors: string[];
    classes: string[];
}


const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function MahasiswaEdit({ student, faculties, majors, classes }: Props) {
    const [photoPreview, setPhotoPreview] = useState<string>(student.photo);
    const [isDragging, setIsDragging] = useState(false);
    const [activeSection, setActiveSection] = useState('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'patch',
        nim: student.nim || '',
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth || '',
        place_of_birth: student.place_of_birth || '',
        gender: student.gender || 'L',
        faculty: student.faculty || '',
        major: student.major || '',
        class: student.class || '',
        semester: student.semester || 1,
        entry_year: student.entry_year || new Date().getFullYear(),
        status: student.status || 'active',
        photo: null as File | null,
        password: '',
        password_confirmation: '',
    });

    const handlePhotoChange = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handlePhotoChange(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/mahasiswa/${student.id}`, {
            onSuccess: () => {
                setShowSuccessAnimation(true);
                toast.success('Data mahasiswa berhasil diperbarui!');
                setTimeout(() => {
                    router.visit('/admin/mahasiswa');
                }, 2500);
            },
            onError: () => {
                toast.error('Gagal memperbarui data mahasiswa');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Data Mahasiswa" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100"
                style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.05) 0%, transparent 35%), radial-gradient(circle at 85% 0%, rgba(236,72,153,0.05) 0%, transparent 40%)' }}
            >
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.5, 0.3, 0.5],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header */}

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl p-8 shadow-2xl mb-8"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                            <div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.visit('/admin/mahasiswa')}
                                    className="mb-4 text-white/80 hover:text-white hover:bg-white/10 -ml-4"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Daftar
                                </Button>
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className="flex h-16 w-16"
                                    >
                                        <img src={IconMahasiswa} alt="Icon Mahasiswa" className="w-full h-full object-contain drop-shadow-lg" />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">
                                            Edit Data Mahasiswa
                                        </h1>
                                        <p className="text-white/70">
                                            Perbarui informasi mahasiswa dengan lengkap dan akurat
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Errors Box in Header */}
                            {Object.keys(errors).length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-rose-500/10 backdrop-blur-md border border-rose-500/30 rounded-2xl p-4 max-w-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-rose-300 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-rose-100 text-sm">Validasi Gagal</h3>
                                            <p className="text-xs text-rose-200/80 mt-1">
                                                Mohon periksa kembali form pengisian. Ada {Object.keys(errors).length} kolom yang tidak valid.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Photo Upload */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-1"
                            >
                                <div className="sticky top-8 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl">
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                                        Foto Profil
                                    </h2>


                                    {/* Photo Preview */}
                                    <motion.div
                                        className="relative aspect-square rounded-2xl overflow-hidden mb-4 group bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-4 border-white/20"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview.startsWith('http') || photoPreview.startsWith('data:') ? photoPreview : `/storage/${photoPreview}`}
                                                alt={data.name || 'Foto Profil'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/10">
                                                <span className="font-display text-7xl text-indigo-400/70">
                                                    {(data.name || 'M').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera className="h-4 w-4 mr-2" />
                                                Ganti Foto
                                            </Button>
                                        </div>
                                    </motion.div>

                                    {/* Drag & Drop Area */}
                                    <motion.div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-6 text-center transition-all",
                                            isDragging ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-md" : "border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-md"
                                        )}
                                    >
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                            Drag & drop foto atau
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Pilih File
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handlePhotoChange(file);
                                            }}
                                        />
                                        <p className="text-xs text-neutral-500 mt-2">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </motion.div>

                                    {errors.photo && (
                                        <p className="text-sm text-red-500 mt-2">{errors.photo}</p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Main Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-2"
                            >
                                <div className="space-y-6">
                                    <AnimatePresence mode="wait">
                                        {/* Personal Data Section */}
                                        {activeSection === 'personal' && (
                                            <motion.div
                                                key="personal"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center">
                                                            <img src={IconMahasiswa} alt="Icon Data Pribadi" className="w-full h-full object-contain drop-shadow-md" />
                                                        </div>
                                                        Data Pribadi
                                                    </h2>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                                                        Informasi pribadi mahasiswa
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* NIM */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="nim" className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                                            NIM
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="nim"
                                                            value={data.nim}
                                                            onChange={(e) => setData('nim', e.target.value)}
                                                            className={cn(
                                                                'h-12',
                                                                errors.nim && 'border-red-500'
                                                            )}
                                                            placeholder="Masukkan NIM"
                                                        />
                                                        {errors.nim && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.nim}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Nama Lengkap */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name" className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-indigo-600" />
                                                            Nama Lengkap
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            className={cn(
                                                                'h-12',
                                                                errors.name && 'border-red-500'
                                                            )}
                                                            placeholder="Masukkan nama lengkap"
                                                        />
                                                        {errors.name && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.name}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Tempat Lahir */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="place_of_birth" className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Tempat Lahir
                                                        </Label>
                                                        <Input
                                                            id="place_of_birth"
                                                            value={data.place_of_birth}
                                                            onChange={(e) => setData('place_of_birth', e.target.value)}
                                                            className="h-12"
                                                            placeholder="Masukkan tempat lahir"
                                                        />
                                                    </div>

                                                    {/* Tanggal Lahir */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-indigo-600" />
                                                            Tanggal Lahir
                                                        </Label>
                                                        <Input
                                                            id="date_of_birth"
                                                            type="date"
                                                            value={data.date_of_birth}
                                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                                            className="h-12"
                                                        />
                                                    </div>

                                                    {/* Jenis Kelamin */}
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-indigo-600" />
                                                            Jenis Kelamin
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="gender"
                                                                    value="L"
                                                                    checked={data.gender === 'L'}
                                                                    onChange={(e) => setData('gender', e.target.value as 'L' | 'P')}
                                                                    className="h-4 w-4 text-indigo-600"
                                                                />
                                                                <span className="text-sm">Laki-laki</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="gender"
                                                                    value="P"
                                                                    checked={data.gender === 'P'}
                                                                    onChange={(e) => setData('gender', e.target.value as 'L' | 'P')}
                                                                    className="h-4 w-4 text-indigo-600"
                                                                />
                                                                <span className="text-sm">Perempuan</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="status" className="flex items-center gap-2">
                                                            <Check className="h-4 w-4 text-indigo-600" />
                                                            Status
                                                        </Label>
                                                        <select
                                                            id="status"
                                                            value={data.status}
                                                            onChange={(e) => setData('status', e.target.value as any)}
                                                            className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4"
                                                        >
                                                            <option value="active">Aktif</option>
                                                            <option value="inactive">Tidak Aktif</option>
                                                            <option value="graduated">Lulus</option>
                                                            <option value="dropout">Dropout</option>
                                                        </select>
                                                    </div>

                                                    {/* Alamat - Full Width */}
                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label htmlFor="address" className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Alamat Lengkap
                                                        </Label>
                                                        <textarea
                                                            id="address"
                                                            value={data.address}
                                                            onChange={(e) => setData('address', e.target.value)}
                                                            rows={3}
                                                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3"
                                                            placeholder="Masukkan alamat lengkap"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Right Column - Form Fields */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="lg:col-span-2 space-y-6"
                                        >
                                            {/* Academic Information Section */}
                                            <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl">
                                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-purple-500" />
                                                    Informasi Akademik
                                                </h2>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Faculty */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="faculty">
                                                            Fakultas
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.faculty}
                                                            onValueChange={(value) => setData('faculty', value)}
                                                        >
                                                            <SelectTrigger className="bg-white/50 dark:bg-neutral-800/50 bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {faculties.map((faculty) => (
                                                                    <SelectItem key={faculty} value={faculty}>
                                                                        {faculty}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Major */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="major">
                                                            Program Studi
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.major}
                                                            onValueChange={(value) => setData('major', value)}
                                                        >
                                                            <SelectTrigger className="bg-white/50 dark:bg-neutral-800/50 bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {majors.map((major) => (
                                                                    <SelectItem key={major} value={major}>
                                                                        {major}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Class */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="class">
                                                            Kelas
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.class}
                                                            onValueChange={(value) => setData('class', value)}
                                                        >
                                                            <SelectTrigger className="bg-white/50 dark:bg-neutral-800/50 bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classes.map((cls) => (
                                                                    <SelectItem key={cls} value={cls}>
                                                                        {cls}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="semester">
                                                            Semester
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.semester.toString()}
                                                            onValueChange={(value) => setData('semester', parseInt(value))}
                                                        >
                                                            <SelectTrigger className="bg-white/50 dark:bg-neutral-800/50 bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                                                    <SelectItem key={sem} value={sem.toString()}>
                                                                        Semester {sem}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Entry Year */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="entry_year">
                                                            Tahun Masuk
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="entry_year"
                                                            type="number"
                                                            value={data.entry_year}
                                                            onChange={(e) => setData('entry_year', parseInt(e.target.value))}
                                                            className="bg-white/50 dark:bg-neutral-800/50"
                                                            placeholder="2023"
                                                        />
                                                    </div>

                                                    {/* Status */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="status">
                                                            Status
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Select
                                                            value={data.status}
                                                            onValueChange={(value: 'active' | 'inactive' | 'graduated') => setData('status', value)}
                                                        >
                                                            <SelectTrigger className="bg-white/50 dark:bg-neutral-800/50 bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="active">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                                                        Aktif
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="inactive">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                                                        Tidak Aktif
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="graduated">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                                        Lulus
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="flex items-center justify-end gap-4"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => router.visit('/admin/mahasiswa')}
                                                    disabled={processing}
                                                    className="min-w-[120px]"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Batal
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="min-w-[120px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Simpan Perubahan
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </motion.div>

                                        {/* Success Animation Overlay */}
                                        {processing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl"
                                                >
                                                    <div className="flex flex-col items-center gap-4">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent"
                                                        />
                                                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                            Menyimpan perubahan...
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}

                                        {/* Academic Data Section */}
                                        {activeSection === 'academic' && (
                                            <motion.div
                                                key="academic"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-neutral-900 dark:text-white">
                                                            <GraduationCap className="h-6 w-6" />
                                                        </div>
                                                        Data Akademik
                                                    </h2>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                                                        Informasi akademik mahasiswa
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Fakultas */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="faculty">
                                                            Fakultas
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <select
                                                            id="faculty"
                                                            value={data.faculty}
                                                            onChange={(e) => setData('faculty', e.target.value)}
                                                            className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4"
                                                        >
                                                            <option value="">Pilih Fakultas</option>
                                                            {faculties.map((faculty) => (
                                                                <option key={faculty} value={faculty}>
                                                                    {faculty}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Program Studi */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="major">
                                                            Program Studi
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <select
                                                            id="major"
                                                            value={data.major}
                                                            onChange={(e) => setData('major', e.target.value)}
                                                            className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4"
                                                        >
                                                            <option value="">Pilih Program Studi</option>
                                                            {majors.map((major) => (
                                                                <option key={major} value={major}>
                                                                    {major}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Kelas */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="class">
                                                            Kelas
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <select
                                                            id="class"
                                                            value={data.class}
                                                            onChange={(e) => setData('class', e.target.value)}
                                                            className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4"
                                                        >
                                                            <option value="">Pilih Kelas</option>
                                                            {classes.map((cls) => (
                                                                <option key={cls} value={cls}>
                                                                    {cls}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="semester">
                                                            Semester
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="semester"
                                                            type="number"
                                                            min="1"
                                                            max="14"
                                                            value={data.semester}
                                                            onChange={(e) => setData('semester', parseInt(e.target.value))}
                                                            className="h-12"
                                                            placeholder="Semester"
                                                        />
                                                    </div>

                                                    {/* Tahun Masuk */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="entry_year">
                                                            Tahun Masuk
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="entry_year"
                                                            type="number"
                                                            min="2000"
                                                            max={new Date().getFullYear()}
                                                            value={data.entry_year}
                                                            onChange={(e) => setData('entry_year', parseInt(e.target.value))}
                                                            className="h-12"
                                                            placeholder="Tahun Masuk"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Contact Section */}
                                        {activeSection === 'contact' && (
                                            <motion.div
                                                key="contact"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-neutral-900 dark:text-white">
                                                            <Phone className="h-6 w-6" />
                                                        </div>
                                                        Informasi Kontak
                                                    </h2>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                                                        Data kontak mahasiswa
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Email */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-blue-600" />
                                                            Email
                                                            <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                            className={cn(
                                                                'h-12',
                                                                errors.email && 'border-red-500'
                                                            )}
                                                            placeholder="email@example.com"
                                                        />
                                                        {errors.email && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-blue-600" />
                                                            Nomor Telepon
                                                        </Label>
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={data.phone}
                                                            onChange={(e) => setData('phone', e.target.value)}
                                                            className="h-12"
                                                            placeholder="08xxxxxxxxxx"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Security Section */}
                                        {activeSection === 'security' && (
                                            <motion.div
                                                key="security"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-neutral-900 dark:text-white">
                                                            <Eye className="h-6 w-6" />
                                                        </div>
                                                        Keamanan Akun
                                                    </h2>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                                                        Ubah password akun mahasiswa (opsional)
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Password */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">
                                                            Password Baru
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="password"
                                                                type={showPassword ? 'text' : 'password'}
                                                                value={data.password}
                                                                onChange={(e) => setData('password', e.target.value)}
                                                                className="h-12 pr-12"
                                                                placeholder="Kosongkan jika tidak ingin mengubah"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-5 w-5" />
                                                                ) : (
                                                                    <Eye className="h-5 w-5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        {errors.password && (
                                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.password}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Password Confirmation */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password_confirmation">
                                                            Konfirmasi Password
                                                        </Label>
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={data.password_confirmation}
                                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                                            className="h-12"
                                                            placeholder="Ulangi password baru"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                                    <div className="flex gap-3">
                                                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                                                                Perhatian
                                                            </h4>
                                                            <p className="text-sm text-amber-700 dark:text-amber-600 dark:text-amber-400 mt-1">
                                                                Kosongkan field password jika tidak ingin mengubah password mahasiswa.
                                                                Password minimal 8 karakter.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Success Animation Overlay */}
            <AnimatePresence>
                {showSuccessAnimation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
                    >
                        {/* Confetti particles */}
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'][i % 6],
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0.5],
                                    opacity: [0, 1, 0],
                                    y: [0, -200 - Math.random() * 300],
                                    x: [(Math.random() - 0.5) * 400],
                                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: 0.3 + Math.random() * 0.5,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}

                        {/* Main success card */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                            className="relative bg-white dark:bg-neutral-900 rounded-3xl p-10 shadow-2xl border border-white/20 text-center max-w-sm mx-4"
                        >
                            {/* Animated checkmark circle */}
                            <motion.div
                                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            >
                                <motion.div
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    <Check className="h-12 w-12 text-white" strokeWidth={3} />
                                </motion.div>
                            </motion.div>

                            <motion.h2
                                className="text-2xl font-bold text-neutral-900 dark:text-white mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Berhasil! 🎉
                            </motion.h2>
                            <motion.p
                                className="text-neutral-500 dark:text-neutral-400"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Data mahasiswa berhasil diperbarui
                            </motion.p>

                            {/* Progress bar */}
                            <motion.div
                                className="mt-6 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: 0.7, duration: 1.8, ease: 'linear' }}
                                />
                            </motion.div>
                            <motion.p
                                className="text-xs text-neutral-400 mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                Mengarahkan ke daftar mahasiswa...
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
