import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileCard from '@/components/ui/profile-card';
import ProfileEditEnhanced from '@/components/dosen/profile-edit-enhanced';
import SecurityEnhanced from '@/components/dosen/security-enhanced';
import {
    User,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    KeyRound,
    Mail,
    IdCard,
    Sparkles,
    AlertCircle,
    Lock,
    Phone,
    BookOpen,
    Calendar,
    BadgeCheck,
    Camera,
    Upload,
    CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    initials: string;
}

interface Stats {
    totalCourses: number;
    totalSessions: number;
    totalVerifications: number;
}

interface PageProps {
    dosen: DosenInfo;
    stats: Stats;
}

type TabType = 'card' | 'profile' | 'security';

export default function DosenProfile() {
    const { props } = usePage<{ props: PageProps; flash?: { success?: string } }>();
    const { dosen, flash } = props as unknown as PageProps & { flash?: { success?: string } };
    const stats = (props as unknown as PageProps).stats ?? { totalCourses: 0, totalSessions: 0, totalVerifications: 0 };

    const [activeTab, setActiveTab] = useState<TabType>('card');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Auto-hide flash message after 2 seconds
    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const profileForm = useForm({
        nama: dosen.nama ?? '',
        email: dosen.email ?? '',
        phone: dosen.phone ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/dosen/profile', {
            onSuccess: () => {
                setSuccessMessage('Profil berhasil diperbarui!');
                setTimeout(() => setSuccessMessage(null), 2000);
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch('/dosen/profile/password', {
            onSuccess: () => {
                passwordForm.reset('current_password', 'password', 'password_confirmation');
                setSuccessMessage('Password berhasil diubah!');
                setTimeout(() => setSuccessMessage(null), 2000);
            },
        });
    };

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
        router.post('/dosen/profile/avatar', formData, {
            forceFormData: true,
            onSuccess: () => {
                setSuccessMessage('Foto profil berhasil diperbarui!');
                setAvatarPreview(null);
                if (avatarInputRef.current) avatarInputRef.current.value = '';
                setTimeout(() => setSuccessMessage(null), 2000);
            },
            onFinish: () => setIsUploadingAvatar(false),
        });
    };

    const tabs = [
        { key: 'card' as TabType, label: 'Kartu Profil', icon: CreditCard },
        { key: 'profile' as TabType, label: 'Edit Profil', icon: User },
        { key: 'security' as TabType, label: 'Keamanan', icon: Shield },
    ];

    const avatarUrl = avatarPreview || dosen.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(dosen.nama)}&background=6366f1&color=fff&size=400&bold=true`;

    return (
        <DosenLayout>
            <Head title="Profil Dosen" />

            <div className="p-6 space-y-6">
                {/* Success Toast */}
                <div 
                    className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100 transition-all duration-300 ease-out ${
                        (successMessage || (showFlash && flash?.success))
                            ? 'translate-x-0 opacity-100'
                            : 'translate-x-full opacity-0 pointer-events-none'
                    }`}
                >
                    <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                        <p className="font-semibold">Berhasil!</p>
                        <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">
                            {successMessage || flash?.success || ''}
                        </p>
                    </div>
                </div>

                {/* Enhanced Header Card with Advanced Animations */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
                    {/* Animated Background Orbs */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

                    {/* Floating Particles */}
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-2 w-2 rounded-full bg-white/20"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex items-center gap-6">
                                {/* Enhanced Avatar with Glow Effect */}
                                <div className="relative group">
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative h-28 w-28 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                                        <img src={avatarUrl} alt={dosen.nama} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
                                            👨‍🏫 Profil Dosen
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm text-xs font-semibold flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Online
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                                        {dosen.nama}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
                                            <IdCard className="h-4 w-4" />
                                            <span>NIDN: {dosen.nidn}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
                                            <Mail className="h-4 w-4" />
                                            <span>{dosen.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-3 backdrop-blur-sm shadow-lg">
                                    <BadgeCheck className="h-5 w-5 text-emerald-300" />
                                    <div>
                                        <p className="text-xs text-purple-100">Status Akun</p>
                                        <p className="font-bold">Terverifikasi</p>
                                    </div>
                                </div>
                                <button className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 text-sm font-medium flex items-center gap-2 group">
                                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    Upgrade Premium
                                </button>
                            </div>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md p-5 hover:bg-white/15 transition-all duration-300 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-blue-200">
                                            <BookOpen className="h-5 w-5" />
                                            <span className="text-sm font-medium">Mata Kuliah</span>
                                        </div>
                                        <div className="px-2 py-1 rounded-lg bg-blue-500/20 text-xs font-bold">
                                            +{Math.floor(Math.random() * 5)}
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold mb-1">{stats.totalCourses}</p>
                                    <p className="text-xs text-purple-200">Total mata kuliah aktif</p>
                                </div>
                            </div>
                            
                            <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md p-5 hover:bg-white/15 transition-all duration-300 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-purple-200">
                                            <Calendar className="h-5 w-5" />
                                            <span className="text-sm font-medium">Total Sesi</span>
                                        </div>
                                        <div className="px-2 py-1 rounded-lg bg-purple-500/20 text-xs font-bold">
                                            Aktif
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold mb-1">{stats.totalSessions}</p>
                                    <p className="text-xs text-purple-200">Sesi perkuliahan dilakukan</p>
                                </div>
                            </div>
                            
                            <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md p-5 hover:bg-white/15 transition-all duration-300 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-pink-200">
                                            <BadgeCheck className="h-5 w-5" />
                                            <span className="text-sm font-medium">Verifikasi</span>
                                        </div>
                                        <div className="px-2 py-1 rounded-lg bg-pink-500/20 text-xs font-bold">
                                            100%
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold mb-1">{stats.totalVerifications}</p>
                                    <p className="text-xs text-purple-200">Verifikasi kehadiran berhasil</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-20px); }
                        }
                    `}</style>
                </div>

                {/* Tab Navigation */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                    <div className="flex gap-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                                        activeTab === tab.key
                                            ? 'bg-indigo-500 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'card' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <ProfileCard
                            name={dosen.nama}
                            title="Dosen"
                            handle={dosen.nidn}
                            status="Aktif"
                            avatarUrl={avatarUrl}
                            contactText="Edit Profil"
                            showUserInfo={true}
                            enableTilt={true}
                            behindGlowColor="rgba(99, 102, 241, 0.6)"
                            innerGradient="linear-gradient(145deg, #6366f144 0%, #a855f744 100%)"
                            onContactClick={() => setActiveTab('profile')}
                        />
                    </div>
                )}

                {activeTab === 'profile' && (
                    <ProfileEditEnhanced
                        dosen={dosen}
                        profileForm={profileForm}
                        avatarUrl={avatarUrl}
                        avatarPreview={avatarPreview}
                        isUploadingAvatar={isUploadingAvatar}
                        avatarInputRef={avatarInputRef}
                        handleProfileSubmit={handleProfileSubmit}
                        handleAvatarChange={handleAvatarChange}
                        handleAvatarUpload={handleAvatarUpload}
                    />
                )}

                {activeTab === 'security' && (
                    <SecurityEnhanced
                        passwordForm={passwordForm}
                        showCurrent={showCurrent}
                        showNew={showNew}
                        showConfirm={showConfirm}
                        setShowCurrent={setShowCurrent}
                        setShowNew={setShowNew}
                        setShowConfirm={setShowConfirm}
                        handlePasswordSubmit={handlePasswordSubmit}
                    />
                )}
            </div>
        </DosenLayout>
    );
}
