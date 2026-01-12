import { useState, useRef, useEffect } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileCard from '@/components/ui/profile-card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { Sparkles, X, Camera, Upload, CheckCircle2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const [showProfileCard, setShowProfileCard] = useState(false);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            {/* Success Toast */}
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

            {/* Profile Card Modal */}
            {showProfileCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <button
                        onClick={() => setShowProfileCard(false)}
                        className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
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
                        onContactClick={() => setShowProfileCard(false)}
                    />
                </div>
            )}

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Profile Card Preview Button */}
                    <div className="flex items-center justify-between">
                        <HeadingSmall
                            title="Profile information"
                            description="Update your name and email address"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProfileCard(true)}
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Lihat Kartu Profil
                        </Button>
                    </div>

                    {/* Avatar Preview with Upload */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50">
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileCard(true)}
                                className="group relative h-16 w-16 rounded-xl overflow-hidden transition-transform hover:scale-105"
                            >
                                <img
                                    src={avatarUrl}
                                    alt={auth.user.name}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                            </button>
                            {avatarPreview && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">{auth.user.name}</p>
                            <p className="text-sm text-slate-500">{auth.user.email}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Administrator</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                            <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Pilih Foto
                            </Button>
                            {avatarPreview && (
                                <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUploadingAvatar} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                                    <Upload className="h-4 w-4" />
                                    {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
