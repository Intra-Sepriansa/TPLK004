import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    LifeBuoy, Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone,
    Clock, CheckCircle, AlertTriangle, Info, HelpCircle, Zap, Shield, Users,
    QrCode, Camera, MapPin, Wallet, Trophy, FileBarChart, Settings, Bug,
    Lightbulb, ExternalLink, Send, Loader2, BookOpen, Video, FileText,
} from 'lucide-react';

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

            <div className="p-6 space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute right-20 bottom-10 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                <LifeBuoy className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-blue-100">Pusat Bantuan</p>
                                <h1 className="text-3xl font-bold">Help Center</h1>
                            </div>
                        </div>
                        <p className="text-blue-100 max-w-2xl mb-6">
                            Temukan jawaban untuk pertanyaan Anda, panduan troubleshooting, dan hubungi tim support jika membutuhkan bantuan lebih lanjut.
                        </p>
                        
                        {/* Search */}
                        <div className="relative max-w-xl">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari pertanyaan atau topik..."
                                className="w-full rounded-xl border-0 bg-white pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-lg focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-4 gap-4">
                    {quickLinks.map((link, i) => (
                        <a
                            key={i}
                            href={link.href}
                            className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md hover:border-blue-300 transition-all group"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <link.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-sm">{link.title}</h3>
                                <p className="text-xs text-muted-foreground">{link.desc}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 ml-auto text-slate-400 group-hover:text-blue-600" />
                        </a>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="h-6 w-6 text-blue-600" />
                            <h2 className="text-xl font-bold">Pertanyaan yang Sering Diajukan (FAQ)</h2>
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        activeCategory === cat.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y">
                        {filteredFaq.length === 0 ? (
                            <div className="p-8 text-center">
                                <HelpCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500">Tidak ada FAQ yang cocok dengan pencarian Anda</p>
                            </div>
                        ) : (
                            filteredFaq.map((faq, i) => (
                                <div key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-4 text-left"
                                    >
                                        <span className="font-medium pr-4">{faq.question}</span>
                                        <ChevronDown className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedFaq === i && (
                                        <div className="px-4 pb-4">
                                            <p className="text-muted-foreground bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Troubleshooting Guides */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-6 w-6 text-amber-500" />
                            <h2 className="text-xl font-bold">Panduan Troubleshooting</h2>
                        </div>
                        <p className="text-muted-foreground mt-1">Langkah-langkah untuk mengatasi masalah umum</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 p-6">
                        {troubleshootingGuides.map((guide, i) => (
                            <div key={i} className="rounded-xl border bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                                <button
                                    onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 flex-shrink-0">
                                        <guide.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium flex-1">{guide.title}</span>
                                    <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${expandedGuide === i ? 'rotate-90' : ''}`} />
                                </button>
                                {expandedGuide === i && (
                                    <div className="px-4 pb-4">
                                        <ol className="space-y-2">
                                            {guide.steps.map((step, j) => (
                                                <li key={j} className="flex gap-3 text-sm">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold flex-shrink-0">
                                                        {j + 1}
                                                    </span>
                                                    <span className="text-muted-foreground pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Form */}
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-6 w-6 text-emerald-500" />
                                <h2 className="text-xl font-bold">Hubungi Support</h2>
                            </div>
                            <p className="text-muted-foreground mt-1">Kirim pesan jika butuh bantuan lebih lanjut</p>
                        </div>
                        <form onSubmit={handleSubmitContact} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Subjek</label>
                                <input
                                    type="text"
                                    value={contactForm.subject}
                                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                                    placeholder="Masalah atau pertanyaan Anda"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Pesan</label>
                                <textarea
                                    value={contactForm.message}
                                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                    placeholder="Jelaskan masalah Anda secara detail..."
                                    rows={4}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Kirim Pesan
                                    </>
                                )}
                            </button>
                            {submitSuccess && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="text-sm">Pesan berhasil dikirim! Tim support akan menghubungi Anda.</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border bg-card shadow-sm p-6">
                            <h3 className="font-bold mb-4">Informasi Kontak</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">support@tplk004.unpam.ac.id</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telepon</p>
                                        <p className="font-medium">(021) 7412566 ext. 1234</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Jam Operasional</p>
                                        <p className="font-medium">Senin - Jumat, 08:00 - 16:00 WIB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-amber-800 dark:text-amber-300">Masalah Urgent?</h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                        Untuk masalah kritis yang mempengaruhi proses absensi, hubungi langsung tim IT di 
                                        <strong> 0812-XXXX-XXXX</strong> (WhatsApp).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6">
                            <div className="flex items-start gap-3">
                                <Info className="h-6 w-6 text-blue-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-blue-800 dark:text-blue-300">Tips</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                        Sebelum menghubungi support, pastikan Anda sudah mencoba langkah-langkah di panduan troubleshooting 
                                        dan menyiapkan informasi seperti screenshot error dan langkah yang sudah dilakukan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
