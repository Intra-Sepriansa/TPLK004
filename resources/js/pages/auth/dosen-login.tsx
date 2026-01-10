import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AppLogoIcon from '@/components/app-logo-icon';
import { Eye, EyeOff, GraduationCap, Lock, User } from 'lucide-react';

export default function DosenLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nidn: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/dosen/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login Dosen" />

            <div className="min-h-screen flex">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
                    <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5" />
                    
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="h-10 w-10" />
                            <span className="text-2xl font-bold text-white">TPLK004</span>
                        </div>
                    </div>
                    
                    <div className="relative space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Portal Dosen</h1>
                                <p className="text-indigo-100">Sistem Monitoring Kehadiran</p>
                            </div>
                        </div>
                        <p className="text-lg text-indigo-100 max-w-md">
                            Pantau kehadiran mahasiswa, verifikasi selfie, dan kelola sesi perkuliahan dengan mudah.
                        </p>
                    </div>

                    <div className="relative text-sm text-indigo-200">
                        © 2025 UNPAM - Universitas Pamulang
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center">
                            <div className="inline-flex items-center gap-3 mb-4">
                                <AppLogoIcon className="h-10 w-10" />
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">TPLK004</span>
                            </div>
                        </div>

                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang</h2>
                            <p className="text-slate-500 mt-2">Masuk ke portal dosen untuk melanjutkan</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nidn">NIDN</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="nidn"
                                        type="text"
                                        value={data.nidn}
                                        onChange={(e) => setData('nidn', e.target.value)}
                                        className="pl-10"
                                        placeholder="Masukkan NIDN"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>
                                <InputError message={errors.nidn} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pl-10 pr-10"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                    />
                                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                                        Ingat saya
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-slate-500">
                            <p>Bukan dosen? <a href="/login/mahasiswa" className="text-indigo-600 hover:underline">Login sebagai Mahasiswa</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
