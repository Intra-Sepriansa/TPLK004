# 🎯 PROMPT: Redesign Halaman Profil Mobile Flutter — Super Advance

> **Objective:** Buat ulang seluruh halaman Profil Mahasiswa di aplikasi mobile Flutter agar 100% menyamai UI/UX dari halaman web `resources/js/pages/user/profile.tsx` dengan kualitas **super premium, glassmorphic, animated, dan advance**. Header HARUS mengikuti style yang sama persis seperti `AbsensiHeaderWidget` pada menu Scan QR / Home (gradient biru + batik pattern + jam + avatar + rounded bottom corners).

---

## 📂 Referensi File

### Web (Sumber UI/UX)
- **Halaman profil mahasiswa web:** `resources/js/pages/user/profile.tsx` (1833 baris)
- Mengandung 4 tab: **Overview**, **Kartu Profil**, **Edit Profil**, **Keamanan**

### Mobile (Target Modifikasi)
| File | Tujuan |
|------|--------|
| `lib/features/profile/presentation/screens/profile_screen.dart` | **Halaman utama profil — REWRITE TOTAL** |
| `lib/features/profile/domain/entities/profile.dart` | Entity profil (tambah field baru) |
| `lib/features/profile/data/models/profile_model.dart` | Model profil (tambah parsing field baru) |
| `lib/features/profile/data/datasources/profile_remote_datasource.dart` | Remote data source (tambah API untuk stats, update profil, upload avatar, ubah password) |
| `lib/features/profile/presentation/providers/profile_provider.dart` | Provider state management |

### Style Reference (Header)
- **AbsensiHeaderWidget:** `lib/features/scan/presentation/widgets/absensi_header_widget.dart`
- **RiwayatHeaderWidget:** `lib/features/attendance/presentation/widgets/riwayat_header_widget.dart`
- **RekapanScreen header:** `lib/features/attendance/presentation/screens/rekapan_screen.dart`

---

## 🏗️ ARSITEKTUR HALAMAN PROFIL MOBILE

### ═══ BAGIAN 1: HEADER (sama seperti AbsensiHeaderWidget) ═══

```
┌──────────────────────────────────────┐
│  ╔══════════════════════════════╗    │
│  ║  Gradient: primaryDark →     ║    │
│  ║  primary → primaryLight      ║    │
│  ║  + Batik Pattern Overlay     ║    │
│  ║  (opacity: 0.06, scale: 1.3) ║    │
│  ║                              ║    │
│  ║  [←] [Avatar] Profil Saya   ║    │
│  ║              Nama Lengkap    ║    │
│  ║                     [20:35]  ║    │
│  ║  Selasa, 16 Maret 2026      ║    │
│  ║  ● NIM: 221011400xxx        ║    │
│  ║                              ║    │
│  ║  [🔄 Refresh] [📸 Ganti Foto]║    │
│  ╚══════════════════════════════╝    │
│       (rounded bottom corners 28)    │
└──────────────────────────────────────┘
```

**Detail Header:**
- `Container` dengan `BoxDecoration` → `LinearGradient` dari `AppColors.primaryDark` → `AppColors.primary` → `AppColors.primaryLight`
- `borderRadius: BorderRadius.only(bottomLeft: Radius.circular(28), bottomRight: Radius.circular(28))`
- `boxShadow` dengan `AppColors.primary.withValues(alpha: 0.3)`, `blurRadius: 20`, `offset: Offset(0, 8)`
- Batik Pattern overlay: `Image.asset('assets/images/batik_pattern.png')` dengan `opacity: 0.06`, `Transform.scale(1.3)`, `Transform.translate` yang animated
- `AnimationController` duration 5 detik, repeat reverse (untuk animasi gradient dan batik)
- `Timer.periodic` untuk jam real-time
- Tombol back `←` dengan style glassmorphic (white 15%, rounded 14, border white 20%)
- Avatar circle 44×44 dengan border white
- Jam digital style (white 15%, rounded 16)
- NIM badge (white 15%, rounded 20, dot indicator)
- Action buttons: Refresh, Ganti Foto

---

### ═══ BAGIAN 2: HERO PROFILE CARD (dari web profile.tsx baris 536-750) ═══

Setelah header, tampilkan card besar:

```
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │     [Avatar Besar 100×100]     │  │
│  │     ✅ Verified Badge          │  │
│  │                                │  │
│  │     Nama Lengkap ✨            │  │
│  │     @NIM                       │  │
│  │     Mahasiswa Aktif            │  │
│  │                                │  │
│  │  [📧 email] [🆔 NIM] [🟢 Aktif]│  │
│  │                                │  │
│  │  [✏️ Edit Profil] [📸 Ganti Foto]│ │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Detail:**
- Avatar besar (100×100) dengan glow effect (gradient ring purple → fuchsia)
- Verified badge hijau kecil di pojok kanan bawah avatar
- Upload foto — pick image → upload ke API `POST /user/profile/avatar`
- Chips info: Email, NIM, status Aktif (pulse green dot)
- 2 action buttons: "Edit Profil" (gradient violet), "Ganti Foto" (outline)

---

### ═══ BAGIAN 3: STATS CARDS (dari web profile.tsx baris 754-820) ═══

3 kartu statistik horizontal (scrollable atau grid):

```
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Total      │ │ Rata-rata  │ │ Streak     │
│ Kehadiran  │ │ Hadir      │ │ Saat Ini   │
│            │ │            │ │            │
│    24      │ │   85.7%    │ │  5 hari    │
│  ✅        │ │  📈        │ │  🔥        │
└────────────┘ └────────────┘ └────────────┘
```

**Detail:**
- Glassmorphic card (white 40%, backdrop blur, rounded 24, shadow)
- Setiap card: icon gradient, label uppercase, value besar bold
- Animasi counter (angka naik dari 0)
- Data dari `/api/mobile/mahasiswa/attendance/stats`

---

### ═══ BAGIAN 4: TAB NAVIGATION (dari web profile.tsx baris 907-938) ═══

Tab bar horizontal dengan 4 opsi:

```
┌────────────────────────────────────────┐
│ [👤 Overview] [📝 Edit] [🔒 Keamanan]  │
└────────────────────────────────────────┘
```

**Detail:**
- 3 tab saja untuk mobile (hilangkan "Kartu Profil" karena kurang relevan di mobile)
- Tab aktif: gradient violet → purple, text white, shadow
- Tab non-aktif: text neutral, transparent bg
- Rounded 24, padding 1.5 per side
- Animasi transisi antar tab content

---

### ═══ BAGIAN 5: TAB CONTENT ═══

#### TAB 1: OVERVIEW (dari web profile.tsx baris 940-1286)

##### 5A. Informasi Personal
GlassCard berisi daftar info:

| Icon | Label | Value |
|------|-------|-------|
| 👤 | Nama Lengkap | profile.name |
| 🆔 | NIM | profile.nim |
| 📧 | Email | profile.email |
| 📱 | Telepon | profile.phone (jika ada) |
| 📚 | Program Studi | profile.prodi |
| 🏫 | Kelas | profile.kelas |
| 📅 | Semester | profile.semester |
| ⏰ | Jenis Reguler | profile.jenisReguler |

**Setiap row:**
- Icon dalam container rounded 14, bg neutral 100
- Label uppercase tracking-wider, text 10px
- Value text 14px semibold

##### 5B. Statistik Akademik
GlassCard berisi:
- Total Kehadiran: X sesi (emerald)
- Persentase Hadir: X% (blue)
- Streak Saat Ini: X hari (amber)
- Tepat Waktu: X% (violet)
- **Progress Kelengkapan Profil**: LinearProgressIndicator + persentase

##### 5C. Status Akun
GlassCard berisi:
- ✅ Akun Terverifikasi — badge "Active"
- 🔒 Password — tombol "Ubah" → pindah ke tab Security
- ⏰ Aktivitas Terakhir — format waktu relative

##### 5D. Aktivitas Terkini
GlassCard berisi 5 aktivitas terakhir:
- Icon status (hadir/terlambat/ditolak)
- Judul: mata kuliah
- Deskripsi: pertemuan + waktu
- Badge status warna
- Waktu relative (baru saja / X menit lalu / X jam lalu)

---

#### TAB 2: EDIT PROFIL (dari web profile.tsx baris 1318-1509)

GlassCard berisi form:

```
┌──────────────────────────────────┐
│  ✏️ Edit Profil                   │
│  Perbarui informasi profil       │
│                                  │
│  ┌─ Foto Profil ──────────────┐  │
│  │ [Avatar] Foto Profil        │  │
│  │          JPG/PNG max 2MB    │  │
│  │          [📤 Pilih Foto]    │  │
│  └─────────────────────────────┘  │
│                                  │
│  Nama Lengkap                    │
│  ┌──────────────────────────┐    │
│  │ 👤 Nama mahasiswa          │    │
│  └──────────────────────────┘    │
│                                  │
│  NIM (read-only)                 │
│  ┌──────────────────────────┐    │
│  │ 🆔 221011400xxx           │    │
│  └──────────────────────────┘    │
│                                  │
│  Email (read-only)               │
│  ┌──────────────────────────┐    │
│  │ 📧 email@unpam.ac.id      │    │
│  └──────────────────────────┘    │
│                                  │
│  Program Studi (read-only)       │
│  ┌──────────────────────────┐    │
│  │ 📚 Teknik Informatika      │    │
│  └──────────────────────────┘    │
│                                  │
│  [❌ Batal] [💾 Simpan Perubahan] │
└──────────────────────────────────┘
```

**API:** `PATCH /user/profile` dengan body `{ nama: "..." }`

---

#### TAB 3: KEAMANAN (dari web profile.tsx baris 1511-1826)

##### Form Ubah Password:
```
┌──────────────────────────────────┐
│  🔒 Keamanan Akun                 │
│  Ubah password untuk keamanan    │
│                                  │
│  Password Saat Ini               │
│  ┌──────────────────────────┐    │
│  │ 🔑 ••••••••     [👁]       │    │
│  └──────────────────────────┘    │
│                                  │
│  Password Baru                   │
│  ┌──────────────────────────┐    │
│  │ 🔑 ••••••••     [👁]       │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌─ Kekuatan Password ───────┐   │
│  │ Kuat        ██████████ 100%│   │
│  └───────────────────────────┘   │
│                                  │
│  Konfirmasi Password Baru        │
│  ┌──────────────────────────┐    │
│  │ 🔑 ••••••••     [👁]       │    │
│  └──────────────────────────┘    │
│                                  │
│  [❌ Batal] [🛡 Ubah Password]    │
└──────────────────────────────────┘
```

##### Tips Keamanan:
```
┌──────────────────────────────────┐
│  ⚠️ Tips Keamanan                 │
│                                  │
│  ✅ Gunakan minimal 8 karakter    │
│  ✅ Jangan password yang sama     │
│  ✅ Simpan di password manager    │
│  ✅ Ubah password berkala         │
└──────────────────────────────────┘
```

##### Ringkasan Keamanan:
```
┌──────────────────────────────────┐
│  🛡 Ringkasan Keamanan            │
│                                  │
│  Verifikasi Akun      [Aktif]   │
│  Update Password  [Disarankan]  │
│  Aktivitas Terakhir [16 Mar..]  │
└──────────────────────────────────┘
```

**API:** `PATCH /user/password` dengan body `{ current_password, password, password_confirmation }`

---

## 🎨 DESIGN SYSTEM WAJIB

### Warna (dari `AppColors`)
```dart
primaryDark, primary, primaryLight  // Gradient header
emerald500     // Status hadir, verified
amber500       // Terlambat, streak
rose500        // Ditolak, error
violet500      // Icons, accent
sky500         // Info
indigo600      // Filled buttons
textPrimary    // Dark text
textSecondary  // Gray text
background     // Light bg
divider        // Borders
```

### Widget Reusable
- `_GlassCard` → Container white 80%, rounded 24, shadow, border white 30%
- `_SectionHeader` → Row: icon container + title + subtitle
- `_InfoRow` → Row: icon 14×14 neutral bg + label uppercase + value bold
- `_StatCard` → Gradient icon + large value + label
- `_TabButton` → Tab navigation item, active with gradient

### Animasi
- `AnimationController` pada header (gradient + batik movement)
- `Timer.periodic` untuk jam real-time  
- Fade + slide transitions antar tab content
- Password strength progress bar animated

---

## 📡 DATA LAYER UPDATES

### ProfileEntity — Tambah Field Baru
```dart
class ProfileEntity {
  final int id;
  final String nim;
  final String name;
  final String? email;
  final String? phone;          // BARU
  final String? prodi;
  final String? kelas;          // BARU
  final int? semester;
  final String? jenisReguler;   // BARU
  final String? avatar;
  final String? avatarUrl;      // BARU (full URL)
  final String? lastActivityAt; // BARU
  final String? createdAt;      // BARU
}
```

### ProfileRemoteDataSource — Tambah Method Baru
```dart
class ProfileRemoteDataSource {
  Future<ProfileModel> fetchProfile();            // EXISTING
  Future<Map<String, dynamic>> fetchStats();       // BARU — GET /api/.../attendance/stats
  Future<void> updateProfile(String nama);         // BARU — PATCH /user/profile
  Future<void> uploadAvatar(File imageFile);       // BARU — POST /user/profile/avatar
  Future<void> changePassword({                    // BARU — PATCH /user/password
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  });
}
```

---

## ⚠️ PENTING

1. **Header HARUS 100% identik** dengan `AbsensiHeaderWidget` — gradient, batik, jam, avatar, rounded corners
2. **Gunakan `getIt<>()` untuk DI** — semua datasource diakses lewat `getIt`
3. **`AppColors` untuk semua warna** — JANGAN hardcode warna
4. **Data fetching di `initState`** → `Future.microtask(() => _loadData())`
5. **Error handling** → tampilkan error state dengan tombol retry
6. **Loading state** → `CircularProgressIndicator` saat loading
7. **Form validation** → pastikan input valid sebelum submit
8. **Password visibility toggle** → `obscureText` toggle dengan icon mata
9. **Avatar upload** → `image_picker` package untuk memilih foto
10. **Responsive** → scroll aman untuk layar kecil, semua konten dalam `CustomScrollView` + `SliverList`

---

## 🔧 PACKAGES YANG DIBUTUHKAN
```yaml
dependencies:
  image_picker: ^1.0.0   # Untuk memilih foto dari galeri/kamera
  # pdf, printing — sudah ada
  # intl — sudah ada
  # dio — sudah ada
  # flutter_riverpod — sudah ada
```

---

## ✅ CHECKLIST IMPLEMENTASI

- [ ] Update `ProfileEntity` dengan field baru (phone, kelas, jenisReguler, avatarUrl, lastActivityAt, createdAt)
- [ ] Update `ProfileModel.fromJson()` untuk parsing field baru
- [ ] Tambah method baru di `ProfileRemoteDataSource` (fetchStats, updateProfile, uploadAvatar, changePassword)
- [ ] Rewrite `profile_screen.dart` — full redesign dengan header AbsensiHeaderWidget style
- [ ] Implementasi Hero Profile Card dengan avatar upload
- [ ] Implementasi Stats Cards (3 kartu horizontal)
- [ ] Implementasi Tab Navigation (Overview / Edit / Keamanan)
- [ ] Tab Overview: Informasi Personal, Statistik Akademik, Status Akun, Aktivitas Terkini
- [ ] Tab Edit: Form edit nama + avatar upload
- [ ] Tab Keamanan: Form ubah password + kekuatan password + tips keamanan + ringkasan
- [ ] Tambah package `image_picker` di `pubspec.yaml`
- [ ] Testing di emulator — pastikan semua tampil dan berfungsi

---

> **Catatan:** Semua komponen WAJIB premium, glassmorphic, dan animated. JANGAN buat yang basic/sederhana. Setiap section harus WOW.
