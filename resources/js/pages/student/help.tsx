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
        faqs: [
            {
                id: 'faq-1',
                question: 'Bagaimana cara melakukan absensi?',
                answer: '## Panduan Lengkap Melakukan Absensi\n\nSistem absensi menggunakan teknologi QR Code dan verifikasi lokasi GPS untuk memastikan kehadiran Anda tercatat dengan akurat.\n\n### Langkah-Langkah Absensi:\n\n**1. Persiapan Sebelum Absensi**\n   • Pastikan smartphone Anda memiliki koneksi internet yang stabil (WiFi atau data seluler)\n   • Aktifkan GPS/Lokasi di pengaturan device Anda\n   • Berikan izin akses kamera dan lokasi untuk aplikasi\n   • Pastikan baterai device minimal 20% untuk menghindari mati mendadak\n\n**2. Membuka Menu Absensi**\n   • Login ke aplikasi menggunakan NIM dan password Anda\n   • Klik menu "Absen" di sidebar navigasi sebelah kiri\n   • Atau gunakan shortcut dengan menekan tombol "Absen Cepat" di dashboard\n\n**3. Verifikasi Lokasi**\n   • Sistem akan otomatis mendeteksi lokasi Anda\n   • Pastikan Anda berada dalam radius yang ditentukan (biasanya 50-100 meter dari ruang kelas)\n   • Jika lokasi tidak terdeteksi, coba refresh halaman atau pindah ke area dengan sinyal GPS lebih baik\n   • Indikator hijau menandakan Anda berada di lokasi yang benar\n\n**4. Scan QR Code**\n   • Dosen akan menampilkan QR Code di layar proyektor atau device\n   • Klik tombol "Scan QR Code" di aplikasi\n   • Arahkan kamera ke QR Code dengan jarak optimal 15-30 cm\n   • Pastikan pencahayaan cukup dan QR Code tidak buram\n   • Tahan device dengan stabil hingga QR Code terdeteksi (biasanya 1-2 detik)\n\n**5. Verifikasi Selfie (Jika Diaktifkan)**\n   • Beberapa sesi mungkin memerlukan verifikasi wajah\n   • Ambil foto selfie dengan posisi wajah menghadap kamera\n   • Pastikan wajah terlihat jelas, tidak tertutup masker atau topi\n   • Pencahayaan harus cukup terang\n   • Sistem akan membandingkan dengan foto profil Anda\n\n**6. Konfirmasi Kehadiran**\n   • Klik tombol "Konfirmasi" setelah semua verifikasi selesai\n   • Tunggu proses validasi (biasanya 2-5 detik)\n   • Anda akan melihat notifikasi "Absensi Berhasil" dengan detail:\n     - Waktu absensi\n     - Status kehadiran (Hadir/Terlambat)\n     - Nama mata kuliah\n     - Nama dosen\n\n**7. Verifikasi Keberhasilan**\n   • Cek email untuk konfirmasi absensi\n   • Lihat riwayat absensi di menu "Rekapan"\n   • Status akan berubah dari "Belum Absen" menjadi "Hadir"\n\n### Tips & Trik:\n\n✅ **DO (Lakukan):**\n• Datang 5-10 menit lebih awal untuk menghindari antrian scan\n• Pastikan aplikasi sudah diupdate ke versi terbaru\n• Gunakan WiFi kampus untuk koneksi lebih stabil\n• Simpan screenshot konfirmasi sebagai bukti cadangan\n• Laporkan segera jika ada masalah teknis\n\n❌ **DON\'T (Jangan):**\n• Jangan mencoba scan QR Code dari luar area kampus\n• Jangan menggunakan screenshot QR Code orang lain\n• Jangan menitipkan absensi ke teman\n• Jangan force close aplikasi saat proses absensi berlangsung\n• Jangan lupa logout setelah selesai menggunakan device bersama\n\n### Troubleshooting Cepat:\n\n**Masalah:** Kamera tidak bisa membuka\n**Solusi:** Cek izin kamera di Settings > Apps > Permissions\n\n**Masalah:** Lokasi tidak terdeteksi\n**Solusi:** Aktifkan "High Accuracy" mode di pengaturan GPS\n\n**Masalah:** QR Code tidak terbaca\n**Solusi:** Bersihkan lensa kamera dan pastikan fokus\n\n**Masalah:** Koneksi timeout\n**Solusi:** Pindah ke area dengan sinyal lebih kuat\n\n### Informasi Penting:\n\n⚠️ **Perhatian:**\n• Setiap mahasiswa hanya bisa absen 1 kali per sesi\n• Absensi yang terlambat akan dicatat dengan status "Terlambat"\n• Manipulasi data absensi adalah pelanggaran serius\n• Sistem mencatat IP address dan lokasi GPS untuk audit\n\n📱 **Dukungan Device:**\n• Android 8.0 ke atas\n• iOS 12.0 ke atas\n• Browser: Chrome, Safari, Firefox (versi terbaru)\n\n⏰ **Waktu Operasional:**\n• QR Code aktif sesuai jadwal yang ditentukan dosen\n• Biasanya 5-15 menit dari waktu mulai kuliah\n• Setelah expired, QR Code tidak dapat digunakan\n\n### Bantuan Lebih Lanjut:\n\nJika masih mengalami kesulitan, hubungi:\n• Help Desk: ext. 123\n• Email: support@kampus.ac.id\n• WhatsApp: 0812-3456-7890\n• Atau datang langsung ke Pusat IT Kampus',
                category: 'absensi',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-2',
                question: 'QR Code tidak bisa di-scan, apa yang harus dilakukan?',
                answer: '## Panduan Mengatasi Masalah QR Code\n\nJika Anda mengalami kesulitan saat scan QR Code, ikuti panduan troubleshooting lengkap berikut:\n\n### Penyebab Umum & Solusi:\n\n#### 1. Masalah Izin Aplikasi\n\n**Gejala:**\n• Kamera tidak terbuka sama sekali\n• Muncul pesan "Camera permission denied"\n• Layar hitam saat membuka scanner\n\n**Solusi Lengkap:**\n\n**Untuk Android:**\n```\n1. Buka Settings/Pengaturan\n2. Pilih Apps/Aplikasi\n3. Cari dan pilih aplikasi absensi\n4. Tap "Permissions" atau "Izin"\n5. Aktifkan izin untuk:\n   • Camera/Kamera\n   • Location/Lokasi\n   • Storage/Penyimpanan\n6. Pilih "Allow all the time" untuk lokasi\n7. Restart aplikasi\n```\n\n**Untuk iOS:**\n```\n1. Buka Settings\n2. Scroll ke bawah, cari aplikasi absensi\n3. Tap aplikasi tersebut\n4. Aktifkan toggle untuk:\n   • Camera\n   • Location (pilih "Always")\n   • Photos (jika diperlukan)\n5. Tutup Settings dan buka ulang aplikasi\n```\n\n#### 2. Masalah Kualitas Kamera\n\n**Gejala:**\n• Gambar buram atau tidak fokus\n• QR Code terdeteksi tapi tidak valid\n• Scanner lambat mengenali kode\n\n**Solusi:**\n\n**Pembersihan Lensa:**\n• Gunakan kain microfiber bersih\n• Lap lensa dengan gerakan memutar lembut\n• Hindari menggunakan tissue kasar\n• Pastikan tidak ada sidik jari atau debu\n\n**Pengaturan Fokus:**\n• Tap layar pada area QR Code untuk fokus manual\n• Jaga jarak optimal 15-30 cm dari QR Code\n• Tahan device dengan stabil, jangan bergerak\n• Tunggu 2-3 detik untuk auto-focus bekerja\n\n**Pencahayaan:**\n• Pastikan ruangan cukup terang\n• Hindari backlight (cahaya dari belakang QR Code)\n• Jangan gunakan flash jika QR Code di layar\n• Posisikan device agar tidak ada bayangan\n\n#### 3. Masalah Koneksi Internet\n\n**Gejala:**\n• QR Code terbaca tapi proses stuck\n• Muncul pesan "Connection timeout"\n• Loading terus menerus tanpa hasil\n\n**Solusi:**\n\n**Cek Koneksi:**\n```\n1. Buka browser, coba akses google.com\n2. Jika lambat, pindah ke WiFi atau sebaliknya\n3. Restart router WiFi jika perlu\n4. Toggle Airplane Mode on/off untuk reset koneksi\n5. Coba gunakan data seluler sebagai backup\n```\n\n**Optimasi Koneksi:**\n• Gunakan WiFi kampus untuk kecepatan maksimal\n• Pastikan sinyal minimal 3 bar\n• Tutup aplikasi lain yang menggunakan internet\n• Clear cache browser jika menggunakan web app\n• Hindari jam sibuk (saat banyak mahasiswa online)\n\n#### 4. Masalah Cache & Data Aplikasi\n\n**Gejala:**\n• Aplikasi sering crash\n• Fitur tidak berfungsi normal\n• Error message yang tidak jelas\n\n**Solusi:**\n\n**Clear Cache (Android):**\n```\n1. Settings > Apps > Aplikasi Absensi\n2. Tap "Storage" atau "Penyimpanan"\n3. Tap "Clear Cache" (BUKAN Clear Data)\n4. Restart aplikasi\n5. Login kembali jika diperlukan\n```\n\n**Clear Cache (iOS):**\n```\n1. Uninstall aplikasi\n2. Restart device\n3. Install ulang dari App Store\n4. Login dengan kredensial Anda\n```\n\n**Clear Browser Cache (Web App):**\n```\nChrome/Edge:\n• Tekan Ctrl+Shift+Delete (Windows)\n• Tekan Cmd+Shift+Delete (Mac)\n• Pilih "Cached images and files"\n• Klik "Clear data"\n\nSafari:\n• Safari > Preferences > Privacy\n• Klik "Manage Website Data"\n• Klik "Remove All"\n```\n\n#### 5. Masalah QR Code Expired\n\n**Gejala:**\n• Muncul pesan "QR Code sudah tidak valid"\n• "Session expired"\n• "QR Code kadaluarsa"\n\n**Penjelasan:**\n• QR Code memiliki masa aktif terbatas (5-15 menit)\n• Setelah waktu habis, kode tidak dapat digunakan\n• Ini untuk keamanan dan mencegah penyalahgunaan\n\n**Solusi:**\n• Minta dosen untuk generate QR Code baru\n• Pastikan datang tepat waktu\n• Jangan tunda-tunda proses absensi\n• Siapkan aplikasi sebelum QR Code ditampilkan\n\n#### 6. Masalah Kompatibilitas Device\n\n**Gejala:**\n• Fitur tidak tersedia di device Anda\n• Aplikasi tidak bisa diinstall\n• Performa sangat lambat\n\n**Minimum Requirements:**\n\n**Android:**\n• OS: Android 8.0 (Oreo) atau lebih baru\n• RAM: Minimal 2GB\n• Storage: 100MB ruang kosong\n• Kamera: Minimal 5MP dengan autofocus\n• GPS: Built-in GPS/A-GPS\n\n**iOS:**\n• OS: iOS 12.0 atau lebih baru\n• Device: iPhone 6 atau lebih baru\n• Storage: 100MB ruang kosong\n• Kamera: Kamera belakang dengan autofocus\n\n**Browser (Web App):**\n• Chrome 90+\n• Safari 14+\n• Firefox 88+\n• Edge 90+\n\n**Solusi:**\n• Update OS ke versi terbaru\n• Upgrade device jika terlalu lama\n• Gunakan device alternatif (pinjam teman)\n• Hubungi IT support untuk solusi khusus\n\n### Langkah Troubleshooting Sistematis:\n\n**Level 1 - Quick Fix (1-2 menit):**\n1. ✓ Bersihkan lensa kamera\n2. ✓ Cek koneksi internet\n3. ✓ Restart aplikasi\n4. ✓ Atur jarak dan pencahayaan\n5. ✓ Coba scan ulang\n\n**Level 2 - Medium Fix (5-10 menit):**\n1. ✓ Cek dan aktifkan semua izin aplikasi\n2. ✓ Clear cache aplikasi\n3. ✓ Toggle WiFi/Data on/off\n4. ✓ Restart device\n5. ✓ Update aplikasi ke versi terbaru\n\n**Level 3 - Advanced Fix (15-30 menit):**\n1. ✓ Uninstall dan install ulang aplikasi\n2. ✓ Reset network settings\n3. ✓ Coba gunakan device lain\n4. ✓ Hubungi IT support\n5. ✓ Gunakan metode absensi alternatif\n\n### Tips Pencegahan:\n\n**Sebelum Kuliah:**\n• ✅ Charge device minimal 50%\n• ✅ Update aplikasi jika ada versi baru\n• ✅ Test kamera dengan membuka aplikasi kamera bawaan\n• ✅ Cek koneksi internet\n• ✅ Login ke aplikasi untuk memastikan akun aktif\n\n**Saat Kuliah:**\n• ✅ Siapkan aplikasi sebelum QR Code ditampilkan\n• ✅ Posisikan diri di area dengan sinyal bagus\n• ✅ Jangan panik jika gagal, coba lagi dengan tenang\n• ✅ Minta bantuan teman jika perlu\n\n**Setelah Kuliah:**\n• ✅ Verifikasi absensi tercatat di sistem\n• ✅ Screenshot konfirmasi sebagai bukti\n• ✅ Laporkan masalah teknis ke IT support\n\n### Metode Alternatif:\n\nJika semua cara di atas gagal:\n\n**1. Manual Attendance:**\n• Lapor ke dosen secara langsung\n• Isi form absensi manual\n• Berikan alasan teknis yang jelas\n• Minta dosen untuk input manual ke sistem\n\n**2. Absensi via Web:**\n• Buka browser di laptop/PC\n• Akses portal.kampus.ac.id/absensi\n• Login dengan kredensial Anda\n• Gunakan webcam untuk scan QR Code\n\n**3. Bantuan Teman:**\n• Minta teman untuk screenshot QR Code (jika diizinkan)\n• Scan dari screenshot di device lain\n• HANYA jika dosen mengizinkan metode ini\n\n### Kontak Darurat:\n\n**IT Support:**\n• 📞 Telepon: (021) 1234-5678 ext. 123\n• 📧 Email: itsupport@kampus.ac.id\n• 💬 WhatsApp: 0812-3456-7890\n• 🏢 Lokasi: Gedung IT Lt. 1\n• ⏰ Jam Kerja: Senin-Jumat 08:00-16:00\n\n**Emergency Hotline (24/7):**\n• 📱 0811-9999-8888\n\n### Catatan Penting:\n\n⚠️ **Peringatan:**\n• Jangan mencoba manipulasi QR Code\n• Jangan gunakan aplikasi pihak ketiga untuk scan\n• Jangan share QR Code ke orang lain\n• Pelanggaran akan dikenakan sanksi akademik\n\n📝 **Dokumentasi:**\n• Simpan screenshot error message\n• Catat waktu dan lokasi kejadian\n• Foto kondisi QR Code jika buram\n• Berguna untuk laporan ke IT support\n\n🔄 **Update Berkala:**\n• Sistem akan diupdate setiap semester\n• Baca announcement untuk fitur baru\n• Ikuti training jika ada perubahan major',
                category: 'absensi',
                helpful: 0,
                notHelpful: 0,
                views: 0,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'faq-3',
                question: 'Berapa lama waktu yang tersedia untuk melakukan absensi?',
                answer: '## Panduan Lengkap Waktu Absensi\n\n### Durasi Waktu Absensi\n\nWaktu absensi bervariasi tergantung kebijakan dosen dan jenis perkuliahan. Berikut penjelasan lengkapnya:\n\n#### Waktu Standar:\n\n**QR Code Aktif:**\n• **Minimum:** 5 menit dari waktu mulai kuliah\n• **Standar:** 10-15 menit dari waktu mulai kuliah\n• **Maximum:** 20 menit (untuk kelas besar)\n• **Khusus:** Dosen dapat menyesuaikan sesuai kebutuhan\n\n**Contoh Skenario:**\n```\nJadwal Kuliah: 08:00 - 10:00\nQR Code Aktif: 08:00 - 08:15 (15 menit)\nSetelah 08:15: QR Code expired/tidak valid\n```\n\n### Status Kehadiran Berdasarkan Waktu:\n\n#### 1. Status "HADIR" ✅\n\n**Kriteria:**\n• Absen dalam 10 menit pertama dari waktu mulai\n• Contoh: Kuliah jam 08:00, absen sebelum 08:10\n\n**Keuntungan:**\n• Nilai kehadiran penuh (100%)\n• Tidak ada pengurangan poin\n• Tercatat sebagai mahasiswa disiplin\n• Memenuhi syarat minimal kehadiran\n\n**Tips:**\n• Datang 5-10 menit lebih awal\n• Siapkan aplikasi sebelum masuk kelas\n• Langsung scan begitu QR Code ditampilkan\n• Jangan menunda-nunda\n\n#### 2. Status "TERLAMBAT" ⚠️\n\n**Kriteria:**\n• Absen setelah 10 menit dari waktu mulai\n• Tapi masih dalam waktu QR Code aktif\n• Contoh: Kuliah jam 08:00, absen jam 08:12\n\n**Konsekuensi:**\n• Nilai kehadiran dikurangi (biasanya 50-75%)\n• Tercatat dalam sistem sebagai terlambat\n• Akumulasi keterlambatan dapat mempengaruhi nilai akhir\n• Beberapa dosen menerapkan aturan khusus:\n  - 3x terlambat = 1x tidak hadir\n  - Terlambat >30 menit = tidak hadir\n\n**Kebijakan Khusus:**\n• Terlambat 1-10 menit: Nilai 75%\n• Terlambat 11-20 menit: Nilai 50%\n• Terlambat >20 menit: Nilai 25% atau tidak hadir\n\n#### 3. Status "TIDAK HADIR" ❌\n\n**Kriteria:**\n• Tidak absen sama sekali\n• Absen setelah QR Code expired\n• Tidak ada di lokasi yang ditentukan\n\n**Konsekuensi:**\n• Nilai kehadiran 0%\n• Mengurangi persentase kehadiran total\n• Jika kehadiran <75%, tidak bisa ikut UAS\n• Dapat mempengaruhi nilai akhir mata kuliah\n\n### Timeline Absensi Detail:\n\n```\n┌─────────────────────────────────────────────────────┐\n│ TIMELINE ABSENSI                                    │\n├─────────────────────────────────────────────────────┤\n│                                                     │\n│ 07:50 ─────────────────────────────────────────    │\n│   ↓   Mahasiswa mulai datang                       │\n│   ↓   Siapkan aplikasi                             │\n│                                                     │\n│ 08:00 ═════════════════════════════════════════    │\n│   ↓   KULIAH DIMULAI                               │\n│   ↓   QR Code ditampilkan                          │\n│   ↓   [STATUS: HADIR] ✅                           │\n│                                                     │\n│ 08:10 ─────────────────────────────────────────    │\n│   ↓   Batas waktu "Hadir"                          │\n│   ↓   [STATUS: TERLAMBAT] ⚠️                       │\n│                                                     │\n│ 08:15 ─────────────────────────────────────────    │\n│   ↓   QR Code EXPIRED                              │\n│   ↓   [STATUS: TIDAK HADIR] ❌                     │\n│                                                     │\n│ 08:20 ─────────────────────────────────────────    │\n│       Tidak bisa absen lagi                        │\n│                                                     │\n└─────────────────────────────────────────────────────┘\n```\n\n### Faktor yang Mempengaruhi Durasi:\n\n#### 1. Jenis Perkuliahan:\n\n**Kelas Teori (Reguler):**\n• Durasi QR: 10-15 menit\n• Toleransi: Standar\n• Alasan: Jumlah mahasiswa sedang (30-50 orang)\n\n**Kelas Praktikum:**\n• Durasi QR: 5-10 menit\n• Toleransi: Ketat\n• Alasan: Perlu persiapan alat, tidak boleh terlambat\n\n**Kelas Besar (>100 mahasiswa):**\n• Durasi QR: 15-20 menit\n• Toleransi: Lebih longgar\n• Alasan: Antrian scan lebih panjang\n\n**Kelas Online/Hybrid:**\n• Durasi QR: 10-15 menit\n• Toleransi: Standar\n• Alasan: Tergantung koneksi internet\n\n#### 2. Kebijakan Dosen:\n\n**Dosen Strict:**\n• QR Code hanya 5 menit\n• Tidak ada toleransi keterlambatan\n• Terlambat = tidak hadir\n\n**Dosen Moderate:**\n• QR Code 10-15 menit\n• Toleransi keterlambatan 5-10 menit\n• Terlambat dicatat tapi masih dihitung hadir\n\n**Dosen Flexible:**\n• QR Code 15-20 menit\n• Toleransi keterlambatan hingga 15 menit\n• Fokus pada partisipasi kelas\n\n#### 3. Kondisi Khusus:\n\n**Ujian/Quiz:**\n• Durasi QR: 5 menit\n• Toleransi: Sangat ketat\n• Terlambat tidak diizinkan masuk\n\n**Presentasi Kelompok:**\n• Durasi QR: 10 menit\n• Toleransi: Sedang\n• Harus hadir sebelum giliran presentasi\n\n**Guest Lecture:**\n• Durasi QR: 15 menit\n• Toleransi: Standar\n• Menghormati pembicara tamu\n\n### Cara Cek Sisa Waktu Absensi:\n\n**Di Aplikasi:**\n```\n1. Buka menu "Absen"\n2. Lihat countdown timer di atas QR scanner\n3. Contoh tampilan:\n   ┌─────────────────────────────┐\n   │  Sisa Waktu: 08:45          │\n   │  ⏰ 8 menit 45 detik         │\n   │  Status: Masih bisa absen   │\n   └─────────────────────────────┘\n```\n\n**Indikator Warna:**\n• 🟢 Hijau (>5 menit): Aman, masih banyak waktu\n• 🟡 Kuning (2-5 menit): Hati-hati, segera scan\n• 🔴 Merah (<2 menit): Urgent, scan sekarang!\n• ⚫ Abu-abu (0 menit): Expired, tidak bisa scan\n\n### Strategi Manajemen Waktu:\n\n#### Untuk Mahasiswa:\n\n**Persiapan Pagi:**\n```\n07:00 - Bangun, siap-siap\n07:30 - Berangkat ke kampus\n07:50 - Tiba di kampus, menuju kelas\n07:55 - Duduk, buka aplikasi\n08:00 - Kuliah mulai, langsung scan\n08:02 - Absensi selesai, fokus kuliah\n```\n\n**Jika Terlambat:**\n```\n1. Tetap tenang, jangan panik\n2. Langsung menuju kelas\n3. Buka aplikasi sambil berjalan\n4. Masuk kelas dengan sopan\n5. Scan QR Code segera\n6. Duduk tanpa mengganggu\n```\n\n**Jika Sangat Terlambat (>15 menit):**\n```\n1. Cek apakah QR Code masih aktif\n2. Jika tidak, lapor ke dosen\n3. Jelaskan alasan keterlambatan\n4. Minta izin untuk tetap mengikuti kuliah\n5. Minta dosen input absensi manual (jika diizinkan)\n6. Kirim email follow-up dengan bukti\n```\n\n### FAQ Terkait Waktu:\n\n**Q: Apakah waktu absensi sama untuk semua mata kuliah?**\nA: Tidak, setiap dosen dapat mengatur durasi sendiri. Cek di silabus atau tanya langsung ke dosen.\n\n**Q: Bagaimana jika terlambat karena macet/hujan?**\nA: Lapor ke dosen dengan bukti (foto/screenshot). Beberapa dosen memberikan toleransi untuk force majeure.\n\n**Q: Apakah bisa absen lebih awal sebelum kuliah dimulai?**\nA: Tidak bisa. QR Code baru aktif saat kuliah dimulai sesuai jadwal.\n\n**Q: Bagaimana jika QR Code expired tapi saya sudah di kelas?**\nA: Lapor ke dosen segera. Dosen dapat membuka QR Code baru atau input manual.\n\n**Q: Apakah ada notifikasi sebelum QR Code expired?**\nA: Ya, aplikasi akan mengirim notifikasi 2 menit sebelum expired.\n\n### Aturan Kehadiran Minimum:\n\n**Standar Universitas:**\n• Minimum kehadiran: 75% dari total pertemuan\n• Jika <75%: Tidak boleh ikut UAS\n• Jika <50%: Nilai E otomatis\n\n**Perhitungan:**\n```\nTotal pertemuan: 14 kali\nMinimum hadir: 14 × 75% = 10.5 ≈ 11 kali\nMaksimum tidak hadir: 3 kali\n\nJika tidak hadir 4 kali = Tidak bisa UAS\n```\n\n**Kompensasi:**\n• Beberapa dosen memberikan tugas pengganti\n• Harus ada alasan yang sah (sakit, keluarga)\n• Perlu surat keterangan resmi\n• Tidak semua dosen menerima kompensasi\n\n### Tips Agar Tidak Terlambat:\n\n**Malam Sebelumnya:**\n• ✅ Cek jadwal kuliah besok\n• ✅ Siapkan pakaian dan tas\n• ✅ Charge smartphone dan laptop\n• ✅ Set alarm 2-3 buah\n• ✅ Tidur cukup (minimal 6 jam)\n\n**Pagi Hari:**\n• ✅ Bangun 2 jam sebelum kuliah\n• ✅ Cek kondisi lalu lintas (Google Maps)\n• ✅ Berangkat lebih awal jika macet\n• ✅ Bawa power bank untuk jaga-jaga\n\n**Di Kampus:**\n• ✅ Datang 10 menit lebih awal\n• ✅ Langsung ke kelas, jangan nongkrong dulu\n• ✅ Siapkan aplikasi sebelum masuk\n• ✅ Duduk di depan untuk akses cepat ke QR Code\n\n### Sanksi Keterlambatan:\n\n**Peringatan Lisan:**\n• Terlambat 1-2 kali: Teguran ringan\n\n**Peringatan Tertulis:**\n• Terlambat 3-5 kali: Surat peringatan\n\n**Sanksi Akademik:**\n• Terlambat >5 kali: Pengurangan nilai\n• Tidak hadir >3 kali: Tidak bisa UAS\n• Kehadiran <75%: Nilai E\n\n### Kontak untuk Pertanyaan Lebih Lanjut:\n\n**Bagian Akademik:**\n• 📞 (021) 1234-5678 ext. 200\n• 📧 akademik@kampus.ac.id\n• 🏢 Gedung Rektorat Lt. 2\n\n**Dosen Pengampu:**\n• Cek email dosen di silabus\n• Konsultasi saat jam office hours\n• Kirim email dengan subject jelas',
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
        faqs: [
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
        faqs: [
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
        faqs: [
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
    const { auth } = usePage<{ auth: { user: { email: string } } }>().props;
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
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
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
                    transition={{ delay: 0.2 }}
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
