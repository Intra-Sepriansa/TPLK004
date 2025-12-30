import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const [mode, setMode] = useState<'admin' | 'mahasiswa'>('admin');
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [showMahasiswaPassword, setShowMahasiswaPassword] = useState(false);
    const mahasiswaForm = useForm({
        nim: '',
        password: '',
    });

    const submitMahasiswa = (event: FormEvent) => {
        event.preventDefault();
        mahasiswaForm.post('/login/mahasiswa', {
            onFinish: () => mahasiswaForm.reset('password'),
        });
    };

    const title =
        mode === 'admin' ? 'Log in admin' : 'Log in mahasiswa';
    const description =
        mode === 'admin'
            ? 'Masuk dengan email admin dan password.'
            : 'Masuk dengan NIM dan password awal.';

    return (
        <AuthLayout title={title} description={description}>
            <Head title="Log in" />

            <div className="flex rounded-full border border-muted bg-muted/40 p-1 text-xs font-semibold">
                <button
                    type="button"
                    onClick={() => setMode('admin')}
                    className={`flex-1 rounded-full px-3 py-1.5 transition ${
                        mode === 'admin'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-muted-foreground'
                    }`}
                >
                    Admin
                </button>
                <button
                    type="button"
                    onClick={() => setMode('mahasiswa')}
                    className={`flex-1 rounded-full px-3 py-1.5 transition ${
                        mode === 'mahasiswa'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-muted-foreground'
                    }`}
                >
                    Mahasiswa
                </button>
            </div>

            {mode === 'admin' ? (
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showAdminPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setShowAdminPassword(
                                                    (prev) => !prev,
                                                )
                                            }
                                            aria-label={
                                                showAdminPassword
                                                    ? 'Sembunyikan password'
                                                    : 'Tampilkan password'
                                            }
                                        >
                                            {showAdminPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember">
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                            </div>

                        </>
                    )}
                </Form>
            ) : (
                <form
                    className="flex flex-col gap-6"
                    onSubmit={submitMahasiswa}
                >
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="nim">NIM</Label>
                            <Input
                                id="nim"
                                name="nim"
                                required
                                autoFocus
                                value={mahasiswaForm.data.nim}
                                onChange={(event) =>
                                    mahasiswaForm.setData(
                                        'nim',
                                        event.target.value,
                                    )
                                }
                                placeholder="231011400463"
                            />
                            <InputError message={mahasiswaForm.errors.nim} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mahasiswa-password">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="mahasiswa-password"
                                    type={
                                        showMahasiswaPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="password"
                                    required
                                    value={mahasiswaForm.data.password}
                                    onChange={(event) =>
                                        mahasiswaForm.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="tplk004#63"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        setShowMahasiswaPassword(
                                            (prev) => !prev,
                                        )
                                    }
                                    aria-label={
                                        showMahasiswaPassword
                                            ? 'Sembunyikan password'
                                            : 'Tampilkan password'
                                    }
                                >
                                    {showMahasiswaPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={mahasiswaForm.errors.password}
                            />
                            <p className="text-xs text-muted-foreground">
                                Password awal: <strong>tplk004#</strong> + 2
                                digit terakhir NIM.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={mahasiswaForm.processing}
                        >
                            {mahasiswaForm.processing && <Spinner />}
                            Log in mahasiswa
                        </Button>
                    </div>
                </form>
            )}

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
