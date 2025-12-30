import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StudentLayout from '@/layouts/student-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { UserCircle } from 'lucide-react';

type MahasiswaInfo = {
    id: number;
    nama: string;
    nim: string;
};

type PageProps = {
    mahasiswa: MahasiswaInfo;
};

export default function StudentProfile() {
    const { props } = usePage<SharedData & PageProps>();
    const { mahasiswa, flash } = props;
    const form = useForm({
        nama: mahasiswa.nama ?? '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mahasiswa', href: '/user/absen' },
        { title: 'Profil', href: '/user/profile' },
    ];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Mahasiswa" />

            <main className="flex w-full flex-col gap-6 px-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                            Profil
                        </p>
                        <h1 className="font-display text-2xl">
                            Data Mahasiswa
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-white/60">
                            Perbarui nama tampilan akun kamu.
                        </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                        <UserCircle className="h-6 w-6" />
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-200/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <form
                        className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch('/user/profile');
                        }}
                    >
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama" className="text-slate-700 dark:text-white">
                                    Nama lengkap
                                </Label>
                                <Input
                                    id="nama"
                                    value={form.data.nama}
                                    onChange={(event) =>
                                        form.setData('nama', event.target.value)
                                    }
                                    placeholder="Nama lengkap"
                                />
                                <InputError message={form.errors.nama} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nim" className="text-slate-700 dark:text-white">
                                    NIM
                                </Label>
                                <Input
                                    id="nim"
                                    value={mahasiswa.nim}
                                    disabled
                                />
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan perubahan'}
                            </Button>
                        </div>
                    </form>

                    <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-lg">
                        <h2 className="font-display text-xl">
                            Informasi akun
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
                            Data NIM terkunci agar tetap sesuai dengan database
                            akademik. Jika ada kesalahan, hubungi admin kampus.
                        </p>
                        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-100 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-black/40 dark:text-white/70">
                            Nama:{' '}
                            <strong className="text-slate-900 dark:text-white">
                                {mahasiswa.nama}
                            </strong>
                            <br />
                            NIM:{' '}
                            <strong className="text-slate-900 dark:text-white">
                                {mahasiswa.nim}
                            </strong>
                        </div>
                    </div>
                </div>
            </main>
        </StudentLayout>
    );
}
