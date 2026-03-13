import AppLogoIcon from '@/components/app-logo-icon';
import Orb from '@/components/auth/Orb';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Moon,
    Shield,
    Sun,
    User,
    Users,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

type LoginMode = 'admin' | 'dosen' | 'mahasiswa';

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
            stiffness: 100,
            damping: 15,
        },
    },
};

export default function Login({ status }: LoginProps) {
    const [mode, setMode] = useState<LoginMode>('mahasiswa');
    const [showPassword, setShowPassword] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Forms for each mode
    const adminForm = useForm({ email: '', password: '', remember: false });
    const dosenForm = useForm({ nidn: '', password: '', remember: false });
    const mahasiswaForm = useForm({ nim: '', password: '' });

    const currentForm =
        mode === 'admin'
            ? adminForm
            : mode === 'dosen'
              ? dosenForm
              : mahasiswaForm;

    // Check initial dark mode state
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const endpoint =
            mode === 'admin'
                ? '/login'
                : mode === 'dosen'
                  ? '/dosen/login'
                  : '/login/mahasiswa';
        const csrfToken =
            document
                .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';
        currentForm.post(endpoint, {
            headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
            onFinish: () => {
                if (mode === 'admin') {
                    adminForm.reset('password');
                } else if (mode === 'dosen') {
                    dosenForm.reset('password');
                } else {
                    mahasiswaForm.reset('password');
                }
            },
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
                {/* Orb Background Animation - Larger, Brighter, More Interactive */}
                <div className="absolute inset-0 flex items-center justify-center opacity-60 dark:opacity-50">
                    <div className="h-full w-full">
                        <Orb
                            hoverIntensity={2.5}
                            rotateOnHover={true}
                            hue={isDark ? 260 : 200}
                            forceHoverState={false}
                            backgroundColor={isDark ? '#020617' : '#f8fafc'}
                        />
                    </div>
                </div>
                {/* Dark Mode Toggle */}
                <motion.button
                    onClick={toggleDarkMode}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed top-6 right-6 z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
                >
                    <AnimatePresence mode="wait">
                        {isDark ? (
                            <motion.div
                                key="sun"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sun className="h-5 w-5 text-amber-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="moon"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Moon className="h-5 w-5 text-slate-700" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full max-w-md space-y-6"
                >
                    {/* Header with animated circles */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/15 to-black/15 p-6 text-white shadow-lg backdrop-blur-2xl dark:border-black/10 dark:from-white/15 dark:to-gray-100/15 dark:text-gray-900"
                    >
                        <motion.div
                            className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <motion.div
                            className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                        <div className="relative">
                            <div className="mb-4 flex items-center justify-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                    }}
                                >
                                    <AppLogoIcon className="h-12 w-12" />
                                </motion.div>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold">
                                        TPLK004
                                    </h1>
                                    <p className="text-sm text-blue-100">
                                        Sistem Absensi AI
                                    </p>
                                </div>
                            </div>
                            <p className="text-center text-blue-100">
                                Selamat datang! Silakan login untuk melanjutkan
                            </p>
                        </div>
                    </motion.div>

                    {/* Mode Tabs */}
                    <motion.div
                        variants={itemVariants}
                        className="flex gap-2 rounded-2xl border border-white/10 bg-white/15 p-1.5 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/15"
                    >
                        <motion.button
                            type="button"
                            onClick={() => setMode('mahasiswa')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all duration-300',
                                mode === 'mahasiswa'
                                    ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300',
                            )}
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Mahasiswa</span>
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => setMode('dosen')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all duration-300',
                                mode === 'dosen'
                                    ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300',
                            )}
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span className="hidden sm:inline">Dosen</span>
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={() => setMode('admin')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all duration-300',
                                mode === 'admin'
                                    ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300',
                            )}
                        >
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Admin</span>
                        </motion.button>
                    </motion.div>

                    {/* Status Message */}
                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/15 p-4 text-sm text-emerald-700 shadow-lg backdrop-blur-2xl dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-300"
                            >
                                {status}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-white/10 bg-white/15 p-6 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/15"
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ID Field with AnimatePresence for smooth transition */}
                            <div>
                                <AnimatePresence mode="wait">
                                    <motion.label
                                        key={`label-${mode}`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                                    >
                                        {mode === 'admin'
                                            ? 'Email'
                                            : mode === 'dosen'
                                              ? 'NIDN'
                                              : 'NIM'}
                                    </motion.label>
                                </AnimatePresence>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <AnimatePresence mode="wait">
                                        <motion.input
                                            key={`input-${mode}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            type={
                                                mode === 'admin'
                                                    ? 'email'
                                                    : 'text'
                                            }
                                            value={
                                                mode === 'admin'
                                                    ? adminForm.data.email
                                                    : mode === 'dosen'
                                                      ? dosenForm.data.nidn
                                                      : mahasiswaForm.data.nim
                                            }
                                            onChange={(e) => {
                                                if (mode === 'admin')
                                                    adminForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    );
                                                else if (mode === 'dosen')
                                                    dosenForm.setData(
                                                        'nidn',
                                                        e.target.value,
                                                    );
                                                else
                                                    mahasiswaForm.setData(
                                                        'nim',
                                                        e.target.value,
                                                    );
                                            }}
                                            className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-600/20"
                                            placeholder={
                                                mode === 'admin'
                                                    ? 'Masukkan email'
                                                    : mode === 'dosen'
                                                      ? 'Masukkan NIDN'
                                                      : 'Masukkan NIM'
                                            }
                                            autoFocus
                                        />
                                    </AnimatePresence>
                                </div>
                                <InputError
                                    message={
                                        mode === 'admin'
                                            ? adminForm.errors.email
                                            : mode === 'dosen'
                                              ? dosenForm.errors.nidn
                                              : mahasiswaForm.errors.nim
                                    }
                                    className="mt-2"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={currentForm.data.password}
                                        onChange={(e) => {
                                            if (mode === 'admin')
                                                adminForm.setData(
                                                    'password',
                                                    e.target.value,
                                                );
                                            else if (mode === 'dosen')
                                                dosenForm.setData(
                                                    'password',
                                                    e.target.value,
                                                );
                                            else
                                                mahasiswaForm.setData(
                                                    'password',
                                                    e.target.value,
                                                );
                                        }}
                                        className="h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 pr-10 pl-10 text-slate-900 placeholder:text-slate-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-600/20"
                                        placeholder="Masukkan password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={currentForm.errors.password}
                                    className="mt-2"
                                />
                            </div>

                            {/* Remember Me (for admin and dosen) with smooth transition */}
                            <AnimatePresence>
                                {mode !== 'mahasiswa' && (
                                    <motion.label
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="group flex cursor-pointer items-center gap-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                mode === 'admin'
                                                    ? adminForm.data.remember
                                                    : dosenForm.data.remember
                                            }
                                            onChange={(e) => {
                                                if (mode === 'admin')
                                                    adminForm.setData(
                                                        'remember',
                                                        e.target.checked,
                                                    );
                                                else
                                                    dosenForm.setData(
                                                        'remember',
                                                        e.target.checked,
                                                    );
                                            }}
                                            className="h-4 w-4 rounded border-slate-300 text-gray-900 focus:ring-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-slate-500"
                                        />
                                        <span className="text-sm text-slate-600 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                                            Ingat saya di perangkat ini
                                        </span>
                                    </motion.label>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <button
                                    type="submit"
                                    disabled={currentForm.processing}
                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-gray-900 to-black text-base font-semibold text-white shadow-lg transition-all hover:from-gray-800 hover:to-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-white"
                                >
                                    {currentForm.processing ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900" />
                                            <span>Memproses...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <span>Masuk</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    )}
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-xl border border-white/10 bg-white/15 p-3 text-center text-xs text-slate-600 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/15 dark:text-slate-400"
                    >
                        <p>© 2025 UNPAM - Universitas Pamulang</p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
