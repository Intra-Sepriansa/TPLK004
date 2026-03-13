import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    BookOpen,
    Bug,
    Camera,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    ExternalLink,
    FileText,
    HelpCircle,
    Lightbulb,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    QrCode,
    Search,
    Send,
    Settings,
    Shield,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

import helpIcon from '@/assets/admin/help-center/help.png';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqData: FAQItem[] = [
    // Absensi
    {
        category: 'absensi',
        question: 'Bagaimana cara membuat sesi absensi baru?',
        answer: 'Buka menu "Sesi Absen" di sidebar, klik tombol "+ Buat Sesi Baru", isi detail seperti mata kuliah, tanggal, waktu, dan durasi. Setelah selesai, klik "Simpan" lalu "Aktifkan" untuk memulai sesi.',
    },
    {
        category: 'absensi',
        question: 'Mengapa QR Code berubah terus?',
        answer: 'QR Code menggunakan token dinamis yang berubah setiap 30 detik untuk mencegah kecurangan. Mahasiswa tidak bisa menyebarkan screenshot QR karena token akan expired.',
    },
    {
        category: 'absensi',
        question: 'Bagaimana jika mahasiswa tidak bisa scan QR?',
        answer: 'Pastikan mahasiswa menggunakan aplikasi resmi dan memiliki koneksi internet. Jika masih gagal, admin dapat melakukan input manual melalui menu Live Monitor.',
    },
    {
        category: 'absensi',
        question: 'Apa perbedaan status Hadir, Terlambat, dan Alpha?',
        answer: 'Hadir: absen dalam waktu toleransi. Terlambat: absen setelah toleransi tapi sebelum sesi berakhir. Alpha: tidak absen sama sekali atau absen setelah sesi ditutup.',
    },
    {
        category: 'absensi',
        question: 'Bagaimana cara menutup sesi absensi?',
        answer: 'Buka detail sesi di menu "Sesi Absen", klik tombol "Tutup Sesi". Setelah ditutup, mahasiswa tidak bisa lagi melakukan absensi untuk sesi tersebut.',
    },

    // Keamanan
    {
        category: 'keamanan',
        question: 'Bagaimana sistem mendeteksi kecurangan?',
        answer: 'Sistem menggunakan multiple layer: token dinamis (cegah screenshot sharing), geofencing (validasi lokasi), device fingerprint (deteksi device sharing), dan AI face recognition (verifikasi identitas).',
    },
    {
        category: 'keamanan',
        question: 'Apa yang harus dilakukan jika terdeteksi kecurangan?',
        answer: 'Buka menu "Audit Keamanan", review detail event, verifikasi bukti, lalu ambil tindakan: batalkan absensi, blokir perangkat, atau laporkan ke pihak akademik.',
    },
    {
        category: 'keamanan',
        question: 'Bagaimana cara memblokir perangkat yang mencurigakan?',
        answer: 'Buka menu "Perangkat", cari perangkat yang ingin diblokir, klik tombol "Blokir". Perangkat yang diblokir tidak bisa digunakan untuk absensi.',
    },
    {
        category: 'keamanan',
        question: 'Apakah data mahasiswa aman?',
        answer: 'Ya, sistem menggunakan enkripsi end-to-end, backup otomatis, dan akses berbasis role. Data face encoding disimpan terpisah dari foto asli untuk privasi.',
    },

    // Mahasiswa
    {
        category: 'mahasiswa',
        question: 'Bagaimana cara menambah mahasiswa baru?',
        answer: 'Buka menu "Mahasiswa", klik "+ Tambah Mahasiswa" untuk input manual, atau gunakan "Import CSV" untuk menambah banyak mahasiswa sekaligus.',
    },
    {
        category: 'mahasiswa',
        question: 'Bagaimana format CSV untuk import mahasiswa?',
        answer: 'Format: nim,nama,email,kelas,angkatan. Contoh: 2024001,"Ahmad Fauzi",ahmad@student.unpam.ac.id,06TPLK004,2024. Pastikan NIM unik untuk setiap mahasiswa.',
    },
    {
        category: 'mahasiswa',
        question: 'Bagaimana cara reset password mahasiswa?',
        answer: 'Buka menu "Mahasiswa", cari mahasiswa yang bersangkutan, klik tombol "Reset Password". Password akan direset ke NIM mahasiswa.',
    },
    {
        category: 'mahasiswa',
        question: 'Apa yang terjadi jika mahasiswa 3x alpha?',
        answer: 'Sesuai aturan UNPAM, mahasiswa dengan 3x atau lebih alpha tidak diperbolehkan mengikuti UAS. Sistem akan otomatis menandai dan mengirim notifikasi.',
    },

    // Teknis
    {
        category: 'teknis',
        question: 'Sistem tidak bisa diakses, apa yang harus dilakukan?',
        answer: 'Cek koneksi internet, clear cache browser, atau coba browser lain. Jika masih bermasalah, hubungi tim IT atau lihat status server di halaman status.',
    },
    {
        category: 'teknis',
        question: 'Bagaimana cara export laporan ke PDF?',
        answer: 'Buka halaman laporan yang diinginkan (Rekap Kehadiran, Audit, dll), klik tombol "Export PDF" di pojok kanan atas. File akan otomatis terdownload.',
    },
    {
        category: 'teknis',
        question: 'Apakah sistem bisa diakses dari HP?',
        answer: 'Ya, sistem responsive dan bisa diakses dari browser HP. Namun untuk pengalaman terbaik, disarankan menggunakan laptop/PC.',
    },
    {
        category: 'teknis',
        question: 'Bagaimana cara mengubah pengaturan sistem?',
        answer: 'Buka menu "Pengaturan" di sidebar. Di sana Anda bisa mengatur toleransi keterlambatan, durasi token, zona geofence, dan pengaturan lainnya.',
    },
];

const categories = [
    { id: 'all', label: 'Semua', icon: HelpCircle },
    { id: 'absensi', label: 'Absensi', icon: QrCode },
    { id: 'keamanan', label: 'Keamanan', icon: Shield },
    { id: 'mahasiswa', label: 'Mahasiswa', icon: Users },
    { id: 'teknis', label: 'Teknis', icon: Settings },
];

const troubleshootingGuides = [
    {
        title: 'QR Code Tidak Bisa Di-scan',
        icon: QrCode,
        steps: [
            'Pastikan kamera HP mahasiswa berfungsi dengan baik',
            'Cek pencahayaan ruangan - hindari backlight',
            'Pastikan QR Code ditampilkan dengan ukuran cukup besar',
            'Coba regenerate token dengan klik tombol "Refresh"',
            'Jika masih gagal, gunakan input manual token',
        ],
    },
    {
        title: 'Face Recognition Gagal',
        icon: Camera,
        steps: [
            'Pastikan pencahayaan cukup dan merata',
            'Lepas kacamata hitam atau masker',
            'Posisikan wajah di tengah frame kamera',
            'Jika mahasiswa baru, pastikan sudah registrasi wajah',
            'Coba verifikasi manual jika AI terus gagal',
        ],
    },
    {
        title: 'Lokasi Tidak Terdeteksi',
        icon: MapPin,
        steps: [
            'Pastikan GPS HP mahasiswa aktif',
            'Berikan izin lokasi ke aplikasi/browser',
            'Coba di area terbuka untuk sinyal GPS lebih baik',
            'Periksa konfigurasi zona geofence di pengaturan',
            'Pertimbangkan memperbesar radius jika terlalu ketat',
        ],
    },
    {
        title: 'Sistem Lambat atau Error',
        icon: Bug,
        steps: [
            'Refresh halaman (Ctrl+F5 untuk hard refresh)',
            'Clear cache dan cookies browser',
            'Coba browser lain (Chrome, Firefox, Edge)',
            'Periksa koneksi internet',
            'Jika masih bermasalah, hubungi tim IT',
        ],
    },
];

const quickLinks = [
    {
        title: 'Panduan Admin',
        desc: 'Dokumentasi lengkap fitur sistem',
        icon: BookOpen,
        href: '/admin/panduan',
    },
    {
        title: 'Video Tutorial',
        desc: 'Panduan visual step-by-step',
        icon: Video,
        href: '#',
    },
    {
        title: 'Changelog',
        desc: 'Riwayat update dan fitur baru',
        icon: FileText,
        href: '#',
    },
    {
        title: 'Status Server',
        desc: 'Cek status layanan sistem',
        icon: Zap,
        href: '#',
    },
];

export default function AdminHelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const filteredFaq = faqData.filter((faq) => {
        const matchesCategory =
            activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch =
            searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSubmitContact = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setContactForm({ subject: '', message: '' });
            setTimeout(() => setSubmitSuccess(false), 3000);
        }, 1500);
    };

    return (
        <AppLayout>
            <Head title="Help Center" />

            {/* Advanced Background - Uang Kas Style */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-50 lg:rounded-tl-3xl dark:bg-black/80">
                <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
                <div className="absolute top-[40%] left-[20%] h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[80px]" />
            </div>

            <div className="scrollbar-hide relative z-10 mx-auto h-[calc(100vh-4rem)] max-w-7xl space-y-8 overflow-y-auto p-6">
                {/* Header - Advanced Animated Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -top-24 -right-24 m-0 h-72 w-72 rounded-full bg-white/10 p-0 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 m-0 h-72 w-72 rounded-full bg-white/10 p-0 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center md:gap-4">
                        <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left md:max-w-2xl">
                            <motion.div
                                className="relative flex h-24 w-24 shrink-0 sm:h-20 sm:w-20"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img
                                    src={helpIcon}
                                    alt="Help Center"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                            <div className="mt-1 flex-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm font-medium text-blue-100"
                                >
                                    Pusat Bantuan & Dukungan
                                </motion.p>
                                <motion.h1
                                    className="mb-2 text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Help Center
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-sm leading-relaxed text-indigo-50 sm:text-base"
                                >
                                    Temukan jawaban cepat untuk pertanyaan Anda,
                                    pelajari cara penggunaan sistem, atau
                                    hubungi tim support kami jika membutuhkan
                                    bantuan khusus.
                                </motion.p>
                            </div>
                        </div>

                        {/* Search Box */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="w-full shrink-0 md:w-auto md:min-w-[400px]"
                        >
                            <div className="group/search relative">
                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/search:text-indigo-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Cari pertanyaan atau topik..."
                                    className="w-full rounded-2xl border-0 bg-white/90 py-4 pr-4 pl-12 text-base text-slate-900 placeholder-slate-400 shadow-xl backdrop-blur transition-all focus:ring-4 focus:ring-white/30"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-4 md:grid-cols-4"
                >
                    {quickLinks.map((link, i) => (
                        <motion.a
                            key={i}
                            href={link.href}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl transition-all hover:border-indigo-500/30 hover:bg-white/60 hover:shadow-xl dark:bg-neutral-900/40 dark:hover:bg-neutral-800/60"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 shadow-sm transition-all group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white dark:text-indigo-400">
                                <link.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                    {link.title}
                                </h3>
                                <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                    {link.desc}
                                </p>
                            </div>
                            <ExternalLink className="ml-auto h-4 w-4 text-slate-400 opacity-0 transition-colors group-hover:text-indigo-500 group-hover:opacity-100" />
                        </motion.a>
                    ))}
                </motion.div>

                {/* Main Grid Layout */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: FAQ & Guides */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* FAQ Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="sticky top-0 z-10 border-b border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <HelpCircle className="h-6 w-6" />
                                        </div>
                                        <h2 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-slate-300">
                                            Pertanyaan Umum (FAQ)
                                        </h2>
                                    </div>

                                    {/* Category Filter Pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() =>
                                                    setActiveCategory(cat.id)
                                                }
                                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                    activeCategory === cat.id
                                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                        : 'border-white/20 bg-white/50 text-slate-600 hover:border-indigo-300 hover:bg-white dark:bg-black/20 dark:text-slate-300'
                                                }`}
                                            >
                                                <cat.icon className="h-3 w-3" />
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-white/10 dark:divide-white/5">
                                <AnimatePresence mode="wait">
                                    {filteredFaq.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-12 text-center"
                                        >
                                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                                <Search className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                                Tidak ditemukan
                                            </h3>
                                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                                                Tidak ada FAQ yang cocok dengan
                                                kata kunci "{searchQuery}"
                                            </p>
                                        </motion.div>
                                    ) : (
                                        filteredFaq.map((faq, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`group transition-colors ${
                                                    expandedFaq === i
                                                        ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                                        : 'hover:bg-white/30 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setExpandedFaq(
                                                            expandedFaq === i
                                                                ? null
                                                                : i,
                                                        )
                                                    }
                                                    className="flex w-full items-start gap-4 p-5 text-left"
                                                >
                                                    <div
                                                        className={`mt-0.5 rounded-lg p-2 transition-colors ${
                                                            expandedFaq === i
                                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                                : 'bg-slate-100 text-slate-500 group-hover:text-indigo-500 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        <HelpCircle className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className={`text-base font-semibold transition-colors ${
                                                                    expandedFaq ===
                                                                    i
                                                                        ? 'text-indigo-700 dark:text-indigo-300'
                                                                        : 'text-slate-800 dark:text-slate-200'
                                                                }`}
                                                            >
                                                                {faq.question}
                                                            </span>
                                                            <ChevronDown
                                                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedFaq === i ? 'rotate-180 text-indigo-500' : ''}`}
                                                            />
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedFaq ===
                                                                i && (
                                                                <motion.div
                                                                    initial={{
                                                                        height: 0,
                                                                        opacity: 0,
                                                                    }}
                                                                    animate={{
                                                                        height: 'auto',
                                                                        opacity: 1,
                                                                    }}
                                                                    exit={{
                                                                        height: 0,
                                                                        opacity: 0,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.3,
                                                                    }}
                                                                >
                                                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                                        {
                                                                            faq.answer
                                                                        }
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Troubleshooting Guides */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <Lightbulb className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-xl font-bold text-transparent dark:from-amber-400 dark:to-orange-400">
                                            Panduan Troubleshooting
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Solusi untuk masalah umum
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 p-6 md:grid-cols-2">
                                {troubleshootingGuides.map((guide, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className="overflow-hidden rounded-2xl border border-white/20 bg-white/50 shadow-sm transition-all hover:shadow-md dark:bg-black/30"
                                    >
                                        <button
                                            onClick={() =>
                                                setExpandedGuide(
                                                    expandedGuide === i
                                                        ? null
                                                        : i,
                                                )
                                            }
                                            className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/40 dark:hover:bg-white/5"
                                        >
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400">
                                                <guide.icon className="h-6 w-6" />
                                            </div>
                                            <span className="flex-1 font-bold text-slate-800 dark:text-slate-200">
                                                {guide.title}
                                            </span>
                                            <ChevronRight
                                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedGuide === i ? 'rotate-90 text-amber-500' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {expandedGuide === i && (
                                                <motion.div
                                                    initial={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        height: 'auto',
                                                        opacity: 1,
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                    }}
                                                    className="border-t border-white/10"
                                                >
                                                    <div className="bg-white/30 px-4 pt-2 pb-4 dark:bg-black/20">
                                                        <ol className="mt-2 space-y-3">
                                                            {guide.steps.map(
                                                                (step, j) => (
                                                                    <li
                                                                        key={j}
                                                                        className="flex gap-3 text-sm"
                                                                    >
                                                                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
                                                                            {j +
                                                                                1}
                                                                        </span>
                                                                        <span className="text-slate-600 dark:text-slate-300">
                                                                            {
                                                                                step
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ol>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Contact & Info */}
                    <div className="space-y-8">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="sticky top-6 overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="border-b border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Hubungi Support
                                    </h2>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmitContact}
                                className="space-y-5 p-6"
                            >
                                <AnimatePresence>
                                    {submitSuccess ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-900/20"
                                        >
                                            <div className="mb-4 flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                <CheckCircle className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                                                Pesan Terkirim!
                                            </h3>
                                            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                                                Tim support kami akan segera
                                                membalas email Anda dalam waktu
                                                24 jam.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Subjek Masalah
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactForm.subject}
                                                    onChange={(e) =>
                                                        setContactForm({
                                                            ...contactForm,
                                                            subject:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Contoh: Gagal Login"
                                                    className="w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Detail Pesan
                                                </label>
                                                <textarea
                                                    value={contactForm.message}
                                                    onChange={(e) =>
                                                        setContactForm({
                                                            ...contactForm,
                                                            message:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Jelaskan kendala Anda..."
                                                    rows={4}
                                                    className="w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        Kirim Pesan
                                                    </>
                                                )}
                                            </motion.button>
                                        </>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>

                        {/* Info Cards */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 }}
                                className="rounded-2xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-xl dark:bg-neutral-900/60"
                            >
                                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                    <Phone className="h-5 w-5 text-indigo-500" />{' '}
                                    Kontak Langsung
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/50 p-3 dark:bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">
                                                Email
                                            </span>
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            support@unpam.ac.id
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/50 p-3 dark:bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">
                                                Jam Kerja
                                            </span>
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            08:00 - 16:00
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 }}
                                className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 to-orange-50/90 p-6 shadow-lg backdrop-blur-xl dark:from-amber-900/20 dark:to-orange-900/20"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <AlertTriangle className="h-24 w-24 text-amber-600" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="mb-2 flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
                                        <Zap className="h-5 w-5 fill-amber-500 text-amber-600" />{' '}
                                        Urgent Support
                                    </h3>
                                    <p className="mb-4 text-sm text-amber-700 dark:text-amber-500">
                                        Untuk kendala sistem kritis yang
                                        menghambat proses absensi massal.
                                    </p>
                                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600">
                                        <Phone className="h-4 w-4" /> Hotline IT
                                        Support
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
