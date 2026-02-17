import { useState, useRef, useEffect } from 'react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileCard from '@/components/ui/profile-card';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import {
    Sparkles, X, Camera, Upload, User, Mail, Shield,
    CheckCircle2, TrendingUp, Settings, CreditCard, KeyRound, AlertCircle,
    Edit2, Save, XCircle, Eye, EyeOff, LayoutDashboard, LogOut,
    Lock, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: '/admin/profile' },
];

type TabType = 'card' | 'profile' | 'security';

// Animation variants matching Uang Kas / Rekap Kehadiran
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        x: 10,
        transition: { duration: 0.2, ease: "easeIn" }
    }
};

export default function AdminProfile() {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('card');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Additional UI states for interactivity
    const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Form for profile update
    const profileForm = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    // Form for password update
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const avatarUrl = avatarPreview || ((auth.user as any).avatar_url
        ? `${(auth.user as any).avatar_url.startsWith('http') ? '' : '/storage/'}${(auth.user as any).avatar_url}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=3b82f6&color=fff&size=400&bold=true`);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = () => {
        const file = avatarInputRef.current?.files?.[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);
        router.post('/admin/profile/avatar', formData, {
            forceFormData: true,
            onSuccess: () => {
                setSuccessMessage('Foto profil berhasil diperbarui!');
                setAvatarPreview(null);
                if (avatarInputRef.current) avatarInputRef.current.value = '';
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onFinish: () => setIsUploadingAvatar(false),
        });
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/admin/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingProfile(false);
                setSuccessMessage('Profil berhasil diperbarui!');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
        });
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setSuccessMessage('Password berhasil diperbarui!');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
        });
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        profileForm.reset();
        profileForm.clearErrors();
    };

    const tabs = [
        { key: 'card' as TabType, label: 'Kartu Profil', icon: CreditCard },
        { key: 'profile' as TabType, label: 'Edit Profil', icon: User },
        { key: 'security' as TabType, label: 'Keamanan', icon: Shield },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Admin" />

            {/* Success Toast */}
            <div
                className={cn(
                    "fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur transition-all duration-300 ease-out",
                    "border-emerald-200/50 bg-emerald-50/90 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-200",
                    (successMessage || (showFlash && flash?.success)) ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                )}
            >
                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500 animate-pulse" />
                <div>
                    <p className="font-bold">Berhasil!</p>
                    <p className="text-xs opacity-90">{successMessage || flash?.success || ''}</p>
                </div>
            </div>

            {/* Profile Card Overlay Modal */}
            <AnimatePresence>
                {showProfileCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <button
                            onClick={() => setShowProfileCard(false)}
                            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <ProfileCard
                                name={auth.user.name}
                                title="Administrator"
                                handle={auth.user.email.split('@')[0]}
                                status="Online"
                                avatarUrl={avatarUrl}
                                contactText="Edit Profile"
                                showUserInfo={true}
                                enableTilt={true}
                                behindGlowColor="rgba(59, 130, 246, 0.6)"
                                innerGradient="linear-gradient(145deg, #3b82f644 0%, #8b5cf644 100%)"
                                onContactClick={() => {
                                    setShowProfileCard(false);
                                    setActiveTab('profile');
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="p-6 space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HEADER — Matching Uang Kas Style ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <motion.button
                                    onClick={() => setShowProfileCard(true)}
                                    className="group relative h-24 w-24 overflow-hidden rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <img src={avatarUrl} alt={auth.user.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="h-8 w-8 text-white" />
                                    </div>
                                </motion.button>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-white">{auth.user.name}</h1>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100 border border-emerald-500/30 backdrop-blur-md">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verified
                                        </span>
                                    </div>
                                    <p className="mt-1 text-indigo-100 flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> {auth.user.email}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 backdrop-blur-sm">
                                            <Shield className="h-3.5 w-3.5 text-indigo-200" />
                                            <span className="text-xs font-medium">Administrator</span>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 backdrop-blur-sm">
                                            <TrendingUp className="h-3.5 w-3.5 text-indigo-200" />
                                            <span className="text-xs font-medium">Full Access</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowProfileCard(true)}
                                    className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Lihat Kartu
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Styled Tabs */}
                <motion.div
                    variants={itemVariants}
                    className="flex p-1 rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50 shadow-lg w-full max-w-fit mx-auto"
                >
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                onMouseEnter={() => setHoveredTab(tab.key)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className={cn(
                                    "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "text-white shadow-md bg-gradient-to-r from-blue-600 to-indigo-600"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive && "animate-pulse")} />
                                <span className="relative z-10">{tab.label}</span>
                                {!isActive && hoveredTab === tab.key && (
                                    <motion.div
                                        layoutId="hoverTab"
                                        className="absolute inset-0 rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'card' && (
                            <motion.div
                                key="card"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <div className="p-8 rounded-[40px] bg-gradient-to-br from-neutral-100 to-white dark:from-neutral-900 dark:to-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-black/50 border border-white/50 dark:border-white/5">
                                    <ProfileCard
                                        name={auth.user.name}
                                        title="Administrator"
                                        handle={auth.user.email.split('@')[0]}
                                        status="Aktif"
                                        avatarUrl={avatarUrl}
                                        contactText="Edit Profil"
                                        showUserInfo={true}
                                        enableTilt={true}
                                        behindGlowColor="rgba(59, 130, 246, 0.6)"
                                        innerGradient="linear-gradient(145deg, #3b82f644 0%, #8b5cf644 100%)"
                                        onContactClick={() => setActiveTab('profile')}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="grid gap-6 lg:grid-cols-2"
                            >
                                <div className="rounded-3xl border border-white/20 bg-white/50 backdrop-blur-xl p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Edit Profil</h2>
                                                <p className="text-sm text-neutral-500">Perbarui informasi dasar</p>
                                            </div>
                                        </div>
                                        {!isEditingProfile && (
                                            <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 rounded-xl border-neutral-200 dark:border-neutral-700">
                                                <Edit2 className="h-4 w-4" />Edit
                                            </Button>
                                        )}
                                    </div>

                                    {/* Avatar Upload Section */}
                                    <div className="mb-8 p-4 rounded-2xl bg-neutral-50/50 dark:bg-black/20 border border-neutral-200/50 dark:border-neutral-800/50">
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="relative group">
                                                <div className="h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-neutral-800 shadow-lg">
                                                    <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                                </div>
                                                <button
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                                                >
                                                    <Camera className="h-8 w-8 text-white drop-shadow-md" />
                                                </button>
                                                {avatarPreview && (
                                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white dark:border-neutral-900">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center sm:text-left space-y-3">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-neutral-900 dark:text-white">Foto Profil</p>
                                                    <p className="text-xs text-neutral-500">Mendukung format PNG, JPG. Maksimal 2MB.</p>
                                                </div>

                                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

                                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                    <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="flex items-center gap-2 rounded-lg text-xs">
                                                        <Camera className="h-3.5 w-3.5" /> Pilih Foto
                                                    </Button>
                                                    {avatarPreview && (
                                                        <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUploadingAvatar} className="flex items-center gap-2 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                                            <Upload className="h-3.5 w-3.5" /> {isUploadingAvatar ? 'Uploading...' : 'Simpan Foto'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Form */}
                                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-neutral-600 dark:text-neutral-400">Nama Lengkap</Label>
                                            <div className="relative group">
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={profileForm.data.name}
                                                    onChange={(e) => profileForm.setData('name', e.target.value)}
                                                    disabled={!isEditingProfile}
                                                    className={cn(
                                                        "pl-10 h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-indigo-500 transition-all",
                                                        !isEditingProfile && "opacity-70 cursor-not-allowed bg-neutral-100/50 dark:bg-neutral-800/50"
                                                    )}
                                                    placeholder="Nama Lengkap Anda"
                                                />
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            {profileForm.errors.name && <InputError message={profileForm.errors.name} />}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-neutral-600 dark:text-neutral-400">Alamat Email</Label>
                                            <div className="relative group">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    disabled={!isEditingProfile}
                                                    className={cn(
                                                        "pl-10 h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-indigo-500 transition-all",
                                                        !isEditingProfile && "opacity-70 cursor-not-allowed bg-neutral-100/50 dark:bg-neutral-800/50"
                                                    )}
                                                    placeholder="email@example.com"
                                                />
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            {profileForm.errors.email && <InputError message={profileForm.errors.email} />}
                                        </div>

                                        {isEditingProfile && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex gap-3 pt-4"
                                            >
                                                <Button type="submit" disabled={profileForm.processing} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-indigo-500/20">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={profileForm.processing} className="rounded-xl h-11 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Batal
                                                </Button>
                                            </motion.div>
                                        )}
                                    </form>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-white/20 bg-white/50 backdrop-blur-xl p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"><Mail className="h-6 w-6" /></div>
                                            <div>
                                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Ringkasan Akun</h2>
                                                <p className="text-sm text-neutral-500">Detail status akun</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-100 dark:border-white/5">
                                                <span className="text-sm text-neutral-500">Nama Pengguna</span>
                                                <span className="font-semibold text-neutral-900 dark:text-white">{auth.user.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-100 dark:border-white/5">
                                                <span className="text-sm text-neutral-500">Role Akses</span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                                                    Administrator
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-100 dark:border-white/5">
                                                <span className="text-sm text-neutral-500">Status Akun</span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                                                    <CheckCircle2 className="h-3 w-3" /> Aktif
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg backdrop-blur dark:border-amber-800/30 dark:from-amber-900/10 dark:to-orange-900/10">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 shadow-sm">
                                                <AlertCircle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Informasi Penting</h3>
                                                <p className="text-sm text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                                                    Email yang Anda gunakan akan menjadi saluran utama untuk notifikasi sistem dan pemulihan akun. Pastikan selalu aktif.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="grid gap-6 lg:grid-cols-2"
                            >
                                <div className="rounded-3xl border border-white/20 bg-white/50 backdrop-blur-xl p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                                            <KeyRound className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Ganti Password</h2>
                                            <p className="text-sm text-neutral-500">Tingkatkan keamanan akun</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-neutral-600 dark:text-neutral-400">Password Saat Ini</Label>
                                            <div className="relative group">
                                                <Input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={passwordForm.data.current_password}
                                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                    className="pl-10 pr-10 h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-violet-500 transition-all"
                                                    placeholder="••••••••"
                                                />
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-violet-500 transition-colors" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.errors.current_password && <InputError message={passwordForm.errors.current_password} />}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-neutral-600 dark:text-neutral-400">Password Baru</Label>
                                            <div className="relative group">
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordForm.data.password}
                                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                    className="pl-10 pr-10 h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-violet-500 transition-all"
                                                    placeholder="Minimal 8 karakter"
                                                />
                                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-violet-500 transition-colors" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {passwordForm.errors.password && <InputError message={passwordForm.errors.password} />}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-neutral-600 dark:text-neutral-400">Konfirmasi Password</Label>
                                            <div className="relative group">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                    className="pl-10 pr-10 h-12 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-violet-500 transition-all"
                                                    placeholder="Ulangi password baru"
                                                />
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-violet-500 transition-colors" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button type="submit" disabled={passwordForm.processing} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 shadow-lg shadow-violet-500/20">
                                                <Save className="h-4 w-4 mr-2" />
                                                {passwordForm.processing ? 'Memperbarui...' : 'Perbarui Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-3xl border border-white/20 bg-white/50 backdrop-blur-xl p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><Shield className="h-6 w-6" /></div>
                                            <div>
                                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Panduan Keamanan</h2>
                                                <p className="text-sm text-neutral-500">Praktik terbaik</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-4">
                                            {[
                                                'Gunakan minimal 8 karakter',
                                                'Kombinasikan huruf besar, kecil, & angka',
                                                'Gunakan simbol unik (!@#$)',
                                                'Jangan gunakan data pribadi (tgl lahir)',
                                                'Ubah password secara berkala'
                                            ].map((tip, idx) => (
                                                <li key={idx} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                                        <div className="relative flex items-center gap-4">
                                            <ShieldCheck className="h-10 w-10 text-emerald-400" />
                                            <div>
                                                <h3 className="text-lg font-bold">Akun Terlindungi</h3>
                                                <p className="text-sm text-gray-400">Status keamanan Anda baik.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </AppLayout>
    );
}
