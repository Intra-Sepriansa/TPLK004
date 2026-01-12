import { useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
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
    TrendingUp,
    X,
    Camera,
    Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
    email?: string;
    avatar_url?: string;
}

interface Stats {
    totalAttendance: number;
    attendanceRate: number;
    currentStreak: number;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats?: Stats;
}

type TabType = 'profile' | 'security';

export default function StudentProfile() {
    const { props } = usePage<{ props: PageProps; flash?: { success?: string } }>();
    const { mahasiswa, flash } = props as unknown as PageProps & { flash?: { success?: string } };
    const stats = (props as unknown as PageProps).stats ?? {
        totalAttendance: 0,
        attendanceRate: 0,
        currentStreak: 0,
    };

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const profileForm = useForm({
        nama: mahasiswa.nama ?? '',
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
        profileForm.patch('/user/profile', {
            onSuccess: () => {
                setSuccessMessage('Profil berhasil diperbarui!');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch('/user/password', {
            onSuccess: () => {
                passwordForm.reset('current_password', 'password', 'password_confirmation');
                setSuccessMessage('Password berhasil diubah!');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = () => {
        const file = avatarInputRef.current?.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/user/profile/avatar', formData, {
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

    const tabs = [
        { key: 'profile' as TabType, label: 'Profil', icon: User },
        { key: 'security' as TabType, label: 'Keamanan', icon: Shield },
    ];

    const avatarUrl = avatarPreview || mahasiswa.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mahasiswa.nama)}&background=10b981&color=fff&size=400&bold=true`;
    const displayAvatarUrl = mahasiswa.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mahasiswa.nama)}&background=10b981&color=fff&size=400&bold=true`;

    return (
        <StudentLayout>
            <Head title="Profil" />

            {showProfileCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <button
                        onClick={() => setShowProfileCard(false)}
                        className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <ProfileCard
                        name={mahasiswa.nama}
                        title="Mahasiswa"
                        handle={mahasiswa.nim}
                        status="Aktif"
                        avatarUrl={displayAvatarUrl}
                        contactText="Tutup"
                        showUserInfo={true}
                        enableTilt={true}
                        behindGlowColor="rgba(16, 185, 129, 0.6)"
                        innerGradient="linear-gradient(145deg, #10b98144 0%, #14b8a644 100%)"
                        onContactClick={() => setShowProfileCard(false)}
                    />
                </div>
            )}

            <div className="p-6 space-y-6">
                {(successMessage || flash?.success) && (
                    <div className="fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg backdrop-blur animate-in slide-in-from-top-2 dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                        <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="font-semibold">Berhasil!</p>
                            <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">
                                {successMessage || flash?.success}
                            </p>
                        </div>
                    </div>
                )}

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowProfileCard(true)}
                                    className="group relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold overflow-hidden transition-transform hover:scale-105"
                                >
                                    <img src={avatarUrl} alt={mahasiswa.nama} className="h-full w-full rounded-2xl object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                </button>
                                <div>
                                    <p className="text-sm text-emerald-100">Profil Mahasiswa</p>
                                    <h1 className="text-2xl font-bold">{mahasiswa.nama}</h1>
                                    <p className="text-sm text-emerald-100">NIM: {mahasiswa.nim}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProfileCard(true)}
                                className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur hover:bg-white/30 transition-colors"
                            >
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm">Lihat Kartu Profil</span>
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-emerald-100">Total Kehadiran</p>
                                <p className="text-2xl font-bold">{stats.totalAttendance}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-emerald-100">Rata-rata</p>
                                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-emerald-100">Streak</p>
                                <p className="text-2xl font-bold">{stats.currentStreak} hari</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
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
                                            ? 'bg-emerald-500 text-white shadow-md'
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

                {activeTab === 'profile' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Edit Profil</h2>
                                    <p className="text-sm text-slate-500">Perbarui informasi akun kamu</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama" className="text-slate-700 dark:text-white">Nama Lengkap</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="nama"
                                            value={profileForm.data.nama}
                                            onChange={e => profileForm.setData('nama', e.target.value)}
                                            className="pl-10"
                                            placeholder="Nama lengkap"
                                        />
                                    </div>
                                    <InputError message={profileForm.errors.nama} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nim" className="text-slate-700 dark:text-white">NIM</Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input id="nim" value={mahasiswa.nim} disabled className="pl-10 bg-slate-50 dark:bg-slate-900" />
                                    </div>
                                    <p className="text-xs text-slate-500">NIM tidak dapat diubah</p>
                                </div>

                                {mahasiswa.email && (
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-700 dark:text-white">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input id="email" value={mahasiswa.email} disabled className="pl-10 bg-slate-50 dark:bg-slate-900" />
                                        </div>
                                    </div>
                                )}

                                {/* Avatar Upload Section */}
                                <div className="space-y-2">
                                    <Label>Foto Profil</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                            {avatarPreview && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
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
                                                    className="flex items-center gap-2"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    Pilih Foto
                                                </Button>
                                                {avatarPreview && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleAvatarUpload}
                                                        disabled={isUploadingAvatar}
                                                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                        {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={profileForm.processing}>
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                        <IdCard className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Akun</h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500">Nama</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{mahasiswa.nama}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500">NIM</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{mahasiswa.nim}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                                        <span className="text-sm text-slate-500">Status</span>
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="font-medium">Aktif</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm dark:from-slate-800 dark:to-slate-900">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                    <h2 className="font-semibold">Statistik Kehadiran</h2>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold">
                                        <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                    </span>
                                    <span className="text-slate-400 mb-1">rata-rata</span>
                                </div>
                                <Progress value={stats.attendanceRate} className="mt-4 h-2 bg-slate-700" />
                                <p className="text-xs text-slate-400 mt-2">
                                    {stats.totalAttendance} total kehadiran • {stats.currentStreak} hari streak
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
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
                                    <Label htmlFor="current_password" className="text-slate-700 dark:text-white">Password Saat Ini</Label>
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
                                    <Label htmlFor="password" className="text-slate-700 dark:text-white">Password Baru</Label>
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
                                    <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-white">Konfirmasi Password Baru</Label>
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

                                <Button type="submit" className="w-full bg-violet-500 hover:bg-violet-600 text-white" disabled={passwordForm.processing}>
                                    {passwordForm.processing ? 'Menyimpan...' : 'Ubah Password'}
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
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
                                        <span>Hindari menggunakan NIM atau tanggal lahir</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Jangan gunakan password yang sama dengan akun lain</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="h-6 w-6" />
                                    <h2 className="font-semibold">Status Keamanan</h2>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Akun Terlindungi</span>
                                </div>
                                <p className="text-sm text-emerald-100">
                                    Pertimbangkan untuk mengubah password secara berkala untuk keamanan optimal.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
