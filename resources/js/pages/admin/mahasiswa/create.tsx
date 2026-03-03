import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback, type ReactNode, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Save, User, Hash, Mail, Phone, Building2, BookOpen,
    Users, Calendar, Shield, Lock, Eye, EyeOff, Upload, Download,
    CheckCircle2, AlertCircle, AlertTriangle, Loader2, X, GraduationCap,
    Circle, Sparkles, RefreshCw,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

import iconMahasiswa from '@/assets/admin/mahasiswa/icon-mahasiswa.png';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PageProps {
    fakultasList: string[];
    kelasList: string[];
    stats: { total: number };
}

// ─── Helper Components ───────────────────────────────────────────────────────

function FormSection({
    title, description, icon: Icon, gradient, children, collapsible, defaultOpen = true,
}: {
    title: string; description: string; icon: any; gradient: string;
    children: ReactNode; collapsible?: boolean; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl dark:border-white/5 overflow-hidden"
        >
            <button
                type="button"
                onClick={() => collapsible && setOpen(!open)}
                className={cn(
                    'w-full flex items-center gap-4 p-6 text-left',
                    collapsible && 'cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors',
                )}
            >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', gradient)}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
                </div>
                {collapsible && (
                    <motion.div animate={{ rotate: open ? 180 : 0 }} className="text-neutral-400">
                        <ChevronLeft className="h-5 w-5 -rotate-90" />
                    </motion.div>
                )}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function FormField({
    label, icon: Icon, required, optional, error, helper, children,
}: {
    label: string; icon: any; required?: boolean; optional?: boolean;
    error?: string; helper?: string; children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                <Icon className="h-4 w-4 text-indigo-500" />
                {label}
                {required && <span className="text-rose-500 text-xs">*</span>}
                {optional && <span className="text-xs font-normal text-neutral-400">(Opsional)</span>}
            </label>
            {children}
            {helper && !error && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{helper}</p>
            )}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1"
                >
                    <AlertCircle className="h-3 w-3" /> {error}
                </motion.p>
            )}
        </div>
    );
}

function NIMValidator({ nim }: { nim: string }) {
    if (!nim) return null;

    const validate = () => {
        if (nim.length < 10) return { valid: false, message: `NIM harus 10 digit (${nim.length}/10)` };
        if (!/^\d+$/.test(nim)) return { valid: false, message: 'NIM harus berupa angka' };
        if (nim.length > 10) return { valid: false, message: 'NIM tidak boleh lebih dari 10 digit' };
        return { valid: true, message: 'Format NIM valid ✓' };
    };

    const result = validate();
    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'mt-2 px-3 py-2 rounded-lg flex items-center gap-2 text-xs',
                result.valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
            )}
        >
            {result.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            <span>{result.message}</span>
        </motion.div>
    );
}

function DuplicateWarning({ field, exists }: { field: string; exists: boolean }) {
    if (!exists) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-2"
        >
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
                <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    {field === 'nim' ? 'NIM' : 'Email'} sudah terdaftar
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                    Mahasiswa dengan {field === 'nim' ? 'NIM' : 'email'} ini sudah ada dalam sistem
                </p>
            </div>
        </motion.div>
    );
}

function PasswordStrength({ password }: { password: string }) {
    if (!password) return null;

    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    const level = score < 40 ? { label: 'Lemah', color: 'from-red-500 to-rose-600', text: 'text-red-600 dark:text-red-400' }
        : score < 70 ? { label: 'Sedang', color: 'from-amber-500 to-orange-600', text: 'text-amber-600 dark:text-amber-400' }
            : { label: 'Kuat', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-600 dark:text-emerald-400' };

    const requirements = [
        { met: password.length >= 8, text: 'Minimal 8 karakter' },
        { met: /[a-z]/.test(password), text: 'Huruf kecil' },
        { met: /[A-Z]/.test(password), text: 'Huruf besar' },
        { met: /[0-9]/.test(password), text: 'Angka' },
        { met: /[^a-zA-Z0-9]/.test(password), text: 'Karakter khusus (!@#$)' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Kekuatan Password</span>
                <span className={cn('font-semibold', level.text)}>{level.label}</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(score, 100)}%` }}
                    transition={{ duration: 0.4 }}
                    className={cn('h-full rounded-full bg-gradient-to-r', level.color)}
                />
            </div>
            <div className="space-y-1 mt-1">
                {requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        {r.met ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                            <Circle className="h-3 w-3 text-neutral-400" />
                        )}
                        <span className={r.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'}>
                            {r.text}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CreateMahasiswa({ fakultasList, kelasList, stats }: PageProps) {
    const form = useForm({
        nama: '',
        nim: '',
        email: '',
        phone: '',
        fakultas: '',
        prodi: '',
        kelas: '',
        semester: 1,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [duplicateCheck, setDuplicateCheck] = useState<{ nim?: boolean; email?: boolean }>({});
    const [checking, setChecking] = useState(false);

    // Auto-generate password
    const generateSecurePassword = useCallback(() => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const special = '!@#$%^&*';
        const all = lower + upper + nums + special;

        let pw = '';
        pw += lower[Math.floor(Math.random() * lower.length)];
        pw += upper[Math.floor(Math.random() * upper.length)];
        pw += nums[Math.floor(Math.random() * nums.length)];
        pw += special[Math.floor(Math.random() * special.length)];

        for (let i = pw.length; i < 12; i++) {
            pw += all[Math.floor(Math.random() * all.length)];
        }

        return pw.split('').sort(() => Math.random() - 0.5).join('');
    }, []);

    useEffect(() => {
        if (autoGeneratePassword) {
            const pw = generateSecurePassword();
            form.setData(prev => ({ ...prev, password: pw, password_confirmation: pw }));
        }
    }, [autoGeneratePassword]);

    // Duplicate check - NIM
    useEffect(() => {
        if (form.data.nim.length < 10) { setDuplicateCheck(prev => ({ ...prev, nim: false })); return; }
        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const res = await fetch(`/admin/mahasiswa/check-duplicate?nim=${form.data.nim}`);
                const data = await res.json();
                setDuplicateCheck(prev => ({ ...prev, nim: data.exists }));
            } catch { /* ignore */ } finally { setChecking(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [form.data.nim]);

    // Duplicate check - Email
    useEffect(() => {
        if (!form.data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email)) {
            setDuplicateCheck(prev => ({ ...prev, email: false })); return;
        }
        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const res = await fetch(`/admin/mahasiswa/check-duplicate?email=${form.data.email}`);
                const data = await res.json();
                setDuplicateCheck(prev => ({ ...prev, email: data.exists }));
            } catch { /* ignore */ } finally { setChecking(false); }
        }, 500);
        return () => clearTimeout(timer);
    }, [form.data.email]);

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();

        // If auto-generate, send empty password to let backend generate
        if (autoGeneratePassword) {
            form.transform((data) => ({
                ...data,
                password: '',
                password_confirmation: '',
            }));
        }

        form.post('/admin/mahasiswa', {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => router.visit('/admin/mahasiswa'), 2500);
            },
        });
    };

    const inputClass = 'w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-sm';
    const selectClass = cn(inputClass, 'appearance-auto');

    // ─── Preview Items ───────────────────────────────────────────────────────
    const previewItems = [
        { label: 'Nama Lengkap', value: form.data.nama, icon: User },
        { label: 'NIM', value: form.data.nim, icon: Hash },
        { label: 'Email', value: form.data.email, icon: Mail },
        { label: 'Telepon', value: form.data.phone, icon: Phone },
        { label: 'Fakultas', value: form.data.fakultas, icon: Building2 },
        { label: 'Program Studi', value: form.data.prodi, icon: BookOpen },
        { label: 'Kelas', value: form.data.kelas, icon: Users },
        { label: 'Semester', value: `Semester ${form.data.semester}`, icon: Calendar },
        { label: 'Password', value: autoGeneratePassword ? 'Auto-generate (default NIM)' : '••••••••', icon: Lock },
    ];

    return (
        <AppLayout>
            <Head title="Tambah Mahasiswa" />

            <div className="min-h-screen py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ═══════ HEADER ═══════ */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, type: 'spring' as const, stiffness: 100 }}
                        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02, x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.visit('/admin/mahasiswa')}
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Kembali ke Daftar Mahasiswa
                            </motion.button>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
                                    <motion.div
                                        className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring' as const, stiffness: 300, delay: 0.2 }}
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                    >
                                        <img src={iconMahasiswa} alt="Tambah Mahasiswa" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                                    </motion.div>
                                    <div className="flex-1 mt-1 sm:mt-0">
                                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                            className="text-sm text-indigo-100 font-medium tracking-wide">
                                            Manajemen Data Mahasiswa
                                        </motion.p>
                                        <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                                            className="text-2xl sm:text-3xl font-bold text-white mt-1">
                                            Tambah Mahasiswa Baru
                                        </motion.h1>
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                            className="mt-2 text-indigo-100/80 text-sm sm:text-base leading-relaxed">
                                            Daftarkan mahasiswa baru ke dalam sistem dengan lengkap dan akurat
                                        </motion.p>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="hidden sm:block shrink-0 rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl"
                                >
                                    <p className="text-xs text-indigo-100/90">Total Mahasiswa</p>
                                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                                        <Users className="h-4 w-4" />
                                        {stats.total} Mahasiswa
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ═══════ FORM ═══════ */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Section 1: Informasi Pribadi */}
                        <FormSection
                            title="Informasi Pribadi"
                            description="Data identitas mahasiswa"
                            icon={User}
                            gradient="from-indigo-500 to-purple-600"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="Nama Lengkap" icon={User} required error={form.errors.nama} helper="Masukkan nama lengkap sesuai KTP">
                                    <input
                                        type="text"
                                        value={form.data.nama}
                                        onChange={e => form.setData('nama', e.target.value)}
                                        placeholder="Contoh: Ahmad Rizki Pratama"
                                        className={inputClass}
                                        autoFocus
                                    />
                                </FormField>

                                <FormField label="Nomor Induk Mahasiswa (NIM)" icon={Hash} required error={form.errors.nim} helper="Format: 10 digit angka">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.data.nim}
                                            onChange={e => form.setData('nim', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="Contoh: 2110101234"
                                            maxLength={10}
                                            className={cn(inputClass, 'font-mono pr-10')}
                                        />
                                        {checking && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />}
                                    </div>
                                    <NIMValidator nim={form.data.nim} />
                                    <DuplicateWarning field="nim" exists={!!duplicateCheck.nim} />
                                </FormField>

                                <FormField label="Email" icon={Mail} optional error={form.errors.email} helper="Email aktif untuk notifikasi sistem">
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                        placeholder="Contoh: ahmad.rizki@student.unpam.ac.id"
                                        className={inputClass}
                                    />
                                    <DuplicateWarning field="email" exists={!!duplicateCheck.email} />
                                </FormField>

                                <FormField label="Nomor Telepon" icon={Phone} optional helper="Format: 08xxxxxxxxxx">
                                    <input
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={e => form.setData('phone', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                        className={inputClass}
                                    />
                                </FormField>
                            </div>
                        </FormSection>

                        {/* Section 2: Informasi Akademik */}
                        <FormSection
                            title="Informasi Akademik"
                            description="Data perkuliahan dan program studi"
                            icon={GraduationCap}
                            gradient="from-purple-500 to-pink-600"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="Fakultas" icon={Building2} required error={form.errors.fakultas}>
                                    <select
                                        value={form.data.fakultas}
                                        onChange={e => form.setData('fakultas', e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Pilih Fakultas</option>
                                        {fakultasList.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Program Studi" icon={BookOpen} optional error={form.errors.prodi}>
                                    <input
                                        type="text"
                                        value={form.data.prodi}
                                        onChange={e => form.setData('prodi', e.target.value)}
                                        placeholder="Contoh: Teknik Informatika"
                                        className={inputClass}
                                    />
                                </FormField>

                                <FormField label="Kelas" icon={Users} required error={form.errors.kelas}>
                                    <input
                                        type="text"
                                        value={form.data.kelas}
                                        onChange={e => form.setData('kelas', e.target.value)}
                                        placeholder="Contoh: 07TPLP004"
                                        className={inputClass}
                                    />
                                </FormField>

                                <FormField label="Semester" icon={Calendar} required error={form.errors.semester}>
                                    <select
                                        value={form.data.semester}
                                        onChange={e => form.setData('semester', parseInt(e.target.value))}
                                        className={selectClass}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>
                        </FormSection>

                        {/* Section 3: Keamanan Akun */}
                        <FormSection
                            title="Keamanan Akun"
                            description="Password dan pengaturan keamanan"
                            icon={Shield}
                            gradient="from-pink-500 to-rose-600"
                        >
                            {/* Auto-generate Option */}
                            <div className="mb-5 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="auto-password"
                                        checked={autoGeneratePassword}
                                        onChange={e => setAutoGeneratePassword(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="auto-password" className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 cursor-pointer flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Gunakan Password Default
                                        </label>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                            Password otomatis: <code className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 font-mono">tplk004#{form.data.nim ? form.data.nim.slice(-2) : 'XX'}</code>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {!autoGeneratePassword && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <FormField label="Password" icon={Lock} required error={form.errors.password} helper="Minimal 8 karakter, kombinasi huruf dan angka">
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={form.data.password}
                                                        onChange={e => form.setData('password', e.target.value)}
                                                        placeholder="Masukkan password"
                                                        className={cn(inputClass, 'pr-12')}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                <PasswordStrength password={form.data.password} />
                                            </FormField>

                                            <FormField label="Konfirmasi Password" icon={Lock} required error={form.errors.password_confirmation}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={form.data.password_confirmation}
                                                    onChange={e => form.setData('password_confirmation', e.target.value)}
                                                    placeholder="Ulangi password"
                                                    className={inputClass}
                                                />
                                                {form.data.password && form.data.password_confirmation && form.data.password !== form.data.password_confirmation && (
                                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                        className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                                        <AlertCircle className="h-3 w-3" /> Password tidak cocok
                                                    </motion.p>
                                                )}
                                            </FormField>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </FormSection>

                        {/* Section 4: Bulk Import (Collapsible) */}
                        <FormSection
                            title="Import Data Massal"
                            description="Upload file Excel/CSV untuk menambahkan banyak mahasiswa sekaligus"
                            icon={Upload}
                            gradient="from-cyan-500 to-blue-600"
                            collapsible
                            defaultOpen={false}
                        >
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Download Template</h4>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                Gunakan template Excel untuk memastikan format data yang benar
                                            </p>
                                            <button
                                                type="button"
                                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors opacity-60 cursor-not-allowed"
                                                disabled
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Segera Hadir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center opacity-60 cursor-not-allowed">
                                    <Upload className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
                                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                        Fitur import Excel/CSV akan segera tersedia
                                    </p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                        Format: Excel (.xlsx, .xls) atau CSV (.csv)
                                    </p>
                                </div>
                            </div>
                        </FormSection>

                        {/* ═══════ STICKY ACTION BAR ═══════ */}
                        <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 -mb-6">
                            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-end gap-3">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.visit('/admin/mahasiswa')}
                                    disabled={form.processing}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-all disabled:opacity-50"
                                >
                                    Batal
                                </motion.button>

                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowPreview(true)}
                                    disabled={form.processing}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview Data
                                </motion.button>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={form.processing || !!duplicateCheck.nim || !!duplicateCheck.email}
                                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {form.processing ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                                    ) : (
                                        <><Save className="h-4 w-4" /> Simpan Data</>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </form>

                    {/* ═══════ PREVIEW MODAL ═══════ */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
                                onClick={() => setShowPreview(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    transition={{ type: 'spring' as const, stiffness: 250, damping: 22 }}
                                    className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Header */}
                                    <div className="relative p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                                        <button onClick={() => setShowPreview(false)}
                                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                            <X className="h-5 w-5" />
                                        </button>
                                        <h3 className="text-2xl font-bold">Preview Data Mahasiswa</h3>
                                        <p className="text-white/80 mt-1 text-sm">Periksa kembali data sebelum menyimpan</p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                                        {previewItems.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.value || '-'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                                        <motion.button
                                            type="button"
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowPreview(false)}
                                            className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            Kembali Edit
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => { setShowPreview(false); handleSubmit(); }}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            Simpan Data
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══════ SUCCESS ANIMATION ═══════ */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.8, y: 20 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' as const, stiffness: 200, delay: 0.2 }}
                                        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Berhasil!</h3>
                                    <p className="text-neutral-400 text-lg">Mahasiswa berhasil ditambahkan</p>
                                    <p className="text-neutral-500 text-sm mt-2">Mengalihkan ke daftar mahasiswa...</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </AppLayout>
    );
}
