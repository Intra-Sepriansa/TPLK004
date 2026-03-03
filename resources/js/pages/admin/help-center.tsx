import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    LifeBuoy, Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone,
    Clock, CheckCircle, AlertTriangle, Info, HelpCircle, Zap, Shield, Users,
    QrCode, Camera, MapPin, Wallet, Trophy, FileBarChart, Settings, Bug,
    Lightbulb, ExternalLink, Send, Loader2, BookOpen, Video, FileText, Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import helpIcon from '@/assets/admin/help-center/help.png';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqData: FAQItem[] = [
    // Absensi
    { category: 'absensi', question: 'Bagaimana cara membuat sesi absensi baru?', answer: 'Buka menu "Sesi Absen" di sidebar, klik tombol "+ Buat Sesi Baru", isi detail seperti mata kuliah, tanggal, waktu, dan durasi. Setelah selesai, klik "Simpan" lalu "Aktifkan" untuk memulai sesi.' },
    { category: 'absensi', question: 'Mengapa QR Code berubah terus?', answer: 'QR Code menggunakan token dinamis yang berubah setiap 30 detik untuk mencegah kecurangan. Mahasiswa tidak bisa menyebarkan screenshot QR karena token akan expired.' },
    { category: 'absensi', question: 'Bagaimana jika mahasiswa tidak bisa scan QR?', answer: 'Pastikan mahasiswa menggunakan aplikasi resmi dan memiliki koneksi internet. Jika masih gagal, admin dapat melakukan input manual melalui menu Live Monitor.' },
    { category: 'absensi', question: 'Apa perbedaan status Hadir, Terlambat, dan Alpha?', answer: 'Hadir: absen dalam waktu toleransi. Terlambat: absen setelah toleransi tapi sebelum sesi berakhir. Alpha: tidak absen sama sekali atau absen setelah sesi ditutup.' },
    { category: 'absensi', question: 'Bagaimana cara menutup sesi absensi?', answer: 'Buka detail sesi di menu "Sesi Absen", klik tombol "Tutup Sesi". Setelah ditutup, mahasiswa tidak bisa lagi melakukan absensi untuk sesi tersebut.' },

    // Keamanan
    { category: 'keamanan', question: 'Bagaimana sistem mendeteksi kecurangan?', answer: 'Sistem menggunakan multiple layer: token dinamis (cegah screenshot sharing), geofencing (validasi lokasi), device fingerprint (deteksi device sharing), dan AI face recognition (verifikasi identitas).' },
    { category: 'keamanan', question: 'Apa yang harus dilakukan jika terdeteksi kecurangan?', answer: 'Buka menu "Audit Keamanan", review detail event, verifikasi bukti, lalu ambil tindakan: batalkan absensi, blokir perangkat, atau laporkan ke pihak akademik.' },
    { category: 'keamanan', question: 'Bagaimana cara memblokir perangkat yang mencurigakan?', answer: 'Buka menu "Perangkat", cari perangkat yang ingin diblokir, klik tombol "Blokir". Perangkat yang diblokir tidak bisa digunakan untuk absensi.' },
    { category: 'keamanan', question: 'Apakah data mahasiswa aman?', answer: 'Ya, sistem menggunakan enkripsi end-to-end, backup otomatis, dan akses berbasis role. Data face encoding disimpan terpisah dari foto asli untuk privasi.' },

    // Mahasiswa
    { category: 'mahasiswa', question: 'Bagaimana cara menambah mahasiswa baru?', answer: 'Buka menu "Mahasiswa", klik "+ Tambah Mahasiswa" untuk input manual, atau gunakan "Import CSV" untuk menambah banyak mahasiswa sekaligus.' },
    { category: 'mahasiswa', question: 'Bagaimana format CSV untuk import mahasiswa?', answer: 'Format: nim,nama,email,kelas,angkatan. Contoh: 2024001,"Ahmad Fauzi",ahmad@student.unpam.ac.id,06TPLK004,2024. Pastikan NIM unik untuk setiap mahasiswa.' },
    { category: 'mahasiswa', question: 'Bagaimana cara reset password mahasiswa?', answer: 'Buka menu "Mahasiswa", cari mahasiswa yang bersangkutan, klik tombol "Reset Password". Password akan direset ke NIM mahasiswa.' },
    { category: 'mahasiswa', question: 'Apa yang terjadi jika mahasiswa 3x alpha?', answer: 'Sesuai aturan UNPAM, mahasiswa dengan 3x atau lebih alpha tidak diperbolehkan mengikuti UAS. Sistem akan otomatis menandai dan mengirim notifikasi.' },

    // Teknis
    { category: 'teknis', question: 'Sistem tidak bisa diakses, apa yang harus dilakukan?', answer: 'Cek koneksi internet, clear cache browser, atau coba browser lain. Jika masih bermasalah, hubungi tim IT atau lihat status server di halaman status.' },
    { category: 'teknis', question: 'Bagaimana cara export laporan ke PDF?', answer: 'Buka halaman laporan yang diinginkan (Rekap Kehadiran, Audit, dll), klik tombol "Export PDF" di pojok kanan atas. File akan otomatis terdownload.' },
    { category: 'teknis', question: 'Apakah sistem bisa diakses dari HP?', answer: 'Ya, sistem responsive dan bisa diakses dari browser HP. Namun untuk pengalaman terbaik, disarankan menggunakan laptop/PC.' },
    { category: 'teknis', question: 'Bagaimana cara mengubah pengaturan sistem?', answer: 'Buka menu "Pengaturan" di sidebar. Di sana Anda bisa mengatur toleransi keterlambatan, durasi token, zona geofence, dan pengaturan lainnya.' },
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
    { title: 'Panduan Admin', desc: 'Dokumentasi lengkap fitur sistem', icon: BookOpen, href: '/admin/panduan' },
    { title: 'Video Tutorial', desc: 'Panduan visual step-by-step', icon: Video, href: '#' },
    { title: 'Changelog', desc: 'Riwayat update dan fitur baru', icon: FileText, href: '#' },
    { title: 'Status Server', desc: 'Cek status layanan sistem', icon: Zap, href: '#' },
];

export default function AdminHelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({ subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const filteredFaq = faqData.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = searchQuery === '' ||
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
            <div className="fixed inset-0 bg-slate-50 dark:bg-black/80 lg:rounded-tl-3xl z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[80px]" />
            </div>

            <div className="relative z-10 p-6 space-y-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
                {/* Header - Advanced Animated Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl p-0 m-0" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl p-0 m-0" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 z-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full md:max-w-2xl">
                            <motion.div
                                className="relative flex shrink-0 h-24 w-24 sm:h-20 sm:w-20"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img src={helpIcon} alt="Help Center" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                            </motion.div>
                            <div className="flex-1 mt-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-blue-100 font-medium"
                                >
                                    Pusat Bantuan & Dukungan
                                </motion.p>
                                <motion.h1
                                    className="text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-md mb-2"
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
                                    className="text-indigo-50 text-sm sm:text-base leading-relaxed"
                                >
                                    Temukan jawaban cepat untuk pertanyaan Anda, pelajari cara penggunaan sistem, atau hubungi tim support kami jika membutuhkan bantuan khusus.
                                </motion.p>
                            </div>
                        </div>

                        {/* Search Box */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="w-full md:w-auto md:min-w-[400px] shrink-0"
                        >
                            <div className="relative group/search">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Cari pertanyaan atau topik..."
                                    className="w-full rounded-2xl border-0 bg-white/90 backdrop-blur pl-12 pr-4 py-4 text-slate-900 placeholder-slate-400 shadow-xl focus:ring-4 focus:ring-white/30 transition-all text-base"
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
                    className="grid md:grid-cols-4 gap-4"
                >
                    {quickLinks.map((link, i) => (
                        <motion.a
                            key={i}
                            href={link.href}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 p-5 rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-indigo-500/30 hover:bg-white/60 dark:hover:bg-neutral-800/60 transition-all group cursor-pointer"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all shadow-sm">
                                <link.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{link.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{link.desc}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 ml-auto text-slate-400 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </motion.a>
                    ))}
                </motion.div>

                {/* Main Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: FAQ & Guides */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* FAQ Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                            <HelpCircle className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                                            Pertanyaan Umum (FAQ)
                                        </h2>
                                    </div>

                                    {/* Category Filter Pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${activeCategory === cat.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                                    : 'bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 border-white/20 hover:bg-white hover:border-indigo-300'
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
                                <AnimatePresence mode='wait'>
                                    {filteredFaq.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-12 text-center"
                                        >
                                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                                <Search className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Tidak ditemukan</h3>
                                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                                Tidak ada FAQ yang cocok dengan kata kunci "{searchQuery}"
                                            </p>
                                        </motion.div>
                                    ) : (
                                        filteredFaq.map((faq, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`transition-colors group ${expandedFaq === i
                                                    ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                                    : 'hover:bg-white/30 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                                    className="w-full flex items-start gap-4 p-5 text-left"
                                                >
                                                    <div className={`p-2 rounded-lg transition-colors mt-0.5 ${expandedFaq === i
                                                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:text-indigo-500'
                                                        }`}>
                                                        <HelpCircle className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`font-semibold text-base transition-colors ${expandedFaq === i
                                                                ? 'text-indigo-700 dark:text-indigo-300'
                                                                : 'text-slate-800 dark:text-slate-200'
                                                                }`}>
                                                                {faq.question}
                                                            </span>
                                                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedFaq === i ? 'rotate-180 text-indigo-500' : ''}`} />
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedFaq === i && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                                                        {faq.answer}
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
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                        <Lightbulb className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">Panduan Troubleshooting</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Solusi untuk masalah umum</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid md:grid-cols-2 gap-4">
                                {troubleshootingGuides.map((guide, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className="rounded-2xl border border-white/20 bg-white/50 dark:bg-black/30 overflow-hidden shadow-sm hover:shadow-md transition-all"
                                    >
                                        <button
                                            onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400 flex-shrink-0">
                                                <guide.icon className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 flex-1">{guide.title}</span>
                                            <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedGuide === i ? 'rotate-90 text-amber-500' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {expandedGuide === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/10"
                                                >
                                                    <div className="px-4 pb-4 pt-2 bg-white/30 dark:bg-black/20">
                                                        <ol className="space-y-3 mt-2">
                                                            {guide.steps.map((step, j) => (
                                                                <li key={j} className="flex gap-3 text-sm">
                                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold flex-shrink-0 shadow-sm mt-0.5">
                                                                        {j + 1}
                                                                    </span>
                                                                    <span className="text-slate-600 dark:text-slate-300">{step}</span>
                                                                </li>
                                                            ))}
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
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl overflow-hidden sticky top-6"
                        >
                            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hubungi Support</h2>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitContact} className="p-6 space-y-5">
                                <AnimatePresence>
                                    {submitSuccess ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800"
                                        >
                                            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                                                <CheckCircle className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Pesan Terkirim!</h3>
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                                                Tim support kami akan segera membalas email Anda dalam waktu 24 jam.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subjek Masalah</label>
                                                <input
                                                    type="text"
                                                    value={contactForm.subject}
                                                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                                                    placeholder="Contoh: Gagal Login"
                                                    className="w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all dark:bg-black/20 dark:text-white dark:border-white/10"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detail Pesan</label>
                                                <textarea
                                                    value={contactForm.message}
                                                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                                    placeholder="Jelaskan kendala Anda..."
                                                    rows={4}
                                                    className="w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all dark:bg-black/20 dark:text-white dark:border-white/10"
                                                    required
                                                />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 transition-all"
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
                                className="rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl p-6 shadow-lg"
                            >
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-indigo-500" /> Kontak Langsung
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">Email</span>
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-white">support@unpam.ac.id</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">Jam Kerja</span>
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-white">08:00 - 16:00</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 }}
                                className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <AlertTriangle className="h-24 w-24 text-amber-600" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                                        <Zap className="h-5 w-5 fill-amber-500 text-amber-600" /> Urgent Support
                                    </h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">
                                        Untuk kendala sistem kritis yang menghambat proses absensi massal.
                                    </p>
                                    <button className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                                        <Phone className="h-4 w-4" /> Hotline IT Support
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
