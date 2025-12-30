import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useState } from 'react';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
};

type PageProps = {
    mahasiswa: MahasiswaInfo;
};

export default function StudentPassword() {
    const { props } = usePage<SharedData & PageProps>();
    const { mahasiswa, flash } = props;
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mahasiswa', href: '/user/absen' },
        { title: 'Ganti Password', href: '/user/password' },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Ganti Password" />

            <main className="flex w-full flex-col gap-6 px-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                            Keamanan
                        </p>
                        <h1 className="font-display text-2xl">
                            Ganti Password
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                            Perbarui password agar akun kamu lebih aman.
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                        <KeyRound className="h-6 w-6" />
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-200/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                        {flash.success}
                    </div>
                )}

                <form
                    className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch('/user/password', {
                            onSuccess: () =>
                                form.reset(
                                    'current_password',
                                    'password',
                                    'password_confirmation',
                                ),
                        });
                    }}
                >
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="current_password"
                                className="text-slate-700 dark:text-white"
                            >
                                Password saat ini
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={form.data.current_password}
                                    onChange={(event) =>
                                        form.setData(
                                            'current_password',
                                            event.target.value,
                                        )
                                    }
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white"
                                    onClick={() =>
                                        setShowCurrent((prev) => !prev)
                                    }
                                    aria-label={
                                        showCurrent
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    {showCurrent ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={form.errors.current_password}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-700 dark:text-white">
                                Password baru
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showNext ? 'text' : 'password'}
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white"
                                    onClick={() => setShowNext((prev) => !prev)}
                                    aria-label={
                                        showNext
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    {showNext ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-slate-700 dark:text-white"
                            >
                                Konfirmasi password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-white/60 dark:hover:text-white"
                                    onClick={() =>
                                        setShowConfirm((prev) => !prev)
                                    }
                                    aria-label={
                                        showConfirm
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    {showConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={form.errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                            disabled={form.processing}
                        >
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan password baru'}
                        </Button>
                    </div>
                </form>

                <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                    <p>
                        Pastikan password minimal 8 karakter. Hindari password
                        yang sama dengan NIM atau tanggal lahir.
                    </p>
                    <p className="mt-2">
                        Akun:{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {mahasiswa.nama}
                        </strong>{' '}
                        - NIM{' '}
                        <strong className="text-slate-900 dark:text-white">
                            {mahasiswa.nim}
                        </strong>
                    </p>
                </div>
            </main>
        </StudentLayout>
    );
}
