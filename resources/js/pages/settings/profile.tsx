import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

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
import { Sparkles, X } from 'lucide-react';

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
    const { auth } = usePage<SharedData>().props;
    const [showProfileCard, setShowProfileCard] = useState(false);

    // Default avatar using UI Avatars
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=3b82f6&color=fff&size=400&bold=true`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

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
                        editable
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

                    {/* Avatar Preview */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50">
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
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{auth.user.name}</p>
                            <p className="text-sm text-slate-500">{auth.user.email}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Administrator</p>
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
