/**
 * Dosen Enhanced Settings Page
 * Advanced settings dengan fitur khusus untuk dosen
 */

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    CheckCircle, 
    AlertCircle, 
    Settings as SettingsIcon,
    Bell,
    Palette,
    Shield,
    Lock,
    Database,
    GraduationCap,
    Users,
    Globe,
    Moon,
    Sun,
    type LucideIcon
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';

type ToastType = { type: 'success' | 'error'; message: string } | null;

// Extended categories for dosen
type DosenSettingsCategory = 'general' | 'teaching' | 'classManagement' | 'notifications' | 'appearance' | 'privacy' | 'security' | 'dataManagement';

interface DosenProps {
    dosen: {
        id: number;
        nama: string;
        nidn: string;
        email: string;
    };
}

const categoryInfo: Record<DosenSettingsCategory, { title: string; description: string; icon: LucideIcon; gradient: string }> = {
    general: {
        title: 'Pengaturan Umum',
        description: 'Kelola preferensi dasar dan pengaturan regional',
        icon: SettingsIcon,
        gradient: 'from-blue-500 to-cyan-500',
    },
    teaching: {
        title: 'Pengajaran',
        description: 'Pengaturan terkait metode pengajaran dan evaluasi',
        icon: GraduationCap,
        gradient: 'from-emerald-500 to-teal-500',
    },
    classManagement: {
        title: 'Manajemen Kelas',
        description: 'Kelola preferensi untuk pengelolaan kelas dan mahasiswa',
        icon: Users,
        gradient: 'from-amber-500 to-orange-500',
    },
    notifications: {
        title: 'Notifikasi',
        description: 'Kontrol bagaimana dan kapan Anda menerima notifikasi',
        icon: Bell,
        gradient: 'from-green-500 to-emerald-500',
    },
    appearance: {
        title: 'Tampilan',
        description: 'Sesuaikan tampilan dan nuansa interface Anda',
        icon: Palette,
        gradient: 'from-purple-500 to-pink-500',
    },
    privacy: {
        title: 'Privasi',
        description: 'Kelola privasi dan preferensi berbagi data',
        icon: Shield,
        gradient: 'from-orange-500 to-red-500',
    },
    security: {
        title: 'Keamanan',
        description: 'Lindungi akun Anda dengan fitur keamanan',
        icon: Lock,
        gradient: 'from-red-500 to-rose-500',
    },
    dataManagement: {
        title: 'Manajemen Data',
        description: 'Kelola data, penyimpanan, dan backup Anda',
        icon: Database,
        gradient: 'from-indigo-500 to-purple-500',
    },
};

export default function DosenSettings({ dosen }: DosenProps) {
    const [activeCategory, setActiveCategory] = useState<DosenSettingsCategory>('general');
    const [isLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastType>(null);

    // Settings state
    const [language, setLanguage] = useState('id');
    const [timezone, setTimezone] = useState('Asia/Jakarta');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
    const [theme, setTheme] = useState('dark');
    
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            showToast('success', 'Pengaturan berhasil disimpan');
        }, 1000);
    };

    const handleReset = () => {
        setLanguage('id');
        setTimezone('Asia/Jakarta');
        setDateFormat('DD/MM/YYYY');
        setTheme('dark');
        showToast('success', 'Pengaturan direset ke default');
    };

    const renderContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <div className="space-y-6">
                        {/* Language */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Bahasa
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                                <option value="id">Bahasa Indonesia</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Zona Waktu
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                                <option value="Asia/Makassar">WITA (Makassar)</option>
                                <option value="Asia/Jayapura">WIT (Jayapura)</option>
                            </select>
                        </div>

                        {/* Date Format */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Format Tanggal
                            </label>
                            <select
                                value={dateFormat}
                                onChange={(e) => setDateFormat(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            >
                                <option value="DD/MM/YYYY">31/12/2024</option>
                                <option value="MM/DD/YYYY">12/31/2024</option>
                                <option value="YYYY-MM-DD">2024-12-31</option>
                            </select>
                        </div>

                        <motion.button
                            onClick={handleSave}
                            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Simpan Perubahan
                        </motion.button>
                    </div>
                );
            
            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                Tema
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['light', 'dark', 'auto'].map((t) => (
                                    <motion.button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            theme === t
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            {t === 'light' && <Sun className="w-6 h-6" />}
                                            {t === 'dark' && <Moon className="w-6 h-6" />}
                                            {t === 'auto' && <Globe className="w-6 h-6" />}
                                            <span className="text-sm font-medium capitalize">{t}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            onClick={handleSave}
                            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Simpan Perubahan
                        </motion.button>
                    </div>
                );

            case 'teaching':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Metode Pengajaran</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Auto-approve Attendance</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Otomatis setujui kehadiran mahasiswa</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Strict Grading Mode</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Gunakan sistem penilaian ketat</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <motion.button onClick={handleSave} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Simpan Perubahan
                        </motion.button>
                    </div>
                );

            case 'classManagement':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preferensi Kelas</h3>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-900 dark:text-white">Batas Keterlambatan (menit)</label>
                                <input type="number" defaultValue={15} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-900 dark:text-white">Minimum Kehadiran (%)</label>
                                <input type="number" defaultValue={75} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                            </div>
                        </div>
                        <motion.button onClick={handleSave} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Simpan Perubahan
                        </motion.button>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifikasi Email</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Kehadiran Baru</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi saat mahasiswa absen</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Pengajuan Izin</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi pengajuan izin/sakit</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <motion.button onClick={handleSave} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Simpan Perubahan
                        </motion.button>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privasi Data</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Profil Publik</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Tampilkan profil ke mahasiswa</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Analitik Anonim</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Izinkan pengumpulan data anonim</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <motion.button onClick={handleSave} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Simpan Perubahan
                        </motion.button>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keamanan Akun</h3>
                            <div className="space-y-3">
                                <motion.button className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-gray-900 dark:text-white">Ubah Password</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Perbarui password akun Anda</p>
                                </motion.button>
                                <motion.button className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Aktifkan autentikasi dua faktor</p>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                );

            case 'dataManagement':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manajemen Data</h3>
                            <div className="space-y-3">
                                <motion.button className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Download semua data Anda</p>
                                </motion.button>
                                <motion.button className="w-full p-4 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-red-600 dark:text-red-400">Hapus Akun</p>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70">Hapus akun dan semua data secara permanen</p>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            Pengaturan untuk kategori ini akan segera tersedia...
                        </p>
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <DosenLayout dosen={dosen}>
                <Head title="Pengaturan" />
                <div className="space-y-6 p-6">
                    <SkeletonGrid count={6} columns={2} />
                </div>
            </DosenLayout>
        );
    }

    const currentCategory = categoryInfo[activeCategory];

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Pengaturan" />

            <div className="space-y-6 p-6">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
                                >
                                    <SettingsIcon className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-emerald-100">Pengaturan</p>
                                    <h1 className="text-2xl font-bold">Kelola Preferensi Dosen</h1>
                                    <p className="text-sm text-emerald-100">Sesuaikan pengalaman mengajar Anda</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 backdrop-blur shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Reset</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                            <div className="space-y-2">
                                {Object.entries(categoryInfo).map(([key, info]) => (
                                    <motion.button
                                        key={key}
                                        onClick={() => setActiveCategory(key as DosenSettingsCategory)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                                            activeCategory === key
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                                        }`}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <info.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{info.title}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1"
                    >
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg min-h-[600px]">
                            {/* Category Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <motion.div 
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center shadow-lg`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <currentCategory.icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {currentCategory.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {currentCategory.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Saving Indicator */}
                            <AnimatePresence>
                                {isSaving && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                    >
                                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                                        <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Menyimpan...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-6 right-6 z-50"
                        >
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
                                {toast.type === 'success' ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                )}
                                <span className="text-gray-900 dark:text-white font-medium">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DosenLayout>
    );
}
