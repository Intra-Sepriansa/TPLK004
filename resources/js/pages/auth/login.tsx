import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, EyeOff, GraduationCap, Lock, User, Shield, Users, ChevronRight, Moon, Sun
} from 'lucide-react';

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
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15
        }
    }
};

export default function Login({ status }: LoginProps) {
    const [mode, setMode] = useState<LoginMode>('mahasiswa');
    const [showPassword, setShowPassword] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Forms for each mode
    const adminForm = useForm({ email: '', password: '', remember: false });
    const dosenForm = useForm({ nidn: '', password: '', remember: false });
    const mahasiswaForm = useForm({ nim: '', password: '' });

    const currentForm = mode === 'admin' ? adminForm : mode === 'dosen' ? dosenForm : mahasiswaForm;

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
        const endpoint = mode === 'admin' ? '/login' : mode === 'dosen' ? '/dosen/login' : '/login/mahasiswa';
        currentForm.post(endpoint, {
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
            
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative">
                {/* Dark Mode Toggle */}
                <motion.button
                    onClick={toggleDarkMode}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed top-6 right-6 z-50 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
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
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg"
                    >
                        <motion.div 
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0]
                            }}
                            transition={{ 
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <motion.div 
                            className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                            animate={{ 
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0]
                            }}
                            transition={{ 
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <div className="relative">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <AppLogoIcon className="h-12 w-12" />
                                </motion.div>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold">TPLK004</h1>
                                    <p className="text-sm text-blue-100">Sistem Absensi AI</p>
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
                        className="flex gap-2 p-1.5 bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-2xl border border-slate-200/70 dark:border-slate-700/50 shadow-sm dark:shadow-lg dark:shadow-slate-800/50"
                    >
                        <motion.button
                            type="button"
                            onClick={() => setMode('mahasiswa')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                                mode === 'mahasiswa'
                                    ? "bg-gradient-to-r from-gray-900 to-black text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                                mode === 'dosen'
                                    ? "bg-gradient-to-r from-gray-900 to-black text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                                mode === 'admin'
                                    ? "bg-gradient-to-r from-gray-900 to-black text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                                className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm"
                            >
                                {status}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <motion.div 
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur p-6 shadow-sm dark:border-slate-700/50 dark:shadow-lg dark:shadow-slate-800/50"
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ID Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    {mode === 'admin' ? 'Email' : mode === 'dosen' ? 'NIDN' : 'NIM'}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type={mode === 'admin' ? 'email' : 'text'}
                                        value={mode === 'admin' ? adminForm.data.email : mode === 'dosen' ? dosenForm.data.nidn : mahasiswaForm.data.nim}
                                        onChange={(e) => {
                                            if (mode === 'admin') adminForm.setData('email', e.target.value);
                                            else if (mode === 'dosen') dosenForm.setData('nidn', e.target.value);
                                            else mahasiswaForm.setData('nim', e.target.value);
                                        }}
                                        className="pl-10 h-12 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                                        placeholder={mode === 'admin' ? 'Masukkan email' : mode === 'dosen' ? 'Masukkan NIDN' : 'Masukkan NIM'}
                                        autoFocus
                                    />
                                </div>
                                <InputError 
                                    message={mode === 'admin' ? adminForm.errors.email : mode === 'dosen' ? dosenForm.errors.nidn : mahasiswaForm.errors.nim} 
                                    className="mt-2" 
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={currentForm.data.password}
                                        onChange={(e) => {
                                            if (mode === 'admin') adminForm.setData('password', e.target.value);
                                            else if (mode === 'dosen') dosenForm.setData('password', e.target.value);
                                            else mahasiswaForm.setData('password', e.target.value);
                                        }}
                                        className="pl-10 pr-10 h-12 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                                        placeholder="Masukkan password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <InputError message={currentForm.errors.password} className="mt-2" />
                            </div>

                            {/* Remember Me (for admin and dosen) */}
                            {mode !== 'mahasiswa' && (
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={mode === 'admin' ? adminForm.data.remember : dosenForm.data.remember}
                                        onChange={(e) => {
                                            if (mode === 'admin') adminForm.setData('remember', e.target.checked);
                                            else dosenForm.setData('remember', e.target.checked);
                                        }}
                                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-gray-900 dark:bg-slate-800 focus:ring-gray-900 dark:focus:ring-slate-500"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        Ingat saya di perangkat ini
                                    </span>
                                </label>
                            )}

                            {/* Submit Button */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={currentForm.processing}
                                    className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 dark:from-white dark:to-gray-100 dark:hover:from-gray-100 dark:hover:to-white dark:text-gray-900 shadow-lg transition-all"
                                >
                                    {currentForm.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Memproses...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <span>Masuk</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Footer */}
                    <motion.div 
                        variants={itemVariants}
                        className="text-center text-xs text-slate-400 dark:text-slate-600"
                    >
                        <p>© 2025 UNPAM - Universitas Pamulang</p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
