import IconMahasiswa from '@/assets/admin/mahasiswa/icon-mahasiswa.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    Check,
    ChevronLeft,
    Eye,
    EyeOff,
    GraduationCap,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Save,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Student {
    id: number;
    nim: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    place_of_birth: string;
    jenis_kelamin: 'L' | 'P';
    faculty: string;
    major: string;
    class: string;
    semester: number;
    entry_year: number;
    photo?: string | null;
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
            staggerChildren: 0.05,
        },
    },
};

export default function MahasiswaEdit({
    student,
    faculties,
    majors,
    classes,
}: Props) {
    const [activeSection, setActiveSection] = useState('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'patch',
        nim: student.nim || '',
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth || '',
        place_of_birth: student.place_of_birth || '',
        jenis_kelamin: student.jenis_kelamin || 'L',
        faculty: student.faculty || '',
        major: student.major || '',
        class: student.class || '',
        semester: student.semester || 1,
        entry_year: student.entry_year || new Date().getFullYear(),
        status: student.status || 'active',
        password: '',
        password_confirmation: '',
    });

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
            },
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
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.05) 0%, transparent 35%), radial-gradient(circle at 85% 0%, rgba(236,72,153,0.05) 0%, transparent 40%)',
                }}
            >
                {/* Animated Background */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 blur-3xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.5, 0.3, 0.5],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>

                <div className="relative z-10 container mx-auto max-w-7xl px-4 py-8">
                    {/* Header */}

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mb-8 overflow-hidden rounded-3xl p-8 shadow-2xl"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                            animate={{
                                backgroundPosition: [
                                    '0% 0%',
                                    '100% 100%',
                                    '0% 0%',
                                ],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        router.visit('/admin/mahasiswa')
                                    }
                                    className="mb-4 -ml-4 text-white/80 hover:bg-white/10 hover:text-white"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Daftar
                                </Button>
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className="flex h-16 w-16"
                                    >
                                        <img
                                            src={IconMahasiswa}
                                            alt="Icon Mahasiswa"
                                            className="h-full w-full object-contain drop-shadow-lg"
                                        />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">
                                            Edit Data Mahasiswa
                                        </h1>
                                        <p className="text-white/70">
                                            Perbarui informasi mahasiswa dengan
                                            lengkap dan akurat
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Errors Box in Header */}
                            {Object.keys(errors).length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="max-w-sm rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 backdrop-blur-md"
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 text-rose-300" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-rose-100">
                                                Validasi Gagal
                                            </h3>
                                            <p className="mt-1 text-xs text-rose-200/80">
                                                Mohon periksa kembali form
                                                pengisian. Ada{' '}
                                                {Object.keys(errors).length}{' '}
                                                kolom yang tidak valid.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Column - Photo Upload */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-1"
                            >
                                <div className="sticky top-8 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                    <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                        Foto Profil
                                    </h2>

                                    {/* Photo Preview (read-only for admin) */}
                                    <motion.div
                                        className="group relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-4 border-white/20 bg-neutral-100 dark:bg-neutral-800"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {student.photo ? (
                                            <img
                                                src={student.photo}
                                                alt={data.name || 'Foto Profil'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/10">
                                                <span className="font-display text-7xl text-indigo-400/70">
                                                    {(data.name || 'M')
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>

                                    <p className="rounded-xl border border-neutral-200 bg-neutral-100/70 px-3 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300">
                                        Foto profil hanya dapat diubah oleh
                                        mahasiswa melalui akun masing-masing.
                                    </p>
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
                                                className="rounded-3xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-white">
                                                        <div className="flex h-12 w-12 items-center justify-center">
                                                            <img
                                                                src={
                                                                    IconMahasiswa
                                                                }
                                                                alt="Icon Data Pribadi"
                                                                className="h-full w-full object-contain drop-shadow-md"
                                                            />
                                                        </div>
                                                        Data Pribadi
                                                    </h2>
                                                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                        Informasi pribadi
                                                        mahasiswa
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    {/* NIM */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="nim"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <BookOpen className="h-4 w-4 text-indigo-600" />
                                                            NIM
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id="nim"
                                                            value={data.nim}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'nim',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={cn(
                                                                'h-12',
                                                                errors.nim &&
                                                                    'border-red-500',
                                                            )}
                                                            placeholder="Masukkan NIM"
                                                        />
                                                        {errors.nim && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.nim}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Nama Lengkap */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="name"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <User className="h-4 w-4 text-indigo-600" />
                                                            Nama Lengkap
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            value={data.name}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={cn(
                                                                'h-12',
                                                                errors.name &&
                                                                    'border-red-500',
                                                            )}
                                                            placeholder="Masukkan nama lengkap"
                                                        />
                                                        {errors.name && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.name}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Tempat Lahir */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="place_of_birth"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Tempat Lahir
                                                        </Label>
                                                        <Input
                                                            id="place_of_birth"
                                                            value={
                                                                data.place_of_birth
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'place_of_birth',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12"
                                                            placeholder="Masukkan tempat lahir"
                                                        />
                                                    </div>

                                                    {/* Tanggal Lahir */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="date_of_birth"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Calendar className="h-4 w-4 text-indigo-600" />
                                                            Tanggal Lahir
                                                        </Label>
                                                        <Input
                                                            id="date_of_birth"
                                                            type="date"
                                                            value={
                                                                data.date_of_birth
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'date_of_birth',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12"
                                                        />
                                                    </div>

                                                    {/* Jenis Kelamin */}
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-indigo-600" />
                                                            Jenis Kelamin
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <div className="flex gap-4">
                                                            <label className="flex cursor-pointer items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="jenis_kelamin"
                                                                    value="L"
                                                                    checked={
                                                                        data.jenis_kelamin ===
                                                                        'L'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'jenis_kelamin',
                                                                            e
                                                                                .target
                                                                                .value as
                                                                                | 'L'
                                                                                | 'P',
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-indigo-600"
                                                                />
                                                                <span className="text-sm">
                                                                    Laki-laki
                                                                </span>
                                                            </label>
                                                            <label className="flex cursor-pointer items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name="jenis_kelamin"
                                                                    value="P"
                                                                    checked={
                                                                        data.jenis_kelamin ===
                                                                        'P'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'jenis_kelamin',
                                                                            e
                                                                                .target
                                                                                .value as
                                                                                | 'L'
                                                                                | 'P',
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-indigo-600"
                                                                />
                                                                <span className="text-sm">
                                                                    Perempuan
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="status"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Check className="h-4 w-4 text-indigo-600" />
                                                            Status
                                                        </Label>
                                                        <select
                                                            id="status"
                                                            value={data.status}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'status',
                                                                    e.target
                                                                        .value as any,
                                                                )
                                                            }
                                                            className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-800"
                                                        >
                                                            <option value="active">
                                                                Aktif
                                                            </option>
                                                            <option value="inactive">
                                                                Tidak Aktif
                                                            </option>
                                                            <option value="graduated">
                                                                Lulus
                                                            </option>
                                                            <option value="dropout">
                                                                Dropout
                                                            </option>
                                                        </select>
                                                    </div>

                                                    {/* Alamat - Full Width */}
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label
                                                            htmlFor="address"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <MapPin className="h-4 w-4 text-indigo-600" />
                                                            Alamat Lengkap
                                                        </Label>
                                                        <textarea
                                                            id="address"
                                                            value={data.address}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'address',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            rows={3}
                                                            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800"
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
                                            className="space-y-6 lg:col-span-2"
                                        >
                                            {/* Academic Information Section */}
                                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                                                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                                                    <BookOpen className="h-5 w-5 text-purple-500" />
                                                    Informasi Akademik
                                                </h2>

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    {/* Faculty */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="faculty">
                                                            Fakultas
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Select
                                                            value={data.faculty}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'faculty',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-neutral-200 bg-white/50 text-neutral-900 backdrop-blur-sm transition-all focus:border-emerald-500/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {faculties.map(
                                                                    (
                                                                        faculty,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                faculty
                                                                            }
                                                                            value={
                                                                                faculty
                                                                            }
                                                                        >
                                                                            {
                                                                                faculty
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Major */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="major">
                                                            Program Studi
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Select
                                                            value={data.major}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'major',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-neutral-200 bg-white/50 text-neutral-900 backdrop-blur-sm transition-all focus:border-emerald-500/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {majors.map(
                                                                    (major) => (
                                                                        <SelectItem
                                                                            key={
                                                                                major
                                                                            }
                                                                            value={
                                                                                major
                                                                            }
                                                                        >
                                                                            {
                                                                                major
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Class */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="class">
                                                            Kelas
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Select
                                                            value={data.class}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'class',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-neutral-200 bg-white/50 text-neutral-900 backdrop-blur-sm transition-all focus:border-emerald-500/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classes.map(
                                                                    (cls) => (
                                                                        <SelectItem
                                                                            key={
                                                                                cls
                                                                            }
                                                                            value={
                                                                                cls
                                                                            }
                                                                        >
                                                                            {
                                                                                cls
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="semester">
                                                            Semester
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Select
                                                            value={data.semester.toString()}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    'semester',
                                                                    parseInt(
                                                                        value,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-neutral-200 bg-white/50 text-neutral-900 backdrop-blur-sm transition-all focus:border-emerald-500/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5, 6, 7, 8,
                                                                ].map((sem) => (
                                                                    <SelectItem
                                                                        key={
                                                                            sem
                                                                        }
                                                                        value={sem.toString()}
                                                                    >
                                                                        Semester{' '}
                                                                        {sem}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Entry Year */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="entry_year">
                                                            Tahun Masuk
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id="entry_year"
                                                            type="number"
                                                            value={
                                                                data.entry_year
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'entry_year',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="bg-white/50 dark:bg-neutral-800/50"
                                                            placeholder="2023"
                                                        />
                                                    </div>

                                                    {/* Status */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="status">
                                                            Status
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Select
                                                            value={data.status}
                                                            onValueChange={(
                                                                value:
                                                                    | 'active'
                                                                    | 'inactive'
                                                                    | 'graduated',
                                                            ) =>
                                                                setData(
                                                                    'status',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="border-neutral-200 bg-white/50 text-neutral-900 backdrop-blur-sm transition-all focus:border-emerald-500/50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-100">
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
                                                                        Tidak
                                                                        Aktif
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
                                                transition={{ delay: 0.2 }}
                                                className="flex items-center justify-end gap-4"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.visit(
                                                            '/admin/mahasiswa',
                                                        )
                                                    }
                                                    disabled={processing}
                                                    className="min-w-[120px]"
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Batal
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="min-w-[120px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-4 w-4" />
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
                                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                                            >
                                                <motion.div
                                                    initial={{
                                                        scale: 0.8,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        scale: 1,
                                                        opacity: 1,
                                                    }}
                                                    className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-neutral-900"
                                                >
                                                    <div className="flex flex-col items-center gap-4">
                                                        <motion.div
                                                            animate={{
                                                                rotate: 360,
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                            className="h-16 w-16 rounded-full border-4 border-indigo-500 border-t-transparent"
                                                        />
                                                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                                                            Menyimpan
                                                            perubahan...
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
                                                className="rounded-3xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-white">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-neutral-900 dark:text-white">
                                                            <GraduationCap className="h-6 w-6" />
                                                        </div>
                                                        Data Akademik
                                                    </h2>
                                                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                        Informasi akademik
                                                        mahasiswa
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    {/* Fakultas */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="faculty">
                                                            Fakultas
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <select
                                                            id="faculty"
                                                            value={data.faculty}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'faculty',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-800"
                                                        >
                                                            <option value="">
                                                                Pilih Fakultas
                                                            </option>
                                                            {faculties.map(
                                                                (faculty) => (
                                                                    <option
                                                                        key={
                                                                            faculty
                                                                        }
                                                                        value={
                                                                            faculty
                                                                        }
                                                                    >
                                                                        {
                                                                            faculty
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* Program Studi */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="major">
                                                            Program Studi
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <select
                                                            id="major"
                                                            value={data.major}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'major',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-800"
                                                        >
                                                            <option value="">
                                                                Pilih Program
                                                                Studi
                                                            </option>
                                                            {majors.map(
                                                                (major) => (
                                                                    <option
                                                                        key={
                                                                            major
                                                                        }
                                                                        value={
                                                                            major
                                                                        }
                                                                    >
                                                                        {major}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* Kelas */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="class">
                                                            Kelas
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <select
                                                            id="class"
                                                            value={data.class}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'class',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-800"
                                                        >
                                                            <option value="">
                                                                Pilih Kelas
                                                            </option>
                                                            {classes.map(
                                                                (cls) => (
                                                                    <option
                                                                        key={
                                                                            cls
                                                                        }
                                                                        value={
                                                                            cls
                                                                        }
                                                                    >
                                                                        {cls}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* Semester */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="semester">
                                                            Semester
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id="semester"
                                                            type="number"
                                                            min="1"
                                                            max="14"
                                                            value={
                                                                data.semester
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'semester',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="h-12"
                                                            placeholder="Semester"
                                                        />
                                                    </div>

                                                    {/* Tahun Masuk */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="entry_year">
                                                            Tahun Masuk
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id="entry_year"
                                                            type="number"
                                                            min="2000"
                                                            max={new Date().getFullYear()}
                                                            value={
                                                                data.entry_year
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'entry_year',
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
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
                                                className="rounded-3xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-white">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-neutral-900 dark:text-white">
                                                            <Phone className="h-6 w-6" />
                                                        </div>
                                                        Informasi Kontak
                                                    </h2>
                                                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                        Data kontak mahasiswa
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    {/* Email */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="email"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Mail className="h-4 w-4 text-blue-600" />
                                                            Email
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'email',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={cn(
                                                                'h-12',
                                                                errors.email &&
                                                                    'border-red-500',
                                                            )}
                                                            placeholder="email@example.com"
                                                        />
                                                        {errors.email && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {errors.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="phone"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Phone className="h-4 w-4 text-blue-600" />
                                                            Nomor Telepon
                                                        </Label>
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={data.phone}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'phone',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
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
                                                className="rounded-3xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40"
                                            >
                                                <div className="mb-6">
                                                    <h2 className="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-white">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-neutral-900 dark:text-white">
                                                            <Eye className="h-6 w-6" />
                                                        </div>
                                                        Keamanan Akun
                                                    </h2>
                                                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                        Ubah password akun
                                                        mahasiswa (opsional)
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    {/* Password */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">
                                                            Password Baru
                                                        </Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="password"
                                                                type={
                                                                    showPassword
                                                                        ? 'text'
                                                                        : 'password'
                                                                }
                                                                value={
                                                                    data.password
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'password',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-12 pr-12"
                                                                placeholder="Kosongkan jika tidak ingin mengubah"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        !showPassword,
                                                                    )
                                                                }
                                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-5 w-5" />
                                                                ) : (
                                                                    <Eye className="h-5 w-5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        {errors.password && (
                                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {
                                                                    errors.password
                                                                }
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
                                                            type={
                                                                showPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            value={
                                                                data.password_confirmation
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'password_confirmation',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-12"
                                                            placeholder="Ulangi password baru"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                                                    <div className="flex gap-3">
                                                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                                        <div>
                                                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                                                                Perhatian
                                                            </h4>
                                                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400 dark:text-amber-600">
                                                                Kosongkan field
                                                                password jika
                                                                tidak ingin
                                                                mengubah
                                                                password
                                                                mahasiswa.
                                                                Password minimal
                                                                8 karakter.
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
                                className="absolute h-3 w-3 rounded-full"
                                style={{
                                    backgroundColor: [
                                        '#6366f1',
                                        '#8b5cf6',
                                        '#ec4899',
                                        '#10b981',
                                        '#f59e0b',
                                        '#3b82f6',
                                    ][i % 6],
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1, 0.5],
                                    opacity: [0, 1, 0],
                                    y: [0, -200 - Math.random() * 300],
                                    x: [(Math.random() - 0.5) * 400],
                                    rotate: [
                                        0,
                                        360 * (Math.random() > 0.5 ? 1 : -1),
                                    ],
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
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                                delay: 0.1,
                            }}
                            className="relative mx-4 max-w-sm rounded-3xl border border-white/20 bg-white p-10 text-center shadow-2xl dark:bg-neutral-900"
                        >
                            {/* Animated checkmark circle */}
                            <motion.div
                                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.2,
                                }}
                            >
                                <motion.div
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    <Check
                                        className="h-12 w-12 text-white"
                                        strokeWidth={3}
                                    />
                                </motion.div>
                            </motion.div>

                            <motion.h2
                                className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white"
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
                                className="mt-6 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{
                                        delay: 0.7,
                                        duration: 1.8,
                                        ease: 'linear',
                                    }}
                                />
                            </motion.div>
                            <motion.p
                                className="mt-2 text-xs text-neutral-400"
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
