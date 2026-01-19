import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import {
    BookOpen, ChevronRight, Search, CheckCircle, AlertTriangle, Info,
    Users, CalendarCheck, QrCode, Radar, Camera, ScanFace, MapPin, Clock,
    ClipboardList, Wallet, Trophy, Settings, FileBarChart, BarChart3, ShieldCheck,
    ScrollText, Zap, Shield, Bell, Database, Lock, Smartphone, Globe,
    ArrowRight, Copy, Check, Star, Lightbulb, Download, Upload, RefreshCw,
    Eye, Trash2, Plus, Pencil, FileText, Mail, Key, Server, Cpu, HardDrive,
    Wifi, AlertCircle, TrendingUp, Award, Target, Layers, Terminal, Code,
} from 'lucide-react';

const chapters = [
    {
        id: 'getting-started',
        title: 'Memulai',
        icon: Zap,
        color: 'from-emerald-500 to-teal-500',
        sections: [
            { id: 'overview', title: 'Gambaran Umum Sistem' },
            { id: 'first-login', title: 'Login Pertama Kali' },
            { id: 'dashboard-tour', title: 'Tour Dashboard' },
            { id: 'quick-setup', title: 'Setup Cepat' },
        ],
    },
    {
        id: 'attendance',
        title: 'Manajemen Absensi',
        icon: CalendarCheck,
        color: 'from-blue-500 to-indigo-500',
        sections: [
            { id: 'create-session', title: 'Membuat Sesi Absen' },
            { id: 'qr-code', title: 'QR Code & Token' },
            { id: 'live-monitor', title: 'Live Monitoring' },
            { id: 'ai-attendance', title: 'Absensi AI (Face Recognition)' },
            { id: 'selfie-verify', title: 'Verifikasi Selfie' },
            { id: 'geofencing', title: 'Zona & Geofencing' },
        ],
    },
    {
        id: 'management',
        title: 'Manajemen Data',
        icon: Database,
        color: 'from-purple-500 to-pink-500',
        sections: [
            { id: 'students', title: 'Kelola Mahasiswa' },
            { id: 'devices', title: 'Kelola Perangkat' },
            { id: 'schedule', title: 'Kelola Jadwal' },
            { id: 'tasks', title: 'Informasi Tugas' },
            { id: 'kas', title: 'Uang Kas' },
            { id: 'leaderboard', title: 'Leaderboard & Gamifikasi' },
        ],
    },
    {
        id: 'reports',
        title: 'Laporan & Analytics',
        icon: BarChart3,
        color: 'from-amber-500 to-orange-500',
        sections: [
            { id: 'attendance-report', title: 'Rekap Kehadiran' },
            { id: 'analytics', title: 'Analytics & Prediksi' },
            { id: 'audit', title: 'Audit Keamanan' },
            { id: 'activity-log', title: 'Log Aktivitas' },
        ],
    },
    {
        id: 'security',
        title: 'Keamanan & Pengaturan',
        icon: Shield,
        color: 'from-red-500 to-rose-500',
        sections: [
            { id: 'security-settings', title: 'Pengaturan Keamanan' },
            { id: 'anti-cheat', title: 'Sistem Anti-Kecurangan' },
            { id: 'backup', title: 'Backup & Recovery' },
            { id: 'notifications', title: 'Notifikasi' },
        ],
    },
    {
        id: 'advanced',
        title: 'Fitur Lanjutan',
        icon: Star,
        color: 'from-cyan-500 to-blue-500',
        sections: [
            { id: 'bulk-operations', title: 'Operasi Massal' },
            { id: 'export-import', title: 'Export & Import Data' },
            { id: 'api-integration', title: 'Integrasi API' },
            { id: 'customization', title: 'Kustomisasi Sistem' },
        ],
    },
];

const contentData: Record<string, { title: string; content: React.ReactNode }> = {
    'overview': {
        title: 'Gambaran Umum Sistem',
        content: (
            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                        <Info className="h-5 w-5" /> Tentang TPLK004 Attendance System
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                        Sistem Absensi TPLK004 adalah platform manajemen kehadiran berbasis AI yang dirancang khusus untuk 
                        Fakultas Ilmu Komputer UNPAM. Sistem ini menggunakan teknologi pengenalan wajah, QR Code dinamis, 
                        dan geofencing untuk memastikan keakuratan dan keamanan data kehadiran.
                    </p>
                </div>
                <h4 className="font-semibold text-lg">Fitur Utama:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: QrCode, title: 'QR Code Dinamis', desc: 'Token QR yang berubah setiap 30 detik untuk mencegah kecurangan' },
                        { icon: Camera, title: 'Face Recognition', desc: 'Verifikasi wajah otomatis menggunakan AI untuk validasi identitas' },
                        { icon: MapPin, title: 'Geofencing', desc: 'Pembatasan lokasi absensi dalam radius tertentu dari kampus' },
                        { icon: Radar, title: 'Live Monitoring', desc: 'Pantau kehadiran secara real-time dengan dashboard interaktif' },
                        { icon: Shield, title: 'Anti-Cheat System', desc: 'Deteksi otomatis untuk token duplikat, lokasi palsu, dan kecurangan lainnya' },
                        { icon: Trophy, title: 'Gamifikasi', desc: 'Sistem poin, badge, dan leaderboard untuk meningkatkan motivasi' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" /> Aturan UNPAM
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                        Sesuai peraturan UNPAM, mahasiswa yang tidak hadir (Alpha) sebanyak <strong>3 kali atau lebih</strong> dalam 
                        satu mata kuliah <strong>tidak diperbolehkan mengikuti Ujian Akhir Semester (UAS)</strong>. 
                        Sistem ini akan secara otomatis menandai mahasiswa yang berisiko.
                    </p>
                </div>
            </div>
        ),
    },
    'first-login': {
        title: 'Login Pertama Kali',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Panduan langkah demi langkah untuk login pertama kali ke sistem admin.</p>
                <div className="space-y-4">
                    {[
                        { step: 1, title: 'Akses Halaman Login', desc: 'Buka browser dan akses URL sistem absensi yang diberikan oleh administrator IT. Gunakan browser modern seperti Chrome, Firefox, atau Edge untuk pengalaman terbaik.' },
                        { step: 2, title: 'Masukkan Kredensial', desc: 'Gunakan email dan password yang telah diberikan. Password default biasanya adalah NIP atau kombinasi yang ditentukan oleh admin IT.' },
                        { step: 3, title: 'Ganti Password', desc: 'Setelah login pertama, segera ganti password Anda melalui menu Profil untuk keamanan. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.' },
                        { step: 4, title: 'Lengkapi Profil', desc: 'Isi informasi profil seperti foto, nomor telepon, dan data lainnya untuk memudahkan identifikasi dan komunikasi.' },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold flex-shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5" /> Tips Keamanan
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Gunakan password yang kuat (minimal 8 karakter, kombinasi huruf, angka, simbol)</li>
                        <li>• Jangan bagikan kredensial login kepada siapapun</li>
                        <li>• Selalu logout setelah selesai menggunakan sistem</li>
                        <li>• Aktifkan notifikasi untuk mendapat alert aktivitas mencurigakan</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'dashboard-tour': {
        title: 'Tour Dashboard',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Dashboard adalah pusat kontrol utama sistem absensi. Berikut penjelasan setiap komponen:</p>
                <div className="space-y-4">
                    {[
                        { color: 'bg-blue-500', title: 'Statistik Utama (Header Cards)', items: ['Total Mahasiswa: Jumlah mahasiswa terdaftar dalam sistem', 'Sesi Aktif: Jumlah sesi absensi yang sedang berlangsung', 'Kehadiran Hari Ini: Persentase kehadiran pada hari ini', 'Pending Verifikasi: Selfie yang menunggu verifikasi manual'] },
                        { color: 'bg-emerald-500', title: 'Grafik Tren Kehadiran', items: ['Visualisasi tren kehadiran dalam periode tertentu', 'Filter berdasarkan harian, mingguan, atau bulanan', 'Identifikasi pola dan anomali kehadiran'] },
                        { color: 'bg-amber-500', title: 'Aktivitas Terkini', items: ['Feed real-time aktivitas terbaru', 'Absensi masuk dan keluar', 'Verifikasi selfie dan event keamanan'] },
                        { color: 'bg-red-500', title: 'Alert & Notifikasi', items: ['Mahasiswa berisiko (3x alpha)', 'Aktivitas mencurigakan', 'Reminder tugas admin'] },
                    ].map((section, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card">
                            <h5 className="font-semibold mb-3 flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${section.color}`}></div>
                                {section.title}
                            </h5>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
                                {section.items.map((item, j) => <li key={j}>• {item}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    'quick-setup': {
        title: 'Setup Cepat',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Ikuti langkah-langkah berikut untuk menyiapkan sistem dengan cepat:</p>
                <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500"></div>
                    <div className="space-y-6">
                        {[
                            { step: 1, title: 'Import Data Mahasiswa', desc: 'Upload file CSV berisi data mahasiswa (NIM, Nama, Email, dll). Sistem akan otomatis membuat akun untuk setiap mahasiswa.', time: '5 menit' },
                            { step: 2, title: 'Konfigurasi Zona Geofence', desc: 'Tentukan titik koordinat kampus dan radius yang diizinkan untuk absensi. Rekomendasi: 100-200 meter dari gedung kuliah.', time: '3 menit' },
                            { step: 3, title: 'Buat Jadwal Mata Kuliah', desc: 'Input jadwal perkuliahan termasuk hari, jam mulai, jam selesai, dan ruangan.', time: '10 menit' },
                            { step: 4, title: 'Atur Pengaturan Absensi', desc: 'Konfigurasi toleransi keterlambatan, durasi token QR, dan pengaturan verifikasi selfie.', time: '5 menit' },
                            { step: 5, title: 'Test Sistem', desc: 'Lakukan test absensi dengan akun mahasiswa dummy untuk memastikan semua fitur berjalan dengan baik.', time: '5 menit' },
                        ].map((item) => (
                            <div key={item.step} className="relative pl-12">
                                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-black border-4 border-blue-500 text-blue-600 font-bold">
                                    {item.step}
                                </div>
                                <div className="p-4 rounded-xl border bg-card">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-medium">{item.title}</h5>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">~{item.time}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    },

    'create-session': {
        title: 'Membuat Sesi Absen',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sesi absen adalah unit dasar untuk mencatat kehadiran. Setiap pertemuan kuliah memerlukan satu sesi absen.</p>
                <h4 className="font-semibold text-lg">Cara Membuat Sesi Absen:</h4>
                <div className="space-y-4">
                    {[
                        { title: '1. Akses Menu Sesi Absen', desc: 'Klik menu "Sesi Absen" di sidebar kiri, kemudian klik tombol "+ Buat Sesi Baru".' },
                        { title: '2. Isi Detail Sesi', desc: 'Pilih mata kuliah, tentukan tanggal & waktu, durasi sesi (default: 30 menit), toleransi terlambat (default: 15 menit), dan metode absensi.' },
                        { title: '3. Konfigurasi Keamanan', desc: 'Aktifkan wajib selfie, wajib geolokasi, dan deteksi perangkat untuk mencegah kecurangan.' },
                        { title: '4. Aktivasi Sesi', desc: 'Setelah sesi dibuat, klik tombol "Aktifkan" untuk memulai sesi. QR Code akan otomatis di-generate.' },
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card">
                            <h5 className="font-medium mb-2">{item.title}</h5>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5" /> Best Practice
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li>• Buat sesi 5-10 menit sebelum kelas dimulai</li>
                            <li>• Gunakan durasi 30-45 menit untuk fleksibilitas</li>
                            <li>• Aktifkan semua fitur keamanan</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5" /> Hindari
                        </h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li>• Jangan buat sesi terlalu jauh dari waktu kuliah</li>
                            <li>• Jangan nonaktifkan semua fitur keamanan</li>
                            <li>• Jangan lupa menutup sesi setelah selesai</li>
                        </ul>
                    </div>
                </div>
            </div>
        ),
    },
    'qr-code': {
        title: 'QR Code & Token',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem menggunakan QR Code dinamis dengan token yang berubah secara berkala untuk mencegah kecurangan.</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                        <Info className="h-5 w-5" /> Cara Kerja Token Dinamis
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Token QR berubah setiap <strong>30 detik</strong> secara otomatis. Ini mencegah mahasiswa 
                        menyebarkan screenshot QR Code kepada teman yang tidak hadir. Setiap token hanya valid 
                        untuk satu kali penggunaan per mahasiswa.
                    </p>
                </div>
                <h4 className="font-semibold text-lg">Menggunakan QR Builder:</h4>
                <div className="space-y-3">
                    {[
                        { title: 'Akses QR Builder', desc: 'Klik menu "QR Builder" di sidebar untuk membuka halaman generator QR Code.' },
                        { title: 'Pilih Sesi Aktif', desc: 'Pilih sesi absen yang sedang aktif dari dropdown. QR Code akan otomatis ditampilkan.' },
                        { title: 'Tampilkan di Layar', desc: 'Klik tombol "Fullscreen" untuk menampilkan QR Code di layar proyektor kelas.' },
                        { title: 'Regenerate Manual', desc: 'Jika diperlukan, klik "Regenerate" untuk membuat token baru secara manual.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">{i + 1}</div>
                            <div>
                                <h5 className="font-medium text-sm">{item.title}</h5>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="text-left py-2 px-4">Pengaturan</th>
                                <th className="text-left py-2 px-4">Default</th>
                                <th className="text-left py-2 px-4">Rekomendasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t"><td className="py-2 px-4">Interval Refresh</td><td className="py-2 px-4">30 detik</td><td className="py-2 px-4">30-60 detik</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Token Length</td><td className="py-2 px-4">8 karakter</td><td className="py-2 px-4">8-12 karakter</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Max Usage</td><td className="py-2 px-4">1x per mahasiswa</td><td className="py-2 px-4">1x (jangan diubah)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        ),
    },
    'live-monitor': {
        title: 'Live Monitoring',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Fitur Live Monitor memungkinkan Anda memantau kehadiran secara real-time saat sesi absensi berlangsung.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Eye, title: 'Real-time Updates', desc: 'Data kehadiran diperbarui secara otomatis setiap beberapa detik tanpa perlu refresh halaman.' },
                        { icon: Users, title: 'Daftar Hadir', desc: 'Lihat siapa saja yang sudah absen, waktu absen, dan status verifikasi mereka.' },
                        { icon: MapPin, title: 'Peta Lokasi', desc: 'Visualisasi lokasi mahasiswa saat absen pada peta interaktif.' },
                        { icon: AlertCircle, title: 'Alert Kecurangan', desc: 'Notifikasi instan jika terdeteksi aktivitas mencurigakan.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-black text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Cara Menggunakan Live Monitor:</h4>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">1. Akses Menu Live Monitor</h5>
                        <p className="text-sm text-muted-foreground">Klik menu "Live Monitor" di sidebar. Halaman akan menampilkan semua sesi yang sedang aktif.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">2. Pilih Sesi untuk Dipantau</h5>
                        <p className="text-sm text-muted-foreground">Klik pada sesi yang ingin dipantau. Dashboard monitoring akan terbuka dengan data real-time.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">3. Pantau Statistik</h5>
                        <p className="text-sm text-muted-foreground">Lihat jumlah hadir, terlambat, dan belum hadir. Grafik akan update secara otomatis.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">4. Tindak Lanjut Alert</h5>
                        <p className="text-sm text-muted-foreground">Jika ada alert kecurangan, klik untuk melihat detail dan ambil tindakan yang diperlukan.</p>
                    </div>
                </div>
            </div>
        ),
    },
    'ai-attendance': {
        title: 'Absensi AI (Face Recognition)',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem Face Recognition menggunakan teknologi AI untuk memverifikasi identitas mahasiswa secara otomatis.</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-2">
                        <Camera className="h-5 w-5" /> Teknologi yang Digunakan
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sistem menggunakan algoritma deep learning untuk mendeteksi dan mencocokkan wajah. 
                        Akurasi mencapai 99.5% dalam kondisi pencahayaan normal. Proses verifikasi hanya membutuhkan 1-2 detik.
                    </p>
                </div>
                <h4 className="font-semibold text-lg">Cara Kerja:</h4>
                <div className="space-y-3">
                    {[
                        { step: 1, title: 'Registrasi Wajah', desc: 'Mahasiswa mendaftarkan wajah mereka saat pertama kali menggunakan sistem. Sistem akan menyimpan encoding wajah (bukan foto asli) untuk keamanan.' },
                        { step: 2, title: 'Capture Saat Absen', desc: 'Saat absen, mahasiswa mengambil foto selfie melalui aplikasi. Kamera akan otomatis mendeteksi wajah.' },
                        { step: 3, title: 'Verifikasi AI', desc: 'Sistem membandingkan wajah yang di-capture dengan data yang tersimpan. Jika cocok, absensi dicatat otomatis.' },
                        { step: 4, title: 'Fallback Manual', desc: 'Jika verifikasi gagal (pencahayaan buruk, dll), admin dapat melakukan verifikasi manual.' },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex-shrink-0">{item.step}</div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5" /> Tips untuk Hasil Optimal
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Pastikan pencahayaan cukup saat registrasi dan absen</li>
                        <li>• Hindari penggunaan kacamata hitam atau masker saat verifikasi</li>
                        <li>• Posisikan wajah di tengah frame kamera</li>
                        <li>• Update foto registrasi jika ada perubahan signifikan pada penampilan</li>
                    </ul>
                </div>
            </div>
        ),
    },

    'selfie-verify': {
        title: 'Verifikasi Selfie',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Verifikasi selfie adalah lapisan keamanan tambahan untuk memastikan mahasiswa benar-benar hadir di lokasi.</p>
                <h4 className="font-semibold text-lg">Proses Verifikasi:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon: Camera, title: 'Capture', desc: 'Mahasiswa mengambil selfie saat absen', color: 'from-blue-500 to-cyan-500' },
                        { icon: Cpu, title: 'AI Analysis', desc: 'Sistem menganalisis keaslian foto', color: 'from-purple-500 to-pink-500' },
                        { icon: CheckCircle, title: 'Approval', desc: 'Admin memverifikasi jika diperlukan', color: 'from-emerald-500 to-teal-500' },
                    ].map((item, i) => (
                        <div key={i} className="text-center p-4 rounded-xl border bg-card">
                            <div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white mb-3`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Mengelola Verifikasi Pending:</h4>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Akses Menu Verifikasi Selfie</h5>
                        <p className="text-sm text-muted-foreground">Klik menu "Verifikasi Selfie" di sidebar. Anda akan melihat daftar selfie yang menunggu verifikasi manual.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Review Selfie</h5>
                        <p className="text-sm text-muted-foreground">Klik pada item untuk melihat detail. Bandingkan selfie dengan foto profil mahasiswa. Periksa metadata seperti waktu dan lokasi.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Approve atau Reject</h5>
                        <p className="text-sm text-muted-foreground">Klik "Approve" jika selfie valid, atau "Reject" jika terdeteksi kecurangan. Berikan alasan jika menolak.</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" /> Tanda-tanda Kecurangan
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Foto dari layar (screenshot foto orang lain)</li>
                        <li>• Pencahayaan tidak natural atau terlalu gelap</li>
                        <li>• Background tidak sesuai dengan lokasi kampus</li>
                        <li>• Wajah tidak jelas atau tertutup sebagian</li>
                        <li>• Metadata waktu tidak sesuai dengan sesi absen</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'geofencing': {
        title: 'Zona & Geofencing',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Geofencing membatasi area di mana mahasiswa dapat melakukan absensi, memastikan mereka benar-benar berada di kampus.</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" /> Cara Kerja Geofencing
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sistem menggunakan GPS perangkat mahasiswa untuk memvalidasi lokasi. Jika mahasiswa berada di luar 
                        radius yang ditentukan dari titik pusat kampus, absensi akan ditolak atau ditandai untuk review.
                    </p>
                </div>
                <h4 className="font-semibold text-lg">Konfigurasi Zona:</h4>
                <div className="space-y-3">
                    {[
                        { title: 'Akses Menu Zona', desc: 'Klik menu "Zona" di sidebar untuk membuka halaman konfigurasi geofencing.' },
                        { title: 'Tentukan Titik Pusat', desc: 'Klik pada peta atau masukkan koordinat manual untuk menentukan titik pusat kampus. Gunakan Google Maps untuk mendapatkan koordinat yang akurat.' },
                        { title: 'Atur Radius', desc: 'Tentukan radius dalam meter. Rekomendasi: 100-200 meter untuk gedung kuliah, 500 meter untuk area kampus keseluruhan.' },
                        { title: 'Simpan Konfigurasi', desc: 'Klik "Simpan" untuk menyimpan pengaturan. Perubahan akan berlaku untuk sesi absen berikutnya.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex-shrink-0">{i + 1}</div>
                            <div>
                                <h5 className="font-medium text-sm">{item.title}</h5>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="text-left py-2 px-4">Skenario</th>
                                <th className="text-left py-2 px-4">Radius Rekomendasi</th>
                                <th className="text-left py-2 px-4">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t"><td className="py-2 px-4">Ruang Kelas</td><td className="py-2 px-4">50-100 meter</td><td className="py-2 px-4">Untuk kelas dengan lokasi tetap</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Gedung Kuliah</td><td className="py-2 px-4">100-200 meter</td><td className="py-2 px-4">Untuk fleksibilitas antar ruangan</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Area Kampus</td><td className="py-2 px-4">300-500 meter</td><td className="py-2 px-4">Untuk kegiatan outdoor</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        ),
    },
    'students': {
        title: 'Kelola Mahasiswa',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Halaman Mahasiswa memungkinkan Anda mengelola data mahasiswa yang terdaftar dalam sistem.</p>
                <h4 className="font-semibold text-lg">Fitur Utama:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Plus, title: 'Tambah Mahasiswa', desc: 'Tambah mahasiswa baru secara manual atau import dari CSV' },
                        { icon: Pencil, title: 'Edit Data', desc: 'Update informasi mahasiswa seperti nama, email, atau kelas' },
                        { icon: Trash2, title: 'Hapus Mahasiswa', desc: 'Hapus mahasiswa yang sudah tidak aktif' },
                        { icon: Key, title: 'Reset Password', desc: 'Reset password mahasiswa yang lupa kredensial' },
                        { icon: Download, title: 'Export Data', desc: 'Download data mahasiswa dalam format PDF atau CSV' },
                        { icon: Upload, title: 'Import Massal', desc: 'Upload file CSV untuk menambah banyak mahasiswa sekaligus' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Format CSV untuk Import:</h4>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-sm overflow-x-auto">
                    <p>nim,nama,email,kelas,angkatan</p>
                    <p>2024001,"Ahmad Fauzi",ahmad@student.unpam.ac.id,06TPLK004,2024</p>
                    <p>2024002,"Budi Santoso",budi@student.unpam.ac.id,06TPLK004,2024</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" /> Penting
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• NIM harus unik untuk setiap mahasiswa</li>
                        <li>• Email akan digunakan untuk login dan notifikasi</li>
                        <li>• Password default adalah NIM mahasiswa</li>
                        <li>• Ingatkan mahasiswa untuk segera mengganti password</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'devices': {
        title: 'Kelola Perangkat',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem mencatat perangkat yang digunakan mahasiswa untuk absensi. Ini membantu mendeteksi kecurangan seperti absen dari perangkat yang sama.</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                        <Smartphone className="h-5 w-5" /> Informasi yang Dicatat
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Device ID (fingerprint unik perangkat)</li>
                        <li>• Jenis perangkat (Android/iOS/Web)</li>
                        <li>• Browser dan versi</li>
                        <li>• Waktu pertama dan terakhir digunakan</li>
                        <li>• IP Address</li>
                    </ul>
                </div>
                <h4 className="font-semibold text-lg">Mengelola Perangkat:</h4>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Lihat Daftar Perangkat</h5>
                        <p className="text-sm text-muted-foreground">Akses menu "Perangkat" untuk melihat semua perangkat yang terdaftar. Filter berdasarkan mahasiswa atau status.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Deteksi Anomali</h5>
                        <p className="text-sm text-muted-foreground">Sistem akan menandai jika satu perangkat digunakan oleh banyak mahasiswa atau jika mahasiswa berganti perangkat terlalu sering.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Blokir Perangkat</h5>
                        <p className="text-sm text-muted-foreground">Jika terdeteksi kecurangan, Anda dapat memblokir perangkat tertentu agar tidak bisa digunakan untuk absensi.</p>
                    </div>
                </div>
            </div>
        ),
    },

    'schedule': {
        title: 'Kelola Jadwal',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Halaman Jadwal memungkinkan Anda mengatur jadwal perkuliahan yang akan digunakan untuk membuat sesi absensi.</p>
                <h4 className="font-semibold text-lg">Membuat Jadwal Baru:</h4>
                <div className="space-y-3">
                    {[
                        { title: 'Pilih Mata Kuliah', desc: 'Pilih mata kuliah dari dropdown. Jika belum ada, buat terlebih dahulu di menu Mata Kuliah.' },
                        { title: 'Tentukan Hari', desc: 'Pilih hari perkuliahan (Senin-Sabtu). Satu mata kuliah bisa memiliki beberapa jadwal di hari berbeda.' },
                        { title: 'Atur Waktu', desc: 'Tentukan jam mulai dan jam selesai. Format 24 jam (contoh: 08:00 - 10:30).' },
                        { title: 'Pilih Ruangan', desc: 'Masukkan kode atau nama ruangan untuk referensi lokasi.' },
                        { title: 'Simpan Jadwal', desc: 'Klik "Simpan" untuk menyimpan jadwal. Jadwal akan otomatis tersedia saat membuat sesi absen.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-sm flex-shrink-0">{i + 1}</div>
                            <div>
                                <h5 className="font-medium text-sm">{item.title}</h5>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5" /> Tips
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Buat jadwal di awal semester untuk efisiensi</li>
                        <li>• Gunakan fitur duplikasi untuk jadwal yang mirip</li>
                        <li>• Update jadwal jika ada perubahan dari akademik</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'tasks': {
        title: 'Informasi Tugas',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Fitur Tugas memungkinkan dosen memberikan informasi tugas kepada mahasiswa dengan deadline dan diskusi.</p>
                <h4 className="font-semibold text-lg">Fitur Tugas:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Plus, title: 'Buat Tugas', desc: 'Tambah tugas baru dengan judul, deskripsi, dan deadline' },
                        { icon: FileText, title: 'Lampiran', desc: 'Upload file pendukung seperti PDF, gambar, atau dokumen' },
                        { icon: Clock, title: 'Deadline', desc: 'Atur tanggal dan waktu deadline pengumpulan' },
                        { icon: Mail, title: 'Notifikasi', desc: 'Mahasiswa mendapat notifikasi tugas baru dan reminder deadline' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Submission & Grading:</h4>
                <div className="p-4 rounded-xl border bg-card">
                    <p className="text-sm text-muted-foreground mb-3">Mahasiswa dapat mengumpulkan tugas melalui sistem. Dosen dapat memberikan nilai dan feedback:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Lihat daftar submission di halaman detail tugas</li>
                        <li>• Download file yang dikumpulkan mahasiswa</li>
                        <li>• Berikan nilai (0-100) dan komentar feedback</li>
                        <li>• Status: Pending, Graded, Late, Missing</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'kas': {
        title: 'Uang Kas',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Fitur Kas membantu mengelola uang kas kelas dengan transparansi dan akuntabilitas.</p>
                <h4 className="font-semibold text-lg">Fitur Utama:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Wallet, title: 'Catat Pembayaran', desc: 'Catat pembayaran kas dari setiap mahasiswa per pertemuan' },
                        { icon: TrendingUp, title: 'Laporan Keuangan', desc: 'Lihat ringkasan pemasukan, pengeluaran, dan saldo' },
                        { icon: Users, title: 'Status Pembayaran', desc: 'Pantau siapa yang sudah dan belum bayar' },
                        { icon: Bell, title: 'Reminder Otomatis', desc: 'Kirim pengingat ke mahasiswa yang belum bayar' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Voting Kas Demokratis:</h4>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sistem mendukung voting demokratis untuk keputusan penggunaan kas. Mahasiswa dapat mengusulkan 
                        dan memberikan suara untuk pengeluaran kas. Keputusan diambil berdasarkan suara mayoritas.
                    </p>
                </div>
            </div>
        ),
    },
    'leaderboard': {
        title: 'Leaderboard & Gamifikasi',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem gamifikasi meningkatkan motivasi mahasiswa melalui poin, badge, dan kompetisi sehat.</p>
                <h4 className="font-semibold text-lg">Komponen Gamifikasi:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Star, title: 'Poin', desc: 'Mahasiswa mendapat poin dari kehadiran, ketepatan waktu, dan aktivitas lainnya' },
                        { icon: Award, title: 'Badge', desc: 'Penghargaan khusus untuk pencapaian tertentu (Perfect Attendance, Early Bird, dll)' },
                        { icon: Trophy, title: 'Leaderboard', desc: 'Peringkat mahasiswa berdasarkan total poin' },
                        { icon: Target, title: 'Streak', desc: 'Bonus poin untuk kehadiran berturut-turut' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Sistem Poin:</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="text-left py-2 px-4">Aktivitas</th>
                                <th className="text-left py-2 px-4">Poin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t"><td className="py-2 px-4">Hadir tepat waktu</td><td className="py-2 px-4 text-emerald-600">+10</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Hadir terlambat</td><td className="py-2 px-4 text-amber-600">+5</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Streak 7 hari</td><td className="py-2 px-4 text-blue-600">+50 bonus</td></tr>
                            <tr className="border-t"><td className="py-2 px-4">Alpha (tidak hadir)</td><td className="py-2 px-4 text-red-600">-20</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        ),
    },
    'attendance-report': {
        title: 'Rekap Kehadiran',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Halaman Rekap Kehadiran menyediakan laporan komprehensif tentang kehadiran mahasiswa.</p>
                <h4 className="font-semibold text-lg">Fitur Laporan:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: FileBarChart, title: 'Rekap per Mahasiswa', desc: 'Lihat detail kehadiran setiap mahasiswa' },
                        { icon: CalendarCheck, title: 'Rekap per Mata Kuliah', desc: 'Statistik kehadiran per mata kuliah' },
                        { icon: Clock, title: 'Rekap per Periode', desc: 'Filter berdasarkan rentang tanggal' },
                        { icon: Download, title: 'Export PDF', desc: 'Download laporan dalam format PDF' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" /> Mahasiswa Berisiko
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sistem akan otomatis menandai mahasiswa dengan 3x atau lebih alpha. Mahasiswa ini berisiko 
                        tidak dapat mengikuti UAS sesuai peraturan UNPAM. Segera hubungi mahasiswa yang bersangkutan.
                    </p>
                </div>
            </div>
        ),
    },

    'analytics': {
        title: 'Analytics & Prediksi',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Halaman Analytics menyediakan insight mendalam dan prediksi berbasis AI tentang pola kehadiran.</p>
                <h4 className="font-semibold text-lg">Fitur Analytics:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: TrendingUp, title: 'Tren Kehadiran', desc: 'Visualisasi tren kehadiran dari waktu ke waktu' },
                        { icon: BarChart3, title: 'Distribusi Status', desc: 'Breakdown hadir, terlambat, izin, dan alpha' },
                        { icon: Target, title: 'Prediksi AI', desc: 'Prediksi mahasiswa yang berisiko berdasarkan pola' },
                        { icon: Users, title: 'Perbandingan Kelas', desc: 'Bandingkan performa antar kelas atau mata kuliah' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Prediksi AI:</h4>
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Sistem menggunakan machine learning untuk memprediksi mahasiswa yang berisiko berdasarkan:
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Pola kehadiran historis</li>
                        <li>• Frekuensi keterlambatan</li>
                        <li>• Tren penurunan kehadiran</li>
                        <li>• Perbandingan dengan rata-rata kelas</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'audit': {
        title: 'Audit Keamanan',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Halaman Audit menyediakan log keamanan dan deteksi aktivitas mencurigakan.</p>
                <h4 className="font-semibold text-lg">Jenis Event yang Dicatat:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: AlertCircle, title: 'Token Duplikat', desc: 'Penggunaan token yang sama oleh mahasiswa berbeda', color: 'text-red-500' },
                        { icon: MapPin, title: 'Lokasi Palsu', desc: 'Deteksi GPS spoofing atau lokasi tidak valid', color: 'text-amber-500' },
                        { icon: Smartphone, title: 'Device Sharing', desc: 'Satu perangkat digunakan banyak mahasiswa', color: 'text-orange-500' },
                        { icon: Clock, title: 'Waktu Anomali', desc: 'Absensi di luar jam yang wajar', color: 'text-purple-500' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 ${item.color} flex-shrink-0`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Tindak Lanjut:</h4>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Review Event</h5>
                        <p className="text-sm text-muted-foreground">Klik pada event untuk melihat detail lengkap termasuk bukti dan konteks.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Tandai sebagai Valid/Invalid</h5>
                        <p className="text-sm text-muted-foreground">Setelah investigasi, tandai event sebagai kecurangan terkonfirmasi atau false positive.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <h5 className="font-medium mb-2">Ambil Tindakan</h5>
                        <p className="text-sm text-muted-foreground">Batalkan absensi yang curang, blokir perangkat, atau hubungi mahasiswa yang bersangkutan.</p>
                    </div>
                </div>
            </div>
        ),
    },
    'activity-log': {
        title: 'Log Aktivitas',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Log Aktivitas mencatat semua tindakan yang dilakukan admin dalam sistem.</p>
                <h4 className="font-semibold text-lg">Aktivitas yang Dicatat:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon: Plus, title: 'Create', desc: 'Pembuatan data baru', color: 'bg-emerald-100 text-emerald-600' },
                        { icon: Pencil, title: 'Update', desc: 'Perubahan data', color: 'bg-blue-100 text-blue-600' },
                        { icon: Trash2, title: 'Delete', desc: 'Penghapusan data', color: 'bg-red-100 text-red-600' },
                    ].map((item, i) => (
                        <div key={i} className="text-center p-4 rounded-xl border bg-card">
                            <div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-xl ${item.color} mb-3`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Informasi yang Tersedia:</h4>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                    <li>• <strong>Waktu:</strong> Kapan aktivitas dilakukan</li>
                    <li>• <strong>User:</strong> Siapa yang melakukan</li>
                    <li>• <strong>Aksi:</strong> Jenis tindakan (create/update/delete)</li>
                    <li>• <strong>Model:</strong> Data apa yang diubah</li>
                    <li>• <strong>Nilai Lama & Baru:</strong> Detail perubahan</li>
                    <li>• <strong>IP Address:</strong> Dari mana akses dilakukan</li>
                </ul>
            </div>
        ),
    },
    'security-settings': {
        title: 'Pengaturan Keamanan',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Konfigurasi pengaturan keamanan untuk melindungi sistem dan data.</p>
                <h4 className="font-semibold text-lg">Pengaturan yang Tersedia:</h4>
                <div className="space-y-4">
                    {[
                        { title: 'Wajib Selfie', desc: 'Aktifkan untuk mewajibkan mahasiswa upload selfie saat absen', default: 'Aktif' },
                        { title: 'Wajib Geolokasi', desc: 'Aktifkan untuk memvalidasi lokasi mahasiswa', default: 'Aktif' },
                        { title: 'Deteksi Perangkat', desc: 'Cegah absen dari perangkat yang sama oleh mahasiswa berbeda', default: 'Aktif' },
                        { title: 'Token Refresh Interval', desc: 'Seberapa sering token QR berubah (dalam detik)', default: '30 detik' },
                        { title: 'Toleransi Keterlambatan', desc: 'Waktu toleransi sebelum dianggap terlambat', default: '15 menit' },
                        { title: 'Session Timeout', desc: 'Durasi sesi login sebelum auto-logout', default: '60 menit' },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl border bg-card">
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {item.default}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    'anti-cheat': {
        title: 'Sistem Anti-Kecurangan',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem dilengkapi berbagai mekanisme untuk mencegah dan mendeteksi kecurangan absensi.</p>
                <h4 className="font-semibold text-lg">Mekanisme Anti-Cheat:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: QrCode, title: 'Token Dinamis', desc: 'QR Code berubah setiap 30 detik, mencegah screenshot sharing' },
                        { icon: MapPin, title: 'Geofencing', desc: 'Validasi lokasi GPS, deteksi GPS spoofing' },
                        { icon: Camera, title: 'Face Recognition', desc: 'Verifikasi identitas dengan AI, deteksi foto dari layar' },
                        { icon: Smartphone, title: 'Device Fingerprint', desc: 'Identifikasi unik perangkat, deteksi device sharing' },
                        { icon: Clock, title: 'Time Validation', desc: 'Validasi waktu server, cegah manipulasi waktu device' },
                        { icon: Shield, title: 'Anomaly Detection', desc: 'AI mendeteksi pola mencurigakan secara otomatis' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" /> Sanksi Kecurangan
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Mahasiswa yang terbukti melakukan kecurangan absensi dapat dikenakan sanksi sesuai peraturan akademik, 
                        termasuk pembatalan kehadiran dan pelaporan ke pihak fakultas.
                    </p>
                </div>
            </div>
        ),
    },
    'backup': {
        title: 'Backup & Recovery',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem backup memastikan data Anda aman dan dapat dipulihkan jika terjadi masalah.</p>
                <h4 className="font-semibold text-lg">Jenis Backup:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: HardDrive, title: 'Database Backup', desc: 'Backup otomatis database setiap hari', schedule: 'Harian 02:00' },
                        { icon: FileText, title: 'File Backup', desc: 'Backup file upload (selfie, lampiran)', schedule: 'Mingguan' },
                        { icon: Server, title: 'Full System Backup', desc: 'Backup lengkap sistem dan konfigurasi', schedule: 'Bulanan' },
                        { icon: RefreshCw, title: 'Point-in-Time Recovery', desc: 'Kemampuan restore ke titik waktu tertentu', schedule: 'Real-time' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                <span className="text-xs text-blue-600">{item.schedule}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5" /> Retensi Data
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Backup harian disimpan selama 30 hari</li>
                        <li>• Backup mingguan disimpan selama 3 bulan</li>
                        <li>• Backup bulanan disimpan selama 1 tahun</li>
                    </ul>
                </div>
            </div>
        ),
    },
    'notifications': {
        title: 'Notifikasi',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Konfigurasi notifikasi untuk mendapat informasi penting secara real-time.</p>
                <h4 className="font-semibold text-lg">Jenis Notifikasi:</h4>
                <div className="space-y-3">
                    {[
                        { title: 'Alert Keamanan', desc: 'Notifikasi saat terdeteksi aktivitas mencurigakan', channel: 'Email, Push' },
                        { title: 'Mahasiswa Berisiko', desc: 'Alert saat mahasiswa mencapai 2x alpha', channel: 'Email' },
                        { title: 'Sesi Absen', desc: 'Reminder untuk membuat atau menutup sesi', channel: 'Push' },
                        { title: 'Verifikasi Pending', desc: 'Notifikasi selfie yang menunggu verifikasi', channel: 'Push' },
                        { title: 'Laporan Harian', desc: 'Ringkasan kehadiran harian', channel: 'Email' },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl border bg-card">
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {item.channel}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },

    'bulk-operations': {
        title: 'Operasi Massal',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Fitur operasi massal memungkinkan Anda melakukan tindakan pada banyak data sekaligus.</p>
                <h4 className="font-semibold text-lg">Operasi yang Tersedia:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Users, title: 'Bulk Import Mahasiswa', desc: 'Import ratusan mahasiswa dari file CSV sekaligus' },
                        { icon: CheckCircle, title: 'Bulk Approve Selfie', desc: 'Approve banyak selfie yang sudah diverifikasi AI' },
                        { icon: Wallet, title: 'Bulk Mark Paid', desc: 'Tandai pembayaran kas untuk banyak mahasiswa' },
                        { icon: Mail, title: 'Bulk Send Notification', desc: 'Kirim notifikasi ke banyak mahasiswa sekaligus' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex-shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" /> Perhatian
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Operasi massal tidak dapat di-undo. Pastikan Anda sudah mereview data dengan teliti sebelum melakukan operasi.
                    </p>
                </div>
            </div>
        ),
    },
    'export-import': {
        title: 'Export & Import Data',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Fitur export dan import memudahkan pertukaran data dengan sistem lain.</p>
                <h4 className="font-semibold text-lg">Format yang Didukung:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon: FileText, title: 'CSV', desc: 'Untuk spreadsheet dan database' },
                        { icon: FileText, title: 'PDF', desc: 'Untuk laporan dan dokumentasi' },
                        { icon: Code, title: 'JSON', desc: 'Untuk integrasi API' },
                    ].map((item, i) => (
                        <div key={i} className="text-center p-4 rounded-xl border bg-card">
                            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white mb-3">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <h4 className="font-semibold text-lg">Data yang Dapat Diekspor:</h4>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                    <li>• <strong>Mahasiswa:</strong> Daftar lengkap dengan NIM, nama, email, kelas</li>
                    <li>• <strong>Kehadiran:</strong> Rekap kehadiran per mahasiswa atau per mata kuliah</li>
                    <li>• <strong>Kas:</strong> Laporan keuangan kas kelas</li>
                    <li>• <strong>Audit:</strong> Log keamanan dan aktivitas</li>
                </ul>
            </div>
        ),
    },
    'api-integration': {
        title: 'Integrasi API',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sistem menyediakan API untuk integrasi dengan aplikasi atau sistem lain.</p>
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-black border">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5" /> Base URL
                    </h4>
                    <code className="text-sm bg-white dark:bg-slate-950 px-3 py-1 rounded">https://api.tplk004.unpam.ac.id/v1</code>
                </div>
                <h4 className="font-semibold text-lg">Endpoint yang Tersedia:</h4>
                <div className="space-y-3">
                    {[
                        { method: 'GET', endpoint: '/students', desc: 'Daftar mahasiswa' },
                        { method: 'GET', endpoint: '/attendance/sessions', desc: 'Daftar sesi absen' },
                        { method: 'POST', endpoint: '/attendance/check-in', desc: 'Submit absensi' },
                        { method: 'GET', endpoint: '/reports/attendance', desc: 'Laporan kehadiran' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card font-mono text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.method === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.method}
                            </span>
                            <code className="flex-1">{item.endpoint}</code>
                            <span className="text-muted-foreground text-xs">{item.desc}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-2">
                        <Key className="h-5 w-5" /> Autentikasi
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        API menggunakan Bearer Token untuk autentikasi. Hubungi administrator untuk mendapatkan API key.
                    </p>
                </div>
            </div>
        ),
    },
    'customization': {
        title: 'Kustomisasi Sistem',
        content: (
            <div className="space-y-6">
                <p className="text-muted-foreground">Sesuaikan tampilan dan perilaku sistem sesuai kebutuhan institusi Anda.</p>
                <h4 className="font-semibold text-lg">Opsi Kustomisasi:</h4>
                <div className="space-y-4">
                    {[
                        { title: 'Logo & Branding', desc: 'Ganti logo dan warna tema sesuai identitas institusi' },
                        { title: 'Pesan Notifikasi', desc: 'Kustomisasi template pesan email dan push notification' },
                        { title: 'Aturan Poin', desc: 'Sesuaikan sistem poin gamifikasi' },
                        { title: 'Toleransi Waktu', desc: 'Atur toleransi keterlambatan dan durasi sesi' },
                        { title: 'Zona Geofence', desc: 'Konfigurasi multiple zona untuk berbagai lokasi' },
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-card">
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                        <Info className="h-5 w-5" /> Bantuan Kustomisasi
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Untuk kustomisasi lanjutan yang tidak tersedia di panel admin, hubungi tim IT atau developer sistem.
                    </p>
                </div>
            </div>
        ),
    },
};

export default function AdminPanduan() {
    const [activeChapter, setActiveChapter] = useState('getting-started');
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);

    const currentChapter = chapters.find(c => c.id === activeChapter);
    const currentContent = contentData[activeSection];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href + `#${activeSection}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredChapters = searchQuery
        ? chapters.map(chapter => ({
            ...chapter,
            sections: chapter.sections.filter(section =>
                section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contentData[section.id]?.title.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter(chapter => chapter.sections.length > 0)
        : chapters;

    return (
        <AppLayout>
            <Head title="Panduan Admin" />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar Navigation */}
                <div className="w-80 border-r bg-slate-50/50 dark:bg-black/50 overflow-y-auto flex-shrink-0">
                    <div className="p-4 border-b sticky top-0 bg-slate-50/95 dark:bg-black/95 backdrop-blur z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h1 className="text-lg font-bold">Panduan Admin</h1>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari panduan..."
                                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {filteredChapters.map(chapter => {
                            const Icon = chapter.icon;
                            const isActive = chapter.id === activeChapter;
                            return (
                                <div key={chapter.id}>
                                    <button
                                        onClick={() => {
                                            setActiveChapter(chapter.id);
                                            if (chapter.sections.length > 0) {
                                                setActiveSection(chapter.sections[0].id);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            isActive
                                                ? `bg-gradient-to-r ${chapter.color} text-white shadow-lg`
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{chapter.title}</span>
                                        <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
                                    </button>
                                    {isActive && (
                                        <div className="mt-2 ml-4 space-y-1">
                                            {chapter.sections.map(section => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => setActiveSection(section.id)}
                                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                                                        activeSection === section.id
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    {section.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-8">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <span>Panduan</span>
                            <ChevronRight className="h-4 w-4" />
                            <span>{currentChapter?.title}</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-foreground font-medium">{currentContent?.title}</span>
                        </div>

                        {/* Content Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold">{currentContent?.title}</h2>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                            >
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Tersalin!' : 'Salin Link'}
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            {currentContent?.content}
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between mt-12 pt-8 border-t">
                            {(() => {
                                const allSections = chapters.flatMap(c => c.sections.map(s => ({ ...s, chapterId: c.id })));
                                const currentIndex = allSections.findIndex(s => s.id === activeSection);
                                const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
                                const nextSection = currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

                                return (
                                    <>
                                        {prevSection ? (
                                            <button
                                                onClick={() => {
                                                    setActiveChapter(prevSection.chapterId);
                                                    setActiveSection(prevSection.id);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <ArrowRight className="h-4 w-4 rotate-180" />
                                                <span>{prevSection.title}</span>
                                            </button>
                                        ) : <div />}
                                        {nextSection && (
                                            <button
                                                onClick={() => {
                                                    setActiveChapter(nextSection.chapterId);
                                                    setActiveSection(nextSection.id);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                <span>{nextSection.title}</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
