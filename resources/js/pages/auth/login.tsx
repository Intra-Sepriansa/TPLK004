import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, useEffect, useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { 
    Eye, EyeOff, GraduationCap, Lock, User, Shield, Users, Moon, Sun,
    CheckCircle, Sparkles, BookOpen, Calendar, Award, ChevronRight
} from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

type LoginMode = 'admin' | 'dosen' | 'mahasiswa';

// Password strength checker
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 1) return { score, label: 'Lemah', color: 'bg-red-500' };
    if (score <= 2) return { score, label: 'Sedang', color: 'bg-amber-500' };
    if (score <= 3) return { score, label: 'Kuat', color: 'bg-emerald-500' };
    return { score, label: 'Sangat Kuat', color: 'bg-green-500' };
};

// Floating Label Input Component
const FloatingInput = ({ 
    id, label, type = 'text', value, onChange, error, icon: Icon, 
    showPasswordToggle, onTogglePassword, showPassword, autoFocus
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: any;
    showPasswordToggle?: boolean;
    onTogglePassword?: () => void;
    showPassword?: boolean;
    autoFocus?: boolean;
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;
    
    return (
        <div className="relative group">
            <div className={cn(
                "relative rounded-xl transition-all duration-300",
                isFocused && "ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20"
            )}>
                {Icon && (
                    <Icon className={cn(
                        "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 z-10",
                        isFocused ? "text-indigo-500" : "text-slate-400"
                    )} />
                )}
                <Input
                    id={id}
                    type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus={autoFocus}
                    placeholder=" "
                    className={cn(
                        "h-14 pt-4 bg-white/80 dark:bg-black/80 backdrop-blur border-slate-200 dark:border-slate-700",
                        "focus:border-indigo-500 transition-all duration-300 rounded-xl",
                        Icon && "pl-12",
                        showPasswordToggle && "pr-12"
                    )}
                />
                <label
                    htmlFor={id}
                    className={cn(
                        "absolute transition-all duration-300 pointer-events-none",
                        Icon ? "left-12" : "left-4",
                        (isFocused || hasValue) 
                            ? "top-2 text-xs text-indigo-500 font-medium" 
                            : "top-1/2 -translate-y-1/2 text-slate-400"
                    )}
                >
                    {label}
                </label>
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
};

// Animated Toggle Switch
const AnimatedToggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <div 
            onClick={() => onChange(!checked)}
            className={cn(
                "relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer",
                checked 
                    ? "bg-gradient-to-r from-gray-900 to-black shadow-lg shadow-indigo-500/30" 
                    : "bg-slate-200 dark:bg-slate-700"
            )}
        >
            <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center",
                checked ? "left-7" : "left-1"
            )}>
                {checked && <CheckCircle className="h-3 w-3 text-indigo-500" />}
            </div>
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {label}
        </span>
    </label>
);

// Mode Tab Button
const ModeTab = ({ mode, currentMode, onClick, icon: Icon, label }: {
    mode: LoginMode;
    currentMode: LoginMode;
    onClick: () => void;
    icon: any;
    label: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
            currentMode === mode
                ? "bg-gradient-to-r from-gray-900 to-black text-white shadow-lg shadow-indigo-500/30 scale-105"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
    >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
    </button>
);

export default function Login({ status }: LoginProps) {
    const [mode, setMode] = useState<LoginMode>('mahasiswa');
    const [showPassword, setShowPassword] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [hasError, setHasError] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Forms for each mode
    const adminForm = useForm({ email: '', password: '', remember: false });
    const dosenForm = useForm({ nidn: '', password: '', remember: false });
    const mahasiswaForm = useForm({ nim: '', password: '' });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        setIsDark(document.documentElement.classList.contains('dark'));
        return () => clearTimeout(timer);
    }, []);

    const toggleDarkMode = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    const currentForm = mode === 'admin' ? adminForm : mode === 'dosen' ? dosenForm : mahasiswaForm;
    const passwordStrength = getPasswordStrength(currentForm.data.password);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setHasError(false);
        
        const endpoint = mode === 'admin' ? '/login' : mode === 'dosen' ? '/dosen/login' : '/login/mahasiswa';
        
        currentForm.post(endpoint, {
            onSuccess: () => {
                setLoginSuccess(true);
            },
            onError: () => {
                setHasError(true);
                setTimeout(() => setHasError(false), 500);
            },
            onFinish: () => currentForm.reset('password'),
        });
    };

    const modeConfig = {
        admin: { 
            icon: Shield, 
            title: 'Admin Portal', 
            subtitle: 'Kelola sistem dan pengguna',
            gradient: 'from-red-500 via-rose-500 to-pink-600',
            idLabel: 'Email',
            idIcon: User,
            idField: 'email'
        },
        dosen: { 
            icon: GraduationCap, 
            title: 'Portal Dosen', 
            subtitle: 'Monitoring kehadiran mahasiswa',
            gradient: 'from-indigo-500 via-purple-500 to-violet-600',
            idLabel: 'NIDN',
            idIcon: User,
            idField: 'nidn'
        },
        mahasiswa: { 
            icon: Users, 
            title: 'Portal Mahasiswa', 
            subtitle: 'Absensi dan informasi akademik',
            gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
            idLabel: 'NIM',
            idIcon: User,
            idField: 'nim'
        },
    };

    const config = modeConfig[mode];

    return (
        <>
            <Head title="Login" />
            
            <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
                {/* Left Side - Animated Branding */}
                <div className={cn(
                    "hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-700",
                    `bg-gradient-to-br ${config.gradient}`
                )}>
                    {/* Animated Background Shapes */}
                    <div className="absolute inset-0">
                        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/5 animate-bounce" style={{ animationDuration: '6s' }} />
                        <div className="absolute bottom-1/4 left-1/3 h-24 w-24 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '3s' }} />
                        
                        {/* Floating icons */}
                        {[BookOpen, Calendar, Award, GraduationCap, Users].map((Icon, i) => (
                            <Icon 
                                key={i}
                                className="absolute text-white/20 animate-float"
                                style={{
                                    left: `${10 + i * 18}%`,
                                    top: `${15 + (i % 3) * 25}%`,
                                    animationDelay: `${i * 0.8}s`,
                                    animationDuration: `${4 + i}s`
                                }}
                                size={32 + i * 8}
                            />
                        ))}
                        
                        {/* Sparkles */}
                        {[...Array(8)].map((_, i) => (
                            <Sparkles 
                                key={i}
                                className="absolute text-white/30 animate-pulse"
                                style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 80 + 10}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '2s'
                                }}
                                size={16}
                            />
                        ))}
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        {/* Logo with bounce animation */}
                        <div className={cn(
                            "flex items-center gap-4 transition-all duration-1000",
                            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
                        )}>
                            <div className="animate-bounce" style={{ animationDuration: '2s' }}>
                                <AppLogoIcon className="h-14 w-14 drop-shadow-2xl" />
                            </div>
                            <div>
                                <span className="text-3xl font-bold text-white drop-shadow-lg">TPLK004</span>
                                <p className="text-white/80 text-sm">Sistem Absensi AI</p>
                            </div>
                        </div>
                        
                        {/* Main Content */}
                        <div className={cn(
                            "space-y-8 transition-all duration-1000 delay-300",
                            isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl shadow-2xl">
                                    <config.icon className="h-10 w-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">{config.title}</h1>
                                    <p className="text-xl text-white/80 mt-1">{config.subtitle}</p>
                                </div>
                            </div>
                            
                            <p className="text-lg text-white/90 max-w-md leading-relaxed">
                                {mode === 'mahasiswa' && 'Akses absensi, lihat jadwal, dan pantau progress akademik kamu dengan mudah.'}
                                {mode === 'dosen' && 'Pantau kehadiran mahasiswa, verifikasi selfie, dan kelola sesi perkuliahan.'}
                                {mode === 'admin' && 'Kelola pengguna, konfigurasi sistem, dan pantau aktivitas platform.'}
                            </p>
                            
                            {/* Feature highlights */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: CheckCircle, text: 'Absensi AI' },
                                    { icon: Calendar, text: 'Jadwal Real-time' },
                                    { icon: Award, text: 'Gamifikasi' },
                                    { icon: BookOpen, text: 'Akademik' },
                                ].map((item, i) => (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur transition-all duration-500",
                                            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                        )}
                                        style={{ transitionDelay: `${600 + i * 100}ms` }}
                                    >
                                        <item.icon className="h-5 w-5 text-white" />
                                        <span className="text-white/90 text-sm font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className={cn(
                            "text-white/60 text-sm transition-all duration-1000 delay-500",
                            isLoaded ? "opacity-100" : "opacity-0"
                        )}>
                            © 2025 UNPAM - Universitas Pamulang
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="absolute top-6 right-6 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
                        )}
                    </button>

                    <div className={cn(
                        "w-full max-w-md space-y-8 transition-all duration-700",
                        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}>
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center">
                            <div className="inline-flex items-center gap-3 mb-4">
                                <div className="animate-bounce" style={{ animationDuration: '2s' }}>
                                    <AppLogoIcon className="h-12 w-12" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">TPLK004</span>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Selamat Datang 👋
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                Pilih mode dan masuk untuk melanjutkan
                            </p>
                        </div>

                        {/* Mode Tabs */}
                        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            <ModeTab mode="mahasiswa" currentMode={mode} onClick={() => setMode('mahasiswa')} icon={Users} label="Mahasiswa" />
                            <ModeTab mode="dosen" currentMode={mode} onClick={() => setMode('dosen')} icon={GraduationCap} label="Dosen" />
                            <ModeTab mode="admin" currentMode={mode} onClick={() => setMode('admin')} icon={Shield} label="Admin" />
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm animate-fadeIn">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form 
                            ref={formRef}
                            onSubmit={handleSubmit} 
                            className={cn(
                                "space-y-6 transition-all duration-300",
                                hasError && "animate-shake"
                            )}
                        >
                            {/* ID Field */}
                            <FloatingInput
                                id={config.idField}
                                label={config.idLabel}
                                type={mode === 'admin' ? 'email' : 'text'}
                                value={mode === 'admin' ? adminForm.data.email : mode === 'dosen' ? dosenForm.data.nidn : mahasiswaForm.data.nim}
                                onChange={(e) => {
                                    if (mode === 'admin') adminForm.setData('email', e.target.value);
                                    else if (mode === 'dosen') dosenForm.setData('nidn', e.target.value);
                                    else mahasiswaForm.setData('nim', e.target.value);
                                }}
                                error={mode === 'admin' ? adminForm.errors.email : mode === 'dosen' ? dosenForm.errors.nidn : mahasiswaForm.errors.nim}
                                icon={config.idIcon}
                                autoFocus
                            />

                            {/* Password Field */}
                            <div className="space-y-2">
                                <FloatingInput
                                    id="password"
                                    label="Password"
                                    value={currentForm.data.password}
                                    onChange={(e) => {
                                        if (mode === 'admin') adminForm.setData('password', e.target.value);
                                        else if (mode === 'dosen') dosenForm.setData('password', e.target.value);
                                        else mahasiswaForm.setData('password', e.target.value);
                                    }}
                                    error={currentForm.errors.password}
                                    icon={Lock}
                                    showPasswordToggle
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                />
                                
                                {/* Password Strength Indicator */}
                                {currentForm.data.password && (
                                    <div className="space-y-2 animate-fadeIn">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={cn(
                                                        "h-1.5 flex-1 rounded-full transition-all duration-300",
                                                        level <= passwordStrength.score ? passwordStrength.color : "bg-slate-200 dark:bg-slate-700"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium transition-colors",
                                            passwordStrength.score <= 1 ? "text-red-500" :
                                            passwordStrength.score <= 2 ? "text-amber-500" :
                                            "text-emerald-500"
                                        )}>
                                            Kekuatan: {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Remember Me (for admin and dosen) */}
                            {mode !== 'mahasiswa' && (
                                <AnimatedToggle
                                    checked={mode === 'admin' ? adminForm.data.remember : dosenForm.data.remember}
                                    onChange={(v) => {
                                        if (mode === 'admin') adminForm.setData('remember', v);
                                        else dosenForm.setData('remember', v);
                                    }}
                                    label="Ingat saya di perangkat ini"
                                />
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={currentForm.processing}
                                className={cn(
                                    "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300",
                                    "bg-gradient-to-r shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                                    mode === 'admin' && "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/30",
                                    mode === 'dosen' && "from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 shadow-indigo-500/30",
                                    mode === 'mahasiswa' && "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30",
                                    currentForm.processing && "opacity-80 cursor-not-allowed"
                                )}
                            >
                                {currentForm.processing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Masuk</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Mode Switch Links */}
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
                            {mode === 'mahasiswa' && (
                                <p>Bukan mahasiswa? <button type="button" onClick={() => setMode('dosen')} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Login sebagai Dosen</button></p>
                            )}
                            {mode === 'dosen' && (
                                <p>Bukan dosen? <button type="button" onClick={() => setMode('mahasiswa')} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Login sebagai Mahasiswa</button></p>
                            )}
                            {mode === 'admin' && (
                                <p>Bukan admin? <button type="button" onClick={() => setMode('mahasiswa')} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Login sebagai Mahasiswa</button></p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
                            <p>Dengan masuk, Anda menyetujui <a href="#" className="hover:underline">Ketentuan Layanan</a> dan <a href="#" className="hover:underline">Kebijakan Privasi</a></p>
                        </div>
                    </div>

                    {/* Success Animation Overlay */}
                    {loginSuccess && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/50 animate-bounce">
                                    <CheckCircle className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Login Berhasil!</h3>
                                <p className="text-slate-500 dark:text-slate-400">Mengalihkan ke dashboard...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </>
    );
}
