import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import AppLogoIcon from '@/components/app-logo-icon';
import Orb from '@/components/auth/Orb';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, EyeOff, GraduationCap, Lock, User, Shield, Users, ChevronRight, Moon, Sun, CheckCircle2, Sparkles
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

// Confetti particle component
const ConfettiParticle = ({ delay }: { delay: number }) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomX = Math.random() * 100 - 50;
    const randomRotate = Math.random() * 360;
    
    return (
        <motion.div
            initial={{ 
                opacity: 1, 
                y: 0, 
                x: 0,
                scale: 1,
                rotate: 0
            }}
            animate={{ 
                opacity: 0, 
                y: -300 + Math.random() * 100,
                x: randomX * 3,
                scale: 0,
                rotate: randomRotate
            }}
            transition={{ 
                duration: 1.5 + Math.random() * 0.5,
                delay,
                ease: "easeOut"
            }}
            className="absolute"
            style={{
                left: `${50 + randomX}%`,
                top: '50%',
            }}
        >
            <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: randomColor }}
            />
        </motion.div>
    );
};

export default function Login({ status }: LoginProps) {
    const [mode, setMode] = useState<LoginMode>('mahasiswa');
    const [showPassword, setShowPassword] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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
            onSuccess: () => {
                // Show success animation before redirect
                setShowSuccessAnimation(true);
                // The redirect will happen automatically after animation
            },
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
            
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
                {/* Success Animation Overlay */}
                <AnimatePresence>
                    {showSuccessAnimation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl"
                        >
                            {/* Confetti Particles */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <ConfettiParticle key={i} delay={i * 0.02} />
                                ))}
                            </div>

                            {/* Success Content */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.2
                                }}
                                className="relative z-10 text-center"
                            >
                                {/* Animated Checkmark Circle */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className="relative mx-auto mb-6"
                                >
                                    {/* Outer glow rings */}
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 0, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl"
                                    />
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.3, 1],
                                            opacity: [0.7, 0, 0.7]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.5
                                        }}
                                        className="absolute inset-0 rounded-full bg-emerald-400/40 blur-lg"
                                    />
                                    
                                    {/* Main circle */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring" }}
                                        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl"
                                    >
                                        <motion.div
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                        >
                                            <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={2.5} />
                                        </motion.div>
                                    </motion.div>

                                    {/* Sparkles around */}
                                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                                        <motion.div
                                            key={angle}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ 
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                x: Math.cos(angle * Math.PI / 180) * 80,
                                                y: Math.sin(angle * Math.PI / 180) * 80,
                                            }}
                                            transition={{ 
                                                delay: 0.7 + i * 0.1,
                                                duration: 1,
                                                repeat: Infinity,
                                                repeatDelay: 1
                                            }}
                                            className="absolute top-1/2 left-1/2"
                                        >
                                            <Sparkles className="w-6 h-6 text-emerald-500" />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Success Text */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                                        Login Berhasil!
                                    </h2>
                                    <p className="text-lg text-slate-600 dark:text-slate-300">
                                        Selamat datang kembali
                                    </p>
                                </motion.div>

                                {/* Loading dots */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="flex items-center justify-center gap-2 mt-8"
                                >
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ 
                                                scale: [1, 1.5, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{ 
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                            className="w-2 h-2 rounded-full bg-emerald-500"
                                        />
                                    ))}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Orb Background Animation - Larger, Brighter, More Interactive */}
                <div className="absolute inset-0 flex items-center justify-center opacity-60 dark:opacity-50">
                    <div className="w-full h-full">
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

                {/* Test Animation Button - DEV ONLY */}
                <motion.button
                    onClick={() => setShowSuccessAnimation(!showSuccessAnimation)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed top-6 right-20 z-50 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    Test Animation
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
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/15 to-black/15 dark:from-white/15 dark:to-gray-100/15 backdrop-blur-2xl p-6 text-white dark:text-gray-900 shadow-lg border border-white/10 dark:border-black/10"
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
                        className="flex gap-2 p-1.5 bg-white/15 dark:bg-slate-900/15 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-white/10 shadow-lg"
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
                                className="p-4 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/15 backdrop-blur-2xl border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-sm shadow-lg"
                            >
                                {status}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <motion.div 
                        variants={itemVariants}
                        className="rounded-2xl border border-white/10 dark:border-white/10 bg-white/15 dark:bg-slate-900/15 backdrop-blur-2xl p-6 shadow-lg"
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ID Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    {mode === 'admin' ? 'Email' : mode === 'dosen' ? 'NIDN' : 'NIM'}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
                                    <input
                                        type={mode === 'admin' ? 'email' : 'text'}
                                        value={mode === 'admin' ? adminForm.data.email : mode === 'dosen' ? dosenForm.data.nidn : mahasiswaForm.data.nim}
                                        onChange={(e) => {
                                            if (mode === 'admin') adminForm.setData('email', e.target.value);
                                            else if (mode === 'dosen') dosenForm.setData('nidn', e.target.value);
                                            else mahasiswaForm.setData('nim', e.target.value);
                                        }}
                                        className="w-full pl-10 h-12 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-600/20"
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
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={currentForm.data.password}
                                        onChange={(e) => {
                                            if (mode === 'admin') adminForm.setData('password', e.target.value);
                                            else if (mode === 'dosen') dosenForm.setData('password', e.target.value);
                                            else mahasiswaForm.setData('password', e.target.value);
                                        }}
                                        className="w-full pl-10 pr-10 h-12 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:ring-slate-600/20"
                                        placeholder="Masukkan password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors z-10"
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
                                <button
                                    type="submit"
                                    disabled={currentForm.processing}
                                    className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 dark:from-white dark:to-gray-100 dark:hover:from-gray-100 dark:hover:to-white text-white dark:text-gray-900 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentForm.processing ? (
                                        <div className="flex items-center gap-2 justify-center">
                                            <div className="h-4 w-4 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
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
                        className="text-center text-xs text-slate-600 dark:text-slate-400 bg-white/15 dark:bg-slate-900/15 backdrop-blur-2xl rounded-xl p-3 border border-white/10 dark:border-white/10"
                    >
                        <p>© 2025 UNPAM - Universitas Pamulang</p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
