import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Shield,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface SecurityEnhancedProps {
    passwordForm: any;
    showCurrent: boolean;
    showNew: boolean;
    showConfirm: boolean;
    setShowCurrent: (show: boolean) => void;
    setShowNew: (show: boolean) => void;
    setShowConfirm: (show: boolean) => void;
    handlePasswordSubmit: (e: React.FormEvent) => void;
}

export default function SecurityEnhanced({
    passwordForm,
    showCurrent,
    showNew,
    showConfirm,
    setShowCurrent,
    setShowNew,
    setShowConfirm,
    handlePasswordSubmit,
}: SecurityEnhancedProps) {
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
        return Math.min(strength, 100);
    };

    const handlePasswordChange = (value: string) => {
        passwordForm.setData('password', value);
        setPasswordStrength(calculatePasswordStrength(value));
    };

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'from-red-500 to-orange-500';
        if (passwordStrength < 70) return 'from-yellow-500 to-amber-500';
        return 'from-emerald-500 to-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return 'Lemah';
        if (passwordStrength < 70) return 'Sedang';
        return 'Kuat';
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Enhanced Password Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-3xl border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/30 to-purple-50/30 p-8 shadow-2xl backdrop-blur-xl dark:border-violet-900/50 dark:from-gray-900 dark:via-violet-950/30 dark:to-purple-950/30"
            >
                {/* Animated Background Orbs */}
                <div className="absolute -top-20 -right-20 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-violet-400/20 to-purple-400/20 blur-3xl" />
                <div
                    className="absolute -bottom-20 -left-20 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 blur-3xl"
                    style={{ animationDelay: '1s' }}
                />

                {/* Floating Particles */}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-violet-400/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}

                <div className="relative z-10">
                    {/* Enhanced Header */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-4">
                            <motion.div
                                className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <KeyRound className="h-7 w-7 text-white" />
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-white/20"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                />
                            </motion.div>
                            <div>
                                <h2 className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-violet-400 dark:to-purple-400">
                                    Ganti Password
                                </h2>
                                <p className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                    <Shield className="h-3 w-3" />
                                    Perbarui password untuk keamanan maksimal
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        {/* Current Password */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Label
                                htmlFor="current_password"
                                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                <Lock className="h-4 w-4 text-violet-500" />
                                Password Saat Ini
                            </Label>
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                                <Input
                                    id="current_password"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={passwordForm.data.current_password}
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    className="relative h-12 rounded-xl border-2 border-slate-200/50 bg-white/50 pr-11 pl-11 backdrop-blur-sm transition-all duration-300 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-violet-600"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-violet-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-violet-500"
                                >
                                    {showCurrent ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={passwordForm.errors.current_password}
                            />
                        </motion.div>

                        {/* New Password */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Label
                                htmlFor="password"
                                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                <Zap className="h-4 w-4 text-amber-500" />
                                Password Baru
                            </Label>
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                                <Input
                                    id="password"
                                    type={showNew ? 'text' : 'password'}
                                    value={passwordForm.data.password}
                                    onChange={(e) =>
                                        handlePasswordChange(e.target.value)
                                    }
                                    className="relative h-12 rounded-xl border-2 border-slate-200/50 bg-white/50 pr-11 pl-11 backdrop-blur-sm transition-all duration-300 hover:border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-amber-600"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-amber-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-amber-500"
                                >
                                    {showNew ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {passwordForm.data.password && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Kekuatan Password
                                        </span>
                                        <span
                                            className={`bg-gradient-to-r font-semibold ${getStrengthColor()} bg-clip-text text-transparent`}
                                        >
                                            {getStrengthText()}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
                                        <motion.div
                                            className={`h-full bg-gradient-to-r ${getStrengthColor()} rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${passwordStrength}%`,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                            <InputError
                                message={passwordForm.errors.password}
                            />
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Label
                                htmlFor="password_confirmation"
                                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Konfirmasi Password Baru
                            </Label>
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                                <Input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={
                                        passwordForm.data.password_confirmation
                                    }
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="relative h-12 rounded-xl border-2 border-slate-200/50 bg-white/50 pr-11 pl-11 backdrop-blur-sm transition-all duration-300 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-emerald-600"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-emerald-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-emerald-500"
                                >
                                    {showConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={
                                    passwordForm.errors.password_confirmation
                                }
                            />
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 font-semibold text-white shadow-lg transition-all duration-300 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 hover:shadow-xl disabled:opacity-50"
                                disabled={passwordForm.processing}
                            >
                                {passwordForm.processing ? (
                                    <span className="flex items-center gap-2">
                                        <motion.div
                                            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />
                                        Menyimpan...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Ubah Password
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </div>
            </motion.div>

            {/* Enhanced Security Tips & Status */}
            <div className="space-y-6">
                {/* Security Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-8 shadow-2xl backdrop-blur-xl dark:border-amber-900/50 dark:from-gray-900 dark:via-amber-950/30 dark:to-orange-950/30"
                >
                    {/* Animated Background */}
                    <div className="absolute -top-20 -right-20 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />

                    <div className="relative z-10">
                        <div className="mb-6 flex items-center gap-4">
                            <motion.div
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <AlertCircle className="h-7 w-7 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-2xl font-bold text-transparent dark:from-amber-400 dark:to-orange-400">
                                    Tips Keamanan
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Panduan password yang aman
                                </p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {[
                                {
                                    text: 'Gunakan minimal 8 karakter',
                                    icon: CheckCircle2,
                                    color: 'emerald',
                                },
                                {
                                    text: 'Kombinasikan huruf besar, kecil, dan angka',
                                    icon: CheckCircle2,
                                    color: 'blue',
                                },
                                {
                                    text: 'Hindari menggunakan NIDN atau tanggal lahir',
                                    icon: AlertCircle,
                                    color: 'amber',
                                },
                                {
                                    text: 'Jangan gunakan password yang sama dengan akun lain',
                                    icon: AlertCircle,
                                    color: 'red',
                                },
                            ].map((tip, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-start gap-3 rounded-xl border border-slate-200/50 bg-white/50 p-3 backdrop-blur-sm transition-all duration-300 hover:border-amber-300 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-amber-600"
                                    whileHover={{ scale: 1.02, x: 5 }}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${tip.color}-100 dark:bg-${tip.color}-900/30 flex-shrink-0`}
                                    >
                                        <tip.icon
                                            className={`h-4 w-4 text-${tip.color}-600 dark:text-${tip.color}-400`}
                                        />
                                    </div>
                                    <span className="pt-1 text-sm text-slate-700 dark:text-slate-300">
                                        {tip.text}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Security Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Orbs */}
                    <div className="absolute -top-10 -right-10 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl" />
                    <div
                        className="absolute -bottom-10 -left-10 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl"
                        style={{ animationDelay: '1s' }}
                    />

                    <div className="relative z-10">
                        <div className="mb-6 flex items-center gap-4">
                            <motion.div
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Shield className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Status Keamanan
                                </h2>
                                <p className="text-sm text-emerald-100">
                                    Akun Anda terlindungi
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">
                                        Akun Terverifikasi
                                    </p>
                                    <p className="text-xs text-emerald-100">
                                        Email dan identitas telah dikonfirmasi
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <Sparkles className="h-6 w-6 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">
                                        Enkripsi Aktif
                                    </p>
                                    <p className="text-xs text-emerald-100">
                                        Data Anda dienkripsi dengan standar
                                        tinggi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                            whileHover={{ scale: 1.02 }}
                        >
                            <p className="text-sm">
                                💡 <span className="font-semibold">Tips:</span>{' '}
                                Ubah password secara berkala setiap 3-6 bulan
                                untuk keamanan optimal.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
