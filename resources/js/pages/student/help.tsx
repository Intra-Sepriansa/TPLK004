/**
 * Student Help Center Page - Advanced UI/UX
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    CheckCircle, 
    AlertCircle, 
    HelpCircle,
    MessageCircle,
    BookOpen,
    Lightbulb,
    Sparkles,
    Zap
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { HelpCenter } from '@/components/help';
import type { FAQCategory, TroubleshootingGuide, HelpFeedback } from '@/types/documentation';
import {
    getFAQCategories,
    getTroubleshootingGuides,
    getContactInfo,
    submitFeedback,
} from '@/lib/help-api';

type ToastType = { type: 'success' | 'error'; message: string } | null;

// Mock data untuk FAQ yang lebih detail
const mockFAQCategories: FAQCategory[] = [
    {
        id: 'absensi',
        name: 'Absensi',
        description: 'Pertanyaan seputar sistem absensi',
        icon: 'CheckCircle',
        items: [
            {
                id: 'faq-1',
                question: 'Bagaimana cara melakukan absensi?',
                answer: 'Untuk melakukan absensi, ikuti langkah berikut:\n\n1. Buka menu "Absen" di sidebar\n2. Pastikan Anda berada di lokasi yang sesuai (jika menggunakan GPS)\n3. Scan QR Code yang ditampilkan oleh dosen\n4. Tunggu konfirmasi bahwa absensi berhasil\n5. Anda akan menerima notifikasi jika absensi berhasil dicatat\n\nCatatan: Pastikan kamera dan lokasi device Anda aktif untuk proses absensi yang lancar.',
                category: 'absensi',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-2',
                question: 'Apa yang harus dilakukan jika QR Code tidak bisa di-scan?',
                answer: 'Jika mengalami masalah saat scan QR Code:\n\n1. Pastikan kamera device Anda berfungsi dengan baik\n2. Bersihkan lensa kamera dari debu atau sidik jari\n3. Pastikan pencahayaan cukup terang\n4. Jaga jarak yang tepat antara kamera dan QR Code (sekitar 15-20 cm)\n5. Pastikan QR Code tidak buram atau rusak\n6. Coba refresh halaman dan scan ulang\n\nJika masih bermasalah, hubungi dosen atau admin untuk bantuan lebih lanjut.',
                category: 'absensi',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-3',
                question: 'Berapa lama waktu yang tersedia untuk melakukan absensi?',
                answer: 'Waktu absensi ditentukan oleh dosen untuk setiap sesi perkuliahan:\n\n• Biasanya QR Code aktif selama 5-15 menit\n• Waktu mulai dihitung sejak dosen membuka sesi absensi\n• Setelah waktu habis, QR Code akan expired dan tidak bisa digunakan\n• Status keterlambatan akan tercatat jika absen setelah batas waktu yang ditentukan\n\nTips: Selalu datang tepat waktu dan lakukan absensi segera setelah QR Code ditampilkan.',
                category: 'absensi',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
        ],
    },
    {
        id: 'tugas',
        name: 'Tugas & Ujian',
        description: 'Informasi tentang pengumpulan tugas dan ujian',
        icon: 'FileText',
        items: [
            {
                id: 'faq-4',
                question: 'Bagaimana cara mengumpulkan tugas?',
                answer: 'Untuk mengumpulkan tugas, ikuti panduan berikut:\n\n1. Buka menu "Akademik" > "Tugas"\n2. Pilih tugas yang ingin dikumpulkan\n3. Klik tombol "Kumpulkan Tugas"\n4. Upload file tugas Anda (format yang didukung: PDF, DOC, DOCX, ZIP)\n5. Maksimal ukuran file: 10 MB\n6. Tambahkan catatan jika diperlukan\n7. Klik "Submit" untuk mengirim\n8. Anda akan menerima konfirmasi email setelah tugas berhasil dikumpulkan\n\nPerhatian: Pastikan mengumpulkan sebelum deadline untuk menghindari pengurangan nilai.',
                category: 'tugas',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-5',
                question: 'Apakah bisa mengumpulkan tugas setelah deadline?',
                answer: 'Kebijakan pengumpulan tugas terlambat:\n\n• Sistem masih menerima pengumpulan setelah deadline\n• Namun akan ada penalti pengurangan nilai sesuai kebijakan dosen\n• Biasanya pengurangan 10-20% per hari keterlambatan\n• Beberapa dosen mungkin tidak menerima tugas terlambat sama sekali\n• Status "Terlambat" akan tercatat di sistem\n\nSaran: Selalu kumpulkan tugas sebelum deadline. Jika ada kendala, hubungi dosen untuk meminta perpanjangan waktu.',
                category: 'tugas',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-6',
                question: 'Bagaimana cara melihat nilai tugas yang sudah dikumpulkan?',
                answer: 'Untuk melihat nilai tugas:\n\n1. Buka menu "Akademik" > "Tugas"\n2. Pilih tab "Riwayat" atau "Sudah Dikumpulkan"\n3. Klik pada tugas yang ingin dilihat nilainya\n4. Nilai akan ditampilkan jika dosen sudah melakukan penilaian\n5. Anda juga bisa melihat feedback dari dosen\n6. Notifikasi akan dikirim ketika nilai sudah tersedia\n\nCatatan: Waktu penilaian tergantung pada dosen, biasanya 3-7 hari setelah deadline.',
                category: 'tugas',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
        ],
    },
    {
        id: 'akun',
        name: 'Akun & Profil',
        description: 'Pengaturan akun dan profil mahasiswa',
        icon: 'User',
        items: [
            {
                id: 'faq-7',
                question: 'Bagaimana cara mengubah password?',
                answer: 'Untuk mengubah password akun Anda:\n\n1. Klik foto profil di pojok kanan atas\n2. Pilih "Profil" dari dropdown menu\n3. Scroll ke bagian "Keamanan"\n4. Klik tombol "Ubah Password"\n5. Masukkan password lama Anda\n6. Masukkan password baru (minimal 8 karakter, kombinasi huruf dan angka)\n7. Konfirmasi password baru\n8. Klik "Simpan Perubahan"\n\nTips Keamanan:\n• Gunakan password yang kuat dan unik\n• Jangan gunakan password yang sama dengan akun lain\n• Ubah password secara berkala (setiap 3-6 bulan)\n• Jangan bagikan password kepada siapapun',
                category: 'akun',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-8',
                question: 'Bagaimana jika lupa password?',
                answer: 'Jika lupa password, ikuti langkah recovery berikut:\n\n1. Di halaman login, klik "Lupa Password?"\n2. Masukkan email atau NIM yang terdaftar\n3. Klik "Kirim Link Reset"\n4. Cek email Anda (termasuk folder spam)\n5. Klik link reset password dalam email\n6. Masukkan password baru Anda\n7. Konfirmasi password baru\n8. Klik "Reset Password"\n9. Login dengan password baru\n\nCatatan:\n• Link reset berlaku selama 1 jam\n• Jika tidak menerima email, cek folder spam atau hubungi admin\n• Pastikan email yang terdaftar masih aktif',
                category: 'akun',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
        ],
    },
    {
        id: 'notifikasi',
        name: 'Notifikasi',
        description: 'Pengaturan dan informasi notifikasi',
        icon: 'Bell',
        items: [
            {
                id: 'faq-9',
                question: 'Bagaimana cara mengatur notifikasi?',
                answer: 'Untuk mengatur preferensi notifikasi:\n\n1. Buka menu "Pengaturan"\n2. Pilih tab "Notifikasi"\n3. Atur jenis notifikasi yang ingin diterima:\n   • Notifikasi Tugas Baru\n   • Reminder Deadline\n   • Pengumuman Kelas\n   • Perubahan Jadwal\n   • Nilai Tugas\n4. Pilih metode notifikasi:\n   • Push Notification (di aplikasi)\n   • Email\n   • Keduanya\n5. Atur waktu pengiriman reminder\n6. Klik "Simpan Pengaturan"\n\nTips: Aktifkan notifikasi penting seperti deadline tugas dan perubahan jadwal.',
                category: 'notifikasi',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
        ],
    },
];

// Mock data untuk Troubleshooting yang lebih detail
const mockTroubleshootingGuides: TroubleshootingGuide[] = [
    {
        id: 'ts-1',
        title: 'QR Code Tidak Bisa Di-Scan',
        problem: 'Kamera tidak dapat membaca QR Code untuk absensi',
        symptoms: [
            'Kamera tidak fokus pada QR Code',
            'Muncul pesan error "QR Code tidak valid"',
            'Aplikasi freeze saat membuka kamera',
            'QR Code terdeteksi tapi tidak ada respon',
        ],
        solutions: [
            {
                step: 1,
                title: 'Periksa Izin Kamera',
                description: 'Pastikan aplikasi memiliki izin untuk mengakses kamera. Buka Pengaturan > Aplikasi > Izin > Kamera, dan aktifkan izin untuk aplikasi ini.',
                action: 'Buka Pengaturan Device',
            },
            {
                step: 2,
                title: 'Bersihkan Cache Aplikasi',
                description: 'Cache yang menumpuk dapat menyebabkan masalah. Buka Pengaturan > Aplikasi > Penyimpanan > Hapus Cache. Setelah itu, restart aplikasi.',
                action: 'Hapus Cache',
            },
            {
                step: 3,
                title: 'Periksa Koneksi Internet',
                description: 'Pastikan device terhubung ke internet yang stabil. QR Code memerlukan koneksi untuk verifikasi ke server. Coba gunakan WiFi jika sinyal mobile lemah.',
                action: 'Cek Koneksi',
            },
            {
                step: 4,
                title: 'Update Aplikasi',
                description: 'Pastikan Anda menggunakan versi aplikasi terbaru. Buka Play Store/App Store, cari aplikasi, dan klik Update jika tersedia.',
                action: 'Update Aplikasi',
            },
            {
                step: 5,
                title: 'Restart Device',
                description: 'Jika masalah masih berlanjut, coba restart device Anda. Ini akan me-refresh semua sistem dan mungkin menyelesaikan masalah.',
                action: 'Restart Device',
            },
        ],
        category: 'absensi',
        severity: 'medium',
        estimatedTime: '5-10 menit',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'ts-2',
        title: 'Gagal Upload File Tugas',
        problem: 'File tugas tidak bisa di-upload atau upload gagal di tengah jalan',
        symptoms: [
            'Progress upload berhenti di tengah jalan',
            'Muncul pesan "Upload Failed"',
            'File terlalu besar untuk di-upload',
            'Format file tidak didukung',
        ],
        solutions: [
            {
                step: 1,
                title: 'Periksa Ukuran File',
                description: 'Maksimal ukuran file adalah 10 MB. Jika file Anda lebih besar, kompres file terlebih dahulu menggunakan aplikasi kompresi atau kurangi kualitas gambar/video.',
                action: 'Kompres File',
            },
            {
                step: 2,
                title: 'Periksa Format File',
                description: 'Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, JPG, PNG. Pastikan file Anda dalam format yang benar.',
                action: 'Konversi Format',
            },
            {
                step: 3,
                title: 'Gunakan Koneksi Stabil',
                description: 'Upload memerlukan koneksi internet yang stabil. Gunakan WiFi jika memungkinkan. Hindari upload saat sinyal lemah atau tidak stabil.',
                action: 'Cek Koneksi',
            },
            {
                step: 4,
                title: 'Clear Browser Cache',
                description: 'Jika menggunakan web browser, clear cache dan cookies. Tekan Ctrl+Shift+Delete (Windows) atau Cmd+Shift+Delete (Mac), pilih cache dan cookies, lalu hapus.',
                action: 'Clear Cache',
            },
            {
                step: 5,
                title: 'Coba Browser Lain',
                description: 'Jika masalah berlanjut, coba gunakan browser lain (Chrome, Firefox, Edge, Safari). Beberapa browser mungkin memiliki kompatibilitas yang lebih baik.',
                action: 'Ganti Browser',
            },
        ],
        category: 'tugas',
        severity: 'high',
        estimatedTime: '10-15 menit',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'ts-3',
        title: 'Tidak Bisa Login ke Akun',
        problem: 'Gagal masuk ke akun meskipun password sudah benar',
        symptoms: [
            'Muncul pesan "Email atau password salah"',
            'Akun terkunci setelah beberapa kali percobaan',
            'Halaman login tidak merespon',
            'Redirect ke halaman error setelah login',
        ],
        solutions: [
            {
                step: 1,
                title: 'Periksa Caps Lock',
                description: 'Pastikan Caps Lock tidak aktif. Password bersifat case-sensitive, jadi "Password" berbeda dengan "password".',
                action: 'Cek Caps Lock',
            },
            {
                step: 2,
                title: 'Reset Password',
                description: 'Jika yakin password benar tapi tetap tidak bisa login, gunakan fitur "Lupa Password" untuk reset. Link reset akan dikirim ke email terdaftar.',
                action: 'Reset Password',
            },
            {
                step: 3,
                title: 'Tunggu Jika Akun Terkunci',
                description: 'Setelah 5 kali percobaan login gagal, akun akan terkunci selama 15 menit untuk keamanan. Tunggu hingga waktu lock berakhir.',
                action: 'Tunggu 15 Menit',
            },
            {
                step: 4,
                title: 'Clear Browser Data',
                description: 'Hapus cookies dan cache browser. Kadang data lama dapat menyebabkan konflik. Setelah clear, coba login kembali.',
                action: 'Clear Data',
            },
            {
                step: 5,
                title: 'Hubungi Admin',
                description: 'Jika semua cara di atas tidak berhasil, hubungi admin sistem melalui email atau WhatsApp untuk bantuan lebih lanjut.',
                action: 'Hubungi Admin',
            },
        ],
        category: 'akun',
        severity: 'high',
        estimatedTime: '5-20 menit',
        lastUpdated: new Date().toISOString(),
    },
    {
        id: 'ts-4',
        title: 'Notifikasi Tidak Muncul',
        problem: 'Tidak menerima notifikasi penting seperti deadline tugas atau pengumuman',
        symptoms: [
            'Tidak ada notifikasi push di device',
            'Email notifikasi tidak masuk',
            'Notifikasi terlambat diterima',
            'Badge notifikasi tidak update',
        ],
        solutions: [
            {
                step: 1,
                title: 'Periksa Pengaturan Notifikasi',
                description: 'Buka menu Pengaturan > Notifikasi. Pastikan semua jenis notifikasi yang penting sudah diaktifkan.',
                action: 'Buka Pengaturan',
            },
            {
                step: 2,
                title: 'Periksa Izin Notifikasi Device',
                description: 'Buka Pengaturan Device > Aplikasi > Notifikasi. Pastikan izin notifikasi untuk aplikasi ini sudah diaktifkan.',
                action: 'Cek Izin Device',
            },
            {
                step: 3,
                title: 'Periksa Email Spam',
                description: 'Notifikasi email mungkin masuk ke folder spam. Cek folder spam dan tandai email dari sistem sebagai "Not Spam".',
                action: 'Cek Spam',
            },
            {
                step: 4,
                title: 'Update Alamat Email',
                description: 'Pastikan alamat email di profil Anda masih aktif dan benar. Update jika perlu di menu Profil > Edit Profil.',
                action: 'Update Email',
            },
            {
                step: 5,
                title: 'Reinstall Aplikasi',
                description: 'Jika masalah berlanjut, coba uninstall dan install ulang aplikasi. Ini akan me-refresh semua pengaturan notifikasi.',
                action: 'Reinstall App',
            },
        ],
        category: 'notifikasi',
        severity: 'medium',
        estimatedTime: '10-15 menit',
        lastUpdated: new Date().toISOString(),
    },
];

export default function StudentHelp() {
    const { auth } = usePage().props as { auth: { user: { email: string } } };
    const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
    const [troubleshootingGuides, setTroubleshootingGuides] = useState<TroubleshootingGuide[]>([]);
    const [contactInfo, setContactInfo] = useState<{
        email: string;
        phone?: string;
        hours?: string;
        responseTime?: string;
    } | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<ToastType>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadHelpData();
    }, []);

    const loadHelpData = async () => {
        try {
            setIsLoading(true);
            const [faqs, troubleshooting, contact] = await Promise.all([
                getFAQCategories().catch(() => []),
                getTroubleshootingGuides().catch(() => []),
                getContactInfo().catch(() => undefined),
            ]);
            
            // Use mock data as fallback if API returns empty or invalid data
            const validFaqs = Array.isArray(faqs) && faqs.length > 0 ? faqs : mockFAQCategories;
            const validTroubleshooting = Array.isArray(troubleshooting) && troubleshooting.length > 0 
                ? troubleshooting 
                : mockTroubleshootingGuides;
            
            setFaqCategories(validFaqs);
            setTroubleshootingGuides(validTroubleshooting);
            setContactInfo(contact || {
                email: 'support@example.com',
                phone: '+62 812-3456-7890',
                hours: 'Senin - Jumat, 08:00 - 17:00 WIB',
                responseTime: '1-2 hari kerja',
            });
        } catch (error) {
            console.error('Error loading help data:', error);
            showToast('error', 'Gagal memuat data bantuan, menggunakan data default');
            // Use mock data as fallback on error
            setFaqCategories(mockFAQCategories);
            setTroubleshootingGuides(mockTroubleshootingGuides);
            setContactInfo({
                email: 'support@example.com',
                phone: '+62 812-3456-7890',
                hours: 'Senin - Jumat, 08:00 - 17:00 WIB',
                responseTime: '1-2 hari kerja',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitFeedback = async (feedback: HelpFeedback) => {
        try {
            const result = await submitFeedback(feedback);
            showToast('success', 'Feedback berhasil dikirim');
            return result;
        } catch {
            showToast('error', 'Gagal mengirim feedback');
            throw new Error('Failed to submit feedback');
        }
    };

    if (isLoading) {
        return (
            <StudentLayout>
                <Head title="Bantuan" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl">
                        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <HelpCircle className="h-10 w-10" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-teal-100 font-medium">Bantuan</p>
                                    <h1 className="text-3xl font-bold">Memuat...</h1>
                                    <p className="text-sm text-teal-100 mt-1">Mohon tunggu sebentar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <Head title="Bantuan" />

            <div className="space-y-6 p-6">
                {/* Header Card with advanced animations */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated background orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                        />
                    </div>

                    {/* Floating icons */}
                    {[HelpCircle, MessageCircle, BookOpen, Lightbulb, Sparkles].map((Icon, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/20"
                            initial={{ y: 0 }}
                            animate={{
                                y: [0, -20, 0],
                                x: [0, Math.sin(i) * 10, 0],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2,
                            }}
                            style={{
                                left: `${15 + i * 18}%`,
                                top: `${20 + (i % 2) * 40}%`,
                            }}
                        >
                            <Icon className="w-8 h-8" />
                        </motion.div>
                    ))}

                    {/* Large floating icons in background */}
                    <motion.div
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10"
                        animate={{
                            rotateY: [0, 360],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <HelpCircle className="w-32 h-32" strokeWidth={1} />
                    </motion.div>
                    
                    <motion.div
                        className="absolute left-8 bottom-8 text-white/10"
                        animate={{
                            rotateY: [360, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <BookOpen className="w-24 h-24" strokeWidth={1} />
                    </motion.div>
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ 
                                        scale: 1.1, 
                                        rotate: 360,
                                        boxShadow: "0 0 30px rgba(255,255,255,0.5)"
                                    }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl"
                                >
                                    <HelpCircle className="h-10 w-10" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-teal-100 font-medium flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Bantuan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Help Center
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-teal-100 mt-1"
                                    >
                                        Temukan jawaban dan dapatkan dukungan yang Anda butuhkan
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className="px-4 py-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <HelpCenter
                        faqCategories={faqCategories}
                        troubleshootingGuides={troubleshootingGuides}
                        contactInfo={contactInfo}
                        userEmail={auth?.user?.email}
                        onSubmitFeedback={handleSubmitFeedback}
                    />
                </motion.div>

                {/* Toast Notification with enhanced animation */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, y: 50, scale: 0.8, rotate: 5 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                            }}
                            className="fixed bottom-8 right-8 z-50"
                        >
                            <motion.div 
                                className="relative overflow-hidden flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-black border-2 shadow-2xl min-w-[300px]"
                                style={{
                                    borderColor: toast.type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Animated background gradient */}
                                <motion.div
                                    className={`absolute inset-0 ${
                                        toast.type === 'success' 
                                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                            : 'bg-gradient-to-r from-red-500/10 to-rose-500/10'
                                    }`}
                                    animate={{
                                        x: ['-100%', '200%'],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                                
                                {/* Icon with animation */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15,
                                        delay: 0.1
                                    }}
                                >
                                    {toast.type === 'success' ? (
                                        <div className="relative">
                                            <CheckCircle className="h-6 w-6 text-green-500 relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-green-500 rounded-full blur-md"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 0.2, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <AlertCircle className="h-6 w-6 text-red-500 relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-red-500 rounded-full blur-md"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 0.2, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                                
                                <motion.span 
                                    className="text-gray-900 dark:text-white font-semibold relative z-10"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {toast.message}
                                </motion.span>

                                {/* Progress bar */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-1 ${
                                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 3, ease: "linear" }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
