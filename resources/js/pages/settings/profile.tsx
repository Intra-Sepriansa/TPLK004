import { useState, useRef, useEffect } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileCard from '@/components/ui/profile-card';
import AppLayout from '@/layouts/app-layout';
import { edit } from '@/routes/profile';
import { 
    Sparkles, X, Camera, Upload, User, Mail, Shield, 
    CheckCircle2, TrendingUp, Settings, CreditCard, KeyRound, Lock, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile settings', href: edit().url },
];

type TabType = 'card' | 'profile' | 'security';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('card');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const avatarUrl = avatarPreview || (auth.user as any).avatar_url || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=3b82f6&color=fff&size=400&bold=true`;

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
        router.post('/settings/profile/avatar', formData, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <div 
                className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100 transition-all duration-300 ease-out ${
                    (successMessage || (showFlash && flash?.success)) ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                }`}
            >
                <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                <div>
                    <p className="font-semibold">Berhasil!</p>
                    <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">{successMessage || flash?.success || ''}</p>
                </div>
            </div>

            {showProfileCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <button onClick={() => setShowProfileCard(false)} className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                    <ProfileCard name={auth.user.name} title="Administrator" handle={auth.user.email.split('@')[0]} status="Online" avatarUrl={avatarUrl} contactText="Edit Profile" showUserInfo={true} enableTilt={true} behindGlowColor="rgba(59, 130, 246, 0.6)" innerGradient="linear-gradient(145deg, #3b82f644 0%, #8b5cf644 100%)" onContactClick={() => setShowProfileCard(false)} />
                </div>
            )}

            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowProfileCard(true)} className="group relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur overflow-hidden transition-transform hover:scale-105">
                                    <img src={avatarUrl} alt={auth.user.name} className="h-full w-full rounded-2xl object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                </button>
                                <div>
                                    <p className="text-sm text-blue-100">Profil Administrator</p>
                                    <h1 className="text-2xl font-bold">{auth.user.name}</h1>
                                    <p className="text-sm text-blue-100">{auth.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm">Akun Aktif</span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-blue-100 mb-1"><Settings className="h-4 w-4" /><span className="text-xs">Role</span></div>
                                <p className="text-lg font-bold">Admin</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-blue-100 mb-1"><Shield className="h-4 w-4" /><span className="text-xs">Status</span></div>
                                <p className="text-lg font-bold">Verified</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <div className="flex items-center gap-2 text-blue-100 mb-1"><TrendingUp className="h-4 w-4" /><span className="text-xs">Access</span></div>
                                <p className="text-lg font-bold">Full</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex gap-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all', activeTab === tab.key ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800')}>
                                    <Icon className="h-4 w-4" />{tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {activeTab === 'card' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <ProfileCard name={auth.user.name} title="Administrator" handle={auth.user.email.split('@')[0]} status="Aktif" avatarUrl={avatarUrl} contactText="Edit Profil" showUserInfo={true} enableTilt={true} behindGlowColor="rgba(59, 130, 246, 0.6)" innerGradient="linear-gradient(145deg, #3b82f644 0%, #8b5cf644 100%)" onContactClick={() => setActiveTab('profile')} />
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><User className="h-5 w-5" /></div>
                                <div><h2 className="font-semibold text-slate-900 dark:text-white">Edit Profil</h2><p className="text-sm text-slate-500">Perbarui informasi akun Anda</p></div>
                            </div>
                            <Form {...ProfileController.update.form()} options={{ preserveScroll: true }} className="space-y-4">
                                {({ processing, recentlySuccessful, errors }) => (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Lengkap</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input id="name" name="name" defaultValue={auth.user.name} className="pl-10" placeholder="Nama lengkap" />
                                            </div>
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input id="email" type="email" name="email" defaultValue={auth.user.email} className="pl-10" placeholder="Email" />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>
                                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                                <p className="text-sm text-amber-700 dark:text-amber-300">Email belum diverifikasi. <Link href={send()} as="button" className="underline font-medium">Kirim ulang link verifikasi.</Link></p>
                                                {status === 'verification-link-sent' && <p className="mt-2 text-sm font-medium text-green-600">Link verifikasi baru telah dikirim.</p>}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Foto Profil</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                    <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                                    {avatarPreview && <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20"><CheckCircle2 className="h-6 w-6 text-blue-500" /></div>}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                                                    <div className="flex gap-2">
                                                        <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="flex items-center gap-2"><Camera className="h-4 w-4" />Pilih Foto</Button>
                                                        {avatarPreview && <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUploadingAvatar} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"><Upload className="h-4 w-4" />{isUploadingAvatar ? 'Uploading...' : 'Upload'}</Button>}
                                                    </div>
                                                    <p className="text-xs text-slate-500">PNG, JPG max 2MB</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                                <p className="text-sm text-emerald-600">Tersimpan</p>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"><Mail className="h-5 w-5" /></div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Akun</h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900"><span className="text-sm text-slate-500">Nama</span><span className="font-medium text-slate-900 dark:text-white">{auth.user.name}</span></div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900"><span className="text-sm text-slate-500">Email</span><span className="font-medium text-slate-900 dark:text-white">{auth.user.email}</span></div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900"><span className="text-sm text-slate-500">Role</span><span className="font-medium text-blue-600 dark:text-blue-400">Administrator</span></div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900"><span className="text-sm text-slate-500">Status</span><span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /><span className="font-medium">Aktif</span></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"><KeyRound className="h-5 w-5" /></div>
                                <div><h2 className="font-semibold text-slate-900 dark:text-white">Ganti Password</h2><p className="text-sm text-slate-500">Perbarui password untuk keamanan</p></div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Untuk mengubah password, silakan kunjungi halaman <Link href="/settings/password" className="text-blue-600 hover:underline font-medium">Pengaturan Password</Link>.</p>
                            <Link href="/settings/password"><Button variant="outline" className="w-full">Ubah Password</Button></Link>
                        </div>
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><AlertCircle className="h-5 w-5" /></div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Tips Keamanan</h2>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /><span>Gunakan minimal 8 karakter</span></li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /><span>Kombinasikan huruf besar, kecil, dan angka</span></li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /><span>Hindari menggunakan informasi pribadi</span></li>
                                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /><span>Jangan gunakan password yang sama dengan akun lain</span></li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-sm">
                                <div className="flex items-center gap-3 mb-4"><Shield className="h-6 w-6" /><h2 className="font-semibold">Status Keamanan</h2></div>
                                <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="h-5 w-5" /><span className="font-medium">Akun Terlindungi</span></div>
                                <p className="text-sm text-blue-100">Pertimbangkan untuk mengaktifkan Two-Factor Authentication untuk keamanan optimal.</p>
                                <Link href="/settings/two-factor"><Button variant="secondary" size="sm" className="mt-4">Aktifkan 2FA</Button></Link>
                            </div>
                        </div>
                        <div className="lg:col-span-2"><DeleteUser /></div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
