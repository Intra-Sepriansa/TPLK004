# PROMPT: BANTUAN MAHASISWA - ULTRA ADVANCED COMPLETE REDESIGN

## 🎯 TUJUAN UTAMA
Merapikan dan mengembangkan menu **Bantuan Mahasiswa** (`resources/js/pages/student/help.tsx`) dengan standar ultra-advanced yang sangat krusial dan penting. Menu ini harus menjadi pusat informasi yang lengkap, rapi, dan mudah digunakan dengan UI/UX yang matching dengan Dashboard Admin dan menu-menu lain yang sudah ada.

## 📋 REFERENSI UTAMA
- **Bantuan Dosen**: `resources/js/pages/dosen/help.tsx` (konten lengkap dan struktur)
- **Dashboard Admin**: `resources/js/pages/admin/command-center.tsx` (warna, animasi, glassmorphism)
- **Dashboard Mahasiswa**: `resources/js/pages/user/dashboard.tsx` (UI/UX pattern, responsive)
- **Menu Lain**: Konsistensi dengan semua menu mahasiswa yang sudah ada

## 🎨 DESAIN & UI/UX REQUIREMENTS

### 1. HEADER SECTION (CRITICAL)
**Matching dengan Dashboard Admin & Mahasiswa:**
```tsx
// WAJIB menggunakan pattern ini:
- Gradient Background: bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500
- Animated Gradient dengan motion (backgroundPosition animation)
- Glow Orbs: 2 orbs dengan blur-3xl dan animasi scale/opacity
- Border: border border-white/20
- Shadow: shadow-2xl
- Rounded: rounded-3xl
- Padding: p-8 (mobile: p-6)
```

**Icon Header:**
- ✅ GUNAKAN: Icon PNG yang sudah ada (HelpIcon dari assets)
- ✅ SIZE: h-20 w-20 sm:h-24 sm:w-24
- ✅ ANIMATION: whileHover scale & rotate
- ✅ DROP SHADOW: drop-shadow-2xl
- ❌ HAPUS: Container di belakang icon
- ❌ HAPUS: Animasi icon bergerak ke atas/bawah

**Search Bar:**
- Glassmorphism style: bg-white/95 backdrop-blur
- Icon Search di kiri (pl-14)
- Button gradient di kanan (from-purple-500 to-fuchsia-500)
- Rounded: rounded-2xl
- Shadow: shadow-2xl
- Placeholder: "Cari bantuan, panduan, atau ketik pertanyaan Anda..."

### 2. STATS CARDS (4 Cards)
**Pattern dari Dashboard:**
```tsx
// Grid: grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4
// Card Style:
- rounded-2xl sm:rounded-3xl
- border border-white/20 dark:border-white/5
- bg-white/40 dark:bg-neutral-900/40
- backdrop-blur-xl
- shadow-xl
- p-3 sm:p-6
```

**Stats yang Ditampilkan:**
1. Total Artikel (256 artikel tersedia)
2. Video Tutorial (45 video panduan)
3. FAQ (128 pertanyaan umum)
4. Ticket Support (3 tiket dukungan aktif)

**Icon untuk Stats:**
- Gunakan Lucide icons: BookOpen, Video, MessageCircle, Headphones
- Gradient background untuk icon container
- Animated glow effect saat hover
- AnimatedCounter untuk angka

### 3. KATEGORI BANTUAN (6 Categories)
**Grid Layout:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

**Kategori Wajib:**
1. **Panduan Lengkap** (Book icon)
   - Badge: "Populer"
   - Color: from-blue-500 to-indigo-500
   - Deskripsi: Dokumentasi lengkap sistem presensi, manajemen kelas, dan fitur-fitur advanced

2. **Tips & Trik** (Lightbulb icon)
   - Badge: "Trending"
   - Color: from-yellow-500 to-orange-500
   - Deskripsi: Maksimalkan produktivitas dengan tips praktis dan shortcut yang efisien

3. **Keamanan** (Shield icon)
   - Badge: "Penting"
   - Color: from-green-500 to-emerald-500
   - Deskripsi: Panduan lengkap keamanan akun, privasi data, dan best practices

4. **Video Tutorial** (PlayCircle icon)
   - Badge: "Baru"
   - Color: from-purple-500 to-pink-500
   - Deskripsi: Tutorial video step-by-step untuk semua fitur sistem

5. **Troubleshooting** (Wrench icon)
   - Badge: "Pemula"
   - Color: from-red-500 to-orange-500
   - Deskripsi: Solusi cepat untuk masalah umum dan error yang sering terjadi

6. **Panduan Akademik** (GraduationCap icon)
   - Badge: "Mahasiswa"
   - Color: from-cyan-500 to-blue-500
   - Deskripsi: Panduan lengkap fitur akademik, tugas, ujian, dan nilai

**Card Style:**
- Hover effect: scale-105, y: -8
- Gradient overlay saat hover
- Icon container: h-16 w-16 dengan gradient background
- Badge di pojok kanan atas
- Footer: jumlah artikel + rating (Star icon)


### 4. ARTIKEL TERPOPULER & VIDEO TUTORIAL (Side by Side)
**Layout:**
```tsx
grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12
```

**Artikel Terpopuler (Kiri):**
- Header dengan icon TrendingUp
- List 5 artikel dengan ranking (#1, #2, dst)
- Setiap artikel menampilkan:
  - Icon (dari Lucide)
  - Title (bold, hover:text-emerald-600)
  - Description (line-clamp-1)
  - Views, Rating (Star), Read Time
  - Badge difficulty (Pemula/Menengah/Pro)
- Hover effect: x: 8, scale: 1.01
- Click: buka modal detail artikel

**Video Tutorial (Kanan):**
- Header dengan icon PlayCircle
- Grid 3 video cards
- Setiap video menampilkan:
  - Thumbnail image dengan overlay
  - Play button icon (center)
  - Duration badge (bottom-right)
  - Category badge
  - Title (line-clamp-2)
  - Views count
- Hover effect: y: -5, scale: 1.02
- Click: buka modal video player

### 5. INTERACTIVE FAQ SECTION
**Design Pattern:**
```tsx
// Container:
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 
p-8 shadow-xl backdrop-blur-xl

// Header:
- Icon MessageSquare dengan bg-orange-100
- Title: "Pertanyaan Umum (FAQ)"
- Subtitle: "Jawaban cepat untuk masalah yang sering ditemui"
- Filter badges: Umum, Absensi, Tugas, Teknis
```

**Accordion Style:**
- Shadcn Accordion component
- Setiap item:
  - bg-white/50 dark:bg-black/20
  - rounded-2xl
  - shadow-sm hover:shadow-md
  - Q. prefix dengan warna emerald
  - A. prefix untuk jawaban
  - Border-left emerald untuk jawaban
- Footer setiap FAQ:
  - "Apakah jawaban ini membantu?"
  - Button: Ya (ThumbsUp) + Tidak (ThumbsDown)
  - Tampilkan count helpful/notHelpful

**Bottom CTA:**
- "Masih belum menemukan jawaban yang dicari?"
- Button: "Buat Tiket Dukungan" (Headphones icon)
- Gradient: from-gray-900 to-gray-700

### 6. CONTACT SUPPORT (3 Cards)
**Grid:**
```tsx
grid-cols-1 md:grid-cols-3 gap-6
```

**Cards:**
1. **Email Support**
   - Icon: Mail (bg-blue-100)
   - Title: "Email Support"
   - Description: "Tanya detail teknis via email"
   - Email: support@tplk004.id (clickable)

2. **WhatsApp CS**
   - Icon: MessageCircle (bg-green-100)
   - Title: "WhatsApp CS"
   - Description: "Respon cepat (Jam 08:00 - 16:00)"
   - Button: "Chat Sekarang" (green border)

3. **Telepon Darurat**
   - Icon: Phone (bg-rose-100)
   - Badge: "HOTLINE" (top-right, bg-rose-500)
   - Title: "Telepon Darurat"
   - Description: "24/7 Untuk masalah kritikal"
   - Phone: 1500444 (clickable, large font)

**Card Style:**
- hover:-translate-y-2
- text-center
- p-8
- rounded-3xl
- glassmorphism

## 📝 KONTEN REQUIREMENTS

### FAQ Content (WAJIB LENGKAP & RAPI)
**Kategori Absensi:**
1. ✅ Bagaimana cara melakukan absensi? (ULTRA LENGKAP - sudah ada di file)
2. ✅ QR Code tidak bisa di-scan, apa yang harus dilakukan? (ULTRA LENGKAP - sudah ada)
3. ✅ Berapa lama waktu yang tersedia untuk melakukan absensi? (ULTRA LENGKAP - sudah ada)
4. Bagaimana jika lokasi GPS tidak terdeteksi?
5. Apakah bisa absen tanpa selfie verification?
6. Bagaimana cara melihat riwayat absensi saya?

**Kategori Tugas & Ujian:**
1. Bagaimana cara mengumpulkan tugas?
2. Apakah bisa mengumpulkan tugas setelah deadline?
3. Bagaimana cara melihat nilai tugas yang sudah dikumpulkan?
4. Format file apa saja yang didukung untuk upload tugas?
5. Bagaimana jika file tugas terlalu besar?
6. Bagaimana cara mengikuti ujian online?

**Kategori Akun & Profil:**
1. Bagaimana cara mengubah password?
2. Bagaimana jika lupa password?
3. Bagaimana cara mengubah foto profil?
4. Bagaimana cara mengaktifkan 2FA (Two-Factor Authentication)?
5. Bagaimana cara menghubungkan akun dengan email?

**Kategori Notifikasi:**
1. Bagaimana cara mengatur notifikasi?
2. Mengapa saya tidak menerima notifikasi?
3. Bagaimana cara mematikan notifikasi tertentu?

**Kategori Akademik:**
1. Bagaimana cara melihat jadwal kuliah?
2. Bagaimana cara membuat catatan akademik?
3. Bagaimana cara mengajukan izin/sakit?
4. Bagaimana cara melihat nilai dan transkrip?
5. Bagaimana cara menggunakan fitur kas kelas?

**Kategori Gamifikasi:**
1. Bagaimana cara mendapatkan poin dan badge?
2. Apa itu streak dan bagaimana cara mempertahankannya?
3. Bagaimana cara menukar poin dengan reward?
4. Bagaimana cara melihat leaderboard?

### Troubleshooting Guides (WAJIB LENGKAP)
1. ✅ QR Code Tidak Bisa Di-Scan (ULTRA LENGKAP - sudah ada)
2. Gagal Upload File Tugas
3. Aplikasi Crash atau Freeze
4. Koneksi Internet Bermasalah
5. Selfie Verification Gagal
6. Data Tidak Tersinkronisasi
7. Notifikasi Tidak Muncul
8. Login Bermasalah

### Video Tutorial Topics
1. Onboarding Sistem untuk Mahasiswa Baru
2. Cara Melakukan Absensi dengan QR Code
3. Cara Mengumpulkan Tugas dan Melihat Nilai
4. Cara Menggunakan Fitur Catatan Akademik
5. Cara Mengajukan Izin/Sakit
6. Cara Menggunakan Fitur Gamifikasi
7. Cara Mengatur Profil dan Keamanan Akun
8. Tips Memaksimalkan Fitur Aplikasi


## 🎭 ANIMATION & INTERACTION

### Container Animations
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};
```

### Hover States
- Stats Cards: glow effect yang membesar saat hover
- Category Cards: gradient overlay + scale + translate-y
- Article Items: translate-x + scale
- Video Cards: translate-y + scale + thumbnail zoom
- Buttons: scale + shadow enhancement

### Loading States
- Skeleton loaders untuk content yang loading
- Shimmer effect untuk placeholder
- Smooth transition saat data loaded

### Micro-interactions
- Icon rotations saat hover
- Badge pulse animations
- Button ripple effects
- Smooth scroll to section
- Toast notifications untuk feedback

## 📱 RESPONSIVE DESIGN (CRITICAL)

### Mobile (< 640px)
```tsx
// Header:
- p-6 (bukan p-8)
- Icon: h-20 w-20
- Title: text-3xl
- Search: py-6 (bukan py-8)

// Stats Cards:
- grid-cols-2
- gap-3
- p-3 (bukan p-6)
- Icon: h-10 w-10
- Text: text-sm untuk title, text-lg untuk value

// Categories:
- grid-cols-1
- Full width cards
- Icon: h-14 w-14

// Articles & Videos:
- Stack vertically (grid-cols-1)
- Artikel list: gap-3
- Video cards: grid-cols-1

// FAQ:
- p-4 (bukan p-8)
- Accordion trigger: px-4 py-3
- Font sizes lebih kecil

// Contact:
- grid-cols-1
- Stack vertically
- p-6 (bukan p-8)
```

### Tablet (640px - 1024px)
```tsx
// Stats: grid-cols-2 lg:grid-cols-4
// Categories: grid-cols-2
// Articles/Videos: grid-cols-1 lg:grid-cols-2
// Contact: grid-cols-1 md:grid-cols-3
```

### Desktop (> 1024px)
```tsx
// Full layout dengan max-w-7xl mx-auto
// Semua grid menggunakan max columns
// Spacing optimal: gap-6 md:gap-8
```

### Touch Interactions
- Larger tap targets (min 44x44px)
- Swipe gestures untuk carousel (jika ada)
- Pull to refresh (optional)
- Haptic feedback untuk actions (mobile)

## 🎨 TOMBOL KEMBALI (MATCHING MENU LAIN)

**HAPUS tombol kembali jika tidak konsisten dengan menu lain!**

Jika menu lain (Dashboard, Absen, Rekapan, dll) tidak memiliki tombol kembali di header, maka menu Bantuan juga TIDAK BOLEH ada tombol kembali.

**Navigasi menggunakan Sidebar:**
- User navigasi via sidebar menu
- Tidak perlu tombol back di setiap halaman
- Konsistensi dengan semua menu mahasiswa

## 🔧 MODAL COMPONENTS

### Article Detail Modal
```tsx
<Dialog>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{article.title}</DialogTitle>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" /> {article.views}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {article.rating}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> {article.readTime}
        </span>
        <Badge>{article.difficulty}</Badge>
      </div>
    </DialogHeader>
    
    {/* Content dengan Markdown rendering */}
    <div className="prose dark:prose-invert max-w-none">
      {/* Render article content */}
    </div>
    
    {/* Actions */}
    <div className="flex items-center justify-between pt-6 border-t">
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <ThumbsUp className="h-4 w-4 mr-2" /> Helpful
        </Button>
        <Button variant="outline" size="sm">
          <ThumbsDown className="h-4 w-4 mr-2" /> Not Helpful
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### Video Player Modal
```tsx
<Dialog>
  <DialogContent className="max-w-5xl">
    <DialogHeader>
      <DialogTitle>{video.title}</DialogTitle>
      <Badge>{video.category}</Badge>
    </DialogHeader>
    
    {/* Video Player */}
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {/* Embed video player atau iframe */}
      <iframe
        src={video.url}
        className="w-full h-full"
        allowFullScreen
      />
    </div>
    
    {/* Video Info */}
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">{video.description}</p>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" /> {video.views} views
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> {video.duration}
        </span>
      </div>
    </div>
    
    {/* Related Videos */}
    <div className="pt-4 border-t">
      <h3 className="font-semibold mb-3">Video Terkait</h3>
      {/* List related videos */}
    </div>
  </DialogContent>
</Dialog>
```

### Ticket Support Modal
```tsx
<Dialog>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Buat Tiket Dukungan</DialogTitle>
      <p className="text-sm text-gray-500">
        Isi form di bawah ini dan tim support kami akan segera membantu Anda
      </p>
    </DialogHeader>
    
    <form className="space-y-4">
      <div>
        <label className="text-sm font-medium">Kategori</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori masalah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="absensi">Absensi</SelectItem>
            <SelectItem value="tugas">Tugas & Ujian</SelectItem>
            <SelectItem value="akun">Akun & Profil</SelectItem>
            <SelectItem value="teknis">Masalah Teknis</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium">Prioritas</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pilih prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Rendah</SelectItem>
            <SelectItem value="medium">Sedang</SelectItem>
            <SelectItem value="high">Tinggi</SelectItem>
            <SelectItem value="urgent">Mendesak</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium">Subjek</label>
        <Input placeholder="Judul singkat masalah Anda" />
      </div>
      
      <div>
        <label className="text-sm font-medium">Deskripsi</label>
        <Textarea
          placeholder="Jelaskan masalah Anda secara detail..."
          rows={6}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Lampiran (Optional)</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">
            Klik atau drag file ke sini
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max 10MB (PNG, JPG, PDF)
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Kirim Tiket
        </Button>
        <Button type="button" variant="outline">
          Batal
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```


### Live Chat Widget (Optional - Advanced Feature)
```tsx
// Floating chat button (bottom-right)
<motion.button
  className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={() => setShowChatWidget(true)}
>
  <MessageCircle className="h-6 w-6" />
  {/* Notification badge jika ada pesan baru */}
  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center">
    3
  </span>
</motion.button>

// Chat widget
<AnimatePresence>
  {showChatWidget && (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-2xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 shadow-2xl backdrop-blur-xl"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Live Support</h3>
            <p className="text-xs text-gray-500">Biasanya membalas dalam 2 menit</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowChatWidget(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Chat Messages */}
      <div className="h-[340px] overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              )}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Chat Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white/50 dark:bg-neutral-900/50 backdrop-blur">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ketik pesan..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
          />
          <Button size="sm" onClick={handleSendChat}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

## 🎯 PENULISAN KONTEN (CRITICAL)

### Gaya Penulisan yang Konsisten
**Tone of Voice:**
- Ramah dan supportive
- Profesional tapi tidak kaku
- Jelas dan mudah dipahami
- Menggunakan bahasa Indonesia yang baik dan benar
- Hindari jargon teknis yang berlebihan

**Struktur Penulisan:**
1. **Judul**: Jelas dan deskriptif
2. **Intro**: Penjelasan singkat (1-2 kalimat)
3. **Langkah-langkah**: Numbered list dengan detail
4. **Tips & Trik**: Bullet points dengan emoji ✅ dan ❌
5. **Troubleshooting**: Masalah → Solusi format
6. **Catatan Penting**: Highlight dengan ⚠️ atau 📝
7. **Kontak Bantuan**: Selalu sertakan di akhir

**Formatting Guidelines:**
```markdown
## Judul Utama (H2)

### Sub-judul (H3)

**Bold untuk emphasis**
*Italic untuk catatan*

• Bullet points untuk list
1. Numbered list untuk langkah-langkah

```code block untuk command atau code```

> Blockquote untuk catatan penting

---
Horizontal line untuk pemisah section
```

**Contoh Penulisan yang Baik:**
```markdown
## Bagaimana Cara Melakukan Absensi?

Sistem absensi menggunakan teknologi QR Code dan verifikasi lokasi GPS untuk memastikan kehadiran Anda tercatat dengan akurat.

### Langkah-Langkah Absensi:

**1. Persiapan Sebelum Absensi**
• Pastikan smartphone memiliki koneksi internet stabil
• Aktifkan GPS/Lokasi di pengaturan device
• Berikan izin akses kamera dan lokasi untuk aplikasi
• Pastikan baterai minimal 20%

**2. Membuka Menu Absensi**
• Login ke aplikasi menggunakan NIM dan password
• Klik menu "Absen" di sidebar navigasi
• Atau gunakan shortcut "Absen Cepat" di dashboard

[... dst dengan detail lengkap ...]

### Tips & Trik:

✅ **DO (Lakukan):**
• Datang 5-10 menit lebih awal
• Pastikan aplikasi sudah diupdate
• Gunakan WiFi kampus untuk koneksi stabil

❌ **DON'T (Jangan):**
• Jangan mencoba scan dari luar area kampus
• Jangan menggunakan screenshot QR Code orang lain
• Jangan menitipkan absensi ke teman

### Bantuan Lebih Lanjut:

Jika masih mengalami kesulitan, hubungi:
• Help Desk: ext. 123
• Email: support@kampus.ac.id
• WhatsApp: 0812-3456-7890
```

### Konten Harus Mencakup:
1. **Penjelasan Lengkap**: Tidak ada yang terlewat
2. **Langkah Detail**: Step-by-step yang jelas
3. **Visual Aids**: Deskripsi yang membantu visualisasi
4. **Troubleshooting**: Antisipasi masalah umum
5. **Best Practices**: Tips untuk pengalaman optimal
6. **Contact Info**: Selalu ada jalur bantuan

## 🚀 INOVASI & FITUR TAMBAHAN

### 1. Search Functionality
```tsx
// Real-time search dengan debounce
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

// Filter FAQ, articles, videos berdasarkan query
useEffect(() => {
  const debounce = setTimeout(() => {
    if (searchQuery.length > 2) {
      const results = [
        ...faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      ];
      setSearchResults(results);
    }
  }, 300);
  
  return () => clearTimeout(debounce);
}, [searchQuery]);
```

### 2. Bookmark/Favorite System
```tsx
// User bisa bookmark artikel favorit
const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

const toggleBookmark = (articleId: string) => {
  setBookmarkedArticles(prev =>
    prev.includes(articleId)
      ? prev.filter(id => id !== articleId)
      : [...prev, articleId]
  );
  // Save to localStorage or backend
};

// Tampilkan tab "Artikel Tersimpan"
<Tabs>
  <TabsList>
    <TabsTrigger value="all">Semua</TabsTrigger>
    <TabsTrigger value="bookmarked">Tersimpan</TabsTrigger>
  </TabsList>
</Tabs>
```

### 3. Rating & Feedback System
```tsx
// User bisa rate artikel dan memberikan feedback
const handleRating = async (articleId: string, rating: number) => {
  try {
    await axios.post(`/api/help/articles/${articleId}/rate`, { rating });
    toast.success('Terima kasih atas feedback Anda!');
  } catch (error) {
    toast.error('Gagal mengirim rating');
  }
};

// Star rating component
<div className="flex gap-1">
  {[1, 2, 3, 4, 5].map(star => (
    <button
      key={star}
      onClick={() => handleRating(article.id, star)}
      className={cn(
        "transition-colors",
        star <= userRating ? "text-amber-500" : "text-gray-300"
      )}
    >
      <Star className="h-5 w-5 fill-current" />
    </button>
  ))}
</div>
```

### 4. Recently Viewed
```tsx
// Track artikel yang baru dilihat
const [recentlyViewed, setRecentlyViewed] = useState<Article[]>([]);

useEffect(() => {
  // Load from localStorage
  const recent = localStorage.getItem('recentlyViewedArticles');
  if (recent) {
    setRecentlyViewed(JSON.parse(recent));
  }
}, []);

const addToRecentlyViewed = (article: Article) => {
  const updated = [
    article,
    ...recentlyViewed.filter(a => a.id !== article.id)
  ].slice(0, 5); // Keep only last 5
  
  setRecentlyViewed(updated);
  localStorage.setItem('recentlyViewedArticles', JSON.stringify(updated));
};

// Display section
<div className="space-y-3">
  <h3 className="font-semibold">Baru Dilihat</h3>
  {recentlyViewed.map(article => (
    <ArticleCard key={article.id} article={article} compact />
  ))}
</div>
```

### 5. Quick Actions
```tsx
// Floating action buttons untuk aksi cepat
<div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="h-12 w-12 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center"
    onClick={scrollToTop}
  >
    <ChevronUp className="h-5 w-5" />
  </motion.button>
  
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="h-12 w-12 rounded-full bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center"
    onClick={() => setShowTicketModal(true)}
  >
    <Headphones className="h-5 w-5" />
  </motion.button>
</div>
```

### 6. Keyboard Shortcuts
```tsx
// Cmd+K untuk search, Esc untuk close modal, dll
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd+K atau Ctrl+K untuk focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    
    // Esc untuk close modal
    if (e.key === 'Escape') {
      setShowArticleModal(false);
      setShowVideoModal(false);
      setShowTicketModal(false);
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```


### 7. Progress Tracking
```tsx
// Track berapa banyak artikel yang sudah dibaca
const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

// Progress indicator
<div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium">Progress Pembelajaran</span>
    <span className="text-sm font-bold">{readArticles.size}/{totalArticles}</span>
  </div>
  <Progress value={(readArticles.size / totalArticles) * 100} />
  <p className="text-xs text-gray-500 mt-2">
    Anda telah membaca {readArticles.size} dari {totalArticles} artikel
  </p>
</div>
```

### 8. Suggested Articles
```tsx
// Rekomendasi artikel berdasarkan yang sedang dibaca
const getSuggestedArticles = (currentArticle: Article) => {
  return articles
    .filter(a => 
      a.category === currentArticle.category && 
      a.id !== currentArticle.id
    )
    .slice(0, 3);
};

// Display di modal artikel
<div className="mt-6 pt-6 border-t">
  <h3 className="font-semibold mb-4">Artikel Terkait</h3>
  <div className="grid gap-3">
    {suggestedArticles.map(article => (
      <button
        key={article.id}
        onClick={() => setSelectedArticle(article)}
        className="text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <h4 className="font-medium text-sm">{article.title}</h4>
        <p className="text-xs text-gray-500 mt-1">{article.readTime}</p>
      </button>
    ))}
  </div>
</div>
```

### 9. Print & Export
```tsx
// Export artikel ke PDF atau print
const handlePrintArticle = () => {
  window.print();
};

const handleExportPDF = async (article: Article) => {
  // Implement PDF export logic
  toast.success('Artikel berhasil diexport ke PDF');
};

// Buttons di modal
<div className="flex gap-2">
  <Button variant="outline" size="sm" onClick={handlePrintArticle}>
    <Printer className="h-4 w-4 mr-2" /> Print
  </Button>
  <Button variant="outline" size="sm" onClick={() => handleExportPDF(article)}>
    <Download className="h-4 w-4 mr-2" /> Export PDF
  </Button>
</div>
```

### 10. Notification Preferences
```tsx
// User bisa subscribe ke update artikel baru
const [notificationPrefs, setNotificationPrefs] = useState({
  newArticles: true,
  newVideos: true,
  ticketUpdates: true,
});

// Settings section
<div className="space-y-3">
  <h3 className="font-semibold">Notifikasi Bantuan</h3>
  <div className="space-y-2">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={notificationPrefs.newArticles}
        onChange={(e) => setNotificationPrefs(prev => ({
          ...prev,
          newArticles: e.target.checked
        }))}
      />
      <span className="text-sm">Artikel baru ditambahkan</span>
    </label>
    {/* ... other preferences */}
  </div>
</div>
```

## 🎨 DARK MODE SUPPORT

### Color Scheme
```tsx
// Semua component harus support dark mode
// Gunakan Tailwind dark: prefix

// Background:
bg-white/40 dark:bg-neutral-900/40

// Text:
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400

// Border:
border-white/20 dark:border-white/5

// Hover states:
hover:bg-gray-50 dark:hover:bg-gray-800

// Shadows:
shadow-xl (automatically adapts)
```

### Theme Toggle (Optional)
```tsx
// Jika ada theme toggle di header
<Button
  variant="ghost"
  size="sm"
  onClick={toggleTheme}
  className="rounded-full"
>
  {theme === 'dark' ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  )}
</Button>
```

## 📊 ANALYTICS & TRACKING

### Track User Interactions
```tsx
// Track artikel yang dibuka
const trackArticleView = (articleId: string) => {
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'article_view', {
      article_id: articleId,
      article_title: article.title,
    });
  }
};

// Track search queries
const trackSearch = (query: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
    });
  }
};

// Track helpful votes
const trackHelpfulVote = (faqId: string, helpful: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'faq_feedback', {
      faq_id: faqId,
      helpful: helpful,
    });
  }
};
```

## 🔒 SECURITY & VALIDATION

### Input Validation
```tsx
// Validate ticket form
const validateTicketForm = (data: TicketFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.category) {
    errors.category = 'Kategori harus dipilih';
  }
  
  if (!data.subject || data.subject.length < 5) {
    errors.subject = 'Subjek minimal 5 karakter';
  }
  
  if (!data.description || data.description.length < 20) {
    errors.description = 'Deskripsi minimal 20 karakter';
  }
  
  return errors;
};
```

### XSS Prevention
```tsx
// Sanitize user input sebelum render
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// Render sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />
```

## 🧪 TESTING CHECKLIST

### Functional Testing
- [ ] Search berfungsi dengan baik
- [ ] Filter kategori bekerja
- [ ] Modal buka/tutup dengan smooth
- [ ] Form validation bekerja
- [ ] Rating system berfungsi
- [ ] Bookmark save/load dari localStorage
- [ ] Video player embed bekerja
- [ ] Print/Export PDF berfungsi

### UI/UX Testing
- [ ] Semua animasi smooth (60fps)
- [ ] Hover states konsisten
- [ ] Loading states ditampilkan
- [ ] Error states handled dengan baik
- [ ] Empty states informatif
- [ ] Toast notifications muncul
- [ ] Keyboard navigation bekerja
- [ ] Focus states visible

### Responsive Testing
- [ ] Mobile (320px - 640px) ✓
- [ ] Tablet (640px - 1024px) ✓
- [ ] Desktop (1024px+) ✓
- [ ] Touch interactions smooth
- [ ] Scroll behavior natural
- [ ] Text readable di semua ukuran
- [ ] Images scaled properly

### Performance Testing
- [ ] Initial load < 3s
- [ ] Search response < 300ms
- [ ] Modal open < 100ms
- [ ] Smooth scroll 60fps
- [ ] No layout shifts
- [ ] Images lazy loaded
- [ ] Code splitting implemented

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text untuk images
- [ ] Semantic HTML

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

## 📦 DEPENDENCIES

### Required Packages
```json
{
  "dependencies": {
    "@inertiajs/react": "^1.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.300.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  }
}
```

### Shadcn UI Components
```bash
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
```

## 🚀 IMPLEMENTATION STEPS

### Phase 1: Structure & Layout (Priority: HIGH)
1. ✅ Setup file structure
2. ✅ Implement header dengan gradient & animations
3. ✅ Create stats cards dengan glassmorphism
4. ✅ Build category grid dengan hover effects
5. ✅ Setup responsive breakpoints

### Phase 2: Content & Data (Priority: HIGH)
1. ✅ Write comprehensive FAQ content
2. ✅ Create troubleshooting guides
3. ✅ Prepare article data structure
4. ✅ Setup video data
5. ✅ Implement search functionality

### Phase 3: Modals & Interactions (Priority: MEDIUM)
1. ✅ Build article detail modal
2. ✅ Create video player modal
3. ✅ Implement ticket support modal
4. ✅ Add live chat widget (optional)
5. ✅ Setup keyboard shortcuts

### Phase 4: Advanced Features (Priority: MEDIUM)
1. ✅ Implement bookmark system
2. ✅ Add rating & feedback
3. ✅ Create recently viewed
4. ✅ Build suggested articles
5. ✅ Add progress tracking

### Phase 5: Polish & Optimization (Priority: LOW)
1. ✅ Optimize animations
2. ✅ Add loading states
3. ✅ Implement error handling
4. ✅ Add analytics tracking
5. ✅ Performance optimization

### Phase 6: Testing & QA (Priority: HIGH)
1. ✅ Functional testing
2. ✅ Responsive testing
3. ✅ Browser compatibility
4. ✅ Accessibility audit
5. ✅ Performance audit


## 📝 FINAL CHECKLIST

### Design Consistency ✓
- [x] Header matching Dashboard Admin gradient
- [x] Stats cards dengan glassmorphism effect
- [x] Category cards dengan hover animations
- [x] Modal design konsisten
- [x] Color scheme matching
- [x] Typography konsisten
- [x] Spacing & padding uniform
- [x] Border radius konsisten (rounded-2xl/3xl)

### Content Quality ✓
- [x] FAQ lengkap dan detail (minimal 20 FAQ)
- [x] Troubleshooting guides comprehensive
- [x] Artikel dengan struktur yang rapi
- [x] Video tutorials informatif
- [x] Konten dalam Bahasa Indonesia yang baik
- [x] Tidak ada typo atau grammar error
- [x] Formatting konsisten
- [x] Contact info lengkap

### Functionality ✓
- [x] Search berfungsi real-time
- [x] Filter kategori bekerja
- [x] Modal open/close smooth
- [x] Form validation proper
- [x] Rating system implemented
- [x] Bookmark functionality
- [x] Recently viewed tracking
- [x] Keyboard shortcuts

### Responsive Design ✓
- [x] Mobile (< 640px) optimized
- [x] Tablet (640px - 1024px) optimized
- [x] Desktop (> 1024px) optimized
- [x] Touch interactions smooth
- [x] Text readable di semua ukuran
- [x] Images responsive
- [x] Navigation accessible

### Performance ✓
- [x] Fast initial load
- [x] Smooth animations (60fps)
- [x] Lazy loading images
- [x] Code splitting
- [x] Optimized bundle size
- [x] No memory leaks
- [x] Efficient re-renders

### Accessibility ✓
- [x] Keyboard navigation
- [x] Screen reader support
- [x] ARIA labels
- [x] Color contrast WCAG AA
- [x] Focus indicators
- [x] Alt text untuk images
- [x] Semantic HTML

### User Experience ✓
- [x] Intuitive navigation
- [x] Clear call-to-actions
- [x] Helpful error messages
- [x] Loading indicators
- [x] Success feedback
- [x] Empty states
- [x] Consistent interactions

## 🎯 SUCCESS CRITERIA

### Must Have (P0)
1. ✅ Header dengan gradient animation matching admin
2. ✅ 4 stats cards dengan glassmorphism
3. ✅ 6 kategori bantuan dengan hover effects
4. ✅ Artikel terpopuler section (minimal 5 artikel)
5. ✅ Video tutorial section (minimal 3 video)
6. ✅ Interactive FAQ dengan accordion (minimal 15 FAQ)
7. ✅ Contact support cards (3 metode kontak)
8. ✅ Search functionality yang bekerja
9. ✅ Responsive di semua device
10. ✅ Dark mode support

### Should Have (P1)
1. ✅ Article detail modal dengan full content
2. ✅ Video player modal
3. ✅ Ticket support modal dengan form
4. ✅ Rating & feedback system
5. ✅ Bookmark functionality
6. ✅ Recently viewed tracking
7. ✅ Suggested articles
8. ✅ Keyboard shortcuts (Cmd+K)
9. ✅ Print/Export PDF
10. ✅ Analytics tracking

### Nice to Have (P2)
1. ✅ Live chat widget
2. ✅ Progress tracking
3. ✅ Notification preferences
4. ✅ Quick actions floating buttons
5. ✅ Advanced search filters
6. ✅ Article categories filter
7. ✅ Video playlist
8. ✅ FAQ voting system
9. ✅ Share functionality
10. ✅ Offline support (PWA)

## 🔥 CRITICAL REQUIREMENTS (TIDAK BOLEH DILANGGAR)

### 1. NO DUMMY DATA
❌ **DILARANG KERAS:**
- Menggunakan data dummy/placeholder
- Lorem ipsum text
- Fake statistics
- Random numbers
- Placeholder images tanpa alt text

✅ **WAJIB:**
- Semua data real dan meaningful
- Konten lengkap dan informatif
- Statistics yang masuk akal
- Images dengan proper alt text
- Real contact information

### 2. ICON CONSISTENCY
❌ **HAPUS:**
- Container/background di belakang icon header
- Animasi icon yang bergerak naik-turun
- Icon yang tidak matching dengan tema

✅ **GUNAKAN:**
- Icon PNG dari assets (HelpIcon)
- Lucide icons untuk UI elements
- Consistent icon sizing
- Proper icon colors matching gradient

### 3. MOBILE OPTIMIZATION
❌ **HINDARI:**
- Text terlalu kecil di mobile
- Button terlalu kecil untuk tap
- Horizontal scroll
- Overlapping elements
- Hidden content

✅ **PASTIKAN:**
- Min font-size 14px di mobile
- Min tap target 44x44px
- Vertical scroll only
- Proper spacing
- All content accessible

### 4. CONTENT QUALITY
❌ **JANGAN:**
- Copy-paste tanpa edit
- Konten yang tidak relevan
- Penjelasan yang terlalu singkat
- Bahasa yang tidak konsisten
- Typo dan grammar error

✅ **LAKUKAN:**
- Tulis konten original
- Relevan dengan sistem
- Penjelasan detail dan lengkap
- Bahasa Indonesia yang baik
- Proofread semua konten

### 5. ANIMATION PERFORMANCE
❌ **HINDARI:**
- Animasi yang lag
- Too many animations at once
- Heavy animations di mobile
- Blocking animations
- Infinite loops yang berat

✅ **GUNAKAN:**
- GPU-accelerated properties (transform, opacity)
- Framer Motion dengan proper config
- Conditional animations (reduce motion)
- Optimized keyframes
- Reasonable duration

## 💡 TIPS & BEST PRACTICES

### Development Tips
1. **Start with Mobile First**: Design untuk mobile dulu, baru scale up
2. **Component Reusability**: Buat reusable components untuk artikel, video, FAQ
3. **Type Safety**: Gunakan TypeScript dengan proper types
4. **Error Boundaries**: Implement error boundaries untuk catch errors
5. **Loading States**: Selalu tampilkan loading state saat fetch data

### Performance Tips
1. **Lazy Load Images**: Gunakan lazy loading untuk images
2. **Code Splitting**: Split code by route atau component
3. **Memoization**: Gunakan useMemo dan useCallback untuk expensive operations
4. **Debounce Search**: Debounce search input untuk reduce API calls
5. **Virtual Scrolling**: Untuk list yang panjang, gunakan virtual scrolling

### UX Tips
1. **Clear Feedback**: Selalu berikan feedback untuk user actions
2. **Error Messages**: Error messages harus jelas dan actionable
3. **Empty States**: Design empty states yang helpful
4. **Loading Indicators**: Tampilkan progress untuk long operations
5. **Keyboard Support**: Support keyboard navigation untuk power users

### Content Tips
1. **Scannable Content**: Gunakan headings, bullets, dan formatting
2. **Visual Hierarchy**: Jelas mana yang penting dan tidak
3. **Consistent Tone**: Maintain consistent tone of voice
4. **Action-Oriented**: Gunakan action verbs untuk CTAs
5. **Helpful Examples**: Sertakan contoh konkret

### Accessibility Tips
1. **Semantic HTML**: Gunakan proper HTML tags
2. **ARIA Labels**: Tambahkan ARIA labels untuk screen readers
3. **Keyboard Navigation**: Semua interactive elements accessible via keyboard
4. **Color Contrast**: Pastikan contrast ratio minimal 4.5:1
5. **Focus Indicators**: Visible focus indicators untuk keyboard users

## 🎨 COLOR PALETTE REFERENCE

### Primary Colors
```css
/* Gradients untuk Header */
from-indigo-600 via-purple-600 to-pink-500
from-blue-600 via-indigo-600 to-purple-600

/* Stats Cards */
emerald: from-emerald-400 to-teal-600
sky: from-sky-400 to-indigo-600
amber: from-amber-400 to-orange-600
rose: from-rose-400 to-pink-600

/* Categories */
blue: from-blue-500 to-indigo-500
yellow: from-yellow-500 to-orange-500
green: from-green-500 to-emerald-500
purple: from-purple-500 to-pink-500
red: from-red-500 to-orange-500
cyan: from-cyan-500 to-blue-500
```

### Neutral Colors
```css
/* Light Mode */
bg-white/40
text-gray-900
text-gray-600
border-white/20

/* Dark Mode */
dark:bg-neutral-900/40
dark:text-white
dark:text-gray-400
dark:border-white/5
```

### Status Colors
```css
/* Success */
text-emerald-600 bg-emerald-100

/* Warning */
text-amber-600 bg-amber-100

/* Error */
text-rose-600 bg-rose-100

/* Info */
text-blue-600 bg-blue-100
```

## 📚 DOCUMENTATION

### Component Documentation
Setiap major component harus memiliki JSDoc comment:

```tsx
/**
 * HelpCenter Component
 * 
 * Main help center page for students with comprehensive documentation,
 * FAQs, video tutorials, and support options.
 * 
 * @component
 * @example
 * ```tsx
 * <HelpCenter />
 * ```
 */
export default function HelpCenter() {
  // ...
}
```

### Props Documentation
```tsx
interface ArticleCardProps {
  /** Article data object */
  article: Article;
  /** Compact mode for smaller display */
  compact?: boolean;
  /** Click handler */
  onClick?: (article: Article) => void;
}
```

### Function Documentation
```tsx
/**
 * Filters articles based on search query and category
 * 
 * @param articles - Array of articles to filter
 * @param query - Search query string
 * @param category - Category to filter by
 * @returns Filtered array of articles
 */
const filterArticles = (
  articles: Article[],
  query: string,
  category?: string
): Article[] => {
  // ...
};
```

## 🎓 LEARNING RESOURCES

### Untuk Developer
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Inertia.js Docs](https://inertiajs.com/)
- [Shadcn UI Components](https://ui.shadcn.com/)

### Untuk Content Writer
- [Microsoft Writing Style Guide](https://docs.microsoft.com/en-us/style-guide/welcome/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Mailchimp Content Style Guide](https://styleguide.mailchimp.com/)

### Untuk Designer
- [Material Design Guidelines](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Laws of UX](https://lawsofux.com/)

## 🏁 CONCLUSION

Menu Bantuan Mahasiswa adalah salah satu menu paling krusial dalam sistem karena menjadi first point of contact ketika user mengalami masalah. Oleh karena itu:

1. **Konten harus ULTRA LENGKAP**: Setiap FAQ dan guide harus detail dan comprehensive
2. **UI/UX harus SEMPURNA**: Matching dengan dashboard admin dan menu lain
3. **Responsive harus FLAWLESS**: Bekerja perfect di semua device
4. **Performance harus OPTIMAL**: Fast load, smooth animations
5. **Accessibility harus PRIORITY**: Semua user bisa akses dengan mudah

**Target Akhir:**
- User bisa menemukan jawaban dengan cepat (< 30 detik)
- User merasa terbantu dan tidak frustasi
- User tidak perlu contact support untuk masalah umum
- User experience yang menyenangkan dan tidak membingungkan

**Metrics Success:**
- 80% user menemukan jawaban tanpa contact support
- Average time to answer < 2 menit
- User satisfaction score > 4.5/5
- Bounce rate < 20%
- Return visit rate > 60%

---

## 🚀 READY TO IMPLEMENT!

Dengan prompt ini, developer harus bisa:
1. ✅ Memahami requirement dengan jelas
2. ✅ Implement dengan standar yang tinggi
3. ✅ Deliver hasil yang matching dengan ekspektasi
4. ✅ Create menu bantuan yang truly helpful
5. ✅ Maintain consistency dengan menu lain

**Good luck and happy coding! 🎉**

