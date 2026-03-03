# 🎯 PROMPT: DOCUMENTATION HUB DOSEN - ULTRA ADVANCED (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan mengembangkan** halaman **Documentation Hub Dosen** dengan sangat serius dan teliti. Menu ini sangat krusial karena menjadi pusat pembelajaran dan panduan lengkap untuk dosen dalam mengelola kelas.

### File yang Akan Diupdate:
- `resources/js/pages/dosen/docs.tsx` - Main documentation hub
- `resources/js/pages/dosen/docs-detail.tsx` - Documentation detail page
- `app/Services/DocumentationService.php` - Documentation service
- `resources/docs/dosen-guides.json` - Documentation content

### Fokus Utama:
1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **Hilangkan Container di Icon Header** - Icon langsung dengan drop-shadow
3. **Animasi Floating Icons** - Tambahkan floating icons yang smooth (BUKAN kedut-kedut)
4. **Responsive Mobile** - UI/UX mobile matching admin dashboard
5. **Tombol Kembali** - Matching dengan menu lain (simple button)
6. **No Dummy Data** - Semua data real dari backend
7. **Icon Colors** - Sesuaikan warna icon dengan warna container
8. **Glassmorphism Containers** - Semua card menggunakan glassmorphism
9. **INOVASI SIGNIFIKAN** - Content writing system, progress tracking, interactive learning

---

## 🎨 DESIGN SYSTEM - MATCHING ADMIN DASHBOARD (WAJIB)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders

// GRADIENT HEADER (ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// CATEGORY COLORS
getting-started: from-emerald-400 to-teal-600
teaching: from-blue-400 to-indigo-600
grading: from-purple-400 to-pink-600
management: from-amber-400 to-orange-600
advanced: from-red-400 to-rose-600

// ROUNDED & SHADOWS
rounded-3xl  // Main containers
shadow-xl    // Main shadows
```

### Animation Standards (WAJIB)
```typescript
stiffness: 300
damping: 20

// Hover animations
scale: 1.04
y: -4
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🔧 PERBAIKAN KRUSIAL - DOCS.TSX

### 1️⃣ HEADER SECTION - CRITICAL

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Header matching dashboard dengan floating icons
<motion.div
    variants={itemVariants}
    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
>
    {/* Animated Gradient Background */}
    <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
    />

    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

    {/* Floating icons - Smooth Animation */}
    {[BookOpen, Users, FileText, BarChart3, Settings].map((Icon, i) => (
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
            <Icon className="h-8 w-8" />
        </motion.div>
    ))}

    {/* Large floating icon in background */}
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
        <BookOpen className="h-32 w-32" strokeWidth={1} />
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
        <Sparkles className="h-24 w-24" strokeWidth={1} />
    </motion.div>

    <div className="relative">
        {/* Tombol Kembali */}
        <motion.button
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.visit('/dosen/dashboard')}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
        >
            <ArrowLeft className="h-4 w-4" />
            Kembali
        </motion.button>

        <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                {/* Icon Header - NO CONTAINER */}
                <motion.div
                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                >
                    <img 
                        src="/build/assets/panduan/panduan.png" 
                        alt="Documentation" 
                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </motion.div>
                
                <div className="flex-1 mt-1 sm:mt-0">
                    <motion.p
                        className="text-sm text-indigo-100 font-medium tracking-wide"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Pusat Panduan Dosen
                    </motion.p>
                    <motion.h1
                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Documentation Hub
                    </motion.h1>
                    <motion.p
                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Panduan lengkap untuk mengelola kelas, penilaian, dan administrasi akademik
                    </motion.p>
                </div>
            </div>

            {/* Progress Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10"
            >
                <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                    <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-xs text-indigo-100">Progress Belajar</p>
                    <p className="text-2xl font-bold text-white">
                        <AnimatedCounter value={learningProgress} decimals={0} suffix="%" />
                    </p>
                </div>
            </motion.div>
        </div>
    </div>
</motion.div>
```

---

## 📊 CONTENT CATEGORIES & STRUCTURE (DOSEN)

### Category 1: Getting Started (Memulai)
```json
{
  "category": "getting-started",
  "displayName": "Memulai",
  "icon": "rocket",
  "color": "from-emerald-400 to-teal-600",
  "docs": [
    {
      "id": "intro-dosen",
      "title": "Pengenalan Dashboard Dosen",
      "slug": "pengenalan-dashboard-dosen",
      "difficulty": 1,
      "estimatedTime": 10,
      "overview": "Pelajari fitur-fitur utama dashboard dosen dan cara navigasi"
    },
    {
      "id": "first-login-dosen",
      "title": "Login Pertama Kali",
      "slug": "login-pertama-kali-dosen",
      "difficulty": 1,
      "estimatedTime": 5
    },
    {
      "id": "profile-setup",
      "title": "Mengatur Profil Dosen",
      "slug": "mengatur-profil-dosen",
      "difficulty": 1,
      "estimatedTime": 8
    }
  ]
}
```

### Category 2: Teaching (Mengajar)
```json
{
  "category": "teaching",
  "displayName": "Mengajar",
  "icon": "users",
  "color": "from-blue-400 to-indigo-600",
  "docs": [
    {
      "id": "create-session",
      "title": "Membuat Sesi Absensi",
      "slug": "membuat-sesi-absensi",
      "difficulty": 2,
      "estimatedTime": 12
    },
    {
      "id": "qr-code-generation",
      "title": "Generate QR Code Absensi",
      "slug": "generate-qr-code-absensi",
      "difficulty": 1,
      "estimatedTime": 7
    },
    {
      "id": "monitor-attendance",
      "title": "Monitoring Kehadiran Real-time",
      "slug": "monitoring-kehadiran-realtime",
      "difficulty": 2,
      "estimatedTime": 10
    },
    {
      "id": "session-templates",
      "title": "Menggunakan Template Sesi",
      "slug": "menggunakan-template-sesi",
      "difficulty": 2,
      "estimatedTime": 8
    }
  ]
}
```

### Category 3: Grading (Penilaian)
```json
{
  "category": "grading",
  "displayName": "Penilaian",
  "icon": "file-check",
  "color": "from-purple-400 to-pink-600",
  "docs": [
    {
      "id": "create-assignment",
      "title": "Membuat Tugas",
      "slug": "membuat-tugas",
      "difficulty": 2,
      "estimatedTime": 15
    },
    {
      "id": "grading-submissions",
      "title": "Menilai Pengumpulan Tugas",
      "slug": "menilai-pengumpulan-tugas",
      "difficulty": 2,
      "estimatedTime": 12
    },
    {
      "id": "bulk-grading",
      "title": "Penilaian Massal",
      "slug": "penilaian-massal",
      "difficulty": 3,
      "estimatedTime": 10
    },
    {
      "id": "grade-analytics",
      "title": "Analisis Nilai Mahasiswa",
      "slug": "analisis-nilai-mahasiswa",
      "difficulty": 2,
      "estimatedTime": 8
    }
  ]
}
```

### Category 4: Management (Manajemen)
```json
{
  "category": "management",
  "displayName": "Manajemen",
  "icon": "clipboard-list",
  "color": "from-amber-400 to-orange-600",
  "docs": [
    {
      "id": "manage-courses",
      "title": "Mengelola Mata Kuliah",
      "slug": "mengelola-mata-kuliah",
      "difficulty": 2,
      "estimatedTime": 10
    },
    {
      "id": "student-management",
      "title": "Manajemen Mahasiswa",
      "slug": "manajemen-mahasiswa",
      "difficulty": 2,
      "estimatedTime": 12
    },
    {
      "id": "attendance-reports",
      "title": "Laporan Kehadiran",
      "slug": "laporan-kehadiran",
      "difficulty": 2,
      "estimatedTime": 10
    },
    {
      "id": "export-data",
      "title": "Export Data ke Excel/PDF",
      "slug": "export-data-excel-pdf",
      "difficulty": 2,
      "estimatedTime": 8
    }
  ]
}
```

### Category 5: Advanced (Lanjutan)
```json
{
  "category": "advanced",
  "displayName": "Lanjutan",
  "icon": "settings",
  "color": "from-red-400 to-rose-600",
  "docs": [
    {
      "id": "bulk-import",
      "title": "Import Data Massal",
      "slug": "import-data-massal",
      "difficulty": 3,
      "estimatedTime": 15
    },
    {
      "id": "custom-notifications",
      "title": "Notifikasi Kustom",
      "slug": "notifikasi-kustom",
      "difficulty": 3,
      "estimatedTime": 12
    },
    {
      "id": "api-integration",
      "title": "Integrasi API",
      "slug": "integrasi-api",
      "difficulty": 4,
      "estimatedTime": 20
    },
    {
      "id": "automation",
      "title": "Automasi Tugas",
      "slug": "automasi-tugas",
      "difficulty": 4,
      "estimatedTime": 18
    }
  ]
}
```

---

## 💎 EXAMPLE: COMPLETE DOCUMENTATION ARTICLE (DOSEN)

### Title: Membuat Sesi Absensi

```markdown
# Membuat Sesi Absensi

## Overview
Panduan lengkap untuk membuat sesi absensi di sistem TPLK. Anda akan belajar cara membuat sesi, generate QR code, dan monitoring kehadiran mahasiswa secara real-time.

**Estimasi Waktu:** 12 menit  
**Tingkat Kesulitan:** ⭐⭐ Menengah  
**Terakhir Diupdate:** 2 Maret 2026

---

## Prerequisites
Sebelum memulai, pastikan Anda:
- ✅ Sudah login sebagai dosen
- ✅ Memiliki mata kuliah yang aktif
- ✅ Jadwal kuliah sudah terdaftar di sistem
- ✅ Koneksi internet stabil

---

## Langkah-Langkah Membuat Sesi Absensi

### Step 1: Buka Menu Sesi Absensi
1. Dari dashboard dosen, klik menu **"Sesi Absensi"** di sidebar
2. Atau klik tombol **"Buat Sesi Baru"** di dashboard

![Screenshot Menu Sesi Absensi](path/to/image)

💡 **Tip:** Anda bisa menggunakan template sesi untuk mempercepat proses

---

### Step 2: Pilih Mata Kuliah
1. Pilih mata kuliah dari dropdown
2. Sistem akan menampilkan jadwal kuliah hari ini
3. Pilih jadwal yang sesuai

```typescript
// Contoh data mata kuliah
{
  "course_id": 1,
  "course_name": "Pemrograman Web",
  "class": "TI-4A",
  "schedule": "Senin, 08:00 - 10:00"
}
```

⚠️ **Warning:** Pastikan memilih mata kuliah dan jadwal yang benar!

---

### Step 3: Konfigurasi Sesi
Atur pengaturan sesi absensi:

**Durasi Sesi:**
- Durasi default: 100 menit
- Dapat disesuaikan: 50-200 menit

**Verifikasi:**
- ✅ QR Code (Wajib)
- ✅ GPS Location (Opsional)
- ✅ Selfie Verification (Opsional)

**Toleransi Keterlambatan:**
- 0 menit: Tidak ada toleransi
- 15 menit: Standar (Recommended)
- 30 menit: Longgar

![Screenshot Konfigurasi](path/to/image)

💡 **Tip:** Aktifkan selfie verification untuk mencegah kecurangan

---

### Step 4: Generate QR Code
1. Klik tombol **"Generate QR Code"**
2. QR Code akan muncul di layar
3. Tampilkan QR Code di proyektor
4. Mahasiswa scan QR Code untuk absen

```javascript
// QR Code akan berisi data:
{
  "session_id": "abc123",
  "course_id": 1,
  "timestamp": "2026-03-02T08:00:00Z",
  "expires_at": "2026-03-02T09:40:00Z"
}
```

⚠️ **Warning:** QR Code akan expired sesuai durasi sesi!

---

### Step 5: Monitoring Real-time
Setelah sesi dimulai, Anda bisa:
- 📊 Melihat jumlah mahasiswa yang sudah absen
- 👥 Melihat daftar mahasiswa hadir/terlambat
- 📸 Review foto selfie mahasiswa
- ⚡ Approve/reject verifikasi selfie

![Screenshot Monitoring](path/to/image)

✅ **Success:** Sesi absensi berhasil dibuat dan berjalan!

---

## Common Mistakes (Kesalahan Umum)

### ❌ Lupa Mengaktifkan Sesi
**Penyebab:**
- Sesi dibuat tapi tidak diaktifkan
- QR Code tidak di-generate

**Solusi:**
- Pastikan klik tombol "Aktifkan Sesi"
- Generate QR Code sebelum kelas dimulai

---

### ❌ Durasi Sesi Terlalu Pendek
**Penyebab:**
- Durasi tidak sesuai dengan jadwal
- Mahasiswa terlambat tidak bisa absen

**Solusi:**
- Set durasi minimal 100 menit
- Tambahkan buffer 10-15 menit

---

### ❌ Selfie Verification Terlalu Ketat
**Penyebab:**
- Banyak selfie ditolak sistem
- Mahasiswa komplain

**Solusi:**
- Review manual selfie yang ditolak
- Adjust sensitivity di settings

---

## Tips & Best Practices

💡 **Buat Sesi 10 Menit Sebelum Kelas**  
Beri waktu untuk mahasiswa scan QR code sebelum kelas dimulai

💡 **Gunakan Template Sesi**  
Simpan konfigurasi favorit sebagai template untuk digunakan kembali

💡 **Monitor Secara Berkala**  
Cek dashboard monitoring setiap 15-20 menit untuk memastikan tidak ada masalah

💡 **Backup QR Code**  
Screenshot QR Code sebagai backup jika proyektor bermasalah

💡 **Komunikasi dengan Mahasiswa**  
Informasikan mahasiswa tentang aturan absensi di awal semester

---

## FAQ (Frequently Asked Questions)

**Q: Apakah bisa membuat sesi untuk kelas pengganti?**  
A: Ya, pilih "Sesi Manual" dan atur jadwal sesuai kebutuhan.

**Q: Bagaimana jika QR Code tidak muncul?**  
A: Refresh halaman atau generate ulang QR Code.

**Q: Apakah bisa mengubah durasi sesi setelah dimulai?**  
A: Ya, klik "Edit Sesi" dan update durasi.

**Q: Berapa lama data sesi tersimpan?**  
A: Data tersimpan permanen dan bisa diakses kapan saja.

---

## Related Topics
- 📖 [Generate QR Code Absensi](link)
- 📖 [Monitoring Kehadiran Real-time](link)
- 📖 [Menggunakan Template Sesi](link)
- 📖 [Laporan Kehadiran](link)

---

## Summary
Anda telah mempelajari cara membuat sesi absensi:
1. ✅ Buka menu sesi absensi
2. ✅ Pilih mata kuliah dan jadwal
3. ✅ Konfigurasi pengaturan sesi
4. ✅ Generate QR Code
5. ✅ Monitoring kehadiran real-time

**Next Steps:**
- Coba buat sesi untuk kelas berikutnya
- Pelajari cara monitoring real-time
- Eksplorasi fitur template sesi

---

## Feedback
Apakah dokumentasi ini membantu?  
[👍 Ya, sangat membantu] [👎 Perlu perbaikan]

**Rating:** ⭐⭐⭐⭐⭐ (4.9/5 dari 156 dosen)

---

*Terakhir diupdate: 2 Maret 2026*  
*Penulis: Tim Dokumentasi TPLK*  
*Versi: 2.1.0*
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### ✅ Header Section
- [ ] Add floating animations (BookOpen, Users, FileText, BarChart3, Settings)
- [ ] Add large floating icons (BookOpen, Sparkles)
- [ ] Add tombol kembali di header gradient
- [ ] Update icon header (NO container, only drop-shadow)
- [ ] Responsive mobile (flex-col sm:flex-row)
- [ ] Icon: h-20 w-20 sm:h-24 sm:w-24
- [ ] Text: text-2xl sm:text-3xl
- [ ] Add import ArrowLeft, Sparkles

### ✅ Documentation Cards
- [ ] Update ke glassmorphism
- [ ] Border (border-white/20 dark:border-white/5)
- [ ] Rounded-3xl
- [ ] Hover animations matching dashboard
- [ ] Category badges dengan gradient colors
- [ ] Difficulty indicators
- [ ] Progress indicators

### ✅ Content Categories (Dosen-Specific)
- [ ] Getting Started (Memulai)
- [ ] Teaching (Mengajar)
- [ ] Grading (Penilaian)
- [ ] Management (Manajemen)
- [ ] Advanced (Lanjutan)

### ✅ Innovations (Same as Mahasiswa)
- [ ] Smart Content Writing System
- [ ] Interactive Learning Features
- [ ] Progress Tracking System
- [ ] Smart Search & Filtering
- [ ] Bookmarks & Favorites
- [ ] Community Features
- [ ] Offline Mode & Download
- [ ] Learning Path & Roadmap

---

## 🎉 EXPECTED RESULTS

Setelah implementasi lengkap:
- ✅ Documentation hub yang professional dan modern
- ✅ Floating icons animation yang smooth
- ✅ Content writing yang konsisten untuk dosen
- ✅ Interactive learning dengan quiz dan sandbox
- ✅ Progress tracking yang detail
- ✅ Smart search dengan AI suggestions
- ✅ Community features untuk feedback
- ✅ Offline mode untuk akses tanpa internet
- ✅ Learning paths untuk guided learning
- ✅ Mobile responsive perfect
- ✅ Glassmorphism design matching dashboard
- ✅ Gradient: indigo-purple-pink
- ✅ Animasi smooth (BUKAN kedut-kedut)

---

**GOOD LUCK WITH THE IMPLEMENTATION! 🚀📚✨**
