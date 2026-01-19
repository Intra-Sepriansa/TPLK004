import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileCard from '@/components/ui/profile-card';
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

                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold overflow-hidden">
                                    <img src={avatarUrl} alt={dosen.nama} className="h-full w-full rounded-2xl object-cover" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-100">Profil Dosen</p>
                                    <h1 className="text-2xl font-bold">{dosen.nama}</h1>
                                    <p className="text-sm text-indigo-100">NIDN: {dosen.nidn}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm">Akun Aktif</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-xs">Mata Kuliah</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Total Sesi</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="text-xs">Verifikasi</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalVerifications}</p>
                            </div>
                        </div>
                    </div>
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
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Edit Profil</h2>
                                    <p className="text-sm text-slate-500">Perbarui informasi akun Anda</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama">Nama Lengkap</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="nama"
                                            value={profileForm.data.nama}
                                            onChange={e => profileForm.setData('nama', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <InputError message={profileForm.errors.nama} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nidn">NIDN</Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input id="nidn" value={dosen.nidn} disabled className="pl-10 bg-slate-50 dark:bg-gray-900" />
                                    </div>
                                    <p className="text-xs text-slate-500">NIDN tidak dapat diubah</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={e => profileForm.setData('email', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <InputError message={profileForm.errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">No. Telepon</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="phone"
                                            value={profileForm.data.phone}
                                            onChange={e => profileForm.setData('phone', e.target.value)}
                                            className="pl-10"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                    <InputError message={profileForm.errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Foto Profil</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                            {avatarPreview && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                                                    <CheckCircle2 className="h-6 w-6 text-indigo-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="flex items-center gap-2">
                                                    <Camera className="h-4 w-4" />
                                                    Pilih Foto
                                                </Button>
                                                {avatarPreview && (
                                                    <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUploadingAvatar} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600">
                                                        <Upload className="h-4 w-4" />
                                                        {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600" disabled={profileForm.processing}>
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                        <IdCard className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Akun</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-900">
                                        <span className="text-sm text-slate-500">Nama</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{dosen.nama}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-900">
                                        <span className="text-sm text-slate-500">NIDN</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{dosen.nidn}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-900">
                                        <span className="text-sm text-slate-500">Email</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{dosen.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-gray-900">
                                        <span className="text-sm text-slate-500">Status</span>
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="font-medium">Aktif</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Ganti Password</h2>
                                    <p className="text-sm text-slate-500">Perbarui password untuk keamanan</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Password Saat Ini</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="current_password"
                                            type={showCurrent ? 'text' : 'password'}
                                            value={passwordForm.data.current_password}
                                            onChange={e => passwordForm.setData('current_password', e.target.value)}
                                            className="pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={passwordForm.errors.current_password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            type={showNew ? 'text' : 'password'}
                                            value={passwordForm.data.password}
                                            onChange={e => passwordForm.setData('password', e.target.value)}
                                            className="pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={passwordForm.errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            value={passwordForm.data.password_confirmation}
                                            onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                            className="pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={passwordForm.errors.password_confirmation} />
                                </div>

                                <Button type="submit" className="w-full bg-violet-500 hover:bg-violet-600" disabled={passwordForm.processing}>
                                    {passwordForm.processing ? 'Menyimpan...' : 'Ubah Password'}
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Tips Keamanan</h2>
                                </div>

                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Gunakan minimal 8 karakter</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Kombinasikan huruf besar, kecil, dan angka</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Hindari menggunakan NIDN atau tanggal lahir</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Jangan gunakan password yang sama dengan akun lain</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="h-6 w-6" />
                                    <h2 className="font-semibold">Status Keamanan</h2>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Akun Terlindungi</span>
                                </div>
                                <p className="text-sm text-indigo-100">
                                    Pertimbangkan untuk mengubah password secara berkala untuk keamanan optimal.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DosenLayout>
    );
}
