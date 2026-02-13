import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    User,
    Mail,
    IdCard,
    Phone,
    Camera,
    Upload,
    CheckCircle2,
    Sparkles,
    Star,
    Zap,
} from 'lucide-react';
import { useRef } from 'react';

interface ProfileEditEnhancedProps {
    dosen: {
        nama: string;
        nidn: string;
        email: string;
        phone?: string;
    };
    profileForm: any;
    avatarUrl: string;
    avatarPreview: string | null;
    isUploadingAvatar: boolean;
    avatarInputRef: React.RefObject<HTMLInputElement>;
    handleProfileSubmit: (e: React.FormEvent) => void;
    handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAvatarUpload: () => void;
}

export default function ProfileEditEnhanced({
    dosen,
    profileForm,
    avatarUrl,
    avatarPreview,
    isUploadingAvatar,
    avatarInputRef,
    handleProfileSubmit,
    handleAvatarChange,
    handleAvatarUpload,
}: ProfileEditEnhancedProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Enhanced Edit Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 p-8 shadow-2xl backdrop-blur-xl dark:border-indigo-900/50 dark:from-gray-900 dark:via-indigo-950/30 dark:to-purple-950/30"
            >
                {/* Animated Background Orbs */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Floating Particles */}
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-indigo-400/30"
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
                        <div className="flex items-center gap-4 mb-4">
                            <motion.div
                                className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <User className="h-7 w-7 text-white" />
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-white/20"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                                    Edit Profil
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Perbarui informasi akun Anda dengan mudah
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        {/* Nama Lengkap */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Label htmlFor="nama" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <User className="h-4 w-4 text-indigo-500" />
                                Nama Lengkap
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                                <Input
                                    id="nama"
                                    value={profileForm.data.nama}
                                    onChange={e => profileForm.setData('nama', e.target.value)}
                                    className="relative pl-11 h-12 rounded-xl border-2 border-slate-200/50 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-indigo-600"
                                    placeholder="Masukkan nama lengkap"
                                />
                                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <InputError message={profileForm.errors.nama} />
                        </motion.div>

                        {/* NIDN */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Label htmlFor="nidn" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <IdCard className="h-4 w-4 text-amber-500" />
                                NIDN
                            </Label>
                            <div className="relative">
                                <Input
                                    id="nidn"
                                    value={dosen.nidn}
                                    disabled
                                    className="pl-11 h-12 rounded-xl border-2 border-slate-200/50 bg-slate-100/80 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80 cursor-not-allowed"
                                />
                                <IdCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Locked</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                NIDN tidak dapat diubah untuk keamanan
                            </p>
                        </motion.div>

                        {/* Email */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-500" />
                                Email
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={e => profileForm.setData('email', e.target.value)}
                                    className="relative pl-11 h-12 rounded-xl border-2 border-slate-200/50 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-blue-600"
                                    placeholder="email@example.com"
                                />
                                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <InputError message={profileForm.errors.email} />
                        </motion.div>

                        {/* Phone */}
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-emerald-500" />
                                No. Telepon
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                                <Input
                                    id="phone"
                                    value={profileForm.data.phone}
                                    onChange={e => profileForm.setData('phone', e.target.value)}
                                    className="relative pl-11 h-12 rounded-xl border-2 border-slate-200/50 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:border-gray-700/50 dark:bg-gray-900/50 dark:hover:border-emerald-600"
                                    placeholder="08xxxxxxxxxx"
                                />
                                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <InputError message={profileForm.errors.phone} />
                        </motion.div>

                        {/* Avatar Upload */}
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Camera className="h-4 w-4 text-pink-500" />
                                Foto Profil
                            </Label>
                            <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-slate-200/50 dark:border-gray-700/50">
                                <motion.div
                                    className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                    {avatarPreview && (
                                        <motion.div
                                            className="absolute inset-0 flex items-center justify-center bg-indigo-500/90 backdrop-blur-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <CheckCircle2 className="h-8 w-8 text-white" />
                                        </motion.div>
                                    )}
                                    <div className="absolute inset-0 ring-2 ring-indigo-500/20 rounded-2xl" />
                                </motion.div>
                                <div className="flex-1 space-y-3">
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        id="avatar-upload"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="flex items-center gap-2 rounded-xl border-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                                        >
                                            <Camera className="h-4 w-4" />
                                            Pilih Foto
                                        </Button>
                                        {avatarPreview && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                            >
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAvatarUpload}
                                                    disabled={isUploadingAvatar}
                                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500" />
                                        PNG, JPG max 2MB untuk hasil terbaik
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                disabled={profileForm.processing}
                            >
                                {profileForm.processing ? (
                                    <span className="flex items-center gap-2">
                                        <motion.div
                                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        Menyimpan...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Simpan Perubahan
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </div>
            </motion.div>

            {/* Enhanced Info Card */}
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl border border-sky-200/50 bg-gradient-to-br from-white via-sky-50/30 to-cyan-50/30 p-8 shadow-2xl backdrop-blur-xl dark:border-sky-900/50 dark:from-gray-900 dark:via-sky-950/30 dark:to-cyan-950/30"
                >
                    {/* Animated Background */}
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-sky-400/20 to-cyan-400/20 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <motion.div
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg"
                                whileHover={{ scale: 1.05, rotate: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <IdCard className="h-7 w-7 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-cyan-400">
                                    Informasi Akun
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Data akun Anda</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'Nama', value: dosen.nama, icon: User, color: 'indigo' },
                                { label: 'NIDN', value: dosen.nidn, icon: IdCard, color: 'amber' },
                                { label: 'Email', value: dosen.email, icon: Mail, color: 'blue' },
                                { label: 'Status', value: 'Aktif', icon: CheckCircle2, color: 'emerald', isStatus: true },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="group relative overflow-hidden p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/50 dark:bg-gray-900/50 dark:border-gray-700/50 hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300"
                                    whileHover={{ scale: 1.02, x: 5 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30`}>
                                                <item.icon className={`h-5 w-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                                        </div>
                                        {item.isStatus ? (
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{item.value}</span>
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
